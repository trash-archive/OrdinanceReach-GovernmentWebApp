import { useState } from 'react';
import { User, Mail, Phone, Building2, Shield, Key, Edit2, Save, X, CheckCircle, AlertCircle, Bell, MessageSquare, Smartphone } from 'lucide-react';
import type { DeptHeadUser } from '../../data/deptHeadData';
import { Card } from '../../components/UI';

interface DeptProfileScreenProps {
  user: DeptHeadUser;
  onUpdateUser: (updated: Partial<DeptHeadUser>) => void;
}

// Philippine mobile: 09XXXXXXXXX or +639XXXXXXXXX
function isValidPHPhone(v: string) {
  return /^(\+639|09)\d{9}$/.test(v.replace(/\s/g, ''));
}
function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function DeptProfileScreen({ user, onUpdateUser }: DeptProfileScreenProps) {
  const [editingContact, setEditingContact] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Contact edit state
  const [emailDraft, setEmailDraft] = useState(user.email);
  const [phoneDraft, setPhoneDraft] = useState(user.phone);
  const [emailErr, setEmailErr] = useState('');
  const [phoneErr, setPhoneErr] = useState('');

  // Password change state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwErr, setPwErr] = useState('');

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  }

  function handleStartEdit() {
    setEmailDraft(user.email);
    setPhoneDraft(user.phone);
    setEmailErr('');
    setPhoneErr('');
    setEditingContact(true);
  }

  function handleCancelEdit() {
    setEditingContact(false);
    setEmailErr('');
    setPhoneErr('');
  }

  function handleSaveContact() {
    let valid = true;
    if (!isValidEmail(emailDraft)) { setEmailErr('Enter a valid email address.'); valid = false; }
    else setEmailErr('');
    if (!isValidPHPhone(phoneDraft)) { setPhoneErr('Enter a valid PH number (09XXXXXXXXX or +639XXXXXXXXX).'); valid = false; }
    else setPhoneErr('');
    if (!valid) return;

    onUpdateUser({ email: emailDraft, phone: phoneDraft });
    setEditingContact(false);
    showToast('success', 'Contact details updated. Future notifications will use these channels.');
  }

  function handleToggleNotif(field: 'notifEmail' | 'notifSms' | 'notifInApp') {
    onUpdateUser({ [field]: !user[field] });
  }

  function handleSavePassword() {
    if (!pwForm.current) { setPwErr('Enter your current password.'); return; }
    if (pwForm.next.length < 8) { setPwErr('New password must be at least 8 characters.'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwErr('Passwords do not match.'); return; }
    setPwErr('');
    setEditingPassword(false);
    setPwForm({ current: '', next: '', confirm: '' });
    showToast('success', 'Password changed successfully.');
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid #E2E8F0', background: '#fff',
    borderRadius: 8, padding: '9px 12px', fontSize: 13.5,
    color: '#0F1F3D', outline: 'none', fontFamily: 'inherit',
    transition: 'border-color 0.15s', boxSizing: 'border-box',
  };
  const errStyle: React.CSSProperties = {
    fontSize: 11.5, color: '#EF4444', marginTop: 4,
    display: 'flex', alignItems: 'center', gap: 4,
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: '#0F1F3D',
    display: 'block', marginBottom: 6,
  };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 700 }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 300,
          background: toast.type === 'success' ? '#059669' : '#EF4444',
          color: '#fff', borderRadius: 10, padding: '12px 18px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          fontSize: 13, fontWeight: 500, animation: 'slideDown 0.3s ease',
        }}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Profile header */}
      <div style={{
        background: 'linear-gradient(135deg, #0F2027 0%, #1a3a4a 60%, #0d3d2e 100%)',
        borderRadius: 14, padding: '28px 32px', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 20,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(16,185,129,0.07)' }} />
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #10B981, #065f46)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 800, color: '#fff', flexShrink: 0,
        }}>
          {user.avatar}
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Georgia, serif', marginBottom: 4 }}>
            {user.title}. {user.name}
          </div>
          <div style={{ fontSize: 13, opacity: 0.65, marginBottom: 8 }}>{user.office}</div>
          <span style={{
            background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)',
            color: '#10B981', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
          }}>
            Department Head
          </span>
        </div>
      </div>

      {/* Contact Information */}
      <Card style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B' }}>
            Contact Information
          </div>
          {!editingContact ? (
            <button
              onClick={handleStartEdit}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#EBF1FF', border: '1px solid #dbeafe',
                color: '#3B7BF8', borderRadius: 7, padding: '6px 12px',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Edit2 size={12} /> Edit Contact Info
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCancelEdit}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: '#fff', border: '1px solid #E2E8F0',
                  color: '#64748B', borderRadius: 7, padding: '6px 12px',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <X size={12} /> Cancel
              </button>
              <button
                onClick={handleSaveContact}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: '#10B981', border: 'none',
                  color: '#fff', borderRadius: 7, padding: '6px 14px',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}
              >
                <Save size={12} /> Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Notice banner */}
        {editingContact && (
          <div style={{
            background: 'rgba(59,123,248,0.06)', border: '1px solid #dbeafe',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <AlertCircle size={14} color="#3B7BF8" style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: '#3B7BF8', lineHeight: 1.5 }}>
              These details are used for official ordinance notifications. Make sure your email and phone are correct — all future assignments and reminders will be sent here.
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Read-only fields */}
          {[
            { icon: <User size={15} />, label: 'Full Name', value: `${user.title}. ${user.name}` },
            { icon: <Building2 size={15} />, label: 'Office', value: user.office },
            { icon: <Shield size={15} />, label: 'System Role', value: 'Department Head' },
          ].map(f => (
            <div key={f.label} style={{
              display: 'flex', gap: 14, alignItems: 'center',
              padding: '10px 14px', background: '#F6F8FC',
              borderRadius: 8, border: '1px solid #E2E8F0',
            }}>
              <span style={{ color: '#64748B', flexShrink: 0 }}>{f.icon}</span>
              <div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F1F3D' }}>{f.value}</div>
              </div>
            </div>
          ))}

          {/* Editable: Email */}
          <div style={{
            padding: '10px 14px', background: editingContact ? '#fff' : '#F6F8FC',
            borderRadius: 8, border: `1px solid ${editingContact ? (emailErr ? '#EF4444' : '#10B981') : '#E2E8F0'}`,
            transition: 'all 0.2s',
          }}>
            {!editingContact ? (
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ color: '#64748B', flexShrink: 0 }}><Mail size={15} /></span>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>Email</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F1F3D' }}>{user.email}</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 10, background: '#D1FAE5', color: '#059669', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                  Notification channel
                </span>
              </div>
            ) : (
              <div>
                <label style={labelStyle}><Mail size={12} style={{ display: 'inline', marginRight: 5 }} />Email Address</label>
                <input
                  value={emailDraft}
                  onChange={e => { setEmailDraft(e.target.value); setEmailErr(''); }}
                  placeholder="e.g. r.villanueva@cebu.gov.ph"
                  style={{ ...inputStyle, borderColor: emailErr ? '#EF4444' : '#E2E8F0' }}
                  onFocus={e => { if (!emailErr) e.currentTarget.style.borderColor = '#10B981'; }}
                  onBlur={e => { if (!emailErr) e.currentTarget.style.borderColor = '#E2E8F0'; }}
                />
                {emailErr && <div style={errStyle}><AlertCircle size={11} />{emailErr}</div>}
              </div>
            )}
          </div>

          {/* Editable: Phone */}
          <div style={{
            padding: '10px 14px', background: editingContact ? '#fff' : '#F6F8FC',
            borderRadius: 8, border: `1px solid ${editingContact ? (phoneErr ? '#EF4444' : '#10B981') : '#E2E8F0'}`,
            transition: 'all 0.2s',
          }}>
            {!editingContact ? (
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ color: '#64748B', flexShrink: 0 }}><Phone size={15} /></span>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>Phone / Mobile</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F1F3D' }}>{user.phone}</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 10, background: '#D1FAE5', color: '#059669', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                  Notification channel
                </span>
              </div>
            ) : (
              <div>
                <label style={labelStyle}><Phone size={12} style={{ display: 'inline', marginRight: 5 }} />Phone / Mobile Number</label>
                <input
                  value={phoneDraft}
                  onChange={e => { setPhoneDraft(e.target.value); setPhoneErr(''); }}
                  placeholder="e.g. 09171234567 or +639171234567"
                  style={{ ...inputStyle, borderColor: phoneErr ? '#EF4444' : '#E2E8F0' }}
                  onFocus={e => { if (!phoneErr) e.currentTarget.style.borderColor = '#10B981'; }}
                  onBlur={e => { if (!phoneErr) e.currentTarget.style.borderColor = '#E2E8F0'; }}
                />
                {phoneErr && <div style={errStyle}><AlertCircle size={11} />{phoneErr}</div>}
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                  Format: 09XXXXXXXXX or +639XXXXXXXXX
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card style={{ padding: '20px 24px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 4 }}>
          Notification Preferences
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16, lineHeight: 1.5 }}>
          Choose how you receive official ordinance assignments and compliance reminders.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            {
              field: 'notifEmail' as const,
              icon: <Mail size={16} />,
              label: 'Email Notifications',
              desc: `Sent to ${user.email}`,
              enabled: user.notifEmail,
              recommended: true,
            },
            {
              field: 'notifSms' as const,
              icon: <Smartphone size={16} />,
              label: 'SMS Notifications',
              desc: `Sent to ${user.phone}`,
              enabled: user.notifSms,
              recommended: true,
            },
            {
              field: 'notifInApp' as const,
              icon: <Bell size={16} />,
              label: 'In-App Notifications',
              desc: 'Shown in your notifications panel when logged in',
              enabled: user.notifInApp,
              recommended: false,
            },
          ].map(item => (
            <div
              key={item.field}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px', borderRadius: 10,
                border: `1px solid ${item.enabled ? '#10B981' : '#E2E8F0'}`,
                background: item.enabled ? 'rgba(16,185,129,0.04)' : '#F6F8FC',
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 38, height: 38, borderRadius: 9,
                background: item.enabled ? 'rgba(16,185,129,0.12)' : '#E2E8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: item.enabled ? '#10B981' : '#94A3B8',
                flexShrink: 0, transition: 'all 0.2s',
              }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0F1F3D' }}>{item.label}</span>
                  {item.recommended && (
                    <span style={{ fontSize: 10, background: '#EBF1FF', color: '#3B7BF8', padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>
                      Recommended
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{item.desc}</div>
              </div>
              {/* Toggle */}
              <button
                onClick={() => handleToggleNotif(item.field)}
                style={{
                  width: 44, height: 24, borderRadius: 12, border: 'none',
                  background: item.enabled ? '#10B981' : '#CBD5E1',
                  cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                  flexShrink: 0,
                }}
                aria-label={`Toggle ${item.label}`}
              >
                <div style={{
                  position: 'absolute', top: 3,
                  left: item.enabled ? 23 : 3,
                  width: 18, height: 18, borderRadius: '50%',
                  background: '#fff', transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
          ))}
        </div>
        {!user.notifEmail && !user.notifSms && (
          <div style={{
            marginTop: 12, padding: '10px 14px',
            background: '#FEF3C7', border: '1px solid #FDE68A',
            borderRadius: 8, display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <AlertCircle size={14} color="#B45309" style={{ marginTop: 1, flexShrink: 0 }} />
            <div style={{ fontSize: 12, color: '#B45309', lineHeight: 1.5 }}>
              You have disabled both email and SMS. You will only be notified when logged in. You may miss urgent ordinance assignments.
            </div>
          </div>
        )}
      </Card>

      {/* Security */}
      <Card style={{ padding: '20px 24px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 16 }}>
          Security
        </div>
        {!editingPassword ? (
          <button
            onClick={() => setEditingPassword(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#F6F8FC', border: '1px solid #E2E8F0',
              borderRadius: 8, padding: '12px 16px', cursor: 'pointer',
              width: '100%', textAlign: 'left',
            }}
          >
            <Key size={15} color="#64748B" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0F1F3D' }}>Change Password</div>
              <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 1 }}>Last changed 30 days ago</div>
            </div>
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Current Password', field: 'current' as const, placeholder: 'Enter current password' },
              { label: 'New Password', field: 'next' as const, placeholder: 'At least 8 characters' },
              { label: 'Confirm New Password', field: 'confirm' as const, placeholder: 'Re-enter new password' },
            ].map(f => (
              <div key={f.field}>
                <label style={labelStyle}>{f.label}</label>
                <input
                  type="password"
                  value={pwForm[f.field]}
                  onChange={e => { setPwForm(p => ({ ...p, [f.field]: e.target.value })); setPwErr(''); }}
                  placeholder={f.placeholder}
                  style={inputStyle}
                />
              </div>
            ))}
            {pwErr && (
              <div style={{ ...errStyle, fontSize: 12 }}>
                <AlertCircle size={12} />{pwErr}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
              <button
                onClick={() => { setEditingPassword(false); setPwForm({ current: '', next: '', confirm: '' }); setPwErr(''); }}
                style={{ border: '1px solid #E2E8F0', background: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#64748B', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSavePassword}
                style={{ background: '#10B981', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Save size={13} /> Update Password
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Notification channel info box */}
      <div style={{
        background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 10, padding: '14px 18px',
        display: 'flex', gap: 12, alignItems: 'flex-start',
      }}>
        <MessageSquare size={16} color="#10B981" style={{ marginTop: 1, flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: '#0F1F3D', lineHeight: 1.6 }}>
          <strong>How notifications work:</strong> When a new ordinance is assigned to your office, the City Council Office will automatically send you an official notification via your enabled channels. Email notifications include the full ordinance summary and your compliance deadline. SMS notifications are brief alerts for urgent assignments.
        </div>
      </div>

      <style>{`
        @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        input:focus { border-color: #10B981 !important; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
      `}</style>
    </div>
  );
}
