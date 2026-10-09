import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, GitCompare, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { CATALOG, CATALOG_CATEGORIES, NA } from './productCatalog.js';

// 各類型用色（固定字串，Tailwind 才掃得到）
const TONE = {
  emerald: { head: 'bg-emerald-400/15 text-emerald-200 border-emerald-400/30', cell: 'bg-emerald-400/[0.07] text-emerald-50', dot: 'bg-emerald-400' },
  sky:     { head: 'bg-sky-400/15 text-sky-200 border-sky-400/30',             cell: 'bg-sky-400/[0.07] text-sky-50',         dot: 'bg-sky-400' },
  violet:  { head: 'bg-violet-400/15 text-violet-200 border-violet-400/30',    cell: 'bg-violet-400/[0.07] text-violet-50',   dot: 'bg-violet-400' },
  pink:    { head: 'bg-pink-400/15 text-pink-200 border-pink-400/30',          cell: 'bg-pink-400/[0.07] text-pink-50',       dot: 'bg-pink-400' },
  amber:   { head: 'bg-amber-400/15 text-amber-200 border-amber-400/30',       cell: 'bg-amber-400/[0.07] text-amber-50',     dot: 'bg-amber-400' },
};

const DesktopCatalog = () => {
  const [cat, setCat] = useState('癌險');
  const [groupId, setGroupId] = useState('all');
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [picked, setPicked] = useState([]);
  const [applied, setApplied] = useState(false);
  const [detail, setDetail] = useState(null);

  const data = CATALOG[cat];

  const products = useMemo(() => {
    if (!data) return [];
    let list = data.products;
    if (compareMode && applied && picked.length >= 2) list = list.filter(p => picked.includes(p.id));
    else if (groupId !== 'all') list = list.filter(p => p.group === groupId);
    return list;
  }, [data, groupId, compareMode, applied, picked]);

  const groupSpans = useMemo(() => {
    if (!data) return [];
    return data.groups
      .map(g => ({ ...g, items: products.filter(p => p.group === g.id) }))
      .filter(g => g.items.length > 0);
  }, [data, products]);

  const orderedProducts = useMemo(() => groupSpans.flatMap(g => g.items), [groupSpans]);

  const sections = useMemo(() => {
    if (!data) return [];
    return data.rows
      .map(sec => ({
        ...sec,
        rows: sec.rows.filter(r => {
          const vals = orderedProducts.map(p => p.cells[r.key] ?? (r.key === 'cur' ? '新台幣' : NA));
          if (vals.every(v => v === NA)) return false;      // 全部都沒有的列直接隱藏
          if (onlyDiff && new Set(vals).size === 1) return false;
          return true;
        }),
      }))
      .filter(sec => sec.rows.length > 0);
  }, [data, orderedProducts, onlyDiff]);

  const togglePick = (id) => setPicked(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 3 ? prev : [...prev, id]);

  const colW = orderedProducts.length <= 3 ? 'min-w-[200px] md:min-w-[260px]' : 'min-w-[148px] md:min-w-[156px]';

  return (
    <div className="space-y-4">
      {/* 類別 */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATALOG_CATEGORIES.map(c => {
          const has = !!CATALOG[c];
          return (
            <button key={c} onClick={() => has && (setCat(c), setGroupId('all'), setPicked([]), setApplied(false))}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition border ${cat === c ? 'bg-white text-gray-900 border-white' : has ? 'bg-white/[0.06] text-white/80 border-white/10 hover:bg-white/10' : 'bg-white/[0.03] text-white/30 border-white/5 cursor-default'}`}>
              {c}{!has && <span className="ml-1.5 text-[10px] font-medium">即將上線</span>}
            </button>
          );
        })}
      </div>

      {!data ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-xl py-20 text-center text-white/40 text-sm">
          「{cat}」的商品總表準備中，提供 DM 後即可上線
        </div>
      ) : (
        <>
          {/* 工具列 */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {[{ id: 'all', label: '全部' }, ...data.groups].map(g => (
                <button key={g.id} onClick={() => { setGroupId(g.id); setPicked([]); }}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition ${groupId === g.id ? 'bg-white/90 text-gray-900' : 'bg-white/[0.06] text-white/60 hover:bg-white/10'}`}>
                  {g.label}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <button onClick={() => setOnlyDiff(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition border ${onlyDiff ? 'bg-sky-400/20 text-sky-200 border-sky-400/40' : 'bg-white/[0.06] text-white/60 border-white/10 hover:bg-white/10'}`}>
              <Filter size={12} /> 只看差異
            </button>
            <button onClick={() => { setCompareMode(v => !v); setPicked([]); setApplied(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition border ${compareMode ? 'bg-amber-400/20 text-amber-200 border-amber-400/40' : 'bg-white/[0.06] text-white/60 border-white/10 hover:bg-white/10'}`}>
              <GitCompare size={12} /> {compareMode ? `比較中（勾選 ${picked.length}/3）` : '挑 2–3 款比較'}
            </button>
            {compareMode && picked.length >= 2 && (
              <button onClick={() => setApplied(v => !v)} className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-400 text-gray-900">
                {applied ? '顯示全部' : `只比較這 ${picked.length} 款`}
              </button>
            )}
          </div>

          {/* 總表 */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-xl overflow-hidden">
            <div className="overflow-auto max-h-[calc(100vh-290px)] min-h-[360px]">
              <table className="border-separate border-spacing-0 text-left w-full">
                <thead className="sticky top-0 z-30">
                  <tr>
                    <th rowSpan={2} className="sticky left-0 z-40 bg-[#14161c] w-[96px] min-w-[96px] md:w-[132px] md:min-w-[132px] border-b border-r border-white/10 px-3 text-[11px] text-white/40 font-bold align-bottom pb-2">
                      {cat}・{orderedProducts.length} 款
                    </th>
                    {groupSpans.map(g => (
                      <th key={g.id} colSpan={g.items.length} className="bg-[#14161c] border-b border-l border-white/10 px-3 py-2">
                        <div className="text-xs font-bold text-white/90 whitespace-nowrap">{g.label}</div>
                        <div className="text-[10px] font-normal text-white/40 whitespace-nowrap">{g.hint}</div>
                      </th>
                    ))}
                  </tr>
                  <tr>
                    {orderedProducts.map(p => {
                      const t = TONE[p.color];
                      const on = picked.includes(p.id);
                      return (
                        <th key={p.id} className={`${colW} bg-[#14161c] border-b border-l border-white/10 p-1.5 align-top`}>
                          <div className="flex items-stretch gap-1">
                            {compareMode && (
                              <button onClick={() => togglePick(p.id)} aria-label={`選取 ${p.code}`}
                                className={`shrink-0 w-6 rounded-lg border flex items-center justify-center ${on ? 'bg-amber-400 border-amber-400 text-gray-900' : 'border-white/20 text-transparent'}`}>
                                <Check size={14} />
                              </button>
                            )}
                            <button onClick={() => setDetail(p)} className={`flex-1 text-left rounded-xl border px-2.5 py-2 transition hover:brightness-125 ${t.head}`}>
                              <div className="text-sm font-black leading-tight">{p.code}</div>
                              <div className="text-[10px] font-medium opacity-80 leading-snug mt-0.5 line-clamp-2 whitespace-normal">{p.short || p.name.replace('癌症', '').replace('健康保險', '')}</div>
                            </button>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sections.map(sec => (
                    <React.Fragment key={sec.section}>
                      <tr>
                        <td className="sticky left-0 z-20 bg-[#1b1e26] border-b border-r border-white/10 px-3 py-1.5 text-[11px] font-black text-white/70 tracking-wider">{sec.section}</td>
                        <td colSpan={orderedProducts.length} className="bg-[#1b1e26] border-b border-white/10" />
                      </tr>
                      {sec.rows.map(r => (
                        <tr key={r.key} className="group">
                          <td className="sticky left-0 z-20 bg-[#14161c] border-b border-r border-white/[0.07] px-3 py-2 text-[11px] md:text-xs font-bold text-white/60 align-top">{r.label}</td>
                          {orderedProducts.map(p => {
                            const v = p.cells[r.key] ?? (r.key === 'cur' ? '新台幣' : NA);
                            const none = v === NA;
                            return (
                              <td key={p.id} className={`border-b border-l border-white/[0.07] px-2.5 py-2 align-top text-[11px] md:text-xs leading-relaxed whitespace-pre-line group-hover:brightness-125 ${none ? 'text-white/20 text-center' : TONE[p.color].cell}`}>
                                {v}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[10px] text-white/30 px-1">點商品代號看詳細說明；「—」代表該商品沒有此項給付。數字依 DM 整理，保障結束年齡超過 90 歲者為「終身型」，其餘為「定期型」。實際承保請以保單條款與最新費率為準。</p>
        </>
      )}

      {/* 商品詳細 */}
      {detail && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setDetail(null)}>
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#171a21] p-6 text-white shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${TONE[detail.color].head}`}>{data.groups.find(g => g.id === detail.group)?.label}</span>
                <h3 className="text-2xl font-black mt-2">{detail.code}</h3>
                <p className="text-sm text-white/70 mt-0.5">{detail.name}</p>
              </div>
              <button onClick={() => setDetail(null)} className="p-1 rounded-full hover:bg-white/10"><X size={20} /></button>
            </div>
            <div className="mt-5 space-y-4 text-sm">
              <div><div className="text-[11px] font-bold text-white/40 mb-1">一句話功用</div><p className="leading-relaxed">{detail.func}</p></div>
              <div><div className="text-[11px] font-bold text-white/40 mb-1">適合對象</div><p className="leading-relaxed">{detail.fit}</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-white/[0.05] p-3"><div className="text-[10px] text-white/40">投保年齡</div><div className="text-xs font-bold mt-1 whitespace-pre-line">{detail.cells.age}</div></div>
                <div className="rounded-2xl bg-white/[0.05] p-3"><div className="text-[10px] text-white/40">解約金</div><div className="text-xs font-bold mt-1">{detail.cells.cash}</div></div>
              </div>
              <div className="text-[10px] text-white/30">DM 版本：{detail.doc}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



// ───────────────── 手機版：商品卡片 → 比較頁 → 商品詳情 ─────────────────
// 卡片三格：險種＋兩個特色（依險種挑選的重點列）
const FEATURE_KEYS = {
  '癌險': ['sum', 'wait'],
  '重大疾病・精選傷病': ['sum', 'wait'],
  '住院・手術': ['hosp', 'sum'],
  '長照險': ['lump', 'sum'],
  '意外險': ['death', 'sum'],
};
const firstLine = (v) => String(v ?? '').split('\n')[0];
const kindOf = (p) => firstLine(p.cells.kind).split('・')[0] || '—';
const getRow = (data, key) => { for (const sec of data.rows) { const r = sec.rows.find(x => x.key === key); if (r) return r; } return null; };
const valOf = (p, key) => p.cells[key] ?? (key === 'cur' ? '新台幣' : NA);
const rowLabelShort = (l) => (l || '').replace(/[（(].*$/, '');

const FeatureTiles = ({ p, cat, data }) => {
  const keys = FEATURE_KEYS[cat] || ['sum', 'wait'];
  const tiles = [{ v: kindOf(p), l: '險種' }, ...keys.map(k => ({ v: firstLine(valOf(p, k)), l: rowLabelShort(getRow(data, k)?.label || '') }))];
  return (
    <div className="grid grid-cols-3 gap-2 mt-3">
      {tiles.map((t, i) => (
        <div key={i} className="rounded-xl bg-white/[0.06] border border-white/[0.06] px-2 py-2 text-center min-w-0">
          <div className="text-[12px] font-bold text-white leading-snug line-clamp-2 break-words">{t.v === NA ? '—' : t.v}</div>
          <div className="text-[10px] text-white/45 mt-0.5 truncate">{t.l}</div>
        </div>
      ))}
    </div>
  );
};

const CodeBadge = ({ p, size = 'md' }) => (
  <div className={`shrink-0 rounded-xl border font-black flex items-center justify-center text-center leading-tight ${size === 'lg' ? 'w-16 h-16 text-lg' : 'min-w-[52px] h-[52px] px-1.5 text-[13px]'} ${TONE[p.color].head}`}>{p.code}</div>
);

const MobileCatalog = () => {
  const [cat, setCat] = useState('癌險');
  const [groupId, setGroupId] = useState('all');
  const [picked, setPicked] = useState([]);
  const [view, setView] = useState('list');        // list | compare
  const [cmpTab, setCmpTab] = useState('key');     // key | cover | fit
  const [detail, setDetail] = useState(null);
  const [dTab, setDTab] = useState('intro');
  const data = CATALOG[cat];
  const list = useMemo(() => !data ? [] : groupId === 'all' ? data.products : data.products.filter(p => p.group === groupId), [data, groupId]);
  const pickedProducts = useMemo(() => data ? data.products.filter(p => picked.includes(p.id)) : [], [data, picked]);
  const toggle = (id) => setPicked(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 3 ? prev : [...prev, id]);
  const groupLabel = (p) => data.groups.find(g => g.id === p.group)?.label;
  const openDetail = (p) => { setDetail(p); setDTab('intro'); };

  // 比較表資料
  const keySec = data?.rows[0];
  const keyRows = keySec ? keySec.rows.filter(r => r.key !== 'cur') : [];
  const coverSecs = data ? data.rows.slice(1).map(sec => ({ ...sec, rows: sec.rows.filter(r => !pickedProducts.every(p => valOf(p, r.key) === NA)) })).filter(s => s.rows.length) : [];

  const Tabs = ({ items, cur, set }) => (
    <div className="flex gap-1.5 p-1 rounded-2xl bg-white/[0.06] border border-white/10">
      {items.map(([k, l]) => (
        <button key={k} onClick={() => set(k)} className={`flex-1 py-2 rounded-xl text-[13px] font-bold transition ${cur === k ? 'bg-white text-gray-900' : 'text-white/60'}`}>{l}</button>
      ))}
    </div>
  );

  return (
    <div className="space-y-3 pb-24">
      {/* 類別 */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATALOG_CATEGORIES.map(c => {
          const has = !!CATALOG[c];
          return (
            <button key={c} onClick={() => has && (setCat(c), setGroupId('all'), setPicked([]))}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold border ${cat === c ? 'bg-white text-gray-900 border-white' : has ? 'bg-white/[0.06] text-white/80 border-white/10' : 'bg-white/[0.03] text-white/30 border-white/5'}`}>
              {c}{!has && <span className="ml-1.5 text-[10px] font-medium">即將上線</span>}
            </button>
          );
        })}
      </div>

      {!data ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] py-16 text-center text-white/40 text-sm">「{cat}」的商品總表準備中，提供 DM 後即可上線</div>
      ) : (
        <>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {[{ id: 'all', label: '全部' }, ...data.groups].map(g => (
              <button key={g.id} onClick={() => setGroupId(g.id)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border ${groupId === g.id ? 'bg-sky-400/20 text-sky-200 border-sky-400/40' : 'bg-white/[0.06] text-white/60 border-white/10'}`}>{g.label}</button>
            ))}
          </div>
          <div className="flex items-center justify-between px-1 text-[12px] text-white/50">
            <span>共 {list.length} 款商品</span>
            <span>勾選右上圓圈，最多 3 款比較</span>
          </div>

          {/* 商品卡片 */}
          <div className="space-y-3">
            {list.map(p => {
              const on = picked.includes(p.id);
              const full = !on && picked.length >= 3;
              return (
                <div key={p.id} className={`rounded-2xl border p-3.5 bg-white/[0.045] ${on ? 'border-amber-400/60' : 'border-white/10'}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => openDetail(p)} className="flex items-start gap-3 flex-1 min-w-0 text-left">
                      <CodeBadge p={p} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[15px] font-bold text-white leading-snug">{p.short || p.name}</div>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-white/70">{groupLabel(p)}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-white/70">{kindOf(p)}</span>
                        </div>
                      </div>
                    </button>
                    <button onClick={() => toggle(p.id)} disabled={full} aria-label={`選取 ${p.code}`}
                      className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center ${on ? 'bg-amber-400 border-amber-400 text-gray-900' : full ? 'border-white/10 text-transparent' : 'border-white/30 text-transparent'}`}>
                      <Check size={15} />
                    </button>
                  </div>
                  <button onClick={() => openDetail(p)} className="block w-full text-left">
                    <p className="text-[12px] text-white/60 mt-2 leading-relaxed line-clamp-2">{p.func}</p>
                    <FeatureTiles p={p} cat={cat} data={data} />
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-white/30 px-1">保障結束年齡超過 90 歲者為「終身型」，其餘為「定期型」。實際承保以保單條款與最新費率為準。</p>
        </>
      )}

      {/* 比較列 */}
      {data && picked.length > 0 && view === 'list' && !detail && (
        <div className="fixed left-4 right-4 bottom-[84px] z-40 flex items-center gap-2 rounded-2xl bg-[#1b1e26]/95 backdrop-blur border border-white/15 p-2 shadow-2xl">
          <button onClick={() => setPicked([])} className="px-3 py-2 text-xs font-bold text-white/60">清除</button>
          <div className="flex-1 text-[12px] text-white/70 truncate">已選 {picked.length}/3　{pickedProducts.map(p => p.code).join('、')}</div>
          <button disabled={picked.length < 2} onClick={() => { setView('compare'); setCmpTab('key'); }}
            className={`px-4 py-2 rounded-xl text-sm font-bold ${picked.length >= 2 ? 'bg-blue-600 text-white' : 'bg-white/10 text-white/30'}`}>{picked.length >= 2 ? '開始比較' : '再選 1 款'}</button>
        </div>
      )}

      {/* 比較頁 */}
      {view === 'compare' && data && createPortal(
        <div className="fixed inset-0 z-[400] bg-[#0b0e16] text-white overflow-y-auto" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="sticky top-0 z-10 bg-[#0b0e16]/95 backdrop-blur px-4 pt-3 pb-3 border-b border-white/10">
            <div className="flex items-center justify-between">
              <button onClick={() => setView('list')} className="p-1 -ml-1"><ChevronLeft size={24} /></button>
              <div className="font-bold text-[15px]">商品比較 ({pickedProducts.length}/3)</div>
              <button onClick={() => { setPicked([]); setView('list'); }} className="px-3 py-1 rounded-lg bg-white/10 text-xs font-bold text-white/80">清除</button>
            </div>
            <div className={`grid gap-2 mt-3`} style={{ gridTemplateColumns: `repeat(${pickedProducts.length}, minmax(0,1fr))` }}>
              {pickedProducts.map(p => (
                <div key={p.id} className={`relative rounded-xl border p-2 text-left ${TONE[p.color].head}`}>
                  <button onClick={() => toggle(p.id)} aria-label={`移除 ${p.code}`} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/40 flex items-center justify-center"><X size={11} /></button>
                  <button onClick={() => openDetail(p)} className="block text-left w-full">
                    <div className="text-sm font-black leading-tight pr-4">{p.code}</div>
                    <div className="text-[10px] opacity-80 mt-0.5 line-clamp-2 leading-snug">{p.short || p.name}</div>
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3"><Tabs items={[['key', '重點比較'], ['cover', '保障內容'], ['fit', '適合對象']]} cur={cmpTab} set={setCmpTab} /></div>
          </div>

          <div className="px-4 py-4 pb-28">
            {pickedProducts.length < 2 ? (
              <div className="text-center text-white/50 text-sm py-16">請至少選 2 款商品，才能比較</div>
            ) : cmpTab === 'fit' ? (
              <div className="space-y-3">
                {pickedProducts.map(p => (
                  <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-3.5">
                    <div className="flex items-center gap-2 mb-2"><span className={`px-2 py-0.5 rounded-md text-[11px] font-black border ${TONE[p.color].head}`}>{p.code}</span><span className="text-[12px] text-white/60">{groupLabel(p)}</span></div>
                    <p className="text-[13px] leading-relaxed text-white/90">{p.fit}</p>
                    <p className="text-[12px] leading-relaxed text-white/50 mt-2">{p.func}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full table-fixed border-collapse text-left">
                  <colgroup><col style={{ width: '24%' }} />{pickedProducts.map(p => <col key={p.id} />)}</colgroup>
                  <tbody>
                    {(cmpTab === 'key' ? [{ section: null, rows: keyRows }] : coverSecs).map((sec, si) => (
                      <React.Fragment key={si}>
                        {sec.section && <tr><td colSpan={pickedProducts.length + 1} className="bg-[#1b1e26] px-3 py-1.5 text-[11px] font-black text-white/70 tracking-wider">{sec.section}</td></tr>}
                        {sec.rows.map(r => (
                          <tr key={r.key}>
                            <td className="bg-[#14161c] border-t border-white/[0.07] px-2 py-2 text-[11px] font-bold text-white/55 align-top break-words">{r.label}</td>
                            {pickedProducts.map(p => {
                              const v = valOf(p, r.key); const none = v === NA;
                              return <td key={p.id} className={`border-t border-l border-white/[0.07] px-2 py-2 text-[11px] leading-relaxed whitespace-pre-line break-words align-top ${none ? 'text-white/20 text-center' : TONE[p.color].cell}`}>{v}</td>;
                            })}
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {cmpTab === 'key' && pickedProducts.length >= 2 && (
            <div className="fixed left-4 right-4 bottom-5 z-20" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
              <button onClick={() => setCmpTab('cover')} className="w-full py-3.5 rounded-2xl bg-blue-600 text-white font-bold text-[15px] shadow-xl">查看完整比較（含保障內容）</button>
            </div>
          )}
        </div>, document.body
      )}

      {/* 商品詳情 */}
      {detail && data && (() => {
        const p = detail; const on = picked.includes(p.id); const full = !on && picked.length >= 3;
        const ruleRows = keyRows.filter(r => !['kind'].includes(r.key) && valOf(p, r.key) !== NA);
        const coverSec = data.rows.slice(1).map(sec => ({ ...sec, rows: sec.rows.filter(r => valOf(p, r.key) !== NA) })).filter(s => s.rows.length);
        const feats = [p.func, data.groups.find(g => g.id === p.group)?.hint, `${kindOf(p)}：${firstLine(valOf(p, 'term'))}`].filter(x => x && x !== NA);
        return createPortal(
          <div className="fixed inset-0 z-[410] bg-[#0b0e16] text-white overflow-y-auto" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            <div className="sticky top-0 z-10 bg-[#0b0e16]/95 backdrop-blur px-4 py-3 flex items-center justify-between border-b border-white/10">
              <button onClick={() => setDetail(null)} className="p-1 -ml-1"><ChevronLeft size={24} /></button>
              <div className="font-bold text-[15px]">商品詳情</div>
              <div className="w-6" />
            </div>
            <div className="px-4 py-4 pb-32 space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
                <div className="flex items-center gap-3">
                  <CodeBadge p={p} size="lg" />
                  <div className="min-w-0">
                    <div className="text-lg font-black leading-snug">{p.short || p.name}</div>
                    <div className="text-[12px] text-white/55 mt-0.5">{groupLabel(p)}・{kindOf(p)}</div>
                  </div>
                </div>
                <p className="text-[13px] text-white/75 mt-3 leading-relaxed">{p.func}</p>
                <FeatureTiles p={p} cat={cat} data={data} />
              </div>
              <Tabs items={[['intro', '商品介紹'], ['cover', '保障內容'], ['fit', '適合對象'], ['rule', '投保規則']]} cur={dTab} set={setDTab} />

              {dTab === 'intro' && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <div className="text-[15px] font-black mb-3">商品特色</div>
                  <div className="space-y-2">
                    {feats.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-xl bg-white/[0.05] px-3 py-2.5">
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/90 flex items-center justify-center shrink-0"><Check size={12} /></span>
                        <span className="text-[13px] leading-relaxed text-white/90">{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] text-white/35 mt-3">全名：{p.name}</div>
                </div>
              )}
              {dTab === 'cover' && (
                <div className="space-y-3">
                  {coverSec.length === 0 && <div className="text-center text-white/40 text-sm py-10">此商品沒有其他給付項目</div>}
                  {coverSec.map(sec => (
                    <div key={sec.section} className="rounded-2xl border border-white/10 bg-white/[0.045] overflow-hidden">
                      <div className="px-4 py-2 bg-[#1b1e26] text-[11px] font-black text-white/70 tracking-wider">{sec.section}</div>
                      {sec.rows.map(r => (
                        <div key={r.key} className="px-4 py-2.5 border-t border-white/[0.06]">
                          <div className="text-[11px] text-white/45">{r.label}</div>
                          <div className="text-[13px] leading-relaxed mt-0.5 whitespace-pre-line">{valOf(p, r.key)}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {dTab === 'fit' && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <div className="text-[15px] font-black mb-2">適合對象</div>
                  <p className="text-[14px] leading-relaxed text-white/90">{p.fit}</p>
                </div>
              )}
              {dTab === 'rule' && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
                  <div className="text-[15px] font-black mb-3">投保規則</div>
                  <div className="space-y-2">
                    {ruleRows.map(r => (
                      <div key={r.key} className="flex items-start justify-between gap-3 rounded-xl bg-white/[0.05] px-3 py-2.5">
                        <span className="text-[12px] text-white/55 shrink-0">{r.label}</span>
                        <span className="text-[13px] font-bold text-right whitespace-pre-line">{valOf(p, r.key)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-[10px] text-white/30">DM 版本：{p.doc}。實際承保以保單條款與最新費率為準。</div>
            </div>
            <div className="fixed left-4 right-4 bottom-5 z-20" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
              <button disabled={full} onClick={() => toggle(p.id)}
                className={`w-full py-3.5 rounded-2xl font-bold text-[15px] shadow-xl ${on ? 'bg-amber-400 text-gray-900' : full ? 'bg-white/10 text-white/30' : 'bg-blue-600 text-white'}`}>
                {on ? '已加入比較（點此移除）' : full ? '最多比較 3 款' : '加入比較'}
              </button>
            </div>
          </div>, document.body
        );
      })()}
    </div>
  );
};

const ProductCatalog = () => (
  <>
    <div className="hidden md:block"><DesktopCatalog /></div>
    <div className="md:hidden"><MobileCatalog /></div>
  </>
);

export default ProductCatalog;
