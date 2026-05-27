import { useState } from 'react';
import { Upload, CheckCircle, X, FileText, Send, AlertCircle, AlertTriangle, Clock, Calendar } from 'lucide-react';
import type { AssignedOrdinance } from '../../data/deptHeadData';

interface DeptComplianceScreenProps {
  ordinances: AssignedOrdinance[];
  selectedOrd?: AssignedOrdinance | null;
  onClearSelected: () => void;
  onOrdinancesUpdate: (updated: AssignedOrdinance[]) => void;
}

type ReportStatus = 'compliant' | 'in-progress' | 'delayed';

const statusConfig: Record<ReportStatus, { label: string; desc: string; color: string; bg: string }> = {
  compliant:     { label: '✓ Fully Compliant',  desc: 'All requirements have been met.',          color: '#059669', bg: '#D1FAE5' },
  'in-progress': { label: '↻ In Progress',       desc: 'Partially implemented, work ongoing.',     color: '#3B7BF8', bg: '#EBF1FF' },
  delayed:       { label: '⚠ Delayed',           desc: 'Behind schedule — please explain.',        color: '#EF4444', bg: '#FEE2E2' },
};

const TODAY_ISO = '2024-05-27';

function isOverdue(ord: AssignedOrdinance) {
  if (ord.complianceStatus === 'compliant') return false;
  return ord.deadlineISO < TODAY_ISO;
}

function daysOverdue(ord: AssignedOrdinance) {
  const diff = new Date(TODAY_ISO).getTime() - new Date(ord.deadlineISO).getTime();
  return Math.floor(diff / 86400000);
}

const actionableOrdinances = (ords: AssignedOrdinance[]) =>
  ords.filter(o => o.complianceStatus !== 'compliant');

export default function DeptComplianceScreen({ ordinances, selectedOrd, onClearSelected, onOrdinancesUpdate }: DeptComplianceScreenProps) {
  const toReport = actionableOrdinances(ordinances);
  const overdueOrds = toReport.filter(isOverdue);
  const [activeOrd, setActiveOrd] = useState<AssignedOrdinance | null>(selectedOrd ?? toReport[0] ?? null);
  const [reportStatus, setReportStatus] = useState<ReportStatus>('in-progress');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progressVal, setProgressVal] = useState(activeOrd?.progress ?? 0);

  // Extension request state
  const [showExtModal, setShowExtModal] = useState(false);
  const [extDate, setExtDate] = useState('');
  const [extReason, setExtReason] = useState('');
  const [extSubmitted, setExtSubmitted] = useState(false);
  const [extErr, setExtErr] = useState('');

  function handleSelectOrd(ord: AssignedOrdinance) {
    setActiveOrd(ord);
    setReportStatus('in-progress');
    setNotes('');
    setFiles([]);
    setSubmitted(false);
    setProgressVal(ord.progress);
    onClearSelected();
  }

  async function handleSubmit() {
    if (!notes.trim()) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1600));
    // Update the ordinance in parent state
    const updated = ordinances.map(o =>
      o.id === activeOrd?.id
        ? { ...o, complianceStatus: reportStatus, progress: progressVal, lastReportDate: 'May 27, 2024', isNew: false }
        : o
    ) as AssignedOrdinance[];
    onOrdinancesUpdate(updated);
    setSubmitting(false);
    setSubmitted(true);
  }

  function handleSubmitExtension() {
    if (!extDate) { setExtErr('Please select a new deadline date.'); return; }
    if (!extReason.trim()) { setExtErr('Please provide a reason for the extension.'); return; }
    setExtErr('');
    setExtSubmitted(true);
    setShowExtModal(false);
  }

  function simulateFileUpload() {
    const names = ['Implementation_Report.pdf', 'Evidence_Photos.zip', 'Staff_Briefing_Minutes.docx', 'Inspection_Records.xlsx'];
    const pick = names[Math.floor(Math.random() * names.length)];
    if (!files.includes(pick)) setFiles(f => [...f, pick]);
  }

  const statusColor = (s: AssignedOrdinance['complianceStatus']) => ({
    pending:       { color: '#B45309', bg: '#FEF3C7' },
    'in-progress': { color: '#3B7BF8', bg: '#EBF1FF' },
    delayed:       { color: '#EF4444', bg: '#FEE2E2' },
    compliant:     { color: '#059669', bg: '#D1FAE5' },
    overdue:       { color: '#dc2626', bg: '#fee2e2' },
  }[s] ?? { color: '#64748B', bg: '#F1F5F9' });

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Overdue banner */}
      {overdueOrds.length > 0 && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b' }}>
              {overdueOrds.length} overdue compliance report{overdueOrds.length > 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 12, color: '#b91c1c', marginTop: 2 }}>
              {overdueOrds.map(o => o.number).join(', ')} — Please submit immediately or request an extension to avoid escalation.
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 20, height: 'calc(100vh - 160px)', overflow: 'hidden' }}>

        {/* LEFT — Ordinance selector */}
        <div style={{ width: 300, flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,31,61,0.07)' }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #E2E8F0', background: '#F6F8FC' }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: '#0F1F3D' }}>Pending Reports</div>
            <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2 }}>{toReport.length} ordinance{toReport.length !== 1 ? 's' : ''} need reporting</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {toReport.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8' }}>
                <CheckCircle size={32} color="#10B981" style={{ marginBottom: 10 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0F1F3D' }}>All reports submitted!</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>Your office is fully compliant.</div>
              </div>
            ) : toReport.map(ord => {
              const isActive = activeOrd?.id === ord.id;
              const overdue = isOverdue(ord);
              const sc = statusColor(overdue ? 'overdue' : ord.complianceStatus);
              return (
                <div key={ord.id} onClick={() => handleSelectOrd(ord)} style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', cursor: 'pointer', background: isActive ? 'rgba(16,185,129,0.05)' : 'transparent', borderLeft: isActive ? '3px solid #10B981' : overdue ? '3px solid #dc2626' : '3px solid transparent', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                    {ord.isNew && <span style={{ background: '#10B981', color: '#fff', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, letterSpacing: '0.04em' }}>NEW</span>}
                    {overdue && <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3 }}>OVERDUE</span>}
                    {ord.priority === 'urgent' && <span style={{ background: '#FEF3C7', color: '#B45309', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3 }}>URGENT</span>}
                    {ord.priority === 'immediate' && <span style={{ background: '#FEE2E2', color: '#dc2626', fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3 }}>IMMEDIATE</span>}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0F1F3D', lineHeight: 1.35, marginBottom: 5 }}>{ord.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#94A3B8' }}>{ord.number}</span>
                    <span style={{ background: sc.bg, color: sc.color, fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 10 }}>
                      {overdue ? 'Overdue' : ord.complianceStatus === 'in-progress' ? 'In Progress' : ord.complianceStatus.charAt(0).toUpperCase() + ord.complianceStatus.slice(1)}
                    </span>
                  </div>
                  <div style={{ marginTop: 8, height: 4, background: '#E2E8F0', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${ord.progress}%`, background: overdue ? '#dc2626' : ord.progress > 50 ? '#3B7BF8' : '#F59E0B', borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 10.5, color: overdue ? '#dc2626' : '#94A3B8', marginTop: 4, fontWeight: overdue ? 600 : 400 }}>
                    {overdue ? `⚠ Was due ${ord.deadline}` : `Due ${ord.deadline}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Report form */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,31,61,0.07)' }}>

          {!activeOrd ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', flexDirection: 'column', gap: 10 }}>
              <FileText size={40} color="#E2E8F0" />
              <div>Select an ordinance to submit a report</div>
            </div>
          ) : submitted ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 40 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={36} color="#10B981" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0F1F3D', fontFamily: 'Georgia, serif', marginBottom: 8 }}>Report Submitted!</div>
                <div style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.6, maxWidth: 360 }}>
                  Your implementation report for <strong>{activeOrd.number}</strong> has been submitted to the City Council Office. You will receive a notification when it has been reviewed.
                </div>
              </div>
              <button onClick={() => { setSubmitted(false); setNotes(''); setFiles([]); const next = toReport.find(o => o.id !== activeOrd.id); setActiveOrd(next ?? null); }} style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Submit Another Report
              </button>
            </div>
          ) : (
            <>
              {/* Form header */}
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', background: '#F6F8FC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Submitting report for</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#0F1F3D', marginBottom: 4, fontFamily: 'Georgia, serif' }}>{activeOrd.title}</div>
                    <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#64748B' }}>{activeOrd.number} · Deadline: {activeOrd.deadline}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    {isOverdue(activeOrd) && !activeOrd.extensionRequest && (
                      <button onClick={() => setShowExtModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '7px 12px', fontSize: 12, color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}>
                        <Calendar size={12} /> Request Extension
                      </button>
                    )}
                    {activeOrd.extensionRequest && (
                      <div style={{ background: activeOrd.extensionRequest.status === 'approved' ? '#D1FAE5' : activeOrd.extensionRequest.status === 'denied' ? '#FEE2E2' : '#FEF3C7', border: `1px solid ${activeOrd.extensionRequest.status === 'approved' ? '#6ee7b7' : activeOrd.extensionRequest.status === 'denied' ? '#fca5a5' : '#fde68a'}`, borderRadius: 8, padding: '6px 12px', fontSize: 11.5, fontWeight: 600, color: activeOrd.extensionRequest.status === 'approved' ? '#059669' : activeOrd.extensionRequest.status === 'denied' ? '#dc2626' : '#B45309' }}>
                        Extension: {activeOrd.extensionRequest.status.charAt(0).toUpperCase() + activeOrd.extensionRequest.status.slice(1)}
                      </div>
                    )}
                    <div style={{ fontSize: 11.5, color: '#64748B', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 12px' }}>
                      Progress: <strong style={{ color: '#0F1F3D' }}>{progressVal}%</strong>
                    </div>
                  </div>
                </div>
                {/* Overdue warning in form */}
                {isOverdue(activeOrd) && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <AlertTriangle size={14} color="#dc2626" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: '#991b1b', fontWeight: 500 }}>
                      This report is {daysOverdue(activeOrd)} day{daysOverdue(activeOrd) !== 1 ? 's' : ''} overdue. Submit immediately to avoid further escalation.
                    </div>
                  </div>
                )}
                {extSubmitted && (
                  <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF3C7', border: '1px solid #fde68a', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Clock size={14} color="#B45309" style={{ flexShrink: 0 }} />
                    <div style={{ fontSize: 12, color: '#92400e' }}>Extension request submitted. Awaiting approval from the City Council Office.</div>
                  </div>
                )}
              </div>

              {/* Form body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                {/* Status selection */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#0F1F3D', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>
                    Implementation Status<span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {(Object.entries(statusConfig) as [ReportStatus, typeof statusConfig[ReportStatus]][]).map(([key, val]) => (
                      <button key={key} onClick={() => setReportStatus(key)} style={{ flex: 1, padding: '12px 14px', borderRadius: 10, cursor: 'pointer', border: `2px solid ${reportStatus === key ? val.color : '#E2E8F0'}`, background: reportStatus === key ? val.bg : '#fff', transition: 'all 0.15s', textAlign: 'left' }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: reportStatus === key ? val.color : '#0F1F3D', marginBottom: 3 }}>{val.label}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{val.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Progress slider */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#0F1F3D', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>Completion Percentage</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <input type="range" min={0} max={100} step={5} value={progressVal} onChange={e => setProgressVal(Number(e.target.value))} style={{ flex: 1, accentColor: '#10B981' }} />
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#0F1F3D', minWidth: 40, textAlign: 'right' }}>{progressVal}%</span>
                  </div>
                  <div style={{ height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden', marginTop: 8 }}>
                    <div style={{ height: '100%', width: `${progressVal}%`, background: '#10B981', borderRadius: 4, transition: 'width 0.2s' }} />
                  </div>
                </div>

                {/* Notes */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#0F1F3D', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>
                    Report Notes<span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={`Describe what your office has done to implement ${activeOrd.number}. Include actions taken, staff involved, challenges encountered, and next steps…`} rows={6} style={{ width: '100%', border: `1px solid ${notes.trim() ? '#10B981' : '#E2E8F0'}`, background: '#fff', borderRadius: 10, padding: '12px 14px', fontSize: 13.5, color: '#0F1F3D', outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.7, transition: 'border-color 0.2s', boxSizing: 'border-box' }} />
                  {!notes.trim() && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#94A3B8', marginTop: 5 }}><AlertCircle size={11} /> Required before submitting</div>}
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, textAlign: 'right' }}>{notes.trim().split(/\s+/).filter(Boolean).length} words</div>
                </div>

                {/* File upload */}
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#0F1F3D', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 10 }}>
                    Supporting Evidence <span style={{ fontSize: 11, color: '#94A3B8', textTransform: 'none', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <div onClick={simulateFileUpload} style={{ border: '2px dashed #E2E8F0', borderRadius: 10, padding: '24px', textAlign: 'center', cursor: 'pointer', background: '#F6F8FC', transition: 'all 0.15s' }} onMouseEnter={e => { (e.currentTarget.style.borderColor = '#10B981'); (e.currentTarget.style.background = 'rgba(16,185,129,0.04)'); }} onMouseLeave={e => { (e.currentTarget.style.borderColor = '#E2E8F0'); (e.currentTarget.style.background = '#F6F8FC'); }}>
                    <Upload size={22} color="#94A3B8" style={{ marginBottom: 8 }} />
                    <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>Click to upload evidence documents or photos</div>
                    <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 4 }}>PDF, DOCX, JPG, PNG, ZIP · Max 10MB each</div>
                  </div>
                  {files.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {files.map(f => (
                        <div key={f} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={14} color="#3B7BF8" /><span style={{ fontSize: 12.5, color: '#0F1F3D' }}>{f}</span></div>
                          <button onClick={() => setFiles(fs => fs.filter(x => x !== f))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 2 }}><X size={13} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ flex: 1, fontSize: 11.5, color: '#94A3B8', lineHeight: 1.5 }}>This report will be sent to the City Council Office and timestamped automatically.</div>
                <button onClick={handleSubmit} disabled={!notes.trim() || submitting} style={{ display: 'flex', alignItems: 'center', gap: 8, background: !notes.trim() || submitting ? '#E2E8F0' : '#10B981', color: !notes.trim() || submitting ? '#94A3B8' : '#fff', border: 'none', borderRadius: 8, padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: !notes.trim() || submitting ? 'default' : 'pointer', transition: 'all 0.2s' }}>
                  <Send size={14} />{submitting ? 'Submitting…' : 'Submit Report'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Extension Request Modal */}
      {showExtModal && (
        <>
          <div onClick={() => setShowExtModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.4)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 460, background: '#fff', borderRadius: 14, boxShadow: '0 8px 40px rgba(15,31,61,0.2)', zIndex: 201, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F1F3D' }}>Request Deadline Extension</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{activeOrd?.number} · {activeOrd?.title}</div>
              </div>
              <button onClick={() => setShowExtModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={16} /></button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '10px 14px', background: '#FEF3C7', border: '1px solid #fde68a', borderRadius: 8, fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                Your request will be reviewed by the City Council Office. You will be notified of the decision. Continue submitting progress reports while awaiting approval.
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#0F1F3D', display: 'block', marginBottom: 6 }}>Proposed New Deadline<span style={{ color: '#EF4444' }}>*</span></label>
                <input type="date" value={extDate} onChange={e => { setExtDate(e.target.value); setExtErr(''); }} style={{ width: '100%', border: `1px solid ${extErr && !extDate ? '#EF4444' : '#E2E8F0'}`, background: '#fff', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#0F1F3D', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#0F1F3D', display: 'block', marginBottom: 6 }}>Reason for Extension<span style={{ color: '#EF4444' }}>*</span></label>
                <textarea value={extReason} onChange={e => { setExtReason(e.target.value); setExtErr(''); }} placeholder="Explain why additional time is needed and what steps are being taken…" rows={4} style={{ width: '100%', border: `1px solid ${extErr && !extReason.trim() ? '#EF4444' : '#E2E8F0'}`, background: '#fff', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: '#0F1F3D', outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }} />
              </div>
              {extErr && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#EF4444' }}><AlertCircle size={12} />{extErr}</div>}
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowExtModal(false)} style={{ border: '1px solid #E2E8F0', background: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#64748B', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSubmitExtension} style={{ background: '#3B7BF8', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Send size={13} /> Submit Request
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
