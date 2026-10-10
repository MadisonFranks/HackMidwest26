import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Agent, tool } from '@strands-agents/sdk';
import { z } from 'zod';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Zod schema for structured agent output
const analysisSchema = z.object({
  score: z.number().min(0).max(100).describe('0-100 threat risk score'),
  riskLevel: z.enum(['CRITICAL', 'HIGH', 'MODERATE', 'LOW']).describe('Risk category'),
  summary: z.string().describe('1-2 sentence investigation verdict'),
  indicators: z.array(z.string()).describe('List of detected scam tactics or red flags'),
  recommendedAction: z.string().describe('Clear next step guidance for the user')
});

// 2. Strands Agent Tool: Inspect suspicious links found in messages
const urlInspectionTool = tool({
  name: 'inspect_url',
  description: 'Inspects a URL found in the message to check for suspicious domains or IP addresses',
  inputSchema: z.object({
    url: z.string().describe('The URL to inspect')
  }),
  callback: async ({ url }) => {
    try {
      const parsed = new URL(url);
      const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname);
      const hasSuspiciousTld = /\.(xyz|top|work|click|loan|info|tk|gq|cf)$/i.test(parsed.hostname);

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
Your role is to analyze suspicious text, emails, SMS messages, and links for phishing, fraud, smishing, or credential harvesting.
If any URL or link is present in the text, you MUST call the inspect_url tool to check it.

Produce an objective assessment with a danger score (0-100), risk level, summary, red flag indicators, and recommended actions.`,
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

// Main Analysis Endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const result = await scamShieldAgent.invoke(
      `Investigate this message for security threats and fraud:\n\n"""${message}"""`,
      { structuredOutputSchema: analysisSchema }
    );

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
          recommendedAction: 'Carefully verify the sender.'
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🛡️  ScamShield Strands Agent API listening on http://localhost:${PORT}`);
});
