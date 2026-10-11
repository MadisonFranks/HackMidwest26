import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Agent, tool, DocumentBlock, ImageBlock, TextBlock, BedrockModel } from '@strands-agents/sdk';
import { z } from 'zod';
import { initS3ThreatVault, queryThreatVault, archiveThreatToS3, getAllThreats } from './s3ThreatVault.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

// Initialize Amazon S3 Threat Intelligence Vault
initS3ThreatVault();

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// 1. Zod schema for structured agent output
const analysisSchema = z.object({
  score: z.number().min(0).max(100).describe('0-100 threat risk score'),
  riskLevel: z.enum(['CRITICAL', 'HIGH', 'MODERATE', 'LOW']).describe('Risk category'),
  summary: z.string().describe('1-2 sentence investigation verdict'),
  indicators: z.array(z.string()).describe('List of detected scam tactics or red flags'),
  recommendedAction: z.string().describe('Clear next step guidance for the user')
});

// 2. Strands Agent Tool: Inspect suspicious links found in messages or files
const urlInspectionTool = tool({
  name: 'inspect_url',
  description: 'Inspects a URL found in the message or file to check for suspicious domains or IP addresses',
  inputSchema: z.object({
    url: z.string().describe('The URL to inspect')
  }),
  callback: async ({ url }) => {
    try {
      const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
      const parsed = new URL(normalizedUrl);
      const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname);
      const hasSuspiciousTld = /\.(xyz|top|work|click|loan|info|tk|gq|cf|buzz|country|kim|stream|gdn|mom|rest|live|fit|bar|cam)$/i.test(parsed.hostname);

      const isTrustedDomain = [
        'linkedin.com', 'google.com', 'apple.com', 'amazon.com', 'microsoft.com',
        'github.com', 'indeed.com', 'glassdoor.com', 'ziprecruiter.com', 'greenhouse.io',
        'lever.co', 'workday.com', 'chase.com', 'paypal.com'
      ].some((d) => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`));

      if (isTrustedDomain) {
        return JSON.stringify({
          hostname: parsed.hostname,
          protocol: parsed.protocol,
          isTrustedPlatform: true,
          isIpAddress: false,
          hasSuspiciousTld: false,
          warning: 'Authenticated official company/platform domain. Standard legitimate link.'
        });
      }

      return JSON.stringify({
        hostname: parsed.hostname,
        protocol: parsed.protocol,
        isIpAddress,
        hasSuspiciousTld,
        warning: isIpAddress || hasSuspiciousTld
          ? 'High-risk or abnormal URL structure detected.'
          : 'Standard URL structure.'
      });
    } catch {
      return JSON.stringify({ error: 'Malformed or unparseable URL.' });
    }
  }
});

// 2b. Strands Agent Tool: Cross-reference with Amazon S3 Threat Intelligence Vault
const threatVaultTool = tool({
  name: 'query_s3_threat_vault',
  description: 'Queries the ScamShield Amazon S3 Threat Intelligence Vault to check if a domain, brand name, phone number, sender email, or scam phrase matches previously cataloged scam campaigns',
  inputSchema: z.object({
    query: z.string().describe('The domain name, brand, phone number, or suspicious phrase to cross-reference against past scam data')
  }),
  callback: async ({ query }) => {
    try {
      const matchData = await queryThreatVault(query);
      return JSON.stringify(matchData);
    } catch (err) {
      return JSON.stringify({ error: 'Threat vault lookup temporarily unavailable', matched: false });
    }
  }
});

// 2c. Strands Agent Tool: Verify Sender Domain & MFA / Verification Code Authenticity
const senderAndMfaVerificationTool = tool({
  name: 'verify_sender_and_mfa',
  description: 'Verifies whether a sender email or domain belongs to a verified authentic organization (e.g. LinkedIn, Google, Apple), checks if email client displays a verified checkmark badge, and evaluates job listings and Multi-Factor Authentication (MFA) codes',
  inputSchema: z.object({
    sender: z.string().default('').describe('The sender email or domain address if found, or empty string'),
    messageSnippet: z.string().default('').describe('A snippet of the message text to analyze for MFA or job listings, or empty string'),
    hasVerifiedCheckmark: z.boolean().default(false).describe('True if email client displays an official blue verified checkmark / BIMI badge')
  }),
  callback: async ({ sender, messageSnippet, hasVerifiedCheckmark }) => {
    try {
      const result = {
        senderAnalysis: null,
        mfaAnalysis: null,
        jobAnalysis: null
      };

      // 1. Sender Domain Analysis
      if (sender) {
        const cleanSender = sender.trim().toLowerCase();
        const emailMatch = cleanSender.match(/[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,})/i);
        const domain = emailMatch ? emailMatch[1] : cleanSender.replace(/^https?:\/\//, '').split('/')[0];

        const KNOWN_LEGITIMATE_ROOTS = {
          'google.com': 'Google',
          'googlemail.com': 'Google Mail',
          'apple.com': 'Apple',
          'icloud.com': 'Apple iCloud',
          'microsoft.com': 'Microsoft',
          'live.com': 'Microsoft',
          'outlook.com': 'Microsoft Outlook',
          'office.com': 'Microsoft Office',
          'amazon.com': 'Amazon',
          'aws.amazon.com': 'Amazon Web Services',
          'github.com': 'GitHub',
          'paypal.com': 'PayPal',
          'chase.com': 'Chase Bank',
          'bankofamerica.com': 'Bank of America',
          'wellsfargo.com': 'Wells Fargo',
          'citi.com': 'Citibank',
          'capitalone.com': 'Capital One',
          'discover.com': 'Discover',
          'fidelity.com': 'Fidelity',
          'schwab.com': 'Charles Schwab',
          'usbank.com': 'U.S. Bank',
          'americanexpress.com': 'American Express',
          'netflix.com': 'Netflix',
          'spotify.com': 'Spotify',
          'uber.com': 'Uber',
          'linkedin.com': 'LinkedIn',
          'indeed.com': 'Indeed',
          'glassdoor.com': 'Glassdoor',
          'ziprecruiter.com': 'ZipRecruiter',
          'greenhouse.io': 'Greenhouse ATS',
          'lever.co': 'Lever ATS',
          'workday.com': 'Workday',
          'discord.com': 'Discord',
          'slack.com': 'Slack',
          'zoom.us': 'Zoom',
          'dropbox.com': 'Dropbox',
          'stripe.com': 'Stripe',
          'docusign.net': 'DocuSign',
          'docusign.com': 'DocuSign',
          'usps.com': 'US Postal Service',
          'fedex.com': 'FedEx',
          'ups.com': 'UPS'
        };

        const FREE_WEBMAIL = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'proton.me', 'protonmail.com'];
        const BRAND_NAMES = ['paypal', 'amazon', 'apple', 'microsoft', 'chase', 'bank of america', 'wells fargo', 'geek squad', 'norton', 'mcafee', 'usps'];

        // Check if root domain matches verified organization
        let verifiedOrg = null;
        for (const [root, org] of Object.entries(KNOWN_LEGITIMATE_ROOTS)) {
          if (domain === root || domain.endsWith(`.${root}`)) {
            verifiedOrg = org;
            break;
          }
        }

        // Check if brand is sent from free webmail
        const isFreeWebmail = FREE_WEBMAIL.includes(domain);
        const freeWebmailImpersonation = isFreeWebmail && BRAND_NAMES.some(brand => cleanSender.includes(brand));

        // Check if domain is a hyphenated lookalike (e.g. amazon-support-alerts.xyz)
        const isHyphenatedLookalike = BRAND_NAMES.some(b => domain.includes(b)) && !verifiedOrg;

        if (verifiedOrg) {
          result.senderAnalysis = {
            domain,
            isVerifiedAuthentic: true,
            organization: verifiedOrg,
            guidance: `Sender is authenticated under official domain of ${verifiedOrg}. If message contains standard transactional notices or MFA codes without external suspicious links, rate risk as LOW (0-20).`
          };
        } else if (freeWebmailImpersonation) {
          result.senderAnalysis = {
            domain,
            isVerifiedAuthentic: false,
            isSevereImpersonation: true,
            guidance: `Severe Brand Impersonation: Sender claims to be an established brand but is sending from a public free email provider (${domain}). Major indicator of phishing/fraud.`
          };
        } else if (isHyphenatedLookalike) {
          result.senderAnalysis = {
            domain,
            isVerifiedAuthentic: false,
            isLookalikeDomain: true,
            guidance: `Lookalike Phishing Domain: Domain contains a brand name but is not registered to the official company. High probability of phishing.`
          };
        } else {
          result.senderAnalysis = {
            domain,
            isVerifiedAuthentic: false,
            guidance: `Sender is from an independent or unverified domain. Evaluate message body, headers, and links carefully.`
          };
        }
      }

      // 2. MFA / 2FA Verification Code Analysis
      if (messageSnippet) {
        const text = messageSnippet.toLowerCase();
        const hasCodePattern = /\b(verification|security|confirmation|one-time|login)\s+code\s+is\s*:?\s*[a-z0-9-]{4,8}\b/i.test(text) ||
                               /\b(otp|pin)\s+is\s*:?\s*[a-z0-9-]{4,8}\b/i.test(text) ||
                               /\bcode\s*:\s*[0-9]{4,8}\b/i.test(text) ||
                               /\b[0-9]{6}\s+is\s+your\b/i.test(text) ||
                               /\buse\s+(code\s+)?[0-9]{4,8}\s+to\s+(verify|sign|log)\b/i.test(text);

        const hasMfaSafetyAdvisory = /\b(do\s*not\s*share|expires\s*in|never\s*share|if\s*you\s*did\s*not\s*request|employees\s*will\s*never\s*ask)\b/i.test(text);

        // Attack indicators (attempting to steal the code)
        const asksToReplyWithCode = /\b(reply\s+(with|to\s*this|your\s*code)|send\s+(us|this)\s*code|text\s+back\s+with)\b/i.test(text);
        const tellsToCallHelpline = /\b(call\s+(us|our|this\s*number|support)|phone\s*:\s*\+?[0-9-]{7,})\b/i.test(text);
        const hasCancelLink = /\b(cancel\s+(this\s+)?(request|transaction|transfer)|dispute\s+here|click\s+here\s+to\s+cancel)\b/i.test(text);

        if (hasCodePattern) {
          if (asksToReplyWithCode || (tellsToCallHelpline && hasCancelLink)) {
            result.mfaAnalysis = {
              isLegitimateMfa: false,
              isMfaInterceptionScam: true,
              guidance: 'MFA Phishing / Interception Attack: This message delivers or mentions a code but directs the victim to reply with the code, call a fake support number, or click an unverified cancellation link. Rate as HIGH or CRITICAL risk.'
            };
          } else {
            result.mfaAnalysis = {
              isLegitimateMfa: true,
              hasStandardAdvisory: hasMfaSafetyAdvisory,
              guidance: 'Legitimate MFA / 2FA Delivery: This is an automated one-time login or security passcode. Phrases like "expires in 10 minutes" or "do not share this code" are standard security advisories, NOT malicious urgency or credential harvesting. Unless linked to an unverified spoofed sender or malicious external link, score as LOW RISK (0-15).'
            };
          }
        }
      }

      // 3. Job Listing & Recruitment Analysis
      const snippetLower = (messageSnippet || '').toLowerCase();
      const isJobRelated = /\b(job alert|job opening|actively recruiting|cyber security|engineer|analyst|hiring|recruitment|position|manage alerts|see all jobs)\b/i.test(snippetLower);

      if (isJobRelated) {
        const isOfficialJobPlatform = ['linkedin.com', 'indeed.com', 'glassdoor.com', 'ziprecruiter.com', 'greenhouse.io', 'lever.co'].some(
          (p) => domain === p || domain.endsWith(`.${p}`)
        );

        // Scam indicators for fake job recruitment
        const hasExaggeratedPay = /\$([5-9][0-9]|[1-9][0-9]{2,})\s*(?:\/|\s*per\s*)(?:hr|hour)\b|\b(?:5000|10000)\s*(?:\/|\s*per\s*)(?:week|month)\b/i.test(snippetLower);
        const hasOffPlatformInterview = /\b(telegram|whatsapp|signal)\b/i.test(snippetLower);
        const hasCheckOrEquipmentScam = /\b(check for (equipment|home office)|purchase equipment|approved vendor|send you a check)\b/i.test(snippetLower);
        const hasUnsolicitedHiring = /\b(hired immediately|no interview required|congratulations you are hired)\b/i.test(snippetLower);

        if (hasVerifiedCheckmark || isOfficialJobPlatform) {
          result.jobAnalysis = {
            isVerifiedJobAlert: true,
            hasVerifiedCheckmark: Boolean(hasVerifiedCheckmark),
            platform: verifiedOrg || 'Verified Career Platform',
            guidance: `Official Job Alert from verified career platform (${verifiedOrg || 'LinkedIn'}). The email has an authentic verified checkmark and/or originates from the official platform domain. Links to job openings (e.g. linkedin.com/comm/jobs) are normal notification links and must NOT be flagged as suspicious. Rate this legitimate job digest as LOW RISK (0-15).`
          };
        } else if (hasExaggeratedPay || hasOffPlatformInterview || hasCheckOrEquipmentScam || hasUnsolicitedHiring || freeWebmailImpersonation) {
          result.jobAnalysis = {
            isJobScam: true,
            hasExaggeratedPay,
            hasOffPlatformInterview,
            hasCheckOrEquipmentScam,
            guidance: `Recruitment / Job Scam detected: Contains classic fake job scam tactics (unrealistic pay rate, off-platform interview on Telegram/WhatsApp, fake check for equipment, or free webmail recruiter). Rate as HIGH (70-89) or CRITICAL (90-100) risk.`
          };
        }
      }

      return JSON.stringify(result);
    } catch (err) {
      return JSON.stringify({ error: err.message });
    }
  }
});

// 3. Initialize Bedrock Model & Strands Agent
const hasIamKeys = Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

let rawKey = null;
if (!hasIamKeys) {
  rawKey = process.env.AWS_BEARER_TOKEN_BEDROCK ||
           process.env.BEDROCK_API_KEY ||
           process.env.BedrockAPIKEY ||
           process.env.AWS_API_KEY;

  if (rawKey) {
    rawKey = rawKey.trim();
    // Ensure the required 'bedrock-api-key-' prefix is present if it's a Bedrock API Key
    if (rawKey.startsWith('YmVk') && !rawKey.startsWith('bedrock-api-key-')) {
      rawKey = `bedrock-api-key-${rawKey}`;
    }
  }
}

const modelId = process.env.BEDROCK_MODEL_ID || 'us.amazon.nova-lite-v1:0';
const region = process.env.AWS_REGION || 'us-east-1';

const clientConfig = {};
if (hasIamKeys) {
  // Explicitly supply AWS IAM credentials (SigV4 signing)
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY.trim(),
    ...(process.env.AWS_SESSION_TOKEN ? { sessionToken: process.env.AWS_SESSION_TOKEN.trim() } : {})
  };
} else if (rawKey) {
  // Supply dummy credentials to prevent AWS SDK SigV4 signer from erroring before bearer auth
  clientConfig.credentials = {
    accessKeyId: 'anonymous',
    secretAccessKey: 'anonymous'
  };
}

const bedrockModel = new BedrockModel({
  modelId,
  region,
  ...(rawKey ? { apiKey: rawKey } : {}),
  ...(Object.keys(clientConfig).length > 0 ? { clientConfig } : {})
});

// If using Bearer token (and not standard IAM keys), remove duplicate SigV4 Authorization header
if (rawKey && !hasIamKeys) {
  bedrockModel._client.middlewareStack.add((next) => async (args) => {
    delete args.request.headers['Authorization'];
    delete args.request.headers['authorization'];
    args.request.headers['authorization'] = `Bearer ${rawKey}`;
    return next(args);
  }, {
    step: 'finalizeRequest',
    priority: 'lowest',
    name: 'cleanBearerAuthorizationHeader'
  });
}

const scamShieldAgent = new Agent({
  model: bedrockModel,
  systemPrompt: `You are ScamShield AI, an autonomous cybersecurity investigation agent built for Hack Midwest 2026.
Your role is to analyze suspicious text, emails (.eml files), SMS messages, invoices (.pdf), screenshots, attachments, and links for phishing, fraud, smishing, invoice scams, or credential harvesting.

CRITICAL INVESTIGATION GUIDELINES:
1. LEGITIMATE SENDERS & AUTHENTIC ORGANIZATIONS:
   - Accurately distinguish authentic company emails from deceptive spoofed imposters.
   - You MUST call verify_sender_and_mfa to inspect sender addresses and domain authenticity.
   - If an email originates from an authentic corporate domain (e.g. @accounts.google.com, @apple.com, @id.apple.com, @amazon.com, @accountprotection.microsoft.com, @github.com, @chase.com, @paypal.com, @netflix.com, @uber.com) and contains standard transactional notices, shipping updates, receipt confirmations, or login alerts with official links: SCORE AS LOW RISK (0-20).
   - In contrast, flag SPOOFED lookalikes (e.g. @amazon-security-update.xyz) or established brands using free consumer webmail (e.g. paypal-support829@gmail.com) as severe brand impersonation (HIGH/CRITICAL).

2. MULTI-FACTOR AUTHENTICATION (MFA / 2FA / OTP) RECOGNITION:
   - One-time verification codes, login passcodes, and OTPs are STANDARD, LEGITIMATE CYBERSECURITY MECHANISMS.
   - DO NOT penalize legitimate verification codes as "urgency" or "credential harvesting"!
   - A legitimate MFA delivery message:
     * Simply delivers a verification code (e.g. "Your verification code is 492019", "Use code 940212 to sign in").
     * Contains standard security guidance: "Do not share this code", "Employees will never ask for this code", "Expires in 10 minutes", "If you did not request this, secure your account".
     * DOES NOT ask the user to reply to the email/SMS with the code.
     * DOES NOT tell the user to call an unverified phone number to dispute a transaction.
     * DOES NOT direct the user to an unverified third-party link to cancel the request.
   - CALIBRATION: Legitimate automated MFA/OTP deliveries without social engineering traps MUST be scored as LOW RISK (0-15).
   - ONLY flag an MFA message as HIGH/CRITICAL if it is an MFA Interception Scam (e.g. asking the victim to reply with their code or call a fake fraud helpline).

3. JOB LISTINGS & RECRUITMENT EMAILS (VERIFIED CHECKMARK & SENDER RECOGNITION):
   - You MUST check whether the email sender has a verified checkmark (e.g. Google BIMI / platform badge) or originates from a verified career platform (e.g. @linkedin.com, @indeed.com, @glassdoor.com, @greenhouse.io, @lever.co).
   - VERIFIED JOB ALERT DIGESTS: Platforms like LinkedIn send job alert digests ("Your job alert for cyber security analyst", "Incident Response Engineer at Piper Companies", "Sony Interactive Entertainment").
   - Internal platform tracking links matching the sender platform (e.g. linkedin.com/comm/jobs/view/..., linkedin.com/jobs/...) are normal platform notification links, NOT suspicious links!
   - If an email is an official job alert digest from a verified platform (especially with a verified checkmark), rate it as LOW RISK (0-15). NEVER report official platform links as "suspicious links"!
   - RECRUITMENT & JOB SCAMS: Conversely, flag as HIGH (70-89) or CRITICAL (90-100) if an email exhibits true employment scam tactics:
     * Exaggerated or unrealistic pay rates (e.g. $50-$100+/hr for simple data entry with no experience, $5,000/week).
     * Asking the applicant to interview or message via Telegram, WhatsApp, or Signal.
     * Sending a check to purchase home office equipment or software from an "approved vendor".
     * Purporting to represent an established brand (Sony, Piper, Google, Amazon) from a free personal email address (@gmail.com, @yahoo.com).
     * Unsolicited hiring without any interview ("Congratulations, you are hired immediately").

4. OPAQUE / HIDDEN HYPERLINKS & CTA BUTTONS:
   - In screenshots or formatted emails, attackers frequently use stylized Call-To-Action (CTA) buttons (e.g., "Verify Account", "Log In to Fix", "Update Payment Info", "Claim Refund", "Cancel Order", "View Statement", "Secure Account") that hide the real destination URL from the user.
   - In a screenshot, the underlying URL is invisible and cannot be verified. Attackers deliberately exploit this visual disguise to direct victims to credential-harvesting phishing portals.
   - NEVER lower the threat score simply because "no visible URL was detected" or "no links were written in plain text."
   - The presence of an unverified/hidden-destination button paired with urgency, account suspension warnings, unexpected invoices, or financial claims is a MAJOR RED FLAG and must result in a HIGH (60-79) or CRITICAL (80-100) risk score.
   - Always flag this in indicators: e.g., "Opaque Call-To-Action Button: Contains button '[Button Text]' that obscures the destination URL, preventing domain safety verification."

5. VISUAL & SCREENSHOT HEURISTICS:
   - Look for brand impersonation (PayPal, Amazon, Microsoft, Apple, Geek Squad, Norton, Netflix, USPS, banks).
   - Check for mismatched sender info, generic greetings ("Dear Customer"), and synthetic urgency ("within 24 hours", "immediate action required").
   - If any plaintext URL or domain is visible in the text or headers, you MUST call the inspect_url tool.

6. RISK SCORE CALIBRATION (0-100):
   - CRITICAL (80-100): Immediate account threats, fake security alerts with hidden login/payment buttons, brand impersonation via free webmail/lookalike domains, urgent invoice scams, recruitment fake-check/telegram scams, or credential/MFA harvesting.
   - HIGH (60-79): Rendered CTA buttons with unverified destinations, mismatched sender claims, suspicious refund/delivery notices, unverified attachments, or recruitment scams with exaggerated pay.
   - MODERATE (35-59): Unsolicited marketing with aggressive sales language or unverified promotional links without credential theft.
   - LOW (0-34): Authenticated transactional notices from confirmed official domains, verified LinkedIn/Indeed job alert digests with official links, and legitimate automated MFA/OTP verification code deliveries.

7. RECOMMENDED ACTION:
   - If hidden CTA buttons are detected, explicitly instruct the user: "Never click buttons or links in this message. Independently open a browser and visit the official website directly (or contact verified support) to verify your account status."
   - If legitimate MFA is detected: "This appears to be a legitimate one-time passcode. Never share this code with anyone over phone or email."
   - If legitimate verified job alert: "This is an authentic job digest from a verified career platform. Use the official links to view or apply for openings directly."

8. AMAZON S3 THREAT INTELLIGENCE VAULT:
   - If any domain, brand, phone number, or suspicious sender is present, call query_s3_threat_vault to check if this threat matches cataloged past campaigns in the ScamShield database.`,
  tools: [urlInspectionTool, threatVaultTool, senderAndMfaVerificationTool]
});

// Resilient direct analysis agent (fallback if model produces invalid tool call sequence)
const directAnalysisAgent = new Agent({
  model: bedrockModel,
  systemPrompt: `You are ScamShield AI, an autonomous cybersecurity investigation agent built for Hack Midwest 2026.
Your role is to analyze suspicious text, emails, SMS messages, invoices, screenshots, attachments, and links for phishing, fraud, smishing, invoice scams, or credential harvesting.
Assess sender domain authenticity, recognize verified platform checkmarks and authentic job alert digests (e.g. LinkedIn, Indeed) as low risk (0-15) unless exhibiting recruitment scams (exaggerated pay, Telegram interviews, fake checks), recognize legitimate Multi-Factor Authentication (MFA / 2FA / OTP) codes as low risk (0-15), and output structured threat analysis.`,
  tools: []
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const bedrockReady = hasIamKeys || Boolean(rawKey);

  res.json({
    status: 'ok',
    agent: 'ScamShield Strands Agent',
    bedrockReady,
    region,
    modelId,
    s3VaultReady: hasIamKeys,
    s3Bucket: process.env.S3_BUCKET_NAME || 'scamshield-threat-vault-070780358311',
    credentialType: hasIamKeys
      ? 'AWS IAM Access Key (SigV4)'
      : rawKey
      ? 'Bearer Token (API Key)'
      : 'None detected (check server/.env)'
  });
});

// Main Analysis Endpoint (Supports text and files)
app.post('/api/analyze', async (req, res) => {
  try {
    const { message, file, hasVerifiedCheckmark } = req.body;

    if ((!message || typeof message !== 'string' || !message.trim()) && !file) {
      return res.status(400).json({ error: 'Either message text or an uploaded file is required' });
    }

    // Build comprehensive prompt text
    let promptText = `Conduct a comprehensive cybersecurity threat investigation on the following submission for phishing, fraud, fake invoices, recruitment scams, or credential harvesting:\n\n`;

    const isVerifiedSenderPresent = Boolean(
      hasVerifiedCheckmark || (message && /\[VERIFIED SENDER\]/i.test(message))
    );

    if (isVerifiedSenderPresent) {
      promptText += `PLATFORM VERIFICATION BADGE:\n- Verified Checkmark Badge: CONFIRMED (Official blue verified checkmark / BIMI verified sender icon detected in email client next to sender).\n\n`;
    }

    if (file) {
      promptText += `ATTACHED FILE:\n`;
      promptText += `- Name: ${file.name || 'unnamed'}\n`;
      promptText += `- Type: ${file.type || 'unknown'}\n`;
      if (file.size) {
        promptText += `- Size: ${file.size} bytes\n`;
      }
      if (file.content) {
        promptText += `\nFILE EXTRACTED TEXT:\n"""\n${file.content.slice(0, 30000)}\n"""\n\n`;
      }
    }

    if (message && message.trim()) {
      promptText += `USER MESSAGE / CONTEXT:\n"""\n${message.trim()}\n"""\n\n`;
    }

    promptText += `EVALUATION CHECKLIST:
1. SENDER DOMAIN & VERIFIED CHECKMARK: Call verify_sender_and_mfa with sender and checkmark status. If sender has a verified checkmark or originates from an authentic platform (e.g. @linkedin.com, @google.com, @apple.com), treat as an authenticated sender.
2. JOB LISTINGS & CAREER ALERTS: If this is an official job alert digest (such as LinkedIn Job Alerts) from a verified sender, links pointing to the official platform (e.g. linkedin.com/comm/jobs) are normal notification links, NOT phishing links. Score legitimate job digests as LOW RISK (0-15).
   - Only flag as a job scam (HIGH/CRITICAL) if the message exhibits fake job scam tactics: exaggerated pay ($60-$100/hr data entry), off-platform interviews on Telegram/WhatsApp, fake check for home office equipment, or free webmail recruiter.
3. MULTI-FACTOR AUTHENTICATION (MFA / OTP): If the message delivers a one-time verification passcode (with standard notes like "expires in 10 minutes" or "do not share this code"), recognize standard automated MFA as LOW RISK (0-15).
4. OPAQUE CALL-TO-ACTION (CTA) BUTTONS: Are there rendered CTA buttons where the underlying link is obscured? Treat hidden link destinations as an elevated threat factor.
5. S3 THREAT VAULT & URL CHECKS:
   - Call query_s3_threat_vault if any domain, brand, phone number, or suspicious sender is present to match past cataloged attacks.
   - Call inspect_url on any visible plaintext URLs or domain structures.
6. Provide a realistic danger score (0-100), risk level (CRITICAL, HIGH, MODERATE, LOW), concise summary, specific red flag indicators, and clear user guidance.`;

    // Attempt multimodal Block creation if file dataUrl is present
    let mediaBlock = null;
    if (file && file.dataUrl) {
      try {
        const match = file.dataUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64Data = match[2];
          const bytes = new Uint8Array(Buffer.from(base64Data, 'base64'));
          const ext = file.name ? file.name.split('.').pop().toLowerCase() : '';

          if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext) || mimeType.startsWith('image/')) {
            const format = ext === 'jpg' ? 'jpeg' : (ext || 'png');
            mediaBlock = new ImageBlock({
              format: ['png', 'jpeg', 'gif', 'webp'].includes(format) ? format : 'png',
              source: { bytes }
            });
          } else if (['pdf', 'csv', 'doc', 'docx', 'xls', 'xlsx', 'html', 'txt', 'md', 'json', 'xml'].includes(ext) || mimeType === 'application/pdf') {
            const format = ext === 'pdf' ? 'pdf' : (ext || 'txt');
            mediaBlock = new DocumentBlock({
              name: file.name || 'document',
              format,
              source: { bytes }
            });
          }
        }
      } catch (err) {
        console.warn('Could not construct multimodal Block, proceeding with text prompt:', err.message);
      }
    }

    let result;
    const isMultimodal = Boolean(mediaBlock);

    try {
      if (isMultimodal) {
        result = await scamShieldAgent.invoke(
          [new TextBlock(promptText), mediaBlock],
          { structuredOutputSchema: analysisSchema }
        );
      } else {
        result = await scamShieldAgent.invoke(promptText, {
          structuredOutputSchema: analysisSchema
        });
      }
    } catch (agentError) {
      const errStr = (agentError.message || '') + ' ' + (agentError.name || '');
      const isToolSeqError =
        errStr.includes('invalid sequence as part of ToolUse') ||
        errStr.includes('ModelStreamErrorException') ||
        errStr.includes('ValidationException');

      if (isToolSeqError) {
        console.warn('⚠️ ToolUse sequence anomaly detected in Bedrock stream. Executing direct analysis fallback...');
        try {
          result = await directAnalysisAgent.invoke(promptText, {
            structuredOutputSchema: analysisSchema
          });
        } catch (fallbackError) {
          console.warn('Structured fallback issue. Executing raw JSON prompt fallback...');
          result = await directAnalysisAgent.invoke(
            `${promptText}\n\nIMPORTANT INSTRUCTION: Respond ONLY with a valid JSON object matching: {"score": <number 0-100>, "riskLevel": "CRITICAL"|"HIGH"|"MODERATE"|"LOW", "summary": "<string>", "indicators": ["<string>"], "recommendedAction": "<string>"}`
          );
        }
      } else {
        throw agentError;
      }
    }

    let parsedData = result.structuredOutput;

    if (!parsedData) {
      const rawText = result.toString();
      const match = rawText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        parsedData = {
          score: 65,
          riskLevel: 'MODERATE',
          summary: rawText,
          indicators: ['AI analysis generated text output'],
          recommendedAction: 'Carefully verify the sender and attachments.'
        };
      }
    }

    if (!parsedData.summary || typeof parsedData.summary !== 'string' || !parsedData.summary.trim()) {
      parsedData.summary = `Autonomous investigation completed. Threat risk assessed at ${parsedData.score}/100 (${parsedData.riskLevel}).`;
    }

    // Automatically archive verified threats to Amazon S3 for adaptive learning
    const shouldArchive = (parsedData.score || 0) >= 35;
    if (shouldArchive) {
      archiveThreatToS3({
        ...parsedData,
        sampleText: [message, file?.name, file?.content].filter(Boolean).join('\n\n')
      }).catch((err) => console.warn('Background S3 archiving error:', err.message));
    }

    res.json({
      ...parsedData,
      poweredBy: 'AWS Strands Agents SDK',
      s3ThreatVault: {
        bucket: process.env.S3_BUCKET_NAME || 'scamshield-threat-vault-070780358311',
        archived: shouldArchive
      }
    });
  } catch (error) {
    console.error('Strands Agent execution error:', error);

    const errorMessage = error.message || '';
    const isCredentialError = errorMessage.includes('Could not load credentials from any providers');
    const isIamPermissionError = errorMessage.includes('is not authorized to perform: bedrock:') || errorMessage.includes('no identity-based policy allows');
    const isEolError = errorMessage.includes('end of its life');
    const isModelAccessError = errorMessage.includes('AccessDeniedException') || errorMessage.includes('ResourceNotFoundException');

    let userMessage = errorMessage || 'Agent analysis failed.';
    if (isCredentialError) {
      userMessage = 'AWS Bedrock credentials not found. Please create server/.env and provide AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION=us-east-1. See server/.env.example.';
    } else if (isIamPermissionError) {
      userMessage = `AWS IAM Permission Missing: The IAM user/role is missing Bedrock permissions. In AWS IAM Console, attach 'AmazonBedrockFullAccess' (or grant bedrock:InvokeModel and bedrock:InvokeModelWithResponseStream) to your IAM user.`;
    } else if (isEolError) {
      userMessage = `Bedrock model version expired: Set BEDROCK_MODEL_ID=us.amazon.nova-lite-v1:0 (or an active model) in server/.env.`;
    } else if (isModelAccessError) {
      userMessage = `Bedrock model access required: Please enable model access in the AWS Bedrock Console (Bedrock > Model access) for region ${region}.`;
    }

    res.status(500).json({
      error: userMessage
    });
  }
});

// Expose endpoint to inspect threats stored in Amazon S3 Database
app.get('/api/threats', async (req, res) => {
  try {
    const threats = await getAllThreats();
    res.json({
      bucket: process.env.S3_BUCKET_NAME || 'scamshield-threat-vault-070780358311',
      region: process.env.AWS_REGION || 'us-east-1',
      count: threats.length,
      threats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`🛡️  ScamShield Strands Agent API listening on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`⚠️ Port ${PORT} is already in use by another process. If you have another terminal running the server, stop it or run: npx kill-port ${PORT}`);
  } else {
    console.error('Server error:', err);
  }
});
