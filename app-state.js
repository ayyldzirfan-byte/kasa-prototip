const STORAGE_KEY = "kasa-prototype-state-v6";
const APP_UPDATED_AT = "05.06.2026 23:10";

const entryTypes = [
  { id: "expense", label: "Gider", emoji: "💸" },
  { id: "income", label: "Gelir", emoji: "💰" },
  { id: "receivable", label: "Alacak", emoji: "🤝" },
  { id: "payable", label: "Ödeme", emoji: "⏰" },
];

const headingSuggestionGroups = {
  expense: [
    { name: "Market", shortName: "Market", emoji: "🛒" },
    { name: "Kira", shortName: "Kira", emoji: "🏠" },
    { name: "Benzin", shortName: "Yakıt", emoji: "⛽" },
    { name: "Araç HGS", shortName: "HGS", emoji: "🚗" },
    { name: "Araç MTV", shortName: "MTV", emoji: "🧾" },
    { name: "Fatura", shortName: "Fatura", emoji: "💡" },
    { name: "Çocuk", shortName: "Mini", emoji: "🍼" },
    { name: "Tatil", shortName: "Kaçış", emoji: "🏖️" },
    { name: "Diğer gider", shortName: "Diğer", emoji: "🧾" },
  ],
  income: [
    { name: "Maaş", shortName: "Maaş", emoji: "💼" },
    { name: "Ek iş", shortName: "Ek gelir", emoji: "⚡" },
    { name: "Satış", shortName: "Satış", emoji: "🏷️" },
    { name: "Alacak tahsilatı", shortName: "Tahsilat", emoji: "🤝" },
    { name: "Kira geliri", shortName: "Kira +", emoji: "🏠" },
    { name: "Hediye", shortName: "Hediye", emoji: "🎁" },
    { name: "Tatil katkısı", shortName: "Katkı", emoji: "🏖️" },
    { name: "Diğer gelir", shortName: "Diğer +", emoji: "💰" },
  ],
  receivable: [
    { name: "Borç verdim", shortName: "Alacak", emoji: "🤝" },
    { name: "Beklenen ödeme", shortName: "Beklenen", emoji: "📌" },
    { name: "Tatil katkısı", shortName: "Katkı", emoji: "🏖️" },
    { name: "İade bekliyor", shortName: "İade", emoji: "↩️" },
  ],
  payable: [
    { name: "Kredi kartı", shortName: "Kart", emoji: "💳" },
    { name: "Kira günü", shortName: "Kira", emoji: "🏠" },
    { name: "Fatura günü", shortName: "Fatura", emoji: "💡" },
    { name: "Taksit", shortName: "Taksit", emoji: "🧾" },
  ],
};

const emojiOptionsByType = {
  expense: ["💸", "🛒", "🏠", "⛽", "🚗", "💡", "🪙", "🍼", "🏖️", "🧾"],
  income: ["💰", "💼", "⚡", "🏷️", "🤝", "🏠", "🎁", "🏖️", "📈", "🧾"],
  receivable: ["🤝", "📌", "↩️", "🏖️", "💬", "🧾"],
  payable: ["⏰", "💳", "🏠", "💡", "🧾", "📌"],
};

const purposeOptions = [
  "Ev / aile",
  "Ev arkadaşlığı",
  "İş ortaklığı",
  "Tatil / proje",
  "Araç giderleri",
  "Kendi bütçem",
];

const currencyOptions = [
  { code: "TRY", label: "TL" },
  { code: "USD", label: "USD" },
  { code: "EUR", label: "EUR" },
  { code: "GBP", label: "GBP" },
];

const personalityModes = {
  standart: { label: "Standart", success: "Doğru bildin.", fail: "Yanlış tahmin." },
  fatihterim: { label: "Fatih Terim", success: "Biz bitti demeden bitmez.", fail: "Hiç bitmeyen maç yok." },
  efsane: { label: "Efsane", success: "Efsane doğru bildi.", fail: "Bu sefer olmadı, efsane bile yanılır." },
  sakin: { label: "Sakin", success: "Hmm. Bildin.", fail: "Olmadı." },
};

const reactionPreset = ["🔥", "💸", "🤦", "🎉", "👀"];

const keywordEmojiMap = {
  market: "🛒",
  kira: "🏠",
  benzin: "⛽",
  fatura: "💡",
  yemek: "🍽",
  kahve: "☕",
  taksi: "🚕",
  sinema: "🎬",
  spor: "🏋",
  sağlık: "💊",
  saglik: "💊",
  giyim: "👕",
  oyun: "🎮",
  tatil: "✈️",
  hediye: "🎁",
  kitap: "📚",
};

const bankColumnMaps = {
  garanti: { label: "Garanti", dateCol: 0, descCol: 1, amountCol: 3, delimiter: ";" },
  isbank: { label: "İş Bankası", dateCol: 0, descCol: 2, amountCol: 4, delimiter: "," },
  yapikredi: { label: "Yapı Kredi", dateCol: 0, descCol: 1, amountCol: 2, delimiter: ";" },
  akbank: { label: "Akbank", dateCol: 1, descCol: 2, amountCol: 5, delimiter: "," },
  ziraat: { label: "Ziraat", dateCol: 0, descCol: 1, amountCol: 3, delimiter: ";" },
  other: { label: "Diğer", dateCol: 0, descCol: 1, amountCol: 2, delimiter: ";" },
};

const projectTemplates = [
  { id: "roommates", name: "Ev arkadaşları", headings: ["Kira", "Elektrik", "Su", "İnternet", "Market", "Temizlik", "Diğer"], splitType: "equal", hasBudgetTarget: false },
  { id: "couple-trip", name: "Çift tatil bütçesi", headings: ["Ulaşım", "Konaklama", "Yemek", "Aktivite", "Alışveriş", "Acil"], splitType: "equal", hasBudgetTarget: true, hasGoalItems: true },
  { id: "group-trip", name: "Grup tatili", headings: ["Ulaşım", "Konaklama", "Yemek", "Aktivite", "Alışveriş", "Acil"], splitType: "weighted", suggestedMemberCount: 4, hasGoalItems: true },
  { id: "personal-goal", name: "Kişisel hedef", headings: ["Hedef katkı", "Ekstra gelir", "Tasarruf"], splitType: "individual", hasGoalItems: true, savingsCoach: true },
  { id: "family-budget", name: "Aile bütçesi", headings: ["Kira", "Market", "Eğitim", "Sağlık", "Ulaşım", "Eğlence", "Giyim", "Diğer"], splitType: "weighted", hasBudgetTarget: true },
];

const funnyMessages = {
  asimEglence: [
    "Bugün eğlenceye {tutar} TL. Müsriflik bu.",
    "{tutar} TL eğlence. Kasa seni izliyor.",
    "Kahveye {tutar} TL. Bu para {hedefGun} günlük PC bütçen.",
  ],
  asimGenel: [
    "Bu hızla gidersen ay bitmeden para bitmez.",
    "{başlık} bu ay {tutar} TL oldu. Geçen ay {gecenAy} TL idi.",
    "Harcama rekoru kırmak üzeresin.",
  ],
  reconciliationDiff: [
    "Ekstren {diff} TL fazla gösteriyor. Cebinde delik mi var?",
    "{diff} TL kayıp. Dedektif moduna geçtik.",
    "Kasa ile banka arasında {diff} TL fark. Birileri bir şeyler saklıyor.",
    "{diff} TL gizemli hareket. Kasa sorguluyor.",
  ],
  reconciliationMatch: [
    "Her şey tuttu. Terfi ettiniz.",
    "Kasa ile banka el sıkıştı. Nadiren olur.",
    "Mükemmel uyum. Kasa seninle gurur duyuyor.",
    "Hiçbir şey kaybolmadı. Sen gerçeksin.",
  ],
  monthlyWin: [
    "Geçen aya göre {farkMutlak} TL tasarruf ettin. Terfi ettiniz.",
    "Bu ay kasayı iyi tuttu. {farkMutlak} TL kurtardın.",
    "Ay sonu raporu: başarılıydın.",
  ],
  monthlyWarn: [
    "Geçen aya göre {fark} TL daha fazla harcadın. Ne oldu?",
    "Bu ay biraz taştı. Bir sonraki ay telafi?",
    "{fark} TL fark var. Sürpriz harcamalar mıydı?",
  ],
  monthlyNeutral: ["Tutarlısın. Geçen ayla neredeyse aynı.", "Ay kapandı, kasa dengelendi."],
};

const defaultUsers = [];

const seedState = {
  activeView: "home",
  reportPeriod: "month",
  movementPeriod: "month",
  calendarTab: "calendar",
  addTab: "entry",
  settlementVisible: false,
  pendingDetail: "",
  reconciliationDetailId: "",
  reactionPickerEntryId: "",
  selectedTemplateId: "",
  previousView: "",
  groupMode: "list",
  activeMemberProfileId: "",
  lockedEntryType: "",
  calendarMonth: "",
  calendarFlip: 0,
  activeProjectId: "",
  activeUserId: "",
  signedInUserId: "",
  pendingLoginUserId: "",
  pendingLoginEmail: "",
  authMode: "login",
  cloudEnabled: false,
  cloudStatus: "",
  cloudUserId: "",
  cloudSyncAt: "",
  users: defaultUsers,
  projects: [],
  headings: [],
  entries: [],
  notifications: [],
  reactions: [],
  reconciliations: [],
  goals: [],
  settlements: [],
};

let state;
let draft;

const app = document.querySelector("#app");
const tabs = [...document.querySelectorAll(".tab")];

async function initApp() {
  state = normalizeState(loadState());
  state.activeView = "home";
  draft = makeDraft();
  if (typeof initCloudSession === "function") {
    try {
      await initCloudSession();
    } catch (error) {
      setCloudStatus(typeof friendlyCloudError === "function" ? friendlyCloudError(error) : "Bulut bağlantısı kurulamadı.");
    }
    draft = makeDraft();
  }

  document.querySelector("#demoReset").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    state = structuredClone(seedState);
    draft = makeDraft();
    saveState();
    render();
    toast("Kasa temizlendi.");
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      state.activeView = tab.dataset.view;
      if (state.activeView === "add") {
        draft.userId = currentUser()?.id || activeMembers()[0]?.id || state.users[0]?.id || "";
        draft.date = todayKey();
        draft.amountInput = "";
      }
      saveState();
      render();
    });
  });

  render();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}
