
/// <reference types="chrome" />
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { createWorker } from 'tesseract.js'
import './App.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

type Finding = {
  title: string
  explanation: string
  points: number
}

type Rule = Finding & {
  pattern: RegExp
}

const rules: Rule[] = [
  {
    title: 'Urgent language',
    explanation: 'Pressures you to act quickly before checking whether the message is legitimate.',
    points: 25,
    pattern: /\b(urgent|immediately|act now|right away|final warning|limited time)\b/i,
  },
  {
    title: 'Threatening language',
    explanation: 'Uses fear of penalties, suspension, or losing access to pressure you.',
    points: 25,
    pattern: /\b(suspended|locked|terminated|frozen|penalty|legal action|arrest)\b/i,
  },
  {
    title: 'Suspicious link or website request',
    explanation: 'Contains a link. Verify its destination independently before opening it.',
    points: 20,
    pattern: /https?:\/\/[^\s]+|www\.[^\s]+/i,
  },
  {
    title: 'Sensitive information request',
    explanation: 'May be asking for passwords, identity details, or account verification.',
    points: 20,
    pattern: /\b(password|verify your identity|social security|ssn|login credentials|security code|one.time code)\b/i,
  },
  {
    title: 'Financial pressure',
    explanation: 'Mentions money, payments, or financial accounts.',
    points: 10,
    pattern: /\b(bank|payment|transfer|refund|funds|credit card|gift card|wire money)\b/i,
  },
]

const MAX_FILE_SIZE = 20 * 1024 * 1024
const MAX_TEXT_LENGTH = 1_000_000
const MAX_PDF_PAGES = 100
const MAX_AI_CHARACTERS = 12000
const API_URL = 'http://127.0.0.1:3001/api/analyze'

function getRiskLabel(score: number) {
  if (score >= 60) return { text: 'HIGH RISK', className: 'high' }
  if (score >= 30) return { text: 'MODERATE RISK', className: 'moderate' }
  return { text: 'LOW RISK', className: 'low' }
}

async function extractPdfText(
  file: File,
  onProgress: (status: string) => void
): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise

  let ocrWorker: Awaited<ReturnType<typeof createWorker>> | null = null
  const pages: string[] = []
  let totalLength = 0

  try {
    if (pdf.numPages > MAX_PDF_PAGES) {
      throw new Error(
        `This PDF has ${pdf.numPages} pages. The maximum is ${MAX_PDF_PAGES}.`
      )
    }

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      onProgress(`Reading PDF page ${pageNumber} of ${pdf.numPages}...`)

      const page = await pdf.getPage(pageNumber)
      const content = await page.getTextContent()

      let pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .trim()

      if (pageText.length < 30) {
        onProgress(`Using OCR on scanned page ${pageNumber} of ${pdf.numPages}...`)

        if (!ocrWorker) {
          ocrWorker = await createWorker('eng')
        }

        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')

        if (!context) {
          throw new Error('Could not initialize the OCR canvas.')
        }

        canvas.width = Math.ceil(viewport.width)
        canvas.height = Math.ceil(viewport.height)

        try {
          await page.render({
            canvas,
            canvasContext: context,
            viewport,
          }).promise

          const result = await ocrWorker.recognize(canvas)
          pageText = result.data.text.trim()
        } finally {
          canvas.width = 0
          canvas.height = 0
        }
      }

      const labeledText = `--- Page ${pageNumber} ---\n${pageText}`
      totalLength += labeledText.length + 2

      if (totalLength > MAX_TEXT_LENGTH) {
        throw new Error('This document contains more than 1 million characters.')
      }

      pages.push(labeledText)
      page.cleanup()
    }

    return pages.join('\n\n')
  } finally {
    if (ocrWorker) await ocrWorker.terminate()
    await pdf.cleanup()
  }
}

async function extractFileText(
  file: File,
  onProgress: (status: string) => void
): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase()

  if (extension === 'txt' || extension === 'eml') {
    return file.text()
  }

  if (extension === 'pdf') {
    return extractPdfText(file, onProgress)
  }

  throw new Error('Please upload a PDF, TXT, or EML file.')
}

function extractAiText(payload: unknown): string {
  if (typeof payload === 'string') return payload
  if (!payload || typeof payload !== 'object') return ''

  const data = payload as Record<string, unknown>

  for (const key of [
    'analysis',
    'response',
    'result',
    'answer',
    'explanation',
    'message',
  ]) {
    const value = data[key]

    if (typeof value === 'string' && value.trim()) {
      return value
    }

    if (value && typeof value === 'object') {
      const nested = extractAiText(value)
      if (nested) return nested
    }
  }

  if (Array.isArray(data.content)) {
    const text = data.content
      .map((item) => {
        if (typeof item === 'string') return item

        if (
          item &&
          typeof item === 'object' &&
          'text' in item &&
          typeof item.text === 'string'
        ) {
          return item.text
        }

        return ''
      })
      .filter(Boolean)
      .join('\n')

    if (text) return text
  }

  return JSON.stringify(payload, null, 2)
}

// Clean up AWS explanations and format bold headings.
function formatAiAnalysis(text: string) {
  const cleaned = text
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<\/?thinking>/gi, '')
    .trim()

  return cleaned.split('\n').map((line, index) => {
    const trimmed = line.trim()

    if (!trimmed) {
      return <div key={index} style={{ height: 8 }} />
    }

    const parts = trimmed.split(/(\*\*[^*]+\*\*)/g)

    return (
      <div
        key={index}
        style={{
          marginBottom: 5,
          overflowWrap: 'anywhere',
          lineHeight: 1.5,
        }}
      >
        {parts.map((part, partIndex) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={partIndex}>{part.slice(2, -2)}</strong>
          ) : (
            <span key={partIndex}>{part}</span>
          )
        )}
      </div>
    )
  })
}

function App() {
  const [message, setMessage] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [findings, setFindings] = useState<Finding[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState('')
  const [aiError, setAiError] = useState('')

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState('')
  const [fileStatus, setFileStatus] = useState('')
  const [isReadingFile, setIsReadingFile] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) return

    chrome.storage.local.get(['selectedMessage'], (result) => {
      if (typeof result.selectedMessage === 'string') {
        setMessage(result.selectedMessage)
      }
    })
  }, [])

  function resetResults() {
    requestIdRef.current += 1
    setScore(null)
    setFindings([])
    setAiAnalysis('')
    setAiError('')
  }

  function handleMessageChange(value: string) {
    setMessage(value)
    resetResults()

    if (uploadedFile) {
      setUploadedFile(null)
      setFileStatus('')

      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setFileError('')
    setFileStatus('')
    resetResults()

    const extension = file.name.split('.').pop()?.toLowerCase()

    if (!['pdf', 'txt', 'eml'].includes(extension ?? '')) {
      setFileError('Please choose a PDF, TXT, or EML file.')
      setUploadedFile(null)
      event.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError('This file is too large. Maximum size is 20 MB.')
      setUploadedFile(null)
      event.target.value = ''
      return
    }

    setIsReadingFile(true)
    setFileStatus('Reading your file...')

    try {
      const text = await extractFileText(file, setFileStatus)

      if (!text.replace(/--- Page \d+ ---/g, '').trim()) {
        throw new Error('No readable text was found. Try a clearer scanned PDF.')
      }

      if (text.length > MAX_TEXT_LENGTH) {
        throw new Error('This document contains more than 1 million characters.')
      }

      setMessage(text)
      setUploadedFile(file)
      setFileStatus('Document text extracted successfully. Ready to analyze.')
    } catch (error) {
      setUploadedFile(null)
      setFileStatus('')
      setFileError(
        error instanceof Error ? error.message : 'Unable to read this file.'
      )
    } finally {
      setIsReadingFile(false)
    }
  }

  function removeUploadedFile() {
    setUploadedFile(null)
    setMessage('')
    setFileError('')
    setFileStatus('')
    resetResults()

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function analyzeMessage() {
    if (!message.trim() || isReadingFile || isAnalyzing) return

    const requestId = ++requestIdRef.current

    setIsAnalyzing(true)
    setAiAnalysis('')
    setAiError('')

    const matchedRules = rules
      .filter((rule) => rule.pattern.test(message))
      .map(({ title, explanation, points }) => ({
        title,
        explanation,
        points,
      }))

    const total = Math.min(
      100,
      matchedRules.reduce((sum, finding) => sum + finding.points, 0)
    )

    setFindings(matchedRules)
    setScore(total)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.slice(0, MAX_AI_CHARACTERS),
        }),
      })

      const payload: unknown = await response.json()

      if (!response.ok) {
        const errorText =
          payload &&
          typeof payload === 'object' &&
          'error' in payload &&
          typeof payload.error === 'string'
            ? payload.error
            : `Backend returned HTTP ${response.status}`

        throw new Error(errorText)
      }

      if (requestId === requestIdRef.current) {
        setAiAnalysis(
          extractAiText(payload) || 'No AI explanation was returned.'
        )
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setAiError(
          error instanceof Error
            ? error.message
            : 'Could not contact the AI backend.'
        )
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  function loadExample() {
    setMessage(
      'URGENT! Your bank account has been suspended. Verify your identity immediately at https://secure-bank-verify.example or your funds will be frozen.'
    )

    setUploadedFile(null)
    setFileError('')
    setFileStatus('')
    resetResults()

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function clearMessage() {
    setMessage('')
    setUploadedFile(null)
    setFileError('')
    setFileStatus('')
    resetResults()

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.remove('selectedMessage')
    }
  }

  const risk = score === null ? null : getRiskLabel(score)

  return (
    <div className="app">
      <header className="header">
        <div className="logo">🛡️</div>

        <div className="brand">
          <h1>
            ScamShield <span>AI</span>
          </h1>
          <p>Smart scam protection</p>
        </div>

        <div className="status">
          <span className="status-dot" />
          Active
        </div>
      </header>

      <section className="welcome">
        <div className="welcome-badge">AI-POWERED SECURITY</div>

        <h2>
          Stay one step ahead <span>of scams.</span>
        </h2>

        <p>
          Check suspicious messages, emails, links, and documents before
          trusting them.
        </p>
      </section>

      <section className="analyzer">
        <div className="section-heading">
          <span>01</span>
          <h3>Paste a suspicious message</h3>
        </div>

        <textarea
          value={message}
          onChange={(event) => handleMessageChange(event.target.value)}
          placeholder="Paste a suspicious message, email, or link here..."
          rows={6}
          disabled={isReadingFile || isAnalyzing}
        />

        <div className="character-count">
          {message.length.toLocaleString()} characters
        </div>

        <div className="upload-divider">
          <span>OR</span>
        </div>

        <div className="section-heading">
          <span>02</span>
          <h3>Upload a suspicious file</h3>
        </div>

        <div className="upload-box">
          <div className="upload-icon">📄</div>
          <h3>Choose a document to scan</h3>
          <p>PDF, TXT, or EML • Up to 20 MB • Scanned PDFs supported</p>

          <input
            ref={fileInputRef}
            id="scam-file-upload"
            type="file"
            accept=".pdf,.txt,.eml"
            onChange={handleFileUpload}
            className="file-input"
            disabled={isReadingFile || isAnalyzing}
          />

          <label htmlFor="scam-file-upload" className="upload-button">
            Choose File
          </label>
        </div>

        {fileStatus && <p className="file-status">{fileStatus}</p>}
        {fileError && <p className="file-error">{fileError}</p>}

        {uploadedFile && (
          <div className="uploaded-file">
            <div className="uploaded-file-info">
              <span>📎</span>
              <div>
                <strong>{uploadedFile.name}</strong>
                <small>{(uploadedFile.size / 1024).toFixed(1)} KB</small>
              </div>
            </div>

            <button
              type="button"
              onClick={removeUploadedFile}
              className="remove-file-button"
              disabled={isAnalyzing}
            >
              Remove
            </button>
          </div>
        )}

        <div className="button-row">
          <button
            type="button"
            className="analyze-button"
            onClick={analyzeMessage}
            disabled={!message.trim() || isReadingFile || isAnalyzing}
          >
            {isReadingFile
              ? 'Reading File...'
              : isAnalyzing
                ? 'Analyzing with AWS...'
                : '🔍 Analyze for Scams'}
          </button>

          <button
            type="button"
            className="secondary-button"
            onClick={loadExample}
            disabled={isAnalyzing}
          >
            Try Example
          </button>

          <button
            type="button"
            className="clear-button"
            onClick={clearMessage}
            disabled={isAnalyzing}
          >
            Clear
          </button>
        </div>
      </section>

      {score !== null && risk && (
        <section className="results">
          <div className="section-heading">
            <span>03</span>
            <h3>Analysis Results</h3>
          </div>

          <div className={`risk-card ${risk.className}`}>
            <div className="score-circle">
              <span className="score-number">{score}</span>
              <span className="score-total">/100</span>
            </div>

            <div className="risk-information">
              <div className="risk-label">{risk.text}</div>
              <p>
                {score >= 60
                  ? 'Multiple warning signs were detected.'
                  : score >= 30
                    ? 'Some suspicious patterns were detected.'
                    : 'Few common warning signs were detected.'}
              </p>
            </div>
          </div>

          <p className="disclaimer">
            This numerical score comes from local detection rules.
            It is not an AI-generated probability or a guarantee of safety.
          </p>

          <div className="findings-section">
            <h3>Warning Indicators</h3>

            {findings.length > 0 ? (
              findings.map((finding) => (
                <div className="finding" key={finding.title}>
                  <div className="finding-icon">!</div>
                  <div>
                    <strong>{finding.title}</strong>
                    <p>{finding.explanation}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-findings">
                No common warning patterns were detected.
                This does not guarantee that the content is safe.
              </div>
            )}
          </div>

          <div className="safety">
            <h3>Recommended Safety Actions</h3>

            <ul>
              <li>Do not click unfamiliar links.</li>
              <li>Never share passwords or verification codes.</li>
              <li>Verify the sender using an official website or phone number.</li>
              <li>Report suspicious messages when appropriate.</li>
            </ul>
          </div>
        </section>
      )}

      <section className="aws-section">
        <div className="aws-icon">✦</div>

        <div>
          <strong>AWS Strands AI Agent</strong>

          <p>
            {isAnalyzing
              ? 'Investigating with Amazon Bedrock...'
              : aiAnalysis
                ? 'AI investigation complete'
                : aiError
                  ? 'AI investigation unavailable'
                  : 'Ready for AI-powered analysis'}
          </p>

          {aiAnalysis && (
            <div style={{ marginTop: 12 }}>
              {formatAiAnalysis(aiAnalysis)}
            </div>
          )}

          {aiError && (
            <p className="file-error" style={{ marginTop: 12 }}>
              {aiError}. Make sure the local backend is running.
            </p>
          )}

          {message.length > MAX_AI_CHARACTERS && score !== null && (
            <p className="disclaimer">
              Only the first {MAX_AI_CHARACTERS.toLocaleString()} characters
              were sent to AI; local rules checked the full text.
            </p>
          )}
        </div>

        <span className="coming-soon">
          {isAnalyzing
            ? 'WORKING'
            : aiAnalysis
              ? 'COMPLETE'
              : aiError
                ? 'ERROR'
                : 'READY'}
        </span>
      </section>

      <footer className="footer">
        <span className="footer-brand">ScamShield AI</span>
        <span>Hack Midwest 2026</span>
      </footer>
    </div>
  )
}

export default App
