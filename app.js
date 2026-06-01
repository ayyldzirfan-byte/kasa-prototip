const STORAGE_KEY = "kasa-prototype-state-v6";
const APP_UPDATED_AT = "02.06.2026 01:05";

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

const defaultUsers = [];

const seedState = {
  activeView: "home",
  reportPeriod: "month",
  settlementVisible: false,
  activeProjectId: "",
  activeUserId: "",
  signedInUserId: "",
  pendingLoginUserId: "",
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

  return {
    ...seedState,
    ...source,
    activeView: source.activeView || "home",
    activeProjectId,
    activeUserId,
    signedInUserId,
    pendingLoginUserId,
    authMode: source.authMode === "signup" ? "signup" : "login",
    users,
    projects,
    headings: Array.isArray(source.headings) ? source.headings : [],
    entries: Array.isArray(source.entries) ? source.entries : [],
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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
    calendar: renderCalendar,
    report: renderReport,
    group: renderGroup,
    headings: renderHeadings,
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
                <span class="field-label">Telefon / e-posta</span>
                <input class="text-input" name="email" placeholder="Örn. irfan@mail.com" autocomplete="email" />
              </label>
              <label>
                <span class="field-label">Şifre</span>
                <input class="text-input" name="password" type="password" placeholder="En az 4 karakter" autocomplete="new-password" />
              </label>
              <button class="primary-button" type="submit">Kullanıcı oluştur</button>
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
  return `
    <section class="form-card form-grid onboarding-card">
      <div>
        <p class="eyebrow">Kasa kurulumu</p>
        <h2>${profileLabel(user)}, şimdi kasa seç</h2>
        <p class="hero-note">Deneme sürümünde önce kendi kasanı kur. Diğer profilleri daha sonra aynı projenin içine manuel ekleyeceğiz.</p>
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
  const recent = actualEntries().slice(0, 4);
  const upcoming = pendingEntries().slice(0, 3);

  return `
    <section class="account-strip">
      <div>
        <span class="field-label">Aktif kullanıcı</span>
        <strong>${projectUserLabel(user)}</strong>
        <p>Yeni profil oluşturmak için çıkış yap.</p>
      </div>
      <button class="tiny-button" data-action="logout" type="button">Çıkış yap</button>
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
      <article class="stat-card">
        <p class="stat-label">Beklenen</p>
        <p class="stat-value">${money(totals.receivable)}</p>
      </article>
      <article class="stat-card">
        <p class="stat-label">Yaklaşan</p>
        <p class="stat-value">${money(totals.payable)}</p>
      </article>
    </section>

    <section class="card">
      <div class="section-head">
        <div>
          <h2>Başlıklar</h2>
          <p>${projectHeadings().length ? `${projectHeadings().length} özel başlık var.` : "Başlıkları kullanıcı belirler. Hazır kalıp yok."}</p>
        </div>
        <button class="tiny-button" data-action="open-headings" type="button">Düzenle</button>
      </div>
      ${projectHeadings().length ? headingPreview() : `<div class="empty-state" style="margin-top: 12px;">Market, kira, haraç, HGS... Kasanın dilini sen kur.</div>`}
    </section>

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
          <p>Gerçekleşen gelir ve giderler.</p>
        </div>
        <button class="tiny-button" data-action="go-add-expense" type="button">Ekle</button>
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

function renderReport() {
  const period = state.reportPeriod;
  const entries = actualEntries().filter((entry) => isInPeriod(entry.date, period));
  const totals = calculateTotals(entries);
  const label = period === "day" ? "Bugün" : period === "week" ? "Bu hafta" : "Bu ay";

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
          <p>Giren ${money(totals.income)}, çıkan ${money(totals.expense)}.</p>
        </div>
        <span class="quick-pill">${entries.length} kayıt</span>
      </div>
      <div class="bars" style="margin-top: 16px;">
        ${headingBars(entries)}
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
    </section>

    <section class="card">
      <h2>Projeye kişi ekle</h2>
      <p>${
        canManageUsers
          ? `Önce diğer profili oluştur. Sonra adını buraya yazıp ${project.name} kasasına ekle.`
          : `Şu an ${projectUserLabel(user)} hesabındasın. Kullanıcı eklemek için ${projectUserLabel(owner)} hesabıyla giriş yap.`
      }</p>
      ${
        canManageUsers
          ? `
            <form class="inline-form featured-form" id="projectUserForm">
              <input class="text-input" name="userName" placeholder="Örn. Havva veya Derya" autocomplete="off" />
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
          <p>Bu denemede katılımı manuel profil ekleyerek yapıyoruz. Kod/link modeli gerçek çoklu telefon sürümüne kalacak.</p>
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
              <input class="text-input" name="userName" placeholder="Kullanıcı adı: Havva" autocomplete="off" />
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
    button.addEventListener("click", () => {
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
      }
      draft.type = button.dataset.entryType;
      draft.emoji = emojiOptionsFor(draft.type)[0] || entryTypes.find((type) => type.id === draft.type)?.emoji || draft.emoji;
      render();
    });
  });

  app.querySelectorAll("[data-chip='emoji']").forEach((button) => {
    button.addEventListener("click", () => {
      draft.emoji = button.dataset.value;
      render();
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
    accountForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(accountForm);
      const name = String(data.get("userName") || "").trim();
      const password = normalizePassword(data.get("password"));
      if (!name) return toast("Ad soyad yazalım.");
      if (password.length < 4) return toast("Şifre en az 4 karakter olsun.");
      const user = createUser(name, password, {
        email: String(data.get("email") || "").trim(),
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
    firstProjectForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(firstProjectForm);
      const name = String(data.get("projectName") || "").trim();
      if (!name) return toast("Kasa adını yazalım.");
      createProject(name, String(data.get("purpose") || "").trim() || "Genel kasa");
      saveState();
      render();
      toast("Kasa oluşturuldu.");
    });
  }

  const loginForm = app.querySelector("#loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(loginForm);
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
    joinProjectForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const code = normalizeCode(new FormData(joinProjectForm).get("projectCode"));
      if (!code) return toast("Proje kodunu yazalım.");
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

    entryForm.addEventListener("submit", (event) => {
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

      state.entries.unshift({
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
        photoName: data.get("photo")?.name || "",
        settlement,
        status: ["receivable", "payable"].includes(draft.type) ? "pending" : "done",
        createdAt: new Date().toISOString(),
      });

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
    userForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(userForm);
      const name = String(data.get("userName") || "").trim();
      if (!name) return toast("Kasaya eklenecek kullanıcı adını yazalım.");
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
    projectForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(projectForm);
      const name = String(data.get("projectName") || "").trim();
      if (!name) return toast("Proje adını yazalım.");
      createProject(name, String(data.get("purpose") || "").trim() || "Genel kasa");
      saveState();
      render();
      toast("Proje eklendi.");
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
  if (!user) return "Kullanıcı";
  return projectAliasFor(user.id, project) || profileLabel(user);
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
    id: makeId(),
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

function projectEntries() {
  return state.entries.filter((entry) => entry.projectId === activeProject().id);
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

function userLinkRow(user) {
  const project = activeProject();
  const linked = project.memberIds.includes(user.id);
  const canManage = isProjectOwner(project);
  const isOwner = user.id === projectOwnerId(project);
  const alias = projectAliasFor(user.id, project);
  const label = projectUserLabel(user, project);
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
          <p class="expense-meta">${user.name}${alias ? ` · profil lakabı: ${profileLabel(user)}` : ""} · ${isOwner ? "Kasa sahibi" : linked ? "Bu kasada" : "Bu kasada yok"} · ${user.password ? "Şifreli" : "Şifresiz"} · ${createdByLabel(user)}</p>
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
      <span class="emoji-dot">${entry.emoji || type?.emoji || "🧾"}</span>
      <div class="expense-main">
        <p class="expense-title">${entry.shortName || entry.headingName}</p>
        <p class="expense-meta">${projectUserLabel(user)} · ${type?.label || "Hareket"} · ${formatShortDate(entry.date)}${exchange ? ` · ${exchange}` : ""}</p>
        ${entry.note ? `<p class="expense-note">${entry.note}</p>` : ""}
      </div>
      <strong class="expense-price ${entry.type === "income" ? "price-positive" : entry.type === "expense" ? "price-negative" : ""}">
        ${entry.type === "income" ? "+" : entry.type === "expense" ? "-" : ""}${money(entry.amount)}
      </strong>
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
        <p class="expense-title">${entry.shortName || entry.headingName}</p>
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
  if (period === "day") return value === todayKey();
  if (period === "week") return isThisWeek(value);
  return isThisMonth(value);
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

initApp();
