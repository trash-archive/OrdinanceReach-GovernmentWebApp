import { Bell, LogOut } from 'lucide-react';
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
  return (
    <header style={{
      height: 64,
      background: '#fff',
      borderBottom: '1px solid #E2E8F0',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16, flexShrink: 0,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#0F1F3D', lineHeight: 1.2, fontFamily: 'Georgia, serif' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>{subtitle}</div>}
      </div>

      {/* Office pill */}
      <div style={{
        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 20, padding: '5px 12px',
        fontSize: 11.5, color: '#059669', fontWeight: 600,
      }}>
        {user.office}
      </div>

      {/* Bell */}
      <button
        onClick={() => onNavigate('dh-notifications')}
        style={{
          position: 'relative', background: '#EBF1FF',
          border: '1px solid #E2E8F0', borderRadius: 8,
          padding: 8, display: 'flex', color: '#0F1F3D', cursor: 'pointer',
        }}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: '#EF4444', color: '#fff',
            borderRadius: '50%', width: 17, height: 17,
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #fff',
          }}>{unreadCount}</span>
        )}
      </button>

      {/* Logout */}
      <button
        onClick={onLogout}
        title="Sign out"
        style={{
          background: '#EBF1FF', border: '1px solid #E2E8F0',
          borderRadius: 8, padding: 8, display: 'flex',
          color: '#64748B', cursor: 'pointer',
        }}
      >
        <LogOut size={17} />
      </button>
    </header>
  );
}