import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BookOpen, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit3,
  Target,
  Crown,
  Calendar,
  CheckCircle2,
  Leaf,
  Loader2,
  UserPlus,
  CheckSquare,
  Square,
  Clock,
  X,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Filter,
  ListPlus,
  Activity,
  AlertTriangle,
  Gift,
  LogOut,
  Settings
} from 'lucide-react';
import { 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  writeBatch,
  Timestamp,
  setDoc
} from 'firebase/firestore';

// --- Firebase Initialization (User Provided) ---
const firebaseConfig = { 
  apiKey: "AIzaSyAfRqL4VEB4zHWvQqhpMMZoa82Oe_KbxhU", 
  authDomain: "mydatabase-66a3a.firebaseapp.com", 
  projectId: "mydatabase-66a3a", 
  storageBucket: "mydatabase-66a3a.firebasestorage.app", 
  messagingSenderId: "335729896817", 
  appId: "1:335729896817:web:78098d5189dcd5ca0b5ad0" 
}; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
  console.log("目前使用者:", user);
});

// --- Constants & Configs ---
const getTodayDate = () => new Date().toISOString().split('T')[0];
const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

const COMPETITION_START_H1 = '2026-01';
const COMPETITION_START_H2 = '2026-07';

const AVAILABLE_MONTHS_H1 = [
  { value: '2026-01', label: '115年 01月' },
  { value: '2026-02', label: '115年 02月' },
  { value: '2026-03', label: '115年 03月' },
  { value: '2026-04', label: '115年 04月' },
  { value: '2026-05', label: '115年 05月' },
  { value: '2026-06', label: '115年 06月' },
];

const AVAILABLE_MONTHS_H2 = [
  { value: '2026-07', label: '115年 07月' },
  { value: '2026-08', label: '115年 08月' },
  { value: '2026-09', label: '115年 09月' },
  { value: '2026-10', label: '115年 10月' },
  { value: '2026-11', label: '115年 11月' },
  { value: '2026-12', label: '115年 12月' },
];

// 組合所有月份給通用元件使用 (年度回顧使用)
const ALL_AVAILABLE_MONTHS = [...AVAILABLE_MONTHS_H1, ...AVAILABLE_MONTHS_H2];

// 上半年目標 (僅加權保費標，維持原邏輯不變，確保 H1 歷史資料呈現不受影響)
// 這些是「預設值」，實際使用的數值可在「競賽設定」頁面調整並存到 Firebase，調整後不需要改程式碼
const DEFAULT_RANK_TARGETS_H1 = {
  '業務代表': { peak: { total: 2400000, ah: 1000000 }, summit: { total: 5500000, ah: 2300000 } },
  '業務主任': { peak: { total: 3500000, ah: 1300000 }, summit: { total: 8050000, ah: 3000000 } },
  '業務襄理': { peak: { total: 4250000, ah: 1500000 }, summit: { total: 9800000, ah: 3450000 } },
  '區經理':   { peak: { total: 4250000, ah: 1500000 }, summit: { total: 9800000, ah: 3450000 } },
  '處經理':   { peak: { total: 4250000, ah: 1500000 }, summit: { total: 9800000, ah: 3450000 } },
};

// 下半年新高峰/新極峰目標 (AH不設限)
// 「任一標達成」：加權保費(total) 或 實收保費(actualPremium) 任一達成即算合格
// actualPremium 為 0 代表該職級競賽辦法未設實收保費標準 (依 115 下半年公告)
const DEFAULT_RANK_TARGETS_H2 = {
  '新進業代':     { peak: { total: 1800000, ah: 0, actualPremium: 0 },        summit: { total: 4500000, ah: 0, actualPremium: 0 } },
  '業務代表':     { peak: { total: 2200000, ah: 0, actualPremium: 16000000 }, summit: { total: 5500000, ah: 0, actualPremium: 40000000 } },
  '新進業務主任': { peak: { total: 2350000, ah: 0, actualPremium: 20000000 }, summit: { total: 5900000, ah: 0, actualPremium: 50000000 } },
  '業務主任':     { peak: { total: 2650000, ah: 0, actualPremium: 20000000 }, summit: { total: 6650000, ah: 0, actualPremium: 50000000 } },
  '業務襄理':     { peak: { total: 3200000, ah: 0, actualPremium: 23000000 }, summit: { total: 8000000, ah: 0, actualPremium: 57500000 } },
  '區經理':       { peak: { total: 4000000, ah: 0, actualPremium: 28000000 }, summit: { total: 10000000, ah: 0, actualPremium: 70000000 } },
  '處經理':       { peak: { total: 4000000, ah: 0, actualPremium: 28000000 }, summit: { total: 10000000, ah: 0, actualPremium: 70000000 } },
};

// 下半年「業務主管雙倍獎」(僅主管職級適用：主任(含新進)、襄理、區經理、處經理)
// 標準 = 新高峰會員加權/實收標準 x2 (依 115 下半年公告圖卡)
const DEFAULT_DOUBLE_AWARD_H2 = {
  '新進業務主任': { total: 4700000, actualPremium: 40000000 },
  '業務主任':     { total: 5300000, actualPremium: 40000000 },
  '業務襄理':     { total: 6400000, actualPremium: 46000000 },
  '區經理':       { total: 8000000, actualPremium: 56000000 },
  '處經理':       { total: 8000000, actualPremium: 56000000 }, // 圖卡未列處經理，暫沿用區經理標準，如有正式公告請調整
};

// H2 專屬職級映射 (針對名單動態給予正確的「競賽分組」標準，不影響組織圖上的實際職級)
const H2_ROLE_MAPPING = {
  '吳政翰': '區經理',
  '李冠葒': '新進業務主任',
  '陳鈺雯': '新進業務主任',
  '莊唯妮': '業務主任',
  '尤咨穎': '業務代表',
  '陳怡秀': '業務代表',
  '許慧晴': '新進業代',
  '楊雅涵': '新進業代',
  '蘇暐翔': '新進業代'
};

const RANKS = ['處經理', '區經理', '業務襄理', '業務主任', '新進業務主任', '業務代表', '新進業代'];
const MANAGER_RANKS = ['業務主任', '新進業務主任', '業務襄理', '區經理', '處經理'];
const RECRUIT_STATUSES = ['新名單', '臨時帳號', '內考', '外考', '登錄', '優培'];

const PRODUCT_MAPPING = {
  'ah_general': { label: '一般 A&H (300%)', rate: 3.0, isAH: true },
  'ah_2':       { label: '2年期 A&H (60%)', rate: 0.6, isAH: true },
  'long_20':    { label: '期繳 20年 (300%)', rate: 3.0, isAH: false },
  'long_10':    { label: '期繳 10年 (200%)', rate: 2.0, isAH: false },
  'long_6':     { label: '期繳 6年 (100%)', rate: 1.0, isAH: false },
  'long_2':     { label: '期繳 2年 (20%)', rate: 0.2, isAH: false },
  'one_off':    { label: '躉繳 (5%)', rate: 0.05, isAH: false },
};

const PRODUCT_TYPES_OPTIONS = Object.entries(PRODUCT_MAPPING).map(([key, val]) => ({ code: key, ...val }));
const INITIAL_DOCS = [
  { id: 1, tag: '行政', title: '115年 上半年競賽辦法詳解', date: '01月02日', color: 'bg-red-100 text-red-700' },
  { id: 2, tag: '商品', title: '新春長照險銷售懶人包', date: '01月15日', color: 'bg-emerald-100 text-emerald-700' },
];

const formatMoney = (num) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', minimumFractionDigits: 0 }).format(num || 0);

// --- 密碼加密工具 (使用瀏覽器內建 Web Crypto API，PBKDF2 + 隨機鹽值，密碼不會以明碼儲存) ---
const generateSalt = () => {
  const arr = new Uint8Array(16);
  window.crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
};

const generateToken = () => {
  const arr = new Uint8Array(24);
  window.crypto.getRandomValues(arr);
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
};

const hashPassword = async (password, salt) => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey('raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const bits = await window.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
    keyMaterial, 256
  );
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
};

// --- Shared UI Components ---
const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 ${className}`}>
    {children}
  </div>
);

const DoubleRadialProgress = ({ peakPercent, summitPercent, size=180 }) => {
  const center = size / 2;
  const strokeWidth = 10;
  const radius1 = size * 0.38;
  const circumference1 = 2 * Math.PI * radius1;
  const offset1 = circumference1 - (Math.min(100, isNaN(summitPercent) ? 0 : summitPercent) / 100) * circumference1;
  const radius2 = size * 0.27;
  const circumference2 = 2 * Math.PI * radius2;
  const offset2 = circumference2 - (Math.min(100, isNaN(peakPercent) ? 0 : peakPercent) / 100) * circumference2;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={center} cy={center} r={radius1} stroke="#FEF3C7" strokeWidth={strokeWidth} fill="transparent" />
        <circle cx={center} cy={center} r={radius1} stroke="#F59E0B" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference1} strokeDashoffset={offset1} strokeLinecap="round" className="transition-all duration-1000 ease-out"/>
        <circle cx={center} cy={center} r={radius2} stroke="#DBEAFE" strokeWidth={strokeWidth} fill="transparent" />
        <circle cx={center} cy={center} r={radius2} stroke="#3B82F6" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference2} strokeDashoffset={offset2} strokeLinecap="round" className="transition-all duration-1000 ease-out"/>
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-bold text-gray-800">{Math.round(peakPercent)}%</p>
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-up border border-gray-100">
        <div className="flex items-center gap-3 mb-4 text-red-500">
           <div className="p-2 bg-red-50 rounded-full"><Trash2 size={24} /></div>
           <h3 className="text-lg font-bold text-gray-900">{title || '確認刪除'}</h3>
        </div>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message || '確定要執行此動作嗎？此動作無法復原。'}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 transition" disabled={isLoading}>取消</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition flex items-center gap-2 shadow-md shadow-red-200" disabled={isLoading}>
            {isLoading && <Loader2 size={14} className="animate-spin" />}確認刪除
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Dashboard Component ---
const Dashboard = ({ team, records, season, setSeason, rankTargets, doubleAwardTargets }) => {
  const [selectedManagerId, setSelectedManagerId] = useState('');
  
  const currentMonths = season === 'H1' ? AVAILABLE_MONTHS_H1 : AVAILABLE_MONTHS_H2;
  const currentStart = season === 'H1' ? COMPETITION_START_H1 : COMPETITION_START_H2;
  const activeTargets = season === 'H1' ? rankTargets.H1 : rankTargets.H2;

  const [viewMonth, setViewMonth] = useState(() => {
    const current = getCurrentMonth();
    const isCurrentInSeason = currentMonths.some(m => m.value === current);
    return isCurrentInSeason ? current : currentMonths[0].value;
  });

  useEffect(() => {
    const current = getCurrentMonth();
    const isCurrentInSeason = currentMonths.some(m => m.value === current);
    setViewMonth(isCurrentInSeason ? current : currentMonths[0].value);
  }, [season, currentMonths]);

  const managers = useMemo(() => team.filter(m => MANAGER_RANKS.includes(m.role)), [team]);

  useEffect(() => {
    if (!selectedManagerId && managers.length > 0) {
      const root = managers.find(m => m.name === '吳政翰') || managers[0];
      setSelectedManagerId(root ? root.id : '');
    }
  }, [managers, selectedManagerId]);

  const stats = useMemo(() => {
    const endMonth = viewMonth;
    let unitMemberIds = new Set();
    const currentManager = team.find(m => m.id === selectedManagerId);
    
    if (currentManager) {
      unitMemberIds.add(currentManager.id);
      team.filter(t => t.parentId === currentManager.id).forEach(sub => {
        if (!MANAGER_RANKS.includes(sub.role)) {
          unitMemberIds.add(sub.id);
          team.filter(ss => ss.parentId === sub.id).forEach(ss => {
             if (!MANAGER_RANKS.includes(ss.role)) unitMemberIds.add(ss.id);
          });
        }
      });
    }

    let unitTotalWeighted = 0; 
    let grandTotalWeighted = 0; 
    let grandTotalWeightedMonth = 0; 
    let grandTotalCases = 0; 
    let grandTotalCasesMonth = 0; 

    const memberStats = team.map(member => {
      let effectiveRole = member.role;
      if (season === 'H2' && H2_ROLE_MAPPING[member.name]) {
         effectiveRole = H2_ROLE_MAPPING[member.name];
      }
      return {
        id: member.id,
        name: member.name,
        role: effectiveRole,
        targets: activeTargets[effectiveRole] || activeTargets['業務代表'],
        totalWeighted: 0, 
        ahWeighted: 0, 
        totalPremium: 0,
        casesTotal: 0, 
        casesMonth: 0, 
        monthWeighted: 0, 
        monthAH: 0 
      };
    });

    const monthlyStats = {};
    currentMonths.forEach(m => {
      const monthSimple = m.value.split('-')[1]; 
      monthlyStats[monthSimple] = { month: `${monthSimple}月`, totalWeighted: 0, ahWeighted: 0, cases: 0 };
    });

    records.forEach(record => {
      const recMonthFull = record.date ? record.date.substring(0, 7) : ''; 
      const recMonthSimple = recMonthFull.split('-')[1];
      
      if (monthlyStats[recMonthSimple] && currentMonths.some(m => m.value === recMonthFull)) {
        monthlyStats[recMonthSimple].totalWeighted += (record.weighted || 0);
        monthlyStats[recMonthSimple].cases += 1;
        if (record.isAH) monthlyStats[recMonthSimple].ahWeighted += (record.weighted || 0);
      }

      const isAccumulated = recMonthFull >= currentStart && recMonthFull <= endMonth;
      const isCurrentViewMonth = recMonthFull === viewMonth;

      if (!isAccumulated) return; 

      const weighted = record.weighted || 0;
      const premium = record.premium || 0;
      let idx = -1;
      if (record.agentId) idx = memberStats.findIndex(m => m.id === record.agentId);

      grandTotalWeighted += weighted;
      grandTotalCases += 1;
      if (isCurrentViewMonth) {
        grandTotalWeightedMonth += weighted;
        grandTotalCasesMonth += 1;
      }

      if (idx !== -1) {
        memberStats[idx].totalWeighted += weighted;
        memberStats[idx].totalPremium += premium;
        memberStats[idx].casesTotal += 1;
        if (record.isAH) memberStats[idx].ahWeighted += weighted;

        if (isCurrentViewMonth) {
          memberStats[idx].monthWeighted += weighted;
          memberStats[idx].monthAH += weighted;
          memberStats[idx].casesMonth += 1;
        }

        if (unitMemberIds.has(memberStats[idx].id)) {
          unitTotalWeighted += weighted;
        }
      }
    });

    let unitRole = currentManager ? currentManager.role : '業務襄理';
    if (currentManager && season === 'H2' && H2_ROLE_MAPPING[currentManager.name]) {
        unitRole = H2_ROLE_MAPPING[currentManager.name];
    }
    const unitTarget = activeTargets[unitRole] || activeTargets['業務襄理'];
    const unitPeakProgress = Math.min(100, (unitTotalWeighted / unitTarget.peak.total) * 100);
    const unitSummitProgress = Math.min(100, (unitTotalWeighted / unitTarget.summit.total) * 100);

    return {
      memberStats: memberStats.sort((a, b) => b.totalWeighted - a.totalWeighted),
      unitTotalWeighted,
      unitTarget,
      unitPeakProgress,
      unitSummitProgress,
      grandTotalWeighted,
      grandTotalWeightedMonth,
      grandTotalCases,
      grandTotalCasesMonth,
      monthlyData: Object.values(monthlyStats)
    };
  }, [team, records, selectedManagerId, viewMonth, season, activeTargets, currentMonths, currentStart]); 

  const calculateProgress = (current, target) => (!target || target === 0) ? 100 : Math.min(100, (current / target) * 100);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-gray-800">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
             <span className="bg-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold tracking-wider">競賽進行中</span>
             <span className="text-gray-400 text-sm font-mono">
                {season === 'H1' ? '115/01/02 - 115/06/15' : '115/07/01 - 115/12/31'}
             </span>
             {/* 賽季切換器 */}
             <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700 ml-0 md:ml-4">
               <button onClick={() => setSeason('H1')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${season === 'H1' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>H1 上半年</button>
               <button onClick={() => setSeason('H2')} className={`px-3 py-1 text-xs font-bold rounded-md transition ${season === 'H2' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>H2 下半年</button>
             </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-serif tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
            {season === 'H1' ? '115年 上半年高峰/極峰競賽' : '115年 下半年新高峰/新極峰競賽'}
          </h2>
          <p className="text-gray-400 mt-2 text-sm">
            {season === 'H1' ? '目標明確，全力衝刺。A&H 為勝負關鍵。' : '全新標準，全力衝刺！加權保費與實收保費任一達標即可，職級突破享雙倍榮耀。'}
          </p>
        </div>
        <div className="relative z-10 flex gap-4 text-center">
           <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[100px] border border-white/10">
              <p className="text-xs text-gray-400 uppercase">Current</p>
              <p className="text-lg font-bold text-white font-mono">{viewMonth}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="flex justify-between items-start relative z-10">
            <div><p className="text-blue-200 font-bold text-xs uppercase tracking-wider mb-1">Unit FYP (組績)</p><h2 className="text-3xl font-bold tracking-tight">{formatMoney(stats.unitTotalWeighted)}</h2></div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-1">
              <select className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer appearance-none pr-4" value={selectedManagerId} onChange={(e) => setSelectedManagerId(e.target.value)}>
                {managers.map(m => <option key={m.id} value={m.id} className="text-gray-900">{m.name} 組</option>)}
              </select>
            </div>
          </div>
          <p className="text-xs text-blue-200 mt-4 z-10 relative">含 {stats.unitTarget ? stats.unitTarget.peak.total/10000 : 0}萬 高峰目標</p>
          <div className="absolute -bottom-4 -right-4 text-white/10 transform rotate-12"><Target size={100} /></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden">
           <div className="z-10"><p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">組達成率</p><div className="flex flex-col gap-2"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-sm font-bold text-gray-700">高峰 {Math.round(stats.unitPeakProgress)}%</span></div><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span><span className="text-sm font-bold text-gray-700">極峰 {Math.round(stats.unitSummitProgress)}%</span></div></div></div>
           <div className="scale-75 origin-right"><DoubleRadialProgress peakPercent={stats.unitPeakProgress} summitPercent={stats.unitSummitProgress} /></div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
           <div className="flex items-center gap-2 mb-2"><div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><TrendingUp size={18}/></div><p className="text-gray-400 font-bold text-xs uppercase tracking-wider">全體總績 (FYP)</p></div>
           <div className="flex justify-between items-end"><div><p className="text-xs text-gray-400 mb-1">{viewMonth}月</p><h3 className="text-xl font-bold text-gray-900">{formatMoney(stats.grandTotalWeightedMonth)}</h3></div><div className="text-right"><p className="text-xs text-gray-400 mb-1">累積至當月</p><h3 className="text-xl font-bold text-emerald-600">{formatMoney(stats.grandTotalWeighted)}</h3></div></div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
           <div className="flex items-center gap-2 mb-2"><div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FileText size={18}/></div><p className="text-gray-400 font-bold text-xs uppercase tracking-wider">全體總件數</p></div>
           <div className="flex justify-between items-end"><div><p className="text-xs text-gray-400 mb-1">{viewMonth}月</p><h3 className="text-2xl font-bold text-gray-900">{stats.grandTotalCasesMonth}</h3></div><div className="text-right"><p className="text-xs text-gray-400 mb-1">累積至當月</p><h3 className="text-2xl font-bold text-amber-600">{stats.grandTotalCases}</h3></div></div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
                <Crown className="text-amber-500" size={20}/>
                <h3 className="font-bold text-gray-800">極豐榮譽榜</h3>
                {season === 'H2' && <span className="text-[10px] text-gray-400 font-normal">（加權保費／實收保費 任一達標即算合格）</span>}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-bold">檢視月份:</span>
                <select 
                    className="bg-gray-100 border-none text-xs font-bold text-gray-700 py-1.5 px-3 rounded-lg outline-none cursor-pointer hover:bg-gray-200 transition"
                    value={viewMonth}
                    onChange={(e) => setViewMonth(e.target.value)}
                >
                    {currentMonths.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4 w-16 text-center">排名</th>
                <th className="px-6 py-4">業務同仁</th>
                <th className="px-6 py-4 text-center border-l border-gray-100">件數 (當月/累積)</th>
                <th className="px-6 py-4 text-right border-l border-gray-100">當月 FYP</th>
                <th className="px-6 py-4 text-right border-l border-gray-100">累積 FYP (總/AH/實收)</th>
                <th className="px-6 py-4 w-1/4 border-l border-gray-100">高峰進度</th>
                <th className="px-6 py-4 w-1/4">極峰進度</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {stats.memberStats.map((member, index) => {
                const { targets } = member;
                const hasActualPeak = season === 'H2' && targets.peak.actualPremium > 0;
                const hasActualSummit = season === 'H2' && targets.summit.actualPremium > 0;

                const peakTotalPct = calculateProgress(member.totalWeighted, targets.peak.total);
                const peakAHPct = calculateProgress(member.ahWeighted, targets.peak.ah);
                const peakActualPct = hasActualPeak ? calculateProgress(member.totalPremium, targets.peak.actualPremium) : 0;

                const summitTotalPct = calculateProgress(member.totalWeighted, targets.summit.total);
                const summitAHPct = calculateProgress(member.ahWeighted, targets.summit.ah);
                const summitActualPct = hasActualSummit ? calculateProgress(member.totalPremium, targets.summit.actualPremium) : 0;

                const peakByWeighted = member.totalWeighted >= targets.peak.total && (!targets.peak.ah || member.ahWeighted >= targets.peak.ah);
                const peakByActual = hasActualPeak && member.totalPremium >= targets.peak.actualPremium;
                const isPeakQualified = peakByWeighted || peakByActual;

                const summitByWeighted = member.totalWeighted >= targets.summit.total && (!targets.summit.ah || member.ahWeighted >= targets.summit.ah);
                const summitByActual = hasActualSummit && member.totalPremium >= targets.summit.actualPremium;
                const isSummitQualified = summitByWeighted || summitByActual;

                const isDoubleEligibleRank = season === 'H2' && doubleAwardTargets[member.role];
                const doubleTarget = isDoubleEligibleRank ? doubleAwardTargets[member.role] : null;
                const isDoubleQualified = doubleTarget && (member.totalWeighted >= doubleTarget.total || (doubleTarget.actualPremium > 0 && member.totalPremium >= doubleTarget.actualPremium));

                return (
                  <tr key={member.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4 text-center font-bold text-gray-400">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 flex items-center gap-1">
                          {member.name}
                          {isDoubleQualified && <Gift size={14} className="text-fuchsia-500" />}
                        </span>
                        <span className="text-xs text-gray-400">
                          {member.role}
                          {season === 'H2' && H2_ROLE_MAPPING[member.name] && <span className="ml-1 text-indigo-500">(特)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-700 border-l border-gray-100"><span className="text-gray-900 font-bold">{member.casesMonth}</span> / <span className="text-gray-500">{member.casesTotal}</span></td>
                    <td className="px-6 py-4 text-right border-l border-gray-100 font-mono font-bold text-gray-700">{formatMoney(member.monthWeighted)}</td>
                    <td className="px-6 py-4 text-right border-l border-gray-100">
                      <div className="flex flex-col">
                        <span className="font-bold text-indigo-600 font-mono">{formatMoney(member.totalWeighted)}</span>
                        <span className="text-xs text-emerald-600 font-mono">{formatMoney(member.ahWeighted)} (AH)</span>
                        {season === 'H2' && <span className="text-xs text-gray-400 font-mono">{formatMoney(member.totalPremium)} (實收)</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 border-l border-gray-100">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400"><span>加權</span><span className={peakByWeighted ? 'text-emerald-500' : ''}>{Math.round(peakTotalPct)}%</span></div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${peakByWeighted ? 'bg-emerald-500' : 'bg-blue-400'}`} style={{width: `${peakTotalPct}%`}}></div></div>
                        {season === 'H1' && (
                          <>
                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400 mt-1"><span>A&H</span><span className={member.ahWeighted >= targets.peak.ah ? 'text-emerald-500' : ''}>{Math.round(peakAHPct)}%</span></div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${member.ahWeighted >= targets.peak.ah ? 'bg-emerald-500' : 'bg-cyan-400'}`} style={{width: `${targets.peak.ah === 0 ? 100 : peakAHPct}%`}}></div></div>
                          </>
                        )}
                        {hasActualPeak && (
                          <>
                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400 mt-1"><span>實收</span><span className={peakByActual ? 'text-emerald-500' : ''}>{Math.round(peakActualPct)}%</span></div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${peakByActual ? 'bg-emerald-500' : 'bg-cyan-400'}`} style={{width: `${peakActualPct}%`}}></div></div>
                          </>
                        )}
                        {isPeakQualified && <div className="text-right mt-1"><span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold">{season === 'H2' ? '新高峰達標' : '已達標'}</span></div>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400"><span>加權</span><span className={summitByWeighted ? 'text-amber-500' : ''}>{Math.round(summitTotalPct)}%</span></div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${summitByWeighted ? 'bg-amber-500' : 'bg-orange-300'}`} style={{width: `${summitTotalPct}%`}}></div></div>
                        {season === 'H1' && (
                          <>
                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400 mt-1"><span>A&H</span><span className={member.ahWeighted >= targets.summit.ah ? 'text-amber-500' : ''}>{Math.round(summitAHPct)}%</span></div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${member.ahWeighted >= targets.summit.ah ? 'bg-amber-500' : 'bg-yellow-300'}`} style={{width: `${targets.summit.ah === 0 ? 100 : summitAHPct}%`}}></div></div>
                          </>
                        )}
                        {hasActualSummit && (
                          <>
                            <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400 mt-1"><span>實收</span><span className={summitByActual ? 'text-amber-500' : ''}>{Math.round(summitActualPct)}%</span></div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${summitByActual ? 'bg-amber-500' : 'bg-yellow-300'}`} style={{width: `${summitActualPct}%`}}></div></div>
                          </>
                        )}
                        {isSummitQualified && <div className="text-right mt-1"><span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">{season === 'H2' ? '新極峰達成' : '極峰達成'}</span></div>}
                        {isDoubleQualified && <div className="text-right mt-1"><span className="text-[10px] bg-fuchsia-100 text-fuchsia-700 px-1.5 py-0.5 rounded font-bold">主管雙倍獎達標</span></div>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {season === 'H2' && (
        <Card className="p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Gift className="text-fuchsia-500" size={20}/> 業務主管雙倍獎標準 (主任以上適用，任一標達成)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                  <th className="px-4 py-3">參賽組別</th>
                  <th className="px-4 py-3 text-right">加權保費標</th>
                  <th className="px-4 py-3 text-right">實收保費標</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(doubleAwardTargets).map(([role, val]) => (
                  <tr key={role}>
                    <td className="px-4 py-3 font-bold text-gray-800">{role}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatMoney(val.total)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatMoney(val.actualPremium)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card className="p-6">
         <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2"><Calendar className="text-indigo-500" size={20}/> 團隊月度戰報 (全月份概覽)</h3>
         <ResponsiveContainer width="100%" height={300}>
           <BarChart data={stats.monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0"/>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF'}}/>
              <YAxis yAxisId="left" orientation="left" stroke="#4F46E5" tickFormatter={(val)=>val/10000 + '萬'} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" stroke="#F59E0B" axisLine={false} tickLine={false}/>
              <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'}} formatter={(value, name) => name.includes('件數') ? value : formatMoney(value)}/>
              <Legend iconType="circle"/>
              <Bar yAxisId="left" dataKey="totalWeighted" name="總加權保費" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar yAxisId="left" dataKey="ahWeighted" name="A&H加權保費" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar yAxisId="right" dataKey="cases" name="總件數" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={20} />
           </BarChart>
         </ResponsiveContainer>
      </Card>
    </div>
  );
};

// --- MEA Activity Dashboard (New Module based on Excel) ---
const ACTIVITY_WEIGHTS = {
  prospect: { label: '新增準客戶', score: 1, color: 'bg-blue-500' },
  appointment: { label: '約訪', score: 1, color: 'bg-indigo-500' },
  interview: { label: '面談', score: 2, color: 'bg-violet-500' },
  proposal: { label: '送建議書', score: 3, color: 'bg-fuchsia-500' },
  application: { label: '要保受理', score: 4, color: 'bg-pink-500' },
  issue: { label: '核保發單', score: 5, color: 'bg-rose-500' }
};

const ActivityDashboard = ({ team, activities, records, user, season, loggedInUser }) => {
  const currentMonths = season === 'H1' ? AVAILABLE_MONTHS_H1 : AVAILABLE_MONTHS_H2;
  const [selectedAgentId, setSelectedAgentId] = useState('');
  
  const [selectedMonth, setSelectedMonth] = useState(() => {
     const current = getCurrentMonth();
     const isCurrentInSeason = currentMonths.some(m => m.value === current);
     return isCurrentInSeason ? current : currentMonths[0].value;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    date: getTodayDate(),
    prospect: 0, appointment: 0, interview: 0, proposal: 0, application: 0, issue: 0
  });

  useEffect(() => {
    const current = getCurrentMonth();
    const isCurrentInSeason = currentMonths.some(m => m.value === current);
    setSelectedMonth(isCurrentInSeason ? current : currentMonths[0].value);
  }, [season, currentMonths]);

  // 預設選擇「目前登入的自己」，找不到才退回第一位業務員
  useEffect(() => {
    if (!selectedAgentId && team.length > 0) {
      const me = loggedInUser ? team.find(t => t.id === loggedInUser.id) : null;
      setSelectedAgentId(me ? me.id : team[0].id);
    }
  }, [team, loggedInUser, selectedAgentId]);

  // 當選擇日期改變時，自動載入當日已有的數據
  useEffect(() => {
    if (selectedAgentId && formData.date) {
      const existingRecord = activities.find(a => a.agentId === selectedAgentId && a.date === formData.date);
      if (existingRecord) {
        setFormData({
          date: formData.date,
          prospect: existingRecord.prospect || 0,
          appointment: existingRecord.appointment || 0,
          interview: existingRecord.interview || 0,
          proposal: existingRecord.proposal || 0,
          application: existingRecord.application || 0,
          issue: existingRecord.issue || 0
        });
      } else {
        setFormData(prev => ({ ...prev, prospect: 0, appointment: 0, interview: 0, proposal: 0, application: 0, issue: 0 }));
      }
    }
  }, [selectedAgentId, formData.date, activities]);

  // 處理表單提交 (Upsert 每日紀錄)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAgentId || !user) return;
    setIsSubmitting(true);
    try {
      const docId = `${selectedAgentId}_${formData.date}`;
      const docRef = doc(db, 'activity_record', docId);
      await setDoc(docRef, {
        agentId: selectedAgentId,
        date: formData.date,
        month: formData.date.substring(0, 7),
        prospect: Number(formData.prospect),
        appointment: Number(formData.appointment),
        interview: Number(formData.interview),
        proposal: Number(formData.proposal),
        application: Number(formData.application),
        issue: Number(formData.issue),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving activity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 計算 MEA 核心指標與商品線
  const stats = useMemo(() => {
    let totalPoints = 0;
    const totals = { prospect: 0, appointment: 0, interview: 0, proposal: 0, application: 0, issue: 0 };
    
    // 1. 統計選定月份的活動量
    const monthActivities = activities.filter(a => a.agentId === selectedAgentId && a.month === selectedMonth);
    monthActivities.forEach(record => {
      Object.keys(totals).forEach(key => {
        const val = record[key] || 0;
        totals[key] += val;
        totalPoints += val * ACTIVITY_WEIGHTS[key].score;
      });
    });

    // 獨立計算面談分數
    const interviewPoints = totals.interview * ACTIVITY_WEIGHTS.interview.score;

    // 2. 統計選定月份的業績與商品線
    const monthRecords = records.filter(r => r.agentId === selectedAgentId && r.date.startsWith(selectedMonth));
    const totalPremium = monthRecords.reduce((sum, r) => sum + (r.premium || 0), 0);
    const totalFYC = monthRecords.reduce((sum, r) => sum + (r.weighted || 0), 0);

    let rpPremium = 0, rpCases = 0, rpFYC = 0;
    let ahPremium = 0, ahCases = 0, ahFYC = 0;
    let spPremium = 0, spCases = 0, spFYC = 0;

    monthRecords.forEach(r => {
       const p = r.premium || 0;
       const fyc = r.weighted || 0;
       if (r.typeCode === 'one_off') {
          spPremium += p; spCases += 1; spFYC += fyc;
       } else if (r.isAH) {
          ahPremium += p; ahCases += 1; ahFYC += fyc;
       } else {
          rpPremium += p; rpCases += 1; rpFYC += fyc;
       }
    });

    const productLines = [
       { label: 'AH (健康險)', premium: ahPremium, fyc: ahFYC, cases: ahCases, avg: ahCases ? ahPremium/ahCases : 0, ratio: totalPremium ? ahPremium/totalPremium : 0 },
       { label: 'RP (期繳)', premium: rpPremium, fyc: rpFYC, cases: rpCases, avg: rpCases ? rpPremium/rpCases : 0, ratio: totalPremium ? rpPremium/totalPremium : 0 },
       { label: 'SP (躉繳)', premium: spPremium, fyc: spFYC, cases: spCases, avg: spCases ? spPremium/spCases : 0, ratio: totalPremium ? spPremium/totalPremium : 0 }
    ];

    // 3. 計算 MEA 公式參數
    // P (件均保費) = 實收保費 / 核保發單數 (若無發單則為 0)
    const P = totals.issue > 0 ? (totalPremium / totals.issue) : 0;
    // C (成交率) = 核保發單數 / 面談數 (若無面談則為 0)
    const C = totals.interview > 0 ? (totals.issue / totals.interview) : 0;
    // I (面談數量)
    const I = totals.interview;

    // 每分價值 & 每分實收
    const valuePerPoint = totalPoints > 0 ? (totalFYC / totalPoints) : 0;
    const premiumPerPoint = totalPoints > 0 ? (totalPremium / totalPoints) : 0;

    return { totals, totalPoints, interviewPoints, totalPremium, totalFYC, P, C, I, valuePerPoint, premiumPerPoint, productLines };
  }, [activities, records, selectedAgentId, selectedMonth]);

  // 準備圖表資料 (漏斗圖變體 - 橫向長條圖)
  const chartData = Object.keys(ACTIVITY_WEIGHTS).map(key => ({
    name: ACTIVITY_WEIGHTS[key].label,
    count: stats.totals[key],
    fill: ACTIVITY_WEIGHTS[key].color.replace('bg-', '')
  }));
  const chartColors = ['#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#EC4899', '#F43F5E'];

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Header & Context */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 shadow-2xl flex flex-col lg:flex-row justify-between gap-8 border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Activity size={200} /></div>
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-3xl font-bold font-serif tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-400 mb-2">
              MEA 活動量管理 (P x C x I)
            </h2>
            <p className="text-gray-400 text-sm max-w-lg">
              量大是致勝的關鍵。透過追蹤每日活動量，掌握面談次數 (I)、提升成交率 (C)，並優化件均保費 (P)。
            </p>
          </div>
          <div className="flex gap-4 items-center bg-white/5 p-2 rounded-xl border border-white/10 w-fit backdrop-blur-md">
            <select 
              className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer appearance-none px-3" 
              value={selectedAgentId} 
              onChange={(e) => setSelectedAgentId(e.target.value)}
            >
              {team.map(m => <option key={m.id} value={m.id} className="text-gray-900">{m.name}</option>)}
            </select>
            <div className="w-px h-6 bg-white/20"></div>
            <select 
              className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer appearance-none px-3" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {currentMonths.map(m => <option key={m.value} value={m.value} className="text-gray-900">{m.label}</option>)}
            </select>
          </div>
        </div>
        
        {/* The MEA Core Formula Display */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 min-w-[300px] flex flex-col justify-center">
          <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-2">本月 MEA 核心公式</p>
          <div className="flex items-center gap-3 text-lg font-mono">
            <div className="text-center">
              <span className="block text-2xl font-bold text-white">{formatMoney(stats.P).replace('$', '')}</span>
              <span className="text-[10px] text-gray-400">P (件均)</span>
            </div>
            <span className="text-indigo-400 font-bold">X</span>
            <div className="text-center">
              <span className="block text-2xl font-bold text-white">{(stats.C * 100).toFixed(1)}%</span>
              <span className="text-[10px] text-gray-400">C (成交率)</span>
            </div>
            <span className="text-indigo-400 font-bold">X</span>
            <div className="text-center">
              <span className="block text-2xl font-bold text-white">{stats.I}</span>
              <span className="text-[10px] text-gray-400">I (面談次數)</span>
            </div>
            <span className="text-indigo-400 font-bold">=</span>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-end">
            <div>
               <span className="text-3xl font-bold text-emerald-400">{formatMoney(stats.totalPremium)}</span>
               <span className="text-xs text-gray-400 ml-2">總實收保費</span>
            </div>
          </div>
        </div>
      </div>

      {/* 警告提示區塊 */}
      {(stats.totalPoints < 400 || stats.interviewPoints < 60) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
          <div className="bg-red-100 p-2 rounded-full shrink-0">
             <AlertTriangle className="text-red-600" size={24} />
          </div>
          <div>
            <h4 className="text-base font-bold text-red-800 mb-1">活動量未達標預警</h4>
            <ul className="text-sm text-red-600 space-y-1 list-disc list-inside font-medium">
               {stats.totalPoints < 400 && <li>本月「活動量總分」低於標準：目前 {stats.totalPoints} 分（目標 400 分）</li>}
               {stats.interviewPoints < 60 && <li>本月「面談總分」低於標準：目前 {stats.interviewPoints} 分（目標 60 分）</li>}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Data Input & Points Summary */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Input Card */}
          <Card className="p-6 border-t-4 border-t-indigo-500">
            <div className="flex items-center gap-2 mb-6">
              <Edit3 size={18} className="text-indigo-500"/>
              <h3 className="font-bold text-gray-800">活動量紀錄 (日報)</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">紀錄日期</label>
                <input 
                  type="date" 
                  className="w-full p-2 bg-gray-50 rounded-lg border outline-none text-sm font-bold text-gray-700" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                {Object.entries(ACTIVITY_WEIGHTS).map(([key, config]) => (
                  <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${config.color}`}></span>
                      <span className="text-sm font-medium text-gray-700">{config.label}</span>
                      <span className="text-[10px] text-gray-400 bg-gray-200 px-1.5 rounded">x{config.score}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setFormData(p => ({...p, [key]: Math.max(0, p[key] - 1)}))} className="w-6 h-6 flex items-center justify-center bg-white rounded border hover:bg-gray-100 text-gray-500">-</button>
                      <input 
                        type="number" 
                        min="0" 
                        className="w-12 text-center bg-transparent font-bold text-gray-900 outline-none" 
                        value={formData[key]} 
                        onChange={e => setFormData(p => ({...p, [key]: parseInt(e.target.value) || 0}))}
                      />
                      <button type="button" onClick={() => setFormData(p => ({...p, [key]: p[key] + 1}))} className="w-6 h-6 flex items-center justify-center bg-white rounded border hover:bg-gray-100 text-gray-500">+</button>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : '儲存本日紀錄'}
              </button>
            </form>
          </Card>

          {/* Points Value Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">本月每分實收</p>
              <h4 className="text-xl font-bold text-gray-900">{formatMoney(stats.premiumPerPoint)}</h4>
              <p className="text-xs text-gray-500 mt-1">總分: <span className={`font-bold ${stats.totalPoints < 400 ? 'text-red-500' : 'text-gray-700'}`}>{stats.totalPoints}</span></p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">本月每分價值(FYC)</p>
              <h4 className="text-xl font-bold text-gray-900">{formatMoney(stats.valuePerPoint)}</h4>
              <p className="text-xs text-gray-500 mt-1">總FYC: <span className="font-bold text-gray-700">{formatMoney(stats.totalFYC)}</span></p>
            </div>
          </div>
        </div>

        {/* Right Column: Funnel & Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 h-full flex flex-col">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Filter className="text-indigo-500" size={20}/> 
              銷售漏斗分析與轉換率 ({selectedMonth})
            </h3>
            <div className="flex-1 min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0"/>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 12, fontWeight: 'bold'}} />
                  <Tooltip 
                    cursor={{fill: '#f9fafb'}} 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'}}
                    formatter={(value) => [value, '次數']}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32} label={{ position: 'right', fill: '#6B7280', fontWeight: 'bold' }}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Conversion Rates */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
               <div className="text-center">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">準客戶轉換約訪</p>
                 <p className="text-lg font-bold text-indigo-600 mt-1">
                   {stats.totals.prospect > 0 ? Math.round((stats.totals.appointment / stats.totals.prospect) * 100) : 0}%
                 </p>
               </div>
               <div className="text-center border-l border-gray-100">
                 <p className="text-[10px] font-bold text-gray-400 uppercase">約訪轉換面談</p>
                 <p className="text-lg font-bold text-violet-600 mt-1">
                   {stats.totals.appointment > 0 ? Math.round((stats.totals.interview / stats.totals.appointment) * 100) : 0}%
                 </p>
               </div>
               <div className="text-center border-l border-gray-100 bg-rose-50/50 rounded-lg p-2">
                 <p className="text-[10px] font-bold text-rose-500 uppercase">成交率 (C) = 發單/面談</p>
                 <p className="text-xl font-bold text-rose-600 mt-1">
                   {(stats.C * 100).toFixed(1)}%
                 </p>
               </div>
            </div>
          </Card>
        </div>
        
        {/* 各商品線業績分析 Table */}
        <Card className="p-6 col-span-1 lg:col-span-3 border-t-4 border-t-emerald-500">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <PieChartIcon className="text-emerald-500" size={20}/>
            各商品線業績分析 ({selectedMonth})
          </h3>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                   <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                      <th className="px-4 py-3 rounded-l-lg">商品線</th>
                      <th className="px-4 py-3 text-right">實收保費</th>
                      <th className="px-4 py-3 text-right">首獎 (FYC)</th>
                      <th className="px-4 py-3 text-center">佔比</th>
                      <th className="px-4 py-3 text-center">件數</th>
                      <th className="px-4 py-3 text-right rounded-r-lg">件均保費 (P)</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {stats.productLines.map(line => (
                      <tr key={line.label} className="hover:bg-gray-50">
                         <td className="px-4 py-4 font-bold text-gray-900 flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${line.label.includes('AH') ? 'bg-emerald-500' : line.label.includes('RP') ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                           {line.label}
                         </td>
                         <td className="px-4 py-4 text-right text-gray-700 font-mono font-medium">{formatMoney(line.premium)}</td>
                         <td className="px-4 py-4 text-right text-indigo-600 font-mono font-medium">{formatMoney(line.fyc)}</td>
                         <td className="px-4 py-4 text-center text-gray-600 font-bold">{(line.ratio * 100).toFixed(1)}%</td>
                         <td className="px-4 py-4 text-center text-gray-600 font-bold">{line.cases}</td>
                         <td className="px-4 py-4 text-right text-gray-700 font-mono font-medium">{formatMoney(line.avg)}</td>
                      </tr>
                   ))}
                   <tr className="bg-gray-100 font-bold">
                      <td className="px-4 py-4 text-gray-900">總計</td>
                      <td className="px-4 py-4 text-right text-gray-900 font-mono">{formatMoney(stats.totalPremium)}</td>
                      <td className="px-4 py-4 text-right text-indigo-600 font-mono">{formatMoney(stats.totalFYC)}</td>
                      <td className="px-4 py-4 text-center text-gray-900">100%</td>
                      <td className="px-4 py-4 text-center text-gray-900">{stats.productLines.reduce((acc, l) => acc + l.cases, 0)}</td>
                      <td className="px-4 py-4 text-right text-gray-900 font-mono">{formatMoney(stats.P)}</td>
                   </tr>
                </tbody>
             </table>
          </div>
        </Card>
      </div>
    </div>
  );
};


// --- BatchEntryModal Component (New) ---
const BatchEntryModal = ({ isOpen, onClose, team, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setRawText('');
      setParsedRows([]);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleParse = () => {
    const lines = rawText.split('\n');
    let currentDate = '';
    let currentAgentId = '';
    const results = [];
    const currentYear = '2026';

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      if (trimmedLine.match(/^\d{1,2}\/\d{1,2}$/)) {
        const [m, d] = trimmedLine.split('/');
        currentDate = `${currentYear}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        return;
      }

      const agent = team.find(m => m.name === trimmedLine);
      if (agent) {
        currentAgentId = agent.id;
        return;
      }

      const regex = /^([A-Za-z0-9]+)\s+([A-Za-z0-9\-\_]+)\s+(\d+)\s*(.*)$/;
      const match = trimmedLine.match(regex);

      if (match) {
        results.push({
          id: Date.now() + index, 
          date: currentDate || new Date().toISOString().split('T')[0],
          agentId: currentAgentId || '',
          policyNumber: match[1],
          product: match[2],
          premium: match[3],
          insuredName: match[4],
          typeCode: 'ah_general', 
          isESG: true 
        });
      }
    });

    setParsedRows(results);
    setStep(2);
  };

  const updateRow = (id, field, value) => {
    setParsedRows(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const removeRow = (id) => {
    setParsedRows(prev => prev.filter(row => row.id !== id));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    const validRows = parsedRows.filter(r => r.agentId && r.premium);
    await onSubmit(validRows);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl animate-scale-up border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><ListPlus size={20}/></div>
            <h3 className="text-xl font-bold text-gray-900">快速批次新增</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 ? (
            <div className="space-y-4 h-full flex flex-col">
               <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-700 leading-relaxed border border-blue-100">
                  <strong>輸入說明：</strong><br/>
                  1. 日期格式：2/8 (系統預設為 2026年)<br/>
                  2. 業務員：輸入姓名即可 (如：吳政翰)<br/>
                  3. 案件格式：保單號碼 商品名稱 保費 被保人 (中間需有空格)<br/>
                  4. 日期與業務員只需輸入一次，其後的案件會自動帶入，直到遇到新的日期或業務員。
               </div>
               <textarea 
                  className="w-full flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 font-mono text-sm resize-none min-h-[300px]"
                  placeholder={`2/8 \n陳鈺雯\nA062158903 10AYUPL3 3170 林小筑\nA062158592 TED35 20900 陳小紘\n吳政翰 \nA062165336 HPSI2 57916 林小馨`}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
               />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                    <tr>
                      <th className="px-3 py-3">日期</th>
                      <th className="px-3 py-3">業務同仁</th>
                      <th className="px-3 py-3">保單號碼</th>
                      <th className="px-3 py-3">商品</th>
                      <th className="px-3 py-3 w-32">保費</th>
                      <th className="px-3 py-3">被保人</th>
                      <th className="px-3 py-3 w-40">類型 (必選)</th>
                      <th className="px-3 py-3 text-center">ESG</th>
                      <th className="px-3 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedRows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 group">
                        <td className="p-2"><input type="date" className="bg-transparent border border-transparent hover:border-gray-300 rounded px-1 w-24 outline-none focus:border-indigo-500" value={row.date} onChange={e => updateRow(row.id, 'date', e.target.value)} /></td>
                        <td className="p-2">
                           <select className={`bg-transparent border rounded px-1 w-24 outline-none focus:border-indigo-500 ${!row.agentId ? 'border-red-300 bg-red-50' : 'border-transparent hover:border-gray-300'}`} value={row.agentId} onChange={e => updateRow(row.id, 'agentId', e.target.value)}>
                              <option value="">(未對應)</option>
                              {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                           </select>
                        </td>
                        <td className="p-2"><input type="text" className="bg-transparent border border-transparent hover:border-gray-300 rounded px-1 w-24 outline-none focus:border-indigo-500" value={row.policyNumber} onChange={e => updateRow(row.id, 'policyNumber', e.target.value)} /></td>
                        <td className="p-2"><input type="text" className="bg-transparent border border-transparent hover:border-gray-300 rounded px-1 w-20 outline-none focus:border-indigo-500" value={row.product} onChange={e => updateRow(row.id, 'product', e.target.value)} /></td>
                        <td className="p-2"><input type="number" className="bg-transparent border border-transparent hover:border-gray-300 rounded px-1 w-20 outline-none focus:border-indigo-500 font-mono text-right" value={row.premium} onChange={e => updateRow(row.id, 'premium', e.target.value)} /></td>
                        <td className="p-2"><input type="text" className="bg-transparent border border-transparent hover:border-gray-300 rounded px-1 w-20 outline-none focus:border-indigo-500" value={row.insuredName} onChange={e => updateRow(row.id, 'insuredName', e.target.value)} /></td>
                        <td className="p-2">
                           <select className="bg-transparent border border-gray-200 rounded px-1 w-full outline-none focus:border-indigo-500" value={row.typeCode} onChange={e => updateRow(row.id, 'typeCode', e.target.value)}>
                              {PRODUCT_TYPES_OPTIONS.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}
                           </select>
                        </td>
                        <td className="p-2 text-center">
                           <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" checked={row.isESG} onChange={e => updateRow(row.id, 'isESG', e.target.checked)} />
                        </td>
                        <td className="p-2 text-center"><button onClick={() => removeRow(row.id)} className="text-gray-300 hover:text-red-500 transition"><Trash2 size={16}/></button></td>
                      </tr>
                    ))}
                    {parsedRows.length === 0 && <tr><td colSpan="9" className="text-center py-8 text-gray-400">無法解析任何資料，請檢查輸入格式。</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="text-right text-xs text-gray-400">共解析 {parsedRows.length} 筆資料，請確認「業務同仁」與「商品類型」是否正確。</div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          {step === 1 ? (
             <button onClick={handleParse} disabled={!rawText} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50">下一步：解析與確認</button>
          ) : (
             <>
               <button onClick={() => setStep(1)} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-200 rounded-lg transition">返回修改</button>
               <button onClick={handleFinalSubmit} disabled={isSubmitting || parsedRows.length === 0} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
                  {isSubmitting && <Loader2 className="animate-spin" size={16} />} 
                  確認送出 ({parsedRows.length})
               </button>
             </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- OrgChart Component (Replaces generic team view) ---
const OrgChart = ({ team, recruits }) => {
  const [editMember, setEditMember] = useState(null);
  const [deleteInfo, setDeleteInfo] = useState(null);
  const [newMember, setNewMember] = useState({ name: '', role: '業務代表', parentId: '', type: '正式人員' });
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  const handleUpdateMember = async () => {
     if (!editMember) return;
     try {
       await updateDoc(doc(db, 'user', editMember.id), {
          name: editMember.name,
          position: editMember.role,
          parentId: editMember.parentId || 0,
          promotionDates: editMember.promotionDates || {}
       });
       setEditMember(null);
     } catch(e) { console.error(e); }
  }

  useEffect(() => {
    setNewPassword('');
    setResetMsg('');
    setResetting(false);
  }, [editMember?.id]);

  const handleResetPassword = async () => {
    if (!editMember || !newPassword) return;
    setResetting(true);
    setResetMsg('');
    try {
      const salt = generateSalt();
      const hash = await hashPassword(newPassword, salt);
      // 清空 rememberToken，強制該成員在其他裝置上重新登入
      await updateDoc(doc(db, 'user', editMember.id), { passwordHash: hash, passwordSalt: salt, rememberToken: '' });
      setResetMsg('密碼已更新，該成員下次登入請使用新密碼');
      setNewPassword('');
    } catch (e) {
      console.error(e);
      setResetMsg('更新失敗，請再試一次');
    } finally {
      setResetting(false);
    }
  };

  const handleAdd = async () => {
    if (!newMember.name) return;
    setLoading(true);
    try {
      if (newMember.type === '正式人員') {
        await addDoc(collection(db, 'user'), {
           name: newMember.name,
           position: newMember.role,
           parentId: newMember.parentId || 0,
           role: 'member',
           created_at: new Date().toISOString()
        });
      } else {
        await addDoc(collection(db, 'temp_user'), {
           name: newMember.name,
           recommender_id: newMember.parentId || 0,
           status: '新名單',
           created_at: new Date().toISOString()
        });
      }
      setNewMember({ name: '', role: '業務代表', parentId: '', type: '正式人員' });
    } catch(e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteInfo) return;
    try {
       const collectionName = deleteInfo.isRecruit ? 'temp_user' : 'user';
       await deleteDoc(doc(db, collectionName, deleteInfo.id));
       setDeleteInfo(null);
    } catch (e) { console.error(e); }
  };

  const renderTree = (parentId, depth = 0) => {
    const safeParentId = (parentId === null) ? 0 : parentId;
    
    let members = team.filter(m => {
       if (safeParentId === 0) {
           const isExplicitRoot = !m.parentId || m.parentId === 0 || m.parentId === '0';
           const parentIsMissing = m.parentId && !team.some(t => t.id == m.parentId);
           return isExplicitRoot || parentIsMissing;
       }
       return m.parentId == safeParentId;
    });

    let candidates = recruits.filter(r => {
       if (r.isPromoted) return false; 
       if (safeParentId === 0) return false; 
       return r.recruiterId == safeParentId;
    });
    
    if (members.length === 0 && candidates.length === 0) return null;

    return (
      <div className="flex flex-col items-center flex-shrink-0">
        {depth > 0 && (
          <div className="flex flex-col items-center w-full">
            <div className="h-6 w-px bg-gray-300"></div>
            {(members.length + candidates.length) > 1 && <div className="w-full h-px bg-gray-300 mb-6 relative"></div>}
            {(members.length + candidates.length) === 1 && <div className="h-6 w-px bg-gray-300"></div>}
          </div>
        )}
        <div className="flex gap-8 items-start justify-center pt-2 min-w-max">
          {members.map((member) => (
            <div key={member.id} className="flex flex-col items-center relative">
               {(members.length + candidates.length) > 1 && <div className="absolute -top-8 w-px h-6 bg-gray-300"></div>}
               <Card className="w-48 p-4 text-center border-t-4 border-t-indigo-500 hover:-translate-y-1 transition-transform relative group z-10 cursor-pointer" onClick={() => setEditMember(member)}>
                 <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-700 font-bold mx-auto mb-3 text-lg">{member.name[0]}</div>
                 <h4 className="font-bold text-gray-900">{member.name}</h4>
                 <p className="text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mt-2 font-medium">{member.role}</p>
                 <button onClick={(e) => { e.stopPropagation(); setDeleteInfo({ id: member.id, isRecruit: false }); }} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14} /></button>
               </Card>
               {renderTree(member.id, depth + 1)}
            </div>
          ))}
          
          {candidates.map((recruit) => (
            <div key={recruit.id} className="flex flex-col items-center relative">
               {(members.length + candidates.length) > 1 && <div className="absolute -top-8 w-px h-6 bg-gray-300"></div>}
               <div className="w-48 p-4 text-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl relative group z-10 hover:border-gray-400 transition-colors">
                 <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold mx-auto mb-3 text-lg">{recruit.name[0]}</div>
                 <h4 className="font-bold text-gray-600">{recruit.name}</h4>
                 <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full inline-block mt-2">準增員 ({recruit.status})</span>
                 <button onClick={() => setDeleteInfo({ id: recruit.id, isRecruit: true })} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14} /></button>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12 text-center">
      <ConfirmModal 
        isOpen={!!deleteInfo} 
        onClose={() => setDeleteInfo(null)} 
        onConfirm={handleDeleteConfirm} 
        title={`刪除${deleteInfo?.isRecruit ? '準增員' : '成員'}`} 
        message={`確定要刪除此${deleteInfo?.isRecruit ? '準增員' : '成員'}嗎？如果該成員有下線，組織圖可能會斷開連結。`} 
      />
      <div className="max-w-5xl mx-auto flex flex-wrap items-end gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-12">
        <div className="w-32 text-left">
           <label className="text-xs font-bold text-gray-500 mb-1 block">類型</label>
           <select className="w-full p-2 bg-gray-100 rounded-lg outline-none" value={newMember.type} onChange={e => setNewMember({...newMember, type: e.target.value})}>
             <option value="正式人員">正式人員</option>
             <option value="準增員對象">準增員對象</option>
           </select>
        </div>
        <div className="flex-1 text-left min-w-[150px]">
           <label className="text-xs font-bold text-gray-500 mb-1 block">姓名</label>
           <input type="text" className="w-full p-2 bg-gray-100 rounded-lg outline-none" placeholder="輸入姓名" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})}/>
        </div>
        {newMember.type === '正式人員' && (
          <div className="w-40 text-left">
             <label className="text-xs font-bold text-gray-500 mb-1 block">職級</label>
             <select className="w-full p-2 bg-gray-100 rounded-lg outline-none" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}>
               {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
             </select>
          </div>
        )}
        <div className="w-40 text-left">
           <label className="text-xs font-bold text-gray-500 mb-1 block">{newMember.type === '正式人員' ? '直屬主管' : '推薦人'}</label>
           <select className="w-full p-2 bg-gray-100 rounded-lg outline-none" value={newMember.parentId || ''} onChange={e => setNewMember({...newMember, parentId: e.target.value})}>
             <option value="">(請選擇)</option>
             {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
           </select>
        </div>
        <button disabled={loading} onClick={handleAdd} className="bg-black text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition h-[40px] flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin"/> : <><Plus size={16} /> 新增</>}
        </button>
      </div>
      
      <div className="overflow-x-auto pb-8">
          <div className="inline-block min-w-full px-4">
            {renderTree(null)}
          </div>
      </div>

      {editMember && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-up">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900">編輯成員資料</h3>
                  <button onClick={() => setEditMember(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20}/></button>
               </div>
               <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  <div className="space-y-3 pb-4 border-b border-gray-100">
                    <h4 className="text-sm font-bold text-gray-800">基本資料</h4>
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">姓名</label>
                      <input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={editMember.name} onChange={e => setEditMember({...editMember, name: e.target.value})}/>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">職級</label>
                      <select className="w-full p-2 border border-gray-200 rounded-lg" value={editMember.role} onChange={e => setEditMember({...editMember, role: e.target.value})}>
                         {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 block mb-1">直屬主管</label>
                      <select className="w-full p-2 border border-gray-200 rounded-lg" value={editMember.parentId || 0} onChange={e => setEditMember({...editMember, parentId: e.target.value})}>
                         <option value={0}>無 (根節點)</option>
                         {team.filter(t => t.id !== editMember.id).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  {/* 晉升歷程紀錄 */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-bold text-gray-800">晉升歷程紀錄</h4>
                    {[
                      { key: 'registered', label: '登錄日期' },
                      { key: 'supervisor', label: '升任主任' },
                      { key: 'asstManager', label: '升任襄理' },
                      { key: 'distManager', label: '升任區經理' },
                      { key: 'agencyManager', label: '升任處經理' }
                    ].map(dateField => (
                      <div key={dateField.key} className="flex items-center justify-between">
                         <label className="text-xs font-bold text-gray-600">{dateField.label}</label>
                         <input 
                           type="date" 
                           className="border border-gray-200 rounded px-2 py-1 text-sm text-gray-700 outline-none focus:border-indigo-500" 
                           value={editMember.promotionDates?.[dateField.key] || ''} 
                           onChange={e => {
                             const newDates = { ...(editMember.promotionDates || {}), [dateField.key]: e.target.value };
                             setEditMember({ ...editMember, promotionDates: newDates });
                           }}
                         />
                      </div>
                    ))}
                  </div>

                  {/* 密碼管理 */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-bold text-gray-800">密碼管理</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed">為此成員設定新密碼，設定後該成員需使用新密碼重新登入（其他裝置上的登入狀態也會失效）。</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="輸入新密碼"
                        className="flex-1 p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        disabled={!newPassword || resetting}
                        onClick={handleResetPassword}
                        className="px-3 py-2 bg-gray-800 text-white rounded-lg text-xs font-bold disabled:opacity-40 flex items-center gap-1 whitespace-nowrap"
                      >
                        {resetting ? <Loader2 size={14} className="animate-spin"/> : '重設密碼'}
                      </button>
                    </div>
                    {resetMsg && <p className="text-xs text-emerald-600 font-bold">{resetMsg}</p>}
                  </div>

                  <button onClick={handleUpdateMember} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition mt-4">儲存變更</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};


// --- Recruitment Dashboard (增員儀表板) ---
const GOAL_REGISTER = 12;
const GOAL_QUALITY = 10;

const RecruitmentDashboard = ({ recruits, team, user }) => {
  const [loadingId, setLoadingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const determineStatus = (recruit) => {
    if (recruit.isPromoted) return '登錄';

    const dates = recruit.dates || {};
    const today = getTodayDate();

    if (dates.trainingDate && dates.trainingDate <= today) return '優培';
    if (dates.registeredDate && dates.registeredDate <= today) return '登錄';
    if (dates.externalExamDate && dates.externalExamDate <= today) return '外考';
    if (dates.internalExamDate && dates.internalExamDate <= today) return '內考';
    if (dates.tempAccountDate && dates.tempAccountDate <= today) return '臨時帳號';
    return '新名單';
  };

  const dashboardStats = useMemo(() => {
    const currentYearMonth = getCurrentMonth();

    const totalMonthReg = recruits.filter(r => {
      const status = determineStatus(r);
      const isReg = status === '登錄' || status === '優培' || r.isPromoted;
      const date = r.dates?.registeredDate;
      return isReg && date && date.startsWith(currentYearMonth);
    }).length;

    const totalMonthQual = recruits.filter(r => {
      const status = determineStatus(r);
      return status === '優培' && r.dates?.trainingDate && r.dates.trainingDate.startsWith(currentYearMonth);
    }).length;

    const totalYearReg = recruits.filter(r => {
      const status = determineStatus(r);
      return status === '登錄' || status === '優培' || r.isPromoted;
    }).length;

    const totalYearQual = recruits.filter(r => determineStatus(r) === '優培').length;

    const agentStats = {};
    team.forEach(m => {
      agentStats[m.id] = { monthReg: 0, monthQual: 0, yearReg: 0, yearQual: 0 };
    });

    recruits.forEach(r => {
      if (!agentStats[r.recruiterId]) return;
      const status = determineStatus(r);
      const isReg = status === '登錄' || status === '優培' || r.isPromoted;

      if (isReg) agentStats[r.recruiterId].yearReg++;
      if (status === '優培') agentStats[r.recruiterId].yearQual++;

      const regDate = r.dates?.registeredDate || '';
      const qualDate = r.dates?.trainingDate || '';

      if (isReg && regDate.startsWith(currentYearMonth)) {
        agentStats[r.recruiterId].monthReg++;
      }
      if (status === '優培' && qualDate.startsWith(currentYearMonth)) {
        agentStats[r.recruiterId].monthQual++;
      }
    });

    return { totalMonthReg, totalMonthQual, totalYearReg, totalYearQual, agentStats };
  }, [recruits, team]);

  const groupedRecruits = useMemo(() => {
    const groups = {};
    team.forEach(m => { groups[m.id] = { agent: m, recruits: [] }; });
    recruits.forEach(r => {
      const dynamicStatus = determineStatus(r);
      if (groups[r.recruiterId]) {
        groups[r.recruiterId].recruits.push({ ...r, status: dynamicStatus });
      }
    });
    return Object.values(groups).filter(g => g.recruits.length > 0);
  }, [recruits, team]);

  const updateRecruit = async (id, partialData) => {
    if (!user) return;
    setLoadingId(id);
    try {
      let updatePayload = {};
      if (partialData.dates) {
         updatePayload.timeline = partialData.dates;
      }
      if (partialData.docs) {
         updatePayload.checkItem = {
           idIdentityCard: partialData.docs.idCard,
           isDiploma: partialData.docs.diploma,
           isBankBook: partialData.docs.bankBook,
           isCredit: partialData.docs.credit
         };
      }
      if (partialData.note) updatePayload.note = partialData.note;

      if (Object.keys(updatePayload).length > 0) {
        await updateDoc(doc(db, 'temp_user', id), updatePayload);
      }
    }
    catch(e) { console.error(e); } finally { setLoadingId(null); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDoc(doc(db, 'temp_user', deleteTarget));
      setDeleteTarget(null);
    } catch(e) { console.error(e); }
  }

  const toggleDoc = (recruit, docKey) => {
    const currentDocs = recruit.docs || {};
    const newDocs = { ...currentDocs, [docKey]: !currentDocs[docKey] };
    updateRecruit(recruit.id, { docs: newDocs });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case '登錄': return 'bg-emerald-500';
      case '優培': return 'bg-amber-500';
      case '外考': return 'bg-purple-500';
      case '內考': return 'bg-blue-500';
      case '臨時帳號': return 'bg-indigo-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-12">
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="刪除準增員"
        message="確定要刪除此準增員資料嗎？此動作無法復原。"
      />
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-white border border-gray-700">
        <div className="absolute top-0 right-0 p-8 opacity-10"><UserPlus size={250} /></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex-1 space-y-8">
             <div><h2 className="text-3xl font-bold font-serif tracking-wide mb-1 text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">極豐增員戰報</h2><p className="text-gray-400 text-sm">組織發展儀表板</p></div>
             <div className="flex gap-12">
                <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">本月戰況 ({getCurrentMonth()})</p><div className="flex gap-6"><div><span className="text-3xl font-bold text-white">{dashboardStats.totalMonthReg}</span><span className="text-xs text-gray-500 block">登錄</span></div><div className="w-px h-10 bg-gray-700"></div><div><span className="text-3xl font-bold text-amber-400">{dashboardStats.totalMonthQual}</span><span className="text-xs text-gray-500 block">優培</span></div></div></div>
                <div><p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">年度累積</p><div className="flex gap-6"><div><span className="text-3xl font-bold text-white">{dashboardStats.totalYearReg}</span><span className="text-xs text-gray-500 block">登錄</span></div><div className="w-px h-10 bg-gray-700"></div><div><span className="text-3xl font-bold text-amber-400">{dashboardStats.totalYearQual}</span><span className="text-xs text-gray-500 block">優培</span></div></div></div>
             </div>
          </div>
          <div className="flex flex-col items-center"><DoubleRadialProgress peakPercent={(dashboardStats.totalYearReg / GOAL_REGISTER) * 100} summitPercent={(dashboardStats.totalYearQual / GOAL_QUALITY) * 100} size={160}/><div className="flex gap-6 mt-4 text-xs font-bold text-gray-400"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 登錄達成 ({Math.round((dashboardStats.totalYearReg/GOAL_REGISTER)*100)}%)</div><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 優培達成 ({Math.round((dashboardStats.totalYearQual/GOAL_QUALITY)*100)}%)</div></div></div>
        </div>
      </div>

      {groupedRecruits.map(({ agent, recruits }) => {
        const myStats = dashboardStats.agentStats[agent.id];
        return (
          <div key={agent.id} className="space-y-6 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white px-6 py-5 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white">{agent.name[0]}</div><div><h4 className="text-lg font-bold text-gray-900">{agent.name}</h4><p className="text-xs text-gray-400 font-medium">{agent.role}</p></div></div>
              <div className="flex gap-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-8">
                 <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">個人本月</p><div className="flex gap-2 text-sm font-bold text-gray-700"><span>登錄 <span className="text-blue-600">{myStats.monthReg}</span></span><span className="text-gray-300">|</span><span>優培 <span className="text-amber-500">{myStats.monthQual}</span></span></div></div>
                 <div><p className="text-[10px] text-gray-400 font-bold uppercase mb-1">個人累積</p><div className="flex gap-2 text-sm font-bold text-gray-700"><span>登錄 <span className="text-blue-600">{myStats.yearReg}</span></span><span className="text-gray-300">|</span><span>優培 <span className="text-amber-500">{myStats.yearQual}</span></span></div></div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {recruits.map(recruit => {
                const currentStatusIdx = RECRUIT_STATUSES.indexOf(recruit.status);
                const progressColor = getStatusColor(recruit.status);
                return (
                  <div key={recruit.id} className={`bg-white rounded-2xl p-6 shadow-sm border ${recruit.isPromoted ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-100'} hover:shadow-lg transition-all group relative overflow-hidden`}>
                    <button onClick={() => setDeleteTarget(recruit.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={18}/></button>
                    {recruit.isPromoted && <div className="absolute top-4 right-12 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">已晉升轉正</div>}
                    <div className="flex items-center gap-4 mb-6"><div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md ${progressColor}`}>{recruit.name[0]}</div><div><div className="flex items-center gap-3"><h5 className="text-lg font-bold text-gray-900">{recruit.name}</h5><span className={`text-[10px] px-2 py-0.5 rounded-full text-white ${progressColor}`}>{recruit.status}</span></div><div className="text-xs text-gray-400 mt-1">自動判斷狀態</div></div></div>
                    <div className="mb-8 px-2"><div className="relative flex justify-between items-center"><div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full -z-10"></div><div className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full transition-all duration-500 -z-10 ${progressColor}`} style={{ width: `${(currentStatusIdx / (RECRUIT_STATUSES.length - 1)) * 100}%` }}></div>{RECRUIT_STATUSES.map((step, idx) => {const isCompleted = currentStatusIdx >= idx;const isCurrent = recruit.status === step;return (<div key={step} className="flex flex-col items-center gap-2 relative"><div className={`w-3 h-3 rounded-full border-2 transition-all z-10 box-content ${isCompleted ? `${progressColor} border-white shadow-sm` : 'bg-white border-gray-200'}`}>{isCurrent && <div className={`absolute top-0 left-0 w-full h-full rounded-full animate-ping ${progressColor} opacity-50`}></div>}</div>{isCurrent && (<span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white absolute -bottom-7 whitespace-nowrap shadow-sm ${progressColor}`}>{step}</span>)}</div>)}) }</div></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                       <div className="space-y-3">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">關鍵日期</p>
                          {[{ label: '臨時帳號', key: 'tempAccountDate' },{ label: '內考日期', key: 'internalExamDate' },{ label: '外考日期', key: 'externalExamDate' },{ label: '預計登錄', key: 'registeredDate' },{ label: '優培開始', key: 'trainingDate' }].map(d => (
                            <div key={d.key} className="flex items-center justify-between"><label className="text-xs text-gray-500 font-medium">{d.label}</label>
                              <input type="date" disabled={recruit.isPromoted} className="bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 outline-none focus:border-blue-500 transition w-32 disabled:opacity-50" value={recruit.dates?.[d.key] || ''} onChange={(e) => {
                                  const currentDates = recruit.dates || {};
                                  updateRecruit(recruit.id, { dates: { ...currentDates, [d.key]: e.target.value } });
                                }}/>
                            </div>))}
                       </div>
                       <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">資料檢核</p>
                          <div className="grid grid-cols-2 gap-2">{[{ key: 'idCard', label: '身分證' },{ key: 'diploma', label: '畢業證書' },{ key: 'bankBook', label: '存摺影本' },{ key: 'credit', label: '聯徵報告' }].map(item => (<button key={item.key} disabled={recruit.isPromoted} onClick={() => toggleDoc(recruit, item.key)} className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-xs ${recruit.docs?.[item.key] ? 'bg-green-50 border-green-200 text-green-700 font-bold' : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'} disabled:opacity-50`}>{recruit.docs?.[item.key] ? <CheckCircle2 size={14}/> : <Square size={14}/>}{item.label}</button>))}</div>
                          <div className="mt-4"><label className="text-xs font-bold text-gray-400 uppercase block mb-1">進度備註</label><input type="text" disabled={recruit.isPromoted} className="w-full bg-gray-50 border-b border-gray-200 text-xs py-1 px-2 outline-none focus:border-blue-500 text-gray-600 placeholder-gray-300 disabled:opacity-50" placeholder="例如: 進度正常、需補件..." value={recruit.note || ''} onChange={(e) => updateRecruit(recruit.id, { note: e.target.value })}/></div>
                       </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};


// --- Sales Entry ---
const SalesEntry = ({ team, records, setRecords, user }) => {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ agentId: '', policyNumber: '', insuredName: '', product: '', typeCode: 'ah_general', premium: '', isESG: false, date: new Date().toISOString().split('T')[0] });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  
  const [filterAgent, setFilterAgent] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  const availableMonths = useMemo(() => {
    const months = new Set(records.map(r => r.date.substring(0, 7)));
    return Array.from(months).sort().reverse();
  }, [records]);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
        const matchAgent = filterAgent ? r.agentId === filterAgent : true;
        const matchMonth = filterMonth ? r.date.startsWith(filterMonth) : true;
        return matchAgent && matchMonth;
    });
  }, [records, filterAgent, filterMonth]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agentId || !form.premium || !user) return;
    setSubmitting(true);
    try {
      const recordData = {
        amount: parseInt(form.premium), 
        customer_name: form.insuredName,
        insurance_number: form.policyNumber,
        is_esg: form.isESG,
        product_name: form.product,
        product_type: form.typeCode, 
        transaction_date: Timestamp.fromDate(new Date(form.date)),
        user_id: form.agentId,
        created_at: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, 'case_record', editingId), recordData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'case_record'), recordData);
      }
      setForm({ agentId: '', policyNumber: '', insuredName: '', product: '', typeCode: 'ah_general', premium: '', isESG: false, date: new Date().toISOString().split('T')[0] });
    } catch (error) { console.error(error); } finally { setSubmitting(false); }
  };

  const handleBatchSubmit = async (rows) => {
    if (!user) return;
    try {
       const batch = writeBatch(db);
       rows.forEach(row => {
          const docRef = doc(collection(db, 'case_record'));
          batch.set(docRef, {
             amount: parseInt(row.premium),
             customer_name: row.insuredName,
             insurance_number: row.policyNumber,
             is_esg: row.isESG,
             product_name: row.product,
             product_type: row.typeCode,
             transaction_date: Timestamp.fromDate(new Date(row.date)),
             user_id: row.agentId,
             created_at: new Date().toISOString()
          });
       });
       await batch.commit();
    } catch(e) { console.error(e); }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setForm({ 
      agentId: record.agentId, 
      policyNumber: record.policyNumber||'', 
      insuredName: record.insuredName||'', 
      product: record.product, 
      typeCode: record.typeCode || 'ah_general', 
      premium: record.premium, 
      isESG: record.isESG||false, 
      date: record.date 
    });
    window.scrollTo({top:0, behavior:'smooth'});
  };

  const handleDeleteConfirm = async() => { 
    if(!deleteId) return;
    try {
      await deleteDoc(doc(db, 'case_record', deleteId));
      setDeleteId(null);
    } catch(e) { console.error(e); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDeleteConfirm} 
        title="刪除業績紀錄" 
        message="確定要刪除這筆業績紀錄嗎？刪除後將重新計算排名與達成率。" 
      />
      <BatchEntryModal 
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        team={team}
        onSubmit={handleBatchSubmit}
      />
      <div className="text-center mb-8 relative">
        <h2 className="text-3xl font-bold text-gray-900 inline-block">{editingId ? '修改紀錄' : '業績回報'}</h2>
        {!editingId && (
           <button 
             onClick={() => setIsBatchOpen(true)}
             className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-bold transition text-sm"
           >
             <ListPlus size={18}/>
             快速批次新增
           </button>
        )}
      </div>
      <Card className="p-8 border-t-4 border-t-indigo-500">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-1">
             <label className="text-xs font-bold text-gray-500">業務同仁</label>
             <select 
                className="w-full p-3 bg-gray-50 rounded border outline-none" 
                value={form.agentId} 
                onChange={e=>setForm({...form, agentId: e.target.value})} 
                required
             >
                <option value="">請選擇業務同仁</option>
                {team.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
             </select>
           </div>
           <div className="space-y-1"><label className="text-xs font-bold text-gray-500">成交日期</label><input type="date" className="w-full p-3 bg-gray-50 rounded border outline-none" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} required/></div>
           <div className="space-y-1"><label className="text-xs font-bold text-gray-500">保單號碼</label><input type="text" className="w-full p-3 bg-gray-50 rounded border outline-none" value={form.policyNumber} onChange={e=>setForm({...form, policyNumber: e.target.value})} required/></div>
           <div className="space-y-1"><label className="text-xs font-bold text-gray-500">被保人</label><input type="text" className="w-full p-3 bg-gray-50 rounded border outline-none" value={form.insuredName} onChange={e=>setForm({...form, insuredName: e.target.value})} required/></div>
           <div className="space-y-1"><label className="text-xs font-bold text-gray-500">商品名稱</label><input type="text" className="w-full p-3 bg-gray-50 rounded border outline-none" value={form.product} onChange={e=>setForm({...form, product: e.target.value})} required/></div>
           <div className="space-y-1"><label className="text-xs font-bold text-gray-500">類型</label><select className="w-full p-3 bg-gray-50 rounded border outline-none" value={form.typeCode} onChange={e=>setForm({...form, typeCode: e.target.value})} required>{PRODUCT_TYPES_OPTIONS.map((t)=><option key={t.code} value={t.code}>{t.label}</option>)}</select></div>
           <div className="space-y-1 md:col-span-2"><label className="text-xs font-bold text-gray-500">保費 (amount)</label><input type="number" className="w-full p-3 bg-gray-50 rounded border outline-none" value={form.premium} onChange={e=>setForm({...form, premium: e.target.value})} required/></div>
           <div className="md:col-span-2 flex items-center gap-3 p-3 bg-green-50 rounded border border-green-100"><Leaf size={16} className="text-green-600"/><span className="text-xs font-bold text-green-700">ESG 專案 (x1.05)</span><input type="checkbox" checked={form.isESG} onChange={e=>setForm({...form, isESG: e.target.checked})} className="ml-auto w-5 h-5"/></div>
           <div className="md:col-span-2 pt-2"><button type="submit" disabled={submitting} className="w-full bg-indigo-600 text-white py-3 rounded font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">{submitting?<Loader2 className="animate-spin mx-auto"/>:(editingId?'更新':'新增')}</button></div>
        </form>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100 items-center">
          <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter size={18} className="text-gray-400" />
              <span className="text-sm font-bold text-gray-500 whitespace-nowrap">篩選條件:</span>
          </div>
          <select 
              className="w-full md:w-auto p-2 bg-gray-50 rounded border outline-none text-sm font-bold text-gray-700 min-w-[150px]"
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
          >
              <option value="">所有業務同仁</option>
              {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select 
              className="w-full md:w-auto p-2 bg-gray-50 rounded border outline-none text-sm font-bold text-gray-700 min-w-[150px]"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
          >
              <option value="">所有月份</option>
              {availableMonths.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {(filterAgent || filterMonth) && (
              <button 
                  onClick={() => { setFilterAgent(''); setFilterMonth(''); }}
                  className="w-full md:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-bold whitespace-nowrap transition"
              >
                  清除
              </button>
          )}
      </div>

      <div className="space-y-4">
        {filteredRecords.map(r=>(<Card key={r.id} className="p-4 flex justify-between items-center"><div className="flex flex-col"><span className="font-bold text-gray-900">{r.agentName} <span className="text-gray-400 font-normal text-xs">| {r.product}</span></span><span className="text-xs text-gray-500">{r.date} • {r.insuredName} {r.isESG && '• ESG'}</span></div><div className="text-right"><span className="block font-bold text-indigo-600">{formatMoney(r.weighted)}</span><div className="flex gap-2 justify-end mt-1"><Edit3 size={14} className="text-gray-400 cursor-pointer hover:text-indigo-500" onClick={()=>handleEdit(r)}/><Trash2 size={14} className="text-gray-400 cursor-pointer hover:text-red-500" onClick={()=>setDeleteId(r.id)}/></div></div></Card>))}
        {filteredRecords.length === 0 && <div className="text-center py-10 text-gray-400">沒有符合條件的紀錄</div>}
      </div>
    </div>
  );
};

// --- Knowledge Base ---
const KnowledgeBase = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
    {INITIAL_DOCS.map(doc => <Card key={doc.id} className="p-6 hover:shadow-lg transition-all"><span className={`px-2 py-1 rounded text-xs font-bold ${doc.color}`}>{doc.tag}</span><h3 className="text-lg font-bold mt-4">{doc.title}</h3></Card>)}
  </div>
);

// --- Competition Settings Page (競賽設定：目標值可在畫面上調整，不用改程式碼) ---
const SettingsPage = ({ rankTargets, doubleAwardTargets }) => {
  const [season, setSeason] = useState('H2');
  const [localH1, setLocalH1] = useState(() => JSON.parse(JSON.stringify(rankTargets.H1)));
  const [localH2, setLocalH2] = useState(() => JSON.parse(JSON.stringify(rankTargets.H2)));
  const [localDouble, setLocalDouble] = useState(() => JSON.parse(JSON.stringify(doubleAwardTargets)));
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const updateField = (setter, role, group, field, value) => {
    setter(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [group]: { ...prev[role][group], [field]: Number(value) || 0 }
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg('');
    try {
      await setDoc(doc(db, 'settings', 'rank_targets'), {
        H1: localH1,
        H2: localH2,
        H2_double_award: localDouble
      });
      setSaveMsg('設定已儲存，全體同仁畫面將自動更新');
    } catch (e) {
      console.error(e);
      setSaveMsg('儲存失敗，請再試一次');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    if (!window.confirm('確定要還原成系統預設值嗎？尚未儲存的修改將會被覆蓋。')) return;
    setLocalH1(JSON.parse(JSON.stringify(DEFAULT_RANK_TARGETS_H1)));
    setLocalH2(JSON.parse(JSON.stringify(DEFAULT_RANK_TARGETS_H2)));
    setLocalDouble(JSON.parse(JSON.stringify(DEFAULT_DOUBLE_AWARD_H2)));
    setSaveMsg('');
  };

  const renderTargetTable = (data, setter, hasActualPremium) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
            <th className="px-3 py-3">職級</th>
            <th className="px-3 py-3 text-center" colSpan={hasActualPremium ? 2 : 2}>高峰 (Peak)</th>
            <th className="px-3 py-3 text-center" colSpan={hasActualPremium ? 2 : 2}>極峰 (Summit)</th>
          </tr>
          <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase">
            <th className="px-3 py-1"></th>
            <th className="px-3 py-1 text-center">加權保費</th>
            <th className="px-3 py-1 text-center">{hasActualPremium ? '實收保費' : 'A&H'}</th>
            <th className="px-3 py-1 text-center">加權保費</th>
            <th className="px-3 py-1 text-center">{hasActualPremium ? '實收保費' : 'A&H'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Object.keys(data).map(role => (
            <tr key={role}>
              <td className="px-3 py-2 font-bold text-gray-800 whitespace-nowrap">{role}</td>
              <td className="px-2 py-2">
                <input type="number" className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-right font-mono text-xs outline-none focus:border-indigo-500"
                  value={data[role].peak.total}
                  onChange={e => updateField(setter, role, 'peak', 'total', e.target.value)} />
              </td>
              <td className="px-2 py-2">
                <input type="number" className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-right font-mono text-xs outline-none focus:border-indigo-500"
                  value={hasActualPremium ? data[role].peak.actualPremium : data[role].peak.ah}
                  onChange={e => updateField(setter, role, 'peak', hasActualPremium ? 'actualPremium' : 'ah', e.target.value)} />
              </td>
              <td className="px-2 py-2">
                <input type="number" className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-right font-mono text-xs outline-none focus:border-indigo-500"
                  value={data[role].summit.total}
                  onChange={e => updateField(setter, role, 'summit', 'total', e.target.value)} />
              </td>
              <td className="px-2 py-2">
                <input type="number" className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-right font-mono text-xs outline-none focus:border-indigo-500"
                  value={hasActualPremium ? data[role].summit.actualPremium : data[role].summit.ah}
                  onChange={e => updateField(setter, role, 'summit', hasActualPremium ? 'actualPremium' : 'ah', e.target.value)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg"><Settings size={24} className="text-amber-400"/></div>
          <div>
            <h2 className="text-xl font-bold">競賽設定</h2>
            <p className="text-xs text-gray-400 mt-0.5">在這裡調整的目標值，全體同仁的業績儀表板會即時更新，不需要修改程式碼</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleResetDefault} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition">還原預設值</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-bold transition flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin"/> : '儲存設定'}
          </button>
        </div>
      </div>

      {saveMsg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold px-4 py-3 rounded-xl">{saveMsg}</div>}

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => setSeason('H1')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${season === 'H1' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>H1 上半年目標</button>
          <button onClick={() => setSeason('H2')} className={`px-4 py-2 rounded-lg text-sm font-bold transition ${season === 'H2' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>H2 下半年目標</button>
        </div>
        {season === 'H1' ? renderTargetTable(localH1, setLocalH1, false) : renderTargetTable(localH2, setLocalH2, true)}
      </Card>

      {season === 'H2' && (
        <Card className="p-6">
          <h3 className="font-bold text-gray-800 mb-4">業務主管雙倍獎標準 (僅主管職級適用)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs font-bold text-gray-400 uppercase">
                  <th className="px-3 py-3">職級</th>
                  <th className="px-3 py-3 text-center">加權保費標</th>
                  <th className="px-3 py-3 text-center">實收保費標</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.keys(localDouble).map(role => (
                  <tr key={role}>
                    <td className="px-3 py-2 font-bold text-gray-800 whitespace-nowrap">{role}</td>
                    <td className="px-2 py-2">
                      <input type="number" className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-right font-mono text-xs outline-none focus:border-indigo-500"
                        value={localDouble[role].total}
                        onChange={e => setLocalDouble(prev => ({ ...prev, [role]: { ...prev[role], total: Number(e.target.value) || 0 } }))} />
                    </td>
                    <td className="px-2 py-2">
                      <input type="number" className="w-full p-2 bg-gray-50 border border-gray-200 rounded text-right font-mono text-xs outline-none focus:border-indigo-500"
                        value={localDouble[role].actualPremium}
                        onChange={e => setLocalDouble(prev => ({ ...prev, [role]: { ...prev[role], actualPremium: Number(e.target.value) || 0 } }))} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <p className="text-xs text-gray-400 text-center">單位：元（新台幣）。修改後記得點右上角「儲存設定」，否則不會生效。</p>
    </div>
  );
};


// --- Loading Screen (顯示於系統連線資料庫期間) ---
const LoadingScreen = () => (
  <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center gap-4">
    <div className="w-14 h-14 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg">
      <span className="text-amber-400 font-serif font-bold text-xl">JF</span>
    </div>
    <Loader2 className="animate-spin text-gray-400" size={24} />
  </div>
);

// --- Login Screen (登入畫面：選姓名 + 密碼) ---
const LoginScreen = ({ team, onLogin }) => {
  const [selectedId, setSelectedId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedTeam = useMemo(() => [...team].sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant')), [team]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedId || !password) return;
    setIsSubmitting(true);
    try {
      const member = team.find(t => t.id === selectedId);
      if (!member) { setError('找不到此成員，請重新選擇'); setIsSubmitting(false); return; }

      let isValid = false;

      if (member.passwordHash && member.passwordSalt) {
        const computed = await hashPassword(password, member.passwordSalt);
        isValid = computed === member.passwordHash;
      } else {
        // 尚未設定過密碼：首次登入預設密碼為 1234，登入成功後立即改為加密儲存
        isValid = password === '1234';
        if (isValid) {
          const salt = generateSalt();
          const hash = await hashPassword(password, salt);
          await updateDoc(doc(db, 'user', member.id), { passwordHash: hash, passwordSalt: salt });
        }
      }

      if (!isValid) {
        setError('密碼錯誤，請再試一次');
        setIsSubmitting(false);
        return;
      }

      const token = generateToken();
      await updateDoc(doc(db, 'user', member.id), { rememberToken: token });
      localStorage.setItem('jf_session', JSON.stringify({ memberId: member.id, token }));
      onLogin({ ...member, rememberToken: token });
    } catch (err) {
      console.error(err);
      setError('登入時發生錯誤，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <span className="text-amber-400 font-serif font-bold text-2xl">JF</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">極豐通訊處</h1>
          <p className="text-xs text-gray-400 uppercase tracking-[0.2em] mt-1">Ji Feng Agency</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">姓名</label>
            <select
              className="w-full p-3 bg-gray-50 rounded-lg border outline-none focus:border-indigo-500"
              value={selectedId}
              onChange={e => { setSelectedId(e.target.value); setError(''); }}
              required
            >
              <option value="">請選擇你的姓名</option>
              {sortedTeam.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 block mb-1">密碼</label>
            <input
              type="password"
              className="w-full p-3 bg-gray-50 rounded-lg border outline-none focus:border-indigo-500"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="首次登入請輸入預設密碼 1234"
              required
            />
          </div>
          {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : '登入'}
          </button>
        </form>
        <p className="text-center text-[10px] text-gray-300 mt-6">忘記密碼請洽主管協助重設</p>
      </div>
    </div>
  );
};

// --- Main App ---
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [season, setSeason] = useState('H2'); 
  const [team, setTeam] = useState([]);
  const [records, setRecords] = useState([]);
  const [recruits, setRecruits] = useState([]);
  const [activities, setActivities] = useState([]); 
  const [user, setUser] = useState(null);
  const [teamLoaded, setTeamLoaded] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [rankTargets, setRankTargets] = useState({ H1: DEFAULT_RANK_TARGETS_H1, H2: DEFAULT_RANK_TARGETS_H2 });
  const [doubleAwardTargets, setDoubleAwardTargets] = useState(DEFAULT_DOUBLE_AWARD_H2);

  useEffect(() => {
    const initAuth = async () => { await signInAnonymously(auth); };
    initAuth();
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // 讀取「競賽設定」(可在設定頁調整的目標值)，若尚未建立過就用預設值建立一份
  useEffect(() => {
    if (!user) return;
    const settingsRef = doc(db, 'settings', 'rank_targets');
    const unsubSettings = onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setRankTargets({
          H1: data.H1 || DEFAULT_RANK_TARGETS_H1,
          H2: data.H2 || DEFAULT_RANK_TARGETS_H2
        });
        setDoubleAwardTargets(data.H2_double_award || DEFAULT_DOUBLE_AWARD_H2);
      } else {
        setDoc(settingsRef, {
          H1: DEFAULT_RANK_TARGETS_H1,
          H2: DEFAULT_RANK_TARGETS_H2,
          H2_double_award: DEFAULT_DOUBLE_AWARD_H2
        }).catch(e => console.error(e));
      }
    });
    return () => unsubSettings();
  }, [user]);

  // 自動登入：檢查裝置上是否記住了先前的登入狀態
  useEffect(() => {
    if (!teamLoaded || sessionChecked) return;
    try {
      const saved = localStorage.getItem('jf_session');
      if (saved) {
        const { memberId, token } = JSON.parse(saved);
        const member = team.find(t => t.id === memberId);
        if (member && member.rememberToken && member.rememberToken === token) {
          setLoggedInUser(member);
        } else {
          localStorage.removeItem('jf_session');
        }
      }
    } catch (e) { console.error(e); }
    setSessionChecked(true);
  }, [teamLoaded, team, sessionChecked]);

  const handleLogout = () => {
    localStorage.removeItem('jf_session');
    setLoggedInUser(null);
  };

  // 若管理者更新了目前登入者的資料（姓名/職級），同步更新畫面顯示
  useEffect(() => {
    if (!loggedInUser) return;
    const fresh = team.find(t => t.id === loggedInUser.id);
    if (fresh) setLoggedInUser(prev => (prev && prev.name === fresh.name && prev.role === fresh.role) ? prev : { ...fresh, rememberToken: loggedInUser.rememberToken });
  }, [team]);

  useEffect(() => {
    if (recruits.length === 0) return;

    const promoteEligibleRecruits = async () => {
      const today = getTodayDate();
      const eligible = recruits.filter(r => {
        return r.dates?.registeredDate && r.dates.registeredDate <= today && !r.isPromoted;
      });

      if (eligible.length === 0) return;

      console.log(`Checking promotions: found ${eligible.length} eligible recruits.`);
      const batch = writeBatch(db);
      
      eligible.forEach(r => {
         const newUserRef = doc(collection(db, 'user'));
         batch.set(newUserRef, {
            name: r.name,
            position: '業務代表', 
            parentId: r.recruiterId || '', 
            role: 'member',
            account_id: r.name,
            password: '1234',
            created_at: new Date().toISOString()
         });

         const oldRecruitRef = doc(db, 'temp_user', r.id);
         batch.update(oldRecruitRef, { isPromoted: true });
      });

      try {
        await batch.commit();
      } catch (e) {
        console.error("Promotion failed", e);
      }
    };
    
    promoteEligibleRecruits();
  }, [recruits]);

  useEffect(() => {
    if (!user) return;

    const recordsRef = collection(db, 'case_record');
    const unsubRecords = onSnapshot(query(recordsRef), (snap) => {
      const adaptedRecords = snap.docs.map(d => {
         const data = d.data();
         const typeCode = data.product_type || 'ah_general';
         const typeInfo = PRODUCT_MAPPING[typeCode] || PRODUCT_MAPPING['ah_general'];
         const premium = Number(data.amount || 0);
         let weighted = premium * typeInfo.rate;
         if (data.is_esg) weighted *= 1.05;
         let dateStr = '';
         if (data.transaction_date && data.transaction_date.toDate) {
            dateStr = data.transaction_date.toDate().toISOString().split('T')[0];
         }
         return {
            id: d.id,
            agentId: data.user_id,
            policyNumber: data.insurance_number,
            insuredName: data.customer_name,
            product: data.product_name,
            typeCode: typeCode,
            typeRate: typeInfo.rate,
            isAH: typeInfo.isAH,
            premium: premium,
            weighted: Math.round(weighted),
            isESG: data.is_esg,
            date: dateStr
         };
      });
      setRecords(adaptedRecords.sort((a,b) => b.date.localeCompare(a.date)));
    });

    const activitiesRef = collection(db, 'activity_record');
    const unsubActivities = onSnapshot(query(activitiesRef), (snap) => {
      const adaptedActivities = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      setActivities(adaptedActivities);
    });

    const teamRef = collection(db, 'user');
    const unsubTeam = onSnapshot(teamRef, (snap) => {
      const adaptedTeam = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name,
          role: data.position || '業務代表',
          parentId: data.parentId,
          promotionDates: data.promotionDates || { registered: '', supervisor: '', asstManager: '', distManager: '', agencyManager: '' },
          passwordHash: data.passwordHash || null,
          passwordSalt: data.passwordSalt || null,
          rememberToken: data.rememberToken || null
        };
      });
      setTeam(adaptedTeam.sort((a,b)=>a.id.localeCompare(b.id)));
      setTeamLoaded(true);
    });

    const recruitsRef = collection(db, 'temp_user');
    const unsubRecruits = onSnapshot(query(recruitsRef), (snap) => {
      const adaptedRecruits = snap.docs.map(d => {
        const data = d.data();
        const dbCheck = data.checkItem || {};
        const docs = { idCard: dbCheck.idIdentityCard || false, diploma: dbCheck.isDiploma || false, bankBook: dbCheck.isBankBook || false, credit: dbCheck.isCredit || false };
        const dbTimeline = data.timeline || {};
        const dates = { tempAccountDate: dbTimeline.tempAccountDate, internalExamDate: dbTimeline.internalExamDate, externalExamDate: dbTimeline.externalExamDate, registeredDate: dbTimeline.registeredDate, trainingDate: dbTimeline.trainingDate };

        return {
          id: d.id,
          name: data.name,
          recruiterId: data.recommender_id,
          status: '新名單',
          note: data.note || '',
          docs: docs,
          dates: dates,
          createdAt: data.created_at,
          isPromoted: data.isPromoted || false 
        };
      });
      setRecruits(adaptedRecruits);
    });

    return () => { unsubRecords(); unsubTeam(); unsubRecruits(); unsubActivities(); };
  }, [user]);

  const enrichedRecords = useMemo(() => {
    return records.map(r => {
      const agent = team.find(t => t.id === r.agentId);
      return { ...r, agentName: agent ? agent.name : '未知成員' };
    });
  }, [records, team]);

  const navItems = [
    { id: 'dashboard', label: '業績儀表板', icon: LayoutDashboard },
    { id: 'activity', label: 'MEA 活動量', icon: Activity },
    { id: 'entry', label: '業績回報', icon: Plus },
    { id: 'team', label: '組織架構', icon: Users },
    { id: 'recruitment', label: '增員儀表板', icon: UserPlus },
    { id: 'wiki', label: '知識庫', icon: BookOpen },
    ...(loggedInUser && MANAGER_RANKS.includes(loggedInUser.role) ? [{ id: 'settings', label: '競賽設定', icon: Settings }] : [])
  ];

  // 資料尚未連線完成前，顯示載入畫面
  if (!teamLoaded || !sessionChecked) {
    return <LoadingScreen />;
  }

  // 尚未登入，顯示登入畫面（進入系統前必須先登入）
  if (!loggedInUser) {
    return <LoginScreen team={team} onLogin={setLoggedInUser} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-gray-900 pb-20">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm overflow-x-auto">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between min-w-max gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-gray-900 to-gray-700 rounded-xl flex items-center justify-center shadow-lg"><span className="text-amber-400 font-serif font-bold text-lg">JF</span></div>
            <div><h1 className="text-lg font-bold tracking-tight text-gray-900">極豐通訊處</h1><p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">Ji Feng Agency</p></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-gray-100/60 p-1.5 rounded-full backdrop-blur-sm">
              {navItems.map(item => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === item.id ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <ItemIcon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="md:hidden">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="bg-gray-100 rounded-lg p-2 font-bold text-sm outline-none"
              >
                {navItems.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-gray-900">{loggedInUser.name}</p>
                <p className="text-[10px] text-gray-400">{loggedInUser.role}</p>
              </div>
              <button
                onClick={handleLogout}
                title="登出"
                className="p-2 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-8">
        {activeTab === 'dashboard' && <Dashboard team={team} records={enrichedRecords} season={season} setSeason={setSeason} rankTargets={rankTargets} doubleAwardTargets={doubleAwardTargets} />}
        {activeTab === 'activity' && <ActivityDashboard team={team} activities={activities} records={enrichedRecords} user={user} season={season} loggedInUser={loggedInUser} />}
        {activeTab === 'entry' && <SalesEntry team={team} records={enrichedRecords} setRecords={setRecords} user={user} />}
        {activeTab === 'team' && <OrgChart team={team} recruits={recruits} />}
        {activeTab === 'recruitment' && <RecruitmentDashboard recruits={recruits} team={team} user={user} />}
        {activeTab === 'wiki' && <KnowledgeBase />}
        {activeTab === 'settings' && loggedInUser && MANAGER_RANKS.includes(loggedInUser.role) && <SettingsPage rankTargets={rankTargets} doubleAwardTargets={doubleAwardTargets} />}
      </main>
    </div>
  );
};

export default App;
