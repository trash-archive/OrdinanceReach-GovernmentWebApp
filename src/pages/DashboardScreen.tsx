import { FileText, Building2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { StatCard, Card, StatusBadge, ComplianceBadge } from '../components/UI';
import { ordinances, departments, notifications } from '../data/mockData';

interface DashboardProps {
  onNavigate: (s: any) => void;
}

const recentOrds = ordinances.filter(o => o.status === 'active').slice(0, 4);
const recentDepts = departments.slice(0, 5);

export default function DashboardScreen({ onNavigate }: DashboardProps) {
  const activeCount = ordinances.filter(o => o.status === 'active').length;
  const draftCount = ordinances.filter(o => o.status === 'draft').length;
  const delayedDepts = departments.filter(d => d.compliance === 'delayed').length;
  const compliantDepts = departments.filter(d => d.compliance === 'compliant').length;

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Greeting */}
      <div style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 60%, var(--blue) 100%)',
        borderRadius: 'var(--radius)', padding: '24px 28px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        overflow: 'hidden', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', right: -30, top: -30, width: 200, height: 200,
          borderRadius: '50%', background: 'rgba(59,123,248,0.15)',
        }} />
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Fraunces', serif", marginBottom: 4 }}>
            Good morning, M. Santos
          </div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>
            Monday, May 25, 2026 · Ordinance Encoder · City Council Office
          </div>
        </div>
        <div style={{ textAlign: 'right', position: 'relative' }}>
          <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
            Pending Action
          </div>
          <div style={{
            background: 'var(--amber)', color: 'var(--navy)',
            borderRadius: 8, padding: '8px 16px',
            fontSize: 13, fontWeight: 700,
          }}>
            2 Drafts Awaiting Publish
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard
          label="Active Ordinances"
          value={activeCount}
          sub="↑ 3 this month"
          accent="var(--emerald)"
          icon={<FileText size={18} />}
        />
        <StatCard
          label="Departments Assigned"
          value={departments.length}
          sub={`${compliantDepts} fully compliant`}
          accent="var(--blue)"
          icon={<Building2 size={18} />}
        />
        <StatCard
          label="Delayed Implementations"
          value={delayedDepts}
          sub="Requires attention"
          accent="var(--rose)"
          icon={<AlertTriangle size={18} />}
        />
        <StatCard
          label="Drafts in Queue"
          value={draftCount}
          sub="Awaiting publication"
          accent="var(--amber)"
          icon={<Clock size={18} />}
        />
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
        {/* Recent ordinances */}
        <Card>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>Recent Ordinances</div>
              <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>Latest passed & published</div>
            </div>
            <button
              onClick={() => onNavigate('ordinances')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'var(--sky)', border: '1px solid var(--border)',
                borderRadius: 6, padding: '6px 12px', fontSize: 12, color: 'var(--blue)', fontWeight: 500,
              }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div>
            {recentOrds.map((ord, i) => (
              <div key={ord.id} style={{
                padding: '14px 20px',
                borderBottom: i < recentOrds.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'flex-start', gap: 14,
                cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--sky)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: 'var(--sky)', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FileText size={16} color="var(--blue)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ord.title}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: 'var(--slate)' }}>{ord.number}</span>
                    <StatusBadge status={ord.status} />
                    <span style={{ fontSize: 11, color: 'var(--slate)' }}>{ord.datePassed}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Compliance summary */}
          <Card>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>Compliance Overview</div>
            </div>
            <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Compliant', count: compliantDepts, color: 'var(--emerald)', width: (compliantDepts / departments.length) * 100 },
                { label: 'In Progress', count: departments.filter(d => d.compliance === 'in-progress').length, color: 'var(--blue)', width: (departments.filter(d => d.compliance === 'in-progress').length / departments.length) * 100 },
                { label: 'Delayed', count: delayedDepts, color: 'var(--rose)', width: (delayedDepts / departments.length) * 100 },
                { label: 'Pending', count: departments.filter(d => d.compliance === 'pending').length, color: 'var(--amber)', width: (departments.filter(d => d.compliance === 'pending').length / departments.length) * 100 },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--slate)' }}>{item.label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>{item.count}</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--sky)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${item.width}%`, background: item.color, borderRadius: 3, transition: 'width 0.6s' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Notifications */}
          <Card style={{ flex: 1 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>Alerts</div>
              <span style={{
                background: 'var(--rose-light)', color: 'var(--rose)',
                fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
              }}>
                {notifications.filter(n => !n.read).length} new
              </span>
            </div>
            <div>
              {notifications.slice(0, 4).map((notif, i) => {
                const colors: Record<string, string> = {
                  success: 'var(--emerald)', warning: 'var(--amber)',
                  info: 'var(--blue)', alert: 'var(--rose)',
                };
                return (
                  <div key={notif.id} style={{
                    padding: '12px 20px',
                    borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    background: !notif.read ? 'rgba(59,123,248,0.03)' : 'transparent',
                  }}>
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: colors[notif.type], flexShrink: 0, marginTop: 5,
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy)', marginBottom: 2 }}>{notif.title}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--slate)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.message}</div>
                      <div style={{ fontSize: 11, color: 'var(--slate-light)', marginTop: 3 }}>{notif.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Department table snippet */}
      <Card>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>Department Status Summary</div>
          <button
            onClick={() => onNavigate('compliance')}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'var(--sky)', border: '1px solid var(--border)',
              borderRadius: 6, padding: '6px 12px', fontSize: 12, color: 'var(--blue)', fontWeight: 500,
            }}
          >
            Full Tracking <ArrowRight size={12} />
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--sky)' }}>
                {['Department', 'Head', 'Assigned', 'Completed', 'Status', 'Last Update'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11.5, fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentDepts.map((dept, i) => (
                <tr key={dept.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(235,241,255,0.3)' }}>
                  <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--navy)' }}>{dept.name}</td>
                  <td style={{ padding: '12px 20px', color: 'var(--slate)' }}>{dept.head}</td>
                  <td style={{ padding: '12px 20px', fontFamily: "'DM Mono', monospace", color: 'var(--navy)' }}>{dept.assignedCount}</td>
                  <td style={{ padding: '12px 20px', fontFamily: "'DM Mono', monospace", color: 'var(--navy)' }}>
                    <span style={{ color: dept.completedCount === dept.assignedCount ? 'var(--emerald)' : 'var(--navy)' }}>
                      {dept.completedCount}/{dept.assignedCount}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px' }}><ComplianceBadge status={dept.compliance} /></td>
                  <td style={{ padding: '12px 20px', color: 'var(--slate)', fontSize: 12 }}>{dept.lastUpdate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}