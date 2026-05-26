import { BarChart3, TrendingUp, Download, Calendar } from 'lucide-react';
import { departments, ordinances, CATEGORIES } from '../data/mockData';
import { Card, StatCard } from '../components/UI';

interface ReportsScreenProps {
  onNavigate: (s: any) => void;
}

// Build chart data
const categoryData = CATEGORIES.map(cat => ({
  cat,
  count: ordinances.filter(o => o.category === cat).length,
})).filter(d => d.count > 0).sort((a, b) => b.count - a.count);

const maxCat = Math.max(...categoryData.map(d => d.count));

const monthlyData = [
  { month: 'Aug', count: 1 },
  { month: 'Sep', count: 0 },
  { month: 'Oct', count: 2 },
  { month: 'Nov', count: 0 },
  { month: 'Dec', count: 2 },
  { month: 'Jan', count: 3 },
  { month: 'Feb', count: 1 },
  { month: 'Mar', count: 2 },
  { month: 'Apr', count: 2 },
];
const maxMonth = Math.max(...monthlyData.map(d => d.count));

const catColors: Record<string, string> = {
  Traffic: '#3B7BF8', Environment: '#10B981', Health: '#EF4444',
  Business: '#F59E0B', Safety: '#8B5CF6', Sanitation: '#06B6D4',
  Zoning: '#F97316', Education: '#EC4899',
};

export default function ReportsScreen({ onNavigate: _onNavigate }: ReportsScreenProps) {
  const totalOrdinances = ordinances.length;
  const activeOrdinances = ordinances.filter(o => o.status === 'active').length;
  const overallCompliance = Math.round(
    (departments.reduce((a, d) => a + d.completedCount, 0) /
      departments.reduce((a, d) => a + d.assignedCount, 0)) * 100
  );
  const delayedCount = departments.filter(d => d.compliance === 'delayed').length;

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <StatCard label="Total Ordinances" value={totalOrdinances} sub="In the repository" accent="var(--blue)" icon={<BarChart3 size={16} />} />
        <StatCard label="Active Ordinances" value={activeOrdinances} sub={`${Math.round((activeOrdinances/totalOrdinances)*100)}% of total`} accent="var(--emerald)" icon={<TrendingUp size={16} />} />
        <StatCard label="Overall Compliance" value={`${overallCompliance}%`} sub="Across all departments" accent="var(--blue)" icon={<BarChart3 size={16} />} />
        <StatCard label="Delayed Offices" value={delayedCount} sub="Requires attention" accent="var(--rose)" icon={<Calendar size={16} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>

        {/* Ordinances per month  Ebar chart */}
        <Card>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>Ordinances Passed Over Time</div>
              <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>Last 9 months</div>
            </div>
            <button style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--slate)', cursor: 'pointer' }}>
              <Download size={12} /> Export
            </button>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 160 }}>
              {monthlyData.map(d => (
                <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: d.count > 0 ? 'var(--navy)' : 'transparent' }}>{d.count}</div>
                  <div style={{
                    width: '100%', borderRadius: '4px 4px 0 0',
                    height: maxMonth > 0 ? `${(d.count / maxMonth) * 120}px` : '4px',
                    background: d.count > 0 ? 'var(--blue)' : 'var(--border)',
                    minHeight: 4, transition: 'height 0.4s',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {d.count > 0 && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30%', background: 'rgba(255,255,255,0.2)', borderRadius: '4px 4px 0 0' }} />
                    )}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--slate)', fontWeight: 500 }}>{d.month}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Ordinances by category */}
        <Card>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>By Category</div>
            <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>Distribution of ordinances</div>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {categoryData.map(d => (
              <div key={d.cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--navy)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: catColors[d.cat] || 'var(--blue)', display: 'inline-block' }} />
                    {d.cat}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>{d.count}</span>
                </div>
                <div style={{ height: 7, background: 'var(--sky)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(d.count / maxCat) * 100}%`, background: catColors[d.cat] || 'var(--blue)', borderRadius: 4, transition: 'width 0.6s' }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Compliance by department */}
      <Card>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>Department Compliance Breakdown</div>
            <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>Completion rate per implementing office</div>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--border)', background: 'var(--white)', borderRadius: 8, padding: '6px 12px', fontSize: 12, color: 'var(--slate)', cursor: 'pointer' }}>
            <Download size={12} /> Export Report
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--sky)' }}>
                {['Department', 'Head', 'Assigned', 'Completed', 'Progress', 'Rate', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.sort((a, b) => (b.completedCount / b.assignedCount) - (a.completedCount / a.assignedCount)).map((dept, i) => {
                const rate = dept.assignedCount > 0 ? Math.round((dept.completedCount / dept.assignedCount) * 100) : 0;
                const complianceColor = dept.compliance === 'compliant' ? 'var(--emerald)' : dept.compliance === 'delayed' ? 'var(--rose)' : dept.compliance === 'in-progress' ? 'var(--blue)' : 'var(--amber)';
                return (
                  <tr key={dept.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(235,241,255,0.3)' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 600, color: 'var(--navy)' }}>{dept.name}</td>
                    <td style={{ padding: '12px 20px', color: 'var(--slate)' }}>{dept.head}</td>
                    <td style={{ padding: '12px 20px', fontFamily: "'DM Mono', monospace", color: 'var(--navy)', textAlign: 'center' }}>{dept.assignedCount}</td>
                    <td style={{ padding: '12px 20px', fontFamily: "'DM Mono', monospace", color: 'var(--navy)', textAlign: 'center' }}>{dept.completedCount}</td>
                    <td style={{ padding: '12px 20px', minWidth: 120 }}>
                      <div style={{ height: 7, background: 'var(--sky)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${rate}%`, background: complianceColor, borderRadius: 4, transition: 'width 0.5s' }} />
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px', fontWeight: 700, color: complianceColor, fontFamily: "'DM Mono', monospace" }}>{rate}%</td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: dept.compliance === 'compliant' ? 'var(--emerald-light)' : dept.compliance === 'delayed' ? 'var(--rose-light)' : dept.compliance === 'in-progress' ? 'var(--sky)' : 'var(--amber-light)', color: complianceColor }}>
                        {dept.compliance === 'in-progress' ? 'In Progress' : dept.compliance.charAt(0).toUpperCase() + dept.compliance.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Totals row */}
        <div style={{ padding: '14px 20px', borderTop: '2px solid var(--border)', display: 'flex', gap: 30, background: 'var(--sky)' }}>
          <div style={{ fontSize: 12, color: 'var(--slate)' }}>
            <span style={{ fontWeight: 700, color: 'var(--navy)' }}>Total Assigned: </span>
            {departments.reduce((a, d) => a + d.assignedCount, 0)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--slate)' }}>
            <span style={{ fontWeight: 700, color: 'var(--navy)' }}>Total Completed: </span>
            {departments.reduce((a, d) => a + d.completedCount, 0)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--slate)' }}>
            <span style={{ fontWeight: 700, color: 'var(--navy)' }}>Overall Rate: </span>
            <span style={{ color: 'var(--emerald)', fontWeight: 700 }}>{overallCompliance}%</span>
          </div>
        </div>
      </Card>

      {/* Status distribution donut-style summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Active', count: ordinances.filter(o=>o.status==='active').length, total: totalOrdinances, color: 'var(--emerald)' },
          { label: 'Draft', count: ordinances.filter(o=>o.status==='draft').length, total: totalOrdinances, color: 'var(--slate)' },
          { label: 'Amended', count: ordinances.filter(o=>o.status==='amended').length, total: totalOrdinances, color: 'var(--amber)' },
          { label: 'Repealed', count: ordinances.filter(o=>o.status==='repealed').length, total: totalOrdinances, color: 'var(--rose)' },
        ].map(s => (
          <Card key={s.label} style={{ padding: '20px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: s.color }} />
            <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--navy)', lineHeight: 1 }}>{s.count}</div>
            <div style={{ fontSize: 12, color: 'var(--slate)', margin: '6px 0 10px', fontWeight: 500 }}>{s.label}</div>
            <div style={{ height: 6, background: 'var(--sky)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${s.total > 0 ? (s.count/s.total)*100 : 0}%`, background: s.color, borderRadius: 3 }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--slate-light)', marginTop: 6 }}>
              {s.total > 0 ? Math.round((s.count/s.total)*100) : 0}% of total
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}