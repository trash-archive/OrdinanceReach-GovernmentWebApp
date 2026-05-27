import { useState } from 'react';
import { ShieldCheck, Upload, ChevronDown, ChevronUp, CheckCircle, Clock, AlertTriangle, Circle, Send, Bell, Flag, X, Mail, Smartphone } from 'lucide-react';
import { departments, ordinances } from '../data/mockData';
import type { ComplianceStatus, Department } from '../data/mockData';
import { ComplianceBadge, Card, StatCard } from '../components/UI';

interface ComplianceTrackingScreenProps {
  onNavigate: (s: any) => void;
}

// Extended compliance status includes overdue + escalated
type ExtStatus = ComplianceStatus | 'overdue' | 'escalated';

interface DeptState {
  dept: Department;
  extStatus: ExtStatus;
  reminderCount: number;
  escalated: boolean;
}

const complianceDetails: Record<string, { status: ComplianceStatus; note: string; lastReport: string; evidence: string[]; deadlineISO: string }> = {
  '1-3': { status: 'compliant',    note: 'All traffic enforcers briefed. Implementation report submitted.',  lastReport: 'Mar 10, 2024', evidence: ['TMO_Report_SP2024033.pdf'],                                    deadlineISO: '2024-04-05' },
  '2-1': { status: 'in-progress',  note: 'Barangay coordination ongoing. 4 of 6 meetings done.',             lastReport: 'Apr 18, 2024', evidence: [],                                                             deadlineISO: '2024-05-12' },
  '2-2': { status: 'in-progress',  note: 'Monitoring of plastic use in 15 markets started.',                 lastReport: 'Apr 10, 2024', evidence: ['MarketInspection_Apr.pdf'],                                   deadlineISO: '2024-05-28' },
  '3-4': { status: 'compliant',    note: 'All food handlers certified. Spot checks completed.',              lastReport: 'Feb 25, 2024', evidence: ['HealthCert_Report.pdf', 'FoodSafety_Audit.pdf'],              deadlineISO: '2024-03-19' },
  '4-6': { status: 'delayed',      note: 'Online portal not yet integrated. IT contractor delays.',          lastReport: 'Jan 30, 2024', evidence: [],                                                             deadlineISO: '2024-03-01' },
  '5-7': { status: 'in-progress',  note: '5 of 7 barangays have updated ERPs.',                              lastReport: 'Apr 5, 2024',  evidence: ['BarangayERP_Update.pdf'],                                    deadlineISO: '2024-05-08' },
  '6-3': { status: 'pending',      note: 'Not yet started. Waiting for budget allocation.',                  lastReport: '—',            evidence: [],                                                             deadlineISO: '2024-04-05' },
  '7-7': { status: 'compliant',    note: 'Quarterly drills conducted in all areas.',                         lastReport: 'Mar 28, 2024', evidence: ['DrillReport_Q1.pdf', 'Equipment_Checklist.pdf'],              deadlineISO: '2024-02-08' },
  '8-8': { status: 'in-progress',  note: 'Tree inventory 60% complete.',                                     lastReport: 'Apr 2, 2024',  evidence: [],                                                             deadlineISO: '2024-05-18' },
};

const TODAY_ISO = '2024-05-27'; // fixed demo date

function isOverdue(deadlineISO: string, status: ComplianceStatus) {
  if (status === 'compliant') return false;
  return deadlineISO < TODAY_ISO;
}

const complianceIcon: Record<ExtStatus, React.ReactNode> = {
  compliant:     <CheckCircle size={15} color="var(--emerald)" />,
  'in-progress': <Clock size={15} color="var(--blue)" />,
  delayed:       <AlertTriangle size={15} color="var(--rose)" />,
  pending:       <Circle size={15} color="var(--amber)" />,
  overdue:       <AlertTriangle size={15} color="#dc2626" />,
  escalated:     <Flag size={15} color="#7c3aed" />,
};

// Reminder email template
function buildReminderEmail(deptName: string, ordNumber: string, daysOverdue: number) {
  return {
    subject: `[REMINDER] Compliance Report Overdue – ${ordNumber} | Immediate Action Required`,
    body: `This is a follow-up notice from the Office of the Sangguniang Panlungsod.\n\nYour office's compliance report for Ordinance ${ordNumber} was due ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} ago and has not yet been submitted.\n\nPlease submit your report via OrdinanceFlow Cebu within 5 working days to avoid escalation to the City Council.\n\nIf you are experiencing difficulties, you may request a deadline extension through the system.\n\nThis is an automated reminder from OrdinanceFlow Cebu.`,
  };
}

export default function ComplianceTrackingScreen({ onNavigate: _onNavigate }: ComplianceTrackingScreenProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<ExtStatus | 'all'>('all');
  const [reportModal, setReportModal] = useState<{ dept: string; ord: string } | null>(null);
  const [reminderModal, setReminderModal] = useState<{ deptId: string; deptName: string } | null>(null);
  const [deptStates, setDeptStates] = useState<Record<string, DeptState>>(() =>
    Object.fromEntries(departments.map(d => {
      // Determine if any assigned ordinance is overdue
      const deptOrds = ordinances.filter(o => o.offices.some(of => of.toLowerCase().includes(d.name.split(' ')[0].toLowerCase())));
      const hasOverdue = deptOrds.some(ord => {
        const key = `${d.id}-${ord.id}`;
        const detail = complianceDetails[key];
        return detail && isOverdue(detail.deadlineISO, detail.status);
      });
      const extStatus: ExtStatus = hasOverdue && d.compliance !== 'compliant' ? 'overdue' : d.compliance;
      return [d.id, { dept: d, extStatus, reminderCount: 0, escalated: false }];
    }))
  );
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'warn' } | null>(null);
  const [extensionModal, setExtensionModal] = useState<{ deptId: string; deptName: string; ordNumber: string } | null>(null);

  function showToast(msg: string, type: 'success' | 'warn' = 'success') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function handleSendReminder(deptId: string, deptName: string) {
    setReminderModal({ deptId, deptName });
  }

  function confirmReminder() {
    if (!reminderModal) return;
    setDeptStates(prev => {
      const s = prev[reminderModal.deptId];
      const newCount = s.reminderCount + 1;
      const escalated = newCount >= 2;
      return {
        ...prev,
        [reminderModal.deptId]: {
          ...s,
          reminderCount: newCount,
          escalated,
          extStatus: escalated ? 'escalated' : s.extStatus,
        },
      };
    });
    const count = deptStates[reminderModal.deptId].reminderCount + 1;
    if (count >= 2) {
      showToast(`${reminderModal.deptName} has been escalated to City Council after ${count} reminders.`, 'warn');
    } else {
      showToast(`Reminder sent to ${reminderModal.deptName} via Email + SMS + In-App.`);
    }
    setReminderModal(null);
  }

  const counts = {
    compliant:  Object.values(deptStates).filter(s => s.extStatus === 'compliant').length,
    inProgress: Object.values(deptStates).filter(s => s.extStatus === 'in-progress').length,
    delayed:    Object.values(deptStates).filter(s => s.extStatus === 'delayed').length,
    pending:    Object.values(deptStates).filter(s => s.extStatus === 'pending').length,
    overdue:    Object.values(deptStates).filter(s => s.extStatus === 'overdue' || s.extStatus === 'escalated').length,
  };

  const overallRate = Math.round(
    (departments.reduce((a, d) => a + d.completedCount, 0) /
      departments.reduce((a, d) => a + d.assignedCount, 0)) * 100
  );

  const filtered = departments.filter(d => {
    const s = deptStates[d.id]?.extStatus ?? d.compliance;
    if (filter === 'all') return true;
    if (filter === 'overdue') return s === 'overdue' || s === 'escalated';
    return s === filter;
  });

  const filterOptions: { value: ExtStatus | 'all'; label: string }[] = [
    { value: 'all',         label: 'All'         },
    { value: 'compliant',   label: 'Compliant'   },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'delayed',     label: 'Delayed'     },
    { value: 'overdue',     label: `Overdue (${counts.overdue})` },
    { value: 'pending',     label: 'Pending'     },
  ];

  const statusBg: Record<ExtStatus, string> = {
    compliant:     'var(--emerald-light)',
    'in-progress': 'var(--sky)',
    delayed:       'var(--rose-light)',
    pending:       'var(--amber-light)',
    overdue:       '#fee2e2',
    escalated:     '#ede9fe',
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 300, background: toast.type === 'success' ? 'var(--emerald)' : 'var(--amber)', color: '#fff', borderRadius: 10, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', fontSize: 13, fontWeight: 500, animation: 'slideDown 0.3s ease' }}>
          <CheckCircle size={16} />{toast.msg}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr', gap: 14 }}>
        <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', borderRadius: 12, padding: '20px 24px', color: '#fff', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 500 }}>Overall Compliance Rate</div>
          <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1, margin: '8px 0' }}>{overallRate}%</div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${overallRate}%`, background: 'var(--emerald)', borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>Across {departments.length} departments</div>
        </div>
        <StatCard label="Compliant"   value={counts.compliant}  sub="Fully done"      accent="var(--emerald)" icon={<ShieldCheck size={16} />} />
        <StatCard label="In Progress" value={counts.inProgress} sub="Ongoing"         accent="var(--blue)"    icon={<Clock size={16} />} />
        <StatCard label="Delayed"     value={counts.delayed}    sub="Behind schedule" accent="var(--rose)"    icon={<AlertTriangle size={16} />} />
        <StatCard label="Overdue"     value={counts.overdue}    sub="Past deadline"   accent="#dc2626"        icon={<AlertTriangle size={16} />} />
        <StatCard label="Pending"     value={counts.pending}    sub="Not started"     accent="var(--amber)"   icon={<Circle size={16} />} />
      </div>

      {/* Overdue alert banner */}
      {counts.overdue > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b' }}>{counts.overdue} department{counts.overdue > 1 ? 's have' : ' has'} overdue compliance reports</div>
            <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 2 }}>These offices have missed their deadlines. Send reminders or escalate to the City Council.</div>
          </div>
          <button onClick={() => setFilter('overdue')} style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            View Overdue
          </button>
        </div>
      )}

      {/* Filters */}
      <Card style={{ padding: '12px 18px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 600, marginRight: 4 }}>Filter:</span>
        {filterOptions.map(opt => (
          <button key={opt.value} onClick={() => setFilter(opt.value)} style={{ border: '1px solid var(--border)', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s', background: filter === opt.value ? 'var(--navy)' : 'var(--white)', color: filter === opt.value ? '#fff' : 'var(--slate)' }}>
            {opt.label}
          </button>
        ))}
      </Card>

      {/* Department compliance cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(dept => {
          const state = deptStates[dept.id];
          const extStatus = state?.extStatus ?? dept.compliance;
          const progress = dept.assignedCount > 0 ? (dept.completedCount / dept.assignedCount) * 100 : 0;
          const isOpen = expanded === dept.id;
          const deptOrds = ordinances.filter(o => o.offices.some(of => of.toLowerCase().includes(dept.name.split(' ')[0].toLowerCase())));
          const isOverdueOrEscalated = extStatus === 'overdue' || extStatus === 'escalated';

          return (
            <Card key={dept.id} style={{ overflow: 'hidden', border: isOverdueOrEscalated ? `1.5px solid ${extStatus === 'escalated' ? '#7c3aed' : '#fca5a5'}` : '1px solid var(--border)' }}>
              {/* Overdue/Escalated banner */}
              {isOverdueOrEscalated && (
                <div style={{ padding: '8px 20px', background: extStatus === 'escalated' ? '#ede9fe' : '#fef2f2', borderBottom: `1px solid ${extStatus === 'escalated' ? '#c4b5fd' : '#fecaca'}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {extStatus === 'escalated' ? <Flag size={13} color="#7c3aed" /> : <AlertTriangle size={13} color="#dc2626" />}
                  <span style={{ fontSize: 12, fontWeight: 600, color: extStatus === 'escalated' ? '#5b21b6' : '#991b1b' }}>
                    {extStatus === 'escalated'
                      ? `Escalated to City Council — ${state.reminderCount} reminder${state.reminderCount !== 1 ? 's' : ''} sent`
                      : `Compliance report overdue — ${state.reminderCount} reminder${state.reminderCount !== 1 ? 's' : ''} sent`}
                  </span>
                  {extStatus !== 'escalated' && (
                    <button onClick={() => handleSendReminder(dept.id, dept.name)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                      <Bell size={11} /> Send Reminder
                    </button>
                  )}
                </div>
              )}

              {/* Header row */}
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }} onClick={() => setExpanded(e => e === dept.id ? null : dept.id)}>
                <div style={{ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: statusBg[extStatus] }}>
                  {complianceIcon[extStatus]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{dept.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate)' }}>{dept.head}</div>
                </div>
                <div style={{ width: 180, flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: 'var(--slate)' }}>{dept.completedCount}/{dept.assignedCount} complete</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)' }}>{Math.round(progress)}%</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--sky)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, borderRadius: 4, transition: 'width 0.6s', background: progress === 100 ? 'var(--emerald)' : progress > 50 ? 'var(--blue)' : progress > 0 ? 'var(--amber)' : 'var(--rose)' }} />
                  </div>
                </div>
                <ComplianceBadge status={dept.compliance} />
                {!isOverdueOrEscalated && (
                  <button onClick={e => { e.stopPropagation(); handleSendReminder(dept.id, dept.name); }} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', fontSize: 11, color: 'var(--slate)', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    <Send size={11} /> Remind
                  </button>
                )}
                <div style={{ fontSize: 11, color: 'var(--slate-light)', whiteSpace: 'nowrap' }}>Updated {dept.lastUpdate}</div>
                {isOpen ? <ChevronUp size={16} color="var(--slate)" /> : <ChevronDown size={16} color="var(--slate)" />}
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', background: 'rgba(235,241,255,0.2)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Ordinance-by-Ordinance Status</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {deptOrds.length === 0 ? (
                      <div style={{ color: 'var(--slate)', fontSize: 13 }}>No ordinances assigned.</div>
                    ) : deptOrds.map(ord => {
                      const key = `${dept.id}-${ord.id}`;
                      const detail = complianceDetails[key] || { status: 'pending' as ComplianceStatus, note: 'No report submitted yet.', lastReport: '—', evidence: [], deadlineISO: '' };
                      const ordOverdue = detail.deadlineISO ? isOverdue(detail.deadlineISO, detail.status) : false;
                      const displayStatus: ExtStatus = ordOverdue ? 'overdue' : detail.status;
                      return (
                        <div key={ord.id} style={{ background: 'var(--white)', border: `1px solid ${ordOverdue ? '#fca5a5' : 'var(--border)'}`, borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                          <div style={{ marginTop: 2 }}>{complianceIcon[displayStatus]}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ord.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--slate)', fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{ord.number}</div>
                            <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 6, lineHeight: 1.5 }}>{detail.note}</div>
                            {ordOverdue && (
                              <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, marginTop: 4 }}>
                                ⚠ Deadline was {detail.deadlineISO} — overdue
                              </div>
                            )}
                            {detail.evidence.length > 0 && (
                              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                {detail.evidence.map(ev => (
                                  <span key={ev} style={{ fontSize: 11, background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', color: 'var(--blue)', fontWeight: 500 }}>{ev}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                            <ComplianceBadge status={detail.status} />
                            <div style={{ fontSize: 11, color: 'var(--slate-light)' }}>Report: {detail.lastReport}</div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {ordOverdue && (
                                <button onClick={() => setExtensionModal({ deptId: dept.id, deptName: dept.name, ordNumber: ord.number })} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#dc2626', cursor: 'pointer', fontWeight: 500 }}>
                                  <Clock size={10} /> Review Extension
                                </button>
                              )}
                              <button onClick={() => setReportModal({ dept: dept.name, ord: ord.number })} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', fontSize: 11.5, color: 'var(--navy)', cursor: 'pointer', fontWeight: 500 }}>
                                <Upload size={11} /> Submit Report
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Submit Report Modal */}
      {reportModal && (
        <>
          <div onClick={() => setReportModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.4)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 480, background: 'var(--white)', borderRadius: 14, boxShadow: '0 8px 40px rgba(15,31,61,0.2)', zIndex: 101, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>Submit Implementation Report</div>
              <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>{reportModal.ord} · {reportModal.dept}</div>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: 6 }}>Implementation Status</label>
                <select style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--navy)', outline: 'none' }}>
                  <option>Compliant — Fully Implemented</option>
                  <option>In Progress — Partially Done</option>
                  <option>Delayed — Behind Schedule</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: 6 }}>Report Notes</label>
                <textarea rows={4} placeholder="Describe current implementation status, actions taken, and next steps..." style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--navy)', outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }} />
              </div>
              <div style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: '20px', textAlign: 'center', cursor: 'pointer', background: 'var(--sky)' }}>
                <Upload size={20} color="var(--slate)" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: 'var(--slate)' }}>Upload evidence documents or photos</div>
                <div style={{ fontSize: 11, color: 'var(--slate-light)', marginTop: 4 }}>PDF, DOCX, JPG, PNG up to 10MB</div>
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setReportModal(null)} style={{ border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'var(--slate)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setReportModal(null); showToast('Report submitted successfully.'); }} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Upload size={13} /> Submit Report
              </button>
            </div>
          </div>
        </>
      )}

      {/* Send Reminder Modal */}
      {reminderModal && (() => {
        const state = deptStates[reminderModal.deptId];
        const deptOrds = ordinances.filter(o => o.offices.some(of => of.toLowerCase().includes(reminderModal.deptName.split(' ')[0].toLowerCase())));
        const overdueOrd = deptOrds.find(ord => {
          const key = `${reminderModal.deptId}-${ord.id}`;
          const detail = complianceDetails[key];
          return detail && isOverdue(detail.deadlineISO, detail.status);
        });
        const email = overdueOrd ? buildReminderEmail(reminderModal.deptName, overdueOrd.number, 12) : null;
        const willEscalate = (state?.reminderCount ?? 0) >= 1;
        return (
          <>
            <div onClick={() => setReminderModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.4)', zIndex: 100 }} />
            <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 520, background: 'var(--white)', borderRadius: 14, boxShadow: '0 8px 40px rgba(15,31,61,0.2)', zIndex: 101, overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>Send Compliance Reminder</div>
                  <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>{reminderModal.deptName}</div>
                </div>
                <button onClick={() => setReminderModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)' }}><X size={16} /></button>
              </div>
              <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[{ icon: <Mail size={14} />, label: 'Email', color: 'var(--blue)' }, { icon: <Smartphone size={14} />, label: 'SMS', color: 'var(--emerald)' }, { icon: <Bell size={14} />, label: 'In-App', color: 'var(--slate)' }].map(ch => (
                    <div key={ch.label} style={{ flex: 1, padding: '10px', background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ color: ch.color, marginBottom: 4 }}>{ch.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)' }}>{ch.label}</div>
                    </div>
                  ))}
                </div>
                {email && (
                  <div style={{ background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', marginBottom: 6 }}>EMAIL PREVIEW</div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--navy)', marginBottom: 8 }}>Subject: {email.subject}</div>
                    <pre style={{ fontSize: 11.5, color: 'var(--navy)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{email.body}</pre>
                  </div>
                )}
                {willEscalate && (
                  <div style={{ padding: '10px 14px', background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <Flag size={14} color="#7c3aed" style={{ marginTop: 1, flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: '#5b21b6', lineHeight: 1.5 }}>
                      This is the 2nd reminder. Sending this will automatically escalate {reminderModal.deptName} to the City Council for follow-up.
                    </div>
                  </div>
                )}
              </div>
              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setReminderModal(null)} style={{ border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'var(--slate)', cursor: 'pointer' }}>Cancel</button>
                <button onClick={confirmReminder} style={{ background: willEscalate ? '#7c3aed' : '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Send size={13} /> {willEscalate ? 'Send & Escalate' : 'Send Reminder'}
                </button>
              </div>
            </div>
          </>
        );
      })()}

      {/* Extension Review Modal */}
      {extensionModal && (
        <>
          <div onClick={() => setExtensionModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.4)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 460, background: 'var(--white)', borderRadius: 14, boxShadow: '0 8px 40px rgba(15,31,61,0.2)', zIndex: 101, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>Extension Request</div>
                <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>{extensionModal.ordNumber} · {extensionModal.deptName}</div>
              </div>
              <button onClick={() => setExtensionModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)' }}><X size={16} /></button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 4 }}>Requested new deadline</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>April 30, 2024</div>
                <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 8, lineHeight: 1.5 }}>
                  <strong>Reason:</strong> Procurement delays due to budget re-alignment. Additional 45 days needed to complete installation across all terminals.
                </div>
                <div style={{ fontSize: 11, color: 'var(--slate-light)', marginTop: 6 }}>Submitted: March 18, 2024</div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: 6 }}>Review Note (optional)</label>
                <textarea rows={3} placeholder="Add a note for the department head…" style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--navy)', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => { setExtensionModal(null); showToast('Extension request denied. Department has been notified.', 'warn'); }} style={{ border: '1px solid var(--rose)', background: 'var(--rose-light)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'var(--rose)', cursor: 'pointer', fontWeight: 600 }}>Deny</button>
              <button onClick={() => { setExtensionModal(null); showToast('Extension approved. New deadline set to April 30, 2024.'); }} style={{ background: 'var(--emerald)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={13} /> Approve Extension
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
