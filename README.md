# EventPilot AI — Intelligent Event Planning & Budget Optimization Platform

EventPilot AI is a production-minded, GenAI-powered event planning assistant and financial optimization workspace built with React 19, TypeScript, Express, Tailwind CSS, and the Google GenAI SDK (`@google/genai`).

From idea to organized event — with precision budget math in rupees/minor currency units, date-aware preparation timelines, and categorized vendor selection checklists.

---

## 1. System Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser Client                        │
│  - React 19 SPA + TypeScript + Tailwind CSS                 │
│  - Presentation: Dashboard, Budget, Timeline, Vendors       │
│  - Local Repository: Versioned storage, Undo/Redo stack    │
│  - Precision Money Math: Integer minor currency units       │
└──────────────────────────────▲──────────────────────────────┘
                               │ HTTP /api/plan/*
┌──────────────────────────────▼──────────────────────────────┐
│                  Express Node.js Server                     │
│  - /api/plan/generate (Full Master Plan Generation)         │
│  - /api/plan/regenerate-section (Targeted AI Optimization)  │
│  - /api/health (Service diagnostic & key verification)      │
│  - Secure Boundary: Credentials isolated on server          │
└──────────────────────────────▲──────────────────────────────┘
                               │ Google GenAI SDK
┌──────────────────────────────▼──────────────────────────────┐
│                    Google Gemini AI                         │
│  - Model: gemini-3.8-flash                                  │
│  - Structured JSON Output & Response Schemas                │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend**: React 19, TypeScript, Lucide Icons, Tailwind CSS v4, Motion.
- **Backend**: Node.js, Express, tsx.
- **AI Service**: `@google/genai` (SDK 2.4.0) using model `gemini-3.8-flash` with structured JSON output and defensive schema normalization.
- **Persistence**: Type-safe local storage repository with schema versioning (`schemaVersion: 1`), multi-plan indexing, 20-step undo/redo stack, and JSON import/export.
- **Precision Financials**: Integer minor units (paise/cents) to eliminate IEEE-754 floating-point inaccuracies; Indian numbering system (`₹8,00,000`, `₹1.5 Cr`) and international currency standards.

---

## 2. Core Features Completed

1. **End-to-End User Journey**:
   - **Quick-Start & Natural Language Launch**: Natural language input with benchmark presets (Pune Wedding ₹8L, College Tech Fest 1,200 students, 50th Anniversary, Charity Gala).
   - **Interactive Setup Wizard**: 4-step progressive disclosure modal with inline validation, currency selection, guest scale, venue preferences, dietary options, and accessibility accommodations.
2. **Precision Budget Intelligence**:
   - Integer paise math with zero floating-point errors.
   - Dynamic contingency reserve slider (0% to 25%) separated from committed expenses to prevent double-counting.
   - Automatic budget overrun detection with percentage calculation and actionable cost-saving recommendations.
   - Categorized line-item editor with quantity, unit cost, payment status (`unpaid`, `deposit_paid`, `paid_in_full`, `waived`), and actual bill tracking.
   - Visual category spend breakdown with accessible table alternative.
3. **Date-Aware Preparation Timeline**:
   - Reverse-scheduled task milestones calculated from the event date.
   - Automated detection of overdue tasks, post-event tasks, and dependency conflict schedules.
   - Interactive milestone checklist, priority badges, category filters, and custom task creation.
4. **Vendor Sourcing & Quotation Tracker**:
   - Categorized vendor guidance cards with vetting criteria checklists.
   - Target booking lock dates and quotation status tracker (`Not Started`, `Contacted`, `Quote Received`, `Negotiating`, `Confirmed`, `Cancelled`).
   - Honest AI disclosure notice stating recommendations are guidance rather than verified businesses or guaranteed rates.
   - Storage for real contracted contact details (name, phone, email) and custom notes.
5. **Theme, Aesthetics & Sustainability Board**:
   - Curated visual themes with color hex palettes, vibe, and cultural harmony context.
   - Direct "Adopt into Plan" button that turns aesthetic ideas into preparation tasks.
   - Eco-friendly recommendations and practical cost-saving alternatives.
6. **Guest & Logistics Space Calculator**:
   - Square footage calculation (~22 sq.ft/guest for banquet dining and circulation).
   - Per-head catering projections with dietary breakdown (Vegetarian, Non-Veg, Jain, Special).
   - Accessibility standards (wheelchair ramps, handrails, front elder seating, step-free access).
7. **Risk & Contingency Command**:
   - Probability × Severity matrix for weather, vendor, budget, and logistical vectors.
   - Preventative mitigation instructions and day-of emergency contingency actions.
8. **Export & Print**:
   - CSV export for Budget, Preparation Timeline, and Vendor Checklist.
   - Markdown export for Executive Master Brief.
   - Print-optimized CSS (`@media print`) layout ready for printer or browser PDF generation.
9. **Selective AI Re-Optimization**:
   - Allows users to re-balance or re-optimize individual sections (Budget, Timeline, Vendors, Themes, Risks) with custom prompts without discarding other progress.

---

## 3. Automated Verification & Test Results

Executed automated test suite via Vitest (`npm test`):
- **Test Files**: 3 passed (`currency.test.ts`, `timeline.test.ts`, `validation.test.ts`)
- **Tests**: 13 passed, 0 failed
- **Execution Time**: ~650ms

Test coverage includes:
- Major/minor currency unit conversions and precision integer rounding.
- Indian numbering system formatting (`formatIndianNumber`, `formatCompactCurrency` for Lakhs and Crores).
- Budget aggregation, remaining budget math, and contingency reserve separation.
- Budget overrun and percentage calculations.
- Days between calculation and target date backward offsets.
- Schedule validation: overdue task detection, post-event flags, dependency conflicts.
- Event input boundary conditions and form validation.
- XSS prevention and script tag sanitization.
- Malformed AI response defensive normalization.

---

## 4. Security & Accessibility Conformance

### Security:
- **Zero API Key Leakage**: Gemini API key is accessed strictly via `process.env.GEMINI_API_KEY` on the Node.js server. No keys or privileged tokens exist in client bundles.
- **Untrusted Input Sanitization**: All user inputs and AI outputs pass through `sanitizeText` to strip dangerous HTML and scripts.
- **Prompt Injection Defense**: User instructions are treated as data contained in `<event_request>` delimiters rather than system instructions.
- **Privacy**: Local-first storage guarantees guest lists, vendor contacts, and private budgets remain in the user's browser storage.

### Accessibility (WCAG 2.2 AA):
- Semantic HTML landmarks (`<header>`, `<main>`, `<nav>`, `<aside>`, `<table role="region">`).
- Accessible modal dialogs with `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
- Visible focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-500`).
- Screen reader announcements using an `aria-live="polite"` toast notification container.
- High color contrast compliant with WCAG AA ratios across cards, status badges, and typography.

---

## 5. Development & Deployment

### Run locally:
```bash
# 1. Install dependencies
npm install

# 2. Run automated tests
npm test

# 3. Start full-stack dev server
npm run dev

# 4. Compile and verify build
npm run build
```
