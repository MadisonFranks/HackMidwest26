/// <reference types="chrome" />

import { useEffect, useState } from 'react'
import './App.css'

type Finding = {
  label: string
  explanation: string
  pattern: RegExp
  points: number
}

const rules: Finding[] = [
  {
    label: 'Urgent Language',
    explanation:
      'This message pressures you to act quickly without thinking.',
    pattern: /\b(urgent|immediately|act now|final warning|hurry)\b/i,
    points: 25,
  },
  {
    label: 'Threatening Language',
    explanation:
      'This message threatens account suspension, financial loss, or other consequences.',
    pattern: /\b(suspended|frozen|locked|terminated|deactivated)\b/i,
    points: 25,
  },
  {
    label: 'Unverified Link',
    explanation:
      'This message contains a link. The destination has not been independently verified.',
    pattern: /https?:\/\/[^\s]+/i,
    points: 20,
  },
  {
    label: 'Personal Information Request',
    explanation:
      'This message may be trying to obtain sensitive information.',
    pattern: /\b(password|verify your identity|security code|otp|social security)\b/i,
    points: 20,
  },
  {
    label: 'Financial Language',
    explanation:
      'This message mentions financial information, payments, or money.',
    pattern: /\b(bank|payment|funds|gift card|crypto|money|prize)\b/i,
    points: 10,
  },
]

function App() {
  const [message, setMessage] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [findings, setFindings] = useState<Finding[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Load highlighted text saved by the browser extension.
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['selectedMessage'], (result) => {
        if (typeof result.selectedMessage === 'string') {
          setMessage(result.selectedMessage)
        }
      })
    }
  }, [])

  function analyzeMessage() {
    if (!message.trim()) return

    setIsAnalyzing(true)

    const detected = rules.filter((rule) =>
      rule.pattern.test(message)
    )

    const total = Math.min(
      100,
      detected.reduce((sum, rule) => sum + rule.points, 0)
    )

    setFindings(detected)
    setScore(total)
    setIsAnalyzing(false)
  }

  function resetAnalysis() {
    setScore(null)
    setFindings([])
  }

  function loadExample() {
    setMessage(
      'URGENT! Your bank account has been suspended. Verify your identity immediately at https://secure-bank-verify.example or your funds will be frozen.'
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

  const riskLevel =
    score === null
      ? ''
      : score >= 70
        ? 'HIGH RISK'
        : score >= 35
          ? 'MODERATE RISK'
          : 'LOWER INDICATED RISK'

  const riskClass =
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
          <p>Your browser security assistant</p>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          Ready
        </div>
      </header>

      {/* Welcome */}
      <section className="welcome">
        <div className="welcome-badge">
          SECURITY DASHBOARD
        </div>

        <h2>
          Stay one step ahead
          <span> of scams.</span>
        </h2>

        <p>
          Analyze suspicious emails, text messages, and links
          before you trust them.
        </p>
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
          rows={6}
        />

        <div className="character-count">
          {message.length} characters
        </div>

        <div className="button-row">
          <button
            className="analyze-button"
            onClick={analyzeMessage}
            disabled={!message.trim() || isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : '🛡️ Analyze Message →'}
          </button>

          <button
            className="secondary-button"
            onClick={loadExample}
          >
            Try Example
          </button>
        </div>

        <button
          className="clear-button"
          onClick={clearMessage}
        >
          Clear Message
        </button>

      </section>

      {/* Results */}
      {score !== null && (
        <section className="results">

          <div className="section-heading">
            <h3>📊 Investigation Results</h3>
          </div>

          <div className={`risk-card ${riskClass}`}>

            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/ 100</span>
            </div>

            <div className="risk-information">
              <p className="risk-label">DETECTED RISK</p>
              <h2>{riskLevel}</h2>
              <p>
                {findings.length} warning indicator
                {findings.length !== 1 ? 's' : ''} identified
              </p>
            </div>

          </div>

          <p className="disclaimer">
            This is a rule-based warning score, not a verified
            probability of fraud. A low score does not guarantee safety.
          </p>

          {/* Findings */}
          <div className="findings-section">

            <h4>⚠️ Warning Indicators</h4>

            {findings.length === 0 ? (
              <div className="no-findings">
                No predefined warning indicators detected.
                Always verify unfamiliar messages.
              </div>
            ) : (
              findings.map((finding) => (
                <div
                  className="finding"
                  key={finding.label}
                >
                  <div className="finding-icon">!</div>

                  <div>
                    <strong>{finding.label}</strong>
                    <p>{finding.explanation}</p>
                  </div>
                </div>
              ))
            )}

          </div>

          {/* Safety Tips */}
          <div className="safety">

            <h4>✅ Recommended Actions</h4>

            <ul>
              <li>
                Do not click unexpected or suspicious links.
              </li>
              <li>
                Verify requests using an official website
                or trusted phone number.
              </li>
              <li>
                Never share passwords or verification codes.
              </li>
              <li>
                Report suspicious messages when appropriate.
              </li>
            </ul>

          </div>

        </section>
      )}

      {/* AWS Integration Preview */}
      <section className="aws-section">

        <div className="aws-icon">☁️</div>

        <div>
          <h4>AWS Strands Investigation Agent</h4>
          <p>
            Coming next: AI-powered scam investigation,
            custom security tools, and detailed explanations.
          </p>
        </div>

        <span className="coming-soon">
          PLANNED
        </span>

      </section>

      {/* Footer */}
      <footer className="footer">

        <div className="footer-brand">
          🛡️ ScamShield AI
        </div>

        <p>
          Think before you click.
        </p>

        <small>
          Hack Midwest 2026 | Security Prototype
        </small>

      </footer>

    </div>
  )
}

export default App