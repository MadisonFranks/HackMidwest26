import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Agent, tool, DocumentBlock, ImageBlock, TextBlock, BedrockModel } from '@strands-agents/sdk';
import { z } from 'zod';
import { initS3ThreatVault, queryThreatVault, archiveThreatToS3 } from './s3ThreatVault.js';

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
1. OPAQUE / HIDDEN HYPERLINKS & CTA BUTTONS:
   - In screenshots or formatted emails, attackers frequently use stylized Call-To-Action (CTA) buttons (e.g., "Verify Account", "Log In to Fix", "Update Payment Info", "Claim Refund", "Cancel Order", "View Statement", "Secure Account") that hide the real destination URL from the user.
   - In a screenshot, the underlying URL is invisible and cannot be verified. Attackers deliberately exploit this visual disguise to direct victims to credential-harvesting phishing portals.
   - NEVER lower the threat score simply because "no visible URL was detected" or "no links were written in plain text."
   - The presence of an unverified/hidden-destination button paired with urgency, account suspension warnings, unexpected invoices, or financial claims is a MAJOR RED FLAG and must result in a HIGH (60-79) or CRITICAL (80-100) risk score.
   - Always flag this in indicators: e.g., "Opaque Call-To-Action Button: Contains button '[Button Text]' that obscures the destination URL, preventing domain safety verification."

2. VISUAL & SCREENSHOT HEURISTICS:
   - Look for brand impersonation (PayPal, Amazon, Microsoft, Apple, Geek Squad, Norton, Netflix, USPS, banks).
   - Check for mismatched sender info, generic greetings ("Dear Customer"), and synthetic urgency ("within 24 hours", "immediate action required").
   - If any plaintext URL or domain is visible in the text or headers, you MUST call the inspect_url tool.

3. RISK SCORE CALIBRATION (0-100):
   - CRITICAL (80-100): Immediate account threats, fake security alerts with hidden login/payment buttons, brand impersonation, urgent invoice scams, or credential harvesting.
   - HIGH (60-79): Rendered CTA buttons with unverified destinations, mismatched sender claims, suspicious refund/delivery notices, or unverified attachments.
   - MODERATE (35-59): Unsolicited marketing with aggressive sales language or unverified promotional links without credential theft.
   - LOW (0-34): Authenticated transactional notices from confirmed official domains with no urgency or sensitive info requests.

4. RECOMMENDED ACTION:
   - If hidden CTA buttons are detected, explicitly instruct the user: "Never click buttons or links in this message. Independently open a browser and visit the official website directly (or contact verified support) to verify your account status."

5. AMAZON S3 THREAT INTELLIGENCE VAULT:
   - If any domain, brand, phone number, or suspicious sender is present, call query_s3_threat_vault to check if this threat matches cataloged past campaigns in the ScamShield database.`,
  tools: [urlInspectionTool, threatVaultTool]
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
    const { message, file } = req.body;

    if ((!message || typeof message !== 'string' || !message.trim()) && !file) {
      return res.status(400).json({ error: 'Either message text or an uploaded file is required' });
    }

    // Build comprehensive prompt text
    let promptText = `Conduct a comprehensive cybersecurity threat investigation on the following submission for phishing, fraud, fake invoices, or credential harvesting:\n\n`;

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
1. Are there rendered Call-To-Action (CTA) buttons (e.g. "Verify", "Log In", "Pay Now", "Cancel") where the underlying link is obscured? Treat hidden link destinations as an elevated threat factor.
2. Is there deceptive urgency, threatening language, or fear of negative consequences?
3. Is a recognizable brand or institution being impersonated without verified official sender headers?
4. If a domain, brand name, sender email, or phone number is present, call query_s3_threat_vault to check if it matches known attacks in our Amazon S3 threat database.
5. If any plaintext URL or domain is visible anywhere, call inspect_url to inspect it.
6. Provide a realistic danger score (0-100), risk level (CRITICAL, HIGH, MODERATE, LOW), concise summary, specific red flag indicators (including opaque buttons if present), and clear user guidance.`;

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
    if (mediaBlock) {
      try {
        result = await scamShieldAgent.invoke(
          [new TextBlock(promptText), mediaBlock],
          { structuredOutputSchema: analysisSchema }
        );
      } catch (invokeError) {
        console.warn('Multimodal invoke encountered an issue, falling back to text prompt:', invokeError.message);
        result = await scamShieldAgent.invoke(promptText, {
          structuredOutputSchema: analysisSchema
        });
      }
    } else {
      result = await scamShieldAgent.invoke(promptText, {
        structuredOutputSchema: analysisSchema
      });
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🛡️  ScamShield Strands Agent API listening on http://localhost:${PORT}`);
});
