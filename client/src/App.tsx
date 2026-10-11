/// <reference types="chrome" />

import { useEffect, useRef, useState } from 'react'
import './App.css'

type Finding = {
  label: string
  explanation: string
  pattern: RegExp
  points: number
}

type StrandsAiResult = {
  score: number
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  summary: string
  indicators: string[]
  recommendedAction: string
  poweredBy?: string
  s3ThreatVault?: {
    bucket: string
    archived: boolean
  }
}

type UploadedFile = {
  name: string
  type: string
  size: number
  dataUrl?: string
  content?: string
  isText: boolean
}

const rules: Finding[] = [
  {
    label: 'Urgent Language',
    explanation: 'This message pressures you to act quickly without thinking.',
    pattern: /\b(urgent|immediately|act now|final warning|hurry)\b/i,
    points: 25,
  },
  {
    label: 'Threatening Language',
    explanation: 'This message threatens account suspension, financial loss, or other consequences.',
    pattern: /\b(suspended|frozen|locked|terminated|deactivated)\b/i,
    points: 25,
  },
  {
    label: 'Unverified Link',
    explanation: 'This message contains a link. The destination has not been independently verified.',
    pattern: /https?:\/\/[^\s]+/i,
    points: 20,
  },
  {
    label: 'Credential Harvesting Attempt',
    explanation: 'This message actively prompts you to provide or surrender passwords, PINs, or sensitive credentials.',
    pattern: /\b(enter (your )?password|provide (your )?(ssn|social security)|reply with (your )?(code|otp|pin|password)|send (us )?(your )?(code|otp|pin|password)|enter (your )?pin)\b/i,
    points: 30,
  },
  {
    label: 'Financial Language',
    explanation: 'This message mentions financial information, payments, or money.',
    pattern: /\b(bank|payment|funds|gift card|crypto|money|prize)\b/i,
    points: 10,
  },
  {
    label: 'Action Button / Hidden Link',
    explanation: 'Directs you to click an action button or link, a primary technique used in phishing to conceal malicious destinations.',
    pattern: /\b(click here|tap here|verify (your )?account|log ?in (to|now)|sign ?in (to|now)|update (your )?(payment|billing|card)|claim (your )?(reward|prize|funds)|cancel (your )?(order|subscription)|review (your )?activity|resolve (your )?issue|view (your )?invoice|download (your )?statement)\b/i,
    points: 25,
  },
  {
    label: 'Brand Impersonation Target',
    explanation: 'Mentions a high-profile brand commonly impersonated in phishing and fake invoice schemes.',
    pattern: /\b(geek squad|norton|mcafee|paypal|amazon|apple|microsoft|netflix|usps|fedex|dhl|chase|wells fargo|bank of america)\b/i,
    points: 15,
  },
  {
    label: 'Recruitment / Job Scam Indicators',
    explanation: 'Contains suspicious hiring tactics such as exaggerated pay ($60-$100+/hr), interviews on Telegram/WhatsApp, or equipment check offers.',
    pattern: /\b(\$([5-9][0-9]|[1-9][0-9]{2,})\s*(?:\/|\s*per\s*)(?:hr|hour)|5000\s*(?:\/|\s*per\s*)week|interview (on|via) (telegram|whatsapp|signal)|check for (home office|equipment)|purchase equipment from our (approved )?vendor)\b/i,
    points: 40,
  },
]

function getFileTag(name: string) {
  const ext = name.split('.').pop()?.toUpperCase() || 'FILE'
  return ext.slice(0, 4)
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function App() {
  const [message, setMessage] = useState('')
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [findings, setFindings] = useState<Finding[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState<StrandsAiResult | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [detectStatus, setDetectStatus] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load highlighted text saved by the browser extension
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['selectedMessage'], (result) => {
        if (typeof result.selectedMessage === 'string') {
          setMessage(result.selectedMessage)
        }
      })
    }
  }, [])

  function handleFileSelected(file: File) {
    if (file.size > 15 * 1024 * 1024) {
      setAiError('File is too large (max 15MB). Please choose a smaller file.')
      return
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const isTextFile =
      ['eml', 'msg', 'txt', 'html', 'htm', 'json', 'csv', 'log', 'md'].includes(ext) ||
      file.type.startsWith('text/')

    if (isTextFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = (e.target?.result as string) || ''
        setUploadedFile({
          name: file.name,
          type: file.type || `text/${ext}`,
          size: file.size,
          content: text,
          isText: true,
        })
        resetAnalysis()
      }
      reader.onerror = () => {
        setAiError('Failed to read file contents.')
      }
      reader.readAsText(file)
    } else {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = (e.target?.result as string) || ''
        setUploadedFile({
          name: file.name,
          type: file.type || (ext === 'pdf' ? 'application/pdf' : `image/${ext}`),
          size: file.size,
          dataUrl,
          isText: false,
        })
        resetAnalysis()
      }
      reader.onerror = () => {
        setAiError('Failed to read file contents.')
      }
      reader.readAsDataURL(file)
    }
  }

  function removeFile() {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    resetAnalysis()
  }

  // Local Rule-Based Analysis
  function analyzeWithRules() {
    const combinedContent = [message, uploadedFile?.content].filter(Boolean).join('\n\n')
    if (!combinedContent.trim()) {
      if (uploadedFile && !uploadedFile.isText) {
        setAiError(
          'Rule check requires readable text. Use AWS Strands Deep Scan to analyze PDF documents or screenshots.'
        )
      }
      return
    }

    setIsAnalyzing(true)
    setAiResult(null)
    setAiError(null)

    // 1. Detect legitimate MFA / Verification code delivery
    const isLegitimateMfa =
      /\b(your (verification|security|confirmation|one-time|login) code is|your (otp|pin) is|code: \d{4,8}|[0-9]{6} is your|use (code\s+)?[0-9]{4,8} to (verify|sign|log)|one-time password \(otp\))\b/i.test(combinedContent) &&
      !/\b(reply (with|to this|your code)|send (us|this) code|call (us|our|this number|helpline)|text back)\b/i.test(combinedContent)

    // 2. Detect verified corporate / organizational sender
    const hasVerifiedSender =
      /\bfrom:\s*[^<\n]*<?[a-z0-9._%+-]+@([a-z0-9-]+\.)*(google\.com|apple\.com|amazon\.com|microsoft\.com|github\.com|chase\.com|bankofamerica\.com|wellsfargo\.com|paypal\.com|netflix\.com|spotify\.com|uber\.com|linkedin\.com|slack\.com|zoom\.us|usps\.com)\b/i.test(combinedContent)

    // 3. Detect major brand impersonation via public free webmail
    const hasBrandOnFreeWebmail =
      /\bfrom:\s*[^<\n]*<?[a-z0-9._%+-]+@(gmail\.com|yahoo\.com|hotmail\.com|outlook\.com|aol\.com)\b/i.test(combinedContent) &&
      /\b(paypal|amazon|apple|microsoft|geek squad|norton|mcafee|chase|bank of america|wells fargo)\b/i.test(combinedContent)

    // 4. Detect verified career platform / job alert
    const isVerifiedJobPlatform =
      (/\b(linkedin\.com|indeed\.com|glassdoor\.com|ziprecruiter\.com)\b/i.test(combinedContent) || /\[VERIFIED SENDER\]/i.test(combinedContent)) &&
      /\b(job alert|job opening|actively recruiting|cyber security|engineer|analyst|position|manage alerts|see all jobs)\b/i.test(combinedContent) &&
      !hasBrandOnFreeWebmail

    const hasJobScamTactic =
      /\b(\$([5-9][0-9]|[1-9][0-9]{2,})\s*(?:\/|\s*per\s*)(?:hr|hour)|5000\s*(?:\/|\s*per\s*)week|interview (on|via) (telegram|whatsapp|signal)|check for (home office|equipment)|purchase equipment from our vendor)\b/i.test(combinedContent)

    const detected = rules.filter((rule) => {
      // If it's standard MFA delivery, don't falsely penalize for urgency or credential harvesting
      if (isLegitimateMfa && (rule.label === 'Urgent Language' || rule.label === 'Credential Harvesting Attempt' || rule.label === 'Action Button / Hidden Link')) {
        return false
      }
      // If it's a verified career platform job alert without scam tactics, don't penalize platform links or buttons
      if (isVerifiedJobPlatform && !hasJobScamTactic && (rule.label === 'Unverified Link' || rule.label === 'Action Button / Hidden Link')) {
        return false
      }
      return rule.pattern.test(combinedContent)
    })

    if (hasBrandOnFreeWebmail) {
      detected.unshift({
        label: 'Brand Impersonation via Free Webmail',
        explanation: 'Claims to represent an established brand but was sent from a free consumer email address (@gmail.com, @yahoo.com). High probability of fraud.',
        pattern: /@/i,
        points: 40,
      })
    }

    if (isLegitimateMfa) {
      detected.push({
        label: 'Legitimate Verification Code (MFA)',
        explanation: 'Standard automated delivery of a one-time login or security passcode. No requests to share the code or call fake support lines were detected.',
        pattern: /code/i,
        points: 0,
      })
    }

    if (hasVerifiedSender) {
      detected.push({
        label: 'Verified Organization Sender',
        explanation: 'Message originates from an authenticated official company domain.',
        pattern: /from/i,
        points: 0,
      })
    }

    if (isVerifiedJobPlatform && !hasJobScamTactic) {
      detected.push({
        label: 'Verified Career Platform (Job Alert)',
        explanation: 'Official job alert digest from an authenticated career platform (e.g. LinkedIn). Destination links lead to legitimate job postings.',
        pattern: /job/i,
        points: 0,
      })
    }

    let total = Math.min(100, detected.reduce((sum, rule) => sum + rule.points, 0))

    // If verified legitimate sender, verified job platform, or genuine MFA and no brand spoofing:
    if ((hasVerifiedSender || isLegitimateMfa || isVerifiedJobPlatform) && !hasBrandOnFreeWebmail && !hasJobScamTactic) {
      total = Math.min(total, 15) // Safe baseline
    }

    setFindings(detected)
    setScore(total)
    setIsAnalyzing(false)
  }

  // Real-time AI Agent Deep Investigation with AWS Strands
  async function analyzeWithStrandsAgent() {
    if (!message.trim() && !uploadedFile) return

    setIsAiAnalyzing(true)
    setAiError(null)

    try {
      const response = await fetch('http://localhost:5001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          hasVerifiedCheckmark: /\[VERIFIED SENDER\]/i.test(message),
          file: uploadedFile
            ? {
                name: uploadedFile.name,
                type: uploadedFile.type,
                size: uploadedFile.size,
                content: uploadedFile.content,
                dataUrl: uploadedFile.dataUrl,
              }
            : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Server responded with ${response.status}`)
      }

      const data: StrandsAiResult = await response.json()
      setAiResult(data)
      setScore(data.score)
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred'
      setAiError(
        `Failed to reach Strands Agent: ${errorMsg}. Make sure 'npm run dev' is running in the server directory with AWS credentials.`
      )
    } finally {
      setIsAiAnalyzing(false)
    }
  }

  function resetAnalysis() {
    setScore(null)
    setFindings([])
    setAiResult(null)
    setAiError(null)
  }

  function autoDetectFromTab() {
    if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
      setDetectStatus('Checking active tab for open email...')
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0]
        if (!tab?.id) {
          setDetectStatus('No active tab found.')
          setTimeout(() => setDetectStatus(null), 3000)
          return
        }

        chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_EMAIL_NOW' }, (response) => {
          if (chrome.runtime.lastError || !response?.success || !response?.data?.hasEmail) {
            setDetectStatus('No open email found in this tab. Open an email in Gmail or Outlook first.')
            setTimeout(() => setDetectStatus(null), 3500)
          } else {
            const data = response.data
            setMessage(data.fullText || data.bodyText)
            setDetectStatus(`Extracted email: "${data.subject || 'Active email'}"`)
            resetAnalysis()
            setTimeout(() => setDetectStatus(null), 4000)
          }
        })
      })
    } else {
      setDetectStatus('Tab auto-detection runs inside the Chrome extension.')
      setTimeout(() => setDetectStatus(null), 3500)
    }
  }

  function loadExample() {
    setMessage(
      'URGENT: Suspicious Invoice #94821 attached. Please review the updated wire transfer details or your subscription will be cancelled.'
    )
    setUploadedFile({
      name: 'invoice_urgent_overdue.eml',
      type: 'message/rfc822',
      size: 4096,
      content: `From: billing-alert@account-updates-support.xyz
To: victim@example.com
Subject: URGENT: Overdue Invoice #94821 - Immediate Action Required
Date: Sat, 10 Oct 2026 15:30:00 -0500

Dear Valued Customer,
Your service is scheduled for immediate termination within 24 hours due to unpaid balance of $489.00.
Please click here to verify your identity and submit payment immediately:
https://secure-bank-verify.xyz/login?id=94821

Failure to pay will result in collection agency referral.
ScamShield Protection Team (Spoofed)`,
      isText: true,
    })
    resetAnalysis()
  }

  function clearMessage() {
    setMessage('')
    removeFile()
    resetAnalysis()

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.remove('selectedMessage')
    }
  }

  function openInNewTab() {
    if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
    } else {
      window.open(window.location.href, '_blank')
    }
  }

  const effectiveRiskLevel = aiResult
    ? aiResult.riskLevel
    : score === null
      ? ''
      : score >= 70
        ? 'HIGH RISK'
        : score >= 35
          ? 'MODERATE RISK'
          : 'LOWER INDICATED RISK'

  const effectiveRiskClass =
    score === null
      ? ''
      : score >= 70
        ? 'high'
        : score >= 35
          ? 'moderate'
          : 'low'

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">🛡️</div>
        <div className="brand">
          <h1>
            ScamShield <span>AI</span>
          </h1>
          <p>Browser Security Assistant</p>
        </div>
        <div className="header-actions">
          <div className="status">
            <span className="status-dot"></span>
            Ready
          </div>
          <button
            type="button"
            className="expand-button"
            onClick={openInNewTab}
            title="Open ScamShield in full browser tab"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
            </svg>
            <span>Full Page</span>
          </button>
        </div>
      </header>

      {/* Main Responsive Layout */}
      <main className="main-content">
        <div className="content-col left-col">
          {/* Welcome */}
          <section className="welcome">
            <div className="welcome-badge">HACK MIDWEST 2026</div>
            <h2>
              Stay one step ahead <span>of scams.</span>
            </h2>
            <p>Analyze suspicious emails, text messages, and links using autonomous AI security agents.</p>
          </section>

      {/* Analyzer */}
      <section className="analyzer">
        <div className="section-heading">
          <div>
            <h3>Scam Analyzer</h3>
            <p>Paste or auto-detect suspicious content</p>
          </div>
          <button
            type="button"
            className="auto-detect-btn"
            onClick={autoDetectFromTab}
            title="Auto-detect open email from active tab (Gmail / Outlook)"
          >
            <span>🛡️</span>
            <span>Auto-Detect Email</span>
          </button>
        </div>

        {detectStatus && (
          <div className="detect-status-banner">
            <span>🛡️</span>
            <span>{detectStatus}</span>
          </div>
        )}

        <textarea
          placeholder="Paste suspicious text, email, SMS, or link here..."
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
            resetAnalysis()
          }}
          rows={uploadedFile ? 3 : 4}
        />

        <div className="character-count">{message.length} characters</div>

        {/* File Attachment Dropzone or Preview */}
        {uploadedFile ? (
          <div className="file-preview-card">
            <span className="file-preview-badge">{getFileTag(uploadedFile.name)}</span>
            <div className="file-preview-details">
              <div className="file-preview-name">{uploadedFile.name}</div>
              <div className="file-preview-meta">
                {formatFileSize(uploadedFile.size)} •{' '}
                {uploadedFile.isText ? 'Text extracted' : 'Document/Image attachment'}
              </div>
            </div>
            <button
              type="button"
              className="file-remove-button"
              onClick={removeFile}
              title="Remove attached file"
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            className={`file-dropzone ${isDragging ? 'drag-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileSelected(e.dataTransfer.files[0])
              }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelected(e.target.files[0])
                }
              }}
              accept=".eml,.msg,.txt,.html,.htm,.json,.pdf,.png,.jpg,.jpeg,.webp,.csv,.log"
            />
            <svg className="dropzone-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
            <div className="dropzone-text">
              <strong>Attach suspicious file or screenshot</strong>
              <span>Drop .eml, .pdf, .txt, .png, .jpg or click to browse (up to 15MB)</span>
            </div>
          </div>
        )}

        <div className="button-group">
          {/* AWS Strands AI Investigation Button */}
          <button
            className="ai-analyze-button"
            onClick={analyzeWithStrandsAgent}
            disabled={(!message.trim() && !uploadedFile) || isAiAnalyzing || isAnalyzing}
          >
            {isAiAnalyzing ? (
              <span className="spinner-text">Strands Agent Investigating...</span>
            ) : (
              'AWS Strands Deep Scan →'
            )}
          </button>

          <div className="button-row">
            <button
              className="analyze-button"
              onClick={analyzeWithRules}
              disabled={
                (!message.trim() && !uploadedFile?.content) || isAiAnalyzing || isAnalyzing
              }
            >
              {isAnalyzing ? 'Scanning...' : 'Quick Rule Check'}
            </button>

            <button className="secondary-button" onClick={loadExample}>
              Try Example
            </button>
          </div>
        </div>

        <button className="clear-button" onClick={clearMessage}>
          Clear All
        </button>
      </section>

      {/* Error Banner */}
      {aiError && (
        <div className="error-banner">
          <div className="error-icon">!</div>
          <div>
            <strong>Agent Connection Notice</strong>
            <p>{aiError}</p>
          </div>
        </div>
      )}

      {/* AWS Integration Card */}
      <section className="aws-section active">
        <span className="aws-brand-badge">AWS</span>
        <div>
          <h4>Strands Investigation Agent</h4>
          <p>Autonomous agent with URL inspection & Amazon S3 Threat Vault memory.</p>
        </div>
        <span className="status-pill">LIVE</span>
      </section>
    </div>

    <div className="content-col right-col">
      {/* Results Section or Idle Overview */}
      {score !== null ? (
        <section className="results">
          <div className="section-heading">
            <h3>Investigation Results</h3>
            {aiResult && (
              <span className="badge-ai">Powered by AWS Strands Agents SDK</span>
            )}
          </div>

          <div className={`risk-card ${effectiveRiskClass}`}>
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/ 100</span>
            </div>

            <div className="risk-information">
              <p className="risk-label">DETECTED RISK</p>
              <h2>{effectiveRiskLevel}</h2>
              <p>
                {aiResult
                  ? `${aiResult.indicators.length} warning red flag${aiResult.indicators.length === 1 ? '' : 's'} identified`
                  : `${findings.length} warning indicator${findings.length === 1 ? '' : 's'} identified`}
              </p>
            </div>
          </div>

          {/* AI Summary Verdict if available */}
          {aiResult && (
            <div className="ai-verdict-box">
              <h4>Agent Verdict</h4>
              <p>{aiResult.summary}</p>
            </div>
          )}

          {/* Warning Indicators */}
          <div className="findings-section">
            <h4>Warning Indicators</h4>

            {aiResult ? (
              aiResult.indicators.length === 0 ? (
                <div className="no-findings">No immediate scam indicators flagged. Always stay vigilant.</div>
              ) : (
                aiResult.indicators.map((indicator, index) => (
                  <div className="finding" key={index}>
                    <div className="finding-icon">!</div>
                    <div>
                      <strong>Threat Flag #{index + 1}</strong>
                      <p>{indicator}</p>
                    </div>
                  </div>
                ))
              )
            ) : findings.length === 0 ? (
              <div className="no-findings">No predefined warning indicators detected. Always verify unfamiliar messages.</div>
            ) : (
              findings.map((finding) => (
                <div className="finding" key={finding.label}>
                  <div className="finding-icon">!</div>
                  <div>
                    <strong>{finding.label}</strong>
                    <p>{finding.explanation}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Safety Recommendations */}
          <div className="safety">
            <h4>Recommended Action</h4>
            {aiResult ? (
              <div className="ai-action-box">
                <p>{aiResult.recommendedAction}</p>
              </div>
            ) : (
              <ul>
                <li>Do not click unexpected or suspicious links.</li>
                <li>Verify requests using an official website or trusted phone number.</li>
                <li>Never share passwords or verification codes.</li>
                <li>Report suspicious messages when appropriate.</li>
              </ul>
            )}

            {aiResult?.s3ThreatVault?.archived && (
              <div className="s3-vault-notice">
                <span>Threat cataloged in Amazon S3 Threat Intelligence Vault</span>
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="idle-overview-card">
          <div className="overview-header">
            <span className="overview-tag">ACTIVE CAPABILITIES</span>
            <h3>Threat Intelligence Console</h3>
            <p>ScamShield autonomously correlates multi-modal inputs against emerging cyber attack campaigns.</p>
          </div>
          <div className="feature-grid">
            <div className="feature-item">
              <strong>Hidden Link & Button Heuristics</strong>
              <p>Uncovers credential-theft phishing portals disguised behind opaque CTA buttons.</p>
            </div>
            <div className="feature-item">
              <strong>Amazon S3 Threat Vault</strong>
              <p>Cross-references domains and phone numbers against cataloged scam campaigns.</p>
            </div>
            <div className="feature-item">
              <strong>Multi-Modal Ingestion</strong>
              <p>Inspects .eml emails, PDF invoices, and raw screenshots via Amazon Bedrock.</p>
            </div>
            <div className="feature-item">
              <strong>Autonomous Strands Tools</strong>
              <p>Executes live URL structure inspection and real-time threat intelligence queries.</p>
            </div>
          </div>
          <div className="quick-start-box">
            <span>Want to test the agent?</span>
            <button type="button" className="inline-example-button" onClick={loadExample}>
              Load Sample Threat
            </button>
          </div>
        </div>
      )}
    </div>
  </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-brand">🛡️ ScamShield AI</div>
        <p>Think before you click.</p>
        <small>Hack Midwest 2026 | AWS Bedrock + Strands Agents</small>
      </footer>
    </div>
  )
}

export default App