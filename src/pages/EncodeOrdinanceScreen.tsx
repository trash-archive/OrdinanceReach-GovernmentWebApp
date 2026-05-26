import { useState } from 'react';
import { Save, Send, Sparkles, X, AlertCircle, CheckCircle } from 'lucide-react';
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
};

export default function EncodeOrdinanceScreen({ onNavigate }: EncodeOrdinanceScreenProps) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  function handlePublish() {
    const e = validate();
    if (!form.summary.trim()) e.summary = 'Summary is required before publishing';
    if (Object.keys(e).length) { setErrors(e); return; }
    showToast('success', `Ordinance "${form.number}" published successfully!`);
    setTimeout(() => onNavigate('ordinances'), 1500);
  }

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleAISummary() {
    if (!form.body.trim()) { showToast('error', 'Please enter ordinance body text first.'); return; }
    setAiLoading(true);
    // Simulate AI summarization
    await new Promise(r => setTimeout(r, 1800));
    const lines = form.body.split('.').filter(s => s.trim().length > 10).slice(0, 3);
    const autoSummary = lines.map(l => l.trim()).join('. ') + (lines.length ? '.' : '');
    set('summary', autoSummary || 'This ordinance establishes rules and regulations for the affected sectors. All implementing offices are required to comply within the specified timeframe.');
    setAiLoading(false);
    showToast('success', 'AI summary generated.');
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
          animation: 'slideDown 0.3s ease',
          fontSize: 13, fontWeight: 500,
        }}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button onClick={() => onNavigate('ordinances')} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          border: '1px solid var(--border)', background: 'var(--white)',
          borderRadius: 8, padding: '8px 16px', fontSize: 13,
          color: 'var(--slate)', cursor: 'pointer', fontWeight: 500,
        }}>
          <X size={14} /> Discard
        </button>
        <button onClick={handleSaveDraft} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          border: '1px solid var(--border)', background: 'var(--white)',
          borderRadius: 8, padding: '8px 16px', fontSize: 13,
          color: 'var(--navy)', cursor: 'pointer', fontWeight: 600,
        }}>
          <Save size={14} /> Save Draft
        </button>
        <button onClick={handlePublish} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--blue)', color: '#fff', border: 'none',
          borderRadius: 8, padding: '8px 18px', fontSize: 13,
          fontWeight: 600, cursor: 'pointer',
        }}>
          <Send size={14} /> Publish Ordinance
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>

        {/* LEFT  EMain fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Basic Info */}
          <Card style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              Basic Information
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Ordinance Number<span style={reqStyle}>*</span></label>
                  <input
                    value={form.number}
                    onChange={e => set('number', e.target.value)}
                    placeholder="e.g. SP-2024-050"
                    style={{ ...fieldStyle, borderColor: errors.number ? 'var(--rose)' : 'var(--border)' }}
                  />
                  {errors.number && <div style={errStyle}><AlertCircle size={11} />{errors.number}</div>}
                </div>
                <div>
                  <label style={labelStyle}>Date Passed</label>
                  <input
                    type="date"
                    value={form.datePassed}
                    onChange={e => set('datePassed', e.target.value)}
                    style={fieldStyle}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Ordinance Title<span style={reqStyle}>*</span></label>
                <input
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="e.g. Anti-Littering and Solid Waste Segregation Ordinance"
                  style={{ ...fieldStyle, borderColor: errors.title ? 'var(--rose)' : 'var(--border)' }}
                />
                {errors.title && <div style={errStyle}><AlertCircle size={11} />{errors.title}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Category<span style={reqStyle}>*</span></label>
                  <select
                    value={form.category}
                    onChange={e => set('category', e.target.value)}
                    style={{ ...fieldStyle, borderColor: errors.category ? 'var(--rose)' : 'var(--border)' }}
                  >
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

          {/* Full Body */}
          <Card style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              Ordinance Body Text
            </div>
            <textarea
              value={form.body}
              onChange={e => set('body', e.target.value)}
              placeholder="Paste or type the full ordinance text here…"
              rows={12}
              style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.7 }}
            />
            <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 6 }}>
              {form.body.trim().split(/\s+/).filter(Boolean).length} words
            </div>
          </Card>
        </div>

        {/* RIGHT  ESidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* AI Summary */}
          <Card style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>AI Summary</div>
              <button
                onClick={handleAISummary}
                disabled={aiLoading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: aiLoading ? 'var(--sky)' : 'linear-gradient(135deg, #6366f1, #3B7BF8)',
                  color: aiLoading ? 'var(--slate)' : '#fff', border: 'none',
                  borderRadius: 7, padding: '6px 12px', fontSize: 12,
                  fontWeight: 600, cursor: aiLoading ? 'default' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <Sparkles size={12} />
                {aiLoading ? 'Generating…' : 'Auto-generate'}
              </button>
            </div>
            <textarea
              value={form.summary}
              onChange={e => set('summary', e.target.value)}
              placeholder="Write a plain-language summary, or click Auto-generate…"
              rows={6}
              style={{ ...fieldStyle, resize: 'vertical', lineHeight: 1.7, borderColor: errors.summary ? 'var(--rose)' : 'var(--border)' }}
            />
            {errors.summary && <div style={errStyle}><AlertCircle size={11} />{errors.summary}</div>}
            <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 6, lineHeight: 1.5 }}>
              This summary will be shown to department heads and citizens.
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
                return (
                  <label key={office} style={{
                    display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                    padding: '8px 10px', borderRadius: 7,
                    background: checked ? 'var(--sky)' : 'transparent',
                    border: `1px solid ${checked ? 'var(--blue)' : 'transparent'}`,
                    transition: 'all 0.15s',
                  }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOffice(office)}
                      style={{ accentColor: 'var(--blue)', width: 14, height: 14 }}
                    />
                    <span style={{ fontSize: 12.5, color: checked ? 'var(--blue)' : 'var(--slate)', fontWeight: checked ? 600 : 400 }}>
                      {office}
                    </span>
                  </label>
                );
              })}
            </div>
            {form.offices.length > 0 && (
              <div style={{ marginTop: 12, padding: '8px 10px', background: 'var(--emerald-light)', borderRadius: 7 }}>
                <div style={{ fontSize: 11, color: 'var(--emerald)', fontWeight: 600 }}>
                  {form.offices.length} office{form.offices.length > 1 ? 's' : ''} selected
                </div>
              </div>
            )}
          </Card>

          {/* Encoder info */}
          <Card style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>Encoder Details</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--blue-bright), var(--amber))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
              }}>MS</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>M. Santos</div>
                <div style={{ fontSize: 11, color: 'var(--slate)' }}>Ordinance Encoder · City Council Office</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        input:focus, select:focus, textarea:focus { border-color: var(--blue) !important; box-shadow: 0 0 0 3px rgba(59,123,248,0.1); }
      `}</style>
    </div>
  );
}