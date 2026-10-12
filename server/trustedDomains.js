import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_FILE_PATH = path.join(__dirname, 'trusted_domains.txt');

// In-memory registry of trusted domains & verified organizations
let trustedDomainsMap = new Map();
let trustedDomainsSet = new Set();
let trustedDomainsList = [];
let targetBrands = [];

/**
 * Free webmail providers commonly abused for impersonation attacks
 */
export const FREE_WEBMAIL_PROVIDERS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'proton.me',
  'protonmail.com',
  'mail.com',
  'zoho.com',
  'yandex.com',
  'gmx.com'
]);

/**
 * Ingest and parse trusted domains from trusted_domains.txt
 * @param {string} [filePath] - Optional custom path to domain file
 * @returns {number} Number of loaded trusted domains
 */
export function loadTrustedDomains(filePath = DEFAULT_FILE_PATH) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`[TrustedDomains] File not found at ${filePath}. Falling back to default list.`);
      useFallbackDomains();
      return trustedDomainsSet.size;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);

    const newMap = new Map();
    const newSet = new Set();
    const brandSet = new Set();

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;

      let domain = '';
      let org = '';

      if (line.includes(',')) {
        const parts = line.split(',');
        domain = parts[0].trim().toLowerCase();
        org = parts.slice(1).join(',').trim();
      } else if (line.includes(':')) {
        const parts = line.split(':');
        domain = parts[0].trim().toLowerCase();
        org = parts.slice(1).join(':').trim();
      } else {
        domain = line.trim().toLowerCase();
        // Capitalize primary label as fallback org
        const base = domain.split('.')[0] || domain;
        org = base.charAt(0).toUpperCase() + base.slice(1);
      }

      // Strip any protocol or leading/trailing slashes if present
      domain = domain.replace(/^https?:\/\//i, '').split('/')[0].trim();

      if (domain && domain.includes('.')) {
        newMap.set(domain, org || domain);
        newSet.add(domain);
        if (org) brandSet.add(org);
      }
    }

    trustedDomainsMap = newMap;
    trustedDomainsSet = newSet;
    // Sort descending by length so subdomains match first
    trustedDomainsList = Array.from(newSet).sort((a, b) => b.length - a.length);

    // Build brand patterns for lookalike detection
    const GENERIC_ROOTS = new Set([
      'mail', 'jobs', 'cloud', 'portal', 'account', 'verify', 'update', 'login', 'secure',
      'support', 'online', 'connect', 'center', 'direct', 'service', 'services', 'live',
      'office', 'media', 'corp', 'group', 'global', 'bank', 'news', 'shop', 'store'
    ]);
    const SHORT_ALLOWLIST = new Set(['ups', 'dhl', 'irs', 'ibm', 'ftc', 'fbi', 'bofa', 'usps', 'amex']);

    const brandPatterns = [];
    const seenPatterns = new Set();

    // 1. Add patterns for full brand names
    for (const name of brandSet) {
      if (name.length >= 3) {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '[\\s-_]?');
        const key = escaped.toLowerCase();
        if (!seenPatterns.has(key)) {
          seenPatterns.add(key);
          brandPatterns.push({ name, pattern: new RegExp(escaped, 'i') });
        }
      }
    }

    // 2. Add patterns for primary domain root labels (e.g. 'chase' from chase.com -> 'Chase Bank')
    for (const [domain, org] of newMap.entries()) {
      const rootLabel = domain.split('.')[0];
      const isEligible = (rootLabel.length >= 4 && !GENERIC_ROOTS.has(rootLabel)) || SHORT_ALLOWLIST.has(rootLabel);
      if (isEligible) {
        const escaped = rootLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const key = escaped.toLowerCase();
        if (!seenPatterns.has(key)) {
          seenPatterns.add(key);
          brandPatterns.push({ name: org, pattern: new RegExp(escaped, 'i') });
        }
      }
    }

    targetBrands = brandPatterns;

    console.log(`[TrustedDomains] Successfully ingested ${trustedDomainsSet.size} trusted domains from ${path.basename(filePath)}`);
    return trustedDomainsSet.size;
  } catch (err) {
    console.error(`[TrustedDomains] Error reading ${filePath}:`, err.message);
    useFallbackDomains();
    return trustedDomainsSet.size;
  }
}

function useFallbackDomains() {
  const fallback = {
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
    'paypal.com': 'PayPal',
    'usps.com': 'United States Postal Service',
    'fedex.com': 'FedEx',
    'ups.com': 'UPS'
  };

  trustedDomainsMap = new Map(Object.entries(fallback));
  trustedDomainsSet = new Set(Object.keys(fallback));
  trustedDomainsList = Array.from(trustedDomainsSet).sort((a, b) => b.length - a.length);
  targetBrands = Object.values(fallback).map((name) => ({
    name,
    pattern: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
  }));
}

/**
 * Check if a hostname belongs to a verified trusted domain
 * @param {string} hostname - The hostname to evaluate
 * @returns {boolean}
 */
export function isTrustedDomain(hostname) {
  if (!hostname || typeof hostname !== 'string') return false;
  const cleanHost = hostname.trim().toLowerCase().split(':')[0];

  // Direct exact match
  if (trustedDomainsSet.has(cleanHost)) return true;

  // Subdomain match (e.g. www.linkedin.com ends with .linkedin.com)
  for (const domain of trustedDomainsList) {
    if (cleanHost === domain || cleanHost.endsWith(`.${domain}`)) {
      return true;
    }
  }

  // Official government or accredited higher-education domains
  if (cleanHost.endsWith('.gov') || cleanHost.endsWith('.edu')) {
    return true;
  }

  return false;
}

/**
 * Get verified organization information for a domain or email sender
 * @param {string} domainOrSender
 * @returns {{ isVerified: boolean, organization?: string, matchedDomain?: string }}
 */
export function getVerifiedOrganization(domainOrSender) {
  if (!domainOrSender || typeof domainOrSender !== 'string') {
    return { isVerified: false };
  }

  const clean = domainOrSender.trim().toLowerCase();
  const emailMatch = clean.match(/[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,})/i);
  const hostname = emailMatch ? emailMatch[1] : clean.replace(/^https?:\/\//, '').split('/')[0].split(':')[0];

  // Consumer free webmail accounts cannot authenticate as verified corporate entities
  if (FREE_WEBMAIL_PROVIDERS.has(hostname)) {
    return {
      isVerified: false,
      isFreeWebmail: true
    };
  }

  for (const domain of trustedDomainsList) {
    if (hostname === domain || hostname.endsWith(`.${domain}`)) {
      return {
        isVerified: true,
        organization: trustedDomainsMap.get(domain) || domain,
        matchedDomain: domain
      };
    }
  }

  if (hostname.endsWith('.gov')) {
    return {
      isVerified: true,
      organization: 'U.S. Government Official Service',
      matchedDomain: hostname
    };
  }

  if (hostname.endsWith('.edu')) {
    return {
      isVerified: true,
      organization: 'Accredited Higher Education Institution',
      matchedDomain: hostname
    };
  }

  return { isVerified: false };
}

/**
 * Detect brand name matches in a domain to flag lookalike / typosquatting phishing
 * @param {string} hostname
 * @returns {string[]} Array of matched brand names
 */
export function detectBrandLookalike(hostname) {
  if (!hostname || typeof hostname !== 'string') return [];
  if (isTrustedDomain(hostname)) return [];

  const cleanHost = hostname.trim().toLowerCase().split(':')[0];
  const matched = [];

  for (const { name, pattern } of targetBrands) {
    // Only test if brand pattern matches and brand isn't generic short word
    if (name.length >= 3 && pattern.test(cleanHost)) {
      matched.push(name);
    }
  }

  return Array.from(new Set(matched));
}

/**
 * Returns statistics about ingested trusted domains
 */
export function getTrustedDomainStats() {
  return {
    totalDomains: trustedDomainsSet.size,
    totalBrands: targetBrands.length,
    freeWebmailProviders: FREE_WEBMAIL_PROVIDERS.size
  };
}

/**
 * Returns all ingested domain mappings
 */
export function getAllTrustedDomains() {
  return Array.from(trustedDomainsMap.entries()).map(([domain, organization]) => ({
    domain,
    organization
  }));
}

// Automatically load default trusted domains on module import
loadTrustedDomains();
