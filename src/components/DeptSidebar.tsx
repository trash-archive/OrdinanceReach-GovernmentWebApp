import {
  LayoutDashboard, FileText, Bell, ShieldCheck,
  ChevronRight, Menu, X, User
} from 'lucide-react';
import type { DeptHeadUser } from '../data/deptHeadData';

type DeptScreen = 'dh-dashboard' | 'dh-ordinances' | 'dh-compliance' | 'dh-notifications' | 'dh-profile';

interface DeptSidebarProps {
  active: DeptScreen;
  onNavigate: (s: DeptScreen) => void;
  user: DeptHeadUser;
  collapsed: boolean;
  onToggle: () => void;
  unreadCount: number;
}

const navItems: { id: DeptScreen; label: string; icon: any; badge?: boolean }[] = [
  { id: 'dh-dashboard',     label: 'My Dashboard',       icon: LayoutDashboard },
  { id: 'dh-ordinances',    label: 'Assigned Ordinances', icon: FileText        },
  { id: 'dh-compliance',    label: 'Submit Reports',      icon: ShieldCheck     },
  { id: 'dh-notifications', label: 'Notifications',       icon: Bell, badge: true },
  { id: 'dh-profile',       label: 'My Profile',          icon: User            },
];

export default function DeptSidebar({ active, onNavigate, user, collapsed, onToggle, unreadCount }: DeptSidebarProps) {
  return (
    <aside style={{
      width: collapsed ? 64 : 240,
      minWidth: collapsed ? 64 : 240,
      background: 'linear-gradient(180deg, #0F2027 0%, #1a3a4a 50%, #0F2027 100%)',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.25s ease, min-width 0.25s ease',
      overflow: 'hidden',
      position: 'relative',
      zIndex: 10,
    }}>
      {/* Decorative background */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(16,185,129,0.06)', pointerEvents: 'none',
      }} />

      {/* Logo / Office */}
      <div style={{
        padding: collapsed ? '20px 12px' : '20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 10, minHeight: 72,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: 'linear-gradient(135deg, #10B981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, fontWeight: 800, fontSize: 14, color: '#fff',
          fontFamily: 'Georgia, serif',
        }}>
          {user.officeShort.slice(0, 1)}
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: 13.5, lineHeight: 1.2, fontFamily: 'Georgia, serif' }}>
              OrdinanceFlow
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.07em', textTransform: 'uppercase', marginTop: 1 }}>
              {user.officeShort}
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            marginLeft: 'auto', background: 'transparent',
            color: 'rgba(255,255,255,0.35)', padding: 4, borderRadius: 4,
            display: 'flex', flexShrink: 0, border: 'none', cursor: 'pointer',
          }}
        >
          {collapsed ? <Menu size={16} /> : <X size={16} />}
        </button>
      </div>

      {/* Office tag */}
      {!collapsed && (
        <div style={{
          margin: '12px 12px 4px',
          background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 8, padding: '8px 12px',
        }}>
          <div style={{ fontSize: 9.5, color: 'rgba(16,185,129,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Logged in as</div>
          <div style={{ fontSize: 12, color: '#fff', fontWeight: 600, marginTop: 2 }}>{user.office}</div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {navItems.map(item => {
          const isActive = active === item.id;
          const Icon = item.icon;
          const showBadge = item.badge && unreadCount > 0;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 10,
                padding: '10px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 8,
                background: isActive ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: isActive ? '#10B981' : 'rgba(255,255,255,0.5)',
                fontSize: 13, fontWeight: isActive ? 600 : 400,
                marginBottom: 2, border: 'none', cursor: 'pointer',
                transition: 'all 0.15s', position: 'relative', whiteSpace: 'nowrap',
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '25%', bottom: '25%',
                  width: 3, borderRadius: '0 2px 2px 0', background: '#10B981',
                }} />
              )}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Icon size={17} strokeWidth={isActive ? 2.5 : 1.8} />
                {showBadge && collapsed && (
                  <div style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '1.5px solid #0F2027' }} />
                )}
              </div>
              {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
              {!collapsed && showBadge && (
                <span style={{ background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, marginLeft: 'auto' }}>
                  {unreadCount}
                </span>
              )}
              {!collapsed && isActive && !showBadge && (
                <ChevronRight size={13} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{
        padding: collapsed ? '12px 8px' : '12px 16px',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #10B981, #065f46)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11.5, fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>{user.avatar}</div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.title}. {user.name}
            </div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)' }}>Department Head</div>
          </div>
        )}
      </div>
    </aside>
  );
}