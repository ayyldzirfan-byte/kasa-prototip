const STORAGE_KEY = "kasa-prototype-state-v6";
const APP_UPDATED_AT = "03.06.2026 23:37";

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
    { name: "Altın", shortName: "Haraç", emoji: "🪙" },
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


function makeDraft() {
  const members = activeMembers();
  const signedInUser = state?.users?.find((user) => user.id === state?.signedInUserId);
  const activeUserInProject = members.find((user) => user.id === state?.activeUserId);

  return {
    type: "expense",
    emoji: "💸",
    settlement: "in",
    userId: signedInUser?.id || activeUserInProject?.id || members[0]?.id || state?.activeUserId || state?.users?.[0]?.id || "",
    amountInput: "",
    currency: "TRY",
    exchangeRate: 1,
    date: todayKey(),
    notificationMode: "open",
    notificationEmoji: "🎲",
    notificationGif: "",
    successReaction: "✅",
    successGif: "",
    failReaction: "🙃",
    failGif: "",
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && (saved.users?.length || saved.projects?.length || saved.authMode)) return saved;
  } catch {
    // Broken local state should not block the prototype.
  }
  return structuredClone(seedState);
}

function normalizePassword(value) {
  return String(value || "").trim();
}

function normalizeState(saved) {
  const source = saved && typeof saved === "object" ? saved : {};
  const users = (Array.isArray(source.users) && source.users.length ? source.users : seedState.users).map((user) => ({
    id: user.id || makeId(),
    name: user.name || "Kullanıcı",
    nickname: user.nickname || "",
    email: user.email || "",
    password: normalizePassword(user.password),
    onayModu: personalityModes[user.onayModu] ? user.onayModu : "standart",
    totalScore: Number(user.totalScore || 0),
    correctGuesses: Number(user.correctGuesses || 0),
    totalGuesses: Number(user.totalGuesses || 0),
    createdAt: user.createdAt || new Date().toISOString(),
    createdBy: user.createdBy || "",
  }));

  const userIds = users.map((user) => user.id);
  const projects = (Array.isArray(source.projects) && source.projects.length ? source.projects : seedState.projects).map((project) => ({
    id: project.id || makeId(),
    name: project.name || "Ortak Kasa",
    purpose: project.purpose || "Genel kasa",
    code: project.code || generateProjectCode(project.name || project.id || "kasa"),
    createdAt: project.createdAt || new Date().toISOString(),
    createdBy: project.createdBy || source.activeUserId || "",
    memberIds: Array.isArray(project.memberIds) && project.memberIds.length ? project.memberIds.filter((id) => userIds.includes(id)) : userIds,
    memberAliases: project.memberAliases && typeof project.memberAliases === "object" ? project.memberAliases : {},
    defaultCurrency: project.defaultCurrency || "TL",
    defaultHeadings: Array.isArray(project.defaultHeadings) ? project.defaultHeadings : [],
    splitType: project.splitType || "equal",
    templateId: project.templateId || "",
    budgetLimits: project.budgetLimits && typeof project.budgetLimits === "object" ? project.budgetLimits : {},
    hasBudgetTarget: Boolean(project.hasBudgetTarget),
    hasGoalItems: Boolean(project.hasGoalItems),
  }));

  projects.forEach((project) => {
    if (!project.memberIds.length && users[0]) project.memberIds.push(users[0].id);
  });

  const activeProjectId = projects.some((project) => project.id === source.activeProjectId) ? source.activeProjectId : projects[0]?.id || "";
  const signedInUserId = users.some((user) => user.id === source.signedInUserId) ? source.signedInUserId : "";
  const activeUserId = users.some((user) => user.id === source.activeUserId) ? source.activeUserId : signedInUserId;
  const pendingLoginUserId = users.some((user) => user.id === source.pendingLoginUserId) ? source.pendingLoginUserId : activeUserId || users[users.length - 1]?.id || "";
  const reportPeriod = ["day", "week", "month"].includes(source.reportPeriod) ? source.reportPeriod : "month";
  const movementPeriod = ["day", "week", "month", "all"].includes(source.movementPeriod) ? source.movementPeriod : "month";
  const entries = Array.isArray(source.entries)
    ? source.entries.map((entry) => ({
        ...entry,
        headingId: entry.headingId || entry.heading_id || "",
        headingName: entry.headingName || "",
        lockedNotificationId: entry.lockedNotificationId || "",
        photoData: entry.photoData || "",
        autoRevealAt: entry.autoRevealAt || "",
        rateLockedAt: entry.rateLockedAt || entry.createdAt || new Date().toISOString(),
        paidById: entry.paidById || entry.userId || "",
        splitWith: Array.isArray(entry.splitWith) && entry.splitWith.length ? entry.splitWith : entry.userId ? [entry.userId] : [],
        splitRatio: Array.isArray(entry.splitRatio) && entry.splitRatio.length ? entry.splitRatio.map(Number) : [1],
        ocrRawText: entry.ocrRawText ?? null,
        ocrParsedAmount: entry.ocrParsedAmount ?? null,
      }))
    : [];
  const notifications = Array.isArray(source.notifications)
    ? source.notifications.map((notification) => ({
        ...notification,
        photoData: notification.photoData || "",
        gif: notification.gif || "",
        successPhotoData: notification.successPhotoData || "",
        successGif: notification.successGif || "",
        failPhotoData: notification.failPhotoData || "",
        failGif: notification.failGif || "",
        guessDeadline: notification.guessDeadline || notification.autoRevealAt || addHours(notification.createdAt || new Date().toISOString(), 48),
        revealedAt: notification.revealedAt || "",
        isCompleted: Boolean(notification.isCompleted || notification.revealedAt),
        notificationType: notification.notificationType || (notification.mode ? "entry" : "reaction"),
        reactionEmoji: notification.reactionEmoji || "",
        guesses: Array.isArray(notification.guesses)
          ? notification.guesses.map((guess) => ({
              userId: guess.userId,
              predictedType: guess.predictedType || guess.guess || "",
              predictedAmount: guess.predictedAmount ?? null,
              isCorrect: guess.isCorrect ?? guess.correct ?? null,
              guessedAt: guess.guessedAt || guess.at || new Date().toISOString(),
              guess: guess.guess || guess.predictedType || "",
              correct: guess.correct ?? guess.isCorrect ?? null,
              at: guess.at || guess.guessedAt || new Date().toISOString(),
            }))
          : [],
      }))
    : [];
  const reactions = Array.isArray(source.reactions)
    ? source.reactions.map((reaction) => ({
        id: reaction.id || makeId(),
        entryId: reaction.entryId || "",
        projectId: reaction.projectId || activeProjectId,
        userId: reaction.userId || "",
        emoji: reaction.emoji || "👀",
        createdAt: reaction.createdAt || new Date().toISOString(),
      }))
    : [];
  const reconciliations = Array.isArray(source.reconciliations)
    ? source.reconciliations.map((item) => ({
        id: item.id || makeId(),
        projectId: item.projectId || activeProjectId,
        userId: item.userId || "",
        month: item.month || monthKey(),
        bankName: item.bankName || "",
        uploadedAt: item.uploadedAt || new Date().toISOString(),
        statementTotal: Number(item.statementTotal || 0),
        kasaTotal: Number(item.kasaTotal || 0),
        diff: Number(item.diff || 0),
        status: item.status || "pending",
        rawRows: Array.isArray(item.rawRows) ? item.rawRows : [],
      }))
    : [];
  const goals = Array.isArray(source.goals)
    ? source.goals.map((goal) => ({
        id: goal.id || makeId(),
        projectId: goal.projectId || activeProjectId,
        createdBy: goal.createdBy || signedInUserId || activeUserId || "",
        title: goal.title || "Hedef",
        targetAmount: Number(goal.targetAmount || 0),
        currentAmount: Number(goal.currentAmount || 0),
        deadline: goal.deadline || "",
        items: Array.isArray(goal.items) ? goal.items : [],
        status: goal.status || "active",
        createdAt: goal.createdAt || new Date().toISOString(),
      }))
    : [];
  const settlements = Array.isArray(source.settlements)
    ? source.settlements.map((settlement) => ({
        id: settlement.id || makeId(),
        projectId: settlement.projectId || activeProjectId,
        fromUserId: settlement.fromUserId || "",
        toUserId: settlement.toUserId || "",
        amount: Number(settlement.amount || 0),
        settledAt: settlement.settledAt || new Date().toISOString(),
        note: settlement.note || "",
      }))
    : [];

  return {
    ...seedState,
    ...source,
    activeView: source.activeView || "home",
    reportPeriod,
    movementPeriod,
    calendarTab: ["calendar", "goals"].includes(source.calendarTab) ? source.calendarTab : "calendar",
    addTab: ["entry", "statement"].includes(source.addTab) ? source.addTab : "entry",
    activeProjectId,
    activeUserId,
    signedInUserId,
    pendingLoginUserId,
    pendingLoginEmail: source.pendingLoginEmail || "",
    authMode: source.authMode === "signup" ? "signup" : "login",
    cloudEnabled: Boolean(source.cloudEnabled),
    cloudStatus: source.cloudStatus || "",
    cloudUserId: source.cloudUserId || "",
    cloudSyncAt: source.cloudSyncAt || "",
    users,
    projects,
    headings: Array.isArray(source.headings) ? source.headings : [],
    entries,
    notifications,
    reactions,
    reconciliations,
    goals,
    settlements,
    reconciliationDetailId: source.reconciliationDetailId || "",
    reactionPickerEntryId: source.reactionPickerEntryId || "",
    selectedTemplateId: source.selectedTemplateId || "",
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (typeof scheduleCloudSync === "function") scheduleCloudSync();
}

function render() {
  const needsAuth = !currentUser();
  const needsProject = !needsAuth && !activeProject();

  document.body.dataset.view = needsAuth || needsProject ? "onboarding" : state.activeView;
  const updateStamp = document.querySelector(".update-stamp");
  if (updateStamp) updateStamp.textContent = `Güncellendi ${APP_UPDATED_AT}`;
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === state.activeView));

  if (needsAuth) {
    app.innerHTML = renderAuth();
    bindScreen();
    return;
  }

  if (needsProject) {
    app.innerHTML = renderProjectSetup();
    bindScreen();
    return;
  }

  const screens = {
    home: renderHome,
    add: renderAdd,
    movements: renderMovements,
    calendar: renderCalendar,
    report: renderReport,
    group: renderGroup,
    headings: renderHeadings,
    notifications: renderNotifications,
  };

  const current = screens[state.activeView] ? state.activeView : "home";
  app.innerHTML = `${current !== "home" ? backHeader() : ""}${screens[current]()}`;
  bindScreen();
}

function backHeader() {
  return `
    <div class="back-row">
      <button class="back-button" data-action="go-back" type="button" aria-label="Ana ekrana dön">
        <span aria-hidden="true">‹</span>
        Geri
      </button>
    </div>
  `;
}

function renderAuth() {
  const isSignup = state.authMode === "signup";
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();
  const selectedLoginUserId = state.users.some((user) => user.id === state.pendingLoginUserId)
    ? state.pendingLoginUserId
    : state.users[state.users.length - 1]?.id || "";

  return `
    <section class="auth-card form-grid onboarding-card">
      <div class="brand-lockup">
        <img src="./icon.svg" alt="" />
        <p class="eyebrow">Geçici isim</p>
        <h2>Kasa</h2>
        <p>Ev, iş ve ortak harcamaları tek kasada takip et.</p>
        <span class="cloud-pill">${typeof cloudLabel === "function" ? cloudLabel() : "Yerel deneme"}</span>
        ${state.cloudStatus ? `<span class="field-help">${state.cloudStatus}</span>` : ""}
      </div>

      <div class="auth-switch">
        <button class="${!isSignup ? "active" : ""}" data-action="auth-mode" data-mode="login" type="button">Giriş yap</button>
        <button class="${isSignup ? "active" : ""}" data-action="auth-mode" data-mode="signup" type="button">Yeni kullanıcı</button>
      </div>

      ${
        isSignup
          ? `
            <form class="form-grid" id="accountForm">
              <label>
                <span class="field-label">Ad soyad</span>
                <input class="text-input" name="userName" placeholder="Örn. İrfan Ayyıldız" autocomplete="name" />
              </label>
              <label>
                <span class="field-label">Kısa isim / lakap</span>
                <input class="text-input" name="nickname" placeholder="Örn. İrfan, anne, ortak" autocomplete="off" />
              </label>
              <label>
                <span class="field-label">E-posta</span>
                <input class="text-input" name="email" type="email" placeholder="Örn. irfan@mail.com" autocomplete="email" />
              </label>
              <label>
                <span class="field-label">Şifre</span>
                <input class="text-input" name="password" type="password" placeholder="En az 4 karakter" autocomplete="new-password" />
              </label>
              <button class="primary-button" type="submit">Kullanıcı oluştur</button>
            </form>
          `
          : cloudReady
            ? `
            <form class="form-grid" id="loginForm">
              <label>
                <span class="field-label">E-posta</span>
                <input class="text-input" name="loginEmail" type="email" value="${state.pendingLoginEmail || ""}" placeholder="mail@ornek.com" autocomplete="email" />
              </label>
              <label>
                <span class="field-label">Şifre</span>
                <input class="text-input" name="loginPassword" type="password" placeholder="Şifren" autocomplete="current-password" />
              </label>
              <button class="primary-button" type="submit">Giriş yap</button>
            </form>
          `
            : state.users.length
            ? `
            <form class="form-grid" id="loginForm">
              <label>
                <span class="field-label">Kullanıcı</span>
                <select class="select-input" name="loginUserId">
                  ${state.users.map((user) => `<option value="${user.id}"${user.id === selectedLoginUserId ? " selected" : ""}>${profileLabel(user)}${user.email ? ` · ${user.email}` : ""}</option>`).join("")}
                </select>
              </label>
              <label>
                <span class="field-label">Şifre</span>
                <input class="text-input" name="loginPassword" type="password" placeholder="Şifren" autocomplete="current-password" />
              </label>
              <button class="primary-button" type="submit">Giriş yap</button>
            </form>
          `
            : ""
      }
    </section>
  `;
}

function renderProjectSetup() {
  const user = currentUser();
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();
  return `
    <section class="form-card form-grid onboarding-card">
      <div>
        <p class="eyebrow">Kasa kurulumu</p>
        <h2>${profileLabel(user)}, şimdi kasa seç</h2>
        <p class="hero-note">${cloudReady ? "Hesabın hazır. Uygulamayı kullanmak için ilk kasanı oluştur." : "Deneme sürümünde önce kendi kasanı kur. Diğer profilleri daha sonra aynı projenin içine manuel ekleyeceğiz."}</p>
      </div>

      <form class="form-grid" id="firstProjectForm">
        <label>
          <span class="field-label">Kasa / proje adı</span>
          <input class="text-input" name="projectName" placeholder="Örn. Ev Kasası" autocomplete="off" />
        </label>
        <label>
          <span class="field-label">Amaç</span>
          <input class="text-input" name="purpose" list="purposeList" placeholder="Ev, iş, ev arkadaşlığı..." autocomplete="off" />
        </label>
        <datalist id="purposeList">
          ${purposeOptions.map((purpose) => `<option value="${purpose}"></option>`).join("")}
        </datalist>
        <button class="primary-button" type="submit">Kasa oluştur</button>
      </form>
    </section>
  `;
}


function renderHome() {
  const project = activeProject();
  const user = currentUser();
  const totals = calculateTotals(projectEntries());
  const recent = actualEntries().slice(0, 3);
  const upcoming = pendingEntries().slice(0, 2);
  const notificationCount = notificationEntries().length;

  return `
    <section class="account-strip">
      <div>
        <span class="field-label">Aktif kullanıcı</span>
        <strong>${projectUserLabel(user)}</strong>
      </div>
      <div class="account-actions">
        <button class="tiny-button" data-action="open-notifications" type="button">Bildirimler${notificationCount ? ` (${notificationCount})` : ""}</button>
        <button class="tiny-button" data-action="logout" type="button">Çıkış</button>
      </div>
    </section>

    <section class="hero">
      <div class="hero-row">
        <div>
          <p class="hero-title">${project.purpose}</p>
          <p class="hero-money">${money(totals.comfortable)}</p>
          <p class="hero-note">Rahat kalan: gerçek kasa + beklenenler - yaklaşanlar</p>
        </div>
        <span class="quick-pill">${totals.comfortable >= 0 ? "İyi" : "Dikkat"}</span>
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>${project.name}</h2>
          <p>${activeMembers().map((user) => projectUserLabel(user)).join(", ") || "Henüz üye yok"}</p>
        </div>
        <button class="tiny-button" data-action="open-group" type="button">Yönet</button>
      </div>
      <label style="display:block; margin-top: 12px;">
        <span class="field-label">Aktif proje</span>
        <select class="select-input" id="projectSelect">
          ${state.projects.map((item) => `<option value="${item.id}" ${item.id === state.activeProjectId ? "selected" : ""}>${item.name}</option>`).join("")}
        </select>
      </label>
    </section>

    <section class="quick-actions">
      <button class="action-button income" data-action="go-add-income" type="button">
        <span>💰</span>
        Gelir ekle
      </button>
      <button class="action-button expense" data-action="go-add-expense" type="button">
        <span>💸</span>
        Gider ekle
      </button>
    </section>

    <section class="grid-2">
      <article class="stat-card">
        <p class="stat-label">Giren</p>
        <p class="stat-value positive">${money(totals.income)}</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">Çıkan</p>
        <p class="stat-value warning">${money(totals.expense)}</p>
      </article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="receivable">
        <p class="stat-label">Beklenen</p>
        <p class="stat-value">${money(totals.receivable)}</p>
      </article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="payable">
        <p class="stat-label">Yaklaşan</p>
        <p class="stat-value">${money(totals.payable)}</p>
      </article>
    </section>

    ${
      state.pendingDetail
        ? `
          <section class="card">
            <div class="section-head">
              <div>
                <h2>${state.pendingDetail === "receivable" ? "Beklenen gelirler" : "Yaklaşan ödemeler"}</h2>
                <p>${state.pendingDetail === "receivable" ? "Şu gelecek." : "Bu gidecek."}</p>
              </div>
              <button class="tiny-button" data-action="hide-pending-detail" type="button">Kapat</button>
            </div>
            <div class="expense-list">${pendingDetailRows(state.pendingDetail)}</div>
          </section>
        `
        : ""
    }

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Yaklaşanlar</h2>
          <p>Ödeme hatırlatıcıları burada görünür.</p>
        </div>
        <button class="tiny-button" data-action="go-add-payable" type="button">Ekle</button>
      </div>
      <div class="expense-list">
        ${upcoming.length ? upcoming.map(pendingRow).join("") : `<div class="empty-state">Henüz beklenen alacak veya yaklaşan ödeme yok.</div>`}
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Son hareketler</h2>
          <p>Detay ve oyun sonucu için tümünü aç.</p>
        </div>
        <button class="tiny-button" data-action="open-movements" type="button">Tümü</button>
      </div>
      <div class="expense-list">
        ${recent.length ? recent.map(entryRow).join("") : `<div class="empty-state">Kasa boş. İlk hareketi ekleyerek başlayalım.</div>`}
      </div>
    </section>
  `;
}

function renderAdd() {
  const type = entryTypes.find((item) => item.id === draft.type) || entryTypes[0];
  const members = activeMembers();
  const suggestions = headingSuggestionsFor(type.id);
  const emojiOptions = emojiOptionsFor(type.id);
  const amountValue = draft.amountInput || "";
  const entryUser = currentUser() || members[0];
  const dateLabel = {
    expense: "Gider tarihi",
    income: "Gelir tarihi",
    receivable: "Beklenen gelir tarihi",
    payable: "Beklenen ödeme tarihi",
  }[type.id];
  const typeGuidance = {
    expense: "Para çıktıysa gider. İleri tarihli ödemeyi Takvim için Ödeme olarak gir.",
    income: "Para yattıysa gelir. Maaş yatacaksa Alacak seçip beklenen tarihi yaz.",
    receivable: "Henüz yatmamış gelir. Takvimde beklenen para olarak görünür.",
    payable: "Henüz ödenmemiş gider. Takvimde yaklaşan ödeme olarak görünür.",
  }[type.id];
  const headingLabel = type.id === "income" || type.id === "receivable" ? "Gelir başlığı" : "Gider başlığı";
  const headingPlaceholder = type.id === "income" || type.id === "receivable" ? "Örn. Maaş, ek iş, satış" : "Örn. Kira, HGS, market";
  const shortPlaceholder = type.id === "income" || type.id === "receivable" ? "Örn. maaş günü, yan gelir, tahsilat" : "Örn. haraç, yol yedi, ayın tokadı";
  const notePlaceholder = type.id === "income" || type.id === "receivable" ? "Örn. Haziran maaşı, prim dahil" : "Örn. kasada farklı çıktı, ortak ödeme";
  return `
    <form class="form-card form-grid" id="entryForm">
      <div class="section-head">
        <div>
          <h2>${type.label} hareketi ekle</h2>
          <p>${activeProject().name} içine kayıt düşer.</p>
        </div>
      </div>

      <div class="type-grid">
        ${entryTypes.map((item) => `<button class="type-chip ${draft.type === item.id ? "selected" : ""}" data-entry-type="${item.id}" type="button"><span>${item.emoji}</span>${item.label}</button>`).join("")}
      </div>
      <p class="field-help">${typeGuidance}</p>
      <input type="hidden" name="userId" value="${entryUser?.id || ""}" />

      <div>
        <label class="field-label" for="amount">Tutar</label>
        <input class="amount-input" id="amount" name="amount" inputmode="numeric" placeholder="1.000" value="${amountValue}" autocomplete="off" />
      </div>

      <div class="grid-2 currency-grid ${draft.currency === "TRY" ? "single" : ""}">
        <label>
          <span class="field-label">Para birimi</span>
          <select class="select-input" name="currency">
            ${currencyOptions.map((item) => `<option value="${item.code}" ${draft.currency === item.code ? "selected" : ""}>${item.label}</option>`).join("")}
          </select>
        </label>
        <label class="fx-rate-field ${draft.currency === "TRY" ? "is-hidden" : ""}">
          <span class="field-label">Kur</span>
          <input class="select-input" name="exchangeRate" inputmode="decimal" placeholder="Örn. 32,5" value="${draft.exchangeRate || 1}" autocomplete="off" />
        </label>
      </div>

      <div class="grid-2 timing-grid ${type.id === "expense" ? "" : "single"}">
        <label>
          <span class="field-label">${dateLabel}</span>
          <input class="select-input" name="date" type="date" value="${draft.date || todayKey()}" />
          <span class="field-help">Maaş her ayın 1'inde yatıyorsa o günü seç.</span>
        </label>
        ${
          type.id === "expense"
            ? `
              <label>
                <span class="field-label">Hesaplaşma</span>
                <select class="select-input" name="settlement">
                  <option value="in" ${draft.settlement === "in" ? "selected" : ""}>Dahil</option>
                  <option value="out" ${draft.settlement === "out" ? "selected" : ""}>Dahil değil</option>
                </select>
              </label>
            `
            : `<input type="hidden" name="settlement" value="out" />`
        }
      </div>

      <div>
        <label class="field-label" for="headingName">${headingLabel}</label>
        <input class="text-input" id="headingName" name="headingName" placeholder="${headingPlaceholder}" autocomplete="off" />
      </div>

      <div>
        <label class="field-label" for="shortName">Kısa isim / lakap</label>
        <input class="text-input" id="shortName" name="shortName" placeholder="${shortPlaceholder}" autocomplete="off" />
      </div>

      <div>
        <span class="field-label">Öneriler</span>
        <div class="chips">
          ${suggestions.map((item) => `<button class="chip" data-suggestion="${item.name}" data-short="${item.shortName}" data-emoji="${item.emoji}" type="button">${item.emoji} ${item.name}</button>`).join("")}
        </div>
      </div>

      <div>
        <span class="field-label">Emoji</span>
        <div class="chips">
          ${emojiOptions
            .map((emoji) => `<button class="emoji-chip ${draft.emoji === emoji ? "selected" : ""}" data-chip="emoji" data-value="${emoji}" type="button">${emoji}</button>`)
            .join("")}
        </div>
      </div>

      ${
        ["income", "expense"].includes(type.id)
          ? `
            <details class="soft-details">
              <summary>Bildirim oyunu</summary>
              <div class="form-grid notification-options">
                <label>
                  <span class="field-label">Bildirim modu</span>
                  <select class="select-input" name="notificationMode">
                    <option value="open" ${draft.notificationMode === "open" ? "selected" : ""}>Açık bildir</option>
                    <option value="surprise" ${draft.notificationMode === "surprise" ? "selected" : ""}>Sürpriz tahmin</option>
                    <option value="silent" ${draft.notificationMode === "silent" ? "selected" : ""}>Sessiz kaydet</option>
                  </select>
                </label>
                <div class="media-picker">
                  <div>
                    <span class="field-label">Bildirim medyası</span>
                    <p class="field-help">Emoji, GIF/sticker linki veya fotoğraf aynı mesaj alanı gibi çalışır.</p>
                  </div>
                  <div class="media-grid">
                    <label>
                      <span class="field-label">Emoji</span>
                      <input class="text-input" name="notificationEmoji" maxlength="4" value="${draft.notificationEmoji || "🎲"}" autocomplete="off" />
                    </label>
                    <label>
                      <span class="field-label">GIF / sticker</span>
                      <input class="text-input" name="notificationGif" placeholder="Link veya kısa ad" value="${draft.notificationGif || ""}" autocomplete="off" />
                    </label>
                    <label class="photo-pick compact-pick">
                      <span>Fotoğraf</span>
                      <strong>Seç</strong>
                      <input name="notificationPhoto" type="file" accept="image/*" />
                    </label>
                  </div>
                </div>
                <div class="media-picker">
                  <div>
                    <span class="field-label">Tahmin sonrası tepkiler</span>
                    <p class="field-help">Doğru ve yanlış cevap için ayrı medya seçilebilir.</p>
                  </div>
                  <div class="reaction-grid">
                    <div class="reaction-column">
                      <strong>Doğru</strong>
                      <input class="text-input" name="successReaction" value="${draft.successReaction || "✅"}" autocomplete="off" />
                      <input class="text-input" name="successGif" placeholder="GIF / sticker linki" value="${draft.successGif || ""}" autocomplete="off" />
                      <label class="photo-pick compact-pick">
                        <span>Fotoğraf</span>
                        <strong>Seç</strong>
                        <input name="successPhoto" type="file" accept="image/*" />
                      </label>
                    </div>
                    <div class="reaction-column">
                      <strong>Yanlış</strong>
                      <input class="text-input" name="failReaction" value="${draft.failReaction || "🙃"}" autocomplete="off" />
                      <input class="text-input" name="failGif" placeholder="GIF / sticker linki" value="${draft.failGif || ""}" autocomplete="off" />
                      <label class="photo-pick compact-pick">
                        <span>Fotoğraf</span>
                        <strong>Seç</strong>
                        <input name="failPhoto" type="file" accept="image/*" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </details>
          `
          : `<input type="hidden" name="notificationMode" value="silent" />`
      }

      <label>
        <span class="field-label">Not (opsiyonel)</span>
        <input class="text-input" name="note" placeholder="${notePlaceholder}" autocomplete="off" />
        <span class="field-help">Hesaba katılmaz; sadece hareketin açıklaması olarak saklanır.</span>
      </label>

      <label class="photo-pick">
        <span>Fiş, belge veya ürün fotoğrafı ekle (opsiyonel)</span>
        <strong>Seç</strong>
        <input id="photoInput" name="photo" type="file" accept="image/*" />
      </label>

      <button class="primary-button" type="submit">Kaydet</button>
    </form>
  `;
}

function renderMovements() {
  const period = state.movementPeriod || "month";
  const entries = actualEntries().filter((entry) => isInPeriod(entry.date, period));
  const totals = calculateTotals(entries);
  const label = periodLabel(period);

  return `
    <section class="segmented segmented-four">
      ${[
        ["day", "Gün"],
        ["week", "Hafta"],
        ["month", "Ay"],
        ["all", "Tümü"],
      ].map(([value, labelText]) => `<button class="segment ${period === value ? "active" : ""}" data-movement-period="${value}" type="button">${labelText}</button>`).join("")}
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>${label} hareketleri</h2>
          <p>Görünen kayıtlar, tamamlanan tahmin oyunlarına göre hesaplanır.</p>
        </div>
        <span class="quick-pill">${entries.length} kayıt</span>
      </div>
      <div class="grid-2 compact-stats">
        <article class="stat-card small">
          <p class="stat-label">Giren</p>
          <p class="stat-value positive">${money(totals.income)}</p>
        </article>
        <article class="stat-card small">
          <p class="stat-label">Çıkan</p>
          <p class="stat-value warning">${money(totals.expense)}</p>
        </article>
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Detay</h2>
          <p>Fotoğraf, not, döviz ve oyun sonucu burada görünür.</p>
        </div>
      </div>
      <div class="expense-list">
        ${entries.length ? entries.map(movementEntryRow).join("") : `<div class="empty-state">Bu dönem için görünen hareket yok.</div>`}
      </div>
    </section>
  `;
}

function renderCalendar() {
  const pending = pendingEntries();
  const actual = actualEntries().slice(0, 6);

  return `
    <section class="card">
      <div class="section-head">
        <div>
          <h2>Takvim</h2>
          <p>Beklenen alacaklar ve yaklaşan ödemeler.</p>
        </div>
        <button class="tiny-button" data-action="go-add-payable" type="button">Ekle</button>
      </div>
      <div class="expense-list">
        ${pending.length ? pending.map(pendingRow).join("") : `<div class="empty-state">Takvim boş. Kira, MTV, müşteri ödemesi gibi şeyleri ekleyebilirsin.</div>`}
      </div>
    </section>

    <section class="card">
      <h2>Son tarihli kayıtlar</h2>
      <div class="expense-list">
        ${actual.length ? actual.map(entryRow).join("") : `<div class="empty-state">Gerçekleşmiş kayıt yok.</div>`}
      </div>
    </section>
  `;
}

function renderNotifications() {
  const notifications = notificationEntries();
  return `
    <section class="card">
      <div class="section-head">
        <div>
          <h2>Bildirimler</h2>
          <p>Bu ekranda sadece bu profile gelen proje bildirimleri görünür.</p>
        </div>
        <span class="quick-pill">${notifications.length}</span>
      </div>
      <div class="expense-list">
        ${notifications.length ? notifications.map(notificationRow).join("") : `<div class="empty-state">Şu an bu profile gelen bildirim yok.</div>`}
      </div>
    </section>
  `;
}

function renderReport() {
  const period = state.reportPeriod;
  const entries = actualEntries().filter((entry) => isInPeriod(entry.date, period));
  const totals = calculateTotals(entries);
  const label = periodLabel(period);
  const netClass = totals.actual >= 0 ? "positive" : "warning";

  return `
    <section class="segmented">
      ${[
        ["day", "Gün"],
        ["week", "Hafta"],
        ["month", "Ay"],
      ].map(([value, labelText]) => `<button class="segment ${period === value ? "active" : ""}" data-period="${value}" type="button">${labelText}</button>`).join("")}
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>${label} raporu</h2>
          <p>Giren ${money(totals.income)}, çıkan ${money(totals.expense)}, net ${money(totals.actual)}.</p>
        </div>
        <span class="quick-pill">${entries.length} kayıt</span>
      </div>
      <div class="grid-2 compact-stats">
        <article class="stat-card small">
          <p class="stat-label">Giren</p>
          <p class="stat-value positive">${money(totals.income)}</p>
        </article>
        <article class="stat-card small">
          <p class="stat-label">Çıkan</p>
          <p class="stat-value warning">${money(totals.expense)}</p>
        </article>
        <article class="stat-card small">
          <p class="stat-label">Net</p>
          <p class="stat-value ${netClass}">${money(totals.actual)}</p>
        </article>
        <article class="stat-card small">
          <p class="stat-label">Ortalama</p>
          <p class="stat-value">${money(entries.length ? totals.expense / entries.length : 0)}</p>
        </article>
      </div>
      <div class="bars" style="margin-top: 16px;">
        ${headingBars(entries)}
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Rapor detayı</h2>
          <p>Bu dönemde görünen gelir ve giderler.</p>
        </div>
      </div>
      <div class="expense-list">
        ${entries.length ? entries.map(movementEntryRow).join("") : `<div class="empty-state">Bu dönem için raporlanacak hareket yok.</div>`}
      </div>
    </section>

    <section class="receipt-card">
      <h2 class="receipt-title">KASA FİŞİ</h2>
      <div class="receipt-line"><span>${label} giren</span><strong>${money(totals.income)}</strong></div>
      <div class="receipt-line"><span>${label} çıkan</span><strong>${money(totals.expense)}</strong></div>
      <div class="receipt-line"><span>Net</span><strong>${money(totals.actual)}</strong></div>
      ${exchangeReceiptLines(entries)}
      <div class="receipt-line"><span>En hareketli başlık</span><strong>${topHeading(entries)}</strong></div>
      <p class="receipt-comment">${entries.length ? "Kasa konuştu, fiş çıktı." : "Kasa bugün sessiz."}</p>
      <button class="share-button" data-action="share-receipt" type="button">Fişi paylaş</button>
    </section>
  `;
}

function renderGroup() {
  const project = activeProject();
  const balances = calculateBalances();
  const transactions = simplifyDebts(balances);
  const canManageUsers = isProjectOwner(project);
  const owner = projectOwner(project);
  const user = currentUser();
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();

  return `
    <section class="card">
      <div class="section-head">
        <div>
          <h2>Projelerim</h2>
          <p>Proje seç, üyeleri bağla, gelir/gider senaryosunu kur.</p>
        </div>
      </div>
      <div class="quick-actions compact">
        <button class="action-button income" data-action="go-add-income" type="button">
          <span>💰</span>
          Gelir ekle
        </button>
        <button class="action-button expense" data-action="go-add-expense" type="button">
          <span>💸</span>
          Gider ekle
        </button>
      </div>
      <div class="expense-list" style="margin-top:12px;">
        ${state.projects.map(projectRow).join("")}
      </div>
      <form class="inline-form" id="projectForm">
        <input class="text-input" name="projectName" placeholder="Yeni proje adı" autocomplete="off" />
        <input class="text-input" name="purpose" list="purposeList" placeholder="Kasa amacı: Ev, iş, araç..." autocomplete="off" />
        <datalist id="purposeList">
          ${purposeOptions.map((purpose) => `<option value="${purpose}"></option>`).join("")}
        </datalist>
        <button class="primary-button" type="submit">Proje ekle</button>
      </form>
      ${
        cloudReady
          ? `
            <form class="inline-form cloud-join-card" id="joinProjectForm">
              <input class="text-input" name="projectCode" placeholder="Kasa kodu: KASA-EVK-1234" autocomplete="off" />
              <button class="secondary-button" type="submit">Kodla katıl</button>
            </form>
          `
          : ""
      }
    </section>

    <section class="card">
      <h2>Projeye kişi ekle</h2>
      <p>${
        canManageUsers
          ? cloudReady
            ? `Diğer kişi önce kendi telefonunda e-posta ile hesap açsın. Sonra e-postasını buraya yazıp ${project.name} kasasına ekle.`
            : `Önce diğer profili oluştur. Sonra adını buraya yazıp ${project.name} kasasına ekle.`
          : `Şu an ${projectUserLabel(user)} hesabındasın. Kullanıcı eklemek için ${projectUserLabel(owner)} hesabıyla giriş yap.`
      }</p>
      ${
        canManageUsers
          ? `
            <form class="inline-form featured-form" id="projectUserForm">
              <input class="text-input" name="userName" placeholder="${cloudReady ? "havva@mail.com" : "Örn. Havva veya Derya"}" autocomplete="${cloudReady ? "email" : "off"}" />
              <button class="primary-button" type="submit">Kasaya ekle</button>
            </form>
          `
          : `
            <div class="inline-form featured-form">
              <button class="secondary-button" data-action="logout" type="button">Çıkış yap</button>
              <span class="field-help">Sonra kasa sahibi profiliyle tekrar giriş yap.</span>
            </div>
          `
      }
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Sonraki aşama: proje erişimi</h2>
          <p>${cloudReady ? "Bu kodu başka telefondaki kullanıcı girerse aynı kasaya katılır." : "Bu denemede katılımı manuel profil ekleyerek yapıyoruz. Kod/link modeli gerçek çoklu telefon sürümüne kalacak."}</p>
        </div>
      </div>
      <div class="invite-box">
        <div>
          <span class="field-label">Kod</span>
          <strong>${projectCode(project)}</strong>
          <p>${inviteLink(project)}</p>
        </div>
        <button class="mini-action" data-action="copy-project-link" type="button">Kopyala</button>
      </div>
    </section>

    <section class="card">
      <h2>Kasa kullanıcıları</h2>
      <p>${
        canManageUsers
          ? `Kasa sahibi ${projectUserLabel(owner)}. Kullanıcı adını yazıp bu kasaya ekleyebilir.`
          : `Bu kasayı ${projectUserLabel(owner)} yönetir. Kullanıcı ekleme sadece onda.`
      }</p>
      <div class="expense-list" style="margin-top:12px;">
        ${state.users.map(userLinkRow).join("")}
      </div>
      ${
        canManageUsers
          ? `
            <form class="inline-form" id="userForm">
              <input class="text-input" name="userName" placeholder="${cloudReady ? "E-posta: havva@mail.com" : "Kullanıcı adı: Havva"}" autocomplete="${cloudReady ? "email" : "off"}" />
              <button class="primary-button" type="submit">Kasaya ekle</button>
            </form>
          `
          : `<div class="empty-state" style="margin-top:12px;">Kullanıcı eklemek için kasa sahibi hesabıyla giriş yap.</div>`
      }
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Borç & alacak</h2>
          <p>${state.settlementVisible ? "Hesaplaşma görünür." : "Şu an gizli. Ev huzuru modu."}</p>
        </div>
        <button class="tiny-button" data-action="toggle-settlement" type="button">${state.settlementVisible ? "Gizle" : "Göster"}</button>
      </div>
      ${
        state.settlementVisible
          ? `
            <div style="margin-top: 10px;">
              ${balances.length ? balances.map(balanceRow).join("") : `<div class="empty-state">Hesaplaşmaya dahil gider yok.</div>`}
            </div>
            <div style="margin-top: 12px;">
              ${
                transactions.length
                  ? transactions.map((tx) => `<div class="split-row"><strong>${tx.from} → ${tx.to}</strong><span>${money(tx.amount)}</span></div>`).join("")
                  : `<div class="empty-state">Şimdilik hesap kapanmış görünüyor.</div>`
              }
            </div>
          `
          : `<div class="empty-state" style="margin-top: 12px;">Açınca seçili projede kim kime ne kadar göndermeli görünür.</div>`
      }
    </section>
  `;
}

function renderHeadings() {
  return `
    <section class="form-card form-grid">
      <div class="section-head">
        <div>
          <h2>Başlık ekle</h2>
          <p>Resmi ad başka, proje içi lakabı başka olabilir.</p>
        </div>
      </div>

      <form class="form-grid" id="headingForm">
        <label>
          <span class="field-label">Başlık adı</span>
          <input class="text-input" name="headingName" placeholder="Örn. Altın" autocomplete="off" />
        </label>
        <label>
          <span class="field-label">Kısa isim / lakap</span>
          <input class="text-input" name="shortName" placeholder="Örn. haraç" autocomplete="off" />
        </label>
        <div>
          <span class="field-label">Emoji</span>
          <div class="chips">
            ${["🛒", "🏠", "⛽", "🚗", "💡", "🪙", "🍼", "🏖️", "💼", "🧾"]
              .map((emoji) => `<button class="emoji-chip ${draft.emoji === emoji ? "selected" : ""}" data-chip="emoji" data-value="${emoji}" type="button">${emoji}</button>`)
              .join("")}
          </div>
        </div>
        <button class="primary-button" type="submit">Başlığı kaydet</button>
      </form>
    </section>

    <section class="card">
      <h2>${activeProject().name} başlıkları</h2>
      <div class="expense-list">
        ${projectHeadings().length ? projectHeadings().map(headingRow).join("") : `<div class="empty-state">Henüz başlık yok.</div>`}
      </div>
    </section>
  `;
}


function formFile(data, name) {
  const file = data.get(name);
  return file && typeof file === "object" && file.size ? file : null;
}

function readImageAsDataUrl(file) {
  if (!file || typeof FileReader === "undefined") return Promise.resolve("");
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const source = String(reader.result || "");
      if (!source.startsWith("data:image/")) return resolve(source);
      if (file.type === "image/gif") return resolve(source);

      const image = new Image();
      image.onload = () => {
        const maxSide = 900;
        const scale = Math.min(1, maxSide / Math.max(image.width || maxSide, image.height || maxSide));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round((image.width || maxSide) * scale));
        canvas.height = Math.max(1, Math.round((image.height || maxSide) * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.onerror = () => resolve(source);
      image.src = source;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

async function mediaFromForm(data, fields) {
  const file = formFile(data, fields.photo);
  return {
    emoji: String(data.get(fields.emoji) || "").trim(),
    gif: String(data.get(fields.gif) || "").trim(),
    photoName: file?.name || "",
    photoData: await readImageAsDataUrl(file),
  };
}

function bindScreen() {
  app.querySelectorAll("[data-action='go-back']").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = "home";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='open-group']").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = "group";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='open-notifications']").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = "notifications";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='open-movements']").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = "movements";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='go-add'], [data-action='go-add-expense']").forEach((button) => {
    button.addEventListener("click", () => {
      draft.type = "expense";
      draft.emoji = "💸";
      draft.userId = currentUser()?.id || activeMembers()[0]?.id || state.users[0]?.id;
      draft.date = todayKey();
      draft.amountInput = "";
      state.activeView = "add";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='go-add-income']").forEach((button) => {
    button.addEventListener("click", () => {
      draft.type = "income";
      draft.emoji = "💰";
      draft.userId = currentUser()?.id || activeMembers()[0]?.id || state.users[0]?.id;
      draft.date = todayKey();
      draft.amountInput = "";
      state.activeView = "add";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='go-add-payable']").forEach((button) => {
    button.addEventListener("click", () => {
      draft.type = "payable";
      draft.emoji = "⏰";
      draft.userId = currentUser()?.id || activeMembers()[0]?.id || state.users[0]?.id;
      draft.date = todayKey();
      draft.amountInput = "";
      state.activeView = "add";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='open-headings']").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeView = "headings";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='toggle-settlement']").forEach((button) => {
    button.addEventListener("click", () => {
      state.settlementVisible = !state.settlementVisible;
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='show-pending-detail']").forEach((button) => {
    button.addEventListener("click", () => {
      state.pendingDetail = button.dataset.detail;
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='hide-pending-detail']").forEach((button) => {
    button.addEventListener("click", () => {
      state.pendingDetail = "";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='activate-project']").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeProjectId = button.dataset.id;
      draft = makeDraft();
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='toggle-user-project']").forEach((button) => {
    button.addEventListener("click", () => {
      toggleUserInProject(button.dataset.id);
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='copy-project-link']").forEach((button) => {
    button.addEventListener("click", () => copyProjectInvite());
  });

  app.querySelectorAll("[data-action='auth-mode']").forEach((button) => {
    button.addEventListener("click", () => {
      state.authMode = button.dataset.mode === "signup" ? "signup" : "login";
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-action='logout']").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        if (typeof isCloudReady === "function" && isCloudReady()) await cloudSignOut();
      } catch (error) {
        toast(friendlyCloudError(error));
      }
      state.signedInUserId = "";
      state.activeUserId = "";
      state.activeView = "home";
      state.authMode = "login";
      draft = makeDraft();
      saveState();
      render();
      toast("Çıkış yapıldı.");
    });
  });

  app.querySelectorAll("[data-action='share-receipt']").forEach((button) => {
    button.addEventListener("click", shareReceipt);
  });

  app.querySelectorAll("[data-action='guess-notification']").forEach((button) => {
    button.addEventListener("click", () => {
      const result = guessNotification(button.dataset.id, button.dataset.guess);
      if (result.status === "already") return toast("Bu sürprizi zaten tahmin ettin.");
      saveState();
      render();
      toast(result.guess?.correct ? "Doğru tahmin." : "Yanlış tahmin.");
    });
  });

  app.querySelectorAll("[data-action='settle-pending']").forEach((button) => {
    button.addEventListener("click", () => settlePending(button.dataset.id));
  });

  app.querySelectorAll("[data-period]").forEach((button) => {
    button.addEventListener("click", () => {
      state.reportPeriod = button.dataset.period;
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-movement-period]").forEach((button) => {
    button.addEventListener("click", () => {
      state.movementPeriod = button.dataset.movementPeriod;
      saveState();
      render();
    });
  });

  app.querySelectorAll("[data-entry-type]").forEach((button) => {
    button.addEventListener("click", () => {
      const form = app.querySelector("#entryForm");
      if (form) {
        draft.amountInput = formatAmountInput(form.elements.amount?.value);
        draft.currency = String(form.elements.currency?.value || draft.currency || "TRY");
        draft.exchangeRate = parseAmount(form.elements.exchangeRate?.value || draft.exchangeRate || 1);
        draft.userId = currentUser()?.id || String(form.elements.userId?.value || draft.userId || "");
        draft.date = String(form.elements.date?.value || draft.date || todayKey());
        draft.settlement = String(form.elements.settlement?.value || draft.settlement || "in");
        draft.notificationMode = String(form.elements.notificationMode?.value || draft.notificationMode || "open");
        draft.notificationEmoji = String(form.elements.notificationEmoji?.value || draft.notificationEmoji || "🎲");
        draft.notificationGif = String(form.elements.notificationGif?.value || draft.notificationGif || "");
        draft.successReaction = String(form.elements.successReaction?.value || draft.successReaction || "✅");
        draft.successGif = String(form.elements.successGif?.value || draft.successGif || "");
        draft.failReaction = String(form.elements.failReaction?.value || draft.failReaction || "🙃");
        draft.failGif = String(form.elements.failGif?.value || draft.failGif || "");
      }
      draft.type = button.dataset.entryType;
      draft.emoji = emojiOptionsFor(draft.type)[0] || entryTypes.find((type) => type.id === draft.type)?.emoji || draft.emoji;
      render();
    });
  });

  app.querySelectorAll("[data-chip='emoji']").forEach((button) => {
    button.addEventListener("click", () => {
      draft.emoji = button.dataset.value;
      button.closest(".chips")?.querySelectorAll(".emoji-chip").forEach((chip) => chip.classList.toggle("selected", chip === button));
    });
  });

  app.querySelectorAll("[data-suggestion]").forEach((button) => {
    button.addEventListener("click", () => {
      const form = app.querySelector("#entryForm");
      if (!form) return;
      form.elements.headingName.value = button.dataset.suggestion;
      form.elements.shortName.value = button.dataset.short;
    });
  });

  const projectSelect = app.querySelector("#projectSelect");
  if (projectSelect) {
    projectSelect.addEventListener("change", () => {
      state.activeProjectId = projectSelect.value;
      draft = makeDraft();
      saveState();
      render();
    });
  }

  const accountForm = app.querySelector("#accountForm");
  if (accountForm) {
    accountForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(accountForm);
      const name = String(data.get("userName") || "").trim();
      const email = String(data.get("email") || "").trim().toLowerCase();
      const password = normalizePassword(data.get("password"));
      if (!name) return toast("Ad soyad yazalım.");
      if (typeof isCloudReady === "function" && isCloudReady()) {
        if (!email || !email.includes("@")) return toast("Geçerli bir e-posta yazalım.");
        if (password.length < 6) return toast("Bulut hesabı için şifre en az 6 karakter olsun.");
        try {
          const result = await cloudSignUp({
            name,
            email,
            password,
            nickname: String(data.get("nickname") || "").trim(),
          });
          render();
          return toast(result.session ? "Hesap açıldı ve giriş yapıldı." : "Hesap açıldı. E-postadaki doğrulama linkini kontrol et.");
        } catch (error) {
          return toast(friendlyCloudError(error));
        }
      }
      if (password.length < 4) return toast("Şifre en az 4 karakter olsun.");
      const user = createUser(name, password, {
        email,
        nickname: String(data.get("nickname") || "").trim(),
        linkToProject: false,
      });
      state.signedInUserId = "";
      state.activeUserId = "";
      state.pendingLoginUserId = user.id;
      state.authMode = "login";
      saveState();
      render();
      toast("Hesap oluşturuldu. Şimdi giriş yap.");
    });
  }

  const firstProjectForm = app.querySelector("#firstProjectForm");
  if (firstProjectForm) {
    firstProjectForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(firstProjectForm);
      const name = String(data.get("projectName") || "").trim();
      if (!name) return toast("Kasa adını yazalım.");
      createProject(name, String(data.get("purpose") || "").trim() || "Genel kasa");
      try {
        saveState();
        if (typeof isCloudReady === "function" && isCloudReady()) await cloudPushState();
        render();
        toast("Kasa oluşturuldu.");
      } catch (error) {
        toast(friendlyCloudError(error));
      }
    });
  }

  const loginForm = app.querySelector("#loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(loginForm);
      if (typeof isCloudReady === "function" && isCloudReady()) {
        const email = String(data.get("loginEmail") || "").trim().toLowerCase();
        const password = normalizePassword(data.get("loginPassword"));
        if (!email || !email.includes("@")) return toast("E-postanı yazalım.");
        if (!password) return toast("Şifreni yazalım.");
        try {
          await cloudSignIn({ email, password });
          render();
          return toast("Giriş yapıldı.");
        } catch (error) {
          return toast(friendlyCloudError(error));
        }
      }
      const user = state.users.find((item) => item.id === String(data.get("loginUserId")));
      if (!state.users.length) return toast("Önce kullanıcı oluştur.");
      if (!user) return toast("Kullanıcı bulunamadı.");
      const password = normalizePassword(data.get("loginPassword"));
      if (user.password && normalizePassword(user.password) !== password) return toast("Şifre yanlış.");
      if (!user.password && password) return toast("Bu profil şifresiz.");
      if (!user.password && !password) return toast("Bu profil için şifre yok. Deneme profillerini hareket içinde seçebilirsin.");
      state.signedInUserId = user.id;
      state.activeUserId = user.id;
      state.pendingLoginUserId = "";
      draft = makeDraft();
      saveState();
      render();
      toast(`${profileLabel(user)} giriş yaptı.`);
    });
  }

  const quickUserForm = app.querySelector("#quickUserForm");
  if (quickUserForm) {
    quickUserForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(quickUserForm);
      const name = String(data.get("userName") || "").trim();
      if (!name) return toast("Kullanıcı adını yazalım.");
      createUser(name, String(data.get("password") || ""), { nickname: String(data.get("nickname") || "").trim(), makeActive: false });
      saveState();
      render();
      toast("Kullanıcı oluşturuldu ve projeye bağlandı.");
    });
  }

  const joinProjectForm = app.querySelector("#joinProjectForm");
  if (joinProjectForm) {
    joinProjectForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const code = normalizeCode(new FormData(joinProjectForm).get("projectCode"));
      if (!code) return toast("Proje kodunu yazalım.");
      if (typeof isCloudReady === "function" && isCloudReady()) {
        try {
          await cloudJoinProjectByCode(code);
          render();
          return toast("Kasaya katıldın.");
        } catch (error) {
          return toast(friendlyCloudError(error));
        }
      }
      const project = state.projects.find((item) => normalizeCode(projectCode(item)) === code);
      if (!project) return toast("Bu kod bu cihazda yok. Gerçekte bulut veritabanından açılacak.");
      const userId = state.activeUserId || state.users[0]?.id;
      if (userId && !project.memberIds.includes(userId)) project.memberIds.push(userId);
      state.activeProjectId = project.id;
      draft = makeDraft();
      saveState();
      render();
      toast("Projeye katıldın.");
    });
  }

  const entryForm = app.querySelector("#entryForm");
  if (entryForm) {
    const amountInput = entryForm.querySelector("#amount");
    if (amountInput) {
      amountInput.addEventListener("input", () => {
        amountInput.value = formatAmountInput(amountInput.value);
        draft.amountInput = amountInput.value;
      });
    }

    const currencySelect = entryForm.querySelector("select[name='currency']");
    const rateField = entryForm.querySelector(".fx-rate-field");
    const currencyGrid = entryForm.querySelector(".currency-grid");
    const rateInput = entryForm.querySelector("input[name='exchangeRate']");
    if (currencySelect && rateField) {
      currencySelect.addEventListener("change", () => {
        const isTry = currencySelect.value === "TRY";
        rateField.classList.toggle("is-hidden", isTry);
        currencyGrid?.classList.toggle("single", isTry);
        draft.currency = currencySelect.value;
        if (isTry && rateInput) {
          rateInput.value = "1";
          draft.exchangeRate = 1;
        }
      });
    }

    entryForm.querySelectorAll("select[name='notificationMode'], input[name='notificationEmoji'], input[name='notificationGif'], input[name='successReaction'], input[name='successGif'], input[name='failReaction'], input[name='failGif']").forEach((field) => {
      field.addEventListener("change", () => {
        draft.notificationMode = entryForm.elements.notificationMode?.value || draft.notificationMode;
        draft.notificationEmoji = entryForm.elements.notificationEmoji?.value || draft.notificationEmoji;
        draft.notificationGif = entryForm.elements.notificationGif?.value || draft.notificationGif;
        draft.successReaction = entryForm.elements.successReaction?.value || draft.successReaction;
        draft.successGif = entryForm.elements.successGif?.value || draft.successGif;
        draft.failReaction = entryForm.elements.failReaction?.value || draft.failReaction;
        draft.failGif = entryForm.elements.failGif?.value || draft.failGif;
      });
    });

    entryForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(entryForm);
      const enteredAmount = parseAmount(data.get("amount"));
      const currency = String(data.get("currency") || "TRY").toUpperCase();
      const exchangeRate = currency === "TRY" ? 1 : parseAmount(data.get("exchangeRate"));
      const amount = enteredAmount * exchangeRate;
      const headingName = String(data.get("headingName") || "").trim();

      if (!enteredAmount || enteredAmount <= 0) return toast("Önce tutarı yazalım.");
      if (!currencyOptions.some((item) => item.code === currency)) return toast("Para birimini seçelim.");
      if (!exchangeRate || exchangeRate <= 0) return toast("Döviz için kuru yazalım.");
      if (!headingName) return toast("Bir başlık yazalım.");
      if (!activeMembers().length) return toast("Önce projeye kullanıcı bağlayalım.");

      const short = String(data.get("shortName") || "").trim() || headingName;
      const heading = ensureHeading(headingName, short, draft.emoji);
      const userId = currentUser()?.id || String(data.get("userId"));
      const date = String(data.get("date") || todayKey());
      const settlement = String(data.get("settlement")) === "in";

      if (userId && activeProject() && !activeProject().memberIds.includes(userId)) activeProject().memberIds.push(userId);
      draft.userId = userId;
      draft.settlement = settlement ? "in" : "out";
      draft.date = date;
      draft.currency = currency;
      draft.exchangeRate = exchangeRate;
      draft.amountInput = formatAmountInput(data.get("amount"));
      draft.notificationMode = String(data.get("notificationMode") || draft.notificationMode || "silent");
      draft.notificationEmoji = String(data.get("notificationEmoji") || draft.notificationEmoji || "🎲").trim();
      draft.notificationGif = String(data.get("notificationGif") || "").trim();
      draft.successReaction = String(data.get("successReaction") || draft.successReaction || "✅").trim();
      draft.successGif = String(data.get("successGif") || "").trim();
      draft.failReaction = String(data.get("failReaction") || draft.failReaction || "🙃").trim();
      draft.failGif = String(data.get("failGif") || "").trim();

      const entryPhoto = formFile(data, "photo");
      const notificationMedia = await mediaFromForm(data, { emoji: "notificationEmoji", gif: "notificationGif", photo: "notificationPhoto" });
      const successMedia = await mediaFromForm(data, { emoji: "successReaction", gif: "successGif", photo: "successPhoto" });
      const failMedia = await mediaFromForm(data, { emoji: "failReaction", gif: "failGif", photo: "failPhoto" });

      const entry = {
        id: makeId(),
        projectId: state.activeProjectId,
        type: draft.type,
        amount,
        enteredAmount,
        currency,
        exchangeRate,
        headingId: heading.id,
        headingName: heading.name,
        shortName: heading.shortName,
        emoji: heading.emoji,
        userId,
        date,
        note: String(data.get("note") || "").trim(),
        photoName: entryPhoto?.name || "",
        photoData: await readImageAsDataUrl(entryPhoto),
        settlement,
        status: ["receivable", "payable"].includes(draft.type) ? "pending" : "done",
        createdAt: new Date().toISOString(),
      };

      state.entries.unshift(entry);
      const notification = createEntryNotification(entry, {
        mode: draft.notificationMode,
        emoji: notificationMedia.emoji || "🎲",
        gif: notificationMedia.gif,
        photoName: notificationMedia.photoName,
        photoData: notificationMedia.photoData,
        successReaction: successMedia.emoji || "✅",
        successGif: successMedia.gif,
        successPhotoName: successMedia.photoName,
        successPhotoData: successMedia.photoData,
        failReaction: failMedia.emoji || "🙃",
        failGif: failMedia.gif,
        failPhotoName: failMedia.photoName,
        failPhotoData: failMedia.photoData,
      });
      if (notification?.mode === "surprise") entry.lockedNotificationId = notification.id;

      saveState();
      state.activeView = "home";
      draft.amountInput = "";
      draft.date = todayKey();
      render();
      toast("Hareket kasaya girdi.");
    });
  }

  const headingForm = app.querySelector("#headingForm");
  if (headingForm) {
    headingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(headingForm);
      const name = String(data.get("headingName") || "").trim();
      if (!name) return toast("Başlık adını yazalım.");
      ensureHeading(name, String(data.get("shortName") || "").trim() || name, draft.emoji);
      saveState();
      render();
      toast("Başlık eklendi.");
    });
  }

  app.querySelectorAll("#userForm, #projectUserForm").forEach((userForm) => {
    userForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(userForm);
      const name = String(data.get("userName") || "").trim();
      if (!name) return toast((typeof isCloudReady === "function" && isCloudReady()) ? "Kasaya eklenecek e-postayı yazalım." : "Kasaya eklenecek kullanıcı adını yazalım.");
      if (typeof isCloudReady === "function" && isCloudReady()) {
        try {
          await cloudAddMemberByEmail(name);
          render();
          return toast("Kullanıcı kasaya eklendi.");
        } catch (error) {
          return toast(friendlyCloudError(error));
        }
      }
      const result = addUserToActiveProjectByName(name);
      if (result.status === "forbidden") return toast("Kullanıcı eklemeyi sadece kasa sahibi yapar.");
      if (result.status === "missing-user") return toast("Bu adda kullanıcı yok. Önce profilini oluştur.");
      if (result.status === "already") return toast(`${shortName(result.user.name)} zaten bu kasada.`);
      saveState();
      render();
      toast(`${shortName(result.user.name)} kasaya eklendi.`);
    });
  });

  app.querySelectorAll("[data-alias-form]").forEach((aliasForm) => {
    aliasForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = setProjectMemberAlias(aliasForm.dataset.id, new FormData(aliasForm).get("alias"));
      if (result.status === "forbidden") return toast("Lakap vermeyi sadece kasa sahibi yapar.");
      if (result.status === "missing-user") return toast("Bu kullanıcı bu kasada yok.");
      saveState();
      render();
      toast("Kasa içi lakap kaydedildi.");
    });
  });

  const projectForm = app.querySelector("#projectForm");
  if (projectForm) {
    projectForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(projectForm);
      const name = String(data.get("projectName") || "").trim();
      if (!name) return toast("Proje adını yazalım.");
      createProject(name, String(data.get("purpose") || "").trim() || "Genel kasa");
      try {
        saveState();
        if (typeof isCloudReady === "function" && isCloudReady()) await cloudPushState();
        render();
        toast("Proje eklendi.");
      } catch (error) {
        toast(friendlyCloudError(error));
      }
    });
  }
}


function activeProject() {
  return state.projects.find((project) => project.id === state.activeProjectId) || state.projects[0];
}

function activeMembers() {
  const project = activeProject();
  if (!project) return [];
  return state.users.filter((user) => project.memberIds.includes(user.id));
}

function projectHeadingById(id) {
  return state.headings.find((heading) => heading.id === id) || null;
}

function entryHeading(entry) {
  const heading = projectHeadingById(entry?.headingId);
  if (heading) return heading;
  return {
    id: entry?.headingId || "",
    name: entry?.headingName || entry?.shortName || "Başlık",
    shortName: entry?.shortName || entry?.headingName || "Başlık",
    emoji: entry?.emoji || "🧾",
  };
}

function entryTitle(entry) {
  const heading = entryHeading(entry);
  return entry?.shortName || heading.shortName || heading.name || "Hareket";
}

function profileLabel(user) {
  return user?.nickname || shortName(user?.name || "");
}

function projectAliasFor(userId, project = activeProject()) {
  return project?.memberAliases?.[userId] || "";
}

function projectUserLabel(user, project = activeProject()) {
  if (!user) return "Kullanıcı";
  const base = profileLabel(user);
  const alias = projectAliasFor(user.id, project);
  if (!alias || normalize(alias) === normalize(base)) return base;
  return `${base} (${alias})`;
}

function userLabelById(userId, project = activeProject()) {
  return projectUserLabel(state.users.find((user) => user.id === userId), project);
}

function currentUser() {
  return state.users.find((user) => user.id === state.signedInUserId);
}

function projectOwnerId(project = activeProject()) {
  return project?.createdBy || project?.memberIds?.[0] || "";
}

function projectOwner(project = activeProject()) {
  return state.users.find((user) => user.id === projectOwnerId(project));
}

function isProjectOwner(project = activeProject()) {
  return Boolean(currentUser()?.id && currentUser().id === projectOwnerId(project));
}

function findUserByName(name) {
  const wanted = normalize(name);
  if (!wanted) return null;
  return state.users.find((user) => {
    const full = normalize(user.name);
    const nickname = normalize(user.nickname);
    const short = normalize(shortName(user.name));
    const first = normalize(String(user.name || "").split(/\s+/)[0]);
    return full === wanted || nickname === wanted || short === wanted || first === wanted || full.startsWith(`${wanted} `) || short.startsWith(`${wanted} `);
  });
}

function createdByLabel(user) {
  if (!user.createdBy) return "İlk hesap";
  const creator = state.users.find((item) => item.id === user.createdBy);
  return creator ? `${profileLabel(creator)} oluşturdu` : "Oluşturan bilinmiyor";
}

function createUser(name, password = "", options = {}) {
  const user = {
    id: options.id || makeId(),
    name,
    nickname: String(options.nickname || "").trim(),
    email: options.email || "",
    password: normalizePassword(password),
    onayModu: personalityModes[options.onayModu] ? options.onayModu : "standart",
    totalScore: Number(options.totalScore || 0),
    correctGuesses: Number(options.correctGuesses || 0),
    totalGuesses: Number(options.totalGuesses || 0),
    createdAt: new Date().toISOString(),
    createdBy: currentUser()?.id || "",
  };
  state.users.push(user);
  const makeActive = options.makeActive !== false;
  if (makeActive) state.activeUserId = user.id;
  const project = options.linkToProject === false ? null : activeProject();
  if (project && !project.memberIds.includes(user.id)) project.memberIds.push(user.id);
  if (makeActive) draft.userId = user.id;
  return user;
}

function createProject(name, purpose = "Genel kasa") {
  const project = {
    id: makeId(),
    name,
    purpose,
    code: generateProjectCode(name),
    createdAt: new Date().toISOString(),
    createdBy: currentUser()?.id || "",
    memberIds: currentUser()?.id ? [currentUser().id] : [],
    memberAliases: {},
    defaultCurrency: "TL",
    defaultHeadings: [],
    splitType: "equal",
    templateId: "",
    budgetLimits: {},
    hasBudgetTarget: false,
    hasGoalItems: false,
  };
  state.projects.push(project);
  state.activeProjectId = project.id;
  draft = makeDraft();
  return project;
}

function projectCode(project) {
  if (!project.code) project.code = generateProjectCode(project.name || project.id || "kasa");
  return project.code;
}

function generateProjectCode(seed = "") {
  const clean = normalize(seed).replace(/[^a-z0-9ğüşöçıİ]/gi, "").slice(0, 3).toLocaleUpperCase("tr-TR") || "KSA";
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `KASA-${clean}-${random}`;
}

function normalizeCode(value) {
  return String(value || "").trim().toLocaleUpperCase("tr-TR").replace(/\s+/g, "");
}

function inviteLink(project = activeProject()) {
  const base = location.origin === "null" ? "https://kasa-prototip.netlify.app" : `${location.origin}${location.pathname}`;
  return `${base}?project=${encodeURIComponent(projectCode(project))}`;
}

function rawProjectEntries(project = activeProject()) {
  if (!project) return [];
  return state.entries.filter((entry) => entry.projectId === project.id);
}

function projectEntries() {
  return rawProjectEntries().filter((entry) => entryVisibleForCurrentUser(entry));
}

function visibleProjectEntries() {
  return projectEntries();
}

function confirmedProjectEntries(project = activeProject()) {
  return rawProjectEntries(project).filter((entry) => entryConfirmed(entry));
}

function projectHeadings() {
  return state.headings.filter((heading) => heading.projectId === activeProject().id);
}

function headingSuggestionsFor(typeId) {
  return headingSuggestionGroups[typeId] || headingSuggestionGroups.expense;
}

function emojiOptionsFor(typeId) {
  return emojiOptionsByType[typeId] || emojiOptionsByType.expense;
}

function actualEntries() {
  return visibleProjectEntries().filter((entry) => entry.status === "done").sort(byDateDesc);
}

function pendingEntries() {
  return visibleProjectEntries().filter((entry) => entry.status === "pending").sort(byDateAsc);
}

function pendingEntriesByType(type) {
  return pendingEntries().filter((entry) => entry.type === type);
}

function notificationEntries() {
  const user = currentUser();
  if (!user) return [];
  return (state.notifications || [])
    .filter((item) => item.projectId === activeProject()?.id && item.recipients?.includes(user.id))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function createEntryNotification(entry, options = {}) {
  const project = activeProject();
  const actor = currentUser();
  if (!project || !actor || options.mode === "silent") return;
  const recipients = project.memberIds.filter((id) => id !== actor.id);
  if (!recipients.length) return;

  state.notifications = state.notifications || [];
  const notification = {
    id: makeId(),
    projectId: project.id,
    entryId: entry.id,
    actorId: actor.id,
    recipients,
    mode: options.mode || "open",
    actualType: entry.type,
    title: entryTitle(entry),
    amount: entry.amount,
    emoji: options.emoji || "🎲",
    photoName: options.photoName || "",
    photoData: options.photoData || "",
    gif: options.gif || "",
    successReaction: options.successReaction || "✅",
    successPhotoName: options.successPhotoName || "",
    successPhotoData: options.successPhotoData || "",
    successGif: options.successGif || "",
    failReaction: options.failReaction || "🙃",
    failPhotoName: options.failPhotoName || "",
    failPhotoData: options.failPhotoData || "",
    failGif: options.failGif || "",
    guessDeadline: options.guessDeadline || addHours(new Date().toISOString(), 48),
    revealedAt: options.mode === "surprise" ? "" : new Date().toISOString(),
    isCompleted: options.mode !== "surprise",
    notificationType: "entry",
    guesses: [],
    createdAt: new Date().toISOString(),
  };
  state.notifications.unshift(notification);
  return notification;
}

function guessNotification(id, guess) {
  const notification = (state.notifications || []).find((item) => item.id === id);
  const user = currentUser();
  if (!notification || !user) return { status: "missing" };
  notification.guesses = Array.isArray(notification.guesses) ? notification.guesses : [];
  const existing = notification.guesses.find((item) => item.userId === user.id);
  if (existing) return { status: "already", guess: existing };

  const predictedType = typeof guess === "string" ? guess : guess?.predictedType;
  const predictedAmount = typeof guess === "object" && guess.predictedAmount !== undefined ? Number(guess.predictedAmount || 0) || null : null;
  const typeCorrect = predictedType === notification.actualType;
  const amountCorrect = predictedAmount === null ? true : Math.abs(Number(notification.amount || 0) - predictedAmount) <= Number(notification.amount || 0) * 0.15;
  const isCorrect = Boolean(typeCorrect && amountCorrect);
  const result = {
    userId: user.id,
    predictedType,
    predictedAmount,
    isCorrect,
    guessedAt: new Date().toISOString(),
    guess: predictedType,
    correct: isCorrect,
    at: new Date().toISOString(),
  };
  notification.guesses.push(result);
  user.totalGuesses = Number(user.totalGuesses || 0) + 1;
  if (isCorrect) {
    user.totalScore = Number(user.totalScore || 0) + 10;
    user.correctGuesses = Number(user.correctGuesses || 0) + 1;
  }
  maybeRevealNotification(notification);
  return { status: "saved", guess: result };
}

function notificationGuessFor(notification, userId = currentUser()?.id) {
  return notification?.guesses?.find((guess) => guess.userId === userId);
}

function entryNotification(entry) {
  if (!entry) return null;
  return (state.notifications || []).find((item) => item.id === entry.lockedNotificationId || item.entryId === entry.id) || null;
}

function entryVisibleForCurrentUser(entry, userId = currentUser()?.id) {
  if (!entry?.lockedNotificationId) return true;
  const notification = entryNotification(entry);
  if (!notification) return false;
  if (notification.mode !== "surprise") return true;
  maybeRevealNotification(notification);
  return Boolean(notification.revealedAt || notification.isCompleted);
}

function entryConfirmed(entry) {
  if (!entry || entry.status !== "done") return false;
  if (!entry.lockedNotificationId) return true;
  const notification = entryNotification(entry);
  if (!notification) return false;
  maybeRevealNotification(notification);
  return Boolean(notification.revealedAt || notification.isCompleted);
}

function pendingSurpriseCount(project = activeProject()) {
  if (!project) return 0;
  return rawProjectEntries(project).filter((entry) => entry.status === "done" && entry.lockedNotificationId && !entryConfirmed(entry)).length;
}

function maybeRevealNotification(notification) {
  if (!notification || notification.mode !== "surprise" || notification.revealedAt) return notification;
  const recipients = Array.isArray(notification.recipients) ? notification.recipients : [];
  const guesses = Array.isArray(notification.guesses) ? notification.guesses : [];
  const allGuessed = recipients.length > 0 && recipients.every((userId) => guesses.some((guess) => guess.userId === userId));
  const deadline = notification.guessDeadline || notification.autoRevealAt || addHours(notification.createdAt || new Date().toISOString(), 48);
  const deadlinePassed = new Date(deadline).getTime() <= Date.now();
  if (allGuessed || deadlinePassed) {
    const now = new Date().toISOString();
    notification.revealedAt = now;
    notification.isCompleted = true;
    const entry = state.entries.find((item) => item.id === notification.entryId);
    if (entry && !entry.autoRevealAt) entry.autoRevealAt = deadline;
  }
  return notification;
}

function notificationMedia(notification) {
  return {
    emoji: notification?.emoji || "🎲",
    photoName: notification?.photoName || "",
    photoData: notification?.photoData || "",
    gif: notification?.gif || "",
  };
}

function notificationReactionMedia(notification, guess) {
  if (!notification || !guess) return {};
  if (guess.correct) {
    return {
      emoji: notification.successReaction || "✅",
      photoName: notification.successPhotoName || "",
      photoData: notification.successPhotoData || "",
      gif: notification.successGif || "",
    };
  }
  return {
    emoji: notification.failReaction || "🙃",
    photoName: notification.failPhotoName || "",
    photoData: notification.failPhotoData || "",
    gif: notification.failGif || "",
  };
}

function mediaPreviewHtml(media = {}, fallback = "🎲") {
  if (media.photoData) return `<img class="media-image" src="${media.photoData}" alt="${media.photoName || "Medya"}" />`;
  if (media.gif) {
    const value = String(media.gif).trim();
    if (/^https?:\/\//i.test(value)) return `<img class="media-image" src="${value}" alt="GIF" />`;
    return `<span class="media-gif">${value}</span>`;
  }
  if (media.photoName) return `<span class="media-gif">📎 ${media.photoName}</span>`;
  return `<span>${media.emoji || fallback}</span>`;
}

function entryGameStatus(entry, userId = currentUser()?.id) {
  const notification = entryNotification(entry);
  if (!notification) return "";
  if (notification.mode !== "surprise") return "Açık bildirim";
  if (entry.userId === userId) return "Sürpriz gönderildi";
  const guess = notificationGuessFor(notification, userId);
  if (!guess) return "Sürpriz kilitli";
  return guess.correct ? "Oyunda doğru bildin" : "Oyunda yanıldın";
}

function ensureHeading(name, shortName, emoji) {
  const normalized = normalize(name);
  const existing = projectHeadings().find((heading) => normalize(heading.name) === normalized);
  if (existing) {
    existing.shortName = shortName || existing.shortName;
    existing.emoji = emoji || existing.emoji;
    return existing;
  }

  const heading = {
    id: makeId(),
    projectId: activeProject().id,
    name,
    shortName: shortName || name,
    emoji: emoji || "🧾",
  };
  state.headings.push(heading);
  return heading;
}

function toggleUserInProject(userId) {
  const project = activeProject();
  if (!isProjectOwner(project)) {
    toast("Kullanıcıları sadece kasa sahibi düzenler.");
    return;
  }
  if (userId === projectOwnerId(project)) {
    toast("Kasa sahibini kasadan çıkaramayız.");
    return;
  }
  if (!project.memberIds.includes(userId)) {
    project.memberIds.push(userId);
    return;
  }
  if (project.memberIds.length === 1) {
    toast("Projede en az bir kullanıcı kalsın.");
    return;
  }
  project.memberIds = project.memberIds.filter((id) => id !== userId);
  if (project.memberAliases) delete project.memberAliases[userId];
}

function addUserToActiveProjectByName(name) {
  const project = activeProject();
  if (!project) return { status: "missing-project" };
  if (!isProjectOwner(project)) return { status: "forbidden" };

  const user = findUserByName(name);
  if (!user) return { status: "missing-user" };
  if (project.memberIds.includes(user.id)) return { status: "already", user };

  project.memberIds.push(user.id);
  return { status: "added", user };
}

function setProjectMemberAlias(userId, alias) {
  const project = activeProject();
  if (!project) return { status: "missing-project" };
  if (!isProjectOwner(project)) return { status: "forbidden" };
  if (!project.memberIds.includes(userId)) return { status: "missing-user" };

  project.memberAliases = project.memberAliases || {};
  const value = String(alias || "").trim();
  if (value) project.memberAliases[userId] = value;
  else delete project.memberAliases[userId];
  return { status: "saved" };
}

function settlePending(id) {
  const pending = projectEntries().find((entry) => entry.id === id);
  if (!pending || pending.status !== "pending") return;

  pending.status = "done";
  state.entries.unshift({
    ...pending,
    id: makeId(),
    type: pending.type === "receivable" ? "income" : "expense",
    status: "done",
    date: todayKey(),
    createdAt: new Date().toISOString(),
    note: pending.note ? `${pending.note} · gerçekleşti` : "Takvimden gerçekleşti",
  });

  saveState();
  render();
  toast(pending.type === "receivable" ? "Alacak gelir olarak kaydedildi." : "Ödeme gider olarak kaydedildi.");
}

function headingPreview() {
  return `<div class="chips" style="margin-top: 12px;">${projectHeadings().slice(0, 6).map((heading) => `<span class="chip static-chip">${heading.emoji} ${heading.shortName}</span>`).join("")}</div>`;
}

function pendingDetailRows(type) {
  const entries = pendingEntriesByType(type);
  const label = type === "receivable" ? "gelecek" : "gidecek";
  if (!entries.length) return `<div class="empty-state">Şimdilik ${label} bir kayıt yok.</div>`;
  return entries
    .map((entry) => {
      const user = state.users.find((item) => item.id === entry.userId);
      return `
        <div class="expense-row">
          <span class="emoji-dot">${entry.emoji || (type === "receivable" ? "🤝" : "⏰")}</span>
          <div class="expense-main">
            <p class="expense-title">${entryTitle(entry)}</p>
            <p class="expense-meta">${projectUserLabel(user)} · ${formatShortDate(entry.date)} · ${type === "receivable" ? "Şu gelecek" : "Bu gidecek"}</p>
            ${entry.note ? `<p class="expense-note">${entry.note}</p>` : ""}
          </div>
          <strong class="expense-price">${money(entry.amount)}</strong>
        </div>
      `;
    })
    .join("");
}

function projectRow(project) {
  return `
    <div class="expense-row">
      <span class="emoji-dot">📁</span>
      <div class="expense-main">
        <p class="expense-title">${project.name}</p>
        <p class="expense-meta">${project.purpose} · ${project.memberIds.length} üye · ${projectCode(project)}</p>
      </div>
      <button class="mini-action" data-action="activate-project" data-id="${project.id}" type="button">${project.id === state.activeProjectId ? "Aktif" : "Seç"}</button>
    </div>
  `;
}

function notificationRow(notification) {
  const actor = state.users.find((user) => user.id === notification.actorId);
  const guess = notificationGuessFor(notification);
  const isSurprise = notification.mode === "surprise";
  const typeLabel = notification.actualType === "income" ? "gelir" : "gider";
  const media = mediaPreviewHtml(notificationMedia(notification));

  if (!isSurprise) {
    return `
      <div class="notification-card">
        <div class="notification-hero">${media}</div>
        <div class="expense-main">
          <p class="expense-title">${projectUserLabel(actor)} ${typeLabel} ekledi</p>
          <p class="expense-meta">${notification.title} · ${money(notification.amount)}</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="notification-card">
      <div class="notification-hero">${media}</div>
      <div class="expense-main">
        <p class="expense-title">${projectUserLabel(actor)} sürpriz hareket gönderdi</p>
        <p class="expense-meta">${
          guess
            ? `Açıldı: ${typeLabel} · ${notification.title} · ${money(notification.amount)}`
            : "Gelir mi gider mi? Tahmin et. Kasa detayı tahmin bitene kadar kapalı."
        }</p>
        ${
          guess
            ? `<div class="reaction-result ${guess.correct ? "correct" : "wrong"}">
                <span>${guess.correct ? "Doğru bildin." : "Yanlış tahmin."}</span>
                <span class="reaction-media">${mediaPreviewHtml(notificationReactionMedia(notification, guess), guess.correct ? "✅" : "🙃")}</span>
              </div>`
            : `
              <div class="guess-actions">
                <button class="mini-action" data-action="guess-notification" data-id="${notification.id}" data-guess="income" type="button">Gelir</button>
                <button class="mini-action" data-action="guess-notification" data-id="${notification.id}" data-guess="expense" type="button">Gider</button>
              </div>
            `
        }
      </div>
    </div>
  `;
}

function userLinkRow(user) {
  const project = activeProject();
  const linked = project.memberIds.includes(user.id);
  const canManage = isProjectOwner(project);
  const isOwner = user.id === projectOwnerId(project);
  const alias = projectAliasFor(user.id, project);
  const label = projectUserLabel(user, project);
  const aliasText = alias ? `Bu kasadaki lakap: ${alias}` : "Kasa içi lakap yok";
  const action = isOwner
    ? `<span class="mini-action linked">Sahip</span>`
    : canManage
      ? `<button class="mini-action ${linked ? "linked" : ""}" data-action="toggle-user-project" data-id="${user.id}" type="button">${linked ? "Çıkar" : "Bağla"}</button>`
      : `<span class="neutral-pill">${linked ? "Üye" : "Dışarıda"}</span>`;

  return `
    <div class="member-card">
      <div class="expense-row">
        <span class="emoji-dot">👤</span>
        <div class="expense-main">
          <p class="expense-title">${label}</p>
          <p class="expense-meta">${user.name} · ${aliasText} · profil: ${profileLabel(user)} · ${isOwner ? "Kasa sahibi" : linked ? "Bu kasada" : "Bu kasada yok"} · ${user.password ? "Şifreli" : "Şifresiz"} · ${createdByLabel(user)}</p>
        </div>
        ${action}
      </div>
      ${
        canManage && linked
          ? `
            <form class="alias-form" data-alias-form data-id="${user.id}">
              <input class="text-input" name="alias" value="${alias}" placeholder="Bu kasadaki lakap" autocomplete="off" />
              <button class="mini-action" type="submit">Lakapla</button>
            </form>
          `
          : ""
      }
    </div>
  `;
}

function headingRow(heading) {
  return `
    <div class="expense-row">
      <span class="emoji-dot">${heading.emoji}</span>
      <div class="expense-main">
        <p class="expense-title">${heading.shortName}</p>
        <p class="expense-meta">${heading.name}</p>
      </div>
      <strong class="expense-price">${entryCountForHeading(heading.id)}</strong>
    </div>
  `;
}

function entryRow(entry) {
  const type = entryTypes.find((item) => item.id === entry.type);
  const user = state.users.find((item) => item.id === entry.userId);
  const exchange = exchangeText(entry);
  const reactions = reactionSummary(entry.id);
  return `
    <div class="expense-row">
      <span class="emoji-dot">${entry.emoji || type?.emoji || "🧾"}</span>
      <div class="expense-main">
        <p class="expense-title">${entryTitle(entry)}</p>
        <p class="expense-meta">${projectUserLabel(user)} · ${type?.label || "Hareket"} · ${formatShortDate(entry.date)}${exchange ? ` · ${exchange}` : ""}</p>
        ${entry.note ? `<p class="expense-note">${entry.note}</p>` : ""}
        ${reactions ? `<p class="expense-note reaction-line">${reactions}</p>` : ""}
      </div>
      <strong class="expense-price ${entry.type === "income" ? "price-positive" : entry.type === "expense" ? "price-negative" : ""}">
        ${entry.type === "income" ? "+" : entry.type === "expense" ? "-" : ""}${money(entry.amount)}
      </strong>
      <button class="reaction-button" data-action="toggle-reaction-picker" data-id="${entry.id}" type="button">☺</button>
    </div>
    ${state.reactionPickerEntryId === entry.id ? reactionPicker(entry) : ""}
  `;
}

function movementEntryRow(entry) {
  const notification = entryNotification(entry);
  const guess = notificationGuessFor(notification);
  const gameStatus = entryGameStatus(entry);
  const entryMedia = entry.photoData ? mediaPreviewHtml({ photoData: entry.photoData, photoName: entry.photoName }, "📎") : "";
  const reactionMedia = guess ? mediaPreviewHtml(notificationReactionMedia(notification, guess), guess.correct ? "✅" : "🙃") : "";
  return `
    <div class="movement-card">
      ${entryRow(entry)}
      ${
        gameStatus || entryMedia
          ? `
            <div class="movement-extra">
              ${gameStatus ? `<span class="neutral-pill">${gameStatus}</span>` : ""}
              ${reactionMedia ? `<span class="movement-media">${reactionMedia}</span>` : ""}
              ${entryMedia ? `<span class="movement-media">${entryMedia}</span>` : ""}
            </div>
          `
          : ""
      }
    </div>
  `;
}

function pendingRow(entry) {
  const isReceivable = entry.type === "receivable";
  const exchange = exchangeText(entry);
  return `
    <div class="expense-row">
      <span class="emoji-dot">${entry.emoji || (isReceivable ? "🤝" : "⏰")}</span>
      <div class="expense-main">
        <p class="expense-title">${entryTitle(entry)}</p>
        <p class="expense-meta">${isReceivable ? "Beklenen alacak" : "Yaklaşan ödeme"} · ${formatShortDate(entry.date)}${exchange ? ` · ${exchange}` : ""}</p>
        ${entry.note ? `<p class="expense-note">${entry.note}</p>` : ""}
      </div>
      <div style="display:grid; gap:6px; justify-items:end;">
        <strong class="expense-price">${money(entry.amount)}</strong>
        <button class="mini-action" data-action="settle-pending" data-id="${entry.id}" type="button">${isReceivable ? "Geldi" : "Ödendi"}</button>
      </div>
    </div>
  `;
}

function balanceRow(item) {
  return `
    <div class="balance-row">
      <div>
        <div class="balance-name">${item.name}</div>
        <div class="balance-state">${item.balance >= 0 ? "Alacaklı" : "Borçlu"}</div>
      </div>
      <span class="${item.balance >= 0 ? "positive-pill" : "negative-pill"}">${money(Math.abs(item.balance))}</span>
    </div>
  `;
}

function headingBars(entries) {
  const expenses = entries.filter((entry) => entry.type === "expense");
  const total = Math.max(1, sum(expenses));
  const grouped = projectHeadings()
    .map((heading) => ({
      ...heading,
      total: sum(expenses.filter((entry) => entry.headingId === heading.id)),
    }))
    .filter((heading) => heading.total > 0)
    .sort((a, b) => b.total - a.total);

  if (!grouped.length) return `<div class="empty-state">Bu dönem için gider kaydı yok.</div>`;

  return grouped
    .map((heading) => {
      const percent = Math.max(4, Math.round((heading.total / total) * 100));
      return `
        <div class="bar-line">
          <div class="bar-text"><span>${heading.emoji} ${heading.shortName}</span><span>${money(heading.total)}</span></div>
          <div class="bar-bg"><div class="bar-fill" style="width: ${percent}%"></div></div>
        </div>
      `;
    })
    .join("");
}

function calculateTotals(entries = projectEntries()) {
  const done = entries.filter((entry) => entry.status === "done" && entryConfirmed(entry));
  const pending = entries.filter((entry) => entry.status === "pending");
  const income = sum(done.filter((entry) => entry.type === "income"));
  const expense = sum(done.filter((entry) => entry.type === "expense"));
  const receivable = sum(pending.filter((entry) => entry.type === "receivable"));
  const payable = sum(pending.filter((entry) => entry.type === "payable"));
  const actual = income - expense;
  const comfortable = actual + receivable - payable;
  return { income, expense, receivable, payable, actual, comfortable };
}

function calculateBalances() {
  return calculateNetBalances();
}

function simplifyDebts(balances) {
  const creditors = balances.filter((item) => item.balance > 0).map((item) => ({ name: item.name, amount: item.balance }));
  const debtors = balances.filter((item) => item.balance < 0).map((item) => ({ name: item.name, amount: Math.abs(item.balance) }));
  const transactions = [];

  let c = 0;
  let d = 0;
  while (creditors[c] && debtors[d]) {
    const amount = Math.min(creditors[c].amount, debtors[d].amount);
    if (amount > 0) transactions.push({ from: debtors[d].name, to: creditors[c].name, amount });
    creditors[c].amount -= amount;
    debtors[d].amount -= amount;
    if (creditors[c].amount <= 0) c += 1;
    if (debtors[d].amount <= 0) d += 1;
  }
  return transactions;
}

function isInPeriod(value, period) {
  if (period === "all") return true;
  if (period === "day") return value === todayKey();
  if (period === "week") return isThisWeek(value);
  return isThisMonth(value);
}

function addHours(value, hours) {
  const date = new Date(value || new Date());
  date.setHours(date.getHours() + Number(hours || 0));
  return date.toISOString();
}

function daysBetween(start, end = new Date()) {
  const a = startOfDay(typeof start === "string" ? dateFromKey(start.slice(0, 10)) : start);
  const b = startOfDay(typeof end === "string" ? dateFromKey(end.slice(0, 10)) : end);
  return Math.max(1, Math.round((b - a) / 86400000));
}

function monthKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function previousMonthKey(value = new Date()) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  date.setMonth(date.getMonth() - 1);
  return monthKey(date);
}

function entryMonth(entry) {
  return String(entry?.date || entry?.createdAt || todayKey()).slice(0, 7);
}

function periodLabel(period) {
  if (period === "day") return "Bugün";
  if (period === "week") return "Bu hafta";
  if (period === "month") return "Bu ay";
  return "Tümü";
}

function topHeading(entries) {
  const expenses = entries.filter((entry) => entry.type === "expense");
  if (!expenses.length) return "Yok";
  const grouped = projectHeadings()
    .map((heading) => ({
      label: heading.shortName,
      total: sum(expenses.filter((entry) => entry.headingId === heading.id)),
    }))
    .sort((a, b) => b.total - a.total);
  return grouped[0]?.total ? grouped[0].label : "Yok";
}

function entryCountForHeading(id) {
  const count = visibleProjectEntries().filter((entry) => entry.headingId === id).length;
  return `${count} kayıt`;
}

function sum(entries) {
  return entries.reduce((total, entry) => total + Number(entry.amount || 0), 0);
}

function parseAmount(value) {
  const raw = String(value || "").replace(/[^\d,.-]/g, "").trim();
  if (!raw) return 0;
  if (raw.includes(",")) return Number(raw.replace(/\./g, "").replace(",", "."));

  const parts = raw.split(".");
  if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
    return Number(raw.replace(/\./g, ""));
  }

  return Number(raw);
}

function formatNumber(value, maximumFractionDigits = 0) {
  return new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits,
  }).format(Number(value || 0));
}

function formatAmountInput(value) {
  const raw = String(value || "").replace(/[^\d,]/g, "");
  if (!raw) return "";
  const [wholeRaw, decimalRaw] = raw.split(",");
  const whole = wholeRaw.replace(/^0+(?=\d)/, "");
  const formattedWhole = whole ? formatNumber(Number(whole)) : "0";
  if (decimalRaw !== undefined) return `${formattedWhole},${decimalRaw.slice(0, 2)}`;
  return formattedWhole;
}

function formatCurrencyAmount(value, currency = "TRY") {
  const label = currency === "TRY" ? "TL" : currency;
  const decimals = currency === "TRY" ? 0 : 2;
  return `${formatNumber(value, decimals)} ${label}`;
}

function formatRate(value) {
  return formatNumber(value, 4);
}

function exchangeText(entry) {
  const currency = entry.currency || "TRY";
  if (currency === "TRY") return "";
  return `${formatCurrencyAmount(entry.enteredAmount || entry.amount, currency)} × ${formatRate(entry.exchangeRate || 1)} = ${money(entry.amount)}`;
}

function exchangeReceiptLines(entries) {
  const foreignEntries = entries.filter((entry) => entry.currency && entry.currency !== "TRY");
  if (!foreignEntries.length) return "";
  return foreignEntries
    .slice(0, 3)
    .map((entry) => `<div class="receipt-line exchange-line"><span>Kur</span><strong>${exchangeText(entry)}</strong></div>`)
    .join("");
}

async function copyProjectInvite() {
  const project = activeProject();
  const text = `${project.name}\nKod: ${projectCode(project)}\nLink: ${inviteLink(project)}\n\nNot: Bu sürüm prototip. Gerçek ortak kullanım için bulut kayıt bağlanacak.`;
  try {
    await navigator.clipboard.writeText(text);
    toast("Proje kodu kopyalandı.");
  } catch {
    toast(`Kod: ${projectCode(project)}`);
  }
}

async function shareReceipt() {
  const period = state.reportPeriod;
  const entries = actualEntries().filter((entry) => isInPeriod(entry.date, period));
  const totals = calculateTotals(entries);
  const label = period === "day" ? "Bugün" : period === "week" ? "Bu hafta" : "Bu ay";
  const exchangeLines = entries.map(exchangeText).filter(Boolean);
  const exchangeBlock = exchangeLines.length ? `\nKur hesabı:\n${exchangeLines.join("\n")}` : "";
  const text = `KASA FİŞİ\n${activeProject().name}\n${label} giren: ${money(totals.income)}\n${label} çıkan: ${money(totals.expense)}\nNet: ${money(totals.actual)}${exchangeBlock}\nEn hareketli başlık: ${topHeading(entries)}`;

  try {
    if (navigator.share) {
      await navigator.share({ title: "Kasa Fişi", text });
    } else {
      await navigator.clipboard.writeText(text);
      toast("Fiş metni kopyalandı.");
    }
  } catch {
    toast("Paylaşım iptal edildi.");
  }
}

function byDateDesc(a, b) {
  return String(b.date).localeCompare(String(a.date));
}

function byDateAsc(a, b) {
  return String(a.date).localeCompare(String(b.date));
}

function shortName(name) {
  return String(name || "").replace(" Ayyıldız", "");
}

function normalize(value) {
  return String(value || "").trim().toLocaleLowerCase("tr-TR");
}

function money(value) {
  return `${formatNumber(Math.round(Number(value || 0)))} TL`;
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
  }).format(dateFromKey(value));
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dateFromKey(value) {
  return new Date(`${value}T12:00:00`);
}

function isThisWeek(value) {
  const date = startOfDay(dateFromKey(value));
  const now = startOfDay(new Date());
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return date >= monday && date <= sunday;
}

function isThisMonth(value) {
  const date = dateFromKey(value);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

function startOfDay(date) {
  const clone = new Date(date);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function makeId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toast(message) {
  document.querySelector(".toast")?.remove();
  const element = document.createElement("div");
  element.className = "toast";
  element.textContent = message;
  document.body.appendChild(element);
  setTimeout(() => element.remove(), 2200);
}


let cloudClient = null;
let cloudAuthSubscribed = false;
let cloudSyncTimer = null;
let cloudSyncBusy = false;
let cloudSyncPaused = false;

function cloudConfig() {
  return window.KASA_CLOUD_CONFIG || {};
}

function isCloudReady() {
  const config = cloudConfig();
  return Boolean(window.supabase?.createClient && config.supabaseUrl && config.supabaseAnonKey);
}

function cloudLabel() {
  return isCloudReady() ? "Bulut açık" : "Yerel deneme";
}

function cloudDb() {
  if (!isCloudReady()) return null;
  if (!cloudClient) {
    const config = cloudConfig();
    cloudClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return cloudClient;
}

function setCloudStatus(message) {
  state.cloudStatus = message || "";
}

function friendlyCloudError(error) {
  const message = error?.message || String(error || "");
  if (message.includes("column") && message.includes("does not exist")) return "Supabase yeni oyun alanları eksik. supabase-game-fields.sql dosyasını SQL Editor'da çalıştır.";
  if (message.includes("relation") || message.includes("does not exist")) return "Supabase tabloları kurulmamış. supabase-schema.sql dosyasını çalıştırmamız gerekiyor.";
  if (message.includes("row-level security")) return "Supabase izin kuralı engelledi. SQL politikalarını kontrol etmemiz gerekiyor.";
  if (message.includes("Invalid login credentials")) return "E-posta veya şifre hatalı.";
  if (message.includes("Email not confirmed")) return "Önce e-postadaki doğrulama linkine tıkla.";
  return message || "Bulut işlemi tamamlanamadı.";
}

async function initCloudSession() {
  if (!isCloudReady()) {
    state.cloudEnabled = false;
    setCloudStatus("Yerel mod");
    return;
  }

  state.cloudEnabled = true;
  setCloudStatus("Bulut kontrol ediliyor");
  const client = cloudDb();

  if (!cloudAuthSubscribed) {
    client.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) return;
      applyCloudUser(session.user).then(() => {
        saveState();
        render();
      });
    });
    cloudAuthSubscribed = true;
  }

  const { data, error } = await client.auth.getSession();
  if (error) {
    setCloudStatus(friendlyCloudError(error));
    return;
  }

  if (data.session?.user) {
    await applyCloudUser(data.session.user);
    await loadCloudData();
    await ensureCloudStarterProject();
    setCloudStatus("Bulut bağlı");
  } else {
    setCloudStatus("Bulut hazır");
  }
}

async function applyCloudUser(authUser, profileInput = {}) {
  if (!authUser?.id) return null;
  const metadata = authUser.user_metadata || {};
  const email = String(authUser.email || profileInput.email || "").trim().toLowerCase();
  const fallbackName = email ? email.split("@")[0] : "Kullanıcı";
  const name = String(profileInput.name || metadata.name || metadata.full_name || fallbackName).trim();
  const nickname = String(profileInput.nickname || metadata.nickname || shortName(name)).trim();
  const existing = state.users.find((user) => user.id === authUser.id || normalize(user.email) === normalize(email));
  const user = {
    id: authUser.id,
    name,
    nickname,
    email,
    password: "",
    createdAt: existing?.createdAt || new Date().toISOString(),
    createdBy: existing?.createdBy || "",
  };

  if (existing) Object.assign(existing, user);
  else state.users.push(user);

  state.signedInUserId = authUser.id;
  state.activeUserId = authUser.id;
  state.pendingLoginUserId = authUser.id;
  state.pendingLoginEmail = email;
  state.cloudUserId = authUser.id;

  if (isCloudReady()) {
    const { error } = await cloudDb().from("kasa_profiles").upsert(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (error) setCloudStatus(friendlyCloudError(error));
  }

  return user;
}

async function cloudSignUp({ name, nickname, email, password }) {
  const client = cloudDb();
  if (!client) throw new Error("Bulut ayarı yok.");
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const { data, error } = await client.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: { name, nickname },
    },
  });
  if (error) throw error;

  state.pendingLoginEmail = normalizedEmail;
  if (data.session?.user) {
    await applyCloudUser(data.session.user, { name, nickname, email: normalizedEmail });
    await loadCloudData();
    await ensureCloudStarterProject();
    setCloudStatus("Bulut bağlı");
  } else {
    state.authMode = "login";
    setCloudStatus("E-posta doğrulama bekleniyor");
  }
  saveState();
  return data;
}

async function cloudSignIn({ email, password }) {
  const client = cloudDb();
  if (!client) throw new Error("Bulut ayarı yok.");
  const { data, error } = await client.auth.signInWithPassword({
    email: String(email || "").trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  await applyCloudUser(data.user);
  await loadCloudData();
  await ensureCloudStarterProject();
  setCloudStatus("Bulut bağlı");
  saveState();
  return data;
}

async function cloudSignOut() {
  if (isCloudReady()) await cloudDb().auth.signOut();
}

async function loadCloudData() {
  if (!isCloudReady() || !state.signedInUserId) return;
  const client = cloudDb();
  cloudSyncPaused = true;
  try {
    const { data: projects, error: projectError } = await client.from("kasa_projects").select("*").order("created_at", { ascending: true });
    if (projectError) throw projectError;

    const projectIds = (projects || []).map((project) => project.id);
    let members = [];
    let profiles = [];
    let headings = [];
    let entries = [];
    let notifications = [];

    if (projectIds.length) {
      const [memberResult, headingResult, entryResult, notificationResult] = await Promise.all([
        client.from("kasa_project_members").select("*").in("project_id", projectIds),
        client.from("kasa_headings").select("*").in("project_id", projectIds),
        client.from("kasa_entries").select("*").in("project_id", projectIds),
        client.from("kasa_notifications").select("*").in("project_id", projectIds),
      ]);
      if (memberResult.error) throw memberResult.error;
      if (headingResult.error) throw headingResult.error;
      if (entryResult.error) throw entryResult.error;
      if (notificationResult.error) throw notificationResult.error;
      members = memberResult.data || [];
      headings = headingResult.data || [];
      entries = entryResult.data || [];
      notifications = notificationResult.data || [];

      const userIds = [...new Set([state.signedInUserId, ...members.map((member) => member.user_id)].filter(Boolean))];
      if (userIds.length) {
        const profileResult = await client.from("kasa_profiles").select("*").in("id", userIds);
        if (profileResult.error) throw profileResult.error;
        profiles = profileResult.data || [];
      }
    }

    const current = currentUser();
    state.users = profiles.map((profile) => ({
      id: profile.id,
      name: profile.name || profile.email || "Kullanıcı",
      nickname: profile.nickname || shortName(profile.name || profile.email || ""),
      email: profile.email || "",
      password: "",
      createdAt: profile.created_at || new Date().toISOString(),
      createdBy: "",
    }));
    if (current && !state.users.some((user) => user.id === current.id)) state.users.push(current);

    state.projects = (projects || []).map((project) => {
      const projectMembers = members.filter((member) => member.project_id === project.id);
      return {
        id: project.id,
        name: project.name,
        purpose: project.purpose || "Genel kasa",
        code: project.code,
        createdAt: project.created_at,
        createdBy: project.created_by,
        memberIds: projectMembers.map((member) => member.user_id),
        memberAliases: Object.fromEntries(projectMembers.filter((member) => member.alias).map((member) => [member.user_id, member.alias])),
      };
    });

    state.headings = headings.map((heading) => ({
      id: heading.id,
      projectId: heading.project_id,
      name: heading.name,
      shortName: heading.short_name,
      emoji: heading.emoji,
    }));

    state.entries = entries.map((entry) => ({
      id: entry.id,
      projectId: entry.project_id,
      type: entry.type,
      amount: Number(entry.amount || 0),
      enteredAmount: Number(entry.entered_amount || entry.amount || 0),
      currency: entry.currency || "TRY",
      exchangeRate: Number(entry.exchange_rate || 1),
      headingId: entry.heading_id,
      shortName: entry.short_name,
      emoji: entry.emoji,
      userId: entry.user_id,
      date: entry.entry_date,
      note: entry.note || "",
      photoName: entry.photo_name || "",
      photoData: entry.photo_data || "",
      lockedNotificationId: entry.locked_notification_id || "",
      settlement: Boolean(entry.settlement),
      status: entry.status,
      createdAt: entry.created_at,
    }));

    state.notifications = notifications.map((notification) => ({
      id: notification.id,
      projectId: notification.project_id,
      entryId: notification.entry_id,
      actorId: notification.actor_id,
      recipients: notification.recipients || [],
      mode: notification.mode,
      actualType: notification.actual_type,
      title: notification.title,
      amount: Number(notification.amount || 0),
      emoji: notification.emoji,
      photoName: notification.photo_name || "",
      photoData: notification.photo_data || "",
      gif: notification.gif || "",
      successReaction: notification.success_reaction || "✅",
      successPhotoName: notification.success_photo_name || "",
      successPhotoData: notification.success_photo_data || "",
      successGif: notification.success_gif || "",
      failReaction: notification.fail_reaction || "🙃",
      failPhotoName: notification.fail_photo_name || "",
      failPhotoData: notification.fail_photo_data || "",
      failGif: notification.fail_gif || "",
      guesses: Array.isArray(notification.guesses) ? notification.guesses : [],
      createdAt: notification.created_at,
    }));

    state.activeProjectId = state.projects.some((project) => project.id === state.activeProjectId) ? state.activeProjectId : state.projects[0]?.id || "";
    state.activeUserId = state.signedInUserId;
    state.cloudSyncAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    setCloudStatus(friendlyCloudError(error));
    throw error;
  } finally {
    cloudSyncPaused = false;
  }
}

async function ensureCloudStarterProject() {
  if (!isCloudReady() || !state.signedInUserId || state.projects.length) return;
  const user = currentUser();
  if (!user) return;
  createProject(`${profileLabel(user)} Kasası`, "Kendi bütçem");
  await cloudPushState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function scheduleCloudSync() {
  if (!isCloudReady() || cloudSyncPaused || !state?.signedInUserId) return;
  clearTimeout(cloudSyncTimer);
  cloudSyncTimer = setTimeout(() => {
    cloudPushState().catch((error) => {
      setCloudStatus(friendlyCloudError(error));
      console.warn(error);
    });
  }, 500);
}

async function cloudPushState() {
  if (!isCloudReady() || cloudSyncBusy || cloudSyncPaused || !state?.signedInUserId) return;
  const client = cloudDb();
  const user = currentUser();
  if (!user) return;

  cloudSyncBusy = true;
  try {
    const profileResult = await client.from("kasa_profiles").upsert(
      {
        id: user.id,
        email: user.email || "",
        name: user.name,
        nickname: user.nickname || "",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
    if (profileResult.error) throw profileResult.error;

    const ownedProjects = state.projects.filter((project) => project.createdBy === user.id);
    if (ownedProjects.length) {
      const { error } = await client.from("kasa_projects").upsert(
        ownedProjects.map((project) => ({
          id: project.id,
          name: project.name,
          purpose: project.purpose,
          code: projectCode(project),
          created_by: project.createdBy,
          created_at: project.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        { onConflict: "id" },
      );
      if (error) throw error;
    }

    const membershipRows = ownedProjects.flatMap((project) =>
      project.memberIds.map((userId) => ({
        project_id: project.id,
        user_id: userId,
        role: userId === project.createdBy ? "owner" : "member",
        alias: project.memberAliases?.[userId] || "",
      })),
    );
    if (membershipRows.length) {
      const { error } = await client.from("kasa_project_members").upsert(membershipRows, { onConflict: "project_id,user_id" });
      if (error) throw error;
    }

    const projectIds = state.projects.map((project) => project.id);
    const headingRows = state.headings
      .filter((heading) => projectIds.includes(heading.projectId))
      .map((heading) => ({
        id: heading.id,
        project_id: heading.projectId,
        name: heading.name,
        short_name: heading.shortName,
        emoji: heading.emoji,
      }));
    if (headingRows.length) {
      const { error } = await client.from("kasa_headings").upsert(headingRows, { onConflict: "id" });
      if (error) throw error;
    }

    const entryRows = state.entries
      .filter((entry) => entry.userId === user.id)
      .map((entry) => ({
        id: entry.id,
        project_id: entry.projectId,
        user_id: entry.userId,
        type: entry.type,
        amount: entry.amount,
        entered_amount: entry.enteredAmount || entry.amount,
        currency: entry.currency || "TRY",
        exchange_rate: entry.exchangeRate || 1,
        heading_id: entry.headingId || null,
        short_name: entry.shortName,
        emoji: entry.emoji,
        entry_date: entry.date,
        note: entry.note || "",
        photo_name: entry.photoName || "",
        photo_data: entry.photoData || "",
        locked_notification_id: entry.lockedNotificationId || null,
        settlement: Boolean(entry.settlement),
        status: entry.status,
        created_at: entry.createdAt || new Date().toISOString(),
      }));
    if (entryRows.length) {
      const { error } = await client.from("kasa_entries").upsert(entryRows, { onConflict: "id" });
      if (error) throw error;
    }

    const notificationRows = state.notifications
      .filter((notification) => notification.actorId === user.id || notification.recipients?.includes(user.id))
      .map((notification) => ({
        id: notification.id,
        project_id: notification.projectId,
        entry_id: notification.entryId,
        actor_id: notification.actorId,
        recipients: notification.recipients || [],
        mode: notification.mode,
        actual_type: notification.actualType,
        title: notification.title,
        amount: notification.amount,
        emoji: notification.emoji,
        photo_name: notification.photoName || "",
        photo_data: notification.photoData || "",
        gif: notification.gif || "",
        success_reaction: notification.successReaction || "✅",
        success_photo_name: notification.successPhotoName || "",
        success_photo_data: notification.successPhotoData || "",
        success_gif: notification.successGif || "",
        fail_reaction: notification.failReaction || "🙃",
        fail_photo_name: notification.failPhotoName || "",
        fail_photo_data: notification.failPhotoData || "",
        fail_gif: notification.failGif || "",
        guesses: notification.guesses || [],
        created_at: notification.createdAt || new Date().toISOString(),
      }));
    if (notificationRows.length) {
      const { error } = await client.from("kasa_notifications").upsert(notificationRows, { onConflict: "id" });
      if (error) throw error;
    }

    state.cloudSyncAt = new Date().toISOString();
    setCloudStatus("Bulut senkron");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } finally {
    cloudSyncBusy = false;
  }
}

async function cloudJoinProjectByCode(code) {
  const client = cloudDb();
  if (!client) throw new Error("Bulut ayarı yok.");
  const { data, error } = await client.rpc("join_kasa_project", { invite_code: normalizeCode(code) });
  if (error) throw error;
  await loadCloudData();
  if (data) state.activeProjectId = data;
  saveState();
  return data;
}

async function cloudAddMemberByEmail(email) {
  const project = activeProject();
  const client = cloudDb();
  if (!client || !project) throw new Error("Bulut ayarı yok.");
  const { data, error } = await client.rpc("add_kasa_member_by_email", {
    project_uuid: project.id,
    member_email: String(email || "").trim().toLowerCase(),
  });
  if (error) throw error;
  await loadCloudData();
  saveState();
  return data;
}


/*
  Blocks 0-9 expansion layer.
  Loaded after the existing prototype files and before initApp().
*/

function blockNow() {
  return new Date().toISOString();
}

function blockProject(project = activeProject()) {
  return project || state.projects[0] || null;
}

function friendlyCloudError(error) {
  const message = error?.message || String(error || "");
  if (message.includes("column") && message.includes("does not exist")) return "Supabase yeni alanları eksik. supabase-blocks-0-9.sql dosyasını SQL Editor'da çalıştır.";
  if (message.includes("relation") || message.includes("does not exist")) return "Supabase yeni tabloları eksik. supabase-blocks-0-9.sql ve gerekirse supabase-schema.sql çalıştırılmalı.";
  if (message.includes("row-level security")) return "Supabase izin kuralı engelledi. SQL politikalarını kontrol etmemiz gerekiyor.";
  if (message.includes("Invalid login credentials")) return "E-posta veya şifre hatalı.";
  if (message.includes("Email not confirmed")) return "Önce e-postadaki doğrulama linkine tıkla.";
  return message || "Bulut işlemi tamamlanamadı.";
}

function blockRawEntries(project = activeProject()) {
  if (!project) return [];
  return (state.entries || []).filter((entry) => entry.projectId === project.id);
}

function blockConfirmedEntries(project = activeProject()) {
  return blockRawEntries(project).filter((entry) => entryConfirmed(entry));
}

function relativeDate(value) {
  const date = new Date(value || blockNow());
  const diffMs = date.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat("tr-TR", { numeric: "auto" });
  if (abs >= 86400000) return rtf.format(Math.round(diffMs / 86400000), "day");
  if (abs >= 3600000) return rtf.format(Math.round(diffMs / 3600000), "hour");
  return rtf.format(Math.round(diffMs / 60000), "minute");
}

function cleanRatioList(ids, ratios) {
  const list = Array.isArray(ratios) ? ratios.map(Number) : [];
  const fallback = ids.length ? 1 / ids.length : 1;
  const raw = ids.map((_id, index) => (Number.isFinite(list[index]) && list[index] > 0 ? list[index] : fallback));
  const total = raw.reduce((sumValue, value) => sumValue + value, 0) || 1;
  return raw.map((value) => value / total);
}

function splitForEntry(type, settlement, paidById) {
  const project = activeProject();
  if (!project || type !== "expense" || !settlement) return { splitWith: paidById ? [paidById] : [], splitRatio: [1] };
  if (project.splitType === "individual") return { splitWith: paidById ? [paidById] : [], splitRatio: [1] };
  const ids = activeMembers().map((user) => user.id);
  const splitWith = ids.length ? ids : paidById ? [paidById] : [];
  return { splitWith, splitRatio: cleanRatioList(splitWith, []) };
}

function entryConfirmed(entry) {
  if (!entry || entry.status !== "done") return false;
  if (!entry.lockedNotificationId) return true;
  const notification = entryNotification(entry);
  if (!notification) return false;
  maybeRevealNotification(notification);
  return Boolean(notification.revealedAt || notification.isCompleted);
}

function entryVisibleForCurrentUser(entry) {
  if (!entry?.lockedNotificationId) return true;
  const notification = entryNotification(entry);
  if (!notification) return false;
  if (notification.mode !== "surprise") return true;
  maybeRevealNotification(notification);
  return Boolean(notification.revealedAt || notification.isCompleted);
}

function projectEntries() {
  return blockRawEntries().filter((entry) => entryVisibleForCurrentUser(entry));
}

function visibleProjectEntries() {
  return projectEntries();
}

function confirmedProjectEntries(project = activeProject()) {
  return blockConfirmedEntries(project);
}

function pendingSurpriseCount(project = activeProject()) {
  return blockRawEntries(project).filter((entry) => entry.status === "done" && entry.lockedNotificationId && !entryConfirmed(entry)).length;
}

function calculateTotals(entries = blockRawEntries()) {
  const done = entries.filter((entry) => entry.status === "done" && entryConfirmed(entry));
  const pending = entries.filter((entry) => entry.status === "pending");
  const income = sum(done.filter((entry) => entry.type === "income"));
  const expense = sum(done.filter((entry) => entry.type === "expense"));
  const receivable = sum(pending.filter((entry) => entry.type === "receivable"));
  const payable = sum(pending.filter((entry) => entry.type === "payable"));
  const actual = income - expense;
  const comfortable = income - expense + receivable - payable;
  return { income, expense, receivable, payable, actual, comfortable };
}

function maybeRevealNotification(notification) {
  if (!notification || notification.mode !== "surprise" || notification.revealedAt) return notification;
  const recipients = Array.isArray(notification.recipients) ? notification.recipients : [];
  const guesses = Array.isArray(notification.guesses) ? notification.guesses : [];
  const allGuessed = recipients.length > 0 && recipients.every((userId) => guesses.some((guess) => guess.userId === userId));
  const entry = (state.entries || []).find((item) => item.id === notification.entryId);
  const deadline = notification.guessDeadline || entry?.autoRevealAt || addHours(notification.createdAt || blockNow(), 48);
  const deadlinePassed = new Date(deadline).getTime() <= Date.now();
  if (allGuessed || deadlinePassed) {
    notification.revealedAt = blockNow();
    notification.isCompleted = true;
    if (entry) entry.autoRevealAt = entry.autoRevealAt || deadline;
  }
  return notification;
}

function createEntryNotification(entry, options = {}) {
  const project = activeProject();
  const actor = currentUser();
  if (!project || !actor || options.mode === "silent") return null;
  const recipients = project.memberIds.filter((id) => id !== actor.id);
  if (!recipients.length) return null;

  state.notifications = state.notifications || [];
  const now = blockNow();
  const deadline = options.guessDeadline || addHours(now, 48);
  const notification = {
    id: makeId(),
    projectId: project.id,
    entryId: entry.id,
    actorId: actor.id,
    recipients,
    mode: options.mode || "open",
    actualType: entry.type,
    title: entryTitle(entry),
    amount: Number(entry.amount || 0),
    emoji: options.emoji || "🎲",
    photoName: options.photoName || "",
    photoData: options.photoData || "",
    gif: options.gif || "",
    successReaction: options.successReaction || "✅",
    successPhotoName: options.successPhotoName || "",
    successPhotoData: options.successPhotoData || "",
    successGif: options.successGif || "",
    failReaction: options.failReaction || "🙂",
    failPhotoName: options.failPhotoName || "",
    failPhotoData: options.failPhotoData || "",
    failGif: options.failGif || "",
    guessDeadline: deadline,
    revealedAt: options.mode === "surprise" ? "" : now,
    isCompleted: options.mode !== "surprise",
    notificationType: "entry",
    reactionEmoji: "",
    guesses: [],
    createdAt: now,
  };
  state.notifications.unshift(notification);
  return notification;
}

function amountGuessCorrect(actual, predicted) {
  if (predicted === null || predicted === undefined || predicted === "") return true;
  const value = Number(predicted);
  if (!Number.isFinite(value) || value <= 0) return true;
  const base = Math.abs(Number(actual || 0));
  return Math.abs(base - value) <= base * 0.15;
}

function guessNotification(id, guessInput) {
  const notification = (state.notifications || []).find((item) => item.id === id);
  const user = currentUser();
  if (!notification || !user) return { status: "missing" };
  notification.guesses = Array.isArray(notification.guesses) ? notification.guesses : [];
  const existing = notification.guesses.find((guess) => guess.userId === user.id);
  if (existing) return { status: "already", guess: existing };

  const predictedType = typeof guessInput === "string" ? guessInput : String(guessInput?.predictedType || "");
  const predictedAmountRaw = typeof guessInput === "object" ? guessInput.predictedAmount : null;
  const predictedAmount = predictedAmountRaw === "" || predictedAmountRaw === null || predictedAmountRaw === undefined ? null : Number(predictedAmountRaw);
  const isCorrect = predictedType === notification.actualType && amountGuessCorrect(notification.amount, predictedAmount);
  const result = {
    userId: user.id,
    predictedType,
    predictedAmount,
    isCorrect,
    guessedAt: blockNow(),
    guess: predictedType,
    correct: isCorrect,
    at: blockNow(),
  };
  notification.guesses.push(result);
  user.totalGuesses = Number(user.totalGuesses || 0) + 1;
  if (isCorrect) {
    user.totalScore = Number(user.totalScore || 0) + 10;
    user.correctGuesses = Number(user.correctGuesses || 0) + 1;
  }
  maybeRevealNotification(notification);
  return { status: "saved", guess: result, notification };
}

function onayText(user, correct) {
  const mode = personalityModes[user?.onayModu || "standart"] || personalityModes.standart;
  return correct ? mode.success : mode.fail;
}

function notificationMedia(notification) {
  return {
    emoji: notification?.emoji || "🎲",
    photoName: notification?.photoName || "",
    photoData: notification?.photoData || "",
    gif: notification?.gif || "",
  };
}

function notificationReactionMedia(notification, guess) {
  if (!notification || !guess) return {};
  if (guess.isCorrect ?? guess.correct) {
    return {
      emoji: notification.successReaction || "✅",
      photoName: notification.successPhotoName || "",
      photoData: notification.successPhotoData || "",
      gif: notification.successGif || "",
    };
  }
  return {
    emoji: notification.failReaction || "🙂",
    photoName: notification.failPhotoName || "",
    photoData: notification.failPhotoData || "",
    gif: notification.failGif || "",
  };
}

function mediaPreviewHtml(media = {}, fallback = "🎲") {
  if (media.photoData) return `<img class="media-image" src="${media.photoData}" alt="${media.photoName || "Medya"}" />`;
  if (media.gif) {
    const value = String(media.gif).trim();
    if (/^https?:\/\//i.test(value)) return `<img class="media-image" src="${value}" alt="GIF" />`;
    return `<span class="media-gif">${value}</span>`;
  }
  if (media.photoName) return `<span class="media-gif">📎 ${media.photoName}</span>`;
  return `<span>${media.emoji || fallback}</span>`;
}

function notificationRow(notification) {
  const actor = state.users.find((user) => user.id === notification.actorId);
  const guess = notificationGuessFor(notification);
  const isSurprise = notification.mode === "surprise";
  const isReaction = notification.notificationType === "reaction";
  const typeLabel = notification.actualType === "income" ? "gelir" : notification.actualType === "expense" ? "gider" : "hareket";
  const media = mediaPreviewHtml(notificationMedia(notification));
  const completed = Boolean(notification.revealedAt || notification.isCompleted);

  if (isReaction) {
    return `
      <div class="notification-card reaction-notification">
        <div class="notification-hero pop-emoji">${notification.reactionEmoji || "👀"}</div>
        <div class="expense-main">
          <p class="expense-title">${projectUserLabel(actor)} tepki verdi</p>
          <p class="expense-meta">${notification.title}</p>
        </div>
      </div>
    `;
  }

  if (!isSurprise) {
    return `
      <div class="notification-card">
        <div class="notification-hero">${media}</div>
        <div class="expense-main">
          <p class="expense-title">${projectUserLabel(actor)} ${typeLabel} ekledi</p>
          <p class="expense-meta">${notification.title} · ${money(notification.amount)} · ${relativeDate(notification.createdAt)}</p>
        </div>
      </div>
    `;
  }

  if (guess && !completed) {
    return `
      <div class="notification-card surprise-locked">
        <div class="notification-hero">${media}</div>
        <div class="expense-main">
          <p class="expense-title">Tahmin kaydedildi</p>
          <p class="expense-meta">Sen ${guess.predictedType === "income" ? "gelir" : "gider"} dedin. Detay, herkes tahmin edince veya süre dolunca açılacak.</p>
        </div>
      </div>
    `;
  }

  if (guess && completed) {
    const correct = Boolean(guess.isCorrect ?? guess.correct);
    const ownerText = onayText(actor, correct);
    return `
      <div class="notification-card ${correct ? "guess-correct" : "guess-wrong"}">
        <div class="notification-hero">${mediaPreviewHtml(notificationReactionMedia(notification, guess), correct ? "✅" : "🙂")}</div>
        <div class="expense-main">
          <p class="expense-title">${correct ? "Kestirdin! +10 puan" : "Sürpriz geldi geçti."}</p>
          <p class="expense-meta">${ownerText} Gerçek: ${typeLabel} · ${money(notification.amount)} · ${completed ? "kasa açıldı" : "diğer tahminler bekleniyor"}</p>
          <div class="reaction-result ${correct ? "correct confetti-burst" : "wrong shake-once"}">
            <span>${correct ? "Doğru tahmin" : "Yanlış tahmin"}</span>
            <span class="reaction-media">${mediaPreviewHtml(notificationReactionMedia(notification, guess), correct ? "✅" : "🙂")}</span>
          </div>
        </div>
      </div>
    `;
  }

  if (completed) {
    return `
      <div class="notification-card">
        <div class="notification-hero">${media}</div>
        <div class="expense-main">
          <p class="expense-title">Sürpriz açıldı</p>
          <p class="expense-meta">Gerçek: ${typeLabel} · ${notification.title} · ${money(notification.amount)}</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="notification-card surprise-locked">
      <div class="notification-hero">${media}</div>
      <div class="expense-main">
        <p class="expense-title">${projectUserLabel(actor)} sürpriz hareket gönderdi</p>
        <p class="expense-meta">?? · ?? · ${relativeDate(notification.createdAt)} · ${notification.title ? "başlık kapalı" : "detay kapalı"}</p>
        <form class="guess-form" data-guess-form data-id="${notification.id}">
          <div class="guess-actions">
            <button class="mini-action" name="predictedType" value="income" type="submit">Gelir mi?</button>
            <button class="mini-action" name="predictedType" value="expense" type="submit">Gider mi?</button>
          </div>
          <input class="text-input guess-amount" name="predictedAmount" inputmode="numeric" placeholder="Tutar tahmini opsiyonel" autocomplete="off" />
        </form>
      </div>
    </div>
  `;
}

function reactionSummary(entryId) {
  const items = (state.reactions || []).filter((reaction) => reaction.entryId === entryId);
  if (!items.length) return "";
  const grouped = items.reduce((acc, item) => {
    acc[item.emoji] = (acc[item.emoji] || 0) + 1;
    return acc;
  }, {});
  const parts = Object.entries(grouped)
    .slice(0, 3)
    .map(([emoji, count]) => `${emoji}${count > 1 ? ` ${count}` : ""}`);
  const extra = Object.keys(grouped).length > 3 ? `+${Object.keys(grouped).length - 3}` : "";
  return [...parts, extra].filter(Boolean).join(" ");
}

function reactionPicker(entry) {
  return `
    <div class="reaction-picker">
      ${reactionPreset.map((emoji) => `<button class="emoji-chip" data-action="set-reaction" data-id="${entry.id}" data-emoji="${emoji}" type="button">${emoji}</button>`).join("")}
      <form class="custom-reaction-form" data-custom-reaction data-id="${entry.id}">
        <input class="text-input" name="emoji" maxlength="4" placeholder="Emoji" autocomplete="off" />
        <button class="mini-action" type="submit">Ekle</button>
      </form>
    </div>
  `;
}

function createReactionNotification(entry, emoji) {
  const actor = currentUser();
  if (!entry || !actor || entry.userId === actor.id) return;
  state.notifications = state.notifications || [];
  const heading = entryTitle(entry);
  state.notifications.unshift({
    id: makeId(),
    projectId: entry.projectId,
    entryId: entry.id,
    actorId: actor.id,
    recipients: [entry.userId],
    mode: "reaction",
    actualType: entry.type,
    title: `${projectUserLabel(actor)} senin ${heading} harcamanı ${emoji} ile işaretledi`,
    amount: entry.amount,
    emoji,
    reactionEmoji: emoji,
    notificationType: "reaction",
    guesses: [],
    createdAt: blockNow(),
  });
}

function setReaction(entryId, emoji) {
  const user = currentUser();
  const entry = (state.entries || []).find((item) => item.id === entryId);
  if (!user || !entry || !emoji) return;
  state.reactions = state.reactions || [];
  const existing = state.reactions.find((reaction) => reaction.entryId === entryId && reaction.userId === user.id);
  if (existing) {
    existing.emoji = emoji;
    existing.createdAt = blockNow();
  } else {
    state.reactions.push({ id: makeId(), entryId, projectId: entry.projectId, userId: user.id, emoji, createdAt: blockNow() });
  }
  createReactionNotification(entry, emoji);
}

function entryRow(entry) {
  const type = entryTypes.find((item) => item.id === entry.type);
  const user = state.users.find((item) => item.id === entry.userId);
  const exchange = exchangeText(entry);
  const reactions = reactionSummary(entry.id);
  return `
    <div class="expense-row">
      <span class="emoji-dot">${entry.emoji || entryHeading(entry).emoji || type?.emoji || "🧾"}</span>
      <div class="expense-main">
        <p class="expense-title">${entryTitle(entry)}</p>
        <p class="expense-meta">${projectUserLabel(user)} · ${type?.label || "Hareket"} · ${formatShortDate(entry.date)}${exchange ? ` · ${exchange}` : ""}</p>
        ${entry.note ? `<p class="expense-note">${entry.note}</p>` : ""}
        ${reactions ? `<p class="expense-note reaction-line">${reactions}</p>` : ""}
      </div>
      <strong class="expense-price ${entry.type === "income" ? "price-positive" : entry.type === "expense" ? "price-negative" : ""}">
        ${entry.type === "income" ? "+" : entry.type === "expense" ? "-" : ""}${money(entry.amount)}
      </strong>
      <button class="reaction-button" data-action="toggle-reaction-picker" data-id="${entry.id}" type="button" aria-label="Tepki ver">☺</button>
    </div>
    ${state.reactionPickerEntryId === entry.id ? reactionPicker(entry) : ""}
  `;
}

function movementEntryRow(entry) {
  const notification = entryNotification(entry);
  const guess = notificationGuessFor(notification);
  const gameStatus = entryGameStatus(entry);
  const entryMedia = entry.photoData ? mediaPreviewHtml({ photoData: entry.photoData, photoName: entry.photoName }, "📎") : "";
  const reactionMedia = guess ? mediaPreviewHtml(notificationReactionMedia(notification, guess), guess.isCorrect ? "✅" : "🙂") : "";
  return `
    <div class="movement-card">
      ${entryRow(entry)}
      ${
        gameStatus || entryMedia || reactionMedia
          ? `
            <div class="movement-extra">
              ${gameStatus ? `<span class="neutral-pill">${gameStatus}</span>` : ""}
              ${reactionMedia ? `<span class="movement-media">${reactionMedia}</span>` : ""}
              ${entryMedia ? `<span class="movement-media">${entryMedia}</span>` : ""}
            </div>
          `
          : ""
      }
    </div>
  `;
}

function calculateNetBalances(project = activeProject()) {
  const members = activeMembers();
  const balances = Object.fromEntries(members.map((user) => [user.id, 0]));
  blockConfirmedEntries(project)
    .filter((entry) => entry.type === "expense" && entry.settlement)
    .forEach((entry) => {
      const paidById = entry.paidById || entry.userId;
      const splitWith = Array.isArray(entry.splitWith) && entry.splitWith.length ? entry.splitWith : members.map((user) => user.id);
      const ratios = cleanRatioList(splitWith, entry.splitRatio);
      if (balances[paidById] !== undefined) balances[paidById] += Number(entry.amount || 0);
      splitWith.forEach((userId, index) => {
        if (balances[userId] !== undefined) balances[userId] -= Number(entry.amount || 0) * ratios[index];
      });
    });

  (state.settlements || [])
    .filter((settlement) => settlement.projectId === project?.id)
    .forEach((settlement) => {
      if (balances[settlement.fromUserId] !== undefined) balances[settlement.fromUserId] += Number(settlement.amount || 0);
      if (balances[settlement.toUserId] !== undefined) balances[settlement.toUserId] -= Number(settlement.amount || 0);
    });

  return members
    .map((user) => ({ userId: user.id, name: projectUserLabel(user), balance: Math.round(balances[user.id] || 0) }))
    .filter((item) => item.balance !== 0);
}

function calculateBalances() {
  return calculateNetBalances();
}

function minimumTransfers(balances = calculateNetBalances()) {
  const creditors = balances.filter((item) => item.balance > 0).map((item) => ({ ...item, amount: item.balance })).sort((a, b) => b.amount - a.amount);
  const debtors = balances.filter((item) => item.balance < 0).map((item) => ({ ...item, amount: Math.abs(item.balance) })).sort((a, b) => b.amount - a.amount);
  const transfers = [];
  let c = 0;
  let d = 0;
  while (creditors[c] && debtors[d]) {
    const amount = Math.min(creditors[c].amount, debtors[d].amount);
    if (amount > 0) {
      transfers.push({
        fromUserId: debtors[d].userId,
        toUserId: creditors[c].userId,
        from: debtors[d].name,
        to: creditors[c].name,
        amount: Math.round(amount),
      });
    }
    creditors[c].amount -= amount;
    debtors[d].amount -= amount;
    if (creditors[c].amount <= 0.5) c += 1;
    if (debtors[d].amount <= 0.5) d += 1;
  }
  return transfers;
}

function settleTransfer(transfer, addToKasa = false) {
  if (!transfer) return;
  state.settlements = state.settlements || [];
  const now = blockNow();
  state.settlements.push({
    id: makeId(),
    projectId: activeProject()?.id || "",
    fromUserId: transfer.fromUserId,
    toUserId: transfer.toUserId,
    amount: Number(transfer.amount || 0),
    settledAt: now,
    note: "Hesaplaşma ekranından ödendi",
  });
  if (addToKasa) {
    const heading = ensureHeading("Hesaplaşma", "Hesaplaşma", "🤝");
    const base = {
      projectId: activeProject()?.id || "",
      amount: Number(transfer.amount || 0),
      enteredAmount: Number(transfer.amount || 0),
      currency: "TRY",
      exchangeRate: 1,
      headingId: heading.id,
      shortName: heading.shortName,
      emoji: heading.emoji,
      date: todayKey(),
      note: "Hesaplaşma ödendi",
      photoName: "",
      photoData: "",
      lockedNotificationId: "",
      autoRevealAt: "",
      rateLockedAt: now,
      splitWith: [],
      splitRatio: [],
      ocrRawText: null,
      ocrParsedAmount: null,
      settlement: false,
      status: "done",
      createdAt: now,
    };
    state.entries.unshift({ ...base, id: makeId(), type: "expense", userId: transfer.fromUserId, paidById: transfer.fromUserId });
    state.entries.unshift({ ...base, id: makeId(), type: "income", userId: transfer.toUserId, paidById: transfer.toUserId });
  }
}

function transferRows(transfers) {
  if (!transfers.length) return `<div class="empty-state">Şimdilik hesap kapanmış görünüyor.</div>`;
  return transfers
    .map(
      (tx, index) => `
        <div class="split-row">
          <strong>${tx.from} → ${tx.to}</strong>
          <span>${money(tx.amount)}</span>
          <label class="settle-check"><input type="checkbox" data-cash-transfer="${index}" /> Kasaya da ekle</label>
          <button class="mini-action" data-action="settle-transfer" data-index="${index}" type="button">Ödendi</button>
        </div>
      `,
    )
    .join("");
}

function fillMessage(template, data) {
  return String(template || "").replace(/\{([^}]+)\}/g, (_match, key) => data[key] ?? "");
}

function pickMessage(list) {
  return list[Math.floor(Math.random() * list.length)] || "";
}

function entriesByPeriod(period, project = activeProject()) {
  return blockConfirmedEntries(project).filter((entry) => isInPeriod(entry.date, period));
}

function headingTotalForDate(headingId, date) {
  return blockConfirmedEntries()
    .filter((entry) => entry.type === "expense" && entry.headingId === headingId && entry.date === date)
    .reduce((total, entry) => total + Number(entry.amount || 0), 0);
}

function dailyWarningCards() {
  const project = activeProject();
  const cards = [];
  projectHeadings().forEach((heading) => {
    const todayTotal = headingTotalForDate(heading.id, todayKey());
    if (!todayTotal) return;
    const limit = Number(project?.budgetLimits?.[heading.id] || 0);
    const historical = blockConfirmedEntries()
      .filter((entry) => entry.type === "expense" && entry.headingId === heading.id && entry.date !== todayKey())
      .slice(-90);
    const average = historical.length ? sum(historical) / Math.max(1, new Set(historical.map((entry) => entry.date)).size) : 0;
    const threshold = limit || average * 1.2;
    if (!threshold || todayTotal <= threshold) return;
    const entertainment = /eglence|eğlence|kahve|sinema|oyun/i.test(normalize(heading.name));
    const template = pickMessage(entertainment ? funnyMessages.asimEglence : funnyMessages.asimGenel);
    cards.push(fillMessage(template, { tutar: formatNumber(todayTotal), hedefGun: 2, başlık: heading.shortName, gecenAy: formatNumber(previousMonthHeadingTotal(heading.id)) }));
  });
  return cards
    .slice(0, 2)
    .map((text) => `<section class="card alert-card"><p>${text}</p></section>`)
    .join("");
}

function previousMonthHeadingTotal(headingId) {
  const prev = previousMonthKey();
  return sum(blockConfirmedEntries().filter((entry) => entry.type === "expense" && entry.headingId === headingId && entryMonth(entry) === prev));
}

function weeklySummaryCard() {
  const day = new Date().getDay();
  if (day !== 0) return "";
  const weekEntries = entriesByPeriod("week");
  if (!weekEntries.length) return "";
  const project = activeProject();
  const weekExpense = sum(weekEntries.filter((entry) => entry.type === "expense"));
  const previousWeekExpense = sum(blockConfirmedEntries(project).filter((entry) => {
    const date = dateFromKey(entry.date);
    const now = startOfDay(new Date());
    const diff = Math.round((now - startOfDay(date)) / 86400000);
    return entry.type === "expense" && diff >= 7 && diff < 14;
  }));
  const words = weekExpense > previousWeekExpense * 1.1 ? ["zorladı", "ağlattı"] : weekExpense < previousWeekExpense * 0.9 ? ["rahatlattı", "kurtardı"] : ["şoke etti"];
  const top = topHeading(weekEntries);
  const balances = calculateNetBalances(project);
  const least = activeMembers().map((user) => ({
    name: projectUserLabel(user),
    total: sum(weekEntries.filter((entry) => entry.type === "expense" && entry.userId === user.id)),
  })).sort((a, b) => a.total - b.total)[0];
  return `
    <section class="card summary-card">
      <h2>Haftalık özet</h2>
      <p>${projectUserLabel(currentUser())} bu hafta kasayı ${pickMessage(words)}.</p>
      <p>En çok: ${top}. En az harcayan: ${least?.name || "Yok"}. ${balances.length ? `${balances.length} açık hesap var.` : ""}</p>
    </section>
  `;
}

function monthlyComparisonCard() {
  const current = monthKey();
  const prev = previousMonthKey();
  const currentNet = calculateTotals(blockConfirmedEntries().filter((entry) => entryMonth(entry) === current)).actual;
  const previousNet = calculateTotals(blockConfirmedEntries().filter((entry) => entryMonth(entry) === prev)).actual;
  if (!previousNet && !currentNet) return "";
  const diff = currentNet - previousNet;
  const list = diff < -500 ? funnyMessages.monthlyWin : diff > 500 ? funnyMessages.monthlyWarn : funnyMessages.monthlyNeutral;
  const text = fillMessage(pickMessage(list), { fark: formatNumber(diff), farkMutlak: formatNumber(Math.abs(diff)) });
  return `<section class="card summary-card"><h2>Aylık karşılaştırma</h2><p>${text}</p></section>`;
}

function reconciliationCards() {
  const items = (state.reconciliations || []).filter((item) => item.projectId === activeProject()?.id).slice(-2).reverse();
  if (!items.length) return "";
  return items
    .map((item) => {
      const matched = Math.abs(Number(item.diff || 0)) < 1;
      const text = fillMessage(pickMessage(matched ? funnyMessages.reconciliationMatch : funnyMessages.reconciliationDiff), { diff: formatNumber(Math.abs(item.diff)) });
      return `
        <section class="card reconciliation-card">
          <div class="section-head">
            <div>
              <h2>${item.bankName || "Ekstre"} uzlaşması</h2>
              <p>${text}</p>
            </div>
            <button class="tiny-button" data-action="show-reconciliation" data-id="${item.id}" type="button">Detay</button>
          </div>
          ${state.reconciliationDetailId === item.id ? reconciliationDetail(item) : ""}
        </section>
      `;
    })
    .join("");
}

function reconciliationDetail(item) {
  return `
    <div class="expense-list">
      <div class="split-row"><strong>Ekstre</strong><span>${money(item.statementTotal)}</span></div>
      <div class="split-row"><strong>Kasa</strong><span>${money(item.kasaTotal)}</span></div>
      <div class="split-row"><strong>Fark</strong><span>${money(item.diff)}</span></div>
      ${item.rawRows.slice(0, 8).map((row) => `<div class="expense-row"><div class="expense-main"><p class="expense-title">${row.description}</p><p class="expense-meta">${row.date}</p></div><strong>${money(row.amount)}</strong></div>`).join("")}
    </div>
  `;
}

function goalCurrentAmount(goal) {
  const title = normalize(goal.title);
  return sum(blockConfirmedEntries().filter((entry) => entry.type === "income" && normalize(entryTitle(entry)).includes(title)));
}

function goalCard(goal) {
  const current = goalCurrentAmount(goal);
  const target = Number(goal.targetAmount || 0);
  const percent = target ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const start = new Date(goal.createdAt || blockNow());
  const elapsedDays = daysBetween(start);
  const daily = current / Math.max(1, elapsedDays);
  const remaining = Math.max(0, target - current);
  const remainingDays = daily ? Math.ceil(remaining / daily) : 0;
  const finish = remainingDays ? new Date(Date.now() + remainingDays * 86400000) : null;
  const deadline = goal.deadline ? new Date(goal.deadline) : null;
  const months = deadline ? Math.max(1, (deadline.getFullYear() - new Date().getFullYear()) * 12 + deadline.getMonth() - new Date().getMonth() + 1) : 1;
  return `
    <div class="goal-card">
      <div class="section-head">
        <div>
          <h2>${goal.title}</h2>
          <p>${money(current)} / ${money(target)} · aylık gerekli ${money(remaining / months)}</p>
        </div>
        <span class="quick-pill">${percent}%</span>
      </div>
      <div class="progress-bg"><div class="progress-fill" style="width:${percent}%"></div></div>
      <p class="field-help">${finish ? `Bu hızla ${finish.toLocaleDateString("tr-TR")} tarihinde tamamlanır.` : "Henüz hız hesabı için katkı yok."}</p>
      ${
        goal.items?.length
          ? `<div class="expense-list">${goal.items.map((item) => `<div class="split-row"><strong>${item.purchased ? "✓" : "○"} ${item.name}</strong><span>${money(item.price)}</span></div>`).join("")}</div>`
          : ""
      }
    </div>
  `;
}

function renderGoalSection() {
  const goals = (state.goals || []).filter((goal) => goal.projectId === activeProject()?.id && goal.status !== "completed");
  return `
    <section class="card">
      <div class="section-head">
        <div>
          <h2>Hedefler</h2>
          <p>Kumbara modu. Gelir başlığı hedef adıyla eşleşirse otomatik ilerler.</p>
        </div>
      </div>
      <form class="inline-form" id="goalForm">
        <input class="text-input" name="title" placeholder="Hedef adı: Tatil, PC, depozito" autocomplete="off" />
        <input class="text-input" name="targetAmount" inputmode="numeric" placeholder="Hedef tutar" autocomplete="off" />
        <input class="select-input" name="deadline" type="date" />
        <input class="text-input" name="items" placeholder="Kalemler: uçak 5000, otel 12000" autocomplete="off" />
        <button class="primary-button" type="submit">Hedef ekle</button>
      </form>
      <div class="expense-list">${goals.length ? goals.map(goalCard).join("") : `<div class="empty-state">Aktif hedef yok.</div>`}</div>
    </section>
  `;
}

function goalDelayWarning(entry) {
  if (!entry || entry.type !== "expense") return "";
  const goal = (state.goals || []).find((item) => item.projectId === entry.projectId && item.status === "active");
  if (!goal) return "";
  const remaining = Math.max(0, Number(goal.targetAmount || 0) - goalCurrentAmount(goal));
  if (!remaining) return "";
  const deadline = goal.deadline ? new Date(goal.deadline) : new Date(Date.now() + 30 * 86400000);
  const months = Math.max(1, (deadline.getFullYear() - new Date().getFullYear()) * 12 + deadline.getMonth() - new Date().getMonth() + 1);
  const monthly = remaining / months;
  const delayed = Math.round((Number(entry.amount || 0) / Math.max(1, monthly)) * 30);
  return delayed > 0 ? `Bu harcama hedefini yaklaşık ${delayed} gün erteledi.` : "";
}

function templateOptionsHtml(selected = state.selectedTemplateId || "") {
  return `
    <div class="template-grid">
      ${projectTemplates
        .map(
          (template) => `
            <button class="template-card ${selected === template.id ? "selected" : ""}" data-action="select-template" data-id="${template.id}" type="button">
              <strong>${template.name}</strong>
              <span>${template.headings.slice(0, 4).join(", ")}</span>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function applyTemplateToProject(project, templateId) {
  const template = projectTemplates.find((item) => item.id === templateId);
  if (!project || !template) return;
  project.templateId = template.id;
  project.splitType = template.splitType || "equal";
  project.defaultHeadings = template.headings || [];
  project.hasBudgetTarget = Boolean(template.hasBudgetTarget);
  project.hasGoalItems = Boolean(template.hasGoalItems);
  template.headings.forEach((name) => {
    const emoji = emojiForHeadingName(name);
    ensureHeading(name, name, emoji);
  });
}

function createProject(name, purpose = "Genel kasa", options = {}) {
  const project = {
    id: options.id || makeId(),
    name,
    purpose,
    code: options.code || generateProjectCode(name),
    createdAt: options.createdAt || blockNow(),
    createdBy: options.createdBy || currentUser()?.id || "",
    memberIds: options.memberIds || (currentUser()?.id ? [currentUser().id] : []),
    memberAliases: options.memberAliases || {},
    defaultCurrency: options.defaultCurrency || "TL",
    defaultHeadings: options.defaultHeadings || [],
    splitType: options.splitType || "equal",
    templateId: options.templateId || "",
    budgetLimits: options.budgetLimits || {},
    hasBudgetTarget: Boolean(options.hasBudgetTarget),
    hasGoalItems: Boolean(options.hasGoalItems),
  };
  state.projects.push(project);
  state.activeProjectId = project.id;
  draft = makeDraft();
  if (options.templateId) applyTemplateToProject(project, options.templateId);
  return project;
}

function emojiForHeadingName(name) {
  const normalized = normalize(name);
  const key = Object.keys(keywordEmojiMap).find((item) => normalized.includes(normalize(item)));
  if (key) return keywordEmojiMap[key];
  return draft?.emoji || "💰";
}

function headingAutocompleteHtml(typeId) {
  const headings = projectHeadings();
  const suggestions = headingSuggestionsFor(typeId);
  const combined = [...headings.map((heading) => ({ ...heading, source: "project" })), ...suggestions.map((item) => ({ ...item, source: "suggestion" }))];
  return `
    <div class="chips heading-matches" id="headingMatches">
      ${combined
        .slice(0, 10)
        .map((item) => `<button class="chip" data-suggestion="${item.name}" data-short="${item.shortName}" data-emoji="${item.emoji}" type="button">${item.emoji} ${item.shortName || item.name}</button>`)
        .join("")}
    </div>
  `;
}

function mediaHubHtml() {
  return `
    <div class="media-picker media-hub">
      <div>
        <span class="field-label">Medya</span>
        <p class="field-help">Emoji, GIF/sticker linki ve fotoğraf tek alanda. Fiş için aynı fotoğraf alanı kullanılabilir.</p>
      </div>
      <div class="media-grid">
        <input class="text-input" name="notificationEmoji" maxlength="4" value="${draft.notificationEmoji || "🎲"}" autocomplete="off" />
        <input class="text-input" name="notificationGif" placeholder="GIF / sticker linki veya kısa adı" value="${draft.notificationGif || ""}" autocomplete="off" />
        <label class="photo-pick compact-pick">
          <span>Fotoğraf / Fişten tara</span>
          <strong>Seç</strong>
          <input name="photo" type="file" accept="image/*" />
        </label>
      </div>
    </div>
  `;
}

function reactionSetupHtml() {
  return `
    <div class="media-picker">
      <span class="field-label">Tahmin sonucu tepkileri</span>
      <div class="reaction-grid">
        <div class="reaction-column">
          <strong>Doğru</strong>
          <input class="text-input" name="successReaction" value="${draft.successReaction || "✅"}" autocomplete="off" />
          <input class="text-input" name="successGif" placeholder="GIF / sticker linki" value="${draft.successGif || ""}" autocomplete="off" />
          <label class="photo-pick compact-pick"><span>Fotoğraf</span><strong>Seç</strong><input name="successPhoto" type="file" accept="image/*" /></label>
        </div>
        <div class="reaction-column">
          <strong>Yanlış</strong>
          <input class="text-input" name="failReaction" value="${draft.failReaction || "🙂"}" autocomplete="off" />
          <input class="text-input" name="failGif" placeholder="GIF / sticker linki" value="${draft.failGif || ""}" autocomplete="off" />
          <label class="photo-pick compact-pick"><span>Fotoğraf</span><strong>Seç</strong><input name="failPhoto" type="file" accept="image/*" /></label>
        </div>
      </div>
    </div>
  `;
}

function renderHome() {
  const project = activeProject();
  const user = currentUser();
  const totals = calculateTotals(blockRawEntries(project));
  const recent = actualEntries().slice(0, 4);
  const upcoming = pendingEntries().slice(0, 2);
  const notificationCount = notificationEntries().length;
  const surpriseCount = pendingSurpriseCount(project);

  return `
    <section class="account-strip">
      <div>
        <span class="field-label">Aktif kullanıcı</span>
        <strong>${projectUserLabel(user)}</strong>
      </div>
      <div class="account-actions">
        <button class="tiny-button" data-action="open-notifications" type="button">Bildirimler${notificationCount ? ` (${notificationCount})` : ""}</button>
        <button class="tiny-button" data-action="logout" type="button">Çıkış</button>
      </div>
    </section>

    <section class="hero">
      <div class="hero-row">
        <div>
          <p class="hero-title">${project.purpose}</p>
          <p class="hero-money">${money(totals.comfortable)}</p>
          <p class="hero-note">Rahat kalan: onaylı gelir - onaylı gider + beklenen - yaklaşan</p>
          ${surpriseCount ? `<p class="surprise-counter">${surpriseCount} bekleyen sürpriz var. Kasa etkisi oyun bitince açılır.</p>` : ""}
        </div>
        <span class="quick-pill">${totals.comfortable >= 0 ? "İyi" : "Dikkat"}</span>
      </div>
    </section>

    ${dailyWarningCards()}
    ${weeklySummaryCard()}
    ${monthlyComparisonCard()}
    ${reconciliationCards()}

    <section class="card">
      <div class="section-head">
        <div>
          <h2>${project.name}</h2>
          <p>${activeMembers().map((member) => projectUserLabel(member)).join(", ") || "Henüz üye yok"}</p>
        </div>
        <button class="tiny-button" data-action="open-group" type="button">Yönet</button>
      </div>
      <label style="display:block; margin-top: 12px;">
        <span class="field-label">Aktif proje</span>
        <select class="select-input" id="projectSelect">
          ${state.projects.map((item) => `<option value="${item.id}" ${item.id === state.activeProjectId ? "selected" : ""}>${item.name}</option>`).join("")}
        </select>
      </label>
    </section>

    <section class="quick-actions">
      <button class="action-button income" data-action="go-add-income" type="button"><span>💰</span>Gelir ekle</button>
      <button class="action-button expense" data-action="go-add-expense" type="button"><span>💸</span>Gider ekle</button>
    </section>

    <section class="grid-2">
      <article class="stat-card"><p class="stat-label">Giren</p><p class="stat-value positive">${money(totals.income)}</p></article>
      <article class="stat-card"><p class="stat-label">Çıkan</p><p class="stat-value warning">${money(totals.expense)}</p></article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="receivable"><p class="stat-label">Beklenen</p><p class="stat-value">${money(totals.receivable)}</p></article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="payable"><p class="stat-label">Yaklaşan</p><p class="stat-value">${money(totals.payable)}</p></article>
    </section>

    ${
      state.pendingDetail
        ? `<section class="card"><div class="section-head"><div><h2>${state.pendingDetail === "receivable" ? "Beklenen gelirler" : "Yaklaşan ödemeler"}</h2><p>Detay dökümü.</p></div><button class="tiny-button" data-action="hide-pending-detail" type="button">Kapat</button></div><div class="expense-list">${pendingDetailRows(state.pendingDetail)}</div></section>`
        : ""
    }

    <section class="card">
      <div class="section-head"><div><h2>Yaklaşanlar</h2><p>Ödeme hatırlatıcıları burada görünür.</p></div><button class="tiny-button" data-action="go-add-payable" type="button">Ekle</button></div>
      <div class="expense-list">${upcoming.length ? upcoming.map(pendingRow).join("") : `<div class="empty-state">Henüz beklenen alacak veya yaklaşan ödeme yok.</div>`}</div>
    </section>

    <section class="card">
      <div class="section-head"><div><h2>Son hareketler</h2><p>Son 4 hareket. Detay için tümünü aç.</p></div><button class="tiny-button" data-action="open-movements" type="button">Tümü</button></div>
      <div class="expense-list">${recent.length ? recent.map(entryRow).join("") : `<div class="empty-state">Kasa boş. İlk hareketi ekleyerek başlayalım.</div>`}</div>
    </section>
  `;
}

function renderAdd() {
  if ((state.addTab || "entry") === "statement") return renderStatementAdd();
  const type = entryTypes.find((item) => item.id === draft.type) || entryTypes[0];
  const amountValue = draft.amountInput || "";
  const dateLabel = { expense: "Gider tarihi", income: "Gelir tarihi", receivable: "Beklenen gelir tarihi", payable: "Beklenen ödeme tarihi" }[type.id];
  const headingLabel = type.id === "income" || type.id === "receivable" ? "Gelir başlığı" : "Gider başlığı";
  const headingPlaceholder = type.id === "income" || type.id === "receivable" ? "Örn. Maaş, ek iş, satış" : "Örn. Kira, HGS, market";
  const shortPlaceholder = type.id === "income" || type.id === "receivable" ? "Örn. maaş günü, yan gelir, tahsilat" : "Örn. haraç, yol yedi, ayın tokadı";
  const notePlaceholder = type.id === "income" || type.id === "receivable" ? "Örn. Haziran maaşı, prim dahil" : "Örn. kasada farklı çıktı, ortak ödeme";
  return `
    <section class="segmented">
      <button class="segment active" data-add-tab="entry" type="button">Hareket</button>
      <button class="segment" data-add-tab="statement" type="button">Ekstre</button>
      <button class="segment" data-action="open-headings" type="button">Başlık</button>
    </section>
    <form class="form-card form-grid" id="entryForm">
      <div class="section-head"><div><h2>${type.label} hareketi ekle</h2><p>${activeProject().name} içine kayıt düşer.</p></div></div>
      <div class="type-grid">${entryTypes.map((item) => `<button class="type-chip ${draft.type === item.id ? "selected" : ""}" data-entry-type="${item.id}" type="button"><span>${item.emoji}</span>${item.label}</button>`).join("")}</div>
      <input type="hidden" name="userId" value="${currentUser()?.id || ""}" />
      <div><label class="field-label" for="amount">Tutar</label><input class="amount-input" id="amount" name="amount" inputmode="numeric" placeholder="1.000" value="${amountValue}" autocomplete="off" /></div>
      <div class="grid-2 currency-grid ${draft.currency === "TRY" ? "single" : ""}">
        <label><span class="field-label">Para birimi</span><select class="select-input" name="currency">${currencyOptions.map((item) => `<option value="${item.code}" ${draft.currency === item.code ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>
        <label class="fx-rate-field ${draft.currency === "TRY" ? "is-hidden" : ""}"><span class="field-label">Kur</span><input class="select-input" name="exchangeRate" inputmode="decimal" placeholder="Örn. 32,5" value="${draft.exchangeRate || 1}" autocomplete="off" /></label>
      </div>
      <div class="grid-2 timing-grid ${type.id === "expense" ? "" : "single"}">
        <label><span class="field-label">${dateLabel}</span><input class="select-input" name="date" type="date" value="${draft.date || todayKey()}" /><span class="field-help">Her kayıt sonrası tarih tekrar bugüne döner.</span></label>
        ${
          type.id === "expense"
            ? `<label><span class="field-label">Hesaplaşma</span><select class="select-input" name="settlement"><option value="in" ${draft.settlement === "in" ? "selected" : ""}>Dahil</option><option value="out" ${draft.settlement === "out" ? "selected" : ""}>Dahil değil</option></select></label>`
            : `<input type="hidden" name="settlement" value="out" />`
        }
      </div>
      <div><label class="field-label" for="headingName">${headingLabel}</label><input class="text-input" id="headingName" name="headingName" placeholder="${headingPlaceholder}" autocomplete="off" />${headingAutocompleteHtml(type.id)}</div>
      <div><label class="field-label" for="shortName">Kısa isim / lakap</label><input class="text-input" id="shortName" name="shortName" placeholder="${shortPlaceholder}" autocomplete="off" /></div>
      <div><span class="field-label">Emoji</span><div class="chips">${emojiOptionsFor(type.id).map((emoji) => `<button class="emoji-chip ${draft.emoji === emoji ? "selected" : ""}" data-chip="emoji" data-value="${emoji}" type="button">${emoji}</button>`).join("")}</div></div>
      ${
        ["income", "expense"].includes(type.id)
          ? `<details class="soft-details"><summary>Bildirim oyunu</summary><div class="form-grid notification-options"><label><span class="field-label">Bildirim modu</span><select class="select-input" name="notificationMode"><option value="open" ${draft.notificationMode === "open" ? "selected" : ""}>Açık bildir</option><option value="surprise" ${draft.notificationMode === "surprise" ? "selected" : ""}>Sürpriz tahmin</option><option value="silent" ${draft.notificationMode === "silent" ? "selected" : ""}>Sessiz kaydet</option></select></label>${mediaHubHtml()}${reactionSetupHtml()}</div></details>`
          : `<input type="hidden" name="notificationMode" value="silent" />${mediaHubHtml()}`
      }
      <label><span class="field-label">Not (opsiyonel)</span><input class="text-input" name="note" placeholder="${notePlaceholder}" autocomplete="off" /><span class="field-help">Hesaba katılmaz; sadece hareket açıklaması olarak saklanır.</span></label>
      <button class="primary-button" type="submit">Kaydet</button>
    </form>
  `;
}

function renderStatementAdd() {
  return `
    <section class="segmented">
      <button class="segment" data-add-tab="entry" type="button">Hareket</button>
      <button class="segment active" data-add-tab="statement" type="button">Ekstre</button>
      <button class="segment" data-action="open-headings" type="button">Başlık</button>
    </section>
    <form class="form-card form-grid" id="statementForm">
      <div class="section-head"><div><h2>Ekstre uzlaşması</h2><p>CSV yükle, banka toplamı ile kasa toplamı karşılaştırılsın.</p></div></div>
      <label><span class="field-label">Banka</span><select class="select-input" name="bankName">${Object.entries(bankColumnMaps).map(([id, item]) => `<option value="${id}">${item.label}</option>`).join("")}</select></label>
      <label><span class="field-label">Ay</span><input class="select-input" name="month" type="month" value="${monthKey()}" /></label>
      <details class="soft-details">
        <summary>Diğer banka kolonları</summary>
        <div class="inline-form">
          <input class="text-input" name="dateCol" inputmode="numeric" placeholder="Tarih kolonu: 0" autocomplete="off" />
          <input class="text-input" name="descCol" inputmode="numeric" placeholder="Açıklama kolonu: 1" autocomplete="off" />
          <input class="text-input" name="amountCol" inputmode="numeric" placeholder="Tutar kolonu: 2" autocomplete="off" />
          <input class="text-input" name="delimiter" placeholder="Ayraç: ; veya ," autocomplete="off" />
        </div>
      </details>
      <label class="photo-pick"><span>CSV dosyası</span><strong>Seç</strong><input name="statementFile" type="file" accept=".csv,text/csv" /></label>
      <button class="primary-button" type="submit">Ekstreyi karşılaştır</button>
    </form>
  `;
}

function pendingRow(entry) {
  const isReceivable = entry.type === "receivable";
  const exchange = exchangeText(entry);
  return `
    <div class="expense-row">
      <span class="emoji-dot">${entry.emoji || (isReceivable ? "🤝" : "⏰")}</span>
      <div class="expense-main">
        <p class="expense-title">${entryTitle(entry)}</p>
        <p class="expense-meta">${isReceivable ? "Beklenen alacak" : "Yaklaşan ödeme"} · ${formatShortDate(entry.date)}${exchange ? ` · ${exchange}` : ""}</p>
        ${entry.note ? `<p class="expense-note">${entry.note}</p>` : ""}
      </div>
      <div style="display:grid; gap:6px; justify-items:end;">
        <strong class="expense-price">${money(entry.amount)}</strong>
        <button class="mini-action" data-action="settle-pending" data-id="${entry.id}" type="button">${isReceivable ? "Geldi" : "Ödendi"}</button>
      </div>
    </div>
  `;
}

function renderCalendar() {
  const tab = state.calendarTab || "calendar";
  const pending = pendingEntries();
  const actual = actualEntries().slice(0, 6);
  return `
    <section class="segmented">
      <button class="segment ${tab === "calendar" ? "active" : ""}" data-calendar-tab="calendar" type="button">Takvim</button>
      <button class="segment ${tab === "goals" ? "active" : ""}" data-calendar-tab="goals" type="button">Hedefler</button>
      <button class="segment" data-action="go-add-payable" type="button">Ekle</button>
    </section>
    ${
      tab === "goals"
        ? renderGoalSection()
        : `
          <section class="card">
            <div class="section-head"><div><h2>Takvim</h2><p>Beklenen alacaklar ve yaklaşan ödemeler.</p></div><button class="tiny-button" data-action="go-add-payable" type="button">Ekle</button></div>
            <div class="expense-list">${pending.length ? pending.map(pendingRow).join("") : `<div class="empty-state">Takvim boş.</div>`}</div>
          </section>
          <section class="card"><h2>Son tarihli kayıtlar</h2><div class="expense-list">${actual.length ? actual.map(entryRow).join("") : `<div class="empty-state">Gerçekleşmiş kayıt yok.</div>`}</div></section>
        `
    }
  `;
}

function weeklyChampions(entries) {
  const members = activeMembers();
  const spent = members.map((user) => ({
    user,
    total: sum(entries.filter((entry) => entry.type === "expense" && entry.userId === user.id)),
    guesses: Number(user.correctGuesses || 0),
  }));
  const saver = spent.slice().sort((a, b) => a.total - b.total)[0];
  const guesser = spent.slice().sort((a, b) => b.guesses - a.guesses)[0];
  return `
    <section class="card">
      <h2>Haftalık şampiyonlar</h2>
      <div class="expense-list">
        <div class="split-row"><strong>Tasarruf şampiyonu: ${projectUserLabel(saver?.user)}</strong><span>${money(saver?.total || 0)} harcadı</span></div>
        <div class="split-row"><strong>Sürpriz ustası: ${projectUserLabel(guesser?.user)}</strong><span>${guesser?.guesses || 0} doğru tahmin</span></div>
        <div class="split-row"><strong>En hareketli başlık</strong><span>${topHeading(entries)}</span></div>
      </div>
    </section>
  `;
}

function renderReport() {
  const period = state.reportPeriod || "month";
  const entries = actualEntries().filter((entry) => isInPeriod(entry.date, period));
  const totals = calculateTotals(entries);
  const label = periodLabel(period);
  const netClass = totals.actual >= 0 ? "positive" : "warning";
  return `
    <section class="segmented">${[["day", "Gün"], ["week", "Hafta"], ["month", "Ay"]].map(([value, labelText]) => `<button class="segment ${period === value ? "active" : ""}" data-period="${value}" type="button">${labelText}</button>`).join("")}</section>
    <section class="card">
      <div class="section-head"><div><h2>${label} raporu</h2><p>Giren ${money(totals.income)}, çıkan ${money(totals.expense)}, net ${money(totals.actual)}.</p></div><span class="quick-pill">${entries.length} kayıt</span></div>
      <div class="grid-2 compact-stats">
        <article class="stat-card small"><p class="stat-label">Giren</p><p class="stat-value positive">${money(totals.income)}</p></article>
        <article class="stat-card small"><p class="stat-label">Çıkan</p><p class="stat-value warning">${money(totals.expense)}</p></article>
        <article class="stat-card small"><p class="stat-label">Net</p><p class="stat-value ${netClass}">${money(totals.actual)}</p></article>
        <article class="stat-card small"><p class="stat-label">Ortalama</p><p class="stat-value">${money(entries.length ? totals.expense / entries.length : 0)}</p></article>
      </div>
      <div class="bars" style="margin-top:16px;">${headingBars(entries)}</div>
    </section>
    ${period === "week" ? weeklyChampions(entries) : ""}
    ${reconciliationCards()}
    <section class="card"><div class="section-head"><div><h2>Rapor detayı</h2><p>Bu dönemde görünen gelir ve giderler.</p></div></div><div class="expense-list">${entries.length ? entries.map(movementEntryRow).join("") : `<div class="empty-state">Bu dönem için raporlanacak hareket yok.</div>`}</div></section>
    <section class="receipt-card" id="receiptCard">
      <h2 class="receipt-title">KASA FİŞİ</h2>
      <div class="receipt-line"><span>Tarih</span><strong>${new Date().toLocaleDateString("tr-TR")} ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</strong></div>
      <div class="receipt-line"><span>Proje</span><strong>${activeProject().name}</strong></div>
      <div class="receipt-line"><span>${label} giren</span><strong>${money(totals.income)}</strong></div>
      <div class="receipt-line"><span>${label} çıkan</span><strong>${money(totals.expense)}</strong></div>
      <div class="receipt-line"><span>Net</span><strong>${money(totals.actual)}</strong></div>
      ${exchangeReceiptLines(entries)}
      <div class="receipt-line"><span>En hareketli başlık</span><strong>${topHeading(entries)}</strong></div>
      <p class="receipt-watermark">kasa.app</p>
      <button class="share-button" data-action="share-receipt" type="button">Fişi paylaş</button>
    </section>
  `;
}

function renderGroup() {
  const project = activeProject();
  const balances = calculateBalances();
  const transfers = minimumTransfers(balances);
  const canManageUsers = isProjectOwner(project);
  const owner = projectOwner(project);
  const user = currentUser();
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();
  return `
    <section class="card">
      <div class="section-head"><div><h2>Projelerim</h2><p>Proje seç, üyeleri bağla, gelir/gider senaryosunu kur.</p></div></div>
      <div class="quick-actions compact"><button class="action-button income" data-action="go-add-income" type="button"><span>💰</span>Gelir ekle</button><button class="action-button expense" data-action="go-add-expense" type="button"><span>💸</span>Gider ekle</button></div>
      <div class="expense-list" style="margin-top:12px;">${state.projects.map(projectRow).join("")}</div>
      <form class="inline-form" id="projectForm">
        <input class="text-input" name="projectName" placeholder="Yeni proje adı" autocomplete="off" />
        <input class="text-input" name="purpose" list="purposeList" placeholder="Kasa amacı: Ev, iş, araç..." autocomplete="off" />
        <datalist id="purposeList">${purposeOptions.map((purpose) => `<option value="${purpose}"></option>`).join("")}</datalist>
        <span class="field-label">Şablondan başla</span>
        ${templateOptionsHtml(state.selectedTemplateId)}
        <button class="primary-button" type="submit">Proje ekle</button>
      </form>
      ${cloudReady ? `<form class="inline-form cloud-join-card" id="joinProjectForm"><input class="text-input" name="projectCode" placeholder="Kasa kodu: KASA-EVK-1234" autocomplete="off" /><button class="secondary-button" type="submit">Kodla katıl</button></form>` : ""}
    </section>
    <section class="card">
      <h2>Profil ayarları</h2>
      <label><span class="field-label">Onay modu</span><select class="select-input" id="onayModeSelect">${Object.entries(personalityModes).map(([id, item]) => `<option value="${id}" ${currentUser()?.onayModu === id ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>
      <p>Skor: ${currentUser()?.totalScore || 0} · Doğru: ${currentUser()?.correctGuesses || 0}/${currentUser()?.totalGuesses || 0}</p>
    </section>
    <section class="card">
      <h2>Projeye kişi ekle</h2>
      <p>${canManageUsers ? (cloudReady ? `Diğer kişi e-posta ile hesap açtıktan sonra e-postasını buraya yaz.` : `Önce diğer profili oluştur. Sonra adını buraya yaz.`) : `Kullanıcı eklemek için ${projectUserLabel(owner)} hesabıyla giriş yap.`}</p>
      ${
        canManageUsers
          ? `<form class="inline-form featured-form" id="projectUserForm"><input class="text-input" name="userName" placeholder="${cloudReady ? "havva@mail.com" : "Örn. Havva veya Derya"}" autocomplete="${cloudReady ? "email" : "off"}" /><button class="primary-button" type="submit">Kasaya ekle</button></form>`
          : `<div class="inline-form featured-form"><button class="secondary-button" data-action="logout" type="button">Çıkış yap</button><span class="field-help">Sonra kasa sahibi profiliyle tekrar giriş yap.</span></div>`
      }
    </section>
    <section class="card">
      <div class="section-head"><div><h2>Proje erişimi</h2><p>${cloudReady ? "Bu kodu başka telefondaki kullanıcı girerse aynı kasaya katılır." : "Yerel denemede kullanıcılar bu cihazda tutulur."}</p></div></div>
      <div class="invite-box"><div><span class="field-label">Kod</span><strong>${projectCode(project)}</strong><p>${inviteLink(project)}</p></div><button class="mini-action" data-action="copy-project-link" type="button">Kopyala</button></div>
    </section>
    <section class="card">
      <h2>Kasa kullanıcıları</h2>
      <div class="expense-list" style="margin-top:12px;">${state.users.map(userLinkRow).join("")}</div>
      ${canManageUsers ? `<form class="inline-form" id="userForm"><input class="text-input" name="userName" placeholder="${cloudReady ? "E-posta: havva@mail.com" : "Kullanıcı adı: Havva"}" autocomplete="${cloudReady ? "email" : "off"}" /><button class="primary-button" type="submit">Kasaya ekle</button></form>` : `<div class="empty-state" style="margin-top:12px;">Kullanıcı eklemek için kasa sahibi hesabıyla giriş yap.</div>`}
    </section>
    <section class="card">
      <div class="section-head"><div><h2>Borç & alacak</h2><p>${state.settlementVisible ? "Minimum transfer listesi görünür." : "Şu an gizli."}</p></div><button class="tiny-button" data-action="toggle-settlement" type="button">${state.settlementVisible ? "Gizle" : "Göster"}</button></div>
      ${
        state.settlementVisible
          ? `<div style="margin-top:10px;">${balances.length ? balances.map(balanceRow).join("") : `<div class="empty-state">Hesaplaşmaya dahil gider yok.</div>`}</div><div style="margin-top:12px;">${transferRows(transfers)}</div>`
          : `<div class="empty-state" style="margin-top:12px;">Açınca kim kime ne kadar göndermeli görünür.</div>`
      }
    </section>
  `;
}

function renderProjectSetup() {
  const user = currentUser();
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();
  return `
    <section class="form-card form-grid onboarding-card">
      <div><p class="eyebrow">Kasa kurulumu</p><h2>${profileLabel(user)}, şimdi kasa seç</h2><p class="hero-note">${cloudReady ? "Hesabın hazır. İlk kasanı oluştur veya kodla katıl." : "Deneme sürümünde önce kendi kasanı kur."}</p></div>
      <form class="form-grid" id="firstProjectForm">
        <label><span class="field-label">Kasa / proje adı</span><input class="text-input" name="projectName" placeholder="Örn. Ev Kasası" autocomplete="off" /></label>
        <label><span class="field-label">Amaç</span><input class="text-input" name="purpose" list="purposeList" placeholder="Ev, iş, ev arkadaşlığı..." autocomplete="off" /></label>
        <datalist id="purposeList">${purposeOptions.map((purpose) => `<option value="${purpose}"></option>`).join("")}</datalist>
        <span class="field-label">Şablondan başla</span>
        ${templateOptionsHtml(state.selectedTemplateId)}
        <button class="primary-button" type="submit">Kasa oluştur</button>
      </form>
      ${cloudReady ? `<form class="form-grid" id="joinProjectForm"><input class="text-input" name="projectCode" placeholder="Kasa kodu" autocomplete="off" /><button class="secondary-button" type="submit">Kodla katıl</button></form>` : ""}
    </section>
  `;
}

function exchangeText(entry) {
  const currency = entry.currency || "TRY";
  if (currency === "TRY") return "";
  const locked = entry.rateLockedAt ? ` (kilitlendi: ${new Date(entry.rateLockedAt).toLocaleDateString("tr-TR")})` : "";
  return `Kur: ${formatCurrencyAmount(entry.enteredAmount || entry.amount, currency)} × ${formatRate(entry.exchangeRate || 1)} = ${money(entry.amount)}${locked}`;
}

function exchangeReceiptLines(entries) {
  const foreignEntries = entries.filter((entry) => entry.currency && entry.currency !== "TRY");
  if (!foreignEntries.length) return "";
  return foreignEntries.slice(0, 3).map((entry) => `<div class="receipt-line exchange-line"><span>Döviz notu</span><strong>${exchangeText(entry)}</strong></div>`).join("");
}

async function shareReceipt() {
  const card = document.querySelector("#receiptCard");
  const text = card?.innerText || "KASA FİŞİ";
  try {
    if (window.html2canvas && card) {
      const canvas = await window.html2canvas(card, { backgroundColor: "#fffaf1", scale: 2 });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob && navigator.canShare) {
        const file = new File([blob], "kasa-fisi.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: "Kasa Fişi", text: "Kasa fişi", files: [file] });
          return;
        }
      }
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "kasa-fisi.png";
      link.click();
      return toast("Fiş görseli indirildi.");
    }
    if (navigator.share) await navigator.share({ title: "Kasa Fişi", text });
    else {
      await navigator.clipboard.writeText(text);
      toast("Fiş metni kopyalandı.");
    }
  } catch {
    toast("Paylaşım iptal edildi.");
  }
}

function parseCsvRows(text, map) {
  const delimiter = map.delimiter || ";";
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(delimiter).map((cell) => cell.replace(/^"|"$/g, "").trim()))
    .map((cells) => ({
      date: cells[map.dateCol] || "",
      description: cells[map.descCol] || "",
      amount: parseAmount(cells[map.amountCol] || 0),
    }))
    .filter((row) => row.description || row.amount);
}

function addReconciliation({ bankId, month, rows }) {
  const map = bankColumnMaps[bankId] || bankColumnMaps.other;
  const statementTotal = rows.reduce((total, row) => total + Number(row.amount || 0), 0);
  const kasaTotal = sum(blockConfirmedEntries().filter((entry) => entry.type === "expense" && entryMonth(entry) === month));
  const diff = statementTotal - kasaTotal;
  state.reconciliations = state.reconciliations || [];
  state.reconciliations.push({
    id: makeId(),
    projectId: activeProject()?.id || "",
    userId: currentUser()?.id || "",
    month,
    bankName: map.label,
    uploadedAt: blockNow(),
    statementTotal,
    kasaTotal,
    diff,
    status: Math.abs(diff) < 1 ? "matched" : "unmatched",
    rawRows: rows,
  });
}

async function applyCloudUser(authUser, profileInput = {}) {
  if (!authUser?.id) return null;
  const metadata = authUser.user_metadata || {};
  const email = String(authUser.email || profileInput.email || "").trim().toLowerCase();
  const fallbackName = email ? email.split("@")[0] : "Kullanıcı";
  const name = String(profileInput.name || metadata.name || metadata.full_name || fallbackName).trim();
  const nickname = String(profileInput.nickname || metadata.nickname || shortName(name)).trim();
  const existing = state.users.find((user) => user.id === authUser.id || normalize(user.email) === normalize(email));
  const user = {
    id: authUser.id,
    name,
    nickname,
    email,
    password: "",
    onayModu: existing?.onayModu || "standart",
    totalScore: Number(existing?.totalScore || 0),
    correctGuesses: Number(existing?.correctGuesses || 0),
    totalGuesses: Number(existing?.totalGuesses || 0),
    createdAt: existing?.createdAt || blockNow(),
    createdBy: existing?.createdBy || "",
  };
  if (existing) Object.assign(existing, user);
  else state.users.push(user);
  state.signedInUserId = authUser.id;
  state.activeUserId = authUser.id;
  state.pendingLoginUserId = authUser.id;
  state.pendingLoginEmail = email;
  state.cloudUserId = authUser.id;
  if (isCloudReady()) {
    const { error } = await cloudDb().from("kasa_profiles").upsert(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        onay_modu: user.onayModu,
        total_score: user.totalScore,
        correct_guesses: user.correctGuesses,
        total_guesses: user.totalGuesses,
        updated_at: blockNow(),
      },
      { onConflict: "id" },
    );
    if (error) setCloudStatus(friendlyCloudError(error));
  }
  return user;
}

function cloudMapProject(project, members) {
  const projectMembers = members.filter((member) => member.project_id === project.id);
  return {
    id: project.id,
    name: project.name,
    purpose: project.purpose || "Genel kasa",
    code: project.code,
    createdAt: project.created_at,
    createdBy: project.created_by,
    memberIds: projectMembers.map((member) => member.user_id),
    memberAliases: Object.fromEntries(projectMembers.filter((member) => member.alias).map((member) => [member.user_id, member.alias])),
    defaultCurrency: project.default_currency || "TL",
    defaultHeadings: project.default_headings || [],
    splitType: project.split_type || "equal",
    templateId: project.template_id || "",
    budgetLimits: project.budget_limits || {},
    hasBudgetTarget: Boolean(project.has_budget_target),
    hasGoalItems: Boolean(project.has_goal_items),
  };
}

async function safeCloudTable(name, queryFactory) {
  const result = await queryFactory();
  if (result.error) {
    setCloudStatus(friendlyCloudError(result.error));
    return [];
  }
  return result.data || [];
}

async function loadCloudData() {
  if (!isCloudReady() || !state.signedInUserId) return;
  const client = cloudDb();
  cloudSyncPaused = true;
  try {
    const { data: projects, error: projectError } = await client.from("kasa_projects").select("*").order("created_at", { ascending: true });
    if (projectError) throw projectError;
    const projectIds = (projects || []).map((project) => project.id);
    let members = [];
    let profiles = [];
    let headings = [];
    let entries = [];
    let notifications = [];
    let reactions = [];
    let reconciliations = [];
    let goals = [];
    let settlements = [];
    if (projectIds.length) {
      const [memberResult, headingResult, entryResult, notificationResult, reactionResult, reconciliationResult, goalResult, settlementResult] = await Promise.all([
        client.from("kasa_project_members").select("*").in("project_id", projectIds),
        client.from("kasa_headings").select("*").in("project_id", projectIds),
        client.from("kasa_entries").select("*").in("project_id", projectIds),
        client.from("kasa_notifications").select("*").in("project_id", projectIds),
        client.from("kasa_reactions").select("*").in("project_id", projectIds),
        client.from("kasa_reconciliations").select("*").in("project_id", projectIds),
        client.from("kasa_goals").select("*").in("project_id", projectIds),
        client.from("kasa_settlements").select("*").in("project_id", projectIds),
      ]);
      if (memberResult.error) throw memberResult.error;
      if (headingResult.error) throw headingResult.error;
      if (entryResult.error) throw entryResult.error;
      if (notificationResult.error) throw notificationResult.error;
      members = memberResult.data || [];
      headings = headingResult.data || [];
      entries = entryResult.data || [];
      notifications = notificationResult.data || [];
      reactions = reactionResult.error ? [] : reactionResult.data || [];
      reconciliations = reconciliationResult.error ? [] : reconciliationResult.data || [];
      goals = goalResult.error ? [] : goalResult.data || [];
      settlements = settlementResult.error ? [] : settlementResult.data || [];
      const userIds = [...new Set([state.signedInUserId, ...members.map((member) => member.user_id)].filter(Boolean))];
      if (userIds.length) {
        const profileResult = await client.from("kasa_profiles").select("*").in("id", userIds);
        if (profileResult.error) throw profileResult.error;
        profiles = profileResult.data || [];
      }
    }
    const current = currentUser();
    state.users = profiles.map((profile) => ({
      id: profile.id,
      name: profile.name || profile.email || "Kullanıcı",
      nickname: profile.nickname || shortName(profile.name || profile.email || ""),
      email: profile.email || "",
      password: "",
      onayModu: profile.onay_modu || "standart",
      totalScore: Number(profile.total_score || 0),
      correctGuesses: Number(profile.correct_guesses || 0),
      totalGuesses: Number(profile.total_guesses || 0),
      createdAt: profile.created_at || blockNow(),
      createdBy: "",
    }));
    if (current && !state.users.some((user) => user.id === current.id)) state.users.push(current);
    state.projects = (projects || []).map((project) => cloudMapProject(project, members));
    state.headings = headings.map((heading) => ({ id: heading.id, projectId: heading.project_id, name: heading.name, shortName: heading.short_name, emoji: heading.emoji }));
    state.entries = entries.map((entry) => ({
      id: entry.id,
      projectId: entry.project_id,
      type: entry.type,
      amount: Number(entry.amount || 0),
      enteredAmount: Number(entry.entered_amount || entry.amount || 0),
      currency: entry.currency || "TRY",
      exchangeRate: Number(entry.exchange_rate || 1),
      headingId: entry.heading_id,
      shortName: entry.short_name,
      emoji: entry.emoji,
      userId: entry.user_id,
      date: entry.entry_date,
      note: entry.note || "",
      photoName: entry.photo_name || "",
      photoData: entry.photo_data || "",
      lockedNotificationId: entry.locked_notification_id || "",
      autoRevealAt: entry.auto_reveal_at || "",
      rateLockedAt: entry.rate_locked_at || entry.created_at,
      paidById: entry.paid_by_id || entry.user_id,
      splitWith: entry.split_with || [],
      splitRatio: entry.split_ratio || [],
      ocrRawText: entry.ocr_raw_text || null,
      ocrParsedAmount: entry.ocr_parsed_amount ?? null,
      settlement: Boolean(entry.settlement),
      status: entry.status,
      createdAt: entry.created_at,
    }));
    state.notifications = notifications.map((notification) => ({
      id: notification.id,
      projectId: notification.project_id,
      entryId: notification.entry_id,
      actorId: notification.actor_id,
      recipients: notification.recipients || [],
      mode: notification.mode,
      actualType: notification.actual_type,
      title: notification.title,
      amount: Number(notification.amount || 0),
      emoji: notification.emoji,
      photoName: notification.photo_name || "",
      photoData: notification.photo_data || "",
      gif: notification.gif || "",
      successReaction: notification.success_reaction || "✅",
      successPhotoName: notification.success_photo_name || "",
      successPhotoData: notification.success_photo_data || "",
      successGif: notification.success_gif || "",
      failReaction: notification.fail_reaction || "🙂",
      failPhotoName: notification.fail_photo_name || "",
      failPhotoData: notification.fail_photo_data || "",
      failGif: notification.fail_gif || "",
      guessDeadline: notification.guess_deadline || "",
      revealedAt: notification.revealed_at || "",
      isCompleted: Boolean(notification.is_completed),
      notificationType: notification.notification_type || "entry",
      reactionEmoji: notification.reaction_emoji || "",
      guesses: Array.isArray(notification.guesses) ? notification.guesses : [],
      createdAt: notification.created_at,
    }));
    state.reactions = reactions.map((item) => ({ id: item.id, entryId: item.entry_id, projectId: item.project_id, userId: item.user_id, emoji: item.emoji, createdAt: item.created_at }));
    state.reconciliations = reconciliations.map((item) => ({ id: item.id, projectId: item.project_id, userId: item.user_id, month: item.month, bankName: item.bank_name, uploadedAt: item.uploaded_at, statementTotal: Number(item.statement_total || 0), kasaTotal: Number(item.kasa_total || 0), diff: Number(item.diff || 0), status: item.status, rawRows: item.raw_rows || [] }));
    state.goals = goals.map((item) => ({ id: item.id, projectId: item.project_id, createdBy: item.created_by, title: item.title, targetAmount: Number(item.target_amount || 0), currentAmount: Number(item.current_amount || 0), deadline: item.deadline || "", items: item.items || [], status: item.status, createdAt: item.created_at }));
    state.settlements = settlements.map((item) => ({ id: item.id, projectId: item.project_id, fromUserId: item.from_user_id, toUserId: item.to_user_id, amount: Number(item.amount || 0), settledAt: item.settled_at, note: item.note || "" }));
    state.activeProjectId = state.projects.some((project) => project.id === state.activeProjectId) ? state.activeProjectId : state.projects[0]?.id || "";
    state.activeUserId = state.signedInUserId;
    state.cloudSyncAt = blockNow();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    setCloudStatus(friendlyCloudError(error));
    throw error;
  } finally {
    cloudSyncPaused = false;
  }
}

async function cloudPushState() {
  if (!isCloudReady() || cloudSyncBusy || cloudSyncPaused || !state?.signedInUserId) return;
  const client = cloudDb();
  const user = currentUser();
  if (!user) return;
  cloudSyncBusy = true;
  try {
    const profileResult = await client.from("kasa_profiles").upsert(
      {
        id: user.id,
        email: user.email || "",
        name: user.name,
        nickname: user.nickname || "",
        onay_modu: user.onayModu || "standart",
        total_score: Number(user.totalScore || 0),
        correct_guesses: Number(user.correctGuesses || 0),
        total_guesses: Number(user.totalGuesses || 0),
        updated_at: blockNow(),
      },
      { onConflict: "id" },
    );
    if (profileResult.error) throw profileResult.error;
    const ownedProjects = state.projects.filter((project) => project.createdBy === user.id);
    if (ownedProjects.length) {
      const { error } = await client.from("kasa_projects").upsert(
        ownedProjects.map((project) => ({
          id: project.id,
          name: project.name,
          purpose: project.purpose,
          code: projectCode(project),
          created_by: project.createdBy,
          default_currency: project.defaultCurrency || "TL",
          default_headings: project.defaultHeadings || [],
          split_type: project.splitType || "equal",
          template_id: project.templateId || "",
          budget_limits: project.budgetLimits || {},
          has_budget_target: Boolean(project.hasBudgetTarget),
          has_goal_items: Boolean(project.hasGoalItems),
          created_at: project.createdAt || blockNow(),
          updated_at: blockNow(),
        })),
        { onConflict: "id" },
      );
      if (error) throw error;
    }
    const membershipRows = ownedProjects.flatMap((project) => project.memberIds.map((userId) => ({ project_id: project.id, user_id: userId, role: userId === project.createdBy ? "owner" : "member", alias: project.memberAliases?.[userId] || "" })));
    if (membershipRows.length) {
      const { error } = await client.from("kasa_project_members").upsert(membershipRows, { onConflict: "project_id,user_id" });
      if (error) throw error;
    }
    const projectIds = state.projects.map((project) => project.id);
    const headingRows = state.headings.filter((heading) => projectIds.includes(heading.projectId)).map((heading) => ({ id: heading.id, project_id: heading.projectId, name: heading.name, short_name: heading.shortName, emoji: heading.emoji }));
    if (headingRows.length) {
      const { error } = await client.from("kasa_headings").upsert(headingRows, { onConflict: "id" });
      if (error) throw error;
    }
    const entryRows = state.entries
      .filter((entry) => entry.userId === user.id)
      .map((entry) => ({
        id: entry.id,
        project_id: entry.projectId,
        user_id: entry.userId,
        type: entry.type,
        amount: entry.amount,
        entered_amount: entry.enteredAmount || entry.amount,
        currency: entry.currency || "TRY",
        exchange_rate: entry.exchangeRate || 1,
        heading_id: entry.headingId || null,
        short_name: entry.shortName || entryTitle(entry),
        emoji: entry.emoji,
        entry_date: entry.date,
        note: entry.note || "",
        photo_name: entry.photoName || "",
        photo_data: entry.photoData || "",
        locked_notification_id: entry.lockedNotificationId || null,
        auto_reveal_at: entry.autoRevealAt || null,
        rate_locked_at: entry.rateLockedAt || entry.createdAt || blockNow(),
        paid_by_id: entry.paidById || entry.userId,
        split_with: entry.splitWith || [],
        split_ratio: entry.splitRatio || [],
        ocr_raw_text: entry.ocrRawText || null,
        ocr_parsed_amount: entry.ocrParsedAmount ?? null,
        settlement: Boolean(entry.settlement),
        status: entry.status,
        created_at: entry.createdAt || blockNow(),
      }));
    if (entryRows.length) {
      const { error } = await client.from("kasa_entries").upsert(entryRows, { onConflict: "id" });
      if (error) throw error;
    }
    const notificationRows = (state.notifications || [])
      .filter((notification) => notification.actorId === user.id || notification.recipients?.includes(user.id))
      .map((notification) => ({
        id: notification.id,
        project_id: notification.projectId,
        entry_id: notification.entryId,
        actor_id: notification.actorId,
        recipients: notification.recipients || [],
        mode: notification.mode,
        actual_type: notification.actualType || "expense",
        title: notification.title || "",
        amount: notification.amount || 0,
        emoji: notification.emoji || "",
        photo_name: notification.photoName || "",
        photo_data: notification.photoData || "",
        gif: notification.gif || "",
        success_reaction: notification.successReaction || "✅",
        success_photo_name: notification.successPhotoName || "",
        success_photo_data: notification.successPhotoData || "",
        success_gif: notification.successGif || "",
        fail_reaction: notification.failReaction || "🙂",
        fail_photo_name: notification.failPhotoName || "",
        fail_photo_data: notification.failPhotoData || "",
        fail_gif: notification.failGif || "",
        guess_deadline: notification.guessDeadline || null,
        revealed_at: notification.revealedAt || null,
        is_completed: Boolean(notification.isCompleted),
        notification_type: notification.notificationType || "entry",
        reaction_emoji: notification.reactionEmoji || "",
        guesses: notification.guesses || [],
        created_at: notification.createdAt || blockNow(),
      }));
    if (notificationRows.length) {
      const { error } = await client.from("kasa_notifications").upsert(notificationRows, { onConflict: "id" });
      if (error) throw error;
    }
    const reactionRows = (state.reactions || []).filter((reaction) => reaction.userId === user.id).map((reaction) => ({ id: reaction.id, entry_id: reaction.entryId, project_id: reaction.projectId, user_id: reaction.userId, emoji: reaction.emoji, created_at: reaction.createdAt || blockNow() }));
    if (reactionRows.length) await client.from("kasa_reactions").upsert(reactionRows, { onConflict: "id" });
    const reconciliationRows = (state.reconciliations || []).filter((item) => item.userId === user.id).map((item) => ({ id: item.id, project_id: item.projectId, user_id: item.userId, month: item.month, bank_name: item.bankName, uploaded_at: item.uploadedAt || blockNow(), statement_total: item.statementTotal, kasa_total: item.kasaTotal, diff: item.diff, status: item.status, raw_rows: item.rawRows || [] }));
    if (reconciliationRows.length) await client.from("kasa_reconciliations").upsert(reconciliationRows, { onConflict: "id" });
    const goalRows = (state.goals || []).filter((goal) => goal.createdBy === user.id).map((goal) => ({ id: goal.id, project_id: goal.projectId, created_by: goal.createdBy, title: goal.title, target_amount: goal.targetAmount, current_amount: goalCurrentAmount(goal), deadline: goal.deadline || null, items: goal.items || [], status: goal.status, created_at: goal.createdAt || blockNow() }));
    if (goalRows.length) await client.from("kasa_goals").upsert(goalRows, { onConflict: "id" });
    const settlementRows = (state.settlements || []).map((settlement) => ({ id: settlement.id, project_id: settlement.projectId, from_user_id: settlement.fromUserId, to_user_id: settlement.toUserId, amount: settlement.amount, settled_at: settlement.settledAt || blockNow(), note: settlement.note || "" }));
    if (settlementRows.length) await client.from("kasa_settlements").upsert(settlementRows, { onConflict: "id" });
    state.cloudSyncAt = blockNow();
    setCloudStatus("Bulut senkron");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } finally {
    cloudSyncBusy = false;
  }
}

function bindScreen() {
  app.querySelectorAll("[data-action='go-back']").forEach((button) => button.addEventListener("click", () => { state.activeView = "home"; saveState(); render(); }));
  app.querySelectorAll("[data-action='open-group']").forEach((button) => button.addEventListener("click", () => { state.activeView = "group"; saveState(); render(); }));
  app.querySelectorAll("[data-action='open-notifications']").forEach((button) => button.addEventListener("click", () => { state.activeView = "notifications"; saveState(); render(); }));
  app.querySelectorAll("[data-action='open-movements']").forEach((button) => button.addEventListener("click", () => { state.activeView = "movements"; saveState(); render(); }));
  app.querySelectorAll("[data-action='open-headings']").forEach((button) => button.addEventListener("click", () => { state.activeView = "headings"; saveState(); render(); }));
  app.querySelectorAll("[data-add-tab]").forEach((button) => button.addEventListener("click", () => { state.addTab = button.dataset.addTab; saveState(); render(); }));
  app.querySelectorAll("[data-calendar-tab]").forEach((button) => button.addEventListener("click", () => { state.calendarTab = button.dataset.calendarTab; saveState(); render(); }));
  app.querySelectorAll("[data-action='select-template']").forEach((button) => button.addEventListener("click", () => {
    state.selectedTemplateId = state.selectedTemplateId === button.dataset.id ? "" : button.dataset.id;
    button.closest(".template-grid")?.querySelectorAll(".template-card").forEach((card) => card.classList.toggle("selected", card.dataset.id === state.selectedTemplateId));
    saveState();
  }));
  app.querySelectorAll("[data-action='go-add'], [data-action='go-add-expense']").forEach((button) => button.addEventListener("click", () => { draft.type = "expense"; draft.emoji = "💸"; draft.userId = currentUser()?.id || ""; draft.date = todayKey(); draft.amountInput = ""; state.addTab = "entry"; state.activeView = "add"; saveState(); render(); }));
  app.querySelectorAll("[data-action='go-add-income']").forEach((button) => button.addEventListener("click", () => { draft.type = "income"; draft.emoji = "💰"; draft.userId = currentUser()?.id || ""; draft.date = todayKey(); draft.amountInput = ""; state.addTab = "entry"; state.activeView = "add"; saveState(); render(); }));
  app.querySelectorAll("[data-action='go-add-payable']").forEach((button) => button.addEventListener("click", () => { draft.type = "payable"; draft.emoji = "⏰"; draft.userId = currentUser()?.id || ""; draft.date = todayKey(); draft.amountInput = ""; state.addTab = "entry"; state.activeView = "add"; saveState(); render(); }));
  app.querySelectorAll("[data-action='toggle-settlement']").forEach((button) => button.addEventListener("click", () => { state.settlementVisible = !state.settlementVisible; saveState(); render(); }));
  app.querySelectorAll("[data-action='show-pending-detail']").forEach((button) => button.addEventListener("click", () => { state.pendingDetail = button.dataset.detail; saveState(); render(); }));
  app.querySelectorAll("[data-action='hide-pending-detail']").forEach((button) => button.addEventListener("click", () => { state.pendingDetail = ""; saveState(); render(); }));
  app.querySelectorAll("[data-action='activate-project']").forEach((button) => button.addEventListener("click", () => { state.activeProjectId = button.dataset.id; draft = makeDraft(); saveState(); render(); }));
  app.querySelectorAll("[data-action='toggle-user-project']").forEach((button) => button.addEventListener("click", () => { toggleUserInProject(button.dataset.id); saveState(); render(); }));
  app.querySelectorAll("[data-action='copy-project-link']").forEach((button) => button.addEventListener("click", () => copyProjectInvite()));
  app.querySelectorAll("[data-action='logout']").forEach((button) => button.addEventListener("click", async () => {
    try { if (typeof isCloudReady === "function" && isCloudReady()) await cloudSignOut(); } catch (error) { toast(friendlyCloudError(error)); }
    state.signedInUserId = ""; state.activeUserId = ""; state.activeView = "home"; state.authMode = "login"; draft = makeDraft(); saveState(); render(); toast("Çıkış yapıldı.");
  }));
  app.querySelectorAll("[data-action='auth-mode']").forEach((button) => button.addEventListener("click", () => { state.authMode = button.dataset.mode === "signup" ? "signup" : "login"; saveState(); render(); }));
  app.querySelectorAll("[data-action='share-receipt']").forEach((button) => button.addEventListener("click", shareReceipt));
  app.querySelectorAll("[data-action='settle-pending']").forEach((button) => button.addEventListener("click", () => settlePending(button.dataset.id)));
  app.querySelectorAll("[data-period]").forEach((button) => button.addEventListener("click", () => { state.reportPeriod = button.dataset.period; saveState(); render(); }));
  app.querySelectorAll("[data-movement-period]").forEach((button) => button.addEventListener("click", () => { state.movementPeriod = button.dataset.movementPeriod; saveState(); render(); }));
  app.querySelectorAll("[data-action='toggle-reaction-picker']").forEach((button) => button.addEventListener("click", () => { state.reactionPickerEntryId = state.reactionPickerEntryId === button.dataset.id ? "" : button.dataset.id; saveState(); render(); }));
  app.querySelectorAll("[data-action='set-reaction']").forEach((button) => button.addEventListener("click", () => { setReaction(button.dataset.id, button.dataset.emoji); state.reactionPickerEntryId = ""; saveState(); render(); toast("Tepki eklendi."); }));
  app.querySelectorAll("[data-custom-reaction]").forEach((form) => form.addEventListener("submit", (event) => { event.preventDefault(); const emoji = String(new FormData(form).get("emoji") || "").trim(); setReaction(form.dataset.id, emoji); state.reactionPickerEntryId = ""; saveState(); render(); }));
  app.querySelectorAll("[data-action='show-reconciliation']").forEach((button) => button.addEventListener("click", () => { state.reconciliationDetailId = state.reconciliationDetailId === button.dataset.id ? "" : button.dataset.id; saveState(); render(); }));
  app.querySelectorAll("[data-action='settle-transfer']").forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.index);
    const transfers = minimumTransfers(calculateBalances());
    const addToKasa = Boolean(app.querySelector(`[data-cash-transfer="${index}"]`)?.checked);
    settleTransfer(transfers[index], addToKasa);
    saveState();
    render();
    toast(addToKasa ? "Ödendi ve kasaya işlendi." : "Ödendi işaretlendi.");
  }));
  app.querySelectorAll("[data-guess-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitter = event.submitter;
    const data = new FormData(form);
    const predictedType = submitter?.value || String(data.get("predictedType") || "");
    const predictedAmount = parseAmount(data.get("predictedAmount"));
    const result = guessNotification(form.dataset.id, { predictedType, predictedAmount: predictedAmount || null });
    if (result.status === "already") return toast("Bu sürprizi zaten tahmin ettin.");
    saveState();
    render();
    toast(result.guess?.isCorrect ? "Kestirdin. +10 puan" : "Tahmin kaydedildi.");
  }));
  const onaySelect = app.querySelector("#onayModeSelect");
  if (onaySelect) onaySelect.addEventListener("change", () => { const user = currentUser(); if (user) user.onayModu = onaySelect.value; saveState(); render(); });

  app.querySelectorAll("[data-entry-type]").forEach((button) => button.addEventListener("click", () => {
    const form = app.querySelector("#entryForm");
    if (form) {
      draft.amountInput = formatAmountInput(form.elements.amount?.value);
      draft.currency = String(form.elements.currency?.value || draft.currency || "TRY");
      draft.exchangeRate = parseAmount(form.elements.exchangeRate?.value || draft.exchangeRate || 1);
      draft.date = String(form.elements.date?.value || draft.date || todayKey());
      draft.settlement = String(form.elements.settlement?.value || draft.settlement || "in");
      draft.notificationMode = String(form.elements.notificationMode?.value || draft.notificationMode || "open");
    }
    draft.type = button.dataset.entryType;
    draft.emoji = emojiOptionsFor(draft.type)[0] || entryTypes.find((type) => type.id === draft.type)?.emoji || draft.emoji;
    render();
  }));
  app.querySelectorAll("[data-chip='emoji']").forEach((button) => button.addEventListener("click", () => { draft.emoji = button.dataset.value; button.closest(".chips")?.querySelectorAll(".emoji-chip").forEach((chip) => chip.classList.toggle("selected", chip === button)); }));
  app.querySelectorAll("[data-suggestion]").forEach((button) => button.addEventListener("click", () => {
    const form = app.querySelector("#entryForm");
    if (!form) return;
    form.elements.headingName.value = button.dataset.suggestion;
    form.elements.shortName.value = button.dataset.short || button.dataset.suggestion;
    draft.emoji = button.dataset.emoji || draft.emoji;
  }));
  const projectSelect = app.querySelector("#projectSelect");
  if (projectSelect) projectSelect.addEventListener("change", () => { state.activeProjectId = projectSelect.value; draft = makeDraft(); saveState(); render(); });

  const accountForm = app.querySelector("#accountForm");
  if (accountForm) accountForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(accountForm);
    const name = String(data.get("userName") || "").trim();
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = normalizePassword(data.get("password"));
    if (!name) return toast("Ad soyad yazalım.");
    if (typeof isCloudReady === "function" && isCloudReady()) {
      if (!email || !email.includes("@")) return toast("Geçerli bir e-posta yazalım.");
      if (password.length < 6) return toast("Bulut hesabı için şifre en az 6 karakter olsun.");
      try {
        const result = await cloudSignUp({ name, email, password, nickname: String(data.get("nickname") || "").trim() });
        render();
        return toast(result.session ? "Hesap açıldı ve giriş yapıldı." : "Hesap açıldı. E-postadaki doğrulama linkini kontrol et.");
      } catch (error) { return toast(friendlyCloudError(error)); }
    }
    if (password.length < 4) return toast("Şifre en az 4 karakter olsun.");
    const user = createUser(name, password, { email, nickname: String(data.get("nickname") || "").trim(), linkToProject: false });
    state.signedInUserId = ""; state.activeUserId = ""; state.pendingLoginUserId = user.id; state.authMode = "login"; saveState(); render(); toast("Hesap oluşturuldu. Şimdi giriş yap.");
  });

  const loginForm = app.querySelector("#loginForm");
  if (loginForm) loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    if (typeof isCloudReady === "function" && isCloudReady()) {
      const email = String(data.get("loginEmail") || "").trim().toLowerCase();
      const password = normalizePassword(data.get("loginPassword"));
      if (!email || !email.includes("@")) return toast("E-postanı yazalım.");
      if (!password) return toast("Şifreni yazalım.");
      try { await cloudSignIn({ email, password }); render(); return toast("Giriş yapıldı."); } catch (error) { return toast(friendlyCloudError(error)); }
    }
    const user = state.users.find((item) => item.id === String(data.get("loginUserId")));
    if (!state.users.length) return toast("Önce kullanıcı oluştur.");
    if (!user) return toast("Kullanıcı bulunamadı.");
    const password = normalizePassword(data.get("loginPassword"));
    if (user.password && normalizePassword(user.password) !== password) return toast("Şifre yanlış.");
    state.signedInUserId = user.id; state.activeUserId = user.id; state.pendingLoginUserId = ""; draft = makeDraft(); saveState(); render(); toast(`${profileLabel(user)} giriş yaptı.`);
  });

  const firstProjectForm = app.querySelector("#firstProjectForm");
  if (firstProjectForm) firstProjectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(firstProjectForm);
    const name = String(data.get("projectName") || "").trim();
    if (!name) return toast("Kasa adını yazalım.");
    createProject(name, String(data.get("purpose") || "").trim() || "Genel kasa", { templateId: state.selectedTemplateId || "" });
    try { saveState(); if (typeof isCloudReady === "function" && isCloudReady()) await cloudPushState(); render(); toast("Kasa oluşturuldu."); } catch (error) { toast(friendlyCloudError(error)); }
  });

  const joinProjectForm = app.querySelector("#joinProjectForm");
  if (joinProjectForm) joinProjectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const code = normalizeCode(new FormData(joinProjectForm).get("projectCode"));
    if (!code) return toast("Proje kodunu yazalım.");
    if (typeof isCloudReady === "function" && isCloudReady()) {
      try { await cloudJoinProjectByCode(code); render(); return toast("Kasaya katıldın."); } catch (error) { return toast(friendlyCloudError(error)); }
    }
    const project = state.projects.find((item) => normalizeCode(projectCode(item)) === code);
    if (!project) return toast("Bu kod bu cihazda yok.");
    const userId = state.activeUserId || state.users[0]?.id;
    if (userId && !project.memberIds.includes(userId)) project.memberIds.push(userId);
    state.activeProjectId = project.id; draft = makeDraft(); saveState(); render(); toast("Projeye katıldın.");
  });

  const entryForm = app.querySelector("#entryForm");
  if (entryForm) bindEntryForm(entryForm);
  const statementForm = app.querySelector("#statementForm");
  if (statementForm) bindStatementForm(statementForm);
  const goalForm = app.querySelector("#goalForm");
  if (goalForm) goalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(goalForm);
    const title = String(data.get("title") || "").trim();
    const targetAmount = parseAmount(data.get("targetAmount"));
    if (!title || !targetAmount) return toast("Hedef adı ve tutarı yaz.");
    const items = String(data.get("items") || "").split(",").map((part) => part.trim()).filter(Boolean).map((part) => {
      const match = part.match(/(.+?)\s+([\d.,]+)$/);
      return { name: match ? match[1].trim() : part, price: match ? parseAmount(match[2]) : 0, purchased: false };
    });
    state.goals.push({ id: makeId(), projectId: activeProject().id, createdBy: currentUser()?.id || "", title, targetAmount, currentAmount: 0, deadline: String(data.get("deadline") || ""), items, status: "active", createdAt: blockNow() });
    saveState(); render(); toast("Hedef eklendi.");
  });
  app.querySelectorAll("#userForm, #projectUserForm").forEach((userForm) => userForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = String(new FormData(userForm).get("userName") || "").trim();
    if (!name) return toast((typeof isCloudReady === "function" && isCloudReady()) ? "Kasaya eklenecek e-postayı yazalım." : "Kasaya eklenecek kullanıcı adını yazalım.");
    if (typeof isCloudReady === "function" && isCloudReady()) {
      try { await cloudAddMemberByEmail(name); render(); return toast("Kullanıcı kasaya eklendi."); } catch (error) { return toast(friendlyCloudError(error)); }
    }
    const result = addUserToActiveProjectByName(name);
    if (result.status === "forbidden") return toast("Kullanıcı eklemeyi sadece kasa sahibi yapar.");
    if (result.status === "missing-user") return toast("Bu adda kullanıcı yok. Önce profilini oluştur.");
    if (result.status === "already") return toast(`${shortName(result.user.name)} zaten bu kasada.`);
    saveState(); render(); toast(`${shortName(result.user.name)} kasaya eklendi.`);
  }));
  app.querySelectorAll("[data-alias-form]").forEach((aliasForm) => aliasForm.addEventListener("submit", (event) => { event.preventDefault(); const result = setProjectMemberAlias(aliasForm.dataset.id, new FormData(aliasForm).get("alias")); if (result.status === "forbidden") return toast("Lakap vermeyi sadece kasa sahibi yapar."); saveState(); render(); toast("Kasa içi lakap kaydedildi."); }));
  const projectForm = app.querySelector("#projectForm");
  if (projectForm) projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(projectForm);
    const name = String(data.get("projectName") || "").trim();
    if (!name) return toast("Proje adını yazalım.");
    createProject(name, String(data.get("purpose") || "").trim() || "Genel kasa", { templateId: state.selectedTemplateId || "" });
    try { saveState(); if (typeof isCloudReady === "function" && isCloudReady()) await cloudPushState(); render(); toast("Proje eklendi."); } catch (error) { toast(friendlyCloudError(error)); }
  });
}

function bindEntryForm(entryForm) {
  const amountInput = entryForm.querySelector("#amount");
  if (amountInput) amountInput.addEventListener("input", () => { amountInput.value = formatAmountInput(amountInput.value); draft.amountInput = amountInput.value; });
  const currencySelect = entryForm.querySelector("select[name='currency']");
  const rateField = entryForm.querySelector(".fx-rate-field");
  const currencyGrid = entryForm.querySelector(".currency-grid");
  const rateInput = entryForm.querySelector("input[name='exchangeRate']");
  if (currencySelect && rateField) currencySelect.addEventListener("change", () => {
    const isTry = currencySelect.value === "TRY";
    rateField.classList.toggle("is-hidden", isTry);
    currencyGrid?.classList.toggle("single", isTry);
    draft.currency = currencySelect.value;
    if (isTry && rateInput) { rateInput.value = "1"; draft.exchangeRate = 1; }
  });
  const headingInput = entryForm.querySelector("#headingName");
  const matches = entryForm.querySelector("#headingMatches");
  if (headingInput && matches) headingInput.addEventListener("input", () => {
    const value = normalize(headingInput.value);
    const items = projectHeadings().filter((heading) => normalize(heading.name).includes(value) || normalize(heading.shortName).includes(value)).slice(0, 8);
    matches.innerHTML = items.map((item) => `<button class="chip" data-suggestion="${item.name}" data-short="${item.shortName}" data-emoji="${item.emoji}" type="button">${item.emoji} ${item.shortName}</button>`).join("");
    bindScreen();
  });
  entryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(entryForm);
    const enteredAmount = parseAmount(data.get("amount"));
    const currency = String(data.get("currency") || "TRY").toUpperCase();
    const exchangeRate = currency === "TRY" ? 1 : parseAmount(data.get("exchangeRate"));
    const amount = enteredAmount * exchangeRate;
    const headingName = String(data.get("headingName") || "").trim();
    if (!enteredAmount || enteredAmount <= 0) return toast("Önce tutarı yazalım.");
    if (!currencyOptions.some((item) => item.code === currency)) return toast("Para birimini seçelim.");
    if (!exchangeRate || exchangeRate <= 0) return toast("Döviz için kuru yazalım.");
    if (!headingName) return toast("Bir başlık yazalım.");
    if (!activeMembers().length) return toast("Önce projeye kullanıcı bağlayalım.");
    const short = String(data.get("shortName") || "").trim() || headingName;
    const heading = ensureHeading(headingName, short, draft.emoji || emojiForHeadingName(headingName));
    const userId = currentUser()?.id || String(data.get("userId"));
    const date = String(data.get("date") || todayKey());
    const settlement = String(data.get("settlement")) === "in";
    if (userId && activeProject() && !activeProject().memberIds.includes(userId)) activeProject().memberIds.push(userId);
    const split = splitForEntry(draft.type, settlement, userId);
    const media = await mediaFromForm(data, { emoji: "notificationEmoji", gif: "notificationGif", photo: "photo" });
    const successMedia = await mediaFromForm(data, { emoji: "successReaction", gif: "successGif", photo: "successPhoto" });
    const failMedia = await mediaFromForm(data, { emoji: "failReaction", gif: "failGif", photo: "failPhoto" });
    const now = blockNow();
    const entry = {
      id: makeId(),
      projectId: state.activeProjectId,
      type: draft.type,
      amount,
      enteredAmount,
      currency,
      exchangeRate,
      headingId: heading.id,
      shortName: heading.shortName,
      emoji: heading.emoji,
      userId,
      paidById: userId,
      splitWith: split.splitWith,
      splitRatio: split.splitRatio,
      date,
      note: String(data.get("note") || "").trim(),
      photoName: media.photoName,
      photoData: media.photoData,
      ocrRawText: null,
      ocrParsedAmount: null,
      settlement,
      status: ["receivable", "payable"].includes(draft.type) ? "pending" : "done",
      autoRevealAt: "",
      rateLockedAt: now,
      createdAt: now,
    };
    state.entries.unshift(entry);
    const mode = String(data.get("notificationMode") || draft.notificationMode || "silent");
    const notification = createEntryNotification(entry, {
      mode,
      emoji: media.emoji || "🎲",
      gif: media.gif,
      photoName: media.photoName,
      photoData: media.photoData,
      successReaction: successMedia.emoji || "✅",
      successGif: successMedia.gif,
      successPhotoName: successMedia.photoName,
      successPhotoData: successMedia.photoData,
      failReaction: failMedia.emoji || "🙂",
      failGif: failMedia.gif,
      failPhotoName: failMedia.photoName,
      failPhotoData: failMedia.photoData,
    });
    if (notification?.mode === "surprise") {
      entry.lockedNotificationId = notification.id;
      entry.autoRevealAt = notification.guessDeadline;
    }
    const delay = goalDelayWarning(entry);
    saveState();
    state.activeView = "home";
    draft.amountInput = "";
    draft.date = todayKey();
    render();
    toast(delay || "Hareket kasaya girdi.");
  });
}

function bindStatementForm(statementForm) {
  statementForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(statementForm);
    const bankId = String(data.get("bankName") || "other");
    const month = String(data.get("month") || monthKey());
    const file = formFile(data, "statementFile");
    if (!file) return toast("CSV dosyası seç.");
    const text = await file.text();
    const baseMap = bankColumnMaps[bankId] || bankColumnMaps.other;
    const manualMap =
      bankId === "other"
        ? {
            ...baseMap,
            dateCol: Number(data.get("dateCol") || baseMap.dateCol),
            descCol: Number(data.get("descCol") || baseMap.descCol),
            amountCol: Number(data.get("amountCol") || baseMap.amountCol),
            delimiter: String(data.get("delimiter") || baseMap.delimiter || ";"),
          }
        : baseMap;
    const rows = parseCsvRows(text, manualMap);
    if (!rows.length) return toast("CSV içinde okunabilir satır yok.");
    addReconciliation({ bankId, month, rows });
    saveState();
    state.activeView = "home";
    render();
    toast("Ekstre karşılaştırıldı.");
  });
}


initApp();
