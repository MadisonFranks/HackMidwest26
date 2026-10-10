import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Agent, tool, DocumentBlock, ImageBlock, TextBlock } from '@strands-agents/sdk';
import { z } from 'zod';

dotenv.config();

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

// 3. Initialize Strands Agent (Powered by AWS Bedrock)
const scamShieldAgent = new Agent({
  systemPrompt: `You are ScamShield AI, an autonomous cybersecurity investigation agent built for Hack Midwest 2026.
Your role is to analyze suspicious text, emails (.eml files), SMS messages, invoices (.pdf), screenshots, attachments, and links for phishing, fraud, smishing, invoice scams, or credential harvesting.
If any URL or link is present in the text or attached file, you MUST call the inspect_url tool to check it.

Produce an objective assessment with a danger score (0-100), risk level (CRITICAL, HIGH, MODERATE, LOW), summary, red flag indicators, and recommended actions.`,
  tools: [urlInspectionTool]
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    agent: 'ScamShield Strands Agent',
    bedrockReady: Boolean(process.env.AWS_ACCESS_KEY_ID || process.env.AWS_BEARER_TOKEN_BEDROCK)
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
    let promptText = `Investigate the following submission for cybersecurity threats, fraud, phishing, smishing, fake invoices, or credential harvesting:\n\n`;

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

    promptText += `Check for deceptive urgency, suspicious sender headers, mismatched links, fake invoice/billing claims, or requests for sensitive info. If any URL is detected, use inspect_url to inspect it.`;

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

    res.json({
      ...parsedData,
      poweredBy: 'AWS Strands Agents SDK'
    });
  } catch (error) {
    console.error('Strands Agent execution error:', error);
    res.status(500).json({
      error: error.message || 'Agent analysis failed. Check AWS Bedrock credentials.'
    });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🛡️  ScamShield Strands Agent API listening on http://localhost:${PORT}`);
});
