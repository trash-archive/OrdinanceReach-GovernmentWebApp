import {
  LayoutDashboard, FileText, Bell, ShieldCheck,
  Menu, X, User, ChevronRight, Settings, LogOut,
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

const navItems: { id: DeptScreen; label: string; icon: React.ElementType; badge?: boolean }[] = [
  { id: 'dh-dashboard',     label: 'My Dashboard',        icon: LayoutDashboard },
  { id: 'dh-ordinances',    label: 'Assigned Ordinances',  icon: FileText        },
  { id: 'dh-compliance',    label: 'Submit Reports',       icon: ShieldCheck     },
  { id: 'dh-notifications', label: 'Notifications',        icon: Bell, badge: true },
  { id: 'dh-profile',       label: 'My Profile',           icon: User            },
];

export default function DeptSidebar({ active, onNavigate, user, collapsed, onToggle, unreadCount }: DeptSidebarProps) {
  return (
    <aside style={{
      width: collapsed ? 52 : 220,
      minWidth: collapsed ? 52 : 220,
      background: '#fff',
      borderRight: '1px solid #E2E8F0',
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
        padding: '0 14px',
        borderBottom: '1px solid #E2E8F0',
        flexShrink: 0,
      }}>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          background: '#10B981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 600,
          color: '#fff',
          flexShrink: 0,
        }}>
          {user.officeShort.slice(0, 1)}
        </div>

        {!collapsed && (
          <>
            <span style={{ fontSize: 13.5, fontWeight: 500, color: '#0F1F3D', whiteSpace: 'nowrap' }}>
              OrdinanceFlow
            </span>
            <span style={{
              marginLeft: 'auto',
              fontSize: 10.5,
              color: '#059669',
              background: 'rgba(16,185,129,0.07)',
              border: '1px solid rgba(16,185,129,0.2)',
              padding: '2px 6px',
              borderRadius: 4,
              whiteSpace: 'nowrap',
            }}>
              {user.officeShort}
            </span>
          </>
        )}

        <button
          onClick={onToggle}
          title={collapsed ? 'Expand' : 'Collapse'}
          style={{
            marginLeft: collapsed ? 'auto' : undefined,
            background: 'transparent',
            border: 'none',
            color: '#94A3B8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 4,
            borderRadius: 5,
            flexShrink: 0,
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {collapsed ? <Menu size={15} /> : <X size={15} />}
        </button>
      </div>

      {/* Office info strip */}
      {!collapsed && (
        <div style={{
          margin: '10px 10px 4px',
          background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.15)',
          borderRadius: 7,
          padding: '8px 11px',
        }}>
          <div style={{ fontSize: 10, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>
            Office
          </div>
          <div style={{ fontSize: 12.5, color: '#0F1F3D', fontWeight: 500, marginTop: 2, lineHeight: 1.3 }}>
            {user.office}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto' }}>
        {!collapsed && (
          <div style={{ padding: '6px 8px 4px', fontSize: 10.5, fontWeight: 500, color: '#94A3B8', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Navigation
          </div>
        )}
        {collapsed && <div style={{ height: 8 }} />}

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
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: collapsed ? '7px 0' : '6px 8px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 6,
                background: isActive ? 'rgba(16,185,129,0.08)' : 'transparent',
                color: isActive ? '#059669' : '#64748B',
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                marginBottom: 1,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.1s, color 0.1s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = '#F8FAFC';
                  e.currentTarget.style.color = '#0F1F3D';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#64748B';
                }
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />
                {showBadge && collapsed && (
                  <span style={{
                    position: 'absolute',
                    top: -3,
                    right: -3,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#EF4444',
                    border: '1.5px solid #fff',
                  }} />
                )}
              </div>

              {!collapsed && (
                <>
                  <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                  {showBadge ? (
                    <span style={{
                      fontSize: 10,
                      fontWeight: 600,
                      background: '#fee2e2',
                      color: '#dc2626',
                      padding: '1px 6px',
                      borderRadius: 4,
                      flexShrink: 0,
                    }}>
                      {unreadCount}
                    </span>
                  ) : isActive ? (
                    <ChevronRight size={12} style={{ flexShrink: 0, opacity: 0.4 }} />
                  ) : null}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{
        borderTop: '1px solid #E2E8F0',
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
          background: 'rgba(16,185,129,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 600,
          color: '#059669',
          flexShrink: 0,
        }}>
          {user.avatar}
        </div>

        {!collapsed && (
          <>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: '#0F1F3D', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.title}. {user.name}
              </div>
              <div style={{ fontSize: 11, color: '#64748B' }}>Department Head</div>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              <button
                onClick={() => onNavigate('dh-profile')}
                title="Settings"
                style={deptFooterIconStyle}
              >
                <Settings size={13} />
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

const deptFooterIconStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 'none',
  borderRadius: 5,
  color: '#94A3B8',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'background 0.12s',
};