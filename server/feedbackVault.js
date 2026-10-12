import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_FEEDBACK_FILE = path.join(__dirname, 'feedback_vault.json');

let s3Client = null;
let bucketName = null;

/**
 * Initialize S3 connection for Feedback Learning Vault
 */
function getS3Client() {
  if (s3Client) return { client: s3Client, bucket: bucketName };

  bucketName = process.env.S3_BUCKET_NAME || 'scamshield-threat-vault-070780358311';
  const region = process.env.AWS_REGION || 'us-east-1';

  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY.trim(),
        ...(process.env.AWS_SESSION_TOKEN ? { sessionToken: process.env.AWS_SESSION_TOKEN.trim() } : {})
      }
    });
  }

  return { client: s3Client, bucket: bucketName };
}

/**
 * Read local feedback store
 */
function readLocalFeedbackStore() {
  try {
    if (fs.existsSync(LOCAL_FEEDBACK_FILE)) {
      const raw = fs.readFileSync(LOCAL_FEEDBACK_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('[FeedbackVault] Could not read local feedback file:', err.message);
  }

  // Pre-seed with sample feedback demonstration records if file is empty
  const defaultSeeds = [
    {
      id: 'fb_seed_001',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      isAccurate: false,
      feedbackType: 'FALSE_POSITIVE',
      userNotes: 'Legitimate hackathon project submission form sent by Hack Midwest organizers.',
      originalScore: 50,
      originalRiskLevel: 'MODERATE',
      correctedScore: 10,
      sender: 'Michael Gelphman <mike@kcitp.com>',
      domain: 'kcitp.com',
      keywords: ['kcitp.com', 'hack midwest', 'forms.gle'],
      status: 'LEARNED'
    },
    {
      id: 'fb_seed_002',
      timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
      isAccurate: true,
      feedbackType: 'ACCURATE',
      userNotes: 'Correctly caught fraudulent wire transfer invoice on unverified .xyz domain.',
      originalScore: 95,
      originalRiskLevel: 'CRITICAL',
      correctedScore: 95,
      sender: 'service@secure-bank-verify.xyz',
      domain: 'secure-bank-verify.xyz',
      keywords: ['secure-bank-verify.xyz', 'invoice', 'wire transfer'],
      status: 'VERIFIED'
    }
  ];

  writeLocalFeedbackStore(defaultSeeds);
  return defaultSeeds;
}

/**
 * Write local feedback store
 */
function writeLocalFeedbackStore(feedbacks) {
  try {
    fs.writeFileSync(LOCAL_FEEDBACK_FILE, JSON.stringify(feedbacks, null, 2), 'utf-8');
  } catch (err) {
    console.error('[FeedbackVault] Error saving local feedback:', err.message);
  }
}

/**
 * Save user feedback and propagate to Amazon S3
 */
export async function saveFeedback({
  messageText = '',
  predictedScore = 0,
  predictedRiskLevel = 'LOW',
  isAccurate = true,
  feedbackType = 'ACCURATE', // 'ACCURATE' | 'FALSE_POSITIVE' | 'FALSE_NEGATIVE'
  userNotes = '',
  sender = '',
  domain = '',
  links = []
}) {
  const feedbacks = readLocalFeedbackStore();
  const id = `fb_${Date.now()}_${randomUUID().slice(0, 6)}`;
  const timestamp = new Date().toISOString();

  // Extract domain & sender from messageText if not provided
  let extractedSender = sender ? sender.trim() : '';
  if (!extractedSender && messageText) {
    const fromMatch = messageText.match(/from:\s*([^\n\r<]+<[^>]+>|[^\n\r]+)/i);
    if (fromMatch) {
      extractedSender = fromMatch[1].trim();
    }
  }

  let extractedDomain = domain ? domain.toLowerCase() : '';
  if (!extractedDomain) {
    if (extractedSender) {
      const match = extractedSender.match(/@([a-z0-9.-]+\.[a-z]{2,})/i);
      if (match) extractedDomain = match[1].toLowerCase();
    }
    if (!extractedDomain && messageText) {
      const emailMatch = messageText.match(/[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,})/i);
      if (emailMatch) extractedDomain = emailMatch[1].toLowerCase();
    }
  }

  // Extract keywords
  const keywords = [
    extractedDomain,
    extractedSender,
    ...(links || []),
    ...(messageText ? messageText.slice(0, 300).toLowerCase().split(/\s+/).filter((w) => w.length > 4).slice(0, 6) : [])
  ].filter(Boolean).map((k) => k.toLowerCase());

  const newEntry = {
    id,
    timestamp,
    isAccurate: Boolean(isAccurate),
    feedbackType: feedbackType || (isAccurate ? 'ACCURATE' : 'FALSE_POSITIVE'),
    userNotes: userNotes.trim(),
    originalScore: Number(predictedScore) || 0,
    originalRiskLevel: predictedRiskLevel || 'LOW',
    correctedScore: isAccurate ? predictedScore : (feedbackType === 'FALSE_POSITIVE' ? 10 : 90),
    sender: extractedSender,
    domain: extractedDomain,
    links: links || [],
    snippet: messageText ? messageText.slice(0, 400) : '',
    keywords: Array.from(new Set(keywords)),
    status: isAccurate ? 'VERIFIED' : 'LEARNED'
  };

  feedbacks.unshift(newEntry);
  writeLocalFeedbackStore(feedbacks);

  // Sync to Amazon S3 Threat Intelligence Vault
  const { client, bucket } = getS3Client();
  if (client && bucket) {
    try {
      const dateStr = timestamp.split('T')[0];
      await client.send(new PutObjectCommand({
        Bucket: bucket,
        Key: `vault/feedback/${dateStr}/${id}.json`,
        Body: JSON.stringify(newEntry, null, 2),
        ContentType: 'application/json'
      }));
      console.log(`[FeedbackVault] Synced feedback ${id} to S3 bucket ${bucket}`);
    } catch (s3Err) {
      console.warn('[FeedbackVault] S3 sync skipped or unavailable:', s3Err.message);
    }
  }

  return newEntry;
}

/**
 * Returns overall developer feedback telemetry and model accuracy statistics
 */
export function getFeedbackStats() {
  const feedbacks = readLocalFeedbackStore();
  const total = feedbacks.length;
  const accurateCount = feedbacks.filter((f) => f.isAccurate).length;
  const falsePositives = feedbacks.filter((f) => f.feedbackType === 'FALSE_POSITIVE').length;
  const falseNegatives = feedbacks.filter((f) => f.feedbackType === 'FALSE_NEGATIVE').length;
  const accuracyRate = total > 0 ? Math.round((accurateCount / total) * 100) : 100;

  return {
    total,
    accurateCount,
    falsePositives,
    falseNegatives,
    accuracyRate,
    recentFeedback: feedbacks.slice(0, 20)
  };
}

/**
 * Query human feedback memory for specific domain, sender, or scam phrase
 * Used by Strands Agent to dynamically retrieve past user corrections
 */
export function queryFeedbackMemory(query) {
  if (!query || typeof query !== 'string') {
    return { matched: false, results: [] };
  }

  const cleanQuery = query.toLowerCase().trim();
  const feedbacks = readLocalFeedbackStore();

  const matches = feedbacks.filter((entry) => {
    if (entry.domain && entry.domain.toLowerCase().includes(cleanQuery)) return true;
    if (entry.sender && entry.sender.toLowerCase().includes(cleanQuery)) return true;
    if (entry.userNotes && entry.userNotes.toLowerCase().includes(cleanQuery)) return true;
    if (entry.keywords && entry.keywords.some((kw) => kw.includes(cleanQuery))) return true;
    return false;
  }).slice(0, 3);

  return {
    matched: matches.length > 0,
    count: matches.length,
    results: matches.map((m) => ({
      feedbackType: m.feedbackType,
      isAccurate: m.isAccurate,
      domain: m.domain,
      userCorrection: m.userNotes,
      suggestedScore: m.correctedScore,
      guidance: m.feedbackType === 'FALSE_POSITIVE'
        ? `HUMAN CORRECTION: Previous assessment on domain '${m.domain}' was corrected by users as a FALSE POSITIVE. User note: "${m.userNotes}". Adjust risk score down (0-15) unless malicious payload is present.`
        : `HUMAN CORRECTION: Prior assessment on '${m.domain}' was marked as a FALSE NEGATIVE. Treat as verified threat.`
    }))
  };
}

/**
 * Formats learned corrections as in-context reinforcement memory for the AI agent prompt
 */
export function getLearnedCorrectionsPrompt() {
  const feedbacks = readLocalFeedbackStore();
  const corrections = feedbacks.filter((f) => !f.isAccurate && f.userNotes).slice(0, 5);

  if (corrections.length === 0) return '';

  let memoryText = `\nHUMAN REINFORCEMENT LEARNING & USER CORRECTION MEMORY:\n`;
  corrections.forEach((c, idx) => {
    memoryText += `${idx + 1}. [User Correction on ${c.domain || c.sender || 'Message'}]: Flagged as ${c.feedbackType}. User Note: "${c.userNotes}". (Calibrated Baseline Score: ${c.correctedScore}/100).\n`;
  });
  memoryText += `Rule: Respect human corrections when evaluating identical or closely matching communication contexts.\n\n`;

  return memoryText;
}
