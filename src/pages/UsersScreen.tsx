import { useState } from 'react';
import { Users, Search, Plus, Edit2, Trash2, Shield, X, Save } from 'lucide-react';
import { Card, StatCard } from '../components/UI';
import type { UserRole } from '../data/mockData';

interface UsersScreenProps {
  onNavigate: (s: any) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  office: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar: string;
}

const USERS: User[] = [
  { id: '1', name: 'Maria Santos', email: 'm.santos@cebu.gov.ph', role: 'encoder', office: 'City Council Office', status: 'active', lastLogin: 'Today 10:32 AM', avatar: 'MS' },
  { id: '2', name: 'Luis Reyes', email: 'l.reyes@cebu.gov.ph', role: 'encoder', office: 'City Council Office', status: 'active', lastLogin: 'Today 9:15 AM', avatar: 'LR' },
  { id: '3', name: 'Ana Cruz', email: 'a.cruz@cebu.gov.ph', role: 'records', office: 'City Records Office', status: 'active', lastLogin: 'Yesterday', avatar: 'AC' },
  { id: '4', name: 'Ramon Villanueva', email: 'r.villanueva@cebu.gov.ph', role: 'department_head', office: 'Traffic Management Office', status: 'active', lastLogin: '2 days ago', avatar: 'RV' },
  { id: '5', name: 'Carla Mendoza', email: 'c.mendoza@cebu.gov.ph', role: 'department_head', office: 'Environmental Management Bureau', status: 'active', lastLogin: '3 days ago', avatar: 'CM' },
  { id: '6', name: 'Patricia Lim', email: 'p.lim@cebu.gov.ph', role: 'department_head', office: 'City Health Office', status: 'active', lastLogin: '1 day ago', avatar: 'PL' },
  { id: '7', name: 'Joel Tabada', email: 'j.tabada@cebu.gov.ph', role: 'department_head', office: 'Business Permits & Licensing', status: 'inactive', lastLogin: '10 days ago', avatar: 'JT' },
  { id: '8', name: 'Felix Abella', email: 'f.abella@cebu.gov.ph', role: 'enforcement', office: 'Disaster Risk Reduction', status: 'active', lastLogin: '1 day ago', avatar: 'FA' },
  { id: '9', name: 'Juan Dela Vega', email: 'j.delavega@cebu.gov.ph', role: 'barangay', office: 'Barangay Lahug', status: 'active', lastLogin: '5 days ago', avatar: 'JD' },
  { id: '10', name: 'System Admin', email: 'admin@cebu.gov.ph', role: 'admin', office: 'IT Department', status: 'active', lastLogin: 'Today 8:00 AM', avatar: 'SA' },
];

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string }> = {
  admin:           { label: 'System Admin', color: 'var(--rose)', bg: 'var(--rose-light)' },
  encoder:         { label: 'Encoder', color: 'var(--blue)', bg: 'var(--sky)' },
  records:         { label: 'Records Staff', color: '#8B5CF6', bg: '#F5F3FF' },
  department_head: { label: 'Dept. Head', color: 'var(--emerald)', bg: 'var(--emerald-light)' },
  barangay:        { label: 'Barangay', color: '#F97316', bg: '#FFF7ED' },
  enforcement:     { label: 'Enforcement', color: '#B45309', bg: 'var(--amber-light)' },
};

const ROLES: UserRole[] = ['admin', 'encoder', 'records', 'department_head', 'barangay', 'enforcement'];

const EMPTY_USER: Omit<User, 'id' | 'lastLogin' | 'avatar'> = {
  name: '', email: '', role: 'encoder', office: '', status: 'active',
};

export default function UsersScreen({ onNavigate: _onNavigate }: UsersScreenProps) {
  const [users, setUsers] = useState<User[]>(USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ ...EMPTY_USER });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = users.filter(u => {
    const matchQ = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.office.toLowerCase().includes(search.toLowerCase());
    const matchR = roleFilter === 'all' || u.role === roleFilter;
    return matchQ && matchR;
  });

  function openAdd() { setForm({ ...EMPTY_USER }); setModal('add'); }
  function openEdit(u: User) { setEditing(u); setForm({ name: u.name, email: u.email, role: u.role, office: u.office, status: u.status }); setModal('edit'); }
  function closeModal() { setModal(null); setEditing(null); }

  function handleSave() {
    if (modal === 'add') {
      const newUser: User = { ...form, id: String(Date.now()), lastLogin: 'Never', avatar: form.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() };
      setUsers(us => [...us, newUser]);
    } else if (modal === 'edit' && editing) {
      setUsers(us => us.map(u => u.id === editing.id ? { ...u, ...form } : u));
    }
    closeModal();
  }

  function handleDelete(id: string) {
    setUsers(us => us.filter(u => u.id !== id));
    setDeleteConfirm(null);
  }

  function toggleStatus(id: string) {
    setUsers(us => us.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  }

  const counts = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin').length,
    deptHeads: users.filter(u => u.role === 'department_head').length,
  };

  const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '9px 12px', fontSize: 13, color: 'var(--navy)', outline: 'none', fontFamily: 'inherit' };
  const labelStyle: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--navy)', display: 'block', marginBottom: 6 };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatCard label="Total Users" value={counts.total} sub="All system users" accent="var(--blue)" icon={<Users size={16} />} />
        <StatCard label="Active Users" value={counts.active} sub={`${users.length - counts.active} inactive`} accent="var(--emerald)" icon={<Users size={16} />} />
        <StatCard label="Admins" value={counts.admins} sub="Full system access" accent="var(--rose)" icon={<Shield size={16} />} />
        <StatCard label="Dept. Heads" value={counts.deptHeads} sub="Office leads" accent="var(--amber)" icon={<Users size={16} />} />
      </div>

      {/* Toolbar */}
      <Card style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', flex: 1, minWidth: 200 }}>
          <Search size={14} color="var(--slate)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or office…" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--navy)', flex: 1, padding: '9px 0' }} />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value as any)} style={{ border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '8px 12px', fontSize: 12.5, color: 'var(--slate)', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
        </select>
        <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <Plus size={14} /> Add User
        </button>
      </Card>

      {/* Users Table */}
      <Card>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>System Users</div>
          <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>Showing {filtered.length} of {users.length} users</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--sky)' }}>
                {['User', 'Role', 'Office', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => {
                const roleConf = ROLE_CONFIG[user.role];
                return (
                  <tr key={user.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(235,241,255,0.3)', transition: 'background 0.1s' }}>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--blue), var(--navy))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {user.avatar}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{user.name}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--slate)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ background: roleConf.bg, color: roleConf.color, fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20 }}>
                        {roleConf.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', color: 'var(--slate)', fontSize: 12.5 }}>{user.office}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <button onClick={() => toggleStatus(user.id)} style={{ background: user.status === 'active' ? 'var(--emerald-light)' : 'var(--rose-light)', color: user.status === 'active' ? 'var(--emerald)' : 'var(--rose)', border: 'none', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        {user.status === 'active' ? '◁EActive' : '◁EInactive'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 20px', color: 'var(--slate)', fontSize: 12 }}>{user.lastLogin}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(user)} style={{ background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: 'var(--navy)' }}>
                          <Edit2 size={11} /> Edit
                        </button>
                        <button onClick={() => setDeleteConfirm(user.id)} disabled={user.role === 'admin'} style={{ background: user.role === 'admin' ? 'transparent' : 'var(--sky)', border: '1px solid var(--border)', borderRadius: 6, padding: '5px 9px', cursor: user.role === 'admin' ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: user.role === 'admin' ? 'var(--border)' : 'var(--slate)', opacity: user.role === 'admin' ? 0.4 : 1 }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      {modal && (
        <>
          <div onClick={closeModal} style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.4)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 480, background: 'var(--white)', borderRadius: 14, boxShadow: '0 8px 40px rgba(15,31,61,0.2)', zIndex: 101, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{modal === 'add' ? 'Add New User' : 'Edit User'}</div>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)' }}><X size={16} /></button>
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="First Last" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="user@cebu.gov.ph" style={inputStyle} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Role</label>
                  <select value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value as UserRole}))} style={inputStyle}>
                    {ROLES.map(r => <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value as any}))} style={inputStyle}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Office / Department</label>
                <input value={form.office} onChange={e => setForm(f=>({...f,office:e.target.value}))} placeholder="e.g. City Health Office" style={inputStyle} />
              </div>
              {modal === 'add' && (
                <div style={{ background: 'var(--sky)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--slate)', lineHeight: 1.5 }}>
                  A temporary password will be emailed to the user on account creation.
                </div>
              )}
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={closeModal} style={{ border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'var(--slate)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={13} /> {modal === 'add' ? 'Create User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <>
          <div onClick={() => setDeleteConfirm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.4)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 380, background: 'var(--white)', borderRadius: 14, boxShadow: '0 8px 40px rgba(15,31,61,0.2)', zIndex: 101, padding: 28, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--rose-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <Trash2 size={20} color="var(--rose)" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Remove User?</div>
            <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.5, marginBottom: 20 }}>This will permanently remove the user's access to the system. This action cannot be undone.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '9px', fontSize: 13, color: 'var(--slate)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, background: 'var(--rose)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Remove User</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}