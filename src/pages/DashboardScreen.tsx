import { FileText, Building2, Clock, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { ordinances, departments, notifications } from '../data/mockData';

interface DashboardProps {
  onNavigate: (s: any) => void;
}

const recentOrds = ordinances.filter(o => o.status === 'active').slice(0, 4);
const recentDepts = departments.slice(0, 5);
const OVERDUE_DEPT_IDS = new Set(['4', '6']);

// ─── Badge helpers ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> = {
  active:    { bg: '#f0fdf4', color: '#15803d', label: 'Active' },
  draft:     { bg: '#f8fafc', color: '#475569', label: 'Draft' },
  amended:   { bg: '#fffbeb', color: '#a16207', label: 'Amended' },
  repealed:  { bg: '#fef2f2', color: '#dc2626', label: 'Repealed' },
};

const COMPLIANCE_CFG: Record<string, { bg: string; color: string; label: string }> = {
  compliant:    { bg: '#f0fdf4', color: '#15803d',  label: 'Compliant'    },
  'in-progress':{ bg: '#eff6ff', color: '#2563eb',  label: 'In Progress'  },
  delayed:      { bg: '#fef2f2', color: '#dc2626',  label: 'Delayed'      },
  pending:      { bg: '#fffbeb', color: '#a16207',  label: 'Pending'      },
  overdue:      { bg: '#fef2f2', color: '#dc2626',  label: 'Overdue'      },
  escalated:    { bg: '#f5f3ff', color: '#7c3aed',  label: 'Escalated'    },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.draft;
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      fontSize: 11,
      fontWeight: 500,
      padding: '2px 8px',
      borderRadius: 4,
      whiteSpace: 'nowrap',
    }}>{cfg.label}</span>
  );
}

function CompliancePill({ status }: { status: string }) {
  const cfg = COMPLIANCE_CFG[status] ?? COMPLIANCE_CFG.pending;
  return (
    <span style={{
      background: cfg.bg,
      color: cfg.color,
      fontSize: 11,
      fontWeight: 500,
      padding: '2px 8px',
      borderRadius: 4,
      whiteSpace: 'nowrap',
    }}>{cfg.label}</span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  subColor?: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  valueColor?: string;
}

function StatCard({ label, value, sub, subColor, iconBg, iconColor, icon, valueColor }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '14px 16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{label}</span>
        <div style={{
          width: 28, height: 28, borderRadius: 7,
          background: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: iconColor, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 500, color: valueColor ?? 'var(--color-text-primary)', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11.5, color: subColor ?? 'var(--color-text-secondary)', marginTop: 5 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardScreen({ onNavigate }: DashboardProps) {
  const activeCount = ordinances.filter(o => o.status === 'active').length;
  const draftCount  = ordinances.filter(o => o.status === 'draft').length;
  const overdueDepts    = departments.filter(d => OVERDUE_DEPT_IDS.has(d.id)).length;
  const compliantDepts  = departments.filter(d => d.compliance === 'compliant').length;
  const inProgressDepts = departments.filter(d => d.compliance === 'in-progress').length;
  const delayedDepts    = departments.filter(d => d.compliance === 'delayed').length;
  const pendingDepts    = departments.filter(d => d.compliance === 'pending').length;
  const unreadNotifs    = notifications.filter(n => !n.read).length;

  const complianceRows = [
    { label: 'Compliant',   count: compliantDepts,  color: '#16a34a', pct: (compliantDepts / departments.length) * 100 },
    { label: 'In progress', count: inProgressDepts, color: '#2563eb', pct: (inProgressDepts / departments.length) * 100 },
    { label: 'Delayed',     count: delayedDepts,    color: '#dc2626', pct: (delayedDepts / departments.length) * 100 },
    { label: 'Pending',     count: pendingDepts,    color: '#d97706', pct: (pendingDepts / departments.length) * 100 },
  ];

  const notifColors: Record<string, string> = {
    success: '#16a34a',
    warning: '#d97706',
    info:    '#2563eb',
    alert:   '#dc2626',
  };

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, minHeight: '100%' }}>

      {/* Overdue alert */}
      {overdueDepts > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          padding: '10px 14px',
        }}>
          <AlertTriangle size={15} color="#dc2626" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 12.5, color: '#991b1b', fontWeight: 500 }}>
            {overdueDepts} department{overdueDepts > 1 ? 's have' : ' has'} overdue compliance reports —
            {' '}Business Permits, City Engineering
          </div>
          <button
            onClick={() => onNavigate('compliance')}
            style={{
              background: 'transparent',
              border: '1px solid #fca5a5',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 12,
              fontWeight: 500,
              color: '#dc2626',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Review
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <StatCard
          label="Active Ordinances"
          value={activeCount}
          sub="↑ 3 this month"
          subColor="#16a34a"
          iconBg="#f0fdf4"
          iconColor="#16a34a"
          icon={<FileText size={14} />}
        />
        <StatCard
          label="Dept. Assigned"
          value={departments.length}
          sub={`${compliantDepts} fully compliant`}
          iconBg="#eff6ff"
          iconColor="#2563eb"
          icon={<Building2 size={14} />}
        />
        <StatCard
          label="Overdue Reports"
          value={overdueDepts}
          sub="Past deadline"
          iconBg="#fef2f2"
          iconColor="#dc2626"
          valueColor={overdueDepts > 0 ? '#dc2626' : undefined}
          icon={<ShieldAlert size={14} />}
        />
        <StatCard
          label="Drafts in Queue"
          value={draftCount}
          sub="Awaiting publish"
          iconBg="#fffbeb"
          iconColor="#d97706"
          icon={<Clock size={14} />}
        />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 14 }}>

        {/* Recent ordinances */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Recent ordinances</span>
            <button
              onClick={() => onNavigate('ordinances')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2563eb', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div>
            {recentOrds.map((ord, i) => (
              <div
                key={ord.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 16px',
                  borderBottom: i < recentOrds.length - 1 ? '1px solid var(--border)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-background-secondary)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 32, height: 32, borderRadius: 7, background: 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={14} color="var(--color-text-secondary)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ord.title}
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>{ord.number}</span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>·</span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{ord.datePassed}</span>
                  </div>
                </div>
                <StatusPill status={ord.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Compliance overview */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Compliance</span>
              <button
                onClick={() => onNavigate('compliance')}
                style={{ fontSize: 12, color: '#2563eb', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                Details <ArrowRight size={12} />
              </button>
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {complianceRows.map(row => (
                <div key={row.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{row.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>{row.count}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--color-background-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${row.pct}%`, background: row.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Alerts</span>
              {unreadNotifs > 0 && (
                <span style={{ fontSize: 11, fontWeight: 500, background: '#fef2f2', color: '#dc2626', padding: '2px 7px', borderRadius: 4 }}>
                  {unreadNotifs} new
                </span>
              )}
            </div>
            <div>
              {notifications.slice(0, 4).map((notif, i) => (
                <div
                  key={notif.id}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '10px 16px',
                    borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
                    background: !notif.read ? 'rgba(37,99,235,0.02)' : 'transparent',
                  }}
                >
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: notifColors[notif.type] ?? '#94a3b8',
                    flexShrink: 0,
                    marginTop: 5,
                  }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-primary)' }}>{notif.title}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {notif.message}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{notif.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Department table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Department status</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginLeft: 8 }}>
              {compliantDepts} of {departments.length} compliant
            </span>
          </div>
          <button
            onClick={() => onNavigate('compliance')}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#2563eb', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            Full tracking <ArrowRight size={12} />
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
            <thead>
              <tr>
                {['Department', 'Head', 'Assigned', 'Completed', 'Status', 'Last update'].map(h => (
                  <th key={h} style={{
                    padding: '9px 16px',
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    background: 'var(--color-background-secondary)',
                    borderBottom: '1px solid var(--border)',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentDepts.map((dept, i) => (
                <tr
                  key={dept.id}
                  style={{ borderBottom: i < recentDepts.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-background-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '11px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{dept.name}</span>
                      {OVERDUE_DEPT_IDS.has(dept.id) && (
                        <span style={{ fontSize: 10, background: '#fef2f2', color: '#dc2626', padding: '1px 5px', borderRadius: 3, fontWeight: 600 }}>
                          OVERDUE
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px', color: 'var(--color-text-secondary)' }}>{dept.head}</td>
                  <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>{dept.assignedCount}</td>
                  <td style={{ padding: '11px 16px', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ color: dept.completedCount === dept.assignedCount ? '#16a34a' : 'var(--color-text-primary)' }}>
                      {dept.completedCount}/{dept.assignedCount}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px' }}>
                    <CompliancePill status={OVERDUE_DEPT_IDS.has(dept.id) ? 'overdue' : dept.compliance} />
                  </td>
                  <td style={{ padding: '11px 16px', color: 'var(--color-text-secondary)', fontSize: 12 }}>{dept.lastUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}