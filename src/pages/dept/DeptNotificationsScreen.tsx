import { useState } from 'react';
import { Bell, CheckCheck, FileText, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import type { DeptNotification } from '../../data/deptHeadData';

interface DeptNotificationsScreenProps {
  notifications: DeptNotification[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onNavigate: (s: any) => void;
}

const typeConfig = {
  new_ordinance:      { icon: <FileText size={15} />,      bg: 'rgba(16,185,129,0.1)', color: '#10B981', label: 'New Assignment'    },
  reminder:           { icon: <Clock size={15} />,          bg: '#FEF3C7',              color: '#B45309', label: 'Reminder'          },
  overdue:            { icon: <AlertTriangle size={15} />,  bg: '#FEE2E2',              color: '#EF4444', label: 'Overdue'           },
  acknowledged:       { icon: <CheckCircle size={15} />,    bg: '#D1FAE5',              color: '#059669', label: 'Acknowledged'      },
  extension_approved: { icon: <CheckCircle size={15} />,    bg: '#D1FAE5',              color: '#059669', label: 'Extension Approved' },
  extension_denied:   { icon: <AlertTriangle size={15} />,  bg: '#FEE2E2',              color: '#EF4444', label: 'Extension Denied'  },
  escalated:          { icon: <AlertTriangle size={15} />,  bg: '#ede9fe',              color: '#7c3aed', label: 'Escalated'         },
};

export default function DeptNotificationsScreen({ notifications, onMarkAllRead, onMarkRead, onNavigate }: DeptNotificationsScreenProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'new_ordinance' | 'reminder'>('all');
  const unread = notifications.filter(n => !n.read).length;

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Unread banner */}
      {unread > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #0F2027, #1a3a4a)',
          borderRadius: 12, padding: '16px 22px',
          display: 'flex', alignItems: 'center', gap: 16, color: '#fff',
        }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Bell size={20} color="#10B981" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14, fontFamily: 'Georgia, serif' }}>
              You have {unread} unread notification{unread > 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
              Including {notifications.filter(n => !n.read && n.type === 'new_ordinance').length} new ordinance assignment{notifications.filter(n => !n.read && n.type === 'new_ordinance').length !== 1 ? 's' : ''}
            </div>
          </div>
          <button
            onClick={onMarkAllRead}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            <CheckCheck size={13} /> Mark all read
          </button>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,31,61,0.07)' }}>
        <div style={{ padding: '0 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 0 }}>
          {[
            { value: 'all', label: `All (${notifications.length})` },
            { value: 'unread', label: `Unread (${unread})` },
            { value: 'new_ordinance', label: 'New Assignments' },
            { value: 'reminder', label: 'Reminders' },
          ].map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value as any)}
              style={{
                padding: '14px 16px', fontSize: 13,
                fontWeight: filter === opt.value ? 700 : 500,
                color: filter === opt.value ? '#10B981' : '#64748B',
                background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: filter === opt.value ? '2px solid #10B981' : '2px solid transparent',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <div>
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8' }}>
              <Bell size={32} color="#E2E8F0" style={{ marginBottom: 10 }} />
              <div>No notifications here.</div>
            </div>
          ) : filtered.map((notif, i) => {
            const tc = typeConfig[notif.type];
            return (
              <div
                key={notif.id}
                style={{
                  padding: '16px 20px',
                  borderBottom: i < filtered.length - 1 ? '1px solid #E2E8F0' : 'none',
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                  background: !notif.read ? 'rgba(16,185,129,0.02)' : 'transparent',
                  borderLeft: !notif.read ? '3px solid #10B981' : '3px solid transparent',
                  transition: 'background 0.15s',
                  cursor: 'pointer',
                }}
                onClick={() => { onMarkRead(notif.id); if (notif.ordinanceNumber) onNavigate('dh-ordinances'); }}
              >
                {/* Icon */}
                <div style={{ width: 38, height: 38, borderRadius: 10, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: tc.color }}>
                  {tc.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 13.5, fontWeight: notif.read ? 500 : 700, color: '#0F1F3D' }}>{notif.title}</span>
                    <span style={{ background: tc.bg, color: tc.color, fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 10, whiteSpace: 'nowrap' }}>{tc.label}</span>
                    {!notif.read && (
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', flexShrink: 0, marginLeft: 'auto' }} />
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.6 }}>{notif.message}</div>
                  {notif.ordinanceNumber && (
                    <div style={{ marginTop: 8 }}>
                      <span style={{ fontSize: 11, background: '#EBF1FF', color: '#3B7BF8', border: '1px solid #dbeafe', borderRadius: 4, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <FileText size={10} /> {notif.ordinanceNumber} — Click to view
                      </span>
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>{notif.time}</div>
                </div>

                {!notif.read && (
                  <button
                    onClick={e => { e.stopPropagation(); onMarkRead(notif.id); }}
                    style={{ background: '#EBF1FF', border: '1px solid #dbeafe', borderRadius: 6, padding: '4px 9px', fontSize: 11, color: '#3B7BF8', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}
                  >
                    <CheckCheck size={11} /> Read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}