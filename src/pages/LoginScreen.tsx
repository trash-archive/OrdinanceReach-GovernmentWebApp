import { useState } from 'react';
import { Eye, EyeOff, Shield } from 'lucide-react';

interface LoginProps {
  onLogin: (role: string) => void;
}

const roles = [
  { value: 'encoder', label: 'City Council / Ordinance Encoder' },
  { value: 'department_head', label: 'Department Head' },
  { value: 'barangay', label: 'Barangay Official' },
  { value: 'enforcement', label: 'Enforcement Officer' },
  { value: 'records', label: 'Records / Admin Staff' },
  { value: 'admin', label: 'System Administrator' },
];

export default function LoginScreen({ onLogin }: LoginProps) {
  const [role, setRole] = useState('encoder');
  const [email, setEmail] = useState('m.santos@cebucity.gov.ph');
  const [password, setPassword] = useState('••••••••');
  const [showPw, setShowPw] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 55%, var(--blue) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* BG grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        pointerEvents: 'none',
      }} />

      <div style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 16,
        width: '100%', maxWidth: 420,
        padding: '40px 36px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'var(--navy)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22, color: '#fff' }}>O</span>
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 19, color: 'var(--navy)', lineHeight: 1.2 }}>
              OrdinanceFlow
            </div>
            <div style={{ fontSize: 11, color: 'var(--slate)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Cebu City — Government Portal
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 21, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
            Sign in to your account
          </div>
          <div style={{ fontSize: 13, color: 'var(--slate)' }}>
            Authorized personnel only
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy)' }}>Office Role</span>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{
                padding: '10px 12px', borderRadius: 8,
                border: '1.5px solid var(--border)', fontSize: 13.5,
                color: 'var(--navy)', background: 'var(--sky)', outline: 'none',
              }}
            >
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy)' }}>Government Email</span>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              style={{
                padding: '10px 12px', borderRadius: 8,
                border: '1.5px solid var(--border)', fontSize: 13.5,
                color: 'var(--navy)', background: 'var(--white)', outline: 'none',
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy)' }}>Password</span>
            <div style={{ position: 'relative' }}>
              <input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type={showPw ? 'text' : 'password'}
                style={{
                  width: '100%', padding: '10px 40px 10px 12px', borderRadius: 8,
                  border: '1.5px solid var(--border)', fontSize: 13.5,
                  color: 'var(--navy)', background: 'var(--white)', outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', color: 'var(--slate)',
                }}
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </label>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: -4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--slate)', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--blue)' }} />
              Remember me
            </label>
            <button style={{ background: 'none', fontSize: 12.5, color: 'var(--blue)', fontWeight: 500 }}>
              Forgot password?
            </button>
          </div>

          <button
            onClick={() => onLogin(role)}
            style={{
              width: '100%', padding: '12px', borderRadius: 8,
              background: 'var(--navy)', color: '#fff',
              fontSize: 14, fontWeight: 700, marginTop: 4,
              letterSpacing: '0.02em',
              transition: 'background 0.2s',
            }}
          >
            Sign In
          </button>
        </div>

        <div style={{
          marginTop: 24, padding: '12px 16px',
          background: 'var(--sky)', borderRadius: 8,
          display: 'flex', alignItems: 'center', gap: 8,
          border: '1px solid var(--border)',
        }}>
          <Shield size={15} color="var(--slate)" />
          <span style={{ fontSize: 11.5, color: 'var(--slate)', lineHeight: 1.5 }}>
            This system is for authorized Cebu City Government personnel only. All actions are logged and monitored.
          </span>
        </div>
      </div>
    </div>
  );
}