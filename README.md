# ScamShield AI 🛡️

**Hack Midwest 2026**

An AI-powered cybersecurity browser extension that autonomously detects and neutralizes scams, phishing, smishing, and deceptive messages using Amazon Bedrock, the AWS Strands Agents SDK, and an adaptive Amazon S3 Threat Intelligence Vault.

---

## Key Features

- **Autonomous AI Security Agent**: Built with the **AWS Strands Agents SDK** and powered by **Amazon Bedrock** (Amazon Nova / Anthropic Claude), executing custom tool inspections on suspicious URLs, deceptive urgencies, and domain structures.
- **Adaptive Amazon S3 Threat Intelligence Vault**: Whenever a threat is identified, it is automatically cataloged and archived to an **Amazon S3** bucket (`scamshield-threat-vault`). Subsequent scans query historical signatures to adapt to emerging scam campaigns.
- **Automated In-Page Email Scanner**: Automatically detects open emails in **Gmail**, **Outlook**, and webmail, injecting a non-intrusive floating action badge (`🛡️ Scan Email with ScamShield`) with instant inline threat assessment cards.
- **Multi-Modal Document & Image Inspection**: Analyzes raw emails (`.eml`, `.msg`), invoices, text snippets, and suspicious attachments.
- **Full-Page & Popup Dashboard**: Responsive edge-to-edge dark theme dashboard with real-time risk scoring, threat indicators, and recommended actions.

---

## Architecture

- **`client/`**: Chrome Extension (Manifest V3) built with React, Vite, and TypeScript.
  - `content.js`: In-page DOM parser and floating threat badge for Gmail and Outlook.
  - `background.js`: Background service worker handling secure API relays and badge status.
  - `App.tsx`: Extension popup and full-page dashboard with active-tab auto-detection.
- **`server/`**: Autonomous security agent backend powered by `@strands-agents/sdk`, AWS Bedrock, and AWS S3 SDK.
  - `s3ThreatVault.js`: Amazon S3 threat indexer, archiver, and live catalog retrieval.
  - `index.js`: Express API exposing `/api/analyze` and `/api/threats`.

---

## Getting Started

### 1. Backend Setup (`server/`)

```bash
cd server
npm install
```

Create a `.env` file in `server/` (see `server/.env.example`):
```env
PORT=5001
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=scamshield-threat-vault-070780358311
BEDROCK_MODEL_ID=us.amazon.nova-lite-v1:0
```

Start the Strands agent server:
```bash
npm run dev
```

### 2. Chrome Extension Setup (`client/`)

```bash
cd client
npm install
npm run build
```

To load the extension into Chrome (macOS & Windows):
1. Open Google Chrome and go to `chrome://extensions`.
2. Toggle on **Developer mode** in the top-right corner.
3. Click **Load unpacked** in the top-left corner.
4. Select the `client/dist` directory.
5. Pin **ScamShield AI** to your browser toolbar!

---

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/analyze` | `POST` | Analyze suspicious message or document with AWS Strands Agent and S3 Vault |
| `/api/threats` | `GET` | Retrieve live catalog of archived threats directly from Amazon S3 |

---

## Team & Hackathon

Built with pride for **Hack Midwest 2026**.