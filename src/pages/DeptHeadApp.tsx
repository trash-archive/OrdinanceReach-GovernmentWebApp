import { useState } from 'react';
import DeptSidebar from '../components/DeptSidebar';
import DeptTopbar from '../components/DeptTopbar';
import DeptDashboardScreen from './dept/DeptDashboardScreen';
import DeptOrdinancesScreen from './dept/DeptOrdinancesScreen';
import DeptOrdinanceViewScreen from './dept/DeptOrdinanceViewScreen';
import DeptComplianceScreen from './dept/DeptComplianceScreen';
import DeptNotificationsScreen from './dept/DeptNotificationsScreen';
import DeptProfileScreen from './dept/DeptProfileScreen';
import {
  DEPT_HEAD_USER,
  ASSIGNED_ORDINANCES,
  DEPT_NOTIFICATIONS,
} from '../data/deptHeadData';
import type { AssignedOrdinance, DeptHeadUser, DeptNotification } from '../data/deptHeadData';

type DeptScreen = 'dh-dashboard' | 'dh-ordinances' | 'dh-ordinance-view' | 'dh-compliance' | 'dh-notifications' | 'dh-profile';

const screenTitles: Record<DeptScreen, { title: string; subtitle?: string }> = {
  'dh-dashboard':      { title: 'My Dashboard',          subtitle: 'Overview of your assigned ordinances and compliance status' },
  'dh-ordinances':     { title: 'Assigned Ordinances',    subtitle: 'Ordinances your office is responsible for implementing' },
  'dh-ordinance-view': { title: 'View Ordinance',         subtitle: 'Full document, details, and compliance history' },
  'dh-compliance':     { title: 'Submit Reports',         subtitle: 'Submit implementation and compliance reports' },
  'dh-notifications':  { title: 'Notifications',          subtitle: 'Alerts and messages from the City Council Office' },
  'dh-profile':        { title: 'My Profile',             subtitle: 'Your account information and settings' },
};

interface DeptHeadAppProps {
  onLogout: () => void;
}

export default function DeptHeadApp({ onLogout }: DeptHeadAppProps) {
  const [screen, setScreen] = useState<DeptScreen>('dh-dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<DeptHeadUser>(DEPT_HEAD_USER);
  const [ordinances, setOrdinances] = useState<AssignedOrdinance[]>(ASSIGNED_ORDINANCES);
  const [notifications, setNotifications] = useState<DeptNotification[]>(DEPT_NOTIFICATIONS);
  const [reportTarget, setReportTarget] = useState<AssignedOrdinance | null>(null);
  const [viewedOrdinance, setViewedOrdinance] = useState<AssignedOrdinance | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const { title, subtitle } = screenTitles[screen];

  function handleNavigate(s: DeptScreen) {
    setScreen(s);
  }

  function handleMarkAllRead() {
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  }

  function handleMarkRead(id: string) {
    setNotifications(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));
  }

  function handleSubmitReport(ord: AssignedOrdinance) {
    setReportTarget(ord);
    setScreen('dh-compliance');
  }

  function handleViewOrdinance(ord: AssignedOrdinance) {
    setViewedOrdinance(ord);
    setScreen('dh-ordinance-view');
  }

  function handleUpdateUser(updated: Partial<DeptHeadUser>) {
    setUser(u => ({ ...u, ...updated }));
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F6F8FC' }}>
      <DeptSidebar
        active={screen}
        onNavigate={handleNavigate}
        user={user}
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        unreadCount={unreadCount}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DeptTopbar
          title={title}
          subtitle={subtitle}
          user={user}
          unreadCount={unreadCount}
          onNavigate={handleNavigate}
          onLogout={onLogout}
        />
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {screen === 'dh-dashboard' && (
            <DeptDashboardScreen
              user={user}
              ordinances={ordinances}
              onNavigate={handleNavigate}
            />
          )}
          {screen === 'dh-ordinances' && (
            <DeptOrdinancesScreen
              ordinances={ordinances}
              onNavigate={handleNavigate}
              onSubmitReport={handleSubmitReport}
              onViewOrdinance={handleViewOrdinance}
            />
          )}
          {screen === 'dh-ordinance-view' && viewedOrdinance && (
            <DeptOrdinanceViewScreen
              ordinance={viewedOrdinance}
              onNavigate={handleNavigate}
              onSubmitReport={handleSubmitReport}
            />
          )}
          {screen === 'dh-compliance' && (
            <DeptComplianceScreen
              ordinances={ordinances}
              selectedOrd={reportTarget}
              onClearSelected={() => setReportTarget(null)}
              onOrdinancesUpdate={setOrdinances}
            />
          )}
          {screen === 'dh-notifications' && (
            <DeptNotificationsScreen
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onMarkRead={handleMarkRead}
              onNavigate={handleNavigate}
            />
          )}
          {screen === 'dh-profile' && (
            <DeptProfileScreen user={user} onUpdateUser={handleUpdateUser} />
          )}
        </main>
      </div>
    </div>
  );
}