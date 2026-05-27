import { User, Mail, Phone, Building2, Shield, Key } from 'lucide-react';
import type { DeptHeadUser } from '../../data/deptHeadData';
import { Card } from '../../components/UI';

interface DeptProfileScreenProps {
  user: DeptHeadUser;
}

export default function DeptProfileScreen({ user }: DeptProfileScreenProps) {
  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 700 }}>

      {/* Profile header */}
      <div style={{
        background: 'linear-gradient(135deg, #0F2027 0%, #1a3a4a 60%, #0d3d2e 100%)',
        borderRadius: 14, padding: '28px 32px', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 20, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -30, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(16,185,129,0.07)' }} />
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #065f46)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
          {user.avatar}
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Georgia, serif', marginBottom: 4 }}>
            {user.title}. {user.name}
          </div>
          <div style={{ fontSize: 13, opacity: 0.65, marginBottom: 8 }}>{user.office}</div>
          <span style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
            Department Head
          </span>
        </div>
      </div>

      {/* Info cards */}
      <Card style={{ padding: '20px 24px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 16 }}>Account Information</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { icon: <User size={15} />, label: 'Full Name', value: `${user.title}. ${user.name}` },
            { icon: <Mail size={15} />, label: 'Email', value: user.email },
            { icon: <Phone size={15} />, label: 'Phone', value: user.phone },
            { icon: <Building2 size={15} />, label: 'Office', value: user.office },
            { icon: <Shield size={15} />, label: 'System Role', value: 'Department Head' },
          ].map(f => (
            <div key={f.label} style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '10px 14px', background: '#F6F8FC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
              <span style={{ color: '#64748B', flexShrink: 0 }}>{f.icon}</span>
              <div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#0F1F3D' }}>{f.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ padding: '20px 24px' }}>
        <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748B', marginBottom: 16 }}>Security</div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F6F8FC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '12px 16px', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
          <Key size={15} color="#64748B" />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F1F3D' }}>Change Password</div>
            <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 1 }}>Last changed 30 days ago</div>
          </div>
        </button>
      </Card>
    </div>
  );
}