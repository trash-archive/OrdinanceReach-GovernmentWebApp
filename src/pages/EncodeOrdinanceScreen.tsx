import { useState } from 'react';
import { Save, Send, Sparkles, X, AlertCircle, CheckCircle, Mail, Smartphone, Bell, Eye, ChevronRight, Flag } from 'lucide-react';
import { CATEGORIES, OFFICES } from '../data/mockData';
import { Card } from '../components/UI';

interface EncodeOrdinanceScreenProps {
  onNavigate: (s: any) => void;
}

const EMPTY_FORM = {
  number: '',
  title: '',
  datePassed: '',
  category: '',
  offices: [] as string[],
  summary: '',
  body: '',
  author: 'Enc. M. Santos',
  status: 'draft' as 'draft' | 'active',
  deadline: '',
  priority: 'normal' as 'normal' | 'urgent' | 'immediate',
};

// Mock contact info per office — in a real system this comes from the user DB
const OFFICE_CONTACTS: Record<string, { email: string; phone: string; head: string; notifEmail: boolean; notifSms: boolean }> = {
  'City Engineering Office':        { email: 'ceo@cebu.gov.ph',   phone: '09171000001', head: 'Eng. Marco dela Cruz',  notifEmail: true,  notifSms: true  },
  'Traffic Management Office':      { email: 'tmo@cebu.gov.ph',   phone: '09171000002', head: 'Dir. Ramon Villanueva', notifEmail: true,  notifSms: true  },
  'Environmental Management Bureau':{ email: 'emb@cebu.gov.ph',   phone: '09171000003', head: 'Dir. Carla Mendoza',    notifEmail: true,  notifSms: false },
  'Business Permits & Licensing':   { email: 'bplo@cebu.gov.ph',  phone: '09171000004', head: 'Dir. Joel Tabada',      notifEmail: true,  notifSms: true  },
  'City Health Office':             { email: 'cho@cebu.gov.ph',   phone: '09171000005', head: 'Dr. Patricia Lim',      notifEmail: true,  notifSms: true  },
  'Barangay Affairs Office':        { email: 'bao@cebu.gov.ph',   phone: '09171000006', head: 'Dir. Susan Ocampo',     notifEmail: false, notifSms: true  },
  'Disaster Risk Reduction':        { email: 'drrmo@cebu.gov.ph', phone: '09171000007', head: 'Dir. Felix Abella',     notifEmail: true,  notifSms: true  },
  'City Planning & Development':    { email: 'cpdo@cebu.gov.ph',  phone: '09171000008', head: 'Dir. Ana Torres',       notifEmail: true,  notifSms: false },
  'City Assessor':                  { email: 'cao@cebu.gov.ph',   phone: '09171000009', head: 'Assessor R. Bautista',  notifEmail: true,  notifSms: true  },
};

// Build the email body that would be sent to a dept head
function buildEmailPreview(form: typeof EMPTY_FORM, office: string, contact: typeof OFFICE_CONTACTS[string]) {
  const effectivityDate = form.datePassed
    ? new Date(new Date(form.datePassed).getTime() + 15 * 86400000).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : '[15 days after publication]';
  return {
    subject: `[OFFICIAL] New Ordinance Assignment – ${form.number || 'TBD'} | Action Required by ${form.deadline || '[Deadline TBD]'}`,
    body: `To: ${contact.head}\nOffice: ${office}\n\nThis is an official notification from the Office of the Sangguniang Panlungsod, City of Cebu.\n\nA new ordinance has been passed and your office has been designated as an implementing office.\n\nORDINANCE NO. ${form.number || 'TBD'}\nTitle: ${form.title || '[Title]'}\nCategory: ${form.category || '[Category]'}\nDate Passed: ${form.datePassed || '[Date]'}\nDate of Effectivity: ${effectivityDate}\nPriority: ${form.priority.toUpperCase()}\n\nPLAIN-LANGUAGE SUMMARY:\n${form.summary || '[Summary not yet provided]'}\n\nACTION REQUIRED:\nPlease log in to OrdinanceFlow Cebu to acknowledge receipt and begin tracking your compliance. Your initial compliance report is due by ${form.deadline || '[Deadline TBD]'}.\n\nThis is an automated notification from OrdinanceFlow Cebu.`,
  };
}

function buildSmsPreview(form: typeof EMPTY_FORM, office: string) {
  const priority = form.priority === 'immediate' ? '[URGENT] ' : form.priority === 'urgent' ? '[PRIORITY] ' : '';
  return `${priority}[OrdinanceFlow] ${form.number || 'New ordinance'} assigned to ${office}. Deadline: ${form.deadline || 'TBD'}. Log in at ordinanceflow.cebu.gov.ph`;
}

export default function EncodeOrdinanceScreen({ onNavigate }: EncodeOrdinanceScreenProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [previewOffice, setPreviewOffice] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<'email' | 'sms'>('email');
  const [publishing, setPublishing] = useState(false);
  const [dispatched, setDispatched] = useState(false);

  function set(field: string, value: any) {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => { const n = { ...e }; delete n[field]; return n; });
  }

  function toggleOffice(office: string) {
    set('offices', form.offices.includes(office)
      ? form.offices.filter(o => o !== office)
      : [...form.offices, office]);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.number.trim()) e.number = 'Ordinance number is required';
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.category) e.category = 'Category is required';
    if (form.offices.length === 0) e.offices = 'At least one office must be assigned';
    return e;
  }

  function handleSaveDraft() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    showToast('success', `Draft "${form.title}" saved successfully.`);
  }

  function handlePublishClick() {
    const e = validate();
    if (!form.summary.trim()) e.summary = 'Summary is required before publishing';
    if (!form.deadline) e.deadline = 'Compliance deadline is required';
    if (Object.keys(e).length) { setErrors(e); return; }
    // Open confirmation modal
    setPreviewOffice(form.offices[0] ?? null);
    setShowPublishModal(true);
  }

  async function handleConfirmPublish() {
    setPublishing(true);
    await new Promise(r => setTimeout(r, 2000));
    setPublishing(false);
    setShowPublishModal(false);
    setDispatched(true);
  }

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleAISummary() {
    if (!form.body.trim()) { showToast('error', 'Please enter ordinance body text first.'); return; }
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    const lines = form.body.split('.').filter(s => s.trim().length > 10).slice(0, 3);
    const autoSummary = lines.map(l => l.trim()).join('. ') + (lines.length ? '.' : '');
    set('summary', autoSummary || 'This ordinance establishes rules and regulations for the affected sectors. All implementing offices are required to comply within the specified timeframe.');
    setAiLoading(false);
    showToast('success', 'AI summary generated.');
  }

  // Auto-compute default deadline: 45 days from datePassed (15 effectivity + 30 compliance)
  function handleDatePassedChange(val: string) {
    set('datePassed', val);
    if (val && !form.deadline) {
      const d = new Date(val);
      d.setDate(d.getDate() + 45);
      set('deadline', d.toISOString().split('T')[0]);
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%', border: '1px solid var(--border)',
    background: 'var(--white)', borderRadius: 8, padding: '9px 12px',
    fontSize: 13, color: 'var(--navy)', outline: 'none',
    fontFamily: 'inherit', transition: 'border-color 0.15s',
  };
  const errStyle: React.CSSProperties = { fontSize: 11.5, color: 'var(--rose)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--navy)', marginBottom: 6, display: 'block' };
  const reqStyle: React.CSSProperties = { color: 'var(--rose)', marginLeft: 2 };

  const priorityConfig = {
    normal:    { label: 'Normal',            color: 'var(--slate)',   bg: 'var(--sky)',        border: 'var(--border)' },
    urgent:    { label: 'Urgent',            color: 'var(--amber)',   bg: 'var(--amber-light)', border: 'var(--amber)' },
    immediate: { label: 'For Immediate Action', color: 'var(--rose)', bg: 'var(--rose-light)', border: 'var(--rose)' },
  };

  // ── Dispatch summary screen ──────────────────────────────────────────────
  if (dispatched) {
    const channels = form.offices.map(o => {
      const c = OFFICE_CONTACTS[o];
      const ch = [];
      if (c?.notifEmail) ch.push('Email');
      if (c?.notifSms) ch.push('SMS');
      ch.push('In-App');
      return { office: o, head: c?.head ?? 'Department Head', channels: ch };
    });
    return (
      <div style={{ padding: 24, maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy-mid))', borderRadius: 14, padding: '28px 32px', color: '#fff', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={32} color="#10B981" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Georgia, serif', marginBottom: 8 }}>Ordinance Published & Dispatched</div>
          <div style={{ fontSize: 13, opacity: 0.7 }}>{form.number} — {form.title}</div>
        </div>
        <Card style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--slate)', marginBottom: 14 }}>
            Notification Dispatch Summary
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {channels.map(ch => (
              <div key={ch.office} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 8 }}>
                <CheckCircle size={16} color="var(--emerald)" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{ch.office}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 2 }}>{ch.head}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {ch.channels.map(c => (
                    <span key={c} style={{ fontSize: 11, background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 8px', color: 'var(--navy)', fontWeight: 500 }}>{c}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--emerald-light)', borderRadius: 8, fontSize: 12, color: 'var(--emerald)', fontWeight: 500 }}>
            Compliance deadline set to {form.deadline}. Departments will be reminded automatically 7 days before the deadline.
          </div>
        </Card>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={() => { setForm({ ...EMPTY_FORM }); setDispatched(false); }} style={{ border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '9px 18px', fontSize: 13, color: 'var(--slate)', cursor: 'pointer', fontWeight: 500 }}>
            Encode Another
          </button>
          <button onClick={() => onNavigate('ordinances')} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            View Ordinance List <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 960, margin: '0 auto' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 200,
          background: toast.type === 'success' ? 'var(--emerald)' : 'var(--rose)',
          color: '#fff', borderRadius: 10, padding: '12px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          animation: 'slideDown 0.3s ease', fontSize: 13, fontWeight: 500,
        }}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button onClick={() => onNavigate('ordinances')} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'var(--slate)', cursor: 'pointer', fontWeight: 500 }}>
          <X size={14} /> Discard
        </button>
        <button onClick={handleSaveDraft} style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'var(--navy)', cursor: 'pointer', fontWeight: 600 }}>
          <Save size={14} /> Save Draft
        </button>
        <button onClick={handlePublishClick} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          <Send size={14} /> Publish & Notify
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Basic Info */}
          <Card style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>Basic Information</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Ordinance Number<span style={reqStyle}>*</span></label>
                  <input value={form.number} onChange={e => set('number', e.target.value)} placeholder="e.g. SP-2024-050" style={{ ...fieldStyle, borderColor: errors.number ? 'var(--rose)' : 'var(--border)' }} />
                  {errors.number && <div style={errStyle}><AlertCircle size={11} />{errors.number}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Date Passed</label>
                  <input type="date" value={form.datePassed} onChange={e => handleDatePassedChange(e.target.value)} style={fieldStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Ordinance Title<span style={reqStyle}>*</span></label>
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Anti-Littering and Solid Waste Segregation Ordinance" style={{ ...fieldStyle, borderColor: errors.title ? 'var(--rose)' : 'var(--border)' }} />
                {errors.title && <div style={errStyle}><AlertCircle size={11} />{errors.title}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Category<span style={reqStyle}>*</span></label>
                  <select value={form.category} onChange={e => set('category', e.target.value)} style={{ ...fieldStyle, borderColor: errors.category ? 'var(--rose)' : 'var(--border)' }}>
                    <option value="">Select category…</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {errors.category && <div style={errStyle}><AlertCircle size={11} />{errors.category}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value)} style={fieldStyle}>
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Dispatch Settings */}
          <Card style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              Dispatch Settings
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Compliance Deadline<span style={reqStyle}>*</span></label>
                <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} style={{ ...fieldStyle, borderColor: errors.deadline ? 'var(--rose)' : 'var(--border)' }} />
                {errors.deadline && <div style={errStyle}><AlertCircle size={11} />{errors.deadline}</div>}
                <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 5, lineHeight: 1.5 }}>
                  Default: 45 days from date passed (15 days effectivity + 30 days compliance). Auto-filled when you set the date passed.
                </div>
              </div>
              <div>
                <label style={labelStyle}>Priority Level</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(Object.entries(priorityConfig) as [typeof form.priority, typeof priorityConfig[typeof form.priority]][]).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => set('priority', key)}
                      style={{
                        flex: 1, padding: '9px 10px', borderRadius: 8, cursor: 'pointer',
                        border: `1.5px solid ${form.priority === key ? cfg.border : 'var(--border)'}`,
                        background: form.priority === key ? cfg.bg : 'var(--white)',
                        transition: 'all 0.15s', textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: form.priority === key ? cfg.color : 'var(--slate)' }}>
                        {key === 'immediate' ? '🔴' : key === 'urgent' ? '🟡' : '🟢'} {cfg.label}
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 5 }}>
                  Priority affects the notification tone and subject line sent to department heads.
                </div>
              </div>
            </div>
          </Card>

          {/* Full Body */}
          <Card style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>Ordinance Body Text</div>
            <textarea value={form.body} onChange={e => set('body', e.target.value)} placeholder="Paste or type the full ordinance text here…" rows={12} style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.7 }} />
            <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 6 }}>
              {form.body.trim().split(/\s+/).filter(Boolean).length} words
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* AI Summary */}
          <Card style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>AI Summary</div>
              <button onClick={handleAISummary} disabled={aiLoading} style={{ display: 'flex', alignItems: 'center', gap: 5, background: aiLoading ? 'var(--sky)' : 'linear-gradient(135deg, #6366f1, #3B7BF8)', color: aiLoading ? 'var(--slate)' : '#fff', border: 'none', borderRadius: 7, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: aiLoading ? 'default' : 'pointer' }}>
                <Sparkles size={12} />{aiLoading ? 'Generating…' : 'Auto-generate'}
              </button>
            </div>
            <textarea value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="Write a plain-language summary, or click Auto-generate…" rows={6} style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.7, borderColor: errors.summary ? 'var(--rose)' : 'var(--border)' }} />
            {errors.summary && <div style={errStyle}><AlertCircle size={11} />{errors.summary}</div>}
            <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 6, lineHeight: 1.5 }}>
              This summary is included in the email notification sent to department heads.
            </div>
          </Card>

          {/* Office Assignment */}
          <Card style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 4, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              Implementing Offices<span style={reqStyle}>*</span>
            </div>
            {errors.offices && <div style={{ ...errStyle, marginTop: 8, marginBottom: 4 }}><AlertCircle size={11} />{errors.offices}</div>}
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {OFFICES.map(office => {
                const checked = form.offices.includes(office);
                const contact = OFFICE_CONTACTS[office];
                return (
                  <label key={office} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 10px', borderRadius: 7, background: checked ? 'var(--sky)' : 'transparent', border: `1px solid ${checked ? 'var(--blue)' : 'transparent'}`, transition: 'all 0.15s' }}>
                    <input type="checkbox" checked={checked} onChange={() => toggleOffice(office)} style={{ accentColor: 'var(--blue)', width: 14, height: 14 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 12.5, color: checked ? 'var(--blue)' : 'var(--slate)', fontWeight: checked ? 600 : 400 }}>{office}</span>
                      {checked && contact && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                          {contact.notifEmail && <span style={{ fontSize: 10, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 2 }}><Mail size={9} /> Email</span>}
                          {contact.notifSms && <span style={{ fontSize: 10, color: 'var(--emerald)', display: 'flex', alignItems: 'center', gap: 2 }}><Smartphone size={9} /> SMS</span>}
                          <span style={{ fontSize: 10, color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: 2 }}><Bell size={9} /> In-App</span>
                        </div>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
            {form.offices.length > 0 && (
              <div style={{ marginTop: 12, padding: '8px 10px', background: 'var(--emerald-light)', borderRadius: 7 }}>
                <div style={{ fontSize: 11, color: 'var(--emerald)', fontWeight: 600 }}>
                  {form.offices.length} office{form.offices.length > 1 ? 's' : ''} selected — notifications will be sent on publish
                </div>
              </div>
            )}
          </Card>

          {/* Encoder info */}
          <Card style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>Encoder Details</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue-bright), var(--amber))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>MS</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>M. Santos</div>
                <div style={{ fontSize: 11, color: 'var(--slate)' }}>Ordinance Encoder · City Council Office</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Publish Confirmation Modal ── */}
      {showPublishModal && (
        <>
          <div onClick={() => !publishing && setShowPublishModal(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.5)', zIndex: 200 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 620, maxHeight: '85vh', background: 'var(--white)', borderRadius: 16, boxShadow: '0 12px 48px rgba(15,31,61,0.25)', zIndex: 201, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--sky)' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>Confirm Publication & Dispatch</div>
                <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>Review what will be sent to each implementing office</div>
              </div>
              {!publishing && <button onClick={() => setShowPublishModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)' }}><X size={18} /></button>}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Summary row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Ordinance', value: form.number },
                  { label: 'Deadline', value: form.deadline },
                  { label: 'Priority', value: priorityConfig[form.priority].label },
                ].map(f => (
                  <div key={f.label} style={{ background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--slate)', marginBottom: 3 }}>{f.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>{f.value || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Office selector + preview */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>
                  Notification Preview — select an office to preview
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
                  {form.offices.map(o => (
                    <button key={o} onClick={() => setPreviewOffice(o)} style={{ fontSize: 11.5, padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${previewOffice === o ? 'var(--blue)' : 'var(--border)'}`, background: previewOffice === o ? 'var(--sky)' : 'var(--white)', color: previewOffice === o ? 'var(--blue)' : 'var(--slate)', cursor: 'pointer', fontWeight: previewOffice === o ? 600 : 400 }}>
                      {o.split(' ').map(w => w[0]).join('').slice(0, 4)}
                    </button>
                  ))}
                </div>

                {previewOffice && (() => {
                  const contact = OFFICE_CONTACTS[previewOffice];
                  const email = buildEmailPreview(form, previewOffice, contact);
                  const sms = buildSmsPreview(form, previewOffice);
                  return (
                    <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                      {/* Channel tabs */}
                      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--sky)' }}>
                        {[
                          { id: 'email' as const, icon: <Mail size={12} />, label: 'Email', enabled: contact?.notifEmail },
                          { id: 'sms' as const, icon: <Smartphone size={12} />, label: 'SMS', enabled: contact?.notifSms },
                        ].map(ch => (
                          <button key={ch.id} onClick={() => setPreviewTab(ch.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: previewTab === ch.id ? 700 : 500, color: previewTab === ch.id ? 'var(--navy)' : 'var(--slate)', borderBottom: previewTab === ch.id ? '2px solid var(--navy)' : '2px solid transparent' }}>
                            {ch.icon} {ch.label}
                            {!ch.enabled && <span style={{ fontSize: 9, background: 'var(--amber-light)', color: 'var(--amber)', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>OFF</span>}
                          </button>
                        ))}
                        <div style={{ marginLeft: 'auto', padding: '10px 14px', fontSize: 11, color: 'var(--slate)' }}>
                          <Eye size={11} style={{ display: 'inline', marginRight: 4 }} />Preview only
                        </div>
                      </div>
                      {/* Preview content */}
                      <div style={{ padding: '14px 16px', background: '#fff' }}>
                        {previewTab === 'email' ? (
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 4 }}>To: <strong>{contact?.email}</strong></div>
                            <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--navy)', marginBottom: 10, padding: '8px 10px', background: 'var(--sky)', borderRadius: 6 }}>
                              Subject: {email.subject}
                            </div>
                            <pre style={{ fontSize: 11.5, color: 'var(--navy)', lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{email.body}</pre>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 8 }}>To: <strong>{contact?.phone}</strong></div>
                            <div style={{ background: 'var(--sky)', borderRadius: 8, padding: '12px 14px', fontSize: 12.5, color: 'var(--navy)', lineHeight: 1.6 }}>{sms}</div>
                            <div style={{ fontSize: 10.5, color: 'var(--slate)', marginTop: 6 }}>{sms.length} characters</div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Warning if any office has channels off */}
              {form.offices.some(o => !OFFICE_CONTACTS[o]?.notifEmail && !OFFICE_CONTACTS[o]?.notifSms) && (
                <div style={{ padding: '10px 14px', background: 'var(--amber-light)', border: '1px solid var(--amber)', borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <Flag size={14} color="var(--amber)" style={{ marginTop: 1, flexShrink: 0 }} />
                  <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                    Some offices have disabled both email and SMS. They will only receive in-app notifications. Consider contacting them directly.
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end', background: 'var(--sky)' }}>
              {!publishing && (
                <button onClick={() => setShowPublishModal(false)} style={{ border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '9px 18px', fontSize: 13, color: 'var(--slate)', cursor: 'pointer' }}>
                  Go Back & Edit
                </button>
              )}
              <button onClick={handleConfirmPublish} disabled={publishing} style={{ background: publishing ? 'var(--slate)' : 'var(--blue)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 22px', fontSize: 13, fontWeight: 700, cursor: publishing ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, minWidth: 180, justifyContent: 'center' }}>
                {publishing ? (
                  <>
                    <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Publishing & Sending…
                  </>
                ) : (
                  <><Send size={14} /> Confirm & Publish</>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus, textarea:focus { border-color: var(--blue) !important; box-shadow: 0 0 0 3px rgba(59,123,248,0.1); }
      `}</style>
    </div>
  );
}
