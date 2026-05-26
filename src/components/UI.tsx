import type { OrdStatus, ComplianceStatus } from '../data/mockData';

export function StatusBadge({ status }: { status: OrdStatus }) {
  const cfg: Record<OrdStatus, { bg: string; color: string; label: string }> = {
    active:   { bg: 'var(--emerald-light)', color: 'var(--emerald)', label: 'Active' },
    draft:    { bg: '#F1F5F9', color: 'var(--slate)', label: 'Draft' },
    amended:  { bg: 'var(--amber-light)', color: '#B45309', label: 'Amended' },
    repealed: { bg: 'var(--rose-light)', color: 'var(--rose)', label: 'Repealed' },
  };
  const { bg, color, label } = cfg[status];
  return (
    <span style={{
      background: bg, color, fontSize: 11, fontWeight: 600,
      padding: '3px 8px', borderRadius: 20, letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

export function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  const cfg: Record<ComplianceStatus, { bg: string; color: string; label: string }> = {
    compliant:    { bg: 'var(--emerald-light)', color: 'var(--emerald)', label: '✓ Compliant' },
    'in-progress': { bg: 'var(--sky)', color: 'var(--blue)', label: '↻ In Progress' },
    delayed:      { bg: 'var(--rose-light)', color: 'var(--rose)', label: '⚠ Delayed' },
    pending:      { bg: 'var(--amber-light)', color: '#B45309', label: '○ Pending' },
  };
  const { bg, color, label } = cfg[status];
  return (
    <span style={{
      background: bg, color, fontSize: 11, fontWeight: 600,
      padding: '3px 9px', borderRadius: 20, letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

export function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    Traffic: '#EFF6FF',
    Environment: '#F0FDF4',
    Health: '#FFF1F2',
    Business: '#FFFBEB',
    Safety: '#F5F3FF',
    Sanitation: '#E0F7FA',
    Zoning: '#FFF3E0',
    Education: '#E8F5E9',
  };
  return (
    <span style={{
      background: colors[category] || 'var(--sky)',
      color: 'var(--navy)', fontSize: 11, fontWeight: 500,
      padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)',
      whiteSpace: 'nowrap',
    }}>{category}</span>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon?: React.ReactNode;
}
export function StatCard({ label, value, sub, accent = 'var(--blue)', icon }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)', padding: '18px 20px',
      boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: 4,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: accent, borderRadius: '10px 10px 0 0',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 500 }}>{label}</span>
        {icon && <span style={{ color: accent, opacity: 0.8 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)', fontFamily: "'Fraunces', serif", lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--slate)' }}>{sub}</div>}
    </div>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--white)', borderRadius: 'var(--radius)',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow)',
      ...style,
    }}>
      {children}
    </div>
  );
}