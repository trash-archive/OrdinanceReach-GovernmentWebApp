import {
  LayoutDashboard, FileText, Bell, Building2, BarChart3,
  Users, ClipboardList, ShieldCheck, Menu, X, Settings,
  LogOut, ChevronRight,
} from 'lucide-react';

type Screen =
  | 'login' | 'dashboard' | 'ordinances' | 'encode'
  | 'notifications' | 'departments' | 'compliance'
  | 'reports' | 'users' | 'audit';

interface SidebarProps {
  active: Screen;
  onNavigate: (s: Screen) => void;
  role: string;
  collapsed: boolean;
  onToggle: () => void;
}

type NavItem = {
  id: Screen;
  label: string;
  icon: React.ElementType;
  roles: string[];
  badge?: string | number;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Main',
    items: [
      { id: 'dashboard',  label: 'Dashboard',        icon: LayoutDashboard, roles: ['all'] },
      { id: 'ordinances', label: 'Ordinances',        icon: FileText,        roles: ['all'] },
      { id: 'encode',     label: 'Encode Ordinance',  icon: ClipboardList,   roles: ['encoder', 'admin', 'records'] },
      { id: 'departments',label: 'Dept. Assignments', icon: Building2,       roles: ['all'] },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { id: 'compliance',    label: 'Compliance',    icon: ShieldCheck, roles: ['all'],    badge: 2 },
      { id: 'notifications', label: 'Notifications', icon: Bell,        roles: ['all'],    badge: 5 },
      { id: 'reports',       label: 'Reports',       icon: BarChart3,   roles: ['all'] },
    ],
  },
  {
    label: 'Admin',
    items: [
      { id: 'users', label: 'User Management', icon: Users,        roles: ['admin'] },
      { id: 'audit', label: 'Audit Logs',      icon: ClipboardList,roles: ['admin', 'records'] },
    ],
  },
];

function isVisible(item: NavItem, role: string) {
  return item.roles.includes('all') || item.roles.includes(role);
}

export default function Sidebar({ active, onNavigate, role, collapsed, onToggle }: SidebarProps) {
  return (
    <aside style={{
      width: collapsed ? 52 : 220,
      minWidth: collapsed ? 52 : 220,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease, min-width 0.2s ease',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 10,
    }}>

      {/* Logo row */}
      <div style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: collapsed ? '0 14px' : '0 14px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          background: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: '#fff',
          flexShrink: 0,
        }}>O</div>

        {!collapsed && (
          <>
            <span style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
              OrdinanceFlow
            </span>
            <span style={{
              marginLeft: 'auto',
              fontSize: 10.5,
              color: 'var(--color-text-secondary)',
              background: 'var(--color-background-secondary)',
              border: '1px solid var(--border)',
              padding: '2px 6px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
            }}>Cebu</span>
          </>
        )}

        <button
          onClick={onToggle}
          title={collapsed ? 'Expand' : 'Collapse'}
          style={{
            marginLeft: collapsed ? 'auto' : undefined,
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            borderRadius: 5,
            flexShrink: 0,
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-background-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {collapsed ? <Menu size={15} /> : <X size={15} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto', overflowX: 'hidden' }}>
        {navGroups.map(group => {
          const visible = group.items.filter(item => isVisible(item, role));
          if (visible.length === 0) return null;
          return (
            <div key={group.label} style={{ marginBottom: 4 }}>
              {!collapsed && (
                <div style={{
                  padding: '8px 8px 4px',
                  fontSize: 10.5,
                  fontWeight: 500,
                  color: 'var(--color-text-secondary)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  {group.label}
                </div>
              )}
              {collapsed && <div style={{ height: 8 }} />}
              {visible.map(item => {
                const isActive = active === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    title={collapsed ? item.label : undefined}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: collapsed ? '7px 0' : '6px 8px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: 6,
                      background: isActive ? 'var(--accent-soft)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--color-text-secondary)',
                      fontSize: 13,
                      fontWeight: isActive ? 500 : 400,
                      marginBottom: 1,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.1s, color 0.1s',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'var(--color-background-secondary)';
                        e.currentTarget.style.color = 'var(--color-text-primary)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-secondary)';
                      }
                    }}
                  >
                    <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.label}
                        </span>
                        {item.badge !== undefined && (
                          <span style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: 4,
                            background: item.badge === 2 ? '#fef2f2' : '#fefce8',
                            color: item.badge === 2 ? '#dc2626' : '#92400e',
                            flexShrink: 0,
                          }}>
                            {item.badge}
                          </span>
                        )}
                        {isActive && !item.badge && (
                          <ChevronRight size={12} style={{ flexShrink: 0, opacity: 0.4 }} />
                        )}
                      </>
                    )}
                    {collapsed && item.badge !== undefined && (
                      <span style={{
                        position: 'absolute' as const,
                        top: 6,
                        right: 8,
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#dc2626',
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: collapsed ? '10px 6px' : '10px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: '#dbeafe',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 600,
          color: '#2563eb',
          flexShrink: 0,
        }}>MS</div>

        {!collapsed && (
          <>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                M. Santos
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                {role.replace('_', ' ')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              <button style={footerIconStyle} title="Settings">
                <Settings size={13} />
              </button>
              <button style={{ ...footerIconStyle, color: '#dc2626' }} title="Sign out">
                <LogOut size={13} />
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

const footerIconStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  borderRadius: 5,
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'background 0.12s',
};