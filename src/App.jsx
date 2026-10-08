import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  ChevronDown,
  DollarSign,
  MessageCircle,
  Layers,
  ShieldCheck,
  ClipboardCheck,
  ClipboardList,
  Award,
  CalendarPlus,
  Bell,
  Repeat,
  List as ListIcon,
  LayoutGrid,
  MoreVertical,
  Copy,
  GripVertical,
  Megaphone,
  Pin,
  Heart,
  Image as ImageIcon
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
  Line,
  AreaChart,
  Area,
  ComposedChart
} from 'recharts';

// --- Firebase Imports ---
import ProductCatalog from './ProductCatalog.jsx';
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
  arrayUnion,
  arrayRemove
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
const getInstagramUrl = (handle) => /^https?:\/\//i.test(handle) ? handle : `https://instagram.com/${encodeURIComponent(handle.replace(/^@/, ''))}`;
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

// 日期/時間文字解析共用工具（批次新增用）：日期可寫單日(9/11)或範圍(9/11-9/13)，時間可寫單一(14:00)或範圍(14:00-15:30)
const padTwo = (n) => String(n).padStart(2, '0');
const parseDateToken = (tok, defaultYear) => {
  let m = String(tok || '').match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${padTwo(m[2])}-${padTwo(m[3])}`;
  m = String(tok || '').match(/^(\d{1,2})\/(\d{1,2})$/);
  if (m) return `${defaultYear}-${padTwo(m[1])}-${padTwo(m[2])}`;
  return '';
};
const extractDateTime = (parts, defaultYear) => {
  let idx = 0, date = '', endDate = '', time = '', endTime = '';
  const tok = parts[0] || '';
  const range = tok.match(/^(\d{1,2}\/\d{1,2})[-~](\d{1,2}\/\d{1,2})$/) || tok.match(/^(\d{4}-\d{1,2}-\d{1,2})~(\d{4}-\d{1,2}-\d{1,2})$/);
  if (range) {
    date = parseDateToken(range[1], defaultYear);
    endDate = parseDateToken(range[2], defaultYear);
    idx = 1;
  } else {
    const d = parseDateToken(tok, defaultYear);
    if (d) { date = d; idx = 1; }
  }
  const tm = (parts[idx] || '').match(/^(\d{1,2}):(\d{2})(?:[-~](\d{1,2}):(\d{2}))?$/);
  if (tm) {
    time = `${padTwo(tm[1])}:${tm[2]}`;
    if (tm[3]) endTime = `${padTwo(tm[3])}:${tm[4]}`;
    idx++;
  }
  if (endDate && date && endDate < date) endDate = '';
  return { date, endDate, time, endTime, idx };
};

// 批次新增提醒：每行「日期(可範圍) 時間(選填，可範圍) 標題」
const parseBatchScheduleText = (text, defaultYear) => {
  return text.split('\n').map(l => l.trim()).filter(Boolean).map((line, i) => {
    const parts = line.split(/\s+/).filter(Boolean);
    const dt = extractDateTime(parts, defaultYear);
    return { id: Date.now() + i + Math.random(), date: dt.date, endDate: dt.endDate, time: dt.time, endTime: dt.endTime, title: parts.slice(dt.idx).join(' ') };
  });
};

// 批次新增「客戶行程」：每行「日期(可範圍) 時間(選填，可範圍) 類型 姓名 備註(選填)」
// 規則：沒填的欄位給空白/預設值(類型預設約訪)；備註可填可不填；姓名沒對應到既有客戶的話，匯入時會自動新增客戶
const parseActivityBatchText = (text, defaultYear) => {
  const typeByLabel = {};
  Object.entries(ACTIVITY_WEIGHTS).forEach(([key, v]) => { typeByLabel[v.label] = key; });
  Object.entries(RECRUIT_ACTIVITY_WEIGHTS).forEach(([key, v]) => { typeByLabel[v.label] = key; });
  return text.split('\n').map(l => l.trim()).filter(Boolean).map((line, i) => {
    const parts = line.split(/\s+/).filter(Boolean);
    const dt = extractDateTime(parts, defaultYear);
    let idx = dt.idx;
    let type = 'appointment';
    let typeLabel = ALL_ACTIVITY_WEIGHTS['appointment'].label;
    if (parts[idx] && typeByLabel[parts[idx]]) { type = typeByLabel[parts[idx]]; typeLabel = parts[idx]; idx++; }
    const name = parts[idx] || '';
    if (name) idx++;
    const note = parts.slice(idx).join(' ');
    return { id: Date.now() + i + Math.random(), date: dt.date, endDate: dt.endDate, time: dt.time, endTime: dt.endTime, type, typeLabel, name, note };
  });
};

// 顯示用：單日「日期 開始-結束」，跨日「開始日 時間 ~ 結束日 時間」
const formatEventWhen = (e) => {
  const multi = e.endDate && e.endDate !== e.date;
  if (multi) return `${e.date}${e.time ? ' ' + e.time : ''} ~ ${e.endDate}${e.endTime ? ' ' + e.endTime : ''}`;
  return `${e.date}${e.time ? ' ' + e.time + (e.endTime ? '-' + e.endTime : '') : ''}`;
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
  <div onClick={onClick} className={`bg-white rounded-3xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_30px_rgba(0,0,0,0.04)] border border-black/[0.05] ${className}`}>
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

// --- 手機版：業績儀表板（預設只看自己；右上角切換「組」「區」） ---
const MobileDashboardView = ({ team, records, season, setSeason, activeTargets, currentMonths, currentStart, viewMonth, setViewMonth, loggedInUser, onSearch }) => {
  const [scope, setScope] = useState('self');
  const [showScope, setShowScope] = useState(false);
  const [progTab, setProgTab] = useState('fyp');
  const [trendMetric, setTrendMetric] = useState('weighted');
  const [showMembers, setShowMembers] = useState(false);

  const me = loggedInUser ? team.find(t => String(t.id) === String(loggedInUser.id)) : null;
  const directs = me ? team.filter(t => t.parentId && String(t.parentId) === String(me.id)) : [];
  const isRoot = loggedInUser?.name === '吳政翰';
  const options = [{ key: 'self', label: '個人' }];
  if (directs.length > 0) options.push({ key: 'group', label: `${me.name} 組` });
  if (isRoot) options.push({ key: 'district', label: '政翰區' });
  const curOpt = options.find(o => o.key === scope) || options[0];

  const roleOf = (m) => (season === 'H2' && H2_ROLE_MAPPING[m.name]) ? H2_ROLE_MAPPING[m.name] : m.role;
  const targetOf = (m) => activeTargets[roleOf(m)] || activeTargets['業務代表'];

  const members = useMemo(() => {
    if (!me) return [];
    if (curOpt.key === 'group') return [me, ...directs];
    if (curOpt.key === 'district') return getDistrictMembers(team, '吳政翰');
    return [me];
  }, [curOpt.key, team, me]);

  const d = useMemo(() => {
    const ids = new Set(members.map(m => String(m.id)));
    const cases = { m: 0, a: 0 };
    let weighted = 0, premium = 0, mWeighted = 0, mPremium = 0, mFYC = 0, ah = 0, rp = 0, sp = 0;
    const per = {};
    members.forEach(m => { per[String(m.id)] = { m, w: 0, mw: 0, p: 0 }; });
    const trendMap = {};
    currentMonths.forEach(mo => { if (mo.value <= viewMonth) trendMap[mo.value] = { month: mo.value.slice(5) + '月', weighted: 0, premium: 0, cases: 0 }; });
    records.forEach(r => {
      if (!r.agentId || !ids.has(String(r.agentId)) || !r.date) return;
      const rm = r.date.substring(0, 7);
      const w = r.weighted || 0, p = r.premium || 0;
      if (trendMap[rm]) { trendMap[rm].weighted += w; trendMap[rm].premium += p; trendMap[rm].cases += 1; }
      if (rm < currentStart || rm > viewMonth) return;
      weighted += w; premium += p; cases.a += 1;
      const pr = per[String(r.agentId)]; if (pr) { pr.w += w; pr.p += p; }
      if (rm === viewMonth) {
        cases.m += 1; mWeighted += w; mPremium += p;
        mFYC += p * (PRODUCT_MAPPING[r.typeCode]?.commissionRate || 0);
        if (r.typeCode === 'one_off') sp += p; else if (r.isAH) ah += p; else rp += p;
        if (pr) pr.mw += w;
      }
    });
    // 目標：個人=自己職級；組=組長職級（沿用原本組績算法）；區=成員個別目標加總
    const sum = (f) => members.reduce((s, m) => s + (f(targetOf(m)) || 0), 0);
    let tgt;
    if (curOpt.key === 'district') {
      tgt = { peak: sum(t => t.peak.total), summit: sum(t => t.summit.total), peakAct: sum(t => t.peak.actualPremium), summitAct: sum(t => t.summit.actualPremium) };
    } else {
      const t = targetOf(me || members[0] || {}) || { peak: {}, summit: {} };
      tgt = { peak: t.peak?.total || 0, summit: t.summit?.total || 0, peakAct: t.peak?.actualPremium || 0, summitAct: t.summit?.actualPremium || 0 };
    }
    const trend = Object.values(trendMap).slice(-6).map(x => ({ ...x, target: Math.round(tgt.peak / Math.max(1, currentMonths.length)) }));
    return { weighted, premium, cases, mWeighted, mPremium, mFYC, ah, rp, sp, per: Object.values(per), tgt, trend };
  }, [members, records, currentMonths, currentStart, viewMonth, activeTargets, season, curOpt.key]);

  const hasAct = season === 'H2' && d.tgt.peakAct > 0;
  const pctPeak = d.tgt.peak ? Math.min(100, (d.weighted / d.tgt.peak) * 100) : 0;
  const pctSummit = d.tgt.summit ? Math.min(100, (d.weighted / d.tgt.summit) * 100) : 0;
  const idx = currentMonths.findIndex(m => m.value === viewMonth);
  const shift = (n) => { const t = currentMonths[idx + n]; if (t) setViewMonth(t.value); };
  const wan = (n) => n >= 10000 ? (n / 10000).toFixed(n >= 100000 ? 0 : 1) + '萬' : String(Math.round(n));
  const glass = 'rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-xl';

  // 達成進度（甜甜圈）
  const prog = progTab === 'act' && hasAct
    ? { got: d.premium, goal: d.tgt.peakAct, label: '實收保費' }
    : { got: d.weighted, goal: d.tgt.peak, label: '加權保費 FYP' };
  const R = 52, C = 2 * Math.PI * R;
  const progPct = prog.goal ? Math.min(100, (prog.got / prog.goal) * 100) : 0;

  const prodTotal = d.ah + d.rp + d.sp;
  const prods = [
    { l: 'AH 健康險', v: d.ah, c: 'bg-emerald-400' },
    { l: 'RP 期繳', v: d.rp, c: 'bg-blue-400' },
    { l: 'SP 躉繳', v: d.sp, c: 'bg-amber-400' },
  ];
  const trendCfg = { weighted: { label: 'FYP', color: '#60a5fa' }, premium: { label: '實收', color: '#34d399' }, cases: { label: '件數', color: '#fbbf24' } };

  return (
    <div className="md:hidden text-white pb-6 -mx-1">
      <div className="flex items-center justify-between pt-1 pb-4 relative">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight leading-none">業績儀表板</h1>
          <p className="text-[12px] text-white/45 mt-1.5">{curOpt.key === 'self' ? (me?.name || '') + ' 個人' : curOpt.label + ` · ${members.length} 人`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onSearch} aria-label="搜尋" className="w-10 h-10 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center active:scale-95 transition"><Search size={18} /></button>
          <button onClick={() => setShowScope(v => !v)} className="h-10 px-3.5 rounded-full bg-white/[0.07] border border-white/10 flex items-center gap-1.5 text-[13px] font-bold active:scale-95 transition">{curOpt.label}<span className="text-white/50 text-[10px]">▾</span></button>
        </div>
        {showScope && (
          <div className="absolute right-0 top-14 z-30 min-w-[150px] rounded-2xl border border-white/10 bg-[#0c1020]/95 backdrop-blur-2xl p-1.5 shadow-2xl">
            {options.map(o => (
              <button key={o.key} onClick={() => { setScope(o.key); setShowScope(false); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-bold ${curOpt.key === o.key ? 'bg-blue-500/20 text-blue-300' : 'text-white/70'}`}>{o.label}</button>
            ))}
          </div>
        )}
      </div>

      {/* 月份 / 賽季 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.07] px-1">
          <button onClick={() => shift(-1)} disabled={idx <= 0} className="w-9 h-10 flex items-center justify-center text-white/70 disabled:opacity-25"><ChevronLeft size={16} /></button>
          <span className="text-[13px] font-bold px-2 tabular-nums">{viewMonth.replace('-', ' 年 ')} 月</span>
          <button onClick={() => shift(1)} disabled={idx >= currentMonths.length - 1} className="w-9 h-10 flex items-center justify-center text-white/70 disabled:opacity-25"><ChevronRight size={16} /></button>
        </div>
        <div className="flex rounded-2xl border border-white/10 bg-white/[0.07] p-0.5">
          {[['H1', '上半年'], ['H2', '下半年']].map(([k, l]) => (
            <button key={k} onClick={() => setSeason(k)} className={`px-3 py-2 text-[12px] font-bold rounded-[14px] transition ${season === k ? 'bg-white text-gray-900' : 'text-white/55'}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* UNIT FYP 主卡 */}
      <div className={`${glass} p-5 mb-3 relative overflow-hidden`}>
        <div className="absolute -top-20 -left-10 w-56 h-56 rounded-full bg-blue-500/25 blur-3xl pointer-events-none"></div>
        <div className="relative">
          <p className="text-[11px] tracking-[0.18em] text-white/45 font-bold">{curOpt.key === 'self' ? 'MY FYP' : 'UNIT FYP'}</p>
          <p className="text-[36px] font-bold tracking-tight leading-tight tabular-nums mt-1">{formatMoney(d.weighted)}</p>
          <div className="flex items-center justify-between text-[12px] text-white/55 mt-1">
            <span>高峰目標 {d.tgt.peak ? formatMoney(d.tgt.peak) : '—'}</span>
            <span className="font-bold text-white">{Math.round(pctPeak)}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden mt-2"><div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500" style={{ width: `${pctPeak}%`, transition: 'width .8s ease' }}></div></div>
          <div className="flex items-center justify-between text-[11px] text-white/40 mt-2">
            <span>極峰 {Math.round(pctSummit)}%</span>
            <span>本月 {formatMoney(d.mWeighted)}</span>
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        {[
          { l: '總實收保費', v: wan(d.premium), s: `本月 ${wan(d.mPremium)}` },
          { l: '本月件數', v: d.cases.m, s: `累積 ${d.cases.a} 件` },
          { l: '本月 FYC', v: wan(d.mFYC), s: '預估收入' },
          { l: '極峰達成率', v: Math.round(pctSummit) + '%', s: d.tgt.summit ? `目標 ${wan(d.tgt.summit)}` : '' },
        ].map(k => (
          <div key={k.l} className={`${glass} px-4 py-3.5`}>
            <p className="text-[11px] text-white/45">{k.l}</p>
            <p className="text-[24px] font-bold tabular-nums leading-tight mt-0.5">{k.v}</p>
            <p className="text-[11px] text-white/35 mt-0.5">{k.s}</p>
          </div>
        ))}
      </div>

      {/* 達成進度 */}
      <div className={`${glass} p-4 mb-3`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[15px] font-bold">達成進度</p>
          <div className="flex rounded-full bg-white/[0.07] p-0.5">
            {[['fyp', 'FYP'], ...(hasAct ? [['act', '實收']] : [])].map(([k, l]) => (
              <button key={k} onClick={() => setProgTab(k)} className={`px-3 py-1 text-[11px] font-bold rounded-full ${progTab === k || (k === 'fyp' && !hasAct) ? 'bg-white text-gray-900' : 'text-white/55'}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className="relative shrink-0" style={{ width: 128, height: 128 }}>
            <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
              <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="13" />
              <circle cx="64" cy="64" r={R} fill="none" stroke={progPct >= 100 ? '#34d399' : '#60a5fa'} strokeWidth="13" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progPct / 100)} style={{ transition: 'stroke-dashoffset .8s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-[26px] font-bold tabular-nums leading-none">{Math.round(progPct)}<span className="text-xs text-white/50">%</span></span><span className="text-[10px] text-white/40 mt-1">{prog.label.slice(0, 2)}</span></div>
          </div>
          <div className="flex-1 min-w-0 space-y-2.5 text-[13px]">
            {[['已達成', prog.got, 'bg-blue-400'], ['尚差', Math.max(0, prog.goal - prog.got), 'bg-white/25'], ['高峰目標', prog.goal, 'bg-amber-400']].map(([l, v, c]) => (
              <div key={l} className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-white/60"><i className={`w-2 h-2 rounded-full ${c}`}></i>{l}</span><b className="tabular-nums">{wan(v)}</b></div>
            ))}
          </div>
        </div>
      </div>

      {/* 趨勢 */}
      <div className={`${glass} p-4 mb-3`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[15px] font-bold">近 6 個月趨勢</p>
          <div className="flex rounded-full bg-white/[0.07] p-0.5">
            {Object.keys(trendCfg).map(k => (
              <button key={k} onClick={() => setTrendMetric(k)} className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${trendMetric === k ? 'bg-white text-gray-900' : 'text-white/55'}`}>{trendCfg[k].label}</button>
            ))}
          </div>
        </div>
        <div style={{ width: '100%', height: 170 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={d.trend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,.08)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,.45)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,.35)', fontSize: 10 }} tickFormatter={(v) => v >= 10000 ? (v / 10000).toFixed(0) + '萬' : v} />
              <Tooltip contentStyle={{ background: '#0c1020', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, color: '#fff', fontSize: 12 }} formatter={(v) => trendMetric === 'cases' ? v + ' 件' : formatMoney(v)} />
              <Line type="monotone" dataKey={trendMetric} name={trendCfg[trendMetric].label} stroke={trendCfg[trendMetric].color} strokeWidth={3} dot={{ r: 3, fill: trendCfg[trendMetric].color }} />
              {trendMetric === 'weighted' && <Line type="monotone" dataKey="target" name="月均目標" stroke="rgba(255,255,255,.4)" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 商品線 */}
      <div className={`${glass} p-4 mb-3`}>
        <p className="text-[15px] font-bold mb-3.5">各商品線績效 <span className="text-[11px] text-white/35 font-medium">本月實收</span></p>
        <div className="space-y-3.5">
          {prods.map(p => (
            <div key={p.l}>
              <div className="flex items-baseline justify-between mb-1.5"><span className="text-[13px] font-bold">{p.l}</span><span className="text-[12px] text-white/60 tabular-nums"><b className="text-white text-[14px]">{wan(p.v)}</b>　{prodTotal ? Math.round((p.v / prodTotal) * 100) : 0}%</span></div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className={`h-full rounded-full ${p.c}`} style={{ width: `${prodTotal ? (p.v / prodTotal) * 100 : 0}%`, transition: 'width .6s ease' }}></div></div>
            </div>
          ))}
        </div>
      </div>

      {/* 成員（組／區才顯示） */}
      {members.length > 1 && (
        <div className={`${glass} p-4`}>
          <button onClick={() => setShowMembers(v => !v)} className="w-full flex items-center justify-between">
            <p className="text-[15px] font-bold">成員表現 <span className="text-[11px] text-white/35 font-medium">累積 FYP</span></p>
            <span className="text-[12px] text-white/50">{showMembers ? '收合 ▴' : `展開 ${members.length} 人 ▾`}</span>
          </button>
          {showMembers && (
            <div className="mt-3.5 space-y-3">
              {[...d.per].sort((a, b) => b.w - a.w).map(x => {
                const t = targetOf(x.m).peak.total;
                const p = t ? Math.min(100, (x.w / t) * 100) : 0;
                return (
                  <div key={x.m.id}>
                    <div className="flex items-baseline justify-between mb-1.5"><span className="text-[13px] font-bold">{x.m.name}<span className="text-white/35 font-medium text-[11px] ml-1.5">{roleOf(x.m)}</span></span><span className="text-[12px] text-white/60 tabular-nums"><b className="text-white text-[14px]">{wan(x.w)}</b>　{Math.round(p)}%</span></div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className={`h-full rounded-full ${p >= 100 ? 'bg-emerald-400' : 'bg-blue-400'}`} style={{ width: `${p}%` }}></div></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Dashboard Component ---
const DesktopDashboardView = ({ stats, season, setSeason, viewMonth, setViewMonth, currentMonths, managers, selectedManagerId, setSelectedManagerId }) => {
  const pct = (c, t) => (!t ? 100 : Math.min(100, (c / t) * 100));
  const glass = 'rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-xl';
  const sel = 'bg-white/[0.08] border border-white/10 rounded-xl px-3 py-1.5 text-[13px] font-bold text-white outline-none cursor-pointer';
  const PBar = ({ label, value, ok, color, okColor }) => (
    <div className="flex items-center gap-2">
      <span className="w-8 text-[10px] text-white/40 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${value}%`, background: ok ? okColor : color }} /></div>
      <span className={`w-9 text-right text-[11px] font-bold tabular-nums ${ok ? '' : 'text-white/70'}`} style={ok ? { color: okColor } : {}}>{Math.round(value)}%</span>
    </div>
  );
  return (
    <div className="hidden md:flex flex-col gap-3 h-full md:min-h-[840px] text-white animate-fade-in">
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight leading-none">業績儀表板</h1>
          <p className="text-[12px] text-white/45 mt-1.5">{season === 'H1' ? '115年 上半年高峰／極峰競賽 · 115/01/02 – 06/15' : '115年 下半年新高峰／新極峰競賽 · 115/07/01 – 12/31'}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-white/10 bg-white/[0.07] p-0.5">
            {[['H1', '上半年'], ['H2', '下半年']].map(([k, l]) => (
              <button key={k} onClick={() => setSeason(k)} className={`px-3 py-1.5 text-[12px] font-bold rounded-[10px] transition ${season === k ? 'bg-white text-gray-900' : 'text-white/55'}`}>{l}</button>
            ))}
          </div>
          <select className={sel} value={viewMonth} onChange={(e) => setViewMonth(e.target.value)}>
            {currentMonths.map(m => <option key={m.value} value={m.value} className="text-gray-900">{m.label}</option>)}
          </select>
          <select className={sel} value={selectedManagerId} onChange={(e) => setSelectedManagerId(e.target.value)}>
            {managers.map(m => <option key={m.id} value={m.id} className="text-gray-900">{m.name} 組</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 shrink-0">
        <div className={`${glass} p-4 bg-gradient-to-br from-blue-500/25 to-indigo-500/10`}>
          <p className="text-[11px] text-white/50 font-bold tracking-wider">組績 UNIT FYP</p>
          <p className="text-[28px] font-bold tabular-nums leading-tight mt-1">{formatMoney(stats.unitTotalWeighted)}</p>
          <p className="text-[11px] text-white/45">實收 {formatMoney(stats.unitTotalPremium)}　·　高峰目標 {stats.unitTarget ? stats.unitTarget.peak.total / 10000 : 0} 萬</p>
        </div>
        <div className={`${glass} p-4 flex items-center justify-between`}>
          <div className="space-y-1.5 min-w-0">
            <p className="text-[11px] text-white/50 font-bold tracking-wider">組達成率</p>
            <div className="flex items-center gap-2 text-[13px] font-bold"><span className="w-2 h-2 rounded-full bg-blue-400" />高峰 {Math.round(stats.unitPeakProgress)}%</div>
            <div className="flex items-center gap-2 text-[13px] font-bold"><span className="w-2 h-2 rounded-full bg-amber-400" />極峰 {Math.round(stats.unitSummitProgress)}%</div>
            {(stats.unitHasActualPeak || stats.unitHasActualSummit) && (
              <div className="text-[11px] text-white/45">實收 高峰 {Math.round(stats.unitPeakPremiumProgress)}% · 極峰 {Math.round(stats.unitSummitPremiumProgress)}%</div>
            )}
          </div>
          <div className="h-[96px] w-[96px] shrink-0 relative"><div className="absolute top-1/2 left-1/2 scale-[0.55] -translate-x-1/2 -translate-y-1/2"><DoubleRadialProgress peakPercent={stats.unitPeakProgress} summitPercent={stats.unitSummitProgress} /></div></div>
        </div>
        <div className={`${glass} p-4`}>
          <p className="text-[11px] text-white/50 font-bold tracking-wider">全體總績 FYP</p>
          <div className="flex justify-between items-end mt-2">
            <div><p className="text-[11px] text-white/40">{viewMonth} 當月</p><p className="text-[22px] font-bold tabular-nums">{formatMoney(stats.grandTotalWeightedMonth)}</p></div>
            <div className="text-right"><p className="text-[11px] text-white/40">累積</p><p className="text-[22px] font-bold tabular-nums text-emerald-400">{formatMoney(stats.grandTotalWeighted)}</p></div>
          </div>
        </div>
        <div className={`${glass} p-4`}>
          <p className="text-[11px] text-white/50 font-bold tracking-wider">全體總件數</p>
          <div className="flex justify-between items-end mt-2">
            <div><p className="text-[11px] text-white/40">{viewMonth} 當月</p><p className="text-[26px] font-bold tabular-nums">{stats.grandTotalCasesMonth}</p></div>
            <div className="text-right"><p className="text-[11px] text-white/40">累積</p><p className="text-[26px] font-bold tabular-nums text-amber-400">{stats.grandTotalCases}</p></div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)] gap-3">
        <div className={`${glass} p-4 flex flex-col min-h-0`}>
          <div className="flex items-center gap-2 mb-2 shrink-0">
            <Crown className="text-amber-400" size={18} />
            <h3 className="font-bold text-[15px]">極豐榮譽榜</h3>
            <span className="text-[11px] text-white/40">{season === 'H2' ? '加權／實收任一達標即合格' : '加權＋A&H 達標'}</span>
          </div>
          <div className="grid grid-cols-[28px_minmax(130px,1.1fr)_64px_92px_minmax(0,1.5fr)_minmax(0,1.5fr)] gap-3 px-2 pb-1.5 text-[10px] font-bold text-white/35 shrink-0">
            <span className="text-center">#</span><span>同仁</span><span className="text-center">件數 月/累</span><span className="text-right">當月 FYP</span><span>高峰進度</span><span>極峰進度</span>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar divide-y divide-white/[0.06]">
            {stats.memberStats.map((member, index) => {
              const { targets } = member;
              const hasAP = season === 'H2' && targets.peak.actualPremium > 0;
              const hasAS = season === 'H2' && targets.summit.actualPremium > 0;
              const pW = pct(member.totalWeighted, targets.peak.total), sW = pct(member.totalWeighted, targets.summit.total);
              const pA = hasAP ? pct(member.totalPremium, targets.peak.actualPremium) : 0, sA = hasAS ? pct(member.totalPremium, targets.summit.actualPremium) : 0;
              const pAH = pct(member.ahWeighted, targets.peak.ah), sAH = pct(member.ahWeighted, targets.summit.ah);
              const peakW = member.totalWeighted >= targets.peak.total && (!targets.peak.ah || member.ahWeighted >= targets.peak.ah);
              const peakA = hasAP && member.totalPremium >= targets.peak.actualPremium;
              const sumW = member.totalWeighted >= targets.summit.total && (!targets.summit.ah || member.ahWeighted >= targets.summit.ah);
              const sumA = hasAS && member.totalPremium >= targets.summit.actualPremium;
              return (
                <div key={member.id} className="grid grid-cols-[28px_minmax(130px,1.1fr)_64px_92px_minmax(0,1.5fr)_minmax(0,1.5fr)] gap-3 items-center px-2 py-2 hover:bg-white/[0.04]">
                  <span className={`text-center text-[13px] font-bold ${index < 3 ? 'text-amber-400' : 'text-white/35'}`}>{index + 1}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar name={member.name} size={30} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold truncate">{member.name}</p>
                      <p className="text-[10px] text-white/40 truncate">{member.role}{season === 'H2' && H2_ROLE_MAPPING[member.name] ? ' (特)' : ''}</p>
                    </div>
                  </div>
                  <span className="text-center text-[13px] tabular-nums"><b>{member.casesMonth}</b><span className="text-white/35"> / {member.casesTotal}</span></span>
                  <span className="text-right text-[13px] font-bold tabular-nums">{formatMoney(member.monthWeighted)}</span>
                  {[['peak', pW, pAH, pA, peakW, peakA, hasAP, '#60a5fa', '#34d399'], ['summit', sW, sAH, sA, sumW, sumA, hasAS, '#fb923c', '#fbbf24']].map(([k, w, ah, ac, okW, okA, hasA, c, ok]) => (
                    <div key={k} className="space-y-1 min-w-0">
                      <PBar label="加權" value={w} ok={okW} color={c} okColor={ok} />
                      {season === 'H1' && <PBar label="A&H" value={ah} ok={member.ahWeighted >= targets[k].ah} color={c} okColor={ok} />}
                      {hasA && <PBar label="實收" value={ac} ok={okA} color={c} okColor={ok} />}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 min-h-0">
          <div className={`${glass} p-4 flex-[1.2] min-h-0 flex flex-col`}>
            <div className="flex items-center gap-2 mb-2 shrink-0"><Calendar className="text-indigo-400" size={16} /><h3 className="font-bold text-[14px]">團隊月度戰報</h3></div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyData} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 11 }} />
                  <YAxis yAxisId="left" tickFormatter={(v) => v / 10000 + '萬'} axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: '#0c1020', color: '#fff' }} formatter={(v, n) => (n.includes('件數') ? v : formatMoney(v))} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="totalWeighted" name="總加權保費" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={12} isAnimationActive={false} />
                  <Bar yAxisId="left" dataKey="ahWeighted" name="A&H加權" fill="#10b981" radius={[4, 4, 0, 0]} barSize={12} isAnimationActive={false} />
                  <Bar yAxisId="right" dataKey="cases" name="總件數" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={12} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ team, records, season, setSeason, rankTargets, doubleAwardTargets, loggedInUser, onSearch }) => {
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
    let unitTotalPremium = 0;
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
          unitTotalPremium += premium;
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
    // 實收標的達成率：用「實收保費目標」(targets.peak.actualPremium / targets.summit.actualPremium) 當分母，
    // 這是跟每位成員列表裡「實收」那一行同一套既有欄位、同一套算法，不是另外發明的參考數字。
    // 這個欄位只有115下半年(H2)才會設定，H1或沒設定實收目標時就不顯示。
    const unitHasActualPeak = season === 'H2' && unitTarget.peak.actualPremium > 0;
    const unitHasActualSummit = season === 'H2' && unitTarget.summit.actualPremium > 0;
    const unitPeakPremiumProgress = unitHasActualPeak ? Math.min(100, (unitTotalPremium / unitTarget.peak.actualPremium) * 100) : 0;
    const unitSummitPremiumProgress = unitHasActualSummit ? Math.min(100, (unitTotalPremium / unitTarget.summit.actualPremium) * 100) : 0;

    return {
      memberStats: memberStats.sort((a, b) => b.totalWeighted - a.totalWeighted),
      unitTotalWeighted,
      unitTotalPremium,
      unitTarget,
      unitPeakProgress,
      unitSummitProgress,
      unitHasActualPeak,
      unitHasActualSummit,
      unitPeakPremiumProgress,
      unitSummitPremiumProgress,
      grandTotalWeighted,
      grandTotalWeightedMonth,
      grandTotalCases,
      grandTotalCasesMonth,
      monthlyData: currentMonths.map(m => monthlyStats[m.value.split('-')[1]])
    };
  }, [team, records, selectedManagerId, viewMonth, season, activeTargets, currentMonths, currentStart]); 

  const calculateProgress = (current, target) => (!target || target === 0) ? 100 : Math.min(100, (current / target) * 100);

  return (
    <>
    <MobileDashboardView team={team} records={records} season={season} setSeason={setSeason} activeTargets={activeTargets} currentMonths={currentMonths} currentStart={currentStart} viewMonth={viewMonth} setViewMonth={setViewMonth} loggedInUser={loggedInUser} onSearch={onSearch} />
    <DesktopDashboardView stats={stats} season={season} setSeason={setSeason} viewMonth={viewMonth} setViewMonth={setViewMonth} currentMonths={currentMonths} managers={managers} selectedManagerId={selectedManagerId} setSelectedManagerId={setSelectedManagerId} />
    <div className="hidden space-y-8 animate-fade-in pb-12">
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
            <div><p className="text-blue-200 font-bold text-xs uppercase tracking-wider mb-1">Unit FYP (組績)</p><h2 className="text-3xl font-bold tracking-tight">{formatMoney(stats.unitTotalWeighted)}</h2><p className="text-xs text-blue-200 mt-1">總實收保費 {formatMoney(stats.unitTotalPremium)}</p></div>
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
           <div className="z-10">
             <p className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2">組達成率</p>
             <div className="flex flex-col gap-2">
               <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span><span className="text-sm font-bold text-gray-700">高峰 {Math.round(stats.unitPeakProgress)}%</span></div>
               <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span><span className="text-sm font-bold text-gray-700">極峰 {Math.round(stats.unitSummitProgress)}%</span></div>
               {(stats.unitHasActualPeak || stats.unitHasActualSummit) && <div className="h-px bg-gray-100 my-0.5"></div>}
               {stats.unitHasActualPeak && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-400"></span><span className="text-sm font-bold text-gray-700">實收高峰 {Math.round(stats.unitPeakPremiumProgress)}%</span></div>}
               {stats.unitHasActualSummit && <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-yellow-300"></span><span className="text-sm font-bold text-gray-700">實收極峰 {Math.round(stats.unitSummitPremiumProgress)}%</span></div>}
             </div>
           </div>
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

                const isDoubleQualified = false;

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
    </>
  );
};

// --- 手機版：MEA 活動量（深色玻璃風，重點先看、快速記錄） ---
const MEA_ROW_TARGETS = { prospect: 80, appointment: 100, interview: 60, proposal: 60, application: 60, issue: 40 };
const MobileActivityView = ({ team, selectedAgentId, setSelectedAgentId, viewMode, setViewMode, periodMode, setPeriodMode, periodRange, selectedMonth, setSelectedMonth, currentMonths, shiftWeek, stats, monthlyTrend, activities, canEdit, formData, setFormData, handleSubmit, isSubmitting, onSearch }) => {
  const [goal, setGoal] = useState(() => { try { const v = Number(localStorage.getItem('jf_mea_goal')); return v > 0 ? v : 400; } catch (e) { return 400; } });
  const [editGoal, setEditGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [lastKeys, setLastKeys] = useState(null);
  const [trendMetric, setTrendMetric] = useState('weighted');
  const [flash, setFlash] = useState('');

  const factor = (goal / 400) * (periodMode === 'week' ? 0.25 : 1);
  const totalGoal = Math.round(goal * (periodMode === 'week' ? 0.25 : 1));
  const interviewGoal = Math.round(60 * factor);
  const total = stats.totalPoints;
  const pct = totalGoal ? Math.min(100, Math.round((total / totalGoal) * 100)) : 0;
  const R = 62, C = 2 * Math.PI * R;
  const agent = team.find(m => m.id === selectedAgentId);
  const idx = currentMonths.findIndex(m => m.value === selectedMonth);
  const shiftMonth = (d) => { const n = currentMonths[idx + d]; if (n) setSelectedMonth(n.value); };
  const today = getTodayDate();
  const todayRec = activities.find(a => a.agentId === selectedAgentId && a.date === today) || {};
  const periodLabel = periodMode === 'month' ? selectedMonth.replace('-', ' 年 ') + ' 月' : `${periodRange.start.slice(5)} ~ ${periodRange.end.slice(5)}`;

  const saveGoal = () => {
    const v = Math.round(Number(goalInput));
    if (v > 0) { setGoal(v); try { localStorage.setItem('jf_mea_goal', String(v)); } catch (e) {} }
    setEditGoal(false);
  };

  const writeToday = async (keys, delta) => {
    if (!canEdit || !selectedAgentId) return;
    const ex = activities.find(a => a.agentId === selectedAgentId && a.date === today) || {};
    const payload = { agentId: selectedAgentId, date: today, month: today.slice(0, 7), updatedAt: new Date().toISOString() };
    keys.forEach(k => { payload[k] = Math.max(0, (ex[k] || 0) + delta); });
    try { await setDoc(doc(db, 'activity_record', `${selectedAgentId}_${today}`), payload, { merge: true }); } catch (e) { console.error(e); }
  };
  const quickAdd = async (key) => {
    const keys = viewMode === 'sales' ? getCascadeKeys(key) : [key];
    await writeToday(keys, 1);
    setLastKeys(keys);
    const pts = keys.reduce((s, k) => s + (ALL_ACTIVITY_WEIGHTS[k]?.score || 0), 0);
    setFlash(`+${pts} 分`);
    setTimeout(() => setFlash(''), 1200);
  };
  const undo = async () => { if (!lastKeys) return; await writeToday(lastKeys, -1); setLastKeys(null); };

  const glass = 'rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-xl';
  const weights = viewMode === 'sales' ? ACTIVITY_WEIGHTS : RECRUIT_ACTIVITY_WEIGHTS;
  const totalsOf = viewMode === 'sales' ? stats.totals : stats.recruitTotals;
  const maxRecruitPts = Math.max(1, ...Object.keys(RECRUIT_ACTIVITY_WEIGHTS).map(k => (stats.recruitTotals[k] || 0) * RECRUIT_ACTIVITY_WEIGHTS[k].score));
  const warn = total < totalGoal || stats.interviewPoints < interviewGoal;
  const trendCfg = { weighted: { label: '加權保費', color: '#60a5fa' }, fyc: { label: 'FYC', color: '#34d399' }, points: { label: '活動分數', color: '#fbbf24' } };

  return (
    <div className="md:hidden text-white pb-6 -mx-1">
      {/* 標題列 */}
      <div className="flex items-center justify-between pt-1 pb-4 relative">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight leading-none">MEA 活動量</h1>
          <p className="text-[12px] text-white/45 mt-1.5">P × C × I　{viewMode === 'sales' ? '業務' : '增員'}視角</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onSearch} aria-label="搜尋" className="w-10 h-10 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center active:scale-95 transition"><Search size={18} /></button>
          <button onClick={() => setShowMenu(v => !v)} aria-label="更多" className="w-10 h-10 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center active:scale-95 transition"><MoreVertical size={18} className="rotate-90" /></button>
        </div>
        {showMenu && (
          <div className="absolute right-0 top-14 z-30 w-40 rounded-2xl border border-white/10 bg-[#0c1020]/95 backdrop-blur-2xl p-1.5 shadow-2xl">
            {[['sales', '業務活動量'], ['recruit', '增員活動量']].map(([k, l]) => (
              <button key={k} onClick={() => { setViewMode(k); setShowMenu(false); }} className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-bold ${viewMode === k ? 'bg-blue-500/20 text-blue-300' : 'text-white/70'}`}>{l}</button>
            ))}
            <button onClick={() => { setGoalInput(String(goal)); setEditGoal(true); setShowMenu(false); }} className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] font-bold text-white/70">編輯目標</button>
          </div>
        )}
      </div>

      {/* 人員 / 期間 */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-0">
          <select value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)} className="w-full appearance-none rounded-2xl border border-white/10 bg-white/[0.07] pl-4 pr-8 py-2.5 text-[14px] font-bold text-white outline-none">
            {team.map(m => <option key={m.id} value={m.id} className="text-gray-900">{m.name}</option>)}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-xs">▾</span>
        </div>
        <div className="flex items-center rounded-2xl border border-white/10 bg-white/[0.07] px-1">
          <button onClick={() => periodMode === 'month' ? shiftMonth(-1) : shiftWeek(-1)} className="w-8 h-10 flex items-center justify-center text-white/70 active:text-white"><ChevronLeft size={16} /></button>
          <span className="text-[12px] font-bold px-1 whitespace-nowrap tabular-nums">{periodLabel}</span>
          <button onClick={() => periodMode === 'month' ? shiftMonth(1) : shiftWeek(1)} className="w-8 h-10 flex items-center justify-center text-white/70 active:text-white"><ChevronRight size={16} /></button>
        </div>
        <div className="flex rounded-2xl border border-white/10 bg-white/[0.07] p-0.5">
          {[['month', '月'], ['week', '週']].map(([k, l]) => (
            <button key={k} onClick={() => setPeriodMode(k)} className={`px-3 py-2 text-[12px] font-bold rounded-[14px] transition ${periodMode === k ? 'bg-white text-gray-900' : 'text-white/55'}`}>{l}</button>
          ))}
        </div>
      </div>

      {/* 活動量總分環 */}
      <div className={`${glass} p-5 mb-3 relative overflow-hidden`}>
        <div className="absolute -top-16 -right-10 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
        <div className="relative flex items-center gap-5">
          <div className="relative shrink-0" style={{ width: 150, height: 150 }}>
            <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
              <defs><linearGradient id="meaRing" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#38bdf8" /><stop offset="100%" stopColor="#6366f1" /></linearGradient></defs>
              <circle cx="75" cy="75" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="12" />
              <circle cx="75" cy="75" r={R} fill="none" stroke={pct >= 100 ? '#34d399' : 'url(#meaRing)'} strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset .8s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[34px] font-bold leading-none tabular-nums">{total}</span>
              <span className="text-[11px] text-white/45 mt-1">/ {totalGoal} 分</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-white/50">活動量總分</p>
            <p className="text-[30px] font-bold leading-tight tabular-nums">{pct}<span className="text-base text-white/50">%</span></p>
            <p className="text-[12px] text-white/50 mt-1">{periodMode === 'month' ? '本月' : '本週'}目標 {totalGoal} 分</p>
            <button onClick={() => { setGoalInput(String(goal)); setEditGoal(true); }} className="mt-2.5 text-[12px] font-bold text-blue-300 active:opacity-60">編輯目標</button>
          </div>
        </div>
      </div>

      {/* 迷你卡 */}
      <div className="grid grid-cols-3 gap-2.5 mb-3">
        {[
          { l: '面談總分', v: stats.interviewPoints, t: interviewGoal },
          { l: '業務分', v: stats.salesPoints },
          { l: '增員分', v: stats.recruitPoints },
        ].map(c => (
          <div key={c.l} className={`${glass} px-3.5 py-3`}>
            <p className="text-[11px] text-white/45">{c.l}</p>
            <p className="text-[22px] font-bold tabular-nums leading-tight mt-0.5">{c.v}{c.t ? <span className="text-[11px] text-white/40 font-medium"> /{c.t}</span> : null}</p>
            {c.t ? <div className="h-1 rounded-full bg-white/10 mt-1.5 overflow-hidden"><div className="h-full rounded-full bg-blue-400" style={{ width: `${Math.min(100, (c.v / c.t) * 100)}%` }}></div></div> : null}
          </div>
        ))}
      </div>

      {/* 預警 */}
      {warn && (
        <div className="rounded-3xl border border-red-400/25 bg-red-500/10 px-4 py-3.5 mb-3 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0"><AlertTriangle size={16} className="text-red-300" /></div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-red-200">活動量未達標預警</p>
            <ul className="text-[12px] text-red-200/80 mt-1 space-y-0.5">
              {total < totalGoal && <li>活動量總分 {total} / {totalGoal}，還差 {totalGoal - total} 分</li>}
              {stats.interviewPoints < interviewGoal && <li>面談總分 {stats.interviewPoints} / {interviewGoal}，還差 {interviewGoal - stats.interviewPoints} 分</li>}
            </ul>
          </div>
        </div>
      )}

      {/* 快速記錄 */}
      <div className={`${glass} p-4 mb-3`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[15px] font-bold">快速記錄今日活動</p>
          {canEdit && lastKeys ? <button onClick={undo} className="text-[12px] font-bold text-white/55 active:text-white">↶ 撤銷</button> : <span className="text-[11px] text-white/35">{canEdit ? '點一下 +1' : '僅限本人'}</span>}
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {Object.keys(weights).map(k => (
            <button key={k} disabled={!canEdit} onClick={() => quickAdd(k)} className={`rounded-2xl border border-white/10 bg-white/[0.06] px-2 py-3 text-center active:scale-95 active:bg-blue-500/20 transition ${canEdit ? '' : 'opacity-50'}`}>
              <p className="text-[12px] text-white/70 font-bold">{weights[k].label}</p>
              <p className="text-[24px] font-bold tabular-nums leading-tight mt-0.5">{todayRec[k] || 0}</p>
              <p className="text-[10px] text-white/35">{weights[k].score} 分 / 次</p>
            </button>
          ))}
        </div>
        {flash && <p className="text-center text-[13px] font-bold text-emerald-300 mt-2.5">{flash}</p>}
      </div>

      {/* 明細 */}
      <div className={`${glass} p-4 mb-3`}>
        <div className="flex items-center justify-between mb-3.5">
          <p className="text-[15px] font-bold">{periodMode === 'month' ? '本月' : '本週'}活動量明細</p>
          <button onClick={() => setShowSheet(true)} className="flex items-center gap-1 text-[12px] font-bold text-blue-300 active:opacity-60"><Plus size={14} />新增紀錄</button>
        </div>
        <div className="space-y-3.5">
          {Object.keys(weights).map(k => {
            const cnt = totalsOf[k] || 0;
            const pts = cnt * weights[k].score;
            const tgt = viewMode === 'sales' ? Math.round(MEA_ROW_TARGETS[k] * factor) : 0;
            const p = viewMode === 'sales' ? (tgt ? Math.min(100, (pts / tgt) * 100) : 0) : (pts / maxRecruitPts) * 100;
            const barColor = viewMode === 'sales' ? (p >= 100 ? 'bg-emerald-400' : p >= 60 ? 'bg-blue-400' : 'bg-amber-400') : 'bg-teal-400';
            return (
              <div key={k}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-[13px] font-bold">{weights[k].label}<span className="text-white/35 font-medium ml-1.5 text-[11px]">×{cnt}</span></span>
                  <span className="text-[12px] tabular-nums text-white/60"><b className="text-white text-[14px]">{pts}</b>{tgt ? ` / ${tgt}` : ''} 分</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden"><div className={`h-full rounded-full ${barColor}`} style={{ width: `${p}%`, transition: 'width .6s ease' }}></div></div>
              </div>
            );
          })}
        </div>
        {viewMode === 'sales' && (
          <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-center">
            {[['P 件均', formatMoney(stats.P).replace('$', '')], ['C 成交率', (stats.C * 100).toFixed(1) + '%'], ['I 面談', stats.I]].map(([l, v]) => (
              <div key={l} className="flex-1"><p className="text-[16px] font-bold tabular-nums">{v}</p><p className="text-[10px] text-white/40 mt-0.5">{l}</p></div>
            ))}
          </div>
        )}
        {viewMode === 'recruit' && (
          <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between text-center">
            {[['增員面談', stats.recruitTotals.recruitInterview], ['面談轉登錄', (stats.recruitConversion * 100).toFixed(1) + '%'], ['登錄人數', stats.recruitTotals.recruitRegistered]].map(([l, v]) => (
              <div key={l} className="flex-1"><p className="text-[16px] font-bold tabular-nums">{v}</p><p className="text-[10px] text-white/40 mt-0.5">{l}</p></div>
            ))}
          </div>
        )}
      </div>

      {/* 近 6 個月趨勢 */}
      <div className={`${glass} p-4`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[15px] font-bold">近 6 個月趨勢</p>
        </div>
        <div className="flex gap-2 mb-3">
          {Object.keys(trendCfg).map(k => (
            <button key={k} onClick={() => setTrendMetric(k)} className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition ${trendMetric === k ? 'border-transparent text-gray-900' : 'border-white/10 text-white/55'}`} style={trendMetric === k ? { background: trendCfg[k].color } : {}}>{trendCfg[k].label}</button>
          ))}
        </div>
        <div style={{ width: '100%', height: 170 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,.08)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,.45)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,.35)', fontSize: 10 }} tickFormatter={(v) => v >= 10000 ? (v / 10000).toFixed(0) + '萬' : v} />
              <Tooltip contentStyle={{ background: '#0c1020', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, color: '#fff', fontSize: 12 }} formatter={(v) => trendMetric === 'points' ? v + ' 分' : formatMoney(v)} />
              <Line type="monotone" dataKey={trendMetric} name={trendCfg[trendMetric].label} stroke={trendCfg[trendMetric].color} strokeWidth={3} dot={{ r: 3, fill: trendCfg[trendMetric].color }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 編輯目標 */}
      {editGoal && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditGoal(false)}>
          <div className="w-full max-w-md rounded-t-[28px] border-t border-white/10 bg-[#0c1020] p-5 pb-8" onClick={e => e.stopPropagation()}>
            <p className="text-[16px] font-bold mb-1">編輯每月活動量目標</p>
            <p className="text-[12px] text-white/45 mb-4">每週目標自動換算為月目標的 1/4，此設定只存在這支手機</p>
            <input type="number" inputMode="numeric" value={goalInput} onChange={e => setGoalInput(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-[20px] font-bold text-white outline-none" />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditGoal(false)} className="flex-1 py-3 rounded-2xl bg-white/10 font-bold text-[14px]">取消</button>
              <button onClick={saveGoal} className="flex-1 py-3 rounded-2xl bg-blue-500 font-bold text-[14px]">儲存</button>
            </div>
          </div>
        </div>
      )}

      {/* 新增紀錄（補登） */}
      {showSheet && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowSheet(false)}>
          <form onSubmit={async (e) => { await handleSubmit(e); setShowSheet(false); }} className="w-full max-w-md max-h-[88vh] overflow-y-auto rounded-t-[28px] border-t border-white/10 bg-[#0c1020] p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[16px] font-bold">新增 / 補登紀錄 · {agent?.name || ''}</p>
              <button type="button" onClick={() => setShowSheet(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><X size={16} /></button>
            </div>
            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-[15px] font-bold text-white outline-none mb-4" style={{ colorScheme: 'dark' }} />
            {[['業務', ACTIVITY_WEIGHTS], ['增員', RECRUIT_ACTIVITY_WEIGHTS]].map(([title, W]) => (
              <div key={title} className="mb-3">
                <p className="text-[11px] font-bold text-white/40 mb-2 tracking-wider">{title}</p>
                <div className="space-y-2">
                  {Object.keys(W).map(k => (
                    <div key={k} className="flex items-center justify-between rounded-2xl bg-white/[0.05] px-3.5 py-2">
                      <span className="text-[13px] font-bold">{W[k].label}<span className="text-white/35 text-[11px] ml-1.5">{W[k].score}分</span></span>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => setFormData({ ...formData, [k]: Math.max(0, (Number(formData[k]) || 0) - 1) })} className="w-8 h-8 rounded-full bg-white/10 text-lg leading-none active:scale-90">−</button>
                        <span className="w-6 text-center text-[16px] font-bold tabular-nums">{Number(formData[k]) || 0}</span>
                        <button type="button" onClick={() => setFormData({ ...formData, [k]: (Number(formData[k]) || 0) + 1 })} className="w-8 h-8 rounded-full bg-blue-500/80 text-lg leading-none active:scale-90">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button type="submit" disabled={isSubmitting || !canEdit} className="w-full mt-2 py-3.5 rounded-2xl bg-blue-500 font-bold text-[15px] disabled:opacity-40">{canEdit ? (isSubmitting ? '儲存中…' : '儲存當日紀錄') : '僅限本人可修改'}</button>
          </form>
        </div>
      )}
    </div>
  );
};

// --- MEA Activity Dashboard (New Module based on Excel) ---
const ACTIVITY_WEIGHTS = {
  prospect: { label: '新增準客戶', score: 1, color: 'bg-blue-400' },
  appointment: { label: '約訪', score: 1, color: 'bg-blue-500' },
  interview: { label: '面談', score: 2, color: 'bg-blue-600' },
  proposal: { label: '送建議書', score: 3, color: 'bg-blue-700' },
  application: { label: '要保受理', score: 4, color: 'bg-blue-800' },
  issue: { label: '核保發單', score: 5, color: 'bg-blue-900' }
};

// 增員相關活動 (與業務活動並列計分，用於 MEA 總分)。分數曲線比照業務六階段 (1-1-2-3-4-5) 的邏輯設計
const RECRUIT_ACTIVITY_WEIGHTS = {
  newRecruitProspect: { label: '新增準增員', score: 1, color: 'bg-red-400' },
  recruitContact: { label: '增員約訪', score: 1, color: 'bg-red-500' },
  recruitInterview: { label: '增員面談', score: 2, color: 'bg-red-600' },
  recruitExam: { label: '內/外考', score: 4, color: 'bg-red-700' },
  recruitRegistered: { label: '登錄', score: 5, color: 'bg-red-800' }
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
  personal: { label: '私事', color: 'bg-green-500' },
  meeting: { label: '課程會議', color: 'bg-black' },
  claim: { label: '理賠', color: 'bg-orange-500' },
  paperwork: { label: '文書', color: 'bg-black' },
  other: { label: '其他', color: 'bg-gray-400' }
};

// 2026年（民國115年）中華民國政府行政機關辦公日曆表，依人事行政總處公告 (2026年起只補假不補班)
// 這份資料是手動維護的，之後年度更新需要重新查詢官方公告並修改這裡
const TAIWAN_HOLIDAYS_2026 = {
  '2026-01-01': '元旦',
  '2026-02-15': '小年夜',
  '2026-02-16': '除夕',
  '2026-02-17': '春節',
  '2026-02-18': '春節',
  '2026-02-19': '春節',
  '2026-02-20': '春節補假',
  '2026-02-27': '和平紀念日補假',
  '2026-02-28': '和平紀念日',
  '2026-04-03': '兒童節補假',
  '2026-04-04': '兒童節',
  '2026-04-05': '清明節',
  '2026-04-06': '清明節補假',
  '2026-05-01': '勞動節',
  '2026-06-19': '端午節',
  '2026-09-25': '中秋節',
  '2026-09-28': '教師節',
  '2026-10-09': '國慶日補假',
  '2026-10-10': '國慶日',
  '2026-10-25': '台灣光復節',
  '2026-10-26': '台灣光復節補假',
  '2026-12-25': '行憲紀念日'
};

const getEventColor = (e) => {
  if (e.isReminder) return (REMINDER_CATEGORIES[e.category] || REMINDER_CATEGORIES.other).color;
  return ALL_ACTIVITY_WEIGHTS[e.type]?.color || 'bg-gray-400';
};

// 月曆用的繽紛淺色小標籤 (跟 getEventColor 同一組色系，只是換成淺底深字的版本)
const PILL_COLOR_MAP = {
  blue: 'bg-blue-100 text-blue-700',
  red: 'bg-red-100 text-red-700',
  green: 'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
  indigo: 'bg-indigo-100 text-indigo-700',
  violet: 'bg-violet-100 text-violet-700',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-700',
  pink: 'bg-pink-100 text-pink-700',
  rose: 'bg-rose-100 text-rose-700',
  teal: 'bg-teal-100 text-teal-700',
  cyan: 'bg-cyan-100 text-cyan-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  amber: 'bg-amber-100 text-amber-700',
  sky: 'bg-sky-100 text-sky-700',
  gray: 'bg-gray-200 text-gray-700',
  black: 'bg-gray-200 text-gray-800'
};
const getEventPillClass = (e) => {
  const solidClass = getEventColor(e);
  if (solidClass === 'bg-black') return PILL_COLOR_MAP.black;
  const match = solidClass.match(/bg-([a-z]+)-\d+/);
  const family = match ? match[1] : 'gray';
  return PILL_COLOR_MAP[family] || PILL_COLOR_MAP.gray;
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

// 取消完成：把行程復原回「未完成」，並且把當初計入的 MEA 分數與拜訪軌跡一併還原
const undoCompleteScheduleEvent = async (event, ownerId) => {
  await updateDoc(doc(db, 'schedule_events', event.id), { status: 'scheduled', completedAt: null });
  if (event.isReminder) return;
  const docId = `${ownerId}_${event.date}`;
  const cascadeKeys = getCascadeKeys(event.type);
  const decrementPayload = {};
  cascadeKeys.forEach(k => { decrementPayload[k] = increment(-1); });
  await setDoc(doc(db, 'activity_record', docId), {
    agentId: ownerId,
    date: event.date,
    month: event.date.substring(0, 7),
    ...decrementPayload,
    updatedAt: new Date().toISOString()
  }, { merge: true });
  if (event.customerId) {
    await updateDoc(doc(db, 'customers', event.customerId), {
      visitLog: arrayRemove({ date: event.date, type: ALL_ACTIVITY_WEIGHTS[event.type]?.label || event.type, note: event.note || '' })
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

// 趨勢圖的發光圓點（最後一個點會呼吸）
const GlowDot = ({ cx, cy, index, color, total }) => {
  if (cx == null || cy == null) return null;
  const last = index === total - 1;
  return (
    <g>
      {last && <circle cx={cx} cy={cy} r={6} fill={color} opacity={0.35}><animate attributeName="r" values="5;14;5" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values=".45;0;.45" dur="2s" repeatCount="indefinite" /></circle>}
      <circle cx={cx} cy={cy} r={last ? 5 : 3.5} fill={color} stroke="#0b1020" strokeWidth={1.5} />
    </g>
  );
};

const ActivityDashboard = ({ team, activities, records, user, season, loggedInUser, onSearch }) => {
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

  // 近6個月趨勢 (跟目前選的月/週檢視獨立，永遠抓最近6個月)
  const monthlyTrend = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
    return months.map(m => {
      const monthRecords = records.filter(r => r.agentId === selectedAgentId && r.date.startsWith(m));
      const monthActivities = activities.filter(a => a.agentId === selectedAgentId && a.date && a.date.startsWith(m));
      const weighted = monthRecords.reduce((s, r) => s + (r.weighted || 0), 0);
      const fyc = monthRecords.reduce((s, r) => s + (r.premium || 0) * (PRODUCT_MAPPING[r.typeCode]?.commissionRate || 0), 0);
      const points = monthActivities.reduce((s, a) => {
        let dayScore = 0;
        Object.keys(ALL_ACTIVITY_WEIGHTS).forEach(k => { if (a[k]) dayScore += (a[k] || 0) * ALL_ACTIVITY_WEIGHTS[k].score; });
        return s + dayScore;
      }, 0);
      return { month: m.slice(5) + '月', weighted, fyc: Math.round(fyc), points };
    });
  }, [records, activities, selectedAgentId]);

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

  const canEditMobile = !!loggedInUser && (String(selectedAgentId) === String(loggedInUser.id) || loggedInUser.name === '吳政翰');

  return (
    <>
    <MobileActivityView team={team} selectedAgentId={selectedAgentId} setSelectedAgentId={setSelectedAgentId} viewMode={viewMode} setViewMode={setViewMode} periodMode={periodMode} setPeriodMode={setPeriodMode} periodRange={periodRange} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} currentMonths={currentMonths} shiftWeek={shiftWeek} stats={stats} monthlyTrend={monthlyTrend} activities={activities} canEdit={canEditMobile} formData={formData} setFormData={setFormData} handleSubmit={handleSubmit} isSubmitting={isSubmitting} onSearch={onSearch} />
    <div className="hidden md:flex flex-col gap-3 h-full md:min-h-[840px] text-white animate-fade-in">
      {/* 標題＋選擇器＋公式 */}
      <div className="grid grid-cols-[1fr_auto] gap-3 shrink-0">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl px-5 py-3.5">
          <h1 className="text-[28px] font-black leading-tight">MEA 活動量管理 <span className="font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-400">(P x C x I)</span></h1>
          <p className="text-[12.5px] text-white/50 mt-0.5">量大是致勝的關鍵。透過追蹤每日活動量，掌握面談次數 (I)、提升成交率 (C)，並優化件均保費 (P)。</p>
          <div className="flex flex-wrap items-center gap-2.5 mt-3">
            <select className="h-10 rounded-xl text-[14px] font-bold px-3 min-w-[110px]" value={selectedAgentId} onChange={(e) => setSelectedAgentId(e.target.value)}>
              {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            {periodMode === 'month' ? (
              <select className="h-10 rounded-xl text-[14px] font-bold px-3" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                {currentMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            ) : (
              <div className="flex items-center gap-2 h-10 px-3 rounded-xl border border-white/15 bg-white/[0.07]">
                <button type="button" onClick={() => shiftWeek(-1)} className="text-white/70 hover:text-white"><ChevronLeft size={16} /></button>
                <span className="text-[13px] font-bold whitespace-nowrap">{periodRange.start} ~ {periodRange.end}</span>
                <button type="button" onClick={() => shiftWeek(1)} className="text-white/70 hover:text-white"><ChevronRight size={16} /></button>
              </div>
            )}
            <div className="flex rounded-xl border border-white/15 bg-white/[0.06] p-1">
              {[['month', '月'], ['week', '週']].map(([k, l]) => <button key={k} type="button" onClick={() => setPeriodMode(k)} className={`px-4 h-8 rounded-lg text-[13px] font-bold ${periodMode === k ? 'bg-blue-600 shadow-[0_0_14px_rgba(37,99,235,.55)]' : 'text-white/60'}`}>{l}</button>)}
            </div>
            <div className="flex rounded-xl border border-white/15 bg-white/[0.06] p-1">
              {[['sales', '業務', 'bg-blue-600'], ['recruit', '增員', 'bg-teal-600']].map(([k, l, c]) => <button key={k} type="button" onClick={() => setViewMode(k)} className={`px-4 h-8 rounded-lg text-[13px] font-bold ${viewMode === k ? c : 'text-white/60'}`}>{l}</button>)}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl px-6 py-3.5 min-w-[470px] flex flex-col justify-center">
          <p className={`text-[12px] font-bold tracking-wide mb-1.5 ${viewMode === 'sales' ? 'text-indigo-300' : 'text-teal-300'}`}>{viewMode === 'sales' ? '本月業務 MEA 核心公式' : '本月增員 MEA 核心公式'}</p>
          {viewMode === 'sales' ? (
            <>
              <div className="flex items-center gap-4 font-mono">
                {[[formatMoney(stats.P).replace('$', ''), 'P (件均)'], [(stats.C * 100).toFixed(1) + '%', 'C (成交率)'], [stats.I, 'I (面談次數)']].map(([v, l], i) => (
                  <React.Fragment key={l}>{i > 0 && <span className="text-indigo-400 font-bold text-xl">x</span>}<div className="text-center"><span className="block text-[26px] font-bold leading-tight">{v}</span><span className="text-[11px] text-white/45">{l}</span></div></React.Fragment>
                ))}
                <span className="text-indigo-400 font-bold text-xl">=</span>
              </div>
              <p className="mt-1.5 pt-1.5 border-t border-white/10"><span className="text-[30px] font-bold text-emerald-400">{formatMoney(stats.totalPremium)}</span><span className="text-[12px] text-white/50 ml-2">總實收保費</span></p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 font-mono">
                {[[stats.recruitTotals.recruitInterview, 'I (增員面談)'], [(stats.recruitConversion * 100).toFixed(1) + '%', 'C (面談轉登錄率)']].map(([v, l], i) => (
                  <React.Fragment key={l}>{i > 0 && <span className="text-teal-400 font-bold text-xl">x</span>}<div className="text-center"><span className="block text-[26px] font-bold leading-tight">{v}</span><span className="text-[11px] text-white/45">{l}</span></div></React.Fragment>
                ))}
                <span className="text-teal-400 font-bold text-xl">=</span>
              </div>
              <p className="mt-1.5 pt-1.5 border-t border-white/10"><span className="text-[30px] font-bold text-teal-300">{stats.recruitTotals.recruitRegistered}</span><span className="text-[12px] text-white/50 ml-2">本月登錄人數</span></p>
            </>
          )}
        </div>
      </div>

      {(stats.totalPoints < 400 || stats.interviewPoints < 60) && (
        <div className="shrink-0 flex items-center gap-3 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-2.5">
          <AlertTriangle className="text-rose-300 shrink-0" size={20} />
          <p className="text-[13px] font-semibold text-rose-200">活動量未達標預警　{stats.totalPoints < 400 && <span className="mr-5">活動量總分 {stats.totalPoints} 分（目標 400）</span>}{stats.interviewPoints < 60 && <span>面談總分 {stats.interviewPoints} 分（目標 60）</span>}</p>
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-5 gap-3 shrink-0">
        {[
          { l: '本月活動量總分', v: stats.totalPoints, u: '/ 400', pct: Math.min(100, stats.totalPoints / 400 * 100), c: '#60a5fa', icon: ListPlus, red: stats.totalPoints < 400 },
          { l: '面談總分', v: stats.interviewPoints, u: '/ 60', pct: Math.min(100, stats.interviewPoints / 60 * 100), c: '#a78bfa', icon: MessageCircle, red: stats.interviewPoints < 60 },
          { l: '本月每分實收', v: formatMoney(stats.premiumPerPoint), sub: `總實收 ${formatMoney(stats.totalPremium)}`, c: '#34d399', icon: DollarSign },
          { l: '本月每分價值 (FYC)', v: formatMoney(stats.valuePerPoint), sub: `總FYC ${formatMoney(stats.totalFYC)}`, c: '#fbbf24', icon: Layers },
          { l: '業務活動分', v: stats.salesPoints, sub: `增員活動分 ${stats.recruitPoints}　總分 ${stats.totalPoints}`, c: '#38bdf8', icon: Activity },
        ].map(k => (
          <div key={k.l} className="rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl p-3 flex items-center gap-3 min-w-0">
            <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: k.c + '26', color: k.c }}><k.icon size={22} /></span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-white/60 truncate">{k.l}</p>
              <p className="leading-none mt-1"><span className="text-[24px] font-black">{k.v}</span>{k.u && <span className="text-[13px] text-white/45 ml-1.5">{k.u}</span>}</p>
              {k.pct !== undefined ? (
                <div className="mt-1.5 flex items-center gap-2"><div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${k.pct}%`, background: k.red ? 'linear-gradient(90deg,#fb7185,#f43f5e)' : k.c }} /></div><span className={`text-[11.5px] font-bold ${k.red ? 'text-rose-300' : 'text-emerald-300'}`}>{Math.round(k.pct)}%</span></div>
              ) : <p className="text-[11px] text-white/45 mt-1.5 truncate">{k.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* 日報＋漏斗 */}
      <div className="grid grid-cols-[360px_1fr] gap-3 flex-[1.5] min-h-0">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl p-4 flex flex-col min-h-0">
          <p className="font-bold text-[15px] flex items-center gap-2 shrink-0"><Edit3 size={16} className="text-blue-300" />活動量紀錄（日報）</p>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 mt-2">
            <input type="date" className="shrink-0 !h-8 !min-h-0 rounded-lg !text-[13px] font-bold px-3" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar mt-1.5 space-y-[3px]">
              {Object.entries(viewMode === 'sales' ? ACTIVITY_WEIGHTS : RECRUIT_ACTIVITY_WEIGHTS).map(([key, config]) => (
                <div key={key} className="flex items-center justify-between px-2.5 py-[3px] rounded-lg bg-white/[0.04] border border-white/[0.07]">
                  <div className="flex items-center gap-2 text-[13px]"><span className={`w-2 h-2 rounded-full ${config.color}`} /><span className="font-medium">{config.label}</span><span className="text-[10px] text-white/50 bg-white/10 px-1.5 rounded">x{config.score}</span></div>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => setFormData(p => ({ ...p, [key]: Math.max(0, p[key] - 1) }))} className="w-6 h-6 rounded-md border border-white/15 bg-white/[0.06] hover:bg-white/10 text-white/80 leading-none">-</button>
                    <input type="number" min="0" className="w-10 text-center !bg-transparent !border-0 font-bold outline-none text-[14px]" style={{ minHeight: 0, padding: 0 }} value={formData[key]} onChange={e => setFormData(p => ({ ...p, [key]: parseInt(e.target.value) || 0 }))} />
                    <button type="button" title={viewMode === 'sales' ? '完成此階段會自動補上前面的階段' : ''} onClick={() => setFormData(p => {
                      if (viewMode !== 'sales') return { ...p, [key]: p[key] + 1 };
                      const next = { ...p }; getCascadeKeys(key).forEach(k => { next[k] = (next[k] || 0) + 1; }); return next;
                    })} className="w-6 h-6 rounded-md border border-white/15 bg-white/[0.06] hover:bg-white/10 text-white/80 leading-none">+</button>
                  </div>
                </div>
              ))}
            </div>
            <button type="submit" disabled={isSubmitting} className="shrink-0 mt-2 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-[14px] flex justify-center items-center gap-2 shadow-[0_0_18px_rgba(37,99,235,.45)]">{isSubmitting ? <Loader2 size={16} className="animate-spin" /> : '儲存本日紀錄'}</button>
          </form>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl p-4 flex flex-col min-h-0">
          <p className="font-bold text-[15px] flex items-center gap-2 shrink-0"><Filter size={16} className={viewMode === 'sales' ? 'text-blue-300' : 'text-teal-300'} />{viewMode === 'sales' ? '銷售漏斗分析與轉換率' : '增員漏斗分析與轉換率'} <span className="text-white/45 font-normal text-[13px]">({periodMode === 'month' ? selectedMonth : `${periodRange.start} ~ ${periodRange.end}`})</span></p>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viewMode === 'sales' ? chartData : recruitChartData} layout="vertical" margin={{ top: 4, right: 36, left: 28, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,.08)" />
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={70} tick={{ fill: 'rgba(255,255,255,.8)', fontSize: 12, fontWeight: 600 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,.05)' }} contentStyle={{ background: '#0d1124', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, color: '#fff', fontSize: 12 }} formatter={(value) => [value, '次數']} />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={20} animationDuration={1100} label={{ position: 'right', fill: 'rgba(255,255,255,.85)', fontWeight: 'bold', fontSize: 13 }}>
                  {(viewMode === 'sales' ? chartData : recruitChartData).map((entry, index) => {
                    const arr = viewMode === 'sales' ? chartColors : recruitChartColors;
                    return <Cell key={`cell-${index}`} fill={arr[index % arr.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-3 shrink-0 mt-1.5 pt-2 border-t border-white/10 text-center">
            {viewMode === 'sales' ? (<>
              <div><p className="text-[11px] text-white/50">準客戶轉換約訪</p><p className="text-[20px] font-bold text-blue-300">{stats.totals.prospect > 0 ? Math.round((stats.totals.appointment / stats.totals.prospect) * 100) : 0}%</p></div>
              <div className="border-l border-white/10"><p className="text-[11px] text-white/50">約訪轉換面談</p><p className="text-[20px] font-bold text-violet-300">{stats.totals.appointment > 0 ? Math.round((stats.totals.interview / stats.totals.appointment) * 100) : 0}%</p></div>
              <div className="rounded-xl border border-rose-400/30 bg-rose-500/10"><p className="text-[11px] text-rose-300">成交率 (C) = 發單/面談</p><p className="text-[20px] font-bold text-rose-300">{(stats.C * 100).toFixed(1)}%</p></div>
            </>) : (<>
              <div><p className="text-[11px] text-white/50">準增員轉換約訪</p><p className="text-[20px] font-bold text-teal-300">{stats.recruitTotals.newRecruitProspect > 0 ? Math.round((stats.recruitTotals.recruitContact / stats.recruitTotals.newRecruitProspect) * 100) : 0}%</p></div>
              <div className="border-l border-white/10"><p className="text-[11px] text-white/50">約訪轉換面談</p><p className="text-[20px] font-bold text-cyan-300">{stats.recruitTotals.recruitContact > 0 ? Math.round((stats.recruitTotals.recruitInterview / stats.recruitTotals.recruitContact) * 100) : 0}%</p></div>
              <div className="rounded-xl border border-blue-400/30 bg-blue-500/10"><p className="text-[11px] text-blue-300">面談轉登錄率 (C)</p><p className="text-[20px] font-bold text-blue-300">{(stats.recruitConversion * 100).toFixed(1)}%</p></div>
            </>)}
          </div>
        </div>
      </div>

      {/* 商品線＋動態趨勢 */}
      <div className="grid grid-cols-[1fr_1.05fr] gap-3 flex-1 min-h-0">
        <div className="rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl p-4 flex flex-col min-h-0">
          <p className="font-bold text-[15px] flex items-center gap-2 shrink-0 mb-2"><PieChartIcon size={16} className="text-emerald-300" />各商品線業績分析 <span className="text-white/45 font-normal text-[13px]">({periodMode === 'month' ? selectedMonth : `${periodRange.start} ~ ${periodRange.end}`})</span></p>
          {viewMode === 'sales' ? (
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <table className="w-full text-[13px]">
                <thead className="text-white/45 text-[11.5px]"><tr className="text-right"><th className="text-left font-normal pb-1.5">商品線</th><th className="font-normal pb-1.5">實收保費</th><th className="font-normal pb-1.5">首年 (FYC)</th><th className="font-normal pb-1.5 text-center">佔比</th><th className="font-normal pb-1.5 text-center">件數</th><th className="font-normal pb-1.5">件均保費 (P)</th></tr></thead>
                <tbody>
                  {stats.productLines.map(line => (
                    <tr key={line.label} className="border-t border-white/[0.07] text-right">
                      <td className="py-1.5 text-left font-semibold whitespace-nowrap"><i className={`inline-block w-2 h-2 rounded-full mr-2 ${line.label.includes('AH') ? 'bg-emerald-400' : line.label.includes('RP') ? 'bg-blue-400' : 'bg-amber-400'}`} />{line.label}</td>
                      <td className="tabular-nums">{formatMoney(line.premium)}</td><td className="tabular-nums text-indigo-300">{formatMoney(line.fyc)}</td>
                      <td className="text-center text-white/70">{(line.ratio * 100).toFixed(1)}%</td><td className="text-center text-white/70">{line.cases}</td><td className="tabular-nums">{formatMoney(line.avg)}</td>
                    </tr>
                  ))}
                  <tr className="border-t border-white/20 font-bold text-right"><td className="py-1.5 text-left">總計</td><td className="tabular-nums">{formatMoney(stats.totalPremium)}</td><td className="tabular-nums text-indigo-300">{formatMoney(stats.totalFYC)}</td><td className="text-center">100%</td><td className="text-center">{stats.productLines.reduce((acc, l) => acc + l.cases, 0)}</td><td className="tabular-nums">{formatMoney(stats.P)}</td></tr>
                </tbody>
              </table>
            </div>
          ) : <p className="text-white/40 text-sm text-center py-8">增員模式沒有商品線資料，請切換到「業務」</p>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl p-4 flex flex-col min-h-0">
          <p className="font-bold text-[15px] flex items-center gap-2 shrink-0"><TrendingUp size={16} className="text-blue-300" />近6個月趨勢<span className="ml-auto flex items-center gap-1.5 text-[11px] text-emerald-300 font-semibold"><i className="w-1.5 h-1.5 rounded-full bg-emerald-400 jf-live-dot" />即時</span></p>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyTrend} margin={{ top: 10, right: 6, left: -8, bottom: 0 }}>
                <defs>
                  {[['gW', '#60a5fa'], ['gF', '#fbbf24'], ['gP', '#34d399']].map(([id, c]) => <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={0.35} /><stop offset="100%" stopColor={c} stopOpacity={0} /></linearGradient>)}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.07)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="l" tick={{ fill: 'rgba(255,255,255,.4)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 10000 ? (v / 10000) + '萬' : v} />
                <YAxis yAxisId="r" orientation="right" tick={{ fill: 'rgba(52,211,153,.6)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0d1124', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, color: '#fff', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                <Area yAxisId="l" type="monotone" dataKey="weighted" legendType="none" tooltipType="none" stroke="none" fill="url(#gW)" animationDuration={1600} />
                <Area yAxisId="r" type="monotone" dataKey="points" legendType="none" tooltipType="none" stroke="none" fill="url(#gP)" animationDuration={1600} />
                <Line yAxisId="l" type="monotone" dataKey="weighted" name="加權保費" stroke="#60a5fa" strokeWidth={3} dot={<GlowDot color="#60a5fa" total={monthlyTrend.length} />} activeDot={{ r: 7, strokeWidth: 3, stroke: '#fff' }} animationDuration={1800} style={{ filter: 'drop-shadow(0 0 7px rgba(96,165,250,.8))' }} />
                <Line yAxisId="l" type="monotone" dataKey="fyc" name="FYC(佣金)" stroke="#fbbf24" strokeWidth={3} dot={<GlowDot color="#fbbf24" total={monthlyTrend.length} />} activeDot={{ r: 7, strokeWidth: 3, stroke: '#fff' }} animationDuration={1800} style={{ filter: 'drop-shadow(0 0 7px rgba(251,191,36,.7))' }} />
                <Line yAxisId="r" type="monotone" dataKey="points" name="活動分數" stroke="#34d399" strokeWidth={3} dot={<GlowDot color="#34d399" total={monthlyTrend.length} />} activeDot={{ r: 7, strokeWidth: 3, stroke: '#fff' }} animationDuration={1800} style={{ filter: 'drop-shadow(0 0 7px rgba(52,211,153,.7))' }} />
                <Line yAxisId="l" type="monotone" dataKey="weighted" legendType="none" tooltipType="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={2} dot={false} activeDot={false} isAnimationActive={false} className="jf-flow-line" />
                <Line yAxisId="l" type="monotone" dataKey="fyc" legendType="none" tooltipType="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={2} dot={false} activeDot={false} isAnimationActive={false} className="jf-flow-line jf-flow-b" />
                <Line yAxisId="r" type="monotone" dataKey="points" legendType="none" tooltipType="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={2} dot={false} activeDot={false} isAnimationActive={false} className="jf-flow-line jf-flow-c" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
    </>
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
// --- 組織星圖：誰屬於誰一眼看懂。處經理是恆星、主管是行星、組員是衛星；點行星看介紹 ---
const ORG_RANK_STYLE = {
  '處經理': { color: '#fbbf24', r: 30, ring: true },
  '區經理': { color: '#a78bfa', r: 26, ring: true },
  '業務襄理': { color: '#38bdf8', r: 22, ring: false },
  '業務主任': { color: '#34d399', r: 20, ring: false },
  '新進業務主任': { color: '#2dd4bf', r: 18, ring: false },
  '業務代表': { color: '#94a3b8', r: 16, ring: false },
  '新進業代': { color: '#cbd5e1', r: 15, ring: false }
};
const orgStyleOf = (role) => ORG_RANK_STYLE[role] || { color: '#94a3b8', r: 16, ring: false };
const orgRankIdx = (role) => { const i = RANKS.indexOf(role); return i === -1 ? 99 : i; };
const orgGradId = (role) => { const i = Object.keys(ORG_RANK_STYLE).indexOf(role); return i === -1 ? 'og-g-x' : `og-g-${i}`; };
const PROMOTION_LABELS = { registered: '登錄', supervisor: '升任主任', asstManager: '升任襄理', distManager: '升任區經理', agencyManager: '升任處經理' };
const shadeHex = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, v));
  const r = c((n >> 16) + amt), g = c(((n >> 8) & 255) + amt), b = c((n & 255) + amt);
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
};

const OrgChart = ({ team, recruits }) => <OrgChartManage team={team} recruits={recruits} />;

const OrgChartManage = ({ team, recruits }) => {
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
            <div className="h-6 w-px bg-white/25"></div>
            {(members.length + candidates.length) > 1 && <div className="w-full h-px bg-white/25 mb-6 relative"></div>}
            {(members.length + candidates.length) === 1 && <div className="h-6 w-px bg-white/25"></div>}
          </div>
        )}
        <div className="flex gap-8 items-start justify-center pt-2 min-w-max">
          {members.map((member) => (
            <div key={member.id} className="flex flex-col items-center relative">
               {(members.length + candidates.length) > 1 && <div className="absolute -top-8 w-px h-6 bg-white/25"></div>}
               <div className="w-44 p-4 text-center rounded-3xl border border-white/10 border-t-2 border-t-indigo-400 bg-white/[0.06] backdrop-blur-xl hover:-translate-y-1 hover:bg-white/[0.1] transition relative group z-10 cursor-pointer" onClick={() => setEditMember(member)}>
                 <Avatar name={member.name} size={48} className="mx-auto mb-3" />
                 <h4 className="font-bold text-white">{member.name}</h4>
                 <p className="text-xs text-indigo-200 bg-indigo-500/20 px-2 py-0.5 rounded-full inline-block mt-2 font-medium">{member.role}</p>
                 <button onClick={(e) => { e.stopPropagation(); setDeleteInfo({ id: member.id, isRecruit: false }); }} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14} /></button>
               </div>
               {renderTree(member.id, depth + 1)}
            </div>
          ))}
          
          {candidates.map((recruit) => (
            <div key={recruit.id} className="flex flex-col items-center relative">
               {(members.length + candidates.length) > 1 && <div className="absolute -top-8 w-px h-6 bg-white/25"></div>}
               <div className="w-44 p-4 text-center bg-white/[0.03] border-2 border-dashed border-white/20 rounded-3xl relative group z-10 hover:border-white/40 transition-colors">
                 <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white/60 font-bold mx-auto mb-3 text-lg">{recruit.name[0]}</div>
                 <h4 className="font-bold text-white/70">{recruit.name}</h4>
                 <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full inline-block mt-2">準增員 ({recruit.status})</span>
                 <button onClick={() => setDeleteInfo({ id: recruit.id, isRecruit: true })} className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={14} /></button>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in pb-12 md:pb-0 md:h-full md:min-h-[840px] flex flex-col gap-3 text-white">
      <ConfirmModal 
        isOpen={!!deleteInfo} 
        onClose={() => setDeleteInfo(null)} 
        onConfirm={handleDeleteConfirm} 
        title={`刪除${deleteInfo?.isRecruit ? '準增員' : '成員'}`} 
        message={`確定要刪除此${deleteInfo?.isRecruit ? '準增員' : '成員'}嗎？如果該成員有下線，組織圖可能會斷開連結。`} 
      />
      <div className="shrink-0 flex items-start justify-between gap-4 pt-1 flex-wrap">
        <div className="text-left"><h1 className="text-[26px] font-bold tracking-tight leading-none">組織架構</h1><p className="text-[12px] text-white/45 mt-1.5">團隊成員與準增員的上下線關係，點成員卡可編輯</p></div>
      </div>
      <div className="shrink-0 flex flex-wrap items-end gap-3 rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-xl p-4">
        <div className="w-32 text-left">
           <label className="text-[11px] font-bold text-white/50 mb-1 block">類型</label>
           <select className="w-full px-3 py-2 bg-white/[0.08] border border-white/10 text-white rounded-xl outline-none" value={newMember.type} onChange={e => setNewMember({...newMember, type: e.target.value})}>
             <option value="正式人員">正式人員</option>
             <option value="準增員對象">準增員對象</option>
           </select>
        </div>
        <div className="flex-1 text-left min-w-[150px]">
           <label className="text-[11px] font-bold text-white/50 mb-1 block">姓名</label>
           <input type="text" className="w-full px-3 py-2 bg-white/[0.08] border border-white/10 text-white rounded-xl outline-none" placeholder="輸入姓名" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})}/>
        </div>
        {newMember.type === '正式人員' && (
          <div className="w-40 text-left">
             <label className="text-[11px] font-bold text-white/50 mb-1 block">職級</label>
             <select className="w-full px-3 py-2 bg-white/[0.08] border border-white/10 text-white rounded-xl outline-none" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}>
               {RANKS.map(r => <option key={r} value={r}>{r}</option>)}
             </select>
          </div>
        )}
        <div className="w-40 text-left">
           <label className="text-[11px] font-bold text-white/50 mb-1 block">{newMember.type === '正式人員' ? '直屬主管' : '推薦人'}</label>
           <select className="w-full px-3 py-2 bg-white/[0.08] border border-white/10 text-white rounded-xl outline-none" value={newMember.parentId || ''} onChange={e => setNewMember({...newMember, parentId: e.target.value})}>
             <option value="">(請選擇)</option>
             {team.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
           </select>
        </div>
        <button disabled={loading} onClick={handleAdd} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/25 transition h-[40px] flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin"/> : <><Plus size={16} /> 新增</>}
        </button>
      </div>
      
      <div className="md:flex-1 md:min-h-0 md:grid md:grid-cols-[250px_minmax(0,1fr)] gap-3 flex flex-col">
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-xl p-4 text-left md:overflow-y-auto no-scrollbar">
          <p className="font-bold text-[15px] mb-3">團隊概況</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="rounded-2xl bg-white/[0.06] p-3"><p className="text-[11px] text-white/50">正式人員</p><p className="text-[24px] font-black leading-none mt-1">{team.length}</p></div>
            <div className="rounded-2xl bg-white/[0.06] p-3"><p className="text-[11px] text-white/50">準增員</p><p className="text-[24px] font-black leading-none mt-1">{(recruits || []).filter(r => !r.isPromoted).length}</p></div>
          </div>
          <p className="text-[11px] text-white/45 mb-2">職級分佈</p>
          <div className="space-y-1.5 mb-4">
            {RANKS.map(r => ({ r, n: team.filter(m => m.role === r).length })).filter(x => x.n > 0).map(x => (
              <div key={x.r} className="flex items-center gap-2 text-[12px]"><span className="flex-1 truncate text-white/80">{x.r}</span><div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-indigo-400" style={{ width: `${x.n / Math.max(1, team.length) * 100}%` }} /></div><b className="w-5 text-right tabular-nums">{x.n}</b></div>
            ))}
          </div>
          <p className="text-[11px] text-white/45 mb-2">成員</p>
          <div className="space-y-1">
            {team.map(m => (
              <button key={m.id} type="button" onClick={() => setEditMember(m)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/[0.07] text-left"><Avatar name={m.name} size={26} /><span className="flex-1 text-[13px] font-semibold truncate">{m.name}</span><span className="text-[10px] text-white/40 truncate max-w-[80px]">{m.role}</span></button>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl overflow-auto no-scrollbar p-4 min-h-[320px]">
          <div className="inline-block min-w-full text-center">
            {renderTree(null)}
          </div>
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


// --- 成員頭像：照片放在 public/avatars/，沒有照片的人顯示姓名首字 ---
const AVATAR_FILES = { '吳政翰': 'wzh', '李冠葒': 'lgh', '陳鈺雯': 'cyw', '蘇暐翔': 'sww', '楊雅涵': 'yyh' };
const Avatar = ({ name, size = 36, className = '', style = {}, title }) => {
  const [broken, setBroken] = useState(false);
  const key = AVATAR_FILES[String(name || '').trim()];
  const base = { width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.42)), ...style };
  if (key && !broken) {
    return <img src={`/avatars/${key}.jpg`} alt={name} title={title || name} onError={() => setBroken(true)} draggable={false}
      className={`rounded-full object-cover shrink-0 ${className}`} style={base} />;
  }
  return (
    <span title={title || name} className={`rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-white inline-flex items-center justify-center font-bold shrink-0 ${className}`} style={base}>
      {String(name || '?').charAt(0)}
    </span>
  );
};

// --- 手機版：增員儀表板（深色玻璃風）---
const RECRUIT_STAGE_TONE = {
  '新名單': { c: '#60a5fa', g: 'from-blue-500 to-sky-400' },
  '臨時帳號': { c: '#818cf8', g: 'from-indigo-500 to-blue-400' },
  '內考': { c: '#22d3ee', g: 'from-cyan-500 to-teal-400' },
  '外考': { c: '#a78bfa', g: 'from-violet-500 to-purple-400' },
  '登錄': { c: '#34d399', g: 'from-emerald-500 to-green-400' },
  '優培': { c: '#fbbf24', g: 'from-amber-500 to-orange-400' },
};
const RECRUIT_DATE_FIELDS = [
  { label: '臨時帳號', key: 'tempAccountDate' }, { label: '內考日期', key: 'internalExamDate' },
  { label: '外考日期', key: 'externalExamDate' }, { label: '預計登錄', key: 'registeredDate' }, { label: '優培開始', key: 'trainingDate' },
];
const MobileRecruitView = ({ recruits, team, status, updateRecruit, toggleDoc, onDelete, onPromote, loadingId, canEdit }) => {
  const today = getTodayDate();
  const [tab, setTab] = useState('overview');
  const [month, setMonth] = useState(today.slice(0, 7));
  const [stage, setStage] = useState('all');
  const [detailId, setDetailId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const nameOf = (id) => team.find(m => m.id === id)?.name || '—';
  const list = useMemo(() => recruits.map(r => ({ ...r, st: status(r) })), [recruits, status]);
  const idxOf = (st) => RECRUIT_STATUSES.indexOf(st);
  const isReg = (r) => idxOf(r.st) >= 4 || r.isPromoted;
  const monthReg = list.filter(r => isReg(r) && (r.dates?.registeredDate || '').startsWith(month)).length;
  const monthQual = list.filter(r => r.st === '優培' && (r.dates?.trainingDate || '').startsWith(month)).length;
  const yearReg = list.filter(isReg).length;
  const yearQual = list.filter(r => r.st === '優培').length;
  const examing = list.filter(r => !r.isPromoted && ['臨時帳號', '內考', '外考'].includes(r.st)).length;
  const pct = (a, b) => b ? Math.min(100, Math.round(a / b * 100)) : 0;

  const reach = RECRUIT_STATUSES.map((s, i) => list.filter(r => (r.isPromoted ? 4 : idxOf(r.st)) >= i).length);
  const stageCount = RECRUIT_STATUSES.map(s => list.filter(r => r.st === s).length);
  const maxStage = Math.max(1, ...stageCount);

  const nextDate = (r) => {
    const c = RECRUIT_DATE_FIELDS.map(f => ({ label: f.label, d: r.dates?.[f.key] })).filter(x => x.d && x.d >= today).sort((a, b) => a.d.localeCompare(b.d))[0];
    return c ? { label: c.label, d: c.d.slice(5).replace('-', '/') } : null;
  };
  const sortedList = useMemo(() => [...list].sort((a, b) => (b.isPromoted ? -1 : 0) - (a.isPromoted ? -1 : 0) || idxOf(b.st) - idxOf(a.st)), [list]);
  const shown = (tab === 'track' ? sortedList.filter(r => stage === 'all' || r.st === stage) : (showAll ? sortedList : sortedList.slice(0, 5)));

  const owners = team.map(m => ({ m, n: list.filter(r => r.recruiterId === m.id).length, reg: list.filter(r => r.recruiterId === m.id && isReg(r)).length, qual: list.filter(r => r.recruiterId === m.id && r.st === '優培').length, mReg: list.filter(r => r.recruiterId === m.id && isReg(r) && (r.dates?.registeredDate || '').startsWith(month)).length, mQual: list.filter(r => r.recruiterId === m.id && r.st === '優培' && (r.dates?.trainingDate || '').startsWith(month)).length })).filter(o => o.n > 0 || o.reg > 0).sort((a, b) => b.n - a.n);
  const donutColors = ['#a78bfa', '#60a5fa', '#22d3ee', '#34d399', '#fbbf24', '#fb7185'];
  const donutTotal = owners.reduce((s, o) => s + o.n, 0) || 1;
  let acc = 0;
  const donutStops = owners.map((o, i) => { const a = acc / donutTotal * 100; acc += o.n; return `${donutColors[i % 6]} ${a}% ${acc / donutTotal * 100}%`; }).join(', ');

  const detail = list.find(r => r.id === detailId);
  const card = 'rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur-xl';
  const StagePill = ({ s }) => <span className="px-2 py-0.5 rounded-md text-[11px] font-bold border whitespace-nowrap" style={{ color: RECRUIT_STAGE_TONE[s].c, borderColor: RECRUIT_STAGE_TONE[s].c + '66', background: RECRUIT_STAGE_TONE[s].c + '1a' }}>{s}</span>;

  const Row = ({ r }) => {
    const nx = nextDate(r);
    return (
      <button type="button" onClick={() => setDetailId(r.id)} className="w-full grid grid-cols-[1.2fr_78px_1fr_44px] items-center gap-2 py-3 border-t border-white/[0.07] text-left">
        <div className="flex items-center gap-2 min-w-0"><Avatar name={r.name} size={34} /><span className="font-semibold text-[14px] truncate">{r.name}</span></div>
        <div><StagePill s={r.st} /></div>
        <div className="min-w-0 text-[12px] text-white/60 truncate">{nx ? <><span className="text-white/80">{nx.label}</span> {nx.d}</> : '—'}</div>
        <div className="flex items-center gap-1.5"><Avatar name={nameOf(r.recruiterId)} size={22} /><ChevronRight size={14} className="text-white/35" /></div>
      </button>
    );
  };

  return (
    <>
    <div className="md:hidden text-white pb-28 animate-fade-in">
      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="min-w-0">
          <h1 className="text-[27px] font-black tracking-tight leading-tight">增員儀表板</h1>
          <p className="text-[12.5px] text-white/50 mt-1">打造更強的團隊，從今天開始。</p>
        </div>
        <label className="relative shrink-0 flex items-center gap-1.5 rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur px-3 py-2.5 text-[13.5px] font-semibold">
          <Calendar size={16} className="text-white/70" />{month.replace('-', '年')}月<ChevronDown size={14} className="text-white/60" />
          <input type="month" value={month} onChange={e => e.target.value && setMonth(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full" />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-1 p-1 rounded-2xl border border-white/10 bg-white/[0.05] backdrop-blur">
        {[['overview', '總覽'], ['goal', '目標進度'], ['track', '準增員追蹤'], ['member', '成員表現']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setTab(k)} className={`py-2.5 rounded-xl text-[12.5px] font-bold transition ${tab === k ? 'bg-blue-500 text-white shadow-[0_0_18px_rgba(59,130,246,.55)]' : 'text-white/55'}`}>{l}</button>
        ))}
      </div>

      {(tab === 'overview' || tab === 'goal') && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[['本月登錄', monthReg, yearReg, GOAL_REGISTER, 'from-blue-500 to-indigo-400', Users, '#818cf8'], ['本月優培', monthQual, yearQual, GOAL_QUALITY, 'from-amber-500 to-orange-400', Star, '#fbbf24']].map(([l, v, y, g, grad, Ic, col]) => (
            <div key={l} className={`${card} p-3.5`}>
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: col + '26', color: col }}><Ic size={22} /></span>
                <div className="min-w-0"><p className="text-[12px] text-white/60">{l}</p><p className="leading-none mt-1"><span className="text-[28px] font-black">{v}</span><span className="text-[13px] text-white/50"> 人</span></p></div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className={`h-full rounded-full bg-gradient-to-r ${grad}`} style={{ width: `${pct(y, g)}%` }} /></div>
              <p className="text-[11px] text-white/50 mt-1.5 flex justify-between"><span>年度 {y} / {g} 人</span><span>{pct(y, g)}%</span></p>
            </div>
          ))}
        </div>
      )}

      {tab === 'overview' && (
        <>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[['名單總數', list.filter(r => !r.isPromoted).length, '#60a5fa', UserPlus], ['考試中', examing, '#34d399', FileText], ['優培', yearQual, '#a78bfa', Award], ['已登錄', yearReg, '#fbbf24', CheckCircle2]].map(([l, v, col, Ic]) => (
              <div key={l} className={`${card} p-2.5`}>
                <Ic size={18} style={{ color: col }} />
                <p className="text-[11px] text-white/60 mt-1.5 truncate">{l}</p>
                <p className="leading-none mt-1"><span className="text-[22px] font-black">{v}</span><span className="text-[11px] text-white/50"> 人</span></p>
              </div>
            ))}
          </div>

          <div className={`${card} mt-3 p-3.5`}>
            <p className="font-bold text-[15px] flex items-center gap-2"><Filter size={16} className="text-blue-400" />準增員轉換漏斗</p>
            <div className="mt-3 overflow-x-auto -mx-1 px-1">
              <div className="grid grid-cols-6 gap-1 min-w-[330px]">
                {RECRUIT_STATUSES.map((s, i) => (
                  <div key={s} className="text-center">
                    <div className={`h-9 flex items-center justify-center text-[11px] font-bold text-white bg-gradient-to-r ${RECRUIT_STAGE_TONE[s].g}`} style={{ clipPath: 'polygon(0 0, 82% 0, 100% 50%, 82% 100%, 0 100%, 18% 50%)' }}>{s === '臨時帳號' ? '臨時' : s}</div>
                    <p className="text-[22px] font-black mt-2 leading-none">{reach[i]}</p>
                    <p className="text-[11px] mt-1" style={{ color: RECRUIT_STAGE_TONE[s].c }}>{pct(reach[i], reach[0])}%</p>
                    <p className="text-[10.5px] text-white/45 mt-1.5 pt-1.5 border-t border-white/10">{i === 0 ? '全部' : `轉換 ${pct(reach[i], reach[i - 1])}%`}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`${card} mt-3 px-3.5 pt-3.5 pb-1`}>
            <div className="flex items-center justify-between mb-1"><p className="font-bold text-[15px] flex items-center gap-2"><Users size={16} className="text-blue-400" />準增員名單<span className="text-white/50 font-medium">（{list.length}）</span></p>
              <button type="button" onClick={() => setTab('track')} className="text-[12px] text-blue-300 font-semibold">查看全部</button></div>
            <div className="grid grid-cols-[1.2fr_78px_1fr_44px] gap-2 text-[11px] text-white/40 pb-1.5"><span>姓名</span><span>階段</span><span>下一個日期</span><span>推薦人</span></div>
            {shown.length === 0 && <p className="text-center text-white/40 text-sm py-6 border-t border-white/[0.07]">目前沒有準增員資料</p>}
            {shown.map(r => <Row key={r.id} r={r} />)}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className={`${card} p-3.5`}>
              <p className="font-bold text-[14px]">推薦人分佈</p>
              <div className="flex items-center gap-3 mt-3">
                <div className="relative w-[84px] h-[84px] shrink-0 rounded-full" style={{ background: owners.length ? `conic-gradient(${donutStops})` : 'rgba(255,255,255,.1)' }}>
                  <div className="absolute inset-[11px] rounded-full bg-[#0b1020] flex flex-col items-center justify-center"><span className="text-[20px] font-black leading-none">{list.length}</span><span className="text-[9px] text-white/50">準增員</span></div>
                </div>
                <div className="space-y-1.5 min-w-0">{owners.slice(0, 4).map((o, i) => <p key={o.m.id} className="text-[11.5px] flex items-center gap-1.5 truncate"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: donutColors[i % 6] }} />{o.m.name}<span className="text-white/45">{o.n}</span></p>)}</div>
              </div>
            </div>
            <div className={`${card} p-3.5`}>
              <p className="font-bold text-[14px]">階段分佈</p>
              <div className="flex items-end justify-between gap-1 h-[92px] mt-3">
                {RECRUIT_STATUSES.map((s, i) => (
                  <div key={s} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                    <span className="text-[11px] font-bold" style={{ color: RECRUIT_STAGE_TONE[s].c }}>{stageCount[i]}</span>
                    <div className="w-full rounded-t-md" style={{ height: `${Math.max(4, stageCount[i] / maxStage * 56)}px`, background: RECRUIT_STAGE_TONE[s].c }} />
                    <span className="text-[9px] text-white/50 whitespace-nowrap">{s.length > 3 ? s.slice(0, 2) : s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'goal' && (
        <div className="mt-3 space-y-3">
          {[['年度登錄', yearReg, GOAL_REGISTER, 'from-blue-500 to-indigo-400'], ['年度優培', yearQual, GOAL_QUALITY, 'from-amber-500 to-orange-400']].map(([l, v, g, grad]) => (
            <div key={l} className={`${card} p-4`}>
              <div className="flex items-end justify-between"><p className="font-bold">{l}</p><p><span className="text-[26px] font-black">{v}</span><span className="text-white/50 text-sm"> / {g} 人</span></p></div>
              <div className="mt-3 h-2.5 rounded-full bg-white/10 overflow-hidden"><div className={`h-full rounded-full bg-gradient-to-r ${grad}`} style={{ width: `${pct(v, g)}%` }} /></div>
              <p className="text-[12px] text-white/55 mt-2">{pct(v, g)}%　還差 {Math.max(0, g - v)} 人</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'track' && (
        <div className="mt-3">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {['all', ...RECRUIT_STATUSES].map(s => <button key={s} type="button" onClick={() => setStage(s)} className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12.5px] font-semibold border ${stage === s ? 'bg-blue-500 border-blue-400 text-white' : 'border-white/15 bg-white/[0.05] text-white/65'}`}>{s === 'all' ? `全部 ${list.length}` : `${s} ${stageCount[idxOf(s)]}`}</button>)}
          </div>
          <div className={`${card} px-3.5 pt-1 pb-1 mt-1`}>
            {shown.length === 0 && <p className="text-center text-white/40 text-sm py-8">沒有符合的準增員</p>}
            {shown.map((r, i) => <div key={r.id} className={i === 0 ? '[&>button]:border-t-0' : ''}><Row r={r} /></div>)}
          </div>
        </div>
      )}

      {tab === 'member' && (
        <div className="mt-3 space-y-2.5">
          {owners.length === 0 && <p className="text-center text-white/40 text-sm py-8">目前沒有資料</p>}
          {owners.map(o => (
            <div key={o.m.id} className={`${card} p-3.5`}>
              <div className="flex items-center gap-3"><Avatar name={o.m.name} size={44} /><div className="flex-1 min-w-0"><p className="font-bold">{o.m.name}</p><p className="text-[11.5px] text-white/50">準增員 {o.n} 人</p></div></div>
              <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                {[['本月登錄', o.mReg, '#818cf8'], ['本月優培', o.mQual, '#fbbf24'], ['累積登錄', o.reg, '#34d399'], ['累積優培', o.qual, '#fbbf24']].map(([l, v, c]) => <div key={l} className="rounded-xl bg-white/[0.05] py-2"><p className="text-[18px] font-black" style={{ color: c }}>{v}</p><p className="text-[10.5px] text-white/50 mt-0.5">{l}</p></div>)}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
      <div className="hidden md:flex flex-col gap-3 h-full md:min-h-[840px] text-white animate-fade-in">
        <div className="flex items-center justify-between gap-4 shrink-0">
          <div><h1 className="text-[26px] font-bold tracking-tight leading-none">增員儀表板</h1><p className="text-[12px] text-white/45 mt-1.5">打造更強的團隊，從今天開始。</p></div>
          <label className="relative flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2 text-[13px] font-bold cursor-pointer">
            <Calendar size={15} className="text-white/70" />{month.replace('-', '年')}月<ChevronDown size={14} className="text-white/60" />
            <input type="month" value={month} onChange={e => e.target.value && setMonth(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
          </label>
        </div>
        <div className="grid grid-cols-8 gap-3 shrink-0">
          {[['本月登錄', monthReg, yearReg, GOAL_REGISTER, 'from-blue-500 to-indigo-400', Users, '#818cf8'], ['本月優培', monthQual, yearQual, GOAL_QUALITY, 'from-amber-500 to-orange-400', Star, '#fbbf24']].map(([l, v, y, g, grad, Ic, col]) => (
            <div key={l} className={`${card} col-span-2 p-4`}>
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: col + '26', color: col }}><Ic size={22} /></span>
                <div className="min-w-0"><p className="text-[12px] text-white/60">{l}</p><p className="leading-none mt-1"><span className="text-[28px] font-black">{v}</span><span className="text-[13px] text-white/50"> 人</span></p></div>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className={`h-full rounded-full bg-gradient-to-r ${grad}`} style={{ width: `${pct(y, g)}%` }} /></div>
              <p className="text-[11px] text-white/50 mt-1.5 flex justify-between"><span>年度 {y} / {g} 人，還差 {Math.max(0, g - y)} 人</span><span>{pct(y, g)}%</span></p>
            </div>
          ))}
          {[['名單總數', list.filter(r => !r.isPromoted).length, '#60a5fa', UserPlus], ['考試中', examing, '#34d399', FileText], ['優培', yearQual, '#a78bfa', Award], ['已登錄', yearReg, '#fbbf24', CheckCircle2]].map(([l, v, col, Ic]) => (
            <div key={l} className={`${card} p-4 flex flex-col justify-between`}>
              <Ic size={18} style={{ color: col }} />
              <div><p className="text-[11px] text-white/60 mt-2">{l}</p><p className="leading-none mt-1"><span className="text-[26px] font-black">{v}</span><span className="text-[11px] text-white/50"> 人</span></p></div>
            </div>
          ))}
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-3">
          <div className="flex flex-col gap-3 min-h-0">
            <div className={`${card} p-4 shrink-0`}>
              <p className="font-bold text-[15px] flex items-center gap-2"><Filter size={16} className="text-blue-400" />準增員轉換漏斗</p>
              <div className="mt-3 grid grid-cols-6 gap-1.5">
                {RECRUIT_STATUSES.map((s, i) => (
                  <div key={s} className="text-center">
                    <div className={`h-9 flex items-center justify-center text-[12px] font-bold text-white bg-gradient-to-r ${RECRUIT_STAGE_TONE[s].g}`} style={{ clipPath: 'polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%, 12% 50%)' }}>{s}</div>
                    <p className="text-[22px] font-black mt-2 leading-none">{reach[i]}</p>
                    <p className="text-[11px] mt-1" style={{ color: RECRUIT_STAGE_TONE[s].c }}>{pct(reach[i], reach[0])}%</p>
                    <p className="text-[10.5px] text-white/45 mt-1.5 pt-1.5 border-t border-white/10">{i === 0 ? '全部' : `轉換 ${pct(reach[i], reach[i - 1])}%`}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${card} p-4 flex-1 min-h-0 flex flex-col`}>
              <div className="flex items-center justify-between mb-2 gap-2 shrink-0">
                <p className="font-bold text-[15px] flex items-center gap-2"><Users size={16} className="text-blue-400" />準增員名單<span className="text-white/45 font-medium text-[12px]">{sortedList.filter(r => stage === 'all' || r.st === stage).length} 人</span></p>
                <div className="flex gap-1.5">
                  {['all', ...RECRUIT_STATUSES].map(s => <button key={s} type="button" onClick={() => setStage(s)} className={`px-3 py-1 rounded-full text-[12px] font-semibold border ${stage === s ? 'bg-blue-500/25 border-blue-400/50 text-blue-200' : 'border-white/10 bg-white/[0.05] text-white/60'}`}>{s === 'all' ? '全部' : s}</button>)}
                </div>
              </div>
              <div className="grid grid-cols-[minmax(0,1.3fr)_90px_minmax(0,1fr)_minmax(0,1fr)] gap-3 text-[11px] text-white/40 pb-1.5 px-1 shrink-0"><span>姓名</span><span>階段</span><span>下一個日期</span><span>推薦人</span></div>
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar divide-y divide-white/[0.06]">
                {sortedList.filter(r => stage === 'all' || r.st === stage).length === 0 && <p className="text-center text-white/40 text-sm py-8">沒有符合的準增員</p>}
                {sortedList.filter(r => stage === 'all' || r.st === stage).map(r => {
                  const nx = nextDate(r);
                  return (
                    <button key={r.id} type="button" onClick={() => setDetailId(r.id)} className="w-full grid grid-cols-[minmax(0,1.3fr)_90px_minmax(0,1fr)_minmax(0,1fr)] gap-3 items-center px-1 py-2.5 text-left hover:bg-white/[0.05]">
                      <div className="flex items-center gap-2 min-w-0"><Avatar name={r.name} size={32} /><span className="font-semibold text-[14px] truncate">{r.name}</span></div>
                      <div><StagePill s={r.st} /></div>
                      <div className="min-w-0 text-[12px] text-white/60 truncate">{nx ? <><span className="text-white/80">{nx.label}</span> {nx.d}</> : '—'}</div>
                      <div className="flex items-center gap-1.5 min-w-0"><Avatar name={nameOf(r.recruiterId)} size={22} /><span className="text-[12px] text-white/70 truncate">{nameOf(r.recruiterId)}</span><ChevronRight size={14} className="text-white/30 ml-auto shrink-0" /></div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 min-h-0">
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className={`${card} p-4`}>
                <p className="font-bold text-[14px]">推薦人分佈</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="relative w-[84px] h-[84px] shrink-0 rounded-full" style={{ background: owners.length ? `conic-gradient(${donutStops})` : 'rgba(255,255,255,.1)' }}>
                    <div className="absolute inset-[11px] rounded-full bg-[#0b1020] flex flex-col items-center justify-center"><span className="text-[20px] font-black leading-none">{list.length}</span><span className="text-[9px] text-white/50">總人數</span></div>
                  </div>
                  <div className="space-y-1.5 min-w-0">{owners.slice(0, 4).map((o, i) => <p key={o.m.id} className="text-[11.5px] flex items-center gap-1.5 truncate"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: donutColors[i % 6] }} />{o.m.name} {o.n}</p>)}</div>
                </div>
              </div>
              <div className={`${card} p-4`}>
                <p className="font-bold text-[14px]">階段分佈</p>
                <div className="flex items-end justify-between gap-1 h-[92px] mt-3">
                  {RECRUIT_STATUSES.map((s, i) => (
                    <div key={s} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                      <span className="text-[11px] font-bold" style={{ color: RECRUIT_STAGE_TONE[s].c }}>{stageCount[i]}</span>
                      <div className="w-full rounded-t-md" style={{ height: `${Math.max(4, stageCount[i] / maxStage * 56)}px`, background: RECRUIT_STAGE_TONE[s].c }} />
                      <span className="text-[9px] text-white/50 whitespace-nowrap">{s.length > 3 ? s.slice(0, 2) : s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className={`${card} p-4 flex-1 min-h-0 flex flex-col`}>
              <p className="font-bold text-[15px] mb-2 shrink-0">成員表現</p>
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2">
                {owners.length === 0 && <p className="text-center text-white/40 text-sm py-8">目前沒有資料</p>}
                {owners.map(o => (
                  <div key={o.m.id} className="rounded-xl bg-white/[0.04] p-3">
                    <div className="flex items-center gap-2.5"><Avatar name={o.m.name} size={34} /><div className="flex-1 min-w-0"><p className="font-bold text-[14px]">{o.m.name}</p><p className="text-[11px] text-white/50">準增員 {o.n} 人</p></div></div>
                    <div className="grid grid-cols-4 gap-2 mt-2 text-center">
                      {[['本月登錄', o.mReg, '#818cf8'], ['本月優培', o.mQual, '#fbbf24'], ['累積登錄', o.reg, '#34d399'], ['累積優培', o.qual, '#fbbf24']].map(([l, v, c]) => <div key={l} className="rounded-lg bg-white/[0.05] py-1.5"><p className="text-[16px] font-black" style={{ color: c }}>{v}</p><p className="text-[10px] text-white/50">{l}</p></div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {detail && (
        <div className="fixed inset-0 z-[120] flex flex-col justify-end md:justify-center md:items-center" onClick={() => setDetailId(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative rounded-t-3xl md:rounded-3xl md:w-full md:max-w-lg border-t md:border border-white/15 bg-[#0c1020] max-h-[88vh] overflow-y-auto no-scrollbar px-4 pt-3 pb-[calc(env(safe-area-inset-bottom,0px)+20px)]" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 rounded-full bg-white/25 mx-auto mb-3" />
            <div className="flex items-center gap-3">
              <Avatar name={detail.name} size={52} />
              <div className="flex-1 min-w-0"><p className="text-[18px] font-bold">{detail.name} {detail.isPromoted && <span className="text-[11px] text-emerald-300 ml-1">已轉正</span>}</p><div className="flex items-center gap-2 mt-1"><StagePill s={detail.st} /><span className="text-[12px] text-white/50 flex items-center gap-1">推薦人 <Avatar name={nameOf(detail.recruiterId)} size={18} />{nameOf(detail.recruiterId)}</span></div></div>
              <button type="button" onClick={() => setDetailId(null)} className="p-2 text-white/60"><X size={20} /></button>
            </div>
            <p className="text-[12px] text-white/45 mt-4 mb-2">關鍵日期</p>
            <div className="space-y-2">
              {RECRUIT_DATE_FIELDS.map(f => (
                <div key={f.key} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.05] px-3 py-2">
                  <span className="text-[13px] text-white/75 shrink-0">{f.label}</span>
                  {detail.isPromoted || !canEdit ? <span className="text-[13px] text-white/50">{detail.dates?.[f.key] || '-'}</span>
                    : <DateSelect yearsBack={3} yearsForward={3} value={detail.dates?.[f.key] || ''} onChange={val => updateRecruit(detail.id, { dates: { ...(detail.dates || {}), [f.key]: val } })} />}
                </div>
              ))}
            </div>
            <p className="text-[12px] text-white/45 mt-4 mb-2">資料檢核</p>
            <div className="grid grid-cols-2 gap-2">
              {[['idCard', '身分證'], ['diploma', '畢業證書'], ['bankBook', '存摺影本'], ['credit', '聯徵報告']].map(([k, l]) => (
                <button key={k} type="button" disabled={detail.isPromoted || !canEdit} onClick={() => toggleDoc(detail, k)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-[13px] disabled:opacity-50 ${detail.docs?.[k] ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300 font-bold' : 'bg-white/[0.04] border-white/12 text-white/55'}`}>{detail.docs?.[k] ? <CheckCircle2 size={16} /> : <Square size={16} />}{l}</button>
              ))}
            </div>
            <p className="text-[12px] text-white/45 mt-4 mb-2">進度備註</p>
            <input type="text" disabled={detail.isPromoted || !canEdit} className="w-full rounded-xl px-3 py-2.5 text-sm" placeholder="例如：進度正常、需補件…" value={detail.note || ''} onChange={e => updateRecruit(detail.id, { note: e.target.value })} />
            {canEdit && (
              <div className="grid grid-cols-2 gap-2 mt-5">
                <button type="button" onClick={() => { onDelete(detail.id); setDetailId(null); }} className="py-3 rounded-xl border border-rose-400/40 text-rose-300 font-bold text-sm">刪除</button>
                {!detail.isPromoted ? <button type="button" disabled={loadingId === detail.id} onClick={() => { onPromote(detail); setDetailId(null); }} className="py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm disabled:opacity-50">手動建立帳號</button> : <span />}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};// ================= 電腦版：吳政翰專屬總覽（一頁看完，不用上下捲動）=================
const getRecruitStatus = (r) => {
  if (r.isPromoted) return '登錄';
  const d = r.dates || {}, t = getTodayDate();
  if (d.trainingDate && d.trainingDate <= t) return '優培';
  if (d.registeredDate && d.registeredDate <= t) return '登錄';
  if (d.externalExamDate && d.externalExamDate <= t) return '外考';
  if (d.internalExamDate && d.internalExamDate <= t) return '內考';
  if (d.tempAccountDate && d.tempAccountDate <= t) return '臨時帳號';
  return '新名單';
};

const OvDonut = ({ parts, size = 150, centerTop, centerBottom, thickness = 18 }) => {
  const total = parts.reduce((s, p) => s + p.v, 0);
  const R = (size - thickness) / 2, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={thickness} />
        {total > 0 && parts.filter(p => p.v > 0).map((p, i) => {
          const len = p.v / total * C; const off = acc; acc += len;
          return <circle key={i} cx={size / 2} cy={size / 2} r={R} fill="none" stroke={p.color} strokeWidth={thickness} strokeDasharray={`${Math.max(0, len - 3)} ${C}`} strokeDashoffset={-off} strokeLinecap="round" style={{ transition: 'stroke-dasharray .8s ease' }} />;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`font-black leading-none ${String(centerTop).length > 6 ? 'text-[19px]' : 'text-[28px]'}`}>{centerTop}</span>
        <span className="text-[11px] text-white/55 mt-1">{centerBottom}</span>
      </div>
    </div>
  );
};

const OverviewPage = ({ loggedInUser, team, records, activities, recruits, season, rankTargets }) => {
  const today = getTodayDate();
  const month = today.slice(0, 7);
  const [section, setSection] = useState('overview');
  const [goals, setGoals] = useState(PERSONAL_GOALS_DEFAULT);

  useEffect(() => {
    if (!loggedInUser) return;
    const unsub = onSnapshot(doc(db, 'personal_goals', `${loggedInUser.id}_${month}`), (snap) => {
      setGoals(snap.exists() ? { ...PERSONAL_GOALS_DEFAULT, ...snap.data() } : PERSONAL_GOALS_DEFAULT);
    });
    return () => unsub();
  }, [loggedInUser?.id, month]);

  const members = useMemo(() => getDistrictMembers(team, '吳政翰'), [team]);
  const ids = useMemo(() => new Set(members.map(m => String(m.id))), [members]);
  const nameOf = (id) => team.find(m => String(m.id) === String(id))?.name || '—';
  const money = (n) => n >= 1000000 ? '$' + (n / 1000000).toFixed(2) + 'M' : n >= 10000 ? '$' + (n / 10000).toFixed(1) + '萬' : '$' + Math.round(n || 0).toLocaleString();
  const pct = (a, b) => b > 0 ? Math.min(100, Math.round(a / b * 100)) : 0;

  // ---- 案件 ----
  const distRecords = useMemo(() => (records || []).filter(r => ids.has(String(r.agentId))), [records, ids]);
  const ageOf = (r) => Math.max(0, Math.floor((new Date(today) - new Date(r.date)) / 86400000));
  const pending = useMemo(() => distRecords.filter(r => (r.status || '已發單') === '受理中').map(r => ({ r, days: ageOf(r) })).sort((a, b) => b.days - a.days), [distRecords, today]);
  const pendingPremium = pending.reduce((s, x) => s + (x.r.premium || 0), 0);
  const stuck = pending.filter(x => x.days >= 15).length;
  const monthIssued = distRecords.filter(r => (r.status || '已發單') === '已發單' && (r.date || '').startsWith(month));
  const monthIssuedPremium = monthIssued.reduce((s, r) => s + (r.premium || 0), 0);
  const buckets = WAR_AGE_BUCKETS.map((b, i) => {
    const prev = i === 0 ? -1 : WAR_AGE_BUCKETS[i - 1].max;
    const list = pending.filter(x => x.days > prev && x.days <= b.max);
    return { ...b, n: list.length, prem: list.reduce((s, x) => s + (x.r.premium || 0), 0) };
  });
  const recentCases = useMemo(() => distRecords.slice(0, 40), [distRecords]);

  // ---- 活動量 ----
  const actRows = useMemo(() => members.map(m => ({ m, today: pointsOnDate(activities, m.id, today), week: weekPoints(activities, m.id, today), month: monthPoints(activities, m.id, today) })).sort((a, b) => b.today - a.today || b.week - a.week), [members, activities, today]);
  const reached = actRows.filter(r => r.today >= DAILY_TARGET).length;
  const emptyToday = actRows.filter(r => r.today === 0).length;
  const weekAvg = actRows.length ? Math.round(actRows.reduce((s, r) => s + Math.min(1, r.week / WEEKLY_TARGET), 0) / actRows.length * 100) : 0;
  const monthTotal = actRows.reduce((s, r) => s + r.month, 0);

  // ---- 競賽 ----
  const seasonMonths = (season === 'H1' ? AVAILABLE_MONTHS_H1 : AVAILABLE_MONTHS_H2).map(m => m.value);
  const targets = (season === 'H1' ? rankTargets?.H1 : rankTargets?.H2) || {};
  const contestRows = useMemo(() => members.map(m => {
    const role = (season === 'H2' && H2_ROLE_MAPPING[m.name]) ? H2_ROLE_MAPPING[m.name] : m.role;
    const t = targets[role] || targets['業務代表'] || { peak: { total: 0 }, summit: { total: 0 } };
    let w = 0, p = 0;
    distRecords.forEach(r => { if (String(r.agentId) === String(m.id) && seasonMonths.includes((r.date || '').slice(0, 7))) { w += r.weighted || 0; p += r.premium || 0; } });
    const pk = Math.max(pct(w, t.peak?.total), t.peak?.actualPremium > 0 ? pct(p, t.peak.actualPremium) : 0);
    const sm = Math.max(pct(w, t.summit?.total), t.summit?.actualPremium > 0 ? pct(p, t.summit.actualPremium) : 0);
    return { m, role, w, p, t, pk, sm };
  }).sort((a, b) => b.pk - a.pk), [members, distRecords, season, rankTargets]);
  const peakDone = contestRows.filter(r => r.pk >= 100).length;
  const contestAvg = contestRows.length ? Math.round(contestRows.reduce((s, r) => s + r.pk, 0) / contestRows.length) : 0;

  // ---- 優培 ----
  const qualRows = useMemo(() => members.map(m => ({ m, q: getQualityInfo(m, records) })).filter(x => x.q), [members, records]);
  const qualActive = qualRows.filter(x => x.q.state === 'active').length;
  const qualUnset = qualRows.filter(x => x.q.state === 'unset').length;

  // ---- 增員 ----
  const recList = useMemo(() => (recruits || []).filter(r => !r.recruiterId || ids.has(String(r.recruiterId)) || true).map(r => ({ ...r, st: getRecruitStatus(r) })), [recruits]);
  const stageIdx = (r) => r.isPromoted ? 4 : RECRUIT_STATUSES.indexOf(r.st);
  const stageCount = RECRUIT_STATUSES.map((s, i) => recList.filter(r => r.st === s).length);
  const monthReg = recList.filter(r => stageIdx(r) >= 4 && (r.dates?.registeredDate || '').startsWith(month)).length;
  const yearReg = recList.filter(r => stageIdx(r) >= 4).length;
  const nextDate = (r) => {
    const c = RECRUIT_DATE_FIELDS.map(f => ({ label: f.label, d: r.dates?.[f.key] })).filter(x => x.d && x.d >= today).sort((a, b) => a.d.localeCompare(b.d))[0];
    return c ? `${c.label} ${c.d.slice(5).replace('-', '/')}` : '—';
  };

  // ---- 個人目標 ----
  const myRecs = distRecords.filter(r => String(r.agentId) === String(loggedInUser.id) && (r.date || '').startsWith(month));
  const mySales = myRecs.reduce((s, r) => s + (goals.salesBasis === 'premium' ? (r.premium || 0) : (r.weighted || 0)), 0);
  const myIncome = myRecs.filter(r => (r.status || '已發單') === '已發單').reduce((s, r) => s + (r.premium || 0) * (PRODUCT_MAPPING[r.typeCode]?.commissionRate || 0), 0);
  const myRecruit = (activities || []).filter(a => a.agentId === loggedInUser.id && a.month === month).reduce((s, a) => s + (a.recruitRegistered || 0), 0);

  const card = 'rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl';
  const Panel = ({ title, icon: Ic, tone = 'text-blue-300', right, children, className = '' }) => (
    <div className={`${card} p-4 flex flex-col min-h-0 min-w-0 ${className}`}>
      <div className="flex items-center justify-between mb-2.5 shrink-0">
        <p className="font-bold text-[15px] flex items-center gap-2"><Ic size={17} className={tone} />{title}</p>{right}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">{children}</div>
    </div>
  );
  const more = (k) => <button type="button" onClick={() => setSection(k)} className="text-[12px] text-white/50 hover:text-white flex items-center">詳情<ChevronRight size={14} /></button>;
  const Bar = ({ v, color, h = 6 }) => <div className="rounded-full bg-white/10 overflow-hidden" style={{ height: h }}><div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, v)}%`, background: color }} /></div>;
  const StatusPill = ({ s }) => <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${s === '已發單' ? 'text-emerald-300 border-emerald-400/50 bg-emerald-500/10' : 'text-amber-300 border-amber-400/50 bg-amber-500/10'}`}>{s}</span>;

  const KPI = ({ icon: Ic, label, value, unit, sub, color }) => (
    <div className={`${card} p-3.5 flex items-center gap-3 min-w-0`}>
      <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: color + '26', color }}><Ic size={24} /></span>
      <div className="min-w-0"><p className="text-[12px] text-white/60 truncate">{label}</p><p className="leading-none mt-1.5 whitespace-nowrap"><span className="text-[26px] font-black">{value}</span>{unit && <span className="text-[13px] text-white/55 ml-1">{unit}</span>}</p><p className="text-[11px] text-white/45 mt-1 truncate">{sub}</p></div>
    </div>
  );

  // ---- 面板內容 ----
  const casesDonut = (
    <div className="flex items-center gap-5 h-full">
      <OvDonut parts={buckets.map(b => ({ v: b.n, color: b.color }))} centerTop={pending.length} centerBottom="受理中案件" />
      <div className="flex-1 min-w-0 space-y-2">
        {buckets.map(b => (
          <div key={b.key} className="flex items-center gap-2 text-[13px]"><i className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: b.color }} /><span className="w-[70px] text-white/80">{b.label}</span><span className="font-semibold w-8 text-right">{b.n}</span><span className="text-white/45 w-10 text-right">{pending.length ? Math.round(b.n / pending.length * 100) : 0}%</span><span className="ml-auto text-white/70 tabular-nums">{money(b.prem)}</span></div>
        ))}
      </div>
    </div>
  );
  const contestList = (limit) => (
    <div className="space-y-2.5">
      {contestRows.slice(0, limit).map(r => (
        <div key={r.m.id} className="flex items-center gap-3">
          <Avatar name={r.m.name} size={32} />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-[12.5px] mb-1"><span className="font-semibold truncate">{r.m.name}<span className="text-white/40 font-normal ml-1.5">{r.role}</span></span><span className="tabular-nums text-white/70">{money(r.w)} · <b className={r.pk >= 100 ? 'text-emerald-300' : 'text-white'}>{r.pk}%</b></span></div>
            <div className="relative"><Bar v={r.pk} color={r.pk >= 100 ? '#34d399' : 'linear-gradient(90deg,#60a5fa,#818cf8)'} h={7} />{r.sm > 0 && <div className="absolute top-0 h-[7px] rounded-full bg-amber-300/80" style={{ width: `${Math.min(100, r.sm)}%`, opacity: .55 }} />}</div>
          </div>
        </div>
      ))}
      {contestRows.length === 0 && <p className="text-white/40 text-sm text-center py-6">目前沒有資料</p>}
    </div>
  );
  const caseTable = (limit) => (
    <table className="w-full text-[13px]">
      <thead className="text-white/40 text-[11.5px]"><tr className="text-left"><th className="font-normal pb-2">姓名</th><th className="font-normal pb-2">日期</th><th className="font-normal pb-2">商品</th><th className="font-normal pb-2 text-right">保費</th><th className="font-normal pb-2 pl-3">狀態</th><th className="font-normal pb-2 pl-3 w-[18%]">帳齡</th></tr></thead>
      <tbody>
        {recentCases.slice(0, limit).map(r => { const d = ageOf(r); const pend = (r.status || '已發單') === '受理中'; return (
          <tr key={r.id} className="border-t border-white/[0.07]">
            <td className="py-1.5 whitespace-nowrap"><span className="flex items-center gap-2"><Avatar name={r.agentName} size={26} /><span className="font-semibold">{r.agentName}</span></span></td>
            <td className="text-white/65 tabular-nums whitespace-nowrap pr-2">{(r.date || '').slice(5)}</td>
            <td className="text-white/80 truncate max-w-[130px]">{r.product || '—'}</td>
            <td className="text-right tabular-nums whitespace-nowrap">{money(r.premium)}</td>
            <td className="pl-3 whitespace-nowrap"><StatusPill s={r.status || '已發單'} /></td>
            <td className="pl-3">{pend ? <Bar v={Math.min(100, d / 20 * 100)} color={d >= 15 ? '#fb7185' : d >= 8 ? '#fbbf24' : '#34d399'} /> : <span className="text-white/30 text-xs">—</span>}</td>
          </tr>); })}
      </tbody>
    </table>
  );
  const activityList = (limit) => (
    <div className="space-y-2.5">
      {actRows.slice(0, limit).map(r => { const tone = r.today >= DAILY_TARGET ? '#34d399' : r.today > 0 ? '#fbbf24' : '#fb7185'; return (
        <div key={r.m.id} className="flex items-center gap-3">
          <Avatar name={r.m.name} size={32} style={{ border: `2px solid ${tone}88` }} />
          <div className="flex-1 min-w-0 grid grid-cols-2 gap-4">
            <div><div className="flex justify-between text-[12px] mb-1"><span className="font-semibold truncate">{r.m.name}</span><span className="tabular-nums text-white/70">今日 {r.today}/{DAILY_TARGET}</span></div><Bar v={r.today / DAILY_TARGET * 100} color={tone} /></div>
            <div><div className="flex justify-between text-[12px] mb-1"><span className="text-white/45">本週</span><span className="tabular-nums text-white/70">{r.week}/{WEEKLY_TARGET}</span></div><Bar v={r.week / WEEKLY_TARGET * 100} color="#818cf8" /></div>
          </div>
        </div>); })}
    </div>
  );
  const qualityList = (limit) => (
    qualRows.length === 0 ? <p className="text-white/40 text-sm text-center py-6">目前沒有進行中的優培</p> :
    <div className="space-y-3">
      {qualRows.slice(0, limit).map(({ m, q }) => (
        <div key={m.id} className="flex items-center gap-3">
          <Avatar name={m.name} size={32} />
          <div className="flex-1 min-w-0">
            {q.state === 'active' ? (<>
              <div className="flex justify-between text-[12px] mb-1"><span className="font-semibold">{m.name}<span className="text-amber-300 font-normal ml-1.5">第 {q.stage} 階段</span></span><span className="text-white/60 tabular-nums">FYC {pct(q.fyc, q.fycTarget)}% · 被保人 {q.insured}/{q.insuredTarget}</span></div>
              <Bar v={pct(q.fyc, q.fycTarget)} color="#fbbf24" />
              <div className="mt-1"><Bar v={pct(q.insured, q.insuredTarget)} color="#fb923c" h={4} /></div>
            </>) : <div className="flex justify-between text-[12.5px]"><span className="font-semibold">{m.name}</span><span className={q.state === 'upcoming' ? 'text-white/50' : 'text-rose-300'}>{q.state === 'upcoming' ? `優培 ${q.start} 開始` : '期別尚未填寫'}</span></div>}
          </div>
        </div>
      ))}
    </div>
  );
  const recruitFunnel = (
    <div className="grid grid-cols-6 gap-1.5 text-center">
      {RECRUIT_STATUSES.map((s, i) => (
        <div key={s}>
          <div className={`h-8 flex items-center justify-center text-[10.5px] font-bold text-white whitespace-nowrap bg-gradient-to-r ${RECRUIT_STAGE_TONE[s].g}`} style={{ clipPath: 'polygon(0 0, 88% 0, 100% 50%, 88% 100%, 0 100%, 10% 50%)' }}>{s === '臨時帳號' ? '臨時' : s}</div>
          <p className="text-[22px] font-black mt-1.5 leading-none">{stageCount[i]}</p>
          <p className="text-[10.5px] text-white/45 mt-1">人</p>
        </div>
      ))}
    </div>
  );
  const recruitList = (limit) => (
    <div>
      {[...recList].sort((a, b) => stageIdx(b) - stageIdx(a)).slice(0, limit).map(r => (
        <div key={r.id} className="grid grid-cols-[1.2fr_78px_1fr_auto] items-center gap-2 py-2 border-t border-white/[0.07] text-[13px]">
          <span className="flex items-center gap-2 min-w-0"><Avatar name={r.name} size={26} /><span className="font-semibold truncate">{r.name}</span></span>
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold border text-center" style={{ color: RECRUIT_STAGE_TONE[r.st].c, borderColor: RECRUIT_STAGE_TONE[r.st].c + '66', background: RECRUIT_STAGE_TONE[r.st].c + '1a' }}>{r.st}</span>
          <span className="text-white/60 truncate">{nextDate(r)}</span>
          <span className="flex items-center gap-1.5 text-white/55"><Avatar name={nameOf(r.recruiterId)} size={20} />{nameOf(r.recruiterId)}</span>
        </div>
      ))}
      {recList.length === 0 && <p className="text-white/40 text-sm text-center py-6">目前沒有準增員</p>}
    </div>
  );
  const goalRows = [
    { l: '業績（' + (goals.salesBasis === 'premium' ? '實收' : '加權') + '）', a: mySales, t: goals.salesTarget, money: true, c: '#60a5fa', icon: TrendingUp },
    { l: '增員人數', a: myRecruit, t: goals.recruitTarget, unit: '人', c: '#2dd4bf', icon: Users },
    { l: '預估收入', a: Math.round(myIncome), t: goals.incomeTarget, money: true, c: '#fbbf24', icon: Award },
  ];
  const goalPanel = (
    <div className="space-y-2.5">
      {goalRows.map(g => (
        <div key={g.l} className="rounded-xl bg-white/[0.045] border border-white/[0.07] px-3 py-2.5">
          <div className="flex items-center justify-between text-[13px]"><span className="flex items-center gap-2"><g.icon size={15} style={{ color: g.c }} />{g.l}</span><span className="tabular-nums"><b className="text-[15px]">{g.money ? money(g.a) : g.a}</b><span className="text-white/45"> / {g.t ? (g.money ? money(g.t) : g.t + (g.unit || '')) : '未設定'}</span></span></div>
          <div className="mt-1.5 flex items-center gap-2"><div className="flex-1"><Bar v={pct(g.a, g.t)} color={g.c} /></div><span className="text-[11.5px] text-white/60 w-9 text-right">{pct(g.a, g.t)}%</span></div>
        </div>
      ))}
    </div>
  );

  const hour = new Date().getHours();
  const greet = hour < 5 ? '夜深了' : hour < 12 ? '早安' : hour < 18 ? '午安' : '晚安';
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const sections = [
    ['overview', '總覽', LayoutGrid], ['activity', '全體活動量', Activity], ['contest', '競賽狀況', Trophy],
    ['quality', '優培狀況', Award], ['cases', '案件狀況', ClipboardList], ['recruit', '增員狀況', UserPlus],
  ];
  const sectionTitle = sections.find(s => s[0] === section)?.[1];

  return (
    <div className="hidden md:grid grid-cols-[176px_1fr] gap-4 h-full md:min-h-[840px] text-white animate-fade-in">
      <aside className={`${card} p-2.5 flex flex-col gap-1`}>
        {sections.map(([k, l, Ic]) => (
          <button key={k} type="button" onClick={() => setSection(k)} className={`flex items-center gap-2.5 px-3 h-11 rounded-xl text-[14px] font-semibold text-left transition ${section === k ? 'bg-blue-500/20 border border-blue-400/50 text-white shadow-[0_0_16px_rgba(59,130,246,.35)]' : 'text-white/65 hover:bg-white/[0.06] border border-transparent'}`}><Ic size={17} />{l}</button>
        ))}
        <div className="mt-auto px-2 pb-1 pt-3 text-[11px] text-white/40 border-t border-white/10">政翰區 · {members.length} 人<br />{season === 'H1' ? '上半年' : '下半年'}競賽</div>
      </aside>

      <section className="min-h-0 min-w-0 flex flex-col gap-3">
        <div className="flex items-end justify-between shrink-0 px-1">
          <div>
            <p className="text-[12px] text-white/50 tracking-widest">{today.replace(/-/g, '.')}　週{dayNames[dayOfWeek(today)]}</p>
            <h1 className="text-[28px] font-black leading-tight">{section === 'overview' ? `${greet}，${loggedInUser.name}` : sectionTitle}</h1>
          </div>
          <p className="text-[13px] text-white/50 pb-1">{section === 'overview' ? '政翰區全貌：活動量・競賽・優培・案件・增員' : '政翰區 · 全員'}</p>
        </div>

        {section === 'overview' && (
          <>
            <div className="grid grid-cols-6 gap-3 shrink-0">
              <KPI icon={FileText} label="受理中案件" value={pending.length} unit="件" sub={stuck ? `逾期追蹤 ${stuck} 件` : '沒有逾期'} color="#60a5fa" />
              <KPI icon={DollarSign} label="受理中保費" value={money(pendingPremium)} sub={`本月已發單 ${money(monthIssuedPremium)}`} color="#34d399" />
              <KPI icon={Activity} label="今日活動量達標" value={`${reached}/${actRows.length}`} unit="人" sub={`${emptyToday} 人今日未建檔`} color="#a78bfa" />
              <KPI icon={Trophy} label="競賽平均進度" value={contestAvg} unit="%" sub={`${peakDone} 人已達新高峰`} color="#fbbf24" />
              <KPI icon={Award} label="優培進行中" value={qualActive} unit="人" sub={qualUnset ? `${qualUnset} 人未填期別` : '期別皆已填寫'} color="#fb923c" />
              <KPI icon={UserPlus} label="本月增員登錄" value={monthReg} unit="人" sub={`年度累積 ${yearReg} / ${GOAL_REGISTER}`} color="#2dd4bf" />
            </div>
            <div className="grid grid-cols-[1.15fr_1fr_.9fr] gap-3 flex-[1.05] min-h-0">
              <Panel title="案件狀態分佈" icon={ClipboardList} right={more('cases')}>{casesDonut}</Panel>
              <Panel title="競賽狀況" icon={Trophy} tone="text-amber-300" right={more('contest')}>{contestList(6)}</Panel>
              <div className="min-h-0 min-w-0 overflow-y-auto no-scrollbar"><HomeTodoCard loggedInUser={loggedInUser} /></div>
            </div>
            <div className="grid grid-cols-[1.35fr_1fr_1fr_.95fr] gap-3 flex-[1.2] min-h-0">
              <Panel title="團隊案件列表" icon={Users} right={more('cases')}>{caseTable(7)}</Panel>
              <Panel title="全體活動量" icon={Activity} tone="text-violet-300" right={more('activity')}>{activityList(7)}</Panel>
              <Panel title="優培狀況" icon={Award} tone="text-orange-300" right={more('quality')}>{qualityList(5)}</Panel>
              <Panel title="增員狀況" icon={UserPlus} tone="text-teal-300" right={more('recruit')}>{recruitFunnel}<div className="mt-3">{goalPanel}</div></Panel>
            </div>
          </>
        )}

        {section === 'activity' && (
          <div className="grid grid-cols-[1fr_280px] gap-3 flex-1 min-h-0">
            <Panel title="全體活動量（今日 / 本週）" icon={Activity} tone="text-violet-300">{activityList(30)}</Panel>
            <div className="flex flex-col gap-3 min-h-0">
              <KPI icon={CheckCircle2} label="今日達標" value={`${reached}/${actRows.length}`} unit="人" sub="目標 20 分" color="#34d399" />
              <KPI icon={AlertTriangle} label="今日未建檔" value={emptyToday} unit="人" sub="需要關心" color="#fb7185" />
              <KPI icon={Target} label="本週平均達成" value={weekAvg} unit="%" sub={`目標 ${WEEKLY_TARGET} 分`} color="#818cf8" />
              <KPI icon={TrendingUp} label="本月全隊總分" value={monthTotal} unit="分" sub={`${members.length} 人`} color="#fbbf24" />
            </div>
          </div>
        )}
        {section === 'contest' && (
          <div className="grid grid-cols-[1fr_280px] gap-3 flex-1 min-h-0">
            <Panel title={`${season === 'H1' ? '上半年高峰/極峰' : '下半年新高峰/新極峰'}競賽進度`} icon={Trophy} tone="text-amber-300" right={<span className="text-[11px] text-white/45">藍＝新高峰　黃＝新極峰</span>}>{contestList(30)}</Panel>
            <div className="flex flex-col gap-3 min-h-0">
              <KPI icon={Trophy} label="已達新高峰" value={peakDone} unit="人" sub={`共 ${contestRows.length} 人`} color="#fbbf24" />
              <KPI icon={Target} label="平均進度" value={contestAvg} unit="%" sub="取加權／實收較高者" color="#60a5fa" />
              <KPI icon={Crown} label="目前領先" value={contestRows[0]?.m.name || '—'} sub={contestRows[0] ? `${contestRows[0].pk}%` : ''} color="#34d399" />
            </div>
          </div>
        )}
        {section === 'quality' && (
          <div className="grid grid-cols-[1fr_280px] gap-3 flex-1 min-h-0">
            <Panel title="優培狀況" icon={Award} tone="text-orange-300">{qualityList(30)}</Panel>
            <div className="flex flex-col gap-3 min-h-0">
              <KPI icon={Award} label="進行中" value={qualActive} unit="人" sub="每階段 3 個月" color="#fb923c" />
              <KPI icon={AlertTriangle} label="未填期別" value={qualUnset} unit="人" sub="請到個人設定補上" color="#fb7185" />
            </div>
          </div>
        )}
        {section === 'cases' && (
          <div className="grid grid-cols-[430px_1fr] gap-3 flex-1 min-h-0">
            <div className="flex flex-col gap-3 min-h-0">
              <Panel title="受理中・件數分佈" icon={ClipboardList} className="flex-1">{casesDonut}</Panel>
              <Panel title="受理中・保費分佈" icon={DollarSign} tone="text-emerald-300" className="flex-1">
                <div className="flex items-center gap-5 h-full"><OvDonut parts={buckets.map(b => ({ v: b.prem, color: b.color }))} centerTop={money(pendingPremium)} centerBottom="受理中保費" />
                  <div className="flex-1 space-y-2">{buckets.map(b => <div key={b.key} className="flex items-center gap-2 text-[13px]"><i className="w-2.5 h-2.5 rounded-sm" style={{ background: b.color }} /><span className="text-white/80">{b.label}</span><span className="ml-auto tabular-nums">{money(b.prem)}</span></div>)}</div></div>
              </Panel>
            </div>
            <Panel title="團隊案件列表" icon={Users}>{caseTable(40)}</Panel>
          </div>
        )}
        {section === 'recruit' && (
          <div className="grid grid-cols-[1fr_300px] gap-3 flex-1 min-h-0">
            <div className="flex flex-col gap-3 min-h-0">
              <Panel title="準增員轉換" icon={Filter} tone="text-teal-300" className="shrink-0">{recruitFunnel}</Panel>
              <Panel title="準增員名單" icon={Users} tone="text-teal-300" className="flex-1">{recruitList(40)}</Panel>
            </div>
            <div className="flex flex-col gap-3 min-h-0">
              <KPI icon={UserPlus} label="本月登錄" value={monthReg} unit="人" sub={`年度 ${yearReg} / ${GOAL_REGISTER}`} color="#2dd4bf" />
              <KPI icon={Users} label="名單總數" value={recList.filter(r => !r.isPromoted).length} unit="人" sub="含新名單到考試中" color="#60a5fa" />
              <Panel title="個人目標" icon={Target} tone="text-fuchsia-300" className="flex-1">{goalPanel}</Panel>
            </div>
          </div>
        )}
      </section>
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

  const [confirmPromoteTarget, setConfirmPromoteTarget] = useState(null);
  const handleManualCreateAccount = async (recruit) => {
    setLoadingId(recruit.id);
    try {
      const batch = writeBatch(db);
      const newUserRef = doc(collection(db, 'user'));
      batch.set(newUserRef, {
        name: recruit.name,
        position: '業務代表',
        parentId: recruit.recruiterId || '',
        role: 'member',
        account_id: recruit.name,
        password: '1234',
        created_at: new Date().toISOString()
      });
      batch.update(doc(db, 'temp_user', recruit.id), { isPromoted: true });
      await batch.commit();
      setConfirmPromoteTarget(null);
    } catch (e) { console.error(e); } finally { setLoadingId(null); }
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
    <>
    <MobileRecruitView recruits={recruits} team={team} status={determineStatus} updateRecruit={updateRecruit} toggleDoc={toggleDoc} onDelete={(id) => setDeleteTarget(id)} onPromote={(r) => setConfirmPromoteTarget(r)} loadingId={loadingId} canEdit={!!user} />
    <div className="hidden space-y-12 animate-fade-in max-w-7xl mx-auto pb-12">
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
                    {!recruit.isPromoted && (
                      <div className="mt-5 pt-4 border-t border-gray-50 flex justify-end">
                        <button onClick={() => setConfirmPromoteTarget(recruit)} disabled={loadingId === recruit.id} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition disabled:opacity-50">
                          {loadingId === recruit.id ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />} 手動建立帳號
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <ConfirmModal
        isOpen={!!confirmPromoteTarget}
        onClose={() => setConfirmPromoteTarget(null)}
        onConfirm={() => handleManualCreateAccount(confirmPromoteTarget)}
        title="手動建立帳號"
        message={confirmPromoteTarget ? `確定要提前幫「${confirmPromoteTarget.name}」建立正式使用者帳號嗎？建立後她就能直接登入系統，之後就算走到預計登錄日期，系統也不會再重複建立第二個帳號。` : ''}
      />
    </div>
    <div>
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} title="刪除準增員" message="確定要刪除此準增員資料嗎？此動作無法復原。" />
      <ConfirmModal isOpen={!!confirmPromoteTarget} onClose={() => setConfirmPromoteTarget(null)} onConfirm={() => handleManualCreateAccount(confirmPromoteTarget)} title="手動建立帳號" message={confirmPromoteTarget ? `確定要提前幫「${confirmPromoteTarget.name}」建立正式使用者帳號嗎？` : ''} />
    </div>
    </>
  );
};


// --- Sales Entry ---
// --- 手機版：業績回報（深色玻璃風）---
const MobileSalesEntry = ({ team, records, loggedInUser, onAdd, onEdit, onDelete, onMarkIssued, issuingId, onSearch, onBatch }) => {
  const today = getTodayDate();
  const thisMonth = today.slice(0, 7);
  const [tab, setTab] = useState('overview');
  const [month, setMonth] = useState(thisMonth);
  const [chip, setChip] = useState('all');
  const [sortDesc, setSortDesc] = useState(true);
  const [agentFilter, setAgentFilter] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [detail, setDetail] = useState(null);

  const months = useMemo(() => {
    const set = new Set(records.map(r => (r.date || '').slice(0, 7)).filter(Boolean));
    set.add(thisMonth);
    return Array.from(set).sort().reverse();
  }, [records, thisMonth]);
  const prevMonth = (() => { const [y, m] = month.split('-').map(Number); const d = new Date(y, m - 2, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })();

  const ageOf = (r) => Math.max(0, Math.floor((new Date(today) - new Date(r.date)) / 86400000));
  const stateOf = (r) => (r.status || '已發單') === '已發單' ? 'issued' : (ageOf(r) >= 15 ? 'overdue' : 'pending');
  const STATE = {
    issued: { label: '已發單', chip: 'bg-emerald-500/20 text-emerald-300', color: '#34d399' },
    pending: { label: '受理中', chip: 'bg-amber-500/20 text-amber-300', color: '#fbbf24' },
    overdue: { label: '逾期追蹤', chip: 'bg-rose-500/20 text-rose-300', color: '#fb7185' },
  };

  const inMonth = useMemo(() => records.filter(r => (r.date || '').startsWith(month)), [records, month]);
  const prevRecs = useMemo(() => records.filter(r => (r.date || '').startsWith(prevMonth)), [records, prevMonth]);
  const sumP = (l) => l.reduce((s, r) => s + (r.premium || 0), 0);
  const issuedN = (l) => l.filter(r => stateOf(r) === 'issued').length;
  const delta = (cur, prev) => prev > 0 ? Math.round((cur - prev) / prev * 100) : (cur > 0 ? 100 : 0);
  const money = (n) => n >= 1000000 ? '$' + (n / 1000000).toFixed(2) + 'M' : '$' + Math.round(n).toLocaleString();
  const reporters = new Set(inMonth.map(r => r.agentId)).size;

  const tiles = [
    { l: '本月回報件數', v: inMonth.length, u: '件', d: delta(inMonth.length, prevRecs.length), icon: FileText, c: 'bg-blue-500/25 text-blue-300' },
    { l: '本月保費', v: money(sumP(inMonth)), d: delta(sumP(inMonth), sumP(prevRecs)), icon: TrendingUp, c: 'bg-emerald-500/25 text-emerald-300' },
    { l: '已發單件數', v: issuedN(inMonth), u: '件', d: delta(issuedN(inMonth), issuedN(prevRecs)), icon: CheckCircle2, c: 'bg-amber-500/25 text-amber-300' },
    { l: '團隊人數', v: team.length, u: '人', sub: `${reporters} 人有回報`, bar: team.length ? Math.round(reporters / team.length * 100) : 0, icon: Users, c: 'bg-violet-500/25 text-violet-300' },
  ];

  const parts = ['issued', 'pending', 'overdue'].map(k => {
    const l = inMonth.filter(r => stateOf(r) === k);
    return { key: k, label: STATE[k].label, color: STATE[k].color, n: l.length, p: sumP(l) };
  });

  const base = tab === 'mine' ? inMonth.filter(r => r.agentId === loggedInUser.id) : tab === 'manage' ? records.filter(r => stateOf(r) !== 'issued') : inMonth;
  const filtered = useMemo(() => base.filter(r => (agentFilter ? r.agentId === agentFilter : true) && (chip === 'all' ? true : stateOf(r) === chip)).sort((a, b) => sortDesc ? (b.date || '').localeCompare(a.date || '') : (a.date || '').localeCompare(b.date || '')), [base, chip, sortDesc, agentFilter]);
  const counts = { all: base.length, issued: base.filter(r => stateOf(r) === 'issued').length, pending: base.filter(r => stateOf(r) === 'pending').length, overdue: base.filter(r => stateOf(r) === 'overdue').length };
  const todayN = records.filter(r => r.date === today).length;

  const glass = 'rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl';

  const memberBars = (() => { const mx = Math.max(1, ...team.map(m => sumP(inMonth.filter(r => r.agentId === m.id)))); return team.map(m => { const l = inMonth.filter(r => r.agentId === m.id); const p = sumP(l); return { id: m.id, name: m.name, p, n: l.length, pct: Math.round(p / mx * 100) }; }).sort((x, y) => y.p - x.p); })();

  return (
    <>
    <div className="md:hidden text-white">
      <div className="flex items-start justify-between pt-1 pb-3 gap-2">
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold tracking-tight leading-none">業績回報</h1>
          <p className="text-[12px] text-white/50 mt-2">快速記錄與追蹤團隊案件</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={onSearch} aria-label="搜尋" className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center active:scale-95 transition"><Search size={18} /></button>
          <button onClick={() => setShowFilter(v => !v)} aria-label="篩選" className={`w-10 h-10 rounded-full border flex items-center justify-center active:scale-95 transition ${agentFilter ? 'bg-blue-500/30 border-blue-400/40' : 'bg-white/[0.08] border-white/10'}`}><SlidersHorizontal size={17} /></button>
        </div>
      </div>
      <button onClick={onAdd} className="w-full mb-3 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 font-bold text-[15px] flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition"><Plus size={18} />新增回報</button>

      {showFilter && (
        <div className={`${glass} p-3 mb-3 flex items-center gap-2`}>
          <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} className="flex-1 rounded-xl px-3 py-2.5 text-[13px] font-bold outline-none">
            <option value="">所有業務同仁</option>
            {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {agentFilter && <button onClick={() => setAgentFilter('')} className="text-[12px] font-bold text-white/60 px-2">清除</button>}
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 flex rounded-full border border-white/10 bg-white/[0.06] p-1">
          {[['overview', '團隊總覽'], ['mine', '我的回報'], ['manage', '案件管理']].map(([k, l]) => (
            <button key={k} onClick={() => { setTab(k); setChip('all'); }} className={`flex-1 py-2 text-[12px] font-bold rounded-full transition whitespace-nowrap ${tab === k ? 'bg-blue-500 shadow-md shadow-blue-500/30' : 'text-white/60'}`}>{l}</button>
          ))}
        </div>
        <div className="relative shrink-0">
          <select value={month} onChange={e => setMonth(e.target.value)} className="appearance-none rounded-full border border-white/10 bg-white/[0.08] pl-3 pr-7 py-2.5 text-[12px] font-bold outline-none">
            {months.map(m => <option key={m} value={m}>{m.replace('-', '年')}月</option>)}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50 text-[10px]">▾</span>
        </div>
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            {tiles.map(t => { const Icon = t.icon; return (
              <div key={t.l} className={`${glass} px-3.5 py-3`}>
                <div className="flex items-center gap-2"><span className={`w-7 h-7 rounded-full flex items-center justify-center ${t.c}`}><Icon size={14} /></span><span className="text-[12px] text-white/70 truncate">{t.l}</span></div>
                <p className="mt-2 leading-none"><b className="text-[24px] font-bold tabular-nums">{t.v}</b>{t.u && <span className="text-[13px] text-white/60 ml-1">{t.u}</span>}</p>
                {t.d !== undefined && <p className={`text-[11px] mt-1.5 font-bold ${t.d >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{t.d >= 0 ? '↑' : '↓'} {Math.abs(t.d)}% <span className="text-white/40 font-normal">較上月</span></p>}
                {t.sub && <p className="text-[11px] text-white/45 mt-1.5">{t.sub}</p>}
                {t.bar !== undefined && <div className="h-1.5 rounded-full bg-white/10 mt-1.5 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400" style={{ width: `${t.bar}%` }}></div></div>}
              </div>
            ); })}
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            <WarDonut title="案件狀態分佈" centerTop={inMonth.length} centerBottom="本月案件" parts={parts.map(p => ({ label: p.label, color: p.color, v: p.n, text: `${p.n} 件` }))} />
            <WarDonut title="保費金額分佈" centerTop={money(sumP(inMonth))} centerBottom="本月保費" parts={parts.map(p => ({ label: p.label, color: p.color, v: p.p, text: money(p.p) }))} />
          </div>
        </>
      )}

      <div className={`${glass} p-3.5 mb-3`}>
        <div className="flex items-center justify-between mb-2.5 gap-2">
          <p className="text-[15px] font-bold">{tab === 'mine' ? '我的案件' : tab === 'manage' ? '待處理案件' : '團隊案件列表'}</p>
          <button onClick={() => setSortDesc(v => !v)} className="text-[11px] font-bold text-white/65 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 whitespace-nowrap">成交日 {sortDesc ? '新→舊' : '舊→新'}</button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {[['all', '全部'], ['pending', '受理中'], ['overdue', '逾期追蹤'], ['issued', '已發單']].map(([k, l]) => (
            <button key={k} onClick={() => setChip(k)} className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold border transition ${chip === k ? 'bg-blue-500/25 border-blue-400/50 text-blue-200' : 'border-white/10 text-white/55'}`}>{l}<span className="text-[11px] opacity-80 tabular-nums">{counts[k]}</span></button>
          ))}
        </div>
        {filtered.length === 0 && <p className="text-center text-[13px] text-white/40 py-8">沒有符合條件的案件</p>}
        <div>
          {filtered.slice(0, 40).map((r, i, arr) => {
            const st = STATE[stateOf(r)];
            return (
              <button key={r.id} onClick={() => setDetail(r)} className={`w-full flex items-center gap-3 py-3 text-left ${i < arr.length - 1 ? 'border-b border-white/10' : ''}`}>
                <Avatar name={r.agentName} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold truncate">{r.agentName}<span className="text-white/40 font-normal text-[12px]"> · {r.insuredName || '—'}</span></p>
                  <p className="text-[11px] text-white/45 truncate">{(r.date || '').slice(5)} · {r.product || '—'}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[14px] font-bold tabular-nums text-blue-300">{money(r.premium || 0)}</p>
                  <span className={`inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${st.chip}`}>{st.label}</span>
                </div>
                <ChevronRight size={14} className="text-white/25 shrink-0" />
              </button>
            );
          })}
        </div>
        {filtered.length > 40 && <p className="text-center text-[11px] text-white/40 pt-2">只顯示最新 40 筆，請用上方篩選縮小範圍</p>}
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-2">
        {[['今日回報', `${todayN} 件`], ['本月累計', `${inMonth.length} 件`], ['本月保費', money(sumP(inMonth))]].map(([l, v]) => (
          <div key={l} className={`${glass} px-3 py-3`}><p className="text-[11px] text-white/50">{l}</p><p className="text-[16px] font-bold tabular-nums mt-0.5 truncate">{v}</p></div>
        ))}
      </div>

    </div>
      <div className="hidden md:flex flex-col gap-3 h-full md:min-h-[840px] text-white animate-fade-in">
        <div className="flex items-center justify-between gap-4 shrink-0">
          <div><h1 className="text-[26px] font-bold tracking-tight leading-none">業績回報</h1><p className="text-[12px] text-white/45 mt-1.5">快速記錄與追蹤團隊案件</p></div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-full border border-white/10 bg-white/[0.06] p-1">
              {[['overview', '團隊總覽'], ['mine', '我的回報'], ['manage', '案件管理']].map(([k, l]) => (
                <button key={k} onClick={() => { setTab(k); setChip('all'); }} className={`px-4 py-1.5 text-[13px] font-bold rounded-full transition whitespace-nowrap ${tab === k ? 'bg-blue-500 shadow-md shadow-blue-500/30' : 'text-white/60'}`}>{l}</button>
              ))}
            </div>
            <select value={month} onChange={e => setMonth(e.target.value)} className="bg-white/[0.08] border border-white/10 rounded-xl px-3 py-1.5 text-[13px] font-bold text-white outline-none">
              {months.map(m => <option key={m} value={m} className="text-gray-900">{m.replace('-', '年')}月</option>)}
            </select>
            <select value={agentFilter} onChange={e => setAgentFilter(e.target.value)} className="bg-white/[0.08] border border-white/10 rounded-xl px-3 py-1.5 text-[13px] font-bold text-white outline-none">
              <option value="" className="text-gray-900">所有業務同仁</option>
              {team.map(m => <option key={m.id} value={m.id} className="text-gray-900">{m.name}</option>)}
            </select>
            {onBatch && <button onClick={onBatch} className="px-4 py-2 rounded-xl bg-white/[0.08] border border-white/10 text-[13px] font-bold flex items-center gap-1.5"><ListPlus size={15} />批次新增</button>}
            <button onClick={onAdd} className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 font-bold text-[13px] flex items-center gap-1.5 shadow-lg shadow-blue-500/25"><Plus size={15} />新增回報</button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 shrink-0">
          {tiles.map(t => { const Icon = t.icon; return (
            <div key={t.l} className={`${glass} px-4 py-3`}>
              <div className="flex items-center gap-2"><span className={`w-7 h-7 rounded-full flex items-center justify-center ${t.c}`}><Icon size={14} /></span><span className="text-[12px] text-white/65">{t.l}</span></div>
              <p className="mt-2 leading-none"><b className="text-[26px] font-bold tabular-nums">{t.v}</b>{t.u && <span className="text-[13px] text-white/55 ml-1">{t.u}</span>}</p>
              {t.d !== undefined && <p className={`text-[11px] mt-1.5 font-bold ${t.d >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{t.d >= 0 ? '↑' : '↓'} {Math.abs(t.d)}% <span className="text-white/40 font-normal">較上月</span></p>}
              {t.sub && <p className="text-[11px] text-white/45 mt-1.5">{t.sub}</p>}
            </div>
          ); })}
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-3">
          <div className={`${glass} p-4 flex flex-col min-h-0`}>
            <div className="flex items-center justify-between mb-2 gap-2 shrink-0">
              <p className="text-[15px] font-bold">{tab === 'mine' ? '我的案件' : tab === 'manage' ? '待處理案件' : '團隊案件列表'}<span className="text-white/35 font-normal text-[12px] ml-2">{filtered.length} 筆</span></p>
              <div className="flex items-center gap-1.5">
                {[['all', '全部'], ['pending', '受理中'], ['overdue', '逾期追蹤'], ['issued', '已發單']].map(([k, l]) => (
                  <button key={k} onClick={() => setChip(k)} className={`px-3 py-1 rounded-full text-[12px] font-bold border transition ${chip === k ? 'bg-blue-500/25 border-blue-400/50 text-blue-200' : 'border-white/10 bg-white/[0.05] text-white/60'}`}>{l} {counts[k]}</button>
                ))}
                <button onClick={() => setSortDesc(v => !v)} className="text-[11px] font-bold text-white/65 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 whitespace-nowrap">成交日 {sortDesc ? '新→舊' : '舊→新'}</button>
              </div>
            </div>
            <div className="grid grid-cols-[36px_minmax(90px,1fr)_minmax(0,1.3fr)_minmax(0,1.6fr)_90px_80px_16px] gap-3 px-2 pb-1.5 text-[10px] font-bold text-white/35 shrink-0"><span></span><span>同仁</span><span>被保人</span><span>商品</span><span className="text-right">保費</span><span className="text-center">狀態</span><span></span></div>
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar divide-y divide-white/[0.06]">
              {filtered.length === 0 && <p className="text-center text-[13px] text-white/40 py-10">沒有符合條件的案件</p>}
              {filtered.slice(0, 100).map(r => {
                const st = STATE[stateOf(r)];
                return (
                  <button key={r.id} onClick={() => setDetail(r)} className="w-full grid grid-cols-[36px_minmax(90px,1fr)_minmax(0,1.3fr)_minmax(0,1.6fr)_90px_80px_16px] gap-3 items-center px-2 py-2 text-left hover:bg-white/[0.05]">
                    <Avatar name={r.agentName} size={30} />
                    <span className="min-w-0"><p className="text-[13px] font-bold truncate">{r.agentName}</p><p className="text-[10px] text-white/40">{(r.date || '').slice(5)}</p></span>
                    <span className="text-[13px] truncate">{r.insuredName || '—'}</span>
                    <span className="text-[12px] text-white/55 truncate">{r.product || '—'}</span>
                    <span className="text-right text-[13px] font-bold tabular-nums text-blue-300">{money(r.premium || 0)}</span>
                    <span className={`text-center text-[10px] font-bold px-2 py-0.5 rounded-full ${st.chip}`}>{st.label}</span>
                    <ChevronRight size={14} className="text-white/25" />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex flex-col gap-3 min-h-0">
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <WarDonut title="案件狀態分佈" centerTop={inMonth.length} centerBottom="本月案件" parts={parts.map(p => ({ label: p.label, color: p.color, v: p.n, text: `${p.n} 件` }))} />
              <WarDonut title="保費金額分佈" centerTop={money(sumP(inMonth))} centerBottom="本月保費" parts={parts.map(p => ({ label: p.label, color: p.color, v: p.p, text: money(p.p) }))} />
            </div>
            <div className={`${glass} p-4 flex-1 min-h-0 flex flex-col`}>
              <div className="flex items-center justify-between mb-2 shrink-0"><p className="text-[15px] font-bold">成員本月保費</p><span className="text-[11px] text-white/40">今日回報 {todayN} 件</span></div>
              <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2.5">
                {memberBars.map(m => (
                  <div key={m.id} className="flex items-center gap-2.5">
                    <Avatar name={m.name} size={26} />
                    <span className="w-14 text-[12px] font-bold truncate">{m.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-blue-400 to-indigo-400" style={{ width: `${m.pct}%` }} /></div>
                    <span className="w-16 text-right text-[12px] font-bold tabular-nums">{money(m.p)}</span>
                    <span className="w-8 text-right text-[11px] text-white/40 tabular-nums">{m.n}件</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {detail && (() => {
        const r = records.find(x => x.id === detail.id) || detail;
        const st = STATE[stateOf(r)];
        return (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDetail(null)}>
            <div className="w-full max-w-md rounded-t-[28px] md:rounded-[28px] border-t md:border border-white/10 bg-[#0c1020] p-5 pb-8 md:pb-5" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0"><p className="text-[18px] font-bold truncate">{r.agentName}</p><p className="text-[12px] text-white/45">{r.date} · {r.insuredName || '—'}</p></div>
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${st.chip}`}>{st.label}</span>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] divide-y divide-white/10 text-[13px]">
                {[['商品', r.product || '—'], ['保單號碼', r.policyNumber || '—'], ['保費', formatMoney(r.premium || 0)], ['加權保費', formatMoney(r.weighted || 0)], ['ESG', r.isESG ? '是 (×1.05)' : '否']].map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-2.5"><span className="text-white/50">{k}</span><span className="font-bold text-right ml-3 truncate">{v}</span></div>
                ))}
              </div>
              <div className="flex gap-2.5 mt-4">
                {r.status && r.status !== '已發單' && <button disabled={issuingId === r.id} onClick={() => { onMarkIssued(r); setDetail(null); }} className="flex-1 py-3 rounded-2xl bg-emerald-500 font-bold text-[14px] disabled:opacity-50">標記已發單</button>}
                <button onClick={() => { onEdit(r); setDetail(null); }} className="flex-1 py-3 rounded-2xl bg-white/10 font-bold text-[14px]">編輯</button>
                <button onClick={() => { onDelete(r.id); setDetail(null); }} className="px-5 py-3 rounded-2xl bg-rose-500/20 text-rose-300 font-bold text-[14px]">刪除</button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};const SalesEntry = ({ team, records, setRecords, user, loggedInUser, onSearch }) => {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ agentId: '', policyNumber: '', insuredName: '', product: '', typeCode: 'ah_general', premium: '', isESG: false, date: getTodayDate() });
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [celebration, setCelebration] = useState(null);
  const [issuingId, setIssuingId] = useState(null);
  const [showSheet, setShowSheet] = useState(false);

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
      setShowSheet(false);
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
    setShowSheet(true);
    window.scrollTo({top:0, behavior:'smooth'});
  };

  const handleDeleteConfirm = async() => { 
    if(!deleteId) return;
    try {
      await deleteDoc(doc(db, 'case_record', deleteId));
      setDeleteId(null);
    } catch(e) { console.error(e); }
  };

  const closeSheet = () => { setShowSheet(false); setEditingId(null); setForm({ agentId: loggedInUser ? loggedInUser.id : '', policyNumber: '', insuredName: '', product: '', typeCode: 'ah_general', premium: '', isESG: false, date: getTodayDate() }); };
  const openAdd = () => { setEditingId(null); setForm({ agentId: loggedInUser ? loggedInUser.id : '', policyNumber: '', insuredName: '', product: '', typeCode: 'ah_general', premium: '', isESG: false, date: getTodayDate() }); setShowSheet(true); };
  const fld = 'w-full rounded-2xl px-4 py-3 text-[15px] outline-none';

  return (
    <div className="max-w-4xl md:max-w-none md:h-full mx-auto space-y-8 md:space-y-0 animate-fade-in">
      <MobileSalesEntry team={team} records={records} loggedInUser={loggedInUser || {}} onAdd={openAdd} onEdit={handleEdit} onDelete={(id) => setDeleteId(id)} onMarkIssued={handleMarkIssued} issuingId={issuingId} onSearch={onSearch} onBatch={() => setIsBatchOpen(true)} />
      {showSheet && (
        <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={closeSheet}>
          <form onSubmit={handleSubmit} className="w-full md:max-w-lg max-h-[92vh] overflow-y-auto no-scrollbar rounded-t-[28px] md:rounded-[28px] md:border border-t border-white/10 bg-[#0c1020] text-white p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[18px] font-bold">{editingId ? '修改紀錄' : '新增回報'}</p>
              <div className="flex items-center gap-2">
                {!editingId && <button type="button" onClick={() => { setIsBatchOpen(true); }} className="text-[12px] font-bold text-blue-300 flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-500/15"><ListPlus size={14} />批次</button>}
                <button type="button" onClick={closeSheet} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><X size={16} /></button>
              </div>
            </div>
            <div className="space-y-3">
              <div><label className="text-[11px] text-white/50 block mb-1">業務同仁</label><select className={fld} value={form.agentId} onChange={e => setForm({ ...form, agentId: e.target.value })} required><option value="">請選擇業務同仁</option>{team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
              <div><label className="text-[11px] text-white/50 block mb-1">成交日期</label><input type="date" className={fld} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
              <div><label className="text-[11px] text-white/50 block mb-1">保單號碼</label><input type="text" className={fld} value={form.policyNumber} onChange={e => setForm({ ...form, policyNumber: e.target.value })} required />{duplicateRecord && <p className="text-[12px] text-rose-300 font-bold mt-1">⚠ 此保單號碼已存在（{duplicateRecord.agentName} · {duplicateRecord.date}）</p>}</div>
              <div><label className="text-[11px] text-white/50 block mb-1">被保人</label><input type="text" className={fld} value={form.insuredName} onChange={e => setForm({ ...form, insuredName: e.target.value })} required /></div>
              <div><label className="text-[11px] text-white/50 block mb-1">商品名稱</label><input type="text" className={fld} value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} required /></div>
              <div><label className="text-[11px] text-white/50 block mb-1">類型</label><select className={fld} value={form.typeCode} onChange={e => setForm({ ...form, typeCode: e.target.value })} required>{PRODUCT_TYPES_OPTIONS.map(t => <option key={t.code} value={t.code}>{t.label}</option>)}</select></div>
              <div><label className="text-[11px] text-white/50 block mb-1">保費</label><input type="number" inputMode="numeric" className={fld} value={form.premium} onChange={e => setForm({ ...form, premium: e.target.value })} required /></div>
              <label className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/25 px-4 py-3"><Leaf size={16} className="text-emerald-300" /><span className="text-[13px] font-bold text-emerald-200">ESG 專案 (×1.05)</span><input type="checkbox" checked={form.isESG} onChange={e => setForm({ ...form, isESG: e.target.checked })} className="ml-auto w-5 h-5" /></label>
            </div>
            <button type="submit" disabled={submitting} className="w-full mt-5 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 font-bold text-[15px] disabled:opacity-50">{submitting ? '儲存中…' : (editingId ? '更新' : '新增')}</button>
          </form>
        </div>
      )}
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
      <div className="hidden">
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
    </div>
  );
};

// --- Knowledge Base ---
// --- 公文佈達專區：公司公文、獎勵辦法、活動講座等，由主管發佈，全員查看 ---
const ANNOUNCEMENT_CATEGORIES = ['獎勵活動', '活動講座', '團隊活動', '服務公告', '其他'];
const ANNOUNCEMENT_CATEGORY_STYLE = {
  '獎勵活動': 'bg-amber-50 text-amber-700',
  '活動講座': 'bg-indigo-50 text-indigo-700',
  '團隊活動': 'bg-purple-50 text-purple-700',
  '服務公告': 'bg-teal-50 text-teal-700',
  '其他': 'bg-gray-100 text-gray-600'
};

// 圖片壓縮：公文圖片先在手機/電腦端縮小再存進資料庫（不需要另外開檔案儲存空間）
const resizeDataUrl = (dataUrl, maxWidth, quality) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => {
    const scale = Math.min(1, maxWidth / img.width);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    resolve(canvas.toDataURL('image/jpeg', quality));
  };
  img.onerror = reject;
  img.src = dataUrl;
});

const fileToCompressedDataUrl = async (file) => {
  const original = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const attempts = [[1200, 0.72], [1000, 0.65], [800, 0.6]];
  let result = '';
  for (const [w, q] of attempts) {
    result = await resizeDataUrl(original, w, q);
    if (result.length < 850000) break; // 資料庫單筆文件上限約1MB，這裡留餘裕
  }
  return result;
};

const renderTextWithLinks = (text) => String(text || '').split(/(https?:\/\/[^\s]+)/g).map((part, i) => (
  /^https?:\/\//.test(part)
    ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline break-all">{part}</a>
    : <React.Fragment key={i}>{part}</React.Fragment>
));

// --- 官方公文（依公司公文圖片整理成結構化版面；內容以公司正式公告為準）---
const BULLETIN_ACCENTS = {
  pink: { grad: 'from-pink-500 to-rose-500', text: 'text-pink-600', soft: 'bg-pink-50', dot: 'bg-pink-400' },
  indigo: { grad: 'from-indigo-600 to-blue-500', text: 'text-indigo-600', soft: 'bg-indigo-50', dot: 'bg-indigo-400' },
  amber: { grad: 'from-amber-500 to-orange-500', text: 'text-amber-600', soft: 'bg-amber-50', dot: 'bg-amber-400' },
  teal: { grad: 'from-teal-600 to-emerald-500', text: 'text-teal-600', soft: 'bg-teal-50', dot: 'bg-teal-400' },
  violet: { grad: 'from-violet-600 to-fuchsia-500', text: 'text-violet-600', soft: 'bg-violet-50', dot: 'bg-violet-400' },
  red: { grad: 'from-gray-900 to-red-700', text: 'text-red-600', soft: 'bg-red-50', dot: 'bg-red-400' },
  blue: { grad: 'from-sky-600 to-blue-600', text: 'text-sky-600', soft: 'bg-sky-50', dot: 'bg-sky-400' },
  night: { grad: 'from-purple-900 via-purple-700 to-orange-500', text: 'text-purple-700', soft: 'bg-purple-50', dot: 'bg-orange-400' }
};
const BULLETIN_ICONS = { heart: Heart, award: Award, trophy: Trophy, star: Star, target: Target, users: Users, gift: Gift, calendar: Calendar };
const BULLETIN_TONE = {
  green: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-600',
  blue: 'bg-sky-100 text-sky-700',
  gray: 'bg-gray-100 text-gray-500'
};

const getBulletinStatus = (b) => {
  if (!b.startDate && !b.endDate) return null;
  const today = getTodayDate();
  const start = b.startDate || b.endDate;
  const end = b.endDate || b.startDate;
  const diff = (x, y) => Math.round((new Date(y) - new Date(x)) / 86400000);
  if (today < start) {
    const n = diff(today, start);
    return { text: b.isEvent ? `${n} 天後舉行` : `${n} 天後開始`, tone: 'blue' };
  }
  if (today <= end) {
    const left = diff(today, end);
    if (b.isEvent) return { text: '今天舉行', tone: 'red' };
    return { text: left === 0 ? '今天截止' : `進行中・剩 ${left} 天`, tone: left <= 3 ? 'red' : 'green' };
  }
  return { text: '已結束', tone: 'gray' };
};

const NCIC_SUPA_TARGETS = [
  ['南區業展一處', '台南二處', 'A', '1,320,000'], ['南區業展一處', '台南府城', 'A', '870,000'], ['南區業展一處', '台南新欣', 'B', '830,000'],
  ['南區業展一處', '弘德', 'C', '240,000'], ['南區業展一處', '尚正', 'D', '240,000'], ['南區業展一處', '尚誠', 'C', '300,000'],
  ['南區業展一處', '尚豐', 'C', '310,000'], ['南區業展一處', '路竹', 'D', '240,000'], ['南區業展一處', '鳳旭', 'B', '480,000'],
  ['南區業展一處', '鳳凰', 'A', '890,000'], ['南區業展一處', '樂隆', 'C', '290,000'],
  ['南區業展二處', '九如', 'B', '760,000'], ['南區業展二處', '岡山永安', 'C', '320,000'], ['南區業展二處', '前豐', 'A', '990,000'],
  ['南區業展二處', '屏東直轄', 'B', '610,000'], ['南區業展二處', '高雄直轄二處', 'B', '700,000'], ['南區業展二處', '高興', 'C', '410,000'],
  ['南區業展二處', '博大', 'D', '240,000'], ['南區業展二處', '翔新', 'D', '240,000'], ['南區業展二處', '群興', 'B', '770,000'],
  ['南區業展二處', '融興', 'C', '280,000'],
  ['南區業展三處', '大興', 'B', '570,000'], ['南區業展三處', '元興', 'C', '240,000'], ['南區業展三處', '永耀', 'B', '510,000'],
  ['南區業展三處', '成新', 'A', '1,160,000'], ['南區業展三處', '和興', 'B', '830,000'], ['南區業展三處', '東澂', 'C', '240,000'],
  ['南區業展三處', '前和', 'C', '300,000'], ['南區業展三處', '前昌', 'C', '360,000'], ['南區業展三處', '前廣', 'C', '240,000'],
  ['南區業展三處', '展福', 'B', '580,000'], ['南區業展三處', '真興', 'B', '550,000'], ['南區業展三處', '博愛', 'C', '290,000'],
  ['南區業展三處', '福興', 'C', '370,000'],
  ['南區業展四處', '一心', 'A', '880,000'], ['南區業展四處', '旭成', 'A', '1,110,000'], ['南區業展四處', '欣生', 'A', '870,000'],
  ['南區業展四處', '前一', 'B', '560,000'], ['南區業展四處', '前金', 'B', '720,000'], ['南區業展四處', '高雄直轄一處', 'B', '490,000']
];

const OFFICIAL_BULLETINS = [
  {
    id: 'official-seminar', art: 'seminar', isBuiltin: true, category: '活動講座', icon: 'calendar', accent: 'red', isEvent: true,
    title: '高資保戶講座｜夫妻剩餘財產分配',
    summary: '10/15（四）13:00–16:00，高雄福華飯店 7F 金鳳廳，限額 15 組，需攜伴保戶報名',
    startDate: '2026-10-15', endDate: '2026-10-15', createdAt: '2026-10-05T08:08:00.000Z',
    blocks: [
      { type: 'intro', text: '夫妻財產怎麼分？資產傳承又該如何提前規劃？本次特別規劃「夫妻剩餘財產分配」專題講座，邀請專業律師 × 資深財管顧問聯手分享，帶您掌握夫妻財產分配與資產傳承的關鍵觀念，提前做好完善規劃！' },
      { type: 'highlights', items: [{ value: '10/15 (四)', label: '13:00 開始報到' }, { value: '15 組', label: '限額，額滿為止' }, { value: '需攜伴', label: '保戶報名參與' }] },
      { type: 'facts', title: '活動資訊', rows: [
        ['時間', '10/15（四）13:00–16:00（13:00 開始報到）'],
        ['地點', '高雄福華飯店 7F 金鳳廳（高雄市新興區七賢一路 311 號）'],
        ['參加對象', '需攜伴保戶報名參與'],
        ['報名狀況', '發佈時已報名 6 組（限額 15 組，額滿為止）'],
        ['主辦', '業務暨商品推廣處']
      ] },
      { type: 'timeline', title: '講座流程', items: [
        { time: '13:00–13:30', text: '入場報到' },
        { time: '13:30–15:00', text: '夫妻剩餘財產分配（陳心儀 律師／王英茂 顧問）' },
        { time: '15:30–16:00', text: '會後交流' }
      ] },
      { type: 'people', title: '高資專家團隊', items: [
        { name: '王英茂', role: '資深經理', points: ['35 年財富規劃經驗', '專精資產傳承及遺贈規劃', '信託與財務風險管理', '企業風險整合服務'] },
        { name: '陳心儀', role: '律師', points: ['15 年法律經驗', '民法（親屬繼承及債權債務）、刑法及勞動法', '各類稅法之稅務行政救濟及規劃', '個人資產傳承規劃'] }
      ] },
      { type: 'note', text: '因座位有限，報名後如需取消，務必提前通知！' },
      { type: 'link', label: '前往報名', url: 'https://forms.gle/LMsrqu7Bih4rKJGf7' }
    ]
  },
  {
    id: 'official-first-week', art: 'firstweek', isBuiltin: true, category: '獎勵活動', icon: 'star', accent: 'amber',
    title: '十月特定商品首週搶先獎勵（NCIC／SUPA）',
    summary: '10/9–10/16 個人累計實收保費達 2 萬，取前 300 名，每人獎金 800 元',
    startDate: '2026-10-09', endDate: '2026-10-16', createdAt: '2026-10-05T08:07:00.000Z',
    blocks: [
      { type: 'highlights', items: [{ value: '$800', label: '每人獎金' }, { value: '前 300 名', label: '獎勵名額' }, { value: '2 萬', label: '累計實收保費（含）以上' }] },
      { type: 'facts', title: '活動資訊', rows: [
        ['獎勵目的', '鼓勵通訊處及業務同仁銷售 NCIC 及 SUPA，衝刺加權保費以達成新高峰資格'],
        ['獎勵期間', '115/10/9～10/16（含）新受理保單，且於 115/11/30（含）前完成核保'],
        ['獎勵對象', '南區業務同仁'],
        ['獎勵商品', 'NCIC 及 SUPA']
      ] },
      { type: 'bullets', title: '獎勵內容', items: ['個人首週搶先獎：凡個人於 10/9～10/16 累計實收保費達 2 萬（含）以上，取前 300 名，每人可獲得獎金 800 元'] },
      { type: 'note', text: '使用投保通受理之保單，實收保費可以加乘 1.1 倍計算。' }
    ]
  },
  {
    id: 'official-halloween', art: 'halloween', isBuiltin: true, category: '團隊活動', icon: 'calendar', accent: 'night', isEvent: true,
    title: '萬聖節變裝遊行｜神鬼奇航',
    summary: '10/25（日）18:00，穿著各個國家「神鬼」造型的服裝，一起參加變裝遊行',
    startDate: '2026-10-25', endDate: '2026-10-25', createdAt: '2026-10-05T08:06:30.000Z',
    blocks: [
      { type: 'intro', text: '10/25 晚上要舉辦萬聖節變裝遊行，主題是「神鬼奇航」，請大家穿著各個國家「神鬼」造型的服裝參加！' },
      { type: 'highlights', items: [{ value: '10/25 (日)', label: '18:00 開始' }, { value: '神鬼奇航', label: '活動主題' }, { value: '各國神鬼', label: '造型服裝規定' }] },
      { type: 'facts', title: '活動資訊', rows: [
        ['活動', '萬聖節變裝遊行'],
        ['時間', '10/25（日）18:00'],
        ['主題', '神鬼奇航'],
        ['服裝規定', '穿著各個國家「神鬼」造型的服裝']
      ] },
      { type: 'chips', title: '造型靈感（僅供參考）', items: ['日本妖怪', '墨西哥亡靈節骷髏', '歐洲吸血鬼與狼人', '埃及神祇', '北歐神話', '加勒比海海盜幽靈'] },
      { type: 'note', text: '集合地點、報名方式與評比獎勵，原通知未提供，請洽主管確認。' }
    ]
  },
  {
    id: 'official-target-challenge', art: 'challenge', isBuiltin: true, category: '獎勵活動', icon: 'target', accent: 'blue',
    title: '十月通訊處特定商品目標達成挑戰賽（NCIC／SUPA）',
    summary: '極豐（暫依尚豐 C 組）目標 31 萬：首週達 40%、全月達 100%／120% 可領業展費補助',
    startDate: '2026-10-09', endDate: '2026-10-31', createdAt: '2026-10-05T08:06:00.000Z',
    blocks: [
      { type: 'highlights', title: '極豐通訊處的目標（暫依尚豐：C 組）', items: [
        { value: '31 萬', label: '實收保費目標' },
        { value: '12.4 萬', label: '首週達成門檻（40%，10/9–10/16）' },
        { value: '31 萬', label: '全月達成門檻（100%）' },
        { value: '37.2 萬', label: '全月超標門檻（120%）' }
      ] },
      { type: 'table', title: '極豐可領的業展費補助（C 組）', columns: ['獎項', '門檻（實收保費）', '補助金額（元）'], rows: [
        ['A 首週達成獎', '目標 40%＝124,000', '3,000'],
        ['B（一）全月達成獎', '目標 100%＝310,000', '4,000'],
        ['B（二）全月超標獎', '目標 120%＝372,000', '6,000']
      ], numericCols: [2] },
      { type: 'note', text: '極豐通訊處尚未成立，目標暫依尚豐（C 組，實收保費目標 310,000）計算。使用投保通受理之保單，實收保費可加乘 1.1 倍。正式成立後，以公司核定的組別與目標為準。' },
      { type: 'facts', title: '活動資訊', rows: [
        ['獎勵目的', '鼓勵通訊處及業務同仁銷售 NCIC 及 SUPA，衝刺加權保費以達成新高峰資格'],
        ['獎勵期間', '115/10/9～10/31（含）新受理保單，且於 115/11/30（含）前完成核保'],
        ['獎勵對象', '南區各通訊處'],
        ['獎勵商品', 'NCIC 及 SUPA']
      ] },
      { type: 'bullets', title: '獎勵內容', items: [
        'A. 首週達成獎：10/9～10/16 通訊處累計保費達目標 40%（含）以上，可獲相對應之業展費補助',
        'B-（一）全月達成獎：10/9～10/31 通訊處累計保費達目標 100%（含）以上，可獲相對應之業展費補助',
        'B-（二）全月超標獎：10/9～10/31 通訊處累計保費達目標 120%（含）以上，可獲相對應之業展費補助'
      ] },
      { type: 'table', title: '業展費補助金額（元）', columns: ['組別', 'A 首週達成獎', 'B（一）全月達成獎（實收保費達成率 100% 以上）', 'B（二）全月超標獎（實收保費達成率 120% 以上）'], rows: [
        ['A 組', '5,000', '6,000', '9,000'], ['B 組', '4,000', '5,000', '7,000'], ['C 組', '3,000', '4,000', '6,000'], ['D 組', '2,000', '3,000', '5,000']
      ], numericCols: [1, 2, 3] },
      { type: 'note', text: 'A 首週達成獎與 B 全月獎可以重複獲獎；全月獎（一）及（二）僅能擇一獲獎。使用投保通受理之保單，實收保費可以加乘 1.1 倍計算。' },
      { type: 'table', title: '各通訊處 NCIC+SUPA 實收保費目標（可搜尋）', searchable: true, maxHeight: 360, columns: ['業展處', '通訊處', '組別', '實收保費目標'], rows: NCIC_SUPA_TARGETS, numericCols: [3], highlight: '尚豐' },
      { type: 'note', text: '下表為依公文附件整理，色塊標示的是尚豐（極豐暫依此列計算）。' }
    ]
  },
  {
    id: 'official-trainee-new-product', art: 'trainee', isBuiltin: true, category: '獎勵活動', icon: 'users', accent: 'teal',
    title: '115年10月南區優培 NCIC／SUPA 新商品專屬獎勵',
    summary: '早鳥開張獎、聯手出擊獎，以及保費／件數雙排名賽（各前 10 名，獎金 2,000 元）',
    startDate: '2026-10-09', endDate: '2026-10-31', createdAt: '2026-10-05T08:05:00.000Z',
    blocks: [
      { type: 'highlights', items: [{ value: '$2,000', label: '排名賽獎金（各前 10 名）' }, { value: '10 萬', label: '保費排名賽門檻（實收）' }, { value: '5 件', label: '件數排名賽門檻' }] },
      { type: 'facts', title: '活動資訊', rows: [
        ['獎勵期間', '10/9～10/31（含）新受理 NCIC／SUPA 新商品'],
        ['獎勵對象', '① 11411～11510 期在訓優培　② 新高峰新進業代組及特定新進業代組人員']
      ] },
      { type: 'rewards', title: '獎勵內容', items: [
        { no: '1', title: '早鳥開張獎', desc: '10/9～10/15 受理且繳費商品達 1 件以上者，可獲星巴克早餐。' },
        { no: '2', title: '聯手出擊獎', desc: '10/9～10/31 受理且於 11/30（含）前完成核保發單，獎勵對象與推薦主管皆銷售獎勵商品達 4 件以上，兩人皆可獲榮譽交流餐宴。' },
        { no: '3', title: '銷售排名賽', desc: '10/9～10/31 受理且於 11/30（含）前完成核保發單，依獎勵商品件數／保費排序。', subs: [
          { label: '保費排名賽', text: '獎勵商品實收保費達 10 萬（含）以上，依保費高低取前 10 名，各可獲獎金 2,000 元' },
          { label: '件數排名賽', text: '獎勵商品件數達 5 件（含）以上，依實收保費高低取前 10 名，各可獲獎金 2,000 元' }
        ] }
      ] },
      { type: 'note', text: '保費排名賽與件數排名賽不重複獲獎，以實收保費排名賽優先遴選；獎項若排名相同時，以獎勵商品累計 FYC 進行排序。' }
    ]
  },
  {
    id: 'official-wangnian', art: 'wangnian', isBuiltin: true, category: '獎勵活動', icon: 'award', accent: 'violet',
    title: '10月通訊處「神采飛羊」旺年會團隊獎勵活動',
    summary: '通訊處達基本門檻後，個人累積業績達標準可獲邀參加旺年會（標準 ❷ 可攜伴）',
    startDate: '2026-10-01', endDate: '2026-10-31', createdAt: '2026-10-05T08:04:00.000Z',
    blocks: [
      { type: 'highlights', items: [{ value: '30 萬', label: 'A&H 加權保費' }, { value: '30 萬', label: '傳統型 RP 加權保費' }, { value: '80%', label: '通訊處投保通使用率' }] },
      { type: 'facts', title: '活動資訊', rows: [
        ['獎勵期間', '115/10/1～10/31 新受理，且於 115/11/30（含）前完成承保保件（含不定期增額）'],
        ['不定期增額', '須於 115/10/1～10/31 經公司過帳並完成審核結案'],
        ['獎勵標準', '通訊處達基本門檻，且通訊處轄屬業務同仁達獲獎標準者，可獲相對應獎勵']
      ] },
      { type: 'bullets', title: '一、基本門檻（通訊處）', items: [
        '獎勵期間新受理業績（含不定期增額）達 10 月份加權保費達成率 100%',
        '通訊處 10 月投保通使用率達 80%（含）以上'
      ] },
      { type: 'table', title: '二、個人獲獎標準（通訊處達基本門檻後，個人獎勵期間累積業績達下列標準 ❶ 或 ❷）', columns: ['標準', '條件', '獎勵內容'], rows: [
        ['標準 ❶', 'A&H 加權 30 萬　或　傳統型 RP 加權 30 萬', '本人可獲邀參加旺年會'],
        ['標準 ❷', 'A&H 加權 30 萬　且　傳統型 RP 加權 30 萬', '本人可獲邀「攜伴」參加旺年會']
      ] },
      { type: 'note', text: '僅供參考，實際仍以公告為主。' }
    ]
  },
  {
    id: 'official-team-rank', art: 'teamrank', isBuiltin: true, category: '獎勵活動', icon: 'trophy', accent: 'indigo',
    title: '10～11月「通訊處團隊加碼」排名賽',
    summary: '通訊處達基本要求後，依加權保費達成率遴選各組第一名，於旺年會接受授旗表揚',
    startDate: '2026-10-01', endDate: '2026-11-30', createdAt: '2026-10-05T08:03:00.000Z',
    blocks: [
      { type: 'highlights', items: [{ value: '100%', label: '加權保費達成率門檻' }, { value: '80%', label: '投保通使用率門檻' }, { value: '各組第 1 名', label: '授旗儀式表揚' }] },
      { type: 'facts', title: '活動資訊', rows: [
        ['獎勵期間', '115/10/1～115/11/30 核保發單業績（含不定期增額）'],
        ['獎勵標準', '通訊處達基本門檻，得按通訊處加權保費達成率遴選各參賽組別第一名，於旺年會活動與會通訊處同仁接受執行主管授旗儀式表揚']
      ] },
      { type: 'chips', title: '參賽組別', items: ['總監大型', '總監中小型', '處經理最大型', '處經理超大型', '處經理特大型', '處經理大型', '處經理中型', '處經理小型'] },
      { type: 'bullets', title: '基本要求', items: ['通訊處 10～11 月加權保費達成率達 100%', '通訊處 10～11 月投保通使用率達 80%'] },
      { type: 'bullets', title: '遴選標準', items: ['達基本要求之通訊處，按加權保費達成率遴選各組第一名'] },
      { type: 'note', text: '僅供參考，實際仍以公告為主。' }
    ]
  },
  {
    id: 'official-anxin', art: 'anxin', isBuiltin: true, category: '獎勵活動', icon: 'gift', accent: 'pink',
    title: '第四季「安心守護」業務員抽獎活動',
    summary: '每協助一位客戶完成指定「保單安心聯絡人」申請，即可獲得一次 Gogoro EZZY 500 抽獎機會',
    startDate: '2026-10-01', endDate: '2026-12-31', createdAt: '2026-10-05T08:02:00.000Z',
    blocks: [
      { type: 'highlights', items: [{ value: '1 位客戶', label: '＝ 1 次抽獎機會' }, { value: '12/31', label: '活動截止' }, { value: '簽回越多', label: '中獎機會越大' }] },
      { type: 'facts', title: '活動資訊', rows: [
        ['活動期間', '115/10/1～115/12/31'],
        ['獎項', 'Gogoro EZZY 500　玩具總動員系列　乙台'],
        ['活動內容', '業務員每協助一位客戶完成指定「保單安心聯絡人」申請，即可獲得乙次抽獎機會，以此類推']
      ] },
      { type: 'note', text: '獎項圖片僅供參考，實際依廠商提供為準。' },
      { type: 'note', text: '小提醒：本系統「客戶管理」的客戶資料可以記錄保單安心聯絡人，方便追蹤哪些客戶已經完成申請。' }
    ]
  },
  {
    id: 'official-warm-care', art: 'warmcare', isBuiltin: true, category: '服務公告', icon: 'heart', accent: 'teal',
    title: '2026 暖心關懷服務',
    summary: '共 9 項免費暖心關懷服務，數量有限，請至南山 AP「通知」查詢客戶資格並盡快申請',
    createdAt: '2026-10-05T08:01:00.000Z',
    blocks: [
      { type: 'highlights', items: [{ value: '9 項', label: '免費暖心關懷服務' }, { value: '數量有限', label: '請把握時間申請' }] },
      { type: 'bullets', title: '申請方式', items: [
        '立刻上到南山 AP「通知」功能',
        '轉查詢是否有客戶符合資格',
        '符合資格的客戶，就可以馬上提出申請'
      ] },
      { type: 'note', text: '9 項服務的詳細內容，原公告圖片未列出，請洽公司公文或主管確認。' }
    ]
  }
];

// --- 公文插圖：每則公文一張向量插畫（白色半透明圖形，會自動套上該公文的主色漸層）---
const ArtSparkle = ({ x, y, s = 1, o = 0.9 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -8 L2.2 -2.2 L8 0 L2.2 2.2 L0 8 L-2.2 2.2 L-8 0 L-2.2 -2.2Z" fill="#fff" opacity={o} />
);
const ArtHeart = ({ x, y, s = 1, o = 0.9 }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 4 C-8 -4 -10 -10 -5 -12 C-2 -13 0 -11 0 -9 C0 -11 2 -13 5 -12 C10 -10 8 -4 0 4Z" fill="#fff" opacity={o} />
);
const ArtStar = ({ x, y, s = 1, fill = '#fff' }) => (
  <polygon transform={`translate(${x} ${y}) scale(${s})`} points="0,-10 3,-3 10,-3 4.5,2 6.5,9 0,5 -6.5,9 -4.5,2 -10,-3 -3,-3" fill={fill} />
);

const BulletinArt = ({ kind, className = '', slice = false }) => (
  <svg viewBox="0 0 240 160" className={className} preserveAspectRatio={slice ? 'xMidYMid slice' : 'xMidYMid meet'} aria-hidden="true">
    <circle cx="120" cy="80" r="64" fill="#fff" opacity="0.10" />
    <circle cx="120" cy="80" r="46" fill="#fff" opacity="0.08" />

    {kind === 'seminar' && (
      <g>
        <rect x="117" y="40" width="6" height="84" rx="3" fill="#fff" />
        <rect x="92" y="122" width="56" height="9" rx="4.5" fill="#fff" />
        <rect x="60" y="44" width="120" height="5" rx="2.5" fill="#fff" />
        <circle cx="120" cy="42" r="8" fill="#fff" />
        <path d="M66 49 L50 92 M66 49 L82 92 M174 49 L158 92 M174 49 L190 92" stroke="#fff" strokeWidth="2" opacity="0.85" fill="none" />
        <path d="M46 92 H86 Q84 108 66 108 Q48 108 46 92Z" fill="#fff" />
        <path d="M154 92 H194 Q192 108 174 108 Q156 108 154 92Z" fill="#fff" />
        <ellipse cx="174" cy="88" rx="13" ry="4" fill="#fff" opacity="0.7" />
        <ellipse cx="174" cy="83" rx="13" ry="4" fill="#fff" opacity="0.85" />
        <ellipse cx="174" cy="78" rx="13" ry="4" fill="#fff" />
        <ArtSparkle x={54} y={64} s={0.9} />
        <ArtSparkle x={196} y={46} s={1.2} />
        <ArtSparkle x={86} y={32} s={0.7} o={0.7} />
      </g>
    )}

    {kind === 'firstweek' && (
      <g>
        <rect x="112" y="26" width="16" height="12" rx="3" fill="#fff" />
        <rect x="150" y="38" width="12" height="8" rx="2" fill="#fff" transform="rotate(40 156 42)" />
        <circle cx="120" cy="86" r="44" fill="#fff" opacity="0.18" stroke="#fff" strokeWidth="8" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return <line key={i} x1={120 + 33 * Math.sin(a)} y1={86 - 33 * Math.cos(a)} x2={120 + 38 * Math.sin(a)} y2={86 - 38 * Math.cos(a)} stroke="#fff" strokeWidth="2" opacity="0.8" />;
        })}
        <path d="M128 56 L102 92 H119 L111 118 L142 78 H124 Z" fill="#fff" />
        <ArtSparkle x={60} y={50} s={1.1} />
        <ArtSparkle x={188} y={42} s={0.9} />
        <ArtSparkle x={196} y={118} s={1.2} o={0.8} />
      </g>
    )}

    {kind === 'challenge' && (
      <g>
        <circle cx="108" cy="86" r="50" fill="none" stroke="#fff" strokeWidth="6" opacity="0.95" />
        <circle cx="108" cy="86" r="34" fill="none" stroke="#fff" strokeWidth="6" opacity="0.8" />
        <circle cx="108" cy="86" r="18" fill="none" stroke="#fff" strokeWidth="6" opacity="0.65" />
        <circle cx="108" cy="86" r="6" fill="#fff" />
        <line x1="112" y1="82" x2="176" y2="30" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        <path d="M176 30 L188 22 M176 30 L184 42" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" />
        <ArtSparkle x={52} y={42} s={1} />
        <ArtSparkle x={190} y={104} s={1.1} o={0.8} />
      </g>
    )}

    {kind === 'trainee' && (
      <g>
        <path d="M92 116 H148 L142 142 H98 Z" fill="#fff" />
        <rect x="88" y="110" width="64" height="9" rx="4.5" fill="#fff" />
        <path d="M120 112 C120 92 120 78 120 60" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M120 92 C98 94 84 80 84 62 C104 60 120 72 120 92Z" fill="#fff" opacity="0.9" />
        <path d="M120 78 C142 80 156 64 156 46 C136 44 120 56 120 78Z" fill="#fff" />
        <ArtStar x={120} y={34} s={1.2} />
        <ArtSparkle x={64} y={44} s={1} />
        <ArtSparkle x={182} y={84} s={0.9} />
        <ArtSparkle x={60} y={108} s={0.7} o={0.7} />
      </g>
    )}

    {kind === 'wangnian' && (
      <g>
        <line x1="62" y1="20" x2="62" y2="40" stroke="#fff" strokeWidth="2" opacity="0.8" />
        <ellipse cx="62" cy="52" rx="10" ry="12" fill="#fff" opacity="0.9" />
        <rect x="58" y="63" width="8" height="5" rx="2" fill="#fff" opacity="0.7" />
        <line x1="190" y1="16" x2="190" y2="34" stroke="#fff" strokeWidth="2" opacity="0.8" />
        <ellipse cx="190" cy="44" rx="9" ry="11" fill="#fff" opacity="0.9" />
        <rect x="186" y="54" width="8" height="5" rx="2" fill="#fff" opacity="0.7" />
        <rect x="98" y="114" width="6" height="22" rx="3" fill="rgba(0,0,0,0.3)" />
        <rect x="116" y="116" width="6" height="22" rx="3" fill="rgba(0,0,0,0.3)" />
        <rect x="134" y="116" width="6" height="22" rx="3" fill="rgba(0,0,0,0.3)" />
        <rect x="148" y="112" width="6" height="22" rx="3" fill="rgba(0,0,0,0.3)" />
        <circle cx="92" cy="92" r="20" fill="#fff" />
        <circle cx="116" cy="82" r="24" fill="#fff" />
        <circle cx="142" cy="90" r="21" fill="#fff" />
        <circle cx="106" cy="104" r="18" fill="#fff" />
        <circle cx="130" cy="106" r="17" fill="#fff" />
        <ellipse cx="172" cy="88" rx="12" ry="15" fill="rgba(0,0,0,0.3)" />
        <ellipse cx="160" cy="74" rx="11" ry="5" transform="rotate(-30 160 74)" fill="rgba(0,0,0,0.3)" />
        <path d="M166 74 C160 60 172 56 174 64" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="175" cy="84" r="2.5" fill="#fff" />
        <circle cx="44" cy="100" r="3" fill="#fff" opacity="0.8" />
        <circle cx="206" cy="108" r="3" fill="#fff" opacity="0.8" />
        <circle cx="198" cy="76" r="2" fill="#fff" opacity="0.7" />
        <ArtSparkle x={86} y={34} s={0.9} />
      </g>
    )}

    {kind === 'teamrank' && (
      <g>
        <rect x="64" y="108" width="40" height="32" rx="3" fill="#fff" opacity="0.7" />
        <rect x="104" y="92" width="44" height="48" rx="3" fill="#fff" opacity="0.95" />
        <rect x="148" y="116" width="40" height="24" rx="3" fill="#fff" opacity="0.55" />
        <text x="84" y="130" textAnchor="middle" fontSize="20" fontWeight="700" fill="rgba(0,0,0,0.3)">2</text>
        <text x="126" y="124" textAnchor="middle" fontSize="26" fontWeight="700" fill="rgba(0,0,0,0.3)">1</text>
        <text x="168" y="134" textAnchor="middle" fontSize="18" fontWeight="700" fill="rgba(0,0,0,0.3)">3</text>
        <path d="M108 34 H144 V50 Q144 72 126 76 Q108 72 108 50 Z" fill="#fff" />
        <path d="M108 40 H98 Q98 58 112 60" stroke="#fff" strokeWidth="4" fill="none" />
        <path d="M144 40 H154 Q154 58 140 60" stroke="#fff" strokeWidth="4" fill="none" />
        <rect x="122" y="76" width="8" height="10" fill="#fff" />
        <rect x="114" y="84" width="24" height="8" rx="3" fill="#fff" />
        <ArtStar x={126} y={52} s={0.8} fill="rgba(0,0,0,0.22)" />
        <ArtSparkle x={70} y={52} s={1} />
        <ArtSparkle x={182} y={60} s={0.9} />
      </g>
    )}

    {kind === 'anxin' && (
      <g>
        <circle cx="88" cy="122" r="15" fill="none" stroke="#fff" strokeWidth="6" />
        <circle cx="88" cy="122" r="4" fill="#fff" />
        <circle cx="162" cy="122" r="15" fill="none" stroke="#fff" strokeWidth="6" />
        <circle cx="162" cy="122" r="4" fill="#fff" />
        <path d="M96 110 C96 88 110 78 128 78 H140 L148 110 Z" fill="#fff" />
        <rect x="82" y="70" width="46" height="10" rx="5" fill="#fff" />
        <rect x="100" y="108" width="52" height="8" rx="4" fill="#fff" />
        <path d="M150 112 L160 66" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        <path d="M152 62 H174" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        <circle cx="166" cy="74" r="5" fill="#fff" opacity="0.85" />
        <rect x="168" y="36" width="26" height="22" rx="3" fill="#fff" />
        <rect x="179" y="36" width="4" height="22" fill="rgba(0,0,0,0.2)" />
        <rect x="168" y="45" width="26" height="4" fill="rgba(0,0,0,0.2)" />
        <path d="M181 36 C172 24 166 34 181 36 C196 34 190 24 181 36Z" fill="#fff" />
        <ArtHeart x={62} y={52} s={1.4} />
        <ArtHeart x={82} y={34} s={0.9} o={0.7} />
        <ArtSparkle x={46} y={92} s={0.8} o={0.8} />
      </g>
    )}

    {kind === 'warmcare' && (
      <g>
        <path d="M120 130 C68 94 60 60 84 46 C102 36 116 46 120 56 C124 46 138 36 156 46 C180 60 172 94 120 130Z" fill="#fff" />
        <path d="M54 112 C76 140 164 140 186 112" stroke="#fff" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.9" />
        <ArtHeart x={58} y={52} s={1.5} o={0.8} />
        <ArtHeart x={188} y={44} s={1.1} o={0.8} />
        <ArtHeart x={198} y={84} s={0.8} o={0.6} />
        <ArtSparkle x={44} y={90} s={0.9} />
        <ArtSparkle x={120} y={28} s={0.9} />
      </g>
    )}

    {kind === 'halloween' && (
      <g>
        <circle cx="152" cy="46" r="26" fill="#fff" opacity="0.92" />
        <circle cx="144" cy="40" r="5" fill="rgba(0,0,0,0.07)" />
        <circle cx="160" cy="54" r="7" fill="rgba(0,0,0,0.07)" />
        <circle cx="156" cy="36" r="3" fill="rgba(0,0,0,0.07)" />
        <path d="M60 36 q6 -8 12 0 q6 -8 12 0 q-6 4 -12 2 q-6 2 -12 -2Z" fill="#fff" opacity="0.8" />
        <path d="M96 22 q4 -6 8 0 q4 -6 8 0 q-4 3 -8 1 q-4 2 -8 -1Z" fill="#fff" opacity="0.6" />
        <path d="M62 112 H182 L168 134 H76 Z" fill="#fff" />
        <rect x="118" y="46" width="4" height="68" fill="#fff" />
        <rect x="150" y="66" width="3" height="48" fill="#fff" />
        <path d="M124 50 C150 62 152 94 124 106 Z" fill="#fff" opacity="0.95" />
        <path d="M116 58 C96 68 96 92 116 100 Z" fill="#fff" opacity="0.85" />
        <path d="M156 70 C172 78 172 96 156 102 Z" fill="#fff" opacity="0.8" />
        <path d="M122 46 L142 52 L122 58 Z" fill="#fff" />
        <circle cx="136" cy="78" r="8" fill="rgba(0,0,0,0.28)" />
        <circle cx="133" cy="76" r="2" fill="#fff" />
        <circle cx="139" cy="76" r="2" fill="#fff" />
        <rect x="134" y="82" width="4" height="4" fill="#fff" />
        <path d="M30 138 Q45 128 60 138 T90 138 T120 138 T150 138 T180 138 T210 138" stroke="#fff" strokeWidth="4" fill="none" opacity="0.85" strokeLinecap="round" />
        <path d="M20 150 Q35 142 50 150 T80 150 T110 150 T140 150 T170 150 T200 150 T230 150" stroke="#fff" strokeWidth="3" fill="none" opacity="0.5" strokeLinecap="round" />
        <path d="M30 120 V98 C30 82 56 82 56 98 V120 L50 115 L43 120 L36 115Z" fill="#fff" opacity="0.9" />
        <circle cx="38" cy="98" r="3" fill="rgba(0,0,0,0.35)" />
        <circle cx="48" cy="98" r="3" fill="rgba(0,0,0,0.35)" />
        <ellipse cx="206" cy="126" rx="14" ry="12" fill="#fff" opacity="0.92" />
        <rect x="204" y="111" width="4" height="6" fill="#fff" />
        <polygon points="199,122 203,122 201,126" fill="rgba(0,0,0,0.3)" />
        <polygon points="209,122 213,122 211,126" fill="rgba(0,0,0,0.3)" />
        <path d="M200 131 Q206 135 212 131" stroke="rgba(0,0,0,0.3)" strokeWidth="2" fill="none" />
        <ArtSparkle x={96} y={46} s={0.8} o={0.8} />
        <ArtSparkle x={196} y={74} s={0.8} o={0.7} />
      </g>
    )}
  </svg>
);

const BulletinHeading = ({ title, accent }) => (
  title ? <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><span className={`w-1 h-4 rounded-full ${accent.dot}`}></span>{title}</h4> : null
);

const BulletinTable = ({ block, accent }) => {
  const [search, setSearch] = useState('');
  const keyword = search.trim();
  const rows = block.rows.filter(r => !keyword || r.some(c => String(c).includes(keyword)));
  const numeric = block.numericCols || [];
  return (
    <div>
      <BulletinHeading title={block.title} accent={accent} />
      {block.searchable && (
        <input type="text" placeholder="搜尋通訊處、業展處或組別..." className="w-full p-3 mb-3 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:border-indigo-400" value={search} onChange={e => setSearch(e.target.value)} />
      )}
      <div className="overflow-x-auto rounded-2xl border border-gray-100" style={block.maxHeight ? { maxHeight: block.maxHeight, overflowY: 'auto' } : undefined}>
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold sticky top-0">
            <tr>{block.columns.map((c, i) => <th key={i} className={`px-3 py-2.5 ${numeric.includes(i) ? 'text-right' : ''}`}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className={`border-t border-gray-50 ${block.highlight && r[1] === block.highlight ? accent.soft : ''}`}>
                {r.map((c, j) => <td key={j} className={`px-3 py-3 ${j === 0 ? 'font-bold text-gray-800 whitespace-nowrap' : 'text-gray-600'} ${numeric.includes(j) ? 'text-right tabular-nums' : ''}`}>{c}</td>)}
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={block.columns.length} className="px-3 py-6 text-center text-gray-400">找不到符合的資料</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BulletinBlock = ({ block, accentKey }) => {
  const accent = BULLETIN_ACCENTS[accentKey] || BULLETIN_ACCENTS.indigo;
  switch (block.type) {
    case 'intro':
      return <p className="text-base text-gray-600 leading-relaxed">{block.text}</p>;
    case 'highlights':
      return (
        <div>
          <BulletinHeading title={block.title} accent={accent} />
          <div className={`grid gap-3 ${block.items.length === 2 ? 'grid-cols-2' : block.items.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {block.items.map((it, i) => (
              <div key={i} className={`${accent.soft} rounded-2xl p-4`}>
                <p className={`text-2xl font-bold leading-tight ${accent.text}`}>{it.value}</p>
                <p className="text-xs text-gray-500 mt-1.5 leading-snug">{it.label}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case 'facts':
      return (
        <div>
          <BulletinHeading title={block.title} accent={accent} />
          <div className="rounded-2xl border border-gray-100 divide-y divide-gray-50">
            {block.rows.map((r, i) => (
              <div key={i} className="p-4 flex flex-col sm:flex-row sm:gap-4">
                <p className="text-xs font-bold text-gray-400 sm:w-24 shrink-0 mb-1 sm:mb-0 sm:pt-0.5">{r[0]}</p>
                <p className="text-base text-gray-800 leading-relaxed">{r[1]}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case 'bullets':
      return (
        <div>
          <BulletinHeading title={block.title} accent={accent} />
          <ul className="space-y-2.5">
            {block.items.map((t, i) => (
              <li key={i} className="flex gap-3 text-base text-gray-700 leading-relaxed"><span className={`w-1.5 h-1.5 rounded-full mt-2.5 shrink-0 ${accent.dot}`}></span><span>{t}</span></li>
            ))}
          </ul>
        </div>
      );
    case 'chips':
      return (
        <div>
          <BulletinHeading title={block.title} accent={accent} />
          <div className="flex flex-wrap gap-2">
            {block.items.map((t, i) => <span key={i} className={`text-sm font-bold px-3 py-1.5 rounded-full ${accent.soft} ${accent.text}`}>{t}</span>)}
          </div>
        </div>
      );
    case 'table':
      return <BulletinTable block={block} accent={accent} />;
    case 'rewards':
      return (
        <div>
          <BulletinHeading title={block.title} accent={accent} />
          <div className="space-y-3">
            {block.items.map((it, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 p-4 flex gap-3">
                <span className={`w-8 h-8 rounded-full bg-gradient-to-br ${accent.grad} text-white text-sm font-bold flex items-center justify-center shrink-0`}>{it.no}</span>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-base">{it.title}</p>
                  <p className="text-base text-gray-600 leading-relaxed mt-1">{it.desc}</p>
                  {it.subs && (
                    <div className="mt-3 space-y-2">
                      {it.subs.map((s, j) => (
                        <div key={j} className={`${accent.soft} rounded-xl p-3`}>
                          <p className={`text-sm font-bold ${accent.text}`}>{s.label}</p>
                          <p className="text-sm text-gray-700 leading-relaxed mt-0.5">{s.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'timeline':
      return (
        <div>
          <BulletinHeading title={block.title} accent={accent} />
          <div className="space-y-0">
            {block.items.map((it, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className={`w-3 h-3 rounded-full mt-1.5 ${accent.dot}`}></span>
                  {i < block.items.length - 1 && <span className="w-px flex-1 bg-gray-200 my-1"></span>}
                </div>
                <div className="pb-5">
                  <p className={`text-sm font-bold ${accent.text}`}>{it.time}</p>
                  <p className="text-base text-gray-800 mt-0.5">{it.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'people':
      return (
        <div>
          <BulletinHeading title={block.title} accent={accent} />
          <div className="grid sm:grid-cols-2 gap-3">
            {block.items.map((p, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar name={p.name} size={44} />
                  <div>
                    <p className="font-bold text-gray-900 text-base">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.role}</p>
                  </div>
                </div>
                <ul className="space-y-1.5">
                  {p.points.map((t, j) => <li key={j} className="text-sm text-gray-600 flex gap-2"><span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${accent.dot}`}></span><span>{t}</span></li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      );
    case 'note':
      return <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800 leading-relaxed">※ {block.text}</div>;
    case 'link':
      return (
        <a href={block.url} target="_blank" rel="noopener noreferrer" className={`block text-center py-4 rounded-2xl font-bold text-white text-base bg-gradient-to-r ${accent.grad} shadow-sm`}>
          {block.label}
          <span className="block text-xs font-normal text-white/80 mt-0.5 break-all">{block.url}</span>
        </a>
      );
    default:
      return null;
  }
};

const BulletinDetail = ({ bulletin, onClose }) => {
  const accent = BULLETIN_ACCENTS[bulletin.accent] || BULLETIN_ACCENTS.indigo;
  const status = getBulletinStatus(bulletin);
  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full md:max-w-2xl h-[94vh] md:h-auto md:max-h-[92vh] rounded-t-3xl md:rounded-2xl shadow-2xl animate-scale-up flex flex-col overflow-hidden">
        <div className={`bg-gradient-to-br ${accent.grad} text-white shrink-0 relative overflow-hidden`}>
          <div className="absolute -top-16 -left-10 w-52 h-52 rounded-full bg-white/10"></div>
          <div className="absolute -bottom-24 -right-14 w-64 h-64 rounded-full bg-white/10"></div>
          <button onClick={onClose} className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><X size={22} /></button>
          <div className="relative h-40 pt-5 flex items-center justify-center">
            <BulletinArt kind={bulletin.art} className="h-full w-auto" />
          </div>
          <div className="relative px-5 pb-6 pt-3">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full">{bulletin.category}</span>
              {status && <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${BULLETIN_TONE[status.tone]}`}>{status.text}</span>}
            </div>
            <h3 className="text-xl font-bold leading-snug">{bulletin.title}</h3>
            <p className="text-sm text-white/85 mt-2 leading-relaxed">{bulletin.summary}</p>
          </div>
        </div>
        <div className="p-5 overflow-y-auto flex-1 space-y-6" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.5rem)' }}>
          {bulletin.blocks.map((b, i) => <BulletinBlock key={i} block={b} accentKey={bulletin.accent} />)}
          <p className="text-xs text-gray-300 text-center pt-2">本頁為依公司公文整理的重點摘要，詳細內容以公司正式公告為準</p>
        </div>
      </div>
    </div>
  );
};

const AnnouncementsPage = ({ loggedInUser, announcements, canPost, onSeen }) => {
  const [seenCutoff] = useState(loggedInUser?.lastSeenAnnouncements || '');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewing, setViewing] = useState(null);
  const [viewImages, setViewImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [zoomSrc, setZoomSrc] = useState(null);
  const [zoomed, setZoomed] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const emptyForm = { title: '', category: ANNOUNCEMENT_CATEGORIES[0], content: '', pinned: false };
  const [form, setForm] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [processingImages, setProcessingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // 打開這一頁就視為「已讀」，底部導覽的紅點會消失 (本頁上的「新」標籤仍會保留到離開為止)
  useEffect(() => { if (onSeen) onSeen(); }, []); // eslint-disable-line

  const sorted = useMemo(() => {
    const isEnded = (x) => x.isBuiltin && getBulletinStatus(x)?.text === '已結束';
    return [...announcements, ...OFFICIAL_BULLETINS]
      .filter(a => !filterCategory || a.category === filterCategory)
      .sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        if (isEnded(a) !== isEnded(b)) return isEnded(a) ? 1 : -1;
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      });
  }, [announcements, filterCategory]);

  const loadImages = async (annId) => {
    const snap = await getDocs(query(collection(db, 'announcement_images'), where('announcementId', '==', annId)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 0) - (b.order || 0));
  };

  const openView = async (a) => {
    setViewing(a);
    setViewImages([]);
    if (a.isBuiltin) return;
    if (a.imageCount > 0) {
      setLoadingImages(true);
      try { setViewImages(await loadImages(a.id)); } catch (e) { console.error(e); } finally { setLoadingImages(false); }
    }
  };

  const openAdd = () => {
    setForm(emptyForm); setExistingImages([]); setRemovedImageIds([]); setNewImages([]); setErrorMsg('');
    setIsAdding(true);
  };

  const openEdit = async (a) => {
    setViewing(null);
    setForm({ title: a.title, category: a.category, content: a.content || '', pinned: !!a.pinned });
    setRemovedImageIds([]); setNewImages([]); setErrorMsg(''); setExistingImages([]);
    setEditing(a);
    if (a.imageCount > 0) {
      try { setExistingImages(await loadImages(a.id)); } catch (e) { console.error(e); }
    }
  };

  const closeForm = () => { setIsAdding(false); setEditing(null); };

  const keptExisting = existingImages.filter(i => !removedImageIds.includes(i.id));

  const handlePickImages = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (files.length === 0) return;
    const room = Math.max(0, 8 - keptExisting.length - newImages.length);
    const accepted = files.slice(0, room);
    setErrorMsg(accepted.length < files.length ? '每則公文最多放 8 張圖片，多的已略過' : '');
    setProcessingImages(true);
    try {
      const urls = [];
      for (const f of accepted) urls.push(await fileToCompressedDataUrl(f));
      setNewImages(prev => [...prev, ...urls]);
    } catch (err) {
      console.error(err);
      setErrorMsg('有圖片讀取失敗，請換一張或轉成 JPG 再試');
    } finally { setProcessingImages(false); }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !loggedInUser || !canPost) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const firstImage = keptExisting[0]?.dataUrl || newImages[0] || '';
      const thumb = firstImage ? await resizeDataUrl(firstImage, 360, 0.6) : '';
      const base = {
        title: form.title.trim(), category: form.category, content: form.content, pinned: form.pinned,
        imageCount: keptExisting.length + newImages.length, thumb, updatedAt: now
      };
      let annId;
      if (editing) {
        await updateDoc(doc(db, 'announcements', editing.id), base);
        annId = editing.id;
      } else {
        const ref = await addDoc(collection(db, 'announcements'), { ...base, authorId: loggedInUser.id, authorName: loggedInUser.name, createdAt: now });
        annId = ref.id;
      }
      const batch = writeBatch(db);
      removedImageIds.forEach(id => batch.delete(doc(db, 'announcement_images', id)));
      const maxOrder = keptExisting.reduce((m, i) => Math.max(m, i.order || 0), -1);
      newImages.forEach((url, idx) => {
        batch.set(doc(collection(db, 'announcement_images')), { announcementId: annId, order: maxOrder + 1 + idx, dataUrl: url });
      });
      await batch.commit();
      closeForm();
    } catch (e) {
      console.error(e);
      setErrorMsg('儲存失敗，請稍後再試（如果圖片很多，可以少放幾張）');
    } finally { setSaving(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const imgs = await loadImages(deleteTarget);
      const batch = writeBatch(db);
      imgs.forEach(i => batch.delete(doc(db, 'announcement_images', i.id)));
      batch.delete(doc(db, 'announcements', deleteTarget));
      await batch.commit();
      setDeleteTarget(null);
      setViewing(null);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="max-w-4xl lg:max-w-5xl mx-auto space-y-5 animate-fade-in pb-12">
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} title="刪除公文" message="確定要刪除這則公文（含圖片）嗎？此動作無法復原。" />

      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="hidden md:block text-2xl sm:text-3xl font-bold text-gray-900">公文佈達專區</h2>
          <p className="text-sm text-gray-400 md:mt-1">公司公文、獎勵辦法、活動講座都集中在這裡，共 {announcements.length + OFFICIAL_BULLETINS.length} 則</p>
        </div>
        {canPost && (
          <button onClick={openAdd} className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-sm shrink-0"><Plus size={22} /></button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['', ...ANNOUNCEMENT_CATEGORIES].map(cat => (
          <button key={cat || 'all'} onClick={() => setFilterCategory(cat)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-bold transition ${filterCategory === cat ? 'bg-gray-900 text-white' : 'bg-white text-gray-500 border border-gray-100'}`}>{cat || '全部'}</button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <Card className="p-10 text-center text-gray-400 text-sm">這個分類沒有公文</Card>
      ) : (
        <div className="space-y-3">
          {sorted.map(a => {
            const isNew = a.authorId !== loggedInUser?.id && (a.createdAt || '') > seenCutoff;
            return (
              <button key={a.id} onClick={() => openView(a)} className="w-full text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-4 flex gap-4 items-start">
                {a.isBuiltin ? (
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br ${(BULLETIN_ACCENTS[a.accent] || BULLETIN_ACCENTS.indigo).grad} overflow-hidden shrink-0`}>
                    <BulletinArt kind={a.art} slice className="w-full h-full" />
                  </div>
                ) : a.thumb ? (
                  <img src={a.thumb} alt="" className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover shrink-0 bg-gray-50" />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-50 flex items-center justify-center shrink-0"><Megaphone size={28} className="text-gray-300" /></div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ANNOUNCEMENT_CATEGORY_STYLE[a.category] || ANNOUNCEMENT_CATEGORY_STYLE['其他']}`}>{a.category}</span>
                    {a.pinned && <span className="flex items-center gap-0.5 text-xs font-bold text-red-500"><Pin size={12} /> 置頂</span>}
                    {isNew && <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">新</span>}
                    {a.isBuiltin && (() => { const st = getBulletinStatus(a); return st ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${BULLETIN_TONE[st.tone]}`}>{st.text}</span> : null; })()}
                  </div>
                  <p className="font-bold text-gray-900 text-base leading-snug line-clamp-2">{a.title}</p>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">{((a.isBuiltin ? a.summary : a.content) || '').replace(/\s+/g, ' ')}</p>
                  <p className="text-xs text-gray-300 mt-1.5">{a.isBuiltin ? '官方公文整理' : `${(a.createdAt || '').slice(0, 10)}${a.authorName ? ` · ${a.authorName}` : ''}${a.imageCount > 0 ? ` · ${a.imageCount} 張圖` : ''}`}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* 官方公文（結構化版面） */}
      {viewing && viewing.isBuiltin && <BulletinDetail bulletin={viewing} onClose={() => setViewing(null)} />}

      {/* 公文內容 */}
      {viewing && !viewing.isBuiltin && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full md:max-w-2xl h-[92vh] md:h-auto md:max-h-[90vh] rounded-t-3xl md:rounded-2xl shadow-2xl animate-scale-up flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-start justify-between gap-3 shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ANNOUNCEMENT_CATEGORY_STYLE[viewing.category] || ANNOUNCEMENT_CATEGORY_STYLE['其他']}`}>{viewing.category}</span>
                  {viewing.pinned && <span className="flex items-center gap-0.5 text-xs font-bold text-red-500"><Pin size={12} /> 置頂</span>}
                </div>
                <h3 className="text-lg font-bold text-gray-900 leading-snug">{viewing.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{(viewing.createdAt || '').slice(0, 10)}{viewing.authorName ? ` · ${viewing.authorName}` : ''}</p>
              </div>
              <button onClick={() => setViewing(null)} className="w-10 h-10 -mr-2 -mt-1 rounded-full flex items-center justify-center hover:bg-gray-100 shrink-0"><X size={22} /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {viewing.content && <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">{renderTextWithLinks(viewing.content)}</p>}
              {loadingImages && <div className="flex justify-center py-6"><Loader2 className="animate-spin text-gray-300" size={24} /></div>}
              {viewImages.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-400">點圖片可以放大查看</p>
                  {viewImages.map(img => (
                    <img key={img.id} src={img.dataUrl} alt="" onClick={() => { setZoomed(false); setZoomSrc(img.dataUrl); }} className="w-full rounded-xl border border-gray-100 cursor-zoom-in" />
                  ))}
                </div>
              )}
            </div>
            {canPost && (
              <div className="p-4 border-t border-gray-100 flex gap-2 shrink-0" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}>
                <button onClick={() => openEdit(viewing)} className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-sm"><Edit3 size={16} /> 編輯</button>
                <button onClick={() => setDeleteTarget(viewing.id)} className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-bold text-sm"><Trash2 size={16} /> 刪除</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 發佈／編輯公文 */}
      {(isAdding || editing) && (
        <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full md:max-w-lg h-[94vh] md:h-auto md:max-h-[92vh] rounded-t-3xl md:rounded-2xl shadow-2xl animate-scale-up flex flex-col">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-gray-900">{editing ? '編輯公文' : '發佈公文'}</h3>
              <button onClick={closeForm} className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center hover:bg-gray-100"><X size={22} /></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-500 block mb-1.5">標題</label>
                <input type="text" className="w-full p-3 border border-gray-200 rounded-xl text-base outline-none focus:border-indigo-500" placeholder="例如：10月高資保戶講座" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500 block mb-1.5">分類</label>
                <div className="flex gap-2 flex-wrap">
                  {ANNOUNCEMENT_CATEGORIES.map(cat => (
                    <button key={cat} type="button" onClick={() => setForm({ ...form, category: cat })} className={`px-4 py-2 rounded-full text-sm font-bold transition ${form.category === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500 block mb-1.5">內文（可以直接貼上公告文字，網址會自動變成可點的連結）</label>
                <textarea className="w-full p-3 border border-gray-200 rounded-xl text-base h-48 resize-none outline-none focus:border-indigo-500" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-500 block mb-1.5">圖片（最多8張，系統會自動壓縮）</label>
                <div className="grid grid-cols-3 gap-2">
                  {keptExisting.map(img => (
                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                      <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setRemovedImageIds(prev => [...prev, img.id])} className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"><X size={14} /></button>
                    </div>
                  ))}
                  {newImages.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setNewImages(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"><X size={14} /></button>
                    </div>
                  ))}
                  {keptExisting.length + newImages.length < 8 && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-indigo-300 transition">
                      {processingImages ? <Loader2 size={22} className="animate-spin" /> : <ImageIcon size={22} />}
                      <span className="text-xs font-bold mt-1">{processingImages ? '處理中' : '加圖片'}</span>
                      <input type="file" accept="image/*" multiple className="hidden" onChange={handlePickImages} disabled={processingImages} />
                    </label>
                  )}
                </div>
              </div>
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer">
                <input type="checkbox" className="w-5 h-5" checked={form.pinned} onChange={e => setForm({ ...form, pinned: e.target.checked })} />
                <span className="text-sm font-bold text-gray-700">置頂這則公文（重要公告會固定顯示在最上面）</span>
              </label>
              {errorMsg && <p className="text-sm text-red-500 font-bold">{errorMsg}</p>}
            </div>
            <div className="p-4 border-t border-gray-100 shrink-0" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}>
              <button onClick={handleSave} disabled={!form.title.trim() || saving || processingImages} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-base hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={18} /> : (editing ? '儲存變更' : '發佈')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 圖片放大檢視 */}
      {zoomSrc && (
        <div className="fixed inset-0 z-[130] bg-black/90 overflow-auto">
          <button onClick={() => setZoomSrc(null)} className="fixed top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/20 text-white flex items-center justify-center"><X size={22} /></button>
          <div className="min-h-full p-3 pt-16">
            <img src={zoomSrc} alt="" onClick={() => setZoomed(z => !z)} className={zoomed ? 'block w-[250%] max-w-none cursor-zoom-out' : 'block w-full max-w-2xl mx-auto cursor-zoom-in'} />
          </div>
        </div>
      )}
    </div>
  );
};

const KB_CATEGORIES = ['新人入門', '商品知識', '銷售技巧', '增員知識', '競賽與獎勵', '行政與工具', '法規合規', '主管專區'];

// --- 業務戰情室：權限分層 (吳政翰看全部，主管看自己+全部下線，一般業務只看自己) ---
const getVisibleTeamIds = (loggedInUser, team) => {
  if (!loggedInUser) return new Set();
  if (loggedInUser.name === '吳政翰') return new Set(team.map(t => t.id));
  if (!MANAGER_RANKS.includes(loggedInUser.role)) return new Set([loggedInUser.id]);
  const ids = new Set([loggedInUser.id]);
  let added = true;
  while (added) {
    added = false;
    team.forEach(m => {
      if (!ids.has(m.id) && m.parentId && ids.has(m.parentId)) { ids.add(m.id); added = true; }
    });
  }
  return ids;
};

const PIPELINE_STAGES = ['待約訪', '洽談中', '已送建議書', '待簽約'];

// --- 手機版：業務戰情室（深色底圖＋白色清單面板）---
const WAR_AGE_BUCKETS = [
  { key: 'b1', label: '3 天內', max: 3, color: '#34d399' },
  { key: 'b2', label: '4–7 天', max: 7, color: '#60a5fa' },
  { key: 'b3', label: '8–14 天', max: 14, color: '#fbbf24' },
  { key: 'b4', label: '15 天以上', max: Infinity, color: '#fb7185' },
];
const WarDonut = ({ title, centerTop, centerBottom, parts }) => {
  const R = 40, C = 2 * Math.PI * R;
  const total = parts.reduce((s, p) => s + p.v, 0);
  let acc = 0;
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-3.5 min-w-0">
      <p className="text-[13px] font-bold mb-2">{title}</p>
      <div className="relative w-[104px] h-[104px] mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="13" />
          {total > 0 && parts.map(p => {
            const len = (p.v / total) * C;
            const el = <circle key={p.label} cx="50" cy="50" r={R} fill="none" stroke={p.color} strokeWidth="13" strokeDasharray={`${Math.max(0, len - 1.5)} ${C}`} strokeDashoffset={-acc} />;
            acc += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`${String(centerTop).length > 6 ? 'text-[13px]' : 'text-[17px]'} font-bold leading-tight tabular-nums`}>{centerTop}</span>
          <span className="text-[10px] text-white/50">{centerBottom}</span>
        </div>
      </div>
      <div className="mt-3 space-y-1.5">
        {parts.map(p => (
          <div key={p.label} className="flex items-center justify-between text-[11px] gap-1">
            <span className="flex items-center gap-1.5 text-white/65 min-w-0"><i className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }}></i><span className="truncate">{p.label}</span></span>
            <span className="tabular-nums text-white/90 shrink-0">{p.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MobileWarRoom = ({ summary, deals, visibleIds, today, onSelect, onSearch }) => {
  const [tab, setTab] = useState('overview');
  const [sortKey, setSortKey] = useState('premium');

  const ageDays = (r) => Math.max(0, Math.floor((new Date(today) - new Date(r.date)) / 86400000));
  const allCases = useMemo(() => summary.flatMap(s => s.pendingCases.map(r => ({ r, member: s.member, days: ageDays(r) }))).sort((a, b) => b.days - a.days), [summary, today]);
  const totalPremium = allCases.reduce((s, x) => s + (x.r.premium || 0), 0);
  const stuckTotal = summary.reduce((s, x) => s + x.stuckCustomers.length, 0);
  const visibleDeals = useMemo(() => deals.filter(d => visibleIds.has(d.ownerId)), [deals, visibleIds]);
  const withCases = summary.filter(s => s.pendingCases.length > 0).length;
  const avgDays = allCases.length ? Math.round(allCases.reduce((s, x) => s + x.days, 0) / allCases.length) : 0;

  const buckets = WAR_AGE_BUCKETS.map((b, i) => {
    const prev = i === 0 ? -1 : WAR_AGE_BUCKETS[i - 1].max;
    const list = allCases.filter(x => x.days > prev && x.days <= b.max);
    return { ...b, n: list.length, prem: list.reduce((s, x) => s + (x.r.premium || 0), 0) };
  });
  const money = (n) => n >= 1000000 ? '$' + (n / 1000000).toFixed(2) + 'M' : n >= 10000 ? '$' + (n / 10000).toFixed(1) + '萬' : '$' + Math.round(n);

  const sorted = useMemo(() => [...summary].sort((a, b) => sortKey === 'premium' ? b.pendingTotal - a.pendingTotal : sortKey === 'cases' ? b.pendingCases.length - a.pendingCases.length : b.stuckCustomers.length - a.stuckCustomers.length), [summary, sortKey]);
  const crown = ['text-amber-400', 'text-slate-400', 'text-orange-500'];
  const tone = (d) => d >= 15 ? 'text-rose-500' : d >= 8 ? 'text-amber-500' : 'text-emerald-500';

  const tiles = [
    { l: '受理中案件', v: allCases.length, u: '件', s: allCases.length ? `平均卡 ${avgDays} 天` : '目前沒有', icon: FileText, c: 'bg-blue-500/25 text-blue-300' },
    { l: '受理中保費', v: money(totalPremium), s: allCases.length ? `件均 ${money(totalPremium / allCases.length)}` : '', icon: TrendingUp, c: 'bg-emerald-500/25 text-emerald-300' },
    { l: '卡關客戶', v: stuckTotal, u: '位', s: '已過追蹤日未處理', icon: AlertTriangle, c: 'bg-amber-500/25 text-amber-300' },
    { l: '團隊人數', v: summary.length, u: '人', s: `${withCases} 人有案件`, icon: Users, c: 'bg-violet-500/25 text-violet-300', bar: summary.length ? Math.round(withCases / summary.length * 100) : 0 },
  ];

  return (
    <div className="md:hidden text-white -mx-1">
      <div className="flex items-start justify-between pt-1 pb-4">
        <div className="min-w-0">
          <h1 className="text-[28px] font-bold tracking-tight leading-none">業務戰情室</h1>
          <p className="text-[12px] text-white/55 mt-2">團隊受理中案件、客戶追蹤狀況與商機總覽</p>
        </div>
        <button onClick={onSearch} aria-label="搜尋" className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center shrink-0 active:scale-95 transition"><Search size={18} /></button>
      </div>

      <div className="flex rounded-full border border-white/10 bg-white/[0.06] backdrop-blur-xl p-1 mb-3.5">
        {[['overview', '團隊總覽'], ['cases', '案件進度'], ['deals', '商機追蹤']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`flex-1 py-2.5 text-[13px] font-bold rounded-full transition ${tab === k ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'text-white/60'}`}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 gap-2.5 mb-3">
            {tiles.map(t => { const Icon = t.icon; return (
              <div key={t.l} className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl px-3.5 py-3">
                <div className="flex items-center gap-2"><span className={`w-7 h-7 rounded-full flex items-center justify-center ${t.c}`}><Icon size={14} /></span><span className="text-[12px] text-white/70">{t.l}</span></div>
                <p className="mt-2 leading-none"><b className="text-[26px] font-bold tabular-nums">{t.v}</b>{t.u && <span className="text-[13px] text-white/60 ml-1">{t.u}</span>}</p>
                <p className="text-[11px] text-white/45 mt-1.5">{t.s}</p>
                {t.bar !== undefined && <div className="h-1.5 rounded-full bg-white/10 mt-1.5 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400" style={{ width: `${t.bar}%` }}></div></div>}
              </div>
            ); })}
          </div>
          <div className="grid grid-cols-2 gap-2.5 mb-3.5">
            <WarDonut title="案件卡關天數" centerTop={allCases.length} centerBottom="受理中案件" parts={buckets.map(b => ({ label: b.label, color: b.color, v: b.n, text: `${b.n} 件` }))} />
            <WarDonut title="保費金額分佈" centerTop={money(totalPremium)} centerBottom="受理中保費" parts={buckets.map(b => ({ label: b.label, color: b.color, v: b.prem, text: money(b.prem) }))} />
          </div>
        </>
      )}

      <div className="-mx-4 rounded-t-[28px] bg-[#f5f6fa] text-gray-900 px-4 pt-4 pb-6 min-h-[200px]">
        {tab === 'overview' && (
          <>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[15px] font-bold">成員列表</p>
              <select value={sortKey} onChange={e => setSortKey(e.target.value)} className="text-[12px] font-bold text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1.5 outline-none">
                <option value="premium">排序：受理中保費</option><option value="cases">排序：案件數</option><option value="stuck">排序：卡關客戶</option>
              </select>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-[1fr_34px_72px_34px_34px_14px] gap-1.5 px-3 py-2 text-[10px] font-bold text-gray-400 bg-gray-50"><span>成員</span><span className="text-center">案件</span><span className="text-right">保費</span><span className="text-center">卡關</span><span className="text-center">商機</span><span></span></div>
              {sorted.map((x, i) => (
                <button key={x.member.id} onClick={() => onSelect(x.member.id)} className="w-full grid grid-cols-[1fr_34px_72px_34px_34px_14px] gap-1.5 items-center px-3 py-3 border-t border-gray-50 text-left active:bg-gray-50">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-5 shrink-0 text-center text-[12px] text-gray-400 font-bold">{i < 3 && x.pendingTotal > 0 ? <Crown size={15} className={crown[i]} /> : i + 1}</span>
                    <Avatar name={x.member.name} size={32} />
                    <span className="text-[14px] font-bold truncate">{x.member.name}</span>
                  </span>
                  <span className="text-center text-[14px] font-semibold tabular-nums">{x.pendingCases.length}</span>
                  <span className="text-right text-[13px] font-semibold text-blue-600 tabular-nums">{money(x.pendingTotal)}</span>
                  <span className={`text-center text-[14px] tabular-nums ${x.stuckCustomers.length ? 'text-amber-600 font-bold' : 'text-gray-500'}`}>{x.stuckCustomers.length}</span>
                  <span className="text-center text-[14px] tabular-nums text-gray-600">{x.memberDeals.length}</span>
                  <ChevronRight size={14} className="text-gray-300" />
                </button>
              ))}
            </div>

            <p className="text-[15px] font-bold mt-5 mb-2.5 flex items-center gap-2"><Target size={17} className="text-rose-500" />本日重點</p>
            <div className="space-y-2">
              {[
                { l: '受理中案件', v: `${allCases.length} 件`, t: 'cases', c: 'text-emerald-500', Icon: CheckCircle2 },
                { l: '卡關 15 天以上', v: `${buckets[3].n} 件`, t: 'cases', c: 'text-rose-500', Icon: AlertTriangle },
                { l: '進行中商機', v: `${visibleDeals.length} 筆`, t: 'deals', c: 'text-sky-500', Icon: TrendingUp },
              ].map(r => (
                <button key={r.l} onClick={() => setTab(r.t)} className="w-full flex items-center gap-3 rounded-2xl bg-white border border-gray-100 px-3.5 py-3 text-left active:bg-gray-50">
                  <r.Icon size={18} className={r.c} /><span className="flex-1 text-[14px] font-semibold">{r.l}</span><span className="text-[14px] font-bold tabular-nums">{r.v}</span><ChevronRight size={14} className="text-gray-300" />
                </button>
              ))}
            </div>
          </>
        )}

        {tab === 'cases' && (
          <>
            <p className="text-[15px] font-bold mb-2.5">受理中案件 <span className="text-gray-400 font-normal text-[13px]">（卡最久的在最上面）</span></p>
            {allCases.length === 0 && <p className="text-center text-gray-400 text-sm py-10">目前沒有受理中的案件 🎉</p>}
            <div className="space-y-2">
              {allCases.map(({ r, member, days }) => (
                <div key={r.id} className="rounded-2xl bg-white border border-gray-100 px-3.5 py-3 flex items-center gap-3">
                  <Avatar name={member.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold truncate">{r.insuredName || '（未填被保人）'}</p>
                    <p className="text-[12px] text-gray-400 truncate">{member.name} · {r.product || '—'}</p>
                  </div>
                  <div className="text-right shrink-0"><p className="text-[14px] font-bold text-blue-600 tabular-nums">{money(r.premium || 0)}</p><p className={`text-[11px] font-bold ${tone(days)}`}>卡 {days} 天</p></div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'deals' && (
          <>
            <p className="text-[15px] font-bold mb-2.5">進行中商機 <span className="text-gray-400 font-normal text-[13px]">共 {visibleDeals.length} 筆</span></p>
            {visibleDeals.length === 0 && <p className="text-center text-gray-400 text-sm py-10">目前沒有登記中的商機</p>}
            {PIPELINE_STAGES.map(st => {
              const list = visibleDeals.filter(d => d.stage === st);
              if (list.length === 0) return null;
              return (
                <div key={st} className="mb-4">
                  <p className="text-[12px] font-bold text-gray-500 mb-1.5">{st} · {list.length}</p>
                  <div className="space-y-2">
                    {list.map(d => {
                      const owner = summary.find(s => s.member.id === d.ownerId)?.member;
                      return (
                        <div key={d.id} className="rounded-2xl bg-white border border-gray-100 px-3.5 py-3 flex items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-bold truncate">{d.customerName}<span className="text-gray-400 font-normal"> · {d.product}</span></p>
                            <p className="text-[12px] text-gray-400 truncate">{owner?.name || ''}{d.expectedCloseDate ? ` · 預計 ${d.expectedCloseDate}` : ''}</p>
                          </div>
                          <p className="text-[14px] font-bold text-teal-600 tabular-nums shrink-0">{money(d.estimatedPremium || 0)}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

const DesktopWarRoom = ({ summary, deals, visibleIds, today, onSelect }) => {
  const [rtab, setRtab] = useState('cases');
  const [sortKey, setSortKey] = useState('premium');
  const ageDays = (r) => Math.max(0, Math.floor((new Date(today) - new Date(r.date)) / 86400000));
  const allCases = useMemo(() => summary.flatMap(s => s.pendingCases.map(r => ({ r, member: s.member, days: ageDays(r) }))).sort((a, b) => b.days - a.days), [summary, today]);
  const totalPremium = allCases.reduce((s, x) => s + (x.r.premium || 0), 0);
  const stuckTotal = summary.reduce((s, x) => s + x.stuckCustomers.length, 0);
  const visibleDeals = useMemo(() => deals.filter(d => visibleIds.has(d.ownerId)), [deals, visibleIds]);
  const withCases = summary.filter(s => s.pendingCases.length > 0).length;
  const avgDays = allCases.length ? Math.round(allCases.reduce((s, x) => s + x.days, 0) / allCases.length) : 0;
  const buckets = WAR_AGE_BUCKETS.map((b, i) => {
    const prev = i === 0 ? -1 : WAR_AGE_BUCKETS[i - 1].max;
    const list = allCases.filter(x => x.days > prev && x.days <= b.max);
    return { ...b, n: list.length, prem: list.reduce((s, x) => s + (x.r.premium || 0), 0) };
  });
  const money = (n) => n >= 1000000 ? '$' + (n / 1000000).toFixed(2) + 'M' : n >= 10000 ? '$' + (n / 10000).toFixed(1) + '萬' : '$' + Math.round(n);
  const sorted = useMemo(() => [...summary].sort((a, b) => sortKey === 'premium' ? b.pendingTotal - a.pendingTotal : sortKey === 'cases' ? b.pendingCases.length - a.pendingCases.length : b.stuckCustomers.length - a.stuckCustomers.length), [summary, sortKey]);
  const tone = (d) => d >= 15 ? 'text-rose-400' : d >= 8 ? 'text-amber-400' : 'text-emerald-400';
  const glass = 'rounded-3xl border border-white/10 bg-white/[0.045] backdrop-blur-xl';
  const tiles = [
    { l: '受理中案件', v: allCases.length, u: '件', s: allCases.length ? `平均卡 ${avgDays} 天` : '目前沒有', icon: FileText, c: 'bg-blue-500/25 text-blue-300' },
    { l: '受理中保費', v: money(totalPremium), s: allCases.length ? `件均 ${money(totalPremium / allCases.length)}` : '', icon: TrendingUp, c: 'bg-emerald-500/25 text-emerald-300' },
    { l: '卡關客戶', v: stuckTotal, u: '位', s: '已過追蹤日未處理', icon: AlertTriangle, c: 'bg-amber-500/25 text-amber-300' },
    { l: '團隊人數', v: summary.length, u: '人', s: `${withCases} 人有案件`, icon: Users, c: 'bg-violet-500/25 text-violet-300' },
  ];
  const cols = 'grid-cols-[minmax(0,1fr)_56px_84px_56px_56px]';
  return (
    <div className="hidden md:flex flex-col gap-3 h-full md:min-h-[840px] text-white animate-fade-in">
      <div className="shrink-0">
        <h1 className="text-[26px] font-bold tracking-tight leading-none">業務戰情室</h1>
        <p className="text-[12px] text-white/45 mt-1.5">團隊受理中案件、客戶追蹤狀況與商機總覽</p>
      </div>
      <div className="grid grid-cols-4 gap-3 shrink-0">
        {tiles.map(t => { const Icon = t.icon; return (
          <div key={t.l} className={`${glass} px-4 py-3`}>
            <div className="flex items-center gap-2"><span className={`w-7 h-7 rounded-full flex items-center justify-center ${t.c}`}><Icon size={14} /></span><span className="text-[12px] text-white/65">{t.l}</span></div>
            <p className="mt-2 leading-none"><b className="text-[28px] font-bold tabular-nums">{t.v}</b>{t.u && <span className="text-[13px] text-white/55 ml-1">{t.u}</span>}</p>
            <p className="text-[11px] text-white/40 mt-1.5">{t.s || ' '}</p>
          </div>
        ); })}
      </div>
      <div className="flex-1 min-h-0 grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-3">
        <div className="flex flex-col gap-3 min-h-0">
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <WarDonut title="案件卡關天數" centerTop={allCases.length} centerBottom="受理中案件" parts={buckets.map(b => ({ label: b.label, color: b.color, v: b.n, text: `${b.n} 件` }))} />
            <WarDonut title="保費金額分佈" centerTop={money(totalPremium)} centerBottom="受理中保費" parts={buckets.map(b => ({ label: b.label, color: b.color, v: b.prem, text: money(b.prem) }))} />
          </div>
          <div className={`${glass} p-4 flex-1 min-h-0 flex flex-col`}>
            <div className="flex items-center justify-between mb-2 shrink-0">
              <p className="text-[15px] font-bold">成員列表</p>
              <select value={sortKey} onChange={e => setSortKey(e.target.value)} className="bg-white/[0.08] border border-white/10 rounded-xl px-3 py-1 text-[12px] font-bold text-white outline-none">
                <option value="premium" className="text-gray-900">排序：受理中保費</option><option value="cases" className="text-gray-900">排序：案件數</option><option value="stuck" className="text-gray-900">排序：卡關客戶</option>
              </select>
            </div>
            <div className={`grid ${cols} gap-2 px-2 pb-1.5 text-[10px] font-bold text-white/35 shrink-0`}><span>成員</span><span className="text-center">案件</span><span className="text-right">保費</span><span className="text-center">卡關</span><span className="text-center">商機</span></div>
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar divide-y divide-white/[0.06]">
              {sorted.map((x, i) => (
                <button key={x.member.id} onClick={() => onSelect(x.member.id)} className={`w-full grid ${cols} gap-2 items-center px-2 py-2 text-left hover:bg-white/[0.05]`}>
                  <span className="flex items-center gap-2 min-w-0">
                    <span className={`w-5 shrink-0 text-center text-[12px] font-bold ${i < 3 && x.pendingTotal > 0 ? 'text-amber-400' : 'text-white/35'}`}>{i + 1}</span>
                    <Avatar name={x.member.name} size={30} />
                    <span className="text-[13px] font-bold truncate">{x.member.name}</span>
                  </span>
                  <span className="text-center text-[13px] tabular-nums">{x.pendingCases.length}</span>
                  <span className="text-right text-[13px] font-bold text-blue-300 tabular-nums">{money(x.pendingTotal)}</span>
                  <span className={`text-center text-[13px] tabular-nums ${x.stuckCustomers.length ? 'text-amber-400 font-bold' : 'text-white/45'}`}>{x.stuckCustomers.length}</span>
                  <span className="text-center text-[13px] tabular-nums text-white/70">{x.memberDeals.length}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={`${glass} p-4 flex flex-col min-h-0`}>
          <div className="flex rounded-full border border-white/10 bg-white/[0.06] p-1 mb-3 shrink-0">
            {[['cases', `案件進度 ${allCases.length}`], ['deals', `商機追蹤 ${visibleDeals.length}`]].map(([k, l]) => (
              <button key={k} onClick={() => setRtab(k)} className={`flex-1 py-1.5 text-[13px] font-bold rounded-full transition ${rtab === k ? 'bg-blue-500 shadow-lg shadow-blue-500/30' : 'text-white/60'}`}>{l}</button>
            ))}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2">
            {rtab === 'cases' && (allCases.length === 0
              ? <p className="text-center text-white/40 text-sm py-10">目前沒有受理中的案件 🎉</p>
              : allCases.map(({ r, member, days }) => (
                <div key={r.id} className="rounded-2xl bg-white/[0.05] border border-white/[0.06] px-3 py-2.5 flex items-center gap-3">
                  <Avatar name={member.name} size={34} />
                  <div className="min-w-0 flex-1"><p className="text-[13px] font-bold truncate">{r.insuredName || '（未填被保人）'}</p><p className="text-[11px] text-white/40 truncate">{member.name} · {r.product || '—'}</p></div>
                  <div className="text-right shrink-0"><p className="text-[13px] font-bold text-blue-300 tabular-nums">{money(r.premium || 0)}</p><p className={`text-[11px] font-bold ${tone(days)}`}>卡 {days} 天</p></div>
                </div>
              )))}
            {rtab === 'deals' && (visibleDeals.length === 0
              ? <p className="text-center text-white/40 text-sm py-10">目前沒有登記中的商機</p>
              : PIPELINE_STAGES.map(st => {
                const list = visibleDeals.filter(d => d.stage === st);
                if (!list.length) return null;
                return (
                  <div key={st} className="mb-2">
                    <p className="text-[11px] font-bold text-white/45 mb-1.5">{st} · {list.length}</p>
                    <div className="space-y-2">{list.map(d => {
                      const owner = summary.find(s => s.member.id === d.ownerId)?.member;
                      return (
                        <div key={d.id} className="rounded-2xl bg-white/[0.05] border border-white/[0.06] px-3 py-2.5 flex items-center gap-3">
                          {owner && <Avatar name={owner.name} size={30} />}
                          <div className="min-w-0 flex-1"><p className="text-[13px] font-bold truncate">{d.customerName}<span className="text-white/40 font-normal"> · {d.product}</span></p><p className="text-[11px] text-white/40 truncate">{owner?.name || ''}{d.expectedCloseDate ? ` · 預計 ${d.expectedCloseDate}` : ''}</p></div>
                          <p className="text-[13px] font-bold text-teal-300 tabular-nums shrink-0">{money(d.estimatedPremium || 0)}</p>
                        </div>
                      );
                    })}</div>
                  </div>
                );
              }))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SalesWarRoomPage = ({ loggedInUser, team, customers, records, onSearch }) => {
  const today = getTodayDate();
  const [selectedId, setSelectedId] = useState(null);
  const [deals, setDeals] = useState([]);
  const [isAddingDeal, setIsAddingDeal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [dealDeleteTarget, setDealDeleteTarget] = useState(null);
  const emptyDealForm = { customerName: '', product: '', estimatedPremium: '', expectedCloseDate: '', stage: PIPELINE_STAGES[0], note: '' };
  const [dealForm, setDealForm] = useState(emptyDealForm);
  const [dealSaving, setDealSaving] = useState(false);
  const [managerNoteDrafts, setManagerNoteDrafts] = useState({});

  const visibleIds = useMemo(() => getVisibleTeamIds(loggedInUser, team), [loggedInUser, team]);
  const visibleMembers = useMemo(() => team.filter(m => visibleIds.has(m.id)), [team, visibleIds]);

  const isContactedToday = (c) => (c.visitLog || []).some(v => v.date === today);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'pipeline_deals'), (snap) => {
      setDeals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const summary = useMemo(() => {
    return visibleMembers.map(member => {
      const pendingCases = records.filter(r => r.agentId === member.id && r.status === '受理中');
      const stuckCustomers = customers.filter(c => c.ownerId === member.id && c.nextFollowUpDate && c.nextFollowUpDate <= today && !isContactedToday(c));
      const memberDeals = deals.filter(d => d.ownerId === member.id).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
      const pendingTotal = pendingCases.reduce((s, r) => s + (r.premium || 0), 0);
      return { member, pendingCases, stuckCustomers, pendingTotal, memberDeals };
    }).sort((a, b) => b.pendingCases.length - a.pendingCases.length);
  }, [visibleMembers, records, customers, deals, today]);

  const selectedEntry = selectedId ? summary.find(s => s.member.id === selectedId) : null;
  const isOwnEntry = selectedEntry && loggedInUser && selectedEntry.member.id === loggedInUser.id;

  const openAddDeal = () => { setDealForm(emptyDealForm); setIsAddingDeal(true); };
  const openEditDeal = (deal) => { setEditingDeal(deal); setDealForm({ customerName: deal.customerName, product: deal.product, estimatedPremium: deal.estimatedPremium, expectedCloseDate: deal.expectedCloseDate, stage: deal.stage, note: deal.note || '' }); };

  const handleSaveDeal = async () => {
    if (!loggedInUser || !dealForm.customerName.trim()) return;
    setDealSaving(true);
    try {
      if (editingDeal) {
        await updateDoc(doc(db, 'pipeline_deals', editingDeal.id), { ...dealForm, estimatedPremium: Number(dealForm.estimatedPremium) || 0, updatedAt: new Date().toISOString() });
        setEditingDeal(null);
      } else {
        await addDoc(collection(db, 'pipeline_deals'), { ...dealForm, estimatedPremium: Number(dealForm.estimatedPremium) || 0, ownerId: loggedInUser.id, managerNote: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        setIsAddingDeal(false);
      }
      setDealForm(emptyDealForm);
    } catch (e) { console.error(e); } finally { setDealSaving(false); }
  };

  const handleDeleteDealConfirm = async () => {
    if (!dealDeleteTarget) return;
    try { await deleteDoc(doc(db, 'pipeline_deals', dealDeleteTarget)); setDealDeleteTarget(null); } catch (e) { console.error(e); }
  };

  const handleSaveManagerNote = async (dealId) => {
    const text = managerNoteDrafts[dealId];
    if (text === undefined) return;
    try { await updateDoc(doc(db, 'pipeline_deals', dealId), { managerNote: text }); } catch (e) { console.error(e); }
  };

  if (visibleMembers.length === 0) return null;

  const detailCard = selectedEntry ? (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">{selectedEntry.member.name} 的明細</h3>
            <button onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
          </div>

          <p className="text-xs font-bold text-gray-500 uppercase mb-2">受理中案件 ({selectedEntry.pendingCases.length})</p>
          {selectedEntry.pendingCases.length === 0 ? (
            <p className="text-sm text-gray-400 py-3">目前沒有受理中的案件</p>
          ) : (
            <div className="space-y-2 mb-5">
              {selectedEntry.pendingCases.map(r => {
                const daysPending = Math.floor((new Date(today) - new Date(r.date)) / 86400000);
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <span className="font-bold text-gray-800">{r.insuredName}</span>
                      <span className="text-gray-400 ml-2">{r.product}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-700">{formatMoney(r.premium)}</span>
                      <span className="text-xs text-gray-400 ml-2">卡 {daysPending} 天</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <p className="text-xs font-bold text-gray-500 uppercase mb-2">卡關客戶 ({selectedEntry.stuckCustomers.length})</p>
          {selectedEntry.stuckCustomers.length === 0 ? (
            <p className="text-sm text-gray-400 py-3">沒有該追蹤卻還沒處理的客戶</p>
          ) : (
            <div className="space-y-2 mb-5">
              {selectedEntry.stuckCustomers.map(c => {
                const daysOverdue = Math.floor((new Date(today) - new Date(c.nextFollowUpDate)) / 86400000);
                return (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg text-sm">
                    <span className="font-bold text-gray-800">{c.name}</span>
                    <span className="text-xs text-amber-600 font-bold">{daysOverdue > 0 ? `已過期 ${daysOverdue} 天` : '今天到期'}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase">{isOwnEntry ? '我的進行中商機' : '進行中商機'} ({selectedEntry.memberDeals.length})</p>
            {isOwnEntry && <button onClick={openAddDeal} className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"><Plus size={13} /> 新增商機</button>}
          </div>
          {selectedEntry.memberDeals.length === 0 ? (
            <p className="text-sm text-gray-400 py-3">目前沒有登記中的商機</p>
          ) : (
            <div className="space-y-2">
              {selectedEntry.memberDeals.map(deal => (
                <div key={deal.id} className="rounded-lg p-3 bg-teal-50 border border-teal-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{deal.customerName} <span className="font-normal text-gray-500">· {deal.product}</span></p>
                      <p className="text-xs text-gray-500 mt-1">預估 {formatMoney(deal.estimatedPremium)}{deal.expectedCloseDate ? ` · 預計 ${deal.expectedCloseDate} 成交` : ''}</p>
                      {deal.note && <p className="text-xs text-gray-400 mt-1">{deal.note}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-bold bg-white text-teal-700 px-2 py-1 rounded-full">{deal.stage}</span>
                      {isOwnEntry && (
                        <>
                          <button onClick={() => openEditDeal(deal)} className="text-teal-600 hover:text-teal-700"><Edit3 size={14} /></button>
                          <button onClick={() => setDealDeleteTarget(deal.id)} className="text-teal-600 hover:text-red-500"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </div>
                  {!isOwnEntry && (
                    <div className="mt-2 pt-2 border-t border-teal-100">
                      <textarea
                        placeholder="輔導備註（只有主管看得到）"
                        className="w-full p-2 text-xs border border-teal-200 rounded-lg resize-none bg-white"
                        rows={2}
                        value={managerNoteDrafts[deal.id] !== undefined ? managerNoteDrafts[deal.id] : (deal.managerNote || '')}
                        onChange={e => setManagerNoteDrafts(prev => ({ ...prev, [deal.id]: e.target.value }))}
                        onBlur={() => handleSaveManagerNote(deal.id)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
  ) : null;

  return (
    <div className="max-w-5xl lg:max-w-none md:max-w-none md:h-full mx-auto space-y-6 md:space-y-0 animate-fade-in pb-12 md:pb-0">
      <MobileWarRoom summary={summary} deals={deals} visibleIds={visibleIds} today={today} onSelect={setSelectedId} onSearch={onSearch} />
      <DesktopWarRoom summary={summary} deals={deals} visibleIds={visibleIds} today={today} onSelect={setSelectedId} />

      <ConfirmModal isOpen={!!dealDeleteTarget} onClose={() => setDealDeleteTarget(null)} onConfirm={handleDeleteDealConfirm} title="刪除商機" message="確定要刪除這筆商機紀錄嗎？" />

      <div className="hidden space-y-6">
      <div>
        <h2 className="hidden md:block text-2xl sm:text-3xl font-bold text-gray-900">業務戰情室</h2>
        <p className="text-sm text-gray-400 md:mt-1">團隊受理中案件、客戶追蹤狀況與進行中商機總覽</p>
      </div>

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><ClipboardList size={18} className="text-indigo-500" /> 全隊總表</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-gray-400 border-b border-gray-100">
                <th className="py-2 pr-4">姓名</th>
                <th className="py-2 pr-4 text-right">受理中案件</th>
                <th className="py-2 pr-4 text-right">受理中保費</th>
                <th className="py-2 pr-4 text-right">卡關客戶</th>
                <th className="py-2 pr-4 text-right">進行中商機</th>
              </tr>
            </thead>
            <tbody>
              {summary.map(({ member, pendingCases, stuckCustomers, pendingTotal, memberDeals }) => (
                <tr key={member.id} onClick={() => setSelectedId(member.id)} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                  <td className="py-3 pr-4 font-bold text-gray-800">{member.name}</td>
                  <td className="py-3 pr-4 text-right">{pendingCases.length}</td>
                  <td className="py-3 pr-4 text-right text-gray-500">{formatMoney(pendingTotal)}</td>
                  <td className="py-3 pr-4 text-right">{stuckCustomers.length > 0 ? <span className="text-amber-600 font-bold">{stuckCustomers.length}</span> : stuckCustomers.length}</td>
                  <td className="py-3 pr-4 text-right">{memberDeals.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </div>

      {selectedEntry && (
        <div className="hidden md:flex fixed inset-0 z-[100] items-center justify-center bg-black/60 backdrop-blur-sm p-6" onClick={() => setSelectedId(null)}>
          <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto no-scrollbar rounded-3xl" onClick={e => e.stopPropagation()}>{detailCard}</div>
        </div>
      )}
      {selectedEntry && (
        <div className="md:hidden fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectedId(null)}>
          <div className="w-full max-h-[88vh] overflow-y-auto rounded-t-[28px] bg-[#f5f5f7] p-3 pb-8" onClick={e => e.stopPropagation()}>{detailCard}</div>
        </div>
      )}

      {(isAddingDeal || editingDeal) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{editingDeal ? '編輯商機' : '新增商機'}</h3>
              <button onClick={() => { setIsAddingDeal(false); setEditingDeal(null); }} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-gray-500 block mb-1">客戶</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={dealForm.customerName} onChange={e => setDealForm({ ...dealForm, customerName: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">商品</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={dealForm.product} onChange={e => setDealForm({ ...dealForm, product: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">預估保費</label><input type="number" min="0" className="w-full p-2 border border-gray-200 rounded-lg" value={dealForm.estimatedPremium} onChange={e => setDealForm({ ...dealForm, estimatedPremium: e.target.value })} /></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">預計成交日期</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={dealForm.expectedCloseDate} onChange={e => setDealForm({ ...dealForm, expectedCloseDate: e.target.value })} /></div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">目前階段</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg" value={dealForm.stage} onChange={e => setDealForm({ ...dealForm, stage: e.target.value })}>
                  {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">備註（選填）</label><textarea className="w-full p-2 border border-gray-200 rounded-lg h-16 resize-none" value={dealForm.note} onChange={e => setDealForm({ ...dealForm, note: e.target.value })} /></div>
              <button onClick={handleSaveDeal} disabled={!dealForm.customerName.trim() || dealSaving} className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                {dealSaving ? <Loader2 className="animate-spin" size={16} /> : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const KnowledgeBase = ({ loggedInUser, isManagerViewer }) => {
  const [articles, setArticles] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [viewingArticle, setViewingArticle] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { title: '', category: KB_CATEGORIES[0], content: '', managerOnly: false };
  const [form, setForm] = useState(emptyForm);
  const [kbMode, setKbMode] = useState('articles');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'knowledge_articles'), (snap) => {
      setArticles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoaded(true);
    });
    return () => unsub();
  }, []);

  const isManager = isManagerViewer || (loggedInUser && MANAGER_RANKS.includes(loggedInUser.role));

  const visibleArticles = useMemo(() => {
    return articles.filter(a => {
      if (a.managerOnly && !isManager) return false;
      const matchSearch = !search || a.title.includes(search) || (a.content || '').includes(search);
      const matchCategory = !filterCategory || a.category === filterCategory;
      return matchSearch && matchCategory;
    }).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }, [articles, search, filterCategory, isManager]);

  const openAdd = () => { setForm(emptyForm); setIsAdding(true); };
  const openEdit = (a) => { setEditingArticle(a); setForm({ title: a.title, category: a.category, content: a.content, managerOnly: !!a.managerOnly }); setViewingArticle(null); };

  const handleSave = async () => {
    if (!form.title.trim() || !loggedInUser) return;
    setSaving(true);
    try {
      if (editingArticle) {
        await updateDoc(doc(db, 'knowledge_articles', editingArticle.id), { ...form, updatedAt: new Date().toISOString() });
        setEditingArticle(null);
      } else {
        await addDoc(collection(db, 'knowledge_articles'), { ...form, authorId: loggedInUser.id, authorName: loggedInUser.name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        setIsAdding(false);
      }
      setForm(emptyForm);
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try { await deleteDoc(doc(db, 'knowledge_articles', deleteTarget)); setDeleteTarget(null); setViewingArticle(null); } catch (e) { console.error(e); }
  };

  const kbTabs = (
    <div className="inline-flex p-1 rounded-full bg-white/[0.06] border border-white/10 self-start">
      {[['articles', '知識文章'], ['products', '商品大全']].map(([k, l]) => (
        <button key={k} onClick={() => setKbMode(k)} className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition ${kbMode === k ? 'bg-white text-gray-900' : 'text-white/60 hover:text-white'}`}>{l}</button>
      ))}
    </div>
  );

  if (kbMode === 'products') {
    return (
      <div className="max-w-none mx-auto space-y-4 animate-fade-in pb-28 md:pb-12">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="hidden md:block text-2xl sm:text-3xl font-bold text-gray-900 mr-2">知識庫</h2>
          {kbTabs}
        </div>
        <ProductCatalog />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} title="刪除文章" message="確定要刪除這篇知識庫文章嗎？" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="hidden md:block text-2xl sm:text-3xl font-bold text-gray-900">知識庫</h2>
          <p className="text-xs sm:text-sm text-gray-400 md:mt-1">共 {articles.length} 篇文章</p>
          <div className="mt-3">{kbTabs}</div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-xs sm:text-sm transition"><Plus size={14} /> 新增文章</button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" placeholder="搜尋標題或內容..." className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          <button onClick={() => setFilterCategory('')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${!filterCategory ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>全部</button>
          {KB_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filterCategory === cat ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{cat}</button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleArticles.map(a => (
          <Card key={a.id} onClick={() => setViewingArticle(a)} className="p-5 cursor-pointer hover:shadow-lg transition-all">
            <div className="flex items-center gap-1.5 mb-3">
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600">{a.category}</span>
              {a.managerOnly && <span className="px-2 py-1 rounded text-[10px] font-bold bg-amber-50 text-amber-600">主管專區</span>}
            </div>
            <h3 className="text-base font-bold text-gray-900 line-clamp-2">{a.title}</h3>
            <p className="text-xs text-gray-400 mt-2 line-clamp-2">{(a.content || '').slice(0, 60)}</p>
            <p className="text-[10px] text-gray-300 mt-3">{a.authorName} · {(a.updatedAt || '').slice(0, 10)}</p>
          </Card>
        ))}
        {loaded && visibleArticles.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            {articles.length === 0 ? '還沒有任何文章，點右上角「新增文章」開始建立' : '沒有符合條件的文章'}
          </div>
        )}
      </div>

      {viewingArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-up max-h-[85vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <span className="px-2 py-1 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600">{viewingArticle.category}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-2">{viewingArticle.title}</h3>
                <p className="text-[10px] text-gray-400 mt-1">{viewingArticle.authorName} · {(viewingArticle.updatedAt || '').slice(0, 10)}</p>
              </div>
              <button onClick={() => setViewingArticle(null)} className="p-1 hover:bg-gray-100 rounded-full shrink-0"><X size={20} /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{viewingArticle.content}</p>
            </div>
            <div className="p-6 pt-0 flex gap-2">
              <button onClick={() => openEdit(viewingArticle)} className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 text-sm font-bold"><Edit3 size={14} /> 編輯</button>
              <button onClick={() => setDeleteTarget(viewingArticle.id)} className="flex items-center gap-1.5 text-red-500 hover:text-red-600 text-sm font-bold"><Trash2 size={14} /> 刪除</button>
            </div>
          </div>
        </div>
      )}

      {(isAdding || editingArticle) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{editingArticle ? '編輯文章' : '新增文章'}</h3>
              <button onClick={() => { setIsAdding(false); setEditingArticle(null); }} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-bold text-gray-500 block mb-1">標題</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">分類</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {KB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">內容</label><textarea className="w-full p-2 border border-gray-200 rounded-lg h-48 resize-none" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} /></div>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.managerOnly} onChange={e => setForm({ ...form, managerOnly: e.target.checked })} className="w-4 h-4" /> 僅主管可見
              </label>
              <button onClick={handleSave} disabled={!form.title.trim() || saving} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={16} /> : '儲存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- IG 名單匯入 Modal ---
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
          <h3 className="text-lg font-bold text-gray-900">CSV 客戶資料上傳</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {step === 1 ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-700 leading-relaxed border border-blue-100">
                上傳 CSV 檔案，或直接把內容貼在下面的欄位裡。如果資料是在Notion，先「Export → CSV」匯出；如果資料是Excel檔案，先用「另存新檔」存成CSV格式，再上傳。
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
  const [showAddMenu, setShowAddMenu] = useState(false);
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
  const [cardMenuOpenId, setCardMenuOpenId] = useState(null);
  const [quick, setQuick] = useState('all');
  const [visibleCount, setVisibleCount] = useState(40);

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

  const crmCounts = {
    all: customers.length,
    prospect: customers.filter(c => (c.tags || []).includes('準客戶')).length,
    recruit: customers.filter(c => (c.tags || []).includes('準增員')).length,
    ig: customers.filter(c => isIGListCustomer(c)).length
  };
  const mobileList = filteredCustomers.filter(c => quick === 'all' ? true : quick === 'prospect' ? (c.tags || []).includes('準客戶') : quick === 'recruit' ? (c.tags || []).includes('準增員') : isIGListCustomer(c));
  const crmFilterActive = Object.values(filters).some(v => v && v !== false);

  return (
    <div className="max-w-6xl md:max-w-none md:h-full mx-auto space-y-6 md:space-y-0 animate-fade-in pb-12 md:pb-0">
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} title="刪除客戶" message="確定要刪除此客戶資料嗎？此動作無法復原。" />
      <IGImportModal isOpen={isIGOpen} onClose={() => setIsIGOpen(false)} loggedInUser={loggedInUser} existingNames={existingNames} onImported={() => {}} />
      <RelationshipNetworkModal isOpen={!!networkFocusId} onClose={() => setNetworkFocusId(null)} focusId={networkFocusId} setFocusId={setNetworkFocusId} customers={customers} relationships={relationships || []} loggedInUser={loggedInUser} />
      <NotionImportModal isOpen={isNotionOpen} onClose={() => setIsNotionOpen(false)} loggedInUser={loggedInUser} onImported={() => {}} />

      <div className="md:hidden">
        <MobileCustomerList
          list={mobileList} total={customers.length} counts={crmCounts} quick={quick} setQuick={setQuick}
          search={search} setSearch={setSearch} showFilter={showFilter} setShowFilter={setShowFilter} filterActive={crmFilterActive}
          filterPanel={(
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-bold text-gray-400 block mb-1">最小年齡</label><input type="number" className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" value={filters.ageMin} onChange={e => setFilters({ ...filters, ageMin: e.target.value })} /></div>
                <div><label className="text-[10px] font-bold text-gray-400 block mb-1">最大年齡</label><input type="number" className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" value={filters.ageMax} onChange={e => setFilters({ ...filters, ageMax: e.target.value })} /></div>
                <div><label className="text-[10px] font-bold text-gray-400 block mb-1">性別</label><select className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" value={filters.gender} onChange={e => setFilters({ ...filters, gender: e.target.value })}><option value="">全部</option>{GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}</select></div>
                <div><label className="text-[10px] font-bold text-gray-400 block mb-1">地區</label><select className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" value={filters.region} onChange={e => setFilters({ ...filters, region: e.target.value })}><option value="">全部</option>{TAIWAN_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div><label className="text-[10px] font-bold text-gray-400 block mb-1">年收入</label><select className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" value={filters.incomeRange} onChange={e => setFilters({ ...filters, incomeRange: e.target.value })}><option value="">全部</option>{INCOME_RANGES.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div><label className="text-[10px] font-bold text-gray-400 block mb-1">標籤</label><select className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm outline-none" value={filters.tag} onChange={e => setFilters({ ...filters, tag: e.target.value })}><option value="">全部</option>{CUSTOMER_TAGS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {[['vipOnly', '只看 VIP'], ['igOnly', '只看有 IG'], ['salesWatchOnly', '關注銷售'], ['recruitWatchOnly', '關注增員']].map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2 text-xs font-bold text-gray-600"><input type="checkbox" checked={filters[k]} onChange={e => setFilters({ ...filters, [k]: e.target.checked })} className="w-4 h-4" />{label}</label>
                ))}
              </div>
            </div>
          )}
          visible={visibleCount} setVisible={setVisibleCount} today={getTodayDate()}
          isVIP={(c) => isVIPCustomer(c, records)} isIG={isIGListCustomer} isDue={isFollowUpDue}
          onToggleWatch={toggleSalesWatch} onOpenEdit={openEdit} onNetwork={setNetworkFocusId} onMerge={openMerge} onDelete={setDeleteTarget} onLine={openLineChat}
          menuId={cardMenuOpenId} setMenuId={setCardMenuOpenId} getInstagramUrl={getInstagramUrl}
          addItems={[
            { label: '新增客戶', icon: UserPlus, onClick: openAdd },
            { label: 'IG 匯入', icon: Upload, onClick: () => setIsIGOpen(true) },
            { label: 'CSV 上傳', icon: Upload, onClick: () => setIsNotionOpen(true) }
          ]}
        />
      </div>

      <DesktopCustomerBoard
        customers={customers} list={filteredCustomers} records={records} search={search} setSearch={setSearch} filters={filters} setFilters={setFilters}
        today={getTodayDate()} isVIP={(c) => isVIPCustomer(c, records)} isIG={isIGListCustomer} isDue={isFollowUpDue}
        onToggleWatch={toggleSalesWatch} onToggleRecruitWatch={toggleRecruitWatch} onOpenEdit={openEdit} onNetwork={setNetworkFocusId} onMerge={openMerge} onDelete={setDeleteTarget} onLine={openLineChat} getInstagramUrl={getInstagramUrl}
        addItems={[
          { label: '新增客戶', icon: UserPlus, onClick: openAdd },
          { label: 'IG 匯入', icon: Upload, onClick: () => setIsIGOpen(true) },
          { label: 'CSV 上傳', icon: Upload, onClick: () => setIsNotionOpen(true) }
        ]}
        regions={TAIWAN_REGIONS} tags={CUSTOMER_TAGS} genders={GENDER_OPTIONS} incomes={INCOME_RANGES}
      />
      <div className="hidden space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="hidden md:block text-2xl sm:text-3xl font-bold text-gray-900">客戶管理</h2>
          <p className="text-xs sm:text-sm text-gray-400 md:mt-1">僅顯示你自己的客戶資料，共 {customers.length} 筆</p>
        </div>
        <div className="relative self-end sm:self-auto">
          <button onClick={() => setShowAddMenu(v => !v)} className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-sm ${showAddMenu ? 'bg-gray-900 text-white rotate-45' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
            <Plus size={22} />
          </button>
          {showAddMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)}></div>
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-scale-up origin-top-right">
                <button onClick={() => { openAdd(); setShowAddMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition">
                  <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><UserPlus size={16} /></span>
                  <span className="text-sm font-bold text-gray-700">新增客戶</span>
                </button>
                <button onClick={() => { setIsIGOpen(true); setShowAddMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition">
                  <span className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center shrink-0"><Upload size={16} /></span>
                  <span className="text-sm font-bold text-gray-700">IG 匯入</span>
                </button>
                <button onClick={() => { setIsNotionOpen(true); setShowAddMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition">
                  <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0"><Upload size={16} /></span>
                  <span className="text-sm font-bold text-gray-700">CSV 上傳</span>
                </button>
              </div>
            </>
          )}
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
                <div className="relative shrink-0 mr-10">
                  <button onClick={() => setCardMenuOpenId(cardMenuOpenId === c.id ? null : c.id)} className="p-2 text-gray-300 hover:text-gray-600 -mr-2"><MoreVertical size={18} /></button>
                  {cardMenuOpenId === c.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setCardMenuOpenId(null)}></div>
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-2xl border border-gray-100 py-1.5 z-50 animate-scale-up origin-top-right">
                        <button onClick={() => { setNetworkFocusId(c.id); setCardMenuOpenId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-left text-sm text-gray-700"><GitBranch size={14} className="text-purple-500" /> 關聯網</button>
                        <button onClick={() => { openMerge(c.id); setCardMenuOpenId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-left text-sm text-gray-700"><Users size={14} className="text-teal-500" /> 合併客戶</button>
                        <button onClick={() => { openEdit(c); setCardMenuOpenId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-left text-sm text-gray-700"><Edit3 size={14} className="text-indigo-500" /> 編輯</button>
                        <button onClick={() => { setDeleteTarget(c.id); setCardMenuOpenId(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-gray-50 text-left text-sm text-red-500"><Trash2 size={14} /> 刪除</button>
                      </div>
                    </>
                  )}
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
// --- 批次新增（客戶行程／提醒）共用：每種建檔方式都有 開始/結束日期、開始/結束時間、參與人員 ---
const commitDocsInChunks = async (items) => {
  for (let i = 0; i < items.length; i += 400) {
    const b = writeBatch(db);
    items.slice(i, i + 400).forEach(([ref, data]) => b.set(ref, data));
    await b.commit();
  }
};

const ParticipantChecklist = ({ team, selectedIds, onToggle, label }) => (
  <div>
    <label className="text-xs font-bold text-gray-500 block mb-1">{label || '參與人員（每個人各自獨立記一筆）'}</label>
    <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto border border-gray-100 rounded-lg p-2">
      {(team || []).map(m => (
        <label key={m.id} className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
          <input type="checkbox" checked={selectedIds.includes(m.id)} onChange={() => onToggle(m.id)} className="w-3.5 h-3.5" /> {m.name}
        </label>
      ))}
    </div>
  </div>
);

// --- 批次新增客戶行程（含自動新增客戶）---
const BatchActivityImportModal = ({ isOpen, onClose, loggedInUser, customers, team }) => {
  const [step, setStep] = useState(1);
  const [rawText, setRawText] = useState('');
  const [rows, setRows] = useState([]);
  const [participantIds, setParticipantIds] = useState(() => loggedInUser ? [loggedInUser.id] : []);
  const [priority, setPriority] = useState('normal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(1); setRawText(''); setRows([]); setPriority('normal'); setIsSubmitting(false);
      setParticipantIds(loggedInUser ? [loggedInUser.id] : []);
    }
  }, [isOpen, loggedInUser?.id]); // eslint-disable-line

  const existingNameMap = useMemo(() => {
    const map = {};
    customers.forEach(c => { map[c.name.trim().toLowerCase()] = c.id; });
    return map;
  }, [customers]);

  const handleParse = () => {
    const parsed = parseActivityBatchText(rawText, new Date().getFullYear());
    setRows(parsed.filter(r => r.date && r.name));
    setStep(2);
  };

  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value, ...(field === 'type' ? { typeLabel: ALL_ACTIVITY_WEIGHTS[value]?.label || value } : {}) } : r));
  };
  const removeRow = (id) => setRows(prev => prev.filter(r => r.id !== id));
  const toggleParticipant = (id) => setParticipantIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  const isNewCustomer = (name) => !existingNameMap[name.trim().toLowerCase()];

  const validRows = rows.filter(r => r.date && r.name.trim());

  const handleSubmit = async () => {
    if (validRows.length === 0 || participantIds.length === 0 || !loggedInUser) return;
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const nameToId = { ...existingNameMap };
      const newNames = [...new Set(validRows.map(r => r.name.trim()).filter(n => !nameToId[n.toLowerCase()]))];
      if (newNames.length > 0) {
        const customerItems = newNames.map(name => {
          const ref = doc(collection(db, 'customers'));
          nameToId[name.toLowerCase()] = ref.id;
          return [ref, {
            name, phone: '', lineId: '', igHandle: '', birthday: '', gender: '', region: '', incomeRange: '', address: '',
            tags: ['準客戶'], notes: '', nextFollowUpDate: '',
            source: '批次新增行程', ownerId: loggedInUser.id, visitLog: [], createdAt: now
          }];
        });
        await commitDocsInChunks(customerItems);
      }
      const eventItems = [];
      validRows.forEach(row => {
        participantIds.forEach(pid => {
          eventItems.push([doc(collection(db, 'schedule_events')), {
            ownerId: pid,
            customerId: nameToId[row.name.trim().toLowerCase()] || '',
            customerName: row.name.trim(),
            type: row.type, isReminder: false, title: '', priority,
            date: row.date, endDate: (row.endDate && row.endDate > row.date) ? row.endDate : '',
            time: row.time || '', endTime: row.endTime || '',
            note: row.note || '', address: '',
            status: 'scheduled', completedAt: null,
            createdById: loggedInUser.id, createdByName: loggedInUser.name, createdAt: now
          }]);
        });
      });
      await commitDocsInChunks(eventItems);
      onClose();
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  const cellInput = 'bg-transparent border border-gray-200 rounded px-1 outline-none';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl animate-scale-up border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-900">批次新增行程</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {step === 1 ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-700 leading-relaxed border border-blue-100">
                每行一筆，格式：<code>日期 時間(選填) 類型 姓名 備註(選填)</code>，空白分隔。日期可以寫範圍（9/11-9/13），時間也可以寫範圍（14:00-15:30），例如：<br />
                <code>9/11 面談 李冠葒</code><br />
                <code>9/11 14:00-15:30 面談 王博弘 sbb</code><br />
                <code>9/12-9/13 約訪 陳伯伯</code><br />
                沒填的欄位會給預設值（類型預設約訪），備註可填可不填；<strong>姓名沒對到既有客戶的話，匯入時會自動幫他新增一筆客戶資料</strong>。
              </div>
              <textarea
                className="w-full h-48 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 font-mono text-sm resize-none"
                placeholder="貼上行程文字..."
                value={rawText}
                onChange={e => setRawText(e.target.value)}
              />
            </>
          ) : (
            <>
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-500 font-bold uppercase">
                    <tr><th className="px-3 py-2">開始日</th><th className="px-3 py-2">結束日</th><th className="px-3 py-2">開始</th><th className="px-3 py-2">結束</th><th className="px-3 py-2">類型</th><th className="px-3 py-2">姓名</th><th className="px-3 py-2">備註</th><th className="px-3 py-2 w-10"></th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map(row => (
                      <tr key={row.id}>
                        <td className="p-2"><input type="text" placeholder="YYYY-MM-DD" className={`${cellInput} w-28`} value={row.date} onChange={e => updateRow(row.id, 'date', e.target.value)} /></td>
                        <td className="p-2"><input type="text" placeholder="選填" className={`${cellInput} w-28`} value={row.endDate || ''} onChange={e => updateRow(row.id, 'endDate', e.target.value)} /></td>
                        <td className="p-2"><input type="text" placeholder="HH:MM" className={`${cellInput} w-16`} value={row.time || ''} onChange={e => updateRow(row.id, 'time', e.target.value)} /></td>
                        <td className="p-2"><input type="text" placeholder="HH:MM" className={`${cellInput} w-16`} value={row.endTime || ''} onChange={e => updateRow(row.id, 'endTime', e.target.value)} /></td>
                        <td className="p-2">
                          <select className={cellInput} value={row.type} onChange={e => updateRow(row.id, 'type', e.target.value)}>
                            <optgroup label="業務活動">{Object.entries(ACTIVITY_WEIGHTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</optgroup>
                            <optgroup label="增員活動">{Object.entries(RECRUIT_ACTIVITY_WEIGHTS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</optgroup>
                          </select>
                        </td>
                        <td className="p-2">
                          <input type="text" className={`${cellInput} w-24`} value={row.name} onChange={e => updateRow(row.id, 'name', e.target.value)} />
                          {row.name && isNewCustomer(row.name) && <span className="ml-1 text-[9px] font-bold text-amber-600 bg-amber-50 px-1 py-0.5 rounded">新客戶</span>}
                        </td>
                        <td className="p-2"><input type="text" className={`${cellInput} w-full min-w-[100px]`} value={row.note} onChange={e => updateRow(row.id, 'note', e.target.value)} /></td>
                        <td className="p-2 text-center"><button onClick={() => removeRow(row.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                    {rows.length === 0 && <tr><td colSpan="8" className="text-center py-6 text-gray-400">無法解析出任何資料，請確認格式</td></tr>}
                  </tbody>
                </table>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">優先度</label>
                <select className="w-full p-2 border border-gray-200 rounded-lg" value={priority} onChange={e => setPriority(e.target.value)}>
                  {Object.entries(PRIORITY_LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <ParticipantChecklist team={team} selectedIds={participantIds} onToggle={toggleParticipant} />
              <p className="text-right text-xs text-gray-400">共 {validRows.length} 筆 × {participantIds.length} 人 = {validRows.length * participantIds.length} 筆行程，其中 {new Set(validRows.filter(r => isNewCustomer(r.name)).map(r => r.name.trim().toLowerCase())).size} 位會自動新增為客戶</p>
            </>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-between bg-gray-50 rounded-b-2xl">
          {step === 1 ? (
            <>
              <div></div>
              <button onClick={handleParse} disabled={!rawText.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition disabled:opacity-50">下一步</button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="text-sm font-bold text-gray-500 hover:text-gray-700">上一步</button>
              <button onClick={handleSubmit} disabled={validRows.length === 0 || participantIds.length === 0 || isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition disabled:opacity-50 flex items-center gap-2">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : `新增 ${validRows.length * participantIds.length} 筆行程`}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 批次新增提醒 ---
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
  }, [isOpen, loggedInUser?.id]); // eslint-disable-line

  const handleParse = () => {
    const parsed = parseBatchScheduleText(rawText, new Date().getFullYear());
    setRows(parsed.filter(r => r.title));
    setStep(2);
  };
  const updateRow = (id, field, value) => setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  const removeRow = (id) => setRows(prev => prev.filter(r => r.id !== id));
  const toggleParticipant = (id) => setParticipantIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

  const validRows = rows.filter(r => r.date && r.title);

  const handleSubmit = async () => {
    if (validRows.length === 0 || participantIds.length === 0 || !loggedInUser) return;
    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const items = [];
      validRows.forEach(row => {
        participantIds.forEach(pid => {
          items.push([doc(collection(db, 'schedule_events')), {
            ownerId: pid,
            customerId: '', customerName: '',
            isReminder: true, type: 'reminder',
            title: row.title, category, priority,
            date: row.date, endDate: (row.endDate && row.endDate > row.date) ? row.endDate : '',
            time: row.time || '', endTime: row.endTime || '', note: '', address: '',
            status: 'scheduled', completedAt: null,
            createdById: loggedInUser.id, createdByName: loggedInUser.name, createdAt: now
          }]);
        });
      });
      await commitDocsInChunks(items);
      onClose();
    } catch (e) { console.error(e); } finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  const cellInput = 'bg-transparent border border-gray-200 rounded px-1 outline-none';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-scale-up border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-900">批次新增提醒</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {step === 1 ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-700 leading-relaxed border border-blue-100">
                每行一筆，格式：<code>日期 時間(選填) 標題</code>。日期可以寫範圍（9/11-9/13），時間也可以寫範圍（14:00-17:00），例如：<br />
                <code>7/15 14:00 新人訓練第一堂：商品概論</code><br />
                <code>2026-07-22 14:00-16:00 新人訓練第二堂：話術演練</code><br />
                <code>9/11-9/13 出差高雄</code><br />
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
                    <tr><th className="px-3 py-2">開始日</th><th className="px-3 py-2">結束日</th><th className="px-3 py-2">開始</th><th className="px-3 py-2">結束</th><th className="px-3 py-2">標題</th><th className="px-3 py-2 w-10"></th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map(row => (
                      <tr key={row.id}>
                        <td className="p-2"><input type="text" placeholder="YYYY-MM-DD" className={`${cellInput} w-28`} value={row.date} onChange={e => updateRow(row.id, 'date', e.target.value)} /></td>
                        <td className="p-2"><input type="text" placeholder="選填" className={`${cellInput} w-28`} value={row.endDate || ''} onChange={e => updateRow(row.id, 'endDate', e.target.value)} /></td>
                        <td className="p-2"><input type="text" placeholder="HH:MM" className={`${cellInput} w-16`} value={row.time || ''} onChange={e => updateRow(row.id, 'time', e.target.value)} /></td>
                        <td className="p-2"><input type="text" placeholder="HH:MM" className={`${cellInput} w-16`} value={row.endTime || ''} onChange={e => updateRow(row.id, 'endTime', e.target.value)} /></td>
                        <td className="p-2"><input type="text" className={`${cellInput} w-full min-w-[140px]`} value={row.title} onChange={e => updateRow(row.id, 'title', e.target.value)} /></td>
                        <td className="p-2 text-center"><button onClick={() => removeRow(row.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                    {rows.length === 0 && <tr><td colSpan="6" className="text-center py-6 text-gray-400">無法解析出任何資料，請確認格式</td></tr>}
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
              <ParticipantChecklist team={team} selectedIds={participantIds} onToggle={toggleParticipant} label="參與人員（可複選）" />
              <p className="text-right text-xs text-gray-400">共 {validRows.length} 筆有效資料 × {participantIds.length} 人 = {validRows.length * participantIds.length} 筆提醒</p>
            </>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          {step === 1 ? (
            <button onClick={handleParse} disabled={!rawText.trim()} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50">下一步：確認內容</button>
          ) : (
            <>
              <button onClick={() => setStep(1)} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-200 rounded-lg transition">返回</button>
              <button onClick={handleSubmit} disabled={isSubmitting || validRows.length === 0 || participantIds.length === 0} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2">
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
// 優質人才培訓計劃：每3個月一階段，各階段門檻 (課程時數/活動次數不顯示；FYC為粗估數字，僅供參考)
const QUALITY_TALENT_THRESHOLDS = { fyc: 35000, insured: 6 };

const PersonalGoalsCard = ({ loggedInUser, records, activities }) => {
  const [goals, setGoals] = useState(PERSONAL_GOALS_DEFAULT);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(PERSONAL_GOALS_DEFAULT);
  const [saving, setSaving] = useState(false);
  const currentMonth = getCurrentMonth();
  const [qualityStartMonth, setQualityStartMonth] = useState('');
  const [editingQualityStart, setEditingQualityStart] = useState(false);
  const [qualityStartInput, setQualityStartInput] = useState('');

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

  useEffect(() => {
    setQualityStartMonth(loggedInUser?.qualityTalentStartMonth || '');
  }, [loggedInUser?.qualityTalentStartMonth]);

  const shiftMonthStr = (monthStr, delta) => {
    const [y, m] = monthStr.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  const qualityProgram = useMemo(() => {
    if (!qualityStartMonth || !loggedInUser) return null;
    const [sy, sm] = qualityStartMonth.split('-').map(Number);
    const [cy, cm] = currentMonth.split('-').map(Number);
    const monthsSinceStart = (cy - sy) * 12 + (cm - sm) + 1;
    if (monthsSinceStart < 1) return null;
    if (monthsSinceStart > 12) return { completed: true };
    const stageIndex = Math.min(3, Math.ceil(monthsSinceStart / 3) - 1);
    const stageMonths = [0, 1, 2].map(i => shiftMonthStr(qualityStartMonth, stageIndex * 3 + i));
    const stageRecords = records.filter(r => r.agentId === loggedInUser.id && stageMonths.includes(r.date.slice(0, 7)) && (r.status || '已發單') === '已發單');
    const stageFYC = stageRecords.reduce((s, r) => s + (r.premium || 0) * (PRODUCT_MAPPING[r.typeCode]?.commissionRate || 0), 0);
    const stageInsuredCount = new Set(stageRecords.map(r => (r.insuredName || '').trim()).filter(Boolean)).size;
    return {
      completed: false,
      stageIndex,
      stageMonths,
      stageFYC: Math.round(stageFYC),
      stageInsuredCount,
      fycTarget: QUALITY_TALENT_THRESHOLDS.fyc,
      insuredTarget: QUALITY_TALENT_THRESHOLDS.insured,
      fycMet: stageFYC >= QUALITY_TALENT_THRESHOLDS.fyc,
      insuredMet: stageInsuredCount >= QUALITY_TALENT_THRESHOLDS.insured
    };
  }, [qualityStartMonth, currentMonth, records, loggedInUser]);

  const handleSaveQualityStart = async () => {
    if (!loggedInUser || !qualityStartInput) return;
    try { await updateDoc(doc(db, 'user', loggedInUser.id), { qualityTalentStartMonth: qualityStartInput }); setEditingQualityStart(false); } catch (e) { console.error(e); }
  };

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

      {/* 優質人才培訓計劃：每3個月一階段的門檻進度 */}
      <div className="mt-5 pt-5 border-t border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-bold text-gray-800 text-sm flex items-center gap-2"><Award size={16} className="text-violet-500" /> 優質人才培訓計劃</h4>
          {qualityStartMonth && <button onClick={() => { setQualityStartInput(qualityStartMonth); setEditingQualityStart(true); }} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">修改起始月</button>}
        </div>
        {!qualityStartMonth ? (
          <div className="mt-2">
            <p className="text-xs text-gray-400 mb-2">還沒設定優培起始月，設定後才能顯示進度</p>
            <div className="flex gap-2">
              <input type="month" className="flex-1 p-2 border border-gray-200 rounded-lg text-sm" value={qualityStartInput} onChange={e => setQualityStartInput(e.target.value)} />
              <button onClick={handleSaveQualityStart} disabled={!qualityStartInput} className="bg-violet-600 text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50">設定</button>
            </div>
          </div>
        ) : qualityProgram?.completed ? (
          <p className="text-sm text-gray-400 mt-2">優培計劃期間（12個月）已結束</p>
        ) : qualityProgram && (
          <div className="mt-2">
            <p className="text-xs text-gray-400 mb-3">第 {qualityProgram.stageIndex + 1} 階段（{qualityProgram.stageMonths[0]} ~ {qualityProgram.stageMonths[2]}）· 僅供參考，正式數字以公司核算為準</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`rounded-xl p-3 border ${qualityProgram.fycMet ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
                <p className="text-[10px] font-bold uppercase text-gray-500">FYC + 行銷獎金 (估)</p>
                <p className="text-base font-bold text-gray-900 mt-1">{formatMoney(qualityProgram.stageFYC)} <span className="text-xs font-normal text-gray-400">/ {formatMoney(qualityProgram.fycTarget)}</span></p>
                <div className="h-1.5 w-full bg-white rounded-full overflow-hidden mt-2">
                  <div className={`h-full rounded-full ${qualityProgram.fycMet ? 'bg-emerald-500' : 'bg-gray-300'}`} style={{ width: `${Math.min(100, Math.round(qualityProgram.stageFYC / qualityProgram.fycTarget * 100))}%` }}></div>
                </div>
                {qualityProgram.fycMet && <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ 已達標</p>}
              </div>
              <div className={`rounded-xl p-3 border ${qualityProgram.insuredMet ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
                <p className="text-[10px] font-bold uppercase text-gray-500">不同被保險人數</p>
                <p className="text-base font-bold text-gray-900 mt-1">{qualityProgram.stageInsuredCount} <span className="text-xs font-normal text-gray-400">/ {qualityProgram.insuredTarget} 人</span></p>
                <div className="h-1.5 w-full bg-white rounded-full overflow-hidden mt-2">
                  <div className={`h-full rounded-full ${qualityProgram.insuredMet ? 'bg-emerald-500' : 'bg-gray-300'}`} style={{ width: `${Math.min(100, Math.round(qualityProgram.stageInsuredCount / qualityProgram.insuredTarget * 100))}%` }}></div>
                </div>
                {qualityProgram.insuredMet && <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ 已達標</p>}
              </div>
            </div>
          </div>
        )}
        {editingQualityStart && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-xs shadow-2xl animate-scale-up">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">優培起始月</h3>
                <button onClick={() => setEditingQualityStart(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
              </div>
              <input type="month" className="w-full p-2 border border-gray-200 rounded-lg mb-3" value={qualityStartInput} onChange={e => setQualityStartInput(e.target.value)} />
              <button onClick={handleSaveQualityStart} disabled={!qualityStartInput} className="w-full bg-violet-600 text-white py-3 rounded-lg font-bold disabled:opacity-50">儲存</button>
            </div>
          </div>
        )}
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
  const [trendAgentId, setTrendAgentId] = useState(loggedInUser?.id || '');
  const trendData = useMemo(() => {
    return igLogs.filter(l => l.agentId === trendAgentId).sort((a, b) => a.date.localeCompare(b.date)).map(l => ({ date: l.date.slice(5), count: l.count }));
  }, [igLogs, trendAgentId]);

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
    <div className="max-w-4xl lg:max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
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

        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-500">粉絲數趨勢</p>
            <select className="p-1.5 border border-gray-200 rounded-lg text-xs" value={trendAgentId} onChange={e => setTrendAgentId(e.target.value)}>
              {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          {trendData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 text-xs py-8">至少要有2筆記錄才能畫出趨勢圖</p>
          )}
        </div>
      </Card>
    </div>

  );
};

// --- 新人培訓進度追蹤 ---
const TRAINING_SECTIONS = [
  { title: '第一週：基礎認識', items: [
    { id: 'company_intro', label: '公司／組織介紹' },
    { id: 'system_training', label: '系統操作教學（App怎麼用）' },
    { id: 'compliance', label: '基本合規／法遵教育' }
  ]},
  { title: '第一個月：商品與技巧', items: [
    { id: 'product_test', label: '商品知識測驗（各險種）' },
    { id: 'pitch_practice', label: '話術演練（開發／約訪／面談）' },
    { id: 'accompany_visit', label: '陪同拜訪（累積3次）' }
  ]},
  { title: '內外勤考核', items: [
    { id: 'internal_test', label: '內部測驗通過' },
    { id: 'registration_exam', label: '業務員登錄考試通過' }
  ]},
  { title: '第一季：實戰達標', items: [
    { id: 'first_case', label: '首件保單完成' },
    { id: 'premium_target', label: '累積保費達標' },
    { id: 'activity_target', label: 'MEA活動量達基本門檻' }
  ]},
  { title: '持續發展', items: [
    { id: 'recruit_training', label: '增員訓練' },
    { id: 'advanced_training', label: '進階商品／法規教育' }
  ]}
];
const TRAINING_ALL_ITEMS = TRAINING_SECTIONS.flatMap(s => s.items);

const TrainingChecklistPage = ({ team }) => {
  const [checklists, setChecklists] = useState({});
  const [selectedMemberId, setSelectedMemberId] = useState(team[0]?.id || null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'training_checklists'), (snap) => {
      const map = {};
      snap.docs.forEach(d => { map[d.id] = d.data(); });
      setChecklists(map);
    });
    return () => unsub();
  }, []);

  const progress = (memberId) => {
    const items = checklists[memberId]?.items || {};
    const doneCount = TRAINING_ALL_ITEMS.filter(i => items[i.id]).length;
    return Math.round((doneCount / TRAINING_ALL_ITEMS.length) * 100);
  };

  const toggleItem = async (memberId, itemId) => {
    const current = checklists[memberId]?.items || {};
    const next = { ...current, [itemId]: !current[itemId] };
    try { await setDoc(doc(db, 'training_checklists', memberId), { items: next, updatedAt: new Date().toISOString() }, { merge: true }); } catch (e) { console.error(e); }
  };

  const selectedMember = team.find(m => m.id === selectedMemberId);
  const selectedItems = checklists[selectedMemberId]?.items || {};

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <div>
        <h2 className="hidden md:block text-2xl sm:text-3xl font-bold text-gray-900">新人培訓進度</h2>
        <p className="text-xs sm:text-sm text-gray-400 md:mt-1">追蹤每位同仁的訓練檢核表</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4 lg:col-span-1">
          <p className="text-xs font-bold text-gray-400 uppercase mb-3">選擇同仁</p>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto">
            {team.map(m => {
              const pct = progress(m.id);
              return (
                <button key={m.id} onClick={() => setSelectedMemberId(m.id)} className={`w-full flex items-center justify-between gap-2 p-2.5 rounded-lg text-left transition ${selectedMemberId === m.id ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-gray-50'}`}>
                  <span className="text-sm font-bold text-gray-800">{m.name}</span>
                  <span className={`text-xs font-bold ${pct === 100 ? 'text-emerald-500' : 'text-gray-400'}`}>{pct}%</span>
                </button>
              );
            })}
          </div>
        </Card>

        {selectedMember && (
          <Card className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-gray-800">{selectedMember.name} 的訓練進度</h3>
              <span className="text-lg font-bold text-indigo-600">{progress(selectedMemberId)}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${progress(selectedMemberId)}%` }}></div>
            </div>
            <div className="space-y-5">
              {TRAINING_SECTIONS.map(section => (
                <div key={section.title}>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">{section.title}</p>
                  <div className="space-y-1.5">
                    {section.items.map(item => (
                      <label key={item.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={!!selectedItems[item.id]} onChange={() => toggleItem(selectedMemberId, item.id)} className="w-4 h-4" />
                        <span className={`text-sm ${selectedItems[item.id] ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
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
              {c.igHandle && <a href={getInstagramUrl(c.igHandle)} target="_blank" rel="noopener noreferrer" title="開啟 IG" className="bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center">IG</a>}
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
        <h2 className="hidden md:block text-2xl sm:text-3xl font-bold text-gray-900">關注名單</h2>
        <p className="text-xs sm:text-sm text-gray-400 md:mt-1">在「客戶管理」點客戶卡片上的星星標記，會一直提醒直到你自己取消</p>
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
  const HOUR_H = 60;
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
        <div className="flex flex-wrap gap-2 mb-4">
          {untimed.map(e => (
            <button key={e.id} onClick={() => onEventClick(e)} className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full pl-2 pr-3 py-1.5 transition">
              <span className={`w-2 h-2 rounded-full ${getEventColor(e)}`}></span>
              <span className="text-xs font-bold text-gray-700">{getEventLabel(e)}{e.customerName && ` · ${e.customerName}`}</span>
            </button>
          ))}
        </div>
      )}
      <div className="relative" style={{ display: 'grid', gridTemplateColumns: '48px 1fr' }}>
        <div style={{ height: totalHeight }} className="relative">
          {hours.map((h, i) => (
            <div key={h} style={{ position: 'absolute', top: i * HOUR_H - 7, right: 8 }} className="text-xs text-gray-400">
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
                className={`${getEventColor(e)} rounded-lg text-left px-2.5 py-1.5 overflow-hidden hover:brightness-95 transition shadow-sm`}
              >
                <p className="text-white text-xs font-bold leading-tight truncate">{getEventLabel(e)}{e.customerName && ` · ${e.customerName}`}</p>
                {height > 34 && <p className="text-white/80 text-[11px] leading-tight">{e.time}{e.endTime ? `-${e.endTime}` : ''}</p>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- 整月月曆檢視 ---
// --- 個人待辦清單 (輕量小事項，不記日期、不計MEA，純自己用) ---
const PersonalTodoList = ({ loggedInUser }) => {
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loggedInUser) return;
    const unsub = onSnapshot(query(collection(db, 'personal_todos'), where('ownerId', '==', loggedInUser.id)), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
      setItems(list);
    });
    return () => unsub();
  }, [loggedInUser]);

  const handleAdd = async () => {
    if (!text.trim() || !loggedInUser) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'personal_todos'), { ownerId: loggedInUser.id, text: text.trim(), done: false, createdAt: new Date().toISOString() });
      setText('');
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  const toggleDone = async (item) => {
    try { await updateDoc(doc(db, 'personal_todos', item.id), { done: !item.done }); } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    try { await deleteDoc(doc(db, 'personal_todos', id)); } catch (e) { console.error(e); }
  };

  const pending = items.filter(i => !i.done);
  const done = items.filter(i => i.done);

  return (
    <Card className="p-5">
      <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2"><CheckSquare size={16} className="text-teal-500" /> 我的待辦小事</h3>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="隨手記一件小事..."
          className="flex-1 p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-500"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleAdd(); }}
        />
        <button onClick={handleAdd} disabled={!text.trim() || saving} className="bg-teal-600 hover:bg-teal-700 text-white px-3 rounded-lg disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        </button>
      </div>
      <div className="space-y-1">
        {pending.map(item => (
          <div key={item.id} className="flex items-center gap-2 group px-1 py-1">
            <input type="checkbox" checked={false} onChange={() => toggleDone(item)} className="w-4 h-4 shrink-0" />
            <span className="text-sm text-gray-700 flex-1">{item.text}</span>
            <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition"><X size={14} /></button>
          </div>
        ))}
        {done.length > 0 && (
          <div className="pt-2 mt-2 border-t border-gray-100 space-y-1">
            {done.map(item => (
              <div key={item.id} className="flex items-center gap-2 group px-1 py-1">
                <input type="checkbox" checked={true} onChange={() => toggleDone(item)} className="w-4 h-4 shrink-0" />
                <span className="text-sm text-gray-400 line-through flex-1">{item.text}</span>
                <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition"><X size={14} /></button>
              </div>
            ))}
          </div>
        )}
        {items.length === 0 && <p className="text-center text-gray-400 text-xs py-3">還沒有記任何小事</p>}
      </div>
    </Card>
  );
};

const MonthCalendarView = ({ events, getEventLabel, getEventColor, onEventClick, onAddForDate, onDropOnDate, getEventMeta, today }) => {
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(() => today.slice(0, 7));
  const [selectedDay, setSelectedDay] = useState(today);

  const shiftMonth = (delta) => {
    const [y, m] = calendarMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setCalendarMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(e => {
      const last = e.endDate && e.endDate > e.date ? e.endDate : e.date;
      let cursor = e.date;
      let guard = 0;
      while (cursor <= last && guard < 62) {
        if (!map[cursor]) map[cursor] = [];
        map[cursor].push(e);
        const [y, m, d] = cursor.split('-').map(Number);
        cursor = dateToStr(new Date(y, m - 1, d + 1));
        guard++;
      }
    });
    return map;
  }, [events]);

  const gridDays = useMemo(() => {
    const [y, m] = calendarMonth.split('-').map(Number);
    const firstDay = new Date(y, m - 1, 1);
    const startOffset = firstDay.getDay();
    const daysInMonth = new Date(y, m, 0).getDate();
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(`${calendarMonth}-${String(d).padStart(2, '0')}`);
    return days;
  }, [calendarMonth]);

  const selectedDayEvents = (eventsByDate[selectedDay] || []).sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  return (
    <div>
      <div className="flex items-center justify-center gap-5 mb-5">
        <button onClick={() => shiftMonth(-1)} className="text-gray-400 hover:text-gray-700 p-1"><ChevronLeft size={20} /></button>
        <span className="font-bold text-gray-800 text-base">{calendarMonth}</span>
        <button onClick={() => shiftMonth(1)} className="text-gray-400 hover:text-gray-700 p-1"><ChevronRight size={20} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-xs font-bold text-gray-400 mb-1.5">
        {['日', '一', '二', '三', '四', '五', '六'].map(w => <div key={w}>{w}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {gridDays.map((dateStr, i) => {
          if (!dateStr) return <div key={i}></div>;
          const dayEvents = eventsByDate[dateStr] || [];
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDay;
          const holiday = TAIWAN_HOLIDAYS_2026[dateStr];
          const maxRows = holiday ? 3 : 4;
          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDay(dateStr)}
              onDragOver={(ev) => { if (draggedEvent) { ev.preventDefault(); setDragOverDate(dateStr); } }}
              onDragLeave={() => setDragOverDate(prev => prev === dateStr ? null : prev)}
              onDrop={(ev) => {
                ev.preventDefault();
                setDragOverDate(null);
                if (draggedEvent && onDropOnDate && dateStr !== draggedEvent.date) onDropOnDate(draggedEvent, dateStr);
                setDraggedEvent(null);
              }}
              className={`h-[92px] sm:h-[112px] rounded-lg pt-1 pb-1 flex flex-col items-stretch gap-0.5 transition overflow-hidden ${dragOverDate === dateStr ? 'bg-indigo-100 ring-2 ring-indigo-300' : isSelected ? 'bg-indigo-50' : isToday ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
            >
              <span className={`text-xs w-5 h-5 mx-auto flex items-center justify-center rounded-full shrink-0 ${isToday ? 'bg-gray-900 text-white font-bold' : holiday ? 'text-red-500 font-bold' : 'text-gray-500'}`}>{Number(dateStr.slice(8))}</span>
              <div className="flex flex-col gap-px px-0.5 mt-0.5 min-w-0">
                {holiday && <span className="text-[9px] leading-tight font-bold rounded-sm px-1 py-0.5 truncate bg-red-500 text-white text-left">{holiday}</span>}
                {dayEvents.slice(0, maxRows).map((e, idx) => (
                  <span key={idx} className={`text-[9px] leading-tight font-bold rounded-sm px-1 py-0.5 truncate text-left text-white ${getEventColor(e)}`}>{e.status === 'completed' ? '✓ ' : ''}{getEventLabel(e)}</span>
                ))}
                {dayEvents.length > maxRows && <span className="text-[9px] text-gray-400 font-bold text-left px-1">+{dayEvents.length - maxRows}</span>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold text-gray-600">{selectedDay} 的行程{TAIWAN_HOLIDAYS_2026[selectedDay] && <span className="text-red-500"> · {TAIWAN_HOLIDAYS_2026[selectedDay]}</span>}</p>
          {onAddForDate && (
            <button onClick={() => onAddForDate(selectedDay)} className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"><Plus size={14} /> 新增</button>
          )}
        </div>
        {onDropOnDate && selectedDayEvents.length > 0 && <p className="hidden md:block text-[11px] text-gray-400 mb-2">滑鼠可以直接把行程拖到上面的日期格子，快速改期</p>}
        {selectedDayEvents.length === 0 && <p className="text-center text-gray-400 text-sm py-6">這天沒有安排</p>}
        <div className="space-y-2">
          {selectedDayEvents.map(e => {
            const isDone = e.status === 'completed';
            const canDrag = !isDone && !e.isVirtual && onDropOnDate;
            return (
              <button
                key={e.id}
                onClick={() => onEventClick(e)}
                draggable={canDrag}
                onDragStart={() => canDrag && setDraggedEvent(e)}
                onDragEnd={() => setDraggedEvent(null)}
                className={`w-full flex items-center gap-2.5 p-3 rounded-lg text-left transition ${isDone ? 'bg-gray-50' : 'hover:bg-gray-50'} ${canDrag ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                {isDone ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getEventColor(e)}`}></span>}
                <span className="text-sm font-bold truncate text-gray-800">{getEventLabel(e)}</span>
                <span className="text-sm truncate text-gray-500">{e.customerName}</span>
                {getEventMeta && getEventMeta(e) && <span className="text-[11px] text-indigo-400 shrink-0">{getEventMeta(e)}</span>}
                {e.time && <span className="text-xs ml-auto shrink-0 text-gray-400">{e.time}{e.endTime ? `-${e.endTime}` : ''}</span>}
                {canDrag && <GripVertical size={14} className="text-gray-300 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};

// ================= 每日活動量／全隊達成看板／鼓勵訊息／科技感佈景 =================
const DAILY_TARGET = 20;
const WEEKLY_TARGET = 100;
const ACT_SCORE_KEYS = Object.keys(ALL_ACTIVITY_WEIGHTS);
const scoreOfActivity = (a) => ACT_SCORE_KEYS.reduce((s, k) => s + (Number(a[k]) || 0) * ALL_ACTIVITY_WEIGHTS[k].score, 0);
const pointsOnDate = (activities, agentId, date) => (activities || []).filter(a => a.agentId === agentId && a.date === date).reduce((s, a) => s + scoreOfActivity(a), 0);
const dateAdd = (dateStr, n) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};
const dayOfWeek = (dateStr) => { const [y, m, d] = dateStr.split('-').map(Number); return new Date(y, m - 1, d).getDay(); };
const weekStartOf = (dateStr) => dateAdd(dateStr, -dayOfWeek(dateStr));
const weekPoints = (activities, agentId, date) => {
  const start = weekStartOf(date);
  const end = dateAdd(start, 6);
  return (activities || []).filter(a => a.agentId === agentId && a.date >= start && a.date <= end).reduce((s, a) => s + scoreOfActivity(a), 0);
};
const monthPoints = (activities, agentId, date) => (activities || []).filter(a => a.agentId === agentId && a.date && a.date.startsWith(date.slice(0, 7))).reduce((s, a) => s + scoreOfActivity(a), 0);
const streakDays = (activities, agentId, today) => {
  let streak = 0;
  for (let i = 0; i < 120; i++) {
    const d = dateAdd(today, -i);
    const p = pointsOnDate(activities, agentId, d);
    if (p >= DAILY_TARGET) streak++;
    else if (i === 0) continue;
    else if ([0, 6].includes(dayOfWeek(d))) continue;
    else break;
  }
  return streak;
};

const getDistrictMembers = (team, rootName) => {
  const root = team.find(m => m.name === rootName);
  if (!root) return team;
  const seen = new Set([String(root.id)]);
  const out = [root];
  const queue = [root];
  while (queue.length) {
    const cur = queue.shift();
    team.forEach(m => {
      if (m.parentId && String(m.parentId) === String(cur.id) && !seen.has(String(m.id))) { seen.add(String(m.id)); out.push(m); queue.push(m); }
    });
  }
  return out;
};

// 優培欄位自動隱藏：期別距今超過一年隱藏；沒填期別但登錄已超過一年也隱藏
const getQualityInfo = (member, records) => {
  const now = getCurrentMonth();
  const [cy, cm] = now.split('-').map(Number);
  if (member.qualityTalentStartMonth) {
    const [sy, sm] = member.qualityTalentStartMonth.split('-').map(Number);
    const diff = (cy - sy) * 12 + (cm - sm);
    if (Math.abs(diff) > 12 || diff >= 12) return null;
    if (diff < 0) return { state: 'upcoming', start: member.qualityTalentStartMonth };
    const stageIndex = Math.min(3, Math.floor(diff / 3));
    const stageMonths = [0, 1, 2].map(i => { const d = new Date(sy, sm - 1 + stageIndex * 3 + i, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; });
    const stageRecords = (records || []).filter(r => r.agentId === member.id && stageMonths.includes((r.date || '').slice(0, 7)) && (r.status || '已發單') === '已發單');
    const fyc = Math.round(stageRecords.reduce((s, r) => s + (r.premium || 0) * (PRODUCT_MAPPING[r.typeCode]?.commissionRate || 0), 0));
    const insured = new Set(stageRecords.map(r => (r.insuredName || '').trim()).filter(Boolean)).size;
    return { state: 'active', stage: stageIndex + 1, fyc, insured, fycTarget: QUALITY_TALENT_THRESHOLDS.fyc, insuredTarget: QUALITY_TALENT_THRESHOLDS.insured };
  }
  const reg = member.promotionDates?.registered;
  if (!reg) return null;
  const regTime = new Date(reg).getTime();
  if (isNaN(regTime)) return null;
  if ((Date.now() - regTime) / 86400000 > 365) return null;
  return { state: 'unset' };
};

const NUDGE_NONE = [
  '今天還沒有任何活動紀錄。先約一個人，分數就開始跑了。',
  '活動量是業績的前一步。花兩分鐘，把今天的第一通約訪記下來。',
  '今天的帳戶還是 0 分。找一位老客戶問候一聲，就是第一個 1 分。',
  '沒有開始，就沒有結果。傳一則訊息給準客戶，今天就算啟動。',
  '今天的日報還空著。做了就記，記了才看得見自己的進步。',
  '每天 20 分不是大數字：約訪 3 通、面談 1 場，再加一個新名單。',
  '別讓今天空白。一次約訪、一次問候，都算在分數裡。',
  '打開 App 的你，已經比沒打開的人更靠近目標。現在去記第一筆。',
  '客戶正在等一個關心。今天先聯絡一位，把它記下來。',
  '起跑不用完美，只要開始。先記下第一筆活動量。'
];
const NUDGE_LOW = [
  '今天已經 {pts} 分，再 {n} 分就達標。差一點點，現在動起來。',
  '目前 {pts}/20。再約一位客戶，距離目標又近一步。',
  '還差 {n} 分。一場面談 2 分，一份建議書 3 分。',
  '{pts} 分是很好的開始，剩下 {n} 分，今天收得回來。',
  '快到了。再補 {n} 分，今天就能畫上完整的句點。',
  '進度 {pts}/20。現在傳一則訊息、約一個人，就會往前推進。',
  '別在 {pts} 分停下來。再 {n} 分，你就可以安心下班。',
  '穩定的人贏在每一天。今天還差 {n} 分，補上它。',
  '你已經動起來了，{pts} 分。把剩下的 {n} 分也拿下。',
  '距離今天的目標只剩 {n} 分，一通電話的距離。'
];
const NUDGE_DONE = [
  '今天 20 分達標！{pts} 分入帳，漂亮。',
  '{name}，今天的活動量完成。持續做，結果自然來。',
  '達標。這一天的努力，會在未來的業績裡回來找你。',
  '今天做到了，{pts} 分。明天同樣的節奏，繼續。',
  '目標完成！你又把自律往前推了一天。',
  '20 分達成。今天的你，值得好好吃一頓晚餐。',
  '完成今天的活動量，團隊因為你更有力量。',
  '漂亮的一天，{pts} 分。連續達標的人，最後都不會讓人意外。',
  '今天的目標已經在你手上。恭喜，也記得休息。',
  '又一天達標。累積，是最安靜也最強的力量。'
];
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fillNudge = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ''));

const JfTechStyle = () => (
  <style>{`
    .jf-tech { background: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang TC", "Noto Sans TC", "Helvetica Neue", sans-serif; -webkit-font-smoothing: antialiased; letter-spacing: -0.005em; }
    .jf-tech h1, .jf-tech h2, .jf-tech h3 { letter-spacing: -0.02em; }
    html, body { touch-action: manipulation; -webkit-text-size-adjust: 100%; overscroll-behavior-y: none; }
    .jf-tech.jf-dark { background: #05070f; }
    .jf-tech.jf-dark-m { background: #05070f; }
    .jf-tech .bg-indigo-600, .jf-tech .bg-indigo-500 { background-color: #111114; }
    .jf-tech .hover\\:bg-indigo-700:hover, .jf-tech .hover\\:bg-indigo-600:hover { background-color: #2a2a30; }
    .jf-tech .text-indigo-600, .jf-tech .text-indigo-700, .jf-tech .text-indigo-500 { color: #111114; }
    .jf-tech .bg-indigo-50, .jf-tech .bg-indigo-100 { background-color: #efeff2; }
    .jf-tech .border-indigo-500, .jf-tech .border-t-indigo-500, .jf-tech .border-indigo-200 { border-color: #111114; }
    @keyframes jfNudgeIn { from { opacity: 0; transform: translateY(-16px) scale(.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
    @keyframes jfRingGlow { 0%,100% { filter: drop-shadow(0 0 4px rgba(52,211,153,.35)) } 50% { filter: drop-shadow(0 0 12px rgba(52,211,153,.7)) } }
    .jf-nudge-in { animation: jfNudgeIn .45s cubic-bezier(.2,.8,.2,1) both }
    .jf-ring-done { animation: jfRingGlow 2.4s ease-in-out infinite }
    @keyframes jfFlow { to { stroke-dashoffset: -60; } }
    @keyframes jfLive { 0%,100% { opacity: 1; transform: scale(1) } 50% { opacity: .35; transform: scale(1.6) } }
    .jf-flow-line .recharts-line-curve, .jf-flow-line path { stroke-dasharray: 3 57; stroke-linecap: round; animation: jfFlow 2.4s linear infinite; }
    .jf-flow-b path { animation-duration: 3.1s; animation-delay: -.8s; } .jf-flow-c path { animation-duration: 2.8s; animation-delay: -1.4s; }
    .jf-live-dot { animation: jfLive 1.6s ease-in-out infinite; }
    @media (min-width: 768px) { .jf-tech.jf-dark-m input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), .jf-tech.jf-dark-m select, .jf-tech.jf-dark-m textarea { font-size: 14px !important; min-height: 0 !important; } }
    .no-scrollbar { scrollbar-width: none; } .no-scrollbar::-webkit-scrollbar { display: none; }
    .jf-grid-bg { background-image: linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px); background-size: 28px 28px; }
    @media all {
      .jf-tech.jf-dark-m { color: #e6eaf5; }
      .jf-tech.jf-dark-m .bg-white { background-color: #0d1220; }
      .jf-tech.jf-dark-m .bg-gray-50 { background-color: #121829; }
      .jf-tech.jf-dark-m .bg-gray-100 { background-color: #171e33; }
      .jf-tech.jf-dark-m .bg-gray-200 { background-color: #1f2740; }
      .jf-tech.jf-dark-m .bg-gray-300 { background-color: #2a3350; }
      .jf-tech.jf-dark-m .bg-slate-50 { background-color: #121829; }
      .jf-tech.jf-dark-m .bg-slate-100 { background-color: #171e33; }
      .jf-tech.jf-dark-m .bg-slate-200 { background-color: #1f2740; }
      .jf-tech.jf-dark-m .bg-neutral-50 { background-color: #121829; }
      .jf-tech.jf-dark-m .bg-neutral-100 { background-color: #171e33; }
      .jf-tech.jf-dark-m .bg-zinc-50 { background-color: #121829; }
      .jf-tech.jf-dark-m .bg-zinc-100 { background-color: #171e33; }
      .jf-tech.jf-dark-m .bg-gray-700 { background-color: #252f4d; }
      .jf-tech.jf-dark-m .bg-gray-800 { background-color: #1a2340; }
      .jf-tech.jf-dark-m .bg-gray-900 { background-color: #1a2340; }
      .jf-tech.jf-dark-m .bg-slate-800 { background-color: #1a2340; }
      .jf-tech.jf-dark-m .bg-slate-900 { background-color: #141b30; }
      .jf-tech.jf-dark-m .hover\\:bg-gray-50:hover { background-color: #202a46; }
      .jf-tech.jf-dark-m .hover\\:bg-gray-100:hover { background-color: #202a46; }
      .jf-tech.jf-dark-m .hover\\:bg-gray-200:hover { background-color: #202a46; }
      .jf-tech.jf-dark-m .hover\\:bg-slate-50:hover { background-color: #202a46; }
      .jf-tech.jf-dark-m .hover\\:bg-slate-100:hover { background-color: #202a46; }
      .jf-tech.jf-dark-m .hover\\:bg-white:hover { background-color: #151c32; }
      .jf-tech.jf-dark-m .bg-\\[\\#F5F7FA\\] { background-color: #0a0f1d; }
      .jf-tech.jf-dark-m .bg-\\[\\#f5f5f7\\] { background-color: #0a0f1d; }
      .jf-tech.jf-dark-m .bg-\\[\\#f5f6fa\\] { background-color: #0a0f1d; }
      .jf-tech.jf-dark-m .bg-\\[\\#F9FAFB\\] { background-color: #0a0f1d; }
      .jf-tech.jf-dark-m .bg-\\[\\#fafafa\\] { background-color: #0a0f1d; }
      .jf-tech.jf-dark-m .bg-\\[\\#f7f7f9\\] { background-color: #0a0f1d; }
      .jf-tech.jf-dark-m .bg-\\[\\#F3F4F6\\] { background-color: #0a0f1d; }
      .jf-tech.jf-dark-m .bg-\\[\\#f4f5f9\\] { background-color: #0a0f1d; }
      .jf-tech.jf-dark-m .bg-white\\/60 { background-color: rgba(13,18,32,.88); }
      .jf-tech.jf-dark-m .bg-white\\/70 { background-color: rgba(13,18,32,.88); }
      .jf-tech.jf-dark-m .bg-white\\/80 { background-color: rgba(13,18,32,.88); }
      .jf-tech.jf-dark-m .bg-white\\/90 { background-color: rgba(13,18,32,.88); }
      .jf-tech.jf-dark-m .bg-white\\/95 { background-color: rgba(13,18,32,.88); }
      .jf-tech.jf-dark-m .text-gray-900 { color: #f2f4fa; }
      .jf-tech.jf-dark-m .text-gray-800 { color: #e6eaf5; }
      .jf-tech.jf-dark-m .text-gray-700 { color: #d0d7ea; }
      .jf-tech.jf-dark-m .text-gray-600 { color: #b3bcd4; }
      .jf-tech.jf-dark-m .text-gray-500 { color: #96a1bd; }
      .jf-tech.jf-dark-m .text-gray-400 { color: #7c88a6; }
      .jf-tech.jf-dark-m .text-gray-300 { color: #5f6b8a; }
      .jf-tech.jf-dark-m .text-slate-900 { color: #f2f4fa; }
      .jf-tech.jf-dark-m .text-slate-800 { color: #e6eaf5; }
      .jf-tech.jf-dark-m .text-slate-700 { color: #d0d7ea; }
      .jf-tech.jf-dark-m .text-slate-600 { color: #b3bcd4; }
      .jf-tech.jf-dark-m .text-slate-500 { color: #96a1bd; }
      .jf-tech.jf-dark-m .text-slate-400 { color: #7c88a6; }
      .jf-tech.jf-dark-m .text-black { color: #ffffff; }
      .jf-tech.jf-dark-m .text-neutral-900 { color: #f2f4fa; }
      .jf-tech.jf-dark-m .text-neutral-700 { color: #d0d7ea; }
      .jf-tech.jf-dark-m .text-neutral-500 { color: #96a1bd; }
      .jf-tech.jf-dark-m .hover\\:text-gray-900:hover, .jf-tech.jf-dark-m .hover\\:text-gray-700:hover, .jf-tech.jf-dark-m .hover\\:text-gray-600:hover { color: #ffffff; }
      .jf-tech.jf-dark-m .placeholder-gray-400::placeholder, .jf-tech.jf-dark-m .placeholder-gray-300::placeholder { color: #62708f; }
      .jf-tech.jf-dark-m .border-gray-50 { border-color: rgba(255,255,255,.07); }
      .jf-tech.jf-dark-m .border-gray-100 { border-color: rgba(255,255,255,.09); }
      .jf-tech.jf-dark-m .border-gray-200 { border-color: rgba(255,255,255,.13); }
      .jf-tech.jf-dark-m .border-gray-300 { border-color: rgba(255,255,255,.18); }
      .jf-tech.jf-dark-m .border-slate-100 { border-color: rgba(255,255,255,.09); }
      .jf-tech.jf-dark-m .border-slate-200 { border-color: rgba(255,255,255,.13); }
      .jf-tech.jf-dark-m .border-white { border-color: rgba(255,255,255,.1); }
      .jf-tech.jf-dark-m .border-black\\/\\[0\\.05\\] { border-color: rgba(255,255,255,.09); }
      .jf-tech.jf-dark-m .border-black\\/\\[0\\.06\\] { border-color: rgba(255,255,255,.09); }
      .jf-tech.jf-dark-m .border-black\\/5 { border-color: rgba(255,255,255,.09); }
      .jf-tech.jf-dark-m .border-black\\/10 { border-color: rgba(255,255,255,.09); }
      .jf-tech.jf-dark-m .divide-gray-50 > :not([hidden]) ~ :not([hidden]), .jf-tech.jf-dark-m .divide-gray-100 > :not([hidden]) ~ :not([hidden]), .jf-tech.jf-dark-m .divide-gray-200 > :not([hidden]) ~ :not([hidden]) { border-color: rgba(255,255,255,.08); }
      .jf-tech.jf-dark-m .ring-gray-100, .jf-tech.jf-dark-m .ring-gray-200 { --tw-ring-color: rgba(255,255,255,.12); }
      .jf-tech.jf-dark-m .bg-indigo-50 { background-color: rgba(99,102,241,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-indigo-50:hover { background-color: rgba(99,102,241,0.18); }
      .jf-tech.jf-dark-m .bg-indigo-100 { background-color: rgba(99,102,241,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-indigo-100:hover { background-color: rgba(99,102,241,0.24); }
      .jf-tech.jf-dark-m .bg-indigo-200 { background-color: rgba(99,102,241,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-indigo-200:hover { background-color: rgba(99,102,241,0.32); }
      .jf-tech.jf-dark-m .border-indigo-100 { border-color: rgba(99,102,241,.32); }
      .jf-tech.jf-dark-m .border-indigo-200 { border-color: rgba(99,102,241,.32); }
      .jf-tech.jf-dark-m .border-indigo-300 { border-color: rgba(99,102,241,.32); }
      .jf-tech.jf-dark-m .text-indigo-400 { color: #a5b4fc; }
      .jf-tech.jf-dark-m .text-indigo-500 { color: #a5b4fc; }
      .jf-tech.jf-dark-m .text-indigo-600 { color: #a5b4fc; }
      .jf-tech.jf-dark-m .text-indigo-700 { color: #a5b4fc; }
      .jf-tech.jf-dark-m .text-indigo-800 { color: #a5b4fc; }
      .jf-tech.jf-dark-m .text-indigo-900 { color: #a5b4fc; }
      .jf-tech.jf-dark-m .hover\\:text-indigo-600:hover, .jf-tech.jf-dark-m .hover\\:text-indigo-700:hover, .jf-tech.jf-dark-m .hover\\:text-indigo-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-indigo-50"], .jf-tech.jf-dark-m [class~="to-indigo-50"], .jf-tech.jf-dark-m [class~="from-indigo-100"], .jf-tech.jf-dark-m [class~="to-indigo-100"] { --tw-gradient-from: rgba(99,102,241,.14) !important; --tw-gradient-to: rgba(99,102,241,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-blue-50 { background-color: rgba(59,130,246,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-blue-50:hover { background-color: rgba(59,130,246,0.18); }
      .jf-tech.jf-dark-m .bg-blue-100 { background-color: rgba(59,130,246,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-blue-100:hover { background-color: rgba(59,130,246,0.24); }
      .jf-tech.jf-dark-m .bg-blue-200 { background-color: rgba(59,130,246,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-blue-200:hover { background-color: rgba(59,130,246,0.32); }
      .jf-tech.jf-dark-m .border-blue-100 { border-color: rgba(59,130,246,.32); }
      .jf-tech.jf-dark-m .border-blue-200 { border-color: rgba(59,130,246,.32); }
      .jf-tech.jf-dark-m .border-blue-300 { border-color: rgba(59,130,246,.32); }
      .jf-tech.jf-dark-m .text-blue-400 { color: #93c5fd; }
      .jf-tech.jf-dark-m .text-blue-500 { color: #93c5fd; }
      .jf-tech.jf-dark-m .text-blue-600 { color: #93c5fd; }
      .jf-tech.jf-dark-m .text-blue-700 { color: #93c5fd; }
      .jf-tech.jf-dark-m .text-blue-800 { color: #93c5fd; }
      .jf-tech.jf-dark-m .text-blue-900 { color: #93c5fd; }
      .jf-tech.jf-dark-m .hover\\:text-blue-600:hover, .jf-tech.jf-dark-m .hover\\:text-blue-700:hover, .jf-tech.jf-dark-m .hover\\:text-blue-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-blue-50"], .jf-tech.jf-dark-m [class~="to-blue-50"], .jf-tech.jf-dark-m [class~="from-blue-100"], .jf-tech.jf-dark-m [class~="to-blue-100"] { --tw-gradient-from: rgba(59,130,246,.14) !important; --tw-gradient-to: rgba(59,130,246,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-sky-50 { background-color: rgba(14,165,233,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-sky-50:hover { background-color: rgba(14,165,233,0.18); }
      .jf-tech.jf-dark-m .bg-sky-100 { background-color: rgba(14,165,233,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-sky-100:hover { background-color: rgba(14,165,233,0.24); }
      .jf-tech.jf-dark-m .bg-sky-200 { background-color: rgba(14,165,233,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-sky-200:hover { background-color: rgba(14,165,233,0.32); }
      .jf-tech.jf-dark-m .border-sky-100 { border-color: rgba(14,165,233,.32); }
      .jf-tech.jf-dark-m .border-sky-200 { border-color: rgba(14,165,233,.32); }
      .jf-tech.jf-dark-m .border-sky-300 { border-color: rgba(14,165,233,.32); }
      .jf-tech.jf-dark-m .text-sky-400 { color: #7dd3fc; }
      .jf-tech.jf-dark-m .text-sky-500 { color: #7dd3fc; }
      .jf-tech.jf-dark-m .text-sky-600 { color: #7dd3fc; }
      .jf-tech.jf-dark-m .text-sky-700 { color: #7dd3fc; }
      .jf-tech.jf-dark-m .text-sky-800 { color: #7dd3fc; }
      .jf-tech.jf-dark-m .text-sky-900 { color: #7dd3fc; }
      .jf-tech.jf-dark-m .hover\\:text-sky-600:hover, .jf-tech.jf-dark-m .hover\\:text-sky-700:hover, .jf-tech.jf-dark-m .hover\\:text-sky-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-sky-50"], .jf-tech.jf-dark-m [class~="to-sky-50"], .jf-tech.jf-dark-m [class~="from-sky-100"], .jf-tech.jf-dark-m [class~="to-sky-100"] { --tw-gradient-from: rgba(14,165,233,.14) !important; --tw-gradient-to: rgba(14,165,233,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-cyan-50 { background-color: rgba(6,182,212,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-cyan-50:hover { background-color: rgba(6,182,212,0.18); }
      .jf-tech.jf-dark-m .bg-cyan-100 { background-color: rgba(6,182,212,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-cyan-100:hover { background-color: rgba(6,182,212,0.24); }
      .jf-tech.jf-dark-m .bg-cyan-200 { background-color: rgba(6,182,212,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-cyan-200:hover { background-color: rgba(6,182,212,0.32); }
      .jf-tech.jf-dark-m .border-cyan-100 { border-color: rgba(6,182,212,.32); }
      .jf-tech.jf-dark-m .border-cyan-200 { border-color: rgba(6,182,212,.32); }
      .jf-tech.jf-dark-m .border-cyan-300 { border-color: rgba(6,182,212,.32); }
      .jf-tech.jf-dark-m .text-cyan-400 { color: #67e8f9; }
      .jf-tech.jf-dark-m .text-cyan-500 { color: #67e8f9; }
      .jf-tech.jf-dark-m .text-cyan-600 { color: #67e8f9; }
      .jf-tech.jf-dark-m .text-cyan-700 { color: #67e8f9; }
      .jf-tech.jf-dark-m .text-cyan-800 { color: #67e8f9; }
      .jf-tech.jf-dark-m .text-cyan-900 { color: #67e8f9; }
      .jf-tech.jf-dark-m .hover\\:text-cyan-600:hover, .jf-tech.jf-dark-m .hover\\:text-cyan-700:hover, .jf-tech.jf-dark-m .hover\\:text-cyan-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-cyan-50"], .jf-tech.jf-dark-m [class~="to-cyan-50"], .jf-tech.jf-dark-m [class~="from-cyan-100"], .jf-tech.jf-dark-m [class~="to-cyan-100"] { --tw-gradient-from: rgba(6,182,212,.14) !important; --tw-gradient-to: rgba(6,182,212,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-teal-50 { background-color: rgba(20,184,166,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-teal-50:hover { background-color: rgba(20,184,166,0.18); }
      .jf-tech.jf-dark-m .bg-teal-100 { background-color: rgba(20,184,166,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-teal-100:hover { background-color: rgba(20,184,166,0.24); }
      .jf-tech.jf-dark-m .bg-teal-200 { background-color: rgba(20,184,166,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-teal-200:hover { background-color: rgba(20,184,166,0.32); }
      .jf-tech.jf-dark-m .border-teal-100 { border-color: rgba(20,184,166,.32); }
      .jf-tech.jf-dark-m .border-teal-200 { border-color: rgba(20,184,166,.32); }
      .jf-tech.jf-dark-m .border-teal-300 { border-color: rgba(20,184,166,.32); }
      .jf-tech.jf-dark-m .text-teal-400 { color: #5eead4; }
      .jf-tech.jf-dark-m .text-teal-500 { color: #5eead4; }
      .jf-tech.jf-dark-m .text-teal-600 { color: #5eead4; }
      .jf-tech.jf-dark-m .text-teal-700 { color: #5eead4; }
      .jf-tech.jf-dark-m .text-teal-800 { color: #5eead4; }
      .jf-tech.jf-dark-m .text-teal-900 { color: #5eead4; }
      .jf-tech.jf-dark-m .hover\\:text-teal-600:hover, .jf-tech.jf-dark-m .hover\\:text-teal-700:hover, .jf-tech.jf-dark-m .hover\\:text-teal-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-teal-50"], .jf-tech.jf-dark-m [class~="to-teal-50"], .jf-tech.jf-dark-m [class~="from-teal-100"], .jf-tech.jf-dark-m [class~="to-teal-100"] { --tw-gradient-from: rgba(20,184,166,.14) !important; --tw-gradient-to: rgba(20,184,166,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-emerald-50 { background-color: rgba(16,185,129,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-emerald-50:hover { background-color: rgba(16,185,129,0.18); }
      .jf-tech.jf-dark-m .bg-emerald-100 { background-color: rgba(16,185,129,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-emerald-100:hover { background-color: rgba(16,185,129,0.24); }
      .jf-tech.jf-dark-m .bg-emerald-200 { background-color: rgba(16,185,129,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-emerald-200:hover { background-color: rgba(16,185,129,0.32); }
      .jf-tech.jf-dark-m .border-emerald-100 { border-color: rgba(16,185,129,.32); }
      .jf-tech.jf-dark-m .border-emerald-200 { border-color: rgba(16,185,129,.32); }
      .jf-tech.jf-dark-m .border-emerald-300 { border-color: rgba(16,185,129,.32); }
      .jf-tech.jf-dark-m .text-emerald-400 { color: #6ee7b7; }
      .jf-tech.jf-dark-m .text-emerald-500 { color: #6ee7b7; }
      .jf-tech.jf-dark-m .text-emerald-600 { color: #6ee7b7; }
      .jf-tech.jf-dark-m .text-emerald-700 { color: #6ee7b7; }
      .jf-tech.jf-dark-m .text-emerald-800 { color: #6ee7b7; }
      .jf-tech.jf-dark-m .text-emerald-900 { color: #6ee7b7; }
      .jf-tech.jf-dark-m .hover\\:text-emerald-600:hover, .jf-tech.jf-dark-m .hover\\:text-emerald-700:hover, .jf-tech.jf-dark-m .hover\\:text-emerald-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-emerald-50"], .jf-tech.jf-dark-m [class~="to-emerald-50"], .jf-tech.jf-dark-m [class~="from-emerald-100"], .jf-tech.jf-dark-m [class~="to-emerald-100"] { --tw-gradient-from: rgba(16,185,129,.14) !important; --tw-gradient-to: rgba(16,185,129,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-green-50 { background-color: rgba(34,197,94,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-green-50:hover { background-color: rgba(34,197,94,0.18); }
      .jf-tech.jf-dark-m .bg-green-100 { background-color: rgba(34,197,94,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-green-100:hover { background-color: rgba(34,197,94,0.24); }
      .jf-tech.jf-dark-m .bg-green-200 { background-color: rgba(34,197,94,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-green-200:hover { background-color: rgba(34,197,94,0.32); }
      .jf-tech.jf-dark-m .border-green-100 { border-color: rgba(34,197,94,.32); }
      .jf-tech.jf-dark-m .border-green-200 { border-color: rgba(34,197,94,.32); }
      .jf-tech.jf-dark-m .border-green-300 { border-color: rgba(34,197,94,.32); }
      .jf-tech.jf-dark-m .text-green-400 { color: #86efac; }
      .jf-tech.jf-dark-m .text-green-500 { color: #86efac; }
      .jf-tech.jf-dark-m .text-green-600 { color: #86efac; }
      .jf-tech.jf-dark-m .text-green-700 { color: #86efac; }
      .jf-tech.jf-dark-m .text-green-800 { color: #86efac; }
      .jf-tech.jf-dark-m .text-green-900 { color: #86efac; }
      .jf-tech.jf-dark-m .hover\\:text-green-600:hover, .jf-tech.jf-dark-m .hover\\:text-green-700:hover, .jf-tech.jf-dark-m .hover\\:text-green-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-green-50"], .jf-tech.jf-dark-m [class~="to-green-50"], .jf-tech.jf-dark-m [class~="from-green-100"], .jf-tech.jf-dark-m [class~="to-green-100"] { --tw-gradient-from: rgba(34,197,94,.14) !important; --tw-gradient-to: rgba(34,197,94,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-lime-50 { background-color: rgba(132,204,22,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-lime-50:hover { background-color: rgba(132,204,22,0.18); }
      .jf-tech.jf-dark-m .bg-lime-100 { background-color: rgba(132,204,22,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-lime-100:hover { background-color: rgba(132,204,22,0.24); }
      .jf-tech.jf-dark-m .bg-lime-200 { background-color: rgba(132,204,22,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-lime-200:hover { background-color: rgba(132,204,22,0.32); }
      .jf-tech.jf-dark-m .border-lime-100 { border-color: rgba(132,204,22,.32); }
      .jf-tech.jf-dark-m .border-lime-200 { border-color: rgba(132,204,22,.32); }
      .jf-tech.jf-dark-m .border-lime-300 { border-color: rgba(132,204,22,.32); }
      .jf-tech.jf-dark-m .text-lime-400 { color: #bef264; }
      .jf-tech.jf-dark-m .text-lime-500 { color: #bef264; }
      .jf-tech.jf-dark-m .text-lime-600 { color: #bef264; }
      .jf-tech.jf-dark-m .text-lime-700 { color: #bef264; }
      .jf-tech.jf-dark-m .text-lime-800 { color: #bef264; }
      .jf-tech.jf-dark-m .text-lime-900 { color: #bef264; }
      .jf-tech.jf-dark-m .hover\\:text-lime-600:hover, .jf-tech.jf-dark-m .hover\\:text-lime-700:hover, .jf-tech.jf-dark-m .hover\\:text-lime-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-lime-50"], .jf-tech.jf-dark-m [class~="to-lime-50"], .jf-tech.jf-dark-m [class~="from-lime-100"], .jf-tech.jf-dark-m [class~="to-lime-100"] { --tw-gradient-from: rgba(132,204,22,.14) !important; --tw-gradient-to: rgba(132,204,22,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-yellow-50 { background-color: rgba(234,179,8,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-yellow-50:hover { background-color: rgba(234,179,8,0.18); }
      .jf-tech.jf-dark-m .bg-yellow-100 { background-color: rgba(234,179,8,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-yellow-100:hover { background-color: rgba(234,179,8,0.24); }
      .jf-tech.jf-dark-m .bg-yellow-200 { background-color: rgba(234,179,8,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-yellow-200:hover { background-color: rgba(234,179,8,0.32); }
      .jf-tech.jf-dark-m .border-yellow-100 { border-color: rgba(234,179,8,.32); }
      .jf-tech.jf-dark-m .border-yellow-200 { border-color: rgba(234,179,8,.32); }
      .jf-tech.jf-dark-m .border-yellow-300 { border-color: rgba(234,179,8,.32); }
      .jf-tech.jf-dark-m .text-yellow-400 { color: #fde047; }
      .jf-tech.jf-dark-m .text-yellow-500 { color: #fde047; }
      .jf-tech.jf-dark-m .text-yellow-600 { color: #fde047; }
      .jf-tech.jf-dark-m .text-yellow-700 { color: #fde047; }
      .jf-tech.jf-dark-m .text-yellow-800 { color: #fde047; }
      .jf-tech.jf-dark-m .text-yellow-900 { color: #fde047; }
      .jf-tech.jf-dark-m .hover\\:text-yellow-600:hover, .jf-tech.jf-dark-m .hover\\:text-yellow-700:hover, .jf-tech.jf-dark-m .hover\\:text-yellow-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-yellow-50"], .jf-tech.jf-dark-m [class~="to-yellow-50"], .jf-tech.jf-dark-m [class~="from-yellow-100"], .jf-tech.jf-dark-m [class~="to-yellow-100"] { --tw-gradient-from: rgba(234,179,8,.14) !important; --tw-gradient-to: rgba(234,179,8,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-amber-50 { background-color: rgba(245,158,11,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-amber-50:hover { background-color: rgba(245,158,11,0.18); }
      .jf-tech.jf-dark-m .bg-amber-100 { background-color: rgba(245,158,11,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-amber-100:hover { background-color: rgba(245,158,11,0.24); }
      .jf-tech.jf-dark-m .bg-amber-200 { background-color: rgba(245,158,11,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-amber-200:hover { background-color: rgba(245,158,11,0.32); }
      .jf-tech.jf-dark-m .border-amber-100 { border-color: rgba(245,158,11,.32); }
      .jf-tech.jf-dark-m .border-amber-200 { border-color: rgba(245,158,11,.32); }
      .jf-tech.jf-dark-m .border-amber-300 { border-color: rgba(245,158,11,.32); }
      .jf-tech.jf-dark-m .text-amber-400 { color: #fcd34d; }
      .jf-tech.jf-dark-m .text-amber-500 { color: #fcd34d; }
      .jf-tech.jf-dark-m .text-amber-600 { color: #fcd34d; }
      .jf-tech.jf-dark-m .text-amber-700 { color: #fcd34d; }
      .jf-tech.jf-dark-m .text-amber-800 { color: #fcd34d; }
      .jf-tech.jf-dark-m .text-amber-900 { color: #fcd34d; }
      .jf-tech.jf-dark-m .hover\\:text-amber-600:hover, .jf-tech.jf-dark-m .hover\\:text-amber-700:hover, .jf-tech.jf-dark-m .hover\\:text-amber-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-amber-50"], .jf-tech.jf-dark-m [class~="to-amber-50"], .jf-tech.jf-dark-m [class~="from-amber-100"], .jf-tech.jf-dark-m [class~="to-amber-100"] { --tw-gradient-from: rgba(245,158,11,.14) !important; --tw-gradient-to: rgba(245,158,11,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-orange-50 { background-color: rgba(249,115,22,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-orange-50:hover { background-color: rgba(249,115,22,0.18); }
      .jf-tech.jf-dark-m .bg-orange-100 { background-color: rgba(249,115,22,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-orange-100:hover { background-color: rgba(249,115,22,0.24); }
      .jf-tech.jf-dark-m .bg-orange-200 { background-color: rgba(249,115,22,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-orange-200:hover { background-color: rgba(249,115,22,0.32); }
      .jf-tech.jf-dark-m .border-orange-100 { border-color: rgba(249,115,22,.32); }
      .jf-tech.jf-dark-m .border-orange-200 { border-color: rgba(249,115,22,.32); }
      .jf-tech.jf-dark-m .border-orange-300 { border-color: rgba(249,115,22,.32); }
      .jf-tech.jf-dark-m .text-orange-400 { color: #fdba74; }
      .jf-tech.jf-dark-m .text-orange-500 { color: #fdba74; }
      .jf-tech.jf-dark-m .text-orange-600 { color: #fdba74; }
      .jf-tech.jf-dark-m .text-orange-700 { color: #fdba74; }
      .jf-tech.jf-dark-m .text-orange-800 { color: #fdba74; }
      .jf-tech.jf-dark-m .text-orange-900 { color: #fdba74; }
      .jf-tech.jf-dark-m .hover\\:text-orange-600:hover, .jf-tech.jf-dark-m .hover\\:text-orange-700:hover, .jf-tech.jf-dark-m .hover\\:text-orange-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-orange-50"], .jf-tech.jf-dark-m [class~="to-orange-50"], .jf-tech.jf-dark-m [class~="from-orange-100"], .jf-tech.jf-dark-m [class~="to-orange-100"] { --tw-gradient-from: rgba(249,115,22,.14) !important; --tw-gradient-to: rgba(249,115,22,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-red-50 { background-color: rgba(239,68,68,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-red-50:hover { background-color: rgba(239,68,68,0.18); }
      .jf-tech.jf-dark-m .bg-red-100 { background-color: rgba(239,68,68,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-red-100:hover { background-color: rgba(239,68,68,0.24); }
      .jf-tech.jf-dark-m .bg-red-200 { background-color: rgba(239,68,68,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-red-200:hover { background-color: rgba(239,68,68,0.32); }
      .jf-tech.jf-dark-m .border-red-100 { border-color: rgba(239,68,68,.32); }
      .jf-tech.jf-dark-m .border-red-200 { border-color: rgba(239,68,68,.32); }
      .jf-tech.jf-dark-m .border-red-300 { border-color: rgba(239,68,68,.32); }
      .jf-tech.jf-dark-m .text-red-400 { color: #fca5a5; }
      .jf-tech.jf-dark-m .text-red-500 { color: #fca5a5; }
      .jf-tech.jf-dark-m .text-red-600 { color: #fca5a5; }
      .jf-tech.jf-dark-m .text-red-700 { color: #fca5a5; }
      .jf-tech.jf-dark-m .text-red-800 { color: #fca5a5; }
      .jf-tech.jf-dark-m .text-red-900 { color: #fca5a5; }
      .jf-tech.jf-dark-m .hover\\:text-red-600:hover, .jf-tech.jf-dark-m .hover\\:text-red-700:hover, .jf-tech.jf-dark-m .hover\\:text-red-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-red-50"], .jf-tech.jf-dark-m [class~="to-red-50"], .jf-tech.jf-dark-m [class~="from-red-100"], .jf-tech.jf-dark-m [class~="to-red-100"] { --tw-gradient-from: rgba(239,68,68,.14) !important; --tw-gradient-to: rgba(239,68,68,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-rose-50 { background-color: rgba(244,63,94,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-rose-50:hover { background-color: rgba(244,63,94,0.18); }
      .jf-tech.jf-dark-m .bg-rose-100 { background-color: rgba(244,63,94,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-rose-100:hover { background-color: rgba(244,63,94,0.24); }
      .jf-tech.jf-dark-m .bg-rose-200 { background-color: rgba(244,63,94,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-rose-200:hover { background-color: rgba(244,63,94,0.32); }
      .jf-tech.jf-dark-m .border-rose-100 { border-color: rgba(244,63,94,.32); }
      .jf-tech.jf-dark-m .border-rose-200 { border-color: rgba(244,63,94,.32); }
      .jf-tech.jf-dark-m .border-rose-300 { border-color: rgba(244,63,94,.32); }
      .jf-tech.jf-dark-m .text-rose-400 { color: #fda4af; }
      .jf-tech.jf-dark-m .text-rose-500 { color: #fda4af; }
      .jf-tech.jf-dark-m .text-rose-600 { color: #fda4af; }
      .jf-tech.jf-dark-m .text-rose-700 { color: #fda4af; }
      .jf-tech.jf-dark-m .text-rose-800 { color: #fda4af; }
      .jf-tech.jf-dark-m .text-rose-900 { color: #fda4af; }
      .jf-tech.jf-dark-m .hover\\:text-rose-600:hover, .jf-tech.jf-dark-m .hover\\:text-rose-700:hover, .jf-tech.jf-dark-m .hover\\:text-rose-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-rose-50"], .jf-tech.jf-dark-m [class~="to-rose-50"], .jf-tech.jf-dark-m [class~="from-rose-100"], .jf-tech.jf-dark-m [class~="to-rose-100"] { --tw-gradient-from: rgba(244,63,94,.14) !important; --tw-gradient-to: rgba(244,63,94,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-pink-50 { background-color: rgba(236,72,153,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-pink-50:hover { background-color: rgba(236,72,153,0.18); }
      .jf-tech.jf-dark-m .bg-pink-100 { background-color: rgba(236,72,153,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-pink-100:hover { background-color: rgba(236,72,153,0.24); }
      .jf-tech.jf-dark-m .bg-pink-200 { background-color: rgba(236,72,153,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-pink-200:hover { background-color: rgba(236,72,153,0.32); }
      .jf-tech.jf-dark-m .border-pink-100 { border-color: rgba(236,72,153,.32); }
      .jf-tech.jf-dark-m .border-pink-200 { border-color: rgba(236,72,153,.32); }
      .jf-tech.jf-dark-m .border-pink-300 { border-color: rgba(236,72,153,.32); }
      .jf-tech.jf-dark-m .text-pink-400 { color: #f9a8d4; }
      .jf-tech.jf-dark-m .text-pink-500 { color: #f9a8d4; }
      .jf-tech.jf-dark-m .text-pink-600 { color: #f9a8d4; }
      .jf-tech.jf-dark-m .text-pink-700 { color: #f9a8d4; }
      .jf-tech.jf-dark-m .text-pink-800 { color: #f9a8d4; }
      .jf-tech.jf-dark-m .text-pink-900 { color: #f9a8d4; }
      .jf-tech.jf-dark-m .hover\\:text-pink-600:hover, .jf-tech.jf-dark-m .hover\\:text-pink-700:hover, .jf-tech.jf-dark-m .hover\\:text-pink-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-pink-50"], .jf-tech.jf-dark-m [class~="to-pink-50"], .jf-tech.jf-dark-m [class~="from-pink-100"], .jf-tech.jf-dark-m [class~="to-pink-100"] { --tw-gradient-from: rgba(236,72,153,.14) !important; --tw-gradient-to: rgba(236,72,153,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-fuchsia-50 { background-color: rgba(217,70,239,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-fuchsia-50:hover { background-color: rgba(217,70,239,0.18); }
      .jf-tech.jf-dark-m .bg-fuchsia-100 { background-color: rgba(217,70,239,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-fuchsia-100:hover { background-color: rgba(217,70,239,0.24); }
      .jf-tech.jf-dark-m .bg-fuchsia-200 { background-color: rgba(217,70,239,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-fuchsia-200:hover { background-color: rgba(217,70,239,0.32); }
      .jf-tech.jf-dark-m .border-fuchsia-100 { border-color: rgba(217,70,239,.32); }
      .jf-tech.jf-dark-m .border-fuchsia-200 { border-color: rgba(217,70,239,.32); }
      .jf-tech.jf-dark-m .border-fuchsia-300 { border-color: rgba(217,70,239,.32); }
      .jf-tech.jf-dark-m .text-fuchsia-400 { color: #f0abfc; }
      .jf-tech.jf-dark-m .text-fuchsia-500 { color: #f0abfc; }
      .jf-tech.jf-dark-m .text-fuchsia-600 { color: #f0abfc; }
      .jf-tech.jf-dark-m .text-fuchsia-700 { color: #f0abfc; }
      .jf-tech.jf-dark-m .text-fuchsia-800 { color: #f0abfc; }
      .jf-tech.jf-dark-m .text-fuchsia-900 { color: #f0abfc; }
      .jf-tech.jf-dark-m .hover\\:text-fuchsia-600:hover, .jf-tech.jf-dark-m .hover\\:text-fuchsia-700:hover, .jf-tech.jf-dark-m .hover\\:text-fuchsia-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-fuchsia-50"], .jf-tech.jf-dark-m [class~="to-fuchsia-50"], .jf-tech.jf-dark-m [class~="from-fuchsia-100"], .jf-tech.jf-dark-m [class~="to-fuchsia-100"] { --tw-gradient-from: rgba(217,70,239,.14) !important; --tw-gradient-to: rgba(217,70,239,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-purple-50 { background-color: rgba(168,85,247,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-purple-50:hover { background-color: rgba(168,85,247,0.18); }
      .jf-tech.jf-dark-m .bg-purple-100 { background-color: rgba(168,85,247,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-purple-100:hover { background-color: rgba(168,85,247,0.24); }
      .jf-tech.jf-dark-m .bg-purple-200 { background-color: rgba(168,85,247,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-purple-200:hover { background-color: rgba(168,85,247,0.32); }
      .jf-tech.jf-dark-m .border-purple-100 { border-color: rgba(168,85,247,.32); }
      .jf-tech.jf-dark-m .border-purple-200 { border-color: rgba(168,85,247,.32); }
      .jf-tech.jf-dark-m .border-purple-300 { border-color: rgba(168,85,247,.32); }
      .jf-tech.jf-dark-m .text-purple-400 { color: #d8b4fe; }
      .jf-tech.jf-dark-m .text-purple-500 { color: #d8b4fe; }
      .jf-tech.jf-dark-m .text-purple-600 { color: #d8b4fe; }
      .jf-tech.jf-dark-m .text-purple-700 { color: #d8b4fe; }
      .jf-tech.jf-dark-m .text-purple-800 { color: #d8b4fe; }
      .jf-tech.jf-dark-m .text-purple-900 { color: #d8b4fe; }
      .jf-tech.jf-dark-m .hover\\:text-purple-600:hover, .jf-tech.jf-dark-m .hover\\:text-purple-700:hover, .jf-tech.jf-dark-m .hover\\:text-purple-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-purple-50"], .jf-tech.jf-dark-m [class~="to-purple-50"], .jf-tech.jf-dark-m [class~="from-purple-100"], .jf-tech.jf-dark-m [class~="to-purple-100"] { --tw-gradient-from: rgba(168,85,247,.14) !important; --tw-gradient-to: rgba(168,85,247,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-violet-50 { background-color: rgba(139,92,246,.10); }
      .jf-tech.jf-dark-m .hover\\:bg-violet-50:hover { background-color: rgba(139,92,246,0.18); }
      .jf-tech.jf-dark-m .bg-violet-100 { background-color: rgba(139,92,246,.16); }
      .jf-tech.jf-dark-m .hover\\:bg-violet-100:hover { background-color: rgba(139,92,246,0.24); }
      .jf-tech.jf-dark-m .bg-violet-200 { background-color: rgba(139,92,246,.24); }
      .jf-tech.jf-dark-m .hover\\:bg-violet-200:hover { background-color: rgba(139,92,246,0.32); }
      .jf-tech.jf-dark-m .border-violet-100 { border-color: rgba(139,92,246,.32); }
      .jf-tech.jf-dark-m .border-violet-200 { border-color: rgba(139,92,246,.32); }
      .jf-tech.jf-dark-m .border-violet-300 { border-color: rgba(139,92,246,.32); }
      .jf-tech.jf-dark-m .text-violet-400 { color: #c4b5fd; }
      .jf-tech.jf-dark-m .text-violet-500 { color: #c4b5fd; }
      .jf-tech.jf-dark-m .text-violet-600 { color: #c4b5fd; }
      .jf-tech.jf-dark-m .text-violet-700 { color: #c4b5fd; }
      .jf-tech.jf-dark-m .text-violet-800 { color: #c4b5fd; }
      .jf-tech.jf-dark-m .text-violet-900 { color: #c4b5fd; }
      .jf-tech.jf-dark-m .hover\\:text-violet-600:hover, .jf-tech.jf-dark-m .hover\\:text-violet-700:hover, .jf-tech.jf-dark-m .hover\\:text-violet-500:hover { color: #ffffff; }
      .jf-tech.jf-dark-m [class~="from-violet-50"], .jf-tech.jf-dark-m [class~="to-violet-50"], .jf-tech.jf-dark-m [class~="from-violet-100"], .jf-tech.jf-dark-m [class~="to-violet-100"] { --tw-gradient-from: rgba(139,92,246,.14) !important; --tw-gradient-to: rgba(139,92,246,.05) !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m [class~="from-white"], .jf-tech.jf-dark-m [class~="to-white"], .jf-tech.jf-dark-m [class~="from-gray-50"], .jf-tech.jf-dark-m [class~="to-gray-50"] { --tw-gradient-from: #121829 !important; --tw-gradient-to: #0d1220 !important; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to) !important; }
      .jf-tech.jf-dark-m .bg-white.text-gray-900, .jf-tech.jf-dark-m .bg-white.text-black { background-color: #ffffff; color: #111827; }
      .jf-tech.jf-dark-m .bg-indigo-600, .jf-tech.jf-dark-m .bg-indigo-500 { background-color: #4f6df5; }
      .jf-tech.jf-dark-m .hover\\:bg-indigo-700:hover, .jf-tech.jf-dark-m .hover\\:bg-indigo-600:hover { background-color: #3f58e0; }
      .jf-tech.jf-dark-m .border-indigo-500, .jf-tech.jf-dark-m .border-t-indigo-500, .jf-tech.jf-dark-m .border-indigo-200 { border-color: #6d7cf7; }
      .jf-tech.jf-dark-m .text-indigo-600, .jf-tech.jf-dark-m .text-indigo-700, .jf-tech.jf-dark-m .text-indigo-500 { color: #a5b4fc; }
      .jf-tech.jf-dark-m .bg-indigo-50, .jf-tech.jf-dark-m .bg-indigo-100 { background-color: rgba(99,102,241,.16); }
      .jf-tech.jf-dark-m input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]):not([type="color"]):not(.bg-transparent), .jf-tech.jf-dark-m select:not(.bg-transparent), .jf-tech.jf-dark-m textarea:not(.bg-transparent) { background-color: rgba(255,255,255,.09); color: #eef1fa; border: 1px solid rgba(255,255,255,.22); color-scheme: dark; }
      .jf-tech.jf-dark-m input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]):not([type="color"]), .jf-tech.jf-dark-m select, .jf-tech.jf-dark-m textarea { font-size: 16px; }
      .jf-tech.jf-dark-m input[type="date"], .jf-tech.jf-dark-m input[type="month"], .jf-tech.jf-dark-m input[type="time"], .jf-tech.jf-dark-m input[type="datetime-local"] { display: block; width: 100%; min-width: 0; max-width: 100%; box-sizing: border-box; -webkit-appearance: none; appearance: none; min-height: 44px; text-align: left; }
      .jf-tech.jf-dark-m select { min-width: 0; max-width: 100%; min-height: 42px; text-overflow: ellipsis; }
      .jf-tech.jf-dark-m .grid > * { min-width: 0; }
      .jf-tech.jf-dark-m label { overflow-wrap: anywhere; }
      .jf-tech.jf-dark-m option { color: #eef1fa; }
      .jf-tech.jf-dark-m input::placeholder, .jf-tech.jf-dark-m textarea::placeholder { color: #62708f; }
      .jf-tech.jf-dark-m option { background-color: #0d1220; color: #eef1fa; }
      .jf-tech.jf-dark-m input:focus, .jf-tech.jf-dark-m select:focus, .jf-tech.jf-dark-m textarea:focus { border-color: #6d8bff; box-shadow: 0 0 0 3px rgba(109,139,255,.18); }
      .jf-tech.jf-dark-m input[type="checkbox"], .jf-tech.jf-dark-m input[type="radio"] { color-scheme: dark; accent-color: #5b7cff; }
      .jf-tech.jf-dark-m .recharts-cartesian-grid line { stroke: rgba(255,255,255,.08); }
      .jf-tech.jf-dark-m .recharts-cartesian-axis-tick-value, .jf-tech.jf-dark-m .recharts-polar-angle-axis-tick-value { fill: #8d98b5; }
      .jf-tech.jf-dark-m .recharts-default-tooltip { background-color: #0d1220 !important; border: 1px solid rgba(255,255,255,.14) !important; border-radius: 12px !important; }
      .jf-tech.jf-dark-m .recharts-tooltip-label, .jf-tech.jf-dark-m .recharts-tooltip-item { color: #e6eaf5 !important; }
      .jf-tech.jf-dark-m .recharts-legend-item-text { color: #b3bcd4 !important; }
      .jf-tech.jf-dark-m .recharts-tooltip-cursor { fill: rgba(255,255,255,.05); }
      .jf-tech.jf-dark-m ::-webkit-scrollbar { width: 0; height: 0; }
    }
  `}</style>
);

const DailyNudge = ({ loggedInUser, activities, onGo }) => {
  const [msg, setMsg] = useState(null);
  const [ready, setReady] = useState(false);
  const prevRef = useRef(null);
  const today = getTodayDate();
  const pts = useMemo(() => pointsOnDate(activities, loggedInUser?.id, today), [activities, loggedInUser?.id, today]);

  useEffect(() => { const t = setTimeout(() => setReady(true), 2500); return () => clearTimeout(t); }, []);

  useEffect(() => {
    if (!ready || !loggedInUser) return;
    const prev = prevRef.current;
    prevRef.current = pts;
    const doneKey = `jf_nudge_done_${loggedInUser.id}_${today}`;
    const openKey = `jf_nudge_open_${loggedInUser.id}_${today}`;
    let doneSeen = false, openSeen = false;
    try { doneSeen = !!localStorage.getItem(doneKey); openSeen = !!sessionStorage.getItem(openKey); } catch (e) {}
    if (pts >= DAILY_TARGET) {
      if (!doneSeen) {
        try { localStorage.setItem(doneKey, '1'); } catch (e) {}
        setMsg({ kind: 'done', title: '今日達標 🎉', text: fillNudge(pickRandom(NUDGE_DONE), { pts, name: loggedInUser.name }) });
      }
    } else if (prev === null && !openSeen) {
      try { sessionStorage.setItem(openKey, '1'); } catch (e) {}
      const n = DAILY_TARGET - pts;
      if (pts === 0) setMsg({ kind: 'none', title: '今天還沒開始', text: fillNudge(pickRandom(NUDGE_NONE), {}) });
      else setMsg({ kind: 'low', title: `再 ${n} 分達標`, text: fillNudge(pickRandom(NUDGE_LOW), { pts, n }) });
    }
  }, [ready, pts, loggedInUser, today]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 11000);
    return () => clearTimeout(t);
  }, [msg]);

  if (!msg) return null;
  const done = msg.kind === 'done';
  return (
    <div className="fixed left-3 right-3 md:left-auto md:right-6 md:w-96 z-[130]" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
      <div className="jf-nudge-in relative overflow-hidden rounded-3xl bg-black/90 backdrop-blur-2xl border border-white/10 text-white p-5 shadow-2xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl" style={{ background: done ? 'rgba(52,211,153,.35)' : msg.kind === 'low' ? 'rgba(251,191,36,.28)' : 'rgba(99,102,241,.3)' }}></div>
        <button onClick={() => setMsg(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/60"><X size={16} /></button>
        <p className="relative text-[11px] tracking-[0.2em] text-white/50 font-semibold">{done ? 'DAILY GOAL' : 'TODAY'}</p>
        <p className="relative text-xl font-bold mt-1 pr-8">{msg.title}</p>
        <p className="relative text-sm text-white/75 mt-2 leading-relaxed">{msg.text}</p>
        {!done && <button onClick={() => { setMsg(null); onGo && onGo('activity'); }} className="relative mt-4 w-full bg-white text-black font-bold text-sm py-2.5 rounded-xl active:scale-[0.98] transition">去填今天的活動量</button>}
      </div>
    </div>
  );
};

const DailyActivityHero = ({ loggedInUser, activities, team, onGo }) => {
  const today = getTodayDate();
  const pts = pointsOnDate(activities, loggedInUser.id, today);
  const pct = Math.min(1, pts / DAILY_TARGET);
  const done = pts >= DAILY_TARGET;
  const streak = useMemo(() => streakDays(activities, loggedInUser.id, today), [activities, loggedInUser.id, today]);
  const wkStart = weekStartOf(today);
  const week = Array.from({ length: 7 }, (_, i) => { const d = dateAdd(wkStart, i); return { d, p: pointsOnDate(activities, loggedInUser.id, d), isToday: d === today, future: d > today }; });
  const wkTotal = week.reduce((s, x) => s + x.p, 0);
  const todayRecords = (activities || []).filter(a => a.agentId === loggedInUser.id && a.date === today);
  const breakdown = ACT_SCORE_KEYS.map(k => ({ k, label: ALL_ACTIVITY_WEIGHTS[k].label, v: todayRecords.reduce((s, a) => s + (Number(a[k]) || 0), 0) })).filter(x => x.v > 0).slice(0, 6);
  const teamStats = useMemo(() => {
    const ids = (team || []).map(m => String(m.id));
    const total = (activities || []).filter(a => a.date === today && ids.includes(String(a.agentId))).reduce((s, a) => s + scoreOfActivity(a), 0);
    const reached = (team || []).filter(m => pointsOnDate(activities, m.id, today) >= DAILY_TARGET).length;
    return { total, reached, n: (team || []).length };
  }, [activities, team, today]);
  const R = 54, C = 2 * Math.PI * R;
  const weekdayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const hour = new Date().getHours();
  const greet = hour < 11 ? '早安' : hour < 18 ? '午安' : '晚安';

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#09090c] text-white p-5 sm:p-7 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <div className="absolute inset-0 jf-grid-bg opacity-60 pointer-events-none"></div>
      <div className="absolute -top-24 -left-16 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: done ? 'rgba(52,211,153,.22)' : 'rgba(99,102,241,.22)' }}></div>
      <div className="absolute -bottom-28 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(168,85,247,.16)' }}></div>
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] tracking-[0.22em] text-white/45 font-semibold">{today.replace(/-/g, '.')} · 週{weekdayNames[dayOfWeek(today)]}</p>
            <h2 className="text-2xl sm:text-3xl font-semibold mt-1">{greet}，{loggedInUser.name}</h2>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 border border-white/10 rounded-full px-3 py-1.5 text-xs font-semibold shrink-0">
            <span className={streak > 0 ? 'text-amber-300' : 'text-white/40'}>🔥</span>連續 {streak} 天
          </div>
        </div>

        <div className="mt-6 flex items-center gap-6 sm:gap-10">
          <div className={`relative w-36 h-36 sm:w-40 sm:h-40 shrink-0 ${done ? 'jf-ring-done' : ''}`}>
            <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90">
              <defs>
                <linearGradient id="jfRingGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={done ? '#34d399' : '#818cf8'} />
                  <stop offset="100%" stopColor={done ? '#a7f3d0' : '#c084fc'} />
                </linearGradient>
              </defs>
              <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="9" />
              <circle cx="64" cy="64" r={R} fill="none" stroke="url(#jfRingGrad)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} style={{ transition: 'stroke-dasharray .8s cubic-bezier(.2,.8,.2,1)' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-semibold leading-none tabular-nums">{pts}</span>
              <span className="text-xs text-white/50 mt-1">/ {DAILY_TARGET} 分</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg sm:text-xl font-semibold">{done ? '今天達標了' : `再 ${DAILY_TARGET - pts} 分，今天達標`}</p>
            <p className="text-sm text-white/50 mt-1">{done ? '保持這個節奏，結果會自己來。' : pts === 0 ? '還沒有紀錄，先記下第一筆。' : '已經在路上了，再推一把。'}</p>
            {breakdown.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {breakdown.map(b => <span key={b.k} className="text-[11px] bg-white/10 border border-white/10 rounded-full px-2.5 py-1">{b.label} {b.v}</span>)}
              </div>
            )}
            <button onClick={() => onGo && onGo('activity')} className="mt-4 bg-white text-black text-sm font-bold px-4 py-2 rounded-full active:scale-95 transition">填活動量</button>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-[11px] text-white/45 mb-2">
            <span className="tracking-[0.18em] font-semibold">THIS WEEK</span>
            <span>{wkTotal} / {WEEKLY_TARGET} 分</span>
          </div>
          <div className="flex items-end gap-2 h-16">
            {week.map((w) => {
              const h = Math.max(6, Math.min(100, (w.p / DAILY_TARGET) * 100));
              const hit = w.p >= DAILY_TARGET;
              return (
                <div key={w.d} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="w-full rounded-md transition-all duration-700" style={{ height: `${w.future ? 6 : h}%`, background: hit ? 'linear-gradient(180deg,#6ee7b7,#10b981)' : w.isToday ? 'linear-gradient(180deg,#a5b4fc,#6366f1)' : w.future ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,.22)' }}></div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 mt-1.5">
            {week.map((w) => <span key={w.d} className={`flex-1 text-center text-[11px] ${w.isToday ? 'text-white font-bold' : 'text-white/40'}`}>{weekdayNames[dayOfWeek(w.d)]}</span>)}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/55">
          <span>全隊今天累計 <b className="text-white tabular-nums">{teamStats.total}</b> 分</span>
          <span><b className="text-white tabular-nums">{teamStats.reached}</b> / {teamStats.n} 人已達標</span>
        </div>
      </div>
    </div>
  );
};

const TeamTargetBoard = ({ team, activities, records, rootName }) => {
  const today = getTodayDate();
  const members = useMemo(() => getDistrictMembers(team, rootName), [team, rootName]);
  const rows = useMemo(() => members.map(m => ({
    m,
    today: pointsOnDate(activities, m.id, today),
    week: weekPoints(activities, m.id, today),
    month: monthPoints(activities, m.id, today),
    quality: getQualityInfo(m, records)
  })).sort((a, b) => a.today - b.today || a.week - b.week), [members, activities, records, today]);
  const reached = rows.filter(r => r.today >= DAILY_TARGET).length;
  const empty = rows.filter(r => r.today === 0).length;
  const weekAvg = rows.length ? Math.round(rows.reduce((s, r) => s + Math.min(1, r.week / WEEKLY_TARGET), 0) / rows.length * 100) : 0;
  const qualityOn = rows.filter(r => r.quality && r.quality.state === 'active').length;
  const qualityUnset = rows.filter(r => r.quality && r.quality.state === 'unset').length;

  const kpis = [
    { label: '今日達標', value: `${reached}/${rows.length}`, tone: 'text-emerald-300' },
    { label: '今日未建檔', value: empty, tone: empty > 0 ? 'text-rose-300' : 'text-white' },
    { label: '本週平均達成', value: `${weekAvg}%`, tone: 'text-white' },
    { label: '優培進行中', value: qualityOn, tone: 'text-amber-300', sub: qualityUnset > 0 ? `${qualityUnset} 人未填期別` : '' }
  ];

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#09090c] text-white p-5 sm:p-7 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
      <div className="absolute inset-0 jf-grid-bg opacity-50 pointer-events-none"></div>
      <div className="absolute -top-20 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(251,191,36,.12)' }}></div>
      <div className="relative">
        <p className="text-[11px] tracking-[0.22em] text-white/45 font-semibold">TEAM COMMAND · {rootName} 區</p>
        <h3 className="text-xl sm:text-2xl font-semibold mt-1">全隊目標與優培狀況</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          {kpis.map(k => (
            <div key={k.label} className="bg-white/[0.06] border border-white/10 rounded-2xl px-4 py-3">
              <p className="text-[11px] text-white/50">{k.label}</p>
              <p className={`text-2xl font-semibold tabular-nums mt-0.5 ${k.tone}`}>{k.value}</p>
              {k.sub && <p className="text-[10px] text-white/40 mt-0.5">{k.sub}</p>}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-white/40 mt-4 mb-2">依今日分數由低到高排列，需要關心的人在最上面</p>
        <div className="space-y-2">
          {rows.map(({ m, today: tp, week, month, quality }) => {
            const tone = tp >= DAILY_TARGET ? '#34d399' : tp > 0 ? '#fbbf24' : '#fb7185';
            return (
              <div key={m.id} className="bg-white/[0.05] border border-white/10 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                <div className="flex items-center gap-3 sm:w-44 shrink-0">
                  <Avatar name={m.name} size={40} style={{ border: `2px solid ${tone}88` }} />
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{m.name}</p>
                    <p className="text-[11px] text-white/45">{m.role}</p>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4 min-w-0">
                  <div>
                    <div className="flex justify-between text-[11px] text-white/50 mb-1"><span>今日</span><span className="tabular-nums text-white/80">{tp}/{DAILY_TARGET}</span></div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${Math.min(100, tp / DAILY_TARGET * 100)}%`, background: tone }}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] text-white/50 mb-1"><span>本週</span><span className="tabular-nums text-white/80">{week}/{WEEKLY_TARGET}</span></div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-indigo-400" style={{ width: `${Math.min(100, week / WEEKLY_TARGET * 100)}%` }}></div></div>
                  </div>
                </div>
                <div className="sm:w-48 shrink-0 text-[11px]">
                  {quality ? (
                    quality.state === 'active' ? (
                      <div>
                        <p className="text-amber-300 font-semibold mb-1">優培 第 {quality.stage} 階段</p>
                        <div className="flex items-center gap-2 text-white/60"><span className="w-12 shrink-0">FYC</span><div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-amber-300" style={{ width: `${Math.min(100, quality.fyc / quality.fycTarget * 100)}%` }}></div></div><span className="tabular-nums">{Math.round(quality.fyc / quality.fycTarget * 100)}%</span></div>
                        <div className="flex items-center gap-2 text-white/60 mt-1"><span className="w-12 shrink-0">被保人</span><div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-amber-300" style={{ width: `${Math.min(100, quality.insured / quality.insuredTarget * 100)}%` }}></div></div><span className="tabular-nums">{quality.insured}/{quality.insuredTarget}</span></div>
                      </div>
                    ) : quality.state === 'upcoming' ? (
                      <p className="text-white/50">優培 {quality.start} 開始</p>
                    ) : (
                      <p className="text-rose-300">優培期別尚未填寫</p>
                    )
                  ) : (
                    <p className="text-white/25">月累計 {month} 分</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- 首頁：個人目標 + 優培（直接放在主畫面）---
const HomeGoalsQuality = ({ loggedInUser, records, activities }) => {
  const month = getCurrentMonth();
  const [goals, setGoals] = useState(PERSONAL_GOALS_DEFAULT);
  const [form, setForm] = useState(PERSONAL_GOALS_DEFAULT);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [qInput, setQInput] = useState('');
  const [localStart, setLocalStart] = useState('');

  useEffect(() => {
    if (!loggedInUser) return;
    const unsub = onSnapshot(doc(db, 'personal_goals', `${loggedInUser.id}_${month}`), (snap) => {
      const data = snap.exists() ? { ...PERSONAL_GOALS_DEFAULT, ...snap.data() } : PERSONAL_GOALS_DEFAULT;
      setGoals(data); setForm(data);
    });
    return () => unsub();
  }, [loggedInUser?.id, month]);

  const myRecords = useMemo(() => (records || []).filter(r => r.agentId === loggedInUser.id && (r.date || '').startsWith(month)), [records, loggedInUser.id, month]);
  const sales = myRecords.reduce((s, r) => s + (goals.salesBasis === 'premium' ? (r.premium || 0) : (r.weighted || 0)), 0);
  const income = myRecords.filter(r => (r.status || '已發單') === '已發單').reduce((s, r) => s + (r.premium || 0) * (PRODUCT_MAPPING[r.typeCode]?.commissionRate || 0), 0);
  const recruit = (activities || []).filter(a => a.agentId === loggedInUser.id && a.month === month).reduce((s, a) => s + (a.recruitRegistered || 0), 0);
  const pct = (a, t) => t > 0 ? Math.min(100, Math.round(a / t * 100)) : 0;

  const rows = [
    { key: 'sales', label: `業績（${goals.salesBasis === 'premium' ? '實收' : '加權'}）`, a: sales, t: goals.salesTarget, money: true, bar: 'from-sky-400 to-indigo-500', tone: 'text-sky-300', icon: TrendingUp },
    { key: 'recruit', label: '增員人數', a: recruit, t: goals.recruitTarget, unit: '人', bar: 'from-teal-400 to-emerald-400', tone: 'text-teal-300', icon: Users },
    { key: 'income', label: '預估收入', a: Math.round(income), t: goals.incomeTarget, money: true, bar: 'from-amber-400 to-orange-400', tone: 'text-amber-300', icon: Award },
  ];

  const q0 = getQualityInfo({ ...loggedInUser, qualityTalentStartMonth: localStart || loggedInUser.qualityTalentStartMonth }, records);
  const startMonth = localStart || loggedInUser.qualityTalentStartMonth || '';
  const stageRange = (q0 && q0.state === 'active' && startMonth) ? (() => {
    const [sy, sm] = startMonth.split('-').map(Number);
    const f = (i) => { const d = new Date(sy, sm - 1 + (q0.stage - 1) * 3 + i, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
    return `${f(0)} ~ ${f(2)}`;
  })() : '';

  const save = async () => {
    setSaving(true);
    try { await setDoc(doc(db, 'personal_goals', `${loggedInUser.id}_${month}`), { ...form, salesTarget: Number(form.salesTarget) || 0, recruitTarget: Number(form.recruitTarget) || 0, incomeTarget: Number(form.incomeTarget) || 0 }); setEditing(false); } catch (e) { console.error(e); } finally { setSaving(false); }
  };
  const saveQuality = async () => {
    if (!qInput) return;
    try { await updateDoc(doc(db, 'user', loggedInUser.id), { qualityTalentStartMonth: qInput }); setLocalStart(qInput); } catch (e) { console.error(e); }
  };

  const glass = 'bg-white/[0.06] backdrop-blur-xl border border-white/10';
  const R = 34, C = 2 * Math.PI * R;
  const fycPct = q0 && q0.state === 'active' ? Math.min(100, Math.round(q0.fyc / q0.fycTarget * 100)) : 0;
  const insPct = q0 && q0.state === 'active' ? Math.min(100, Math.round(q0.insured / q0.insuredTarget * 100)) : 0;

  return (
    <>
      <div className={`grid gap-3 ${q0 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <div className={`${glass} rounded-[24px] p-3.5 min-w-0`}>
          <button onClick={() => { setForm(goals); setEditing(true); }} className="w-full flex items-center justify-between mb-2.5 text-left">
            <span className="font-bold text-[15px] flex items-center gap-1.5 min-w-0"><Target size={17} className="text-fuchsia-300 shrink-0" /><span className="truncate">個人目標</span><span className="text-[11px] text-white/45 font-normal shrink-0">(本月)</span></span>
            <ChevronRight size={16} className="text-white/40 shrink-0" />
          </button>
          <div className="space-y-2">
            {rows.map(r => {
              const p = pct(r.a, r.t);
              const Icon = r.icon;
              return (
                <div key={r.key} className="rounded-2xl bg-white/[0.05] border border-white/10 px-3 py-2">
                  <div className="flex items-center gap-2.5">
                    <Icon size={18} className={`${r.tone} shrink-0`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-white/50 truncate">{r.label}</p>
                      <p className="leading-tight truncate"><b className="text-[15px] tabular-nums">{r.money ? formatMoney(r.a) : r.a}</b>{r.t > 0 ? <span className="text-[11px] text-white/45"> / {r.money ? formatMoney(r.t) : r.t}{r.unit ? ` ${r.unit}` : ''}</span> : <span className="text-[11px] text-white/35"> 尚未設定</span>}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className={`h-full rounded-full bg-gradient-to-r ${r.bar}`} style={{ width: `${p}%`, transition: 'width .7s ease' }}></div></div>
                    <span className={`text-[11px] tabular-nums ${r.tone}`}>{p}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {q0 && (
          <div className={`${glass} rounded-[24px] p-3.5 min-w-0 flex flex-col`}>
            <p className="font-bold text-[15px] flex items-center gap-1.5 min-w-0"><Award size={17} className="text-violet-300 shrink-0" /><span className="truncate leading-tight">優質人才培訓</span></p>
            {q0.state === 'active' && (
              <>
                <p className="text-[11px] text-white/45 mt-0.5">第 {q0.stage} 階段 · {stageRange}</p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="relative w-[78px] h-[78px] shrink-0">
                    <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90"><circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="7" /><circle cx="40" cy="40" r={R} fill="none" stroke={fycPct >= 100 ? '#34d399' : '#a78bfa'} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${C * fycPct / 100} ${C}`} style={{ transition: 'stroke-dasharray .8s ease' }} /></svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[17px] font-bold tabular-nums">{fycPct}%</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-white/50 leading-tight">FYC + 行銷獎金 (估)</p>
                    <p className="font-bold text-[15px] tabular-nums truncate">{formatMoney(q0.fyc)}</p>
                    <p className="text-[11px] text-white/40 truncate">/ {formatMoney(q0.fycTarget)}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/[0.05] border border-white/10 px-3 py-2 mt-3">
                  <p className="text-[11px] text-white/50">不同被保險人數</p>
                  <p className="leading-tight"><b className="text-[17px] tabular-nums">{q0.insured}</b><span className="text-[12px] text-white/45"> / {q0.insuredTarget} 人</span></p>
                  <div className="flex items-center gap-2 mt-1"><div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-violet-400" style={{ width: `${insPct}%` }}></div></div><span className="text-[11px] tabular-nums text-white/60">{insPct}%</span></div>
                </div>
              </>
            )}
            {q0.state === 'upcoming' && <p className="text-[13px] text-white/60 mt-4">優培 {q0.start} 開始，期間內才會顯示進度。</p>}
            {q0.state === 'unset' && (
              <div className="mt-3">
                <p className="text-[12px] text-rose-300">優培期別尚未填寫</p>
                <p className="text-[11px] text-white/40 mt-1 mb-2">填寫起始月後才會顯示進度</p>
                <input type="month" value={qInput} onChange={e => setQInput(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2 text-[13px] text-white outline-none" style={{ colorScheme: 'dark' }} />
                <button onClick={saveQuality} disabled={!qInput} className="w-full mt-2 py-2 rounded-xl bg-violet-500 text-[13px] font-bold disabled:opacity-40">設定</button>
              </div>
            )}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditing(false)}>
          <div className="w-full max-w-md rounded-t-[28px] border-t border-white/10 bg-[#0c1020] text-white p-5 pb-8" onClick={e => e.stopPropagation()}>
            <p className="text-[16px] font-bold mb-4">設定本月目標</p>
            <div className="flex rounded-2xl bg-white/[0.07] p-0.5 mb-3">
              {[['weighted', '業績算加權'], ['premium', '業績算實收']].map(([k, l]) => (
                <button key={k} onClick={() => setForm({ ...form, salesBasis: k })} className={`flex-1 py-2 text-[12px] font-bold rounded-[14px] ${form.salesBasis === k ? 'bg-white text-gray-900' : 'text-white/55'}`}>{l}</button>
              ))}
            </div>
            {[['salesTarget', '業績目標 ($)'], ['recruitTarget', '增員人數目標 (人)'], ['incomeTarget', '預估收入目標 ($)']].map(([k, l]) => (
              <div key={k} className="mb-3">
                <label className="text-[11px] text-white/50 block mb-1">{l}</label>
                <input type="number" inputMode="numeric" value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-[16px] font-bold text-white outline-none" />
              </div>
            ))}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditing(false)} className="flex-1 py-3 rounded-2xl bg-white/10 font-bold text-[14px]">取消</button>
              <button onClick={save} disabled={saving} className="flex-1 py-3 rounded-2xl bg-blue-500 font-bold text-[14px] disabled:opacity-50">{saving ? '儲存中…' : '儲存'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- 首頁：我的待辦事項（深色版，資料同 personal_todos）---
const HomeTodoCard = ({ loggedInUser }) => {
  const [items, setItems] = useState([]);
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  const [menuId, setMenuId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!loggedInUser) return;
    const unsub = onSnapshot(query(collection(db, 'personal_todos'), where('ownerId', '==', loggedInUser.id)), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
      setItems(list);
    });
    return () => unsub();
  }, [loggedInUser?.id]);

  const add = async () => {
    const t = text.trim();
    if (!t) return;
    try { await addDoc(collection(db, 'personal_todos'), { ownerId: loggedInUser.id, text: t, done: false, createdAt: new Date().toISOString() }); setText(''); setAdding(false); } catch (e) { console.error(e); }
  };
  const toggle = async (it) => { try { await updateDoc(doc(db, 'personal_todos', it.id), { done: !it.done }); } catch (e) { console.error(e); } };
  const remove = async (id) => { try { await deleteDoc(doc(db, 'personal_todos', id)); setMenuId(null); } catch (e) { console.error(e); } };

  const pending = items.filter(i => !i.done);
  const done = items.filter(i => i.done);
  const ordered = [...pending, ...done];
  const shown = showAll ? ordered : ordered.slice(0, 5);
  const fmt = (iso) => { if (!iso) return ''; const d = new Date(iso); return isNaN(d) ? '' : `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };

  return (
    <div className="bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-[24px] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-[16px] flex items-center gap-2"><CheckSquare size={18} className="text-sky-300" />我的待辦事項 <span className="text-white/50 font-normal text-[14px]">({pending.length})</span></p>
        <button onClick={() => setAdding(v => !v)} className="flex items-center gap-1 text-[13px] font-bold rounded-xl border border-blue-400/40 bg-blue-500/20 text-blue-100 px-3 py-2 active:scale-95 transition"><Plus size={15} />新增待辦</button>
      </div>
      {adding && (
        <div className="flex gap-2 mt-3">
          <input autoFocus value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) add(); }} placeholder="隨手記一件事…" className="flex-1 min-w-0 rounded-xl border border-white/10 bg-white/[0.07] px-3 py-2.5 text-[14px] text-white placeholder-white/30 outline-none" />
          <button onClick={add} disabled={!text.trim()} className="px-4 rounded-xl bg-blue-500 text-[13px] font-bold disabled:opacity-40">加入</button>
        </div>
      )}
      <div className="mt-2">
        {items.length === 0 && <p className="text-center text-[13px] text-white/40 py-5">還沒有待辦，點右上角新增一件</p>}
        {shown.map((it, i) => (
          <div key={it.id} className={`flex items-center gap-3 py-3 ${i < shown.length - 1 ? 'border-b border-white/10' : ''}`}>
            <button onClick={() => toggle(it)} aria-label="完成" className={`w-[22px] h-[22px] rounded-md border flex items-center justify-center shrink-0 transition ${it.done ? 'bg-blue-500 border-blue-500' : 'border-white/35'}`}>{it.done && <CheckCircle2 size={14} className="text-white" />}</button>
            <span className={`flex-1 min-w-0 text-[14px] truncate ${it.done ? 'line-through text-white/40' : ''}`}>{it.text}</span>
            <span className={`text-[11px] tabular-nums shrink-0 ${it.done ? 'text-white/30 line-through' : 'text-white/45'}`}>{fmt(it.createdAt)}</span>
            {menuId === it.id
              ? <button onClick={() => remove(it.id)} className="text-[12px] font-bold text-rose-300 shrink-0">刪除</button>
              : <button onClick={() => setMenuId(it.id)} aria-label="更多" className="text-white/40 shrink-0 px-1"><MoreVertical size={16} className="rotate-90" /></button>}
          </div>
        ))}
      </div>
      {ordered.length > 5 && <button onClick={() => setShowAll(v => !v)} className="w-full text-center text-[12px] text-white/50 pt-2">{showAll ? '收合' : `查看全部 ${ordered.length} 項`}</button>}
    </div>
  );
};

// ================= 今日待辦首頁（手機優先：深色單欄，只留最重要的資訊）=================
const TodayHome = ({ loggedInUser, activities, team, records, isTeamScheduleViewer, scheduleEvents, recurringRules, onGo, bellCount, dueCount, onShowMore, dueNode }) => {
  const today = getTodayDate();
  const pts = pointsOnDate(activities, loggedInUser.id, today);
  const pct = Math.min(1, pts / DAILY_TARGET);
  const done = pts >= DAILY_TARGET;
  const streak = useMemo(() => streakDays(activities, loggedInUser.id, today), [activities, loggedInUser.id, today]);
  const weekStart = weekStartOf(today);
  const week = Array.from({ length: 7 }, (_, i) => { const d = dateAdd(weekStart, i); return { d, p: pointsOnDate(activities, loggedInUser.id, d), isToday: d === today, future: d > today }; });
  const wkTotal = week.reduce((s, x) => s + x.p, 0);
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const hour = new Date().getHours();
  const greet = hour < 11 ? '早安' : hour < 18 ? '午安' : '晚安';

  const todayItems = useMemo(() => {
    const real = (scheduleEvents || []).filter(e => e.status !== 'cancelled' && (e.endDate ? (e.date <= today && today <= e.endDate) : e.date === today));
    const virt = [];
    (recurringRules || []).filter(r => (r.participantIds || []).includes(loggedInUser.id)).forEach(rule => {
      try {
        const dates = generateRecurringOccurrences(rule, new Date(today), new Date(today));
        if (dates.includes(today) && !(scheduleEvents || []).some(e => e.ruleId === rule.id && e.date === today)) {
          virt.push({ id: `v_${rule.id}`, isVirtual: true, isReminder: true, type: 'reminder', title: rule.title, category: rule.category || 'meeting', date: today, time: rule.startTime || '', endTime: rule.endTime || '', status: 'scheduled' });
        }
      } catch (e) {}
    });
    return [...real, ...virt].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
  }, [scheduleEvents, recurringRules, loggedInUser.id, today]);

  const pending = todayItems.filter(e => e.status !== 'completed');
  const doneCount = todayItems.length - pending.length;
  const nowHM = `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;
  const nextItem = pending.find(e => e.time && e.time >= nowHM) || pending.find(e => !e.time) || pending[0] || null;

  const itemTitle = (e) => e.isReminder ? e.title : (ALL_ACTIVITY_WEIGHTS[e.type]?.label || e.type);
  const itemSub = (e) => e.isReminder ? (e.note && !/^\d{1,2}:\d{2}/.test(e.note) ? e.note : '') : (e.customerName || '');
  const itemBadge = (e) => e.isReminder ? (REMINDER_CATEGORIES[e.category]?.label || '提醒') : (/ecruit/i.test(e.type || '') ? '增員' : '銷售');
  const fmtTime = (e) => e.time ? (e.endTime ? `${e.time}–${e.endTime}` : e.time) : '全天';

  const teamStats = useMemo(() => {
    const total = (activities || []).filter(a => a.date === today).reduce((s, a) => s + scoreOfActivity(a), 0);
    const reached = (team || []).filter(m => pointsOnDate(activities, m.id, today) >= DAILY_TARGET).length;
    return { total, reached, n: (team || []).length };
  }, [activities, team, today]);
  const todayRecords = (activities || []).filter(a => a.agentId === loggedInUser.id && a.date === today);
  const breakdown = ACT_SCORE_KEYS.map(k => ({ k, label: ALL_ACTIVITY_WEIGHTS[k].label, v: todayRecords.reduce((s, a) => s + (Number(a[k]) || 0), 0) })).filter(x => x.v > 0);

  const R = 58, C = 2 * Math.PI * R;
  const glass = 'bg-white/[0.06] backdrop-blur-xl border border-white/10';

  return (
    <div className="text-white space-y-3.5 md:space-y-0 md:flex md:flex-col md:gap-3 md:h-full md:min-h-[840px]">
      <div className="flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="text-[13px] tracking-[0.12em] text-white/55">{today.replace(/-/g, '.')}　週{dayNames[dayOfWeek(today)]}</p>
          <h1 className="text-[28px] sm:text-3xl font-bold mt-1 leading-tight">{greet}，{loggedInUser.name}</h1>
          <p className="text-sm text-white/55 mt-1.5">把今天做好，明天就會更輕鬆。</p>
        </div>
        <button onClick={() => onGo('announce')} className="relative w-11 h-11 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 active:scale-95 transition">
          <Bell size={20} />
          {!!bellCount && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">{bellCount > 99 ? '99+' : bellCount}</span>}
        </button>
      </div>

      <div className="flex flex-col gap-3.5 md:grid md:grid-cols-3 md:gap-3 md:flex-1 md:min-h-0">
    <div className="contents md:flex md:flex-col md:gap-3 md:min-h-0">
      <div className={`${glass} rounded-[28px] p-4 sm:p-5 order-1 md:order-none`}>
        <div className="flex items-center gap-4">
          <div className={`relative w-[132px] h-[132px] sm:w-36 sm:h-36 shrink-0 ${done ? 'jf-ring-done' : ''}`}>
            <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
              <defs>
                <linearGradient id="thRing" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={done ? '#34d399' : '#818cf8'} />
                  <stop offset="100%" stopColor={done ? '#a7f3d0' : '#c084fc'} />
                </linearGradient>
              </defs>
              <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="10" />
              <circle cx="70" cy="70" r={R} fill="none" stroke="url(#thRing)" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} style={{ transition: 'stroke-dasharray .8s cubic-bezier(.2,.8,.2,1)' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] text-white/55">今日進度</span>
              <span className="leading-none mt-1"><b className="text-[40px] font-semibold tabular-nums">{pts}</b><span className="text-lg text-white/60"> / {DAILY_TARGET}</span></span>
              <span className={`text-xs mt-1.5 ${done ? 'text-emerald-300' : 'text-indigo-300'}`}>{Math.round(pct * 100)}%</span>
            </div>
          </div>
          <div className="min-w-0 flex-1 self-stretch flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-white/55">{done ? '今天' : '還差'}</p>
                {done
                  ? <p className="text-[34px] font-bold leading-tight text-emerald-300">達標 ✓</p>
                  : <p className="leading-none mt-1"><b className="text-[52px] font-bold tabular-nums">{DAILY_TARGET - pts}</b><span className="text-xl font-bold ml-1">分</span></p>}
                <p className="text-sm text-white/55 mt-1.5">{done ? '漂亮，保持這個節奏' : '今天達標，加油！'}</p>
              </div>

            </div>
          </div>
        </div>

        <button onClick={() => onGo('calendar')} className="mt-4 w-full text-left rounded-2xl bg-white/[0.07] border border-white/10 p-3.5 active:scale-[0.99] transition">
          <p className="text-xs text-white/55 mb-2">下一步行動</p>
          {nextItem ? (
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0"><Users size={20} /></span>
              <div className="min-w-0 flex-1">
                <p className="font-bold truncate">{itemTitle(nextItem)}</p>
                <p className="text-xs text-white/55 truncate">{[itemSub(nextItem), fmtTime(nextItem)].filter(Boolean).join(' · ')}</p>
              </div>
              <ChevronRight size={18} className="text-white/40 shrink-0" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0"><CalendarPlus size={20} /></span>
              <p className="flex-1 text-sm text-white/70">今天沒有排定行程，先約一位客戶吧</p>
              <ChevronRight size={18} className="text-white/40 shrink-0" />
            </div>
          )}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2.5 order-2 md:order-none">
        {[
          { id: 'activity', label: '建活動量', icon: Plus, accent: true },
          { id: 'customers', label: '新增客戶', icon: Users },
          { id: 'entry', label: '回報業績', icon: FileText },
          { id: 'calendar', label: '查看行程', icon: Calendar }
        ].map(a => {
          const Icon = a.icon;
          return (
            <button key={a.label} onClick={() => onGo(a.id)} className={`${glass} rounded-2xl py-3.5 flex flex-col items-center gap-2 active:scale-95 transition ${a.accent ? 'bg-indigo-500/20 border-indigo-400/30' : ''}`}>
              <span className={`w-9 h-9 rounded-full flex items-center justify-center ${a.accent ? 'bg-indigo-500' : 'bg-white/10'}`}><Icon size={18} /></span>
              <span className="text-[12px] font-medium">{a.label}</span>
            </button>
          );
        })}
      </div>

      <div className={`${glass} rounded-[24px] p-4 order-6 md:order-none`}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-bold text-base">今日重點</p>
          <button onClick={onShowMore} className="md:hidden text-xs text-white/55 flex items-center gap-0.5">查看更多<ChevronRight size={14} /></button>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-3">
            <Target size={18} className="text-fuchsia-300" />
            <p className="text-[11px] text-white/55 mt-2">今日行程</p>
            <p className="mt-0.5"><b className="text-2xl font-semibold tabular-nums">{doneCount}</b><span className="text-white/50"> / {todayItems.length}</span></p>
          </div>
          <button onClick={onShowMore} className="rounded-2xl bg-white/[0.06] border border-white/10 p-3 text-left active:scale-95 transition">
            <Phone size={18} className="text-sky-300" />
            <p className="text-[11px] text-white/55 mt-2">待聯繫客戶</p>
            <p className="mt-0.5"><b className="text-2xl font-semibold tabular-nums">{dueCount}</b></p>
          </button>
          <div className="rounded-2xl bg-white/[0.06] border border-white/10 p-3">
            <span className="text-lg leading-none">🔥</span>
            <p className="text-[11px] text-white/55 mt-2">連續達標</p>
            <p className="mt-0.5"><b className="text-2xl font-semibold tabular-nums">{streak}</b><span className="text-white/50"> 天</span></p>
          </div>
        </div>
      </div>
    </div>
    <div className="contents md:flex md:flex-col md:gap-3 md:min-h-0 md:overflow-y-auto no-scrollbar">
      <div className="order-3 md:order-none"><HomeGoalsQuality loggedInUser={loggedInUser} records={records} activities={activities} /></div>
      <div className="order-4 md:order-none"><HomeTodoCard loggedInUser={loggedInUser} /></div>
    </div>
    <div className="contents md:flex md:flex-col md:gap-3 md:min-h-0">

      <button onClick={() => onGo('activity')} className={`${glass} w-full rounded-[24px] p-4 text-left active:scale-[0.99] transition order-5 md:order-none`}>
        <div className="flex items-center gap-3">
          <p className="font-bold text-base shrink-0">本週活動量</p>
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-700" style={{ width: `${Math.min(100, wkTotal / WEEKLY_TARGET * 100)}%` }}></div></div>
          <p className="text-sm text-white/70 shrink-0 tabular-nums">{wkTotal} / {WEEKLY_TARGET} 分</p>
        </div>
        <div className="flex justify-between mt-4 px-1">
          {week.map(w => {
            const hit = w.p >= DAILY_TARGET;
            return (
              <div key={w.d} className="flex flex-col items-center gap-2">
                <span className={`text-[12px] ${w.isToday ? 'text-white font-bold' : 'text-white/45'}`}>{dayNames[dayOfWeek(w.d)]}</span>
                <span className={`rounded-full ${w.isToday ? 'w-[26px] h-[26px] ring-2 ring-indigo-300 ring-offset-2 ring-offset-[#0b1022]' : 'w-[18px] h-[18px]'}`} style={{ background: w.future ? 'rgba(255,255,255,.14)' : hit ? '#34d399' : w.p > 0 ? '#818cf8' : 'rgba(255,255,255,.22)' }}></span>
              </div>
            );
          })}
        </div>
      </button>

      {dueNode && <div className="hidden md:block md:flex-1 md:min-h-0 md:overflow-y-auto no-scrollbar">{dueNode}</div>}
    </div>
    </div>
    </div>
  );
};

const TodoSchedulePage = ({ loggedInUser, customers, scheduleEvents, records, activities, team, onGo, isTeamScheduleViewer, recurringRules, bellCount }) => {
  const today = getTodayDate();
  const [showMore, setShowMore] = useState(false);
  const dueRef = useRef(null);
  const openDue = () => { setShowMore(true); setTimeout(() => { try { dueRef.current && dueRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }, 120); };
  const [busyId, setBusyId] = useState(null);

  const [completingContact, setCompletingContact] = useState(null);
  const [contactType, setContactType] = useState('appointment');
  const [contactNote, setContactNote] = useState('');
  const [contactFollowUp, setContactFollowUp] = useState('');

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

  const isTodayEmpty = dueCustomers.length === 0 && birthdayCustomers.length === 0 && autoSuggested.length === 0;

  const dueBlock = (
      <div className="rounded-[28px] bg-[#f5f5f7] text-gray-900 p-3 sm:p-4 space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 font-bold">{today} · 今天該聯繫、該留意的事</p>
        <button onClick={() => setShowMore(false)} className="md:hidden text-xs font-bold text-gray-500 bg-white rounded-full px-3 py-1.5 border border-gray-200">收起</button>
      </div>

      {isTodayEmpty && <Card className="p-8 text-center text-gray-400">今天沒有待辦事項，太棒了 🎉</Card>}

      <div className="space-y-4">
        {dueCustomers.length > 0 && (
          <Card className="p-5">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base"><Phone size={18} className="text-amber-500" /> 該追蹤的客戶</h4>
            <div className="space-y-3">
              {dueCustomers.map(c => (
                <div key={c.id} className="flex items-center justify-between gap-3 p-4 rounded-xl border bg-amber-50 border-amber-100">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{c.name}</p>
                    <p className="text-sm text-gray-400">追蹤日期：{c.nextFollowUpDate}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {c.igHandle && <a href={getInstagramUrl(c.igHandle)} target="_blank" rel="noopener noreferrer" title="開啟 IG" className="bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white text-sm font-bold px-3 py-2.5 rounded-lg flex items-center">IG</a>}
                    <button disabled={busyId === c.id} onClick={() => openContactModal(c)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition disabled:opacity-50 flex items-center gap-1">
                      {busyId === c.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} 已聯繫
                    </button>
                    <button onClick={() => handleDismissToday(c.id)} title="今天先不處理，明天會再出現" className="text-gray-300 hover:text-gray-500 p-2.5"><X size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {suggestedIds !== null && (
          <Card className="p-5">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-gray-800 flex items-center gap-2 text-base"><Users size={18} className="text-teal-500" /> 今日推薦聯繫</h4>
              <button onClick={handleGetMoreSuggestions} disabled={refreshingBatch} className="flex items-center gap-1 text-sm font-bold text-teal-600 hover:text-teal-700 disabled:opacity-50">
                {refreshingBatch ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} 換一批
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">每天15人：最近建檔3、既有客戶3、準客戶4、準增員3、久未聯繫2；7天內推薦過或已有排定行程的人不會重複出現；有空時可點「換一批」整批換掉，換掉的人一樣算7天內推薦過</p>
            {autoSuggested.length === 0 && <p className="text-center text-gray-400 text-sm py-4">今天推薦的人都處理完了，點「換一批」可以再多要一些</p>}
            <div className="space-y-3">
              {autoSuggested.map(c => (
                <div key={c.id} className="flex items-center justify-between gap-3 p-4 rounded-xl border bg-teal-50 border-teal-100">
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 truncate">{c.name} <span className="text-xs text-gray-400 font-normal">· {(c.tags || []).join('、')}</span></p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {c.igHandle && <a href={getInstagramUrl(c.igHandle)} target="_blank" rel="noopener noreferrer" title="開啟 IG" className="bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white text-sm font-bold px-3 py-2.5 rounded-lg flex items-center">IG</a>}
                    <button disabled={busyId === c.id} onClick={() => openContactModal(c)} className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition disabled:opacity-50 flex items-center gap-1">
                      {busyId === c.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} 標記聯繫
                    </button>
                    <button onClick={() => handleDismissToday(c.id)} title="今天先不處理，明天會再出現" className="text-gray-300 hover:text-gray-500 p-2.5"><X size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {birthdayCustomers.length > 0 && (
          <Card className="p-5">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base"><Cake size={18} className="text-pink-500" /> 近期生日 (7天內)</h4>
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
  );

  return (
    <div className="max-w-xl md:max-w-none md:h-full mx-auto space-y-4 md:space-y-0 animate-fade-in pb-12 md:pb-0">
      <TodayHome dueNode={dueBlock} loggedInUser={loggedInUser} activities={activities} team={team} records={records} isTeamScheduleViewer={isTeamScheduleViewer} scheduleEvents={scheduleEvents} recurringRules={recurringRules} onGo={onGo} bellCount={bellCount} dueCount={dueCustomers.length} onShowMore={openDue} />

      <div ref={dueRef}></div>
      {showMore && <div className="md:hidden">{dueBlock}</div>}

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
    </div>
  );
};

// ================= 手機版：行事曆／客戶管理（深色、重點優先）=================
const CAL_GROUPS = {
  appt: { label: '約訪', color: '#3b82f6' },
  interview: { label: '面談', color: '#38bdf8' },
  submit: { label: '送件', color: '#34d399' },
  recruit: { label: '增員', color: '#fb7185' },
  meeting: { label: '會議', color: '#8b5cf6' },
  activity: { label: '活動', color: '#fb923c' },
  personal: { label: '私事', color: '#4ade80' },
  claim: { label: '理賠', color: '#f59e0b' },
  other: { label: '其他', color: '#94a3b8' }
};
const calGroupKey = (e) => {
  if (e.isReminder) {
    const c = e.category || 'other';
    return (c === 'meeting' || c === 'paperwork') ? 'meeting' : c === 'personal' ? 'personal' : c === 'claim' ? 'claim' : 'other';
  }
  if (!ACTIVITY_WEIGHTS[e.type]) return 'recruit';
  if (e.type === 'appointment') return 'appt';
  if (e.type === 'interview') return 'interview';
  if (['proposal', 'application', 'issue'].includes(e.type)) return 'submit';
  return 'activity';
};

// --- 電腦版：行事曆（深色、滿版、月/週/日/列表）---
const DesktopCalendarView = ({ events, today, onEventClick, addItemsFor, getEventLabel, teamToggle, teamMode, filterNode }) => {
  const [mode, setMode] = useState('month');
  const [selectedDay, setSelectedDay] = useState(today);
  const [menuOpen, setMenuOpen] = useState(false);
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(e => {
      const last = e.endDate && e.endDate > e.date ? e.endDate : e.date;
      let cursor = e.date, guard = 0;
      while (cursor <= last && guard < 62) { (map[cursor] = map[cursor] || []).push(e); cursor = dateAdd(cursor, 1); guard++; }
    });
    Object.values(map).forEach(l => l.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99')));
    return map;
  }, [events]);

  const [sy, sm] = selectedDay.split('-').map(Number);
  const shift = (dir) => {
    if (mode === 'month' || mode === 'list') {
      const dim = new Date(sy, sm - 1 + dir + 1, 0).getDate();
      const d = new Date(sy, sm - 1 + dir, Math.min(Number(selectedDay.slice(8)), dim));
      setSelectedDay(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    } else setSelectedDay(dateAdd(selectedDay, mode === 'week' ? dir * 7 : dir));
  };
  const gridDays = useMemo(() => {
    if (mode === 'week') { const st = weekStartOf(selectedDay); return Array.from({ length: 7 }, (_, i) => dateAdd(st, i)); }
    const first = `${sy}-${String(sm).padStart(2, '0')}-01`;
    const start = dateAdd(first, -dayOfWeek(first));
    const dim = new Date(sy, sm, 0).getDate();
    const total = Math.ceil((dayOfWeek(first) + dim) / 7) * 7;
    return Array.from({ length: total }, (_, i) => dateAdd(start, i));
  }, [mode, selectedDay, sy, sm]);
  const rows = Math.ceil(gridDays.length / 7);

  const dayEvents = eventsByDate[selectedDay] || [];
  const holiday = TAIWAN_HOLIDAYS_2026[selectedDay];
  const card = 'rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl';
  const creatorBadge = (e, s = 16) => teamMode && e._creator ? (
    AVATAR_FILES[e._creator]
      ? <img src={`/avatars/${AVATAR_FILES[e._creator]}.jpg`} alt={e._creator} title={`${e._creator} 建檔`} className="rounded-full object-cover shrink-0 border border-white/50" style={{ width: s, height: s }} />
      : <span className="rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold border border-white/50 bg-black/30" style={{ width: s, height: s }} title={`${e._creator} 建檔`}>{String(e._creator).charAt(0)}</span>
  ) : null;
  const titleOf = (e) => e.isReminder ? e.title : getEventLabel(e);
  const Chip = ({ e, big }) => {
    const g = CAL_GROUPS[calGroupKey(e)];
    const done = e.status === 'completed';
    return (
      <button type="button" onClick={(ev) => { ev.stopPropagation(); onEventClick(e); }} title={`${e.time || ''} ${titleOf(e)}${e.customerName ? ' · ' + e.customerName : ''}`}
        className={`w-full flex items-center gap-1 px-1.5 rounded-md text-left text-white font-semibold truncate ${big ? 'py-1.5 text-[13px]' : 'py-[3px] text-[12px]'} ${done ? 'opacity-55' : ''}`} style={{ background: g.color + "f2" }}>
        {done && <span>✓</span>}
        {big && e.time && <span className="tabular-nums text-white/85 shrink-0">{e.time}</span>}
        <span className="truncate flex-1">{titleOf(e)}{big && e.customerName ? ` · ${e.customerName}` : ''}</span>
        {creatorBadge(e, big ? 18 : 15)}
      </button>
    );
  };

  const listDays = useMemo(() => Object.keys(eventsByDate).filter(d => d >= selectedDay.slice(0, 7) + '-01' && d.slice(0, 7) === selectedDay.slice(0, 7)).sort(), [eventsByDate, selectedDay]);
  const addItems = addItemsFor(selectedDay);
  const title = mode === 'day' ? `${sy}年${sm}月${Number(selectedDay.slice(8))}日` : `${sy}年${sm}月`;

  return (
    <div className="hidden md:flex flex-col gap-3 h-full md:min-h-[840px] text-white animate-fade-in">
      <div className="flex items-end justify-between shrink-0 px-1">
        <div>
          <h1 className="text-[28px] font-black leading-tight">行事曆</h1>
          <p className="text-[13px] text-white/55">{today}　週{dayNames[dayOfWeek(today)]}</p>
        </div>
        <div className="flex items-center gap-3 relative">
          {filterNode}
          {teamToggle}
          <button type="button" onClick={() => setMenuOpen(v => !v)} className="flex items-center gap-2 px-5 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-[14px] shadow-[0_0_20px_rgba(37,99,235,.5)]"><Plus size={18} />新增行程</button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-white/15 bg-[#0d1124]/95 backdrop-blur-xl p-1.5 shadow-2xl">
                {addItems.map(it => { const Ic = it.icon; return <button key={it.label} type="button" onClick={() => { setMenuOpen(false); it.onClick(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-[14px] text-left"><Ic size={16} className="text-blue-300" />{it.label}</button>; })}
              </div>
            </>
          )}
        </div>
      </div>

      <div className={`${card} p-4 flex-1 min-h-0 flex flex-col`}>
        <div className="flex items-center justify-between shrink-0 mb-3">
          <div className="flex items-center gap-2.5">
            <button type="button" onClick={() => setSelectedDay(today)} className="px-4 h-10 rounded-xl border border-white/20 bg-white/[0.06] text-[14px] font-semibold">今天</button>
            <button type="button" onClick={() => shift(-1)} className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.06] flex items-center justify-center"><ChevronLeft size={18} /></button>
            <span className="text-[22px] font-black px-2 min-w-[170px] text-center">{title}</span>
            <button type="button" onClick={() => shift(1)} className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.06] flex items-center justify-center"><ChevronRight size={18} /></button>
          </div>
          <div className="flex items-center gap-5">
            <div className="hidden xl:flex items-center gap-3 text-[12px] text-white/65">
              {['appt', 'interview', 'submit', 'recruit', 'meeting', 'activity', 'personal'].map(k => <span key={k} className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm" style={{ background: CAL_GROUPS[k].color }} />{CAL_GROUPS[k].label}</span>)}
            </div>
            <div className="flex rounded-xl border border-white/10 bg-white/[0.05] p-1">
              {[['month', '月'], ['week', '週'], ['day', '日'], ['list', '列表']].map(([k, l]) => <button key={k} type="button" onClick={() => setMode(k)} className={`px-5 h-9 rounded-lg text-[14px] font-semibold ${mode === k ? 'bg-blue-600 shadow-[0_0_14px_rgba(37,99,235,.55)]' : 'text-white/60'}`}>{l}</button>)}
            </div>
          </div>
        </div>

        {(mode === 'month' || mode === 'week') && (
          <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-white/10 overflow-hidden">
            <div className="grid grid-cols-7 shrink-0 bg-white/[0.04] text-center text-[13px] text-white/55">{dayNames.map(w => <div key={w} className="py-2">{w}</div>)}</div>
            <div className="grid grid-cols-7 flex-1 min-h-0" style={{ gridTemplateRows: `repeat(${mode === 'week' ? 1 : rows}, minmax(0, 1fr))` }}>
              {gridDays.map(d => {
                const evs = eventsByDate[d] || [];
                const sel = d === selectedDay, isToday = d === today;
                const inMonth = mode === 'week' || Number(d.slice(5, 7)) === sm;
                const hol = TAIWAN_HOLIDAYS_2026[d];
                const cap = mode === 'week' ? 12 : rows >= 6 ? 2 : 3;
                return (
                  <div key={d} onClick={() => setSelectedDay(d)} className={`border-t border-l border-white/[0.08] p-1.5 min-h-0 overflow-hidden cursor-pointer flex flex-col gap-[3px] ${sel ? 'bg-blue-500/10 ring-1 ring-inset ring-blue-400/70' : 'hover:bg-white/[0.03]'}`}>
                    <div className="flex items-center justify-between shrink-0">
                      <span className={`text-[13px] w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white font-bold' : hol ? 'text-rose-300' : inMonth ? 'text-white' : 'text-white/25'}`}>{Number(d.slice(8))}</span>
                      {hol && <span className="text-[10px] text-rose-300 truncate ml-1">{hol}</span>}
                    </div>
                    {evs.slice(0, cap).map(e => <Chip key={e.id + d} e={e} />)}
                    {evs.length > cap && <span className="text-[11px] text-white/50 pl-1">+{evs.length - cap} 項</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {mode === 'day' && (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
            {dayEvents.length === 0 && <p className="text-center text-white/45 py-16">這天沒有安排</p>}
            {dayEvents.map(e => <Chip key={e.id} e={e} big />)}
          </div>
        )}
        {mode === 'list' && (
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 grid grid-cols-2 gap-x-6">
            {listDays.length === 0 && <p className="text-center text-white/45 py-16 col-span-2">這個月沒有安排</p>}
            {listDays.map(d => (
              <div key={d} className="mb-3">
                <p className="text-[13px] text-white/55 mb-1.5">{Number(d.slice(5, 7))}/{Number(d.slice(8))}　週{dayNames[dayOfWeek(d)]}</p>
                <div className="space-y-1.5">{eventsByDate[d].map(e => <Chip key={e.id + d} e={e} big />)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`${card} p-4 shrink-0`} style={{ height: 196 }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[17px] font-bold">{selectedDay} 的行程 <span className="text-white/45 text-[13px] font-normal ml-2">共 {dayEvents.length} 項{holiday ? `　${holiday}` : ''}</span></p>
          <button type="button" onClick={() => addItems[0]?.onClick()} className="flex items-center gap-1.5 px-4 h-9 rounded-xl bg-blue-600 text-white font-bold text-[13px]"><Plus size={15} />新增</button>
        </div>
        <div className="space-y-1.5 overflow-y-auto no-scrollbar" style={{ maxHeight: 128 }}>
          {dayEvents.length === 0 && <p className="text-white/40 text-[13px] py-5 text-center">這天沒有安排</p>}
          {dayEvents.map(e => {
            const g = CAL_GROUPS[calGroupKey(e)];
            const done = e.status === 'completed';
            const sub = e.isReminder ? (e.note && !/^\d{1,2}:\d{2}/.test(e.note) ? e.note : '') : (e.customerName || '');
            return (
              <div key={e.id} className={`grid grid-cols-[18px_minmax(120px,1.2fr)_130px_1.4fr_1fr_90px] items-center gap-3 px-3 py-2 rounded-xl border border-white/[0.07] bg-white/[0.04] text-[13.5px] ${done ? 'opacity-55' : ''}`}>
                <i className="w-3 h-3 rounded-full" style={{ background: g.color, boxShadow: `0 0 8px ${g.color}99` }} />
                <span className={`font-bold truncate ${done ? 'line-through' : ''}`}>{titleOf(e)}<span className="ml-2 text-[11px] font-normal rounded px-1.5 py-0.5 border" style={{ color: g.color, borderColor: g.color + '77' }}>{g.label}</span></span>
                <span className="text-white/75 tabular-nums flex items-center gap-1.5"><Clock size={14} className="text-white/45" />{e.time ? `${e.time}${e.endTime ? '-' + e.endTime : ''}` : '全天'}</span>
                <span className="text-white/65 truncate flex items-center gap-1.5">{e.address ? <><MapPin size={14} className="text-white/45 shrink-0" />{e.address}</> : sub ? <><Users size={14} className="text-white/45 shrink-0" />{sub}</> : ''}</span>
                <span className="text-white/50 truncate flex items-center gap-1.5">{creatorBadge(e, 20)}{teamMode && e._creator ? e._creator : (sub && e.address ? sub : '')}</span>
                <button type="button" onClick={() => onEventClick(e)} className="flex items-center justify-center gap-1.5 h-8 rounded-lg border border-white/15 bg-white/[0.06] hover:bg-white/10 text-[12.5px] font-semibold"><Edit3 size={13} />{teamMode ? '查看' : '編輯'}</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const MobileCalendarView = ({ events, today, onEventClick, onAddForDate, onSearch, onFilter, filterActive, addItemsFor, getEventLabel, teamToggle, teamMode }) => {
  const [mode, setMode] = useState('month');
  const [selectedDay, setSelectedDay] = useState(today);
  const [chip, setChip] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach(e => {
      const last = e.endDate && e.endDate > e.date ? e.endDate : e.date;
      let cursor = e.date;
      let guard = 0;
      while (cursor <= last && guard < 62) {
        if (!map[cursor]) map[cursor] = [];
        map[cursor].push(e);
        cursor = dateAdd(cursor, 1);
        guard++;
      }
    });
    return map;
  }, [events]);

  const [sy, sm] = selectedDay.split('-').map(Number);
  const shift = (dir) => {
    if (mode === 'month') {
      const dim = new Date(sy, sm - 1 + dir + 1, 0).getDate();
      const d = new Date(sy, sm - 1 + dir, Math.min(Number(selectedDay.slice(8)), dim));
      setSelectedDay(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    } else setSelectedDay(dateAdd(selectedDay, mode === 'week' ? dir * 7 : dir));
    setChip('all');
  };

  const gridDays = useMemo(() => {
    if (mode === 'day') return [];
    if (mode === 'week') { const st = weekStartOf(selectedDay); return Array.from({ length: 7 }, (_, i) => dateAdd(st, i)); }
    const first = `${sy}-${String(sm).padStart(2, '0')}-01`;
    const start = dateAdd(first, -dayOfWeek(first));
    const dim = new Date(sy, sm, 0).getDate();
    const total = Math.ceil((dayOfWeek(first) + dim) / 7) * 7;
    return Array.from({ length: total }, (_, i) => dateAdd(start, i));
  }, [mode, selectedDay, sy, sm]);

  const dayEvents = (eventsByDate[selectedDay] || []).slice().sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
  const groupCounts = {};
  dayEvents.forEach(e => { const k = calGroupKey(e); groupCounts[k] = (groupCounts[k] || 0) + 1; });
  const shown = chip === 'all' ? dayEvents : dayEvents.filter(e => calGroupKey(e) === chip);
  const [, selM, selD] = selectedDay.split('-').map(Number);
  const holiday = TAIWAN_HOLIDAYS_2026[selectedDay];
  const glass = 'bg-white/[0.06] backdrop-blur-xl border border-white/10';
  const iconBtn = 'w-12 h-12 rounded-full bg-white/10 border border-white/15 flex items-center justify-center active:scale-95 transition';

  return (
    <div className="text-white space-y-4">
      <div className="flex items-start justify-between gap-3 px-1">
        <div>
          <h1 className="text-[32px] font-bold leading-tight">行事曆</h1>
          <p className="text-sm text-white/55 mt-1">掌握每一天，讓重要的事不漏接。</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button onClick={onSearch} aria-label="搜尋" className={iconBtn}><Search size={20} /></button>
          <button onClick={onFilter} aria-label="篩選" className={`${iconBtn} relative`}><SlidersHorizontal size={20} />{filterActive && <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500"></span>}</button>
        </div>
      </div>
      {teamToggle}

      <div className={`${glass} rounded-[28px] p-3`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex bg-white/[0.06] border border-white/10 rounded-2xl p-1">
            {[['month', '月'], ['week', '週'], ['day', '日']].map(([k, label]) => (
              <button key={k} onClick={() => setMode(k)} className={`px-5 py-2 rounded-xl text-[15px] font-semibold transition ${mode === k ? 'bg-blue-600 text-white shadow-[0_0_18px_rgba(37,99,235,.55)]' : 'text-white/55'}`}>{label}</button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => { setSelectedDay(today); setChip('all'); }} className="px-4 py-2 rounded-full bg-white/10 border border-white/15 text-sm font-semibold">今天</button>
            <button onClick={() => shift(-1)} aria-label="上一個" className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center"><ChevronLeft size={18} /></button>
            <button onClick={() => shift(1)} aria-label="下一個" className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="mt-3 rounded-3xl bg-black/20 border border-white/10 p-3">
          <p className="text-xl font-bold px-1 mb-2">{sy}年　{sm}月{mode === 'day' ? `　${selD}日` : ''}</p>
          {mode !== 'day' && (
            <>
              <div className="grid grid-cols-7 text-center text-[13px] text-white/50 mb-1">{dayNames.map(w => <div key={w} className="py-1.5">{w}</div>)}</div>
              <div className="grid grid-cols-7 border-t border-white/10">
                {gridDays.map(d => {
                  const evs = eventsByDate[d] || [];
                  const keys = [...new Set(evs.map(calGroupKey))].slice(0, 3);
                  const sel = d === selectedDay;
                  const isToday = d === today;
                  const inMonth = mode === 'week' || Number(d.slice(5, 7)) === sm;
                  const hol = TAIWAN_HOLIDAYS_2026[d];
                  return (
                    <button key={d} onClick={() => { setSelectedDay(d); setChip('all'); }} className="h-[54px] flex flex-col items-center pt-1.5 border-b border-white/[0.06]">
                      <span className={`w-10 h-8 rounded-xl flex items-center justify-center text-[17px] ${sel ? 'bg-blue-600 text-white font-semibold shadow-[0_0_20px_rgba(59,130,246,.6)]' : isToday ? 'ring-1 ring-blue-400/70 text-white' : hol ? 'text-rose-300' : inMonth ? 'text-white' : 'text-white/25'}`}>{Number(d.slice(8))}</span>
                      <span className="flex gap-1 mt-1 h-1.5">{keys.map(k => <i key={k} className="w-1.5 h-1.5 rounded-full" style={{ background: CAL_GROUPS[k].color }}></i>)}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3 text-[13px] text-white/70">
          {['appt', 'meeting', 'submit', 'recruit', 'activity', 'personal'].map(k => <span key={k} className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full" style={{ background: CAL_GROUPS[k].color }}></i>{CAL_GROUPS[k].label}</span>)}
        </div>
      </div>

      <div className={`${glass} rounded-[28px] p-4`}>
        <div className="flex items-baseline justify-between gap-2">
          <p><span className="text-[26px] font-bold">{selM}月{selD}日</span><span className="text-white/60 ml-2 text-lg">週{dayNames[dayOfWeek(selectedDay)]}</span></p>
          {holiday && <span className="text-xs text-rose-300">{holiday}</span>}
        </div>
        <div className="flex gap-2 overflow-x-auto mt-3 pb-1" style={{ scrollbarWidth: 'none' }}>
          <button onClick={() => setChip('all')} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border ${chip === 'all' ? 'bg-blue-600 border-blue-400/50 text-white' : 'bg-white/[0.06] border-white/10 text-white/70'}`}>全部 ({dayEvents.length})</button>
          {Object.keys(groupCounts).map(k => (
            <button key={k} onClick={() => setChip(k)} className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border ${chip === k ? 'bg-blue-600 border-blue-400/50 text-white' : 'bg-white/[0.06] border-white/10 text-white/70'}`}>{CAL_GROUPS[k].label} ({groupCounts[k]})</button>
          ))}
        </div>

        {shown.length === 0 && <p className="text-center text-white/45 text-sm py-10">這天沒有安排</p>}
        <div className="mt-4">
          {shown.map((e, i) => {
            const g = CAL_GROUPS[calGroupKey(e)];
            const isDone = e.status === 'completed';
            const title = e.isReminder ? e.title : getEventLabel(e);
            const sub = e.isReminder ? (e.note && !/^\d{1,2}:\d{2}/.test(e.note) ? e.note : '') : (e.customerName || '');
            return (
              <button key={e.id} onClick={() => onEventClick(e)} className={`w-full flex gap-2.5 text-left ${isDone ? 'opacity-55' : ''}`}>
                <div className="w-[48px] shrink-0 pt-4">
                  <p className="font-semibold tabular-nums leading-tight">{e.time || '全天'}</p>
                  {e.endTime && <p className="text-xs text-white/45 tabular-nums">{e.endTime}</p>}
                </div>
                <div className="relative w-3 shrink-0">
                  <span className="absolute left-1/2 -translate-x-1/2 top-[22px] w-3 h-3 rounded-full" style={{ background: g.color, boxShadow: `0 0 10px ${g.color}99` }}></span>
                  {i < shown.length - 1 && <span className="absolute left-1/2 top-[38px] -bottom-3 w-px bg-white/15"></span>}
                </div>
                <div className="flex-1 min-w-0 rounded-2xl bg-white/[0.06] border border-white/10 p-3.5 mb-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-[17px] font-bold truncate ${isDone ? 'line-through' : ''}`}>{title}</p>
                      <span className="text-[11px] rounded-md px-2 py-0.5 shrink-0 border" style={{ color: g.color, borderColor: `${g.color}88`, background: `${g.color}1f` }}>{g.label}</span>
                    </div>
                    {sub && <p className="text-[14px] text-white/70 mt-1 flex items-center gap-1.5 truncate"><Users size={14} className="shrink-0 text-white/50" />{sub}</p>}
                    {e.address && <p className="text-[13px] text-white/50 mt-1 flex items-center gap-1.5 truncate"><MapPin size={13} className="shrink-0" />{e.address}</p>}
                  </div>
                  {teamMode ? (
                    <span className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 border" style={e._creator ? { background: `${e._creatorColor}33`, borderColor: `${e._creatorColor}99`, color: e._creatorColor } : { background: 'rgba(255,255,255,.08)', borderColor: 'rgba(255,255,255,.12)' }} title={e._creator ? `${e._creator} 建檔` : ''}>{e._creator ? (AVATAR_FILES[e._creator] ? <img src={`/avatars/${AVATAR_FILES[e._creator]}.jpg`} alt={e._creator} className="w-full h-full rounded-full object-cover" /> : String(e._creator).charAt(0)) : <Users size={16} />}</span>
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm font-semibold shrink-0">{isDone ? '✓' : (e.customerName ? String(e.customerName).charAt(0) : <Users size={16} />)}</span>
                  )}
                  <ChevronRight size={18} className="text-white/35 shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {menuOpen && <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}></div>}
      {menuOpen && (
        <div className="fixed right-4 z-40 w-60 rounded-2xl bg-[#0d1124]/95 backdrop-blur-2xl border border-white/10 py-2 shadow-2xl animate-scale-up origin-bottom-right" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 160px)' }}>
          {addItemsFor(selectedDay).map((it, idx) => {
            const Icon = it.icon;
            return (
              <button key={idx} onClick={() => { setMenuOpen(false); it.onClick(); }} className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-white/10">
                <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Icon size={17} /></span>
                <span className="text-[15px] font-semibold">{it.label}</span>
              </button>
            );
          })}
        </div>
      )}
      <button onClick={() => setMenuOpen(v => !v)} aria-label="新增" className="fixed right-4 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_8px_30px_rgba(59,130,246,.55)] flex items-center justify-center active:scale-95 transition" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 86px)' }}>
        <Plus size={30} className={`transition-transform ${menuOpen ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
};

// --- 電腦版：客戶管理（深色看板＋新增趨勢）---
const DesktopCustomerBoard = ({ customers, list, records, search, setSearch, filters, setFilters, today, isVIP, isIG, isDue, onToggleWatch, onToggleRecruitWatch, onOpenEdit, onNetwork, onMerge, onDelete, onLine, getInstagramUrl, addItems, regions, tags, genders, incomes }) => {
  const [menuId, setMenuId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [range, setRange] = useState(6);
  const glass = 'rounded-2xl border border-white/10 bg-white/[0.045] backdrop-blur-xl';
  const tagCls = (t) => t === '準客戶' ? 'text-sky-300 border-sky-400/40 bg-sky-500/10' : t === '準增員' ? 'text-violet-300 border-violet-400/40 bg-violet-500/10' : t === '既有客戶' ? 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10' : (t === '重點客戶' || t === 'VIP') ? 'text-amber-300 border-amber-400/40 bg-amber-500/10' : t === 'IG名單' ? 'text-pink-300 border-pink-400/40 bg-pink-500/10' : 'text-white/70 border-white/20 bg-white/5';
  const monthOf = (c) => (c.createdAt || '').slice(0, 7);
  const thisM = today.slice(0, 7);
  const prevM = (() => { const [y, m] = thisM.split('-').map(Number); const d = new Date(y, m - 2, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })();
  const dealMonth = (m) => { const names = new Set((records || []).filter(r => (r.date || '').startsWith(m)).map(r => String(r.insuredName || '').trim()).filter(Boolean)); return customers.filter(c => names.has(String(c.name || '').trim())).length; };
  const addThis = customers.filter(c => monthOf(c) === thisM).length;
  const addPrev = customers.filter(c => monthOf(c) === prevM).length;
  const dealThis = dealMonth(thisM), dealPrev = dealMonth(prevM);
  const recruitN = customers.filter(c => (c.tags || []).includes('準增員')).length;
  const totalPrev = customers.filter(c => monthOf(c) && monthOf(c) < thisM).length;
  const growth = (a, b) => b > 0 ? Math.round((a - b) / b * 100) : (a > 0 ? 100 : 0);
  const series = useMemo(() => {
    const [y, m] = thisM.split('-').map(Number);
    return Array.from({ length: range }, (_, i) => {
      const d = new Date(y, m - 1 - (range - 1 - i), 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return { name: `${d.getMonth() + 1}月`, v: customers.filter(c => monthOf(c) === key).length };
    });
  }, [customers, range, thisM]);
  const Delta = ({ v }) => <span className={`text-[12px] font-semibold ${v >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{v >= 0 ? '↑' : '↓'} {Math.abs(v)}% <span className="text-white/40 font-normal">較上月</span></span>;
  const KPI = ({ icon: Ic, label, value, delta, color }) => (
    <div className={`${glass} p-3.5 flex items-center gap-3`}>
      <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: color + '26', color }}><Ic size={24} /></span>
      <div className="min-w-0"><p className="text-[12.5px] text-white/60">{label}</p><p className="text-[28px] font-black leading-none my-1">{value}</p>{delta}</div>
    </div>
  );

  const cols = [
    { k: '準客戶', color: '#38bdf8', pick: c => (c.tags || []).includes('準客戶') },
    { k: '既有客戶', color: '#34d399', pick: c => (c.tags || []).includes('既有客戶') },
    { k: '準增員', color: '#a78bfa', pick: c => (c.tags || []).includes('準增員') },
    { k: 'IG名單', color: '#f472b6', pick: c => isIG(c) },
    { k: '未分類', color: '#94a3b8', pick: c => !(c.tags || []).some(t => ['準客戶', '既有客戶', '準增員'].includes(t)) && !isIG(c) },
  ].map(col => ({ ...col, items: list.filter(col.pick) }));
  const lastContact = (c) => {
    const last = (c.visitLog || []).reduce((m, v) => (v.date && v.date > m ? v.date : m), '');
    if (!last) return null;
    const diff = Math.round((new Date(today) - new Date(last)) / 86400000);
    return { diff, text: diff <= 0 ? '今天' : `${diff} 天前` };
  };
  const menuCustomer = customers.find(c => c.id === menuId);
  const sel = 'h-11 rounded-xl text-[13px] font-semibold px-3';

  return (
    <div className="hidden md:flex flex-col gap-3 h-full md:min-h-[840px] text-white animate-fade-in">
      <div className="flex items-end justify-between shrink-0 px-1">
        <div>
          <h1 className="text-[28px] font-black leading-tight">客戶管理</h1>
          <p className="text-[13px] text-white/55">有效管理客戶、追蹤進度、提升成交與增員機會　·　共 {customers.length.toLocaleString()} 位</p>
        </div>
        <div className="relative">
          <button type="button" onClick={() => setShowAdd(v => !v)} className="flex items-center gap-2 px-5 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-[14px] shadow-[0_0_20px_rgba(37,99,235,.5)]"><Plus size={18} />新增客戶</button>
          {showAdd && (<>
            <div className="fixed inset-0 z-40" onClick={() => setShowAdd(false)} />
            <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-white/15 bg-[#0d1124]/95 backdrop-blur-xl p-1.5 shadow-2xl">
              {addItems.map(it => { const Ic = it.icon; return <button key={it.label} type="button" onClick={() => { setShowAdd(false); it.onClick(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-[14px] text-left"><Ic size={16} className="text-blue-300" />{it.label}</button>; })}
            </div></>)}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1.7fr] gap-3 shrink-0">
        <KPI icon={Users} label="客戶總數" value={customers.length.toLocaleString()} delta={<Delta v={growth(customers.length, totalPrev)} />} color="#60a5fa" />
        <KPI icon={UserPlus} label="本月新增" value={addThis} delta={<Delta v={growth(addThis, addPrev)} />} color="#2dd4bf" />
        <KPI icon={CheckCircle2} label="本月成交" value={dealThis} delta={<Delta v={growth(dealThis, dealPrev)} />} color="#fbbf24" />
        <KPI icon={Award} label="潛在增員" value={recruitN} delta={<span className="text-[12px] text-white/45">標籤「準增員」</span>} color="#a78bfa" />
        <div className={`${glass} p-3 pb-1`}>
          <div className="flex items-center justify-between"><p className="font-bold text-[14px]">客戶新增趨勢</p>
            <select value={range} onChange={e => setRange(Number(e.target.value))} className="h-7 rounded-lg text-[12px] px-2" style={{ minHeight: 0 }}><option value={6}>近 6 個月</option><option value={12}>近 12 個月</option></select></div>
          <div style={{ height: 82 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 14, right: 12, left: 12, bottom: 0 }}>
                <defs><linearGradient id="custTrend" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.55} /><stop offset="100%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,.5)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ stroke: 'rgba(255,255,255,.2)' }} contentStyle={{ background: '#0d1124', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, color: '#fff', fontSize: 12 }} formatter={(v) => [v + ' 位', '新增']} />
                <Area type="monotone" dataKey="v" stroke="#60a5fa" strokeWidth={2.5} fill="url(#custTrend)" dot={{ r: 3, fill: '#60a5fa', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#fff', stroke: '#3b82f6', strokeWidth: 3 }} isAnimationActive animationDuration={1200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <div className={`${glass} flex-1 flex items-center gap-2.5 px-4 h-11`}>
          <Search size={17} className="text-white/50 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜尋姓名、電話、IG 帳號、標籤、備註…" className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-white/35 min-w-0" />
        </div>
        <select className={sel} value={filters.tag} onChange={e => setFilters({ ...filters, tag: e.target.value })}><option value="">全部標籤</option>{tags.map(t => <option key={t} value={t}>{t}</option>)}</select>
        <select className={sel} value={filters.region} onChange={e => setFilters({ ...filters, region: e.target.value })}><option value="">全部地區</option>{regions.map(r => <option key={r} value={r}>{r}</option>)}</select>
        <select className={sel} value={filters.gender} onChange={e => setFilters({ ...filters, gender: e.target.value })}><option value="">全部性別</option>{genders.map(g => <option key={g} value={g}>{g}</option>)}</select>
        <select className={sel} value={filters.incomeRange} onChange={e => setFilters({ ...filters, incomeRange: e.target.value })}><option value="">全部年收入</option>{incomes.map(r => <option key={r} value={r}>{r}</option>)}</select>
        {[['vipOnly', 'VIP'], ['igOnly', '有 IG'], ['salesWatchOnly', '關注銷售'], ['recruitWatchOnly', '關注增員']].map(([k, l]) => (
          <button key={k} type="button" onClick={() => setFilters({ ...filters, [k]: !filters[k] })} className={`h-11 px-3.5 rounded-xl text-[13px] font-semibold border whitespace-nowrap ${filters[k] ? 'bg-blue-500/25 border-blue-400/70 text-white' : 'border-white/12 bg-white/[0.05] text-white/65'}`}>{l}</button>
        ))}
      </div>

      <div className="grid gap-3 flex-1 min-h-0" style={{ gridTemplateColumns: `repeat(${cols.filter(c => c.k !== '未分類' || c.items.length > 0).length}, minmax(0, 1fr))` }}>
        {cols.filter(c => c.k !== '未分類' || c.items.length > 0).map(col => (
          <div key={col.k} className="rounded-2xl border bg-white/[0.03] flex flex-col min-h-0" style={{ borderColor: col.color + '66', boxShadow: `inset 0 1px 0 ${col.color}33, 0 0 22px ${col.color}12` }}>
            <div className="px-3.5 pt-3 pb-2.5 shrink-0 flex items-center justify-between">
              <p className="font-black text-[16px] flex items-center gap-2" style={{ color: col.color }}>{col.k}<span className="text-[12px] rounded-full px-2 py-0.5 bg-white/10 text-white/80 font-semibold">{col.items.length}</span></p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-2.5 pb-2.5 space-y-2">
              {col.items.length === 0 && <p className="text-center text-white/35 text-[13px] py-8">沒有客戶</p>}
              {col.items.slice(0, 80).map(c => {
                const lc = lastContact(c);
                const chips = [...(c.tags || []).filter(t => t !== col.k), ...(isVIP(c) ? ['VIP'] : []), ...(isIG(c) && col.k !== 'IG名單' ? ['IG名單'] : [])];
                return (
                  <div key={c.id} className={`rounded-xl border bg-white/[0.05] p-2.5 hover:bg-white/[0.08] transition ${isDue(c) ? 'border-amber-400/60' : 'border-white/10'}`}>
                    <div className="flex items-start gap-2.5">
                      <button type="button" onClick={() => onOpenEdit(c)} className="w-10 h-10 rounded-full bg-gradient-to-br from-white/15 to-white/5 border border-white/15 flex items-center justify-center font-bold shrink-0">{String(c.name || '?').charAt(0)}</button>
                      <button type="button" onClick={() => onOpenEdit(c)} className="min-w-0 flex-1 text-left">
                        <p className="font-bold text-[14.5px] truncate">{c.name}</p>
                        {chips.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{chips.slice(0, 3).map(t => <span key={t} className={`text-[10px] rounded px-1.5 py-px border ${tagCls(t)}`}>{t}</span>)}</div>}
                        <p className="text-[11.5px] text-white/50 mt-1 truncate">{[c.region, c.age ? c.age + '歲' : '', c.incomeRange].filter(Boolean).join(' · ') || '—'}</p>
                      </button>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => onToggleWatch(c)} title="關注銷售"><Star size={15} className={c.specialFocus ? 'fill-amber-400 text-amber-400' : 'text-white/30'} /></button>
                          <button type="button" onClick={() => setMenuId(c.id)}><MoreVertical size={16} className="text-white/55" /></button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/[0.07]">
                      <span className="text-[11px] text-white/45">上次聯繫 <b className={lc ? (lc.diff <= 0 ? 'text-emerald-300' : lc.diff <= 7 ? 'text-amber-300' : 'text-rose-300') : 'text-white/40'}>{lc ? lc.text : '無'}</b></span>
                      <span className="flex items-center gap-1.5">
                        {c.phone ? <a href={`tel:${c.phone}`} className="w-7 h-7 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center"><Phone size={13} /></a> : null}
                        {c.lineId ? <button type="button" onClick={() => onLine(c.lineId)} className="h-7 px-2 rounded-full bg-white/[0.08] border border-white/10 text-[9px] font-extrabold text-emerald-300">LINE</button> : null}
                        {c.igHandle ? <a href={getInstagramUrl(c.igHandle)} target="_blank" rel="noopener noreferrer" className="h-7 px-2 rounded-full bg-white/[0.08] border border-white/10 text-[10px] font-extrabold text-pink-300 flex items-center">IG</a> : null}
                      </span>
                    </div>
                    {isDue(c) && <p className="text-[11px] font-semibold text-amber-300 mt-1.5">⚠ 追蹤日期已到：{c.nextFollowUpDate}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {menuCustomer && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center" onClick={() => setMenuId(null)}>
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
          <div className="relative w-[320px] rounded-3xl border border-white/15 bg-[#0c1020] p-3 text-white" onClick={e => e.stopPropagation()}>
            <p className="px-3 pt-2 pb-3 font-bold text-[16px] truncate">{menuCustomer.name}</p>
            {[['關聯網', GitBranch, () => onNetwork(menuCustomer.id)], ['合併客戶', Users, () => onMerge(menuCustomer.id)], ['編輯', Edit3, () => onOpenEdit(menuCustomer)], [menuCustomer.specialFocusRecruit ? '取消關注增員' : '關注增員', Star, () => onToggleRecruitWatch(menuCustomer)]].map(([l, Ic, fn]) => (
              <button key={l} type="button" onClick={() => { setMenuId(null); fn(); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 text-[15px] text-left"><Ic size={17} className="text-blue-300" />{l}</button>
            ))}
            <button type="button" onClick={() => { const id = menuCustomer.id; setMenuId(null); onDelete(id); }} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-rose-500/15 text-[15px] text-left text-rose-300"><Trash2 size={17} />刪除</button>
            <button type="button" onClick={() => setMenuId(null)} className="w-full mt-1 py-3 rounded-xl bg-white/10 text-[15px] font-semibold">取消</button>
          </div>
        </div>
      )}
    </div>
  );
};

const MobileCustomerList = ({ list, total, counts, quick, setQuick, search, setSearch, showFilter, setShowFilter, filterPanel, filterActive, visible, setVisible, today, isVIP, isIG, isDue, onToggleWatch, onOpenEdit, onNetwork, onMerge, onDelete, onLine, menuId, setMenuId, addItems, getInstagramUrl }) => {
  const [fab, setFab] = useState(false);
  const glass = 'bg-white/[0.06] backdrop-blur-xl border border-white/10';
  const tagCls = (t) => t === '準客戶' ? 'text-sky-300 border-sky-400/40 bg-sky-500/10' : t === '準增員' ? 'text-violet-300 border-violet-400/40 bg-violet-500/10' : (t === '重點客戶' || t === 'VIP') ? 'text-amber-300 border-amber-400/40 bg-amber-500/10' : t === 'IG名單' ? 'text-pink-300 border-pink-400/40 bg-pink-500/10' : 'text-emerald-300 border-emerald-400/40 bg-emerald-500/10';
  const lastContact = (c) => {
    const last = (c.visitLog || []).reduce((m, v) => (v.date && v.date > m ? v.date : m), '');
    if (!last) return null;
    const diff = Math.round((new Date(today) - new Date(last)) / 86400000);
    return { diff, text: diff <= 0 ? '今天' : `${diff} 天前` };
  };
  const tiles = [
    { k: 'all', label: '全部客戶', n: counts.all, dot: null },
    { k: 'prospect', label: '準客戶', n: counts.prospect, dot: '#3b82f6' },
    { k: 'recruit', label: '準增員', n: counts.recruit, dot: '#a78bfa' },
    { k: 'ig', label: 'IG名單', n: counts.ig, dot: '#f472b6' }
  ];
  const circ = 'w-9 h-9 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center text-white/85';

  return (
    <div className="text-white space-y-4">
      <div className="flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <h1 className="text-[32px] font-bold leading-tight">客戶管理</h1>
          <p className="text-sm text-white/55 mt-1">共 {total.toLocaleString()} 位客戶．持續建立關係</p>
        </div>
        <button onClick={() => setFab(v => !v)} aria-label="更多" className="w-12 h-12 rounded-full bg-white/10 border border-white/15 flex items-center justify-center shrink-0"><MoreVertical size={20} className="rotate-90" /></button>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {tiles.map(t => (
          <button key={t.k} onClick={() => { setQuick(t.k); setVisible(40); }} className={`${glass} rounded-2xl px-3 py-3 text-left transition ${quick === t.k ? '!border-blue-400/70 bg-blue-500/15 shadow-[0_0_20px_rgba(59,130,246,.3)]' : ''}`}>
            <p className="text-[12px] text-white/60 truncate">{t.label}</p>
            <p className="mt-1 flex items-center gap-1.5"><b className="text-[19px] font-semibold tabular-nums leading-none">{t.n.toLocaleString()}</b>{t.dot && <i className="w-2 h-2 rounded-full shrink-0" style={{ background: t.dot }}></i>}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-2.5">
        <div className={`${glass} flex-1 rounded-2xl flex items-center gap-2.5 px-4 h-[52px]`}>
          <Search size={18} className="text-white/50 shrink-0" />
          <input value={search} onChange={e => { setSearch(e.target.value); setVisible(40); }} placeholder="搜尋姓名、電話、IG 帳號" className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-white/35 min-w-0" />
        </div>
        <button onClick={() => setShowFilter(!showFilter)} aria-label="篩選" className={`${glass} relative w-[52px] h-[52px] rounded-2xl flex items-center justify-center shrink-0`}><SlidersHorizontal size={19} />{filterActive && <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500"></span>}</button>
      </div>
      {showFilter && <div className="rounded-3xl bg-[#f5f5f7] text-gray-900 p-4">{filterPanel}</div>}

      <div className="space-y-3">
        {list.slice(0, visible).map(c => {
          const lc = lastContact(c);
          const tags = [...(c.tags || []), ...(isVIP(c) ? ['VIP'] : []), ...(isIG(c) ? ['IG名單'] : [])];
          return (
            <div key={c.id} className={`${glass} rounded-3xl p-3.5 ${isDue(c) ? '!border-amber-400/50' : ''}`}>
              <div className="flex items-start gap-3">
                <button onClick={() => onOpenEdit(c)} className="w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-lg font-semibold shrink-0">{String(c.name || '?').charAt(0)}</button>
                <button onClick={() => onOpenEdit(c)} className="min-w-0 flex-1 text-left">
                  <p className="font-bold text-[17px] truncate">{c.name}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {tags.map(t => <span key={t} className={`text-[11px] rounded-full px-2.5 py-0.5 border ${tagCls(t)}`}>{t}</span>)}
                  </div>
                  {c.igHandle && <p className="text-[13px] text-pink-300/90 mt-1.5 truncate">IG: {c.igHandle}</p>}
                  {(c.region || c.incomeRange) && <p className="text-[13px] text-white/50 mt-1 flex items-center gap-1 truncate"><MapPin size={12} className="shrink-0" />{[c.region, c.incomeRange].filter(Boolean).join('．')}</p>}
                </button>
                <div className="shrink-0 flex flex-col items-end gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-white/50 whitespace-nowrap">上次聯繫 <b className={lc ? (lc.diff <= 0 ? 'text-emerald-300' : lc.diff <= 7 ? 'text-amber-300' : 'text-rose-300') : 'text-white/40'}>{lc ? lc.text : '無'}</b></span>
                    <button onClick={() => onToggleWatch(c)} aria-label="關注"><Star size={19} className={c.specialFocus ? 'fill-amber-400 text-amber-400' : 'text-white/35'} /></button>
                    <button onClick={() => setMenuId(c.id)} aria-label="更多" className="p-0.5"><MoreVertical size={19} className="text-white/60" /></button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {c.phone ? <a href={`tel:${c.phone}`} aria-label="撥打電話" className={circ}><Phone size={16} /></a> : <span className={`${circ} opacity-30`}><Phone size={16} /></span>}
                    {c.lineId ? <button onClick={() => onLine(c.lineId)} aria-label="LINE" className={`${circ} text-[9px] font-extrabold text-emerald-300`}>LINE</button> : <span className={`${circ} opacity-30 text-[9px] font-extrabold`}>LINE</span>}
                    {c.igHandle ? <a href={getInstagramUrl(c.igHandle)} target="_blank" rel="noopener noreferrer" aria-label="IG" className={`${circ} text-[11px] font-extrabold text-pink-300`}>IG</a> : <span className={`${circ} opacity-30 text-[11px] font-extrabold`}>IG</span>}
                    <button onClick={() => onOpenEdit(c)} aria-label="查看" className="text-white/35"><ChevronRight size={20} /></button>
                  </div>
                </div>
              </div>
              {isDue(c) && <p className="text-[11px] font-semibold text-amber-300 mt-2.5">⚠ 追蹤日期已到：{c.nextFollowUpDate}</p>}
            </div>
          );
        })}
        {list.length === 0 && <p className="text-center text-white/45 py-14 text-sm">{total === 0 ? '還沒有客戶資料，點右下角「＋」開始建立' : '沒有符合條件的客戶'}</p>}
        {list.length > visible && <button onClick={() => setVisible(v => v + 40)} className={`${glass} w-full rounded-2xl py-3.5 text-sm font-semibold text-white/80`}>載入更多（還有 {list.length - visible} 位）</button>}
      </div>

      {menuId && (() => {
        const c = list.find(x => x.id === menuId);
        if (!c) return null;
        const items = [
          { l: '關聯網', Icon: GitBranch, cls: 'text-violet-300', f: () => onNetwork(c.id) },
          { l: '合併客戶', Icon: Users, cls: 'text-teal-300', f: () => onMerge(c.id) },
          { l: '編輯', Icon: Edit3, cls: 'text-sky-300', f: () => onOpenEdit(c) },
          { l: '刪除', Icon: Trash2, cls: 'text-rose-300', f: () => onDelete(c.id) },
        ];
        return (
          <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setMenuId(null)}>
            <div className="w-full max-w-md rounded-t-[28px] border-t border-white/10 bg-[#0c1020] text-white p-4" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)' }} onClick={e => e.stopPropagation()}>
              <p className="text-center text-[15px] font-bold mb-3">{c.name}</p>
              <div className="space-y-2">
                {items.map(it => (
                  <button key={it.l} onClick={() => { setMenuId(null); it.f(); }} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/[0.07] text-left active:bg-white/15"><it.Icon size={18} className={it.cls} /><span className={`text-[15px] font-semibold ${it.l === '刪除' ? 'text-rose-300' : ''}`}>{it.l}</span></button>
                ))}
              </div>
              <button onClick={() => setMenuId(null)} className="w-full mt-3 py-3.5 rounded-2xl bg-white/10 font-bold text-[15px]">取消</button>
            </div>
          </div>
        );
      })()}

      {fab && <div className="fixed inset-0 z-40" onClick={() => setFab(false)}></div>}
      {fab && (
        <div className="fixed right-4 z-40 w-56 rounded-2xl bg-[#0d1124]/95 backdrop-blur-2xl border border-white/10 py-2 shadow-2xl animate-scale-up origin-bottom-right" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 160px)' }}>
          {addItems.map((it, idx) => { const Icon = it.icon; return (
            <button key={idx} onClick={() => { setFab(false); it.onClick(); }} className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-white/10">
              <span className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0"><Icon size={17} /></span>
              <span className="text-[15px] font-semibold">{it.label}</span>
            </button>
          ); })}
        </div>
      )}
      <button onClick={() => setFab(v => !v)} aria-label="新增" className="fixed right-4 z-40 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_8px_30px_rgba(59,130,246,.55)] flex items-center justify-center active:scale-95 transition" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 86px)' }}>
        <Plus size={30} className={`transition-transform ${fab ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
};

const CalendarPage = ({ loggedInUser, customers, scheduleEvents, team, recurringRules, teamScheduleEvents, isTeamScheduleViewer, onSearch }) => {
  const today = getTodayDate();
  const [busyId, setBusyId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [showRecurringManage, setShowRecurringManage] = useState(false);
  const [showBatchSchedule, setShowBatchSchedule] = useState(false);
  const [showBatchActivity, setShowBatchActivity] = useState(false);
  const emptyForm = { customerId: '', customerIds: [], type: 'appointment', date: getTodayDate(), endDate: '', time: '', endTime: '', note: '', priority: 'normal', address: '', participantIds: loggedInUser ? [loggedInUser.id] : [] };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState(getTodayDate());
  const [reminderTime, setReminderTime] = useState('');
  const [reminderEndDate, setReminderEndDate] = useState('');
  const [reminderEndTime, setReminderEndTime] = useState('');
  const [reminderNote, setReminderNote] = useState('');
  const [reminderAddress, setReminderAddress] = useState('');
  const [reminderCategory, setReminderCategory] = useState('personal');
  const [reminderPriority, setReminderPriority] = useState('normal');
  const [reminderSaving, setReminderSaving] = useState(false);
  const [reminderParticipantIds, setReminderParticipantIds] = useState(() => loggedInUser ? [loggedInUser.id] : []);

  const [editingEvent, setEditingEvent] = useState(null);

  const [completingEvent, setCompletingEvent] = useState(null);
  const [followUpInput, setFollowUpInput] = useState('');

  const emptyRecurringForm = { title: '', frequency: 'weekly', dayOfWeek: 1, weekOfMonth: 1, dayOfWeekForMonthly: 1, startTime: '', endTime: '', participantIds: loggedInUser ? [loggedInUser.id] : [], startDate: getTodayDate(), endDate: '', category: 'meeting', priority: 'normal' };
  const [recurringForm, setRecurringForm] = useState(emptyRecurringForm);
  const [recurringSaving, setRecurringSaving] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);

  // 分類/優先度篩選
  const [filterCategory, setFilterCategory] = useState('');
  const [viewMode, setViewMode] = useState(loggedInUser?.defaultScheduleView || 'timeline');
  const [savingDefaultView, setSavingDefaultView] = useState(false);
  const handleSetDefaultView = async () => {
    if (!loggedInUser) return;
    setSavingDefaultView(true);
    try { await updateDoc(doc(db, 'user', loggedInUser.id), { defaultScheduleView: viewMode }); } catch (e) { console.error(e); } finally { setSavingDefaultView(false); }
  };
  const [filterPriority, setFilterPriority] = useState('');
  const [showTeamView, setShowTeamView] = useState(false);
  const [mobTeam, setMobTeam] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const VIEW_MODE_ORDER = ['timeline', 'calendar', 'list'];
  const touchStartX = useRef(null);
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 60) return;
    const idx = VIEW_MODE_ORDER.indexOf(viewMode);
    if (deltaX < 0 && idx < VIEW_MODE_ORDER.length - 1) setViewMode(VIEW_MODE_ORDER[idx + 1]);
    if (deltaX > 0 && idx > 0) setViewMode(VIEW_MODE_ORDER[idx - 1]);
  };
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
          creatorId: rule.creatorId || '',
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
    if (e.endDate) return e.date <= today && today <= e.endDate;
    return e.date <= today;
  };
  const dueEvents = useMemo(() => allItems.filter(e => e.status === 'scheduled' && isEventActiveToday(e) && matchesFilter(e)).sort(sortByPriorityThenDate), [allItems, today, filterCategory, filterPriority]);

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

  // 手機版「團隊」檢視：吳政翰看全部；其他人看「吳政翰的分類行程(去識別)」與自己的直屬業務員
  const rootMember = useMemo(() => (team || []).find(m => m.name === '吳政翰'), [team]);
  const CREATOR_COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#fb923c', '#22d3ee', '#f87171', '#a3e635', '#e879f9'];
  const colorOfPerson = (id) => { let h = 0; String(id || '').split('').forEach(ch => { h = (h * 31 + ch.charCodeAt(0)) >>> 0; }); return CREATOR_COLORS[h % CREATOR_COLORS.length]; };
  const teamDisplayEvents = useMemo(() => {
    if (!loggedInUser) return [];
    const directIds = new Set((team || []).filter(m => m.parentId && String(m.parentId) === String(loggedInUser.id)).map(m => m.id));
    const out = [];
    (teamScheduleEvents || []).forEach(e => {
      if (e.status !== 'scheduled' && e.status !== 'completed') return;
      const owner = (team || []).find(m => m.id === e.ownerId);
      const creatorId = e.createdById || e.ownerId;
      const creator = e.createdByName || (team || []).find(m => m.id === creatorId)?.name || (owner ? owner.name : '');
      if (isTeamScheduleViewer || directIds.has(e.ownerId)) {
        const who = owner ? owner.name : '未知同仁';
        out.push({ ...e, customerName: e.customerName ? `${who} · ${e.customerName}` : who, _team: true, _creator: creator, _creatorColor: colorOfPerson(creatorId) });
      } else if (rootMember && e.ownerId === rootMember.id) {
        out.push({ id: e.id, status: e.status, date: e.date, endDate: e.endDate || '', time: e.time || '', endTime: e.endTime || '', type: e.type, isReminder: !!e.isReminder, category: e.category, priority: e.priority, title: e.isReminder ? (REMINDER_CATEGORIES[e.category]?.label || '提醒') : '', customerName: '', address: '', note: '', _team: true, _creator: '', _masked: true });
      }
    });
    return out;
  }, [teamScheduleEvents, team, loggedInUser, isTeamScheduleViewer, rootMember]);

  const completedRecent = useMemo(() => [...scheduleEvents].filter(e => e.status === 'completed').sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || '')).slice(0, 15), [scheduleEvents]);

  // 月曆檢視專用：不管完成與否，全部顯示，這樣回顧那天做過什麼才不會不見
  const calendarEvents = useMemo(() => allItems.filter(e => e.status === 'scheduled' || e.status === 'completed'), [allItems]);

  // --- 完成行程 ---
  const handleCompleteEvent = async (event) => {
    if (!loggedInUser || event.status === 'completed') return;
    setCompletingEvent(event);
    setFollowUpInput('');
  };

  const handleConfirmCompleteEvent = async () => {
    if (!completingEvent || !loggedInUser) return;
    setBusyId(completingEvent.id);
    try {
      if (completingEvent.isVirtual) {
        await addDoc(collection(db, 'schedule_events'), {
          ownerId: loggedInUser.id, ruleId: completingEvent.ruleId, customerId: '', customerName: '',
          isReminder: true, type: 'reminder', title: completingEvent.title, category: completingEvent.category, priority: completingEvent.priority, createdById: completingEvent.creatorId || loggedInUser.id,
          date: completingEvent.date, time: completingEvent.time, note: completingEvent.note,
          status: 'completed', completedAt: new Date().toISOString(), createdAt: new Date().toISOString()
        });
      } else {
        await completeScheduleEvent(completingEvent, loggedInUser.id);
        if (followUpInput && completingEvent.customerId) {
          await updateDoc(doc(db, 'customers', completingEvent.customerId), { nextFollowUpDate: followUpInput });
        }
      }
      setCompletingEvent(null);
    } catch (e) { console.error(e); } finally { setBusyId(null); }
  };

  const handleUndoComplete = async (event) => {
    if (!loggedInUser) return;
    setBusyId(event.id);
    try { await undoCompleteScheduleEvent(event, loggedInUser.id); } catch (e) { console.error(e); } finally { setBusyId(null); }
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
    if (!loggedInUser || !form.date || (form.participantIds || []).length === 0) return;
    setSaving(true);
    try {
      // 沒勾選任何客戶的話，就跟以前一樣建一筆「不關聯客戶」的行程；有勾選的話，每位客戶各自算一筆(都算進自己的活動量)
      const customerIds = form.customerIds.length > 0 ? form.customerIds : [''];
      const batch = writeBatch(db);
      (form.participantIds || [loggedInUser.id]).forEach(pid => {
        customerIds.forEach(cid => {
          const customer = customers.find(c => c.id === cid);
          const ref = doc(collection(db, 'schedule_events'));
          batch.set(ref, {
            ownerId: pid,
            customerId: cid || '',
            customerName: customer ? customer.name : '',
            type: form.type,
            isReminder: false,
            title: '',
            priority: form.priority,
            date: form.date,
            endDate: (form.endDate && form.endDate > form.date) ? form.endDate : '',
            time: form.time,
            endTime: form.endTime,
            createdById: loggedInUser.id,
            createdByName: loggedInUser.name,
            note: form.note,
            address: form.address,
            status: 'scheduled',
            completedAt: null,
            createdAt: new Date().toISOString()
          });
        });
      });
      await batch.commit();
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
          endTime: reminderEndTime || '',
          time: reminderTime,
          note: reminderNote,
          address: reminderAddress,
          createdById: loggedInUser.id,
          createdByName: loggedInUser.name,
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
      setReminderEndTime('');
      setReminderNote('');
      setReminderAddress('');
      setReminderCategory('personal');
      setReminderPriority('normal');
      setReminderParticipantIds(loggedInUser ? [loggedInUser.id] : []);
      setShowReminderForm(false);
    } catch (e) { console.error(e); } finally { setReminderSaving(false); }
  };

  const [actionEvent, setActionEvent] = useState(null);
  const handleEventTap = (event) => setActionEvent(event);

  // 建檔人：新資料有記錄 createdByName；固定行程用規則建立者；舊資料沒有記錄就不顯示
  const getCreatorName = (e) => {
    if (e.createdByName) return e.createdByName;
    const id = e.createdById || e.creatorId;
    const m = id ? (team || []).find(t => t.id === id) : null;
    return m ? m.name : '';
  };
  // 列表上只在「別人幫你建的」才顯示，避免每筆都掛一行；完整建檔人在點開的操作選單裡
  const getCreatorHint = (e) => {
    const cid = e.createdById || e.creatorId;
    const name = getCreatorName(e);
    return name && cid && cid !== (e.ownerId || loggedInUser?.id) ? `${name} 建檔` : '';
  };

  const openEditEvent = (event) => { setEditingEvent({ ...event }); };

  // 拖移改日期：直接更新同一筆行程的日期欄位，不用刪除重建
  const handleDropOnDate = async (event, newDate) => {
    if (!event || event.isVirtual) return;
    try { await updateDoc(doc(db, 'schedule_events', event.id), { date: newDate }); } catch (e) { console.error(e); }
  };

  // 複製行程：把現有行程的內容帶進「新增行程」表單，方便快速建立同場合的另一筆(或調整日期後再存一次)
  const handleDuplicateEvent = (event) => {
    setForm({
      customerId: event.customerId || '',
      type: event.type || 'appointment',
      date: event.date || getTodayDate(),
      endDate: event.endDate || '',
      time: event.time || '',
      endTime: event.endTime || '',
      note: event.note || '',
      priority: event.priority || 'normal',
      address: event.address || '',
      participantIds: loggedInUser ? [loggedInUser.id] : []
    });
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleSaveEditEvent = async () => {
    if (!editingEvent) return;
    setSaving(true);
    try {
      let payload;
      if (editingEvent.isReminder) {
        payload = { title: editingEvent.title, date: editingEvent.date, endDate: editingEvent.endDate || '', endTime: editingEvent.endTime || '', time: editingEvent.time || '', note: editingEvent.note || '', address: editingEvent.address || '', category: editingEvent.category, priority: editingEvent.priority };
      } else {
        const customer = customers.find(c => c.id === editingEvent.customerId);
        payload = { type: editingEvent.type, customerId: editingEvent.customerId || '', customerName: customer ? customer.name : '', date: editingEvent.date, endDate: editingEvent.endDate || '', time: editingEvent.time, endTime: editingEvent.endTime || '', note: editingEvent.note, priority: editingEvent.priority, address: editingEvent.address || '' };
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

  const isEmpty = dueEvents.length === 0 && upcoming.length === 0;

  return (
    <div className="max-w-4xl md:max-w-none md:h-full mx-auto space-y-6 md:space-y-0 animate-fade-in pb-12 md:pb-0">
      <ConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDeleteConfirm} title="刪除行程" message="確定要刪除這筆行程嗎？" />
      <BatchScheduleModal isOpen={showBatchSchedule} onClose={() => setShowBatchSchedule(false)} loggedInUser={loggedInUser} team={team} />
      <BatchActivityImportModal isOpen={showBatchActivity} onClose={() => setShowBatchActivity(false)} loggedInUser={loggedInUser} customers={customers} team={team} />

      <div className="md:hidden">
        {(
          <MobileCalendarView
            events={mobTeam ? teamDisplayEvents.filter(matchesFilter) : calendarEvents.filter(matchesFilter)}
            teamMode={mobTeam}
            today={today}
            getEventLabel={getEventLabel}
            onEventClick={mobTeam ? (() => {}) : handleEventTap}
            onSearch={onSearch}
            onFilter={() => setShowFilterPanel(v => !v)}
            filterActive={!!(filterCategory || filterPriority)}
            teamToggle={(
              <div className="flex items-center gap-2 px-1">
                <div className="flex rounded-full border border-white/10 bg-white/[0.07] p-1">
                  {[[false, '個人'], [true, '團隊']].map(([k, l]) => (
                    <button key={l} onClick={() => setMobTeam(k)} className={`px-5 py-1.5 rounded-full text-[14px] font-bold transition ${mobTeam === k ? 'bg-blue-600 text-white shadow-[0_0_14px_rgba(37,99,235,.5)]' : 'text-white/55'}`}>{l}</button>
                  ))}
                </div>
                {mobTeam && <span className="text-[12px] text-white/45">{isTeamScheduleViewer ? '全員行程・圈圈＝建檔人' : '吳政翰的分類行程＋直屬業務'}</span>}
              </div>
            )}
            addItemsFor={(d) => [
              { label: '新增行程', icon: CalendarPlus, onClick: () => { setForm({ ...emptyForm, date: d }); setShowForm(true); } },
              { label: '純提醒', icon: Bell, onClick: () => { setReminderDate(d); setShowReminderForm(true); } },
              { label: '批次新增行程', icon: ListPlus, onClick: () => setShowBatchActivity(true) },
              { label: '批次新增提醒', icon: ListPlus, onClick: () => setShowBatchSchedule(true) },
              { label: '固定行程管理', icon: Repeat, onClick: () => setShowRecurringManage(true) }
            ]}
          />
        )}
        {showFilterPanel && (
          <>
            <div className="fixed inset-0 z-[55] bg-black/50" onClick={() => setShowFilterPanel(false)}></div>
            <div className="fixed left-3 right-3 z-[56] rounded-3xl bg-[#0d1124]/95 backdrop-blur-2xl border border-white/10 p-4 text-white space-y-3" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 90px)' }}>
              <p className="font-bold">篩選行程</p>
              <select className="w-full p-3 bg-white/10 border border-white/15 rounded-xl text-sm font-semibold outline-none" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option value="" className="text-black">全部分類</option>
                {EVENT_CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value} className="text-black">{o.label}</option>)}
              </select>
              <select className="w-full p-3 bg-white/10 border border-white/15 rounded-xl text-sm font-semibold outline-none" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                <option value="" className="text-black">全部優先度</option>
                {Object.entries(PRIORITY_LEVELS).map(([k, v]) => <option key={k} value={k} className="text-black">{v.label}</option>)}
              </select>
              <div className="flex gap-2">
                {(filterCategory || filterPriority) && <button onClick={() => { setFilterCategory(''); setFilterPriority(''); }} className="flex-1 py-3 rounded-xl bg-white/10 text-sm font-semibold">清除</button>}
                <button onClick={() => setShowFilterPanel(false)} className="flex-1 py-3 rounded-xl bg-blue-600 text-sm font-bold">完成</button>
              </div>
            </div>
          </>
        )}
      </div>

      <DesktopCalendarView
        events={mobTeam ? teamDisplayEvents.filter(matchesFilter) : calendarEvents.filter(matchesFilter)}
        teamMode={mobTeam}
        today={today}
        getEventLabel={getEventLabel}
        onEventClick={mobTeam ? (() => {}) : handleEventTap}
        filterNode={(
          <div className="flex items-center gap-2">
            <select className="h-11 rounded-xl text-[13px] font-semibold px-3" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
              <option value="">全部分類</option>
              {EVENT_CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}
        teamToggle={(
          <div className="flex items-center gap-2">
            {mobTeam && <span className="text-[12px] text-white/45">{isTeamScheduleViewer ? '全員行程・頭像＝建檔人' : '吳政翰的分類行程＋直屬業務'}</span>}
            <div className="flex rounded-xl border border-white/15 bg-white/[0.06] p-1">
              {[[false, '我的'], [true, '團隊']].map(([k, l]) => <button key={l} type="button" onClick={() => setMobTeam(k)} className={`px-5 h-9 rounded-lg text-[14px] font-bold ${mobTeam === k ? 'bg-blue-600 text-white shadow-[0_0_14px_rgba(37,99,235,.5)]' : 'text-white/55'}`}>{l}</button>)}
            </div>
          </div>
        )}
        addItemsFor={(d) => [
          { label: '新增行程', icon: CalendarPlus, onClick: () => { setForm({ ...emptyForm, date: d }); setShowForm(true); } },
          { label: '純提醒', icon: Bell, onClick: () => { setReminderDate(d); setShowReminderForm(true); } },
          { label: '批次新增行程', icon: ListPlus, onClick: () => setShowBatchActivity(true) },
          { label: '批次新增提醒', icon: ListPlus, onClick: () => setShowBatchSchedule(true) },
          { label: '固定行程管理', icon: Repeat, onClick: () => setShowRecurringManage(true) }
        ]}
      />
      <div className="hidden space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="hidden md:block text-2xl sm:text-3xl font-bold text-gray-900">行事曆</h2>
          <p className="text-sm text-gray-400 md:mt-1">{today} · {getWeekdayLabel(today)}</p>
        </div>
        <div className="flex items-center gap-2">
          {isTeamScheduleViewer && (
            <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
              <button onClick={() => setShowTeamView(false)} className={`px-3 py-2 rounded-md text-sm font-bold transition ${!showTeamView ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>我的</button>
              <button onClick={() => setShowTeamView(true)} className={`px-3 py-2 rounded-md text-sm font-bold transition ${showTeamView ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>團隊</button>
            </div>
          )}
          <div className="relative">
            <button onClick={() => setShowAddMenu(v => !v)} className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-sm ${showAddMenu ? 'bg-gray-900 text-white rotate-45' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
              <Plus size={22} />
            </button>
            {showAddMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-scale-up origin-top-right">
                  <button onClick={() => { setShowForm(true); setShowAddMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition">
                    <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0"><CalendarPlus size={16} /></span>
                    <span className="text-sm font-bold text-gray-700">新增行程</span>
                  </button>
                  <button onClick={() => { setShowReminderForm(true); setShowAddMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition">
                    <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Bell size={16} /></span>
                    <span className="text-sm font-bold text-gray-700">純提醒</span>
                  </button>
                  <button onClick={() => { setShowBatchActivity(true); setShowAddMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition">
                    <span className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0"><ListPlus size={16} /></span>
                    <span className="text-sm font-bold text-gray-700">批次新增行程</span>
                  </button>
                  <button onClick={() => { setShowBatchSchedule(true); setShowAddMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition">
                    <span className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0"><ListPlus size={16} /></span>
                    <span className="text-sm font-bold text-gray-700">批次新增提醒</span>
                  </button>
                  <div className="my-1 border-t border-gray-100"></div>
                  <button onClick={() => { setShowRecurringManage(true); setShowAddMenu(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition">
                    <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0"><Repeat size={16} /></span>
                    <span className="text-sm font-bold text-gray-700">固定行程管理</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showTeamView ? (
        teamGroupedByDate.length > 0 ? (
          <div className="space-y-3">
            {teamGroupedByDate.map(([date, events]) => {
              const displayEvents = events.map(e => ({ ...e, customerName: e.customerName ? `${e.ownerName} · ${e.customerName}` : e.ownerName }));
              return (
                <Card key={date} className="p-5">
                  <h4 className="text-sm font-bold text-gray-500 mb-3">{date}（{getWeekdayLabel(date)}）</h4>
                  <DayTimelineView events={displayEvents} isToday={date === today} onEventClick={() => {}} getEventLabel={getEventLabel} getEventPriority={getEventPriority} />
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-8 text-center text-gray-400">團隊未來14天沒有排定行程</Card>
        )
      ) : (
      <>
      <div className="relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {loggedInUser?.defaultScheduleView !== viewMode && (
        <button onClick={handleSetDefaultView} disabled={savingDefaultView} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 mb-3 block disabled:opacity-50">
          {savingDefaultView ? '儲存中' : '將目前檢視方式設為預設'}
        </button>
      )}

      {viewMode === 'calendar' ? (
        <Card className="p-5 lg:p-8">
          <MonthCalendarView
            events={calendarEvents}
            getEventLabel={getEventLabel}
            getEventColor={getEventColor}
            onEventClick={handleEventTap}
            getEventMeta={getCreatorHint}
            onAddForDate={(d) => { setForm({ ...emptyForm, date: d }); setShowForm(true); }}
            onDropOnDate={handleDropOnDate}
            today={today}
          />
        </Card>
      ) : (
      <>
      {/* 今日焦點 */}
      <div>
        <h3 className="text-base font-bold text-gray-500 mb-3">今日焦點</h3>
        {isEmpty && <Card className="p-8 text-center text-gray-400">{(filterCategory || filterPriority) ? '沒有符合篩選條件的行程' : '今天沒有排定的行程，太棒了 🎉'}</Card>}

        {dueEvents.length > 0 && (
          <Card className="p-5">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base"><Clock size={18} className="text-indigo-500" /> 待完成行程與提醒</h4>
            {viewMode === 'timeline' ? (
              <DayTimelineView events={dueEvents} isToday={true} onEventClick={handleEventTap} getEventLabel={getEventLabel} getEventPriority={getEventPriority} />
            ) : (
            <div className="space-y-3">
              {dueEvents.map(e => {
                const isOverdue = e.date < today && !(e.endDate && today <= e.endDate);
                return (
                <div key={e.id} className={`flex items-center justify-between gap-3 p-4 rounded-xl border ${isOverdue ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                  <div className="min-w-0 flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getEventColor(e)}`}></span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-gray-900 truncate">{getEventLabel(e)}{e.customerName && ` · ${e.customerName}`}</p>
                        {e.priority && e.priority !== 'normal' && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getEventPriority(e).color} text-white`}>{getEventPriority(e).label}</span>}
                      </div>
                      <p className="text-sm text-gray-500">{formatEventWhen(e)}{isOverdue ? '（已過期）' : ''}{getCreatorHint(e) && <span className="text-xs text-indigo-400"> · {getCreatorHint(e)}</span>}</p>
                      {e.address && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <MapPin size={11} className="text-gray-400 shrink-0" />
                          <span className="text-xs text-gray-400 truncate">{e.address}</span>
                          <a href={getGoogleMapsUrl(e.address)} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">Google</a>
                          <a href={getAppleMapsUrl(e.address)} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold">Apple</a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button disabled={busyId === e.id} onClick={() => handleCompleteEvent(e)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-4 py-2.5 rounded-lg transition disabled:opacity-50 flex items-center gap-1">
                      {busyId === e.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} 完成
                    </button>
                    {!e.isVirtual && (
                      <>
                        <button onClick={() => openEditEvent(e)} className="text-gray-300 hover:text-indigo-500 p-2.5"><Edit3 size={17} /></button>
                        <button onClick={() => setDeleteTarget(e.id)} className="text-gray-300 hover:text-red-500 p-2.5"><Trash2 size={17} /></button>
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
      </div>

      {/* 即將到來 */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-gray-500 mb-3">即將到來</h3>
          {viewMode === 'timeline' ? (
            <div className="space-y-4">
              {groupedByDate.map(([date, events]) => (
                <Card key={date} className="p-5">
                  <h4 className="text-sm font-bold text-gray-500 mb-3">{date}（{getWeekdayLabel(date)}）</h4>
                  <DayTimelineView events={events} isToday={false} onEventClick={handleEventTap} getEventLabel={getEventLabel} getEventPriority={getEventPriority} />
                </Card>
              ))}
            </div>
          ) : (
          <div className="space-y-4">
            {groupOrder.map(label => grouped[label] && grouped[label].length > 0 && (
              <div key={label}>
                <h4 className="text-sm font-bold text-gray-400 mb-2">{label} ({grouped[label].length})</h4>
                <div className="space-y-2">
                  {grouped[label].map(e => (
                    <Card key={e.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`w-2.5 h-2.5 rounded-full ${getEventColor(e)}`}></span>
                          <p className="font-bold text-gray-900">{getEventLabel(e)}</p>
                          {e.customerName && <span className="text-sm text-gray-400">· {e.customerName}</span>}
                          {e.priority && e.priority !== 'normal' && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getEventPriority(e).color} text-white`}>{getEventPriority(e).label}</span>}
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{formatEventWhen(e)}（{getWeekdayLabel(e.date)}）{e.note ? ` · ${e.note}` : ''}{getCreatorHint(e) && <span className="text-xs text-indigo-400"> · {getCreatorHint(e)}</span>}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button disabled={busyId === e.id} onClick={() => handleCompleteEvent(e)} className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold px-3 py-2.5 rounded-lg transition disabled:opacity-50 flex items-center gap-1">
                          {busyId === e.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        </button>
                        {!e.isVirtual && (
                          <>
                            <button onClick={() => openEditEvent(e)} className="text-gray-300 hover:text-indigo-500 p-2.5"><Edit3 size={17} /></button>
                            <button onClick={() => setDeleteTarget(e.id)} className="text-gray-300 hover:text-red-500 p-2.5"><Trash2 size={18} /></button>
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

      {completedRecent.length > 0 && (
        <div>
          <h3 className="text-base font-bold text-gray-400 mb-3">最近完成</h3>
          <div className="space-y-2">
            {completedRecent.map(e => (
              <div key={e.id} className="text-sm text-gray-400 flex items-center justify-between px-2 py-1.5 group">
                <span className="truncate">{getEventLabel(e)}{e.customerName && ` · ${e.customerName}`}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span>{e.date}{e.time ? ` ${e.time}${e.endTime ? `-${e.endTime}` : ''}` : ''}</span>
                  <button onClick={() => handleUndoComplete(e)} disabled={busyId === e.id} className="opacity-0 group-hover:opacity-100 text-xs font-bold text-indigo-500 hover:text-indigo-600 transition disabled:opacity-50">
                    {busyId === e.id ? <Loader2 size={12} className="animate-spin" /> : '取消完成'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </>
      )}

      {/* 浮動底部切換列：時間軸／月曆／清單／篩選，圖示化收合 */}
      <div className="fixed bottom-24 md:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-white shadow-lg border border-gray-100 rounded-full p-1.5">
        <button onClick={() => setViewMode('timeline')} title="時間軸" className={`w-10 h-10 rounded-full flex items-center justify-center transition ${viewMode === 'timeline' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}><Clock size={18} /></button>
        <button onClick={() => setViewMode('calendar')} title="月曆" className={`w-10 h-10 rounded-full flex items-center justify-center transition ${viewMode === 'calendar' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}><Calendar size={18} /></button>
        <button onClick={() => setViewMode('list')} title="清單" className={`w-10 h-10 rounded-full flex items-center justify-center transition ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}><ListIcon size={18} /></button>
        <div className="w-px h-6 bg-gray-100 mx-0.5"></div>
        <div className="relative">
          <button onClick={() => setShowFilterPanel(v => !v)} title="篩選" className={`w-10 h-10 rounded-full flex items-center justify-center transition ${(filterCategory || filterPriority) ? 'bg-indigo-50 text-indigo-600' : showFilterPanel ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}><SlidersHorizontal size={17} /></button>
          {showFilterPanel && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowFilterPanel(false)}></div>
              <div className="absolute bottom-14 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 z-40 animate-scale-up origin-bottom-right space-y-2">
                <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 outline-none" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                  <option value="">全部分類</option>
                  {EVENT_CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 outline-none" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                  <option value="">全部優先度</option>
                  {Object.entries(PRIORITY_LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                {(filterCategory || filterPriority) && (
                  <button onClick={() => { setFilterCategory(''); setFilterPriority(''); }} className="text-xs font-bold text-gray-400 hover:text-gray-600">清除篩選</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="h-16"></div>
      </div>
      </>
      )}
      </div>

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
                <label className="text-xs font-bold text-gray-500 block mb-1">關聯客戶（選填，可複選）</label>
                <CustomerPicker
                  key={form.customerIds.length}
                  customers={customers.filter(c => !form.customerIds.includes(c.id))}
                  value=""
                  onChange={(id) => { if (id) setForm(prev => ({ ...prev, customerIds: [...prev.customerIds, id] })); }}
                  onCreateNew={async (name) => { const id = await handleCreateCustomerInline(name); if (id) setForm(prev => ({ ...prev, customerIds: [...prev.customerIds, id] })); return id; }}
                />
                {form.customerIds.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.customerIds.map(cid => {
                      const c = customers.find(x => x.id === cid);
                      return (
                        <span key={cid} className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-bold pl-2.5 pr-1.5 py-1 rounded-full">
                          {c ? c.name : '未知客戶'}
                          <button type="button" onClick={() => setForm(prev => ({ ...prev, customerIds: prev.customerIds.filter(id => id !== cid) }))} className="hover:bg-indigo-100 rounded-full p-0.5"><X size={12} /></button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-gray-500 block mb-1">開始日期</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
                <div><label className="text-xs font-bold text-gray-500 block mb-1">結束日期（選填）</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" min={form.date} value={form.endDate || ''} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
              </div>
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
                <label className="text-xs font-bold text-gray-500 block mb-1">地點（選填）</label>
                <input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                {(() => { const c = customers.find(x => x.id === form.customerIds[0]); return c && c.address && form.address !== c.address ? (
                  <button type="button" onClick={() => setForm({ ...form, address: c.address })} className="text-[10px] text-indigo-600 hover:underline mt-1">帶入 {c.name} 的地址</button>
                ) : null; })()}
              </div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">備註</label><textarea className="w-full p-2 border border-gray-200 rounded-lg h-20 resize-none" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} /></div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">參與人員（可複選）</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto border border-gray-100 rounded-lg p-2">
                  {(team || []).map(m => (
                    <label key={m.id} className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(form.participantIds || []).includes(m.id)}
                        onChange={() => setForm(prev => ({ ...prev, participantIds: (prev.participantIds || []).includes(m.id) ? prev.participantIds.filter(id => id !== m.id) : [...(prev.participantIds || []), m.id] }))}
                        className="w-3.5 h-3.5"
                      /> {m.name}
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={handleAddSchedule} disabled={!form.date || (form.participantIds || []).length === 0 || saving} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
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
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-gray-500 block mb-1">開始日期</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={reminderDate} onChange={e => setReminderDate(e.target.value)} /></div>
                <div><label className="text-xs font-bold text-gray-500 block mb-1">結束日期（選填）</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" min={reminderDate} value={reminderEndDate} onChange={e => setReminderEndDate(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-bold text-gray-500 block mb-1">開始時間</label><TimeSelect value={reminderTime} onChange={setReminderTime} /></div>
                <div><label className="text-xs font-bold text-gray-500 block mb-1">結束時間</label><TimeSelect value={reminderEndTime} onChange={setReminderEndTime} /></div>
              </div>
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
              <div><label className="text-xs font-bold text-gray-500 block mb-1">地點（選填）</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={reminderAddress} onChange={e => setReminderAddress(e.target.value)} /></div>
              <div><label className="text-xs font-bold text-gray-500 block mb-1">備註（選填）</label><textarea className="w-full p-2 border border-gray-200 rounded-lg h-16 resize-none" value={reminderNote} onChange={e => setReminderNote(e.target.value)} /></div>
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">參與人員（每個人各自獨立在自己的今日待辦中看到）</label>
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

      {/* 行程操作選單：點行程先到這裡，再選擇完成／編輯／複製／刪除，不會一碰就直接完成 */}
      {actionEvent && (() => {
        const e = actionEvent;
        const done = e.status === 'completed';
        const creator = getCreatorName(e);
        return (
          <div className="fixed inset-0 z-[105] flex items-end md:items-center justify-center bg-black/40" onClick={() => setActionEvent(null)}>
            <div className="bg-white w-full md:max-w-sm rounded-t-3xl md:rounded-2xl shadow-2xl animate-scale-up p-5" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 1.25rem)' }} onClick={(ev) => ev.stopPropagation()}>
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 md:hidden"></div>
              <div className="flex items-start gap-3 mb-4">
                <span className={`w-3 h-3 rounded-full mt-2 shrink-0 ${getEventColor(e)}`}></span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-gray-900 text-lg leading-snug">{getEventLabel(e)}{e.customerName && ` · ${e.customerName}`}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{formatEventWhen(e)}{done ? '（已完成）' : ''}</p>
                </div>
                <button onClick={() => setActionEvent(null)} className="w-9 h-9 -mr-2 -mt-1 rounded-full flex items-center justify-center hover:bg-gray-100 shrink-0"><X size={20} /></button>
              </div>
              <div className="space-y-1.5 mb-5 text-sm text-gray-600">
                {e.address && (
                  <p className="flex items-center gap-1.5 flex-wrap">
                    <MapPin size={14} className="text-gray-400 shrink-0" /><span>{e.address}</span>
                    <a href={getGoogleMapsUrl(e.address)} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">Google</a>
                    <a href={getAppleMapsUrl(e.address)} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold">Apple</a>
                  </p>
                )}
                {e.note && <p className="text-gray-500 whitespace-pre-wrap">{e.note}</p>}
                {creator && <p className="text-xs text-gray-400">建檔人：{creator}</p>}
              </div>
              {done ? (
                <div className="space-y-2">
                  {!e.isVirtual && <button onClick={() => { setActionEvent(null); openEditEvent(e); }} className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2"><Edit3 size={17} /> 修改</button>}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { setActionEvent(null); handleUndoComplete(e); }} className="py-3 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-sm">取消完成</button>
                    {!e.isVirtual && <button onClick={() => { setActionEvent(null); setDeleteTarget(e.id); }} className="py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm flex items-center justify-center gap-1.5"><Trash2 size={15} /> 刪除</button>}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button onClick={() => { setActionEvent(null); handleCompleteEvent(e); }} className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-2"><CheckCircle2 size={18} /> 完成</button>
                  {e.isVirtual ? (
                    <>
                      <button onClick={() => { setActionEvent(null); const rule = (recurringRules || []).find(r => r.id === e.ruleId); if (rule) openEditRecurring(rule); else setShowRecurringManage(true); }} className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2"><Edit3 size={17} /> 修改這個固定行程</button>
                      <p className="text-xs text-gray-400 text-center pt-1">這是固定行程自動產生的場次，修改會套用到整個固定行程</p>
                    </>
                  ) : (
                    <div className={`grid gap-2 ${e.isReminder ? 'grid-cols-2' : 'grid-cols-3'}`}>
                      <button onClick={() => { setActionEvent(null); openEditEvent(e); }} className="py-3 rounded-xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center gap-1.5"><Edit3 size={15} /> 修改</button>
                      {!e.isReminder && <button onClick={() => { setActionEvent(null); handleDuplicateEvent(e); }} className="py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm flex items-center justify-center gap-1.5"><Copy size={15} /> 複製</button>}
                      <button onClick={() => { setActionEvent(null); setDeleteTarget(e.id); }} className="py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm flex items-center justify-center gap-1.5"><Trash2 size={15} /> 刪除</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

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
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-gray-500 block mb-1">開始日期</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={editingEvent.date} onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })} /></div>
                    <div><label className="text-xs font-bold text-gray-500 block mb-1">結束日期（選填）</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" min={editingEvent.date} value={editingEvent.endDate || ''} onChange={e => setEditingEvent({ ...editingEvent, endDate: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-gray-500 block mb-1">開始時間</label><TimeSelect value={editingEvent.time || ''} onChange={(t) => setEditingEvent({ ...editingEvent, time: t })} /></div>
                    <div><label className="text-xs font-bold text-gray-500 block mb-1">結束時間</label><TimeSelect value={editingEvent.endTime || ''} onChange={(t) => setEditingEvent({ ...editingEvent, endTime: t })} /></div>
                  </div>
                  <div><label className="text-xs font-bold text-gray-500 block mb-1">地點（選填）</label><input type="text" className="w-full p-2 border border-gray-200 rounded-lg" value={editingEvent.address || ''} onChange={e => setEditingEvent({ ...editingEvent, address: e.target.value })} /></div>
                  <div><label className="text-xs font-bold text-gray-500 block mb-1">備註（選填）</label><textarea className="w-full p-2 border border-gray-200 rounded-lg h-16 resize-none" value={editingEvent.note || ''} onChange={e => setEditingEvent({ ...editingEvent, note: e.target.value })} /></div>
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
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-gray-500 block mb-1">開始日期</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={editingEvent.date} onChange={e => setEditingEvent({ ...editingEvent, date: e.target.value })} /></div>
                    <div><label className="text-xs font-bold text-gray-500 block mb-1">結束日期（選填）</label><input type="date" className="w-full p-2 border border-gray-200 rounded-lg" min={editingEvent.date} value={editingEvent.endDate || ''} onChange={e => setEditingEvent({ ...editingEvent, endDate: e.target.value })} /></div>
                  </div>
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
              <div className="flex gap-2 mt-2">
                {!editingEvent.isReminder && (
                  <button onClick={() => handleDuplicateEvent(editingEvent)} className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-bold transition"><Copy size={15} /> 複製</button>
                )}
                <button onClick={handleSaveEditEvent} disabled={saving} className="flex-[2] bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="animate-spin" size={16} /> : '儲存變更'}
                </button>
              </div>
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
              {completingEvent.customerId && (
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">需要設定下次追蹤日期嗎？（選填）</label>
                  <input type="date" className="w-full p-2 border border-gray-200 rounded-lg" value={followUpInput} onChange={e => setFollowUpInput(e.target.value)} />
                </div>
              )}
              <button onClick={handleConfirmCompleteEvent} disabled={busyId === completingEvent.id} className="w-full bg-emerald-500 text-white py-3 rounded-lg font-bold hover:bg-emerald-600 transition mt-2 disabled:opacity-50 flex items-center justify-center gap-2">
                {busyId === completingEvent.id ? <Loader2 className="animate-spin" size={16} /> : '確認完成'}
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
const FIT_TABS = ['overview', 'calendar', 'customers', 'activity', 'dashboard', 'warroom', 'entry', 'todo', 'recruitment', 'team'];
const App = () => {
  const [activeTab, setActiveTab] = useState('todo');

  // 鎖定畫面：禁止雙指縮放、雙擊放大，輸入框聚焦時也不會自動放大
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'viewport'; document.head.appendChild(meta); }
    meta.setAttribute('content', 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
    let st = document.getElementById('jf-lock-style');
    if (!st) {
      st = document.createElement('style'); st.id = 'jf-lock-style';
      st.textContent = 'html,body{touch-action:manipulation;-webkit-text-size-adjust:100%;} @media (max-width:767px){input:not([type="checkbox"]):not([type="radio"]):not([type="range"]),select,textarea{font-size:16px !important;}}';
      document.head.appendChild(st);
    }
    const stop = (e) => e.preventDefault();
    const onTouchMove = (e) => { if (e.touches && e.touches.length > 1) e.preventDefault(); };
    document.addEventListener('gesturestart', stop);
    document.addEventListener('gesturechange', stop);
    document.addEventListener('gestureend', stop);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      document.removeEventListener('gesturestart', stop);
      document.removeEventListener('gesturechange', stop);
      document.removeEventListener('gestureend', stop);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, []);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
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
  const [announcements, setAnnouncements] = useState([]);

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
  // 公文佈達：全員都讀取 (圖片本體不在這裡載入，只有縮圖，點開公文才會去抓完整圖片)
  useEffect(() => {
    if (!user) return;
    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snap) => {
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubAnnouncements();
  }, [user]);

  const isTeamScheduleViewer = loggedInUser?.name === '吳政翰';
  useEffect(() => { if (isTeamScheduleViewer && typeof window !== 'undefined' && window.innerWidth >= 768) setActiveTab(t => t === 'todo' ? 'overview' : t); }, [isTeamScheduleViewer]);
  // 團隊行程要讀取的對象：吳政翰讀全部；其他人只讀「吳政翰」與「自己的直屬業務員」
  const teamViewOwnerKey = useMemo(() => {
    if (!loggedInUser || isTeamScheduleViewer) return '';
    const root = team.find(m => m.name === '吳政翰');
    const ids = new Set();
    if (root) ids.add(root.id);
    team.forEach(m => { if (m.parentId && String(m.parentId) === String(loggedInUser.id)) ids.add(m.id); });
    ids.delete(loggedInUser.id);
    return Array.from(ids).sort().join(',');
  }, [team, loggedInUser, isTeamScheduleViewer]);
  useEffect(() => {
    if (!user || !loggedInUser) { setTeamScheduleEvents([]); return; }
    if (isTeamScheduleViewer) {
      const unsubTeamSchedule = onSnapshot(collection(db, 'schedule_events'), (snap) => {
        setTeamScheduleEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsubTeamSchedule();
    }
    const ids = teamViewOwnerKey ? teamViewOwnerKey.split(',') : [];
    if (ids.length === 0) { setTeamScheduleEvents([]); return; }
    const chunks = [];
    for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));
    const parts = chunks.map(() => []);
    const unsubs = chunks.map((chunk, idx) => onSnapshot(query(collection(db, 'schedule_events'), where('ownerId', 'in', chunk)), (snap) => {
      parts[idx] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTeamScheduleEvents(parts.flat());
    }, (err) => console.error(err)));
    return () => unsubs.forEach(u => u());
  }, [user, loggedInUser?.id, isTeamScheduleViewer, teamViewOwnerKey]);

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
          lastSeenCelebration: data.lastSeenCelebration || '',
          defaultScheduleView: data.defaultScheduleView || '',
          lastSeenAnnouncements: data.lastSeenAnnouncements || '',
          qualityTalentStartMonth: data.qualityTalentStartMonth || ''
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

  const handleMarkAnnouncementsSeen = async () => {
    if (!loggedInUser) return;
    const now = new Date().toISOString();
    setLoggedInUser(prev => prev ? { ...prev, lastSeenAnnouncements: now } : prev);
    try { await updateDoc(doc(db, 'user', loggedInUser.id), { lastSeenAnnouncements: now }); } catch (e) { console.error(e); }
  };
  const unreadAnnouncementCount = loggedInUser
    ? announcements.filter(a => a.authorId !== loggedInUser.id && (a.createdAt || '') > (loggedInUser.lastSeenAnnouncements || '')).length
    : 0;

  const navItems = [
    ...(isTeamScheduleViewer ? [{ id: 'overview', label: '總覽', icon: LayoutGrid, desktopOnly: true }] : []),
    { id: 'todo', label: '今日待辦', icon: CheckSquare, badge: todoCount },
    { id: 'calendar', label: '行事曆', icon: Calendar },
    { id: 'customers', label: '客戶管理', icon: Phone },
    { id: 'watchlist', label: '關注名單', icon: Star },
    { id: 'warroom', label: '業務戰情室', icon: ClipboardList },
    { id: 'announce', label: '公文佈達', icon: Megaphone, badge: unreadAnnouncementCount },
    { id: 'dashboard', label: '業績儀表板', icon: LayoutDashboard },
    { id: 'activity', label: 'MEA 活動量', icon: Activity },
    { id: 'entry', label: '業績回報', icon: Plus },
    { id: 'team', label: '組織架構', icon: Users },
    { id: 'recruitment', label: '增員儀表板', icon: UserPlus },
    { id: 'wiki', label: '知識庫', icon: BookOpen },
    { id: 'training', label: '新人培訓', icon: ClipboardCheck },
    ...(loggedInUser && MANAGER_RANKS.includes(loggedInUser.role) ? [{ id: 'settings', label: '競賽設定', icon: Settings }] : [])
  ];
  // 手機版底部導覽列：只放最常用的4個 + 「更多」，其餘收進更多選單裡，才不會塞成一長排
  const PRIMARY_TAB_IDS = ['todo', 'calendar', 'customers', 'warroom'];
  const primaryNavItems = navItems.filter(item => PRIMARY_TAB_IDS.includes(item.id));
  const moreNavItems = navItems.filter(item => !PRIMARY_TAB_IDS.includes(item.id) && !item.desktopOnly);
  const isMoreActive = moreNavItems.some(item => item.id === activeTab);
  const currentNavItem = navItems.find(item => item.id === activeTab);

  // 資料尚未連線完成前，顯示載入畫面
  if (!teamLoaded || !sessionChecked) {
    return <LoadingScreen />;
  }

  // 尚未登入，顯示登入畫面（進入系統前必須先登入）
  if (!loggedInUser) {
    return <LoginScreen team={team} onLogin={setLoggedInUser} />;
  }

  return (
    <div className={`jf-tech ${activeTab === 'todo' ? 'jf-dark' : ''} jf-dark-m min-h-screen bg-[#F5F7FA] font-sans text-gray-900 pb-24 ${FIT_TABS.includes(activeTab) ? 'md:pb-0 md:overflow-hidden md:h-screen' : 'md:pb-8'} relative`}>
      <JfTechStyle />
      {(activeTab === 'todo' || activeTab === 'warroom' || activeTab === 'overview') && <div className={`fixed inset-0 pointer-events-none ${activeTab === 'todo' ? '' : activeTab === 'overview' ? 'hidden md:block' : 'md:hidden'}`} style={{ backgroundColor: '#05070f', backgroundImage: 'linear-gradient(180deg, rgba(5,7,15,0) 0%, rgba(5,7,15,.35) 38%, rgba(5,7,15,.82) 100%), url(/bg-mountain.jpg), radial-gradient(ellipse 80% 50% at 10% 0%, rgba(59,91,219,.38), transparent 62%)', backgroundSize: 'cover, cover, auto', backgroundPosition: 'top center', backgroundRepeat: 'no-repeat' }}></div>}
      {(activeTab !== 'todo' && activeTab !== 'overview') && <div className={`fixed inset-0 pointer-events-none ${activeTab === 'warroom' ? 'hidden md:block' : ''}`} style={{ background: 'radial-gradient(ellipse 70% 40% at 85% 6%, rgba(251,146,60,.34), transparent 60%), radial-gradient(ellipse 80% 50% at 10% 0%, rgba(59,91,219,.38), transparent 62%), radial-gradient(ellipse 90% 40% at 50% 100%, rgba(99,102,241,.14), transparent 60%)' }}></div>}
      <DailyNudge loggedInUser={loggedInUser} activities={activities} onGo={setActiveTab} />
      {/* 桌機版：全寬深色頂部導覽 */}
      <nav className="hidden md:flex sticky top-0 z-50 h-16 items-center gap-4 px-5 bg-[#070b17]/85 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-amber-400/40 bg-gradient-to-br from-[#14192b] to-[#0a0e1a]"><span className="text-amber-400 font-serif font-bold text-lg">JF</span></div>
          <div className="leading-tight"><h1 className="text-[15px] font-bold text-white tracking-wide">極豐通訊處</h1><p className="text-[9px] text-white/45 tracking-[0.22em]">JI FENG AGENCY</p></div>
        </div>
        <div className="flex-1 min-w-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 w-max mx-auto rounded-2xl border border-white/10 bg-white/[0.04] p-1">
            {navItems.map(item => {
              const ItemIcon = item.icon;
              const active = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => setActiveTab(item.id)} title={item.label} className={`relative flex items-center gap-1.5 px-2.5 h-9 rounded-xl text-[13px] font-semibold whitespace-nowrap transition ${active ? 'bg-blue-500/20 text-white border border-blue-400/60 shadow-[0_0_16px_rgba(59,130,246,.45)]' : 'text-white/65 hover:text-white hover:bg-white/[0.06] border border-transparent'}`}>
                  <ItemIcon size={15} /><span className={active ? '' : 'hidden min-[1480px]:inline'}>{item.label}</span>
                  {!!item.badge && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1">{item.badge > 99 ? '99+' : item.badge}</span>}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => setShowGlobalSearch(true)} title="全域搜尋" className="w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10"><Search size={18} /></button>
          <button onClick={() => setActiveTab('todo')} title="今日待辦" className="relative w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:bg-white/10"><Bell size={18} />{!!todoCount && <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-1">{todoCount}</span>}</button>
          <div className="flex items-center gap-2 pl-2 ml-1 border-l border-white/10">
            <Avatar name={loggedInUser.name} size={34} />
            <div className="leading-tight"><p className="text-[13px] font-semibold text-white">{loggedInUser.name}</p><p className="text-[10px] text-white/45">{loggedInUser.role}</p></div>
            <button onClick={handleLogout} title="登出" className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:bg-red-500/15 hover:text-red-300"><LogOut size={16} /></button>
          </div>
        </div>
      </nav>

      {/* 手機版：極簡頂部列，只有目前頁面標題＋搜尋＋登出，其餘導覽交給底部列 */}
      <div className={`${['todo', 'calendar', 'customers', 'activity', 'dashboard', 'warroom', 'entry', 'recruitment'].includes(activeTab) ? 'hidden' : 'md:hidden'} sticky top-0 z-50 bg-[#070914]/90 backdrop-blur-xl border-b border-white/10`}>
        <div className="h-14 px-4 flex items-center justify-between">
          <h1 className="text-base font-bold text-white">{currentNavItem?.label || '極豐通訊處'}</h1>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowGlobalSearch(true)} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 active:bg-gray-100 transition"><Search size={18} /></button>
            <button onClick={handleLogout} className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 active:bg-red-50 transition"><LogOut size={18} /></button>
          </div>
        </div>
      </div>

      <GlobalSearchModal isOpen={showGlobalSearch} onClose={() => setShowGlobalSearch(false)} customers={customers} records={enrichedRecords} scheduleEvents={scheduleEvents} />
      <CelebrationPosterModal isOpen={showCelebration} onClose={handleDismissCelebration} celebrations={newCelebrations} />

      <main className={`relative z-10 max-w-7xl md:max-w-none mx-auto px-4 md:px-5 ${FIT_TABS.includes(activeTab) ? 'md:h-[calc(100vh-64px)] md:overflow-y-auto no-scrollbar md:!pt-3 md:pb-3' : ''} ${['todo', 'calendar', 'customers', 'activity', 'dashboard', 'warroom', 'entry', 'recruitment'].includes(activeTab) ? 'pt-[calc(env(safe-area-inset-top,0px)+14px)]' : 'pt-4'} md:pt-6`}>
        {activeTab === 'overview' && isTeamScheduleViewer && <OverviewPage loggedInUser={loggedInUser} team={team} records={enrichedRecords} activities={activities} recruits={recruits} season={season} rankTargets={rankTargets} />}
        {activeTab === 'todo' && <TodoSchedulePage loggedInUser={loggedInUser} customers={customers} scheduleEvents={scheduleEvents} records={enrichedRecords} activities={activities} team={team} onGo={setActiveTab} isTeamScheduleViewer={isTeamScheduleViewer} recurringRules={recurringRules} bellCount={unreadAnnouncementCount} />}
        {activeTab === 'calendar' && <CalendarPage onSearch={() => setShowGlobalSearch(true)} loggedInUser={loggedInUser} customers={customers} scheduleEvents={scheduleEvents} team={team} recurringRules={recurringRules} teamScheduleEvents={teamScheduleEvents} isTeamScheduleViewer={isTeamScheduleViewer} />}
        {activeTab === 'customers' && <CustomerCRM loggedInUser={loggedInUser} records={enrichedRecords} customers={customers} customersLoaded={customersLoaded} relationships={relationships} />}
        {activeTab === 'watchlist' && <WatchlistPage loggedInUser={loggedInUser} customers={customers} />}
        {activeTab === 'warroom' && <SalesWarRoomPage loggedInUser={loggedInUser} team={team} customers={customers} records={enrichedRecords} onSearch={() => setShowGlobalSearch(true)} />}
        {activeTab === 'announce' && <AnnouncementsPage loggedInUser={loggedInUser} announcements={announcements} canPost={isTeamScheduleViewer} onSeen={handleMarkAnnouncementsSeen} />}
        {activeTab === 'bingo' && <BingoChallengePage loggedInUser={loggedInUser} team={team} records={enrichedRecords} activities={activities} recruits={recruits} isManagerViewer={isTeamScheduleViewer} />}
        {activeTab === 'dashboard' && <Dashboard team={team} records={enrichedRecords} season={season} setSeason={setSeason} rankTargets={rankTargets} doubleAwardTargets={doubleAwardTargets} loggedInUser={loggedInUser} onSearch={() => setShowGlobalSearch(true)} />}
        {activeTab === 'activity' && <ActivityDashboard team={team} activities={activities} records={enrichedRecords} user={user} season={season} loggedInUser={loggedInUser} onSearch={() => setShowGlobalSearch(true)} />}
        {activeTab === 'entry' && <SalesEntry team={team} records={enrichedRecords} setRecords={setRecords} user={user} loggedInUser={loggedInUser} onSearch={() => setShowGlobalSearch(true)} />}
        {activeTab === 'team' && <OrgChart team={team} recruits={recruits} />}
        {activeTab === 'recruitment' && <RecruitmentDashboard recruits={recruits} team={team} user={user} />}
        {activeTab === 'wiki' && <KnowledgeBase loggedInUser={loggedInUser} isManagerViewer={isTeamScheduleViewer} />}
        {activeTab === 'training' && <TrainingChecklistPage team={team} />}
        {activeTab === 'settings' && loggedInUser && MANAGER_RANKS.includes(loggedInUser.role) && <SettingsPage rankTargets={rankTargets} doubleAwardTargets={doubleAwardTargets} />}
      </main>

      {/* 手機版底部導覽列：4個常用分頁＋更多，App感的核心 */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-2xl border-t ${true ? 'bg-[#070914]/85 border-white/10' : 'bg-white/80 border-black/[0.06]'}`} style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 10px)' }}>
        <div className="flex items-stretch">
          {primaryNavItems.map(item => {
            const ItemIcon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="relative flex-1 flex flex-col items-center justify-center gap-0.5 pt-2.5 pb-1"
              >
                <ItemIcon size={22} className={active ? (true ? 'text-blue-400' : 'text-gray-900') : (true ? 'text-white/35' : 'text-gray-300')} />
                <span className={`text-[10px] ${active ? (true ? 'font-bold text-blue-400' : 'font-bold text-gray-900') : (true ? 'text-white/40' : 'text-gray-400')}`}>{item.label}</span>
                {!!item.badge && (
                  <span className="absolute top-1 right-1/4 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </button>
            );
          })}
          <button onClick={() => setShowMoreSheet(true)} className="relative flex-1 flex flex-col items-center justify-center gap-0.5 pt-2.5 pb-1">
            <LayoutGrid size={22} className={isMoreActive ? (true ? 'text-blue-400' : 'text-gray-900') : (true ? 'text-white/35' : 'text-gray-300')} />
            {moreNavItems.some(i => i.badge) && <span className="absolute top-2 right-[28%] w-2.5 h-2.5 bg-red-500 rounded-full"></span>}
            <span className={`text-[10px] ${isMoreActive ? (true ? 'font-bold text-blue-400' : 'font-bold text-gray-900') : (true ? 'text-white/40' : 'text-gray-400')}`}>更多</span>
          </button>
        </div>
      </nav>

      {/* 更多選單（手機版底部彈出） */}
      {showMoreSheet && (
        <div className="md:hidden fixed inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMoreSheet(false)}></div>
          <div className="relative w-full bg-white rounded-t-3xl p-5 pb-8 animate-scale-up" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)' }}>
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-gray-900">更多功能</p>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-900">{loggedInUser.name}</p>
                <p className="text-[10px] text-gray-400">{loggedInUser.role}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {moreNavItems.map(item => {
                const ItemIcon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setShowMoreSheet(false); }}
                    className="relative flex flex-col items-center gap-1.5 p-2"
                  >
                    <span className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500'}`}><ItemIcon size={20} /></span>
                    <span className="text-[11px] font-bold text-gray-600 text-center leading-tight">{item.label}</span>
                    {!!item.badge && (
                      <span className="absolute top-0 right-1 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">{item.badge > 99 ? '99+' : item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;