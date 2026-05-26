import { useState, useMemo } from 'react';
import {
  Search, Plus, Download, LayoutGrid, List,
  FileText, ChevronUp, ChevronDown, X,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
} from 'lucide-react';
import { ordinances, CATEGORIES } from '../data/mockData';
import type { Ordinance, OrdStatus } from '../data/mockData';
import { StatusBadge, CategoryBadge, StatCard, Card } from '../components/UI';

interface OrdinanceListScreenProps {
  onNavigate: (s: any) => void;
}

const PER_PAGE = 8;

type SortField = 'number' | 'title' | 'category' | 'status' | 'datePassed' | 'author';

export default function OrdinanceListScreen({ onNavigate }: OrdinanceListScreenProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrdStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('datePassed');
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [page, setPage] = useState(1);
  const [isGrid, setIsGrid] = useState(false);
  const [selected, setSelected] = useState<Ordinance | null>(null);

  // --- Counts ---
  const counts = useMemo(() => ({
    active:   ordinances.filter(o => o.status === 'active').length,
    draft:    ordinances.filter(o => o.status === 'draft').length,
    amended:  ordinances.filter(o => o.status === 'amended').length,
    repealed: ordinances.filter(o => o.status === 'repealed').length,
    total:    ordinances.length,
  }), []);

  // --- Filter + Sort ---
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return ordinances
      .filter(o => {
        const matchQ = !q || o.title.toLowerCase().includes(q) || o.number.toLowerCase().includes(q) || o.category.toLowerCase().includes(q);
        const matchS = statusFilter === 'all' || o.status === statusFilter;
        const matchC = categoryFilter === 'all' || o.category === categoryFilter;
        return matchQ && matchS && matchC;
      })
      .sort((a, b) => {
        const av = (a[sortField] ?? '') as string;
        const bv = (b[sortField] ?? '') as string;
        return av.localeCompare(bv) * sortDir;
      });
  }, [search, statusFilter, categoryFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageSlice = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir(d => (d === 1 ? -1 : 1));
    else { setSortField(field); setSortDir(1); }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <span style={{ opacity: 0.3, marginLeft: 3 }}>↕</span>;
    return sortDir === 1
      ? <ChevronUp size={12} style={{ marginLeft: 3, verticalAlign: 'middle' }} />
      : <ChevronDown size={12} style={{ marginLeft: 3, verticalAlign: 'middle' }} />;
  }

  function exportCSV() {
    const header = ['Number', 'Title', 'Category', 'Status', 'Date Passed', 'Author'];
    const rows = filtered.map(o =>
      [o.number, `"${o.title}"`, o.category, o.status, o.datePassed, o.author].join(',')
    );
    const csv = [header.join(','), ...rows].join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'ordinances.csv';
    a.click();
  }

  // Reset page on filter change
  function handleSearch(v: string) { setSearch(v); setPage(1); }
  function handleStatus(v: OrdStatus | 'all') { setStatusFilter(v); setPage(1); }
  function handleCategory(v: string) { setCategoryFilter(v); setPage(1); }

  const statusOptions: { value: OrdStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
    { value: 'amended', label: 'Amended' },
    { value: 'repealed', label: 'Repealed' },
  ];

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
        <StatCard label="Active" value={counts.active} sub="Published & enforced" accent="var(--emerald)" icon={<FileText size={16} />} />
        <StatCard label="Drafts" value={counts.draft} sub="Awaiting publication" accent="var(--slate)" icon={<FileText size={16} />} />
        <StatCard label="Amended" value={counts.amended} sub="Updated versions" accent="var(--amber)" icon={<FileText size={16} />} />
        <StatCard label="Repealed" value={counts.repealed} sub="No longer in effect" accent="var(--rose)" icon={<FileText size={16} />} />
        <StatCard label="Total" value={counts.total} sub="All ordinances" accent="var(--blue)" icon={<FileText size={16} />} />
      </div>

      {/* ── Toolbar ── */}
      <Card style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--sky)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '0 12px', flex: 1, minWidth: 220,
        }}>
          <Search size={14} color="var(--slate)" />
          <input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search by title, number, or category…"
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontSize: 13, color: 'var(--navy)', flex: 1, padding: '9px 0',
            }}
          />
        </div>

        {/* Status filters */}
        <div style={{ display: 'flex', gap: 6 }}>
          {statusOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleStatus(opt.value)}
              style={{
                border: '1px solid var(--border)',
                background: statusFilter === opt.value ? 'var(--navy)' : 'var(--white)',
                color: statusFilter === opt.value ? '#fff' : 'var(--slate)',
                borderRadius: 8, padding: '7px 13px', fontSize: 12.5,
                fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Category dropdown */}
        <select
          value={categoryFilter}
          onChange={e => handleCategory(e.target.value)}
          style={{
            border: '1px solid var(--border)', background: 'var(--white)',
            borderRadius: 8, padding: '8px 12px', fontSize: 12.5,
            color: 'var(--slate)', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>

        {/* Actions */}
        <button
          onClick={exportCSV}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            border: '1px solid var(--border)', background: 'var(--white)',
            borderRadius: 8, padding: '7px 13px', fontSize: 12.5,
            color: 'var(--slate)', cursor: 'pointer', fontWeight: 500,
          }}
        >
          <Download size={13} /> Export CSV
        </button>

        <button
          onClick={() => setIsGrid(g => !g)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            border: '1px solid var(--border)', background: 'var(--white)',
            borderRadius: 8, padding: '7px 13px', fontSize: 12.5,
            color: 'var(--slate)', cursor: 'pointer', fontWeight: 500,
          }}
        >
          {isGrid ? <List size={13} /> : <LayoutGrid size={13} />}
          {isGrid ? 'List View' : 'Grid View'}
        </button>

        <button
          onClick={() => onNavigate('encode')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--blue)', color: '#fff', border: 'none',
            borderRadius: 8, padding: '8px 16px', fontSize: 13,
            fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          <Plus size={14} /> New Ordinance
        </button>
      </Card>

      {/* ── Table / Grid ── */}
      <Card>
        {/* Table header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>Ordinance Repository</div>
            <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>
              Showing {filtered.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length} records
            </div>
          </div>
        </div>

        {/* ── LIST VIEW ── */}
        {!isGrid && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--sky)' }}>
                  {(
                    [
                      { label: 'Ord. No.', field: 'number' },
                      { label: 'Title / Offices', field: 'title' },
                      { label: 'Category', field: 'category' },
                      { label: 'Status', field: 'status' },
                      { label: 'Date Passed', field: 'datePassed' },
                      { label: 'Author', field: 'author' },
                    ] as { label: string; field: SortField }[]
                  ).map(col => (
                    <th
                      key={col.field}
                      onClick={() => handleSort(col.field)}
                      style={{
                        padding: '10px 18px', textAlign: 'left',
                        fontSize: 11, fontWeight: 600, color: 'var(--slate)',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none',
                      }}
                    >
                      {col.label}<SortIcon field={col.field} />
                    </th>
                  ))}
                  <th style={{ padding: '10px 18px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageSlice.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--slate)' }}>
                      No ordinances match your filters.
                    </td>
                  </tr>
                ) : pageSlice.map((ord, i) => (
                  <TableRow key={ord.id} ord={ord} i={i} onSelect={setSelected} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {isGrid && (
          <div style={{ padding: 20, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {pageSlice.length === 0
              ? <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--slate)', padding: 40 }}>No ordinances match your filters.</div>
              : pageSlice.map(ord => (
                <GridCard key={ord.id} ord={ord} onSelect={setSelected} />
              ))
            }
          </div>
        )}

        {/* ── Pagination ── */}
        <div style={{
          padding: '12px 20px', borderTop: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: 12, color: 'var(--slate)' }}>
            Page {safePage} of {totalPages}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { icon: <ChevronsLeft size={13} />, action: () => setPage(1), disabled: safePage === 1 },
              { icon: <ChevronLeft size={13} />, action: () => setPage(p => Math.max(1, p - 1)), disabled: safePage === 1 },
              { icon: <ChevronRight size={13} />, action: () => setPage(p => Math.min(totalPages, p + 1)), disabled: safePage === totalPages },
              { icon: <ChevronsRight size={13} />, action: () => setPage(totalPages), disabled: safePage === totalPages },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                disabled={btn.disabled}
                style={{
                  width: 30, height: 30, border: '1px solid var(--border)',
                  background: 'var(--white)', borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: btn.disabled ? 'var(--border)' : 'var(--slate)',
                  cursor: btn.disabled ? 'default' : 'pointer',
                  transition: 'all 0.1s',
                }}
              >
                {btn.icon}
              </button>
            ))}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 30, height: 30, border: '1px solid var(--border)',
                  background: p === safePage ? 'var(--navy)' : 'var(--white)',
                  color: p === safePage ? '#fff' : 'var(--slate)',
                  borderRadius: 6, fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.1s',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Detail Panel ── */}
      {selected && <DetailPanel ord={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

function TableRow({ ord, i, onSelect }: { ord: Ordinance; i: number; onSelect: (o: Ordinance) => void }) {
  return (
    <tr
      onClick={() => onSelect(ord)}
      style={{ borderTop: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(235,241,255,0.5)')}
      onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(235,241,255,0.2)')}
    >
      <td style={{ padding: '13px 18px', whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11.5, color: 'var(--slate)', fontWeight: 600 }}>
          {ord.number}
        </span>
      </td>
      <td style={{ padding: '13px 18px', maxWidth: 300 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ord.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--slate)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ord.offices.length ? ord.offices.join(' · ') : <em style={{ color: 'var(--slate-light)' }}>No offices assigned</em>}
        </div>
      </td>
      <td style={{ padding: '13px 18px' }}>
        <CategoryBadge category={ord.category} />
      </td>
      <td style={{ padding: '13px 18px' }}>
        <StatusBadge status={ord.status} />
      </td>
      <td style={{ padding: '13px 18px', color: 'var(--slate)', fontSize: 12, whiteSpace: 'nowrap' }}>
        {ord.datePassed}
      </td>
      <td style={{ padding: '13px 18px', color: 'var(--slate)', fontSize: 12, whiteSpace: 'nowrap' }}>
        {ord.author}
      </td>
      <td style={{ padding: '13px 18px', textAlign: 'right' }}>
        <RowActions ord={ord} onSelect={onSelect} />
      </td>
    </tr>
  );
}

function RowActions({ ord, onSelect }: { ord: Ordinance; onSelect: (o: Ordinance) => void }) {
  const btn = (label: string, onClick: () => void, danger = false) => (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        border: '1px solid var(--border)', background: 'var(--sky)',
        borderRadius: 6, padding: '5px 10px', fontSize: 11.5,
        color: 'var(--navy)', cursor: 'pointer', fontWeight: 500,
        transition: 'all 0.1s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger ? 'var(--rose)' : 'var(--blue)';
        e.currentTarget.style.color = '#fff';
        e.currentTarget.style.borderColor = danger ? 'var(--rose)' : 'var(--blue)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--sky)';
        e.currentTarget.style.color = 'var(--navy)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
      {btn('View', () => onSelect(ord))}
      {btn('Edit', () => alert(`Edit: ${ord.number}`))}
      {btn('Archive', () => alert(`Archive: ${ord.number}`), true)}
    </div>
  );
}

function GridCard({ ord, onSelect }: { ord: Ordinance; onSelect: (o: Ordinance) => void }) {
  const catColors: Record<string, string> = {
    Traffic: '#EFF6FF', Environment: '#F0FDF4', Health: '#FFF1F2',
    Business: '#FFFBEB', Safety: '#F5F3FF', Sanitation: '#E0F7FA',
    Zoning: '#FFF3E0', Education: '#E8F5E9',
  };
  return (
    <div
      onClick={() => onSelect(ord)}
      style={{
        background: 'var(--white)', border: '1px solid var(--border)',
        borderRadius: 10, padding: 16, cursor: 'pointer',
        transition: 'box-shadow 0.15s, transform 0.15s',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(15,31,61,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ background: catColors[ord.category] || 'var(--sky)', color: 'var(--navy)', fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)' }}>
          {ord.category}
        </span>
        <StatusBadge status={ord.status} />
      </div>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'var(--slate)' }}>{ord.number}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', lineHeight: 1.4 }}>{ord.title}</div>
      <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 'auto' }}>
        {ord.datePassed} · {ord.author}
      </div>
    </div>
  );
}

function DetailPanel({ ord, onClose }: { ord: Ordinance; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(15,31,61,0.35)',
          zIndex: 100, animation: 'fadeIn 0.2s',
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 420,
        background: 'var(--white)', boxShadow: '-4px 0 24px rgba(15,31,61,0.14)',
        zIndex: 101, display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.25s ease',
      }}>
        {/* Top */}
        <div style={{
          padding: 24, borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%)',
          color: '#fff',
        }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff',
                width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>
          </div>
          <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>
            {ord.number}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.35, marginBottom: 12 }}>
            {ord.title}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <StatusBadge status={ord.status} />
            <span style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 4 }}>
              {ord.category}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Section title="Summary">
            <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.7 }}>{ord.summary}</div>
          </Section>

          <Section title="Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Field label="Date Passed" value={ord.datePassed} />
              <Field label="Author / Encoder" value={ord.author} />
              <Field label="Implementing Offices" value={ord.offices.length ? ord.offices.join(', ') : 'None assigned'} />
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', background: 'var(--sky)', color: 'var(--navy)',
              border: '1px solid var(--border)', transition: 'background 0.15s',
            }}
          >
            Edit Metadata
          </button>
          <button
            style={{
              flex: 1, padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', background: 'var(--blue)', color: '#fff',
              border: 'none', transition: 'background 0.15s',
            }}
          >
            View Full Document
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--slate)', marginBottom: 8 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'var(--sky)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--navy)', fontWeight: 500 }}>{value}</div>
    </div>
  );
}