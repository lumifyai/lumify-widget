/**
 * Lumify Widget v1.1.0
 * 
 * A self-contained, zero-config widget for adding AI-powered search to any website.
 * Simply add a script tag with your API credentials and the widget handles everything.
 * 
 * Usage:
 *   <script 
 *     src="https://www.lumify.ai/api/v1/js/lumify-widget.js"
 *     data-api-key="your-api-key"
 *     data-app-id="your-app-id">
 *   </script>
 * 
 * Configuration (all optional except api-key and app-id):
 *   data-mode: "floating" | "inline" | "trigger" (default: "floating")
 *   data-position: "bottom-right" | "bottom-left" | "top-right" | "top-left" (default: "bottom-right")
 *   data-theme: "light" | "dark" | "auto" (default: "auto")
 *   data-accent-color: CSS color (default: "#6366f1")
 *   data-button-text: string (default: "")
 *   data-button-icon: "search" | "chat" | "help" | "none" (default: "search")
 *   data-placeholder: string (default: "Ask anything...")
 *   data-keyboard-shortcut: "true" | "false" (default: "true")
 *   data-show-branding: "true" | "false" (default: "true")
 *   data-z-index: number (default: 9999)
 *   data-empty-text: string (default: "Ask a question to get started")
 *   data-modal-title: string (default: "Search")
 *   data-trigger-selector: CSS selector for trigger mode
 *   data-container-selector: CSS selector for inline mode container
 *   data-popular-questions: "true" | "false" (default: "false") - Enable popular questions
 *   data-popular-questions-fallback: JSON array string of fallback questions
 * 
 * @author Lumify
 * @version 1.1.0
 * @license MIT
 */

(function() {
    'use strict';

    // Prevent multiple initializations
    if (window.LumifyWidget && window.LumifyWidget._initialized) {
        console.warn('LumifyWidget: Already initialized');
        return;
    }

    // =========================================================================
    // Configuration
    // =========================================================================

    const DEFAULTS = {
        mode: 'floating',
        position: 'bottom-right',
        theme: 'auto',
        accentColor: '#6366f1',
        buttonText: '',
        buttonIcon: 'search',
        placeholder: 'Ask anything...',
        keyboardShortcut: true,
        showBranding: true,
        zIndex: 9999,
        emptyText: 'Ask a question to get started',
        modalTitle: 'Search',
        apiEndpoint: '/api/v1/search.php',
        answerMode: true,
        similarQuestions: false,
        ctaTarget: '_self',  // Link target for CTAs: '_self' (same window) or '_blank' (new tab)
        // Popular Questions configuration
        popularQuestions: {
            enabled: false,
            maxDisplay: 5,
            cacheStrategy: 'localStorage',
            cacheTTL: 86400, // 24 hours
            fallback: []
        }
    };

    // =========================================================================
    // Icons (SVG)
    // =========================================================================

    const ICONS = {
        search: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
        chat: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
        help: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
        close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
        send: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
        loading: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>'
    };

    // =========================================================================
    // CSS Styles (injected dynamically)
    // =========================================================================

    function getStyles(config) {
        const accent = config.accentColor;
        const accentHover = adjustColor(accent, -15);
        const zIndex = config.zIndex;
        
        return `
/* Lumify Widget Styles - Scoped to .lumify-widget-* classes */

/* CSS Variables */
.lumify-widget-root {
    --lw-accent: ${accent};
    --lw-accent-hover: ${accentHover};
    --lw-z-index: ${zIndex};
    
    /* Light theme (default) */
    --lw-bg: #ffffff;
    --lw-bg-secondary: #f9fafb;
    --lw-bg-tertiary: #f3f4f6;
    --lw-text: #1f2937;
    --lw-text-muted: #6b7280;
    --lw-text-light: #9ca3af;
    --lw-border: #e5e7eb;
    --lw-border-focus: #d1d5db;
    --lw-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    --lw-shadow-sm: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --lw-overlay: rgba(0, 0, 0, 0.5);
}

/* Dark theme */
.lumify-widget-root.lw-theme-dark {
    --lw-bg: #1f2937;
    --lw-bg-secondary: #374151;
    --lw-bg-tertiary: #4b5563;
    --lw-text: #f9fafb;
    --lw-text-muted: #d1d5db;
    --lw-text-light: #9ca3af;
    --lw-border: #4b5563;
    --lw-border-focus: #6b7280;
    --lw-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    --lw-overlay: rgba(0, 0, 0, 0.7);
}

/* Reset for widget elements */
.lumify-widget-root,
.lumify-widget-root * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* ===================== Floating Button ===================== */

.lumify-widget-button {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-width: 56px;
    height: 56px;
    padding: 0 20px;
    background: var(--lw-accent);
    color: #ffffff;
    border: none;
    border-radius: 28px;
    cursor: pointer;
    font-size: 15px;
    font-weight: 500;
    box-shadow: var(--lw-shadow-sm), 0 0 0 0 rgba(99, 102, 241, 0.4);
    transition: all 0.2s ease;
    z-index: var(--lw-z-index);
    outline: none;
}

.lumify-widget-button:hover {
    background: var(--lw-accent-hover);
    transform: scale(1.05);
    box-shadow: var(--lw-shadow), 0 0 0 0 rgba(99, 102, 241, 0.4);
}

.lumify-widget-button:active {
    transform: scale(0.98);
}

.lumify-widget-button:focus-visible {
    box-shadow: var(--lw-shadow-sm), 0 0 0 3px rgba(99, 102, 241, 0.4);
}

.lumify-widget-button.lw-icon-only {
    width: 56px;
    padding: 0;
}

.lumify-widget-button svg {
    flex-shrink: 0;
}

/* Position variants */
.lumify-widget-button.lw-bottom-right { bottom: 24px; right: 24px; }
.lumify-widget-button.lw-bottom-left { bottom: 24px; left: 24px; }
.lumify-widget-button.lw-top-right { top: 24px; right: 24px; }
.lumify-widget-button.lw-top-left { top: 24px; left: 24px; }

/* ===================== Modal Overlay ===================== */

.lumify-widget-overlay {
    position: fixed;
    inset: 0;
    background: var(--lw-overlay);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.2s ease, visibility 0.2s ease;
    z-index: calc(var(--lw-z-index) + 1);
}

.lumify-widget-overlay.lw-open {
    opacity: 1;
    visibility: visible;
}

/* ===================== Modal Container ===================== */

.lumify-widget-modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.95);
    width: 90%;
    max-width: 640px;
    max-height: 85vh;
    background: var(--lw-bg);
    border-radius: 16px;
    box-shadow: var(--lw-shadow);
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    z-index: calc(var(--lw-z-index) + 2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.lumify-widget-modal.lw-open {
    opacity: 1;
    visibility: visible;
    transform: translate(-50%, -50%) scale(1);
}

/* ===================== Modal Header ===================== */

.lumify-widget-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--lw-border);
    background: var(--lw-bg-secondary);
}

.lumify-widget-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--lw-text);
}

.lumify-widget-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--lw-text-muted);
    cursor: pointer;
    transition: all 0.15s ease;
}

.lumify-widget-close:hover {
    background: var(--lw-bg-tertiary);
    color: var(--lw-text);
}

/* ===================== Search Form ===================== */

.lumify-widget-search {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    background: var(--lw-bg);
    border-bottom: 1px solid var(--lw-border);
}

.lumify-widget-input {
    flex: 1;
    padding: 12px 16px;
    background: var(--lw-bg-secondary);
    border: 1px solid var(--lw-border);
    border-radius: 10px;
    font-size: 15px;
    color: var(--lw-text);
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.lumify-widget-input::placeholder {
    color: var(--lw-text-light);
}

.lumify-widget-input:focus {
    border-color: var(--lw-accent);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.lumify-widget-submit {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: var(--lw-accent);
    border: none;
    border-radius: 10px;
    color: #ffffff;
    cursor: pointer;
    transition: background 0.15s ease, transform 0.15s ease;
    flex-shrink: 0;
}

.lumify-widget-submit:hover {
    background: var(--lw-accent-hover);
}

.lumify-widget-submit:active {
    transform: scale(0.95);
}

.lumify-widget-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

/* ===================== Results Area ===================== */

.lumify-widget-results {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    min-height: 200px;
    max-height: 400px;
}

.lumify-widget-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: var(--lw-text-muted);
    text-align: center;
}

.lumify-widget-empty-icon {
    margin-bottom: 12px;
    opacity: 0.5;
}

.lumify-widget-empty-text {
    font-size: 14px;
}

/* Loading state */
.lumify-widget-loading {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 0;
    color: var(--lw-text-muted);
    font-size: 14px;
}

.lumify-widget-loading svg {
    color: var(--lw-accent);
}

/* Answer text */
.lumify-widget-answer {
    font-size: 15px;
    line-height: 1.7;
    color: var(--lw-text);
}

.lumify-widget-answer p {
    margin-bottom: 12px;
}

.lumify-widget-answer p:last-child {
    margin-bottom: 0;
}

/* Confidence score */
.lumify-widget-confidence {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--lw-border);
    font-size: 12px;
    color: var(--lw-text-light);
}

/* Structural CTA - Call-to-action links */
.lumify-widget-cta {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--lw-border);
}

.lumify-widget-cta-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--lw-cta-color, #7c3aed);
    font-size: calc(var(--lw-font-size, 15px) * 1.05);
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
}

.lumify-widget-cta-link:hover {
    color: var(--lw-cta-hover, #6d28d9);
}

.lumify-widget-cta-link:hover .lumify-widget-cta-badge {
    background: var(--lw-cta-hover, #6d28d9);
    transform: translateX(2px);
}

.lumify-widget-cta-text {
    text-decoration: underline;
    text-underline-offset: 2px;
}

.lumify-widget-cta-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: var(--lw-cta-color, #7c3aed);
    border-radius: 50%;
    transition: all 0.2s ease;
}

.lumify-widget-cta-badge svg {
    width: 12px;
    height: 12px;
    color: white;
}

/* Dark theme CTA */
.lw-theme-dark .lumify-widget-cta-link {
    color: var(--lw-cta-color, #a78bfa);
}

.lw-theme-dark .lumify-widget-cta-link:hover {
    color: var(--lw-cta-hover, #c4b5fd);
}

.lw-theme-dark .lumify-widget-cta-badge {
    background: var(--lw-cta-color, #a78bfa);
}

.lw-theme-dark .lumify-widget-cta-link:hover .lumify-widget-cta-badge {
    background: var(--lw-cta-hover, #c4b5fd);
}

/* Error state */
.lumify-widget-error {
    padding: 16px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 10px;
    color: #dc2626;
    font-size: 14px;
}

.lumify-widget-error a {
    color: var(--lw-accent);
    text-decoration: underline;
}

/* No results */
.lumify-widget-no-results {
    padding: 20px 0;
    text-align: center;
    color: var(--lw-text-muted);
    font-size: 14px;
}

/* Popular Questions */
.lumify-widget-popular {
    padding: 16px 0 0;
}

.lumify-widget-popular.lw-hidden {
    display: none;
}

.lumify-widget-popular-header {
    font-size: 13px;
    font-weight: 500;
    color: var(--lw-text-muted);
    margin-bottom: 12px;
}

.lumify-widget-popular-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.lumify-widget-popular-item {
    padding: 12px 14px;
    background: var(--lw-bg-secondary);
    border: 1px solid var(--lw-border);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 14px;
    color: var(--lw-text);
    line-height: 1.4;
}

.lumify-widget-popular-item:hover {
    background: var(--lw-bg-tertiary);
    border-color: var(--lw-accent);
    color: var(--lw-accent);
    transform: translateX(4px);
}

.lumify-widget-popular-item:active {
    transform: translateX(2px);
}

/* Citation chips */
.lumify-widget-citation {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1.4em;
    height: 1.4em;
    padding: 0 0.4em;
    margin: 0 2px;
    background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%);
    border: 1px solid #c7d2fe;
    color: #6366f1;
    font-size: 0.75em;
    font-weight: 600;
    text-decoration: none;
    border-radius: 4px;
    vertical-align: middle;
    transition: all 0.15s ease;
    z-index: 1;
}

.lumify-widget-citation:hover {
    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
    border-color: #a5b4fc;
    color: #4f46e5;
    transform: translateY(-1px);
}

.lw-theme-dark .lumify-widget-citation {
    background: linear-gradient(135deg, #3730a3 0%, #4338ca 100%);
    border-color: #6366f1;
    color: #e0e7ff;
}

.lw-theme-dark .lumify-widget-citation:hover {
    background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
    border-color: #818cf8;
    color: #ffffff;
}

/* Citation tooltip */
.lumify-widget-citation:hover {
    z-index: 1001;
}

.lumify-widget-citation-tooltip {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    min-width: 220px;
    max-width: 300px;
    padding: 10px 12px;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.15s ease, visibility 0.15s ease;
    z-index: 1002;
    text-align: left;
    white-space: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 1.4;
}

/* Tooltip arrow pointing up */
.lumify-widget-citation-tooltip::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-bottom-color: #ffffff;
}

.lumify-widget-citation-tooltip::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 7px solid transparent;
    border-bottom-color: #e5e7eb;
}

/* Show tooltip on hover */
.lumify-widget-citation:hover .lumify-widget-citation-tooltip {
    opacity: 1;
    visibility: visible;
}

/* Tooltip flipped above citation */
.lumify-widget-citation-tooltip.tooltip-above::after,
.lumify-widget-citation-tooltip.tooltip-above::before {
    bottom: auto;
    top: 100%;
}
.lumify-widget-citation-tooltip.tooltip-above::after {
    border-bottom-color: transparent;
    border-top-color: #ffffff;
}
.lumify-widget-citation-tooltip.tooltip-above::before {
    border-bottom-color: transparent;
    border-top-color: #e5e7eb;
}

/* Tooltip content layout */
.lumify-widget-citation-tooltip-content {
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

.lumify-widget-citation-favicon {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    border-radius: 4px;
    overflow: hidden;
}

.lumify-widget-citation-favicon img {
    width: 16px;
    height: 16px;
    object-fit: contain;
}

.lumify-widget-citation-info {
    flex: 1;
    min-width: 0;
    overflow: hidden;
}

.lumify-widget-citation-title {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
    line-height: 1.3;
    margin-bottom: 2px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}

.lumify-widget-citation-url {
    display: block;
    font-size: 11px;
    color: #6b7280;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Dark theme tooltip */
.lw-theme-dark .lumify-widget-citation-tooltip {
    background: #1f2937;
    border-color: #374151;
}

.lw-theme-dark .lumify-widget-citation-tooltip::after {
    border-bottom-color: #1f2937;
}

.lw-theme-dark .lumify-widget-citation-tooltip::before {
    border-bottom-color: #374151;
}

.lw-theme-dark .lumify-widget-citation-tooltip.tooltip-above::after {
    border-bottom-color: transparent;
    border-top-color: #1f2937;
}
.lw-theme-dark .lumify-widget-citation-tooltip.tooltip-above::before {
    border-bottom-color: transparent;
    border-top-color: #374151;
}

.lw-theme-dark .lumify-widget-citation-favicon {
    background: #374151;
}

.lw-theme-dark .lumify-widget-citation-title {
    color: #f9fafb;
}

.lw-theme-dark .lumify-widget-citation-url {
    color: #9ca3af;
}

.lw-theme-dark .lumify-widget-error {
    background: #451a1a;
    border-color: #7f1d1d;
    color: #fca5a5;
}

/* ===================== Footer / Branding ===================== */

.lumify-widget-footer {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 20px;
    border-top: 1px solid var(--lw-border);
    background: var(--lw-bg-secondary);
}

.lumify-widget-branding {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--lw-text-light);
    text-decoration: none;
}

.lumify-widget-branding:hover .lumify-widget-branding-link {
    text-decoration: underline;
}

.lumify-widget-branding-link {
    color: var(--lw-accent);
    font-weight: 500;
}

/* ===================== Inline Mode ===================== */

.lumify-widget-inline {
    width: 100%;
    background: var(--lw-bg);
    border: 1px solid var(--lw-border);
    border-radius: 12px;
    overflow: hidden;
}

.lumify-widget-inline .lumify-widget-search {
    border-bottom: none;
}

.lumify-widget-inline .lumify-widget-results {
    border-top: 1px solid var(--lw-border);
    max-height: 500px;
}

.lumify-widget-inline .lumify-widget-results:empty {
    display: none;
    border-top: none;
}

/* ===================== Keyboard Shortcut Hint ===================== */

.lumify-widget-shortcut {
    display: none;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    padding: 4px 8px;
    background: var(--lw-bg-tertiary);
    border-radius: 6px;
    font-size: 11px;
    color: var(--lw-text-light);
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
}

@media (min-width: 768px) {
    .lumify-widget-shortcut {
        display: flex;
    }
}

/* ===================== Mobile Responsive ===================== */

@media (max-width: 640px) {
    .lumify-widget-button {
        width: 52px;
        height: 52px;
        min-width: 52px;
        padding: 0;
        border-radius: 26px;
    }
    
    .lumify-widget-button .lw-button-text {
        display: none;
    }
    
    .lumify-widget-modal {
        width: 100%;
        max-width: none;
        max-height: 100%;
        height: 100%;
        border-radius: 0;
        top: 0;
        left: 0;
        transform: translateY(100%);
    }
    
    .lumify-widget-modal.lw-open {
        transform: translateY(0);
    }
    
    .lumify-widget-results {
        max-height: none;
        flex: 1;
    }
}

/* ===================== Reduced Motion ===================== */

@media (prefers-reduced-motion: reduce) {
    .lumify-widget-button,
    .lumify-widget-overlay,
    .lumify-widget-modal,
    .lumify-widget-input,
    .lumify-widget-submit,
    .lumify-widget-close,
    .lumify-widget-citation {
        transition: none;
    }
}

/* ===================== Print ===================== */

@media print {
    .lumify-widget-button,
    .lumify-widget-overlay,
    .lumify-widget-modal {
        display: none !important;
    }
}
`;
    }

    // =========================================================================
    // Utility Functions
    // =========================================================================

    /**
     * Adjust color brightness
     */
    function adjustColor(color, amount) {
        // Handle hex colors
        let hex = color.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        
        const num = parseInt(hex, 16);
        let r = (num >> 16) + amount;
        let g = ((num >> 8) & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;
        
        r = Math.max(0, Math.min(255, r));
        g = Math.max(0, Math.min(255, g));
        b = Math.max(0, Math.min(255, b));
        
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Detect system theme preference
     */
    function getSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * Detect if running on Mac
     */
    function isMac() {
        return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    }

    /**
     * Get keyboard shortcut display text
     */
    function getShortcutText() {
        return isMac() ? '⌘K' : 'Ctrl+K';
    }

    /**
     * Get favicon URL using Google's favicon service
     */
    function getFaviconUrl(url) {
        if (!url) return '';
        try {
            const urlObj = new URL(url);
            return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
        } catch (e) {
            return '';
        }
    }

    /**
     * Format URL for display (shortened)
     */
    function formatDisplayUrl(url) {
        if (!url) return '';
        try {
            const urlObj = new URL(url);
            let path = urlObj.pathname;
            if (path.length > 30) {
                path = path.substring(0, 27) + '...';
            }
            return urlObj.hostname + path;
        } catch (e) {
            return url.length > 40 ? url.substring(0, 37) + '...' : url;
        }
    }

    /**
     * Extract domain from URL for fallback title
     */
    function extractDomain(url) {
        if (!url) return 'Source';
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace(/^www\./, '');
        } catch (e) {
            return 'Source';
        }
    }

    /**
     * Create HTML for a citation chip with hover tooltip
     * @param {number} num - Citation number
     * @param {Object} source - Source object with url, title, etc.
     * @param {string} linkTarget - Link target (_self or _blank)
     */
    function createCitationChip(num, source, linkTarget = '_blank') {
        const url = escapeHtml(source.url || '');
        const title = escapeHtml(source.title || source.page_title || extractDomain(source.url));
        const displayUrl = formatDisplayUrl(source.url);
        const faviconUrl = getFaviconUrl(source.url);
        const rel = linkTarget === '_blank' ? 'rel="noopener noreferrer"' : '';
        
        return `<a href="${url}" target="${linkTarget}" ${rel} class="lumify-widget-citation" data-citation="${num}">
            ${num}
            <span class="lumify-widget-citation-tooltip">
                <span class="lumify-widget-citation-tooltip-content">
                    <span class="lumify-widget-citation-favicon">
                        <img src="${faviconUrl}" alt="" onerror="this.style.display='none'">
                    </span>
                    <span class="lumify-widget-citation-info">
                        <span class="lumify-widget-citation-title">${title}</span>
                        <span class="lumify-widget-citation-url">${displayUrl}</span>
                    </span>
                </span>
            </span>
        </a>`;
    }

    /**
     * Format answer text with citation links, markdown links, and tooltips
     * @param {string} text - Answer text with [n] citation markers and/or markdown links
     * @param {Array} sources - Array of source objects
     * @param {string} linkTarget - Link target for all links (_self or _blank)
     */
    function formatAnswerWithCitations(text, sources, linkTarget = '_blank') {
        if (!text) return '';
        
        // Step 1: Extract and protect markdown links [text](url) before escaping
        // Store them with placeholders to restore after HTML escaping
        const linkPlaceholders = [];
        let protectedText = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
            const placeholder = `__LINK_PLACEHOLDER_${linkPlaceholders.length}__`;
            const rel = linkTarget === '_blank' ? ' rel="noopener noreferrer"' : '';
            linkPlaceholders.push(`<a href="${escapeHtml(url)}" target="${linkTarget}"${rel}>${escapeHtml(linkText)}</a>`);
            return placeholder;
        });
        
        // Step 2: Escape remaining HTML and convert newlines
        let html = escapeHtml(protectedText).replace(/\n/g, '<br>');
        
        // Step 3: Restore markdown links from placeholders
        linkPlaceholders.forEach((link, index) => {
            html = html.replace(`__LINK_PLACEHOLDER_${index}__`, link);
        });
        
        // Step 4: Replace citation markers [1], [2] with citation chips
        if (sources && sources.length > 0) {
            html = html.replace(/\[(\d+)\]/g, (match, num) => {
                const index = parseInt(num, 10) - 1;
                if (index >= 0 && index < sources.length) {
                    const source = sources[index];
                    return createCitationChip(num, source, linkTarget);
                }
                return match;
            });
        }
        
        return html;
    }

    // =========================================================================
    // Widget Class
    // =========================================================================

    class LumifyWidget {
        constructor(config) {
            this.config = { ...DEFAULTS, ...config };
            // Merge popularQuestions config properly
            this.config.popularQuestions = { ...DEFAULTS.popularQuestions, ...config.popularQuestions };
            this.baseUrl = config.baseUrl || '';
            this.isOpen = false;
            this.isLoading = false;
            this.currentSearch = null;
            this.elements = {};
            
            // Popular questions state
            this._popularQuestionsData = null;
            this._popularQuestionsVisible = false;
            
            this._init();
        }

        /**
         * Initialize the widget
         */
        _init() {
            // Inject styles
            this._injectStyles();
            
            // Determine and apply theme
            this._applyTheme();
            
            // Create UI based on mode
            switch (this.config.mode) {
                case 'inline':
                    this._createInlineUI();
                    break;
                case 'trigger':
                    this._createTriggerUI();
                    break;
                case 'floating':
                default:
                    this._createFloatingUI();
                    break;
            }
            
            // Bind keyboard shortcuts
            if (this.config.keyboardShortcut && this.config.mode !== 'inline') {
                this._bindKeyboardShortcut();
            }
            
            // Listen for system theme changes
            if (this.config.theme === 'auto') {
                this._watchThemeChanges();
            }
        }

        /**
         * Inject CSS styles into the page
         */
        _injectStyles() {
            if (document.getElementById('lumify-widget-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'lumify-widget-styles';
            style.textContent = getStyles(this.config);
            document.head.appendChild(style);
        }

        /**
         * Apply theme class
         */
        _applyTheme() {
            const theme = this.config.theme === 'auto' ? getSystemTheme() : this.config.theme;
            this.currentTheme = theme;
        }

        /**
         * Watch for system theme changes
         */
        _watchThemeChanges() {
            if (!window.matchMedia) return;
            
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                this.currentTheme = e.matches ? 'dark' : 'light';
                this._updateThemeClass();
            });
        }

        /**
         * Update theme class on root elements and modal
         */
        _updateThemeClass() {
            const themeElements = document.querySelectorAll('.lumify-widget-root, .lumify-widget-modal');
            themeElements.forEach(el => {
                el.classList.remove('lw-theme-light', 'lw-theme-dark');
                el.classList.add(`lw-theme-${this.currentTheme}`);
            });
        }

        /**
         * Create floating button UI
         */
        _createFloatingUI() {
            // Create root container
            const root = document.createElement('div');
            root.className = `lumify-widget-root lw-theme-${this.currentTheme}`;
            
            // Create floating button
            const button = document.createElement('button');
            button.className = `lumify-widget-button lw-${this.config.position}`;
            button.setAttribute('aria-label', 'Open search');
            button.setAttribute('type', 'button');
            
            // Add icon
            if (this.config.buttonIcon !== 'none') {
                button.innerHTML = ICONS[this.config.buttonIcon] || ICONS.search;
            }
            
            // Add text if provided
            if (this.config.buttonText) {
                const text = document.createElement('span');
                text.className = 'lw-button-text';
                text.textContent = this.config.buttonText;
                button.appendChild(text);
            } else {
                button.classList.add('lw-icon-only');
            }
            
            button.addEventListener('click', () => this.open());
            
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'lumify-widget-overlay';
            overlay.addEventListener('click', () => this.close());
            
            // Create modal
            const modal = this._createModal();
            
            // Store references
            this.elements.root = root;
            this.elements.button = button;
            this.elements.overlay = overlay;
            this.elements.modal = modal;
            
            // Append to DOM
            root.appendChild(button);
            root.appendChild(overlay);
            root.appendChild(modal);
            document.body.appendChild(root);
        }

        /**
         * Create inline UI
         */
        _createInlineUI() {
            // Find container
            const container = this.config.containerSelector 
                ? document.querySelector(this.config.containerSelector)
                : this._findScriptParent();
            
            if (!container) {
                console.error('LumifyWidget: Container not found for inline mode');
                return;
            }
            
            // Create root
            const root = document.createElement('div');
            root.className = `lumify-widget-root lumify-widget-inline lw-theme-${this.currentTheme}`;
            
            // Create search form
            const searchForm = this._createSearchForm();
            
            // Create results area
            const results = document.createElement('div');
            results.className = 'lumify-widget-results';
            results.innerHTML = this._getEmptyState();
            
            // Store references
            this.elements.root = root;
            this.elements.results = results;
            
            // Append
            root.appendChild(searchForm);
            root.appendChild(results);
            container.appendChild(root);
            
            // Initialize popular questions for inline mode
            if (this.config.popularQuestions.enabled) {
                this._initPopularQuestions();
            }
        }

        /**
         * Create trigger mode UI
         */
        _createTriggerUI() {
            const trigger = document.querySelector(this.config.triggerSelector);
            if (!trigger) {
                console.error('LumifyWidget: Trigger element not found:', this.config.triggerSelector);
                return;
            }
            
            // Create root container (just overlay + modal)
            const root = document.createElement('div');
            root.className = `lumify-widget-root lw-theme-${this.currentTheme}`;
            
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'lumify-widget-overlay';
            overlay.addEventListener('click', () => this.close());
            
            // Create modal
            const modal = this._createModal();
            
            // Store references
            this.elements.root = root;
            this.elements.overlay = overlay;
            this.elements.modal = modal;
            
            // Bind trigger click
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.open();
            });
            
            // Append to DOM
            root.appendChild(overlay);
            root.appendChild(modal);
            document.body.appendChild(root);
        }

        /**
         * Create modal element
         */
        _createModal() {
            const modal = document.createElement('div');
            modal.className = `lumify-widget-modal lumify-widget-root lw-theme-${this.currentTheme}`;
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-label', 'Search');
            
            // Header
            const header = document.createElement('div');
            header.className = 'lumify-widget-header';
            
            const title = document.createElement('span');
            title.className = 'lumify-widget-title';
            title.textContent = this.config.modalTitle;
            
            // Keyboard shortcut hint
            if (this.config.keyboardShortcut) {
                const shortcut = document.createElement('span');
                shortcut.className = 'lumify-widget-shortcut';
                shortcut.textContent = getShortcutText();
                header.appendChild(title);
                header.appendChild(shortcut);
            } else {
                header.appendChild(title);
            }
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'lumify-widget-close';
            closeBtn.setAttribute('aria-label', 'Close');
            closeBtn.setAttribute('type', 'button');
            closeBtn.innerHTML = ICONS.close;
            closeBtn.addEventListener('click', () => this.close());
            header.appendChild(closeBtn);
            
            // Search form
            const searchForm = this._createSearchForm();
            
            // Results
            const results = document.createElement('div');
            results.className = 'lumify-widget-results';
            results.innerHTML = this._getEmptyState();
            
            // Footer
            const footer = this._createFooter();
            
            // Store references
            this.elements.results = results;
            
            // Assemble
            modal.appendChild(header);
            modal.appendChild(searchForm);
            modal.appendChild(results);
            if (footer) {
                modal.appendChild(footer);
            }
            
            return modal;
        }

        /**
         * Create search form
         */
        _createSearchForm() {
            const form = document.createElement('form');
            form.className = 'lumify-widget-search';
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this._performSearch();
            });
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'lumify-widget-input';
            input.placeholder = this.config.placeholder;
            input.setAttribute('autocomplete', 'off');
            input.setAttribute('maxlength', '500');
            
            // Popular questions visibility handlers
            if (this.config.popularQuestions.enabled) {
                input.addEventListener('input', () => {
                    if (input.value.trim().length > 0) {
                        this._hidePopularQuestions();
                    }
                });
                
                input.addEventListener('focus', () => {
                    if (!input.value.trim() && this._popularQuestionsData?.length > 0) {
                        this._showPopularQuestions();
                    }
                });
            }
            
            const submit = document.createElement('button');
            submit.type = 'submit';
            submit.className = 'lumify-widget-submit';
            submit.setAttribute('aria-label', 'Search');
            submit.innerHTML = ICONS.send;
            
            this.elements.input = input;
            this.elements.submit = submit;
            
            form.appendChild(input);
            form.appendChild(submit);
            
            return form;
        }

        /**
         * Create footer with branding
         */
        _createFooter() {
            if (!this.config.showBranding) return null;
            
            const footer = document.createElement('div');
            footer.className = 'lumify-widget-footer';
            
            const branding = document.createElement('a');
            branding.className = 'lumify-widget-branding';
            branding.href = 'https://www.lumify.ai?ref=widget';
            branding.target = '_blank';
            branding.rel = 'noopener';
            branding.innerHTML = `Powered by <span class="lumify-widget-branding-link">Lumify</span>`;
            
            footer.appendChild(branding);
            return footer;
        }

        /**
         * Get empty state HTML
         */
        _getEmptyState() {
            let html = `
                <div class="lumify-widget-empty">
                    <div class="lumify-widget-empty-icon">${ICONS.search}</div>
                    <div class="lumify-widget-empty-text">${this.config.emptyText}</div>
                </div>
            `;
            
            // Add popular questions container if enabled (starts hidden)
            if (this.config.popularQuestions.enabled) {
                html += `
                    <div class="lumify-widget-popular lw-hidden">
                        <div class="lumify-widget-popular-header">Popular questions:</div>
                        <ul class="lumify-widget-popular-list"></ul>
                    </div>
                `;
            }
            
            return html;
        }

        /**
         * Find parent element of script tag
         */
        _findScriptParent() {
            const scripts = document.querySelectorAll('script[src*="lumify-widget"]');
            if (scripts.length > 0) {
                return scripts[scripts.length - 1].parentElement;
            }
            return document.body;
        }

        /**
         * Bind keyboard shortcut (Cmd/Ctrl + K)
         */
        _bindKeyboardShortcut() {
            document.addEventListener('keydown', (e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    if (this.isOpen) {
                        this.close();
                    } else {
                        this.open();
                    }
                }
                
                // Escape to close
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        }

        /**
         * Open the modal
         */
        open() {
            if (this.isOpen || this.config.mode === 'inline') return;
            
            this.isOpen = true;
            
            if (this.elements.overlay) {
                this.elements.overlay.classList.add('lw-open');
            }
            if (this.elements.modal) {
                this.elements.modal.classList.add('lw-open');
            }
            
            // Focus input
            setTimeout(() => {
                if (this.elements.input) {
                    this.elements.input.focus();
                }
            }, 100);
            
            // Initialize popular questions on first open
            if (this.config.popularQuestions.enabled && !this._popularQuestionsData) {
                this._initPopularQuestions();
            } else if (this._popularQuestionsData && !this.elements.input?.value.trim()) {
                this._showPopularQuestions();
            }
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        }

        /**
         * Close the modal
         */
        close() {
            if (!this.isOpen) return;
            
            this.isOpen = false;
            
            if (this.elements.overlay) {
                this.elements.overlay.classList.remove('lw-open');
            }
            if (this.elements.modal) {
                this.elements.modal.classList.remove('lw-open');
            }
            
            // Restore body scroll
            document.body.style.overflow = '';
        }

        /**
         * Perform search
         */
        async _performSearch() {
            const query = this.elements.input?.value.trim();
            if (!query) return;
            
            // Cancel any existing search
            if (this.currentSearch) {
                this.currentSearch.abort();
            }
            
            this.isLoading = true;
            this._showLoading();
            
            const controller = new AbortController();
            this.currentSearch = controller;
            
            try {
                const response = await fetch(this.config.apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`
                    },
                    body: JSON.stringify({
                        query: query,
                        application_id: this.config.appId,
                        answer_mode: this.config.answerMode,
                        similar_questions: this.config.similarQuestions
                    }),
                    signal: controller.signal
                });
                
                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        throw new Error('AUTH_ERROR');
                    }
                    throw new Error(`HTTP ${response.status}`);
                }
                
                const data = await response.json();
                this._displayResults(data);
                
            } catch (error) {
                if (error.name !== 'AbortError') {
                    this._displayError(error.message);
                }
            } finally {
                this.isLoading = false;
                this.currentSearch = null;
            }
        }

        /**
         * Show loading state
         */
        _showLoading() {
            if (this.elements.results) {
                this.elements.results.innerHTML = `
                    <div class="lumify-widget-loading">
                        ${ICONS.loading}
                        <span>Thinking...</span>
                    </div>
                `;
            }
            
            if (this.elements.submit) {
                this.elements.submit.disabled = true;
                this.elements.submit.innerHTML = ICONS.loading;
            }
        }

        /**
         * Display search results
         */
        _displayResults(data) {
            if (this.elements.submit) {
                this.elements.submit.disabled = false;
                this.elements.submit.innerHTML = ICONS.send;
            }
            
            if (!this.elements.results) return;
            
            if (!data.success) {
                this._displayError(data.error?.message || data.error || 'Search failed');
                return;
            }
            
            let html = '';
            
            // Get link target from API response metadata, fall back to widget config, then default
            const linkTarget = data.metadata?.link_target || this.config.ctaTarget || '_self';
            
            // Display answer
            if (data.direct_answer?.answer) {
                const sources = data.direct_answer.sources || [];
                const answerHtml = formatAnswerWithCitations(data.direct_answer.answer, sources, linkTarget);
                
                html += `<div class="lumify-widget-answer">${answerHtml}</div>`;
                
                // Display structural CTA if present
                if (data.direct_answer?.cta) {
                    const cta = data.direct_answer.cta;
                    // Pass linkTarget as fallback for CTA if not set in cta.target
                    html += this._renderCTA(cta, linkTarget);
                }
                
                if (data.confidence_score) {
                    html += `<div class="lumify-widget-confidence">Confidence: ${Math.round(data.confidence_score * 100)}%</div>`;
                }
            }
            
            // Handle no results
            if (!data.direct_answer?.answer) {
                if (data.no_results) {
                    html += `<div class="lumify-widget-no-results">${escapeHtml(data.no_results.message || 'No results found.')}</div>`;
                } else {
                    html += `<div class="lumify-widget-no-results">No results found for your search.</div>`;
                }
            }
            
            this.elements.results.innerHTML = html;
            
            // Initialize citation tooltip positioning
            this._initCitationTooltips();
        }

        /**
         * Initialize citation tooltips to stay within viewport
         */
        _initCitationTooltips() {
            const container = this.elements.results;
            if (!container) return;
            
            const citations = container.querySelectorAll('.lumify-widget-citation');
            
            citations.forEach(citation => {
                const tooltip = citation.querySelector('.lumify-widget-citation-tooltip');
                if (!tooltip) return;
                
                citation.addEventListener('mouseenter', () => {
                    // Reset positioning
                    tooltip.style.left = '50%';
                    tooltip.style.right = '';
                    tooltip.style.top = '';
                    tooltip.style.bottom = '';
                    tooltip.style.transform = 'translateX(-50%)';
                    tooltip.classList.remove('tooltip-above');
                    
                    // Wait for CSS to apply, then check bounds
                    requestAnimationFrame(() => {
                        const tooltipRect = tooltip.getBoundingClientRect();
                        const citationRect = citation.getBoundingClientRect();
                        const containerRect = container.getBoundingClientRect();
                        const modalRect = this.elements.modal ? 
                            this.elements.modal.getBoundingClientRect() : 
                            containerRect;
                        
                        const padding = 12;
                        const bottomPadding = 60; // Account for footer
                        let transformX = '-50%';
                        
                        // Check if overflowing bottom - flip to show above
                        // Use results container bottom, not full modal (excludes footer)
                        const effectiveBottom = Math.min(containerRect.bottom, modalRect.bottom - bottomPadding);
                        if (tooltipRect.bottom > effectiveBottom) {
                            tooltip.style.top = 'auto';
                            tooltip.style.bottom = 'calc(100% + 8px)';
                            tooltip.classList.add('tooltip-above');
                        }
                        
                        // Check if overflowing left
                        if (tooltipRect.left < modalRect.left + padding) {
                            const offset = (modalRect.left + padding) - tooltipRect.left;
                            transformX = `calc(-50% + ${offset}px)`;
                        }
                        // Check if overflowing right
                        else if (tooltipRect.right > modalRect.right - padding) {
                            const offset = tooltipRect.right - (modalRect.right - padding);
                            transformX = `calc(-50% - ${offset}px)`;
                        }
                        
                        tooltip.style.transform = `translateX(${transformX})`;
                    });
                });
            });
        }

        /**
         * Render structural CTA with ion violet badge
         * 
         * CTAs are displayed at the end of answers to direct users to
         * relevant structural pages (login, password reset, order tracking, etc.)
         * 
         * @param {Object} cta - CTA object with text, url, type, title, target
         * @param {string} fallbackTarget - Fallback target from API metadata
         * @returns {string} HTML string
         */
        _renderCTA(cta, fallbackTarget = '_self') {
            if (!cta || !cta.url || !cta.text) {
                return '';
            }
            
            const escapedText = escapeHtml(cta.text);
            const escapedUrl = escapeHtml(cta.url);
            const escapedTitle = escapeHtml(cta.title || cta.text);
            
            // Use target from CTA response (per-answer override), then API metadata, then widget config
            const target = cta.target || fallbackTarget || this.config.ctaTarget || '_self';
            // Only add rel="noopener noreferrer" for external links (_blank)
            const rel = target === '_blank' ? 'rel="noopener noreferrer"' : '';
            
            return `
                <div class="lumify-widget-cta">
                    <a href="${escapedUrl}" 
                       target="${target}" 
                       ${rel}
                       class="lumify-widget-cta-link"
                       title="${escapedTitle}">
                        <span class="lumify-widget-cta-text">${escapedText}</span>
                        <span class="lumify-widget-cta-badge" aria-hidden="true">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </span>
                    </a>
                </div>
            `;
        }

        /**
         * Display error
         */
        _displayError(message) {
            if (this.elements.submit) {
                this.elements.submit.disabled = false;
                this.elements.submit.innerHTML = ICONS.send;
            }
            
            if (!this.elements.results) return;
            
            if (message === 'AUTH_ERROR') {
                this.elements.results.innerHTML = `
                    <div class="lumify-widget-error">
                        <strong>Authentication Error:</strong> API credentials not recognized.
                        <br><br>
                        <small>Visit <a href="https://www.lumify.ai" target="_blank" rel="noopener">lumify.ai</a> to get your API keys.</small>
                    </div>
                `;
            } else {
                this.elements.results.innerHTML = `
                    <div class="lumify-widget-error">
                        Search failed: ${escapeHtml(message)}
                        <br><br>
                        <small>Please try again or contact support if the problem persists.</small>
                    </div>
                `;
            }
        }

        /**
         * Search programmatically
         */
        search(query) {
            if (this.elements.input) {
                this.elements.input.value = query;
            }
            this._performSearch();
        }

        /**
         * Initialize popular questions feature
         */
        async _initPopularQuestions() {
            if (!this.config.popularQuestions.enabled) return;
            
            const questions = await this._loadPopularQuestions();
            if (questions && questions.length > 0) {
                this._renderPopularQuestions(questions);
                this._showPopularQuestions();
            }
        }

        /**
         * Load popular questions from cache or API
         */
        async _loadPopularQuestions() {
            // Try cache first
            const cached = this._getCachedPopularQuestions();
            if (cached) {
                this._popularQuestionsData = cached;
                return cached;
            }
            
            // Show fallback immediately while fetching
            if (this.config.popularQuestions.fallback.length > 0) {
                this._popularQuestionsData = this.config.popularQuestions.fallback;
                this._renderPopularQuestions(this.config.popularQuestions.fallback);
                this._showPopularQuestions();
            }
            
            // Fetch from API
            try {
                const questions = await this._fetchPopularQuestions();
                if (questions && questions.length > 0) {
                    this._popularQuestionsData = questions;
                    this._setCachedPopularQuestions(questions);
                    if (this._popularQuestionsVisible) {
                        this._renderPopularQuestions(questions);
                    }
                }
                return questions;
            } catch (error) {
                console.warn('LumifyWidget: Failed to fetch popular questions:', error);
                return this.config.popularQuestions.fallback;
            }
        }

        /**
         * Fetch popular questions from API
         */
        async _fetchPopularQuestions() {
            const endpoint = this._getPopularQuestionsEndpoint();
            
            const response = await fetch(`${endpoint}?app_id=${encodeURIComponent(this.config.appId)}&limit=${this.config.popularQuestions.maxDisplay}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.apiKey}`
                }
            });
            
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const data = await response.json();
            if (data.success && data.questions) {
                if (data.cache_hint) {
                    this.config.popularQuestions.cacheTTL = data.cache_hint;
                }
                return data.questions;
            }
            return [];
        }

        /**
         * Get the popular questions endpoint URL
         */
        _getPopularQuestionsEndpoint() {
            if (this.config.apiEndpoint.includes('/search.php')) {
                return this.config.apiEndpoint.replace('/search.php', '/popular-questions.php');
            }
            const baseUrl = this.config.apiEndpoint.substring(0, this.config.apiEndpoint.lastIndexOf('/'));
            return baseUrl + '/popular-questions.php';
        }

        /**
         * Get cached popular questions
         */
        _getCachedPopularQuestions() {
            if (this.config.popularQuestions.cacheStrategy === 'none') return null;
            
            const storage = this.config.popularQuestions.cacheStrategy === 'sessionStorage' 
                ? sessionStorage : localStorage;
            const cacheKey = `lumify_popular_${this.config.appId}`;
            
            try {
                const cached = storage.getItem(cacheKey);
                if (!cached) return null;
                
                const data = JSON.parse(cached);
                const now = Date.now() / 1000;
                
                if (data.timestamp && (now - data.timestamp) < this.config.popularQuestions.cacheTTL) {
                    return data.questions;
                }
                storage.removeItem(cacheKey);
                return null;
            } catch (e) {
                return null;
            }
        }

        /**
         * Set cached popular questions
         */
        _setCachedPopularQuestions(questions) {
            if (this.config.popularQuestions.cacheStrategy === 'none') return;
            
            const storage = this.config.popularQuestions.cacheStrategy === 'sessionStorage' 
                ? sessionStorage : localStorage;
            const cacheKey = `lumify_popular_${this.config.appId}`;
            
            try {
                storage.setItem(cacheKey, JSON.stringify({
                    questions: questions,
                    timestamp: Date.now() / 1000
                }));
            } catch (e) {
                console.warn('LumifyWidget: Failed to cache popular questions:', e);
            }
        }

        /**
         * Render popular questions
         */
        _renderPopularQuestions(questions) {
            const container = this.elements.results;
            if (!container) return;
            
            const popularContainer = container.querySelector('.lumify-widget-popular');
            if (!popularContainer) return;
            
            const list = popularContainer.querySelector('.lumify-widget-popular-list');
            if (!list) return;
            
            list.innerHTML = questions.map(q => `
                <li class="lumify-widget-popular-item" data-question="${escapeHtml(q)}">${escapeHtml(q)}</li>
            `).join('');
            
            // Add click handlers
            list.querySelectorAll('.lumify-widget-popular-item').forEach(item => {
                item.addEventListener('click', () => {
                    const question = item.dataset.question;
                    this._selectPopularQuestion(question);
                });
            });
        }

        /**
         * Show popular questions
         */
        _showPopularQuestions() {
            const container = this.elements.results?.querySelector('.lumify-widget-popular');
            if (container && this._popularQuestionsData?.length > 0) {
                container.classList.remove('lw-hidden');
                this._popularQuestionsVisible = true;
                
                // Hide the empty state
                const emptyState = this.elements.results?.querySelector('.lumify-widget-empty');
                if (emptyState) emptyState.style.display = 'none';
            }
        }

        /**
         * Hide popular questions
         */
        _hidePopularQuestions() {
            const container = this.elements.results?.querySelector('.lumify-widget-popular');
            if (container) {
                container.classList.add('lw-hidden');
                this._popularQuestionsVisible = false;
            }
        }

        /**
         * Handle selection of a popular question
         */
        _selectPopularQuestion(question) {
            if (this.elements.input) {
                this.elements.input.value = question;
                this.elements.input.focus();
            }
            this._hidePopularQuestions();
            this._performSearch();
        }

        /**
         * Destroy the widget
         */
        destroy() {
            if (this.currentSearch) {
                this.currentSearch.abort();
            }
            
            if (this.elements.root) {
                this.elements.root.remove();
            }
            
            const styles = document.getElementById('lumify-widget-styles');
            if (styles) {
                styles.remove();
            }
            
            document.body.style.overflow = '';
        }
    }

    // =========================================================================
    // Auto-initialization
    // =========================================================================

    function init() {
        // Find the script tag
        const scripts = document.querySelectorAll('script[src*="lumify-widget"]');
        const script = scripts[scripts.length - 1];
        
        if (!script) {
            console.error('LumifyWidget: Script tag not found');
            return;
        }
        
        // Extract base URL from script src (for assets like logo)
        const scriptSrc = script.src || '';
        let baseUrl = '';
        if (scriptSrc) {
            const url = new URL(scriptSrc);
            baseUrl = url.origin;
        }
        
        // Parse popular questions fallback from JSON string
        let popularQuestionsFallback = [];
        try {
            const fallbackAttr = script.dataset.popularQuestionsFallback || script.getAttribute('data-popular-questions-fallback');
            if (fallbackAttr) {
                popularQuestionsFallback = JSON.parse(fallbackAttr);
            }
        } catch (e) {
            console.warn('LumifyWidget: Invalid popular-questions-fallback JSON:', e);
        }
        
        // Parse configuration from data attributes
        const config = {
            apiKey: script.dataset.apiKey || script.getAttribute('data-api-key'),
            appId: script.dataset.appId || script.getAttribute('data-app-id'),
            mode: script.dataset.mode || 'floating',
            position: script.dataset.position || 'bottom-right',
            theme: script.dataset.theme || 'auto',
            accentColor: script.dataset.accentColor || '#6366f1',
            buttonText: script.dataset.buttonText || '',
            buttonIcon: script.dataset.buttonIcon || 'search',
            placeholder: script.dataset.placeholder || 'Ask anything...',
            keyboardShortcut: script.dataset.keyboardShortcut !== 'false',
            showBranding: script.dataset.showBranding !== 'false',
            zIndex: parseInt(script.dataset.zIndex) || 9999,
            emptyText: script.dataset.emptyText || 'Ask a question to get started',
            modalTitle: script.dataset.modalTitle || 'Search',
            triggerSelector: script.dataset.triggerSelector,
            containerSelector: script.dataset.containerSelector,
            ctaTarget: script.dataset.ctaTarget || '_self',
            baseUrl: baseUrl,
            // Popular questions configuration
            popularQuestions: {
                enabled: script.dataset.popularQuestions === 'true',
                maxDisplay: parseInt(script.dataset.popularQuestionsMax) || 5,
                cacheStrategy: script.dataset.popularQuestionsCache || 'localStorage',
                cacheTTL: parseInt(script.dataset.popularQuestionsTtl) || 86400,
                fallback: popularQuestionsFallback
            }
        };
        
        // Validate required fields
        if (!config.apiKey) {
            console.error('LumifyWidget: data-api-key is required');
            return;
        }
        if (!config.appId) {
            console.error('LumifyWidget: data-app-id is required');
            return;
        }
        
        // Create widget instance
        window.LumifyWidget = new LumifyWidget(config);
        window.LumifyWidget._initialized = true;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

