import { useState } from 'react';
import { Building2, Search, Plus, ChevronDown, ChevronUp, FileText, X, Save } from 'lucide-react';
import { departments, ordinances } from '../data/mockData';
import type { Department } from '../data/mockData';
import { ComplianceBadge, Card, StatCard } from '../components/UI';

interface DepartmentsScreenProps {
  onNavigate: (s: any) => void;
}

type ComplianceFilter = 'all' | 'compliant' | 'in-progress' | 'delayed' | 'pending';

export default function DepartmentsScreen({ onNavigate: _onNavigate }: DepartmentsScreenProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ComplianceFilter>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<Department | null>(null);
  const [selectedOrds, setSelectedOrds] = useState<string[]>([]);

  const counts = {
    total: departments.length,
    compliant: departments.filter(d => d.compliance === 'compliant').length,
    delayed: departments.filter(d => d.compliance === 'delayed').length,
    pending: departments.filter(d => d.compliance === 'pending').length,
  };

  const filtered = departments.filter(d => {
    const matchQ = !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.head.toLowerCase().includes(search.toLowerCase());
    const matchF = filter === 'all' || d.compliance === filter;
    return matchQ && matchF;
  });

  function toggleExpand(id: string) { setExpanded(e => e === id ? null : id); }

  function openAssign(dept: Department) {
    const assigned = ordinances.filter(o => o.offices.includes(dept.name.split(' ').slice(0,2).join(' '))).map(o => o.id);
    setSelectedOrds(assigned);
    setAssigning(dept);
  }

  const filterOptions: { value: ComplianceFilter; label: string; color: string }[] = [
    { value: 'all', label: 'All Departments', color: 'var(--navy)' },
    { value: 'compliant', label: 'Compliant', color: 'var(--emerald)' },
    { value: 'in-progress', label: 'In Progress', color: 'var(--blue)' },
    { value: 'delayed', label: 'Delayed', color: 'var(--rose)' },
    { value: 'pending', label: 'Pending', color: 'var(--amber)' },
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatCard label="Total Departments" value={counts.total} sub="All implementing offices" accent="var(--blue)" icon={<Building2 size={16} />} />
        <StatCard label="Compliant" value={counts.compliant} sub="Fully implemented" accent="var(--emerald)" icon={<Building2 size={16} />} />
        <StatCard label="Delayed" value={counts.delayed} sub="Behind schedule" accent="var(--rose)" icon={<Building2 size={16} />} />
        <StatCard label="Not Started" value={counts.pending} sub="No progress yet" accent="var(--amber)" icon={<Building2 size={16} />} />
      </div>

      {/* Toolbar */}
      <Card style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--sky)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', flex: 1, minWidth: 200 }}>
          <Search size={14} color="var(--slate)" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search departments or heads…" style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: 'var(--navy)', flex: 1, padding: '9px 0' }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {filterOptions.map(opt => (
            <button key={opt.value} onClick={() => setFilter(opt.value)} style={{
              border: '1px solid var(--border)', borderRadius: 8, padding: '7px 13px',
              fontSize: 12, fontWeight: 500, cursor: 'pointer',
              background: filter === opt.value ? 'var(--navy)' : 'var(--white)',
              color: filter === opt.value ? '#fff' : 'var(--slate)', transition: 'all 0.15s',
            }}>
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Department Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(dept => {
          const progress = dept.assignedCount > 0 ? (dept.completedCount / dept.assignedCount) * 100 : 0;
          const isOpen = expanded === dept.id;
          const assignedOrds = ordinances.filter(o => o.offices.some(of => of.toLowerCase().includes(dept.name.split(' ')[0].toLowerCase())));

          return (
            <Card key={dept.id} style={{ overflow: 'hidden' }}>
              {/* Header row */}
              <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }} onClick={() => toggleExpand(dept.id)}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--sky)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={18} color="var(--blue)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginBottom: 2 }}>{dept.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate)' }}>Head: {dept.head}</div>
                </div>

                {/* Progress bar */}
                <div style={{ width: 160, flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: 'var(--slate)' }}>{dept.completedCount}/{dept.assignedCount} ordinances</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)' }}>{Math.round(progress)}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--sky)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, borderRadius: 3, transition: 'width 0.6s', background: progress === 100 ? 'var(--emerald)' : progress > 50 ? 'var(--blue)' : progress > 0 ? 'var(--amber)' : 'var(--rose)' }} />
                  </div>
                </div>

                <ComplianceBadge status={dept.compliance} />

                <div style={{ fontSize: 11, color: 'var(--slate-light)', whiteSpace: 'nowrap', marginLeft: 8 }}>
                  Updated {dept.lastUpdate}
                </div>

                <div style={{ marginLeft: 8 }}>
                  {isOpen ? <ChevronUp size={16} color="var(--slate)" /> : <ChevronDown size={16} color="var(--slate)" />}
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', background: 'var(--sky)', display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Assigned Ordinances ({assignedOrds.length})
                    </div>
                    <button onClick={() => openAssign(dept)} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: 'var(--blue)', color: '#fff', border: 'none',
                      borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                      <Plus size={12} /> Assign Ordinance
                    </button>
                  </div>
                  {assignedOrds.length === 0 ? (
                    <div style={{ color: 'var(--slate)', fontSize: 13, padding: '12px 0' }}>No ordinances assigned yet.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {assignedOrds.map(ord => (
                        <div key={ord.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <FileText size={14} color="var(--blue)" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ord.title}</div>
                            <div style={{ fontSize: 11, color: 'var(--slate)', fontFamily: "'DM Mono', monospace" }}>{ord.number}</div>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--slate)', background: 'var(--sky)', padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>{ord.category}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--slate)', background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)' }}>
            No departments match your search.
          </div>
        )}
      </div>

      {/* Assign Ordinance Modal */}
      {assigning && (
        <>
          <div onClick={() => setAssigning(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.4)', zIndex: 100 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 520, background: 'var(--white)', borderRadius: 14, boxShadow: '0 8px 40px rgba(15,31,61,0.2)', zIndex: 101, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>Assign Ordinances</div>
                <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>{assigning.name}</div>
              </div>
              <button onClick={() => setAssigning(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate)' }}><X size={16} /></button>
            </div>
            <div style={{ padding: 20, maxHeight: 380, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ordinances.filter(o => o.status !== 'repealed').map(ord => {
                const checked = selectedOrds.includes(ord.id);
                return (
                  <label key={ord.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', padding: '10px 12px', borderRadius: 8, border: `1px solid ${checked ? 'var(--blue)' : 'var(--border)'}`, background: checked ? 'var(--sky)' : 'var(--white)', transition: 'all 0.15s' }}>
                    <input type="checkbox" checked={checked} onChange={() => setSelectedOrds(s => s.includes(ord.id) ? s.filter(x => x !== ord.id) : [...s, ord.id])} style={{ accentColor: 'var(--blue)', marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{ord.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--slate)', fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{ord.number} · {ord.category}</div>
                    </div>
                  </label>
                );
              })}
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, justifyContent: 'flex-end', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--slate)', flex: 1 }}>{selectedOrds.length} selected</span>
              <button onClick={() => setAssigning(null)} style={{ border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '8px 16px', fontSize: 13, color: 'var(--slate)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => setAssigning(null)} style={{ background: 'var(--blue)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Save size={13} /> Save Assignments
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}