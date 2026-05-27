import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Upload, Eye, CheckCircle, Clock, AlertTriangle, Circle } from 'lucide-react';
import type { AssignedOrdinance } from '../../data/deptHeadData';

interface DeptOrdinancesScreenProps {
  ordinances: AssignedOrdinance[];
  onNavigate: (s: any) => void;
  onSubmitReport: (ord: AssignedOrdinance) => void;
  onViewOrdinance: (ord: AssignedOrdinance) => void;
}

const statusConfig = {
  compliant:     { bg: '#D1FAE5', color: '#059669', icon: <CheckCircle size={14} />, label: 'Compliant'   },
  'in-progress': { bg: '#EBF1FF', color: '#3B7BF8', icon: <Clock size={14} />,       label: 'In Progress' },
  delayed:       { bg: '#FEE2E2', color: '#EF4444', icon: <AlertTriangle size={14} />, label: 'Delayed'   },
  pending:       { bg: '#FEF3C7', color: '#B45309', icon: <Circle size={14} />,       label: 'Pending'    },
};

const catColors: Record<string, string> = {
  Traffic: '#EFF6FF', Environment: '#F0FDF4', Health: '#FFF1F2',
  Business: '#FFFBEB', Safety: '#F5F3FF', Sanitation: '#E0F7FA',
  Zoning: '#FFF3E0', Education: '#E8F5E9',
};

export default function DeptOrdinancesScreen({ ordinances, onNavigate, onSubmitReport, onViewOrdinance }: DeptOrdinancesScreenProps) {
  const [expanded, setExpanded] = useState<string | null>(ordinances.find(o => o.isNew)?.id ?? null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'compliant'>('all');

  const filtered = ordinances.filter(o => filter === 'all' || o.complianceStatus === filter);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Filter bar */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 18px', display: 'flex', gap: 8, alignItems: 'center', boxShadow: '0 1px 4px rgba(15,31,61,0.07)' }}>
        <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>Show:</span>
        {[
          { value: 'all', label: `All (${ordinances.length})` },
          { value: 'pending', label: 'Action Needed' },
          { value: 'in-progress', label: 'In Progress' },
          { value: 'compliant', label: 'Compliant' },
        ].map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value as any)}
            style={{
              border: '1px solid #E2E8F0', borderRadius: 20, padding: '5px 14px',
              fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              background: filter === opt.value ? '#0F2027' : '#fff',
              color: filter === opt.value ? '#fff' : '#64748B',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Ordinance cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(ord => {
          const sc = statusConfig[ord.complianceStatus];
          const isOpen = expanded === ord.id;

          return (
            <div key={ord.id} style={{
              background: '#fff', border: `1px solid ${ord.isNew ? 'rgba(16,185,129,0.3)' : '#E2E8F0'}`,
              borderRadius: 12, overflow: 'hidden', boxShadow: ord.isNew ? '0 2px 12px rgba(16,185,129,0.08)' : '0 1px 4px rgba(15,31,61,0.07)',
              transition: 'box-shadow 0.2s',
            }}>
              {/* NEW banner */}
              {ord.isNew && (
                <div style={{ background: 'linear-gradient(90deg, #10B981, #059669)', padding: '7px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>🔔 NEW ORDINANCE ASSIGNED — Action Required</span>
                </div>
              )}

              {/* Header row */}
              <div
                style={{ padding: '18px 20px', display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer' }}
                onClick={() => setExpanded(e => e === ord.id ? null : ord.id)}
              >
                <div style={{ width: 42, height: 42, borderRadius: 10, background: catColors[ord.category] || '#EBF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={18} color="#3B7BF8" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#0F1F3D', marginBottom: 6, lineHeight: 1.3 }}>{ord.title}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 11.5, fontFamily: 'monospace', color: '#64748B', fontWeight: 600 }}>{ord.number}</span>
                    <span style={{ background: catColors[ord.category] || '#EBF1FF', color: '#0F1F3D', fontSize: 11, padding: '2px 7px', borderRadius: 4, border: '1px solid #E2E8F0' }}>{ord.category}</span>
                    <span style={{ background: sc.bg, color: sc.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 3 }}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${ord.progress}%`, background: ord.progress === 100 ? '#10B981' : ord.progress > 50 ? '#3B7BF8' : '#F59E0B', borderRadius: 3, transition: 'width 0.6s' }} />
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#0F1F3D', whiteSpace: 'nowrap' }}>{ord.progress}%</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 10.5, color: '#94A3B8', marginBottom: 2 }}>Deadline</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0F1F3D' }}>{ord.deadline}</div>
                  <div style={{ fontSize: 10.5, color: '#94A3B8', marginTop: 6 }}>Assigned {ord.dateAssigned}</div>
                </div>
                <div style={{ marginTop: 2 }}>
                  {isOpen ? <ChevronUp size={16} color="#94A3B8" /> : <ChevronDown size={16} color="#94A3B8" />}
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ borderTop: '1px solid #E2E8F0', background: '#F6F8FC' }}>
                  {/* Summary */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748B', marginBottom: 8 }}>Ordinance Summary</div>
                    <p style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.7, margin: 0 }}>{ord.summary}</p>
                    <div style={{ marginTop: 12, display: 'flex', gap: 20, fontSize: 12 }}>
                      <span><span style={{ color: '#94A3B8' }}>Published by:</span> <span style={{ fontWeight: 600, color: '#0F1F3D' }}>{ord.publishedBy}</span></span>
                      <span><span style={{ color: '#94A3B8' }}>Last report:</span> <span style={{ fontWeight: 600, color: '#0F1F3D' }}>{ord.lastReportDate}</span></span>
                    </div>
                  </div>

                  {/* Reports history */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748B', marginBottom: 10 }}>
                      Submission History ({ord.reports.length})
                    </div>
                    {ord.reports.length === 0 ? (
                      <div style={{ fontSize: 13, color: '#94A3B8', fontStyle: 'italic' }}>No reports submitted yet.</div>
                    ) : ord.reports.map(r => (
                      <div key={r.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 14px', marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#0F1F3D' }}>{r.date} — by {r.submittedBy}</div>
                          <span style={{ background: statusConfig[r.status].bg, color: statusConfig[r.status].color, fontSize: 10.5, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
                            {statusConfig[r.status].label}
                          </span>
                        </div>
                        <p style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.6, margin: '0 0 8px' }}>{r.notes}</p>
                        {r.evidence.length > 0 && (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {r.evidence.map(e => (
                              <span key={e} style={{ fontSize: 11, background: '#EBF1FF', color: '#3B7BF8', border: '1px solid #dbeafe', borderRadius: 4, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                                <Eye size={10} /> {e}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div style={{ padding: '14px 20px', display: 'flex', gap: 10 }}>
                    {ord.complianceStatus !== 'compliant' && (
                      <button
                        onClick={() => onSubmitReport(ord)}
                        style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#10B981', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                      >
                        <Upload size={14} /> Submit Progress Report
                      </button>
                    )}
                    {ord.complianceStatus === 'compliant' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#D1FAE5', color: '#059669', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>
                        <CheckCircle size={14} /> Fully Compliant — No action needed
                      </div>
                    )}
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EBF1FF', color: '#3B7BF8', border: '1px solid #dbeafe', borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                      onClick={() => onViewOrdinance(ord)}
                    >
                      <Eye size={14} /> View Full Ordinance
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}