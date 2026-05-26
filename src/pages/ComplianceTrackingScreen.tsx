import { useState } from 'react';
import { ShieldCheck, Upload, ChevronDown, ChevronUp, CheckCircle, Clock, AlertTriangle, Circle } from 'lucide-react';
import { departments, ordinances } from '../data/mockData';
import type { ComplianceStatus } from '../data/mockData';
import { ComplianceBadge, Card, StatCard } from '../components/UI';

interface ComplianceTrackingScreenProps {
  onNavigate: (s: any) => void;
}

const complianceDetails: Record<string, { status: ComplianceStatus; note: string; lastReport: string; evidence: string[] }> = {
  '1-3': { status: 'compliant',    note: 'All traffic enforcers briefed. Implementation report submitted.',  lastReport: 'Mar 10, 2024', evidence: ['TMO_Report_SP2024033.pdf'] },
  '2-1': { status: 'in-progress',  note: 'Barangay coordination ongoing. 4 of 6 meetings done.',             lastReport: 'Apr 18, 2024', evidence: [] },
  '2-2': { status: 'in-progress',  note: 'Monitoring of plastic use in 15 markets started.',                 lastReport: 'Apr 10, 2024', evidence: ['MarketInspection_Apr.pdf'] },
  '3-4': { status: 'compliant',    note: 'All food handlers certified. Spot checks completed.',              lastReport: 'Feb 25, 2024', evidence: ['HealthCert_Report.pdf', 'FoodSafety_Audit.pdf'] },
  '4-6': { status: 'delayed',      note: 'Online portal not yet integrated. IT contractor delays.',          lastReport: 'Jan 30, 2024', evidence: [] },
  '5-7': { status: 'in-progress',  note: '5 of 7 barangays have updated ERPs.',                              lastReport: 'Apr 5, 2024',  evidence: ['BarangayERP_Update.pdf'] },
  '6-3': { status: 'pending',      note: 'Not yet started. Waiting for budget allocation.',                  lastReport: '—',            evidence: [] },
  '7-7': { status: 'compliant',    note: 'Quarterly drills conducted in all areas.',                         lastReport: 'Mar 28, 2024', evidence: ['DrillReport_Q1.pdf', 'Equipment_Checklist.pdf'] },
  '8-8': { status: 'in-progress',  note: 'Tree inventory 60% complete.',                                     lastReport: 'Apr 2, 2024',  evidence: [] },
};

const complianceIcon: Record<ComplianceStatus, React.ReactNode> = {
  compliant:     <CheckCircle size={15} color="var(--emerald)" />,
  'in-progress': <Clock size={15} color="var(--blue)" />,
  delayed:       <AlertTriangle size={15} color="var(--rose)" />,
  pending:       <Circle size={15} color="var(--amber)" />,
};

export default function ComplianceTrackingScreen({ onNavigate: _onNavigate }: ComplianceTrackingScreenProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<ComplianceStatus | 'all'>('all');
  const [reportModal, setReportModal] = useState<{ dept: string; ord: string } | null>(null);

  const counts = {
    compliant:  departments.filter(d => d.compliance === 'compliant').length,
    inProgress: departments.filter(d => d.compliance === 'in-progress').length,
    delayed:    departments.filter(d => d.compliance === 'delayed').length,
    pending:    departments.filter(d => d.compliance === 'pending').length,
  };

  const overallRate = Math.round(
    (departments.reduce((a, d) => a + d.completedCount, 0) /
      departments.reduce((a, d) => a + d.assignedCount, 0)) * 100
  );

  const filtered = departments.filter(d => filter === 'all' || d.compliance === filter);

  const filterOptions: { value: ComplianceStatus | 'all'; label: string }[] = [
    { value: 'all',         label: 'All'         },
    { value: 'compliant',   label: 'Compliant'   },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'delayed',     label: 'Delayed'     },
    { value: 'pending',     label: 'Pending'     },
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', gap: 14 }}>
        <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', borderRadius: 12, padding: '20px 24px', color: '#fff', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 12, opacity: 0.7, fontWeight: 500 }}>Overall Compliance Rate</div>
          <div style={{ fontSize: 38, fontWeight: 700, lineHeight: 1, margin: '8px 0' }}>{overallRate}%</div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${overallRate}%`, background: 'var(--emerald)', borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>Across {departments.length} departments</div>
        </div>
        <StatCard label="Compliant"   value={counts.compliant}  sub="Fully done"       accent="var(--emerald)" icon={<ShieldCheck size={16} />} />
        <StatCard label="In Progress" value={counts.inProgress} sub="Ongoing"          accent="var(--blue)"    icon={<Clock size={16} />} />
        <StatCard label="Delayed"     value={counts.delayed}    sub="Behind schedule"  accent="var(--rose)"    icon={<AlertTriangle size={16} />} />
        <StatCard label="Pending"     value={counts.pending}    sub="Not started"      accent="var(--amber)"   icon={<Circle size={16} />} />
      </div>

      {/* Filters */}
      <Card style={{ padding: '12px 18px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 600, marginRight: 4 }}>Filter by status:</span>
        {filterOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            style={{
              border: '1px solid var(--border)', borderRadius: 20, padding: '5px 14px',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              background: filter === opt.value ? 'var(--navy)' : 'var(--white)',
              color: filter === opt.value ? '#fff' : 'var(--slate)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </Card>

      {/* Department compliance cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(dept => {
          const progress = dept.assignedCount > 0 ? (dept.completedCount / dept.assignedCount) * 100 : 0;
          const isOpen = expanded === dept.id;
          const deptOrds = ordinances.filter(o =>
            o.offices.some(of => of.toLowerCase().includes(dept.name.split(' ')[0].toLowerCase()))
          );

          return (
            <Card key={dept.id} style={{ overflow: 'hidden' }}>
              {/* Header row */}
              <div
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                onClick={() => setExpanded(e => e === dept.id ? null : dept.id)}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  background: dept.compliance === 'compliant' ? 'var(--emerald-light)' : dept.compliance === 'delayed' ? 'var(--rose-light)' : dept.compliance === 'pending' ? 'var(--amber-light)' : 'var(--sky)',
                }}>
                  {complianceIcon[dept.compliance]}
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
                    <div style={{
                      height: '100%', width: `${progress}%`, borderRadius: 4, transition: 'width 0.6s',
                      background: progress === 100 ? 'var(--emerald)' : progress > 50 ? 'var(--blue)' : progress > 0 ? 'var(--amber)' : 'var(--rose)',
                    }} />
                  </div>
                </div>
                <ComplianceBadge status={dept.compliance} />
                <div style={{ fontSize: 11, color: 'var(--slate-light)', whiteSpace: 'nowrap' }}>Updated {dept.lastUpdate}</div>
                {isOpen ? <ChevronUp size={16} color="var(--slate)" /> : <ChevronDown size={16} color="var(--slate)" />}
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', background: 'rgba(235,241,255,0.2)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                    Ordinance-by-Ordinance Status
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {deptOrds.length === 0 ? (
                      <div style={{ color: 'var(--slate)', fontSize: 13 }}>No ordinances assigned.</div>
                    ) : deptOrds.map(ord => {
                      const key = `${dept.id}-${ord.id}`;
                      const detail = complianceDetails[key] || {
                        status: 'pending' as ComplianceStatus,
                        note: 'No report submitted yet.',
                        lastReport: '—',
                        evidence: [],
                      };
                      return (
                        <div key={ord.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                          <div style={{ marginTop: 2 }}>{complianceIcon[detail.status]}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ord.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--slate)', fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{ord.number}</div>
                            <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 6, lineHeight: 1.5 }}>{detail.note}</div>
                            {detail.evidence.length > 0 && (
                              <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                                {detail.evidence.map(ev => (
                                  <span key={ev} style={{ fontSize: 11, background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', color: 'var(--blue)', fontWeight: 500 }}>
                                    {ev}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
                            <ComplianceBadge status={detail.status} />
                            <div style={{ fontSize: 11, color: 'var(--slate-light)' }}>Report: {detail.lastReport}</div>
                            <button
                              onClick={() => setReportModal({ dept: dept.name, ord: ord.number })}
                              style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', fontSize: 11.5, color: 'var(--navy)', cursor: 'pointer', fontWeight: 500 }}
                            >
                              <Upload size={11} /> Submit Report
                            </button>
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
              <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>{reportModal.ord} &middot; {reportModal.dept}</div>
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
                <textarea
                  rows={4}
                  placeholder="Describe current implementation status, actions taken, and next steps..."
                  style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--navy)', outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>
              <div style={{ border: '2px dashed var(--border)', borderRadius: 8, padding: '20px', textAlign: 'center', cursor: 'pointer', background: 'var(--sky)' }}>
                <Upload size={20} color="var(--slate)" style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 13, color: 'var(--slate)' }}>Upload evidence documents or photos</div>
                <div style={{ fontSize: 11, color: 'var(--slate-light)', marginTop: 4 }}>PDF, DOCX, JPG, PNG up to 10MB</div>
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setReportModal(null)} style={{ border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'var(--slate)', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => setReportModal(null)} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Upload size={13} /> Submit Report
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
