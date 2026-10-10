/// <reference types="chrome" />

import { useEffect, useState } from 'react'
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

function App() {
  const [message, setMessage] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [findings, setFindings] = useState<Finding[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState<StrandsAiResult | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

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

  // Local Rule-Based Analysis
  function analyzeWithRules() {
    if (!message.trim()) return

    setIsAnalyzing(true)
    setAiResult(null)
    setAiError(null)

    const detected = rules.filter((rule) => rule.pattern.test(message))
    const total = Math.min(100, detected.reduce((sum, rule) => sum + rule.points, 0))

    setFindings(detected)
    setScore(total)
    setIsAnalyzing(false)
  }

  // Real-time AI Agent Deep Investigation with AWS Strands
  async function analyzeWithStrandsAgent() {
    if (!message.trim()) return

    setIsAiAnalyzing(true)
    setAiError(null)

    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
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
      'URGENT! Your bank account has been suspended. Verify your identity immediately at https://secure-bank-verify.xyz or your funds will be frozen.'
    )
    resetAnalysis()
  }

  function clearMessage() {
    setMessage('')
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
          placeholder="Paste a suspicious email, text message, or link here..."
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
            resetAnalysis()
          }}
          rows={5}
        />

        <div className="character-count">{message.length} characters</div>

        <div className="button-group">
          {/* AWS Strands AI Investigation Button */}
          <button
            className="ai-analyze-button"
            onClick={analyzeWithStrandsAgent}
            disabled={!message.trim() || isAiAnalyzing || isAnalyzing}
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
              disabled={!message.trim() || isAiAnalyzing || isAnalyzing}
            >
              {isAnalyzing ? 'Scanning...' : '⚡ Quick Rule Check'}
            </button>

            <button className="secondary-button" onClick={loadExample}>
              Try Example
            </button>
          </div>
        </div>

        <button className="clear-button" onClick={clearMessage}>
          Clear Message
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