import { useState } from 'react';
import LoginScreen from './pages/LoginScreen';
import DashboardScreen from './pages/DashboardScreen';
import OrdinanceListScreen from './pages/OrdinanceListScreen';
import EncodeOrdinanceScreen from './pages/EncodeOrdinanceScreen';
import DepartmentsScreen from './pages/DepartmentsScreen';
import ComplianceTrackingScreen from './pages/ComplianceTrackingScreen';
import NotificationsScreen from './pages/NotificationsScreen';
import ReportsScreen from './pages/ReportsScreen';
import UsersScreen from './pages/UsersScreen';
import AuditLogsScreen from './pages/AuditLogsScreen';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

type Screen =
  | 'login' | 'dashboard' | 'ordinances' | 'encode'
  | 'notifications' | 'departments' | 'compliance'
  | 'reports' | 'users' | 'audit';

const screenTitles: Record<Screen, { title: string; subtitle?: string }> = {
  login:         { title: 'Login' },
  dashboard:     { title: 'Dashboard', subtitle: 'Overview of ordinances, compliance, and alerts' },
  ordinances:    { title: 'Ordinance List', subtitle: 'All ordinances in the repository' },
  encode:        { title: 'Encode Ordinance', subtitle: 'Create and publish a new ordinance' },
  notifications: { title: 'Notifications', subtitle: 'Alerts and system messages' },
  departments:   { title: 'Department Assignments', subtitle: 'Manage office responsibilities' },
  compliance:    { title: 'Compliance Tracking', subtitle: 'Monitor implementation status per department' },
  reports:       { title: 'Reports & Analytics', subtitle: 'Ordinance effectiveness and compliance rates' },
  users:         { title: 'User Management', subtitle: 'Manage system users and roles' },
  audit:         { title: 'Audit Logs', subtitle: 'System activity and change history' },
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [role, setRole] = useState('encoder');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  function handleLogin(selectedRole: string) {
    setRole(selectedRole);
    setScreen('dashboard');
  }

  function handleNavigate(s: Screen) {
    setScreen(s);
  }

  if (screen === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const { title, subtitle } = screenTitles[screen] ?? { title: '' };

  function renderScreen() {
    switch (screen) {
      case 'dashboard':    return <DashboardScreen onNavigate={handleNavigate} />;
      case 'ordinances':   return <OrdinanceListScreen onNavigate={handleNavigate} />;
      case 'encode':       return <EncodeOrdinanceScreen onNavigate={handleNavigate} />;
      case 'departments':  return <DepartmentsScreen onNavigate={handleNavigate} />;
      case 'compliance':   return <ComplianceTrackingScreen onNavigate={handleNavigate} />;
      case 'notifications':return <NotificationsScreen onNavigate={handleNavigate} />;
      case 'reports':      return <ReportsScreen onNavigate={handleNavigate} />;
      case 'users':        return <UsersScreen onNavigate={handleNavigate} />;
      case 'audit':        return <AuditLogsScreen onNavigate={handleNavigate} />;
      default:             return null;
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--off-white)' }}>
      <Sidebar
        active={screen}
        onNavigate={handleNavigate}
        role={role}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(c => !c)}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar title={title} subtitle={subtitle} />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}
