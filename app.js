const STORAGE_KEY = "kasa-prototype-state-v6";
const APP_UPDATED_AT = "03.06.2026 22:39";

const entryTypes = [
  { id: "expense", label: "Gider", emoji: "ğŸ’¸" },
  { id: "income", label: "Gelir", emoji: "ğŸ’°" },
  { id: "receivable", label: "Alacak", emoji: "ğŸ¤" },
  { id: "payable", label: "Ã–deme", emoji: "â°" },
];

const headingSuggestionGroups = {
  expense: [
    { name: "Market", shortName: "Market", emoji: "ğŸ›’" },
    { name: "Kira", shortName: "Kira", emoji: "ğŸ " },
    { name: "Benzin", shortName: "YakÄ±t", emoji: "â›½" },
    { name: "AraÃ§ HGS", shortName: "HGS", emoji: "ğŸš—" },
    { name: "AraÃ§ MTV", shortName: "MTV", emoji: "ğŸ§¾" },
    { name: "Fatura", shortName: "Fatura", emoji: "ğŸ’¡" },
    { name: "AltÄ±n", shortName: "HaraÃ§", emoji: "ğŸª™" },
    { name: "Ã‡ocuk", shortName: "Mini", emoji: "ğŸ¼" },
    { name: "Tatil", shortName: "KaÃ§Ä±ÅŸ", emoji: "ğŸ–ï¸" },
    { name: "DiÄŸer gider", shortName: "DiÄŸer", emoji: "ğŸ§¾" },
  ],
  income: [
    { name: "MaaÅŸ", shortName: "MaaÅŸ", emoji: "ğŸ’¼" },
    { name: "Ek iÅŸ", shortName: "Ek gelir", emoji: "âš¡" },
    { name: "SatÄ±ÅŸ", shortName: "SatÄ±ÅŸ", emoji: "ğŸ·ï¸" },
    { name: "Alacak tahsilatÄ±", shortName: "Tahsilat", emoji: "ğŸ¤" },
    { name: "Kira geliri", shortName: "Kira +", emoji: "ğŸ " },
    { name: "Hediye", shortName: "Hediye", emoji: "ğŸ" },
    { name: "Tatil katkÄ±sÄ±", shortName: "KatkÄ±", emoji: "ğŸ–ï¸" },
    { name: "DiÄŸer gelir", shortName: "DiÄŸer +", emoji: "ğŸ’°" },
  ],
  receivable: [
    { name: "BorÃ§ verdim", shortName: "Alacak", emoji: "ğŸ¤" },
    { name: "Beklenen Ã¶deme", shortName: "Beklenen", emoji: "ğŸ“Œ" },
    { name: "Tatil katkÄ±sÄ±", shortName: "KatkÄ±", emoji: "ğŸ–ï¸" },
    { name: "Ä°ade bekliyor", shortName: "Ä°ade", emoji: "â†©ï¸" },
  ],
  payable: [
    { name: "Kredi kartÄ±", shortName: "Kart", emoji: "ğŸ’³" },
    { name: "Kira gÃ¼nÃ¼", shortName: "Kira", emoji: "ğŸ " },
    { name: "Fatura gÃ¼nÃ¼", shortName: "Fatura", emoji: "ğŸ’¡" },
    { name: "Taksit", shortName: "Taksit", emoji: "ğŸ§¾" },
  ],
};

const emojiOptionsByType = {
  expense: ["ğŸ’¸", "ğŸ›’", "ğŸ ", "â›½", "ğŸš—", "ğŸ’¡", "ğŸª™", "ğŸ¼", "ğŸ–ï¸", "ğŸ§¾"],
  income: ["ğŸ’°", "ğŸ’¼", "âš¡", "ğŸ·ï¸", "ğŸ¤", "ğŸ ", "ğŸ", "ğŸ–ï¸", "ğŸ“ˆ", "ğŸ§¾"],
  receivable: ["ğŸ¤", "ğŸ“Œ", "â†©ï¸", "ğŸ–ï¸", "ğŸ’¬", "ğŸ§¾"],
  payable: ["â°", "ğŸ’³", "ğŸ ", "ğŸ’¡", "ğŸ§¾", "ğŸ“Œ"],
};

const purposeOptions = [
  "Ev / aile",
  "Ev arkadaÅŸlÄ±ÄŸÄ±",
  "Ä°ÅŸ ortaklÄ±ÄŸÄ±",
  "Tatil / proje",
  "AraÃ§ giderleri",
  "Kendi bÃ¼tÃ§em",
];

const currencyOptions = [
  { code: "TRY", label: "TL" },
  { code: "USD", label: "USD" },
  { code: "EUR", label: "EUR" },
  { code: "GBP", label: "GBP" },
];

const defaultUsers = [];

const seedState = {
  activeView: "home",
  reportPeriod: "month",
  movementPeriod: "month",
  settlementVisible: false,
  pendingDetail: "",
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
      setCloudStatus(typeof friendlyCloudError === "function" ? friendlyCloudError(error) : "Bulut baÄŸlantÄ±sÄ± kurulamadÄ±.");
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
    emoji: "ğŸ’¸",
    settlement: "in",
    userId: signedInUser?.id || activeUserInProject?.id || members[0]?.id || state?.activeUserId || state?.users?.[0]?.id || "",
    amountInput: "",
    currency: "TRY",
    exchangeRate: 1,
    date: todayKey(),
    notificationMode: "open",
    notificationEmoji: "ğŸ²",
    notificationGif: "",
    successReaction: "âœ…",
    successGif: "",
    failReaction: "ğŸ™ƒ",
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
    name: user.name || "KullanÄ±cÄ±",
    nickname: user.nickname || "",
    email: user.email || "",
    password: normalizePassword(user.password),
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
        lockedNotificationId: entry.lockedNotificationId || "",
        photoData: entry.photoData || "",
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
        guesses: Array.isArray(notification.guesses) ? notification.guesses : [],
      }))
    : [];

  return {
    ...seedState,
    ...source,
    activeView: source.activeView || "home",
    reportPeriod,
    movementPeriod,
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
  if (updateStamp) updateStamp.textContent = `GÃ¼ncellendi ${APP_UPDATED_AT}`;
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
      <button class="back-button" data-action="go-back" type="button" aria-label="Ana ekrana dÃ¶n">
        <span aria-hidden="true">â€¹</span>
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
        <p class="eyebrow">GeÃ§ici isim</p>
        <h2>Kasa</h2>
        <p>Ev, iÅŸ ve ortak harcamalarÄ± tek kasada takip et.</p>
        <span class="cloud-pill">${typeof cloudLabel === "function" ? cloudLabel() : "Yerel deneme"}</span>
        ${state.cloudStatus ? `<span class="field-help">${state.cloudStatus}</span>` : ""}
      </div>

      <div class="auth-switch">
        <button class="${!isSignup ? "active" : ""}" data-action="auth-mode" data-mode="login" type="button">GiriÅŸ yap</button>
        <button class="${isSignup ? "active" : ""}" data-action="auth-mode" data-mode="signup" type="button">Yeni kullanÄ±cÄ±</button>
      </div>

      ${
        isSignup
          ? `
            <form class="form-grid" id="accountForm">
              <label>
                <span class="field-label">Ad soyad</span>
                <input class="text-input" name="userName" placeholder="Ã–rn. Ä°rfan AyyÄ±ldÄ±z" autocomplete="name" />
              </label>
              <label>
                <span class="field-label">KÄ±sa isim / lakap</span>
                <input class="text-input" name="nickname" placeholder="Ã–rn. Ä°rfan, anne, ortak" autocomplete="off" />
              </label>
              <label>
                <span class="field-label">E-posta</span>
                <input class="text-input" name="email" type="email" placeholder="Ã–rn. irfan@mail.com" autocomplete="email" />
              </label>
              <label>
                <span class="field-label">Åifre</span>
                <input class="text-input" name="password" type="password" placeholder="En az 4 karakter" autocomplete="new-password" />
              </label>
              <button class="primary-button" type="submit">KullanÄ±cÄ± oluÅŸtur</button>
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
                <span class="field-label">Åifre</span>
                <input class="text-input" name="loginPassword" type="password" placeholder="Åifren" autocomplete="current-password" />
              </label>
              <button class="primary-button" type="submit">GiriÅŸ yap</button>
            </form>
          `
            : state.users.length
            ? `
            <form class="form-grid" id="loginForm">
              <label>
                <span class="field-label">KullanÄ±cÄ±</span>
                <select class="select-input" name="loginUserId">
                  ${state.users.map((user) => `<option value="${user.id}"${user.id === selectedLoginUserId ? " selected" : ""}>${profileLabel(user)}${user.email ? ` Â· ${user.email}` : ""}</option>`).join("")}
                </select>
              </label>
              <label>
                <span class="field-label">Åifre</span>
                <input class="text-input" name="loginPassword" type="password" placeholder="Åifren" autocomplete="current-password" />
              </label>
              <button class="primary-button" type="submit">GiriÅŸ yap</button>
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
        <h2>${profileLabel(user)}, ÅŸimdi kasa seÃ§</h2>
        <p class="hero-note">${cloudReady ? "HesabÄ±n hazÄ±r. UygulamayÄ± kullanmak iÃ§in ilk kasanÄ± oluÅŸtur." : "Deneme sÃ¼rÃ¼mÃ¼nde Ã¶nce kendi kasanÄ± kur. DiÄŸer profilleri daha sonra aynÄ± projenin iÃ§ine manuel ekleyeceÄŸiz."}</p>
      </div>

      <form class="form-grid" id="firstProjectForm">
        <label>
          <span class="field-label">Kasa / proje adÄ±</span>
          <input class="text-input" name="projectName" placeholder="Ã–rn. Ev KasasÄ±" autocomplete="off" />
        </label>
        <label>
          <span class="field-label">AmaÃ§</span>
          <input class="text-input" name="purpose" list="purposeList" placeholder="Ev, iÅŸ, ev arkadaÅŸlÄ±ÄŸÄ±..." autocomplete="off" />
        </label>
        <datalist id="purposeList">
          ${purposeOptions.map((purpose) => `<option value="${purpose}"></option>`).join("")}
        </datalist>
        <button class="primary-button" type="submit">Kasa oluÅŸtur</button>
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
        <span class="field-label">Aktif kullanÄ±cÄ±</span>
        <strong>${projectUserLabel(user)}</strong>
      </div>
      <div class="account-actions">
        <button class="tiny-button" data-action="open-notifications" type="button">Bildirimler${notificationCount ? ` (${notificationCount})` : ""}</button>
        <button class="tiny-button" data-action="logout" type="button">Ã‡Ä±kÄ±ÅŸ</button>
      </div>
    </section>

    <section class="hero">
      <div class="hero-row">
        <div>
          <p class="hero-title">${project.purpose}</p>
          <p class="hero-money">${money(totals.comfortable)}</p>
          <p class="hero-note">Rahat kalan: gerÃ§ek kasa + beklenenler - yaklaÅŸanlar</p>
        </div>
        <span class="quick-pill">${totals.comfortable >= 0 ? "Ä°yi" : "Dikkat"}</span>
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>${project.name}</h2>
          <p>${activeMembers().map((user) => projectUserLabel(user)).join(", ") || "HenÃ¼z Ã¼ye yok"}</p>
        </div>
        <button class="tiny-button" data-action="open-group" type="button">YÃ¶net</button>
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
        <span>ğŸ’°</span>
        Gelir ekle
      </button>
      <button class="action-button expense" data-action="go-add-expense" type="button">
        <span>ğŸ’¸</span>
        Gider ekle
      </button>
    </section>

    <section class="grid-2">
      <article class="stat-card">
        <p class="stat-label">Giren</p>
        <p class="stat-value positive">${money(totals.income)}</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">Ã‡Ä±kan</p>
        <p class="stat-value warning">${money(totals.expense)}</p>
      </article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="receivable">
        <p class="stat-label">Beklenen</p>
        <p class="stat-value">${money(totals.receivable)}</p>
      </article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="payable">
        <p class="stat-label">YaklaÅŸan</p>
        <p class="stat-value">${money(totals.payable)}</p>
      </article>
    </section>

    ${
      state.pendingDetail
        ? `
          <section class="card">
            <div class="section-head">
              <div>
                <h2>${state.pendingDetail === "receivable" ? "Beklenen gelirler" : "YaklaÅŸan Ã¶demeler"}</h2>
                <p>${state.pendingDetail === "receivable" ? "Åu gelecek." : "Bu gidecek."}</p>
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
          <h2>YaklaÅŸanlar</h2>
          <p>Ã–deme hatÄ±rlatÄ±cÄ±larÄ± burada gÃ¶rÃ¼nÃ¼r.</p>
        </div>
        <button class="tiny-button" data-action="go-add-payable" type="button">Ekle</button>
      </div>
      <div class="expense-list">
        ${upcoming.length ? upcoming.map(pendingRow).join("") : `<div class="empty-state">HenÃ¼z beklenen alacak veya yaklaÅŸan Ã¶deme yok.</div>`}
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Son hareketler</h2>
          <p>Detay ve oyun sonucu iÃ§in tÃ¼mÃ¼nÃ¼ aÃ§.</p>
        </div>
        <button class="tiny-button" data-action="open-movements" type="button">TÃ¼mÃ¼</button>
      </div>
      <div class="expense-list">
        ${recent.length ? recent.map(entryRow).join("") : `<div class="empty-state">Kasa boÅŸ. Ä°lk hareketi ekleyerek baÅŸlayalÄ±m.</div>`}
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
    payable: "Beklenen Ã¶deme tarihi",
  }[type.id];
  const typeGuidance = {
    expense: "Para Ã§Ä±ktÄ±ysa gider. Ä°leri tarihli Ã¶demeyi Takvim iÃ§in Ã–deme olarak gir.",
    income: "Para yattÄ±ysa gelir. MaaÅŸ yatacaksa Alacak seÃ§ip beklenen tarihi yaz.",
    receivable: "HenÃ¼z yatmamÄ±ÅŸ gelir. Takvimde beklenen para olarak gÃ¶rÃ¼nÃ¼r.",
    payable: "HenÃ¼z Ã¶denmemiÅŸ gider. Takvimde yaklaÅŸan Ã¶deme olarak gÃ¶rÃ¼nÃ¼r.",
  }[type.id];
  const headingLabel = type.id === "income" || type.id === "receivable" ? "Gelir baÅŸlÄ±ÄŸÄ±" : "Gider baÅŸlÄ±ÄŸÄ±";
  const headingPlaceholder = type.id === "income" || type.id === "receivable" ? "Ã–rn. MaaÅŸ, ek iÅŸ, satÄ±ÅŸ" : "Ã–rn. Kira, HGS, market";
  const shortPlaceholder = type.id === "income" || type.id === "receivable" ? "Ã–rn. maaÅŸ gÃ¼nÃ¼, yan gelir, tahsilat" : "Ã–rn. haraÃ§, yol yedi, ayÄ±n tokadÄ±";
  const notePlaceholder = type.id === "income" || type.id === "receivable" ? "Ã–rn. Haziran maaÅŸÄ±, prim dahil" : "Ã–rn. kasada farklÄ± Ã§Ä±ktÄ±, ortak Ã¶deme";
  return `
    <form class="form-card form-grid" id="entryForm">
      <div class="section-head">
        <div>
          <h2>${type.label} hareketi ekle</h2>
          <p>${activeProject().name} iÃ§ine kayÄ±t dÃ¼ÅŸer.</p>
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
          <input class="select-input" name="exchangeRate" inputmode="decimal" placeholder="Ã–rn. 32,5" value="${draft.exchangeRate || 1}" autocomplete="off" />
        </label>
      </div>

      <div class="grid-2 timing-grid ${type.id === "expense" ? "" : "single"}">
        <label>
          <span class="field-label">${dateLabel}</span>
          <input class="select-input" name="date" type="date" value="${draft.date || todayKey()}" />
          <span class="field-help">MaaÅŸ her ayÄ±n 1'inde yatÄ±yorsa o gÃ¼nÃ¼ seÃ§.</span>
        </label>
        ${
          type.id === "expense"
            ? `
              <label>
                <span class="field-label">HesaplaÅŸma</span>
                <select class="select-input" name="settlement">
                  <option value="in" ${draft.settlement === "in" ? "selected" : ""}>Dahil</option>
                  <option value="out" ${draft.settlement === "out" ? "selected" : ""}>Dahil deÄŸil</option>
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
        <label class="field-label" for="shortName">KÄ±sa isim / lakap</label>
        <input class="text-input" id="shortName" name="shortName" placeholder="${shortPlaceholder}" autocomplete="off" />
      </div>

      <div>
        <span class="field-label">Ã–neriler</span>
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
                    <option value="open" ${draft.notificationMode === "open" ? "selected" : ""}>AÃ§Ä±k bildir</option>
                    <option value="surprise" ${draft.notificationMode === "surprise" ? "selected" : ""}>SÃ¼rpriz tahmin</option>
                    <option value="silent" ${draft.notificationMode === "silent" ? "selected" : ""}>Sessiz kaydet</option>
                  </select>
                </label>
                <div class="media-picker">
                  <div>
                    <span class="field-label">Bildirim medyasÄ±</span>
                    <p class="field-help">Emoji, GIF/sticker linki veya fotoÄŸraf aynÄ± mesaj alanÄ± gibi Ã§alÄ±ÅŸÄ±r.</p>
                  </div>
                  <div class="media-grid">
                    <label>
                      <span class="field-label">Emoji</span>
                      <input class="text-input" name="notificationEmoji" maxlength="4" value="${draft.notificationEmoji || "ğŸ²"}" autocomplete="off" />
                    </label>
                    <label>
                      <span class="field-label">GIF / sticker</span>
                      <input class="text-input" name="notificationGif" placeholder="Link veya kÄ±sa ad" value="${draft.notificationGif || ""}" autocomplete="off" />
                    </label>
                    <label class="photo-pick compact-pick">
                      <span>FotoÄŸraf</span>
                      <strong>SeÃ§</strong>
                      <input name="notificationPhoto" type="file" accept="image/*" />
                    </label>
                  </div>
                </div>
                <div class="media-picker">
                  <div>
                    <span class="field-label">Tahmin sonrasÄ± tepkiler</span>
                    <p class="field-help">DoÄŸru ve yanlÄ±ÅŸ cevap iÃ§in ayrÄ± medya seÃ§ilebilir.</p>
                  </div>
                  <div class="reaction-grid">
                    <div class="reaction-column">
                      <strong>DoÄŸru</strong>
                      <input class="text-input" name="successReaction" value="${draft.successReaction || "âœ…"}" autocomplete="off" />
                      <input class="text-input" name="successGif" placeholder="GIF / sticker linki" value="${draft.successGif || ""}" autocomplete="off" />
                      <label class="photo-pick compact-pick">
                        <span>FotoÄŸraf</span>
                        <strong>SeÃ§</strong>
                        <input name="successPhoto" type="file" accept="image/*" />
                      </label>
                    </div>
                    <div class="reaction-column">
                      <strong>YanlÄ±ÅŸ</strong>
                      <input class="text-input" name="failReaction" value="${draft.failReaction || "ğŸ™ƒ"}" autocomplete="off" />
                      <input class="text-input" name="failGif" placeholder="GIF / sticker linki" value="${draft.failGif || ""}" autocomplete="off" />
                      <label class="photo-pick compact-pick">
                        <span>FotoÄŸraf</span>
                        <strong>SeÃ§</strong>
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
        <span class="field-help">Hesaba katÄ±lmaz; sadece hareketin aÃ§Ä±klamasÄ± olarak saklanÄ±r.</span>
      </label>

      <label class="photo-pick">
        <span>FiÅŸ, belge veya Ã¼rÃ¼n fotoÄŸrafÄ± ekle (opsiyonel)</span>
        <strong>SeÃ§</strong>
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
        ["day", "GÃ¼n"],
        ["week", "Hafta"],
        ["month", "Ay"],
        ["all", "TÃ¼mÃ¼"],
      ].map(([value, labelText]) => `<button class="segment ${period === value ? "active" : ""}" data-movement-period="${value}" type="button">${labelText}</button>`).join("")}
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>${label} hareketleri</h2>
          <p>GÃ¶rÃ¼nen kayÄ±tlar, tamamlanan tahmin oyunlarÄ±na gÃ¶re hesaplanÄ±r.</p>
        </div>
        <span class="quick-pill">${entries.length} kayÄ±t</span>
      </div>
      <div class="grid-2 compact-stats">
        <article class="stat-card small">
          <p class="stat-label">Giren</p>
          <p class="stat-value positive">${money(totals.income)}</p>
        </article>
        <article class="stat-card small">
          <p class="stat-label">Ã‡Ä±kan</p>
          <p class="stat-value warning">${money(totals.expense)}</p>
        </article>
      </div>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Detay</h2>
          <p>FotoÄŸraf, not, dÃ¶viz ve oyun sonucu burada gÃ¶rÃ¼nÃ¼r.</p>
        </div>
      </div>
      <div class="expense-list">
        ${entries.length ? entries.map(movementEntryRow).join("") : `<div class="empty-state">Bu dÃ¶nem iÃ§in gÃ¶rÃ¼nen hareket yok.</div>`}
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
          <p>Beklenen alacaklar ve yaklaÅŸan Ã¶demeler.</p>
        </div>
        <button class="tiny-button" data-action="go-add-payable" type="button">Ekle</button>
      </div>
      <div class="expense-list">
        ${pending.length ? pending.map(pendingRow).join("") : `<div class="empty-state">Takvim boÅŸ. Kira, MTV, mÃ¼ÅŸteri Ã¶demesi gibi ÅŸeyleri ekleyebilirsin.</div>`}
      </div>
    </section>

    <section class="card">
      <h2>Son tarihli kayÄ±tlar</h2>
      <div class="expense-list">
        ${actual.length ? actual.map(entryRow).join("") : `<div class="empty-state">GerÃ§ekleÅŸmiÅŸ kayÄ±t yok.</div>`}
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
          <p>Bu ekranda sadece bu profile gelen proje bildirimleri gÃ¶rÃ¼nÃ¼r.</p>
        </div>
        <span class="quick-pill">${notifications.length}</span>
      </div>
      <div class="expense-list">
        ${notifications.length ? notifications.map(notificationRow).join("") : `<div class="empty-state">Åu an bu profile gelen bildirim yok.</div>`}
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
        ["day", "GÃ¼n"],
        ["week", "Hafta"],
        ["month", "Ay"],
      ].map(([value, labelText]) => `<button class="segment ${period === value ? "active" : ""}" data-period="${value}" type="button">${labelText}</button>`).join("")}
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>${label} raporu</h2>
          <p>Giren ${money(totals.income)}, Ã§Ä±kan ${money(totals.expense)}, net ${money(totals.actual)}.</p>
        </div>
        <span class="quick-pill">${entries.length} kayÄ±t</span>
      </div>
      <div class="grid-2 compact-stats">
        <article class="stat-card small">
          <p class="stat-label">Giren</p>
          <p class="stat-value positive">${money(totals.income)}</p>
        </article>
        <article class="stat-card small">
          <p class="stat-label">Ã‡Ä±kan</p>
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
          <h2>Rapor detayÄ±</h2>
          <p>Bu dÃ¶nemde gÃ¶rÃ¼nen gelir ve giderler.</p>
        </div>
      </div>
      <div class="expense-list">
        ${entries.length ? entries.map(movementEntryRow).join("") : `<div class="empty-state">Bu dÃ¶nem iÃ§in raporlanacak hareket yok.</div>`}
      </div>
    </section>

    <section class="receipt-card">
      <h2 class="receipt-title">KASA FÄ°ÅÄ°</h2>
      <div class="receipt-line"><span>${label} giren</span><strong>${money(totals.income)}</strong></div>
      <div class="receipt-line"><span>${label} Ã§Ä±kan</span><strong>${money(totals.expense)}</strong></div>
      <div class="receipt-line"><span>Net</span><strong>${money(totals.actual)}</strong></div>
      ${exchangeReceiptLines(entries)}
      <div class="receipt-line"><span>En hareketli baÅŸlÄ±k</span><strong>${topHeading(entries)}</strong></div>
      <p class="receipt-comment">${entries.length ? "Kasa konuÅŸtu, fiÅŸ Ã§Ä±ktÄ±." : "Kasa bugÃ¼n sessiz."}</p>
      <button class="share-button" data-action="share-receipt" type="button">FiÅŸi paylaÅŸ</button>
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
          <p>Proje seÃ§, Ã¼yeleri baÄŸla, gelir/gider senaryosunu kur.</p>
        </div>
      </div>
      <div class="quick-actions compact">
        <button class="action-button income" data-action="go-add-income" type="button">
          <span>ğŸ’°</span>
          Gelir ekle
        </button>
        <button class="action-button expense" data-action="go-add-expense" type="button">
          <span>ğŸ’¸</span>
          Gider ekle
        </button>
      </div>
      <div class="expense-list" style="margin-top:12px;">
        ${state.projects.map(projectRow).join("")}
      </div>
      <form class="inline-form" id="projectForm">
        <input class="text-input" name="projectName" placeholder="Yeni proje adÄ±" autocomplete="off" />
        <input class="text-input" name="purpose" list="purposeList" placeholder="Kasa amacÄ±: Ev, iÅŸ, araÃ§..." autocomplete="off" />
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
              <button class="secondary-button" type="submit">Kodla katÄ±l</button>
            </form>
          `
          : ""
      }
    </section>

    <section class="card">
      <h2>Projeye kiÅŸi ekle</h2>
      <p>${
        canManageUsers
          ? cloudReady
            ? `DiÄŸer kiÅŸi Ã¶nce kendi telefonunda e-posta ile hesap aÃ§sÄ±n. Sonra e-postasÄ±nÄ± buraya yazÄ±p ${project.name} kasasÄ±na ekle.`
            : `Ã–nce diÄŸer profili oluÅŸtur. Sonra adÄ±nÄ± buraya yazÄ±p ${project.name} kasasÄ±na ekle.`
          : `Åu an ${projectUserLabel(user)} hesabÄ±ndasÄ±n. KullanÄ±cÄ± eklemek iÃ§in ${projectUserLabel(owner)} hesabÄ±yla giriÅŸ yap.`
      }</p>
      ${
        canManageUsers
          ? `
            <form class="inline-form featured-form" id="projectUserForm">
              <input class="text-input" name="userName" placeholder="${cloudReady ? "havva@mail.com" : "Ã–rn. Havva veya Derya"}" autocomplete="${cloudReady ? "email" : "off"}" />
              <button class="primary-button" type="submit">Kasaya ekle</button>
            </form>
          `
          : `
            <div class="inline-form featured-form">
              <button class="secondary-button" data-action="logout" type="button">Ã‡Ä±kÄ±ÅŸ yap</button>
              <span class="field-help">Sonra kasa sahibi profiliyle tekrar giriÅŸ yap.</span>
            </div>
          `
      }
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Sonraki aÅŸama: proje eriÅŸimi</h2>
          <p>${cloudReady ? "Bu kodu baÅŸka telefondaki kullanÄ±cÄ± girerse aynÄ± kasaya katÄ±lÄ±r." : "Bu denemede katÄ±lÄ±mÄ± manuel profil ekleyerek yapÄ±yoruz. Kod/link modeli gerÃ§ek Ã§oklu telefon sÃ¼rÃ¼mÃ¼ne kalacak."}</p>
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
      <h2>Kasa kullanÄ±cÄ±larÄ±</h2>
      <p>${
        canManageUsers
          ? `Kasa sahibi ${projectUserLabel(owner)}. KullanÄ±cÄ± adÄ±nÄ± yazÄ±p bu kasaya ekleyebilir.`
          : `Bu kasayÄ± ${projectUserLabel(owner)} yÃ¶netir. KullanÄ±cÄ± ekleme sadece onda.`
      }</p>
      <div class="expense-list" style="margin-top:12px;">
        ${state.users.map(userLinkRow).join("")}
      </div>
      ${
        canManageUsers
          ? `
            <form class="inline-form" id="userForm">
              <input class="text-input" name="userName" placeholder="${cloudReady ? "E-posta: havva@mail.com" : "KullanÄ±cÄ± adÄ±: Havva"}" autocomplete="${cloudReady ? "email" : "off"}" />
              <button class="primary-button" type="submit">Kasaya ekle</button>
            </form>
          `
          : `<div class="empty-state" style="margin-top:12px;">KullanÄ±cÄ± eklemek iÃ§in kasa sahibi hesabÄ±yla giriÅŸ yap.</div>`
      }
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>BorÃ§ & alacak</h2>
          <p>${state.settlementVisible ? "HesaplaÅŸma gÃ¶rÃ¼nÃ¼r." : "Åu an gizli. Ev huzuru modu."}</p>
        </div>
        <button class="tiny-button" data-action="toggle-settlement" type="button">${state.settlementVisible ? "Gizle" : "GÃ¶ster"}</button>
      </div>
      ${
        state.settlementVisible
          ? `
            <div style="margin-top: 10px;">
              ${balances.length ? balances.map(balanceRow).join("") : `<div class="empty-state">HesaplaÅŸmaya dahil gider yok.</div>`}
            </div>
            <div style="margin-top: 12px;">
              ${
                transactions.length
                  ? transactions.map((tx) => `<div class="split-row"><strong>${tx.from} â†’ ${tx.to}</strong><span>${money(tx.amount)}</span></div>`).join("")
                  : `<div class="empty-state">Åimdilik hesap kapanmÄ±ÅŸ gÃ¶rÃ¼nÃ¼yor.</div>`
              }
            </div>
          `
          : `<div class="empty-state" style="margin-top: 12px;">AÃ§Ä±nca seÃ§ili projede kim kime ne kadar gÃ¶ndermeli gÃ¶rÃ¼nÃ¼r.</div>`
      }
    </section>
  `;
}

function renderHeadings() {
  return `
    <section class="form-card form-grid">
      <div class="section-head">
        <div>
          <h2>BaÅŸlÄ±k ekle</h2>
          <p>Resmi ad baÅŸka, proje iÃ§i lakabÄ± baÅŸka olabilir.</p>
        </div>
      </div>

      <form class="form-grid" id="headingForm">
        <label>
          <span class="field-label">BaÅŸlÄ±k adÄ±</span>
          <input class="text-input" name="headingName" placeholder="Ã–rn. AltÄ±n" autocomplete="off" />
        </label>
        <label>
          <span class="field-label">KÄ±sa isim / lakap</span>
          <input class="text-input" name="shortName" placeholder="Ã–rn. haraÃ§" autocomplete="off" />
        </label>
        <div>
          <span class="field-label">Emoji</span>
          <div class="chips">
            ${["ğŸ›’", "ğŸ ", "â›½", "ğŸš—", "ğŸ’¡", "ğŸª™", "ğŸ¼", "ğŸ–ï¸", "ğŸ’¼", "ğŸ§¾"]
              .map((emoji) => `<button class="emoji-chip ${draft.emoji === emoji ? "selected" : ""}" data-chip="emoji" data-value="${emoji}" type="button">${emoji}</button>`)
              .join("")}
          </div>
        </div>
        <button class="primary-button" type="submit">BaÅŸlÄ±ÄŸÄ± kaydet</button>
      </form>
    </section>

    <section class="card">
      <h2>${activeProject().name} baÅŸlÄ±klarÄ±</h2>
      <div class="expense-list">
        ${projectHeadings().length ? projectHeadings().map(headingRow).join("") : `<div class="empty-state">HenÃ¼z baÅŸlÄ±k yok.</div>`}
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
      draft.emoji = "ğŸ’¸";
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
      draft.emoji = "ğŸ’°";
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
      draft.emoji = "â°";
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
      toast("Ã‡Ä±kÄ±ÅŸ yapÄ±ldÄ±.");
    });
  });

  app.querySelectorAll("[data-action='share-receipt']").forEach((button) => {
    button.addEventListener("click", shareReceipt);
  });

  app.querySelectorAll("[data-action='guess-notification']").forEach((button) => {
    button.addEventListener("click", () => {
      const result = guessNotification(button.dataset.id, button.dataset.guess);
      if (result.status === "already") return toast("Bu sÃ¼rprizi zaten tahmin ettin.");
      saveState();
      render();
      toast(result.guess?.correct ? "DoÄŸru tahmin." : "YanlÄ±ÅŸ tahmin.");
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
        draft.notificationEmoji = String(form.elements.notificationEmoji?.value || draft.notificationEmoji || "ğŸ²");
        draft.notificationGif = String(form.elements.notificationGif?.value || draft.notificationGif || "");
        draft.successReaction = String(form.elements.successReaction?.value || draft.successReaction || "âœ…");
        draft.successGif = String(form.elements.successGif?.value || draft.successGif || "");
        draft.failReaction = String(form.elements.failReaction?.value || draft.failReaction || "ğŸ™ƒ");
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
      if (!name) return toast("Ad soyad yazalÄ±m.");
      if (typeof isCloudReady === "function" && isCloudReady()) {
        if (!email || !email.includes("@")) return toast("GeÃ§erli bir e-posta yazalÄ±m.");
        if (password.length < 6) return toast("Bulut hesabÄ± iÃ§in ÅŸifre en az 6 karakter olsun.");
        try {
          const result = await cloudSignUp({
            name,
            email,
            password,
            nickname: String(data.get("nickname") || "").trim(),
          });
          render();
          return toast(result.session ? "Hesap aÃ§Ä±ldÄ± ve giriÅŸ yapÄ±ldÄ±." : "Hesap aÃ§Ä±ldÄ±. E-postadaki doÄŸrulama linkini kontrol et.");
        } catch (error) {
          return toast(friendlyCloudError(error));
        }
      }
      if (password.length < 4) return toast("Åifre en az 4 karakter olsun.");
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
      toast("Hesap oluÅŸturuldu. Åimdi giriÅŸ yap.");
    });
  }

  const firstProjectForm = app.querySelector("#firstProjectForm");
  if (firstProjectForm) {
    firstProjectForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(firstProjectForm);
      const name = String(data.get("projectName") || "").trim();
      if (!name) return toast("Kasa adÄ±nÄ± yazalÄ±m.");
      createProject(name, String(data.get("purpose") || "").trim() || "Genel kasa");
      try {
        saveState();
        if (typeof isCloudReady === "function" && isCloudReady()) await cloudPushState();
        render();
        toast("Kasa oluÅŸturuldu.");
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
        if (!email || !email.includes("@")) return toast("E-postanÄ± yazalÄ±m.");
        if (!password) return toast("Åifreni yazalÄ±m.");
        try {
          await cloudSignIn({ email, password });
          render();
          return toast("GiriÅŸ yapÄ±ldÄ±.");
        } catch (error) {
          return toast(friendlyCloudError(error));
        }
      }
      const user = state.users.find((item) => item.id === String(data.get("loginUserId")));
      if (!state.users.length) return toast("Ã–nce kullanÄ±cÄ± oluÅŸtur.");
      if (!user) return toast("KullanÄ±cÄ± bulunamadÄ±.");
      const password = normalizePassword(data.get("loginPassword"));
      if (user.password && normalizePassword(user.password) !== password) return toast("Åifre yanlÄ±ÅŸ.");
      if (!user.password && password) return toast("Bu profil ÅŸifresiz.");
      if (!user.password && !password) return toast("Bu profil iÃ§in ÅŸifre yok. Deneme profillerini hareket iÃ§inde seÃ§ebilirsin.");
      state.signedInUserId = user.id;
      state.activeUserId = user.id;
      state.pendingLoginUserId = "";
      draft = makeDraft();
      saveState();
      render();
      toast(`${profileLabel(user)} giriÅŸ yaptÄ±.`);
    });
  }

  const quickUserForm = app.querySelector("#quickUserForm");
  if (quickUserForm) {
    quickUserForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(quickUserForm);
      const name = String(data.get("userName") || "").trim();
      if (!name) return toast("KullanÄ±cÄ± adÄ±nÄ± yazalÄ±m.");
      createUser(name, String(data.get("password") || ""), { nickname: String(data.get("nickname") || "").trim(), makeActive: false });
      saveState();
      render();
      toast("KullanÄ±cÄ± oluÅŸturuldu ve projeye baÄŸlandÄ±.");
    });
  }

  const joinProjectForm = app.querySelector("#joinProjectForm");
  if (joinProjectForm) {
    joinProjectForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const code = normalizeCode(new FormData(joinProjectForm).get("projectCode"));
      if (!code) return toast("Proje kodunu yazalÄ±m.");
      if (typeof isCloudReady === "function" && isCloudReady()) {
        try {
          await cloudJoinProjectByCode(code);
          render();
          return toast("Kasaya katÄ±ldÄ±n.");
        } catch (error) {
          return toast(friendlyCloudError(error));
        }
      }
      const project = state.projects.find((item) => normalizeCode(projectCode(item)) === code);
      if (!project) return toast("Bu kod bu cihazda yok. GerÃ§ekte bulut veritabanÄ±ndan aÃ§Ä±lacak.");
      const userId = state.activeUserId || state.users[0]?.id;
      if (userId && !project.memberIds.includes(userId)) project.memberIds.push(userId);
      state.activeProjectId = project.id;
      draft = makeDraft();
      saveState();
      render();
      toast("Projeye katÄ±ldÄ±n.");
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

      if (!enteredAmount || enteredAmount <= 0) return toast("Ã–nce tutarÄ± yazalÄ±m.");
      if (!currencyOptions.some((item) => item.code === currency)) return toast("Para birimini seÃ§elim.");
      if (!exchangeRate || exchangeRate <= 0) return toast("DÃ¶viz iÃ§in kuru yazalÄ±m.");
      if (!headingName) return toast("Bir baÅŸlÄ±k yazalÄ±m.");
      if (!activeMembers().length) return toast("Ã–nce projeye kullanÄ±cÄ± baÄŸlayalÄ±m.");

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
      draft.notificationEmoji = String(data.get("notificationEmoji") || draft.notificationEmoji || "ğŸ²").trim();
      draft.notificationGif = String(data.get("notificationGif") || "").trim();
      draft.successReaction = String(data.get("successReaction") || draft.successReaction || "âœ…").trim();
      draft.successGif = String(data.get("successGif") || "").trim();
      draft.failReaction = String(data.get("failReaction") || draft.failReaction || "ğŸ™ƒ").trim();
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
        emoji: notificationMedia.emoji || "ğŸ²",
        gif: notificationMedia.gif,
        photoName: notificationMedia.photoName,
        photoData: notificationMedia.photoData,
        successReaction: successMedia.emoji || "âœ…",
        successGif: successMedia.gif,
        successPhotoName: successMedia.photoName,
        successPhotoData: successMedia.photoData,
        failReaction: failMedia.emoji || "ğŸ™ƒ",
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
      if (!name) return toast("BaÅŸlÄ±k adÄ±nÄ± yazalÄ±m.");
      ensureHeading(name, String(data.get("shortName") || "").trim() || name, draft.emoji);
      saveState();
      render();
      toast("BaÅŸlÄ±k eklendi.");
    });
  }

  app.querySelectorAll("#userForm, #projectUserForm").forEach((userForm) => {
    userForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(userForm);
      const name = String(data.get("userName") || "").trim();
      if (!name) return toast((typeof isCloudReady === "function" && isCloudReady()) ? "Kasaya eklenecek e-postayÄ± yazalÄ±m." : "Kasaya eklenecek kullanÄ±cÄ± adÄ±nÄ± yazalÄ±m.");
      if (typeof isCloudReady === "function" && isCloudReady()) {
        try {
          await cloudAddMemberByEmail(name);
          render();
          return toast("KullanÄ±cÄ± kasaya eklendi.");
        } catch (error) {
          return toast(friendlyCloudError(error));
        }
      }
      const result = addUserToActiveProjectByName(name);
      if (result.status === "forbidden") return toast("KullanÄ±cÄ± eklemeyi sadece kasa sahibi yapar.");
      if (result.status === "missing-user") return toast("Bu adda kullanÄ±cÄ± yok. Ã–nce profilini oluÅŸtur.");
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
      if (result.status === "missing-user") return toast("Bu kullanÄ±cÄ± bu kasada yok.");
      saveState();
      render();
      toast("Kasa iÃ§i lakap kaydedildi.");
    });
  });

  const projectForm = app.querySelector("#projectForm");
  if (projectForm) {
    projectForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(projectForm);
      const name = String(data.get("projectName") || "").trim();
      if (!name) return toast("Proje adÄ±nÄ± yazalÄ±m.");
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

function profileLabel(user) {
  return user?.nickname || shortName(user?.name || "");
}

function projectAliasFor(userId, project = activeProject()) {
  return project?.memberAliases?.[userId] || "";
}

function projectUserLabel(user, project = activeProject()) {
  if (!user) return "KullanÄ±cÄ±";
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
  if (!user.createdBy) return "Ä°lk hesap";
  const creator = state.users.find((item) => item.id === user.createdBy);
  return creator ? `${profileLabel(creator)} oluÅŸturdu` : "OluÅŸturan bilinmiyor";
}

function createUser(name, password = "", options = {}) {
  const user = {
    id: options.id || makeId(),
    name,
    nickname: String(options.nickname || "").trim(),
    email: options.email || "",
    password: normalizePassword(password),
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
  const clean = normalize(seed).replace(/[^a-z0-9ÄŸÃ¼ÅŸÃ¶Ã§Ä±Ä°]/gi, "").slice(0, 3).toLocaleUpperCase("tr-TR") || "KSA";
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
  return projectEntries().filter((entry) => entry.status === "done").sort(byDateDesc);
}

function pendingEntries() {
  return projectEntries().filter((entry) => entry.status === "pending").sort(byDateAsc);
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
    title: entry.shortName || entry.headingName,
    amount: entry.amount,
    emoji: options.emoji || "ğŸ²",
    photoName: options.photoName || "",
    photoData: options.photoData || "",
    gif: options.gif || "",
    successReaction: options.successReaction || "âœ…",
    successPhotoName: options.successPhotoName || "",
    successPhotoData: options.successPhotoData || "",
    successGif: options.successGif || "",
    failReaction: options.failReaction || "ğŸ™ƒ",
    failPhotoName: options.failPhotoName || "",
    failPhotoData: options.failPhotoData || "",
    failGif: options.failGif || "",
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

  const result = {
    userId: user.id,
    guess,
    correct: guess === notification.actualType,
    at: new Date().toISOString(),
  };
  notification.guesses.push(result);
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
  if (!userId) return false;
  if (entry.userId === userId) return true;

  const notification = entryNotification(entry);
  if (!notification) return false;
  if (notification.mode !== "surprise") return true;
  if (!notification.recipients?.includes(userId)) return true;
  return Boolean(notificationGuessFor(notification, userId));
}

function notificationMedia(notification) {
  return {
    emoji: notification?.emoji || "ğŸ²",
    photoName: notification?.photoName || "",
    photoData: notification?.photoData || "",
    gif: notification?.gif || "",
  };
}

function notificationReactionMedia(notification, guess) {
  if (!notification || !guess) return {};
  if (guess.correct) {
    return {
      emoji: notification.successReaction || "âœ…",
      photoName: notification.successPhotoName || "",
      photoData: notification.successPhotoData || "",
      gif: notification.successGif || "",
    };
  }
  return {
    emoji: notification.failReaction || "ğŸ™ƒ",
    photoName: notification.failPhotoName || "",
    photoData: notification.failPhotoData || "",
    gif: notification.failGif || "",
  };
}

function mediaPreviewHtml(media = {}, fallback = "ğŸ²") {
  if (media.photoData) return `<img class="media-image" src="${media.photoData}" alt="${media.photoName || "Medya"}" />`;
  if (media.gif) {
    const value = String(media.gif).trim();
    if (/^https?:\/\//i.test(value)) return `<img class="media-image" src="${value}" alt="GIF" />`;
    return `<span class="media-gif">${value}</span>`;
  }
  if (media.photoName) return `<span class="media-gif">ğŸ“ ${media.photoName}</span>`;
  return `<span>${media.emoji || fallback}</span>`;
}

function entryGameStatus(entry, userId = currentUser()?.id) {
  const notification = entryNotification(entry);
  if (!notification) return "";
  if (notification.mode !== "surprise") return "AÃ§Ä±k bildirim";
  if (entry.userId === userId) return "SÃ¼rpriz gÃ¶nderildi";
  const guess = notificationGuessFor(notification, userId);
  if (!guess) return "SÃ¼rpriz kilitli";
  return guess.correct ? "Oyunda doÄŸru bildin" : "Oyunda yanÄ±ldÄ±n";
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
    emoji: emoji || "ğŸ§¾",
  };
  state.headings.push(heading);
  return heading;
}

function toggleUserInProject(userId) {
  const project = activeProject();
  if (!isProjectOwner(project)) {
    toast("KullanÄ±cÄ±larÄ± sadece kasa sahibi dÃ¼zenler.");
    return;
  }
  if (userId === projectOwnerId(project)) {
    toast("Kasa sahibini kasadan Ã§Ä±karamayÄ±z.");
    return;
  }
  if (!project.memberIds.includes(userId)) {
    project.memberIds.push(userId);
    return;
  }
  if (project.memberIds.length === 1) {
    toast("Projede en az bir kullanÄ±cÄ± kalsÄ±n.");
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
    note: pending.note ? `${pending.note} Â· gerÃ§ekleÅŸti` : "Takvimden gerÃ§ekleÅŸti",
  });

  saveState();
  render();
  toast(pending.type === "receivable" ? "Alacak gelir olarak kaydedildi." : "Ã–deme gider olarak kaydedildi.");
}

function headingPreview() {
  return `<div class="chips" style="margin-top: 12px;">${projectHeadings().slice(0, 6).map((heading) => `<span class="chip static-chip">${heading.emoji} ${heading.shortName}</span>`).join("")}</div>`;
}

function pendingDetailRows(type) {
  const entries = pendingEntriesByType(type);
  const label = type === "receivable" ? "gelecek" : "gidecek";
  if (!entries.length) return `<div class="empty-state">Åimdilik ${label} bir kayÄ±t yok.</div>`;
  return entries
    .map((entry) => {
      const user = state.users.find((item) => item.id === entry.userId);
      return `
        <div class="expense-row">
          <span class="emoji-dot">${entry.emoji || (type === "receivable" ? "ğŸ¤" : "â°")}</span>
          <div class="expense-main">
            <p class="expense-title">${entry.shortName || entry.headingName}</p>
            <p class="expense-meta">${projectUserLabel(user)} Â· ${formatShortDate(entry.date)} Â· ${type === "receivable" ? "Åu gelecek" : "Bu gidecek"}</p>
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
      <span class="emoji-dot">ğŸ“</span>
      <div class="expense-main">
        <p class="expense-title">${project.name}</p>
        <p class="expense-meta">${project.purpose} Â· ${project.memberIds.length} Ã¼ye Â· ${projectCode(project)}</p>
      </div>
      <button class="mini-action" data-action="activate-project" data-id="${project.id}" type="button">${project.id === state.activeProjectId ? "Aktif" : "SeÃ§"}</button>
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
          <p class="expense-meta">${notification.title} Â· ${money(notification.amount)}</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="notification-card">
      <div class="notification-hero">${media}</div>
      <div class="expense-main">
        <p class="expense-title">${projectUserLabel(actor)} sÃ¼rpriz hareket gÃ¶nderdi</p>
        <p class="expense-meta">${
          guess
            ? `AÃ§Ä±ldÄ±: ${typeLabel} Â· ${notification.title} Â· ${money(notification.amount)}`
            : "Gelir mi gider mi? Tahmin et. Kasa detayÄ± tahmin bitene kadar kapalÄ±."
        }</p>
        ${
          guess
            ? `<div class="reaction-result ${guess.correct ? "correct" : "wrong"}">
                <span>${guess.correct ? "DoÄŸru bildin." : "YanlÄ±ÅŸ tahmin."}</span>
                <span class="reaction-media">${mediaPreviewHtml(notificationReactionMedia(notification, guess), guess.correct ? "âœ…" : "ğŸ™ƒ")}</span>
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
  const aliasText = alias ? `Bu kasadaki lakap: ${alias}` : "Kasa iÃ§i lakap yok";
  const action = isOwner
    ? `<span class="mini-action linked">Sahip</span>`
    : canManage
      ? `<button class="mini-action ${linked ? "linked" : ""}" data-action="toggle-user-project" data-id="${user.id}" type="button">${linked ? "Ã‡Ä±kar" : "BaÄŸla"}</button>`
      : `<span class="neutral-pill">${linked ? "Ãœye" : "DÄ±ÅŸarÄ±da"}</span>`;

  return `
    <div class="member-card">
      <div class="expense-row">
        <span class="emoji-dot">ğŸ‘¤</span>
        <div class="expense-main">
          <p class="expense-title">${label}</p>
          <p class="expense-meta">${user.name} Â· ${aliasText} Â· profil: ${profileLabel(user)} Â· ${isOwner ? "Kasa sahibi" : linked ? "Bu kasada" : "Bu kasada yok"} Â· ${user.password ? "Åifreli" : "Åifresiz"} Â· ${createdByLabel(user)}</p>
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
  return `
    <div class="expense-row">
      <span class="emoji-dot">${entry.emoji || type?.emoji || "ğŸ§¾"}</span>
      <div class="expense-main">
        <p class="expense-title">${entry.shortName || entry.headingName}</p>
        <p class="expense-meta">${projectUserLabel(user)} Â· ${type?.label || "Hareket"} Â· ${formatShortDate(entry.date)}${exchange ? ` Â· ${exchange}` : ""}</p>
        ${entry.note ? `<p class="expense-note">${entry.note}</p>` : ""}
      </div>
      <strong class="expense-price ${entry.type === "income" ? "price-positive" : entry.type === "expense" ? "price-negative" : ""}">
        ${entry.type === "income" ? "+" : entry.type === "expense" ? "-" : ""}${money(entry.amount)}
      </strong>
    </div>
  `;
}

function movementEntryRow(entry) {
  const notification = entryNotification(entry);
  const guess = notificationGuessFor(notification);
  const gameStatus = entryGameStatus(entry);
  const entryMedia = entry.photoData ? mediaPreviewHtml({ photoData: entry.photoData, photoName: entry.photoName }, "ğŸ“") : "";
  const reactionMedia = guess ? mediaPreviewHtml(notificationReactionMedia(notification, guess), guess.correct ? "âœ…" : "ğŸ™ƒ") : "";
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
      <span class="emoji-dot">${entry.emoji || (isReceivable ? "ğŸ¤" : "â°")}</span>
      <div class="expense-main">
        <p class="expense-title">${entry.shortName || entry.headingName}</p>
        <p class="expense-meta">${isReceivable ? "Beklenen alacak" : "YaklaÅŸan Ã¶deme"} Â· ${formatShortDate(entry.date)}${exchange ? ` Â· ${exchange}` : ""}</p>
        ${entry.note ? `<p class="expense-note">${entry.note}</p>` : ""}
      </div>
      <div style="display:grid; gap:6px; justify-items:end;">
        <strong class="expense-price">${money(entry.amount)}</strong>
        <button class="mini-action" data-action="settle-pending" data-id="${entry.id}" type="button">${isReceivable ? "Geldi" : "Ã–dendi"}</button>
      </div>
    </div>
  `;
}

function balanceRow(item) {
  return `
    <div class="balance-row">
      <div>
        <div class="balance-name">${item.name}</div>
        <div class="balance-state">${item.balance >= 0 ? "AlacaklÄ±" : "BorÃ§lu"}</div>
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

  if (!grouped.length) return `<div class="empty-state">Bu dÃ¶nem iÃ§in gider kaydÄ± yok.</div>`;

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
  const done = entries.filter((entry) => entry.status === "done");
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
  const members = activeMembers();
  const shared = projectEntries().filter((entry) => entry.status === "done" && entry.type === "expense" && entry.settlement);
  if (!shared.length || !members.length) return [];

  const total = sum(shared);
  const share = total / members.length;

  return members
    .map((user) => {
      const paid = sum(shared.filter((entry) => entry.userId === user.id));
      return {
        userId: user.id,
        name: projectUserLabel(user),
        balance: Math.round(paid - share),
      };
    })
    .sort((a, b) => b.balance - a.balance);
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

function periodLabel(period) {
  if (period === "day") return "BugÃ¼n";
  if (period === "week") return "Bu hafta";
  if (period === "month") return "Bu ay";
  return "TÃ¼mÃ¼";
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
  const count = projectEntries().filter((entry) => entry.headingId === id).length;
  return `${count} kayÄ±t`;
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
  return `${formatCurrencyAmount(entry.enteredAmount || entry.amount, currency)} Ã— ${formatRate(entry.exchangeRate || 1)} = ${money(entry.amount)}`;
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
  const text = `${project.name}\nKod: ${projectCode(project)}\nLink: ${inviteLink(project)}\n\nNot: Bu sÃ¼rÃ¼m prototip. GerÃ§ek ortak kullanÄ±m iÃ§in bulut kayÄ±t baÄŸlanacak.`;
  try {
    await navigator.clipboard.writeText(text);
    toast("Proje kodu kopyalandÄ±.");
  } catch {
    toast(`Kod: ${projectCode(project)}`);
  }
}

async function shareReceipt() {
  const period = state.reportPeriod;
  const entries = actualEntries().filter((entry) => isInPeriod(entry.date, period));
  const totals = calculateTotals(entries);
  const label = period === "day" ? "BugÃ¼n" : period === "week" ? "Bu hafta" : "Bu ay";
  const exchangeLines = entries.map(exchangeText).filter(Boolean);
  const exchangeBlock = exchangeLines.length ? `\nKur hesabÄ±:\n${exchangeLines.join("\n")}` : "";
  const text = `KASA FÄ°ÅÄ°\n${activeProject().name}\n${label} giren: ${money(totals.income)}\n${label} Ã§Ä±kan: ${money(totals.expense)}\nNet: ${money(totals.actual)}${exchangeBlock}\nEn hareketli baÅŸlÄ±k: ${topHeading(entries)}`;

  try {
    if (navigator.share) {
      await navigator.share({ title: "Kasa FiÅŸi", text });
    } else {
      await navigator.clipboard.writeText(text);
      toast("FiÅŸ metni kopyalandÄ±.");
    }
  } catch {
    toast("PaylaÅŸÄ±m iptal edildi.");
  }
}

function byDateDesc(a, b) {
  return String(b.date).localeCompare(String(a.date));
}

function byDateAsc(a, b) {
  return String(a.date).localeCompare(String(b.date));
}

function shortName(name) {
  return String(name || "").replace(" AyyÄ±ldÄ±z", "");
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
  return isCloudReady() ? "Bulut aÃ§Ä±k" : "Yerel deneme";
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
  if (message.includes("column") && message.includes("does not exist")) return "Supabase yeni oyun alanlarÄ± eksik. supabase-game-fields.sql dosyasÄ±nÄ± SQL Editor'da Ã§alÄ±ÅŸtÄ±r.";
  if (message.includes("relation") || message.includes("does not exist")) return "Supabase tablolarÄ± kurulmamÄ±ÅŸ. supabase-schema.sql dosyasÄ±nÄ± Ã§alÄ±ÅŸtÄ±rmamÄ±z gerekiyor.";
  if (message.includes("row-level security")) return "Supabase izin kuralÄ± engelledi. SQL politikalarÄ±nÄ± kontrol etmemiz gerekiyor.";
  if (message.includes("Invalid login credentials")) return "E-posta veya ÅŸifre hatalÄ±.";
  if (message.includes("Email not confirmed")) return "Ã–nce e-postadaki doÄŸrulama linkine tÄ±kla.";
  return message || "Bulut iÅŸlemi tamamlanamadÄ±.";
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
    setCloudStatus("Bulut baÄŸlÄ±");
  } else {
    setCloudStatus("Bulut hazÄ±r");
  }
}

async function applyCloudUser(authUser, profileInput = {}) {
  if (!authUser?.id) return null;
  const metadata = authUser.user_metadata || {};
  const email = String(authUser.email || profileInput.email || "").trim().toLowerCase();
  const fallbackName = email ? email.split("@")[0] : "KullanÄ±cÄ±";
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
  if (!client) throw new Error("Bulut ayarÄ± yok.");
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
    setCloudStatus("Bulut baÄŸlÄ±");
  } else {
    state.authMode = "login";
    setCloudStatus("E-posta doÄŸrulama bekleniyor");
  }
  saveState();
  return data;
}

async function cloudSignIn({ email, password }) {
  const client = cloudDb();
  if (!client) throw new Error("Bulut ayarÄ± yok.");
  const { data, error } = await client.auth.signInWithPassword({
    email: String(email || "").trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  await applyCloudUser(data.user);
  await loadCloudData();
  await ensureCloudStarterProject();
  setCloudStatus("Bulut baÄŸlÄ±");
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
      name: profile.name || profile.email || "KullanÄ±cÄ±",
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
      headingName: entry.heading_name,
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
      successReaction: notification.success_reaction || "âœ…",
      successPhotoName: notification.success_photo_name || "",
      successPhotoData: notification.success_photo_data || "",
      successGif: notification.success_gif || "",
      failReaction: notification.fail_reaction || "ğŸ™ƒ",
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
  createProject(`${profileLabel(user)} KasasÄ±`, "Kendi bÃ¼tÃ§em");
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
        heading_name: entry.headingName,
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
        success_reaction: notification.successReaction || "âœ…",
        success_photo_name: notification.successPhotoName || "",
        success_photo_data: notification.successPhotoData || "",
        success_gif: notification.successGif || "",
        fail_reaction: notification.failReaction || "ğŸ™ƒ",
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
  if (!client) throw new Error("Bulut ayarÄ± yok.");
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
  if (!client || !project) throw new Error("Bulut ayarÄ± yok.");
  const { data, error } = await client.rpc("add_kasa_member_by_email", {
    project_uuid: project.id,
    member_email: String(email || "").trim().toLowerCase(),
  });
  if (error) throw error;
  await loadCloudData();
  saveState();
  return data;
}


initApp();

