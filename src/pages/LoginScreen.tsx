import { useState } from 'react';
import { Eye, EyeOff, Shield, KeyRound, CheckCircle, AlertCircle, ArrowRight, Lock } from 'lucide-react';

interface LoginProps {
  onLogin: (role: string) => void;
}

const roles = [
  { value: 'encoder',         label: 'City Council / Ordinance Encoder' },
  { value: 'department_head', label: 'Department Head' },
  { value: 'barangay',        label: 'Barangay Official' },
  { value: 'enforcement',     label: 'Enforcement Officer' },
  { value: 'records',         label: 'Records / Admin Staff' },
  { value: 'admin',           label: 'System Administrator' },
];

// Simulated "first login" accounts — in real system, backend sends isFirstLogin flag
const FIRST_LOGIN_ACCOUNTS = ['j.tabada@cebu.gov.ph', 'j.delavega@cebu.gov.ph'];

type FlowStep = 'login' | 'first-password' | 'success';

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters',     pass: password.length >= 8 },
    { label: 'One uppercase letter',       pass: /[A-Z]/.test(password) },
    { label: 'One number',                 pass: /\d/.test(password) },
    { label: 'One special character',      pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const colors = ['#EF4444', '#F59E0B', '#F59E0B', '#10B981', '#10B981'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div style={{ marginTop: 10 }}>
      {/* Strength bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{
            flex: 1, height: 4, borderRadius: 2,
            background: i <= score ? colors[score] : '#E2E8F0',
            transition: 'background 0.3s',
          }} />
        ))}
        <span style={{ fontSize: 11, color: colors[score], fontWeight: 700, marginLeft: 6, minWidth: 40 }}>
          {labels[score]}
        </span>
      </div>
      {/* Checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {checks.map(c => (
          <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {c.pass
              ? <CheckCircle size={12} color="#10B981" />
              : <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1.5px solid #CBD5E1' }} />
            }
            <span style={{ fontSize: 11.5, color: c.pass ? '#10B981' : '#94A3B8', transition: 'color 0.2s' }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoginScreen({ onLogin }: LoginProps) {
  // Login form
  const [role,     setRole]     = useState('encoder');
  const [email,    setEmail]    = useState('m.santos@cebu.gov.ph');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loginErr, setLoginErr] = useState('');
  const [loading,  setLoading]  = useState(false);

  // First-login password change
  const [step, setStep]           = useState<FlowStep>('login');
  const [newPw,    setNewPw]      = useState('');
  const [confirmPw,setConfirmPw]  = useState('');
  const [showNew,  setShowNew]    = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [pwErr,    setPwErr]      = useState('');

  const pwValid =
    newPw.length >= 8 &&
    /[A-Z]/.test(newPw) &&
    /\d/.test(newPw) &&
    /[^A-Za-z0-9]/.test(newPw);

  async function handleLogin() {
    if (!email || !password) { setLoginErr('Please enter your email and password.'); return; }
    setLoading(true);
    setLoginErr('');
    await new Promise(r => setTimeout(r, 900)); // simulate API
    setLoading(false);

    // First-login check
    if (FIRST_LOGIN_ACCOUNTS.includes(email.toLowerCase())) {
      setStep('first-password');
      return;
    }
    onLogin(role);
  }

  async function handleSetPassword() {
    setPwErr('');
    if (!pwValid)              { setPwErr('Password does not meet all requirements.'); return; }
    if (newPw !== confirmPw)   { setPwErr('Passwords do not match.'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setStep('success');
  }

  function handleContinue() { onLogin(role); }

  // ─────────────────────────────────────────
  const inputBase: React.CSSProperties = {
    padding: '10px 12px', borderRadius: 8,
    border: '1.5px solid #E2E8F0', fontSize: 13.5,
    color: '#0F1F3D', background: '#fff', outline: 'none',
    width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12.5, fontWeight: 600, color: '#0F1F3D', marginBottom: 6, display: 'block',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F1F3D 0%, #1A3260 55%, #3B7BF8 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* BG grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '32px 32px', pointerEvents: 'none',
      }} />
      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(59,123,248,0.12)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(16,185,129,0.08)', filter: 'blur(60px)', pointerEvents: 'none' }} />

      <div style={{
        background: 'rgba(255,255,255,0.97)', borderRadius: 18,
        width: '100%', maxWidth: 440,
        boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        position: 'relative', overflow: 'hidden',
      }}>

        {/* ══════════════════════════════════
            STEP 1 — LOGIN
        ══════════════════════════════════ */}
        {step === 'login' && (
          <div style={{ padding: '40px 36px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#0F1F3D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 22, color: '#fff' }}>O</span>
              </div>
              <div>
                <div style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: 19, color: '#0F1F3D', lineHeight: 1.2 }}>OrdinanceFlow</div>
                <div style={{ fontSize: 11, color: '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cebu City — Government Portal</div>
              </div>
            </div>

            <div style={{ marginBottom: 26 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0F1F3D', marginBottom: 4, fontFamily: 'Georgia, serif' }}>Sign in to your account</div>
              <div style={{ fontSize: 13, color: '#64748B' }}>Authorized personnel only</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Role */}
              <div>
                <label style={labelStyle}>Office Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} style={{ ...inputBase, background: '#EBF1FF' }}>
                  {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Government Email</label>
                <input
                  value={email} onChange={e => { setEmail(e.target.value); setLoginErr(''); }}
                  type="email" placeholder="you@cebu.gov.ph"
                  style={inputBase}
                  onFocus={e => (e.target.style.borderColor = '#3B7BF8')}
                  onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                />
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={password} onChange={e => { setPassword(e.target.value); setLoginErr(''); }}
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    style={{ ...inputBase, paddingRight: 40 }}
                    onFocus={e => (e.target.style.borderColor = '#3B7BF8')}
                    onBlur={e => (e.target.style.borderColor = '#E2E8F0')}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                  <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {loginErr && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#FEE2E2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px' }}>
                  <AlertCircle size={14} color="#EF4444" />
                  <span style={{ fontSize: 12.5, color: '#EF4444' }}>{loginErr}</span>
                </div>
              )}

              {/* Remember / Forgot */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: -4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#64748B', cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: '#3B7BF8' }} />
                  Remember me
                </label>
                <button style={{ background: 'none', border: 'none', fontSize: 12.5, color: '#3B7BF8', fontWeight: 500, cursor: 'pointer' }}>
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: 8,
                  background: loading ? '#94A3B8' : '#0F1F3D',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  border: 'none', cursor: loading ? 'default' : 'pointer',
                  transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  marginTop: 4,
                }}
              >
                {loading ? 'Verifying…' : <><span>Sign In</span><ArrowRight size={15} /></>}
              </button>
            </div>

            {/* First login hint */}
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button
                onClick={() => { setEmail('j.tabada@cebu.gov.ph'); setPassword('TempPass123!'); }}
                style={{ background: 'none', border: 'none', fontSize: 12, color: '#94A3B8', cursor: 'pointer', textDecoration: 'underline' }}
              >
                First time logging in? Use your temporary credentials.
              </button>
            </div>

            {/* Security notice */}
            <div style={{ marginTop: 20, padding: '12px 14px', background: '#EBF1FF', borderRadius: 8, display: 'flex', alignItems: 'flex-start', gap: 8, border: '1px solid #dbeafe' }}>
              <Shield size={14} color="#64748B" style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, color: '#64748B', lineHeight: 1.5 }}>
                This system is for authorized Cebu City Government personnel only. All actions are logged and monitored.
              </span>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            STEP 2 — FORCE PASSWORD CHANGE
        ══════════════════════════════════ */}
        {step === 'first-password' && (
          <div style={{ padding: '40px 36px' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#EBF1FF', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <KeyRound size={24} color="#3B7BF8" />
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0F1F3D', fontFamily: 'Georgia, serif', marginBottom: 8 }}>
                Set Your New Password
              </div>
              <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6 }}>
                This is your first login. For security, you must set a permanent password before continuing.
              </div>
            </div>

            {/* Account badge */}
            <div style={{ background: '#F6F8FC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px', marginBottom: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #3B7BF8, #0F1F3D)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>JT</div>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0F1F3D' }}>Joel Tabada</div>
                <div style={{ fontSize: 11.5, color: '#64748B' }}>{email} · Dept. Head</div>
              </div>
              <Lock size={13} color="#94A3B8" style={{ marginLeft: 'auto' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* New password */}
              <div>
                <label style={labelStyle}>New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={newPw}
                    onChange={e => { setNewPw(e.target.value); setPwErr(''); }}
                    type={showNew ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    style={{ ...inputBase, paddingRight: 40, borderColor: newPw && !pwValid ? '#F59E0B' : newPw && pwValid ? '#10B981' : '#E2E8F0' }}
                  />
                  <button onClick={() => setShowNew(!showNew)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}>
                    {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {newPw && <PasswordStrength password={newPw} />}
              </div>

              {/* Confirm */}
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    value={confirmPw}
                    onChange={e => { setConfirmPw(e.target.value); setPwErr(''); }}
                    type={showConf ? 'text' : 'password'}
                    placeholder="Re-enter your new password"
                    style={{ ...inputBase, paddingRight: 40, borderColor: confirmPw ? (confirmPw === newPw ? '#10B981' : '#EF4444') : '#E2E8F0' }}
                  />
                  <button onClick={() => setShowConf(!showConf)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4 }}>
                    {showConf ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {confirmPw && confirmPw !== newPw && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#EF4444', marginTop: 5 }}>
                    <AlertCircle size={12} /> Passwords do not match
                  </div>
                )}
                {confirmPw && confirmPw === newPw && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#10B981', marginTop: 5 }}>
                    <CheckCircle size={12} /> Passwords match
                  </div>
                )}
              </div>

              {/* Error */}
              {pwErr && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#FEE2E2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px' }}>
                  <AlertCircle size={14} color="#EF4444" />
                  <span style={{ fontSize: 12.5, color: '#EF4444' }}>{pwErr}</span>
                </div>
              )}

              <button
                onClick={handleSetPassword}
                disabled={loading || !pwValid || confirmPw !== newPw}
                style={{
                  width: '100%', padding: '12px', borderRadius: 8,
                  background: (!pwValid || confirmPw !== newPw) ? '#E2E8F0' : loading ? '#94A3B8' : '#0F1F3D',
                  color: (!pwValid || confirmPw !== newPw) ? '#94A3B8' : '#fff',
                  fontSize: 14, fontWeight: 700, border: 'none',
                  cursor: (!pwValid || confirmPw !== newPw) ? 'default' : 'pointer',
                  transition: 'all 0.2s', marginTop: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {loading ? 'Saving…' : <><KeyRound size={14} /><span>Set Password & Continue</span></>}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            STEP 3 — SUCCESS
        ══════════════════════════════════ */}
        {step === 'success' && (
          <div style={{ padding: '48px 36px', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'popIn 0.4s ease' }}>
              <CheckCircle size={36} color="#10B981" />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#0F1F3D', fontFamily: 'Georgia, serif', marginBottom: 10 }}>
              Password Set Successfully
            </div>
            <div style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.7, marginBottom: 28, maxWidth: 320, margin: '0 auto 28px' }}>
              Your new password has been saved. You're now logged in as <strong>Joel Tabada</strong>. Welcome to OrdinanceFlow.
            </div>
            <button
              onClick={handleContinue}
              style={{
                background: '#0F1F3D', color: '#fff', border: 'none',
                borderRadius: 8, padding: '12px 32px', fontSize: 14,
                fontWeight: 700, cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', gap: 8,
                transition: 'background 0.2s',
              }}
            >
              Go to Dashboard <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* Step indicator dots */}
        {step !== 'login' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 20 }}>
            {(['login', 'first-password', 'success'] as FlowStep[]).map(s => (
              <div key={s} style={{ width: s === step ? 20 : 6, height: 6, borderRadius: 3, background: s === step ? '#3B7BF8' : '#E2E8F0', transition: 'all 0.3s' }} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}