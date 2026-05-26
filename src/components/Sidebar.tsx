
import {
  LayoutDashboard, FileText, Bell, Building2, BarChart3,
  Users, ClipboardList, ShieldCheck, ChevronRight, Menu, X
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

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['all'] },
  { id: 'ordinances', label: 'Ordinance List', icon: FileText, roles: ['all'] },
  { id: 'encode', label: 'Encode Ordinance', icon: ClipboardList, roles: ['encoder', 'admin', 'records'] },
  { id: 'departments', label: 'Dept. Assignments', icon: Building2, roles: ['all'] },
  { id: 'compliance', label: 'Compliance Tracking', icon: ShieldCheck, roles: ['all'] },
  { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['all'] },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['all'] },
  { id: 'users', label: 'User Management', icon: Users, roles: ['admin'] },
  { id: 'audit', label: 'Audit Logs', icon: ClipboardList, roles: ['admin', 'records'] },
] as const;

export default function Sidebar({ active, onNavigate, role, collapsed, onToggle }: SidebarProps) {
  return (
    <aside style={{
      width: collapsed ? 64 : 240,
      minWidth: collapsed ? 64 : 240,
      background: 'var(--navy)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s ease, min-width 0.25s ease',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 12px' : '20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minHeight: 72,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'var(--blue-bright)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          fontFamily: "'Fraunces', serif",
          fontWeight: 700, fontSize: 18, color: '#fff',
        }}>O</div>
        {!collapsed && (
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, color: '#fff', fontSize: 15, lineHeight: 1.2 }}>
              OrdinanceFlow
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Cebu City
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            marginLeft: 'auto', background: 'transparent', color: 'rgba(255,255,255,0.4)',
            padding: 4, borderRadius: 4, display: 'flex', flexShrink: 0,
          }}
        >
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {navItems.map(item => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as Screen)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 10,
                padding: collapsed ? '10px 12px' : '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8,
                background: isActive ? 'rgba(59,123,248,0.18)' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                fontSize: 13.5,
                fontWeight: isActive ? 600 : 400,
                marginBottom: 2,
                transition: 'all 0.15s',
                position: 'relative',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '25%', bottom: '25%',
                  width: 3, borderRadius: '0 2px 2px 0',
                  background: 'var(--blue-bright)',
                }} />
              )}
              <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.label}</span>}
              {!collapsed && isActive && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.6 }} />}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{
        padding: collapsed ? '12px 8px' : '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--blue-bright), var(--amber))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>MS</div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              M. Santos
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'capitalize' }}>
              {role.replace('_', ' ')}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}