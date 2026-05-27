import { FileText, ShieldCheck, Clock, CheckCircle, AlertTriangle, ArrowRight, Bell, Sparkles } from 'lucide-react';
import type { DeptHeadUser, AssignedOrdinance } from '../../data/deptHeadData';

interface DeptDashboardProps {
  user: DeptHeadUser;
  ordinances: AssignedOrdinance[];
  onNavigate: (s: any) => void;
}

const statusColors: Record<string, { bg: string; color: string; icon: React.ReactNode; label: string }> = {
  compliant:     { bg: '#D1FAE5', color: '#059669', icon: <CheckCircle size={14} />,   label: 'Compliant'   },
  'in-progress': { bg: '#EBF1FF', color: '#3B7BF8', icon: <Clock size={14} />,         label: 'In Progress' },
  delayed:       { bg: '#FEE2E2', color: '#EF4444', icon: <AlertTriangle size={14} />, label: 'Delayed'     },
  pending:       { bg: '#FEF3C7', color: '#B45309', icon: <Clock size={14} />,         label: 'Pending'     },
  overdue:       { bg: '#fee2e2', color: '#dc2626', icon: <AlertTriangle size={14} />, label: 'Overdue'     },
};

const TODAY_ISO = '2024-05-27';

function daysUntilISO(isoDate: string): number {
  const today = new Date(TODAY_ISO);
  const target = new Date(isoDate);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function isOverdue(ord: AssignedOrdinance) {
  if (ord.complianceStatus === 'compliant') return false;
  return ord.deadlineISO < TODAY_ISO;
}

export default function DeptDashboardScreen({ user, ordinances, onNavigate }: DeptDashboardProps) {
  const compliant   = ordinances.filter(o => o.complianceStatus === 'compliant').length;
  const inProgress  = ordinances.filter(o => o.complianceStatus === 'in-progress').length;
  const pending     = ordinances.filter(o => o.complianceStatus === 'pending' || o.complianceStatus === 'overdue').length;
  const newCount    = ordinances.filter(o => o.isNew).length;
  const overdueOrds = ordinances.filter(isOverdue);
  const overallRate = Math.round(ordinances.reduce((a, o) => a + o.progress, 0) / ordinances.length);

  const urgent = ordinances.filter(o => {
    const days = daysUntilISO(o.deadlineISO);
    return days <= 30 && o.complianceStatus !== 'compliant';
  });

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0F2027 0%, #1a3a4a 60%, #0d3d2e 100%)',
        borderRadius: 14, padding: '24px 28px', color: '#fff',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: -40, top: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(16,185,129,0.08)' }} />
        <div style={{ position: 'absolute', right: 80, bottom: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(16,185,129,0.05)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Department Head Portal
          </div>
          <div style={{ fontSize: 21, fontWeight: 700, fontFamily: 'Georgia, serif', marginBottom: 4 }}>
            Good morning, {user.title}. {user.name.split(' ')[0]}
          </div>
          <div style={{ fontSize: 12.5, opacity: 0.6 }}>
            {user.office} · Monday, May 27, 2024
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          {newCount > 0 && (
            <div style={{
              background: '#10B981', color: '#fff',
              borderRadius: 8, padding: '8px 16px',
              fontSize: 12.5, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Bell size={13} /> {newCount} New Ordinance{newCount > 1 ? 's' : ''} Assigned
            </div>
          )}
          <div style={{ fontSize: 11, opacity: 0.5 }}>
            Overall compliance: <span style={{ color: '#10B981', fontWeight: 700 }}>{overallRate}%</span>
          </div>
        </div>
      </div>

      {/* Overdue banner */}
      {overdueOrds.length > 0 && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12,
          padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b' }}>
              {overdueOrds.length} overdue compliance report{overdueOrds.length > 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 2 }}>
              {overdueOrds.map(o => o.number).join(', ')} — Submit immediately or request an extension to avoid escalation.
            </div>
          </div>
          <button
            onClick={() => onNavigate('dh-compliance')}
            style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Submit Now
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Assigned', value: ordinances.length, sub: 'Ordinances to implement', color: '#3B7BF8', icon: <FileText size={16} /> },
          { label: 'Compliant', value: compliant, sub: 'Fully implemented', color: '#10B981', icon: <CheckCircle size={16} /> },
          { label: 'In Progress', value: inProgress, sub: 'Ongoing actions', color: '#3B7BF8', icon: <Clock size={16} /> },
          { label: 'Action Needed', value: pending, sub: 'Not yet started', color: '#F59E0B', icon: <AlertTriangle size={16} /> },
        ].map(s => (
          <div key={s.label} style={{
            background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12,
            padding: '18px 20px', boxShadow: '0 1px 4px rgba(15,31,61,0.07)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: '10px 10px 0 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 12, color: '#64748B', fontWeight: 500 }}>{s.label}</span>
              <span style={{ color: s.color, opacity: 0.8 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#0F1F3D', lineHeight: 1.2, margin: '6px 0 4px', fontFamily: 'Georgia, serif' }}>{s.value}</div>
            <div style={{ fontSize: 11.5, color: '#94A3B8' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>

        {/* Assigned ordinances */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 1px 4px rgba(15,31,61,0.07)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0F1F3D' }}>My Assigned Ordinances</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Your office's implementation responsibilities</div>
            </div>
            <button
              onClick={() => onNavigate('dh-ordinances')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#EBF1FF', border: '1px solid #E2E8F0', borderRadius: 6, padding: '6px 12px', fontSize: 12, color: '#3B7BF8', fontWeight: 500, cursor: 'pointer' }}
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div>
            {ordinances.map((ord, i) => {
              const overdue = isOverdue(ord);
              const sc = statusColors[overdue ? 'overdue' : ord.complianceStatus] ?? statusColors['pending'];
              const days = daysUntilISO(ord.deadlineISO);
              return (
                <div
                  key={ord.id}
                  onClick={() => onNavigate('dh-ordinances')}
                  style={{
                    padding: '14px 20px',
                    borderBottom: i < ordinances.length - 1 ? '1px solid #E2E8F0' : 'none',
                    display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer',
                    transition: 'background 0.1s',
                    background: overdue ? 'rgba(220,38,38,0.02)' : ord.isNew ? 'rgba(16,185,129,0.03)' : 'transparent',
                    borderLeft: overdue ? '3px solid #dc2626' : 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F6F8FC')}
                  onMouseLeave={e => (e.currentTarget.style.background = overdue ? 'rgba(220,38,38,0.02)' : ord.isNew ? 'rgba(16,185,129,0.03)' : 'transparent')}
                >
                  {/* Icon */}
                  {ord.isNew && !overdue && (
                    <div style={{ position: 'relative' }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={16} color="#10B981" />
                      </div>
                      <div style={{ position: 'absolute', top: -4, right: -4, width: 10, height: 10, borderRadius: '50%', background: '#10B981', border: '2px solid #fff' }} />
                    </div>
                  )}
                  {overdue && (
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <AlertTriangle size={16} color="#dc2626" />
                    </div>
                  )}
                  {!ord.isNew && !overdue && (
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#EBF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={16} color="#3B7BF8" />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0F1F3D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ord.title}
                      </div>
                      {ord.isNew && !overdue && (
                        <span style={{ background: '#10B981', color: '#fff', fontSize: 9.5, fontWeight: 700, padding: '1px 6px', borderRadius: 4, flexShrink: 0, letterSpacing: '0.05em' }}>NEW</span>
                      )}
                      {overdue && (
                        <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: 9.5, fontWeight: 700, padding: '1px 6px', borderRadius: 4, flexShrink: 0 }}>OVERDUE</span>
                      )}
                      {ord.priority === 'urgent' && !overdue && (
                        <span style={{ background: '#FEF3C7', color: '#B45309', fontSize: 9.5, fontWeight: 700, padding: '1px 6px', borderRadius: 4, flexShrink: 0 }}>URGENT</span>
                      )}
                      {ord.priority === 'immediate' && !overdue && (
                        <span style={{ background: '#FEE2E2', color: '#dc2626', fontSize: 9.5, fontWeight: 700, padding: '1px 6px', borderRadius: 4, flexShrink: 0 }}>IMMEDIATE</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748B' }}>{ord.number}</span>
                      <span style={{ background: sc.bg, color: sc.color, fontSize: 10.5, fontWeight: 600, padding: '2px 7px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                        {sc.icon} {sc.label}
                      </span>
                    </div>
                    {/* Progress */}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${ord.progress}%`, background: overdue ? '#dc2626' : ord.progress === 100 ? '#10B981' : ord.progress > 50 ? '#3B7BF8' : '#F59E0B', borderRadius: 2, transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  </div>
                  {/* Deadline */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 10.5, color: '#94A3B8', marginBottom: 3 }}>Deadline</div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: overdue ? '#dc2626' : days < 14 && ord.complianceStatus !== 'compliant' ? '#EF4444' : '#0F1F3D' }}>
                      {ord.deadline}
                    </div>
                    {overdue ? (
                      <div style={{ fontSize: 10, color: '#dc2626', marginTop: 1, fontWeight: 600 }}>
                        {Math.abs(days)}d overdue
                      </div>
                    ) : days >= 0 && ord.complianceStatus !== 'compliant' && (
                      <div style={{ fontSize: 10, color: days < 14 ? '#EF4444' : '#94A3B8', marginTop: 1 }}>
                        {days}d left
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Compliance progress ring */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 1px 4px rgba(15,31,61,0.07)', padding: '20px 24px' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#0F1F3D', marginBottom: 16 }}>Compliance Overview</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
              {/* Pseudo-ring */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
                background: `conic-gradient(#10B981 0% ${overallRate}%, #E2E8F0 ${overallRate}% 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <div style={{ width: 58, height: 58, borderRadius: '50%', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#0F1F3D', lineHeight: 1 }}>{overallRate}%</div>
                  <div style={{ fontSize: 9, color: '#94A3B8' }}>overall</div>
                </div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {[
                  { label: 'Compliant', count: compliant, color: '#10B981' },
                  { label: 'In Progress', count: inProgress, color: '#3B7BF8' },
                  { label: 'Pending', count: pending, color: '#F59E0B' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                      <span style={{ fontSize: 12, color: '#64748B' }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0F1F3D' }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Urgent actions */}
          {urgent.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #FEE2E2', borderRadius: 12, boxShadow: '0 1px 4px rgba(239,68,68,0.08)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #FEE2E2', background: 'rgba(239,68,68,0.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={14} color="#EF4444" />
                <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0F1F3D' }}>Requires Attention</div>
              </div>
              <div>
                {urgent.map((ord, i) => {
                  return (
                    <div key={ord.id} style={{ padding: '12px 18px', borderBottom: i < urgent.length - 1 ? '1px solid #FEE2E2' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0F1F3D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ord.title}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{ord.number}</div>
                      </div>
                      <div style={{ background: isOverdue(ord) ? '#fee2e2' : '#FEE2E2', color: isOverdue(ord) ? '#dc2626' : '#EF4444', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 20, flexShrink: 0, whiteSpace: 'nowrap' }}>
                        {isOverdue(ord) ? `${Math.abs(daysUntilISO(ord.deadlineISO))}d overdue` : `${daysUntilISO(ord.deadlineISO)}d left`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick actions */}
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, boxShadow: '0 1px 4px rgba(15,31,61,0.07)', padding: '16px 18px' }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0F1F3D', marginBottom: 12 }}>Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Submit Compliance Report', icon: <ShieldCheck size={14} />, screen: 'dh-compliance', color: '#10B981' },
                { label: 'View New Ordinances', icon: <Sparkles size={14} />, screen: 'dh-ordinances', color: '#3B7BF8' },
                { label: 'Check Notifications', icon: <Bell size={14} />, screen: 'dh-notifications', color: '#F59E0B' },
              ].map(a => (
                <button
                  key={a.label}
                  onClick={() => onNavigate(a.screen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: '#F6F8FC', border: '1px solid #E2E8F0',
                    borderRadius: 8, padding: '10px 14px', cursor: 'pointer',
                    color: '#0F1F3D', fontSize: 13, fontWeight: 500,
                    transition: 'all 0.15s', textAlign: 'left',
                  }}
                  onMouseEnter={e => { (e.currentTarget.style.background = a.color + '12'); (e.currentTarget.style.borderColor = a.color + '40'); }}
                  onMouseLeave={e => { (e.currentTarget.style.background = '#F6F8FC'); (e.currentTarget.style.borderColor = '#E2E8F0'); }}
                >
                  <span style={{ color: a.color }}>{a.icon}</span>
                  {a.label}
                  <ArrowRight size={12} color="#94A3B8" style={{ marginLeft: 'auto' }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}