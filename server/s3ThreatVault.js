import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

let s3Client = null;
let bucketName = null;
let inMemoryCache = null;
let lastCacheFetch = 0;
const CACHE_TTL_MS = 30000; // 30 seconds

export function initS3ThreatVault(config = {}) {
  bucketName = config.bucketName || process.env.S3_BUCKET_NAME || 'scamshield-threat-vault-070780358311';
  const region = config.region || process.env.AWS_REGION || 'us-east-1';

  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn('⚠️ S3 Threat Vault: AWS IAM credentials not configured. S3 archiving disabled.');
    return false;
  }

  s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID.trim(),
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY.trim(),
      ...(process.env.AWS_SESSION_TOKEN ? { sessionToken: process.env.AWS_SESSION_TOKEN.trim() } : {})
    }
  });

  console.log(`🗄️  Amazon S3 Threat Vault connected: bucket '${bucketName}' in ${region}`);
  return true;
}

/**
 * Fetch the latest threat index from S3
 */
async function getThreatIndex() {
  const now = Date.now();
  if (inMemoryCache && now - lastCacheFetch < CACHE_TTL_MS) {
    return inMemoryCache;
  }

  if (!s3Client || !bucketName) return [];

  try {
    const response = await s3Client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: 'index/threat-catalog.json'
    }));

    const raw = await response.Body.transformToString();
    const indexData = JSON.parse(raw);
    inMemoryCache = Array.isArray(indexData) ? indexData : [];
    lastCacheFetch = now;
    return inMemoryCache;
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.Code === 'NoSuchKey') {
      inMemoryCache = [];
      lastCacheFetch = now;
      return [];
    }
    console.warn('Could not fetch threat catalog from S3:', err.message);
    return inMemoryCache || [];
  }
}

/**
 * Get all cataloged threats from S3
 */
export async function getAllThreats() {
  return await getThreatIndex();
}

/**
 * Query S3 threat vault for matching domains, brands, or keywords
 */
export async function queryThreatVault(query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return { matched: false, count: 0, results: [] };
  }

  const catalog = await getThreatIndex();
  const normalized = query.toLowerCase().trim();

  const matches = catalog.filter((entry) => {
    if (entry.summary && entry.summary.toLowerCase().includes(normalized)) return true;
    if (entry.indicators && entry.indicators.some((ind) => ind.toLowerCase().includes(normalized))) return true;
    if (entry.keywords && entry.keywords.some((kw) => kw.toLowerCase().includes(normalized))) return true;
    if (entry.sampleSnippet && entry.sampleSnippet.toLowerCase().includes(normalized)) return true;
    return false;
  }).slice(0, 5); // Return top 5 most relevant

  return {
    matched: matches.length > 0,
    count: matches.length,
    results: matches.map((m) => ({
      id: m.id,
      date: m.timestamp?.split('T')[0] || 'Unknown',
      riskScore: m.score,
      riskLevel: m.riskLevel,
      summary: m.summary,
      matchedIndicators: m.indicators?.slice(0, 3) || []
    }))
  };
}

/**
 * Archive a detected scam threat to Amazon S3
 */
export async function archiveThreatToS3(threatData) {
  if (!s3Client || !bucketName) return null;
  if (!threatData || (threatData.score || 0) < 35) return null; // Only archive meaningful threats

  try {
    const id = `thr_${Date.now()}_${randomUUID().slice(0, 6)}`;
    const timestamp = new Date().toISOString();
    const dateStr = timestamp.split('T')[0];

    // Extract search keywords from indicators and sample text
    const sampleSnippet = (threatData.sampleText || '').slice(0, 500);
    const keywords = [
      ...(threatData.indicators || []),
      ...(sampleSnippet.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g) || []),
      ...(sampleSnippet.match(/\bhttps?:\/\/[^\s/$.?#].[^\s]*/gi) || []),
      ...(sampleSnippet.match(/\b(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})\b/g) || [])
    ].map((k) => k.toLowerCase());

    const record = {
      id,
      timestamp,
      score: threatData.score,
      riskLevel: threatData.riskLevel,
      summary: threatData.summary,
      indicators: threatData.indicators || [],
      recommendedAction: threatData.recommendedAction,
      sampleSnippet,
      keywords: Array.from(new Set(keywords))
    };

    // 1. Save detailed threat record to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: `threats/${dateStr}/${id}.json`,
      Body: JSON.stringify(record, null, 2),
      ContentType: 'application/json'
    }));

    // 2. Update catalog index in S3 (keep most recent 200 items)
    const existingIndex = await getThreatIndex();
    const updatedIndex = [
      {
        id,
        timestamp,
        score: threatData.score,
        riskLevel: threatData.riskLevel,
        summary: threatData.summary,
        indicators: threatData.indicators || [],
        keywords: record.keywords,
        sampleSnippet: sampleSnippet.slice(0, 200)
      },
      ...existingIndex.filter((item) => item.id !== id)
    ].slice(0, 200);

    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: 'index/threat-catalog.json',
      Body: JSON.stringify(updatedIndex, null, 2),
      ContentType: 'application/json'
    }));

    inMemoryCache = updatedIndex;
    lastCacheFetch = Date.now();

    console.log(`🛡️ Threat archived to Amazon S3: ${id} (Score: ${threatData.score})`);
    return id;
  } catch (err) {
    console.warn('Failed to archive threat to S3:', err.message);
    return null;
  }
}

