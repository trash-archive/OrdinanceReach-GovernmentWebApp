import { useState, useRef, useEffect } from 'react';
import { Bell, HelpCircle, Search, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { notifications } from '../data/mockData';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const [search, setSearch] = useState('');
  const [avatarOpen, setAvatarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unread = notifications.filter(n => !n.read).length;

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
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
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
          color: 'var(--color-text-primary)',
          whiteSpace: 'nowrap',
        }}>
          {title}
        </span>
        {subtitle && (
          <>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>/</span>
            <span style={{
              fontSize: 13,
              color: 'var(--color-text-secondary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {subtitle}
            </span>
          </>
        )}
      </div>

      {/* Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        background: 'var(--color-background-secondary)',
        border: '1px solid var(--border)',
        borderRadius: 7,
        padding: '0 10px',
        width: 230,
        height: 32,
        transition: 'border-color 0.15s',
      }}
        onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
        onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        <Search size={13} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search ordinances…"
          style={{
            border: 'none',
            background: 'transparent',
            outline: 'none',
            fontSize: 12.5,
            color: 'var(--color-text-primary)',
            flex: 1,
            minWidth: 0,
          }}
        />
        <kbd style={{
          fontSize: 10.5,
          color: 'var(--color-text-secondary)',
          background: 'var(--color-background-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '1px 5px',
          fontFamily: 'var(--font-mono)',
          flexShrink: 0,
        }}>⌘K</kbd>
      </div>

      {/* Help */}
      <button style={iconBtnStyle}>
        <HelpCircle size={15} />
      </button>

      {/* Bell */}
      <button style={{ ...iconBtnStyle, position: 'relative' }}>
        <Bell size={15} />
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: 3,
            right: 3,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#dc2626',
            border: '1.5px solid var(--surface)',
          }} />
        )}
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: 'var(--border)', flexShrink: 0 }} />

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
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-background-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <div style={avatarStyle}>MS</div>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-primary)' }}>M. Santos</span>
          <ChevronDown size={13} color="var(--color-text-secondary)" />
        </button>

        {avatarOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            width: 192,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 9,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            zIndex: 100,
            overflow: 'hidden',
          }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-primary)' }}>M. Santos</div>
              <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 1 }}>msantos@cebu.gov.ph</div>
            </div>
            <div style={{ padding: '4px 6px' }}>
              {[
                { icon: User, label: 'Profile' },
                { icon: Settings, label: 'Settings' },
              ].map(({ icon: Icon, label }) => (
                <button key={label} style={dropdownItemStyle}>
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border)', padding: '4px 6px' }}>
              <button style={{ ...dropdownItemStyle, color: '#dc2626' }}>
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

const iconBtnStyle: React.CSSProperties = {
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: '1px solid var(--border)',
  borderRadius: 7,
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'background 0.12s, color 0.12s',
};

const avatarStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  borderRadius: '50%',
  background: '#dbeafe',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10.5,
  fontWeight: 600,
  color: '#2563eb',
  flexShrink: 0,
};

const dropdownItemStyle: React.CSSProperties = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '7px 8px',
  background: 'transparent',
  border: 'none',
  borderRadius: 6,
  fontSize: 12.5,
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
  textAlign: 'left',
};