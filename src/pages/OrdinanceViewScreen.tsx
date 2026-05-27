import { useState } from 'react';
import {
  ArrowLeft, Download, Printer, Edit2, FileText,
  Building2, Clock, CheckCircle, File, ChevronRight,
  AlertCircle, BookOpen,
} from 'lucide-react';
import type { Ordinance } from '../data/mockData';
import { StatusBadge, CategoryBadge, Card } from '../components/UI';
import OrdinanceChatbot from '../components/OrdinanceChatbot';
import type { ChatOrdinanceContext } from '../components/OrdinanceChatbot';

interface OrdinanceViewScreenProps {
  ordinance: Ordinance;
  onNavigate: (s: any) => void;
}

type Tab = 'fulltext' | 'details' | 'history';

// ─── Mock full-text sections built from the ordinance data ───────────────────
function buildSections(ord: Ordinance) {
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
          { num: 'Section 1. Title.', text: `This ordinance shall be known as the "${ord.title}."` },
          { num: 'Section 2. Scope and Coverage.', text: `This ordinance shall apply to all residents, establishments, institutions, and individuals within the territorial jurisdiction of Cebu City, and all 80 barangays thereunder.` },
          { num: 'Section 3. Declaration of Policy.', text: `It is hereby declared the policy of Cebu City to promote and uphold the objectives covered by this ordinance, in accordance with local and national law.` },
        ],
      },
      {
        label: `Article II – ${ord.category} Standards and Requirements`,
        sections: [
          { num: 'Section 4. Mandatory Compliance.', text: `All concerned parties shall comply with the provisions of this ordinance within thirty (30) days from its effectivity. Implementing offices shall issue supplemental guidelines as needed.` },
          { num: 'Section 5. Responsibilities of Implementing Offices.', text: `${ord.offices.length ? ord.offices.join(' and ') : 'The designated implementing office'} shall be responsible for the enforcement and monitoring of this ordinance within their respective mandates.` },
        ],
      },
      {
        label: 'Article III – Prohibited Acts and Penalties',
        sections: [
          { num: 'Section 6. Prohibited Acts.', text: `The following acts are hereby prohibited under this ordinance: (a) Non-compliance with prescribed standards; (b) Obstruction of enforcement operations; (c) Submission of false reports or certifications; (d) Any act in violation of the spirit and intent of this ordinance.` },
          { num: 'Section 7. Penalties.', text: `First offense: Fine of ₱500 or community service of 8 hours.\nSecond offense: Fine of ₱1,000 or community service of 16 hours.\nThird and subsequent offenses: Fine of ₱2,000 and mandatory attendance in an awareness seminar.` },
        ],
      },
      {
        label: 'Article IV – Implementing Authority and Effectivity',
        sections: [
          { num: 'Section 8. Implementing Authority.', text: `${ord.offices.length ? ord.offices.join(' and ') : 'The City Government of Cebu'} shall jointly implement and enforce this ordinance. Barangay captains are hereby deputized to issue citations within their respective jurisdictions.` },
          { num: 'Section 9. Separability Clause.', text: `If any provision of this ordinance is declared invalid, the remaining provisions shall continue in full force and effect.` },
          { num: 'Section 10. Effectivity.', text: `This ordinance shall take effect fifteen (15) days after its publication in a newspaper of general circulation in Cebu City.` },
        ],
      },
    ],
  };
}

const historyItems = [
  { icon: CheckCircle, color: 'var(--emerald)', label: 'Published & set to Active', detail: 'Document uploaded and status updated', date: 'Apr 14, 2024' },
  { icon: Edit2, color: 'var(--blue)', label: 'Metadata finalized', detail: 'Offices assigned, category set, summary entered', date: 'Apr 13, 2024' },
  { icon: FileText, color: 'var(--slate)', label: 'Ordinance encoded', detail: 'Full text entered into the system as Draft', date: 'Apr 12, 2024' },
  { icon: BookOpen, color: 'var(--slate)', label: 'Passed by Sangguniang Panlungsod', detail: 'Official record from session minutes', date: 'Apr 12, 2024' },
];

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function OrdinanceViewScreen({ ordinance: ord, onNavigate }: OrdinanceViewScreenProps) {
  const [tab, setTab] = useState<Tab>('fulltext');
  const sections = buildSections(ord);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'fulltext', label: 'Full Text', icon: <FileText size={13} /> },
    { id: 'details', label: 'Details & Attachments', icon: <File size={13} /> },
    { id: 'history', label: 'Version History', icon: <Clock size={13} /> },
  ];

  // Map Ordinance → ChatOrdinanceContext
  const chatContext: ChatOrdinanceContext = {
    number: ord.number,
    title: ord.title,
    category: ord.category,
    summary: ord.summary,
    offices: ord.offices,
    datePassed: ord.datePassed,
    publishedBy: ord.author,
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900, margin: '0 auto' }}>

      {/* ── Breadcrumb / Back ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--slate)' }}>
        <button
          onClick={() => onNavigate('ordinances')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--slate)', fontSize: 13, padding: 0,
            fontWeight: 500,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--navy)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--slate)')}
        >
          <ArrowLeft size={14} /> Ordinance Repository
        </button>
        <ChevronRight size={13} style={{ opacity: 0.4 }} />
        <span style={{ color: 'var(--navy)', fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{ord.number}</span>
      </div>

      {/* ── Document Header Card ── */}
      <Card style={{ overflow: 'hidden', padding: 0 }}>
        {/* Dark header band */}
        <div style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
          color: '#fff',
          padding: '24px 28px 20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'DM Mono', monospace", fontSize: 11, opacity: 0.55,
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8,
              }}>
                Ordinance No. {ord.number}
              </div>
              <h1 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.4, margin: '0 0 14px' }}>
                {ord.title}
              </h1>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <StatusBadge status={ord.status} />
                <span style={{
                  background: 'rgba(255,255,255,0.14)', color: '#fff',
                  fontSize: 11, fontWeight: 500, padding: '3px 9px', borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  {ord.category}
                </span>
                <span style={{ opacity: 0.45, fontSize: 11 }}>·</span>
                <span style={{ opacity: 0.55, fontSize: 12 }}>{ord.datePassed !== '—' ? `Passed ${ord.datePassed}` : 'Date TBD'}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {[
                { icon: <Printer size={13} />, label: 'Print' },
                { icon: <Download size={13} />, label: 'Export' },
              ].map(btn => (
                <button
                  key={btn.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff', borderRadius: 8, padding: '8px 14px',
                    fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.22)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                >
                  {btn.icon} {btn.label}
                </button>
              ))}
              <button
                onClick={() => onNavigate('encode')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'rgba(255,255,255,0.95)',
                  border: 'none', color: 'var(--navy)',
                  borderRadius: 8, padding: '8px 14px',
                  fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <Edit2 size={13} /> Edit Metadata
              </button>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: 0,
          borderBottom: '1px solid var(--border)',
          background: 'var(--sky)',
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
                color: tab === t.id ? 'var(--navy)' : 'var(--slate)',
                fontSize: 12.5, fontWeight: tab === t.id ? 600 : 500,
                cursor: 'pointer',
                borderBottom: tab === t.id ? '2px solid var(--navy)' : '2px solid transparent',
                marginBottom: -1,
                transition: 'all 0.15s',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </Card>

      {/* ── Tab: Full Text ── */}
      {tab === 'fulltext' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Preamble */}
          <Card style={{ padding: '20px 24px' }}>
            <SectionTitle>Preamble</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sections.preamble.map((w, i) => (
                <div key={i} style={{
                  borderLeft: '3px solid var(--blue)',
                  background: 'var(--sky)',
                  borderRadius: '0 6px 6px 0',
                  padding: '10px 14px',
                  fontSize: 13.5,
                  color: 'var(--navy)',
                  lineHeight: 1.7,
                }}>
                  <strong>WHEREAS</strong>, {w}
                </div>
              ))}
              <p style={{ fontSize: 13.5, color: 'var(--navy)', lineHeight: 1.7, marginTop: 6 }}>
                <strong>NOW, THEREFORE,</strong> be it ordained by the Sangguniang Panlungsod of the City of Cebu, in session assembled, that:
              </p>
            </div>
          </Card>

          {/* Articles */}
          {sections.articles.map((article, ai) => (
            <Card key={ai} style={{ padding: '20px 24px' }}>
              <SectionTitle>{article.label}</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {article.sections.map((sec, si) => (
                  <div key={si} style={{
                    background: 'var(--sky)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '12px 16px',
                  }}>
                    <div style={{
                      fontFamily: "'DM Mono', monospace", fontSize: 11,
                      color: 'var(--slate)', marginBottom: 6, fontWeight: 600,
                    }}>
                      {sec.num}
                    </div>
                    <div style={{ fontSize: 13.5, color: 'var(--navy)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                      {sec.text}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}

          {/* Signatories */}
          <Card style={{ padding: '20px 24px' }}>
            <SectionTitle>Signatories</SectionTitle>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { name: 'Hon. Michael L. Rama', title: 'City Mayor, City of Cebu' },
                { name: 'Hon. Donaldo B. Hontiveros', title: 'City Vice Mayor / Presiding Officer' },
                { name: ord.author, title: 'Records Encoder' },
              ].map((sig, i) => (
                <div key={i} style={{
                  flex: '1 1 160px',
                  borderTop: '2px solid var(--border)',
                  paddingTop: 14,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{sig.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 4 }}>{sig.title}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Tab: Details & Attachments ── */}
      {tab === 'details' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Metadata grid */}
          <Card style={{ padding: '20px 24px' }}>
            <SectionTitle>Ordinance Metadata</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'Ordinance Number', value: ord.number, mono: true },
                { label: 'Date Passed', value: ord.datePassed },
                { label: 'Category', value: ord.category },
                { label: 'Status', value: ord.status.charAt(0).toUpperCase() + ord.status.slice(1) },
                { label: 'Encoded By', value: ord.author },
                { label: 'Date Encoded', value: ord.datePassed !== '—' ? ord.datePassed : 'Pending' },
              ].map(f => (
                <div key={f.label} style={{
                  background: 'var(--sky)',
                  border: '1px solid var(--border)',
                  borderRadius: 8, padding: '12px 14px',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 5 }}>{f.label}</div>
                  <div style={{
                    fontSize: f.mono ? 12 : 13,
                    fontFamily: f.mono ? "'DM Mono', monospace" : 'inherit',
                    fontWeight: 600, color: 'var(--navy)',
                  }}>
                    {f.value}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Implementing offices */}
          <Card style={{ padding: '20px 24px' }}>
            <SectionTitle>Implementing Offices</SectionTitle>
            {ord.offices.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--slate)', fontSize: 13 }}>
                <AlertCircle size={14} /> No offices assigned yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ord.offices.map(office => (
                  <div key={office} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--sky)', border: '1px solid var(--border)',
                    borderRadius: 8, padding: '11px 14px',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'var(--blue)', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Building2 size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{office}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 2 }}>Implementing Office</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Summary */}
          <Card style={{ padding: '20px 24px' }}>
            <SectionTitle>Plain-Language Summary</SectionTitle>
            <p style={{ fontSize: 13.5, color: 'var(--navy)', lineHeight: 1.8, margin: 0 }}>
              {ord.summary}
            </p>
          </Card>

          {/* Attachments */}
          <Card style={{ padding: '20px 24px' }}>
            <SectionTitle>Attached Documents</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { name: `${ord.number}_Full_Document.pdf`, size: '2.3 MB', date: ord.datePassed, icon: '📄', color: '#dc2626' },
                { name: `${ord.number}_Implementation_Guidelines.docx`, size: '845 KB', date: ord.datePassed, icon: '📝', color: '#2563eb' },
              ].map(file => (
                <div key={file.name} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--sky)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '11px 14px',
                }}>
                  <FileText size={20} color={file.color} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: 'var(--navy)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 2 }}>
                      {file.date} · {file.size}
                    </div>
                  </div>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    border: '1px solid var(--border)', background: 'var(--white)',
                    borderRadius: 7, padding: '6px 12px', fontSize: 12,
                    color: 'var(--slate)', cursor: 'pointer', fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}>
                    <Download size={12} /> Download
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Tab: Version History ── */}
      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          <Card style={{ padding: '20px 24px' }}>
            <SectionTitle>Activity Log</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {historyItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} style={{
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    paddingBottom: i < historyItems.length - 1 ? 16 : 0,
                    marginBottom: i < historyItems.length - 1 ? 16 : 0,
                    borderBottom: i < historyItems.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    {/* Icon + vertical line */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: 'var(--sky)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Icon size={15} color={item.color} />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 3 }}>{item.detail}</div>
                    </div>
                    <div style={{
                      fontSize: 11.5, color: 'var(--slate)',
                      fontFamily: "'DM Mono', monospace",
                      whiteSpace: 'nowrap', marginTop: 2,
                    }}>
                      {item.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Related ordinances */}
          <Card style={{ padding: '20px 24px' }}>
            <SectionTitle>Related Ordinances</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { number: 'SP-2024-038', title: 'Ordinance Regulating Single-Use Plastics in Commercial Establishments', status: 'active' as const },
                { number: 'SP-2024-029', title: 'Mandatory Health Protocols for Food Establishments', status: 'active' as const },
              ].map(rel => (
                <div key={rel.number} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  background: 'var(--sky)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '11px 14px',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(235,241,255,0.7)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--sky)')}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--slate)', fontWeight: 600 }}>
                        {rel.number}
                      </span>
                      <StatusBadge status={rel.status} />
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 500 }}>{rel.title}</div>
                  </div>
                  <ChevronRight size={15} color="var(--slate)" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── AI Chatbot ── */}
      <OrdinanceChatbot ordinance={chatContext} theme="encoder" />

    </div>
  );
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {  return (
    <div style={{
      fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
      letterSpacing: '0.08em', color: 'var(--slate)',
      marginBottom: 14, paddingBottom: 8,
      borderBottom: '1px solid var(--border)',
    }}>
      {children}
    </div>
  );
}