import { useState } from 'react';
import { ClipboardList, Search, Download, Filter, Eye } from 'lucide-react';
import { auditLogs } from '../data/mockData';
import { Card, StatCard } from '../components/UI';

interface AuditLogsScreenProps {
  onNavigate: (s: any) => void;
}

const extendedLogs = [
  ...auditLogs,
  { id: '7',  user: 'M. Santos',     role: 'Encoder',      action: 'Created Draft',      target: 'SP-2024-045',                 time: '3 days ago 9:00 AM',  ip: '192.168.1.10' },
  { id: '8',  user: 'A. Cruz',       role: 'Encoder',      action: 'Published Ordinance', target: 'SP-2024-029',                time: '4 days ago 1:45 PM',  ip: '192.168.1.11' },
  { id: '9',  user: 'Admin',         role: 'System Admin', action: 'Reset Password',      target: 'J. Tabada (Dept Head)',       time: '5 days ago 10:20 AM', ip: '192.168.1.2'  },
  { id: '10', user: 'L. Reyes',      role: 'Encoder',      action: 'Edited Metadata',     target: 'SP-2024-022',                time: '5 days ago 8:55 AM',  ip: '192.168.1.12' },
  { id: '11', user: 'R. Villanueva', role: 'Dept. Head',   action: 'Viewed Ordinance',    target: 'SP-2024-033',                time: '6 days ago 3:00 PM',  ip: '192.168.2.5'  },
  { id: '12', user: 'Admin',         role: 'System Admin', action: 'Added User',          target: 'F. Abella (Enforcement)',    time: '6 days ago 11:30 AM', ip: '192.168.1.2'  },
  { id: '13', user: 'C. Mendoza',    role: 'Dept. Head',   action: 'Submitted Report',    target: 'SP-2024-038 Compliance',     time: '7 days ago 4:10 PM',  ip: '192.168.2.6'  },
  { id: '14', user: 'M. Santos',     role: 'Encoder',      action: 'Uploaded Document',   target: 'SP-2024-041 PDF',            time: '8 days ago 2:30 PM',  ip: '192.168.1.10' },
  { id: '15', user: 'Admin',         role: 'System Admin', action: 'System Backup',       target: 'Full Database Backup',       time: '1 week ago 12:00 AM', ip: '192.168.1.1'  },
];

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  'Published Ordinance': { bg: 'var(--emerald-light)', color: 'var(--emerald)' },
  'Created Draft':       { bg: 'var(--sky)',            color: 'var(--blue)'    },
  'Edited Metadata':     { bg: 'var(--amber-light)',    color: '#B45309'        },
  'Uploaded Document':   { bg: 'var(--sky)',            color: 'var(--blue)'    },
  'Added User':          { bg: '#F5F3FF',               color: '#8B5CF6'        },
  'Changed Permissions': { bg: 'var(--rose-light)',     color: 'var(--rose)'    },
  'Submitted Report':    { bg: 'var(--emerald-light)',  color: 'var(--emerald)' },
  'Reset Password':      { bg: 'var(--amber-light)',    color: '#B45309'        },
  'Viewed Ordinance':    { bg: '#F1F5F9',               color: 'var(--slate)'   },
  'System Backup':       { bg: '#F5F3FF',               color: '#8B5CF6'        },
};

const PER_PAGE = 10;

export default function AuditLogsScreen({ onNavigate: _onNavigate }: AuditLogsScreenProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<typeof extendedLogs[0] | null>(null);

  const roles = ['all', ...Array.from(new Set(extendedLogs.map(l => l.role)))];
  const actions = ['all', ...Array.from(new Set(extendedLogs.map(l => l.action)))];

  const filtered = extendedLogs.filter(l => {
    const matchQ = !search
      || l.user.toLowerCase().includes(search.toLowerCase())
      || l.target.toLowerCase().includes(search.toLowerCase())
      || l.action.toLowerCase().includes(search.toLowerCase());
    const matchR = roleFilter === 'all' || l.role === roleFilter;
    const matchA = actionFilter === 'all' || l.action === actionFilter;
    return matchQ && matchR && matchA;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function exportCSV() {
    const rows = [['User', 'Role', 'Action', 'Target', 'Time', 'IP']];
    filtered.forEach(l => rows.push([l.user, l.role, l.action, `"${l.target}"`, l.time, l.ip]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'audit_logs.csv';
    a.click();
  }

  const counts = {
    total:    extendedLogs.length,
    today:    extendedLogs.filter(l => l.time.startsWith('Today')).length,
    admins:   extendedLogs.filter(l => l.role === 'System Admin').length,
    encoders: extendedLogs.filter(l => l.role === 'Encoder').length,
  };

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '5px 12px',
    border: '1px solid var(--border)',
    background: 'var(--white)',
    borderRadius: 6,
    fontSize: 12,
    color: disabled ? 'var(--border)' : 'var(--slate)',
    cursor: disabled ? 'default' : 'pointer',
  });

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatCard label="Total Log Entries"  value={counts.total}    sub="All time"               accent="var(--blue)"    icon={<ClipboardList size={16} />} />
        <StatCard label="Actions Today"      value={counts.today}    sub="Last 24 hours"          accent="var(--emerald)" icon={<ClipboardList size={16} />} />
        <StatCard label="Admin Actions"      value={counts.admins}   sub="System administrator"   accent="var(--rose)"    icon={<ClipboardList size={16} />} />
        <StatCard label="Encoder Actions"    value={counts.encoders} sub="Ordinance operations"   accent="var(--amber)"   icon={<ClipboardList size={16} />} />
      </div>

      {/* Toolbar */}
      <Card style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', flex: 1, minWidth: 200 }}>
          <Search size={14} color="var(--slate)" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search user, action, or target..."
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--navy)', flex: 1, padding: '9px 0' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={13} color="var(--slate)" />
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            style={{ border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '8px 12px', fontSize: 12.5, color: 'var(--slate)', outline: 'none', cursor: 'pointer' }}
          >
            {roles.map(r => <option key={r}>{r === 'all' ? 'All Roles' : r}</option>)}
          </select>
          <select
            value={actionFilter}
            onChange={e => { setActionFilter(e.target.value); setPage(1); }}
            style={{ border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '8px 12px', fontSize: 12.5, color: 'var(--slate)', outline: 'none', cursor: 'pointer' }}
          >
            {actions.map(a => <option key={a}>{a === 'all' ? 'All Actions' : a}</option>)}
          </select>
        </div>
        <button
          onClick={exportCSV}
          style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '7px 13px', fontSize: 12, color: 'var(--slate)', cursor: 'pointer', fontWeight: 500 }}
        >
          <Download size={13} /> Export CSV
        </button>
      </Card>

      {/* Table */}
      <Card>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>System Activity Log</div>
            <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>
              Showing {filtered.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1}
              {' - '}
              {Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length} entries
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--slate)', background: 'var(--sky)', padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)' }}>
            Logs are read-only and tamper-proof
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--sky)' }}>
                {['#', 'User', 'Role', 'Action', 'Target', 'Timestamp', 'IP Address', ''].map(h => (
                  <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageSlice.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--slate)' }}>
                    No log entries match your filters.
                  </td>
                </tr>
              ) : pageSlice.map((log, i) => {
                const actionConf = ACTION_COLORS[log.action] || { bg: '#F1F5F9', color: 'var(--slate)' };
                const globalIdx = (safePage - 1) * PER_PAGE + i + 1;
                return (
                  <tr
                    key={log.id}
                    style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(235,241,255,0.3)', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(235,241,255,0.5)')}
                    onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(235,241,255,0.3)')}
                  >
                    <td style={{ padding: '11px 18px', fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--slate-light)' }}>#{globalIdx}</td>
                    <td style={{ padding: '11px 18px', fontWeight: 600, color: 'var(--navy)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--navy))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {log.user.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </div>
                        {log.user}
                      </div>
                    </td>
                    <td style={{ padding: '11px 18px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--slate)', background: '#F1F5F9', padding: '3px 8px', borderRadius: 4 }}>{log.role}</span>
                    </td>
                    <td style={{ padding: '11px 18px' }}>
                      <span style={{ background: actionConf.bg, color: actionConf.color, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '11px 18px', color: 'var(--navy)', fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.target}</td>
                    <td style={{ padding: '11px 18px', color: 'var(--slate)', fontSize: 12, whiteSpace: 'nowrap' }}>{log.time}</td>
                    <td style={{ padding: '11px 18px', fontFamily: "'DM Mono', monospace", fontSize: 11.5, color: 'var(--slate)' }}>{log.ip}</td>
                    <td style={{ padding: '11px 18px' }}>
                      <button
                        onClick={() => setDetail(log)}
                        style={{ background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--navy)' }}
                      >
                        <Eye size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--slate)' }}>Page {safePage} of {totalPages}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} style={btnStyle(safePage === 1)}>
              &laquo; Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{ width: 30, height: 30, border: '1px solid var(--border)', background: p === safePage ? 'var(--navy)' : 'var(--white)', color: p === safePage ? '#fff' : 'var(--slate)', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}
              >
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} style={btnStyle(safePage === totalPages)}>
              Next &raquo;
            </button>
          </div>
        </div>
      </Card>

      {/* Detail modal */}
      {detail && (
        <>
          <div onClick={() => setDetail(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.4)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 420, background: 'var(--white)', borderRadius: 14, boxShadow: '0 8px 40px rgba(15,31,61,0.2)', zIndex: 101, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', background: 'var(--navy)', color: '#fff' }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Log Entry Detail</div>
              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 3 }}>Entry #{detail.id} &middot; {detail.time}</div>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'User',              value: detail.user   },
                { label: 'Role',              value: detail.role   },
                { label: 'Action Performed',  value: detail.action },
                { label: 'Target / Resource', value: detail.target },
                { label: 'Timestamp',         value: detail.time   },
                { label: 'IP Address',        value: detail.ip     },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--sky)', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 500 }}>{value}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setDetail(null)} style={{ background: 'var(--navy)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
