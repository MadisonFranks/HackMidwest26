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
    label: 'Personal Information Request',
    explanation: 'This message may be trying to obtain sensitive information.',
    pattern: /\b(password|verify your identity|security code|otp|social security)\b/i,
    points: 20,
  },
  {
    label: 'Financial Language',
    explanation: 'This message mentions financial information, payments, or money.',
    pattern: /\b(bank|payment|funds|gift card|crypto|money|prize)\b/i,
    points: 10,
  },
]

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) return '🖼️'
  if (['pdf'].includes(ext)) return '📄'
  if (['eml', 'msg'].includes(ext)) return '✉️'
  if (['html', 'htm'].includes(ext)) return '🌐'
  return '📝'
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

    const detected = rules.filter((rule) => rule.pattern.test(combinedContent))
    const total = Math.min(100, detected.reduce((sum, rule) => sum + rule.points, 0))

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
        <div className="status">
          <span className="status-dot"></span>
          Ready
        </div>
      </header>

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
            <h3>🔍 Scam Analyzer</h3>
            <p>Paste or highlight suspicious content</p>
          </div>
        </div>

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
            <span className="file-preview-icon">{getFileIcon(uploadedFile.name)}</span>
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
            <span className="dropzone-icon">📎</span>
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
              <span className="spinner-text">⏳ Strands Agent Investigating...</span>
            ) : (
              '🤖 AWS Strands Deep Scan →'
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
              {isAnalyzing ? 'Scanning...' : '⚡ Quick Rule Check'}
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
          <div className="error-icon">⚠️</div>
          <div>
            <strong>Agent Connection Notice</strong>
            <p>{aiError}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {score !== null && (
        <section className="results">
          <div className="section-heading">
            <h3>📊 Investigation Results</h3>
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
              <h4>🧠 Agent Verdict</h4>
              <p>{aiResult.summary}</p>
            </div>
          )}

          {/* Warning Indicators */}
          <div className="findings-section">
            <h4>⚠️ Warning Indicators</h4>

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
            <h4>✅ Recommended Action</h4>
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
          </div>
        </section>
      )}

      {/* AWS Integration Card */}
      <section className="aws-section active">
        <div className="aws-icon">☁️</div>
        <div>
          <h4>AWS Strands Investigation Agent</h4>
          <p>Autonomous agent with URL inspection tools running on Amazon Bedrock.</p>
        </div>
        <span className="status-pill">LIVE</span>
      </section>

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