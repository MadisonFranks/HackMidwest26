// ScamShield AI Content Script (Automated Email Scanner)
(function () {
  'use strict';

  let floatingBtn = null;
  let assessmentCard = null;
  let isScanning = false;

  // 1. Robust email extraction for Gmail, Outlook, Yahoo Mail, and webmail
  function extractEmailData() {
    const hostname = window.location.hostname;
    let subject = '';
    let sender = '';
    let bodyText = '';
    let links = [];
    let hasVerifiedCheckmark = false;

    if (hostname.includes('mail.google.com')) {
      // Gmail extraction
      const subjectEl =
        document.querySelector('h2.hP') ||
        document.querySelector('[data-thread-perm-id] h2') ||
        document.querySelector('div[role="main"] h2');
      subject = subjectEl ? subjectEl.innerText.trim() : '';

      const senderEl = document.querySelector('span.gD');
      if (senderEl) {
        const email = senderEl.getAttribute('email');
        const name = senderEl.getAttribute('name') || senderEl.innerText.trim();
        sender = email ? `${name} <${email}>` : name;

        // Check for Gmail / BIMI Verified Checkmark next to sender
        const senderContainer = senderEl.closest('.gE') || senderEl.closest('h3') || senderEl.parentElement;
        const verifiedBadge =
          senderContainer?.querySelector('[data-tooltip*="verified" i], [aria-label*="verified" i], [data-tooltip*="bimi" i], svg[aria-label*="verified" i], img[alt*="verified" i]') ||
          document.querySelector('.gE [data-tooltip*="verified" i], .gE [aria-label*="verified" i], [data-tooltip*="Google has verified that the sender" i]');
        hasVerifiedCheckmark = Boolean(verifiedBadge);
      }

      const bodyElements = document.querySelectorAll('.a3s.aiL');
      if (bodyElements.length > 0) {
        // Use the most recent message in the thread
        const activeBody = bodyElements[bodyElements.length - 1];
        bodyText = activeBody.innerText.trim();

        // Extract links
        const anchorTags = activeBody.querySelectorAll('a[href]');
        links = Array.from(anchorTags)
          .map((a) => a.href)
          .filter((href) => href && !href.startsWith('mailto:'));
      }
    } else if (hostname.includes('outlook')) {
      // Outlook extraction
      const subjectEl =
        document.querySelector('[aria-label="Email subject"]') ||
        document.querySelector('div[role="heading"]') ||
        document.querySelector('.allowTextSelection');
      subject = subjectEl ? subjectEl.innerText.trim() : '';

      const senderEl =
        document.querySelector('[aria-label*="From:"]') ||
        document.querySelector('div[role="region"] [aria-label*="From"]');
      sender = senderEl ? senderEl.innerText.trim() : '';

      const verifiedBadge = document.querySelector('[aria-label*="verified" i], [title*="verified" i]');
      hasVerifiedCheckmark = Boolean(verifiedBadge);

      const bodyEl =
        document.querySelector('[aria-label="Message body"]') ||
        document.querySelector('.ReadingPane');
      bodyText = bodyEl ? bodyEl.innerText.trim() : '';

      if (bodyEl) {
        const anchorTags = bodyEl.querySelectorAll('a[href]');
        links = Array.from(anchorTags)
          .map((a) => a.href)
          .filter((href) => href && !href.startsWith('mailto:'));
      }
    } else {
      // Fallback for general webmail or highlighted text
      const selection = window.getSelection()?.toString()?.trim();
      if (selection) {
        bodyText = selection;
      } else {
        const main = document.querySelector('main, article, [role="main"]');
        bodyText = main ? main.innerText.slice(0, 3000) : '';
      }
    }

    const uniqueLinks = Array.from(new Set(links)).slice(0, 10);

    // Extract sender domain to classify official vs external links
    const senderEmailMatch = sender.match(/@([a-z0-9.-]+\.[a-z]{2,})/i);
    const senderDomain = (senderEmailMatch ? senderEmailMatch[1] : '').toLowerCase();

    const officialLinks = [];
    const externalLinks = [];

    uniqueLinks.forEach((link) => {
      try {
        const parsed = new URL(link);
        if (senderDomain && (parsed.hostname === senderDomain || parsed.hostname.endsWith(`.${senderDomain}`))) {
          officialLinks.push(link);
        } else {
          externalLinks.push(link);
        }
      } catch {
        externalLinks.push(link);
      }
    });

    const fullText = [
      subject ? `Subject: ${subject}` : '',
      sender ? `From: ${sender}` : '',
      hasVerifiedCheckmark
        ? `Platform Verification Status: [VERIFIED SENDER] Confirmed official blue verification checkmark badge present next to sender.`
        : '',
      bodyText ? `Message Body:\n${bodyText}` : '',
      officialLinks.length > 0 ? `Official Platform Links (Matching Verified Domain):\n${officialLinks.slice(0, 5).join('\n')}` : '',
      externalLinks.length > 0 ? `External / Third-Party Links:\n${externalLinks.slice(0, 5).join('\n')}` : ''
    ]
      .filter(Boolean)
      .join('\n\n');

    return {
      hasEmail: Boolean(bodyText && bodyText.length > 20),
      hasVerifiedCheckmark,
      subject,
      sender,
      bodyText,
      links: uniqueLinks,
      officialLinks,
      externalLinks,
      fullText
    };
  }

  // 2. Respond to requests from the popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'EXTRACT_EMAIL_NOW') {
      const data = extractEmailData();
      sendResponse({
        success: data.hasEmail,
        data: data
      });
    }
  });

  // 3. Inject floating "Scan This Email" button when an email is present
  function ensureFloatingButton() {
    const data = extractEmailData();

    if (!data.hasEmail) {
      if (floatingBtn && !isScanning) {
        floatingBtn.style.display = 'none';
      }
      return;
    }

    if (!floatingBtn) {
      floatingBtn = document.createElement('div');
      floatingBtn.id = 'scamshield-floating-trigger';
      floatingBtn.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">🛡️</span>
          <span id="scamshield-btn-label" style="font-weight: 600; font-size: 13px; letter-spacing: -0.01em;">Scan Email with ScamShield</span>
        </div>
      `;

      Object.assign(floatingBtn.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: '99999999',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        border: '1px solid rgba(56, 189, 248, 0.4)',
        boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.45), 0 0 16px rgba(56, 189, 248, 0.25)',
        borderRadius: '9999px',
        padding: '10px 18px',
        cursor: 'pointer',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        backdropFilter: 'blur(8px)',
        userSelect: 'none'
      });

      floatingBtn.addEventListener('mouseenter', () => {
        if (!isScanning) {
          floatingBtn.style.transform = 'translateY(-2px) scale(1.02)';
          floatingBtn.style.borderColor = '#38bdf8';
          floatingBtn.style.boxShadow = '0 12px 28px -4px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.4)';
        }
      });

      floatingBtn.addEventListener('mouseleave', () => {
        if (!isScanning) {
          floatingBtn.style.transform = 'none';
          floatingBtn.style.borderColor = 'rgba(56, 189, 248, 0.4)';
          floatingBtn.style.boxShadow = '0 8px 24px -4px rgba(0, 0, 0, 0.45), 0 0 16px rgba(56, 189, 248, 0.25)';
        }
      });

      floatingBtn.addEventListener('click', handleScanClick);
      document.body.appendChild(floatingBtn);
    } else {
      floatingBtn.style.display = 'flex';
    }
  }

  // 4. Handle scan trigger
  async function handleScanClick() {
    if (isScanning) return;

    const emailData = extractEmailData();
    if (!emailData.hasEmail) {
      alert('Could not find readable email content on this page.');
      return;
    }

    isScanning = true;
    const label = document.getElementById('scamshield-btn-label');
    if (label) {
      label.innerText = 'Analyzing with AWS Bedrock...';
    }
    floatingBtn.style.opacity = '0.85';
    floatingBtn.style.borderColor = '#f59e0b';

    // Remove old card if open
    if (assessmentCard) {
      assessmentCard.remove();
      assessmentCard = null;
    }

    try {
      chrome.runtime.sendMessage(
        {
          type: 'SCAN_EMAIL_PAYLOAD',
          payload: {
            message: emailData.fullText,
            subject: emailData.subject,
            sender: emailData.sender,
            hasVerifiedCheckmark: Boolean(emailData.hasVerifiedCheckmark)
          }
        },
        (response) => {
          isScanning = false;
          if (label) label.innerText = 'Scan Email with ScamShield';
          floatingBtn.style.opacity = '1';
          floatingBtn.style.borderColor = 'rgba(56, 189, 248, 0.4)';

          if (response && response.success && response.result) {
            renderAssessmentCard(response.result, emailData);
          } else {
            const errorMsg = response?.error || 'Failed to reach ScamShield backend at http://localhost:5001';
            alert(`ScamShield Error: ${errorMsg}`);
          }
        }
      );
    } catch (err) {
      isScanning = false;
      if (label) label.innerText = 'Scan Email with ScamShield';
      floatingBtn.style.opacity = '1';
      alert(`ScamShield: ${err.message}`);
    }
  }

  // 5. Render inline security card
  function renderAssessmentCard(result, emailData) {
    if (assessmentCard) assessmentCard.remove();

    const isHighRisk = result.score >= 70;
    const isModRisk = result.score >= 35 && result.score < 70;

    const badgeColor = isHighRisk ? '#ef4444' : isModRisk ? '#f59e0b' : '#10b981';
    const badgeText = result.riskLevel || (isHighRisk ? 'CRITICAL RISK' : isModRisk ? 'MODERATE RISK' : 'LOW RISK');

    assessmentCard = document.createElement('div');
    assessmentCard.id = 'scamshield-assessment-card';

    Object.assign(assessmentCard.style, {
      position: 'fixed',
      bottom: '80px',
      right: '24px',
      width: '380px',
      maxWidth: 'calc(100vw - 48px)',
      background: '#0f172a',
      color: '#f8fafc',
      borderRadius: '14px',
      border: `1px solid ${isHighRisk ? '#dc2626' : 'rgba(56, 189, 248, 0.3)'}`,
      boxShadow: '0 20px 40px -8px rgba(0, 0, 0, 0.7), 0 0 24px rgba(0, 0, 0, 0.3)',
      zIndex: '99999999',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '13px',
      lineHeight: '1.5',
      overflow: 'hidden',
      animation: 'scamshieldSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
    });

    const indicatorsHtml = (result.indicators || [])
      .map((ind) => `<li style="margin-bottom: 4px; color: #cbd5e1;">${escapeHtml(ind)}</li>`)
      .join('');

    assessmentCard.innerHTML = `
      <style>
        @keyframes scamshieldSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      </style>
      <div style="background: #1e293b; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">🛡️</span>
          <span style="font-weight: 700; color: #ffffff; letter-spacing: -0.01em;">ScamShield Threat Assessment</span>
        </div>
        <button id="scamshield-card-close" style="background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 0 4px; line-height: 1;">✕</button>
      </div>

      <div style="padding: 16px; max-height: 480px; overflow-y: auto;">
        ${
          emailData.hasVerifiedCheckmark
            ? `
          <div style="display: flex; align-items: center; gap: 6px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); padding: 5px 10px; border-radius: 6px; margin-bottom: 12px; font-size: 11px; color: #38bdf8; font-weight: 600;">
            <span style="font-size: 13px;">✓</span>
            <span>Platform Verified Sender (Blue Checkmark Confirmed)</span>
          </div>
          `
            : ''
        }
        <!-- Score Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div>
            <span style="font-size: 26px; font-weight: 800; color: ${badgeColor};">${result.score}</span>
            <span style="color: #64748b; font-size: 13px;"> / 100</span>
          </div>
          <span style="background: ${badgeColor}22; color: ${badgeColor}; border: 1px solid ${badgeColor}55; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px;">
            ${escapeHtml(badgeText)}
          </span>
        </div>

        <!-- Verdict Summary -->
        <p style="margin: 0 0 12px; font-size: 13px; color: #e2e8f0; font-weight: 500;">
          ${escapeHtml(result.summary || '')}
        </p>

        <!-- Red Flags -->
        ${
          result.indicators && result.indicators.length > 0
            ? `
          <div style="margin-bottom: 12px; background: rgba(15, 23, 42, 0.6); padding: 10px; border-radius: 8px; border: 1px solid #334155;">
            <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px;">Identified Indicators</div>
            <ul style="margin: 0; padding-left: 18px;">
              ${indicatorsHtml}
            </ul>
          </div>
          `
            : ''
        }

        <!-- Recommended Action -->
        ${
          result.recommendedAction
            ? `
          <div style="background: rgba(56, 189, 248, 0.1); border-left: 3px solid #38bdf8; padding: 8px 10px; border-radius: 4px; margin-bottom: 12px;">
            <div style="font-size: 11px; font-weight: 700; color: #38bdf8; margin-bottom: 2px;">Recommended Action</div>
            <div style="color: #cbd5e1; font-size: 12px;">${escapeHtml(result.recommendedAction)}</div>
          </div>
          `
            : ''
        }

        <!-- S3 Threat Vault Badge -->
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #94a3b8; border-top: 1px solid #334155; padding-top: 10px; margin-top: 8px;">
          <span>Database: Amazon S3 Vault</span>
          <span style="color: #38bdf8; font-weight: 600;">${isHighRisk ? 'Archived to Vault' : 'Referenced'}</span>
        </div>
      </div>
    `;

    document.body.appendChild(assessmentCard);

    // Close button
    document.getElementById('scamshield-card-close')?.addEventListener('click', () => {
      assessmentCard.remove();
      assessmentCard = null;
    });
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
  }

  // 6. Monitor page changes (for SPAs like Gmail and Outlook)
  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(ensureFloatingButton, 600);
  });

  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(ensureFloatingButton, 1000);
})();

