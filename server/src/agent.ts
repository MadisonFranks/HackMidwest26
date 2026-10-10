
import { Agent, tool } from '@strands-agents/sdk';
import { BedrockModel } from '@strands-agents/sdk';
import { z } from 'zod';

// Tool 1: Detect urgency and pressure tactics
const checkUrgency = tool({
  name: 'check_urgency',
  description: 'Detect urgent or threatening language commonly used in scams.',
  inputSchema: z.object({
    message: z.string(),
  }),
  callback: async ({ message }) => {
    console.log('[STRANDS TOOL EXECUTED] check_urgency');

    const patterns = [
      'urgent',
      'immediately',
      'act now',
      'suspended',
      'final warning',
      'limited time',
      'verify now',
    ];

    const found = patterns.filter((word) =>
      message.toLowerCase().includes(word)
    );

    return JSON.stringify({
      suspicious: found.length > 0,
      detectedPhrases: found,
    });
  },
});

// Tool 2: Identify suspicious links
const checkLinks = tool({
  name: 'check_links',
  description: 'Find links in messages that may require caution.',
  inputSchema: z.object({
    message: z.string(),
  }),
  callback: async ({ message }) => {
    console.log('[STRANDS TOOL EXECUTED] check_links');

    const links = message.match(/https?:\/\/[^\s]+/gi) || [];

    return JSON.stringify({
      linksFound: links,
      containsLinks: links.length > 0,
      note: 'Links require verification. A link alone does not prove a scam.',
    });
  },
});

// Tool 3: Detect requests for sensitive information
const checkSensitiveInfo = tool({
  name: 'check_sensitive_info',
  description: 'Detect requests for passwords, codes, and financial details.',
  inputSchema: z.object({
    message: z.string(),
  }),
  callback: async ({ message }) => {
    console.log('[STRANDS TOOL EXECUTED] check_sensitive_info');

    const keywords = [
      'password',
      'social security',
      'credit card',
      'bank account',
      'verification code',
      'one-time code',
      'pin number',
    ];

    const found = keywords.filter((word) =>
      message.toLowerCase().includes(word)
    );

    return JSON.stringify({
      requestsSensitiveInfo: found.length > 0,
      detectedKeywords: found,
    });
  },
});

// Amazon Bedrock configuration
const model = new BedrockModel({
  modelId: 'amazon.nova-lite-v1:0',
  region: process.env.AWS_REGION || 'us-east-2',
  maxTokens: 1024,
  temperature: 0.2,
});

// Create the ScamShield AI Strands agent
export function createScamAgent() {
  return new Agent({
    model,
    tools: [checkUrgency, checkLinks, checkSensitiveInfo],
    systemPrompt: `
You are ScamShield AI, a cybersecurity assistant.

Your job is to analyze suspicious emails, text messages,
and other written communications.

Use your available tools to identify:
1. Urgency and pressure tactics
2. Suspicious links
3. Requests for passwords or sensitive information
4. Signs of phishing, impersonation, or fraud

Explain your findings in clear, simple language.

Classify the message as Low Risk, Medium Risk, or High Risk.

Give the user:
- A risk classification
- Reasons for the classification
- Suspicious phrases
- Recommended safety actions

Do not claim a message is definitely safe or definitely fraudulent
without sufficient evidence.
`,
  });
}
