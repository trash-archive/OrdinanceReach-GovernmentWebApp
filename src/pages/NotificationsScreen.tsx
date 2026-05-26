 import { useState } from 'react';
import { Bell, CheckCheck, Trash2, Filter, Send, CheckCircle, AlertTriangle, Info, AlertCircle, X } from 'lucide-react';
import { notifications as mockNotifications } from '../data/mockData';
import type { Notification } from '../data/mockData';
import { Card } from '../components/UI';

interface NotificationsScreenProps {
  onNavigate: (s: any) => void;
}

type FilterType = 'all' | 'unread' | 'success' | 'warning' | 'info' | 'alert';

const sentHistory = [
  { id: 's1', to: 'Traffic Management Office', subject: 'New Ordinance: SP-2024-033', status: 'delivered', time: 'Today 10:35 AM', channel: 'Email + In-App' },
  { id: 's2', to: 'Environmental Management Bureau', subject: 'Compliance Reminder: SP-2024-038', status: 'delivered', time: 'Yesterday 2:00 PM', channel: 'In-App' },
  { id: 's3', to: 'All Departments', subject: 'New Ordinance: SP-2024-041', status: 'delivered', time: '2 days ago', channel: 'Email + SMS + In-App' },
  { id: 's4', to: 'Business Permits & Licensing', subject: 'Deadline Reminder: Report Due', status: 'pending', time: '2 days ago', channel: 'Email' },
  { id: 's5', to: 'City Health Office', subject: 'Amendment Notice: SP-2024-022', status: 'failed', time: '3 days ago', channel: 'SMS' },
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
  const [composeForm, setComposeForm] = useState({ to: '', subject: '', message: '', channel: 'in-app' });

  const unreadCount = notifs.filter(n => !n.read).length;

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
          { label: 'Total', value: notifs.length, color: 'var(--blue)' },
          { label: 'Unread', value: unreadCount, color: 'var(--rose)' },
          { label: 'Warnings', value: notifs.filter(n=>n.type==='warning').length, color: 'var(--amber)' },
          { label: 'Sent Today', value: sentHistory.filter(s=>s.time.includes('Today')).length, color: 'var(--emerald)' },
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--sky)' }}>
                  {['Recipient', 'Subject', 'Channel', 'Status', 'Sent'].map(h => (
                    <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                  <th style={{ padding: '10px 20px' }}></th>
                </tr>
              </thead>
              <tbody>
                {sentHistory.map((s, i) => (
                  <tr key={s.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(235,241,255,0.3)' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--navy)' }}>{s.to}</td>
                    <td style={{ padding: '12px 20px', color: 'var(--slate)' }}>{s.subject}</td>
                    <td style={{ padding: '12px 20px', color: 'var(--slate)', fontSize: 12 }}>{s.channel}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ background: s.status === 'delivered' ? 'var(--emerald-light)' : s.status === 'pending' ? 'var(--amber-light)' : 'var(--rose-light)', color: statusColors[s.status], fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20 }}>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', color: 'var(--slate)', fontSize: 12 }}>{s.time}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <button style={{ background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 10px', fontSize: 11.5, color: 'var(--navy)', cursor: 'pointer' }}>
                        Resend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Compose modal */}
      {composing && (
        <>
          <div onClick={() => setComposing(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.4)', zIndex: 100 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 500, background: 'var(--white)', borderRadius: 14,
            boxShadow: '0 8px 40px rgba(15,31,61,0.2)', zIndex: 101, overflow: 'hidden',
          }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>Send Notification</div>
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
                    style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--navy)', outline: 'none', fontFamily: 'inherit' }}
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
                  style={{ width: '100%', border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--navy)', outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: 6 }}>Channel</label>
                <select value={composeForm.channel} onChange={e => setComposeForm(f => ({ ...f, channel: e.target.value }))} style={{ border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--navy)', outline: 'none', width: '100%' }}>
                  <option value="in-app">In-App Only</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="all">Email + SMS + In-App</option>
                </select>
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setComposing(false)} style={{ border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'var(--slate)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setComposing(false); }} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Send size={13} /> Send Now
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
