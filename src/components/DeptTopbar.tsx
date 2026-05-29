import { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, Settings, ChevronDown, User } from 'lucide-react';
import type { DeptHeadUser } from '../data/deptHeadData';

interface DeptTopbarProps {
  title: string;
  subtitle?: string;
  user: DeptHeadUser;
  unreadCount: number;
  onNavigate: (s: any) => void;
  onLogout: () => void;
}

export default function DeptTopbar({ title, subtitle, user, unreadCount, onNavigate, onLogout }: DeptTopbarProps) {
  const [avatarOpen, setAvatarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header style={{
      height: 52,
      background: '#fff',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: 12,
      flexShrink: 0,
      position: 'relative',
      zIndex: 20,
    }}>
      {/* Breadcrumb title */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <span style={{
          fontSize: 13.5,
          fontWeight: 500,
          color: '#0F1F3D',
          whiteSpace: 'nowrap',
        }}>
          {title}
        </span>
        {subtitle && (
          <>
            <span style={{ color: '#94A3B8', fontSize: 13 }}>/</span>
            <span style={{
              fontSize: 13,
              color: '#64748B',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {subtitle}
            </span>
          </>
        )}
      </div>

      {/* Office pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(16,185,129,0.07)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 6,
        padding: '4px 10px',
      }}>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#10B981',
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 12, color: '#059669', fontWeight: 500 }}>{user.officeShort}</span>
      </div>

      {/* Bell */}
      <button
        onClick={() => onNavigate('dh-notifications')}
        style={{ ...deptIconBtnStyle, position: 'relative' }}
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 3,
            right: 3,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#EF4444',
            border: '1.5px solid #fff',
          }} />
        )}
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: '#E2E8F0', flexShrink: 0 }} />

      {/* Avatar + dropdown */}
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          onClick={() => setAvatarOpen(v => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '3px 6px 3px 3px',
            borderRadius: 7,
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={{
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: 'rgba(16,185,129,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10.5,
            fontWeight: 600,
            color: '#059669',
            flexShrink: 0,
          }}>
            {user.avatar}
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: '#0F1F3D' }}>
            {user.title}. {user.name.split(' ').pop()}
          </span>
          <ChevronDown size={13} color="#94A3B8" />
        </button>

        {avatarOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 210,
            background: '#fff',
            border: '1px solid #E2E8F0',
            borderRadius: 9,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            zIndex: 100,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: '#0F1F3D' }}>
                {user.title}. {user.name}
              </div>
              <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>Department Head</div>
              <div style={{
                marginTop: 6,
                fontSize: 11,
                background: 'rgba(16,185,129,0.07)',
                color: '#059669',
                padding: '2px 7px',
                borderRadius: 4,
                display: 'inline-block',
                fontWeight: 500,
              }}>
                {user.office}
              </div>
            </div>
            <div style={{ padding: '4px 6px' }}>
              <button style={deptDropdownItemStyle}>
                <User size={14} />
                My Profile
              </button>
              <button style={deptDropdownItemStyle}>
                <Settings size={14} />
                Settings
              </button>
            </div>
            <div style={{ borderTop: '1px solid #E2E8F0', padding: '4px 6px' }}>
              <button
                onClick={onLogout}
                style={{ ...deptDropdownItemStyle, color: '#dc2626' }}
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

const deptIconBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: '1px solid #E2E8F0',
  borderRadius: 7,
  color: '#475569',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'background 0.12s',
};

const deptDropdownItemStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '7px 8px',
  background: 'transparent',
  border: 'none',
  borderRadius: 6,
  fontSize: 12.5,
  color: '#0F1F3D',
  cursor: 'pointer',
  textAlign: 'left',
};