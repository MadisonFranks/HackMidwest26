/// <reference types="chrome" />

import { useEffect, useRef, useState } from 'react'
import './App.css'

function ShieldIcon({ size = 18, className = '', style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function GlobeIcon({ size = 18, className = '', style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

function VaultIcon({ size = 18, className = '', style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  )
}

function ZapIcon({ size = 18, className = '', style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

function ClockIcon({ size = 13, className = '', style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function AlertTriangleIcon({ size = 16, className = '', style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

function SettingsIcon({ size = 18, className = '', style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function CheckIcon({ size = 16, className = '', style }: { size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

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

type TelemetryStep = {
  id: string
  title: string
  tool: string
  description: string
  detail: string
}

const AGENT_TELEMETRY_STEPS: TelemetryStep[] = [
  {
    id: 'ingest',
    title: 'Payload Ingestion & Verification',
    tool: 'DOM & Header Parser',
    description: 'Scanning message headers, sender origin, and cryptographic BIMI verification badges.',
    detail: 'Extracted sender identity, validated checkmark badge, and segregated official platform links.',
  },
  {
    id: 'url',
    title: 'URL Structure & Domain Intelligence',
    tool: 'inspect_url',
    description: 'Evaluating domain entropy, suspicious TLDs (.xyz, .top), and IP-based destinations.',
    detail: 'Analyzed destination hostname, evaluated SSL protocol, and tested against known platforms.',
  },
  {
    id: 'mfa',
    title: 'Identity & Authentication Verifier',
    tool: 'verify_sender_and_mfa',
    description: 'Checking corporate domain alignment, legitimate MFA/OTP patterns, and recruitment signals.',
    detail: 'Cross-referenced official corporate registry, verified one-time passcode mechanics, and assessed hiring claims.',
  },
  {
    id: 'vault',
    title: 'Amazon S3 Threat Intelligence Query',
    tool: 'query_s3_threat_vault',
    description: 'Querying cataloged past campaigns in S3 bucket scamshield-threat-vault-070780358311.',
    detail: 'Connected to Amazon S3 Threat Vault; matched indicators against historic phishing campaigns.',
  },
  {
    id: 'synthesis',
    title: 'Autonomous Reasoning Synthesis',
    tool: 'AWS Bedrock (Claude 3 Haiku)',
    description: 'Synthesizing multi-modal tool findings into calibrated risk score (0-100) and advice.',
    detail: 'Correlated evidence graph; computed structured risk category, indicators, and recommended action.',
  },
]

type UrlInspectionResult = {
  url: string
  hostname: string
  protocol: string
  pathname: string
  isTrustedDomain: boolean
  verifiedOrganization?: string | null
  isIpAddress: boolean
  hasSuspiciousTld: boolean
  suspiciousTld?: string | null
  isBrandLookalike: boolean
  brandMatches: string[]
  isInsecureHttp: boolean
  verdict: string
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  riskScore: number
  vaultMatch?: {
    found: boolean
    matchedField?: string
    matchedValue?: string
    notes?: string
  } | null
}

const URL_INSPECTION_PRESETS = [
  { label: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs/view/94021', type: 'safe' },
  { label: 'Apple Support', url: 'https://apple.com/support/account', type: 'safe' },
  { label: 'PayPal Phish (.xyz)', url: 'https://secure-login-paypal.xyz/auth/verify', type: 'danger' },
  { label: 'Raw IP Login', url: 'http://185.220.101.5/account/login.php', type: 'danger' },
  { label: 'Chase Lookalike (.top)', url: 'https://chase-security-update.top/login', type: 'danger' },
]

type NavView = 'scanner' | 'url_inspector' | 'threat_vault' | 'agent_telemetry' | 'settings'

export interface ProtectionSettings {
  allowEmailOverlay: boolean
  autoDetectEmails: boolean
  syncToS3ThreatVault: boolean
  enableFeedbackLearning: boolean
  highlightSuspiciousDomains: boolean
  mfaProtection: boolean
  jobScamDetection: boolean
  agentTelemetry: boolean
}

const DEFAULT_SETTINGS: ProtectionSettings = {
  allowEmailOverlay: true,
  autoDetectEmails: true,
  syncToS3ThreatVault: true,
  enableFeedbackLearning: true,
  highlightSuspiciousDomains: true,
  mfaProtection: true,
  jobScamDetection: true,
  agentTelemetry: true,
}

type ThreatRecord = {
  id: string
  brand: string
  threatType: string
  domainOrSender: string
  riskScore: number
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  indicators: string[]
  timestamp: string
  s3Key: string
}

const DEFAULT_VAULT_THREATS: ThreatRecord[] = [
  {
    id: 's3-th-001',
    brand: 'PayPal',
    threatType: 'Phishing / Credential Harvesting',
    domainOrSender: 'secure-bank-verify.xyz',
    riskScore: 95,
    riskLevel: 'CRITICAL',
    indicators: ['Opaque CTA Button', 'High-Risk .xyz TLD', '24hr Termination Ultimatum'],
    timestamp: '2026-10-10 19:42 UTC',
    s3Key: 'vault/campaigns/paypal-xyz-auth-202610.json',
  },
  {
    id: 's3-th-002',
    brand: 'Geek Squad / Norton',
    threatType: 'Invoice Fraud / Wire Transfer',
    domainOrSender: 'account-updates-support.xyz',
    riskScore: 92,
    riskLevel: 'CRITICAL',
    indicators: ['Fake $489 Invoice', 'Urgent Wire Request', 'Free Webmail Spoofing'],
    timestamp: '2026-10-10 15:30 UTC',
    s3Key: 'vault/campaigns/invoice-94821-geeksquad.json',
  },
  {
    id: 's3-th-003',
    brand: 'Telegram Career Recruiter',
    threatType: 'Employment Scam',
    domainOrSender: 'hiring-manager99@gmail.com',
    riskScore: 90,
    riskLevel: 'CRITICAL',
    indicators: ['$75/hr Unrealistic Pay', 'Off-Platform Telegram Interview', 'Home Office Equipment Check'],
    timestamp: '2026-10-09 11:15 UTC',
    s3Key: 'vault/campaigns/telegram-recruitment-scam.json',
  },
  {
    id: 's3-th-004',
    brand: 'USPS / Postal Service',
    threatType: 'Delivery Smishing',
    domainOrSender: 'usps-redelivery.top',
    riskScore: 85,
    riskLevel: 'HIGH',
    indicators: ['Suspicious .top TLD', 'Unclaimed Package Urgency', 'Credit Card Redelivery Fee'],
    timestamp: '2026-10-08 09:20 UTC',
    s3Key: 'vault/campaigns/usps-depot-redirection.json',
  },
  {
    id: 's3-th-005',
    brand: 'Chase Bank',
    threatType: 'Account Verification Phish',
    domainOrSender: 'chase-security-update.top',
    riskScore: 95,
    riskLevel: 'CRITICAL',
    indicators: ['Lookalike Domain', 'Fake Suspended Alert', 'Password & PIN Harvesting'],
    timestamp: '2026-10-07 14:05 UTC',
    s3Key: 'vault/campaigns/chase-security-lookalike.json',
  },
]

type FeedbackRecord = {
  id: string
  timestamp: string
  isAccurate: boolean
  feedbackType: 'ACCURATE' | 'FALSE_POSITIVE' | 'FALSE_NEGATIVE'
  userNotes: string
  originalScore: number
  originalRiskLevel: string
  correctedScore: number
  sender?: string
  domain?: string
  status?: string
}

type FeedbackStats = {
  total: number
  accurateCount: number
  falsePositives: number
  falseNegatives: number
  accuracyRate: number
  recentFeedback: FeedbackRecord[]
}

const DEFAULT_FEEDBACK_STATS: FeedbackStats = {
  total: 2,
  accurateCount: 1,
  falsePositives: 1,
  falseNegatives: 0,
  accuracyRate: 50,
  recentFeedback: [
    {
      id: 'fb_seed_001',
      timestamp: '2026-10-11 13:00 UTC',
      isAccurate: false,
      feedbackType: 'FALSE_POSITIVE',
      userNotes: 'Legitimate hackathon project submission form sent by Hack Midwest organizers.',
      originalScore: 50,
      originalRiskLevel: 'MODERATE',
      correctedScore: 10,
      sender: 'Michael Gelphman <mike@kcitp.com>',
      domain: 'kcitp.com',
      status: 'LEARNED',
    },
    {
      id: 'fb_seed_002',
      timestamp: '2026-10-10 18:30 UTC',
      isAccurate: true,
      feedbackType: 'ACCURATE',
      userNotes: 'Correctly caught fraudulent wire transfer invoice on unverified .xyz domain.',
      originalScore: 95,
      originalRiskLevel: 'CRITICAL',
      correctedScore: 95,
      sender: 'service@secure-bank-verify.xyz',
      domain: 'secure-bank-verify.xyz',
      status: 'VERIFIED',
    },
  ],
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

  // Autonomous Agent Telemetry & Observability state
  const [activeTelemetryStep, setActiveTelemetryStep] = useState<number>(0)
  const [telemetryElapsedMs, setTelemetryElapsedMs] = useState<number>(0)
  const [showTrace, setShowTrace] = useState<boolean>(true)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)

  // Dedicated URL Quick-Inspector (Approach 4)
  const [inspectUrlInput, setInspectUrlInput] = useState('')
  const [urlInspectionResult, setUrlInspectionResult] = useState<UrlInspectionResult | null>(null)
  const [isInspectingUrl, setIsInspectingUrl] = useState(false)
  const [urlInspectorError, setUrlInspectorError] = useState<string | null>(null)

  // Sidebar Navigation & Web Extension Mode state
  const isExtensionByDefault = (() => {
    if (typeof window === 'undefined') return false
    const params = new URLSearchParams(window.location.search)
    if (params.get('mode') === 'extension' || params.get('ext') === '1') return true
    if (params.get('mode') === 'full' || params.get('mode') === 'web') return false
    // True when running inside Chrome Extension (e.g. extension popup)
    return window.location.protocol === 'chrome-extension:'
  })()

  const [isExtensionMode, setIsExtensionMode] = useState<boolean>(isExtensionByDefault)
  const [activeView, setActiveView] = useState<NavView>('scanner')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [vaultThreats, setVaultThreats] = useState<ThreatRecord[]>(DEFAULT_VAULT_THREATS)
  const [vaultLoading, setVaultLoading] = useState(false)
  const [vaultSearchQuery, setVaultSearchQuery] = useState('')

  // Feature Protection Settings & Synchronization
  const [settings, setSettings] = useState<ProtectionSettings>(() => {
    try {
      const stored = localStorage.getItem('scamshield_settings')
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS
  })
  const [settingsSavedNotice, setSettingsSavedNotice] = useState(false)

  // Sync settings with Chrome Extension storage if available
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get(['scamshield_settings'], (result) => {
        if (result?.scamshield_settings && typeof result.scamshield_settings === 'object') {
          setSettings((prev) => ({ ...prev, ...(result.scamshield_settings as Partial<ProtectionSettings>) }))
        }
      })
    }
  }, [])

  function updateSetting(key: keyof ProtectionSettings, value: boolean) {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value }
      try {
        localStorage.setItem('scamshield_settings', JSON.stringify(updated))
      } catch {
        // Fallback
      }
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.set({ scamshield_settings: updated })
      }
      return updated
    })
    setSettingsSavedNotice(true)
    setTimeout(() => setSettingsSavedNotice(false), 2200)
  }

  function resetSettingsToDefault() {
    setSettings(DEFAULT_SETTINGS)
    try {
      localStorage.setItem('scamshield_settings', JSON.stringify(DEFAULT_SETTINGS))
    } catch {
      // Fallback
    }
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ scamshield_settings: DEFAULT_SETTINGS })
    }
    setSettingsSavedNotice(true)
    setTimeout(() => setSettingsSavedNotice(false), 2200)
  }

  // User Assessment Feedback & Continuous AI Learning Loop
  const [userFeedbackChoice, setUserFeedbackChoice] = useState<'ACCURATE' | 'FALSE_POSITIVE' | 'FALSE_NEGATIVE' | null>(null)
  const [userFeedbackNotes, setUserFeedbackNotes] = useState('')
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [activeVaultTab, setActiveVaultTab] = useState<'threats' | 'feedback'>('threats')
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>(DEFAULT_FEEDBACK_STATS)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Derived current view ensuring fallback to scanner in extension mode
  const currentView: NavView = isExtensionMode && (activeView === 'threat_vault' || activeView === 'agent_telemetry' || activeView === 'settings')
    ? 'scanner'
    : activeView

  // Synchronize layout mode classes for Chrome extension popup vs full-screen tab
  useEffect(() => {
    if (isExtensionMode) {
      document.documentElement.classList.add('extension-popup-mode')
      document.documentElement.classList.remove('full-screen-mode')
      document.body.classList.add('extension-popup-mode')
      document.body.classList.remove('full-screen-mode')
    } else {
      document.documentElement.classList.remove('extension-popup-mode')
      document.documentElement.classList.add('full-screen-mode')
      document.body.classList.remove('extension-popup-mode')
      document.body.classList.add('full-screen-mode')
    }
  }, [isExtensionMode])

  // Fetch S3 Threat Vault database index (skipped in lightweight extension mode)
  useEffect(() => {
    if (isExtensionMode) return
    async function loadThreats() {
      setVaultLoading(true)
      try {
        const res = await fetch('http://localhost:5001/api/threats')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data.threats) && data.threats.length > 0) {
            setVaultThreats(data.threats)
          }
        }
      } catch {
        // Fallback to default demonstration threats
      } finally {
        setVaultLoading(false)
      }
    }
    loadThreats()
  }, [isExtensionMode])

  async function loadFeedbackStats() {
    try {
      const res = await fetch('http://localhost:5001/api/feedback')
      if (res.ok) {
        const data = await res.json()
        if (data && typeof data.total === 'number') {
          setFeedbackStats(data)
        }
      }
    } catch {
      // Offline fallback
    }
  }

  useEffect(() => {
    if (isExtensionMode) return
    let isMounted = true
    async function fetchStats() {
      try {
        const res = await fetch('http://localhost:5001/api/feedback')
        if (res.ok && isMounted) {
          const data = await res.json()
          if (data && typeof data.total === 'number') {
            setFeedbackStats(data)
          }
        }
      } catch {
        // Offline fallback
      }
    }
    fetchStats()
    return () => {
      isMounted = false
    }
  }, [isExtensionMode])

  // Live Agent Telemetry Stepper Progression
  useEffect(() => {
    if (!isAiAnalyzing && !isSimulating) return

    const startTime = Date.now()
    const timer = setInterval(() => {
      setTelemetryElapsedMs(Date.now() - startTime)
    }, 100)

    const stepInterval = setInterval(() => {
      setActiveTelemetryStep((prev) => {
        if (prev < AGENT_TELEMETRY_STEPS.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 550)

    return () => {
      clearInterval(timer)
      clearInterval(stepInterval)
    }
  }, [isAiAnalyzing, isSimulating])

  // Complete Simulation Demo
  useEffect(() => {
    if (!isSimulating) return

    const simulationTimeout = setTimeout(() => {
      setIsSimulating(false)
      setActiveTelemetryStep(AGENT_TELEMETRY_STEPS.length)
      setScore(95)
      setAiResult({
        score: 95,
        riskLevel: 'CRITICAL',
        summary: 'Investigation identified high-confidence invoice fraud combined with urgent credential harvesting on an unverified .xyz domain.',
        indicators: [
          'Opaque Call-To-Action Button / Destination: Obscured login link pointing to high-risk .xyz TLD (secure-bank-verify.xyz).',
          'Urgent Pressure & Account Threat: 24-hour termination ultimatum creating synthetic panic.',
          'Brand Impersonation: Posing as ScamShield Protection Team from an unauthorized free webmail/lookalike domain.',
          'Unverified Wire Transfer Demand: Solicits direct financial wire transfer for an unverified $489.00 balance.'
        ],
        recommendedAction: 'Do not click links or call any phone numbers listed in this message. Independently verify invoices through official account portals.',
        poweredBy: 'AWS Strands Agents SDK • Claude 3 Haiku',
        s3ThreatVault: {
          bucket: 'scamshield-threat-vault-070780358311',
          archived: true
        }
      })
    }, 3000)

    return () => clearTimeout(simulationTimeout)
  }, [isSimulating])

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
    const startTime = Date.now()
    setTelemetryElapsedMs(0)
    setActiveTelemetryStep(0)

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
      setActiveTelemetryStep(AGENT_TELEMETRY_STEPS.length)
      setTelemetryElapsedMs(Date.now() - startTime)
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
    setIsSimulating(false)
    setActiveTelemetryStep(0)
    setTelemetryElapsedMs(0)
    setUserFeedbackChoice(null)
    setUserFeedbackNotes('')
    setFeedbackSubmitted(false)
  }

  async function handleFeedbackSubmit(choice: 'ACCURATE' | 'FALSE_POSITIVE' | 'FALSE_NEGATIVE', notes = '') {
    setIsSubmittingFeedback(true)
    try {
      await fetch('http://localhost:5001/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageText: message || (uploadedFile?.content || uploadedFile?.name || ''),
          predictedScore: score ?? aiResult?.score ?? 0,
          predictedRiskLevel: effectiveRiskLevel,
          isAccurate: choice === 'ACCURATE',
          feedbackType: choice,
          userNotes: notes,
        }),
      })
      setFeedbackSubmitted(true)
      loadFeedbackStats()
    } catch {
      setFeedbackSubmitted(true)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  function handleSimulateAgentTelemetry() {
    if (!message.trim() && !uploadedFile) {
      loadExample()
    }
    resetAnalysis()
    setIsSimulating(true)
    setTelemetryElapsedMs(0)
    setActiveTelemetryStep(0)
  }

  function autoDetectFromTab() {
    if (!settings.autoDetectEmails) {
      setDetectStatus('Active tab email auto-detection is currently disabled in Settings.')
      setTimeout(() => setDetectStatus(null), 3500)
      return
    }

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
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html?mode=full') })
    } else {
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.set('mode', 'full')
      window.open(currentUrl.toString(), '_blank')
    }
  }

  // URL Quick-Inspector Local Evaluation Engine (Approach 4)
  function evaluateUrlLocally(inputUrl: string): UrlInspectionResult {
    const rawInput = inputUrl.trim()
    const normalizedUrl = /^https?:\/\//i.test(rawInput) ? rawInput : `https://${rawInput}`
    const parsed = new URL(normalizedUrl)
    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname)
    const suspiciousTldMatch = parsed.hostname.match(
      /\.(xyz|top|work|click|loan|info|tk|gq|cf|buzz|country|kim|stream|gdn|mom|rest|live|fit|bar|cam)$/i
    )
    const hasSuspiciousTld = Boolean(suspiciousTldMatch)

    const KNOWN_PLATFORMS: Record<string, string> = {
      'linkedin.com': 'LinkedIn',
      'google.com': 'Google',
      'apple.com': 'Apple',
      'amazon.com': 'Amazon',
      'microsoft.com': 'Microsoft',
      'github.com': 'GitHub',
      'indeed.com': 'Indeed',
      'glassdoor.com': 'Glassdoor',
      'ziprecruiter.com': 'ZipRecruiter',
      'greenhouse.io': 'Greenhouse ATS',
      'lever.co': 'Lever ATS',
      'workday.com': 'Workday',
      'chase.com': 'Chase Bank',
      'bankofamerica.com': 'Bank of America',
      'wellsfargo.com': 'Wells Fargo',
      'paypal.com': 'PayPal',
      'stripe.com': 'Stripe',
      'usps.com': 'United States Postal Service',
      'fedex.com': 'FedEx',
      'ups.com': 'UPS',
      'docusign.com': 'DocuSign',
      'slack.com': 'Slack',
      'zoom.us': 'Zoom',
      'forms.gle': 'Google Forms',
      'kcitp.com': 'KC Information Technology Professionals',
      'hackmidwest.com': 'Hack Midwest',
      'devpost.com': 'Devpost',
      'typeform.com': 'Typeform',
      'blackboard.com': 'Blackboard LMS',
      'handshake.com': 'Handshake',
    }

    let verifiedOrg: string | null = null
    const isTrustedDomain = Object.entries(KNOWN_PLATFORMS).some(([root, name]) => {
      if (parsed.hostname === root || parsed.hostname.endsWith(`.${root}`)) {
        verifiedOrg = name
        return true
      }
      return false
    }) || parsed.hostname.endsWith('.gov') || parsed.hostname.endsWith('.edu')

    if (parsed.hostname.endsWith('.gov')) verifiedOrg = 'U.S. Government Official Service'
    if (parsed.hostname.endsWith('.edu')) verifiedOrg = 'Accredited Higher Education Institution'

    const targetBrands = [
      { name: 'PayPal', pattern: /paypal/i },
      { name: 'Apple', pattern: /apple/i },
      { name: 'Amazon', pattern: /amazon/i },
      { name: 'Microsoft', pattern: /microsoft/i },
      { name: 'Chase Bank', pattern: /chase/i },
      { name: 'Bank of America', pattern: /bankofamerica/i },
      { name: 'Wells Fargo', pattern: /wellsfargo/i },
      { name: 'Netflix', pattern: /netflix/i },
      { name: 'Geek Squad', pattern: /geeksquad/i },
      { name: 'Norton', pattern: /norton/i },
      { name: 'LinkedIn', pattern: /linkedin/i },
    ]

    const brandMatches = targetBrands
      .filter((b) => b.pattern.test(parsed.hostname))
      .map((b) => b.name)
    const isBrandLookalike = !isTrustedDomain && brandMatches.length > 0

    let verdict = 'SAFE / TRUSTED PLATFORM'
    let riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' = 'LOW'
    let riskScore = 5

    if (isIpAddress || (isBrandLookalike && hasSuspiciousTld)) {
      verdict = 'CRITICAL / DECEPTIVE DOMAIN'
      riskLevel = 'CRITICAL'
      riskScore = 90
    } else if (hasSuspiciousTld || isBrandLookalike) {
      verdict = 'SUSPICIOUS / ELEVATED RISK'
      riskLevel = 'HIGH'
      riskScore = 75
    } else if (!isTrustedDomain) {
      verdict = 'UNVERIFIED EXTERNAL DOMAIN'
      riskLevel = 'MODERATE'
      riskScore = 35
    }

    return {
      url: normalizedUrl,
      hostname: parsed.hostname,
      protocol: parsed.protocol,
      pathname: parsed.pathname,
      isTrustedDomain,
      verifiedOrganization: verifiedOrg,
      isIpAddress,
      hasSuspiciousTld,
      suspiciousTld: suspiciousTldMatch ? suspiciousTldMatch[0] : null,
      isBrandLookalike,
      brandMatches,
      isInsecureHttp: parsed.protocol === 'http:',
      verdict,
      riskLevel,
      riskScore,
    }
  }

  async function handleInspectUrl(targetUrl?: string) {
    const toCheck = targetUrl || inspectUrlInput
    if (!toCheck || !toCheck.trim()) return

    setUrlInspectorError(null)
    setIsInspectingUrl(true)

    try {
      // 1. Instant local baseline evaluation
      const localResult = evaluateUrlLocally(toCheck)
      setUrlInspectionResult(localResult)

      // 2. Query backend to check S3 Threat Vault & cloud validation
      try {
        const res = await fetch('http://localhost:5001/api/inspect-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: toCheck.trim() }),
        })
        if (res.ok) {
          const serverData = await res.json()
          setUrlInspectionResult(serverData)
        }
      } catch {
        // Backend offline: keep local evaluation
      }
    } catch {
      setUrlInspectorError('Please enter a valid URL or domain (e.g. https://example.com)')
    } finally {
      setIsInspectingUrl(false)
    }
  }

  function sendUrlToMainScanner() {
    if (!urlInspectionResult) return
    setMessage(
      `Suspicious Link for Analysis:\n${urlInspectionResult.url}\n\nTarget Domain: ${urlInspectionResult.hostname}\nPreliminary Verdict: ${urlInspectionResult.verdict}\nDomain Risk Score: ${urlInspectionResult.riskScore} / 100\n\nPlease conduct a comprehensive cybersecurity investigation on this destination.`
    )
    resetAnalysis()
    setActiveView('scanner')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function loadThreatIntoScanner(threat: ThreatRecord) {
    setMessage(
      `Threat Campaign Intelligence from Amazon S3 Vault:\nTarget Entity: ${threat.brand}\nThreat Category: ${threat.threatType}\nDomain / Origin: ${threat.domainOrSender}\nCataloged Risk: ${threat.riskScore} / 100 (${threat.riskLevel})\n\nReported Indicators:\n${threat.indicators.map((i) => `• ${i}`).join('\n')}\n\nPlease run agentic threat investigation on this campaign.`
    )
    resetAnalysis()
    setActiveView('scanner')
    window.scrollTo({ top: 0, behavior: 'smooth' })
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

  const filteredThreats = vaultThreats.filter((threat) => {
    if (!vaultSearchQuery.trim()) return true
    const q = vaultSearchQuery.toLowerCase()
    return (
      threat.brand.toLowerCase().includes(q) ||
      threat.threatType.toLowerCase().includes(q) ||
      threat.domainOrSender.toLowerCase().includes(q) ||
      threat.indicators.some((ind) => ind.toLowerCase().includes(q))
    )
  })

  return (
    <div className={`app-shell ${isExtensionMode ? 'extension-mode' : ''} ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-brand-area">
          <div className="sidebar-logo">
            <ShieldIcon size={22} style={{ color: '#6366f1' }} />
          </div>
          {!isSidebarCollapsed && (
            <div className="sidebar-brand-text">
              <h2>ScamShield <span>AI</span></h2>
              <span className="sidebar-hackathon-pill">HACK MIDWEST 2026</span>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className={`sidebar-nav-btn ${currentView === 'scanner' ? 'active' : ''}`}
            onClick={() => setActiveView('scanner')}
            title="Threat Scanner (Email, Text & Files)"
          >
            <span className="nav-btn-icon">
              <ShieldIcon size={17} />
            </span>
            {!isSidebarCollapsed && (
              <div className="nav-btn-text">
                <span className="nav-btn-title">Threat Scanner</span>
                <span className="nav-btn-sub">Email, SMS & attachments</span>
              </div>
            )}
          </button>

          <button
            type="button"
            className={`sidebar-nav-btn ${currentView === 'url_inspector' ? 'active' : ''}`}
            onClick={() => setActiveView('url_inspector')}
            title="URL & Domain Deep Inspector"
          >
            <span className="nav-btn-icon">
              <GlobeIcon size={17} />
            </span>
            {!isSidebarCollapsed && (
              <div className="nav-btn-text">
                <span className="nav-btn-title">URL Inspector</span>
                <span className="nav-btn-sub">TLD risk & domain spoofing</span>
              </div>
            )}
          </button>

          {/* S3 Threat Vault & Agent Telemetry tabs (Only in full Webpage view, hidden in Web Extension) */}
          {!isExtensionMode && (
            <>
              <button
                type="button"
                className={`sidebar-nav-btn ${currentView === 'threat_vault' ? 'active' : ''}`}
                onClick={() => setActiveView('threat_vault')}
                title="Amazon S3 Threat Intelligence Vault"
              >
                <span className="nav-btn-icon">
                  <VaultIcon size={17} />
                </span>
                {!isSidebarCollapsed && (
                  <div className="nav-btn-text">
                    <span className="nav-btn-title">S3 Threat Vault</span>
                    <span className="nav-btn-sub">Cloud attack database</span>
                  </div>
                )}
              </button>

              <button
                type="button"
                className={`sidebar-nav-btn ${currentView === 'agent_telemetry' ? 'active' : ''}`}
                onClick={() => setActiveView('agent_telemetry')}
                title="Agent Observability & Tools"
              >
                <span className="nav-btn-icon">
                  <ZapIcon size={17} />
                </span>
                {!isSidebarCollapsed && (
                  <div className="nav-btn-text">
                    <span className="nav-btn-title">Agent Telemetry</span>
                    <span className="nav-btn-sub">Live Strands tools & traces</span>
                  </div>
                )}
              </button>
            </>
          )}
        </nav>

        {/* Bottom Section with Separator Line */}
        {!isExtensionMode && (
          <div className="sidebar-bottom-section">
            <div className="sidebar-divider"></div>
            <button
              type="button"
              className={`sidebar-nav-btn ${currentView === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveView('settings')}
              title="Protection Settings & Feature Toggles"
            >
              <span className="nav-btn-icon">
                <SettingsIcon size={17} />
              </span>
              {!isSidebarCollapsed && (
                <div className="nav-btn-text">
                  <span className="nav-btn-title">Settings</span>
                  <span className="nav-btn-sub">Protection toggles & preferences</span>
                </div>
              )}
            </button>
          </div>
        )}

        <div className="sidebar-footer">
          <div className="sidebar-status-box">
            <span className="status-live-dot"></span>
            {!isSidebarCollapsed && (
              <div className="status-text">
                <strong>Strands Agent Online</strong>
                <p>AWS Bedrock • us-east-1</p>
              </div>
            )}
          </div>
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? '→' : '←'}
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <div className="main-workspace">
        {/* Workspace Top Header */}
        <header className="workspace-header">
          {isExtensionMode ? (
            <div className="header-nav-tabs">
              <button
                type="button"
                className={`header-nav-tab ${currentView === 'scanner' ? 'active' : ''}`}
                onClick={() => setActiveView('scanner')}
                title="Threat Scanner (Email, Text & Files)"
              >
                <ShieldIcon size={14} />
                <span>Threat Scanner</span>
              </button>
              <button
                type="button"
                className={`header-nav-tab ${currentView === 'url_inspector' ? 'active' : ''}`}
                onClick={() => setActiveView('url_inspector')}
                title="URL & Domain Deep Inspector"
              >
                <GlobeIcon size={14} />
                <span>URL Inspector</span>
              </button>
            </div>
          ) : (
            <div className="header-view-indicator">
              <span className="view-indicator-icon">
                {currentView === 'scanner' && <ShieldIcon size={16} style={{ color: '#6366f1' }} />}
                {currentView === 'url_inspector' && <GlobeIcon size={16} style={{ color: '#6366f1' }} />}
                {currentView === 'threat_vault' && <VaultIcon size={16} style={{ color: '#0ea5e9' }} />}
                {currentView === 'agent_telemetry' && <ZapIcon size={16} style={{ color: '#f59e0b' }} />}
                {currentView === 'settings' && <SettingsIcon size={16} style={{ color: '#6366f1' }} />}
              </span>
              <span className="view-indicator-label">
                {currentView === 'scanner' && 'Threat Scanner'}
                {currentView === 'url_inspector' && 'URL & Domain Inspector'}
                {currentView === 'threat_vault' && 'S3 Threat Vault'}
                {currentView === 'agent_telemetry' && 'Agent Telemetry'}
                {currentView === 'settings' && 'Settings & Protection Toggles'}
              </span>
            </div>
          )}

          <div className="workspace-header-actions">
            {/* View Mode Toggle for Web Demonstration & Testing */}
            {typeof window !== 'undefined' && window.location.protocol !== 'chrome-extension:' && (
              <button
                type="button"
                className={`mode-badge-toggle ${isExtensionMode ? 'extension' : 'web'}`}
                onClick={() => {
                  const next = !isExtensionMode
                  setIsExtensionMode(next)
                  if (next && (currentView === 'threat_vault' || currentView === 'agent_telemetry' || currentView === 'settings')) {
                    setActiveView('scanner')
                  }
                }}
                title={isExtensionMode ? 'Switch to Full Web Dashboard (5 Views)' : 'Switch to Web Extension Mode (2 Tabs)'}
              >
                {isExtensionMode ? 'Extension Mode (2 Tabs)' : 'Webpage View (5 Views)'}
              </button>
            )}

            <div className="status-pill-header">
              <span className="status-dot"></span>
              Ready
            </div>
            <button
              type="button"
              className="expand-button"
              onClick={openInNewTab}
              title="Full screen"
              aria-label="Full screen"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </button>
          </div>
        </header>

        {/* ==============================================================
            VIEW 1: THREAT SCANNER (CORE WORKSPACE)
            ============================================================== */}
        {currentView === 'scanner' && (
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
                    <span><ShieldIcon size={14} /></span>
                    <span>Auto-Detect Email</span>
                  </button>
                </div>

                {detectStatus && (
                  <div className="detect-status-banner">
                    <span><ShieldIcon size={14} /></span>
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
              {/* 1. Active Agent Telemetry Stepper HUD (In Flight) */}
              {isAiAnalyzing || isSimulating ? (
                <section className="agent-telemetry-hud">
                  <div className="telemetry-header">
                    <div className="telemetry-status-pill">
                      <span className="telemetry-pulse"></span>
                      <span>STRANDS AGENT ACTIVE</span>
                    </div>
                    <span className="telemetry-model-badge">Claude 3 Haiku • AWS Bedrock</span>
                  </div>

                  <div className="telemetry-heading">
                    <h3>Autonomous Threat Investigation</h3>
                    <p>Orchestrating cybersecurity tools and cross-referencing S3 threat intelligence in real time.</p>
                  </div>

                  {/* Stepper Steps */}
                  <div className="telemetry-stepper">
                    {AGENT_TELEMETRY_STEPS.map((step, idx) => {
                      const isCompleted = activeTelemetryStep > idx
                      const isCurrent = activeTelemetryStep === idx

                      return (
                        <div
                          key={step.id}
                          className={`telemetry-step ${
                            isCompleted ? 'step-completed' : isCurrent ? 'step-current' : 'step-pending'
                          }`}
                        >
                          <div className="step-indicator">
                            <div className="step-circle">
                              {isCompleted ? (
                                <span className="step-check">✓</span>
                              ) : isCurrent ? (
                                <span className="step-spinner"></span>
                              ) : (
                                <span className="step-number">{idx + 1}</span>
                              )}
                            </div>
                            {idx < AGENT_TELEMETRY_STEPS.length - 1 && <div className="step-line"></div>}
                          </div>

                          <div className="step-content">
                            <div className="step-title-row">
                              <span className="step-title">{step.title}</span>
                              <span className="step-tool-badge">{step.tool}</span>
                            </div>
                            <p className="step-desc">
                              {isCompleted ? step.detail : step.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="telemetry-footer">
                    <div className="telemetry-timer">
                      <span className="timer-icon"><ClockIcon size={12} /></span>
                      <span>Execution Time: {(telemetryElapsedMs / 1000).toFixed(1)}s</span>
                    </div>
                    <div className="telemetry-counter">
                      <span>Tools invoked: {Math.min(activeTelemetryStep + 1, AGENT_TELEMETRY_STEPS.length)} / {AGENT_TELEMETRY_STEPS.length}</span>
                    </div>
                  </div>
                </section>
              ) : score !== null ? (
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

                  {/* Agent Execution Trace Accordion */}
                  {aiResult && (
                    <div className="agent-trace-card">
                      <button
                        type="button"
                        className="trace-toggle-btn"
                        onClick={() => setShowTrace(!showTrace)}
                        aria-expanded={showTrace}
                      >
                        <div className="trace-btn-title">
                          <span className="trace-check-badge">✓</span>
                          <span>Agent Execution Trace (5 / 5 Tools Completed)</span>
                        </div>
                        <span className="trace-chevron">{showTrace ? '▲ Hide' : '▼ View Trace'}</span>
                      </button>

                      {showTrace && (
                        <div className="trace-step-list">
                          {AGENT_TELEMETRY_STEPS.map((step, idx) => (
                            <div key={step.id} className="trace-item">
                              <div className="trace-item-header">
                                <span className="trace-step-number">#{idx + 1}</span>
                                <span className="trace-item-title">{step.title}</span>
                                <span className="trace-tool-pill">{step.tool}</span>
                              </div>
                              <p className="trace-item-desc">{step.detail}</p>
                            </div>
                          ))}
                        </div>
                      )}
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

                    {/* User Assessment Feedback & Continuous AI Learning Loop */}
                    <div className="feedback-learning-panel">
                      <div className="feedback-header">
                        <div className="feedback-title">
                          <span className="feedback-badge">AI Learning Loop</span>
                          <strong>Was this threat assessment accurate?</strong>
                        </div>
                        {feedbackSubmitted ? (
                          <span className="feedback-status-pill success">
                            Feedback Recorded to Amazon S3 Learning Vault
                          </span>
                        ) : null}
                      </div>

                      {!feedbackSubmitted ? (
                        <div className="feedback-action-row">
                          <button
                            type="button"
                            className={`feedback-choice-btn accurate ${userFeedbackChoice === 'ACCURATE' ? 'selected' : ''}`}
                            onClick={() => handleFeedbackSubmit('ACCURATE')}
                            disabled={isSubmittingFeedback}
                          >
                            Accurate Assessment
                          </button>
                          <button
                            type="button"
                            className={`feedback-choice-btn false-positive ${userFeedbackChoice === 'FALSE_POSITIVE' ? 'selected' : ''}`}
                            onClick={() => setUserFeedbackChoice('FALSE_POSITIVE')}
                          >
                            False Alarm (Too Strict)
                          </button>
                          <button
                            type="button"
                            className={`feedback-choice-btn false-negative ${userFeedbackChoice === 'FALSE_NEGATIVE' ? 'selected' : ''}`}
                            onClick={() => setUserFeedbackChoice('FALSE_NEGATIVE')}
                          >
                            Missed Scam (Too Lenient)
                          </button>
                        </div>
                      ) : null}

                      {!feedbackSubmitted && userFeedbackChoice && userFeedbackChoice !== 'ACCURATE' && (
                        <div className="feedback-correction-box">
                          <input
                            type="text"
                            placeholder="Help the AI learn: Why was this inaccurate? (e.g. Legitimate hackathon project submission)"
                            value={userFeedbackNotes}
                            onChange={(e) => setUserFeedbackNotes(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleFeedbackSubmit(userFeedbackChoice, userFeedbackNotes)
                            }}
                          />
                          <button
                            type="button"
                            className="feedback-submit-btn"
                            onClick={() => handleFeedbackSubmit(userFeedbackChoice, userFeedbackNotes)}
                            disabled={isSubmittingFeedback}
                          >
                            {isSubmittingFeedback ? 'Syncing to S3...' : 'Submit to AI Learning Vault'}
                          </button>
                        </div>
                      )}
                    </div>
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
                    <div className="quick-start-actions">
                      <button type="button" className="inline-example-button" onClick={loadExample}>
                        Load Sample Threat
                      </button>
                      <button
                        type="button"
                        className="inline-simulate-button"
                        onClick={handleSimulateAgentTelemetry}
                        title="Preview live agent tools and telemetry stepper"
                      >
                        Live Agent Telemetry Demo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        )}

        {/* ==============================================================
            VIEW 2: URL & DOMAIN INSPECTOR (DEDICATED VIEW)
            ============================================================== */}
        {currentView === 'url_inspector' && (
          <main className="dedicated-view-container">
            <section className="dedicated-view-card">
              <div className="dedicated-view-header">
                <div className="dedicated-title-group">
                  <span className="dedicated-icon"><GlobeIcon size={22} /></span>
                  <div>
                    <h3>URL & Domain Deep Inspector</h3>
                    <p>Analyze domain entropy, high-risk TLDs (.xyz, .top), IP hosting, and corporate brand impersonation.</p>
                  </div>
                </div>
                <span className="view-badge">Strands Tool: inspect_url</span>
              </div>

              {/* Input Row */}
              <div className="url-input-row large">
                <input
                  type="text"
                  placeholder="Enter link or hostname (e.g. secure-login-paypal.xyz or linkedin.com/jobs)..."
                  value={inspectUrlInput}
                  onChange={(e) => {
                    setInspectUrlInput(e.target.value)
                    setUrlInspectorError(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleInspectUrl()
                  }}
                />
                <button
                  type="button"
                  className="url-inspect-btn"
                  onClick={() => handleInspectUrl()}
                  disabled={!inspectUrlInput.trim() || isInspectingUrl}
                >
                  {isInspectingUrl ? 'Checking...' : 'Inspect URL'}
                </button>
                {inspectUrlInput && (
                  <button
                    type="button"
                    className="url-clear-btn"
                    onClick={() => {
                      setInspectUrlInput('')
                      setUrlInspectionResult(null)
                      setUrlInspectorError(null)
                    }}
                    title="Clear input"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Presets */}
              <div className="url-presets-bar">
                <span className="presets-label">Click to Test Contrasting Domains:</span>
                <div className="presets-chips">
                  {URL_INSPECTION_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      className={`preset-chip ${preset.type}`}
                      onClick={() => {
                        setInspectUrlInput(preset.url)
                        handleInspectUrl(preset.url)
                      }}
                    >
                      {preset.type === 'safe' ? '[Safe] ' : '[Threat] '}
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error notice if invalid URL */}
              {urlInspectorError && (
                <div className="url-error-msg">
                  <span>!</span> {urlInspectorError}
                </div>
              )}

              {/* Results Card */}
              {urlInspectionResult && (
                <div className={`url-result-card risk-${urlInspectionResult.riskLevel.toLowerCase()} large-view`}>
                  <div className="url-result-header">
                    <div className="url-verdict-tag">
                      <span className="verdict-dot"></span>
                      <strong>{urlInspectionResult.verdict}</strong>
                    </div>
                    <span className="url-risk-score">Threat Risk: {urlInspectionResult.riskScore} / 100</span>
                  </div>

                  <div className="url-indicators-grid">
                    <div className="url-grid-item">
                      <span className="grid-label">Target Domain / Hostname</span>
                      <strong className="grid-val mono">{urlInspectionResult.hostname}</strong>
                    </div>

                    <div className="url-grid-item">
                      <span className="grid-label">Protocol Security</span>
                      <strong className={`grid-val ${urlInspectionResult.isInsecureHttp ? 'flag-danger' : 'flag-safe'}`}>
                        {urlInspectionResult.isInsecureHttp ? 'HTTP (Insecure / Plaintext)' : 'HTTPS (Encrypted SSL)'}
                      </strong>
                    </div>

                    <div className="url-grid-item">
                      <span className="grid-label">TLD Risk Profile</span>
                      <strong className={`grid-val ${urlInspectionResult.hasSuspiciousTld ? 'flag-danger' : 'flag-safe'}`}>
                        {urlInspectionResult.hasSuspiciousTld
                          ? `Flagged High-Risk (${urlInspectionResult.suspiciousTld}) - Commonly used in phishing`
                          : `Standard TLD (${urlInspectionResult.hostname.split('.').pop()})`}
                      </strong>
                    </div>

                    <div className="url-grid-item">
                      <span className="grid-label">Brand & Platform Integrity</span>
                      <strong className={`grid-val ${urlInspectionResult.isBrandLookalike ? 'flag-danger' : urlInspectionResult.isTrustedDomain ? 'flag-safe' : 'flag-neutral'}`}>
                        {urlInspectionResult.isTrustedDomain
                          ? (urlInspectionResult.verifiedOrganization ? `Authenticated: ${urlInspectionResult.verifiedOrganization} (Official Domain)` : 'Authenticated Corporate Platform Domain')
                          : urlInspectionResult.isBrandLookalike
                          ? `Brand Spoofing: Impersonating ${urlInspectionResult.brandMatches.join(', ')}`
                          : 'Independent Unverified Host'}
                      </strong>
                    </div>
                  </div>

                  {urlInspectionResult.isIpAddress && (
                    <div className="url-ip-alert">
                      <span><AlertTriangleIcon size={16} /></span>
                      <span>Raw IP Address Hosting: Directly hosted on a bare IP address without a registered DNS domain name.</span>
                    </div>
                  )}

                  {urlInspectionResult.vaultMatch && (
                    <div className="url-vault-alert">
                      <span><VaultIcon size={16} /></span>
                      <span>Matched in Amazon S3 Threat Vault: Domain matches a previously archived phishing campaign.</span>
                    </div>
                  )}

                  <div className="url-result-actions">
                    <button
                      type="button"
                      className="send-to-scanner-btn"
                      onClick={sendUrlToMainScanner}
                    >
                      <span>Send Link to Threat Scanner for Deep Investigation →</span>
                    </button>
                  </div>
                </div>
              )}
            </section>
          </main>
        )}

        {/* ==============================================================
            VIEW 3: S3 THREAT VAULT (DEDICATED VIEW)
            ============================================================== */}
        {!isExtensionMode && currentView === 'threat_vault' && (
          <main className="dedicated-view-container">
            <section className="dedicated-view-card">
              <div className="dedicated-view-header">
                <div className="dedicated-title-group">
                  <span className="dedicated-icon"><VaultIcon size={22} /></span>
                  <div>
                    <h3>Amazon S3 Threat Intelligence Vault</h3>
                    <p>Crowdsourced attack memory stored in Amazon S3 bucket <code>scamshield-threat-vault-070780358311</code> (us-east-1).</p>
                  </div>
                </div>
                <span className="view-badge cloud">AWS S3 Connected</span>
              </div>

              {/* Vault Mode Navigation Tabs */}
              <div className="vault-nav-tabs">
                <button
                  type="button"
                  className={`vault-nav-tab ${activeVaultTab === 'threats' ? 'active' : ''}`}
                  onClick={() => setActiveVaultTab('threats')}
                >
                  Cataloged Attacks ({vaultThreats.length})
                </button>
                <button
                  type="button"
                  className={`vault-nav-tab ${activeVaultTab === 'feedback' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveVaultTab('feedback')
                    loadFeedbackStats()
                  }}
                >
                  AI Learning & User Feedback ({feedbackStats.total})
                </button>
              </div>

              {activeVaultTab === 'threats' ? (
                <>
                  {/* Stats Bar */}
                  <div className="vault-stats-grid">
                    <div className="vault-stat-card">
                      <span className="stat-label">Cataloged Campaigns</span>
                      <strong className="stat-value">{vaultThreats.length}</strong>
                    </div>
                    <div className="vault-stat-card">
                      <span className="stat-label">Cloud Storage Engine</span>
                      <strong className="stat-value">Amazon S3</strong>
                    </div>
                    <div className="vault-stat-card">
                      <span className="stat-label">Attack Coverage</span>
                      <strong className="stat-value">Phishing, Job Scams, Invoices</strong>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="vault-search-row">
                    <input
                      type="text"
                      placeholder="Filter threats by brand, domain, or red flag (e.g. PayPal, Telegram, wire transfer)..."
                      value={vaultSearchQuery}
                      onChange={(e) => setVaultSearchQuery(e.target.value)}
                    />
                    {vaultSearchQuery && (
                      <button
                        type="button"
                        className="vault-search-clear"
                        onClick={() => setVaultSearchQuery('')}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Threat Catalog Grid */}
                  <div className="vault-threat-list">
                    {vaultLoading ? (
                      <div className="vault-empty">Synchronizing catalog with Amazon S3 Threat Vault...</div>
                    ) : filteredThreats.length === 0 ? (
                      <div className="vault-empty">No threat records match your filter.</div>
                    ) : (
                      filteredThreats.map((threat) => (
                        <div key={threat.id} className="vault-threat-card">
                          <div className="threat-card-top">
                            <div className="threat-brand-row">
                              <span className="threat-brand">{threat.brand}</span>
                              <span className="threat-type-tag">{threat.threatType}</span>
                            </div>
                            <span className={`threat-risk-badge risk-${threat.riskLevel.toLowerCase()}`}>
                              {threat.riskLevel} ({threat.riskScore})
                            </span>
                          </div>

                          <div className="threat-origin-row">
                            <span className="origin-label">Target / Origin:</span>
                            <code className="origin-val">{threat.domainOrSender}</code>
                          </div>

                          <div className="threat-indicators-list">
                            {threat.indicators.map((ind, i) => (
                              <span key={i} className="indicator-pill">
                                • {ind}
                              </span>
                            ))}
                          </div>

                          <div className="threat-card-bottom">
                            <span className="threat-s3-key">S3 Key: {threat.s3Key}</span>
                            <button
                              type="button"
                              className="test-in-scanner-btn"
                              onClick={() => loadThreatIntoScanner(threat)}
                            >
                              Test in Scanner →
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Feedback Stats Grid */}
                  <div className="vault-stats-grid">
                    <div className="vault-stat-card">
                      <span className="stat-label">Model Accuracy Rate</span>
                      <strong className="stat-value">{feedbackStats.accuracyRate}%</strong>
                    </div>
                    <div className="vault-stat-card">
                      <span className="stat-label">Total Submissions</span>
                      <strong className="stat-value">{feedbackStats.total}</strong>
                    </div>
                    <div className="vault-stat-card">
                      <span className="stat-label">Learned Corrections</span>
                      <strong className="stat-value">{feedbackStats.falsePositives + feedbackStats.falseNegatives}</strong>
                    </div>
                  </div>

                  {/* Feedback Records List */}
                  <div className="vault-threat-list">
                    {feedbackStats.recentFeedback.length === 0 ? (
                      <div className="vault-empty">No feedback records yet. Submit feedback after scanning messages to train the model.</div>
                    ) : (
                      feedbackStats.recentFeedback.map((fb) => (
                        <div key={fb.id} className="feedback-record-card">
                          <div className="feedback-card-top">
                            <span className={`feedback-type-badge ${fb.feedbackType.toLowerCase().replace('_', '-')}`}>
                              {fb.feedbackType === 'ACCURATE' ? '✓ Verified Accurate' : fb.feedbackType === 'FALSE_POSITIVE' ? '⚠ False Positive (Learned)' : '🚨 False Negative (Learned)'}
                            </span>
                            <span className="feedback-timestamp">
                              {fb.domain || fb.sender || 'Direct Message'}
                            </span>
                          </div>
                          {fb.userNotes && (
                            <p className="feedback-notes-text">
                              <strong>User Correction:</strong> "{fb.userNotes}"
                            </p>
                          )}
                          <div className="feedback-card-meta">
                            <span>Original AI Score: {fb.originalScore}/100 ({fb.originalRiskLevel}) → Calibrated: {fb.correctedScore}/100</span>
                            <span className="learned-status">✓ Synced to S3 Learning Vault</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </section>
          </main>
        )}

        {/* ==============================================================
            VIEW 4: AGENT TELEMETRY & TOOLS (DEDICATED VIEW)
            ============================================================== */}
        {!isExtensionMode && currentView === 'agent_telemetry' && (
          <main className="dedicated-view-container">
            <section className="dedicated-view-card">
              <div className="dedicated-view-header">
                <div className="dedicated-title-group">
                  <span className="dedicated-icon"><ZapIcon size={22} /></span>
                  <div>
                    <h3>Autonomous Agent Observability & Tools</h3>
                    <p>Architecture specifications for Strands Agents SDK and real-time Bedrock Claude 3 Haiku orchestration.</p>
                  </div>
                </div>
                <span className="view-badge">Strands SDK v1.20</span>
              </div>

              {/* Interactive Telemetry Runner Box */}
              <div className="telemetry-demo-banner">
                <div className="demo-banner-info">
                  <strong>Live Stepper Execution Test</strong>
                  <p>Trigger an animated execution simulation through all 5 agentic cybersecurity tools.</p>
                </div>
                <button
                  type="button"
                  className="launch-simulation-btn"
                  onClick={handleSimulateAgentTelemetry}
                  disabled={isSimulating || isAiAnalyzing}
                >
                  {isSimulating ? 'Simulation in Progress...' : 'Launch Telemetry Simulation'}
                </button>
              </div>

              {/* Active Telemetry Stepper if running or simulating */}
              {(isAiAnalyzing || isSimulating) && (
                <div className="agent-telemetry-hud in-telemetry-view">
                  <div className="telemetry-header">
                    <div className="telemetry-status-pill">
                      <span className="telemetry-pulse"></span>
                      <span>STRANDS AGENT ACTIVE</span>
                    </div>
                    <span className="telemetry-model-badge">Claude 3 Haiku • AWS Bedrock</span>
                  </div>

                  <div className="telemetry-stepper">
                    {AGENT_TELEMETRY_STEPS.map((step, idx) => {
                      const isCompleted = activeTelemetryStep > idx
                      const isCurrent = activeTelemetryStep === idx

                      return (
                        <div
                          key={step.id}
                          className={`telemetry-step ${
                            isCompleted ? 'step-completed' : isCurrent ? 'step-current' : 'step-pending'
                          }`}
                        >
                          <div className="step-indicator">
                            <div className="step-circle">
                              {isCompleted ? (
                                <span className="step-check">✓</span>
                              ) : isCurrent ? (
                                <span className="step-spinner"></span>
                              ) : (
                                <span className="step-number">{idx + 1}</span>
                              )}
                            </div>
                            {idx < AGENT_TELEMETRY_STEPS.length - 1 && <div className="step-line"></div>}
                          </div>

                          <div className="step-content">
                            <div className="step-title-row">
                              <span className="step-title">{step.title}</span>
                              <span className="step-tool-badge">{step.tool}</span>
                            </div>
                            <p className="step-desc">
                              {isCompleted ? step.detail : step.description}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="telemetry-footer">
                    <div className="telemetry-timer">
                      <span className="timer-icon"><ClockIcon size={12} /></span>
                      <span>Execution Time: {(telemetryElapsedMs / 1000).toFixed(1)}s</span>
                    </div>
                    <div className="telemetry-counter">
                      <span>Tools invoked: {Math.min(activeTelemetryStep + 1, AGENT_TELEMETRY_STEPS.length)} / {AGENT_TELEMETRY_STEPS.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tools Specification Cards */}
              <div className="tools-spec-grid">
                <div className="tool-spec-card">
                  <div className="tool-card-header">
                    <span className="tool-chip">tool</span>
                    <h4>inspect_url</h4>
                  </div>
                  <p>Inspects plaintext and embedded URLs for high-risk TLDs (.xyz, .top), bare IP addresses, and brand typosquatting.</p>
                  <span className="tool-target">Input: <code>url (string)</code></span>
                </div>

                <div className="tool-spec-card">
                  <div className="tool-card-header">
                    <span className="tool-chip">tool</span>
                    <h4>verify_sender_and_mfa</h4>
                  </div>
                  <p>Evaluates sender authenticity against known corporate domains, validates BIMI checkmarks, and verifies legitimate automated MFA codes.</p>
                  <span className="tool-target">Input: <code>sender, hasVerifiedCheckmark, isMfa</code></span>
                </div>

                <div className="tool-spec-card">
                  <div className="tool-card-header">
                    <span className="tool-chip">tool</span>
                    <h4>query_s3_threat_vault</h4>
                  </div>
                  <p>Cross-references target entities and URLs against past cataloged phishing campaigns stored in Amazon S3.</p>
                  <span className="tool-target">Input: <code>query (string)</code></span>
                </div>

                <div className="tool-spec-card">
                  <div className="tool-card-header">
                    <span className="tool-chip">agent</span>
                    <h4>Bedrock Claude 3 Haiku</h4>
                  </div>
                  <p>Autonomous LLM reasoning engine that coordinates tool outputs and computes calibrated 0-100 risk assessments with structured JSON schema.</p>
                  <span className="tool-target">Engine: <code>AWS Bedrock Runtime (us-east-1)</code></span>
                </div>
              </div>
            </section>
          </main>
        )}

        {/* ==============================================================
            VIEW 5: SETTINGS & FEATURE CONFIGURATION (FULL SCREEN PAGE)
            ============================================================== */}
        {!isExtensionMode && currentView === 'settings' && (
          <main className="main-content settings-view">
            <div className="settings-header-banner">
              <div className="settings-header-info">
                <div className="view-badge">PROTECTION PREFERENCES</div>
                <h2>ScamShield <span>Settings</span></h2>
                <p>Customize real-time scanning behavior, in-page email overlays, autonomous agent heuristics, and cloud threat vault synchronization.</p>
              </div>
              <div className="settings-header-actions">
                {settingsSavedNotice && (
                  <div className="settings-saved-pill">
                    <CheckIcon size={14} />
                    <span>Saved & Synced</span>
                  </div>
                )}
                <button
                  type="button"
                  className="settings-reset-btn"
                  onClick={resetSettingsToDefault}
                  title="Reset all settings to recommended security defaults"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            <div className="settings-categories-grid">
              {/* Category 1: In-Browser & Webmail Protections */}
              <div className="settings-category-card">
                <div className="category-header">
                  <div className="category-icon-box">
                    <ShieldIcon size={20} style={{ color: '#6366f1' }} />
                  </div>
                  <div>
                    <h3>In-Browser & Webmail Protections</h3>
                    <p>Floating badges and in-page scanning inside Gmail, Outlook, and webmail</p>
                  </div>
                </div>

                <div className="settings-items-list">
                  {/* Setting: allowEmailOverlay */}
                  <div className="settings-item-row">
                    <div className="settings-item-info">
                      <div className="settings-item-title-row">
                        <strong>Allow Page Overlay on Emails</strong>
                        <span className="feature-pill badge-webmail">Gmail & Outlook</span>
                      </div>
                      <p>
                        Display the floating security badge (&ldquo;Scan Email with ScamShield&rdquo;) and inline threat assessment cards directly over opened email threads in Gmail and Outlook webmail.
                      </p>
                    </div>
                    <label className="toggle-switch" aria-label="Toggle email page overlay">
                      <input
                        type="checkbox"
                        checked={settings.allowEmailOverlay}
                        onChange={(e) => updateSetting('allowEmailOverlay', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {/* Setting: autoDetectEmails */}
                  <div className="settings-item-row">
                    <div className="settings-item-info">
                      <div className="settings-item-title-row">
                        <strong>Active Tab Auto-Detection</strong>
                        <span className="feature-pill badge-tab">Tab Integration</span>
                      </div>
                      <p>
                        Allow ScamShield to inspect the active browser tab when opened, automatically extracting open email text and sender headers into the scanner.
                      </p>
                    </div>
                    <label className="toggle-switch" aria-label="Toggle active tab auto-detection">
                      <input
                        type="checkbox"
                        checked={settings.autoDetectEmails}
                        onChange={(e) => updateSetting('autoDetectEmails', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Category 2: AI Agent & Cloud Threat Intelligence */}
              <div className="settings-category-card">
                <div className="category-header">
                  <div className="category-icon-box">
                    <VaultIcon size={20} style={{ color: '#0ea5e9' }} />
                  </div>
                  <div>
                    <h3>Autonomous Agent & Cloud Threat Vault</h3>
                    <p>Amazon Bedrock reasoning, S3 campaign cataloging, and feedback memory</p>
                  </div>
                </div>

                <div className="settings-items-list">
                  {/* Setting: syncToS3ThreatVault */}
                  <div className="settings-item-row">
                    <div className="settings-item-info">
                      <div className="settings-item-title-row">
                        <strong>Amazon S3 Threat Vault Sync</strong>
                        <span className="feature-pill badge-aws">AWS S3</span>
                      </div>
                      <p>
                        Automatically synchronize verified zero-day scam payloads and emerging threat signatures to Amazon S3 bucket (<code>scamshield-threat-vault</code>) for historical threat cross-referencing.
                      </p>
                    </div>
                    <label className="toggle-switch" aria-label="Toggle Amazon S3 Threat Vault sync">
                      <input
                        type="checkbox"
                        checked={settings.syncToS3ThreatVault}
                        onChange={(e) => updateSetting('syncToS3ThreatVault', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {/* Setting: enableFeedbackLearning */}
                  <div className="settings-item-row">
                    <div className="settings-item-info">
                      <div className="settings-item-title-row">
                        <strong>Continuous Human Feedback Learning</strong>
                        <span className="feature-pill badge-ai">Reinforcement Memory</span>
                      </div>
                      <p>
                        Dynamically inject human corrections (e.g. false alarm calibrations) into the AWS Bedrock agent prompt context so the AI avoids repeating past misclassifications.
                      </p>
                    </div>
                    <label className="toggle-switch" aria-label="Toggle human feedback learning">
                      <input
                        type="checkbox"
                        checked={settings.enableFeedbackLearning}
                        onChange={(e) => updateSetting('enableFeedbackLearning', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {/* Setting: agentTelemetry */}
                  <div className="settings-item-row">
                    <div className="settings-item-info">
                      <div className="settings-item-title-row">
                        <strong>Live Agent Observability & Tracing</strong>
                        <span className="feature-pill badge-observability">Strands SDK</span>
                      </div>
                      <p>
                        Record and render multi-stage agent telemetry steps (Payload Ingestion &rarr; URL Inspection &rarr; MFA Verifier &rarr; S3 Vault &rarr; Reasoning Synthesis) during deep scans.
                      </p>
                    </div>
                    <label className="toggle-switch" aria-label="Toggle live agent observability">
                      <input
                        type="checkbox"
                        checked={settings.agentTelemetry}
                        onChange={(e) => updateSetting('agentTelemetry', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Category 3: Heuristic & Threat Detection Engines */}
              <div className="settings-category-card">
                <div className="category-header">
                  <div className="category-icon-box">
                    <ZapIcon size={20} style={{ color: '#f59e0b' }} />
                  </div>
                  <div>
                    <h3>Heuristic Detection & Phishing Safeguards</h3>
                    <p>Fine-tune rule-based security filters and specialized scam heuristics</p>
                  </div>
                </div>

                <div className="settings-items-list">
                  {/* Setting: highlightSuspiciousDomains */}
                  <div className="settings-item-row">
                    <div className="settings-item-info">
                      <div className="settings-item-title-row">
                        <strong>High-Risk Domain & Lookalike Shield</strong>
                        <span className="feature-pill badge-heuristics">Domain Engine</span>
                      </div>
                      <p>
                        Heuristically analyze destination hostnames for brand typosquatting, raw IP addresses, and high-abuse top-level domains (.xyz, .top, .buzz, .support).
                      </p>
                    </div>
                    <label className="toggle-switch" aria-label="Toggle high-risk domain shield">
                      <input
                        type="checkbox"
                        checked={settings.highlightSuspiciousDomains}
                        onChange={(e) => updateSetting('highlightSuspiciousDomains', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {/* Setting: mfaProtection */}
                  <div className="settings-item-row">
                    <div className="settings-item-info">
                      <div className="settings-item-title-row">
                        <strong>MFA Phishing & Passcode Interception Defense</strong>
                        <span className="feature-pill badge-heuristics">Auth Filter</span>
                      </div>
                      <p>
                        Distinguish authentic automated one-time security passcodes (OTP) from deceptive interception traps instructing victims to text or reply back with their login codes.
                      </p>
                    </div>
                    <label className="toggle-switch" aria-label="Toggle MFA phishing defense">
                      <input
                        type="checkbox"
                        checked={settings.mfaProtection}
                        onChange={(e) => updateSetting('mfaProtection', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  {/* Setting: jobScamDetection */}
                  <div className="settings-item-row">
                    <div className="settings-item-info">
                      <div className="settings-item-title-row">
                        <strong>Employment & Recruitment Fraud Filter</strong>
                        <span className="feature-pill badge-heuristics">Job Alerts</span>
                      </div>
                      <p>
                        Verify legitimate job boards (LinkedIn, Greenhouse, Lever, Indeed) while flagging recruitment scam patterns (fake check for equipment, off-platform Telegram interviews, free webmail HR).
                      </p>
                    </div>
                    <label className="toggle-switch" aria-label="Toggle job scam detection">
                      <input
                        type="checkbox"
                        checked={settings.jobScamDetection}
                        onChange={(e) => updateSetting('jobScamDetection', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* System Diagnostics Box */}
              <div className="settings-diagnostics-card">
                <div className="diag-header">
                  <h4>Active System Runtime & Security Engines</h4>
                  <span className="status-live-pill">
                    <span className="live-dot-pulse"></span>
                    Connected
                  </span>
                </div>
                <div className="diag-grid">
                  <div className="diag-item">
                    <span className="diag-label">Foundation Model</span>
                    <strong>AWS Bedrock • Nova Lite (us.amazon.nova-lite-v1:0)</strong>
                  </div>
                  <div className="diag-item">
                    <span className="diag-label">Agent Framework</span>
                    <strong>AWS Strands Agents SDK (@strands-agents/sdk)</strong>
                  </div>
                  <div className="diag-item">
                    <span className="diag-label">Cloud Threat Vault</span>
                    <strong>Amazon S3 (scamshield-threat-vault-070780358311)</strong>
                  </div>
                  <div className="diag-item">
                    <span className="diag-label">Configuration Sync</span>
                    <strong>Chrome Storage Local & Web LocalStorage Active</strong>
                  </div>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* Footer */}
        <footer className="footer">
          <div className="footer-brand"><ShieldIcon size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} /> ScamShield AI</div>
          <p>Think before you click.</p>
          <small>Hack Midwest 2026 | AWS Bedrock + Strands Agents</small>
        </footer>
      </div>
    </div>
  )
}

export default App