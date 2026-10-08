import React, { useState, useMemo } from 'react';
import { X, Check, GitCompare, Filter } from 'lucide-react';
import { CATALOG, CATALOG_CATEGORIES, NA } from './productCatalog.js';

// 各類型用色（固定字串，Tailwind 才掃得到）
const TONE = {
  emerald: { head: 'bg-emerald-400/15 text-emerald-200 border-emerald-400/30', cell: 'bg-emerald-400/[0.07] text-emerald-50', dot: 'bg-emerald-400' },
  sky:     { head: 'bg-sky-400/15 text-sky-200 border-sky-400/30',             cell: 'bg-sky-400/[0.07] text-sky-50',         dot: 'bg-sky-400' },
  violet:  { head: 'bg-violet-400/15 text-violet-200 border-violet-400/30',    cell: 'bg-violet-400/[0.07] text-violet-50',   dot: 'bg-violet-400' },
  pink:    { head: 'bg-pink-400/15 text-pink-200 border-pink-400/30',          cell: 'bg-pink-400/[0.07] text-pink-50',       dot: 'bg-pink-400' },
  amber:   { head: 'bg-amber-400/15 text-amber-200 border-amber-400/30',       cell: 'bg-amber-400/[0.07] text-amber-50',     dot: 'bg-amber-400' },
};

const ProductCatalog = () => {
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

export default ProductCatalog;
