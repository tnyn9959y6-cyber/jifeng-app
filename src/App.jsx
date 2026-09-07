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
  Settings,
  Download,
  Phone,
  Cake,
  MessageSquare,
  Upload,
  SlidersHorizontal,
  Search,
  GitBranch,
  Star,
  MapPin,
  Trophy,
  ChevronLeft,
  ChevronRight,
  ShieldCheck
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
  setDoc,
  getDocs,
  getDoc,
  where,
  increment,
  arrayUnion
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
const getTodayDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const getCurrentMonth = () => getTodayDate().slice(0, 7);

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

// --- 客戶管理 (CRM) 設定 ---
const CUSTOMER_TAGS = ['準客戶', '既有客戶', '準增員'];
const GENDER_OPTIONS = ['男', '女', '其他'];
const VIP_INCOME_THRESHOLD = '200萬以上';
const VIP_PREMIUM_THRESHOLD = 120000;

// VIP 為自動判斷徽章：年收入200萬以上 或 名下實收保費總額超過12萬，符合任一即為 VIP
const isVIPCustomer = (customer, records) => {
  if (customer.incomeRange === VIP_INCOME_THRESHOLD) return true;
  const totalPremium = records
    .filter(r => (r.insuredName || '').trim() === (customer.name || '').trim())
    .reduce((sum, r) => sum + (r.premium || 0), 0);
  return totalPremium > VIP_PREMIUM_THRESHOLD;
};

// IG名單為自動判斷徽章：只要填了 IG 帳號就自動標記
const isIGListCustomer = (customer) => !!(customer.igHandle && customer.igHandle.trim());

const TAIWAN_REGIONS = ['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市', '基隆市', '新竹市', '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義市', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣', '台東縣', '澎湖縣', '金門縣', '連江縣'];
const INCOME_RANGES = ['50萬以下', '50-100萬', '100-200萬', '200萬以上'];

const calcAge = (birthday) => {
  if (!birthday) return null;
  const b = new Date(birthday);
  if (isNaN(b.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - b.getFullYear();
  const hasHadBirthdayThisYear = (today.getMonth() > b.getMonth()) || (today.getMonth() === b.getMonth() && today.getDate() >= b.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
};

const getGoogleMapsUrl = (address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
const getAppleMapsUrl = (address) => `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
const getInstagramUrl = (handle) => `https://instagram.com/${encodeURIComponent(handle.replace(/^@/, ''))}`;
const openLineChat = (lineId) => {
  try { navigator.clipboard?.writeText(lineId); } catch (e) { /* ignore */ }
  window.open(`https://line.me/ti/p/~${encodeURIComponent(lineId)}`, '_blank');
};

// 簡易 CSV 解析工具 (支援雙引號內含逗號，用於 Notion 匯出檔匯入)
const parseCSV = (text) => {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(field); field = '';
        if (row.length > 1 || row[0] !== '') rows.push(row);
        row = [];
      } else field += c;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.length > 0 && !(r.length === 1 && r[0].trim() === ''));
};

// 批次新增行程文字解析：每行「日期(YYYY-MM-DD 或 MM/DD) 時間(選填 HH:MM) 標題」
const parseBatchScheduleText = (text, defaultYear) => {
  return text.split('\n').map(l => l.trim()).filter(Boolean).map((line, i) => {
    let rest = line;
    let date = '';
    const isoMatch = rest.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    const slashMatch = rest.match(/^(\d{1,2})\/(\d{1,2})/);
    if (isoMatch) {
      date = `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;
      rest = rest.slice(isoMatch[0].length).trim();
    } else if (slashMatch) {
      date = `${defaultYear}-${slashMatch[1].padStart(2, '0')}-${slashMatch[2].padStart(2, '0')}`;
      rest = rest.slice(slashMatch[0].length).trim();
    }
    const timeMatch = rest.match(/^(\d{1,2}:\d{2})/);
    let time = '';
    if (timeMatch) {
      time = timeMatch[1];
      rest = rest.slice(timeMatch[0].length).trim();
    }
    return { id: Date.now() + i, date, time, title: rest };
  });
};

const PRODUCT_MAPPING = {
  'ah_general': { label: '一般 A&H (300%)', rate: 3.0, isAH: true, commissionRate: 0.45 },
  'ah_2':       { label: '2年期 A&H (60%)', rate: 0.6, isAH: true, commissionRate: 0.45 },
  'long_20':    { label: '期繳 20年 (300%)', rate: 3.0, isAH: false, commissionRate: 0.40 },
  'long_10':    { label: '期繳 10年 (200%)', rate: 2.0, isAH: false, commissionRate: 0.25 },
  'long_6':     { label: '期繳 6年 (100%)', rate: 1.0, isAH: false, commissionRate: 0 },
  'long_2':     { label: '期繳 2年 (20%)', rate: 0.2, isAH: false, commissionRate: 0 },
  'one_off':    { label: '躉繳 (5%)', rate: 0.05, isAH: false, commissionRate: 0.035 },
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

// 增員相關活動 (與業務活動並列計分，用於 MEA 總分)。分數曲線比照業務六階段 (1-1-2-3-4-5) 的邏輯設計
const RECRUIT_ACTIVITY_WEIGHTS = {
  newRecruitProspect: { label: '新增準增員', score: 1, color: 'bg-teal-500' },
  recruitContact: { label: '增員約訪', score: 1, color: 'bg-cyan-500' },
  recruitInterview: { label: '增員面談', score: 2, color: 'bg-cyan-600' },
  recruitExam: { label: '內/外考', score: 4, color: 'bg-blue-600' },
  recruitRegistered: { label: '登錄', score: 5, color: 'bg-blue-800' }
};

const ALL_ACTIVITY_WEIGHTS = { ...ACTIVITY_WEIGHTS, ...RECRUIT_ACTIVITY_WEIGHTS };

// --- 區運作 BINGO 挑戰賽：預設10項任務 (可在賽事設定裡編輯，不綁死在7月) ---
const DEFAULT_BINGO_TASKS = [
  { id: 'four_star', label: '完成四星會', desc: '一個月受理4位不同客戶', type: 'auto_customer_count', unit: 4, once: false },
  { id: 'weighted_30w', label: '加權保費累積30萬', desc: '', type: 'auto_weighted_premium', unit: 300000, once: false },
  { id: 'premium_50w', label: '實收保費累積50萬', desc: '', type: 'auto_premium', unit: 500000, once: false },
  { id: 'potential_test', label: '完成1位潛能測驗', desc: '增員儀表板達「臨時帳號」階段', type: 'auto_temp_account', unit: 1, once: false },
  { id: 'policy_checkup', label: '完成10位保單健檢', desc: '自行勾選與填寫人數', type: 'manual_count', unit: 10, once: false },
  { id: 'ig_followers', label: '新增30位IG新粉絲', desc: '依自行記錄的粉絲數成長計算', type: 'auto_ig_growth', unit: 30, once: false },
  { id: 'exam', label: '完成1位內考/外考', desc: '增員儀表板達「內考」或「外考」階段', type: 'auto_exam', unit: 1, once: false },
  { id: 'weekly_activity', label: '每週銷售活動量100分', desc: '本月內達成100分的週數', type: 'auto_weekly_activity', unit: 1, once: false },
  { id: 'read_book', label: '看完一本書', desc: '自行勾選，限完成一次', type: 'manual_check', once: true },
  { id: 'exercise', label: '每月運動4次', desc: '自行勾選，限完成一次', type: 'manual_check', once: true },
  { id: 'emergency_contact', label: '保單安心聯絡人', desc: '每5張計分，無上限，自行填寫張數', type: 'manual_count', unit: 5, once: false }
];
const BINGO_CELL_SCORE = 5;
const BINGO_LINE_BONUS = 10;
const BINGO_QUALIFY_THRESHOLD = 30;
const BINGO_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// 業務漏斗階段順序 (不含準客戶)：完成後面的階段時，前面的階段視同也一併完成一次
const SALES_FUNNEL_CHAIN = ['appointment', 'interview', 'proposal', 'application', 'issue'];
const getCascadeKeys = (type) => {
  const idx = SALES_FUNNEL_CHAIN.indexOf(type);
  if (idx === -1) return [type];
  return SALES_FUNNEL_CHAIN.slice(0, idx + 1);
};

// 頂級業務的經營節奏：新名單要快速跟進、既有客戶要定期維繫、準客戶要持續推進漏斗、
// 準增員要穩定培養組織、久未聯繫的人要喚醒關係避免流失。從 customers 裡挑出一批 (預設15人)，
// excludeIds 是這次不想再挑到的人 (例如今天已經推薦過的)。
const buildContactSuggestions = (customers, today, excludeIds, count = 15) => {
  const eligible = customers.filter(c => !excludeIds.has(c.id));
  const daysSinceContact = (c) => {
    const lastVisit = (c.visitLog && c.visitLog.length) ? [...c.visitLog].sort((a, b) => (b.date || '').localeCompare(a.date || ''))[0].date : null;
    const refDate = lastVisit || (c.createdAt ? c.createdAt.split('T')[0] : '2000-01-01');
    return Math.floor((new Date(today) - new Date(refDate)) / 86400000);
  };
  const daysSinceCreated = (c) => Math.floor((new Date(today) - new Date((c.createdAt || '2000-01-01').split('T')[0])) / 86400000);
  const sortStalestFirst = (a, b) => daysSinceContact(b) - daysSinceContact(a);
  const sortNewestFirst = (a, b) => daysSinceCreated(a) - daysSinceCreated(b);

  const pickedIds = new Set();
  const picked = [];
  const takeFromPool = (filterFn, n, sortFn) => {
    const source = eligible.filter(c => filterFn(c) && !pickedIds.has(c.id));
    source.sort(sortFn).slice(0, n).forEach(c => { picked.push(c); pickedIds.add(c.id); });
  };

  const q = (n) => Math.max(1, Math.round(count * n / 15));
  takeFromPool(c => daysSinceCreated(c) <= 14, q(3), sortNewestFirst);
  takeFromPool(c => (c.tags || []).includes('既有客戶'), q(3), sortStalestFirst);
  takeFromPool(c => (c.tags || []).includes('準客戶'), q(4), sortStalestFirst);
  takeFromPool(c => (c.tags || []).includes('準增員'), q(3), sortStalestFirst);
  takeFromPool(c => daysSinceContact(c) >= 90, q(2), sortStalestFirst);

  if (picked.length < count) {
    const remaining = eligible.filter(c => !pickedIds.has(c.id)).sort(sortStalestFirst);
    remaining.slice(0, count - picked.length).forEach(c => { picked.push(c); pickedIds.add(c.id); });
  }
  return picked.slice(0, count);
};

// 重要x緊急 四象限優先度
const PRIORITY_LEVELS = {
  urgent_important: { label: '重要且緊急', color: 'bg-red-500', textColor: 'text-red-600', order: 0 },
  important: { label: '重要不緊急', color: 'bg-amber-500', textColor: 'text-amber-600', order: 1 },
  urgent: { label: '緊急不重要', color: 'bg-blue-500', textColor: 'text-blue-600', order: 2 },
  normal: { label: '都不是', color: 'bg-gray-400', textColor: 'text-gray-400', order: 3 }
};

// 純提醒/固定行程的分類 (業務/增員類行程沿用各自 ALL_ACTIVITY_WEIGHTS 顏色，不需要另外分類)
const REMINDER_CATEGORIES = {
  personal: { label: '私事', color: 'bg-emerald-500' },
  meeting: { label: '課程會議', color: 'bg-gray-800' },
  claim: { label: '理賠', color: 'bg-rose-500' },
  paperwork: { label: '文書', color: 'bg-sky-500' },
  other: { label: '其他', color: 'bg-gray-400' }
};

const getEventColor = (e) => {
  if (e.isReminder) return (REMINDER_CATEGORIES[e.category] || REMINDER_CATEGORIES.other).color;
  return ALL_ACTIVITY_WEIGHTS[e.type]?.color || 'bg-gray-400';
};

// 行程標記完成時共用的邏輯：更新行程狀態、計入當日 MEA 活動量、寫入客戶拜訪軌跡
// 純提醒 (isReminder) 不計分、不寫入客戶軌跡，純粹打勾完成
const completeScheduleEvent = async (event, ownerId) => {
  await updateDoc(doc(db, 'schedule_events', event.id), { status: 'completed', completedAt: new Date().toISOString() });
  if (event.isReminder) return;
  const docId = `${ownerId}_${event.date}`;
  const cascadeKeys = getCascadeKeys(event.type);
  const incrementPayload = {};
  cascadeKeys.forEach(k => { incrementPayload[k] = increment(1); });
  await setDoc(doc(db, 'activity_record', docId), {
    agentId: ownerId,
    date: event.date,
    month: event.date.substring(0, 7),
    ...incrementPayload,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  if (event.customerId) {
    await updateDoc(doc(db, 'customers', event.customerId), {
      visitLog: arrayUnion({ date: event.date, type: ALL_ACTIVITY_WEIGHTS[event.type]?.label || event.type, note: event.note || '' })
    });
  }
};

// 業績回報：標記已發單。案件本身「受理」就已經計入業績儀表板排名(不受此影響)，
// 這裡只負責：① 把狀態改成已發單 ② 在「今天」這個日子，把核保發單 MEA 分數(含前面階段)計上去
const markCaseIssued = async (record) => {
  const today = getTodayDate();
  await updateDoc(doc(db, 'case_record', record.id), { status: '已發單', issuedDate: today });
  const cascadeKeys = getCascadeKeys('issue');
  const incrementPayload = {};
  cascadeKeys.forEach(k => { incrementPayload[k] = increment(1); });
  const docId = `${record.agentId}_${today}`;
  await setDoc(doc(db, 'activity_record', docId), {
    agentId: record.agentId,
    date: today,
    month: today.substring(0, 7),
    ...incrementPayload,
    updatedAt: new Date().toISOString()
  }, { merge: true });
};

// --- 固定行程 (Recurring Rules) 的虛擬場次產生工具 ---
// 每月固定行程用「第N個星期X」表示 (例如每月第1個星期一)
const getNthWeekdayOfMonth = (year, month, weekday, n) => {
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay();
  const day = 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7;
  const date = new Date(year, month, day);
  if (date.getMonth() !== month) return null;
  return date;
};

const dateToStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// 依規則產生「未來一段時間內」該出現在哪幾天 (不會真的預先造好所有 Firestore 文件)
const generateRecurringOccurrences = (rule, windowStart, windowEnd) => {
  const occurrences = [];
  const ruleStart = new Date(rule.startDate);
  const ruleEnd = rule.endDate ? new Date(rule.endDate) : null;
  const effectiveEnd = ruleEnd && ruleEnd < windowEnd ? ruleEnd : windowEnd;

  if (rule.frequency === 'weekly') {
    let cursor = new Date(Math.max(windowStart.getTime(), ruleStart.getTime()));
    while (cursor <= effectiveEnd) {
      if (cursor.getDay() === Number(rule.dayOfWeek)) {
        occurrences.push(dateToStr(cursor));
      }
      cursor = new Date(cursor.getTime() + 86400000);
    }
  } else if (rule.frequency === 'monthly') {
    let y = windowStart.getFullYear();
    let m = windowStart.getMonth();
    const endY = effectiveEnd.getFullYear();
    const endM = effectiveEnd.getMonth();
    while (y < endY || (y === endY && m <= endM)) {
      const occ = getNthWeekdayOfMonth(y, m, Number(rule.dayOfWeekForMonthly), Number(rule.weekOfMonth));
      if (occ && occ >= windowStart && occ <= effectiveEnd && occ >= ruleStart) {
        occurrences.push(dateToStr(occ));
      }
      m++; if (m > 11) { m = 0; y++; }
    }
  }
  return occurrences;
};

// 今日待辦數量 (供導覽列小提示使用)：待完成行程/提醒 + 該追蹤客戶，不含自動推薦名單 (那是建議，不是硬性待辦)
const computeDueTodayCount = (loggedInUser, customers, scheduleEvents, recurringRules) => {
  if (!loggedInUser) return 0;
  const today = getTodayDate();
  const todayDate = new Date(today);
  let virtualCount = 0;
  (recurringRules || []).filter(r => (r.participantIds || []).includes(loggedInUser.id)).forEach(rule => {
    const dates = generateRecurringOccurrences(rule, todayDate, todayDate);
    dates.forEach(date => {
      const alreadyReal = (scheduleEvents || []).some(e => e.ruleId === rule.id && e.date === date);
      if (!alreadyReal) virtualCount++;
    });
  });
  const dueEventsCount = (scheduleEvents || []).filter(e => e.status === 'scheduled' && e.date <= today).length + virtualCount;
  const dueCustomersCount = (customers || []).filter(c => c.nextFollowUpDate && c.nextFollowUpDate <= today).length;
  return dueEventsCount + dueCustomersCount;
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
  const emptyActivityForm = () => ({
    date: getTodayDate(),
    ...Object.fromEntries(Object.keys(ACTIVITY_WEIGHTS).map(k => [k, 0])),
    ...Object.fromEntries(Object.keys(RECRUIT_ACTIVITY_WEIGHTS).map(k => [k, 0]))
  });
  const [formData, setFormData] = useState(emptyActivityForm);
  const [viewMode, setViewMode] = useState('sales');

  // 月／週 檢視切換
  const [periodMode, setPeriodMode] = useState('month');
  const [selectedWeekStart, setSelectedWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diffToMonday);
    return dateToStr(d);
  });
  const shiftWeek = (delta) => {
    const d = new Date(selectedWeekStart);
    d.setDate(d.getDate() + delta * 7);
    setSelectedWeekStart(dateToStr(d));
  };
  const periodRange = useMemo(() => {
    if (periodMode === 'week') {
      const start = new Date(selectedWeekStart);
      const end = new Date(start); end.setDate(end.getDate() + 6);
      return { start: selectedWeekStart, end: dateToStr(end) };
    }
    const [y, m] = selectedMonth.split('-').map(Number);
    const lastDay = new Date(y, m, 0).getDate();
    return { start: `${selectedMonth}-01`, end: `${selectedMonth}-${String(lastDay).padStart(2, '0')}` };
  }, [periodMode, selectedMonth, selectedWeekStart]);

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
      const allKeys = [...Object.keys(ACTIVITY_WEIGHTS), ...Object.keys(RECRUIT_ACTIVITY_WEIGHTS)];
      if (existingRecord) {
        const loaded = { date: formData.date };
        allKeys.forEach(k => { loaded[k] = existingRecord[k] || 0; });
        setFormData(loaded);
      } else {
        setFormData(prev => {
          const reset = { ...prev };
          allKeys.forEach(k => { reset[k] = 0; });
          return reset;
        });
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
      const allKeys = [...Object.keys(ACTIVITY_WEIGHTS), ...Object.keys(RECRUIT_ACTIVITY_WEIGHTS)];
      const payload = {
        agentId: selectedAgentId,
        date: formData.date,
        month: formData.date.substring(0, 7),
        updatedAt: new Date().toISOString()
      };
      allKeys.forEach(k => { payload[k] = Number(formData[k]) || 0; });
      await setDoc(docRef, payload, { merge: true });
    } catch (error) {
      console.error("Error saving activity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 計算 MEA 核心指標與商品線
  const stats = useMemo(() => {
    let salesPoints = 0;
    let recruitPoints = 0;
    const totals = { prospect: 0, appointment: 0, interview: 0, proposal: 0, application: 0, issue: 0 };
    const recruitTotals = Object.fromEntries(Object.keys(RECRUIT_ACTIVITY_WEIGHTS).map(k => [k, 0]));
    
    // 1. 統計選定區間 (月或週) 的活動量
    const monthActivities = activities.filter(a => a.agentId === selectedAgentId && a.date >= periodRange.start && a.date <= periodRange.end);
    monthActivities.forEach(record => {
      Object.keys(totals).forEach(key => {
        const val = record[key] || 0;
        totals[key] += val;
        salesPoints += val * ACTIVITY_WEIGHTS[key].score;
      });
      Object.keys(recruitTotals).forEach(key => {
        const val = record[key] || 0;
        recruitTotals[key] += val;
        recruitPoints += val * RECRUIT_ACTIVITY_WEIGHTS[key].score;
      });
    });

    const totalPoints = salesPoints + recruitPoints;
    // 增員版轉換率：增員面談次數 x 面談轉登錄轉換率 = 登錄人數
    const recruitConversion = recruitTotals.recruitInterview > 0 ? (recruitTotals.recruitRegistered / recruitTotals.recruitInterview) : 0;

    // 獨立計算面談分數
    const interviewPoints = totals.interview * ACTIVITY_WEIGHTS.interview.score;

    // 2. 統計選定區間 (月或週) 的業績與商品線
    const monthRecords = records.filter(r => r.agentId === selectedAgentId && r.date >= periodRange.start && r.date <= periodRange.end);
    const totalPremium = monthRecords.reduce((sum, r) => sum + (r.premium || 0), 0);
    // FYC = 實收保費 × 佣金轉換率，代表實際收入估算，不是競賽用的加權保費
    const getCommission = (r) => (r.premium || 0) * (PRODUCT_MAPPING[r.typeCode]?.commissionRate || 0);
    const totalFYC = monthRecords.reduce((sum, r) => sum + getCommission(r), 0);

    let rpPremium = 0, rpCases = 0, rpFYC = 0;
    let ahPremium = 0, ahCases = 0, ahFYC = 0;
    let spPremium = 0, spCases = 0, spFYC = 0;

    monthRecords.forEach(r => {
       const p = r.premium || 0;
       const fyc = getCommission(r);
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

    return { totals, recruitTotals, totalPoints, salesPoints, recruitPoints, recruitConversion, interviewPoints, totalPremium, totalFYC, P, C, I, valuePerPoint, premiumPerPoint, productLines };
  }, [activities, records, selectedAgentId, periodRange]);

  // 準備圖表資料 (漏斗圖變體 - 橫向長條圖)
  const chartData = Object.keys(ACTIVITY_WEIGHTS).map(key => ({
    name: ACTIVITY_WEIGHTS[key].label,
    count: stats.totals[key],
    fill: ACTIVITY_WEIGHTS[key].color.replace('bg-', '')
  }));
  const recruitChartData = Object.keys(RECRUIT_ACTIVITY_WEIGHTS).map(key => ({
    name: RECRUIT_ACTIVITY_WEIGHTS[key].label,
    count: stats.recruitTotals[key],
    fill: RECRUIT_ACTIVITY_WEIGHTS[key].color.replace('bg-', '')
  }));
  const chartColors = ['#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#EC4899', '#F43F5E'];
  const recruitChartColors = ['#14B8A6', '#06B6D4', '#0891B2', '#2563EB', '#1E40AF'];

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
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex gap-4 items-center bg-white/5 p-2 rounded-xl border border-white/10 w-fit backdrop-blur-md">
              <select 
                className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer appearance-none px-3" 
                value={selectedAgentId} 
                onChange={(e) => setSelectedAgentId(e.target.value)}
              >
                {team.map(m => <option key={m.id} value={m.id} className="text-gray-900">{m.name}</option>)}
              </select>
              <div className="w-px h-6 bg-white/20"></div>
              {periodMode === 'month' ? (
                <select 
                  className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer appearance-none px-3" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {currentMonths.map(m => <option key={m.value} value={m.value} className="text-gray-900">{m.label}</option>)}
                </select>
              ) : (
                <div className="flex items-center gap-2 px-2">
                  <button type="button" onClick={() => shiftWeek(-1)} className="text-gray-300 hover:text-white"><ChevronLeft size={16} /></button>
                  <span className="text-xs font-bold text-white whitespace-nowrap">{periodRange.start} ~ {periodRange.end}</span>
                  <button type="button" onClick={() => shiftWeek(1)} className="text-gray-300 hover:text-white"><ChevronRight size={16} /></button>
                </div>
              )}
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex bg-white/10 rounded-lg p-0.5">
                <button type="button" onClick={() => setPeriodMode('month')} className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${periodMode === 'month' ? 'bg-white text-gray-900' : 'text-gray-300'}`}>月</button>
                <button type="button" onClick={() => setPeriodMode('week')} className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition ${periodMode === 'week' ? 'bg-white text-gray-900' : 'text-gray-300'}`}>週</button>
              </div>
            </div>
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 backdrop-blur-md">
              <button type="button" onClick={() => setViewMode('sales')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${viewMode === 'sales' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>業務</button>
              <button type="button" onClick={() => setViewMode('recruit')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition ${viewMode === 'recruit' ? 'bg-teal-600 text-white' : 'text-gray-400 hover:text-white'}`}>增員</button>
            </div>
          </div>
        </div>
        
        {/* The MEA Core Formula Display */}
        {viewMode === 'sales' ? (
          <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 min-w-[300px] flex flex-col justify-center">
            <p className="text-xs text-indigo-300 font-bold uppercase tracking-wider mb-2">本月業務 MEA 核心公式</p>
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
        ) : (
          <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 min-w-[300px] flex flex-col justify-center">
            <p className="text-xs text-teal-300 font-bold uppercase tracking-wider mb-2">本月增員核心公式</p>
            <div className="flex items-center gap-3 text-lg font-mono">
              <div className="text-center">
                <span className="block text-2xl font-bold text-white">{stats.recruitTotals.recruitInterview}</span>
                <span className="text-[10px] text-gray-400">I (增員面談)</span>
              </div>
              <span className="text-teal-400 font-bold">X</span>
              <div className="text-center">
                <span className="block text-2xl font-bold text-white">{(stats.recruitConversion * 100).toFixed(1)}%</span>
                <span className="text-[10px] text-gray-400">C (面談轉登錄率)</span>
              </div>
              <span className="text-teal-400 font-bold">=</span>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-end">
              <div>
                 <span className="text-3xl font-bold text-teal-400">{stats.recruitTotals.recruitRegistered}</span>
                 <span className="text-xs text-gray-400 ml-2">本月登錄人數</span>
              </div>
            </div>
          </div>
        )}
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
              {viewMode === 'sales' ? (
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
                        <button type="button" onClick={() => setFormData(p => {
                          const keys = getCascadeKeys(key);
                          const next = { ...p };
                          keys.forEach(k => { next[k] = (next[k] || 0) + 1; });
                          return next;
                        })} className="w-6 h-6 flex items-center justify-center bg-white rounded border hover:bg-gray-100 text-gray-500" title="完成此階段會自動補上前面的階段">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">增員活動</p>
                  <div className="space-y-2">
                    {Object.entries(RECRUIT_ACTIVITY_WEIGHTS).map(([key, config]) => (
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
                </div>
              )}

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

          <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center justify-around text-center">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">業務活動分</p>
              <p className="text-lg font-bold text-indigo-600">{stats.salesPoints}</p>
            </div>
            <div className="w-px h-8 bg-gray-100"></div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">增員活動分</p>
              <p className="text-lg font-bold text-teal-600">{stats.recruitPoints}</p>
            </div>
            <div className="w-px h-8 bg-gray-100"></div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">總分</p>
              <p className={`text-lg font-bold ${stats.totalPoints < 400 ? 'text-red-500' : 'text-gray-900'}`}>{stats.totalPoints}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Funnel & Analysis */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 h-full flex flex-col">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Filter className={viewMode === 'sales' ? 'text-indigo-500' : 'text-teal-500'} size={20}/> 
              {viewMode === 'sales' ? '銷售漏斗分析與轉換率' : '增員漏斗分析與轉換率'} ({periodMode === 'month' ? selectedMonth : `${periodRange.start} ~ ${periodRange.end}`})
            </h3>
            <div className="flex-1 min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewMode === 'sales' ? chartData : recruitChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0"/>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 12, fontWeight: 'bold'}} />
                  <Tooltip 
                    cursor={{fill: '#f9fafb'}} 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'}}
                    formatter={(value) => [value, '次數']}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32} label={{ position: 'right', fill: '#6B7280', fontWeight: 'bold' }}>
                    {(viewMode === 'sales' ? chartData : recruitChartData).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={(viewMode === 'sales' ? chartColors : recruitChartColors)[index % (viewMode === 'sales' ? chartColors : recruitChartColors).length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Conversion Rates */}
            {viewMode === 'sales' ? (
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
            ) : (
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
                 <div className="text-center">
                   <p className="text-[10px] font-bold text-gray-400 uppercase">準增員轉換約訪</p>
                   <p className="text-lg font-bold text-teal-600 mt-1">
                     {stats.recruitTotals.newRecruitProspect > 0 ? Math.round((stats.recruitTotals.recruitContact / stats.recruitTotals.newRecruitProspect) * 100) : 0}%
                   </p>
                 </div>
                 <div className="text-center border-l border-gray-100">
                   <p className="text-[10px] font-bold text-gray-400 uppercase">約訪轉換面談</p>
                   <p className="text-lg font-bold text-cyan-600 mt-1">
                     {stats.recruitTotals.recruitContact > 0 ? Math.round((stats.recruitTotals.recruitInterview / stats.recruitTotals.recruitContact) * 100) : 0}%
                   </p>
                 </div>
                 <div className="text-center border-l border-gray-100 bg-blue-50/50 rounded-lg p-2">
                   <p className="text-[10px] font-bold text-blue-500 uppercase">面談轉登錄率 (C)</p>
                   <p className="text-xl font-bold text-blue-600 mt-1">
                     {(stats.recruitConversion * 100).toFixed(1)}%
                   </p>
                 </div>
              </div>
            )}
          </Card>
        </div>
        
        {/* 各商品線業績分析 Table (僅業務模式顯示) */}
        {viewMode === 'sales' && (
        <Card className="p-6 col-span-1 lg:col-span-3 border-t-4 border-t-emerald-500">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <PieChartIcon className="text-emerald-500" size={20}/>
            各商品線業績分析 ({periodMode === 'month' ? selectedMonth : `${periodRange.start} ~ ${periodRange.end}`})
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
        )}
      </div>
    </div>
  );
};


// --- BatchEntryModal Component (New) ---
const BatchEntryModal = ({ isOpen, onClose, team, records, onSubmit }) => {
  const [step, setStep] = useState(1);
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingPolicySet = useMemo(() => new Set((records || []).map(r => (r.policyNumber || '').trim().toLowerCase()).filter(Boolean)), [records]);

  const isDuplicateRow = (row) => {
    const key = (row.policyNumber || '').trim().toLowerCase();
    if (!key) return false;
    if (existingPolicySet.has(key)) return true;
    return parsedRows.filter(r => (r.policyNumber || '').trim().toLowerCase() === key).length > 1;
  };

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
          date: currentDate || getTodayDate(),
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
    const validRows = parsedRows.filter(r => r.agentId && r.premium);
    const duplicateCount = validRows.filter(isDuplicateRow).length;
    if (duplicateCount > 0) {
      const confirmed = window.confirm(`偵測到 ${duplicateCount} 筆保單號碼疑似重複（已用紅色標示），確定要繼續送出嗎？`);
      if (!confirmed) return;
    }
    setIsSubmitting(true);
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
                    {parsedRows.map((row) => {
                      const dup = isDuplicateRow(row);
                      return (
                      <tr key={row.id} className={`hover:bg-gray-50 group ${dup ? 'bg-red-50' : ''}`}>
                        <td className="p-2"><input type="date" className="bg-transparent border border-transparent hover:border-gray-300 rounded px-1 w-24 outline-none focus:border-indigo-500" value={row.date} onChange={e => updateRow(row.id, 'date', e.target.value)} /></td>
                        <td className="p-2">
                           <select className={`bg-transparent border rounded px-1 w-24 outline-none focus:border-indigo-500 ${!row.agentId ? 'border-red-300 bg-red-50' : 'border-transparent hover:border-gray-300'}`} value={row.agentId} onChange={e => updateRow(row.id, 'agentId', e.target.value)}>
                              <option value="">(未對應)</option>
                              {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                           </select>
                        </td>
                        <td className="p-2">
                           <input type="text" className={`bg-transparent border rounded px-1 w-24 outline-none focus:border-indigo-500 ${dup ? 'border-red-300' : 'border-transparent hover:border-gray-300'}`} value={row.policyNumber} onChange={e => updateRow(row.id, 'policyNumber', e.target.value)} />
                           {dup && <div className="text-[9px] text-red-500 font-bold whitespace-nowrap">⚠ 重複</div>}
                        </td>
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
                      );
                    })}
                    {parsedRows.length === 0 && <tr><td colSpan="9" className="text-center py-8 text-gray-400">無法解析任何資料，請檢查輸入格式。</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="text-right text-xs text-gray-400">共解析 {parsedRows.length} 筆資料，紅色列代表保單號碼可能重複，請確認「業務同仁」與「商品類型」是否正確。</div>
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
         // Firestore 不接受 undefined 值，還沒填過的日期欄位要轉成空字串，不然整包寫入會被拒絕
         const sanitizedDates = {};
         Object.entries(partialData.dates).forEach(([k, v]) => { sanitizedDates[k] = v === undefined ? '' : v; });
         updatePayload.timeline = sanitizedDates;
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
                              {recruit.isPromoted ? (
                                <span className="text-xs text-gray-400">{recruit.dates?.[d.key] || '-'}</span>
                              ) : (
                                <DateSelect yearsBack={3} yearsForward={3} value={recruit.dates?.[d.key] || ''} onChange={(val) => {
                                  const currentDates = recruit.dates || {};
                                  updateRecruit(recruit.id, { dates: { ...currentDates, [d.key]: val } });
                                }}/>
                              )}
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
  const [form, setForm] = useState({ agentId: '', policyNumber: '', insuredName: '', product: '', typeCode: 'ah_general', premium: '', isESG: false, date: getTodayDate() });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [celebration, setCelebration] = useState(null);
  const [issuingId, setIssuingId] = useState(null);

  const handleMarkIssued = async (record) => {
    setIssuingId(record.id);
    try { await markCaseIssued(record); } catch (e) { console.error(e); } finally { setIssuingId(null); }
  };
  
  const [filterAgent, setFilterAgent] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    if (!celebration) return;
    const timer = setTimeout(() => setCelebration(null), 4000);
    return () => clearTimeout(timer);
  }, [celebration]);

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

  // 保單號碼重複檢查：避免同一張保單被重複輸入造成業績算錯
  const duplicateRecord = useMemo(() => {
    const key = form.policyNumber.trim().toLowerCase();
    if (!key) return null;
    return records.find(r => r.id !== editingId && (r.policyNumber || '').trim().toLowerCase() === key) || null;
  }, [form.policyNumber, records, editingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.agentId || !form.premium || !user) return;
    if (duplicateRecord) {
      const confirmed = window.confirm(`保單號碼「${form.policyNumber}」已經有一筆紀錄（${duplicateRecord.agentName} · ${duplicateRecord.date}），確定要繼續新增嗎？`);
      if (!confirmed) return;
    }
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
        await addDoc(collection(db, 'case_record'), { ...recordData, status: '受理中' });
        const typeInfo = PRODUCT_MAPPING[form.typeCode] || PRODUCT_MAPPING['ah_general'];
        let weighted = parseInt(form.premium) * typeInfo.rate;
        if (form.isESG) weighted *= 1.05;
        setCelebration({ product: form.product, weighted: Math.round(weighted) });
      }
      setForm({ agentId: '', policyNumber: '', insuredName: '', product: '', typeCode: 'ah_general', premium: '', isESG: false, date: getTodayDate() });
    } catch (error) { console.error(error); } finally { setSubmitting(false); }
  };

  const handleBatchSubmit = async (rows) => {
    if (!user) return;
    try {
       const batch = writeBatch(db);
       let totalWeighted = 0;
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
             created_at: new Date().toISOString(),
             status: '受理中'
          });
          const typeInfo = PRODUCT_MAPPING[row.typeCode] || PRODUCT_MAPPING['ah_general'];
          let weighted = parseInt(row.premium) * typeInfo.rate;
          if (row.isESG) weighted *= 1.05;
          totalWeighted += weighted;
       });
       await batch.commit();
       setCelebration({ product: `共 ${rows.length} 筆保單`, weighted: Math.round(totalWeighted) });
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
      {celebration && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-4 rounded-2xl shadow-2xl animate-scale-up flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-bold">恭喜完成一筆保單！</p>
            <p className="text-sm">{celebration.product} · {formatMoney(celebration.weighted)}</p>
          </div>
        </div>
      )}
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
        records={records}
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
           <div className="space-y-1"><label className="text-xs font-bold text-gray-500">保單號碼</label><input type="text" className={`w-full p-3 bg-gray-50 rounded border outline-none ${duplicateRecord ? 'border-red-300' : ''}`} value={form.policyNumber} onChange={e=>setForm({...form, policyNumber: e.target.value})} required/>
             {duplicateRecord && <p className="text-xs text-red-500 font-bold">⚠ 此保單號碼已存在紀錄（{duplicateRecord.agentName} · {duplicateRecord.date}）</p>}
           </div>
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
        {filteredRecords.map(r=>(
          <Card key={r.id} className="p-4 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="font-bold text-gray-900">{r.agentName} <span className="text-gray-400 font-normal text-xs">| {r.product}</span></span>
              <span className="text-xs text-gray-500">{r.date} • {r.insuredName} {r.isESG && '• ESG'}</span>
              <span className={`text-[10px] font-bold mt-1 inline-block w-fit px-2 py-0.5 rounded-full ${r.status === '已發單' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.status || '已發單'}</span>
            </div>
            <div className="text-right">
              <span className="block font-bold text-indigo-600">{formatMoney(r.weighted)}</span>
              <div className="flex gap-2 justify-end items-center mt-1">
                {r.status && r.status !== '已發單' && (
                  <button disabled={issuingId === r.id} onClick={() => handleMarkIssued(r)} className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded-lg transition disabled:opacity-50 flex items-center gap-1">
                    {issuingId === r.id ? <Loader2 size={11} className="animate-spin" /> : null} 標記已發單
                  </button>
                )}
                <Edit3 size={14} className="text-gray-400 cursor-pointer hover:text-indigo-500" onClick={()=>handleEdit(r)}/>
                <Trash2 size={14} className="text-gray-400 cursor-pointer hover:text-red-500" onClick={()=>setDeleteId(r.id)}/>
              </div>
            </div>
          </Card>
        ))}
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

// --- IG 名單匯入 Modal ---
const IGImportModal = ({ isOpen, onClose, loggedInUser, existingNames, onImported }) => {
  const [rawUsernames, setRawUsernames] = useState([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRawUsernames([]);
      setFileName('');
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        let arr = [];
        if (Array.isArray(data)) arr = data;
        else if (data.relationships_following) arr = data.relationships_following;
        else if (data.relationships_followers) arr = data.relationships_followers;
        else if (data.string_list_data) arr = [data];

        const usernames = [];
        arr.forEach(item => {
          const entry = item.string_list_data && item.string_list_data[0];
          if (entry && entry.value) usernames.push(entry.value);
        });
        const unique = [...new Set(usernames)];
        if (unique.length === 0) {
          setError('沒有解析到任何帳號，請確認上傳的是 IG 匯出的 followers_1.json 或 following.json');
        }
        setRawUsernames(unique);
      } catch (err) {
        console.error(err);
        setError('檔案格式錯誤，無法解析，請確認是 IG 匯出的 .json 檔案');
      }
    };
    reader.readAsText(file);
  };

  const newOnes = useMemo(() => rawUsernames.filter(u => !existingNames.has(u.trim().toLowerCase())), [rawUsernames, existingNames]);

  const handleImport = async () => {
    if (newOnes.length === 0 || !loggedInUser) return;
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      newOnes.forEach(username => {
        const ref = doc(collection(db, 'customers'));
        batch.set(ref, {
          name: username,
          phone: '', lineId: '', igHandle: username, birthday: '', gender: '', region: '', incomeRange: '', address: '',
          tags: ['準客戶'],
          notes: '由 IG 匯入，待補充聯絡資訊',
          nextFollowUpDate: '',
          source: 'IG匯入',
          ownerId: loggedInUser.id,
          visitLog: [],
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
      onImported();
      onClose();
    } catch (e) {
      console.error(e);
      setError('匯入失敗，請再試一次');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-900">IG 名單匯入</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-700 leading-relaxed border border-blue-100">
            請上傳 Instagram「下載你的資訊」匯出的 <code>followers_1.json</code> 或 <code>following.json</code>。
            <br />⚠ IG 匯出檔只包含帳號名稱，不含真實姓名/電話，匯入後會先建立「待確認」名單，需要你之後手動補上聯絡資訊。
          </div>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-indigo-400 transition">
            <Upload size={28} className="text-gray-400 mb-2" />
            <span className="text-sm font-bold text-gray-600">{fileName || '點擊選擇 .json 檔案'}</span>
            <input type="file" accept=".json" className="hidden" onChange={handleFile} />
          </label>
          {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
          {rawUsernames.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="font-bold text-gray-700">解析到 {rawUsernames.length} 個帳號</p>
              <p className="text-xs text-gray-500 mt-1">其中 <span className="font-bold text-indigo-600">{newOnes.length}</span> 個是新的（{rawUsernames.length - newOnes.length} 個已存在，會自動略過）</p>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-200 rounded-lg transition">取消</button>
          <button onClick={handleImport} disabled={newOnes.length === 0 || isSubmitting} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
            {isSubmitting && <Loader2 className="animate-spin" size={16} />} 匯入 {newOnes.length} 筆
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Notion CSV 匯入 Modal ---
const NotionImportModal = ({ isOpen, onClose, loggedInUser, onImported }) => {
  const [step, setStep] = useState(1);
  const [rawText, setRawText] = useState('');
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({ name: '', phone: '', birthday: '', notes: '', tag: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1); setRawText(''); setHeaders([]); setRows([]);
      setMapping({ name: '', phone: '', birthday: '', notes: '', tag: '' });
      setError(''); setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setRawText(ev.target.result);
    reader.readAsText(file);
  };

  const handleParse = () => {
    setError('');
    const parsed = parseCSV(rawText);
    if (parsed.length < 2) {
      setError('無法解析出資料，請確認貼上的內容是 CSV 格式（含標題列）');
      return;
    }
    setHeaders(parsed[0]);
    setRows(parsed.slice(1));
    // 嘗試自動猜測欄位對應
    const guess = (keywords) => parsed[0].findIndex(h => keywords.some(k => h.includes(k)));
    const nameIdx = guess(['姓名', 'Name', '名稱']);
    const phoneIdx = guess(['電話', 'Phone', '手機']);
    const birthdayIdx = guess(['生日', 'Birthday']);
    const notesIdx = guess(['備註', 'Note', '需求']);
    const tagIdx = guess(['標籤', 'Tag', '狀態']);
    setMapping({
      name: nameIdx >= 0 ? parsed[0][nameIdx] : '',
      phone: phoneIdx >= 0 ? parsed[0][phoneIdx] : '',
      birthday: birthdayIdx >= 0 ? parsed[0][birthdayIdx] : '',
      notes: notesIdx >= 0 ? parsed[0][notesIdx] : '',
      tag: tagIdx >= 0 ? parsed[0][tagIdx] : ''
    });
    setStep(2);
  };

  const getColIndex = (headerName) => headers.indexOf(headerName);

  const previewRows = useMemo(() => {
    const nameIdx = getColIndex(mapping.name);
    const phoneIdx = getColIndex(mapping.phone);
    const birthdayIdx = getColIndex(mapping.birthday);
    const notesIdx = getColIndex(mapping.notes);
    const tagIdx = getColIndex(mapping.tag);
    return rows.map(r => ({
      name: nameIdx >= 0 ? (r[nameIdx] || '').trim() : '',
      phone: phoneIdx >= 0 ? (r[phoneIdx] || '').trim() : '',
      birthday: birthdayIdx >= 0 ? (r[birthdayIdx] || '').trim() : '',
      notes: notesIdx >= 0 ? (r[notesIdx] || '').trim() : '',
      tag: tagIdx >= 0 ? (r[tagIdx] || '').trim() : ''
    })).filter(r => r.name);
  }, [rows, mapping, headers]);

  const handleImport = async () => {
    if (previewRows.length === 0 || !loggedInUser) return;
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      previewRows.forEach(r => {
        const ref = doc(collection(db, 'customers'));
        batch.set(ref, {
          name: r.name,
          phone: r.phone || '',
          birthday: r.birthday || '',
          gender: '', region: '', incomeRange: '', address: '', lineId: '', igHandle: '',
          tags: [CUSTOMER_TAGS.includes(r.tag) ? r.tag : '既有客戶'],
          notes: r.notes || '',
          nextFollowUpDate: '',
          source: 'Notion匯入',
          ownerId: loggedInUser.id,
          visitLog: [],
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
      onImported();
      onClose();
    } catch (e) {
      console.error(e);
      setError('匯入失敗，請再試一次');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-900">Notion 客戶資料匯入</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {step === 1 ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-700 leading-relaxed border border-blue-100">
                先到 Notion 把客戶資料庫「Export → CSV」匯出，再把 CSV 檔上傳，或直接把內容貼在下面的欄位裡。
              </div>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-indigo-400 transition">
                <Upload size={24} className="text-gray-400 mb-2" />
                <span className="text-sm font-bold text-gray-600">點擊選擇 .csv 檔案</span>
                <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
              </label>
              <textarea
                className="w-full h-40 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 font-mono text-xs resize-none"
                placeholder="或直接把 CSV 內容貼在這裡"
                value={rawText}
                onChange={e => setRawText(e.target.value)}
              />
              {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
            </>
          ) : (
            <>
              <p className="text-sm font-bold text-gray-700">欄位對應（請確認每個欄位對到 CSV 中正確的欄位）</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'name', label: '姓名 (必填)' },
                  { key: 'phone', label: '電話' },
                  { key: 'birthday', label: '生日' },
                  { key: 'tag', label: '標籤' },
                  { key: 'notes', label: '備註' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-bold text-gray-500 block mb-1">{f.label}</label>
                    <select
                      className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                      value={mapping[f.key]}
                      onChange={e => setMapping(prev => ({ ...prev, [f.key]: e.target.value }))}
                    >
                      <option value="">(不匯入)</option>
                      {headers.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto border border-gray-100 rounded-xl mt-2">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                    <tr><th className="px-3 py-2">姓名</th><th className="px-3 py-2">電話</th><th className="px-3 py-2">生日</th><th className="px-3 py-2">標籤</th><th className="px-3 py-2">備註</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {previewRows.slice(0, 8).map((r, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-bold">{r.name}</td>
                        <td className="px-3 py-2">{r.phone}</td>
                        <td className="px-3 py-2">{r.birthday}</td>
                        <td className="px-3 py-2">{r.tag}</td>
                        <td className="px-3 py-2 truncate max-w-[150px]">{r.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400">共預覽 {Math.min(8, previewRows.length)} / {previewRows.length} 筆有效資料（沒有姓名的列會被略過）</p>
              {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
            </>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          {step === 1 ? (
            <button onClick={handleParse} disabled={!rawText} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50">下一步：欄位對應</button>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-200 rounded-lg transition">返回</button>
              <button onClick={handleImport} disabled={!mapping.name || previewRows.length === 0 || isSubmitting} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
                {isSubmitting && <Loader2 className="animate-spin" size={16} />} 匯入 {previewRows.length} 筆
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 客戶管理 CRM ---
// --- 客戶關聯網 (家庭樹 + 轉介軌跡合併) ---
const RelationshipNetworkModal = ({ isOpen, onClose, focusId, setFocusId, customers, relationships, loggedInUser }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [addCustomerId, setAddCustomerId] = useState('');
  const [addType, setAddType] = useState('spouse');
  const [addLabel, setAddLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingRelId, setEditingRelId] = useState(null);
  const [editLabel, setEditLabel] = useState('');

  useEffect(() => { if (isOpen) { setShowAddForm(false); setAddCustomerId(''); setAddLabel(''); setAddType('spouse'); setEditingRelId(null); } }, [isOpen, focusId]);

  const focusCustomer = customers.find(c => c.id === focusId);

  // 家庭樹只使用配偶+血親兩種關係佈局，轉介另外列出 (不參與樹狀圖)
  const treeEdges = useMemo(() => relationships.filter(r => r.type === 'spouse' || r.type === 'blood'), [relationships]);

  const referralConnections = useMemo(() => {
    if (!focusId) return [];
    return relationships.filter(r => r.type === 'referral' && (r.fromId === focusId || r.toId === focusId)).map(r => {
      const isReferrer = r.fromId === focusId;
      const otherId = isReferrer ? r.toId : r.fromId;
      const other = customers.find(c => c.id === otherId);
      return { id: r.id, other, label: isReferrer ? '我介紹了他' : '他介紹了我' };
    }).filter(c => c.other);
  }, [relationships, focusId, customers]);

  // 直接跟目前 focus 的人有關聯的稱謂標籤 (顯示在樹狀節點下方)
  const directLabels = useMemo(() => {
    const map = {};
    if (!focusId) return map;
    treeEdges.forEach(r => {
      if (r.fromId === focusId || r.toId === focusId) {
        const otherId = r.fromId === focusId ? r.toId : r.fromId;
        map[otherId] = r.label || (r.type === 'spouse' ? '配偶' : '血親');
      }
    });
    return map;
  }, [treeEdges, focusId]);

  // 目前 focus 這個人的所有配偶/血親關係 (供編輯/刪除用列表)
  const directConnections = useMemo(() => {
    if (!focusId) return [];
    return treeEdges.filter(r => r.fromId === focusId || r.toId === focusId).map(r => {
      const otherId = r.fromId === focusId ? r.toId : r.fromId;
      const other = customers.find(c => c.id === otherId);
      const relDesc = r.type === 'spouse' ? '配偶' : (r.fromId === focusId ? '他是我的子女' : '他是我的父母');
      return { id: r.id, other, label: r.label || '', relDesc };
    }).filter(c => c.other);
  }, [treeEdges, focusId, customers]);

  // BFS 分層：blood 的 fromId=父母(上層) toId=子女(下層)；spouse 同層。接著把配偶合併成一個「單元」計算座標與連線
  const layout = useMemo(() => {
    if (!focusId || !customers.some(c => c.id === focusId)) return null;

    // 第一步：BFS 算出每個人相對於 focus 的「輩分」(Y 軸用)
    const level = { [focusId]: 0 };
    const queue = [focusId];
    const visited = new Set([focusId]);
    while (queue.length) {
      const p = queue.shift();
      treeEdges.forEach(e => {
        if (e.type === 'spouse') {
          if (e.fromId === p || e.toId === p) {
            const other = e.fromId === p ? e.toId : e.fromId;
            if (!visited.has(other)) { level[other] = level[p]; visited.add(other); queue.push(other); }
          }
        } else if (e.type === 'blood') {
          if (e.fromId === p && !visited.has(e.toId)) { level[e.toId] = level[p] + 1; visited.add(e.toId); queue.push(e.toId); }
          if (e.toId === p && !visited.has(e.fromId)) { level[e.fromId] = level[p] - 1; visited.add(e.fromId); queue.push(e.fromId); }
        }
      });
    }

    const byLevel = {};
    Object.entries(level).forEach(([id, lvl]) => {
      if (!byLevel[lvl]) byLevel[lvl] = [];
      byLevel[lvl].push(id);
    });
    const sortedLevelKeys = Object.keys(byLevel).map(Number).sort((a, b) => a - b);

    // 第二步：把配偶合併成「單元」(一對夫妻算一個定位單位)
    const usedInUnit = new Set();
    const unitsByLevel = {};
    sortedLevelKeys.forEach(lvl => {
      const ids = byLevel[lvl];
      const units = [];
      ids.forEach(id => {
        if (usedInUnit.has(id)) return;
        const spouseEdge = treeEdges.find(e => e.type === 'spouse' && (e.fromId === id || e.toId === id) && ids.includes(e.fromId === id ? e.toId : e.fromId));
        if (spouseEdge) {
          const partner = spouseEdge.fromId === id ? spouseEdge.toId : spouseEdge.fromId;
          if (!usedInUnit.has(partner)) {
            units.push({ key: `${id}_${partner}`, ids: [id, partner], children: [], parent: null });
            usedInUnit.add(id); usedInUnit.add(partner);
            return;
          }
        }
        units.push({ key: id, ids: [id], children: [], parent: null });
        usedInUnit.add(id);
      });
      unitsByLevel[lvl] = units;
    });

    const unitOfPerson = {};
    const allUnits = [];
    sortedLevelKeys.forEach(lvl => { unitsByLevel[lvl].forEach(u => { allUnits.push(u); u.ids.forEach(id => { unitOfPerson[id] = u; }); }); });

    // 第三步：建立單元與單元之間的「親子」樹狀關係 (只用來計算 X 座標)
    allUnits.forEach(u => {
      for (const id of u.ids) {
        const parentEdge = treeEdges.find(e => e.type === 'blood' && e.toId === id);
        if (parentEdge) {
          const parentUnit = unitOfPerson[parentEdge.fromId];
          if (parentUnit && parentUnit.key !== u.key) { u.parent = parentUnit; break; }
        }
      }
    });
    allUnits.forEach(u => { if (u.parent && !u.parent.children.includes(u)) u.parent.children.push(u); });
    const roots = allUnits.filter(u => !u.parent);

    const NODE_W = 84, COUPLE_GAP = 16, SIBLING_GAP = 40, ROW_H = 170;
    const rowY = {};
    sortedLevelKeys.forEach((lvl, idx) => { rowY[lvl] = 60 + idx * ROW_H; });
    allUnits.forEach(u => { u.ownWidth = u.ids.length === 2 ? NODE_W * 2 + COUPLE_GAP : NODE_W; });

    // 第四步 (由下往上)：每個單元的「子樹寬度」= 自己寬度 與 底下所有子孫需要的總寬度，取較大者
    // 這一步保證每個分支都會預留剛好足夠、不互相重疊的空間，且每次資料變動都會整個重新計算，不需要手動調整
    const computeWidth = (u) => {
      if (u.children.length === 0) { u.subtreeWidth = u.ownWidth; return u.subtreeWidth; }
      const childWidths = u.children.map(computeWidth);
      const childrenSpan = childWidths.reduce((a, b) => a + b, 0) + SIBLING_GAP * (u.children.length - 1);
      u.subtreeWidth = Math.max(u.ownWidth, childrenSpan);
      return u.subtreeWidth;
    };
    roots.forEach(computeWidth);

    // 第五步 (由上往下)：依照子樹寬度分配實際 X 座標，父母自動置中在子女的正上方
    const assignX = (u, leftEdge) => {
      u.x = leftEdge + u.subtreeWidth / 2;
      if (u.children.length > 0) {
        const childrenSpan = u.children.reduce((sum, c) => sum + c.subtreeWidth, 0) + SIBLING_GAP * (u.children.length - 1);
        let cursor = leftEdge + (u.subtreeWidth - childrenSpan) / 2;
        u.children.forEach(c => { assignX(c, cursor); cursor += c.subtreeWidth + SIBLING_GAP; });
      }
    };
    let rootCursor = 20;
    roots.forEach(r => { assignX(r, rootCursor); rootCursor += r.subtreeWidth + SIBLING_GAP; });

    const personX = {};
    allUnits.forEach(u => {
      if (u.ids.length === 2) {
        personX[u.ids[0]] = u.x - (NODE_W / 2 + COUPLE_GAP / 2);
        personX[u.ids[1]] = u.x + (NODE_W / 2 + COUPLE_GAP / 2);
      } else {
        personX[u.ids[0]] = u.x;
      }
    });

    const connectorGroups = allUnits.filter(u => u.children.length > 0).map(u => ({ parent: u, children: u.children }));
    const totalWidth = Math.max(rootCursor - SIBLING_GAP + 20, 300);

    return {
      level, unitsByLevel, sortedLevelKeys, rowY, personX,
      coupleUnits: allUnits.filter(u => u.ids.length === 2),
      connectorGroups,
      totalWidth, totalHeight: 60 + sortedLevelKeys.length * ROW_H
    };
  }, [focusId, treeEdges, customers]);

  const handleAdd = async () => {
    if (!loggedInUser || !focusId || !addCustomerId) return;
    setSaving(true);
    try {
      let fromId = focusId, toId = addCustomerId;
      if (addType === 'referral_in') { fromId = addCustomerId; toId = focusId; }
      if (addType === 'blood_child') { fromId = focusId; toId = addCustomerId; }
      if (addType === 'blood_parent') { fromId = addCustomerId; toId = focusId; }
      const type = (addType === 'referral_in' || addType === 'referral_out') ? 'referral' : (addType === 'blood_child' || addType === 'blood_parent') ? 'blood' : 'spouse';
      await addDoc(collection(db, 'customer_relationships'), {
        ownerId: loggedInUser.id, fromId, toId, type, label: addLabel, createdAt: new Date().toISOString()
      });
      setAddCustomerId(''); setAddLabel(''); setShowAddForm(false);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleRemove = async (relId) => {
    try { await deleteDoc(doc(db, 'customer_relationships', relId)); } catch (e) { console.error(e); }
  };

  const handleSaveRelationshipLabel = async (relId) => {
    try {
      await updateDoc(doc(db, 'customer_relationships', relId), { label: editLabel });
      setEditingRelId(null);
    } catch (e) { console.error(e); }
  };

  if (!isOpen || !focusCustomer) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-900">關聯網 — {focusCustomer.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          {layout && (
            <div className="overflow-x-auto border border-gray-100 rounded-xl bg-gray-50/50">
              <div className="relative" style={{ width: layout.totalWidth, height: layout.totalHeight, margin: '0 auto' }}>
                <svg width={layout.totalWidth} height={layout.totalHeight} className="absolute top-0 left-0" style={{ zIndex: 0 }}>
                  {layout.coupleUnits.map(u => (
                    <line key={`couple_${u.key}`} x1={layout.personX[u.ids[0]]} y1={layout.rowY[layout.level[u.ids[0]]]} x2={layout.personX[u.ids[1]]} y2={layout.rowY[layout.level[u.ids[1]]]} stroke="#D1D5DB" strokeWidth="2" />
                  ))}
                  {layout.connectorGroups.map((g, i) => {
                    const parentLvl = layout.level[g.parent.ids[0]];
                    const childLvl = layout.level[g.children[0].ids[0]];
                    const parentY = layout.rowY[parentLvl] + 34;
                    const childY = layout.rowY[childLvl] - 34;
                    const busY = (parentY + childY) / 2;
                    const childXs = g.children.map(c => c.x);
                    const minX = Math.min(...childXs), maxX = Math.max(...childXs);
                    return (
                      <g key={i}>
                        <line x1={g.parent.x} y1={parentY} x2={g.parent.x} y2={busY} stroke="#D1D5DB" strokeWidth="2" />
                        <line x1={minX} y1={busY} x2={maxX} y2={busY} stroke="#D1D5DB" strokeWidth="2" />
                        {g.children.map(c => <line key={c.key} x1={c.x} y1={busY} x2={c.x} y2={childY} stroke="#D1D5DB" strokeWidth="2" />)}
                      </g>
                    );
                  })}
                </svg>
                <div className="relative" style={{ zIndex: 1 }}>
                  {Object.keys(layout.level).map(id => {
                    const person = customers.find(c => c.id === id);
                    if (!person) return null;
                    const x = layout.personX[id];
                    const y = layout.rowY[layout.level[id]];
                    const isFocus = id === focusId;
                    return (
                      <button key={id} onClick={() => setFocusId(id)} className="absolute flex flex-col items-center" style={{ left: x - 34, top: y - 34, width: 68 }}>
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold transition ${isFocus ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>{person.name[0]}</div>
                        <p className="text-xs font-bold text-gray-800 mt-1 truncate w-full text-center">{person.name}</p>
                        {directLabels[id] && <span className="text-[9px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full mt-0.5">{directLabels[id]}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {(!layout || Object.keys(layout.level).length <= 1) && (
            <p className="text-center text-gray-400 text-sm">還沒有配偶或血親關聯，點下方「新增關聯」開始建立</p>
          )}

          {directConnections.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">配偶／血親關聯（可編輯稱謂或刪除）</p>
              <div className="space-y-2">
                {directConnections.map(c => (
                  <div key={c.id} className="flex items-center justify-between gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 text-xs">
                    <button onClick={() => setFocusId(c.other.id)} className="font-bold text-gray-800 hover:text-indigo-600 shrink-0">{c.other.name}</button>
                    <span className="text-gray-400 shrink-0">{c.relDesc}</span>
                    {editingRelId === c.id ? (
                      <>
                        <input type="text" autoFocus className="flex-1 min-w-0 p-1 border border-gray-200 rounded" placeholder="稱謂（選填）" value={editLabel} onChange={e => setEditLabel(e.target.value)} />
                        <button onClick={() => handleSaveRelationshipLabel(c.id)} className="text-indigo-600 font-bold shrink-0">儲存</button>
                        <button onClick={() => setEditingRelId(null)} className="text-gray-300 shrink-0">取消</button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 min-w-0 truncate text-purple-600">{c.label}</span>
                        <button onClick={() => { setEditingRelId(c.id); setEditLabel(c.label); }} className="text-gray-300 hover:text-indigo-500 shrink-0"><Edit3 size={12} /></button>
                        <button onClick={() => handleRemove(c.id)} className="text-gray-300 hover:text-red-500 shrink-0"><X size={12} /></button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {referralConnections.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">轉介紀錄</p>
              <div className="flex flex-wrap gap-2">
                {referralConnections.map(c => (
                  <div key={c.id} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-xs">
                    <button onClick={() => setFocusId(c.other.id)} className="font-bold text-gray-800 hover:text-indigo-600">{c.other.name}</button>
                    <span className="text-purple-600">{c.label}</span>
                    <button onClick={() => handleRemove(c.id)} className="text-gray-300 hover:text-red-500"><X size={12} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!showAddForm ? (
            <button onClick={() => setShowAddForm(true)} className="w-full flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2.5 rounded-lg font-bold text-sm transition"><Plus size={16} /> 新增關聯</button>
          ) : (
            <div className="space-y-3 border-t border-gray-100 pt-4">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">關聯對象</label>
                <CustomerPicker customers={customers.filter(c => c.id !== focusId)} value={addCustomerId} onChange={setAddCustomerId} onCreateNew={async () => { window.alert('請先到「客戶管理」新增這位客戶，再回來建立關聯'); return null; }} />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">關係類型</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg" value={addType} onChange={e => setAddType(e.target.value)}>
                  <option value="spouse">配偶</option>
                  <option value="blood_parent">他是我的父母</option>
                  <option value="blood_child">他是我的子女</option>
                  <option value="referral_out">我介紹了他</option>
                  <option value="referral_in">他介紹了我</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">稱謂備註（選填，例如：女兒、女婿）</label>
                <input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={addLabel} onChange={e => setAddLabel(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowAddForm(false)} className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition">取消</button>
                <button onClick={handleAdd} disabled={!addCustomerId || saving} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="animate-spin" size={16} /> : '新增'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CustomerCRM = ({ loggedInUser, records, customers, customersLoaded, relationships }) => {
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({ ageMin: '', ageMax: '', gender: '', region: '', incomeRange: '', tag: '', vipOnly: false, igOnly: false, salesWatchOnly: false, recruitWatchOnly: false });
  const [editCustomer, setEditCustomer] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isIGOpen, setIsIGOpen] = useState(false);
  const [isNotionOpen, setIsNotionOpen] = useState(false);
  const emptyForm = { name: '', phone: '', lineId: '', igHandle: '', birthday: '', gender: '', region: '', incomeRange: '', tags: ['準客戶'], notes: '', nextFollowUpDate: '', address: '', emergencyContactId: '', emergencyContactName: '' };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const loaded = customersLoaded;

  // 拜訪軌跡編輯/刪除狀態
  const [editingVisit, setEditingVisit] = useState(null); // { customerId, index, date, type, note }
  const [visitSaving, setVisitSaving] = useState(false);

  // 客戶合併狀態
  const [mergeSourceId, setMergeSourceId] = useState(null); // 發起合併的那張卡片
  const [networkFocusId, setNetworkFocusId] = useState(null);

  const referralLeaderboard = useMemo(() => {
    const counts = {};
    (relationships || []).filter(r => r.type === 'referral').forEach(r => {
      counts[r.fromId] = (counts[r.fromId] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([id, count]) => ({ customer: customers.find(c => c.id === id), count }))
      .filter(x => x.customer)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [relationships, customers]);
  const [mergeTargetId, setMergeTargetId] = useState('');
  const [mergeChoices, setMergeChoices] = useState({});
  const [merging, setMerging] = useState(false);

  const existingNames = useMemo(() => new Set(customers.map(c => (c.name || '').trim().toLowerCase())), [customers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = !search || c.name.includes(search) || (c.phone || '').includes(search) || (c.igHandle || '').toLowerCase().includes(search.toLowerCase());
      const age = calcAge(c.birthday);
      const matchAgeMin = !filters.ageMin || (age !== null && age >= Number(filters.ageMin));
      const matchAgeMax = !filters.ageMax || (age !== null && age <= Number(filters.ageMax));
      const matchGender = !filters.gender || c.gender === filters.gender;
      const matchRegion = !filters.region || c.region === filters.region;
      const matchIncome = !filters.incomeRange || c.incomeRange === filters.incomeRange;
      const matchTag = !filters.tag || (c.tags || []).includes(filters.tag);
      const matchVip = !filters.vipOnly || isVIPCustomer(c, records);
      const matchIg = !filters.igOnly || isIGListCustomer(c);
      const matchSalesWatch = !filters.salesWatchOnly || c.specialFocus;
      const matchRecruitWatch = !filters.recruitWatchOnly || c.specialFocusRecruit;
      return matchSearch && matchAgeMin && matchAgeMax && matchGender && matchRegion && matchIncome && matchTag && matchVip && matchIg && matchSalesWatch && matchRecruitWatch;
    });
  }, [customers, search, filters, records]);

  const relatedPolicies = (customerName) => {
    if (!loggedInUser) return [];
    return records.filter(r => r.agentId === loggedInUser.id && (r.insuredName || '').trim() === customerName.trim());
  };

  const openAdd = () => { setForm(emptyForm); setIsAdding(true); };
  const openEdit = (c) => {
    setEditCustomer(c);
    setForm({ name: c.name, phone: c.phone || '', lineId: c.lineId || '', igHandle: c.igHandle || '', birthday: c.birthday || '', gender: c.gender || '', region: c.region || '', incomeRange: c.incomeRange || '', tags: (c.tags && c.tags.length) ? c.tags : ['準客戶'], notes: c.notes || '', nextFollowUpDate: c.nextFollowUpDate || '', address: c.address || '', emergencyContactId: c.emergencyContactId || '', emergencyContactName: c.emergencyContactName || '' });
  };

  const handleSave = async () => {
    if (!form.name || !loggedInUser) return;
    setSaving(true);
    try {
      if (editCustomer) {
        await updateDoc(doc(db, 'customers', editCustomer.id), { ...form });
        setEditCustomer(null);
      } else {
        await addDoc(collection(db, 'customers'), {
          ...form,
          source: '手動',
          ownerId: loggedInUser.id,
          visitLog: [],
          createdAt: new Date().toISOString()
        });
        // 手動新增客戶 (非匯入) 時，依標籤自動計入當天的 MEA「新增準客戶」/「新增準增員」分數
        const today = getTodayDate();
        const incrementPayload = {};
        if (form.tags.includes('準客戶')) incrementPayload.prospect = increment(1);
        if (form.tags.includes('準增員')) incrementPayload.newRecruitProspect = increment(1);
        if (Object.keys(incrementPayload).length > 0) {
          const docId = `${loggedInUser.id}_${today}`;
          await setDoc(doc(db, 'activity_record', docId), {
            agentId: loggedInUser.id, date: today, month: today.substring(0, 7),
            ...incrementPayload, updatedAt: new Date().toISOString()
          }, { merge: true });
        }
        setIsAdding(false);
      }
      setForm(emptyForm);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const toggleSalesWatch = async (customer) => {
    try { await updateDoc(doc(db, 'customers', customer.id), { specialFocus: !customer.specialFocus }); } catch (e) { console.error(e); }
  };
  const toggleRecruitWatch = async (customer) => {
    try { await updateDoc(doc(db, 'customers', customer.id), { specialFocusRecruit: !customer.specialFocusRecruit }); } catch (e) { console.error(e); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try { await deleteDoc(doc(db, 'customers', deleteTarget)); setDeleteTarget(null); } catch (e) { console.error(e); }
  };

  const isFollowUpDue = (c) => c.nextFollowUpDate && c.nextFollowUpDate <= getTodayDate();

  // --- 拜訪軌跡編輯/刪除 ---
  const openEditVisit = (customer, index, visit) => {
    setEditingVisit({ customerId: customer.id, index, date: visit.date, type: visit.type, note: visit.note || '' });
  };

  const handleSaveVisitEdit = async () => {
    if (!editingVisit) return;
    setVisitSaving(true);
    try {
      const customer = customers.find(c => c.id === editingVisit.customerId);
      if (!customer) return;
      const newLog = [...(customer.visitLog || [])];
      newLog[editingVisit.index] = { date: editingVisit.date, type: editingVisit.type, note: editingVisit.note };
      await updateDoc(doc(db, 'customers', customer.id), { visitLog: newLog });
      setEditingVisit(null);
    } catch (e) { console.error(e); } finally { setVisitSaving(false); }
  };

  const handleDeleteVisit = async (customer, index) => {
    try {
      const newLog = (customer.visitLog || []).filter((_, i) => i !== index);
      await updateDoc(doc(db, 'customers', customer.id), { visitLog: newLog });
    } catch (e) { console.error(e); }
  };

  // --- 客戶合併 ---
  const mergeSource = customers.find(c => c.id === mergeSourceId);
  const mergeTarget = customers.find(c => c.id === mergeTargetId);

  const openMerge = (customerId) => {
    setMergeSourceId(customerId);
    const source = customers.find(c => c.id === customerId);
    const dup = source ? customers.find(c => c.id !== customerId && c.name.trim() === source.name.trim()) : null;
    setMergeTargetId(dup ? dup.id : '');
    setMergeChoices({});
  };

  useEffect(() => {
    if (mergeSource && mergeTarget) {
      const fields = ['name', 'phone', 'lineId', 'igHandle', 'birthday', 'gender', 'region', 'incomeRange', 'address', 'notes', 'nextFollowUpDate'];
      const defaults = {};
      fields.forEach(f => { defaults[f] = mergeTarget[f] || mergeSource[f] || ''; });
      setMergeChoices(defaults);
    }
    // eslint-disable-next-line
  }, [mergeTargetId]);

  const handleConfirmMerge = async () => {
    if (!mergeSource || !mergeTarget) return;
    setMerging(true);
    try {
      const combinedLog = [...(mergeTarget.visitLog || []), ...(mergeSource.visitLog || [])]
        .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      const combinedTags = [...new Set([...(mergeTarget.tags || []), ...(mergeSource.tags || [])])];

      await updateDoc(doc(db, 'customers', mergeTarget.id), {
        ...mergeChoices,
        tags: combinedTags,
        visitLog: combinedLog
      });

      // 把原本掛在被合併卡片上的行程，全部改連到保留下來的卡片
      const q = query(collection(db, 'schedule_events'), where('customerId', '==', mergeSource.id));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => {
        batch.update(d.ref, { customerId: mergeTarget.id, customerName: mergeChoices.name || mergeTarget.name });
      });
      await batch.commit();

      await deleteDoc(doc(db, 'customers', mergeSource.id));
      setMergeSourceId(null);
      setMergeTargetId('');
    } catch (e) { console.error(e); } finally { setMerging(false); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} title="刪除客戶" message="確定要刪除此客戶資料嗎？此動作無法復原。" />
      <IGImportModal isOpen={isIGOpen} onClose={() => setIsIGOpen(false)} loggedInUser={loggedInUser} existingNames={existingNames} onImported={() => {}} />
      <RelationshipNetworkModal isOpen={!!networkFocusId} onClose={() => setNetworkFocusId(null)} focusId={networkFocusId} setFocusId={setNetworkFocusId} customers={customers} relationships={relationships || []} loggedInUser={loggedInUser} />
      <NotionImportModal isOpen={isNotionOpen} onClose={() => setIsNotionOpen(false)} loggedInUser={loggedInUser} onImported={() => {}} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">客戶管理</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">僅顯示你自己的客戶資料，共 {customers.length} 筆</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setIsNotionOpen(true)} className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-lg font-bold text-xs sm:text-sm transition"><Upload size={14} /> Notion 匯入</button>
          <button onClick={() => setIsIGOpen(true)} className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-lg font-bold text-xs sm:text-sm transition"><Upload size={14} /> IG 匯入</button>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition"><Plus size={14} /> 新增客戶</button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="搜尋姓名、電話或IG帳號..."
              className="w-full p-3 pl-4 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button onClick={() => setShowFilter(!showFilter)} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition whitespace-nowrap ${showFilter ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
            <SlidersHorizontal size={16} /> 進階篩選
          </button>
        </div>
        {showFilter && (
          <div className="space-y-4 mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">最小年齡</label>
                <input type="number" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" value={filters.ageMin} onChange={e => setFilters({ ...filters, ageMin: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">最大年齡</label>
                <input type="number" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" value={filters.ageMax} onChange={e => setFilters({ ...filters, ageMax: e.target.value })} />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">性別</label>
                <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" value={filters.gender} onChange={e => setFilters({ ...filters, gender: e.target.value })}>
                  <option value="">全部</option>
                  {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">地區</label>
                <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" value={filters.region} onChange={e => setFilters({ ...filters, region: e.target.value })}>
                  <option value="">全部</option>
                  {TAIWAN_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">年收入</label>
                <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" value={filters.incomeRange} onChange={e => setFilters({ ...filters, incomeRange: e.target.value })}>
                  <option value="">全部</option>
                  {INCOME_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">標籤</label>
                <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none" value={filters.tag} onChange={e => setFilters({ ...filters, tag: e.target.value })}>
                  <option value="">全部</option>
                  {CUSTOMER_TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                <input type="checkbox" checked={filters.vipOnly} onChange={e => setFilters({ ...filters, vipOnly: e.target.checked })} className="w-4 h-4" /> 只顯示 VIP
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                <input type="checkbox" checked={filters.igOnly} onChange={e => setFilters({ ...filters, igOnly: e.target.checked })} className="w-4 h-4" /> 只顯示有 IG 的
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                <input type="checkbox" checked={filters.salesWatchOnly} onChange={e => setFilters({ ...filters, salesWatchOnly: e.target.checked })} className="w-4 h-4" /> 只顯示關注銷售
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                <input type="checkbox" checked={filters.recruitWatchOnly} onChange={e => setFilters({ ...filters, recruitWatchOnly: e.target.checked })} className="w-4 h-4" /> 只顯示關注增員
              </label>
            </div>
          </div>
        )}
      </Card>

      {referralLeaderboard.length > 0 && (
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm"><GitBranch size={16} className="text-purple-500" /> 轉介排行榜</h3>
          <div className="flex flex-wrap gap-3">
            {referralLeaderboard.map((item, i) => (
              <div key={item.customer.id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                <span className="text-sm font-bold text-gray-800">{item.customer.name}</span>
                <span className="text-xs text-purple-600 font-bold">介紹了 {item.count} 人</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredCustomers.map(c => {
          const policies = relatedPolicies(c.name);
          const age = calcAge(c.birthday);
          const vip = isVIPCustomer(c, records);
          const igList = isIGListCustomer(c);
          return (
            <Card key={c.id} className={`p-5 relative group ${isFollowUpDue(c) ? 'border-amber-300 ring-1 ring-amber-100' : ''}`}>
              <div className="absolute top-4 right-4 z-10 flex gap-1">
                <button onClick={() => toggleSalesWatch(c)} title="關注銷售">
                  <Star size={18} className={c.specialFocus ? 'fill-amber-400 text-amber-400' : 'text-gray-200 hover:text-amber-300'} />
                </button>
                <button onClick={() => toggleRecruitWatch(c)} title="關注增員">
                  <Star size={18} className={c.specialFocusRecruit ? 'fill-teal-500 text-teal-500' : 'text-gray-200 hover:text-teal-300'} />
                </button>
              </div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">{c.name[0]}</div>
                  <div>
                    <h4 className="font-bold text-gray-900">{c.name}</h4>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {(c.tags || []).map(t => <span key={t} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>)}
                      {age !== null && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{age}歲</span>}
                      {vip && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">VIP</span>}
                      {igList && <span className="text-[10px] bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-bold">IG名單</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition mr-12">
                  <button onClick={() => setNetworkFocusId(c.id)} title="關聯網" className="p-1.5 text-gray-400 hover:text-purple-500"><GitBranch size={15} /></button>
                  <button onClick={() => openMerge(c.id)} title="合併客戶" className="p-1.5 text-gray-400 hover:text-teal-500"><Users size={15} /></button>
                  <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-indigo-500"><Edit3 size={15} /></button>
                  <button onClick={() => setDeleteTarget(c.id)} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                </div>
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                {c.phone && <p className="flex items-center gap-1.5"><Phone size={12} /> {c.phone}</p>}
                {c.lineId && (
                  <button onClick={() => openLineChat(c.lineId)} className="flex items-center gap-1.5 text-emerald-600 hover:underline">
                    <MessageSquare size={12} /> LINE: {c.lineId}
                  </button>
                )}
                {c.igHandle && (
                  <a href={getInstagramUrl(c.igHandle)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-pink-600 hover:underline">
                    <Upload size={12} /> IG: {c.igHandle}
                  </a>
                )}
                {c.birthday && <p className="flex items-center gap-1.5"><Cake size={12} /> {c.birthday}</p>}
                {c.region && <p>{c.region}{c.incomeRange ? ` · ${c.incomeRange}` : ''}</p>}
                {c.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">{c.address}</span>
                    <a href={getGoogleMapsUrl(c.address)} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold hover:bg-blue-100">Google</a>
                    <a href={getAppleMapsUrl(c.address)} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[9px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold hover:bg-gray-200">Apple</a>
                  </div>
                )}
                {c.emergencyContactName && (
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck size={12} className="shrink-0 text-teal-500" />
                    <span className="text-gray-500">安心聯絡人：</span>
                    {c.emergencyContactId && customers.some(x => x.id === c.emergencyContactId) ? (
                      <button onClick={() => openEdit(customers.find(x => x.id === c.emergencyContactId))} className="text-teal-600 font-bold hover:underline">{c.emergencyContactName}</button>
                    ) : (
                      <span>{c.emergencyContactName}</span>
                    )}
                  </div>
                )}
              </div>
              {c.notes && <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 mt-3 flex gap-1.5"><MessageSquare size={12} className="shrink-0 mt-0.5" /> {c.notes}</p>}
              {isFollowUpDue(c) && <p className="text-[10px] font-bold text-amber-600 mt-2">⚠ 追蹤日期已到：{c.nextFollowUpDate}</p>}
              {policies.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">名下保單 ({policies.length})</p>
                  <div className="space-y-1">
                    {policies.map(p => (
                      <div key={p.id} className="text-[10px] text-gray-600 flex justify-between">
                        <span>{p.product} · {p.date}</span>
                        <span className="font-mono font-bold text-indigo-600">{formatMoney(p.premium)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {c.visitLog && c.visitLog.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">拜訪軌跡</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {[...c.visitLog].map((v, i) => i).reverse().slice(0, 6).map((originalIndex) => {
                      const v = c.visitLog[originalIndex];
                      return (
                        <div key={originalIndex} className="text-[10px] text-gray-500 flex items-center justify-between group/visit gap-1">
                          <span className="truncate">{v.date} · {v.type}{v.note ? ` · ${v.note}` : ''}</span>
                          <div className="flex gap-1 opacity-0 group-hover/visit:opacity-100 transition shrink-0">
                            <button onClick={() => openEditVisit(c, originalIndex, v)} className="text-gray-300 hover:text-indigo-500"><Edit3 size={11} /></button>
                            <button onClick={() => handleDeleteVisit(c, originalIndex)} className="text-gray-300 hover:text-red-500"><Trash2 size={11} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
        {loaded && filteredCustomers.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            {customers.length === 0 ? '還沒有任何客戶資料，點右上角「新增客戶」開始建立' : '沒有符合篩選條件的客戶'}
          </div>
        )}
      </div>

      {(isAdding || editCustomer) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{editCustomer ? '編輯客戶' : '新增客戶'}</h3>
              <button onClick={() => { setIsAdding(false); setEditCustomer(null); }} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-gray-500 block mb-1">姓名 *</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-gray-500 block mb-1">電話</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                <div><label className="text-xs font-bold text-gray-500 block mb-1">生日</label><DateSelect yearsBack={100} yearsForward={0} value={form.birthday} onChange={(val) => setForm({ ...form, birthday: val })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-gray-500 block mb-1">LINE ID</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={form.lineId} onChange={e => setForm({ ...form, lineId: e.target.value })} /></div>
                <div><label className="text-xs font-bold text-gray-500 block mb-1">IG 帳號</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={form.igHandle} onChange={e => setForm({ ...form, igHandle: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">性別</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="">未填寫</option>
                    {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">地區</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg" value={form.region} onChange={e => setForm({ ...form, region: e.target.value })}>
                    <option value="">未填寫</option>
                    {TAIWAN_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">年收入</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg" value={form.incomeRange} onChange={e => setForm({ ...form, incomeRange: e.target.value })}>
                    <option value="">未填寫</option>
                    {INCOME_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-gray-500 block mb-1">地址（選填，可開啟地圖）</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">保單安心聯絡人（選填）</label>
                <input type="text" className="w-full p-2 border border-gray-200 rounded-lg mb-1.5" placeholder="姓名" value={form.emergencyContactName} onChange={e => setForm({ ...form, emergencyContactName: e.target.value })} />
                <CustomerPicker
                  customers={customers.filter(c => c.id !== editCustomer?.id)}
                  value={form.emergencyContactId}
                  onChange={(id) => {
                    const picked = customers.find(c => c.id === id);
                    setForm({ ...form, emergencyContactId: id, emergencyContactName: picked ? picked.name : form.emergencyContactName });
                  }}
                  onCreateNew={async () => { window.alert('若這個人不在客戶名單裡，直接在上方姓名欄填寫文字即可，不需要建立新客戶卡'); return null; }}
                />
                <p className="text-[10px] text-gray-400 mt-1">若對方是系統裡的客戶，用下面的搜尋框連結，之後可以直接點過去看他的資料</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-2">標籤（可複選）</label>
                <div className="flex flex-wrap gap-3">
                  {CUSTOMER_TAGS.map(t => (
                    <label key={t} className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.tags.includes(t)}
                        onChange={e => setForm({ ...form, tags: e.target.checked ? [...form.tags, t] : form.tags.filter(x => x !== t) })}
                        className="w-4 h-4"
                      /> {t}
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-gray-400">VIP 與 IG名單為系統自動判斷（年收入200萬以上或實收保費逾12萬即為VIP；填寫IG帳號即自動列為IG名單），不需手動設定。</p>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">下次追蹤日期</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={form.nextFollowUpDate} onChange={e => setForm({ ...form, nextFollowUpDate: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">備註</label><textarea className="w-full p-2 border border-gray-200 rounded-lg h-20 resize-none" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
              <button onClick={handleSave} disabled={!form.name || saving} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={16} /> : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingVisit && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">編輯拜訪紀錄</h3>
              <button onClick={() => setEditingVisit(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <p className="text-[10px] text-gray-400 mb-3">修改這裡不會回頭調整已經計算過的 MEA 分數，純粹修正紀錄內容。</p>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-gray-500 block mb-1">日期</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={editingVisit.date} onChange={e => setEditingVisit({ ...editingVisit, date: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">類型</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={editingVisit.type} onChange={e => setEditingVisit({ ...editingVisit, type: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">備註</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={editingVisit.note} onChange={e => setEditingVisit({ ...editingVisit, note: e.target.value })} /></div>
              <button onClick={handleSaveVisitEdit} disabled={visitSaving} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                {visitSaving ? <Loader2 className="animate-spin" size={16} /> : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {mergeSourceId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">合併客戶</h3>
              <button onClick={() => setMergeSourceId(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <p className="text-xs text-gray-500 mb-4">目前這張是「<span className="font-bold">{mergeSource?.name}</span>」，選擇要合併進哪一張保留下來的客戶卡片，合併後這張會被刪除，拜訪軌跡與行程會自動轉移。</p>
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 block mb-1">合併進（保留下來的卡片）</label>
              <CustomerPicker
                customers={customers.filter(c => c.id !== mergeSourceId)}
                value={mergeTargetId}
                onChange={setMergeTargetId}
                onCreateNew={async () => { window.alert('合併只能選擇已存在的客戶，不能在這裡新增'); return null; }}
              />
              {mergeTarget && mergeSource && mergeTarget.name.trim() === mergeSource.name.trim() && (
                <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">✓ 姓名相同，這兩筆很可能就是重複建檔</p>
              )}
            </div>
            {mergeTarget && mergeSource && (
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <p className="text-[10px] text-gray-400">標籤會自動合併兩邊的所有標籤，不需要選擇。</p>
                {['name', 'phone', 'lineId', 'igHandle', 'birthday', 'gender', 'region', 'incomeRange', 'address', 'nextFollowUpDate', 'notes'].map(field => {
                  const labelMap = { name: '姓名', phone: '電話', lineId: 'LINE ID', igHandle: 'IG帳號', birthday: '生日', gender: '性別', region: '地區', incomeRange: '年收入', address: '地址', nextFollowUpDate: '下次追蹤日期', notes: '備註' };
                  if (!mergeSource[field] && !mergeTarget[field]) return null;
                  return (
                    <div key={field} className="text-xs">
                      <p className="font-bold text-gray-500 mb-1">{labelMap[field]}</p>
                      <div className="flex gap-2">
                        <label className={`flex-1 p-2 rounded-lg border cursor-pointer ${mergeChoices[field] === mergeTarget[field] ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'}`}>
                          <input type="radio" className="mr-1.5" checked={mergeChoices[field] === mergeTarget[field]} onChange={() => setMergeChoices({ ...mergeChoices, [field]: mergeTarget[field] })} />
                          {mergeTarget[field] || '(空白)'}
                        </label>
                        <label className={`flex-1 p-2 rounded-lg border cursor-pointer ${mergeChoices[field] === mergeSource[field] ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200'}`}>
                          <input type="radio" className="mr-1.5" checked={mergeChoices[field] === mergeSource[field]} onChange={() => setMergeChoices({ ...mergeChoices, [field]: mergeSource[field] })} />
                          {mergeSource[field] || '(空白)'}
                        </label>
                      </div>
                    </div>
                  );
                })}
                <button onClick={handleConfirmMerge} disabled={merging} className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                  {merging ? <Loader2 className="animate-spin" size={16} /> : '確認合併'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


// --- 日期選擇器 (年/月/日下拉選單，避免原生 date input 在部分版面點不動的問題) ---
const DateSelect = ({ value, onChange, yearsBack = 3, yearsForward = 3, descending = false }) => {
  const initial = (value || '').split('-');
  const [y, setY] = useState(initial[0] || '');
  const [m, setM] = useState(initial[1] || '');
  const [d, setD] = useState(initial[2] || '');
  const currentYear = new Date().getFullYear();
  let years = Array.from({ length: yearsBack + yearsForward + 1 }, (_, i) => currentYear - yearsBack + i);
  if (descending) years = [...years].reverse();
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));

  const commit = (ny, nm, nd) => {
    if (ny && nm && nd) onChange(`${ny}-${nm}-${nd}`);
  };

  return (
    <div className="flex gap-1">
      <select className="p-1.5 border border-gray-200 rounded text-xs outline-none" value={y} onChange={e => { setY(e.target.value); commit(e.target.value, m, d); }}>
        <option value="">年</option>
        {years.map(yy => <option key={yy} value={yy}>{yy}</option>)}
      </select>
      <select className="p-1.5 border border-gray-200 rounded text-xs outline-none" value={m} onChange={e => { setM(e.target.value); commit(y, e.target.value, d); }}>
        <option value="">月</option>
        {months.map(mm => <option key={mm} value={mm}>{mm}</option>)}
      </select>
      <select className="p-1.5 border border-gray-200 rounded text-xs outline-none" value={d} onChange={e => { setD(e.target.value); commit(y, m, e.target.value); }}>
        <option value="">日</option>
        {days.map(dd => <option key={dd} value={dd}>{dd}</option>)}
      </select>
    </div>
  );
};

// --- 時間選擇器 (用時/分下拉選單取代原生 time input，避免部分 Safari 版本在巢狀彈窗中點不動的問題) ---
const TimeSelect = ({ value, onChange }) => {
  const [h, m] = (value || '').split(':');
  const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutes = ['00', '15', '30', '45'];
  return (
    <div className="flex gap-1.5 items-center">
      <select className="p-2 border border-gray-200 rounded-lg flex-1 outline-none" value={h || ''} onChange={e => onChange(`${e.target.value}:${m || '00'}`)}>
        <option value="">--</option>
        {hours.map(hh => <option key={hh} value={hh}>{hh}</option>)}
      </select>
      <span className="text-gray-400 font-bold">:</span>
      <select className="p-2 border border-gray-200 rounded-lg flex-1 outline-none" value={m || ''} onChange={e => onChange(`${h || '00'}:${e.target.value}`)}>
        <option value="">--</option>
        {minutes.map(mm => <option key={mm} value={mm}>{mm}</option>)}
      </select>
    </div>
  );
};


// --- 客戶搜尋選擇器 (文字搜尋 + 就地新增，含重複姓名防呆) ---
const CustomerPicker = ({ customers, value, onChange, onCreateNew }) => {
  const [query, setQuery] = useState(() => customers.find(c => c.id === value)?.name || '');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const match = customers.find(c => c.id === value);
    setQuery(match ? match.name : '');
  }, [value]);

  const filtered = useMemo(() => {
    if (!query) return customers.slice(0, 20);
    return customers.filter(c => c.name.includes(query)).slice(0, 20);
  }, [customers, query]);

  const handleCreate = async () => {
    if (!query.trim()) return;
    setCreating(true);
    try {
      const newId = await onCreateNew(query.trim());
      if (newId) onChange(newId);
    } finally {
      setCreating(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        className="w-full p-2 border border-gray-200 rounded-lg"
        placeholder="搜尋客戶姓名，或輸入新姓名建立"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); if (value) onChange(''); }}
        onFocus={() => setOpen(true)}
      />
      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          <button type="button" onClick={() => { onChange(''); setQuery(''); setOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50">不指定</button>
          {filtered.map(c => (
            <button type="button" key={c.id} onClick={() => { onChange(c.id); setQuery(c.name); setOpen(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">{c.name}</button>
          ))}
          {query.trim() && (
            <button type="button" disabled={creating} onClick={handleCreate} className="w-full text-left px-3 py-2 text-sm text-indigo-600 font-bold hover:bg-indigo-50 border-t border-gray-100 flex items-center gap-1.5 disabled:opacity-50">
              {creating ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} 新增客戶：{query.trim()}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// --- 今日待辦 + 行程 (合併頁面) ---
const WEEKDAY_OPTIONS = [
  { value: 0, label: '星期日' }, { value: 1, label: '星期一' }, { value: 2, label: '星期二' },
  { value: 3, label: '星期三' }, { value: 4, label: '星期四' }, { value: 5, label: '星期五' }, { value: 6, label: '星期六' }
];
const WEEK_OF_MONTH_OPTIONS = [{ value: 1, label: '第1個' }, { value: 2, label: '第2個' }, { value: 3, label: '第3個' }, { value: 4, label: '第4個' }];

// --- 批次新增行程 (貼上文字快速建立多筆，適合課表這類固定課程) ---
const BatchScheduleModal = ({ isOpen, onClose, loggedInUser, team }) => {
  const [step, setStep] = useState(1);
  const [rawText, setRawText] = useState('');
  const [rows, setRows] = useState([]);
  const [participantIds, setParticipantIds] = useState(() => loggedInUser ? [loggedInUser.id] : []);
  const [category, setCategory] = useState('meeting');
  const [priority, setPriority] = useState('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1); setRawText(''); setRows([]);
      setParticipantIds(loggedInUser ? [loggedInUser.id] : []);
      setCategory('meeting'); setPriority('normal'); setIsSubmitting(false);
    }
  }, [isOpen, loggedInUser]);

  const handleParse = () => {
    const parsed = parseBatchScheduleText(rawText, new Date().getFullYear());
    setRows(parsed.filter(r => r.title));
    setStep(2);
  };

  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const removeRow = (id) => setRows(prev => prev.filter(r => r.id !== id));

  const toggleParticipant = (id) => {
    setParticipantIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    const validRows = rows.filter(r => r.date && r.title);
    if (validRows.length === 0 || participantIds.length === 0) return;
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      validRows.forEach(row => {
        participantIds.forEach(pid => {
          const ref = doc(collection(db, 'schedule_events'));
          batch.set(ref, {
            ownerId: pid,
            customerId: '', customerName: '',
            isReminder: true, type: 'reminder',
            title: row.title, category, priority,
            date: row.date, time: row.time, note: '',
            status: 'scheduled', completedAt: null,
            createdAt: new Date().toISOString()
          });
        });
      });
      await batch.commit();
      onClose();
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-up border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-900">批次新增行程</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {step === 1 ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-700 leading-relaxed border border-blue-100">
                每行一筆，格式：<code>日期 時間(選填) 標題</code>，例如：<br />
                <code>7/15 14:00 新人訓練第一堂：商品概論</code><br />
                <code>2026-07-22 14:00 新人訓練第二堂：話術演練</code><br />
                如果課表是照片，把照片傳給 Claude，請它幫你轉成這個格式再貼上來。
              </div>
              <textarea
                className="w-full h-48 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 font-mono text-sm resize-none"
                placeholder="貼上課表文字..."
                value={rawText}
                onChange={e => setRawText(e.target.value)}
              />
            </>
          ) : (
            <>
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                    <tr><th className="px-3 py-2">日期</th><th className="px-3 py-2">時間</th><th className="px-3 py-2">標題</th><th className="px-3 py-2 w-10"></th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map(row => (
                      <tr key={row.id}>
                        <td className="p-2"><input type="text" placeholder="YYYY-MM-DD" className="bg-transparent border border-gray-200 rounded px-1 w-28 outline-none" value={row.date} onChange={e => updateRow(row.id, 'date', e.target.value)} /></td>
                        <td className="p-2"><input type="text" placeholder="HH:MM" className="bg-transparent border border-gray-200 rounded px-1 w-16 outline-none" value={row.time} onChange={e => updateRow(row.id, 'time', e.target.value)} /></td>
                        <td className="p-2"><input type="text" className="bg-transparent border border-gray-200 rounded px-1 w-full outline-none" value={row.title} onChange={e => updateRow(row.id, 'title', e.target.value)} /></td>
                        <td className="p-2 text-center"><button onClick={() => removeRow(row.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                    {rows.length === 0 && <tr><td colSpan="4" className="text-center py-6 text-gray-400">無法解析出任何資料，請確認格式</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">分類</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg" value={category} onChange={e => setCategory(e.target.value)}>
                    {Object.entries(REMINDER_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">優先度</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg" value={priority} onChange={e => setPriority(e.target.value)}>
                    {Object.entries(PRIORITY_LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">套用給哪些人（每個人各自獨立在自己的今日待辦中看到）</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto border border-gray-100 rounded-lg p-2">
                  {(team || []).map(m => (
                    <label key={m.id} className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={participantIds.includes(m.id)} onChange={() => toggleParticipant(m.id)} className="w-3.5 h-3.5" />
                      {m.name}
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-right text-xs text-gray-400">共 {rows.filter(r => r.date && r.title).length} 筆有效資料 × {participantIds.length} 人 = {rows.filter(r => r.date && r.title).length * participantIds.length} 筆行程</p>
            </>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          {step === 1 ? (
            <button onClick={handleParse} disabled={!rawText} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50">下一步：確認內容</button>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-200 rounded-lg transition">返回</button>
              <button onClick={handleSubmit} disabled={isSubmitting || rows.filter(r => r.date && r.title).length === 0 || participantIds.length === 0} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
                {isSubmitting && <Loader2 className="animate-spin" size={16} />} 確認新增
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 個人業績目標 (業績/增員/收入 三合一，放在今日待辦最上方) ---
const PERSONAL_GOALS_DEFAULT = { salesTarget: 0, salesBasis: 'weighted', recruitTarget: 0, incomeTarget: 0 };

const PersonalGoalsCard = ({ loggedInUser, records, activities }) => {
  const [goals, setGoals] = useState(PERSONAL_GOALS_DEFAULT);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(PERSONAL_GOALS_DEFAULT);
  const [saving, setSaving] = useState(false);
  const currentMonth = getCurrentMonth();

  useEffect(() => {
    if (!loggedInUser) return;
    const ref = doc(db, 'personal_goals', `${loggedInUser.id}_${currentMonth}`);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.exists() ? { ...PERSONAL_GOALS_DEFAULT, ...snap.data() } : PERSONAL_GOALS_DEFAULT;
      setGoals(data);
      setForm(data);
    });
    return () => unsub();
  }, [loggedInUser, currentMonth]);

  const monthRecords = useMemo(() => (records || []).filter(r => loggedInUser && r.agentId === loggedInUser.id && r.date.startsWith(currentMonth)), [records, loggedInUser, currentMonth]);
  const issuedRecords = useMemo(() => monthRecords.filter(r => (r.status || '已發單') === '已發單'), [monthRecords]);

  const salesActual = useMemo(() => monthRecords.reduce((sum, r) => sum + (goals.salesBasis === 'premium' ? (r.premium || 0) : (r.weighted || 0)), 0), [monthRecords, goals.salesBasis]);
  const incomeActual = useMemo(() => issuedRecords.reduce((sum, r) => {
    const rate = PRODUCT_MAPPING[r.typeCode]?.commissionRate || 0;
    return sum + (r.premium || 0) * rate;
  }, 0), [issuedRecords]);
  const recruitActual = useMemo(() => {
    if (!loggedInUser) return 0;
    return (activities || []).filter(a => a.agentId === loggedInUser.id && a.month === currentMonth).reduce((sum, a) => sum + (a.recruitRegistered || 0), 0);
  }, [activities, loggedInUser, currentMonth]);

  const pct = (actual, target) => target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;

  const handleSave = async () => {
    if (!loggedInUser) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'personal_goals', `${loggedInUser.id}_${currentMonth}`), form);
      setEditing(false);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-sm">本月個人目標</h3>
        <button onClick={() => { setForm(goals); setEditing(true); }} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">設定目標</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100">
          <p className="text-[10px] text-indigo-500 font-bold uppercase">業績（{goals.salesBasis === 'premium' ? '實收' : '加權'}）</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{formatMoney(salesActual)}</p>
          <div className="h-2 w-full bg-white rounded-full overflow-hidden mt-2 shadow-inner">
            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${pct(salesActual, goals.salesTarget)}%` }}></div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">目標 {formatMoney(goals.salesTarget)} · {pct(salesActual, goals.salesTarget)}%</p>
        </div>
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-4 border border-teal-100">
          <p className="text-[10px] text-teal-600 font-bold uppercase">增員登錄</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{recruitActual} 人</p>
          <div className="h-2 w-full bg-white rounded-full overflow-hidden mt-2 shadow-inner">
            <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500" style={{ width: `${pct(recruitActual, goals.recruitTarget)}%` }}></div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">目標 {goals.recruitTarget} 人 · {pct(recruitActual, goals.recruitTarget)}%</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
          <p className="text-[10px] text-amber-600 font-bold uppercase">預估收入</p>
          <p className="text-lg font-bold text-gray-900 mt-1">{formatMoney(incomeActual)}</p>
          <div className="h-2 w-full bg-white rounded-full overflow-hidden mt-2 shadow-inner">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500" style={{ width: `${pct(incomeActual, goals.incomeTarget)}%` }}></div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">目標 {formatMoney(goals.incomeTarget)} · {pct(incomeActual, goals.incomeTarget)}%</p>
        </div>
      </div>
      {editing && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">設定本月目標</h3>
              <button onClick={() => setEditing(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">業績計算基礎</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg" value={form.salesBasis} onChange={e => setForm({ ...form, salesBasis: e.target.value })}>
                  <option value="weighted">加權保費</option>
                  <option value="premium">實收保費</option>
                </select>
              </div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">業績目標</label><input type="number" className="w-full p-2 border border-gray-200 rounded-lg" value={form.salesTarget} onChange={e => setForm({ ...form, salesTarget: Number(e.target.value) || 0 })} /></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">增員登錄目標（人）</label><input type="number" className="w-full p-2 border border-gray-200 rounded-lg" value={form.recruitTarget} onChange={e => setForm({ ...form, recruitTarget: Number(e.target.value) || 0 })} /></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">收入目標（預估收入）</label><input type="number" className="w-full p-2 border border-gray-200 rounded-lg" value={form.incomeTarget} onChange={e => setForm({ ...form, incomeTarget: Number(e.target.value) || 0 })} /></div>
              <button onClick={handleSave} disabled={saving} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={16} /> : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

// --- 關注名單 (獨立分頁：關注銷售 + 關注增員 兩個列表) ---
// --- 區運作 BINGO 挑戰賽：計分邏輯 ---
const getISOWeekKey = (d) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${weekNo}`;
};

const countWeeksAboveThreshold = (activities, agentId, monthKey, threshold) => {
  const agentActivities = activities.filter(a => a.agentId === agentId && a.date && a.date.startsWith(monthKey));
  const weekTotals = {};
  agentActivities.forEach(a => {
    const weekKey = getISOWeekKey(new Date(a.date));
    let dayScore = 0;
    Object.keys(ALL_ACTIVITY_WEIGHTS).forEach(k => { if (a[k]) dayScore += (a[k] || 0) * ALL_ACTIVITY_WEIGHTS[k].score; });
    weekTotals[weekKey] = (weekTotals[weekKey] || 0) + dayScore;
  });
  return Object.values(weekTotals).filter(v => v >= threshold).length;
};

const getIGGrowth = (igLogs, agentId, monthKey) => {
  const agentLogs = igLogs.filter(l => l.agentId === agentId).sort((a, b) => a.date.localeCompare(b.date));
  const thisMonthLogs = agentLogs.filter(l => l.date.startsWith(monthKey));
  if (thisMonthLogs.length === 0) return 0;
  const latest = thisMonthLogs[thisMonthLogs.length - 1].count;
  const beforeThisMonth = agentLogs.filter(l => l.date < `${monthKey}-01`);
  const baseline = beforeThisMonth.length > 0 ? beforeThisMonth[beforeThisMonth.length - 1].count : thisMonthLogs[0].count;
  return Math.max(0, latest - baseline);
};

const computeBingoTaskMultiplier = (task, agentId, monthKey, ctx) => {
  const { records, activities, recruits, igLogs, manualCounts, manualChecks } = ctx;
  switch (task.type) {
    case 'auto_customer_count': {
      const monthRecords = records.filter(r => r.agentId === agentId && r.date.startsWith(monthKey));
      const distinct = new Set(monthRecords.map(r => (r.insuredName || '').trim()).filter(Boolean)).size;
      return Math.floor(distinct / task.unit);
    }
    case 'auto_weighted_premium': {
      const sum = records.filter(r => r.agentId === agentId && r.date.startsWith(monthKey)).reduce((s, r) => s + (r.weighted || 0), 0);
      return Math.floor(sum / task.unit);
    }
    case 'auto_premium': {
      const sum = records.filter(r => r.agentId === agentId && r.date.startsWith(monthKey)).reduce((s, r) => s + (r.premium || 0), 0);
      return Math.floor(sum / task.unit);
    }
    case 'auto_temp_account': {
      const today = getTodayDate();
      const count = recruits.filter(r => {
        if (r.recruiterId !== agentId || r.isPromoted) return false;
        const dates = r.dates || {};
        if (dates.registeredDate && dates.registeredDate <= today) return false; // 已登錄的不算當月的臨時帳號
        return dates.tempAccountDate && dates.tempAccountDate.startsWith(monthKey) && dates.tempAccountDate <= today; // 日期要落在這個月「而且」已經過了才算完成
      }).length;
      return Math.floor(count / task.unit);
    }
    case 'auto_exam': {
      const today = getTodayDate();
      const count = recruits.filter(r => {
        if (r.recruiterId !== agentId || r.isPromoted) return false;
        const dates = r.dates || {};
        if (dates.registeredDate && dates.registeredDate <= today) return false; // 已登錄的不算當月的內外考
        const internalPassed = dates.internalExamDate && dates.internalExamDate.startsWith(monthKey) && dates.internalExamDate <= today;
        const externalPassed = dates.externalExamDate && dates.externalExamDate.startsWith(monthKey) && dates.externalExamDate <= today;
        return internalPassed || externalPassed; // 日期要落在這個月「而且」已經過了才算完成
      }).length;
      return Math.floor(count / task.unit);
    }
    case 'auto_ig_growth': {
      return Math.floor(getIGGrowth(igLogs, agentId, monthKey) / task.unit);
    }
    case 'auto_weekly_activity': {
      return countWeeksAboveThreshold(activities, agentId, monthKey, 100);
    }
    case 'manual_count': {
      const n = (manualCounts && manualCounts[task.id]) || 0;
      return Math.floor(n / task.unit);
    }
    case 'manual_check': {
      return (manualChecks && manualChecks[task.id]) ? 1 : 0;
    }
    default: return 0;
  }
};

const getGridArray = (ids) => Array.from({ length: 9 }, (_, i) => (ids && ids[i]) || null);

const computeBingoCard = (card, tasks, agentId, monthKey, ctx) => {
  const gridArr = getGridArray(card?.selectedTaskIds);
  const cellResults = gridArr.map(taskId => {
    if (!taskId) return null;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return null;
    const rawMultiplier = computeBingoTaskMultiplier(task, agentId, monthKey, { ...ctx, manualCounts: card?.manualCounts || {}, manualChecks: card?.manualChecks || {} });
    const multiplier = task.once ? Math.min(rawMultiplier, 1) : rawMultiplier;
    return { taskId, task, multiplier, score: multiplier * BINGO_CELL_SCORE };
  });
  let lineBonusCount = 0;
  BINGO_LINES.forEach(line => {
    if (line.every(idx => cellResults[idx] && cellResults[idx].multiplier >= 1)) lineBonusCount++;
  });
  const totalScore = cellResults.reduce((s, c) => s + (c ? c.score : 0), 0) + lineBonusCount * BINGO_LINE_BONUS;
  return { cellResults, lineBonusCount, totalScore, qualifies: totalScore >= BINGO_QUALIFY_THRESHOLD };
};

// --- 區運作 BINGO 挑戰賽頁面 ---
const BingoChallengePage = ({ loggedInUser, team, records, activities, recruits, isManagerViewer }) => {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [allCards, setAllCards] = useState([]);
  const [igLogs, setIgLogs] = useState([]);
  const [editTargetId, setEditTargetId] = useState(loggedInUser?.id || null);
  const [saving, setSaving] = useState(false);
  const [newIgCount, setNewIgCount] = useState('');
  const [newIgDate, setNewIgDate] = useState(getTodayDate());
  const [newIgAgentId, setNewIgAgentId] = useState(loggedInUser?.id || '');

  const shiftMonth = (delta) => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setSelectedMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'bingo_cards'), where('monthKey', '==', selectedMonth)), (snap) => {
      setAllCards(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [selectedMonth]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'ig_follower_logs'), (snap) => {
      setIgLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const ctx = { records, activities, recruits, igLogs };

  const leaderboard = useMemo(() => {
    return team.map(member => {
      const card = allCards.find(c => c.agentId === member.id) || { selectedTaskIds: [] };
      const result = computeBingoCard(card, DEFAULT_BINGO_TASKS, member.id, selectedMonth, ctx);
      return { member, card, ...result };
    }).sort((a, b) => b.totalScore - a.totalScore);
  }, [team, allCards, records, activities, recruits, igLogs, selectedMonth]);

  const canEditTarget = editTargetId === loggedInUser?.id || isManagerViewer;
  const editTargetMember = team.find(m => m.id === editTargetId);
  const editingCard = allCards.find(c => c.agentId === editTargetId) || { selectedTaskIds: [], manualCounts: {}, manualChecks: {} };
  const editingResult = useMemo(() => computeBingoCard(editingCard, DEFAULT_BINGO_TASKS, editTargetId, selectedMonth, ctx), [editingCard, records, activities, recruits, igLogs, editTargetId, selectedMonth]);

  const saveCard = async (payload) => {
    if (!editTargetId || !canEditTarget) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'bingo_cards', `${editTargetId}_${selectedMonth}`), { agentId: editTargetId, monthKey: selectedMonth, ...payload }, { merge: true });
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const [selectedGridIndex, setSelectedGridIndex] = useState(null);
  useEffect(() => { setSelectedGridIndex(null); }, [editTargetId]);

  const toggleTaskInGrid = async (taskId) => {
    const gridArr = getGridArray(editingCard.selectedTaskIds);
    let next;
    if (gridArr.includes(taskId)) {
      next = gridArr.map(id => id === taskId ? null : id);
    } else {
      const emptyIndex = gridArr.findIndex(id => !id);
      if (emptyIndex === -1) return;
      next = [...gridArr];
      next[emptyIndex] = taskId;
    }
    await saveCard({ selectedTaskIds: next, manualCounts: editingCard.manualCounts || {}, manualChecks: editingCard.manualChecks || {} });
  };

  // 選取移動：先點一個有任務的格子選取它，再點另一個格子(有任務或空格)互換位置，方便一開始排列調整
  const handleGridCellClick = async (index) => {
    if (!canEditTarget) return;
    const gridArr = getGridArray(editingCard.selectedTaskIds);
    if (selectedGridIndex === null) {
      if (!gridArr[index]) return;
      setSelectedGridIndex(index);
      return;
    }
    if (selectedGridIndex === index) { setSelectedGridIndex(null); return; }
    const next = [...gridArr];
    const temp = next[selectedGridIndex];
    next[selectedGridIndex] = next[index];
    next[index] = temp;
    setSelectedGridIndex(null);
    await saveCard({ selectedTaskIds: next, manualCounts: editingCard.manualCounts || {}, manualChecks: editingCard.manualChecks || {} });
  };

  const updateManualCount = async (taskId, value) => {
    const newCounts = { ...(editingCard.manualCounts || {}), [taskId]: Number(value) || 0 };
    await saveCard({ manualCounts: newCounts });
  };

  const toggleManualCheck = async (taskId) => {
    const newChecks = { ...(editingCard.manualChecks || {}), [taskId]: !(editingCard.manualChecks?.[taskId]) };
    await saveCard({ manualChecks: newChecks });
  };

  const handleLogIgCount = async () => {
    const targetAgentId = isManagerViewer ? newIgAgentId : loggedInUser?.id;
    if (!targetAgentId || !newIgCount || !newIgDate) return;
    try {
      await addDoc(collection(db, 'ig_follower_logs'), { agentId: targetAgentId, date: newIgDate, count: Number(newIgCount), createdAt: new Date().toISOString() });
      setNewIgCount('');
    } catch (e) { console.error(e); }
  };

  const renderGrid = (cellResults, interactive) => (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 9 }).map((_, i) => {
        const cell = cellResults[i];
        const isSelected = interactive && selectedGridIndex === i;
        if (!cell) {
          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => handleGridCellClick(i)}
              className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center text-xs transition ${isSelected ? 'border-indigo-400 bg-indigo-50 text-indigo-400' : 'border-gray-200 text-gray-300'} ${interactive ? 'hover:border-gray-300 cursor-pointer' : ''}`}
            >
              {isSelected ? '移到這' : '空格'}
            </button>
          );
        }
        const done = cell.multiplier >= 1;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => handleGridCellClick(i)}
            className={`aspect-square rounded-xl border-2 p-2 flex flex-col items-center justify-center text-center transition ${isSelected ? 'ring-4 ring-indigo-300' : ''} ${done ? 'bg-gradient-to-br from-amber-400 to-amber-500 border-amber-500' : 'bg-gray-50 border-gray-200'} ${interactive ? 'cursor-pointer' : ''}`}
          >
            <p className={`text-[10px] font-bold leading-tight ${done ? 'text-white' : 'text-gray-500'}`}>{cell.task?.label}</p>
            {cell.multiplier > 1 && <span className="text-[9px] font-bold text-white bg-black/20 rounded-full px-1.5 mt-1">x{cell.multiplier}</span>}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(251,191,36,0.15), transparent 65%)' }}></div>
        <Trophy className="mx-auto text-amber-400 mb-2 relative" size={32} />
        <h2 className="text-amber-300 font-bold text-2xl relative">六邊形戰士 BINGO 挑戰賽</h2>
        <div className="flex items-center justify-center gap-3 mt-2 relative">
          <button onClick={() => shiftMonth(-1)} className="text-gray-400 hover:text-amber-300"><ChevronLeft size={18} /></button>
          <span className="text-amber-200 font-bold text-sm">{selectedMonth}</span>
          <button onClick={() => shiftMonth(1)} className="text-gray-400 hover:text-amber-300"><ChevronRight size={18} /></button>
        </div>
        <p className="text-gray-400 text-xs mt-1 relative">每格 {BINGO_CELL_SCORE} 分，連線再 +{BINGO_LINE_BONUS} 分，累積達 {BINGO_QUALIFY_THRESHOLD} 分才有排名資格</p>
      </div>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm"><TrendingUp size={16} className="text-amber-500" /> 總分排行榜</h3>
        <div className="space-y-2">
          {leaderboard.map((entry, i) => (
            <button key={entry.member.id} onClick={() => setEditTargetId(entry.member.id)} className={`w-full flex items-center justify-between gap-3 p-3 rounded-xl border transition text-left ${editTargetId === entry.member.id ? 'border-amber-300 bg-amber-50/50' : 'border-gray-100 hover:border-amber-200 hover:bg-amber-50/30'}`}>
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-bold text-sm ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-gray-300'}`}>{i + 1}</span>
                <span className="font-bold text-gray-800 text-sm">{entry.member.name}</span>
                {!entry.qualifies && <span className="text-[9px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">未達門檻</span>}
              </div>
              <span className="font-bold text-amber-600">{entry.totalScore} 分</span>
            </button>
          ))}
        </div>
      </Card>

      {editTargetMember && (
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-1 text-sm">
            {editTargetId === loggedInUser?.id ? '我的賓果卡' : `${editTargetMember.name} 的賓果卡`}
            {!canEditTarget && <span className="text-[10px] text-gray-400 font-normal ml-2">（唯讀）</span>}
          </h3>
          <p className="text-[10px] text-gray-400 mb-4">{editingResult.totalScore} 分 · {editingResult.lineBonusCount} 條連線{canEditTarget ? ' · 點下方任務加入九宮格；點格子裡的任務可選取，再點另一格互換位置' : ''}</p>
          {renderGrid(editingResult.cellResults, canEditTarget)}

          {canEditTarget && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 mb-2">任務清單（點擊加入／移出九宮格）</p>
              <div className="space-y-2">
                {DEFAULT_BINGO_TASKS.map(task => {
                  const inGrid = (editingCard.selectedTaskIds || []).includes(task.id);
                  const cellResult = editingResult.cellResults.find(c => c && c.taskId === task.id);
                  return (
                    <div key={task.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${inGrid ? 'border-amber-300 bg-amber-50/50' : 'border-gray-100'}`}>
                      <button onClick={() => toggleTaskInGrid(task.id)} disabled={saving} className="flex-1 text-left">
                        <p className="text-sm font-bold text-gray-800">{task.label}</p>
                        {task.desc && <p className="text-[10px] text-gray-400">{task.desc}</p>}
                      </button>
                      {inGrid && cellResult && (
                        <span className="text-xs font-bold text-amber-600 shrink-0">{cellResult.multiplier >= 1 ? `完成 x${cellResult.multiplier}` : '未完成'}</span>
                      )}
                      {inGrid && task.type === 'manual_count' && (
                        <input type="number" min="0" className="w-16 p-1.5 border border-gray-200 rounded text-xs shrink-0" placeholder={`共${task.unit}`} value={editingCard.manualCounts?.[task.id] || ''} onChange={e => updateManualCount(task.id, e.target.value)} />
                      )}
                      {inGrid && task.type === 'manual_check' && (
                        <input type="checkbox" className="w-5 h-5 shrink-0" checked={!!editingCard.manualChecks?.[task.id]} onChange={() => toggleManualCheck(task.id)} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      )}

      <Card className="p-5">
        <p className="text-xs font-bold text-gray-500 mb-2">更新 IG 粉絲數（用來計算當月新增粉絲，也能看出長期趨勢）</p>
        <div className="flex flex-wrap gap-2">
          {isManagerViewer && (
            <select className="p-2 border border-gray-200 rounded-lg text-sm" value={newIgAgentId} onChange={e => setNewIgAgentId(e.target.value)}>
              <option value="">選擇同仁</option>
              {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          )}
          <input type="date" className="p-2 border border-gray-200 rounded-lg text-sm" value={newIgDate} onChange={e => setNewIgDate(e.target.value)} />
          <input type="number" min="0" placeholder="粉絲數" className="flex-1 min-w-[100px] p-2 border border-gray-200 rounded-lg text-sm" value={newIgCount} onChange={e => setNewIgCount(e.target.value)} />
          <button onClick={handleLogIgCount} disabled={!newIgCount || (isManagerViewer && !newIgAgentId)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50">記錄</button>
        </div>
      </Card>
    </div>
  );
};

const WatchlistPage = ({ loggedInUser, customers }) => {
  const today = getTodayDate();
  const [busyId, setBusyId] = useState(null);
  const [completingContact, setCompletingContact] = useState(null);
  const [contactType, setContactType] = useState('appointment');
  const [contactNote, setContactNote] = useState('');

  const salesWatch = useMemo(() => customers.filter(c => c.specialFocus), [customers]);
  const recruitWatch = useMemo(() => customers.filter(c => c.specialFocusRecruit), [customers]);

  const openContactModal = (customer) => {
    setCompletingContact(customer);
    setContactType('appointment');
    setContactNote('');
  };

  const handleConfirmContact = async () => {
    if (!completingContact || !loggedInUser) return;
    setBusyId(completingContact.id);
    try {
      await updateDoc(doc(db, 'customers', completingContact.id), {
        visitLog: arrayUnion({ date: today, type: ALL_ACTIVITY_WEIGHTS[contactType]?.label || contactType, note: contactNote })
      });
      const cascadeKeys = getCascadeKeys(contactType);
      const incrementPayload = {};
      cascadeKeys.forEach(k => { incrementPayload[k] = increment(1); });
      const docId = `${loggedInUser.id}_${today}`;
      await setDoc(doc(db, 'activity_record', docId), {
        agentId: loggedInUser.id, date: today, month: today.substring(0, 7),
        ...incrementPayload, updatedAt: new Date().toISOString()
      }, { merge: true });
      setCompletingContact(null);
    } catch (e) { console.error(e); } finally { setBusyId(null); }
  };

  const toggleSalesWatch = async (c) => { try { await updateDoc(doc(db, 'customers', c.id), { specialFocus: !c.specialFocus }); } catch (e) { console.error(e); } };
  const toggleRecruitWatch = async (c) => { try { await updateDoc(doc(db, 'customers', c.id), { specialFocusRecruit: !c.specialFocusRecruit }); } catch (e) { console.error(e); } };

  const COLOR_STYLES = {
    amber: { row: 'bg-amber-50 border-amber-100', btn: 'bg-amber-500 hover:bg-amber-600', star: 'text-amber-400' },
    teal: { row: 'bg-teal-50 border-teal-100', btn: 'bg-teal-500 hover:bg-teal-600', star: 'text-teal-400' }
  };

  const renderList = (list, colorKey, toggleFn) => {
    const s = COLOR_STYLES[colorKey];
    return (
      <div className="space-y-3">
        {list.length === 0 && <p className="text-center text-gray-400 text-sm py-8">還沒有標記任何人，到「客戶管理」點客戶卡片上的星星開始標記</p>}
        {list.map(c => (
          <div key={c.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${s.row}`}>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{c.name} <span className="text-[10px] text-gray-400 font-normal">· {(c.tags || []).join('、')}</span></p>
              {c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button disabled={busyId === c.id} onClick={() => openContactModal(c)} className={`${s.btn} text-white text-xs font-bold px-3 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-1`}>
                {busyId === c.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} 標記聯繫
              </button>
              <button onClick={() => toggleFn(c)} title="取消關注" className={`${s.star} hover:text-gray-300 p-2`}><Star size={16} className="fill-current" /></button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">關注名單</h2>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">在「客戶管理」點客戶卡片上的星星標記，會一直提醒直到你自己取消</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 border-t-4 border-t-amber-400">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm"><Star size={16} className="fill-amber-400 text-amber-400" /> 關注銷售名單 ({salesWatch.length})</h3>
          {renderList(salesWatch, 'amber', toggleSalesWatch)}
        </Card>
        <Card className="p-5 border-t-4 border-t-teal-400">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm"><Star size={16} className="fill-teal-500 text-teal-500" /> 關注增員名單 ({recruitWatch.length})</h3>
          {renderList(recruitWatch, 'teal', toggleRecruitWatch)}
        </Card>
      </div>

      {completingContact && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">標記已聯繫：{completingContact.name}</h3>
              <button onClick={() => setCompletingContact(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">這次聯繫要算哪個 MEA 類別？</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg" value={contactType} onChange={e => setContactType(e.target.value)}>
                  <optgroup label="業務活動">{Object.entries(ACTIVITY_WEIGHTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</optgroup>
                  <optgroup label="增員活動">{Object.entries(RECRUIT_ACTIVITY_WEIGHTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</optgroup>
                </select>
              </div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">備註（選填）</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={contactNote} onChange={e => setContactNote(e.target.value)} /></div>
              <button onClick={handleConfirmContact} disabled={busyId === completingContact.id} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                {busyId === completingContact.id ? <Loader2 className="animate-spin" size={16} /> : '確認'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 一日時間軸視圖 (取代純文字清單，用空間位置表現時間長短，有質感的行事曆感) ---
const toMinutes = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

const layoutDayEvents = (events) => {
  const withTimes = events.filter(e => e.time).map(e => {
    const startMin = toMinutes(e.time);
    const endMin = e.endTime ? toMinutes(e.endTime) : startMin + 40;
    return { ...e, startMin, endMin: Math.max(endMin, startMin + 25) };
  }).sort((a, b) => a.startMin - b.startMin);

  // 把互相重疊的行程分成同一群
  let clusters = withTimes.map(e => [e]);
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < clusters.length; i++) {
      for (let j = i + 1; j < clusters.length; j++) {
        if (clusters[i].some(a => clusters[j].some(b => a.startMin < b.endMin && b.startMin < a.endMin))) {
          clusters[i] = [...clusters[i], ...clusters[j]];
          clusters.splice(j, 1);
          merged = true;
          break outer;
        }
      }
    }
  }

  const positioned = [];
  clusters.forEach(cluster => {
    const sorted = [...cluster].sort((a, b) => a.startMin - b.startMin);
    const laneEnds = [];
    const clusterPositioned = [];
    sorted.forEach(e => {
      let lane = laneEnds.findIndex(end => end <= e.startMin);
      if (lane === -1) { lane = laneEnds.length; laneEnds.push(e.endMin); }
      else laneEnds[lane] = e.endMin;
      clusterPositioned.push({ ...e, lane });
    });
    clusterPositioned.forEach(p => positioned.push({ ...p, totalLanes: laneEnds.length }));
  });
  return positioned;
};

const DayTimelineView = ({ events, isToday, onEventClick, getEventLabel, getEventPriority }) => {
  const HOUR_H = 56;
  const timed = events.filter(e => e.time);
  const untimed = events.filter(e => !e.time);

  let startHour = 8, endHour = 20;
  timed.forEach(e => {
    const sh = Math.floor(toMinutes(e.time) / 60);
    const eh = Math.ceil((e.endTime ? toMinutes(e.endTime) : toMinutes(e.time) + 40) / 60);
    startHour = Math.min(startHour, sh);
    endHour = Math.max(endHour, eh);
  });

  const positioned = layoutDayEvents(events);
  const totalHeight = (endHour - startHour) * HOUR_H;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const showNowLine = isToday && nowMin >= startHour * 60 && nowMin <= endHour * 60;
  const nowY = ((nowMin - startHour * 60) / 60) * HOUR_H;

  return (
    <div>
      {untimed.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {untimed.map(e => (
            <button key={e.id} onClick={() => onEventClick(e)} className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full pl-1.5 pr-2.5 py-1 transition">
              <span className={`w-1.5 h-1.5 rounded-full ${getEventColor(e)}`}></span>
              <span className="text-[11px] font-bold text-gray-700">{getEventLabel(e)}{e.customerName && ` · ${e.customerName}`}</span>
            </button>
          ))}
        </div>
      )}
      <div className="relative" style={{ display: 'grid', gridTemplateColumns: '42px 1fr' }}>
        <div style={{ height: totalHeight }} className="relative">
          {hours.map((h, i) => (
            <div key={h} style={{ position: 'absolute', top: i * HOUR_H - 6, right: 6 }} className="text-[10px] text-gray-400">
              {String(h).padStart(2, '0')}:00
            </div>
          ))}
        </div>
        <div className="relative border-l border-gray-100" style={{ height: totalHeight }}>
          {hours.map((h, i) => (
            <div key={h} style={{ position: 'absolute', top: i * HOUR_H, left: 0, right: 0, borderTop: '1px solid #F3F4F6' }}></div>
          ))}
          {showNowLine && (
            <div style={{ position: 'absolute', top: nowY, left: 0, right: 0, zIndex: 20 }} className="flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 -ml-0.75"></div>
              <div className="flex-1 h-px bg-red-400"></div>
            </div>
          )}
          {positioned.map(e => {
            const top = ((e.startMin - startHour * 60) / 60) * HOUR_H;
            const height = ((e.endMin - e.startMin) / 60) * HOUR_H;
            const widthPct = 100 / e.totalLanes;
            const leftPct = e.lane * widthPct;
            return (
              <button
                key={e.id}
                onClick={() => onEventClick(e)}
                style={{ position: 'absolute', top: top + 1, height: height - 2, left: `calc(${leftPct}% + 3px)`, width: `calc(${widthPct}% - 6px)` }}
                className={`${getEventColor(e)} rounded-lg text-left px-2 py-1 overflow-hidden hover:brightness-95 transition shadow-sm`}
              >
                <p className="text-white text-[11px] font-bold leading-tight truncate">{getEventLabel(e)}{e.customerName && ` · ${e.customerName}`}</p>
                {height > 32 && <p className="text-white/80 text-[10px] leading-tight">{e.time}{e.endTime ? `-${e.endTime}` : ''}</p>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const TodoSchedulePage = ({ loggedInUser, customers, scheduleEvents, team, recurringRules, records, activities, teamScheduleEvents, isTeamScheduleViewer }) => {
  const today = getTodayDate();
  const [busyId, setBusyId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [showRecurringManage, setShowRecurringManage] = useState(false);
  const [showBatchSchedule, setShowBatchSchedule] = useState(false);
  const emptyForm = { customerId: '', type: 'appointment', date: getTodayDate(), time: '', endTime: '', note: '', priority: 'normal', address: '' };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState(getTodayDate());
  const [reminderTime, setReminderTime] = useState('');
  const [reminderEndDate, setReminderEndDate] = useState('');
  const [reminderCategory, setReminderCategory] = useState('personal');
  const [reminderPriority, setReminderPriority] = useState('normal');
  const [reminderSaving, setReminderSaving] = useState(false);
  const [reminderParticipantIds, setReminderParticipantIds] = useState(() => loggedInUser ? [loggedInUser.id] : []);

  const [editingEvent, setEditingEvent] = useState(null);

  const [completingEvent, setCompletingEvent] = useState(null);
  const [followUpInput, setFollowUpInput] = useState('');

  const [completingContact, setCompletingContact] = useState(null);
  const [contactType, setContactType] = useState('appointment');
  const [contactNote, setContactNote] = useState('');
  const [contactFollowUp, setContactFollowUp] = useState('');

  const emptyRecurringForm = { title: '', frequency: 'weekly', dayOfWeek: 1, weekOfMonth: 1, dayOfWeekForMonthly: 1, startTime: '', endTime: '', participantIds: loggedInUser ? [loggedInUser.id] : [], startDate: getTodayDate(), endDate: '', category: 'meeting', priority: 'normal' };
  const [recurringForm, setRecurringForm] = useState(emptyRecurringForm);
  const [recurringSaving, setRecurringSaving] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);

  // 分類/優先度篩選
  const [filterCategory, setFilterCategory] = useState('');
  const [viewMode, setViewMode] = useState('timeline');
  const [filterPriority, setFilterPriority] = useState('');
  const getEventCategory = (e) => {
    if (e.isReminder) return e.category || 'other';
    return ACTIVITY_WEIGHTS[e.type] ? 'sales' : 'recruit';
  };
  const EVENT_CATEGORY_OPTIONS = [
    { value: 'sales', label: '銷售' },
    { value: 'recruit', label: '增員' },
    { value: 'personal', label: '私事' },
    { value: 'meeting', label: '課程會議' },
    { value: 'claim', label: '理賠' },
    { value: 'paperwork', label: '文書' },
    { value: 'other', label: '其他' }
  ];
  const matchesFilter = (e) => (!filterCategory || getEventCategory(e) === filterCategory) && (!filterPriority || (e.priority || 'normal') === filterPriority);

  const getEventLabel = (e) => e.isReminder ? e.title : (ALL_ACTIVITY_WEIGHTS[e.type]?.label || e.type);
  const getEventPriority = (e) => PRIORITY_LEVELS[e.priority] || PRIORITY_LEVELS.normal;
  const sortByPriorityThenDate = (a, b) => {
    const pa = getEventPriority(a).order, pb = getEventPriority(b).order;
    if (pa !== pb) return pa - pb;
    return (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''));
  };
  const sortByDateThenPriority = (a, b) => {
    const dateCompare = (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''));
    if (dateCompare !== 0) return dateCompare;
    return getEventPriority(a).order - getEventPriority(b).order;
  };
  const getWeekdayLabel = (dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return ['週日', '週一', '週二', '週三', '週四', '週五', '週六'][new Date(y, m - 1, d).getDay()];
  };

  // --- 固定行程：計算未來60天內的虛擬場次 (未完成前不會真的建立文件) ---
  const virtualOccurrences = useMemo(() => {
    if (!loggedInUser) return [];
    const windowStart = new Date(today);
    const windowEnd = new Date(today); windowEnd.setDate(windowEnd.getDate() + 30);
    const results = [];
    (recurringRules || []).filter(r => (r.participantIds || []).includes(loggedInUser.id)).forEach(rule => {
      const dates = generateRecurringOccurrences(rule, windowStart, windowEnd);
      dates.forEach(date => {
        const alreadyReal = scheduleEvents.some(e => e.ruleId === rule.id && e.date === date);
        if (alreadyReal) return;
        results.push({
          id: `virtual_${rule.id}_${date}`,
          isVirtual: true,
          ruleId: rule.id,
          customerId: '', customerName: '',
          isReminder: true, type: 'reminder',
          title: rule.title,
          category: rule.category || 'meeting',
          priority: rule.priority || 'normal',
          date, time: rule.startTime || '',
          note: (rule.startTime && rule.endTime) ? `${rule.startTime}-${rule.endTime}` : '',
          status: 'scheduled'
        });
      });
    });
    return results;
  }, [recurringRules, scheduleEvents, loggedInUser, today]);

  const allItems = useMemo(() => [...scheduleEvents, ...virtualOccurrences], [scheduleEvents, virtualOccurrences]);

  // 今日焦點：今天/過期的行程與提醒
  const isEventActiveToday = (e) => {
    if (e.isReminder && e.endDate) return e.date <= today && today <= e.endDate;
    return e.date <= today;
  };
  const dueEvents = useMemo(() => allItems.filter(e => e.status === 'scheduled' && isEventActiveToday(e) && matchesFilter(e)).sort(sortByPriorityThenDate), [allItems, today, filterCategory, filterPriority]);
  const isContactedToday = (c) => (c.visitLog || []).some(v => v.date === today);
  const [suggestedIds, setSuggestedIds] = useState(null);
  const [dismissedIds, setDismissedIds] = useState([]);

  const dueCustomers = useMemo(() => customers.filter(c => c.nextFollowUpDate && c.nextFollowUpDate <= today && !isContactedToday(c) && !dismissedIds.includes(c.id)), [customers, today, dismissedIds]);
  const birthdayCustomers = useMemo(() => {
    const now = new Date();
    const todayNoTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return customers.filter(c => {
      if (!c.birthday) return false;
      const b = new Date(c.birthday);
      if (isNaN(b.getTime())) return false;
      const thisYearBday = new Date(now.getFullYear(), b.getMonth(), b.getDate());
      const diffDays = Math.floor((thisYearBday - todayNoTime) / 86400000);
      return diffDays >= 0 && diffDays <= 7;
    }).sort((a, b) => a.birthday.slice(5).localeCompare(b.birthday.slice(5)));
  }, [customers]);

  // 每日自動推薦聯繫名單：頂級業務的經營節奏 —— 新名單要快速跟進、既有客戶要定期維繫、
  // 準客戶要持續推進漏斗、準增員要穩定培養組織、久未聯繫的人要喚醒關係避免流失。
  // 這份名單「當天固定」，存進 Firestore 後整天不再重算，聯繫完就從畫面上消失、不會遞補新的人進來。
  // 排除規則：① 最近7天內出現過的人，7天內不再重複推薦 ② 未來7天內已經有排定行程的人，暫時不推薦(已經在關係管理軌道上了)
  const getUpcomingScheduleCustomerIds = () => {
    const weekLater = new Date(today); weekLater.setDate(weekLater.getDate() + 7);
    const weekLaterStr = dateToStr(weekLater);
    const ids = new Set();
    scheduleEvents.forEach(e => {
      if (e.customerId && e.status === 'scheduled' && e.date >= today && e.date <= weekLaterStr) ids.add(e.customerId);
    });
    return ids;
  };

  const getRecentlyShownIds = async () => {
    const historySnap = await getDocs(query(collection(db, 'daily_suggestions'), where('ownerId', '==', loggedInUser.id)));
    const sevenDaysAgo = new Date(today); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const shown = new Set();
    historySnap.docs.forEach(d => {
      const data = d.data();
      if (data.date && data.date !== today && new Date(data.date) >= sevenDaysAgo) {
        (data.customerIds || []).forEach(id => shown.add(id));
      }
    });
    return shown;
  };

  useEffect(() => {
    if (!loggedInUser || customers.length === 0) { setSuggestedIds(null); setDismissedIds([]); return; }
    let cancelled = false;
    const suggestionRef = doc(db, 'daily_suggestions', `${loggedInUser.id}_${today}`);
    (async () => {
      try {
        const snap = await getDoc(suggestionRef);
        if (snap.exists()) {
          if (!cancelled) {
            const data = snap.data();
            setSuggestedIds(data.displayIds || data.customerIds || []);
            setDismissedIds(data.dismissedIds || []);
          }
          return;
        }

        const recentlyShown = await getRecentlyShownIds();
        const dueIdsAtGenTime = new Set(customers.filter(c => c.nextFollowUpDate && c.nextFollowUpDate <= today).map(c => c.id));
        const hasUpcoming = getUpcomingScheduleCustomerIds();
        const excludeIds = new Set([...dueIdsAtGenTime, ...recentlyShown, ...hasUpcoming]);
        const picked = buildContactSuggestions(customers, today, excludeIds, 15);
        let ids = picked.map(c => c.id);
        // 排除條件太嚴格湊不滿15人時，放寬「7天內出現過」的限制再補一次 (但仍然不排未來7天已有行程的人)
        if (ids.length < 15) {
          const relaxedExclude = new Set([...dueIdsAtGenTime, ...hasUpcoming, ...ids]);
          const more = buildContactSuggestions(customers, today, relaxedExclude, 15 - ids.length);
          ids = [...ids, ...more.map(c => c.id)];
        }

        await setDoc(suggestionRef, { ownerId: loggedInUser.id, date: today, customerIds: ids, displayIds: ids, dismissedIds: [], createdAt: new Date().toISOString() });
        if (!cancelled) { setSuggestedIds(ids); setDismissedIds([]); }
      } catch (e) { console.error(e); }
    })();
    return () => { cancelled = true; };
    // 只在登入者或日期變動時重新產生，不隨 customers 內容變化重算，避免整天一直遞補
    // eslint-disable-next-line
  }, [loggedInUser?.id, today]);

  // 換一批：完全換掉目前畫面上的名單 (不是疊加)，換掉的人依然算「今天推薦過」，7天內不會再被推薦
  const [refreshingBatch, setRefreshingBatch] = useState(false);
  const handleGetMoreSuggestions = async () => {
    if (!loggedInUser || refreshingBatch) return;
    setRefreshingBatch(true);
    try {
      const suggestionRef = doc(db, 'daily_suggestions', `${loggedInUser.id}_${today}`);
      const snap = await getDoc(suggestionRef);
      const existingCumulative = snap.exists() ? (snap.data().customerIds || []) : (suggestedIds || []);

      const dueIdsNow = new Set(customers.filter(c => c.nextFollowUpDate && c.nextFollowUpDate <= today).map(c => c.id));
      const hasUpcoming = getUpcomingScheduleCustomerIds();
      const recentlyShown = await getRecentlyShownIds();
      const excludeIds = new Set([...dueIdsNow, ...hasUpcoming, ...recentlyShown, ...existingCumulative]);
      let more = buildContactSuggestions(customers, today, excludeIds, 15);
      if (more.length < 15) {
        const relaxedExclude = new Set([...dueIdsNow, ...hasUpcoming, ...existingCumulative, ...more.map(c => c.id)]);
        const extra = buildContactSuggestions(customers, today, relaxedExclude, 15 - more.length);
        more = [...more, ...extra];
      }

      const newDisplayIds = more.map(c => c.id);
      const newCumulative = [...new Set([...existingCumulative, ...newDisplayIds])];
      await setDoc(suggestionRef, { customerIds: newCumulative, displayIds: newDisplayIds }, { merge: true });
      setSuggestedIds(newDisplayIds);
      setDismissedIds([]);
    } catch (e) { console.error(e); } finally { setRefreshingBatch(false); }
  };

  // 關閉：今天先不處理這個人，明天會重新出現(不是永久移除，只是今天不再提醒)
  const handleDismissToday = async (customerId) => {
    setDismissedIds(prev => [...prev, customerId]);
    if (!loggedInUser) return;
    try {
      const suggestionRef = doc(db, 'daily_suggestions', `${loggedInUser.id}_${today}`);
      await setDoc(suggestionRef, { dismissedIds: arrayUnion(customerId) }, { merge: true });
    } catch (e) { console.error(e); }
  };

  const autoSuggested = useMemo(() => {
    if (!suggestedIds) return [];
    return suggestedIds
      .map(id => customers.find(c => c.id === id))
      .filter(c => c && !isContactedToday(c) && !dueCustomers.some(d => d.id === c.id) && !dismissedIds.includes(c.id));
  }, [suggestedIds, customers, dueCustomers, dismissedIds]);

  // 即將到來：未來的行程 (依明天/本週/未來分組)
  const upcoming = useMemo(() => allItems.filter(e => e.status === 'scheduled' && e.date > today && matchesFilter(e)).sort(sortByDateThenPriority), [allItems, today, filterCategory, filterPriority]);

  const groupLabel = (dateStr) => {
    const tmr = new Date(); tmr.setDate(tmr.getDate() + 1);
    if (dateStr === dateToStr(tmr)) return '明天';
    const weekLater = new Date(); weekLater.setDate(weekLater.getDate() + 7);
    if (dateStr <= dateToStr(weekLater)) return '本週';
    return '未來';
  };
  const grouped = useMemo(() => {
    const groups = {};
    upcoming.forEach(e => {
      const label = groupLabel(e.date);
      if (!groups[label]) groups[label] = [];
      groups[label].push(e);
    });
    // 「未來」區塊裡，同一個固定行程規則只顯示最近一次，避免同一場週會洗版
    if (groups['未來']) {
      const seenRules = new Set();
      groups['未來'] = groups['未來'].filter(e => {
        if (!e.ruleId) return true;
        if (seenRules.has(e.ruleId)) return false;
        seenRules.add(e.ruleId);
        return true;
      });
    }
    return groups;
  }, [upcoming]);
  const groupOrder = ['明天', '本週', '未來'];

  // 時間軸模式用：依實際日期分組 (只顯示最近14天，避免時間軸拉太長)
  const groupedByDate = useMemo(() => {
    const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() + 14);
    const cutoffStr = dateToStr(cutoff);
    const byDate = {};
    upcoming.filter(e => e.date <= cutoffStr).forEach(e => {
      if (!byDate[e.date]) byDate[e.date] = [];
      byDate[e.date].push(e);
    });
    return Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0]));
  }, [upcoming, today]);

  // 團隊行程總覽 (主管視角)：全體同仁未來14天的行程，依日期分組
  const teamGroupedByDate = useMemo(() => {
    if (!isTeamScheduleViewer) return [];
    const cutoff = new Date(today); cutoff.setDate(cutoff.getDate() + 14);
    const cutoffStr = dateToStr(cutoff);
    const byDate = {};
    (teamScheduleEvents || []).filter(e => e.status === 'scheduled' && e.date >= today && e.date <= cutoffStr).forEach(e => {
      if (!byDate[e.date]) byDate[e.date] = [];
      const owner = (team || []).find(m => m.id === e.ownerId);
      byDate[e.date].push({ ...e, ownerName: owner ? owner.name : '未知同仁' });
    });
    return Object.entries(byDate).sort((a, b) => a[0].localeCompare(b[0]));
  }, [teamScheduleEvents, team, isTeamScheduleViewer, today]);

  const completedRecent = useMemo(() => [...scheduleEvents].filter(e => e.status === 'completed').sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || '')).slice(0, 15), [scheduleEvents]);

  // --- 完成行程 ---
  const handleCompleteEvent = async (event) => {
    if (!loggedInUser) return;
    if (event.isVirtual) {
      setBusyId(event.id);
      try {
        await addDoc(collection(db, 'schedule_events'), {
          ownerId: loggedInUser.id, ruleId: event.ruleId, customerId: '', customerName: '',
          isReminder: true, type: 'reminder', title: event.title, category: event.category, priority: event.priority,
          date: event.date, time: event.time, note: event.note,
          status: 'completed', completedAt: new Date().toISOString(), createdAt: new Date().toISOString()
        });
      } catch (e) { console.error(e); } finally { setBusyId(null); }
      return;
    }
    if (event.customerId) {
      setCompletingEvent(event);
      setFollowUpInput('');
      return;
    }
    setBusyId(event.id);
    try { await completeScheduleEvent(event, loggedInUser.id); } catch (e) { console.error(e); } finally { setBusyId(null); }
  };

  const handleConfirmCompleteEvent = async () => {
    if (!completingEvent || !loggedInUser) return;
    setBusyId(completingEvent.id);
    try {
      await completeScheduleEvent(completingEvent, loggedInUser.id);
      if (followUpInput && completingEvent.customerId) {
        await updateDoc(doc(db, 'customers', completingEvent.customerId), { nextFollowUpDate: followUpInput });
      }
      setCompletingEvent(null);
    } catch (e) { console.error(e); } finally { setBusyId(null); }
  };

  // --- 標記聯繫客戶 (該追蹤 + 自動推薦皆共用) ---
  const openContactModal = (customer) => {
    setCompletingContact(customer);
    setContactType('appointment');
    setContactNote('');
    setContactFollowUp('');
  };

  const handleConfirmContact = async () => {
    if (!completingContact || !loggedInUser) return;
    setBusyId(completingContact.id);
    try {
      await updateDoc(doc(db, 'customers', completingContact.id), {
        visitLog: arrayUnion({ date: today, type: ALL_ACTIVITY_WEIGHTS[contactType]?.label || contactType, note: contactNote }),
        nextFollowUpDate: contactFollowUp || ''
      });
      const docId = `${loggedInUser.id}_${today}`;
      const cascadeKeys = getCascadeKeys(contactType);
      const incrementPayload = {};
      cascadeKeys.forEach(k => { incrementPayload[k] = increment(1); });
      await setDoc(doc(db, 'activity_record', docId), {
        agentId: loggedInUser.id,
        date: today,
        month: today.substring(0, 7),
        ...incrementPayload,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setCompletingContact(null);
    } catch (e) { console.error(e); } finally { setBusyId(null); }
  };

  // --- 新增/編輯/刪除 行程 ---
  const handleCreateCustomerInline = async (name) => {
    if (!loggedInUser || !name.trim()) return null;
    const trimmed = name.trim();
    const dup = customers.find(c => c.name.trim().toLowerCase() === trimmed.toLowerCase());
    if (dup) {
      const confirmed = window.confirm(`已經有一位「${dup.name}」了，確定要新增新的客戶嗎？`);
      if (!confirmed) return dup.id;
    }
    try {
      const ref = await addDoc(collection(db, 'customers'), {
        name: trimmed, phone: '', lineId: '', igHandle: '', birthday: '', gender: '', region: '', incomeRange: '', address: '',
        tags: ['準客戶'], notes: '', nextFollowUpDate: '',
        source: '行程建立', ownerId: loggedInUser.id, visitLog: [], createdAt: new Date().toISOString()
      });
      return ref.id;
    } catch (e) { console.error(e); return null; }
  };

  const handleAddSchedule = async () => {
    if (!loggedInUser || !form.date) return;
    setSaving(true);
    try {
      const customer = customers.find(c => c.id === form.customerId);
      await addDoc(collection(db, 'schedule_events'), {
        ownerId: loggedInUser.id,
        customerId: form.customerId || '',
        customerName: customer ? customer.name : '',
        type: form.type,
        isReminder: false,
        title: '',
        priority: form.priority,
        date: form.date,
        time: form.time,
        endTime: form.endTime,
        note: form.note,
        address: form.address,
        status: 'scheduled',
        completedAt: null,
        createdAt: new Date().toISOString()
      });
      setForm(emptyForm);
      setShowForm(false);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleAddReminder = async () => {
    if (!loggedInUser || !reminderTitle || !reminderDate || reminderParticipantIds.length === 0) return;
    setReminderSaving(true);
    try {
      const batch = writeBatch(db);
      reminderParticipantIds.forEach(pid => {
        const ref = doc(collection(db, 'schedule_events'));
        batch.set(ref, {
          ownerId: pid,
          customerId: '',
          customerName: '',
          type: 'reminder',
          isReminder: true,
          title: reminderTitle,
          category: reminderCategory,
          priority: reminderPriority,
          date: reminderDate,
          endDate: reminderEndDate || '',
          time: reminderTime,
          note: '',
          status: 'scheduled',
          completedAt: null,
          createdAt: new Date().toISOString()
        });
      });
      await batch.commit();
      setReminderTitle('');
      setReminderDate(getTodayDate());
      setReminderTime('');
      setReminderEndDate('');
      setReminderCategory('personal');
      setReminderPriority('normal');
      setReminderParticipantIds(loggedInUser ? [loggedInUser.id] : []);
      setShowReminderForm(false);
    } catch (e) { console.error(e); } finally { setReminderSaving(false); }
  };

  const openEditEvent = (event) => setEditingEvent({ ...event });

  const handleSaveEditEvent = async () => {
    if (!editingEvent) return;
    setSaving(true);
    try {
      let payload;
      if (editingEvent.isReminder) {
        payload = { title: editingEvent.title, date: editingEvent.date, endDate: editingEvent.endDate || '', time: editingEvent.time || '', category: editingEvent.category, priority: editingEvent.priority };
      } else {
        const customer = customers.find(c => c.id === editingEvent.customerId);
        payload = { type: editingEvent.type, customerId: editingEvent.customerId || '', customerName: customer ? customer.name : '', date: editingEvent.date, time: editingEvent.time, endTime: editingEvent.endTime || '', note: editingEvent.note, priority: editingEvent.priority, address: editingEvent.address || '' };
      }
      await updateDoc(doc(db, 'schedule_events', editingEvent.id), payload);
      setEditingEvent(null);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try { await deleteDoc(doc(db, 'schedule_events', deleteTarget)); setDeleteTarget(null); } catch (e) { console.error(e); }
  };

  // --- 固定行程 (規則管理) ---
  const myRecurringRules = useMemo(() => (recurringRules || []).filter(r => r.creatorId === (loggedInUser?.id)), [recurringRules, loggedInUser]);

  const handleSaveRecurring = async () => {
    if (!loggedInUser || !recurringForm.title || recurringForm.participantIds.length === 0) return;
    setRecurringSaving(true);
    try {
      const payload = {
        title: recurringForm.title,
        frequency: recurringForm.frequency,
        dayOfWeek: recurringForm.dayOfWeek,
        weekOfMonth: recurringForm.weekOfMonth,
        dayOfWeekForMonthly: recurringForm.dayOfWeekForMonthly,
        startTime: recurringForm.startTime,
        endTime: recurringForm.endTime,
        participantIds: recurringForm.participantIds,
        startDate: recurringForm.startDate,
        endDate: recurringForm.endDate || null,
        category: recurringForm.category,
        priority: recurringForm.priority
      };
      if (editingRuleId) {
        await updateDoc(doc(db, 'recurring_rules', editingRuleId), payload);
      } else {
        await addDoc(collection(db, 'recurring_rules'), {
          ...payload,
          creatorId: loggedInUser.id,
          createdAt: new Date().toISOString()
        });
      }
      setRecurringForm(emptyRecurringForm);
      setEditingRuleId(null);
      setShowRecurringForm(false);
    } catch (e) { console.error(e); } finally { setRecurringSaving(false); }
  };

  const openEditRecurring = (rule) => {
    setEditingRuleId(rule.id);
    setRecurringForm({
      title: rule.title,
      frequency: rule.frequency,
      dayOfWeek: rule.dayOfWeek ?? 1,
      weekOfMonth: rule.weekOfMonth ?? 1,
      dayOfWeekForMonthly: rule.dayOfWeekForMonthly ?? 1,
      startTime: rule.startTime || '',
      endTime: rule.endTime || '',
      participantIds: rule.participantIds || [],
      startDate: rule.startDate || getTodayDate(),
      endDate: rule.endDate || '',
      category: rule.category || 'meeting',
      priority: rule.priority || 'normal'
    });
    setShowRecurringForm(true);
  };

  const handleDeleteRecurring = async (ruleId) => {
    try { await deleteDoc(doc(db, 'recurring_rules', ruleId)); } catch (e) { console.error(e); }
  };

  const toggleParticipant = (memberId) => {
    setRecurringForm(prev => ({
      ...prev,
      participantIds: prev.participantIds.includes(memberId) ? prev.participantIds.filter(id => id !== memberId) : [...prev.participantIds, memberId]
    }));
  };

  const isTodayEmpty = dueEvents.length === 0 && dueCustomers.length === 0 && birthdayCustomers.length === 0 && autoSuggested.length === 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} title="刪除行程" message="確定要刪除這筆行程嗎？" />
      <BatchScheduleModal isOpen={showBatchSchedule} onClose={() => setShowBatchSchedule(false)} loggedInUser={loggedInUser} team={team} />

      <PersonalGoalsCard loggedInUser={loggedInUser} records={records} activities={activities} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">今日待辦</h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">{today} · 你的每日提醒與行程清單</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowRecurringManage(true)} className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-lg font-bold text-xs sm:text-sm transition"><Calendar size={14} /> 固定行程</button>
          <button onClick={() => setShowBatchSchedule(true)} className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-lg font-bold text-xs sm:text-sm transition"><ListPlus size={14} /> 批次新增</button>
          <button onClick={() => setShowReminderForm(true)} className="flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-lg font-bold text-xs sm:text-sm transition"><Plus size={14} /> 純提醒</button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition"><Plus size={14} /> 新增行程</button>
        </div>
      </div>

      <Card className="p-3 flex flex-wrap items-center gap-2">
        <SlidersHorizontal size={16} className="text-gray-400 shrink-0" />
        <select className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 outline-none" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">全部分類</option>
          {EVENT_CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select className="p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 outline-none" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">全部優先度</option>
          {Object.entries(PRIORITY_LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        {(filterCategory || filterPriority) && (
          <button onClick={() => { setFilterCategory(''); setFilterPriority(''); }} className="text-xs font-bold text-gray-400 hover:text-gray-600 px-2">清除篩選</button>
        )}
        <div className="ml-auto flex gap-1 bg-gray-100 p-0.5 rounded-lg">
          <button onClick={() => setViewMode('timeline')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${viewMode === 'timeline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>時間軸</button>
          <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>清單</button>
        </div>
      </Card>

      {/* 今日焦點 */}
      <div>
        <h3 className="text-sm font-bold text-gray-500 mb-3">今日焦點</h3>
        {isTodayEmpty && <Card className="p-8 text-center text-gray-400">{(filterCategory || filterPriority) ? '沒有符合篩選條件的待辦事項' : '今天沒有待辦事項，太棒了 🎉'}</Card>}

        <div className="space-y-4">
          {dueEvents.length > 0 && (
            <Card className="p-5">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm"><Clock size={16} className="text-indigo-500" /> 待完成行程與提醒</h4>
              {viewMode === 'timeline' ? (
                <DayTimelineView events={dueEvents} isToday={true} onEventClick={handleCompleteEvent} getEventLabel={getEventLabel} getEventPriority={getEventPriority} />
              ) : (
              <div className="space-y-3">
                {dueEvents.map(e => {
                  const isOverdue = e.date < today && !(e.isReminder && e.endDate && today <= e.endDate);
                  return (
                  <div key={e.id} className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${isOverdue ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="min-w-0 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${getEventColor(e)}`}></span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-gray-900 text-sm truncate">{getEventLabel(e)}{e.customerName && ` · ${e.customerName}`}</p>
                          {e.priority && e.priority !== 'normal' && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getEventPriority(e).color} text-white`}>{getEventPriority(e).label}</span>}
                        </div>
                        <p className="text-xs text-gray-400">{e.date}{e.isReminder && e.endDate ? ` ~ ${e.endDate}` : ''}{e.time && <span className="font-bold text-gray-600"> · {e.time}{e.endTime ? `-${e.endTime}` : ''}</span>}{isOverdue ? '（已過期）' : ''}</p>
                        {e.address && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <MapPin size={10} className="text-gray-400 shrink-0" />
                            <span className="text-[10px] text-gray-400 truncate">{e.address}</span>
                            <a href={getGoogleMapsUrl(e.address)} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[9px] bg-blue-50 text-blue-600 px-1 py-0.5 rounded font-bold">Google</a>
                            <a href={getAppleMapsUrl(e.address)} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[9px] bg-gray-100 text-gray-600 px-1 py-0.5 rounded font-bold">Apple</a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button disabled={busyId === e.id} onClick={() => handleCompleteEvent(e)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-1">
                        {busyId === e.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} 完成
                      </button>
                      {!e.isVirtual && (
                        <>
                          <button onClick={() => openEditEvent(e)} className="text-gray-300 hover:text-indigo-500 p-2"><Edit3 size={15} /></button>
                          <button onClick={() => setDeleteTarget(e.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={15} /></button>
                        </>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
              )}
            </Card>
          )}

          {dueCustomers.length > 0 && (
            <Card className="p-5">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm"><Phone size={16} className="text-amber-500" /> 該追蹤的客戶</h4>
              <div className="space-y-3">
                {dueCustomers.map(c => (
                  <div key={c.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-amber-50 border-amber-100">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{c.name}</p>
                      <p className="text-xs text-gray-400">追蹤日期：{c.nextFollowUpDate}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button disabled={busyId === c.id} onClick={() => openContactModal(c)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-1">
                        {busyId === c.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} 已聯繫
                      </button>
                      <button onClick={() => handleDismissToday(c.id)} title="今天先不處理，明天會再出現" className="text-gray-300 hover:text-gray-500 p-2"><X size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {suggestedIds !== null && (
            <Card className="p-5">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm"><Users size={16} className="text-teal-500" /> 今日推薦聯繫</h4>
                <button onClick={handleGetMoreSuggestions} disabled={refreshingBatch} className="flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 disabled:opacity-50">
                  {refreshingBatch ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} 換一批
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mb-4">每天15人：最近建檔3、既有客戶3、準客戶4、準增員3、久未聯繫2；7天內推薦過或已有排定行程的人不會重複出現；有空時可點「換一批」整批換掉，換掉的人一樣算7天內推薦過</p>
              {autoSuggested.length === 0 && <p className="text-center text-gray-400 text-sm py-4">今天推薦的人都處理完了，點「換一批」可以再多要一些</p>}
              <div className="space-y-3">
                {autoSuggested.map(c => (
                  <div key={c.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border bg-teal-50 border-teal-100">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">{c.name} <span className="text-[10px] text-gray-400 font-normal">· {(c.tags || []).join('、')}</span></p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button disabled={busyId === c.id} onClick={() => openContactModal(c)} className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-1">
                        {busyId === c.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} 標記聯繫
                      </button>
                      <button onClick={() => handleDismissToday(c.id)} title="今天先不處理，明天會再出現" className="text-gray-300 hover:text-gray-500 p-2"><X size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {birthdayCustomers.length > 0 && (
            <Card className="p-5">
              <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-sm"><Cake size={16} className="text-pink-500" /> 近期生日 (7天內)</h4>
              <div className="space-y-2">
                {birthdayCustomers.map(c => (
                  <div key={c.id} className="text-sm text-gray-700 flex justify-between">
                    <span className="font-bold">{c.name}</span>
                    <span className="text-gray-400">{c.birthday}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 即將到來 */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 mb-3">即將到來</h3>
          {viewMode === 'timeline' ? (
            <div className="space-y-4">
              {groupedByDate.map(([date, events]) => (
                <Card key={date} className="p-5">
                  <h4 className="text-xs font-bold text-gray-500 mb-3">{date}（{getWeekdayLabel(date)}）</h4>
                  <DayTimelineView events={events} isToday={false} onEventClick={openEditEvent} getEventLabel={getEventLabel} getEventPriority={getEventPriority} />
                </Card>
              ))}
            </div>
          ) : (
          <div className="space-y-4">
            {groupOrder.map(label => grouped[label] && grouped[label].length > 0 && (
              <div key={label}>
                <h4 className="text-xs font-bold text-gray-400 mb-2">{label} ({grouped[label].length})</h4>
                <div className="space-y-2">
                  {grouped[label].map(e => (
                    <Card key={e.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`w-2 h-2 rounded-full ${getEventColor(e)}`}></span>
                          <p className="font-bold text-gray-900 text-sm">{getEventLabel(e)}</p>
                          {e.customerName && <span className="text-xs text-gray-400">· {e.customerName}</span>}
                          {e.priority && e.priority !== 'normal' && <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${getEventPriority(e).color} text-white`}>{getEventPriority(e).label}</span>}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{e.date}（{getWeekdayLabel(e.date)}）{e.time && <span className="font-bold text-gray-600"> · {e.time}{e.endTime ? `-${e.endTime}` : ''}</span>}{e.note ? ` · ${e.note}` : ''}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button disabled={busyId === e.id} onClick={() => handleCompleteEvent(e)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition disabled:opacity-50 flex items-center gap-1">
                          {busyId === e.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        </button>
                        {!e.isVirtual && (
                          <>
                            <button onClick={() => openEditEvent(e)} className="text-gray-300 hover:text-indigo-500 p-2"><Edit3 size={15} /></button>
                            <button onClick={() => setDeleteTarget(e.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {isTeamScheduleViewer && teamGroupedByDate.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-1.5"><Users size={14} /> 團隊行程總覽（未來14天）</h3>
          <div className="space-y-3">
            {teamGroupedByDate.map(([date, events]) => (
              <Card key={date} className="p-4">
                <h4 className="text-xs font-bold text-gray-500 mb-2">{date}（{getWeekdayLabel(date)}）</h4>
                <div className="space-y-1.5">
                  {events.sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(e => (
                    <div key={e.id} className="flex items-center gap-2 text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getEventColor(e)}`}></span>
                      <span className="font-bold text-gray-700 shrink-0">{e.ownerName}</span>
                      <span className="text-gray-400">{getEventLabel(e)}{e.customerName && ` · ${e.customerName}`}</span>
                      {e.time && <span className="text-gray-400 ml-auto shrink-0">{e.time}{e.endTime ? `-${e.endTime}` : ''}</span>}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {completedRecent.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-400 mb-3">最近完成</h3>
          <div className="space-y-2">
            {completedRecent.map(e => (
              <div key={e.id} className="text-xs text-gray-400 flex justify-between px-2">
                <span>{getEventLabel(e)}{e.customerName && ` · ${e.customerName}`}</span>
                <span>{e.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 新增行程 */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">新增行程</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">類型</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <optgroup label="業務活動">
                    {Object.entries(ACTIVITY_WEIGHTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </optgroup>
                  <optgroup label="增員活動">
                    {Object.entries(RECRUIT_ACTIVITY_WEIGHTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </optgroup>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">關聯客戶（選填）</label>
                <CustomerPicker customers={customers} value={form.customerId} onChange={(id) => setForm({ ...form, customerId: id })} onCreateNew={handleCreateCustomerInline} />
              </div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">日期</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-gray-500 block mb-1">開始時間</label><TimeSelect value={form.time} onChange={(t) => setForm({ ...form, time: t })} /></div>
                <div><label className="text-xs font-bold text-gray-500 block mb-1">結束時間</label><TimeSelect value={form.endTime} onChange={(t) => setForm({ ...form, endTime: t })} /></div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">優先度</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                  {Object.entries(PRIORITY_LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">地點（選填，可開啟地圖）</label>
                <input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                {(() => { const c = customers.find(x => x.id === form.customerId); return c && c.address && form.address !== c.address ? (
                  <button type="button" onClick={() => setForm({ ...form, address: c.address })} className="text-[10px] text-indigo-600 hover:underline mt-1">帶入 {c.name} 的地址</button>
                ) : null; })()}
              </div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">備註</label><textarea className="w-full p-2 border border-gray-200 rounded-lg h-20 resize-none" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
              <button onClick={handleAddSchedule} disabled={!form.date || saving} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={16} /> : '新增'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 新增純提醒 */}
      {showReminderForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">新增純提醒</h3>
              <button onClick={() => setShowReminderForm(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <p className="text-xs text-gray-400 mb-4">純提醒不會計入 MEA 分數，也不會寫入客戶軌跡，單純提醒自己完成事項。</p>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-gray-500 block mb-1">提醒內容</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" placeholder="例如：交報表給總公司" value={reminderTitle} onChange={e => setReminderTitle(e.target.value)} /></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">日期</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={reminderDate} onChange={e => setReminderDate(e.target.value)} /></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">時間（選填）</label><TimeSelect value={reminderTime} onChange={setReminderTime} /></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">結束日期（選填，多天的事情例如出差可以填，會整段期間都提醒）</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={reminderEndDate} onChange={e => setReminderEndDate(e.target.value)} /></div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">分類</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg" value={reminderCategory} onChange={e => setReminderCategory(e.target.value)}>
                  {Object.entries(REMINDER_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">優先度</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg" value={reminderPriority} onChange={e => setReminderPriority(e.target.value)}>
                  {Object.entries(PRIORITY_LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">套用給哪些人（每個人各自獨立在自己的今日待辦中看到）</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto border border-gray-100 rounded-lg p-2">
                  {(team || []).map(m => (
                    <label key={m.id} className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reminderParticipantIds.includes(m.id)}
                        onChange={() => setReminderParticipantIds(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id])}
                        className="w-3.5 h-3.5"
                      /> {m.name}
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={handleAddReminder} disabled={!reminderTitle || reminderParticipantIds.length === 0 || reminderSaving} className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold hover:bg-gray-900 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                {reminderSaving ? <Loader2 className="animate-spin" size={16} /> : '新增提醒'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 編輯行程/提醒 */}
      {editingEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">編輯{editingEvent.isReminder ? '提醒' : '行程'}</h3>
              <button onClick={() => setEditingEvent(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {editingEvent.isReminder ? (
                <>
                  <div><label className="text-xs font-bold text-gray-500 block mb-1">提醒內容</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={editingEvent.title} onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })} /></div>
                  <div><label className="text-xs font-bold text-gray-500 block mb-1">日期</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={editingEvent.date} onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })} /></div>
                  <div><label className="text-xs font-bold text-gray-500 block mb-1">時間（選填）</label><TimeSelect value={editingEvent.time || ''} onChange={(t) => setEditingEvent({ ...editingEvent, time: t })} /></div>
                  <div><label className="text-xs font-bold text-gray-500 block mb-1">結束日期（選填，多天的事情可以填）</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={editingEvent.endDate || ''} onChange={e => setEditingEvent({ ...editingEvent, endDate: e.target.value })} /></div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">分類</label>
                    <select className="w-full p-2 border border-gray-200 rounded-lg" value={editingEvent.category} onChange={e => setEditingEvent({ ...editingEvent, category: e.target.value })}>
                      {Object.entries(REMINDER_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">類型</label>
                    <select className="w-full p-2 border border-gray-200 rounded-lg" value={editingEvent.type} onChange={e => setEditingEvent({ ...editingEvent, type: e.target.value })}>
                      <optgroup label="業務活動">{Object.entries(ACTIVITY_WEIGHTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</optgroup>
                      <optgroup label="增員活動">{Object.entries(RECRUIT_ACTIVITY_WEIGHTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</optgroup>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">關聯客戶（選填）</label>
                    <CustomerPicker customers={customers} value={editingEvent.customerId} onChange={(id) => setEditingEvent({ ...editingEvent, customerId: id })} onCreateNew={handleCreateCustomerInline} />
                  </div>
                  <div><label className="text-xs font-bold text-gray-500 block mb-1">日期</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={editingEvent.date} onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-gray-500 block mb-1">開始時間</label><TimeSelect value={editingEvent.time || ''} onChange={(t) => setEditingEvent({ ...editingEvent, time: t })} /></div>
                    <div><label className="text-xs font-bold text-gray-500 block mb-1">結束時間</label><TimeSelect value={editingEvent.endTime || ''} onChange={(t) => setEditingEvent({ ...editingEvent, endTime: t })} /></div>
                  </div>
                  <div><label className="text-xs font-bold text-gray-500 block mb-1">地點（選填）</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={editingEvent.address || ''} onChange={e => setEditingEvent({ ...editingEvent, address: e.target.value })} /></div>
                  <div><label className="text-xs font-bold text-gray-500 block mb-1">備註</label><textarea className="w-full p-2 border border-gray-200 rounded-lg h-16 resize-none" value={editingEvent.note || ''} onChange={e => setEditingEvent({ ...editingEvent, note: e.target.value })} /></div>
                </>
              )}
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">優先度</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg" value={editingEvent.priority || 'normal'} onChange={e => setEditingEvent({ ...editingEvent, priority: e.target.value })}>
                  {Object.entries(PRIORITY_LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <button onClick={handleSaveEditEvent} disabled={saving} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={16} /> : '儲存變更'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 完成行程 (詢問下次追蹤日期) */}
      {completingEvent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">確認完成</h3>
              <button onClick={() => setCompletingEvent(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-600 mb-4">{getEventLabel(completingEvent)}{completingEvent.customerName && ` · ${completingEvent.customerName}`}</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">需要設定下次追蹤日期嗎？（選填）</label>
                <input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={followUpInput} onChange={e => setFollowUpInput(e.target.value)} />
              </div>
              <button onClick={handleConfirmCompleteEvent} disabled={busyId === completingEvent.id} className="w-full bg-emerald-500 text-white py-3 rounded-lg font-bold hover:bg-emerald-600 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                {busyId === completingEvent.id ? <Loader2 className="animate-spin" size={16} /> : '確認完成'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 標記聯繫客戶 (選擇 MEA 類別) */}
      {completingContact && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">標記已聯繫：{completingContact.name}</h3>
              <button onClick={() => setCompletingContact(null)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">這次聯繫要算哪個 MEA 類別？</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg" value={contactType} onChange={e => setContactType(e.target.value)}>
                  <optgroup label="業務活動">{Object.entries(ACTIVITY_WEIGHTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</optgroup>
                  <optgroup label="增員活動">{Object.entries(RECRUIT_ACTIVITY_WEIGHTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</optgroup>
                </select>
              </div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">備註（選填）</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={contactNote} onChange={e => setContactNote(e.target.value)} /></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">下次追蹤日期（選填）</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={contactFollowUp} onChange={e => setContactFollowUp(e.target.value)} /></div>
              <button onClick={handleConfirmContact} disabled={busyId === completingContact.id} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                {busyId === completingContact.id ? <Loader2 className="animate-spin" size={16} /> : '確認'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 固定行程管理 */}
      {showRecurringManage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">固定行程</h3>
              <button onClick={() => setShowRecurringManage(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <button onClick={() => { setEditingRuleId(null); setRecurringForm(emptyRecurringForm); setShowRecurringForm(true); }} className="w-full mb-4 flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 py-2.5 rounded-lg font-bold text-sm transition"><Plus size={16} /> 新增固定行程</button>
            <div className="space-y-2">
              {myRecurringRules.length === 0 && <p className="text-center text-gray-400 text-sm py-6">還沒有你建立的固定行程</p>}
              {myRecurringRules.map(rule => (
                <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{rule.title}</p>
                    <p className="text-xs text-gray-400">
                      {rule.frequency === 'weekly' ? `每週${WEEKDAY_OPTIONS.find(w => w.value === rule.dayOfWeek)?.label || ''}` : `每月${WEEK_OF_MONTH_OPTIONS.find(w => w.value === rule.weekOfMonth)?.label || ''}${WEEKDAY_OPTIONS.find(w => w.value === rule.dayOfWeekForMonthly)?.label || ''}`}
                      {rule.startTime ? ` ${rule.startTime}${rule.endTime ? '-' + rule.endTime : ''}` : ''} · 參與 {rule.participantIds.length} 人
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEditRecurring(rule)} className="text-gray-300 hover:text-indigo-500 p-2"><Edit3 size={16} /></button>
                    <button onClick={() => handleDeleteRecurring(rule.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 新增/編輯固定行程 */}
      {showRecurringForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{editingRuleId ? '編輯固定行程' : '新增固定行程'}</h3>
              <button onClick={() => { setShowRecurringForm(false); setEditingRuleId(null); }} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-gray-500 block mb-1">名稱</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" placeholder="例如：區運作" value={recurringForm.title} onChange={e => setRecurringForm({ ...recurringForm, title: e.target.value })} /></div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setRecurringForm({ ...recurringForm, frequency: 'weekly' })} className={`flex-1 py-2 rounded-lg text-sm font-bold ${recurringForm.frequency === 'weekly' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>每週</button>
                <button type="button" onClick={() => setRecurringForm({ ...recurringForm, frequency: 'monthly' })} className={`flex-1 py-2 rounded-lg text-sm font-bold ${recurringForm.frequency === 'monthly' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>每月</button>
              </div>
              {recurringForm.frequency === 'weekly' ? (
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">星期幾</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg" value={recurringForm.dayOfWeek} onChange={e => setRecurringForm({ ...recurringForm, dayOfWeek: Number(e.target.value) })}>
                    {WEEKDAY_OPTIONS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                  </select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">第幾個</label>
                    <select className="w-full p-2 border border-gray-200 rounded-lg" value={recurringForm.weekOfMonth} onChange={e => setRecurringForm({ ...recurringForm, weekOfMonth: Number(e.target.value) })}>
                      {WEEK_OF_MONTH_OPTIONS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 block mb-1">星期幾</label>
                    <select className="w-full p-2 border border-gray-200 rounded-lg" value={recurringForm.dayOfWeekForMonthly} onChange={e => setRecurringForm({ ...recurringForm, dayOfWeekForMonthly: Number(e.target.value) })}>
                      {WEEKDAY_OPTIONS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                    </select>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-gray-500 block mb-1">開始時間</label><TimeSelect value={recurringForm.startTime} onChange={(t) => setRecurringForm({ ...recurringForm, startTime: t })} /></div>
                <div><label className="text-xs font-bold text-gray-500 block mb-1">結束時間</label><TimeSelect value={recurringForm.endTime} onChange={(t) => setRecurringForm({ ...recurringForm, endTime: t })} /></div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">參與人員</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto border border-gray-100 rounded-lg p-2">
                  {(team || []).map(m => (
                    <label key={m.id} className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                      <input type="checkbox" checked={recurringForm.participantIds.includes(m.id)} onChange={() => toggleParticipant(m.id)} className="w-3.5 h-3.5" />
                      {m.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">分類</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg" value={recurringForm.category} onChange={e => setRecurringForm({ ...recurringForm, category: e.target.value })}>
                    {Object.entries(REMINDER_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">優先度</label>
                  <select className="w-full p-2 border border-gray-200 rounded-lg" value={recurringForm.priority} onChange={e => setRecurringForm({ ...recurringForm, priority: e.target.value })}>
                    {Object.entries(PRIORITY_LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-gray-500 block mb-1">開始日期</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={recurringForm.startDate} onChange={e => setRecurringForm({ ...recurringForm, startDate: e.target.value })} /></div>
                <div><label className="text-xs font-bold text-gray-500 block mb-1">結束日期（選填）</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={recurringForm.endDate} onChange={e => setRecurringForm({ ...recurringForm, endDate: e.target.value })} /></div>
              </div>
              <p className="text-[10px] text-gray-400">固定行程不計入 MEA 分數，純粹提醒/出席性質。每個被選到的人會各自在自己的今日待辦中看到這筆，各自獨立標記完成。</p>
              <button onClick={handleSaveRecurring} disabled={!recurringForm.title || recurringForm.participantIds.length === 0 || recurringSaving} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                {recurringSaving ? <Loader2 className="animate-spin" size={16} /> : (editingRuleId ? '儲存變更' : '新增')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// --- Competition Settings Page (競賽設定：目標值可在畫面上調整，不用改程式碼) ---
const SettingsPage = ({ rankTargets, doubleAwardTargets }) => {
  const [season, setSeason] = useState('H2');
  const [localH1, setLocalH1] = useState(() => JSON.parse(JSON.stringify(rankTargets.H1)));
  const [localH2, setLocalH2] = useState(() => JSON.parse(JSON.stringify(rankTargets.H2)));
  const [localDouble, setLocalDouble] = useState(() => JSON.parse(JSON.stringify(doubleAwardTargets)));
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  const handleExportBackup = async () => {
    setExporting(true);
    setExportMsg('');
    try {
      const collectionsToBackup = ['case_record', 'user', 'temp_user', 'activity_record', 'settings', 'customers', 'schedule_events', 'recurring_rules', 'customer_relationships', 'personal_goals'];
      const backup = {};
      for (const colName of collectionsToBackup) {
        const snap = await getDocs(collection(db, colName));
        backup[colName] = snap.docs.map(d => {
          const data = d.data();
          // Firestore Timestamp 轉成一般文字，避免備份檔案格式難以閱讀
          const cleaned = {};
          Object.entries(data).forEach(([k, v]) => {
            cleaned[k] = (v && typeof v.toDate === 'function') ? v.toDate().toISOString() : v;
          });
          return { id: d.id, ...cleaned };
        });
      }
      backup._exportedAt = new Date().toISOString();

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `極豐通訊處_資料備份_${getTodayDate()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportMsg('備份檔案已下載，請妥善保存');
    } catch (e) {
      console.error(e);
      setExportMsg('匯出失敗，請再試一次');
    } finally {
      setExporting(false);
    }
  };

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

      <Card className="p-6 border-t-4 border-t-gray-800">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg"><Download size={20} className="text-gray-700"/></div>
            <div>
              <h3 className="font-bold text-gray-800">資料備份</h3>
              <p className="text-xs text-gray-400 mt-0.5">下載一份完整資料備份檔（業績、組織、增員、活動量、競賽設定），建議定期匯出保存在自己的電腦裡</p>
            </div>
          </div>
          <button onClick={handleExportBackup} disabled={exporting} className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-bold transition flex items-center gap-2 disabled:opacity-50 whitespace-nowrap">
            {exporting ? <Loader2 size={16} className="animate-spin"/> : <><Download size={16}/> 匯出全部資料</>}
          </button>
        </div>
        {exportMsg && <p className="text-xs font-bold text-emerald-600 mt-3">{exportMsg}</p>}
      </Card>

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


// --- 全域搜尋 (客戶／業績紀錄／行程與提醒 一次查) ---
const GlobalSearchModal = ({ isOpen, onClose, customers, records, scheduleEvents }) => {
  const [query, setQuery] = useState('');

  useEffect(() => { if (isOpen) setQuery(''); }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { customers: [], records: [], events: [] };
    return {
      customers: customers.filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.phone || '').includes(q) ||
        (c.lineId || '').toLowerCase().includes(q) ||
        (c.igHandle || '').toLowerCase().includes(q)
      ).slice(0, 10),
      records: records.filter(r =>
        (r.insuredName || '').toLowerCase().includes(q) ||
        (r.policyNumber || '').toLowerCase().includes(q) ||
        (r.product || '').toLowerCase().includes(q)
      ).slice(0, 10),
      events: scheduleEvents.filter(e =>
        (e.isReminder ? e.title : (ALL_ACTIVITY_WEIGHTS[e.type]?.label || e.type) || '').toLowerCase().includes(q) ||
        (e.customerName || '').toLowerCase().includes(q) ||
        (e.note || '').toLowerCase().includes(q)
      ).slice(0, 10)
    };
  }, [query, customers, records, scheduleEvents]);

  const hasAny = results.customers.length > 0 || results.records.length > 0 || results.events.length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center bg-black/50 backdrop-blur-sm p-4 pt-20">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-up max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <SlidersHorizontal size={0} className="hidden" />
          <input
            autoFocus
            type="text"
            placeholder="搜尋客戶、保單、行程..."
            className="flex-1 p-2 outline-none text-sm"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full"><X size={18} /></button>
        </div>
        <div className="overflow-y-auto p-4 space-y-4">
          {!query.trim() && <p className="text-center text-gray-400 text-sm py-8">輸入姓名、電話、保單號碼、商品名稱等關鍵字搜尋</p>}
          {query.trim() && !hasAny && <p className="text-center text-gray-400 text-sm py-8">沒有找到符合的資料</p>}

          {results.customers.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">客戶 ({results.customers.length})</p>
              <div className="space-y-1.5">
                {results.customers.map(c => (
                  <div key={c.id} className="p-2.5 bg-gray-50 rounded-lg text-sm flex justify-between">
                    <span className="font-bold text-gray-800">{c.name}</span>
                    <span className="text-gray-400 text-xs">{c.phone || (c.tags || []).join('、')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.records.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">業績紀錄 ({results.records.length})</p>
              <div className="space-y-1.5">
                {results.records.map(r => (
                  <div key={r.id} className="p-2.5 bg-gray-50 rounded-lg text-sm flex justify-between">
                    <span className="text-gray-800">{r.insuredName} · {r.product}</span>
                    <span className="text-indigo-600 font-mono font-bold text-xs">{formatMoney(r.premium)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.events.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">行程與提醒 ({results.events.length})</p>
              <div className="space-y-1.5">
                {results.events.map(e => (
                  <div key={e.id} className="p-2.5 bg-gray-50 rounded-lg text-sm flex justify-between">
                    <span className="text-gray-800">{e.isReminder ? e.title : (ALL_ACTIVITY_WEIGHTS[e.type]?.label || e.type)}{e.customerName && ` · ${e.customerName}`}</span>
                    <span className="text-gray-400 text-xs">{e.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- Loading Screen (顯示於系統連線資料庫期間) ---
// --- 恭賀彈跳視窗：登入時如果有人(含自己)報件，跳出一張海報式的恭賀畫面 ---
const CelebrationPosterModal = ({ isOpen, onClose, celebrations }) => {
  if (!isOpen || celebrations.length === 0) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-amber-400/30 animate-scale-up relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(251,191,36,0.18), transparent 65%)' }}></div>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white z-10"><X size={20} /></button>
        <div className="relative">
          <Trophy className="mx-auto text-amber-400 mb-2" size={40} />
          <h3 className="text-amber-300 font-bold text-xl mb-1">恭喜達成！</h3>
          <p className="text-gray-400 text-xs mb-5">又有夥伴完成保單囉</p>
          <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
            {celebrations.map((c, i) => (
              <div key={i} className="bg-white/5 border border-amber-400/20 rounded-xl py-2.5 px-4">
                <p className="text-white font-bold text-sm">🎉 {c.agentName}</p>
                {c.product && <p className="text-amber-200/70 text-xs mt-0.5">{c.product}</p>}
              </div>
            ))}
          </div>
          <button onClick={onClose} className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-6 py-2.5 rounded-lg text-sm transition">太棒了！</button>
        </div>
      </div>
    </div>
  );
};

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
  const [activeTab, setActiveTab] = useState('todo');
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [season, setSeason] = useState('H2'); 
  const [team, setTeam] = useState([]);
  const [records, setRecords] = useState([]);
  const [recruits, setRecruits] = useState([]);
  const [activities, setActivities] = useState([]); 
  const [user, setUser] = useState(null);
  const [teamLoaded, setTeamLoaded] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [newCelebrations, setNewCelebrations] = useState([]);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [rankTargets, setRankTargets] = useState({ H1: DEFAULT_RANK_TARGETS_H1, H2: DEFAULT_RANK_TARGETS_H2 });
  const [doubleAwardTargets, setDoubleAwardTargets] = useState(DEFAULT_DOUBLE_AWARD_H2);
  const [customers, setCustomers] = useState([]);
  const [relationships, setRelationships] = useState([]);
  const [customersLoaded, setCustomersLoaded] = useState(false);
  const [scheduleEvents, setScheduleEvents] = useState([]);
  const [recurringRules, setRecurringRules] = useState([]);
  const [teamScheduleEvents, setTeamScheduleEvents] = useState([]);

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

  // 固定行程規則：全體共用一份 (參與人員各自從裡面篩出跟自己有關的場次)
  useEffect(() => {
    if (!user) return;
    const unsubRecurring = onSnapshot(collection(db, 'recurring_rules'), (snap) => {
      setRecurringRules(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubRecurring();
  }, [user]);

  // 主管視角 (第一階段，先只開放給吳政翰)：讀取全體同仁的行程，用來顯示「團隊行程總覽」
  const isTeamScheduleViewer = loggedInUser?.name === '吳政翰';
  useEffect(() => {
    if (!user || !isTeamScheduleViewer) { setTeamScheduleEvents([]); return; }
    const unsubTeamSchedule = onSnapshot(collection(db, 'schedule_events'), (snap) => {
      setTeamScheduleEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubTeamSchedule();
  }, [user, isTeamScheduleViewer]);

  // 客戶資料與行程：只讀取「目前登入者自己」擁有的資料，做到隱私區隔
  useEffect(() => {
    if (!loggedInUser) { setCustomers([]); setScheduleEvents([]); setCustomersLoaded(false); setRelationships([]); return; }

    const customersQuery = query(collection(db, 'customers'), where('ownerId', '==', loggedInUser.id));
    const unsubCustomers = onSnapshot(customersQuery, (snap) => {
      const list = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          tags: Array.isArray(data.tags) ? data.tags : (data.tag ? [data.tag] : [])
        };
      });
      list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setCustomers(list);
      setCustomersLoaded(true);
    });

    const scheduleQuery = query(collection(db, 'schedule_events'), where('ownerId', '==', loggedInUser.id));
    const unsubSchedule = onSnapshot(scheduleQuery, (snap) => {
      setScheduleEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const relationshipsQuery = query(collection(db, 'customer_relationships'), where('ownerId', '==', loggedInUser.id));
    const unsubRelationships = onSnapshot(relationshipsQuery, (snap) => {
      setRelationships(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubCustomers(); unsubSchedule(); unsubRelationships(); };
  }, [loggedInUser?.id]);

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
            date: dateStr,
            status: data.status || '已發單',
            issuedDate: data.issuedDate || '',
            createdAt: data.created_at || ''
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
          rememberToken: data.rememberToken || null,
          lastSeenCelebration: data.lastSeenCelebration || ''
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

  // 恭賀彈跳視窗：登入時檢查「上次看過之後」有沒有新的報件 (含自己)，有的話一次列出來
  useEffect(() => {
    if (!loggedInUser || enrichedRecords.length === 0) return;
    const lastSeen = loggedInUser.lastSeenCelebration || '2000-01-01T00:00:00.000Z';
    const newOnes = enrichedRecords.filter(r => r.createdAt && r.createdAt > lastSeen);
    if (newOnes.length > 0) {
      setNewCelebrations(newOnes.map(r => ({ agentName: r.agentName, product: r.product })));
      setShowCelebration(true);
    }
    // eslint-disable-next-line
  }, [loggedInUser?.id, enrichedRecords.length]);

  const handleDismissCelebration = async () => {
    setShowCelebration(false);
    if (loggedInUser) {
      const now = new Date().toISOString();
      try { await updateDoc(doc(db, 'user', loggedInUser.id), { lastSeenCelebration: now }); } catch (e) { console.error(e); }
      setLoggedInUser(prev => prev ? { ...prev, lastSeenCelebration: now } : prev);
    }
  };

  const todoCount = useMemo(() => computeDueTodayCount(loggedInUser, customers, scheduleEvents, recurringRules), [loggedInUser, customers, scheduleEvents, recurringRules]);

  const navItems = [
    { id: 'todo', label: '今日待辦', icon: CheckSquare, badge: todoCount },
    { id: 'customers', label: '客戶管理', icon: Phone },
    { id: 'watchlist', label: '關注名單', icon: Star },
    { id: 'bingo', label: '區運作', icon: Trophy },
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
                    className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === item.id ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <ItemIcon size={16} />
                    {item.label}
                    {!!item.badge && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{item.badge > 99 ? '99+' : item.badge}</span>
                    )}
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
                {navItems.map(item => <option key={item.id} value={item.id}>{item.label}{item.badge ? ` (${item.badge})` : ''}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
              <button
                onClick={() => setShowGlobalSearch(true)}
                title="全域搜尋"
                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                <Search size={18} />
              </button>
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

      <GlobalSearchModal isOpen={showGlobalSearch} onClose={() => setShowGlobalSearch(false)} customers={customers} records={enrichedRecords} scheduleEvents={scheduleEvents} />
      <CelebrationPosterModal isOpen={showCelebration} onClose={handleDismissCelebration} celebrations={newCelebrations} />

      <main className="max-w-7xl mx-auto px-6 pt-8">
        {activeTab === 'todo' && <TodoSchedulePage loggedInUser={loggedInUser} customers={customers} scheduleEvents={scheduleEvents} team={team} recurringRules={recurringRules} records={enrichedRecords} activities={activities} teamScheduleEvents={teamScheduleEvents} isTeamScheduleViewer={isTeamScheduleViewer} />}
        {activeTab === 'customers' && <CustomerCRM loggedInUser={loggedInUser} records={enrichedRecords} customers={customers} customersLoaded={customersLoaded} relationships={relationships} />}
        {activeTab === 'watchlist' && <WatchlistPage loggedInUser={loggedInUser} customers={customers} />}
        {activeTab === 'bingo' && <BingoChallengePage loggedInUser={loggedInUser} team={team} records={enrichedRecords} activities={activities} recruits={recruits} isManagerViewer={isTeamScheduleViewer} />}
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