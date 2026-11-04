// 銷售工具：意外風險儀表板（客戶模式）＋ 長享平安 SUPA 話術（業務模式，長按標題 1 秒開啟）
// 所有數據寫在程式裡，不讀 Firestore。
import React, { useState, useEffect, useRef, useMemo } from 'react';
import TW_MAP from './salesToolsMap.js';
import { SUPA_SCRIPT, SECTION_TALK } from './salesToolsScripts.js';

/* ------------------------------ 資料 ------------------------------ */
const AGE_RATES = [{ k: '0–24', v: 8.5 }, { k: '25–44', v: 13.3 }, { k: '45–64', v: 25.5 }, { k: '65+', v: 77.0 }];
const NATIONAL_ACC = 28.6;
const ACC_TYPES = [
  { k: '運輸事故', v: 2758, p: '41.3%', hl: true }, { k: '跌倒', v: 1632, p: '24.4%', hl: true },
  { k: '意外中毒', v: 488, p: '7.3%' }, { k: '溺水', v: 250, p: '3.7%' }, { k: '火災', v: 109, p: '1.6%' }, { k: '其他', v: 1441, p: '21.6%' },
];
const TRAFFIC_AGE = [{ k: '長輩 65+', v: 26.6, hl: true }, { k: '青年', v: 13.6 }, { k: '成年', v: 9.7 }, { k: '兒少', v: 1.8 }];
const SHARE_TREND = [[2016, 9.1], [2020, 12.3], [2021, 13.0], [2024, 14.9]];
const ELDER_DEATHS = [{ k: '2020', v: 751 }, { k: '2021', v: 795 }, { k: '2022', v: 863 }, { k: '2023', v: 873 }, { k: '2024', v: 824 }];
// 2025 年各縣市：[每10萬人交通死亡數, 65歲以上死者每10萬人]（交通部道安資訊查詢網，初估值）
const COUNTY = [['基隆市', 9.7, 3.88], ['臺北市', 4.64, 2.36], ['新北市', 6.87, 2.89], ['桃園市', 10.26, 3.7], ['新竹市', 9.43, 4.39], ['新竹縣', 11.9, 3.69], ['苗栗縣', 15.78, 6.2], ['臺中市', 10.15, 3.94], ['彰化縣', 17.34, 8.79], ['南投縣', 18.09, 8.09], ['雲林縣', 22.92, 10.7], ['嘉義市', 17.6, 8.42], ['嘉義縣', 21.65, 10.93], ['臺南市', 16.38, 8.08], ['高雄市', 11.27, 5.17], ['屏東縣', 23.93, 11.84], ['宜蘭縣', 18.89, 9.33], ['花蓮縣', 19.75, 8.6], ['臺東縣', 21.51, 9.57], ['澎湖縣', 14.03, 6.55], ['金門縣', 2.85, 1.41]]
  .map(([n, r, e]) => ({ n, rate: r, share: Math.round(e / r * 100) }));
const METRICS = {
  rate: { label: '每 10 萬人死亡率', unit: '/10萬人', brk: [8, 12, 16, 20], lab: ['<8', '8–12', '12–16', '16–20', '≥20'], fmt: v => v.toFixed(1), avg: 12.3, avgLabel: '全國約 12.3' },
  share: { label: '長輩占死者比例', unit: '%', brk: [40, 44, 47, 49], lab: ['<40', '40–44', '44–47', '47–49', '≥49'], fmt: v => String(v), avg: 45, avgLabel: '全國約 45%（2026 上半年）' },
};
const RAMP = ['#17403c', '#1d6b63', '#24998e', '#3cc7b9', '#9af0e6'];
const QUIZ = [
  { q: '交通事故過世的人裡面，65 歲以上長輩大約占幾成？', o: ['約 1 成', '約 2 成', '約 3 成', '4 成以上'], a: 3, big: '45%', e: '2026 年上半年交通死亡 1,333 人，其中 598 人是 65 歲以上長輩，將近一半。' },
  { q: '長輩跌倒，最常發生在哪裡？', o: ['馬路上', '家裡室內', '公園運動時', '市場、賣場'], a: 1, big: '52%', e: '超過一半的跌倒發生在家裡，最常見的是臥室、客廳和浴室。' },
  { q: '65 歲以上的意外死亡率，是全國平均的幾倍？', o: ['差不多', '1.5 倍', '2.7 倍', '5 倍'], a: 2, big: '2.7 倍', e: '全國平均每 10 萬人 28.6 人，65 歲以上是 77.0 人，各年齡層最高。' },
  { q: '長輩的髖部骨折，大約有多少是跌倒造成的？', o: ['約 3 成', '約 5 成', '約 7 成', '9 成以上'], a: 3, big: '90%+', e: '九成以上的長者髖部骨折來自跌倒，骨折後一年內死亡率約 14–36%。' },
];
const ROOMS = [
  { id: 'bed', name: '臥室', x: 20, y: 20, w: 220, h: 170, p: 35.6, risk: '晚上起床上廁所最容易跌倒：燈暗、剛睡醒、血壓一下子變化。', tips: ['床邊到廁所的路上裝感應夜燈', '床高以坐下時膝蓋約 90 度為準', '下床前先坐 30 秒再站起來'] },
  { id: 'bath', name: '浴室', x: 250, y: 20, w: 120, h: 120, p: 17, risk: '地面濕滑，加上進出浴缸、蹲下站起，一滑就容易撞到頭或髖部。', tips: ['地面和浴缸內鋪止滑墊', '馬桶旁、淋浴區裝扶手', '洗澡時坐洗澡椅，不要單腳站'] },
  { id: 'kitchen', name: '廚房', x: 380, y: 20, w: 200, h: 150, p: null, risk: '地上的油漬、水漬，還有踮腳或站椅子拿高處的東西。', tips: ['地面有水油馬上擦乾', '常用的東西放在腰到肩膀的高度', '不要站在椅子上拿東西'] },
  { id: 'living', name: '客廳', x: 20, y: 200, w: 360, h: 160, p: 30.8, risk: '電線、地毯邊緣、矮桌和散落的雜物，是最常見的絆倒原因。', tips: ['電線沿牆邊收好', '地毯加止滑墊，或乾脆拿掉', '常走的路線保持淨空'] },
  { id: 'stair', name: '樓梯・玄關', x: 390, y: 180, w: 190, h: 90, p: null, risk: '高低差、門檻和穿脫鞋的動作，容易一腳踩空或失去平衡。', tips: ['樓梯兩側裝扶手、階梯邊緣貼止滑條', '門檻貼上醒目的色條', '玄關放一張椅子，坐著穿鞋'] },
  { id: 'balcony', name: '陽台', x: 390, y: 280, w: 190, h: 80, p: null, risk: '曬衣服時抬頭踮腳，加上地面潮濕，容易重心不穩。', tips: ['曬衣桿降到伸手可及的高度', '地面保持乾燥', '傍晚收衣服記得開燈'] },
];
const COSTS = [
  ['醫院看護（24 小時）', '3,000–5,000 元/天'], ['醫院看護（12 小時）', '2,000–3,000 元/天'], ['外籍看護', '2.5–3.5 萬/月'],
  ['本國籍居家看護（全日）', '7 萬以上/月'], ['護理之家／住宿型機構', '4–6 萬/月'], ['人工髖關節自費材質差額', '4–14 萬'],
];
const TIPS = [
  { n: '3 倍', h: '意外其實是長輩的事', q: '65 歲以後，每 10 萬人有 77 人因意外過世，是 45 到 64 歲的 3 倍。', d: '定期陪爸媽檢查家裡的燈光、地面和扶手。' },
  { n: '52%', h: '意外常常就在家裡', q: '長輩跌倒，一半以上是在家裡：臥室、客廳、浴室。每 6 個長輩就有 1 個一年內跌倒過。', d: '床邊裝夜燈、浴室鋪止滑墊，花費不多但很有用。' },
  { n: '45%', h: '騎車的長輩要多提醒', q: '2026 年上半年，交通事故過世的 1,333 人裡，598 人是 65 歲以上的長輩，將近一半。', d: '提醒長輩過路口放慢、穿亮色衣服，晚上盡量少騎車。' },
  { n: '25 萬', h: '跌倒之後，照顧才是長期的', q: '長輩骨折後休養三個月，看護費就要約 25 萬，健保不給付。', d: '多吃蛋白質、每週做肌力和平衡運動，是預防跌倒最根本的方法。' },
];
const SOURCES = '資料：衛福部 114 年死因統計、國健署國民健康訪問調查、交通部道安資訊查詢網（初估值）、骨質疏鬆症學會、南山人壽 2023–2025 骨折理賠統計。';

/* ------------------------------ 小工具 ------------------------------ */
const fmt = n => n.toLocaleString('en-US');
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch (e) {
    try { const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); const ok = document.execCommand('copy'); document.body.removeChild(ta); return ok; } catch (e2) { return false; }
  }
}
const cls = (v, brk) => brk.filter(x => v >= x).length;

/* ------------------------------ 樣式 ------------------------------ */
const Style = () => (
  <style>{`
  .st{--bg:#05070f;--card:rgba(255,255,255,.045);--card2:rgba(255,255,255,.07);--line:rgba(255,255,255,.09);--ink:#f2f4f8;--ink2:rgba(242,244,248,.66);--ink3:rgba(242,244,248,.42);--bar:rgba(255,255,255,.14);
    --coral:#ff6b74;--sun:#ffc233;--teal:#2cc9bd;--violet:#9d84ff;--sky:#52a8ff;--gold:#f5c451;
    color:var(--ink);font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang TC","Noto Sans TC",sans-serif;max-width:1100px;margin:0 auto;padding-bottom:40px}
  .st *{box-sizing:border-box}
  .st button{font:inherit;color:inherit;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent}
  .st .num{font-variant-numeric:tabular-nums;letter-spacing:-.02em}
  .st-list{display:flex;flex-direction:column;gap:12px;padding-top:calc(env(safe-area-inset-top,0px) + 14px)}
  @media(min-width:768px){.st-list{padding-top:0}}
  .st-list h1{margin:0;font-size:22px;font-weight:700}
  .st-tool{display:flex;align-items:center;gap:14px;padding:16px;border-radius:18px;background:var(--card);border:1px solid var(--line);text-align:left;width:100%}
  .st-tool .ic{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;font-size:22px;flex:none}
  .st-tool h3{margin:0;font-size:16px;font-weight:700}.st-tool p{margin:2px 0 0;font-size:12.5px;color:var(--ink2)}
  .st-tool.off{opacity:.45;pointer-events:none}
  .st-head{position:sticky;top:0;z-index:20;background:rgba(5,7,15,.86);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);margin:0 -16px;padding:calc(env(safe-area-inset-top,0px) + 10px) 16px 10px;border-bottom:1px solid var(--line)}
  @media(min-width:768px){.st-head{top:64px;margin:0;border-radius:0 0 16px 16px;padding-top:10px}}
  .st-headrow{display:flex;align-items:center;gap:10px}
  .st-back{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--card2);font-size:18px;flex:none}
  .st-title{flex:1;min-width:0;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:manipulation}
  .st-title h1{margin:0;font-size:18px;font-weight:700;letter-spacing:-.01em;display:flex;align-items:center;gap:8px}
  .st-title p{margin:1px 0 0;font-size:11.5px;color:var(--ink3)}
  .st-dot{width:7px;height:7px;border-radius:50%;background:var(--gold);box-shadow:0 0 10px var(--gold)}
  .st-press{position:relative}
  .st-press::after{content:"";position:absolute;left:0;bottom:-6px;height:2px;width:0;background:var(--gold);border-radius:2px}
  .st-press.holding::after{width:100%;transition:width 1s linear}
  .st-seg{display:flex;gap:4px;background:var(--card2);padding:3px;border-radius:11px;margin-top:10px}
  .st-seg button{flex:1;padding:7px 8px;border-radius:9px;font-size:13px;font-weight:600;color:var(--ink2)}
  .st-seg button.on{background:rgba(255,255,255,.14);color:var(--ink)}
  .st-seg button.gold.on{background:rgba(245,196,81,.2);color:var(--gold)}
  .st-sec{margin-top:26px}
  .st-sech{display:flex;align-items:center;gap:8px;margin:0 0 10px}
  .st-sech .pill{font-size:11px;font-weight:700;letter-spacing:.06em;padding:2px 9px;border-radius:99px;background:color-mix(in srgb,var(--c) 18%,transparent);color:var(--c)}
  .st-sech h2{margin:0;font-size:17px;font-weight:700;flex:1}
  .st-talkbtn{font-size:11.5px!important;font-weight:700;color:var(--gold)!important;border:1px solid rgba(245,196,81,.45)!important;padding:3px 10px;border-radius:99px}
  .st-grid{display:grid;gap:12px}
  @media(min-width:900px){.st-g2{grid-template-columns:1fr 1fr}.st-g3{grid-template-columns:1fr 1fr 1fr}}
  .st-card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px;min-width:0}
  .st-card h3{margin:0 0 2px;font-size:15px;font-weight:700}
  .st-lead{margin:0 0 12px;font-size:12px;color:var(--ink3)}
  .st-note{margin:10px 0 0;font-size:11px;color:var(--ink3);line-height:1.5}
  .st-take{margin:12px 0 0;font-size:13.5px;color:var(--ink2);line-height:1.55}
  .st-take b{color:var(--c);font-weight:700}
  .st-kpis{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}
  @media(min-width:900px){.st-kpis{grid-template-columns:repeat(5,1fr)}}
  .st-kpi{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 14px}
  .st-kpi .l{font-size:11.5px;color:var(--ink2);display:flex;align-items:center;gap:6px}
  .st-kpi .l i{width:6px;height:6px;border-radius:50%;background:var(--c)}
  .st-kpi .v{font-size:30px;font-weight:700;line-height:1.15;color:var(--c)}
  .st-kpi .v small{font-size:12px;color:var(--ink2);font-weight:600;margin-left:2px}
  .st-kpi .s{font-size:11px;color:var(--ink3)}
  .st-kpi.wide{grid-column:1/-1}@media(min-width:900px){.st-kpi.wide{grid-column:auto}}
  .st-hero{display:grid;gap:12px;margin-top:14px}@media(min-width:900px){.st-hero{grid-template-columns:1.2fr 1fr}}
  .st-age{display:flex;align-items:center;gap:14px}
  .st-age .big{font-size:48px;font-weight:700;color:var(--coral);min-width:88px;line-height:1}
  .st-age .big small{font-size:14px;color:var(--ink2);margin-left:2px}
  .st input[type=range]{flex:1;accent-color:var(--c,#ff6b74);height:30px}
  .st-meter{position:relative;height:10px;border-radius:99px;background:var(--card2);margin:10px 0 22px}
  .st-meter .f{height:100%;border-radius:99px;background:var(--coral);transition:width .45s cubic-bezier(.2,.8,.2,1)}
  .st-meter .a{position:absolute;top:-4px;bottom:-4px;width:2px;background:var(--ink)}
  .st-meter .a span{position:absolute;top:16px;left:50%;transform:translateX(-50%);font-size:10.5px;color:var(--ink3);white-space:nowrap}
  .st-ratio{font-size:14px;font-weight:600;margin:0 0 12px}.st-ratio b{color:var(--coral);font-size:20px}
  .st-outs{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .st-out{background:var(--card2);border-radius:12px;padding:9px 10px}
  .st-out .k{font-size:11px;color:var(--ink3)}.st-out .v{font-size:22px;font-weight:700;line-height:1.2}.st-out .s{font-size:10.5px;color:var(--ink3)}
  .st-ctr{display:grid;grid-template-columns:1fr auto;align-items:end;gap:0 10px;margin-bottom:12px}
  .st-ctr .k{font-size:12.5px;color:var(--ink2)}.st-ctr .s{font-size:11px;color:var(--ink3)}
  .st-ctr .v{grid-row:1/3;grid-column:2;font-size:32px;font-weight:700;line-height:1}
  .st-ctr .bar{grid-column:1/-1;height:4px;border-radius:99px;background:var(--card2);overflow:hidden;margin-top:6px}
  .st-ctr .bar i{display:block;height:100%}
  .st-live{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--coral);margin-right:6px;animation:stLive 1.6s ease-in-out infinite}
  @keyframes stLive{0%,100%{opacity:1}50%{opacity:.3}}
  .st-vbars{position:relative;height:190px;display:flex;align-items:flex-end;gap:10px;padding-left:28px;border-bottom:1px solid var(--bar);margin-top:18px}
  .st-vbars .gl{position:absolute;left:28px;right:0;border-top:1px solid rgba(255,255,255,.05)}
  .st-vbars .gl span{position:absolute;left:-28px;top:-8px;width:24px;text-align:right;font-size:10px;color:var(--ink3)}
  .st-vbars .ref{position:absolute;left:28px;right:0;border-top:1.5px dashed var(--ink3);z-index:2}
  .st-vbars .ref span{position:absolute;left:4px;top:-17px;font-size:10.5px;color:var(--ink2)}
  .st-vcol{flex:1;height:100%;position:relative;display:flex;justify-content:center;align-items:flex-end}
  .st-vcol .b{width:min(52px,78%);border-radius:6px 6px 0 0;background:var(--bar);transform-origin:bottom;animation:stGrowY .8s cubic-bezier(.2,.8,.2,1) both;transition:background .3s}
  .st-vcol.hl .b{background:var(--c)}
  .st-vcol .v{position:absolute;left:0;right:0;text-align:center;font-size:14px;font-weight:700}
  .st-vcol.hl .v{color:var(--c)}
  .st-vx{display:flex;gap:10px;padding-left:28px;margin-top:5px}.st-vx span{flex:1;text-align:center;font-size:11px;color:var(--ink3)}
  @keyframes stGrowY{from{transform:scaleY(0)}to{transform:scaleY(1)}}
  .st-hbars{display:flex;flex-direction:column;gap:8px}
  .st-hrow{display:grid;grid-template-columns:72px 1fr 50px;gap:8px;align-items:center;font-size:12.5px}
  .st-hrow .l{color:var(--ink2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .st-hrow .t{height:16px}.st-hrow .b{height:100%;border-radius:0 5px 5px 0;background:var(--bar);transform-origin:left;animation:stGrowX .8s cubic-bezier(.2,.8,.2,1) both;transition:background .3s,width .4s}
  .st-hrow.hl .b{background:var(--c)}.st-hrow.hl .l{color:var(--ink);font-weight:600}
  .st-hrow .v{text-align:right;font-weight:700}.st-hrow.hl .v{color:var(--c)}
  @keyframes stGrowX{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  .st-split{display:flex;gap:2px;height:32px;border-radius:9px;overflow:hidden;font-size:12.5px;font-weight:700}
  .st-split div{display:flex;align-items:center;padding:0 10px}
  .st-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
  .st-stat{background:var(--card2);border-radius:12px;padding:10px 12px}
  .st-stat .n{font-size:24px;font-weight:700;color:var(--c);line-height:1.15;white-space:nowrap}.st-stat .d{font-size:11.5px;color:var(--ink2)}
  .st-quiz{border-radius:18px;overflow:hidden;border:1px solid var(--line);background:var(--card)}
  .st-quiz .top{background:linear-gradient(135deg,#2f6fe0,#52a8ff);padding:14px 16px;display:flex;justify-content:space-between;align-items:center}
  .st-quiz .top b{font-size:15px}.st-qd{display:flex;gap:5px}.st-qd i{width:20px;height:5px;border-radius:99px;background:rgba(255,255,255,.35)}
  .st-qd i.on{background:#fff}.st-qd i.ok{background:#9ff0c2}.st-qd i.no{background:#ffb3b3}
  .st-quiz .body{padding:16px;display:flex;flex-direction:column;gap:12px}
  .st-quiz .q{font-size:16px;font-weight:700;line-height:1.45}
  .st-opts{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .st-opt{padding:12px;border-radius:12px;border:1.5px solid var(--line)!important;background:var(--card2)!important;font-size:14px;font-weight:600;text-align:left}
  .st-opt.right{border-color:#3ccf7a!important;background:rgba(60,207,122,.14)!important}.st-opt.wrong{border-color:#ff6b6b!important;background:rgba(255,107,107,.12)!important}
  .st-reveal{background:rgba(82,168,255,.12);border-radius:12px;padding:12px;font-size:13.5px;line-height:1.55;color:var(--ink2)}
  .st-reveal .big{display:block;font-size:28px;font-weight:700;color:var(--sky);line-height:1.1;margin-bottom:2px}
  .st-btn{padding:9px 16px;border-radius:11px;font-size:13.5px;font-weight:700;background:var(--sky)!important;color:#fff!important}
  .st-btn.ghost{background:var(--card2)!important;color:var(--ink)!important}
  .st-btn.gold{background:var(--gold)!important;color:#1a1405!important}
  .st-row{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
  .st-mapgrid{display:grid;gap:14px}@media(min-width:900px){.st-mapgrid{grid-template-columns:1fr 1fr}}
  .st-map{width:100%;max-width:420px;display:block;margin:0 auto}
  .st-map path{stroke:#05070f;stroke-width:.8;cursor:pointer;transition:fill .35s}
  .st-map path.sel{stroke:#fff;stroke-width:2}
  .st-map rect{fill:none;stroke:rgba(255,255,255,.15);stroke-dasharray:3 3}
  .st-map text{fill:var(--ink3);font-size:11px}
  .st-legend{display:flex;justify-content:center;gap:3px;margin-top:6px;font-size:10.5px;color:var(--ink3)}
  .st-legend span{display:flex;flex-direction:column;align-items:center;gap:2px}.st-legend i{width:40px;height:8px;border-radius:2px}
  .st-cdet{background:rgba(44,201,189,.1);border-radius:14px;padding:12px 14px;display:grid;grid-template-columns:1fr auto;gap:0 10px;align-items:end}
  .st-cdet .nm{font-size:18px;font-weight:700}.st-cdet .rk{font-size:12px;color:var(--ink3)}
  .st-cdet .big{grid-row:1/3;grid-column:2;font-size:36px;font-weight:700;color:var(--teal);line-height:1}
  .st-cdet .big small{font-size:11px;color:var(--ink3);margin-left:2px}
  .st-cdet .cmp{grid-column:1/-1;font-size:12.5px;color:var(--ink2);margin-top:6px}.st-cdet .cmp b{color:var(--ink)}
  .st-rank{margin-top:10px;max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:2px}
  .st-rr{display:grid;grid-template-columns:20px 52px 1fr 38px;gap:8px;align-items:center;font-size:12.5px;padding:4px 6px;border-radius:8px;text-align:left;width:100%}
  .st-rr.on{background:var(--card2);outline:1px solid var(--teal)}
  .st-rr .n{color:var(--ink3)}.st-rr .t i{display:block;height:8px;border-radius:0 3px 3px 0;transition:width .4s}.st-rr .v{text-align:right;font-weight:700}
  .st-chips{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
  .st-chip{padding:5px 12px;border-radius:99px;font-size:12.5px;background:var(--card2)!important;color:var(--ink2)!important}
  .st-chip.on{background:var(--c,#ffc233)!important;color:#14100a!important;font-weight:700}
  .st-plan{width:100%;display:block}
  .st-plan g{cursor:pointer}
  .st-room{background:rgba(255,194,51,.09);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:6px}
  .st-room h4{margin:0;font-size:17px}.st-room .pct{font-size:30px;font-weight:700;color:var(--sun);line-height:1}
  .st-room .pct small{font-size:11.5px;color:var(--ink3);font-weight:500;margin-left:4px}
  .st-room p{margin:0;font-size:13px;color:var(--ink2)}
  .st-room li{list-style:none;background:var(--card2);border-radius:9px;padding:7px 10px;font-size:13px;margin-top:5px}
  .st-room ul{margin:0;padding:0}
  .st-costs{width:100%;border-collapse:collapse;font-size:13px}
  .st-costs td{padding:8px 2px;border-bottom:1px solid var(--line);color:var(--ink2)}
  .st-costs td:last-child{text-align:right;font-weight:700;color:var(--violet);white-space:nowrap}
  .st-calc{background:rgba(157,132,255,.1);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px}
  .st-calc .out{font-size:30px;font-weight:700;color:var(--violet)}.st-calc .out small{font-size:12px;color:var(--ink3);margin-left:4px}
  .st-tip{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px;display:flex;flex-direction:column;gap:8px}
  .st-tip .n{font-size:28px;font-weight:700;color:var(--c);line-height:1}
  .st-tip h4{margin:0;font-size:15px}.st-tip p{margin:0;font-size:13px;color:var(--ink2);line-height:1.6}
  .st-tip .d{font-size:12.5px;color:var(--ink3)}
  .st-foot{margin-top:28px;font-size:11px;color:var(--ink3);line-height:1.6}
  /* 話術 */
  .st-acc{background:var(--card);border:1px solid var(--line);border-radius:16px;margin-bottom:10px;overflow:hidden}
  .st-acc>button{width:100%;display:flex;justify-content:space-between;align-items:center;padding:14px 16px;font-size:15px;font-weight:700;text-align:left}
  .st-acc .inner{padding:0 16px 14px;display:flex;flex-direction:column;gap:8px}
  .st-b-h{font-size:13px;font-weight:700;color:var(--gold);margin-top:6px}
  .st-b-say{position:relative;background:var(--card2);border-radius:12px;padding:10px 12px;font-size:14px;line-height:1.7}
  .st-b-ask{border-left:2px solid var(--sky);padding:2px 0 2px 10px;font-size:13.5px;color:var(--sky)}
  .st-b-note{font-size:12.5px;color:var(--ink3);line-height:1.6}
  .st-b-copy{background:var(--card2);border-radius:12px;padding:10px 12px;font-size:13.5px;line-height:1.7;white-space:pre-wrap}
  .st-b-copy .st-row{margin-top:8px}
  .st-tbl{width:100%;border-collapse:collapse;font-size:12.5px}
  .st-tbl th{text-align:left;color:var(--ink3);font-weight:600;padding:6px 4px;border-bottom:1px solid var(--line)}
  .st-tbl td{padding:6px 4px;border-bottom:1px solid var(--line);color:var(--ink2);vertical-align:top}
  .st-tblwrap{overflow-x:auto}
  .st-sheetbg{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:90;display:flex;align-items:flex-end;justify-content:center}
  .st-sheet{width:100%;max-width:560px;max-height:78vh;overflow-y:auto;background:#10131c;border:1px solid var(--line);border-radius:20px 20px 0 0;padding:16px 16px calc(env(safe-area-inset-bottom,0px) + 18px);animation:stUp .25s ease-out}
  @media(min-width:768px){.st-sheetbg{align-items:center}.st-sheet{border-radius:20px}}
  @keyframes stUp{from{transform:translateY(30px);opacity:.5}to{transform:none;opacity:1}}
  .st-sheet h3{margin:0 0 10px;font-size:16px;color:var(--gold)}
  .st-toast{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 96px);transform:translateX(-50%);background:rgba(20,24,36,.96);border:1px solid var(--line);color:var(--ink);font-size:13px;padding:9px 16px;border-radius:99px;z-index:95;white-space:nowrap}
  @media (prefers-reduced-motion:reduce){.st *{animation:none!important;transition:none!important}}
  `}</style>
);

/* ------------------------------ 圖表元件 ------------------------------ */
const VBars = ({ data, max, ticks, refV, refLabel, hlIdx, dec = 1 }) => (
  <>
    <div className="st-vbars">
      {ticks.map(t => <div key={t} className="gl" style={{ bottom: `${t / max * 100}%` }}><span>{fmt(t)}</span></div>)}
      {refV != null && <div className="ref" style={{ bottom: `${refV / max * 100}%` }}><span>{refLabel}</span></div>}
      {data.map((d, i) => (
        <div key={d.k} className={`st-vcol ${hlIdx.includes(i) ? 'hl' : ''}`}>
          <span className="v num" style={{ bottom: `calc(${d.v / max * 100}% + 4px)` }}>{dec ? d.v.toFixed(dec) : fmt(d.v)}</span>
          <div className="b" style={{ height: `${d.v / max * 100}%`, animationDelay: `${i * 80}ms` }} />
        </div>
      ))}
    </div>
    <div className="st-vx">{data.map(d => <span key={d.k}>{d.k}</span>)}</div>
  </>
);
const HBars = ({ data, max, hlIdx, label = d => d.v.toFixed(1) }) => (
  <div className="st-hbars">
    {data.map((d, i) => (
      <div key={d.k} className={`st-hrow ${hlIdx.includes(i) ? 'hl' : ''}`}>
        <span className="l">{d.k}</span>
        <div className="t"><div className="b" style={{ width: `${d.v / max * 100}%`, animationDelay: `${i * 60}ms` }} /></div>
        <span className="v num">{label(d)}</span>
      </div>
    ))}
  </div>
);
const ShareLine = () => {
  const W = 320, H = 170, L = 30, R = 14, T = 22, B = 24;
  const x = y => L + (y - 2016) / 8 * (W - L - R), y = v => T + (1 - v / 16) * (H - T - B);
  const d = 'M' + SHARE_TREND.map(p => `${x(p[0])},${y(p[1])}`).join(' L');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }} role="img" aria-label="長輩肇事占比 2016 年 9.1% 升到 2024 年 14.9%">
      {[0, 8, 16].map(t => <g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,.06)" /><text x={L - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="rgba(242,244,248,.42)">{t}%</text></g>)}
      {[2016, 2020, 2024].map(t => <text key={t} x={x(t)} y={H - 6} textAnchor="middle" fontSize="10" fill="rgba(242,244,248,.42)">{t}</text>)}
      <path d={`M${x(2016)},${y(0)} ` + SHARE_TREND.map(p => `L${x(p[0])},${y(p[1])}`).join(' ') + ` L${x(2024)},${y(0)} Z`} fill="#2cc9bd" opacity=".14" />
      <path d={d} fill="none" stroke="#2cc9bd" strokeWidth="2.5" strokeLinecap="round" />
      {SHARE_TREND.map((p, i) => {
        const last = i === SHARE_TREND.length - 1;
        return <g key={p[0]}><circle cx={x(p[0])} cy={y(p[1])} r={last ? 5 : 3.5} fill={last ? '#2cc9bd' : '#05070f'} stroke="#2cc9bd" strokeWidth="2" />
          <text x={x(p[0])} y={i === 1 ? y(p[1]) + 18 : y(p[1]) - 9} textAnchor={last ? 'end' : 'middle'} fontSize="12" fontWeight="700" fill="#f2f4f8">{p[1].toFixed(1)}%</text></g>;
      })}
    </svg>
  );
};

/* ------------------------------ 區塊 ------------------------------ */
const SecHead = ({ color, pill, title, talkKey, agent, onTalk }) => (
  <div className="st-sech" style={{ '--c': color }}>
    <span className="pill">{pill}</span><h2>{title}</h2>
    {agent && talkKey && <button className="st-talkbtn" onClick={() => onTalk(talkKey)}>話術</button>}
  </div>
);

function AgeAndLive() {
  const [age, setAge] = useState(65);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const g = age < 25 ? 0 : age < 45 ? 1 : age < 65 ? 2 : 3, r = AGE_RATES[g].v, ratio = r / NATIONAL_ACC;
  const start = Date.UTC(new Date(now).getUTCFullYear(), 0, 1) - 8 * 3600e3;
  const days = (now - start) / 864e5;
  const ctrs = [['因意外過世', 6678, '#ff6b74', '平均每 79 分鐘 1 人'], ['因交通事故過世', 2858, '#2cc9bd', '平均每 3 小時 1 人'], ['因跌倒過世', 1632, '#ffc233', '平均每 5.4 小時 1 人']];
  return (
    <div className="st-hero">
      <div className="st-card" style={{ '--c': '#ff6b74' }}>
        <h3>輸入年齡，看看風險</h3>
        <div className="st-age"><div className="big num">{age}<small>歲</small></div>
          <input type="range" min="20" max="95" value={age} onChange={e => setAge(+e.target.value)} aria-label="選擇年齡" /></div>
        <div className="st-meter"><div className="f" style={{ width: `${r / 90 * 100}%` }} /><div className="a" style={{ left: `${NATIONAL_ACC / 90 * 100}%` }}><span>全國平均 28.6</span></div></div>
        <p className="st-ratio">{ratio >= 1.05 ? <>意外死亡率是全國平均的 <b className="num">{ratio.toFixed(1)}</b> 倍</> : <>低於全國平均（<b className="num">{ratio.toFixed(1)}</b> 倍），年紀越大會越高</>}</p>
        <div className="st-outs">
          <div className="st-out"><div className="k">事故死亡率</div><div className="v num" style={{ color: '#ff6b74' }}>{r.toFixed(1)}</div><div className="s">每 10 萬人</div></div>
          <div className="st-out"><div className="k">一年內跌倒</div><div className="v num" style={{ color: '#ffc233' }}>{age >= 65 ? '21%' : age >= 50 ? '10%' : '—'}</div><div className="s">{age >= 65 ? '約每 5 人 1 人' : age >= 50 ? '約每 10 人 1 人' : '50 歲後上升'}</div></div>
          <div className="st-out"><div className="k">交通死亡率</div><div className="v num" style={{ color: '#2cc9bd' }}>{age >= 65 ? '26.6' : '9.7–13.6'}</div><div className="s">{age >= 65 ? '成年人的 2.7 倍' : '青年與成年'}</div></div>
        </div>
      </div>
      <div className="st-card">
        <h3><span className="st-live" />今年到現在</h3>
        <p className="st-lead">以 2025 年全年人數平均推算，不是即時通報數字</p>
        {ctrs.map(([k, y, c, s]) => { const v = days * y / 365; return (
          <div className="st-ctr" key={k}><span className="k">{k}</span><span className="s">{s}</span>
            <span className="v num" style={{ color: c }}>{fmt(Math.floor(v))}</span>
            <div className="bar"><i style={{ width: `${(v % 1) * 100}%`, background: c }} /></div></div>); })}
      </div>
    </div>
  );
}

function Quiz({ onDone }) {
  const [i, setI] = useState(0), [pick, setPick] = useState(null), [res, setRes] = useState([]);
  const score = res.filter(Boolean).length;
  const reset = () => { setI(0); setPick(null); setRes([]); };
  return (
    <div className="st-quiz">
      <div className="top"><b>猜猜看｜4 題小測驗</b><div className="st-qd">{QUIZ.map((_, k) => <i key={k} className={res[k] === true ? 'ok' : res[k] === false ? 'no' : k === i ? 'on' : ''} />)}</div></div>
      <div className="body">
        {i >= QUIZ.length ? (<>
          <div className="q">答對 <span className="num" style={{ fontSize: 30, color: '#52a8ff' }}>{score}</span> / 4 題</div>
          <div className="st-reveal">{score === 4 ? '全部答對！' : score >= 2 ? '不錯！有幾題和一般印象不太一樣。' : '很多人都猜錯，這些數字其實很少人知道。'}下面有更多數據，也可以看看居家防跌地圖。</div>
          <div className="st-row"><button className="st-btn ghost" onClick={onDone}>看安心小常識</button><button className="st-btn" onClick={reset}>再玩一次</button></div>
        </>) : (<>
          <div className="q">{QUIZ[i].q}</div>
          <div className="st-opts">{QUIZ[i].o.map((o, k) => (
            <button key={o} disabled={pick != null} className={`st-opt ${pick != null && k === QUIZ[i].a ? 'right' : ''} ${pick === k && k !== QUIZ[i].a ? 'wrong' : ''}`}
              onClick={() => { setPick(k); setRes(r => { const n = [...r]; n[i] = k === QUIZ[i].a; return n; }); }}>{o}</button>))}</div>
          {pick != null && <>
            <div className="st-reveal"><span className="big num">{QUIZ[i].big}</span>{pick === QUIZ[i].a ? '答對了！' : `正確答案是「${QUIZ[i].o[QUIZ[i].a]}」。`}{QUIZ[i].e}</div>
            <div className="st-row"><button className="st-btn" onClick={() => { setI(i + 1); setPick(null); }}>{i < QUIZ.length - 1 ? '下一題' : '看結果'}</button></div>
          </>}
        </>)}
      </div>
    </div>
  );
}

function HomeMap() {
  const [sel, setSel] = useState('bed');
  const r = ROOMS.find(x => x.id === sel);
  return (
    <div className="st-card" style={{ '--c': '#ffc233', marginTop: 12 }}>
      <h3>居家防跌地圖</h3><p className="st-lead">點一個空間，看那裡的跌倒風險和防跌提醒</p>
      <div className="st-chips">{ROOMS.map(x => <button key={x.id} className={`st-chip ${x.id === sel ? 'on' : ''}`} onClick={() => setSel(x.id)}>{x.name}</button>)}</div>
      <div className="st-grid st-g2">
        <svg className="st-plan" viewBox="0 0 600 380" role="img" aria-label="居家平面圖">
          {ROOMS.map(x => (
            <g key={x.id} onClick={() => setSel(x.id)}>
              <rect x={x.x} y={x.y} width={x.w} height={x.h} rx="10" fill={`rgba(255,194,51,${x.p ? 0.18 + x.p / 36 * 0.62 : 0.1})`} stroke={x.id === sel ? '#fff' : '#05070f'} strokeWidth={x.id === sel ? 3 : 6} />
              <text x={x.x + x.w / 2} y={x.y + x.h / 2 - (x.p ? 6 : -6)} textAnchor="middle" fontSize="17" fontWeight="700" fill={x.p ? '#16110a' : '#f2f4f8'}>{x.name}</text>
              {x.p && <text x={x.x + x.w / 2} y={x.y + x.h / 2 + 22} textAnchor="middle" fontSize="22" fontWeight="700" fill="#16110a">{x.p}%</text>}
            </g>
          ))}
        </svg>
        <div className="st-room">
          <h4>{r.name}</h4>
          {r.p && <div className="pct num">{r.p}%<small>室內跌倒發生在這裡</small></div>}
          <p>{r.risk}</p>
          <ul>{r.tips.map(t => <li key={t}>✓ {t}</li>)}</ul>
        </div>
      </div>
      <p className="st-note">百分比為長者室內跌倒發生地點占比；廚房、樓梯、陽台未單獨統計。</p>
    </div>
  );
}

function CountyMap() {
  const [metric, setMetric] = useState('rate'), [sel, setSel] = useState('屏東縣');
  const m = METRICS[metric];
  const sorted = useMemo(() => [...COUNTY].sort((a, b) => b[metric] - a[metric]), [metric]);
  const d = COUNTY.find(c => c.n === sel), rank = sorted.indexOf(d) + 1, ratio = d[metric] / m.avg;
  const paths = Object.entries(TW_MAP);
  return (
    <div className="st-card" style={{ '--c': '#2cc9bd' }}>
      <h3>各縣市交通事故死亡地圖</h3><p className="st-lead">2025 年全年（交通部初估值）｜點縣市看細節</p>
      <div className="st-seg" style={{ marginTop: 0, marginBottom: 12 }}>
        {Object.entries(METRICS).map(([k, v]) => <button key={k} className={metric === k ? 'on' : ''} onClick={() => setMetric(k)}>{v.label}</button>)}
      </div>
      <div className="st-mapgrid">
        <div>
          <svg className="st-map" viewBox="0 84 400 392" role="img" aria-label="台灣各縣市交通事故死亡地圖">
            {paths.filter(([, g]) => g.inset).map(([n, g]) => { const [[x0, y0], [x1, y1]] = g.inset; return <g key={'i' + n}><rect x={x0 - 6} y={y0 - 16} width={x1 - x0 + 12} height={y1 - y0 + 22} rx="6" /><text x={x0 - 2} y={y0 - 4}>{n}</text></g>; })}
            {[...paths.filter(([n]) => n !== sel), ...paths.filter(([n]) => n === sel)].map(([n, g]) => {
              const c = COUNTY.find(x => x.n === n);
              return <path key={n} d={g.d} className={n === sel ? 'sel' : ''} fill={c ? RAMP[cls(c[metric], m.brk)] : 'rgba(255,255,255,.12)'} onClick={() => c && setSel(n)}><title>{c ? `${n}：${m.fmt(c[metric])}${m.unit}` : `${n}：人口不足 10 萬，不計算`}</title></path>;
            })}
          </svg>
          <div className="st-legend">{m.lab.map((l, i) => <span key={l}><i style={{ background: RAMP[i] }} />{l}</span>)}</div>
        </div>
        <div>
          <div className="st-cdet">
            <span className="nm">{d.n}</span><span className="big num">{m.fmt(d[metric])}<small>{m.unit}</small></span>
            <span className="rk">全國第 {rank} 高（共 21 縣市）</span>
            <span className="cmp">{metric === 'rate'
              ? <>{ratio >= 1.1 ? <>是全國平均的 <b>{ratio.toFixed(1)} 倍</b></> : ratio <= 0.9 ? <>低於全國平均</> : <>和全國平均差不多</>}，是臺北市的 <b>{(d.rate / 4.64).toFixed(1)} 倍</b>。{m.avgLabel}。</>
              : <>每 10 位交通死者，約有 <b>{Math.round(d.share / 10)} 位</b>是 65 歲以上長輩。{m.avgLabel}。</>}</span>
          </div>
          <div className="st-rank">{sorted.map((c, i) => (
            <button key={c.n} className={`st-rr ${c.n === sel ? 'on' : ''}`} onClick={() => setSel(c.n)}>
              <span className="n num">{i + 1}</span><span>{c.n}</span>
              <span className="t"><i style={{ width: `${c[metric] / sorted[0][metric] * 100}%`, background: RAMP[cls(c[metric], m.brk)] }} /></span>
              <span className="v num">{m.fmt(c[metric])}</span>
            </button>))}</div>
        </div>
      </div>
      <p className="st-note">「長輩占死者比例」＝65 歲以上死者 ÷ 全部死者。連江縣人口不足 10 萬，不計算比率。</p>
    </div>
  );
}

function CareCalc() {
  const [care, setCare] = useState([3000, 5000]), [days, setDays] = useState(14);
  return (
    <div className="st-card" style={{ '--c': '#9d84ff' }}>
      <h3>住院看護費試算</h3><p className="st-lead">選看護類型、拉住院天數</p>
      <div className="st-calc">
        <div className="st-seg" style={{ marginTop: 0 }}>
          <button className={care[0] === 3000 ? 'on' : ''} onClick={() => setCare([3000, 5000])}>全日 24 小時</button>
          <button className={care[0] === 2000 ? 'on' : ''} onClick={() => setCare([2000, 3000])}>半日 12 小時</button>
        </div>
        <div className="st-age"><span style={{ fontSize: 13, color: 'var(--ink2)' }}>住院天數</span>
          <input type="range" min="1" max="60" value={days} onChange={e => setDays(+e.target.value)} aria-label="住院天數" />
          <b className="num" style={{ fontSize: 20, minWidth: 54, textAlign: 'right' }}>{days} 天</b></div>
        <div className="out num">{fmt(care[0] * days)}–{fmt(care[1] * days)}<small>元</small></div>
        <span style={{ fontSize: 12, color: 'var(--ink3)' }}>約等於 {(care[0] * days / 30000).toFixed(1)}–{(care[1] * days / 30000).toFixed(1)} 個月的外籍看護費（以每月 3 萬元計）</span>
      </div>
      <p className="st-take">髖部骨折手術住院約一週，出院後常需要<b>數週到數月</b>的照顧。</p>
    </div>
  );
}

/* ------------------------------ 話術 ------------------------------ */
function ScriptBlocks({ blocks, onCopy }) {
  return blocks.map((b, i) => {
    if (b.type === 'h') return <div key={i} className="st-b-h">{b.text}</div>;
    if (b.type === 'say') return <div key={i} className="st-b-say">「{b.text}」</div>;
    if (b.type === 'ask') return <div key={i} className="st-b-ask">問：{b.text}</div>;
    if (b.type === 'note') return <div key={i} className="st-b-note">{b.text}</div>;
    if (b.type === 'copy') return <div key={i} className="st-b-copy">{b.text}<div className="st-row"><button className="st-btn gold" onClick={() => onCopy(b.text)}>複製</button></div></div>;
    if (b.type === 'table') return <div key={i} className="st-tblwrap"><table className="st-tbl"><thead><tr>{b.head.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{b.rows.map((r, k) => <tr key={k}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody></table></div>;
    return null;
  });
}
function ScriptTab({ openId, onCopy }) {
  const [open, setOpen] = useState(openId || 'open');
  useEffect(() => { if (openId) setOpen(openId); }, [openId]);
  return (
    <div className="st-sec">
      {SUPA_SCRIPT.map(s => (
        <div className="st-acc" key={s.id} id={`st-s-${s.id}`}>
          <button onClick={() => setOpen(open === s.id ? null : s.id)}><span>{s.title}</span><span style={{ color: 'var(--ink3)' }}>{open === s.id ? '－' : '＋'}</span></button>
          {open === s.id && <div className="inner"><ScriptBlocks blocks={s.blocks} onCopy={onCopy} /></div>}
        </div>
      ))}
      <p className="st-foot">依南山人壽長享平安終身傷害保險（SUPA）DM PA-01-480（2026 年 10 月版）。詳細給付與限制以保單條款為準。</p>
    </div>
  );
}

/* ------------------------------ 主頁：意外風險 ------------------------------ */
function AccidentTool({ onBack }) {
  const [agent, setAgent] = useState(false);
  const [tab, setTab] = useState('data'); // data | tips | script
  const [holding, setHolding] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [toast, setToast] = useState('');
  const [scriptOpen, setScriptOpen] = useState(null);
  const timer = useRef(null), toastT = useRef(null);

  const showToast = msg => { setToast(msg); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(''), 1800); };
  const setAgentMode = on => {
    setAgent(on);
    if (!on) { setSheet(null); setTab(t => (t === 'script' ? 'data' : t)); }
  };
  // 長按標題 1 秒切換業務模式
  const startHold = () => {
    setHolding(true);
    timer.current = setTimeout(() => {
      setHolding(false);
      setAgent(prev => {
        const next = !prev;
        try { navigator.vibrate && navigator.vibrate(25); } catch (e) { /* 不支援震動 */ }
        showToast(next ? '業務模式已開啟' : '已回到客戶模式');
        if (!next) { setSheet(null); setTab(t => (t === 'script' ? 'data' : t)); }
        return next;
      });
    }, 1000);
  };
  const endHold = () => { clearTimeout(timer.current); setHolding(false); };
  // 切到背景或鎖螢幕 → 自動回到客戶模式；離開頁面時元件卸載，狀態自然清掉
  useEffect(() => {
    const onVis = () => { if (document.hidden) setAgentMode(false); };
    document.addEventListener('visibilitychange', onVis);
    return () => { document.removeEventListener('visibilitychange', onVis); clearTimeout(timer.current); clearTimeout(toastT.current); };
  }, []);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [tab]);

  const onCopy = async text => showToast((await copyText(text)) ? '已複製，可以貼到 LINE' : '複製失敗，請長按文字自行複製');
  const openTalk = key => setSheet(key);
  const sh = { agent, onTalk: openTalk };

  return (
    <div>
      <div className="st-head">
        <div className="st-headrow">
          <button className="st-back" onClick={onBack} aria-label="回到銷售工具">‹</button>
          <div className={`st-title st-press ${holding ? 'holding' : ''}`}
            onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
            onContextMenu={e => e.preventDefault()}>
            <h1>台灣意外風險{agent && <span className="st-dot" title="業務模式" />}</h1>
            <p>衛福部、國健署、交通部公開統計</p>
          </div>
        </div>
        <div className="st-seg">
          <button className={tab === 'data' ? 'on' : ''} onClick={() => setTab('data')}>數據總覽</button>
          <button className={tab === 'tips' ? 'on' : ''} onClick={() => setTab('tips')}>安心小常識</button>
          {agent && <button className={`gold ${tab === 'script' ? 'on' : ''}`} onClick={() => setTab('script')}>話術</button>}
        </div>
      </div>

      {tab === 'data' && <>
        <AgeAndLive />
        <div className="st-kpis">
          {[['一年因意外過世', '6,678', '人', '2025 年｜十大死因第 7 位', '#ff6b74', 'wide'], ['65 歲以上意外死亡率', '77.0', '/10萬', '全國平均的 2.7 倍', '#ff6b74'], ['跌倒死亡', '1,632', '人', '平均每天約 4.5 人', '#ffc233'], ['道路交通死亡', '2,858', '人', '2025 年｜30 日內死亡', '#2cc9bd'], ['交通死亡中的長輩', '45', '%', '2026 年 1–6 月｜598/1,333', '#2cc9bd']]
            .map(([l, v, u, s, c, w]) => <div key={l} className={`st-kpi ${w || ''}`} style={{ '--c': c }}><div className="l"><i />{l}</div><div className="v num">{v}<small>{u}</small></div><div className="s">{s}</div></div>)}
        </div>

        <div className="st-sec"><SecHead color="#52a8ff" pill="猜猜看" title="你對意外風險了解多少？" talkKey="quiz" {...sh} /><Quiz onDone={() => setTab('tips')} /></div>

        <div className="st-sec" style={{ '--c': '#ff6b74' }}>
          <SecHead color="#ff6b74" pill="年齡風險" title="年紀越大，意外越致命" talkKey="age" {...sh} />
          <div className="st-grid st-g2">
            <div className="st-card"><h3>各年齡層事故傷害死亡率</h3><p className="st-lead">每 10 萬人｜2025 年</p>
              <VBars data={AGE_RATES} max={90} ticks={[0, 40, 80]} refV={NATIONAL_ACC} refLabel="全國平均 28.6" hlIdx={[3]} />
              <p className="st-take">65 歲以上是 45–64 歲的 <b>3 倍</b>，是 0–24 歲的 <b>9 倍</b>。</p></div>
            <div className="st-card"><h3>事故傷害死亡原因</h3><p className="st-lead">2025 年全國 6,678 人</p>
              <HBars data={ACC_TYPES} max={2900} hlIdx={[0, 1]} label={d => fmt(d.v)} />
              <p className="st-take">交通和跌倒兩項加起來占了 <b>66%</b>。</p></div>
          </div>
        </div>

        <div className="st-sec" style={{ '--c': '#ffc233' }}>
          <SecHead color="#ffc233" pill="跌倒" title="一半發生在家裡" talkKey="fall" {...sh} />
          <div className="st-grid st-g3">
            <div className="st-card"><h3>一年內曾跌倒的比例</h3><p className="st-lead">研究調查｜依年齡</p>
              <HBars data={[{ k: '50–64 歲', v: 10.28 }, { k: '65 歲以上', v: 21.24 }]} max={25} hlIdx={[1]} label={d => d.v.toFixed(1) + '%'} />
              <p className="st-take">過了 65 歲，跌倒機率<b>翻倍</b>。</p></div>
            <div className="st-card"><h3>在哪裡跌倒</h3><p className="st-lead">65 歲以上長者</p>
              <div className="st-split"><div style={{ flex: 52, background: '#ffc233', color: '#16110a' }}>室內 52%</div><div style={{ flex: 48, background: 'rgba(255,194,51,.25)' }}>室外 48%</div></div>
              <div className="st-stats"><div className="st-stat"><div className="n num">1/6</div><div className="d">一年內跌倒過</div></div><div className="st-stat"><div className="n num">1/12</div><div className="d">因跌倒就醫</div></div></div></div>
            <div className="st-card"><h3>跌倒之後</h3><p className="st-lead">髖部骨折是最嚴重的後果之一</p>
              <div className="st-stats" style={{ marginTop: 0 }}>
                <div className="st-stat"><div className="n num">90%+</div><div className="d">髖部骨折由跌倒造成</div></div>
                <div className="st-stat"><div className="n num">14–36%</div><div className="d">骨折後一年內死亡率</div></div>
              </div></div>
          </div>
          {agent && <div className="st-sech" style={{ marginTop: 12, justifyContent: 'flex-end' }}><button className="st-talkbtn" onClick={() => openTalk('home')}>防跌地圖話術</button></div>}
          <HomeMap />
        </div>

        <div className="st-sec" style={{ '--c': '#2cc9bd' }}>
          <SecHead color="#2cc9bd" pill="交通" title="長輩占比持續上升" talkKey="traffic" {...sh} />
          <CountyMap />
          <div className="st-grid st-g3" style={{ marginTop: 12 }}>
            <div className="st-card"><h3>各年齡層交通死亡率</h3><p className="st-lead">每 10 萬人｜2025 年</p>
              <HBars data={TRAFFIC_AGE} max={30} hlIdx={[0]} />
              <p className="st-take">長輩約是青年的 <b>2 倍</b>、成年人的 <b>2.7 倍</b>。</p></div>
            <div className="st-card"><h3>長輩當肇事第一當事人的比例</h3><p className="st-lead">占全體 A1+A2 事故件數</p><ShareLine />
              <p className="st-take">十年內由 <b>9.1%</b> 升到 <b>14.9%</b>。</p></div>
            <div className="st-card"><h3>高齡者肇事造成的死亡人數</h3><p className="st-lead">每年</p>
              <VBars data={ELDER_DEATHS} max={1000} ticks={[0, 500, 1000]} hlIdx={[4]} dec={0} />
              <p className="st-take">每年約 <b>800 人</b>死於高齡者肇事的事故。</p></div>
          </div>
        </div>

        <div className="st-sec" style={{ '--c': '#9d84ff' }}>
          <SecHead color="#9d84ff" pill="醫療與照護" title="意外之後的花費" talkKey="cost" {...sh} />
          <div className="st-grid st-g2">
            <div className="st-card"><h3>照護與醫療行情</h3><p className="st-lead">市場行情，實際依地區與個案不同</p>
              <table className="st-costs"><tbody>{COSTS.map(([k, v]) => <tr key={k}><td>{k}</td><td className="num">{v}</td></tr>)}</tbody></table></div>
            <CareCalc />
          </div>
        </div>
        <p className="st-foot">{SOURCES}</p>
      </>}

      {tab === 'tips' && <div className="st-sec">
        <div className="st-grid st-g2">
          {TIPS.map((t, i) => {
            const c = ['#ff6b74', '#ffc233', '#2cc9bd', '#9d84ff'][i];
            const text = `${t.h}\n${t.q}\n👉 ${t.d}\n（資料來源：衛福部、國健署、交通部公開統計）`;
            return <div key={t.h} className="st-tip" style={{ '--c': c }}><div className="n num">{t.n}</div><h4>{t.h}</h4><p>{t.q}</p><div className="d">可以這樣做：{t.d}</div>
              <div className="st-row"><button className="st-btn" style={{ background: c, color: '#0c0c10' }} onClick={() => onCopy(text)}>傳給家人</button></div></div>;
          })}
        </div>
        <p className="st-foot">防跌建議為一般居家安全常識，個人狀況請諮詢醫師或物理治療師。</p>
      </div>}

      {tab === 'script' && agent && <ScriptTab openId={scriptOpen} onCopy={onCopy} />}

      {sheet && agent && SECTION_TALK[sheet] && (
        <div className="st-sheetbg" onClick={() => setSheet(null)}>
          <div className="st-sheet" onClick={e => e.stopPropagation()}>
            <h3>話術｜{SECTION_TALK[sheet].title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SECTION_TALK[sheet].lines.map((l, i) => <div key={i} className={l.startsWith('問：') ? 'st-b-ask' : 'st-b-say'}>{l.startsWith('問：') ? l : l}</div>)}
            </div>
            <div className="st-row" style={{ marginTop: 12 }}>
              <button className="st-btn ghost" onClick={() => setSheet(null)}>關閉</button>
              <button className="st-btn gold" onClick={() => { setScriptOpen(SECTION_TALK[sheet].scriptId); setSheet(null); setTab('script'); }}>看完整話術</button>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="st-toast">{toast}</div>}
    </div>
  );
}

/* ------------------------------ 入口：工具清單 ------------------------------ */
export default function SalesTools() {
  const [tool, setTool] = useState(null);
  return (
    <div className="st">
      <Style />
      {tool === 'accident' ? <AccidentTool onBack={() => setTool(null)} /> : (
        <div className="st-list">
          <h1>銷售工具</h1>
          <p style={{ margin: '0 0 6px', fontSize: 13, color: 'var(--ink3)' }}>面談時打開給客戶看。進入工具後，長按標題 1 秒可切換業務模式。</p>
          <button className="st-tool" onClick={() => setTool('accident')}>
            <span className="ic" style={{ background: 'rgba(255,107,116,.16)', color: '#ff6b74' }}>⚠︎</span>
            <span><h3>意外風險｜長享平安</h3><p>年齡風險、跌倒、交通地圖、看護費試算</p></span>
          </button>
          <div className="st-tool off"><span className="ic" style={{ background: 'rgba(157,132,255,.16)', color: '#9d84ff' }}>♡</span><span><h3>長期照顧</h3><p>即將推出</p></span></div>
          <div className="st-tool off"><span className="ic" style={{ background: 'rgba(82,168,255,.16)', color: '#52a8ff' }}>✚</span><span><h3>重大傷病</h3><p>即將推出</p></span></div>
        </div>
      )}
    </div>
  );
}
