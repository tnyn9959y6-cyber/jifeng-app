// 商品大全資料（僅南山人壽商品）
// 資料來源：各商品 DM。數字以 DM 為準，實際承保請以保單條款與最新費率為準。
// 儲存格值：字串；'—' 代表「無此給付」。要新增商品：在對應類別的 products 加一筆即可。

export const NA = '—';

export const CATALOG_CATEGORIES = [
  '壽險', '意外險', '住院險', '手術險', '長照險', '癌險', '重大疾病傷病',
];

export const CANCER_GROUPS = [
  { id: 'dx',   label: '診斷一次給付型', hint: '確診即給一筆錢，用途自由' },
  { id: 'med',  label: '醫療實支定額型', hint: '住院、手術、放化療逐項給付' },
  { id: 'sav',  label: '儲蓄＋癌症＋失智', hint: '有解約金、可領滿期金' },
  { id: 'prec', label: '精準治療附加條款', hint: '附加在主約上的單項治療給付' },
];

export const CANCER_ROWS = [
  { section: '基本資訊', rows: [
    { key: 'kind',  label: '商品型態' },
    { key: 'term',  label: '保險／繳費年期' },
    { key: 'age',   label: '投保年齡' },
    { key: 'sum',   label: '保額／單位' },
    { key: 'cash',  label: '解約金' },
    { key: 'wait',  label: '癌症等待期' },
  ]},
  { section: '診斷給付', rows: [
    { key: 'early',  label: '初期癌症' },
    { key: 'mild',   label: '輕度癌症' },
    { key: 'severe', label: '重度癌症' },
    { key: 'after',  label: '重度給付後' },
    { key: 'spec',   label: '特定重度／特定疾病' },
    { key: 'extra',  label: '身心關懷／生活照護' },
    { key: 'cap',    label: '累計給付上限' },
  ]},
  { section: '醫療給付', rows: [
    { key: 'hosp',    label: '住院' },
    { key: 'recover', label: '長期住院／出院療養' },
    { key: 'opd',     label: '門診' },
    { key: 'rt',      label: '放射線／化療' },
    { key: 'surg',    label: '手術（住院／門診切除）' },
    { key: 'trans',   label: '造血幹細胞移植' },
    { key: 'recon',   label: '重建／義肢／義齒' },
    { key: 'waiver',  label: '重度豁免保費' },
  ]},
  { section: '精準治療', rows: [
    { key: 'gene',   label: '癌後基因檢測' },
    { key: 'target', label: '標靶治療' },
    { key: 'cell',   label: '免疫細胞治療' },
    { key: 'robot',  label: '機械手臂微創手術' },
    { key: 'part',   label: '粒子精準放射' },
  ]},
  { section: '其他', rows: [
    { key: 'reward',   label: '回饋金' },
    { key: 'discount', label: '費率折扣' },
  ]},
];

const medNone = { hosp: NA, recover: NA, opd: NA, rt: NA, surg: NA, trans: NA, recon: NA, waiver: NA };
const precNone = { gene: NA, target: NA, cell: NA, robot: NA, part: NA };
const dxNone = { early: NA, mild: NA, severe: NA, after: NA, spec: NA, extra: NA, cap: NA };

export const CANCER_PRODUCTS = [
  // ───────── 診斷一次給付型 ─────────
  {
    id: 'SC', code: 'SC', group: 'dx', name: '長青滿溢癌症定期健康保險',
    doc: 'PA-01-450 · 2024/9', color: 'emerald',
    func: '55歲以上也能投保的癌症定期險，確診一次領。',
    fit: '年長、其他癌險已無法投保，想補強癌症確診金的客戶。',
    cells: {
      kind: '定期險（10／20年）', term: '10年期／20年期', age: '55–80歲（10年）\n55–70歲（20年）',
      sum: '30萬起，累計最高100萬', cash: '無', wait: '90天',
      early: '一次：首年＝年繳保費×1.1\n次年起＝保額×10%', mild: '一次：首年＝年繳保費×1.1\n次年起＝保額×10%',
      severe: '首年＝年繳保費×1.1\n次年起＝保額×100%', after: '合約終止', spec: NA, extra: NA, cap: '累計最高110%',
      ...medNone, ...precNone,
      reward: '最高10%＋防疫2%（約12%）', discount: '集體約2%／自動轉帳1%',
    },
  },
  {
    id: 'HC', code: 'HC', group: 'dx', name: '心滿溢足癌症健康保險',
    doc: 'PA-01-466 · 2025/7', color: 'emerald',
    func: '0–70歲都能投保的癌症診斷險，保障至95歲，可加選癌症補充包。',
    fit: '想用較低保費補強癌症確診金，且希望保障長一點的客戶。',
    cells: {
      kind: '定期健康險（長期繳費）', term: '10年繳／20年繳\n保障至95歲', age: '0–70歲（10年繳）\n0–65歲（20年繳）',
      sum: '30萬起\n10HC+20HC累計：0–54歲300萬、55歲↑200萬', cash: '無', wait: '90天',
      early: '次年起＝保額×10%×係數', mild: '次年起＝保額×10%×係數',
      severe: '保額×係數', after: '合約終止', spec: NA, extra: NA, cap: '累計最高110%',
      ...medNone, waiver: '有（癌症重度）', ...precNone,
      reward: 'DM未載明（可加選癌症補充包）', discount: '自動轉帳／聯名卡1%',
    },
  },
  {
    id: '20HTBC', code: '20HTBC', group: 'dx', name: '情溢相挺癌症定期健康保險（男）',
    doc: 'PA-01-429 · 2025/5', color: 'emerald',
    func: '確診後多段給付：癌症金、身心關懷、重度金，外加5年生活照護金。',
    fit: '20–65歲男性，希望罹癌後有長期現金流支撐生活。',
    cells: {
      kind: '定期險（20年）', term: '20年期', age: '20–65歲',
      sum: '單位制：20–25歲最少1單位\n26歲↑最少0.5單位，最多2單位', cash: '無', wait: '90天',
      early: '5萬／單位（癌症保險金）', mild: '5萬／單位（癌症保險金）',
      severe: '首年5萬\n次年起40萬／單位', after: '給付後依條款', spec: '特定重度20萬／單位\n（33種特定癌症）',
      extra: '身心關懷5萬\n生活照護10萬×5年（次年起）', cap: '非特定共100萬\n特定共120萬／單位',
      ...medNone, ...precNone,
      reward: '約12%', discount: NA,
    },
  },
  {
    id: '20HTSC', code: '20HTSC', group: 'dx', name: '美力相守癌症定期健康保險（女）',
    doc: 'PA-01-429 · 2025/5', color: 'emerald',
    func: '女性專屬：多段給付再加乳癌護理金，乳癌保障更高。',
    fit: '20–60歲女性，重視乳癌與長期生活照護保障。',
    cells: {
      kind: '定期險（20年）', term: '20年期', age: '20–60歲',
      sum: '單位制：20–25歲最少1單位\n26歲↑最少0.5單位，最多2單位', cash: '無', wait: '90天',
      early: '5萬／單位\n（乳癌15萬）', mild: '5萬／單位\n（乳癌15萬）',
      severe: '首年5萬\n次年起40萬／單位', after: '給付後依條款', spec: '特定重度15萬／單位',
      extra: '身心關懷5萬\n生活照護10萬×5年\n乳癌護理5萬', cap: '非乳癌特定115萬\n乳癌特定120萬／單位',
      ...medNone, ...precNone,
      reward: '約12%', discount: NA,
    },
  },
  // ───────── 醫療實支定額型 ─────────
  {
    id: 'HCAB2', code: 'HCAB2', group: 'med', name: '滿溢久久2癌症醫療健康保險',
    doc: 'PA-01-442 · 2025/7', color: 'sky',
    func: '住院、放化療、門診逐項給付，外加初期／輕度／重度確診金。',
    fit: '想要癌症治療過程的日額型醫療保障。',
    cells: {
      kind: '定額醫療（主約）', term: '20年繳\n保障至95歲', age: '0–70歲',
      sum: '單位制\n每單位給付上限200萬', cash: '無', wait: '90天',
      early: '5,000／單位', mild: '1萬／單位', severe: '5萬／單位', after: '依條款', spec: NA, extra: NA, cap: '每單位上限200萬',
      hosp: '1,000／日', recover: '長期住院1,000／日\n出院療養1,000／日', opd: '500／次\n（每年最多120次）',
      rt: '放療1,000／次\n化療1,000／次', surg: NA, trans: NA, recon: NA, waiver: '有（重度）',
      ...precNone,
      reward: '健康促進係數S級1.05\n（第3年起）', discount: '集體約2%／自動轉帳1%',
    },
  },
  {
    id: 'HCAR2', code: 'HCAR2', group: 'med', name: '滿溢久久2癌症醫療健康保險附約',
    doc: 'PA-01-442 · 2025/7', color: 'sky',
    func: '比 HCAB2 多手術、移植、重建與義肢義齒，醫療項目最完整。',
    fit: '已有主約，想補齊癌症手術與重建相關費用的客戶。',
    cells: {
      kind: '定額醫療（附約）', term: '20年繳\n保障至95歲', age: '0–70歲',
      sum: '單位制\n每單位給付上限200萬', cash: '無', wait: '90天',
      early: '5,000／單位', mild: '1萬／單位', severe: '5萬／單位', after: '依條款', spec: NA, extra: NA, cap: '每單位上限200萬',
      hosp: NA, recover: NA, opd: NA, rt: NA,
      surg: '住院手術1.5萬\n門診切除3,000', trans: '血癌／淋巴瘤\n12萬', recon: '乳房重建2萬／側\n義肢2萬\n義齒1萬', waiver: '有（重度）',
      ...precNone,
      reward: '健康促進係數S級1.05\n（第3年起）', discount: '集體約2%／自動轉帳1%',
    },
  },
  // ───────── 儲蓄＋癌症＋失智 ─────────
  {
    id: '2TRSD', code: '2TRSD', group: 'sav', name: '增享心安保險',
    doc: 'PA-01-456 · 2026/1', color: 'violet',
    func: '2年繳的儲蓄型：癌症與嚴重失智、巴金森都保，有解約金與滿期金。',
    fit: '想兼顧儲蓄、癌症與失智保障，且希望保障有回收的客戶。',
    cells: {
      kind: '儲蓄型健康險', term: '2年繳\n保障至95歲', age: '16–65歲',
      sum: '15萬起，累計最高800萬', cash: '有', wait: '癌症90天\n其他疾病30天',
      early: '（保額＋增額繳清）×5%', mild: '（保額＋增額繳清）×10%',
      severe: '兩種基礎取較大者\n給付後合約終止', after: '合約終止', spec: '嚴重阿茲海默、嚴重巴金森\n同重度給付',
      extra: '身故／完全失能：取較大值\n滿期金（95歲）', cap: '依保額與增額繳清',
      ...medNone, ...precNone,
      reward: '健康感恩回饋金\n（增額繳清）', discount: NA,
    },
  },
  // ───────── 精準治療附加條款 ─────────
  ...[
    ['1CGT', '精準醫療癌後基因檢測附加條款', 'gene', '15萬（固定）', '罹癌後做基因檢測，領一次檢測金。', '想確認基因檢測費用有保障的客戶。'],
    ['1STT', '重度癌症標靶治療附加條款', 'target', '30–100萬', '重度癌症使用標靶治療時，一次給付。', '擔心標靶藥物費用的客戶。'],
    ['1SCT', '實體癌第四期自體免疫細胞治療附加條款', 'cell', '100萬（固定）', '實體癌第四期接受自體免疫細胞治療，一次給付。', '想備妥自費細胞治療預算的客戶。'],
    ['1RAS', '癌症特定機械手臂微創切除手術醫療附加條款', 'robot', '15萬（固定）', '使用達文西、Senhance 等機械手臂切除手術，領一次。', '希望能選擇微創自費手術的客戶。'],
    ['1CPT', '癌症特定粒子精準放射治療附加條款', 'part', '30–100萬', '質子、重粒子放射治療一次給付，可於期間內加保。', '想備妥質子／重粒子治療費用的客戶。'],
  ].map(([code, name, rowKey, amount, func, fit]) => ({
    id: code, code, group: 'prec', name, short: { '1CGT': '癌後基因檢測', '1STT': '標靶治療', '1SCT': '免疫細胞治療', '1RAS': '機械手臂手術', '1CPT': '粒子放射治療' }[code], doc: 'PA-01-453 · 2025/7', color: 'amber', func, fit,
    cells: {
      kind: '附加條款（1年期，保證續保至第10年）', term: '1年期\n保證續保至第10年', age: '30–70歲',
      sum: amount, cash: '無', wait: '90天', ...dxNone, ...medNone, ...precNone,
      [rowKey]: amount + '\n給付一次後終止',
      reward: '最高10%＋防疫2%', discount: NA,
      ...(code === '1CPT' ? { sum: '30萬起，累計最高100萬\n期間內可加保' } : {}),
    },
  })),
];

export const CATALOG = {
  癌險: { groups: CANCER_GROUPS, rows: CANCER_ROWS, products: CANCER_PRODUCTS },
};
