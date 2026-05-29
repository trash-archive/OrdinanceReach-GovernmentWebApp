import { useState, useMemo } from 'react';
import {
  Search, Plus, Download, LayoutGrid, List,
  ChevronUp, ChevronDown, X,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight,
  SlidersHorizontal,
} from 'lucide-react';
import { ordinances, CATEGORIES } from '../data/mockData';
import type { Ordinance, OrdStatus } from '../data/mockData';

interface OrdinanceListScreenProps {
  onNavigate: (s: any) => void;
  onViewOrdinance: (ord: Ordinance) => void;
}

const PER_PAGE = 8;
type SortField = 'number' | 'title' | 'category' | 'status' | 'datePassed' | 'author';

// ─── Badge helpers ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { bg: string; color: string; label: string }> = {
  active:   { bg: '#f0fdf4', color: '#15803d', label: 'Active'   },
  draft:    { bg: '#f8fafc', color: '#475569', label: 'Draft'    },
  amended:  { bg: '#fffbeb', color: '#a16207', label: 'Amended'  },
  repealed: { bg: '#fef2f2', color: '#dc2626', label: 'Repealed' },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.draft;
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 500,
      padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap',
    }}>{cfg.label}</span>
  );
}

const CAT_COLORS: Record<string, { bg: string; color: string }> = {
  Traffic:     { bg: '#eff6ff', color: '#1d4ed8' },
  Environment: { bg: '#f0fdf4', color: '#15803d' },
  Health:      { bg: '#fff1f2', color: '#be123c' },
  Business:    { bg: '#fffbeb', color: '#a16207' },
  Safety:      { bg: '#f5f3ff', color: '#7c3aed' },
  Sanitation:  { bg: '#ecfdf5', color: '#065f46' },
  Zoning:      { bg: '#fff7ed', color: '#c2410c' },
  Education:   { bg: '#f0fdf4', color: '#166534' },
};

function CategoryPill({ category }: { category: string }) {
  const cfg = CAT_COLORS[category] ?? { bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      fontSize: 11, fontWeight: 500,
      padding: '2px 8px', borderRadius: 4, whiteSpace: 'nowrap',
    }}>{category}</span>
  );
}

// ─── Stat mini-card ───────────────────────────────────────────────────────────

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: 'var(--color-background-primary)',
      border: '1px solid var(--color-border-tertiary)',
      borderRadius: 8, padding: '12px 16px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 500, color, lineHeight: 1 }}>{value}</span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function OrdinanceListScreen({ onNavigate, onViewOrdinance }: OrdinanceListScreenProps) {
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState<OrdStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortField, setSortField]     = useState<SortField>('datePassed');
  const [sortDir, setSortDir]         = useState<1 | -1>(-1);
  const [page, setPage]               = useState(1);
  const [isGrid, setIsGrid]           = useState(false);
  const [selected, setSelected]       = useState<Ordinance | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const counts = useMemo(() => ({
    active:   ordinances.filter(o => o.status === 'active').length,
    draft:    ordinances.filter(o => o.status === 'draft').length,
    amended:  ordinances.filter(o => o.status === 'amended').length,
    repealed: ordinances.filter(o => o.status === 'repealed').length,
    total:    ordinances.length,
  }), []);

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
  const safePage   = Math.min(page, totalPages);
  const pageSlice  = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  function handleSort(field: SortField) {
    if (sortField === field) setSortDir(d => (d === 1 ? -1 : 1));
    else { setSortField(field); setSortDir(1); }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <span style={{ opacity: 0.25, marginLeft: 2, fontSize: 10 }}>↕</span>;
    return sortDir === 1
      ? <ChevronUp   size={11} style={{ marginLeft: 2, verticalAlign: 'middle' }} />
      : <ChevronDown size={11} style={{ marginLeft: 2, verticalAlign: 'middle' }} />;
  }

  function exportCSV() {
    const header = ['Number', 'Title', 'Category', 'Status', 'Date Passed', 'Author'];
    const rows   = filtered.map(o =>
      [o.number, `"${o.title}"`, o.category, o.status, o.datePassed, o.author].join(',')
    );
    const csv = [header.join(','), ...rows].join('\n');
    const a   = document.createElement('a');
    a.href     = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'ordinances.csv';
    a.click();
  }

  function handleSearch(v: string)            { setSearch(v);         setPage(1); }
  function handleStatus(v: OrdStatus | 'all') { setStatusFilter(v);   setPage(1); }
  function handleCategory(v: string)          { setCategoryFilter(v); setPage(1); }

  const statusTabs: { value: OrdStatus | 'all'; label: string; count: number }[] = [
    { value: 'all',      label: 'All',      count: counts.total   },
    { value: 'active',   label: 'Active',   count: counts.active  },
    { value: 'draft',    label: 'Drafts',   count: counts.draft   },
    { value: 'amended',  label: 'Amended',  count: counts.amended },
    { value: 'repealed', label: 'Repealed', count: counts.repealed},
  ];

  const activeFilters = (statusFilter !== 'all' ? 1 : 0) + (categoryFilter !== 'all' ? 1 : 0);

  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Stat row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        <MiniStat label="Active"   value={counts.active}   color="#15803d" />
        <MiniStat label="Drafts"   value={counts.draft}    color="#475569" />
        <MiniStat label="Amended"  value={counts.amended}  color="#a16207" />
        <MiniStat label="Repealed" value={counts.repealed} color="#dc2626" />
        <MiniStat label="Total"    value={counts.total}    color="var(--color-text-primary)" />
      </div>

      {/* ── Toolbar ── */}
      <div style={{
        background: 'var(--color-background-primary)',
        border: '1px solid var(--color-border-tertiary)',
        borderRadius: 10,
        overflow: 'hidden',
      }}>
        {/* Top row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 14px',
          borderBottom: showFilters ? '1px solid var(--color-border-tertiary)' : 'none',
          flexWrap: 'wrap',
        }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: 7, padding: '0 10px',
            flex: 1, minWidth: 200, height: 32,
          }}>
            <Search size={13} color="var(--color-text-secondary)" style={{ flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search title, number, category…"
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                fontSize: 12.5, color: 'var(--color-text-primary)', flex: 1,
              }}
            />
            {search && (
              <button onClick={() => handleSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0, color: 'var(--color-text-secondary)' }}>
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(f => !f)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 32, padding: '0 11px',
              background: showFilters ? 'var(--color-background-secondary)' : 'transparent',
              border: '1px solid var(--color-border-tertiary)',
              borderRadius: 7, fontSize: 12.5,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap',
            }}
          >
            <SlidersHorizontal size={13} />
            Filters
            {activeFilters > 0 && (
              <span style={{
                background: '#2563eb', color: '#fff',
                fontSize: 10, fontWeight: 600,
                padding: '0 5px', borderRadius: 10, minWidth: 16, textAlign: 'center',
              }}>{activeFilters}</span>
            )}
          </button>

          {/* View toggle */}
          <div style={{
            display: 'flex',
            border: '1px solid var(--color-border-tertiary)',
            borderRadius: 7, overflow: 'hidden', height: 32,
          }}>
            {[
              { mode: false, icon: <List size={13} />, label: 'List' },
              { mode: true,  icon: <LayoutGrid size={13} />, label: 'Grid' },
            ].map(btn => (
              <button
                key={btn.label}
                onClick={() => setIsGrid(btn.mode)}
                title={btn.label}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 34,
                  background: isGrid === btn.mode ? 'var(--color-background-secondary)' : 'transparent',
                  border: 'none',
                  color: isGrid === btn.mode ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                  cursor: 'pointer', transition: 'background 0.1s',
                }}
              >
                {btn.icon}
              </button>
            ))}
          </div>

          {/* Export */}
          <button
            onClick={exportCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 32, padding: '0 11px',
              background: 'transparent',
              border: '1px solid var(--color-border-tertiary)',
              borderRadius: 7, fontSize: 12.5,
              color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 500,
            }}
          >
            <Download size={13} /> Export CSV
          </button>

          {/* New Ordinance */}
          <button
            onClick={() => onNavigate('encode')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              height: 32, padding: '0 14px',
              background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: 7,
              fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <Plus size={13} /> New Ordinance
          </button>
        </div>

        {/* Filter row (collapsible) */}
        {showFilters && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '10px 14px', flexWrap: 'wrap',
            background: 'var(--color-background-secondary)',
          }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
              <div style={{ display: 'flex', gap: 5 }}>
                {statusTabs.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatus(opt.value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      height: 28, padding: '0 10px',
                      border: '1px solid var(--color-border-tertiary)',
                      background: statusFilter === opt.value ? '#0f172a' : 'var(--color-background-primary)',
                      color: statusFilter === opt.value ? '#fff' : 'var(--color-text-secondary)',
                      borderRadius: 6, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                      transition: 'all 0.12s',
                    }}
                  >
                    {opt.label}
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      background: statusFilter === opt.value ? 'rgba(255,255,255,0.2)' : 'var(--color-background-secondary)',
                      color: statusFilter === opt.value ? '#fff' : 'var(--color-text-secondary)',
                      padding: '0 5px', borderRadius: 4,
                    }}>{opt.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ width: 1, height: 36, background: 'var(--color-border-tertiary)' }} />

            <div>
              <div style={{ fontSize: 10.5, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</div>
              <select
                value={categoryFilter}
                onChange={e => handleCategory(e.target.value)}
                style={{
                  height: 28, padding: '0 8px',
                  border: '1px solid var(--color-border-tertiary)',
                  background: 'var(--color-background-primary)',
                  borderRadius: 6, fontSize: 12,
                  color: 'var(--color-text-primary)', outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {activeFilters > 0 && (
              <button
                onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); setPage(1); }}
                style={{
                  marginLeft: 'auto',
                  display: 'flex', alignItems: 'center', gap: 5,
                  height: 28, padding: '0 10px',
                  background: 'transparent',
                  border: '1px solid var(--color-border-tertiary)',
                  borderRadius: 6, fontSize: 12,
                  color: 'var(--color-text-secondary)', cursor: 'pointer',
                }}
              >
                <X size={11} /> Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Table / Grid container ── */}
      <div style={{
        background: 'var(--color-background-primary)',
        border: '1px solid var(--color-border-tertiary)',
        borderRadius: 10, overflow: 'hidden',
      }}>
        {/* Sub-header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '11px 16px',
          borderBottom: '1px solid var(--color-border-tertiary)',
        }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>Ordinance repository</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginLeft: 8 }}>
              {filtered.length === 0
                ? 'No results'
                : `${(safePage - 1) * PER_PAGE + 1}–${Math.min(safePage * PER_PAGE, filtered.length)} of ${filtered.length}`}
            </span>
          </div>
        </div>

        {/* ── LIST VIEW ── */}
        {!isGrid && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr>
                  {([
                    { label: 'Ord. No.',    field: 'number'     },
                    { label: 'Title',       field: 'title'      },
                    { label: 'Category',    field: 'category'   },
                    { label: 'Status',      field: 'status'     },
                    { label: 'Date Passed', field: 'datePassed' },
                    { label: 'Author',      field: 'author'     },
                  ] as { label: string; field: SortField }[]).map(col => (
                    <th
                      key={col.field}
                      onClick={() => handleSort(col.field)}
                      style={{
                        padding: '9px 16px', textAlign: 'left',
                        fontSize: 11, fontWeight: 500,
                        color: 'var(--color-text-secondary)',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                        whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none',
                        background: 'var(--color-background-secondary)',
                        borderBottom: '1px solid var(--color-border-tertiary)',
                      }}
                    >
                      {col.label}<SortIcon field={col.field} />
                    </th>
                  ))}
                  <th style={{
                    padding: '9px 16px', textAlign: 'right',
                    fontSize: 11, fontWeight: 500,
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    background: 'var(--color-background-secondary)',
                    borderBottom: '1px solid var(--color-border-tertiary)',
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageSlice.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 13 }}>
                      No ordinances match your filters.
                    </td>
                  </tr>
                ) : pageSlice.map((ord) => (
                  <TableRow key={ord.id} ord={ord} onSelect={setSelected} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {isGrid && (
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {pageSlice.length === 0
              ? <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-text-secondary)', padding: 40, fontSize: 13 }}>
                  No ordinances match your filters.
                </div>
              : pageSlice.map(ord => (
                <GridCard key={ord.id} ord={ord} onSelect={setSelected} />
              ))
            }
          </div>
        )}

        {/* ── Pagination ── */}
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--color-border-tertiary)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            Page {safePage} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { icon: <ChevronsLeft size={12} />, action: () => setPage(1),                              disabled: safePage === 1          },
              { icon: <ChevronLeft  size={12} />, action: () => setPage(p => Math.max(1, p - 1)),        disabled: safePage === 1          },
              { icon: <ChevronRight size={12} />, action: () => setPage(p => Math.min(totalPages, p + 1)), disabled: safePage === totalPages },
              { icon: <ChevronsRight size={12} />, action: () => setPage(totalPages),                   disabled: safePage === totalPages },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.action}
                disabled={btn.disabled}
                style={{
                  width: 28, height: 28,
                  border: '1px solid var(--color-border-tertiary)',
                  background: 'transparent',
                  borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: btn.disabled ? 'var(--color-border-tertiary)' : 'var(--color-text-secondary)',
                  cursor: btn.disabled ? 'default' : 'pointer',
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
                  width: 28, height: 28,
                  border: '1px solid var(--color-border-tertiary)',
                  background: p === safePage ? '#0f172a' : 'transparent',
                  color: p === safePage ? '#fff' : 'var(--color-text-secondary)',
                  borderRadius: 6, fontSize: 12, fontWeight: p === safePage ? 500 : 400,
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Detail Panel ── */}
      {selected && (
        <DetailPanel
          ord={selected}
          onClose={() => setSelected(null)}
          onViewFull={onViewOrdinance}
        />
      )}
    </div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────

function TableRow({ ord, onSelect }: { ord: Ordinance; onSelect: (o: Ordinance) => void }) {
  return (
    <tr
      onClick={() => onSelect(ord)}
      style={{
        borderBottom: '1px solid var(--color-border-tertiary)',
        cursor: 'pointer', transition: 'background 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-background-secondary)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <td style={{ padding: '11px 16px', whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {ord.number}
        </span>
      </td>
      <td style={{ padding: '11px 16px', maxWidth: 280 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
          {ord.title}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ord.offices.length
            ? ord.offices.join(' · ')
            : <em style={{ fontStyle: 'normal', opacity: 0.6 }}>No offices assigned</em>}
        </div>
      </td>
      <td style={{ padding: '11px 16px' }}>
        <CategoryPill category={ord.category} />
      </td>
      <td style={{ padding: '11px 16px' }}>
        <StatusPill status={ord.status} />
      </td>
      <td style={{ padding: '11px 16px', color: 'var(--color-text-secondary)', fontSize: 12, whiteSpace: 'nowrap' }}>
        {ord.datePassed}
      </td>
      <td style={{ padding: '11px 16px', color: 'var(--color-text-secondary)', fontSize: 12, whiteSpace: 'nowrap' }}>
        {ord.author}
      </td>
      <td style={{ padding: '11px 16px' }}>
        <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
          <RowBtn label="View"    onClick={() => onSelect(ord)} />
          <RowBtn label="Edit"    onClick={() => alert(`Edit: ${ord.number}`)} />
          <RowBtn label="Archive" onClick={() => alert(`Archive: ${ord.number}`)} danger />
        </div>
      </td>
    </tr>
  );
}

function RowBtn({ label, onClick, danger = false }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(); }}
      style={{
        height: 26, padding: '0 9px',
        border: '1px solid var(--color-border-tertiary)',
        background: 'transparent',
        borderRadius: 5, fontSize: 11.5,
        color: danger ? '#dc2626' : 'var(--color-text-secondary)',
        cursor: 'pointer', fontWeight: 500,
        transition: 'all 0.1s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger ? '#fef2f2' : 'var(--color-background-secondary)';
        e.currentTarget.style.color = danger ? '#dc2626' : 'var(--color-text-primary)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = danger ? '#dc2626' : 'var(--color-text-secondary)';
      }}
    >
      {label}
    </button>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────

function GridCard({ ord, onSelect }: { ord: Ordinance; onSelect: (o: Ordinance) => void }) {
  return (
    <div
      onClick={() => onSelect(ord)}
      style={{
        background: 'var(--color-background-primary)',
        border: '1px solid var(--color-border-tertiary)',
        borderRadius: 9, padding: '14px 16px',
        cursor: 'pointer', transition: 'border-color 0.15s',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--color-border-secondary)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--color-border-tertiary)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <CategoryPill category={ord.category} />
        <StatusPill status={ord.status} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
          {ord.number}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.45 }}>
          {ord.title}
        </div>
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 'auto', paddingTop: 4, borderTop: '1px solid var(--color-border-tertiary)' }}>
        {ord.datePassed} · {ord.author}
      </div>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailPanel({ ord, onClose, onViewFull }: { ord: Ordinance; onClose: () => void; onViewFull: (ord: Ordinance) => void }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100, animation: 'fadeIn 0.15s' }}
      />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
        background: 'var(--color-background-primary)',
        borderLeft: '1px solid var(--color-border-tertiary)',
        zIndex: 101, display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.2s ease',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border-tertiary)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 5 }}>
              {ord.number}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
              {ord.title}
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              <StatusPill status={ord.status} />
              <CategoryPill category={ord.category} />
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, border: '1px solid var(--color-border-tertiary)',
              background: 'transparent', borderRadius: 6, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--color-text-secondary)', flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          <DrawerSection title="Summary">
            <p style={{ fontSize: 12.5, color: 'var(--color-text-secondary)', lineHeight: 1.7, margin: 0 }}>
              {ord.summary}
            </p>
          </DrawerSection>

          <DrawerSection title="Details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-border-tertiary)' }}>
              {[
                { label: 'Date Passed', value: ord.datePassed },
                { label: 'Author / Encoder', value: ord.author },
                { label: 'Implementing Offices', value: ord.offices.length ? ord.offices.join(', ') : 'None assigned' },
              ].map((f, i) => (
                <div key={f.label} style={{
                  display: 'flex', gap: 12, padding: '10px 14px',
                  background: i % 2 === 0 ? 'transparent' : 'var(--color-background-secondary)',
                }}>
                  <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', width: 130, flexShrink: 0 }}>{f.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-primary)', fontWeight: 500 }}>{f.value}</span>
                </div>
              ))}
            </div>
          </DrawerSection>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border-tertiary)', display: 'flex', gap: 8 }}>
          <button style={{
            flex: 1, height: 34, borderRadius: 7, fontSize: 12.5, fontWeight: 500,
            cursor: 'pointer', background: 'transparent',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-tertiary)',
          }}>
            Edit Metadata
          </button>
          <button
            onClick={() => onViewFull(ord)}
            style={{
              flex: 1, height: 34, borderRadius: 7, fontSize: 12.5, fontWeight: 500,
              cursor: 'pointer', background: '#2563eb', color: '#fff', border: 'none',
            }}
          >
            View Full Document
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  );
}

function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: 10.5, fontWeight: 500, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: 'var(--color-text-secondary)',
        marginBottom: 8,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}