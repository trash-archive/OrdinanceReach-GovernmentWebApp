# OrdinanceFlow Cebu
## System Concept & Development Documentation

**Project:** Cebu Solutionsfest 2026 — Ordinance Reach Track  
**Source Problem:** Office of the City Councilor, Cebu City  
**Last Updated:** May 2026

---

## 1. Project Overview

OrdinanceFlow Cebu is a digital system designed to close the gap between ordinance creation and actual enforcement in Cebu City. The system centralizes ordinance access, automates office notifications, tracks compliance, and provides a public-facing portal for citizen transparency — all within a unified platform built on two separate but connected applications.

---

## 2. The Problem

Cebu City produces well-structured ordinances through the Sangguniang Panlungsod, but many implementing offices are not consistently informed or fully aware of newly passed policies. This leads to:

- Delayed implementation across departments
- Inconsistent enforcement between offices
- Lack of awareness among department heads and barangay officials
- Poor public accessibility to legal information
- No structured accountability mechanism for compliance

---

## 3. System Architecture

OrdinanceFlow Cebu is split into two applications that share the same ordinance data:

### 3.1 Government Web App (`/government-web-app`)
Internal portal for City Council staff, department heads, and system administrators. Role-based access controls what each user can see and do.

### 3.2 Public Web Portal (`/public-web-portal`)
Citizen-facing website. No login required. Allows the public to browse, search, and read ordinances, and interact with an AI assistant for plain-language explanations.

---

## 4. Government Web App — Features

### 4.1 Role-Based Authentication

Six user roles are supported, each with appropriate access:

| Role | Access Level |
|------|-------------|
| Ordinance Encoder | Full admin dashboard — encode, publish, assign offices |
| Department Head | Isolated dept portal — view assignments, submit reports |
| Barangay Official | View assigned ordinances and submit barangay reports |
| Enforcement Officer | View active ordinances relevant to enforcement |
| Records / Admin Staff | View and manage ordinance repository |
| System Administrator | Full system access including user management and audit logs |

**First-login security flow:** Department heads and new accounts are forced to set a permanent password on first login, with real-time password strength validation (length, uppercase, number, special character requirements).

All sessions are logged. The login screen displays a security notice that all actions are monitored.

---

### 4.2 Ordinance Encoder Dashboard

The main landing screen for City Council encoders. Displays:

- **Stat cards:** Active ordinances count, departments assigned, overdue reports, drafts in queue
- **Overdue alert banner:** Highlights departments that have missed compliance deadlines with a direct link to the Compliance Tracking screen
- **Recent ordinances table:** Latest published ordinances with status badges
- **Compliance overview:** Visual progress bars showing compliant / in-progress / delayed / pending department counts
- **Alerts panel:** Latest system notifications (new publications, deadline warnings, report submissions)
- **Department status summary table:** All departments with head name, assigned/completed counts, compliance status, and last update — with OVERDUE tags for flagged offices

---

### 4.3 Ordinance Repository

Centralized database of all ordinances with full search, filter, and sort capabilities.

**Toolbar features:**
- Full-text search by title, ordinance number, or category
- Status filter buttons: All / Active / Draft / Amended / Repealed
- Category dropdown filter (Traffic, Environment, Health, Business, Safety, Sanitation, Zoning, Education)
- CSV export of filtered results
- Toggle between list view and grid view
- "New Ordinance" button linking to the encode screen

**List view columns:** Ordinance No., Title / Assigned Offices, Category, Status, Date Passed, Author — all sortable

**Grid view:** Card layout showing category, number, title, date, and author

**Detail panel:** Clicking any ordinance opens a slide-in panel showing summary, metadata, and implementing offices — with "View Full Document" and "Edit Metadata" actions

**Stat cards at top:** Active, Drafts, Amended, Repealed, Total counts

---

### 4.4 Ordinance View Screen

Full document viewer for a single ordinance. Three tabs:

**Full Text tab:**
- Preamble (WHEREAS clauses)
- Article I — General Provisions
- Article II — Category-specific Standards and Requirements
- Article III — Prohibited Acts and Penalties (tiered: ₱500 / ₱1,000 / ₱2,000 + seminar)
- Article IV — Implementing Authority and Effectivity
- Signatories section

**Details & Attachments tab:**
- Ordinance metadata grid (number, date passed, category, status, encoder, date encoded)
- Implementing offices list with office icons
- Plain-language summary
- Attached documents (PDF, DOCX) with download buttons

**Version History tab:**
- Activity log (published, metadata finalized, encoded, passed by Sangguniang)
- Related ordinances with status badges

**AI Chatbot:** A floating AI assistant button is available on every ordinance view. It answers questions about the ordinance in plain language — summaries, penalties, implementing offices, deadlines, scope, and article structure. Suggested questions are shown on first open.

**Header actions:** Print, Export (PDF), Edit Metadata

---

### 4.5 Encode Ordinance Screen

The form used by encoders to create and publish new ordinances.

**Basic Information section:**
- Ordinance number, date passed, title, category, status (draft/active)

**Dispatch Settings section:**
- Compliance deadline (auto-calculated as 45 days from date passed: 15 days effectivity + 30 days compliance window)
- Priority level selector: Normal / Urgent / For Immediate Action — affects notification subject line and tone

**Ordinance Body Text:** Full-text entry area with live word count

**AI Summary:** Auto-generate button that extracts a plain-language summary from the body text. Summary is included in the notification email sent to department heads.

**Implementing Offices:** Checkbox list of all government offices. When an office is checked, its notification channels (Email / SMS / In-App) are shown based on that office's preferences.

**Publish & Notify flow:**
1. Encoder clicks "Publish & Notify"
2. Validation runs (number, title, category, offices, summary, deadline all required)
3. Confirmation modal opens showing:
   - Ordinance number, deadline, priority level
   - Per-office notification preview — select any assigned office to preview the exact email and SMS that will be sent
   - Escalation warning if priority is high
4. Encoder confirms → system simulates dispatch
5. Dispatch summary screen shows each office, their department head, and which channels (Email / SMS / In-App) were used
6. Compliance deadline is set; departments will receive automatic reminders 7 days before the deadline

**Save Draft:** Saves without publishing or notifying.

---

### 4.6 Department Assignments Screen

Manages which ordinances are assigned to which offices.

- Stat cards: Total departments, compliant, delayed, not started
- Search by department name or head name
- Filter by compliance status
- Expandable department cards showing all assigned ordinances
- "Assign Ordinance" modal: checkbox list of all non-repealed ordinances, save assignments

---

### 4.7 Compliance Tracking Screen

The accountability engine of the system.

**Stats row:** Overall compliance rate (%), compliant, in-progress, delayed, overdue, pending counts

**Overdue alert banner:** Appears when any department has missed a deadline. "View Overdue" filter button.

**Status filters:** All / Compliant / In Progress / Delayed / Overdue / Pending

**Department compliance cards (expandable):**
- Department name, head, progress bar (completed/assigned), compliance badge
- Overdue/Escalated banner with reminder count
- "Send Reminder" button on each card
- Expanded view shows per-ordinance status with:
  - Compliance status icon and badge
  - Implementation notes
  - Evidence files attached
  - Overdue flag with deadline date
  - "Submit Report" button
  - "Review Extension" button for overdue items

**Send Reminder modal:**
- Shows Email / SMS / In-App channels
- Previews the actual reminder email with subject and body
- Escalation warning: after 2 reminders, the department is automatically escalated to City Council
- Escalated departments shown with purple banner in compliance screen

**Submit Report modal:**
- Implementation status dropdown (Compliant / In Progress / Delayed)
- Report notes textarea
- Evidence upload area (PDF, DOCX, JPG, PNG up to 10MB)

**Extension Request modal:** For overdue ordinances, allows reviewing and approving deadline extension requests.

---

### 4.8 Notifications Screen

Two-tab interface: Inbox and Sent Notifications.

**Inbox:**
- Filter by: All / Unread / Success / Warning / Info / Alert
- Mark individual or all notifications as read
- Delete notifications
- Unread count badge

**Sent Notifications:**
- Table of all dispatched notifications with type (Auto / Reminder / Manual), recipient, subject, channels used, delivery status (Delivered / Pending / Failed), and timestamp
- Sub-filters: All / Auto-dispatched / Reminders / Manual
- "View" button opens a detail modal showing full message body
- "Retry" button for failed deliveries
- "Send Notification" button opens compose modal for manual notifications

**Compose modal:**
- Recipient, subject, message fields
- Channel selector: In-App Only / Email Only / SMS Only / Email + SMS + In-App

**Summary cards:** Total inbox, unread, auto-dispatched count, reminders sent count

---

### 4.9 Reports & Analytics Screen

Visual reporting on ordinance activity and compliance.

- **KPI cards:** Total ordinances, active ordinances (% of total), overall compliance rate, delayed offices count
- **Bar chart:** Ordinances passed per month (last 9 months)
- **Category distribution:** Horizontal bar chart showing ordinance count per category with color coding
- **Department compliance table:** All departments sorted by completion rate, with progress bars, completion counts, and status badges
- **Totals row:** Total assigned, total completed, overall rate
- **Status distribution cards:** Active / Draft / Amended / Repealed counts with percentage of total
- **Export Report button** on the compliance table

---

### 4.10 User Management Screen

System administrator screen for managing user accounts.

- Add, edit, deactivate user accounts
- Assign roles and office affiliations
- Reset passwords
- View last login timestamps

---

### 4.11 Audit Logs Screen

Tamper-proof activity log for all system actions.

- **Stat cards:** Total log entries, actions today, admin actions, encoder actions
- **Search:** By user, action type, or target resource
- **Filters:** By role (Encoder / Dept. Head / System Admin) and action type
- **Table columns:** Entry number, user (with avatar initials), role, action (color-coded badge), target, timestamp, IP address
- **Detail modal:** Full log entry with all fields
- **CSV export** of filtered results
- Pagination (10 per page)
- Note displayed: "Logs are read-only and tamper-proof"

Logged action types include: Published Ordinance, Created Draft, Edited Metadata, Uploaded Document, Added User, Changed Permissions, Submitted Report, Reset Password, Viewed Ordinance, System Backup

---

### 4.12 Department Head Portal

Department heads get a completely separate app shell after login — they do not see the admin dashboard. Their portal includes:

**Dept Dashboard:**
- Welcome banner with their name, office, and compliance summary
- Stat cards: assigned ordinances, compliant, in-progress, overdue
- Upcoming deadlines list
- Recent notifications preview
- Quick action buttons: View Ordinances, Submit Report

**Assigned Ordinances Screen:**
- List of all ordinances assigned to their office
- Status badges (compliant / in-progress / delayed / pending / overdue)
- Search and filter
- "View" and "Submit Report" actions per ordinance

**Ordinance View Screen (Dept version):**
- Same full-text viewer as the encoder version
- AI chatbot with teal theme (vs. navy for encoders)
- Compliance status panel showing their office's current status for this ordinance
- "Submit Report" button prominently placed
- Deadline countdown

**Submit Reports Screen:**
- Select ordinance from assigned list
- Implementation status dropdown
- Detailed notes textarea
- Evidence file upload (drag-and-drop)
- Submission history for each ordinance

**Notifications Screen:**
- Inbox of all notifications from the City Council Office
- Filter by type
- Mark as read / delete

**Profile Screen:**
- View and edit personal information
- Change password
- Notification preferences (Email / SMS / In-App toggles)
- Office information

---

## 5. Public Web Portal — Features

The public portal requires no login and is accessible to all Cebu City residents and the general public.

### 5.1 Home Page

- Hero section with OrdinanceFlow Cebu branding and tagline
- Search bar for quick ordinance lookup
- Featured/recent ordinances section
- Category browse grid (Traffic, Environment, Health, Business, Safety, Sanitation, Zoning, Education)
- Statistics banner: total ordinances, active ordinances, departments covered, barangays covered
- "How it works" section explaining the ordinance lifecycle
- Call-to-action to browse the full ordinance list

### 5.2 Ordinance Browse Page

- Full searchable, filterable list of all active and published ordinances
- Search by keyword, title, or ordinance number
- Filter by category, status, and year
- Sort by date passed, title, or category
- Ordinance cards showing number, title, category badge, status badge, date passed, and a brief summary excerpt
- Pagination
- Results count display

### 5.3 Ordinance Detail Page

Full public view of a single ordinance. Includes:

- Ordinance number, title, category, status, date passed
- Plain-language summary (prominently displayed at top)
- Full ordinance text organized by article and section
- Implementing offices list
- Related ordinances
- Print and share buttons
- **AI Chatbot** — same chatbot component used in the government app, allowing citizens to ask questions about the ordinance in plain language (penalties, who it applies to, what to do to comply, etc.)

### 5.4 Barangays Page

- List of all 80 Cebu City barangays
- Search by barangay name
- Each barangay card shows ordinances that apply to it
- Links to relevant ordinances per barangay

### 5.5 Categories Page

- Browse ordinances by category
- Each category shows count and description
- Clicking a category filters the ordinance list

### 5.6 About / FAQ Page

- Explanation of what OrdinanceFlow Cebu is
- How to use the portal
- FAQ: What is an ordinance? How do I report non-compliance? How often is this updated?
- Contact information for the City Council Office

### 5.7 AI Chatbot (Global)

A floating AI assistant is available on all pages of the public portal. Citizens can ask general questions like:

- "What ordinances apply to food businesses?"
- "What are the penalties for littering?"
- "Which office handles traffic violations?"
- "Is there an ordinance about noise at night?"

The chatbot searches across all ordinances and provides plain-language answers with links to the relevant ordinance detail pages.

---

## 6. Technical Stack

### Government Web App
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Inline styles with CSS custom properties (no external CSS framework)
- **Icons:** Lucide React
- **State:** React useState / useMemo (no external state library)
- **Routing:** Manual screen state (no React Router — single-page app with state-driven navigation)

### Public Web Portal
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Inline styles with CSS custom properties
- **Icons:** Lucide React
- **Routing:** React Router (multi-page public site)

### Shared
- **Data:** Mock data (TypeScript objects) — production would connect to a backend API
- **AI:** Simulated response engine with pattern matching — production would call an LLM API (e.g., OpenAI, Gemini) with the ordinance as context
- **Notifications:** Simulated dispatch — production would integrate with an email service (SendGrid / Mailgun) and SMS gateway (Semaphore PH / Globe Labs)

### Production Architecture (Recommended)
- **Backend:** Supabase or Firebase (auth, database, file storage)
- **Database:** PostgreSQL (via Supabase) for structured ordinance data with full-text search
- **File Storage:** Supabase Storage or Firebase Storage for PDF/DOCX attachments
- **Auth:** Supabase Auth with role-based access control
- **Notifications:** SendGrid (email) + Semaphore (SMS for Philippine numbers)
- **AI:** OpenAI GPT-4o or Google Gemini with ordinance text as system context
- **Hosting:** Vercel or Netlify (frontend) + Supabase (backend)

---

## 7. Data Model

### Ordinance
```
id, number, title, category, status (active|draft|amended|repealed),
datePassed, offices[], summary, body, author, deadline, priority,
attachments[], createdAt, updatedAt
```

### Department
```
id, name, head, email, phone, compliance (compliant|in-progress|delayed|pending),
assignedCount, completedCount, lastUpdate, notifEmail, notifSms
```

### ComplianceReport
```
id, departmentId, ordinanceId, status, notes, evidence[], submittedBy,
submittedAt, deadline, reminderCount, escalated
```

### User
```
id, name, email, role, officeId, isFirstLogin, lastLogin, notifPreferences
```

### Notification
```
id, type (info|warning|success|alert), title, message, read, time,
targetRole, targetOfficeId
```

### AuditLog
```
id, userId, userRole, action, target, timestamp, ipAddress
```

---

## 8. Key Workflows

### Workflow 1: Ordinance Publication & Dispatch
1. Encoder fills in ordinance details (number, title, category, offices, summary, body)
2. System auto-calculates compliance deadline (date passed + 45 days)
3. Encoder sets priority level and reviews notification previews per office
4. Encoder confirms publish → ordinance status set to Active
5. System dispatches Email + SMS + In-App notifications to all assigned offices
6. Dispatch summary shown with per-office delivery confirmation
7. Ordinance appears in public portal immediately

### Workflow 2: Compliance Tracking & Escalation
1. Department head receives notification with ordinance details and deadline
2. Dept head logs into their portal, views assigned ordinance, reads full text and AI summary
3. Dept head submits implementation report with status, notes, and evidence files
4. City Council encoder monitors compliance dashboard
5. If deadline passes without report: system flags as Overdue
6. Encoder sends reminder (Email + SMS + In-App) — reminder count tracked
7. After 2nd reminder: department automatically escalated to City Council
8. Escalated departments shown with purple banner in compliance screen

### Workflow 3: Citizen Ordinance Lookup
1. Citizen visits public portal (no login required)
2. Searches by keyword or browses by category
3. Finds relevant ordinance, reads plain-language summary
4. Opens AI chatbot to ask specific questions ("What are the fines?", "Does this apply to me?")
5. Gets plain-language answer with references to the relevant ordinance sections

---

## 9. Development Challenges & How They Were Addressed

| Challenge | Approach |
|-----------|----------|
| Data fragmentation (PDFs, scans, Word files) | Ordinance body text field accepts pasted text; attachment upload supports PDF/DOCX/images |
| Legal language complexity | AI summarization on encode; AI chatbot on view screens for both staff and citizens |
| Responsibility identification | Manual office assignment at encode time with a checklist of all government offices |
| Version control / amendments | Status field (active/amended/repealed) + version history tab on ordinance view |
| Adoption resistance | Role-specific portals reduce complexity — dept heads only see what's relevant to them |
| Notification reach | Multi-channel dispatch (Email + SMS + In-App) with per-office preference settings |
| Accountability gaps | Compliance tracking with deadlines, reminders, escalation, and audit logs |

---

## 10. MVP Scope — What Was Built

### Government Web App ✅
- [x] Role-based login with first-login password change flow
- [x] Ordinance encoder dashboard with overdue alerts
- [x] Searchable, filterable ordinance repository (list + grid view)
- [x] Full ordinance document viewer (full text, details, version history)
- [x] Encode ordinance form with AI summary generation
- [x] Multi-channel notification dispatch with per-office preview
- [x] Department assignment management
- [x] Compliance tracking with overdue detection and escalation
- [x] Reminder system (Email + SMS + In-App) with escalation after 2 reminders
- [x] Notifications inbox and sent log with delivery status
- [x] Reports and analytics (charts, department breakdown table)
- [x] User management screen
- [x] Audit logs with search, filter, and CSV export
- [x] Department head isolated portal (dashboard, ordinances, compliance, notifications, profile)
- [x] AI chatbot on all ordinance view screens

### Public Web Portal ✅
- [x] Home page with hero, search, category browse, and statistics
- [x] Ordinance browse page with search, filter, and sort
- [x] Ordinance detail page with full text and plain-language summary
- [x] Barangays page linking barangays to relevant ordinances
- [x] Categories page
- [x] About / FAQ page
- [x] AI chatbot (per-ordinance on detail page + global assistant on all pages)

---

## 11. What Was Intentionally Left Out of MVP

- Full automation of office-to-ordinance mapping (currently manual assignment)
- Advanced predictive analytics (e.g., predicting which offices will be non-compliant)
- Complex workflow engines (multi-step approval chains)
- Real backend integration (all data is mock/simulated)
- Real AI API calls (responses are pattern-matched against ordinance data)
- Real email/SMS sending (dispatch is simulated)
- Barangay official dedicated portal (role exists in login but no dedicated app shell yet)
- Enforcement officer dedicated portal (same as above)

---

## 12. Expected Impact

- **Faster dissemination:** Ordinances reach implementing offices within minutes of publication via multi-channel notifications
- **Improved accountability:** Compliance deadlines, reminders, and escalation create a structured accountability loop
- **Reduced implementation delays:** Department heads have direct access to full ordinance text, plain-language summaries, and an AI assistant — no more waiting for printed memos
- **Public transparency:** Citizens can access any ordinance, read plain-language summaries, and ask questions without needing to visit a government office
- **Better governance monitoring:** City Council can see real-time compliance rates, overdue departments, and full audit trails of all system activity
- **Inter-office coordination:** Responsibility mapping makes it clear which office owns which ordinance — no more ambiguity about who is supposed to act

---

## 13. Project Structure

```
Ordinance Reach/
├── government-web-app/     # Internal government portal
│   ├── src/
│   │   ├── components/     # Sidebar, Topbar, Chatbot, UI primitives
│   │   ├── data/           # Mock ordinances, departments, notifications
│   │   ├── pages/          # All screen components
│   │   │   └── dept/       # Department head screens
│   │   └── App.tsx         # Root with role-based routing
│   ├── ORDINANCEFLOW_CEBU.md   # ← this document
│   └── README.md
│
└── public-web-portal/      # Citizen-facing public website
    ├── src/
    │   ├── components/     # Navbar, Footer, OrdinanceCard, Badges, SearchModal
    │   │   ├── layout/     # Navbar, Footer
    │   │   ├── ordinance/  # OrdinanceCard
    │   │   └── ui/         # Badges, SearchModal, Chatbot
    │   ├── data/           # Shared ordinance data
    │   ├── pages/          # HomePage, OrdinancesPage, OrdinanceDetailPage,
    │   │                   # BarangaysPage, CategoriesPage, AboutPage
    │   ├── hooks/          # Custom React hooks
    │   └── types/          # Shared TypeScript types
    └── README.md
```

---

## 14. Conclusion

OrdinanceFlow Cebu directly addresses the core governance gap identified by the Office of the City Councilor: the disconnect between policy creation and policy implementation. By combining a robust internal government portal with a citizen-facing public website, the system creates a complete ordinance lifecycle — from encoding and publication, through office notification and compliance tracking, to public transparency and citizen access.

The system is practical, focused on real workflows, and designed to be adoptable by government offices with varying levels of digital literacy. Department heads get a simplified portal tailored to their needs. Encoders get powerful tools without unnecessary complexity. Citizens get transparent, searchable access to the laws that govern their city.

OrdinanceFlow Cebu is not just a document management system — it is an accountability and communication infrastructure for local governance.
