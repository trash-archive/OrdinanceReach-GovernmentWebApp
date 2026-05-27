 import { useState } from 'react';
import { Bell, CheckCheck, Trash2, Filter, Send, CheckCircle, AlertTriangle, Info, AlertCircle, X, Mail, Smartphone, Eye } from 'lucide-react';
import { notifications as mockNotifications } from '../data/mockData';
import type { Notification } from '../data/mockData';
import { Card } from '../components/UI';

interface NotificationsScreenProps {
  onNavigate: (s: any) => void;
}

type FilterType = 'all' | 'unread' | 'success' | 'warning' | 'info' | 'alert';

interface SentItem {
  id: string;
  to: string;
  subject: string;
  status: 'delivered' | 'pending' | 'failed';
  time: string;
  channels: { email: boolean; sms: boolean; inApp: boolean };
  type: 'auto' | 'manual' | 'reminder';
  ordinanceNumber?: string;
}

const sentHistory: SentItem[] = [
  { id: 's1', to: 'Traffic Management Office', subject: 'New Ordinance Assignment – SP-2024-NEW | Action Required by Jun 20, 2024', status: 'delivered', time: 'Today 10:35 AM', channels: { email: true, sms: true, inApp: true }, type: 'auto', ordinanceNumber: 'SP-2024-NEW' },
  { id: 's2', to: 'Environmental Management Bureau', subject: 'New Ordinance Assignment – SP-2024-041 | Action Required by May 12, 2024', status: 'delivered', time: 'Apr 12, 2024 9:02 AM', channels: { email: true, sms: false, inApp: true }, type: 'auto', ordinanceNumber: 'SP-2024-041' },
  { id: 's3', to: 'Business Permits & Licensing', subject: 'New Ordinance Assignment – SP-2024-041 | Action Required by May 12, 2024', status: 'delivered', time: 'Apr 12, 2024 9:02 AM', channels: { email: true, sms: true, inApp: true }, type: 'auto', ordinanceNumber: 'SP-2024-041' },
  { id: 's4', to: 'Business Permits & Licensing', subject: '[REMINDER] Compliance Report Overdue – SP-2024-017 | Immediate Action Required', status: 'delivered', time: 'May 10, 2024 2:00 PM', channels: { email: true, sms: true, inApp: true }, type: 'reminder', ordinanceNumber: 'SP-2024-017' },
  { id: 's5', to: 'City Engineering Office', subject: '[REMINDER] Compliance Report Overdue – SP-2024-033 | Immediate Action Required', status: 'pending', time: 'May 15, 2024 11:30 AM', channels: { email: true, sms: false, inApp: true }, type: 'reminder', ordinanceNumber: 'SP-2024-033' },
  { id: 's6', to: 'City Health Office', subject: 'Amendment Notice: SP-2024-022 has been updated', status: 'failed', time: 'May 3, 2024 3:15 PM', channels: { email: false, sms: true, inApp: true }, type: 'manual' },
];

const notifIcons: Record<string, React.ReactNode> = {
  success: <CheckCircle size={15} color="var(--emerald)" />,
  warning: <AlertTriangle size={15} color="var(--amber)" />,
  info:    <Info size={15} color="var(--blue)" />,
  alert:   <AlertCircle size={15} color="var(--rose)" />,
};

const notifBg: Record<string, string> = {
  success: 'var(--emerald-light)',
  warning: 'var(--amber-light)',
  info:    'var(--sky)',
  alert:   'var(--rose-light)',
};

export default function NotificationsScreen({ onNavigate: _onNavigate }: NotificationsScreenProps) {
  const [notifs, setNotifs] = useState<Notification[]>([...mockNotifications]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [tab, setTab] = useState<'inbox' | 'sent'>('inbox');
  const [composing, setComposing] = useState(false);
  const [composeForm, setComposeForm] = useState({ to: '', subject: '', message: '', channel: 'all' });
  const [sentItems, setSentItems] = useState<SentItem[]>(sentHistory);
  const [previewSent, setPreviewSent] = useState<SentItem | null>(null);

  const unreadCount = notifs.filter(n => !n.read).length;
  const autoSentCount = sentItems.filter(s => s.type === 'auto').length;
  const reminderCount = sentItems.filter(s => s.type === 'reminder').length;

  const filtered = notifs.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  function markAllRead() { setNotifs(ns => ns.map(n => ({ ...n, read: true }))); }
  function markRead(id: string) { setNotifs(ns => ns.map(n => n.id === id ? { ...n, read: true } : n)); }
  function deleteNotif(id: string) { setNotifs(ns => ns.filter(n => n.id !== id)); }

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'unread', label: `Unread (${unreadCount})` },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'info', label: 'Info' },
    { value: 'alert', label: 'Alert' },
  ];

  const statusColors: Record<string, string> = { delivered: 'var(--emerald)', pending: 'var(--amber)', failed: 'var(--rose)' };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Summary bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Inbox',       value: notifs.length,                                                    color: 'var(--blue)'    },
          { label: 'Unread',            value: unreadCount,                                                      color: 'var(--rose)'    },
          { label: 'Auto-Dispatched',   value: sentItems.filter(s => s.type === 'auto').length,                  color: 'var(--emerald)' },
          { label: 'Reminders Sent',    value: sentItems.filter(s => s.type === 'reminder').length,              color: 'var(--amber)'   },
        ].map(s => (
          <div key={s.label} style={{
            background: 'var(--white)', border: '1px solid var(--border)',
            borderRadius: 12, padding: '16px 20px', boxShadow: 'var(--shadow)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color, borderRadius: '10px 10px 0 0' }} />
            <div style={{ fontSize: 11.5, color: 'var(--slate)', fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.2, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <Card>
        {/* Tabs + actions */}
        <div style={{ padding: '0 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {(['inbox', 'sent'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: '14px 18px', fontSize: 13, fontWeight: tab === t ? 700 : 500,
                color: tab === t ? 'var(--blue)' : 'var(--slate)',
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: tab === t ? '2px solid var(--blue)' : '2px solid transparent',
                textTransform: 'capitalize',
              }}>
                {t === 'inbox' ? `Inbox${unreadCount > 0 ? ` (${unreadCount})` : ''}` : 'Sent Notifications'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {tab === 'inbox' && unreadCount > 0 && (
              <button onClick={markAllRead} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                border: '1px solid var(--border)', background: 'var(--white)',
                borderRadius: 8, padding: '6px 13px', fontSize: 12, color: 'var(--slate)', cursor: 'pointer',
              }}>
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
            <button onClick={() => setComposing(true)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--blue)', color: '#fff', border: 'none',
              borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              <Send size={13} /> Send Notification
            </button>
          </div>
        </div>

        {/* Inbox */}
        {tab === 'inbox' && (
          <>
            {/* Filter chips */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <Filter size={13} color="var(--slate)" />
              {filterOptions.map(opt => (
                <button key={opt.value} onClick={() => setFilter(opt.value)} style={{
                  border: '1px solid var(--border)', borderRadius: 20,
                  padding: '4px 12px', fontSize: 12, fontWeight: 500,
                  background: filter === opt.value ? 'var(--navy)' : 'var(--white)',
                  color: filter === opt.value ? '#fff' : 'var(--slate)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}>
                  {opt.label}
                </button>
              ))}
            </div>

            <div>
              {filtered.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--slate)' }}>
                  <Bell size={32} color="var(--border)" style={{ marginBottom: 12 }} />
                  <div>No notifications here.</div>
                </div>
              ) : filtered.map((notif, i) => (
                <div key={notif.id} style={{
                  padding: '14px 20px',
                  borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  background: !notif.read ? 'rgba(59,123,248,0.03)' : 'transparent',
                  transition: 'background 0.15s',
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                    background: notifBg[notif.type],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {notifIcons[notif.type]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 13.5, fontWeight: notif.read ? 500 : 700, color: 'var(--navy)' }}>{notif.title}</div>
                      <div style={{ display: 'flex', gap: 6, marginLeft: 12, flexShrink: 0 }}>
                        {!notif.read && (
                          <button onClick={() => markRead(notif.id)} title="Mark as read" style={{
                            background: 'var(--sky)', border: '1px solid var(--border)',
                            borderRadius: 6, padding: '3px 7px', cursor: 'pointer',
                            fontSize: 11, color: 'var(--slate)', display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                            <CheckCheck size={11} /> Read
                          </button>
                        )}
                        <button onClick={() => deleteNotif(notif.id)} style={{
                          background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-light)', padding: 4,
                        }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 3, lineHeight: 1.5 }}>{notif.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--slate-light)', marginTop: 5 }}>{notif.time}</div>
                  </div>
                  {!notif.read && (
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue)', flexShrink: 0, marginTop: 14 }} />
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Sent */}
        {tab === 'sent' && (
          <div>
            {/* Sent sub-header */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', background: 'var(--sky)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { label: `All (${sentItems.length})`, value: 'all' },
                  { label: `Auto-dispatched (${sentItems.filter(s => s.type === 'auto').length})`, value: 'auto' },
                  { label: `Reminders (${sentItems.filter(s => s.type === 'reminder').length})`, value: 'reminder' },
                  { label: `Manual (${sentItems.filter(s => s.type === 'manual').length})`, value: 'manual' },
                ].map(opt => (
                  <button key={opt.value} style={{ border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px', fontSize: 11.5, fontWeight: 500, background: 'var(--white)', color: 'var(--slate)', cursor: 'pointer' }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--slate)' }}>
                Auto-dispatched notifications are sent automatically when an ordinance is published.
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--sky)' }}>
                    {['Type', 'Recipient', 'Subject', 'Channels', 'Status', 'Sent'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                    <th style={{ padding: '10px 16px' }} />
                  </tr>
                </thead>
                <tbody>
                  {sentItems.map((s, i) => {
                    const typeCfg = {
                      auto:     { label: 'Auto',     bg: 'var(--emerald-light)', color: 'var(--emerald)' },
                      reminder: { label: 'Reminder', bg: 'var(--rose-light)',    color: 'var(--rose)'    },
                      manual:   { label: 'Manual',   bg: 'var(--sky)',           color: 'var(--slate)'   },
                    }[s.type];
                    return (
                      <tr key={s.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(235,241,255,0.3)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: typeCfg.bg, color: typeCfg.color, fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                            {typeCfg.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--navy)', whiteSpace: 'nowrap' }}>{s.to}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--slate)', maxWidth: 280 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12.5 }}>{s.subject}</div>
                          {s.ordinanceNumber && (
                            <div style={{ fontSize: 10.5, color: 'var(--blue)', marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{s.ordinanceNumber}</div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 5 }}>
                            {s.channels.email && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', color: 'var(--blue)', fontWeight: 500 }}>
                                <Mail size={9} /> Email
                              </span>
                            )}
                            {s.channels.sms && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, background: 'var(--emerald-light)', border: '1px solid #6ee7b7', borderRadius: 4, padding: '2px 6px', color: 'var(--emerald)', fontWeight: 500 }}>
                                <Smartphone size={9} /> SMS
                              </span>
                            )}
                            {s.channels.inApp && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10.5, background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', color: 'var(--slate)', fontWeight: 500 }}>
                                <Bell size={9} /> In-App
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: s.status === 'delivered' ? 'var(--emerald-light)' : s.status === 'pending' ? 'var(--amber-light)' : 'var(--rose-light)',
                            color: statusColors[s.status], fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20,
                          }}>
                            {s.status === 'delivered' ? '✓ Delivered' : s.status === 'pending' ? '⏳ Pending' : '✗ Failed'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--slate)', fontSize: 11.5, whiteSpace: 'nowrap' }}>{s.time}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              onClick={() => setPreviewSent(s)}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 9px', fontSize: 11.5, color: 'var(--navy)', cursor: 'pointer' }}
                            >
                              <Eye size={11} /> View
                            </button>
                            {s.status === 'failed' && (
                              <button style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--rose-light)', border: '1px solid var(--rose)', borderRadius: 6, padding: '5px 9px', fontSize: 11.5, color: 'var(--rose)', cursor: 'pointer', fontWeight: 600 }}>
                                Retry
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* Compose modal */}
      {composing && (
        <>
          <div onClick={() => setComposing(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.4)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 520, background: 'var(--white)', borderRadius: 14,
            boxShadow: '0 8px 40px rgba(15,31,61,0.2)', zIndex: 101, overflow: 'hidden',
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>Send Manual Notification</div>
                <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>For ordinance assignments, use the Publish flow — it auto-dispatches to all offices.</div>
              </div>
              <button onClick={() => setComposing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)' }}><X size={16} /></button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Recipient / Department', field: 'to', placeholder: 'e.g. All Departments or City Health Office' },
                { label: 'Subject', field: 'subject', placeholder: 'Notification subject…' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: 6 }}>{label}</label>
                  <input
                    value={(composeForm as any)[field]}
                    onChange={e => setComposeForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--navy)', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }}
                  />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: 6 }}>Message</label>
                <textarea
                  value={composeForm.message}
                  onChange={e => setComposeForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Write your notification message…"
                  rows={4}
                  style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--navy)', outline: 'none', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' as const }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: 6 }}>Channels</label>
                <select value={composeForm.channel} onChange={e => setComposeForm(f => ({ ...f, channel: e.target.value }))} style={{ border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--navy)', outline: 'none', width: '100%' }}>
                  <option value="in-app">In-App Only</option>
                  <option value="email">Email Only</option>
                  <option value="sms">SMS Only</option>
                  <option value="all">Email + SMS + In-App</option>
                </select>
                <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 5 }}>
                  Channels used depend on each department head's notification preferences.
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setComposing(false)} style={{ border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'var(--slate)', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={() => {
                  const newItem: SentItem = {
                    id: `s${Date.now()}`,
                    to: composeForm.to || 'All Departments',
                    subject: composeForm.subject || '(No subject)',
                    status: 'delivered',
                    time: 'Just now',
                    channels: {
                      email: composeForm.channel === 'email' || composeForm.channel === 'all',
                      sms: composeForm.channel === 'sms' || composeForm.channel === 'all',
                      inApp: composeForm.channel === 'in-app' || composeForm.channel === 'all',
                    },
                    type: 'manual',
                  };
                  setSentItems(prev => [newItem, ...prev]);
                  setComposeForm({ to: '', subject: '', message: '', channel: 'all' });
                  setComposing(false);
                  setTab('sent');
                }}
                style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Send size={13} /> Send Now
              </button>
            </div>
          </div>
        </>
      )}

      {/* Sent item preview modal */}
      {previewSent && (
        <>
          <div onClick={() => setPreviewSent(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.4)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 560, maxHeight: '80vh', background: 'var(--white)', borderRadius: 14,
            boxShadow: '0 8px 40px rgba(15,31,61,0.2)', zIndex: 101,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--sky)' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>Notification Details</div>
                <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>Sent to {previewSent.to} · {previewSent.time}</div>
              </div>
              <button onClick={() => setPreviewSent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)' }}><X size={16} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Meta row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Recipient', value: previewSent.to },
                  { label: 'Status', value: previewSent.status.charAt(0).toUpperCase() + previewSent.status.slice(1) },
                  { label: 'Sent', value: previewSent.time },
                ].map(f => (
                  <div key={f.label} style={{ background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10.5, color: 'var(--slate)', marginBottom: 3 }}>{f.label}</div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy)' }}>{f.value}</div>
                  </div>
                ))}
              </div>
              {/* Channels */}
              <div style={{ display: 'flex', gap: 8 }}>
                {previewSent.channels.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12.5, color: 'var(--blue)', fontWeight: 600 }}>
                    <Mail size={13} /> Email sent
                  </div>
                )}
                {previewSent.channels.sms && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--emerald-light)', border: '1px solid #6ee7b7', borderRadius: 8, fontSize: 12.5, color: 'var(--emerald)', fontWeight: 600 }}>
                    <Smartphone size={13} /> SMS sent
                  </div>
                )}
                {previewSent.channels.inApp && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12.5, color: 'var(--slate)', fontWeight: 600 }}>
                    <Bell size={13} /> In-App sent
                  </div>
                )}
              </div>
              {/* Subject + body preview */}
              <div style={{ background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Subject</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 14 }}>{previewSent.subject}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Message Body</div>
                <div style={{ fontSize: 12.5, color: 'var(--navy)', lineHeight: 1.7 }}>
                  {previewSent.type === 'auto'
                    ? `This is an official notification from the Office of the Sangguniang Panlungsod, City of Cebu.\n\nA new ordinance has been passed and your office has been designated as an implementing office. Please log in to OrdinanceFlow Cebu to acknowledge receipt and begin tracking your compliance.\n\nThis is an automated notification from OrdinanceFlow Cebu.`
                    : previewSent.type === 'reminder'
                    ? `This is a follow-up notice from the Office of the Sangguniang Panlungsod.\n\nYour office's compliance report is overdue. Please submit your report via OrdinanceFlow Cebu within 5 working days to avoid escalation to the City Council.\n\nThis is an automated reminder from OrdinanceFlow Cebu.`
                    : '(Manual notification — message body not stored in this demo)'}
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end', background: 'var(--sky)' }}>
              <button onClick={() => setPreviewSent(null)} style={{ border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'var(--slate)', cursor: 'pointer' }}>Close</button>
              <button style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Send size={13} /> Resend
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
