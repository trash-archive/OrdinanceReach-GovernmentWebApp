# OrdinanceFlow Cebu — Government Web App

Internal portal for City Council encoders, department heads, and system administrators.

**Stack:** React + TypeScript + Vite  
**Role:** Government-side application (internal use only)

---

## Running the App

```bash
npm install
npm run dev
```

## Demo Login Roles

| Role | Email | Notes |
|------|-------|-------|
| Ordinance Encoder | m.santos@cebu.gov.ph | Full admin dashboard |
| Department Head | j.tabada@cebu.gov.ph | Triggers first-login password change flow |

Any password works for the encoder. The dept head account demonstrates the forced password reset on first login.

---

## Project Structure

```
src/
├── components/         # Shared UI components
│   ├── Sidebar.tsx     # Admin navigation
│   ├── Topbar.tsx      # Admin topbar
│   ├── DeptSidebar.tsx # Dept head navigation
│   ├── DeptTopbar.tsx  # Dept head topbar
│   ├── OrdinanceChatbot.tsx  # AI assistant (shared)
│   └── UI.tsx          # StatCard, Card, badges, etc.
├── data/
│   ├── mockData.ts     # Ordinances, departments, notifications, audit logs
│   └── deptHeadData.ts # Dept head specific data
├── pages/
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── OrdinanceListScreen.tsx
│   ├── OrdinanceViewScreen.tsx
│   ├── EncodeOrdinanceScreen.tsx
│   ├── DepartmentsScreen.tsx
│   ├── ComplianceTrackingScreen.tsx
│   ├── NotificationsScreen.tsx
│   ├── ReportsScreen.tsx
│   ├── UsersScreen.tsx
│   ├── AuditLogsScreen.tsx
│   ├── DeptHeadApp.tsx
│   └── dept/           # Department head screens
│       ├── DeptDashboardScreen.tsx
│       ├── DeptOrdinancesScreen.tsx
│       ├── DeptOrdinanceViewScreen.tsx
│       ├── DeptComplianceScreen.tsx
│       ├── DeptNotificationsScreen.tsx
│       └── DeptProfileScreen.tsx
└── App.tsx
```
