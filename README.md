# ScamShield AI 🛡️

**Hack Midwest 2026**

An AI-powered cybersecurity browser extension that helps users identify scams, phishing, smishing, and suspicious messages using autonomous AI security agents.

Built with **React**, **TypeScript**, **AWS Bedrock**, and the **AWS Strands Agents SDK**.

---

## Architecture

- **`client/`**: Chrome Extension (Manifest V3) built with React, Vite, and TypeScript.
- **`server/`**: Autonomous security agent backend using the AWS Strands Agents SDK (`@strands-agents/sdk`), equipped with custom URL inspection tools and powered by Amazon Bedrock.

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
# AWS_SESSION_TOKEN=your_token_if_applicable
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

To load the extension into Chrome:
1. Open Chrome and go to `chrome://extensions`.
2. Toggle on **Developer mode** in the top-right corner.
3. Click **Load unpacked** in the top-left corner.
4. Select the `client/dist` directory.
5. Pin **ScamShield AI** and start analyzing!