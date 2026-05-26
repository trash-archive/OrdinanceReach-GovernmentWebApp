import { useState } from 'react';
import { Search, Bell, HelpCircle } from 'lucide-react';
import { notifications } from '../data/mockData';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: TopbarProps) {
  const [search, setSearch] = useState('');
  const unread = notifications.filter(n => !n.read).length;

  return (
    <header style={{
      height: 64,
      background: 'var(--white)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16,
      flexShrink: 0,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.2 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 1 }}>{subtitle}</div>}
      </div>

      <div style={{
        display: 'flex', alignItems: 'center',
        background: 'var(--sky)', borderRadius: 8,
        padding: '0 12px', gap: 8, width: 260,
        border: '1px solid var(--border)',
      }}>
        <Search size={14} color="var(--slate)" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search ordinances…"
          style={{
            border: 'none', background: 'transparent', outline: 'none',
            fontSize: 13, color: 'var(--navy)', flex: 1, padding: '8px 0',
          }}
        />
      </div>

      <button style={{
        position: 'relative', background: 'var(--sky)',
        border: '1px solid var(--border)', borderRadius: 8,
        padding: 8, display: 'flex', color: 'var(--navy)',
      }}>
        <Bell size={17} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: 'var(--rose)', color: '#fff',
            borderRadius: '50%', width: 17, height: 17,
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--white)',
          }}>{unread}</span>
        )}
      </button>

      <button style={{
        background: 'var(--sky)', border: '1px solid var(--border)',
        borderRadius: 8, padding: 8, display: 'flex', color: 'var(--slate)',
      }}>
        <HelpCircle size={17} />
      </button>
    </header>
  );
}