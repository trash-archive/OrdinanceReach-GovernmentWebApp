import { useState } from 'react';
import {
  ArrowLeft, Download, Printer, Edit2, FileText,
  Building2, Clock, CheckCircle, File, ChevronRight,
  AlertCircle, BookOpen,
} from 'lucide-react';
import type { Ordinance } from '../data/mockData';
import OrdinanceChatbot from '../components/OrdinanceChatbot';
import type { ChatOrdinanceContext } from '../components/OrdinanceChatbot';

interface OrdinanceViewScreenProps {
  ordinance: Ordinance;
  onNavigate: (s: any) => void;
}

type Tab = 'fulltext' | 'details' | 'history';

// ─── Badge helpers (self-contained, no UI imports) ────────────────────────────

const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> = {
  active:   { bg: '#f0fdf4', color: '#15803d', label: 'Active'   },
  draft:    { bg: '#f8fafc', color: '#475569', label: 'Draft'    },
  amended:  { bg: '#fffbeb', color: '#a16207', label: 'Amended'  },
  repealed: { bg: '#fef2f2', color: '#dc2626', label: 'Repealed' },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.draft;
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 500,
      padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap',
    }}>{cfg.label}</span>
  );
}

// ─── Mock full-text ────────────────────────────────────────────────────────────

function buildSections(ord: Ordinance) {
  return {
    preamble: [
      `the City of Cebu recognizes that this ordinance addresses a critical need within its jurisdiction;`,
      `existing policies require updating to reflect current standards and enforcement capabilities;`,
      `the affected offices and barangays have been duly consulted and have expressed support for this measure;`,
    ],
    articles: [
      {
        label: 'Article I – General Provisions',
        sections: [
          { num: 'Section 1. Title.',                   text: `This ordinance shall be known as the "${ord.title}."` },
          { num: 'Section 2. Scope and Coverage.',       text: `This ordinance shall apply to all residents, establishments, institutions, and individuals within the territorial jurisdiction of Cebu City, and all 80 barangays thereunder.` },
          { num: 'Section 3. Declaration of Policy.',   text: `It is hereby declared the policy of Cebu City to promote and uphold the objectives covered by this ordinance, in accordance with local and national law.` },
        ],
      },
      {
        label: `Article II – ${ord.category} Standards and Requirements`,
        sections: [
          { num: 'Section 4. Mandatory Compliance.',               text: `All concerned parties shall comply with the provisions of this ordinance within thirty (30) days from its effectivity.` },
          { num: 'Section 5. Responsibilities of Implementing Offices.', text: `${ord.offices.length ? ord.offices.join(' and ') : 'The designated implementing office'} shall be responsible for enforcement and monitoring within their respective mandates.` },
        ],
      },
      {
        label: 'Article III – Prohibited Acts and Penalties',
        sections: [
          { num: 'Section 6. Prohibited Acts.',  text: `The following acts are hereby prohibited: (a) Non-compliance with prescribed standards; (b) Obstruction of enforcement operations; (c) Submission of false reports or certifications.` },
          { num: 'Section 7. Penalties.',        text: `First offense: Fine of ₱500 or community service of 8 hours.\nSecond offense: Fine of ₱1,000 or 16 hours.\nThird and subsequent: Fine of ₱2,000 and mandatory seminar.` },
        ],
      },
      {
        label: 'Article IV – Effectivity',
        sections: [
          { num: 'Section 8. Separability Clause.', text: `If any provision of this ordinance is declared invalid, the remaining provisions shall continue in full force and effect.` },
          { num: 'Section 9. Effectivity.',          text: `This ordinance shall take effect fifteen (15) days after its publication in a newspaper of general circulation in Cebu City.` },
        ],
      },
    ],
  };
}

const historyItems = [
  { icon: CheckCircle, color: '#16a34a', label: 'Published & set to Active',  detail: 'Document uploaded and status updated',              date: 'Apr 14, 2024' },
  { icon: Edit2,       color: '#2563eb', label: 'Metadata finalized',         detail: 'Offices assigned, category set, summary entered',  date: 'Apr 13, 2024' },
  { icon: FileText,    color: '#475569', label: 'Ordinance encoded',          detail: 'Full text entered into the system as Draft',        date: 'Apr 12, 2024' },
  { icon: BookOpen,    color: '#475569', label: 'Passed by Sangguniang Panlungsod', detail: 'Official record from session minutes',         date: 'Apr 12, 2024' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OrdinanceViewScreen({ ordinance: ord, onNavigate }: OrdinanceViewScreenProps) {
  const [tab, setTab] = useState<Tab>('fulltext');
  const sections = buildSections(ord);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'fulltext', label: 'Full text',              icon: <FileText size={12} /> },
    { id: 'details',  label: 'Details & attachments',  icon: <File    size={12} /> },
    { id: 'history',  label: 'Version history',        icon: <Clock   size={12} /> },
  ];

  const chatContext: ChatOrdinanceContext = {
    number:      ord.number,
    title:       ord.title,
    category:    ord.category,
    summary:     ord.summary,
    offices:     ord.offices,
    datePassed:  ord.datePassed,
    publishedBy: ord.author,
  };

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 860, margin: '0 auto' }}>

      {/* ── Breadcrumb ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={() => onNavigate('ordinances')}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-secondary)', fontSize: 12.5, padding: 0,
            fontWeight: 500,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <ArrowLeft size={13} /> Ordinance repository
        </button>
        <ChevronRight size={12} style={{ opacity: 0.35, color: 'var(--color-text-secondary)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-text-secondary)' }}>
          {ord.number}
        </span>
      </div>

      {/* ── Document Header ── */}
      <div style={{
        background: 'var(--color-background-primary)',
        border: '1px solid var(--color-border-tertiary)',
        borderRadius: 10, overflow: 'hidden',
      }}>
        {/* Top band */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border-tertiary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 10.5,
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6,
              }}>
                {ord.number}
              </div>
              <h1 style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.45, margin: '0 0 12px', color: 'var(--color-text-primary)' }}>
                {ord.title}
              </h1>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
                <StatusPill status={ord.status} />
                <span style={{
                  background: 'var(--color-background-secondary)',
                  border: '1px solid var(--color-border-tertiary)',
                  color: 'var(--color-text-secondary)',
                  fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 4,
                }}>
                  {ord.category}
                </span>
                {ord.datePassed !== '—' && (
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                    Passed {ord.datePassed}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 7, flexShrink: 0 }}>
              {[
                { icon: <Printer size={13} />, label: 'Print' },
                { icon: <Download size={13} />, label: 'Export' },
              ].map(btn => (
                <button
                  key={btn.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    height: 32, padding: '0 12px',
                    background: 'transparent',
                    border: '1px solid var(--color-border-tertiary)',
                    color: 'var(--color-text-secondary)',
                    borderRadius: 7, fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-background-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {btn.icon} {btn.label}
                </button>
              ))}
              <button
                onClick={() => onNavigate('encode')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  height: 32, padding: '0 12px',
                  background: '#2563eb', border: 'none',
                  color: '#fff', borderRadius: 7,
                  fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
                }}
              >
                <Edit2 size={13} /> Edit Metadata
              </button>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex',
          padding: '0 16px',
          background: 'var(--color-background-secondary)',
          borderBottom: '1px solid var(--color-border-tertiary)',
          gap: 0,
        }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 14px',
                border: 'none', background: 'transparent',
                color: tab === t.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontSize: 12.5, fontWeight: tab === t.id ? 500 : 400,
                cursor: 'pointer',
                borderBottom: tab === t.id ? '2px solid var(--color-text-primary)' : '2px solid transparent',
                marginBottom: -1,
                transition: 'color 0.1s',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab: Full Text ── */}
      {tab === 'fulltext' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Preamble */}
          <DocSection title="Preamble">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sections.preamble.map((w, i) => (
                <div key={i} style={{
                  borderLeft: '2px solid var(--color-border-primary)',
                  padding: '9px 14px',
                  fontSize: 13.5, color: 'var(--color-text-primary)', lineHeight: 1.7,
                }}>
                  <strong>WHEREAS</strong>, {w}
                </div>
              ))}
              <p style={{ fontSize: 13.5, color: 'var(--color-text-primary)', lineHeight: 1.7, margin: '4px 0 0' }}>
                <strong>NOW, THEREFORE,</strong> be it ordained by the Sangguniang Panlungsod of the City of Cebu, in session assembled, that:
              </p>
            </div>
          </DocSection>

          {/* Articles */}
          {sections.articles.map((article, ai) => (
            <DocSection key={ai} title={article.label}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {article.sections.map((sec, si) => (
                  <div key={si} style={{
                    background: 'var(--color-background-secondary)',
                    border: '1px solid var(--color-border-tertiary)',
                    borderRadius: 8, padding: '12px 16px',
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 11,
                      color: 'var(--color-text-secondary)', marginBottom: 6, fontWeight: 500,
                    }}>
                      {sec.num}
                    </div>
                    <div style={{ fontSize: 13.5, color: 'var(--color-text-primary)', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                      {sec.text}
                    </div>
                  </div>
                ))}
              </div>
            </DocSection>
          ))}

          {/* Signatories */}
          <DocSection title="Signatories">
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { name: 'Hon. Michael L. Rama',          title: 'City Mayor' },
                { name: 'Hon. Donaldo B. Hontiveros',    title: 'City Vice Mayor / Presiding Officer' },
                { name: ord.author,                       title: 'Records Encoder' },
              ].map((sig, i) => (
                <div key={i} style={{
                  flex: '1 1 160px',
                  borderTop: '1px solid var(--color-border-tertiary)',
                  paddingTop: 12, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-primary)' }}>{sig.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 3 }}>{sig.title}</div>
                </div>
              ))}
            </div>
          </DocSection>
        </div>
      )}

      {/* ── Tab: Details & Attachments ── */}
      {tab === 'details' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Metadata grid */}
          <DocSection title="Ordinance metadata">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { label: 'Ordinance number', value: ord.number,    mono: true },
                { label: 'Date passed',       value: ord.datePassed            },
                { label: 'Category',          value: ord.category              },
                { label: 'Status',            value: ord.status.charAt(0).toUpperCase() + ord.status.slice(1) },
                { label: 'Encoded by',        value: ord.author                },
                { label: 'Date encoded',      value: ord.datePassed !== '—' ? ord.datePassed : 'Pending' },
              ].map(f => (
                <div key={f.label} style={{
                  background: 'var(--color-background-secondary)',
                  border: '1px solid var(--color-border-tertiary)',
                  borderRadius: 8, padding: '11px 14px',
                }}>
                  <div style={{ fontSize: 10.5, color: 'var(--color-text-secondary)', marginBottom: 4, fontWeight: 500 }}>{f.label}</div>
                  <div style={{
                    fontSize: f.mono ? 11.5 : 12.5,
                    fontFamily: f.mono ? 'var(--font-mono)' : 'inherit',
                    fontWeight: 500, color: 'var(--color-text-primary)',
                  }}>
                    {f.value}
                  </div>
                </div>
              ))}
            </div>
          </DocSection>

          {/* Implementing offices */}
          <DocSection title="Implementing offices">
            {ord.offices.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-secondary)', fontSize: 13 }}>
                <AlertCircle size={14} /> No offices assigned yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {ord.offices.map(office => (
                  <div key={office} style={{
                    display: 'flex', alignItems: 'center', gap: 11,
                    background: 'var(--color-background-secondary)',
                    border: '1px solid var(--color-border-tertiary)',
                    borderRadius: 8, padding: '10px 14px',
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 7,
                      background: '#eff6ff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Building2 size={14} color="#2563eb" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-primary)' }}>{office}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>Implementing office</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DocSection>

          {/* Summary */}
          <DocSection title="Plain-language summary">
            <p style={{ fontSize: 13.5, color: 'var(--color-text-primary)', lineHeight: 1.8, margin: 0 }}>
              {ord.summary}
            </p>
          </DocSection>

          {/* Attachments */}
          <DocSection title="Attached documents">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                { name: `${ord.number}_Full_Document.pdf`,            size: '2.3 MB', date: ord.datePassed, color: '#dc2626' },
                { name: `${ord.number}_Implementation_Guidelines.docx`, size: '845 KB', date: ord.datePassed, color: '#2563eb' },
              ].map(file => (
                <div key={file.name} style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  background: 'var(--color-background-secondary)',
                  border: '1px solid var(--color-border-tertiary)',
                  borderRadius: 8, padding: '10px 14px',
                }}>
                  <FileText size={18} color={file.color} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                      {file.date} · {file.size}
                    </div>
                  </div>
                  <button style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    height: 28, padding: '0 10px',
                    border: '1px solid var(--color-border-tertiary)',
                    background: 'transparent', borderRadius: 6,
                    fontSize: 12, color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 500,
                  }}>
                    <Download size={12} /> Download
                  </button>
                </div>
              ))}
            </div>
          </DocSection>
        </div>
      )}

      {/* ── Tab: Version History ── */}
      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          <DocSection title="Activity log">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {historyItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '12px 0',
                    borderBottom: i < historyItems.length - 1 ? '1px solid var(--color-border-tertiary)' : 'none',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: 'var(--color-background-secondary)',
                      border: '1px solid var(--color-border-tertiary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Icon size={14} color={item.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-primary)' }}>{item.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{item.detail}</div>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {item.date}
                    </div>
                  </div>
                );
              })}
            </div>
          </DocSection>

          {/* Related ordinances */}
          <DocSection title="Related ordinances">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                { number: 'SP-2024-038', title: 'Ordinance Regulating Single-Use Plastics in Commercial Establishments', status: 'active' as const },
                { number: 'SP-2024-029', title: 'Mandatory Health Protocols for Food Establishments', status: 'active' as const },
              ].map(rel => (
                <div
                  key={rel.number}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    background: 'var(--color-background-secondary)',
                    border: '1px solid var(--color-border-tertiary)',
                    borderRadius: 8, padding: '11px 14px', cursor: 'pointer',
                    transition: 'border-color 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-secondary)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border-tertiary)')}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                        {rel.number}
                      </span>
                      <span style={{ background: '#f0fdf4', color: '#15803d', fontSize: 11, fontWeight: 500, padding: '1px 6px', borderRadius: 4 }}>Active</span>
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--color-text-primary)', fontWeight: 500 }}>{rel.title}</div>
                  </div>
                  <ChevronRight size={14} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </DocSection>
        </div>
      )}

      {/* ── AI Chatbot ── */}
      <OrdinanceChatbot ordinance={chatContext} theme="encoder" />

    </div>
  );
}

// ─── Doc Section wrapper ──────────────────────────────────────────────────────

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '1px solid var(--color-border-tertiary)',
      borderRadius: 10, overflow: 'hidden',
      padding: '16px 20px',
    }}>
      <div style={{
        fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: 'var(--color-text-secondary)',
        marginBottom: 12, paddingBottom: 10,
        borderBottom: '1px solid var(--color-border-tertiary)',
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}