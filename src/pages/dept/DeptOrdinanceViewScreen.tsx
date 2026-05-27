import { useState } from 'react';
import {
  ArrowLeft, ChevronRight, FileText, Download, Printer,
  Building2, Clock, CheckCircle, AlertTriangle, Circle,
  BookOpen, Eye, Upload, AlertCircle,
} from 'lucide-react';
import type { AssignedOrdinance } from '../../data/deptHeadData';
import OrdinanceChatbot from '../../components/OrdinanceChatbot';
import type { ChatOrdinanceContext } from '../../components/OrdinanceChatbot';

interface DeptOrdinanceViewScreenProps {
  ordinance: AssignedOrdinance;
  onNavigate: (s: any) => void;
  onSubmitReport: (ord: AssignedOrdinance) => void;
}

type Tab = 'fulltext' | 'details' | 'compliance';

// ─── Shared tokens (matching DeptOrdinancesScreen inline style) ───────────────
const C = {
  navy:    '#0F1F3D',
  navyMid: '#1A3260',
  blue:    '#3B7BF8',
  slate:   '#64748B',
  border:  '#E2E8F0',
  sky:     '#F6F8FC',
  white:   '#fff',
  emerald: '#10B981',
  amber:   '#F59E0B',
  rose:    '#EF4444',
};

const catColors: Record<string, string> = {
  Traffic: '#EFF6FF', Environment: '#F0FDF4', Health: '#FFF1F2',
  Business: '#FFFBEB', Safety: '#F5F3FF', Sanitation: '#E0F7FA',
  Zoning: '#FFF3E0', Education: '#E8F5E9',
};

const statusConfig = {
  compliant:     { bg: '#D1FAE5', color: '#059669', icon: <CheckCircle size={13} />,   label: 'Compliant'   },
  'in-progress': { bg: '#EBF1FF', color: '#3B7BF8', icon: <Clock size={13} />,         label: 'In Progress' },
  delayed:       { bg: '#FEE2E2', color: '#EF4444', icon: <AlertTriangle size={13} />, label: 'Delayed'     },
  pending:       { bg: '#FEF3C7', color: '#B45309', icon: <Circle size={13} />,        label: 'Pending'     },
};

// ─── Full-text builder (mirrors OrdinanceViewScreen logic) ────────────────────
function buildSections(ord: AssignedOrdinance) {
  return {
    preamble: [
      `WHEREAS, the City of Cebu recognizes that "${ord.title}" addresses a critical need within its jurisdiction;`,
      `WHEREAS, existing policies require updating to reflect current standards and enforcement capabilities;`,
      `WHEREAS, the affected offices and barangays have been duly consulted and have expressed support for this measure;`,
    ],
    articles: [
      {
        label: 'Article I – General Provisions',
        sections: [
          { num: 'Section 1. Title.',               text: `This ordinance shall be known as the "${ord.title}."` },
          { num: 'Section 2. Scope and Coverage.',  text: `This ordinance shall apply to all residents, establishments, institutions, and individuals within the territorial jurisdiction of Cebu City, and all 80 barangays thereunder.` },
          { num: 'Section 3. Declaration of Policy.', text: `It is hereby declared the policy of Cebu City to promote and uphold the objectives covered by this ordinance, in accordance with local and national law.` },
        ],
      },
      {
        label: `Article II – ${ord.category} Standards and Requirements`,
        sections: [
          { num: 'Section 4. Mandatory Compliance.',               text: `All concerned parties shall comply with the provisions of this ordinance within thirty (30) days from its effectivity. Implementing offices shall issue supplemental guidelines as needed.` },
          { num: 'Section 5. Responsibilities of Implementing Offices.', text: `The assigned implementing office shall be responsible for the enforcement and monitoring of this ordinance within its respective mandate.` },
        ],
      },
      {
        label: 'Article III – Prohibited Acts and Penalties',
        sections: [
          { num: 'Section 6. Prohibited Acts.',  text: `The following acts are hereby prohibited: (a) Non-compliance with prescribed standards; (b) Obstruction of enforcement operations; (c) Submission of false reports or certifications; (d) Any act in violation of the spirit and intent of this ordinance.` },
          { num: 'Section 7. Penalties.',        text: `First offense: Fine of ₱500 or community service of 8 hours.\nSecond offense: Fine of ₱1,000 or community service of 16 hours.\nThird and subsequent offenses: Fine of ₱2,000 and mandatory attendance in an awareness seminar.` },
        ],
      },
      {
        label: 'Article IV – Implementing Authority and Effectivity',
        sections: [
          { num: 'Section 8. Implementing Authority.', text: `The designated implementing office shall enforce this ordinance. Barangay captains are hereby deputized to issue citations within their respective jurisdictions.` },
          { num: 'Section 9. Separability Clause.',    text: `If any provision of this ordinance is declared invalid, the remaining provisions shall continue in full force and effect.` },
          { num: 'Section 10. Effectivity.',           text: `This ordinance shall take effect fifteen (15) days after its publication in a newspaper of general circulation in Cebu City.` },
        ],
      },
    ],
  };
}

// ─── Reusable sub-components ──────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: C.slate,
      marginBottom: 12, paddingBottom: 8,
      borderBottom: `1px solid ${C.border}`,
    }}>
      {children}
    </div>
  );
}

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.white, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: '18px 22px',
      boxShadow: '0 1px 4px rgba(15,31,61,0.07)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function DeptOrdinanceViewScreen({
  ordinance: ord,
  onNavigate,
  onSubmitReport,
}: DeptOrdinanceViewScreenProps) {
  const [tab, setTab] = useState<Tab>('fulltext');
  const sections = buildSections(ord);
  const sc = statusConfig[ord.complianceStatus];

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'fulltext',   label: 'Full Text',          icon: <FileText size={13} /> },
    { id: 'details',    label: 'Details & Files',     icon: <Download size={13} /> },
    { id: 'compliance', label: 'Compliance & Reports', icon: <CheckCircle size={13} /> },
  ];

  // Map AssignedOrdinance → ChatOrdinanceContext
  const chatContext: ChatOrdinanceContext = {
    number: ord.number,
    title: ord.title,
    category: ord.category,
    summary: ord.summary,
    offices: [],                        // AssignedOrdinance doesn't carry office list
    deadline: ord.deadline,
    publishedBy: ord.publishedBy,
    complianceStatus: ord.complianceStatus,
    progress: ord.progress,
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900, margin: '0 auto' }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.slate }}>
        <button
          onClick={() => onNavigate('dh-ordinances')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: C.slate, fontSize: 13, padding: 0, fontWeight: 500,
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = C.navy)}
          onMouseLeave={e => (e.currentTarget.style.color = C.slate)}
        >
          <ArrowLeft size={14} /> My Ordinances
        </button>
        <ChevronRight size={13} style={{ opacity: 0.35 }} />
        <span style={{ color: C.navy, fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>
          {ord.number}
        </span>
      </div>

      {/* ── Header card ── */}
      <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,31,61,0.07)' }}>

        {/* NEW banner */}
        {ord.isNew && (
          <div style={{ background: 'linear-gradient(90deg, #10B981, #059669)', padding: '8px 22px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>
              🔔 NEW ORDINANCE ASSIGNED — Action Required
            </span>
          </div>
        )}

        {/* Dark header band */}
        <div style={{
          background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
          color: '#fff',
          padding: '22px 26px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 11, opacity: 0.5, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                Ordinance No. {ord.number}
              </div>
              <h1 style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.4, margin: '0 0 14px' }}>
                {ord.title}
              </h1>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Compliance status badge */}
                <span style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: sc.bg, color: sc.color,
                  fontSize: 11, fontWeight: 700, padding: '3px 9px',
                  borderRadius: 20,
                }}>
                  {sc.icon} {sc.label}
                </span>
                <span style={{
                  background: 'rgba(255,255,255,0.13)', color: '#fff',
                  fontSize: 11, fontWeight: 500, padding: '3px 9px',
                  borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  {ord.category}
                </span>
                <span style={{ opacity: 0.4, fontSize: 11 }}>·</span>
                <span style={{ opacity: 0.55, fontSize: 12 }}>
                  Deadline: {ord.deadline}
                </span>
              </div>
            </div>

            {/* Progress ring area + actions */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, flexShrink: 0 }}>
              {/* Progress pill */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px' }}>
                <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${ord.progress}%`,
                    background: ord.progress === 100 ? C.emerald : ord.progress > 50 ? C.blue : C.amber,
                    borderRadius: 3,
                    transition: 'width 0.6s',
                  }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{ord.progress}%</span>
              </div>
              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { icon: <Printer size={13} />, label: 'Print' },
                  { icon: <Download size={13} />, label: 'Export' },
                ].map(btn => (
                  <button key={btn.label} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff', borderRadius: 8, padding: '7px 13px',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                  >
                    {btn.icon} {btn.label}
                  </button>
                ))}
                {ord.complianceStatus !== 'compliant' && (
                  <button
                    onClick={() => onSubmitReport(ord)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: C.emerald, border: 'none',
                      color: '#fff', borderRadius: 8, padding: '7px 14px',
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <Upload size={13} /> Submit Report
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 0,
          borderBottom: `1px solid ${C.border}`,
          background: C.sky,
          padding: '0 20px',
        }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '12px 16px',
                border: 'none', background: 'transparent',
                color: tab === t.id ? C.navy : C.slate,
                fontSize: 12.5, fontWeight: tab === t.id ? 700 : 500,
                cursor: 'pointer',
                borderBottom: tab === t.id ? `2px solid ${C.navy}` : '2px solid transparent',
                marginBottom: -1,
                transition: 'all 0.15s',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TAB: FULL TEXT
      ══════════════════════════════════════════════ */}
      {tab === 'fulltext' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Preamble */}
          <Panel>
            <SectionLabel>Preamble</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sections.preamble.map((w, i) => (
                <div key={i} style={{
                  borderLeft: `3px solid ${C.blue}`,
                  background: C.sky,
                  borderRadius: '0 6px 6px 0',
                  padding: '10px 14px',
                  fontSize: 13.5,
                  color: C.navy,
                  lineHeight: 1.7,
                }}>
                  <strong>WHEREAS</strong>, {w}
                </div>
              ))}
              <p style={{ fontSize: 13.5, color: C.navy, lineHeight: 1.7, margin: '6px 0 0' }}>
                <strong>NOW, THEREFORE,</strong> be it ordained by the Sangguniang Panlungsod of the City of Cebu, in session assembled, that:
              </p>
            </div>
          </Panel>

          {/* Articles */}
          {sections.articles.map((article, ai) => (
            <Panel key={ai}>
              <SectionLabel>{article.label}</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {article.sections.map((sec, si) => (
                  <div key={si} style={{
                    background: C.sky, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: '12px 16px',
                  }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: C.slate, marginBottom: 6, fontWeight: 600 }}>
                      {sec.num}
                    </div>
                    <div style={{ fontSize: 13.5, color: C.navy, lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                      {sec.text}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ))}

          {/* Signatories */}
          <Panel>
            <SectionLabel>Signatories</SectionLabel>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { name: 'Hon. Michael L. Rama', title: 'City Mayor, City of Cebu' },
                { name: 'Hon. Donaldo B. Hontiveros', title: 'City Vice Mayor / Presiding Officer' },
                { name: ord.publishedBy, title: 'Records Encoder' },
              ].map((sig, i) => (
                <div key={i} style={{
                  flex: '1 1 160px',
                  borderTop: `2px solid ${C.border}`,
                  paddingTop: 14, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{sig.name}</div>
                  <div style={{ fontSize: 11.5, color: C.slate, marginTop: 4 }}>{sig.title}</div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: DETAILS & FILES
      ══════════════════════════════════════════════ */}
      {tab === 'details' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Metadata grid */}
          <Panel>
            <SectionLabel>Ordinance Metadata</SectionLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'Ordinance Number', value: ord.number,   mono: true  },
                { label: 'Category',          value: ord.category, mono: false },
                { label: 'Published By',      value: ord.publishedBy, mono: false },
                { label: 'Date Assigned',     value: ord.dateAssigned, mono: false },
                { label: 'Compliance Deadline', value: ord.deadline, mono: false },
                { label: 'Last Report Date',  value: ord.lastReportDate, mono: false },
              ].map(f => (
                <div key={f.label} style={{
                  background: C.sky, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: '12px 14px',
                }}>
                  <div style={{ fontSize: 11, color: C.slate, marginBottom: 5 }}>{f.label}</div>
                  <div style={{
                    fontSize: f.mono ? 12 : 13,
                    fontFamily: f.mono ? 'monospace' : 'inherit',
                    fontWeight: 600, color: C.navy,
                  }}>
                    {f.value}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Summary */}
          <Panel>
            <SectionLabel>Plain-Language Summary</SectionLabel>
            <p style={{ fontSize: 13.5, color: C.navy, lineHeight: 1.8, margin: 0 }}>{ord.summary}</p>
          </Panel>

          {/* Attached files */}
          <Panel>
            <SectionLabel>Attached Documents</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: `${ord.number}_Full_Document.pdf`,             size: '2.3 MB', color: '#dc2626' },
                { name: `${ord.number}_Implementation_Guidelines.docx`, size: '845 KB', color: '#2563eb' },
              ].map(file => (
                <div key={file.name} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: C.sky, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: '11px 14px',
                }}>
                  <FileText size={20} color={file.color} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: C.slate, marginTop: 2 }}>
                      Assigned {ord.dateAssigned} · {file.size}
                    </div>
                  </div>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    border: `1px solid ${C.border}`, background: C.white,
                    borderRadius: 7, padding: '6px 12px', fontSize: 12,
                    color: C.slate, cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap',
                  }}>
                    <Download size={12} /> Download
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          TAB: COMPLIANCE & REPORTS
      ══════════════════════════════════════════════ */}
      {tab === 'compliance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Status summary bar */}
          <Panel>
            <SectionLabel>Compliance Status</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              {/* Big status pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: sc.bg, color: sc.color,
                borderRadius: 10, padding: '12px 18px',
                fontSize: 14, fontWeight: 700,
              }}>
                {sc.icon} {sc.label}
              </div>
              {/* Progress */}
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: C.slate }}>
                  <span>Implementation progress</span>
                  <span style={{ fontWeight: 700, color: C.navy }}>{ord.progress}%</span>
                </div>
                <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${ord.progress}%`,
                    background: ord.progress === 100 ? C.emerald : ord.progress > 50 ? C.blue : C.amber,
                    borderRadius: 4, transition: 'width 0.6s',
                  }} />
                </div>
              </div>
              {/* Deadline */}
              <div style={{ background: C.sky, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 10.5, color: C.slate, marginBottom: 3 }}>Deadline</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{ord.deadline}</div>
              </div>
            </div>

            {/* Compliant banner */}
            {ord.complianceStatus === 'compliant' && (
              <div style={{
                marginTop: 14, display: 'flex', alignItems: 'center', gap: 8,
                background: '#D1FAE5', color: '#059669',
                borderRadius: 8, padding: '11px 16px', fontSize: 13, fontWeight: 600,
              }}>
                <CheckCircle size={15} /> Fully compliant — no further action required.
              </div>
            )}

            {/* Submit CTA */}
            {ord.complianceStatus !== 'compliant' && (
              <button
                onClick={() => onSubmitReport(ord)}
                style={{
                  marginTop: 14, display: 'flex', alignItems: 'center', gap: 8,
                  background: C.emerald, color: '#fff', border: 'none',
                  borderRadius: 8, padding: '11px 20px', fontSize: 13,
                  fontWeight: 700, cursor: 'pointer', transition: 'opacity 0.15s',
                  width: 'fit-content',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <Upload size={14} /> Submit Progress Report
              </button>
            )}
          </Panel>

          {/* Report history */}
          <Panel>
            <SectionLabel>Submission History ({ord.reports.length})</SectionLabel>
            {ord.reports.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.slate, fontSize: 13, fontStyle: 'italic', padding: '8px 0' }}>
                <AlertCircle size={14} /> No reports submitted yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ord.reports.map((r, i) => {
                  const rs = statusConfig[r.status];
                  return (
                    <div key={r.id} style={{
                      background: C.sky, border: `1px solid ${C.border}`,
                      borderRadius: 10, padding: '14px 16px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>
                            Report #{ord.reports.length - i} — {r.date}
                          </div>
                          <div style={{ fontSize: 11.5, color: C.slate, marginTop: 2 }}>
                            Submitted by {r.submittedBy}
                          </div>
                        </div>
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          background: rs.bg, color: rs.color,
                          fontSize: 11, fontWeight: 600, padding: '3px 9px',
                          borderRadius: 20,
                        }}>
                          {rs.icon} {rs.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.65, margin: '0 0 10px' }}>
                        {r.notes}
                      </p>
                      {r.evidence.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {r.evidence.map(e => (
                            <span key={e} style={{
                              fontSize: 11.5, background: '#EBF1FF', color: C.blue,
                              border: '1px solid #dbeafe', borderRadius: 4,
                              padding: '3px 9px', display: 'flex', alignItems: 'center',
                              gap: 4, cursor: 'pointer',
                            }}>
                              <Eye size={11} /> {e}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* Activity timeline */}
          <Panel>
            <SectionLabel>Activity Timeline</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                { Icon: CheckCircle, color: C.emerald, label: 'Ordinance assigned to this office',    detail: `Assigned ${ord.dateAssigned}`,         date: ord.dateAssigned   },
                { Icon: BookOpen,    color: C.blue,    label: 'Acknowledged by department head',      detail: 'Read receipt recorded',                date: ord.dateAssigned   },
                { Icon: Clock,       color: C.amber,   label: 'Implementation started',               detail: `Progress at ${ord.progress}%`,         date: ord.lastReportDate },
                { Icon: FileText,    color: C.slate,   label: `${ord.reports.length} report(s) filed`, detail: `Last update: ${ord.lastReportDate}`,  date: ord.lastReportDate },
              ].map((item, i, arr) => (
                <div key={i} style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  paddingBottom: i < arr.length - 1 ? 16 : 0,
                  marginBottom: i < arr.length - 1 ? 16 : 0,
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8,
                    background: C.sky, border: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <item.Icon size={15} color={item.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: C.slate, marginTop: 3 }}>{item.detail}</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: C.slate, fontFamily: 'monospace', whiteSpace: 'nowrap', marginTop: 2 }}>
                    {item.date}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* ── AI Chatbot ── */}
      <OrdinanceChatbot ordinance={chatContext} theme="dept" />

    </div>
  );
}