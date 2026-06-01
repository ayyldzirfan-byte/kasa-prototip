const STORAGE_KEY = "kasa-prototype-state-v6";
const APP_UPDATED_AT = "01.06.2026 22:58";

const entryTypes = [
  { id: "expense", label: "Gider", emoji: "💸" },
  { id: "income", label: "Gelir", emoji: "💰" },
  { id: "receivable", label: "Alacak", emoji: "🤝" },
  { id: "payable", label: "Ödeme", emoji: "⏰" },
];

const headingSuggestions = [
  { name: "Market", shortName: "Market", emoji: "🛒" },
  { name: "Kira", shortName: "Kira", emoji: "🏠" },
  { name: "Benzin", shortName: "Yakıt", emoji: "⛽" },
  { name: "Araç HGS", shortName: "HGS", emoji: "🚗" },
  { name: "Araç MTV", shortName: "MTV", emoji: "🧾" },
  { name: "Araç Kira", shortName: "Araç", emoji: "🔑" },
  { name: "Fatura", shortName: "Fatura", emoji: "💡" },
  { name: "Altın", shortName: "Haraç", emoji: "🪙" },
  { name: "Çocuk", shortName: "Mini", emoji: "🍼" },
  { name: "Tatil", shortName: "Kaçış", emoji: "🏖️" },
  { name: "İş", shortName: "İş", emoji: "💼" },
  { name: "Diğer", shortName: "Diğer", emoji: "🧾" },
];

const purposeOptions = [
  "Ev / aile",
  "Ev arkadaşlığı",
  "İş ortaklığı",
  "Tatil / proje",
  "Araç giderleri",
  "Kendi bütçem",
];

const defaultUsers = [];

const seedState = {
  activeView: "home",
  reportPeriod: "month",
  settlementVisible: false,
  activeProjectId: "",
  activeUserId: "",
  signedInUserId: "",
  authMode: "login",
  users: defaultUsers,
  projects: [],
  headings: [],
  entries: [],
};

let state;
let draft;

const app = document.querySelector("#app");
const tabs = [...document.querySelectorAll(".tab")];

function initApp() {
  state = normalizeState(loadState());
  state.activeView = "home";
  draft = makeDraft();

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
      saveState();
      render();
    });
  });

  render();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}