/* Kasam production layer: brand, security, offline sync, onboarding, statements, insights and KVKK. */

var KASAM_UPDATED_AT = "09.06.2026 00:24";
var KASAM_BRAND = {
  name: "Kasam",
  slogan: "Paranın nereye gittiğini bil.",
  subSlogan: "Kişisel ve ortak harcamaların tek ekranda.",
  watermark: "kasam.app",
};
var KASAM_TOASTS = {
  saved: "Kaydedildi.",
  updated: "Güncellendi.",
  deleted: "Silindi.",
  network: "Bağlantı kurulamadı. Veriler güvende, tekrar denenecek.",
  forbidden: "Bu kasaya erişim iznin yok.",
  generic: "Bir şeyler ters gitti. Tekrar dene.",
};
var KASAM_EMPTY = {
  movements: "Henüz bir hareket yok. İlk hareketi sen ekle.",
  budgets: "Henüz bütçe yok. Kendi kasanı oluştur veya birine katıl.",
  notifications: "Sessizlik... Henüz sürpriz yok.",
  calendarDay: "Bu gün temiz. Harcama yok.",
};

function kasamEscape(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function kasamCleanText(value, maxLength = 200) {
  const raw = String(value ?? "");
  const sanitized = window.DOMPurify
    ? window.DOMPurify.sanitize(raw, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
    : raw;
  return String(sanitized)
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function kasamSafe(value, maxLength = 200) {
  return kasamEscape(kasamCleanText(value, maxLength));
}

function kasamSafeUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(text)) return text;
  if (/^https?:\/\//i.test(text)) return kasamEscape(text);
  return "";
}

function kasamNow() {
  return new Date().toISOString();
}

function kasamIsOnline() {
  return navigator.onLine !== false;
}

function kasamProjectForEntry(entry) {
  return (state.projects || []).find((project) => project.id === entry?.projectId) || null;
}

function kasamCurrentUserCanSeeProject(project) {
  const user = currentUser();
  return Boolean(user?.id && project && ((project.memberIds || []).includes(user.id) || project.createdBy === user.id));
}

function kasamVisibleProjects() {
  return (state.projects || []).filter(kasamCurrentUserCanSeeProject);
}

function kasamConfirmedEntries(entries) {
  return (entries || []).filter((entry) => entry.status === "done" && entryConfirmed(entry));
}

function kasamPeriodEntries(entries, period, offset = 0) {
  if (period === "all") return offset === 0 ? entries : [];
  return entriesForPeriod(entries, period, offset);
}

function kasamFormatDateTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function kasamFormatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(dateFromKey(String(value).slice(0, 10)));
}

function kasamToast(message) {
  toast(kasamCleanText(message || KASAM_TOASTS.generic, 220));
}

function kasamIcon(name, className = "icon-neutral") {
  return `<i class="kasam-icon ${className}" data-lucide="${kasamEscape(name)}" aria-hidden="true"></i>`;
}

function kasamEntryTypeIcon(type) {
  return { income: "trending-up", expense: "trending-down", receivable: "hand-coins", payable: "calendar-clock" }[type] || "activity";
}

function kasamMovementIcon(entry) {
  const type = entry?.type || "expense";
  if (type === "income" || type === "receivable") return kasamIcon("arrow-down-left", "icon-income");
  if (entry?.status === "pending") return kasamIcon("clock", "icon-pending");
  return kasamIcon("arrow-up-right", "icon-expense");
}

function kasamInsightIcon(type) {
  const map = { anomaly: "alert-triangle", weekly: "calendar-check", monthly: "lightbulb", goal: "target", coaching: "lightbulb", success: "trophy" };
  const name = map[type] || "lightbulb";
  const tone = type === "anomaly" ? "icon-expense" : type === "goal" ? "icon-income" : "icon-pending";
  return kasamIcon(name, tone);
}

function kasamRenderLucide() {
  if (window.lucide?.createIcons) window.lucide.createIcons();
}

if (typeof bankColumnMaps === "object") {
  bankColumnMaps.qnb = { label: "QNB", dateCol: 0, descCol: 1, amountCol: 2, delimiter: ";" };
}

var kasamBaseParseAmount = parseAmount;
parseAmount = function parseAmountKasam(value) {
  const text = String(value ?? "").trim();
  if (/^-/.test(text) || /-\d/.test(text)) return 0;
  const amount = kasamBaseParseAmount(value);
  return amount < 0 ? 0 : amount;
};

money = function moneyKasam(value) {
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(Number(value || 0)))} TL`;
};

formatCurrencyAmount = function formatCurrencyAmountKasam(value, currency = "TRY") {
  const label = currency === "TRY" ? "TL" : currency;
  const decimals = currency === "TRY" ? 0 : 2;
  return `${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: decimals }).format(Number(value || 0))} ${label}`;
};

var kasamBaseNormalizeState = normalizeState;
normalizeState = function normalizeStateKasam(saved) {
  const normalized = kasamBaseNormalizeState(saved);
  normalized.onboardingStep = normalized.onboardingStep || "welcome";
  normalized.legalAcceptedAt = normalized.legalAcceptedAt || "";
  normalized.offlineQueue = Array.isArray(normalized.offlineQueue) ? normalized.offlineQueue : [];
  normalized.retryQueue = Array.isArray(normalized.retryQueue) ? normalized.retryQueue : [];
  normalized.errors = Array.isArray(normalized.errors) ? normalized.errors : [];
  normalized.insights = Array.isArray(normalized.insights) ? normalized.insights : [];
  normalized.joinRequests = Array.isArray(normalized.joinRequests) ? normalized.joinRequests : [];
  normalized.lastInsightRun = normalized.lastInsightRun || {};
  normalized.installPromptDismissedAt = normalized.installPromptDismissedAt || "";

  normalized.users = (normalized.users || []).map((user) => ({
    ...user,
    name: kasamCleanText(user.name || "Kullanıcı"),
    nickname: kasamCleanText(user.nickname || ""),
    email: kasamCleanText(user.email || "", 120),
    exportReadyAt: user.exportReadyAt || "",
    legalAcceptedAt: user.legalAcceptedAt || "",
  }));

  normalized.projects = (normalized.projects || []).map((project) => ({
    ...project,
    name: kasamCleanText(project.name || "Kendi Kasam"),
    purpose: kasamCleanText(project.purpose || "Kişisel bütçe"),
    code: project.code || generateProjectCode(project.name || "kasam"),
    archivedAt: project.archivedAt || "",
    joinApprovalRequired: project.joinApprovalRequired !== false,
  }));

  normalized.headings = (normalized.headings || []).map((heading) => ({
    ...heading,
    name: kasamCleanText(heading.name || "Başlık"),
    shortName: kasamCleanText(heading.shortName || heading.name || "Başlık"),
  }));

  normalized.entries = (normalized.entries || []).map((entry) => ({
    ...entry,
    shortName: kasamCleanText(entry.shortName || entry.headingName || "Hareket"),
    note: kasamCleanText(entry.note || ""),
    updatedAt: entry.updatedAt || entry.updated_at || entry.createdAt || kasamNow(),
    status: ["done", "pending"].includes(entry.status) ? entry.status : "done",
  }));

  normalized.notifications = (normalized.notifications || []).map((notification) => ({
    ...notification,
    title: kasamCleanText(notification.title || "Hareket"),
    isRead: Boolean(notification.isRead),
  }));

  normalized.reconciliations = (normalized.reconciliations || []).map((item) => ({
    ...item,
    projectId: item.projectId || "",
    formatType: item.formatType || item.format_type || "csv",
    matchedEntryIds: Array.isArray(item.matchedEntryIds) ? item.matchedEntryIds : item.matched_entry_ids || [],
    unmatchedRows: Array.isArray(item.unmatchedRows) ? item.unmatchedRows : item.unmatched_rows || [],
    aiAnalysis: item.aiAnalysis || item.ai_analysis || null,
  }));

  normalized.insights = normalized.insights.map((insight) => ({
    id: insight.id || makeId(),
    userId: insight.userId || normalized.signedInUserId || "",
    projectId: insight.projectId || "",
    type: insight.type || "coaching",
    period: insight.period || monthKey(),
    insightData: insight.insightData || insight.insight_data || {},
    message: kasamCleanText(insight.message || ""),
    actionSuggestion: kasamCleanText(insight.actionSuggestion || insight.action_suggestion || ""),
    isRead: Boolean(insight.isRead || insight.is_read),
    createdAt: insight.createdAt || insight.created_at || kasamNow(),
  }));

  return normalized;
};

profileLabel = function profileLabelKasam(user) {
  return kasamSafe(user?.nickname || shortName(user?.name || "") || "Kullanıcı");
};

projectUserLabel = function projectUserLabelKasam(user, project = activeProject()) {
  if (!user) return "Kullanıcı";
  const base = kasamCleanText(user.nickname || shortName(user.name) || user.name || "Kullanıcı");
  const alias = kasamCleanText(projectAliasFor(user.id, project));
  if (!alias || normalize(alias) === normalize(base)) return kasamEscape(base);
  return `${kasamEscape(base)} (${kasamEscape(alias)})`;
};

entryTitle = function entryTitleKasam(entry) {
  const heading = entryHeading(entry);
  return kasamSafe(entry?.shortName || heading.shortName || heading.name || "Hareket");
};

function kasamDisplayName(user) {
  return kasamEscape(kasamCleanText(user?.name || user?.email || "Kullanıcı"));
}

var kasamBaseFriendlyCloudError = friendlyCloudError;
friendlyCloudError = function friendlyCloudErrorKasam(error) {
  const message = error?.message || String(error || "");
  if (/row-level security|permission denied|not allowed|unauthorized|forbidden/i.test(message)) return KASAM_TOASTS.forbidden;
  if (/network|fetch|Failed to fetch|timeout|offline/i.test(message)) return KASAM_TOASTS.network;
  if (/Invalid login credentials/i.test(message)) return "E-posta veya şifre hatalı.";
  if (/Email not confirmed/i.test(message)) return "Önce e-postadaki doğrulama linkine tıkla.";
  return kasamBaseFriendlyCloudError ? kasamBaseFriendlyCloudError(error) : KASAM_TOASTS.generic;
};

function logError(error, context = "app") {
  const payload = {
    id: makeId(),
    context,
    message: error?.message || String(error || KASAM_TOASTS.generic),
    stack: error?.stack || "",
    createdAt: kasamNow(),
  };
  console.error("[Kasam]", payload.context, error);
  window.Sentry?.captureException?.(error, { tags: { context } });
  if (state?.errors) {
    state.errors.unshift(payload);
    state.errors = state.errors.slice(0, 25);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  return payload;
}

window.onerror = function kasamWindowError(message, source, lineno, colno, error) {
  logError(error || new Error(`${message} (${source}:${lineno}:${colno})`), "window.onerror");
  kasamToast(KASAM_TOASTS.generic);
};

window.onunhandledrejection = function kasamUnhandledRejection(event) {
  logError(event.reason || new Error("Unhandled promise rejection"), "unhandledrejection");
  kasamToast(KASAM_TOASTS.generic);
};

function queueCloudRetry(operation) {
  if (!state) return;
  state.retryQueue = Array.isArray(state.retryQueue) ? state.retryQueue : [];
  state.retryQueue.push({
    id: makeId(),
    operation: operation.operation || "pushState",
    payload: operation.payload || null,
    attempts: Number(operation.attempts || 0),
    nextAttemptAt: operation.nextAttemptAt || new Date(Date.now() + 5000).toISOString(),
    createdAt: kasamNow(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

var kasamBaseScheduleCloudSync = typeof scheduleCloudSync === "function" ? scheduleCloudSync : null;
scheduleCloudSync = function scheduleCloudSyncKasam() {
  if (!state?.signedInUserId || !(typeof isCloudReady === "function" && isCloudReady())) return;
  if (!kasamIsOnline()) {
    setCloudStatus("Çevrimdışı");
    queueCloudRetry({ operation: "pushState" });
    return;
  }
  if (kasamBaseScheduleCloudSync) kasamBaseScheduleCloudSync();
};

async function processRetryQueue(manual = false) {
  if (!state || !(typeof isCloudReady === "function" && isCloudReady()) || !state.signedInUserId) return;
  if (!kasamIsOnline()) {
    setCloudStatus("Çevrimdışı");
    if (manual) kasamToast("İnternet bağlantını kontrol et.");
    return;
  }
  state.retryQueue = Array.isArray(state.retryQueue) ? state.retryQueue : [];
  const due = state.retryQueue.filter((item) => new Date(item.nextAttemptAt || 0).getTime() <= Date.now());
  if (!due.length) return;
  state.retryQueue = state.retryQueue.filter((item) => !due.includes(item));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  try {
    await cloudPushState();
    setCloudStatus("Bulut senkron");
    if (manual) kasamToast("Güncellendi.");
  } catch (error) {
    due.forEach((item) => {
      const attempts = Number(item.attempts || 0) + 1;
      const delay = attempts === 1 ? 5000 : 30000;
      queueCloudRetry({ ...item, attempts, nextAttemptAt: new Date(Date.now() + delay).toISOString() });
    });
    setCloudStatus("İnternet bağlantını kontrol et");
    if (manual) kasamToast("İnternet bağlantını kontrol et.");
  }
}

window.addEventListener("online", () => {
  setCloudStatus("Bağlantı geri geldi");
  processRetryQueue(true).catch((error) => logError(error, "retry-online"));
  render();
});
window.addEventListener("offline", () => {
  setCloudStatus("Çevrimdışı");
  render();
});

function applyProductionChrome() {
  if (window.pdfjsLib?.GlobalWorkerOptions && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
  }
  document.title = "Kasam";
  document.documentElement.lang = "tr";
  document.querySelector("meta[name='theme-color']")?.setAttribute("content", "#f7f8f5");
  document.querySelector("meta[name='apple-mobile-web-app-title']")?.setAttribute("content", "Kasam");
  const eyebrow = document.querySelector(".topbar .eyebrow");
  if (eyebrow) eyebrow.textContent = KASAM_BRAND.slogan;
  const title = document.querySelector(".topbar h1");
  if (title) title.textContent = KASAM_BRAND.name;
  const reset = document.querySelector("#demoReset");
  if (reset) {
    reset.textContent = "Sıfırla";
    reset.setAttribute("aria-label", "Kasam verilerini sıfırla");
  }
  const stamp = document.querySelector(".update-stamp");
  if (stamp) stamp.textContent = `Güncellendi ${KASAM_UPDATED_AT}`;
  document.querySelector(".offline-badge")?.remove();
  if (!kasamIsOnline()) {
    const badge = document.createElement("button");
    badge.className = "offline-badge";
    badge.type = "button";
    badge.dataset.action = "manual-retry";
    badge.innerHTML = `${kasamIcon("wifi-off", "icon-pending")} Çevrimdışı`;
    badge.addEventListener("click", () => processRetryQueue(true));
    document.querySelector(".top-actions")?.prepend(badge);
  }
}

function renderLegalPage(type) {
  const isPrivacy = type === "privacy";
  return `
    <section class="card legal-card">
      <p class="eyebrow">${KASAM_BRAND.name}</p>
      <h2>${isPrivacy ? "Gizlilik Politikası" : "Kullanım Şartları"}</h2>
      ${
        isPrivacy
          ? `
            <p>Kasam; ad, e-posta, profil bilgileri, bütçe, hareket, bildirim, ekstre ve rapor verilerini uygulama deneyimini sunmak için işler.</p>
            <p>Veriler Supabase altyapısında saklanır. Claude veya benzeri analiz servisleri yalnızca kullanıcının açıkça yüklediği ekstre/özet verisini analiz etmek için backend fonksiyonu üzerinden çağrılır.</p>
            <p>Veriler üçüncü taraflarla reklam amacıyla paylaşılmaz. Kullanıcı profilinden verilerini indirebilir veya hesabını silme talebi başlatabilir.</p>
            <p>İletişim: destek@kasam.app</p>
          `
          : `
            <p>Kasam, kişisel ve ortak bütçe takibi için yardımcı bir uygulamadır. Banka, ödeme kuruluşu veya finansal danışman değildir.</p>
            <p>Kullanıcı, girdiği verilerin doğruluğundan ve ortak bütçeye eklediği üyelerin izinlerinden sorumludur.</p>
            <p>Uygulama finansal kararları otomatik vermez; raporlar ve öneriler bilgilendirme amaçlıdır.</p>
          `
      }
      <button class="primary-button" data-action="legal-back" type="button">Uygulamaya dön</button>
    </section>
  `;
}

var kasamBaseRender = render;
render = function renderKasam() {
  if (state?.entries?.length) kasamBackfillEntryNotifications();
  const path = location.pathname.toLocaleLowerCase("tr-TR");
  if (path.endsWith("/gizlilik") || path.endsWith("/gizlilik.html")) {
    document.body.dataset.view = "legal";
    app.innerHTML = renderLegalPage("privacy");
    applyProductionChrome();
    bindScreen();
    kasamRenderLucide();
    return;
  }
  if (path.endsWith("/sartlar") || path.endsWith("/sartlar.html")) {
    document.body.dataset.view = "legal";
    app.innerHTML = renderLegalPage("terms");
    applyProductionChrome();
    bindScreen();
    kasamRenderLucide();
    return;
  }
  kasamBaseRender();
  applyProductionChrome();
  kasamRenderLucide();
  runInsightEngineQuietly();
};

function renderAuth() {
  const isSignup = state.authMode === "signup";
  const isLogin = state.authMode === "login";
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();
  const selectedLoginUserId = state.users.some((user) => user.id === state.pendingLoginUserId) ? state.pendingLoginUserId : state.users[state.users.length - 1]?.id || "";
  const showWelcome = state.onboardingStep === "welcome" && !state.users.length;
  if (showWelcome) {
    return `
      <section class="auth-card form-grid onboarding-card kasam-welcome">
        <div class="brand-lockup">
          <img src="./icon.svg" alt="Kasam logosu" />
          <p class="eyebrow">${KASAM_BRAND.slogan}</p>
          <h2>Kasam'a hoş geldin</h2>
          <p>Paranın nereye gittiğini artık bileceksin.</p>
        </div>
        <button class="primary-button" data-action="onboarding-start" type="button">Başla</button>
        <button class="secondary-button" data-action="demo-start" type="button">Demoyu keşfet</button>
        <button class="tiny-button" data-action="auth-mode" data-mode="login" type="button">Hesabım var</button>
      </section>
    `;
  }
  return `
    <section class="auth-card form-grid onboarding-card">
      <div class="brand-lockup">
        <img src="./icon.svg" alt="Kasam logosu" />
        <p class="eyebrow">${KASAM_BRAND.slogan}</p>
        <h2>${KASAM_BRAND.name}</h2>
        <p>${KASAM_BRAND.subSlogan}</p>
        <span class="cloud-pill">${typeof cloudLabel === "function" ? kasamSafe(cloudLabel()) : "Yerel deneme"}</span>
        ${state.cloudStatus ? `<span class="field-help">${kasamSafe(state.cloudStatus)}</span>` : ""}
      </div>
      <div class="auth-switch">
        <button class="${!isSignup ? "active" : ""}" data-action="auth-mode" data-mode="login" type="button">Giriş yap</button>
        <button class="${isSignup ? "active" : ""}" data-action="auth-mode" data-mode="signup" type="button">Yeni kullanıcı</button>
      </div>
      ${
        isSignup
          ? `
            <form class="form-grid" id="accountForm">
              <label><span class="field-label">Ad soyad</span><input class="text-input" name="userName" maxlength="200" placeholder="Ad soyad" autocomplete="name" /></label>
              <label><span class="field-label">Kısa isim</span><input class="text-input" name="nickname" maxlength="80" placeholder="Kısa isim" autocomplete="off" /></label>
              <label><span class="field-label">E-posta</span><input class="text-input" name="email" type="email" maxlength="120" placeholder="mail@ornek.com" autocomplete="email" /></label>
              <label><span class="field-label">Şifre</span><input class="text-input" name="password" type="password" placeholder="${cloudReady ? "En az 6 karakter" : "En az 4 karakter"}" autocomplete="new-password" /></label>
              <label class="check-row"><input name="legalAccepted" type="checkbox" /> <span>${kasamIcon("shield", "icon-income")} Gizlilik politikasını ve kullanım şartlarını okudum, kabul ediyorum.</span></label>
              <div class="legal-links"><a href="/gizlilik">Gizlilik</a><a href="/sartlar">Şartlar</a></div>
              <button class="primary-button" type="submit">${kasamIcon("check", "icon-neutral")} Kaydet</button>
            </form>
          `
          : cloudReady
            ? `
              <form class="form-grid" id="loginForm">
                <label><span class="field-label">E-posta</span><input class="text-input" name="loginEmail" type="email" maxlength="120" value="${kasamEscape(state.pendingLoginEmail || "")}" placeholder="mail@ornek.com" autocomplete="email" /></label>
                <label><span class="field-label">Şifre</span><input class="text-input" name="loginPassword" type="password" placeholder="Şifren" autocomplete="current-password" /></label>
                <button class="primary-button" type="submit">Giriş yap</button>
              </form>
            `
            : state.users.length
              ? `
                <form class="form-grid" id="loginForm">
                  <label><span class="field-label">Kullanıcı</span><select class="select-input" name="loginUserId">${state.users.map((user) => `<option value="${user.id}"${user.id === selectedLoginUserId ? " selected" : ""}>${projectUserLabel(user)}${user.email ? ` · ${kasamSafe(user.email)}` : ""}</option>`).join("")}</select></label>
                  <label><span class="field-label">Şifre</span><input class="text-input" name="loginPassword" type="password" placeholder="Şifren" autocomplete="current-password" /></label>
                  <button class="primary-button" type="submit">Giriş yap</button>
                </form>
              `
              : `<button class="primary-button" data-action="auth-mode" data-mode="signup" type="button">Yeni kullanıcı oluştur</button>`
      }
    </section>
  `;
}

async function handleAccountForm(form) {
  const data = new FormData(form);
  const name = kasamCleanText(data.get("userName"));
  const email = kasamCleanText(data.get("email"), 120).toLowerCase();
  const nickname = kasamCleanText(data.get("nickname"), 80);
  const password = normalizePassword(data.get("password"));
  const accepted = data.get("legalAccepted") === "on";
  if (!name) return kasamToast("Ad soyad yaz.");
  if (!accepted) return kasamToast("Devam etmek için gizlilik ve şartları kabul et.");
  if (typeof isCloudReady === "function" && isCloudReady()) {
    if (!email || !email.includes("@")) return kasamToast("Geçerli bir e-posta yaz.");
    if (password.length < 6) return kasamToast("Şifre en az 6 karakter olsun.");
    try {
      const result = await cloudSignUp({ name, email, password, nickname });
      const user = currentUser() || state.users.find((item) => normalize(item.email) === normalize(email));
      if (user) user.legalAcceptedAt = kasamNow();
      state.legalAcceptedAt = kasamNow();
      state.onboardingStep = "project";
      saveState();
      render();
      return kasamToast(result.session ? "Kaydedildi." : "Hesap açıldı. E-postadaki doğrulama linkini kontrol et.");
    } catch (error) {
      logError(error, "account-signup");
      return kasamToast(friendlyCloudError(error));
    }
  }
  if (password.length < 4) return kasamToast("Şifre en az 4 karakter olsun.");
  const user = createUser(name, password, { email, nickname, linkToProject: false });
  user.legalAcceptedAt = kasamNow();
  state.legalAcceptedAt = user.legalAcceptedAt;
  state.signedInUserId = "";
  state.activeUserId = "";
  state.pendingLoginUserId = user.id;
  state.authMode = "login";
  state.onboardingStep = "login";
  saveState();
  render();
  kasamToast("Kaydedildi. Şimdi giriş yap.");
}

async function handleLoginForm(form) {
  const data = new FormData(form);
  if (typeof isCloudReady === "function" && isCloudReady()) {
    const email = kasamCleanText(data.get("loginEmail"), 120).toLowerCase();
    const password = normalizePassword(data.get("loginPassword"));
    if (!email || !email.includes("@")) return kasamToast("E-postanı yaz.");
    if (!password) return kasamToast("Şifreni yaz.");
    try {
      await cloudSignIn({ email, password });
      state.onboardingStep = activeProject() ? "done" : "project";
      render();
      return kasamToast("Giriş yapıldı.");
    } catch (error) {
      logError(error, "account-login");
      return kasamToast(friendlyCloudError(error));
    }
  }
  const user = state.users.find((item) => item.id === String(data.get("loginUserId")));
  if (!state.users.length) return kasamToast("Önce kullanıcı oluştur.");
  if (!user) return kasamToast("Kullanıcı bulunamadı.");
  const password = normalizePassword(data.get("loginPassword"));
  if (user.password && normalizePassword(user.password) !== password) return kasamToast("Şifre yanlış.");
  state.signedInUserId = user.id;
  state.activeUserId = user.id;
  state.pendingLoginUserId = "";
  state.onboardingStep = activeProject() ? "done" : "project";
  draft = makeDraft();
  saveState();
  render();
  kasamToast("Giriş yapıldı.");
}

function renderProjectSetup() {
  const user = currentUser();
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();
  return `
    <section class="form-card form-grid onboarding-card">
      <div>
        <p class="eyebrow">${KASAM_BRAND.slogan}</p>
        <h2>${projectUserLabel(user)}, şimdi kasanı seç</h2>
        <p class="hero-note">Kendi bütçeni oluşturabilir veya ortak bütçeye kodla katılma talebi gönderebilirsin.</p>
      </div>
      <form class="form-grid" id="firstProjectForm">
        <label><span class="field-label">Bütçe adı</span><input class="text-input" name="projectName" maxlength="200" placeholder="Kendi Kasam" autocomplete="off" /></label>
        <label><span class="field-label">Amaç</span><input class="text-input" name="purpose" maxlength="200" placeholder="Kişisel bütçe" autocomplete="off" /></label>
        <button class="primary-button" type="submit">Kaydet</button>
      </form>
      <form class="form-grid join-card" id="joinProjectForm">
        <label><span class="field-label">Kod ile katıl</span><input class="text-input" name="projectCode" maxlength="40" placeholder="KASAM-..." autocomplete="off" /></label>
        <button class="secondary-button" type="submit">${cloudReady ? "Katılma talebi gönder" : "Bu cihazda katıl"}</button>
      </form>
      <button class="tiny-button" data-action="demo-start" type="button">Demoyu keşfet</button>
    </section>
  `;
}

async function handleFirstProjectForm(form) {
  const data = new FormData(form);
  const name = kasamCleanText(data.get("projectName") || "Kendi Kasam");
  const purpose = kasamCleanText(data.get("purpose") || "Kişisel bütçe");
  if (!name) return kasamToast("Bütçe adını yaz.");
  createProject(name, purpose);
  state.onboardingStep = "done";
  try {
    saveState();
    if (typeof isCloudReady === "function" && isCloudReady()) await cloudPushState();
    render();
    kasamToast("Kaydedildi.");
  } catch (error) {
    logError(error, "first-project");
    kasamToast(friendlyCloudError(error));
  }
}

async function handleProjectForm(form) {
  const data = new FormData(form);
  const name = kasamCleanText(data.get("projectName"));
  const purpose = kasamCleanText(data.get("purpose") || "Genel bütçe");
  if (!name) return kasamToast("Bütçe adını yaz.");
  const project = createProject(name, purpose);
  project.joinApprovalRequired = true;
  if (currentUser()?.id) setProjectMemberSince(project, currentUser().id, todayKey());
  state.groupMode = "detail";
  try {
    saveState();
    if (typeof isCloudReady === "function" && isCloudReady()) await cloudPushState();
    render();
    kasamToast("Kaydedildi.");
  } catch (error) {
    logError(error, "project-create");
    kasamToast(friendlyCloudError(error));
  }
}

async function handleJoinProjectForm(form) {
  const code = normalizeCode(new FormData(form).get("projectCode"));
  if (!code) return kasamToast("Bütçe kodunu yaz.");
  if (typeof isCloudReady === "function" && isCloudReady()) {
    try {
      await cloudJoinProjectByCode(code);
      render();
      return kasamToast("Katılma talebin gönderildi.");
    } catch (error) {
      logError(error, "join-project");
      return kasamToast(friendlyCloudError(error));
    }
  }
  const project = state.projects.find((item) => normalizeCode(projectCode(item)) === code);
  if (!project) return kasamToast("Bu kod bu cihazda yok.");
  const userId = currentUser()?.id || state.activeUserId || state.users[0]?.id;
  if (userId && !project.memberIds.includes(userId)) project.memberIds.push(userId);
  state.activeProjectId = project.id;
  state.groupMode = "detail";
  state.onboardingStep = "done";
  draft = makeDraft();
  saveState();
  render();
  kasamToast("Kaydedildi.");
}

async function cloudJoinProjectByCode(code) {
  const client = cloudDb();
  if (!client) throw new Error("Bulut ayarı yok.");
  const { data, error } = await client.rpc("request_kasa_project_access", { invite_code: normalizeCode(code) });
  if (error) throw error;
  state.joinRequests = Array.isArray(state.joinRequests) ? state.joinRequests : [];
  if (data) state.joinRequests.unshift({ id: data, code, status: "pending", createdAt: kasamNow() });
  saveState();
  return data;
}

async function cloudApproveJoinRequest(requestId, approved = true) {
  const client = cloudDb();
  if (!client) throw new Error("Bulut ayarı yok.");
  const { data, error } = await client.rpc("approve_kasa_join_request", { request_uuid: requestId, approve_request: approved });
  if (error) throw error;
  await loadCloudData();
  return data;
}

function kasamUnreadInsights() {
  const user = currentUser();
  if (!user) return [];
  return (state.insights || [])
    .filter((insight) => insight.userId === user.id && !insight.isRead)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function insightCardHtml() {
  const insights = kasamUnreadInsights();
  if (!insights.length) return "";
  const top = insights[0];
  const icon = kasamInsightIcon(top.type);
  return `
    <section class="card insight-card">
      <div class="section-head">
        <div><h2>Kasam sana ne diyor?</h2><p>${icon} ${kasamSafe(top.message || "Yeni bir öneri var.")}</p></div>
      </div>
      ${top.actionSuggestion ? `<p class="insight-action">${kasamSafe(top.actionSuggestion)}</p>` : ""}
      <div class="inline-actions">
        <button class="primary-button small-button" data-action="mark-insight-read" data-id="${top.id}" type="button">Anladım</button>
        <button class="secondary-button small-button" data-action="open-report" type="button">Detay</button>
      </div>
    </section>
  `;
}

function statusSummaryLabel(value) {
  return Number(value || 0) >= 0 ? "Dengede" : "Açık";
}

function renderHome() {
  const user = currentUser();
  const entries = personalLedgerEntries(user);
  const totals = calculateTotals(entries);
  const recent = kasamConfirmedEntries(entries).sort(byDateDesc).slice(0, 4);
  const upcoming = entries.filter((entry) => entry.status === "pending").sort(byDateAsc).slice(0, 3);
  const notificationCount = notificationEntries().length;
  const surpriseCount = lockedSurpriseCountForUser(user);

  return `
    <section class="account-strip clean-strip">
      <button class="profile-open-button" data-action="open-own-profile" type="button">
        ${memberAvatarHtml(user, activeProject(), "member-avatar")}
        <span>
          <strong>${projectUserLabel(user) || "Kasam"}</strong>
          <small>${state.cloudSyncAt ? `Bulut senkron: ${new Date(state.cloudSyncAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}` : KASAM_BRAND.subSlogan}</small>
        </span>
      </button>
      <div class="account-actions">
        <button class="tiny-button" data-action="open-notifications" type="button">${kasamIcon("bell", "icon-neutral")} Bildirimler${notificationCount ? ` (${notificationCount})` : ""}</button>
        <button class="tiny-button muted-button" data-action="logout" type="button">${kasamIcon("log-out", "icon-neutral")} Çıkış</button>
      </div>
    </section>

    <section class="hero personal-hero">
      <div class="hero-row">
        <div>
          <p class="hero-title">Net durum</p>
          <p class="hero-money">${money(totals.comfortable)}</p>
          <p class="hero-note">Kişisel kasan ve ortak bütçelerdeki payın.</p>
        </div>
        <span class="quick-pill ${totals.comfortable < 0 ? "danger-pill" : ""}">${statusSummaryLabel(totals.comfortable)}</span>
      </div>
    </section>

    ${insightCardHtml()}

    <section class="single-action-card">
      <button class="primary-button movement-add-button" data-action="go-add-movement" type="button">${kasamIcon("plus-circle", "icon-income")} Hareket ekle</button>
    </section>

    <section class="grid-2">
      <article class="stat-card"><p class="stat-label">Giren</p><p class="stat-value positive">${money(totals.income)}</p></article>
      <article class="stat-card"><p class="stat-label">Çıkan</p><p class="stat-value warning">${money(totals.expense)}</p></article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="receivable"><p class="stat-label">Beklenen</p><p class="stat-value">${money(totals.receivable)}</p></article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="payable"><p class="stat-label">Yaklaşan</p><p class="stat-value">${money(totals.payable)}</p></article>
    </section>

    ${
      state.pendingDetail
        ? `<section class="card"><div class="section-head"><div><h2>${state.pendingDetail === "receivable" ? "Beklenen gelirler" : "Yaklaşan giderler"}</h2></div><button class="tiny-button" data-action="hide-pending-detail" type="button">Kapat</button></div><div class="expense-list">${pendingRowsForUser(state.pendingDetail)}</div></section>`
        : ""
    }

    <section class="card">
      <div class="section-head"><div><h2>Bütçeler</h2></div><button class="tiny-button" data-action="open-projects-list" type="button">Yeni bütçe oluştur</button></div>
      <div class="project-list">${projectImpactRows()}</div>
    </section>

    <section class="card">
      <div class="section-head"><div><h2>Beklenen Hareketler</h2></div></div>
      <div class="expense-list">${upcoming.length ? upcoming.map(entrySummaryRow).join("") : `<div class="empty-state">${KASAM_EMPTY.calendarDay}</div>`}</div>
    </section>
    ${surpriseCount ? `<button class="surprise-alert-row" data-action="open-notifications" type="button">${kasamIcon("gift", "icon-pending")} ${surpriseCount} bekleyen sürpriz hareket</button>` : ""}

    <section class="card">
      <div class="section-head"><div><h2>Son hareketler</h2></div><button class="tiny-button" data-action="open-movements" type="button">Tümü</button></div>
      <div class="expense-list">${recent.length ? recent.map(entrySummaryRow).join("") : `<div class="empty-state">${KASAM_EMPTY.movements}</div>`}</div>
    </section>
  `;
}

function renderOwnProfilePage() {
  const user = currentUser();
  if (!user) return "";
  return `
    <section class="card member-profile-page">
      <div class="section-head">
        <div class="project-card-title">
          ${memberAvatarHtml(user, activeProject(), "profile-avatar")}
          <div><h2>${projectUserLabel(user)}</h2><p>${kasamDisplayName(user)}</p></div>
        </div>
      </div>
      <form class="form-grid profile-page-form" id="ownProfileForm">
        <label><span class="field-label">Tahmin cevabı tarzı</span><select class="select-input" name="onayMode">${Object.entries(personalityModes).map(([id, item]) => `<option value="${id}" ${user.onayModu === id ? "selected" : ""}>${kasamSafe(item.label)}</option>`).join("")}</select></label>
        <label class="photo-pick compact-pick"><span data-file-label>Kendi profil resmin</span><strong>Seç</strong><input name="profilePhoto" type="file" accept="image/*" /></label>
        <button class="primary-button" type="submit">Kaydet</button>
      </form>
      <div class="profile-score-row"><span>Skor ${Number(user.totalScore || 0)}</span><span>Doğru ${Number(user.correctGuesses || 0)}/${Number(user.totalGuesses || 0)}</span></div>
    </section>
    <section class="card">
      <h2>Veri ve hesap</h2>
      <div class="inline-actions stacked-actions">
        <button class="secondary-button" data-action="export-my-data" type="button">${kasamIcon("download", "icon-neutral")} Verilerimi indir</button>
        <button class="danger-button" data-action="delete-account" type="button">${kasamIcon("trash-2", "icon-expense")} Hesabımı sil</button>
      </div>
    </section>
  `;
}

function renderAdd() {
  const targetProjectId = state.addProjectId || state.activeProjectId || state.projects[0]?.id || "";
  const targetProject = state.projects.find((project) => project.id === targetProjectId) || activeProject();
  const type = KASA_UI_ENTRY_TYPES.find((item) => item.id === draft.type) || KASA_UI_ENTRY_TYPES[0];
  const amountValue = draft.amountInput || "";
  const isExpense = type.id === "expense";
  return `
    <form class="form-card form-grid movement-form" id="entryForm">
      <div class="section-head"><div><h2>${isExpense ? "Gider ekle" : "Gelir ekle"}</h2><p>Hareketi kendi kasana veya bağlı bir bütçeye işle.</p></div></div>
      <label><span class="field-label">Nereye işlensin?</span><select class="select-input" name="projectId">${state.projects.map((project) => `<option value="${project.id}" ${project.id === targetProject?.id ? "selected" : ""}>${kasamSafe(project.name)}</option>`).join("")}</select></label>
      <div class="type-grid two-types">${KASA_UI_ENTRY_TYPES.map((item) => `<button class="type-chip ${type.id === item.id ? "selected" : ""}" data-entry-type="${item.id}" type="button">${kasamIcon(kasamEntryTypeIcon(item.id), item.id === "income" ? "icon-income" : "icon-expense")}<strong>${kasamSafe(item.label)}</strong><small>${kasamSafe(item.helper)}</small></button>`).join("")}</div>
      <input type="hidden" name="userId" value="${currentUser()?.id || ""}" />
      <div><label class="field-label" for="amount">Tutar</label><input class="amount-input" id="amount" name="amount" inputmode="decimal" placeholder="1.000" value="${kasamEscape(amountValue)}" autocomplete="off" /></div>
      <div class="grid-2 currency-grid ${draft.currency === "TRY" ? "single" : ""}">
        <label><span class="field-label">Para birimi</span><select class="select-input" name="currency">${currencyOptions.map((item) => `<option value="${item.code}" ${draft.currency === item.code ? "selected" : ""}>${kasamSafe(item.label)}</option>`).join("")}</select></label>
        <label class="fx-rate-field ${draft.currency === "TRY" ? "is-hidden" : ""}"><span class="field-label">Kur</span><input class="select-input" name="exchangeRate" inputmode="decimal" placeholder="32,50" value="${draft.exchangeRate || 1}" autocomplete="off" /></label>
      </div>
      <label><span class="field-label">${isExpense ? "Gider tarihi" : "Gelir tarihi"}</span><input class="select-input" name="date" type="date" value="${draft.date || todayKey()}" /></label>
      <label class="heading-field"><span class="field-label" for="headingName">${isExpense ? "Gider başlığı" : "Gelir başlığı"}</span><input class="text-input" id="headingName" name="headingName" maxlength="200" placeholder="Başlık yaz" autocomplete="off" />${headingAutocompleteHtml(type.id)}</label>
      <div class="heading-media-row media-inline-row"><span class="field-label">Emoji, GIF, fotoğraf</span>${mediaHubHtml()}</div>
      ${isExpense ? `<details class="soft-details"><summary>Taksitli harcama</summary><div class="inline-form installment-fields"><label><span class="field-label">Taksit sayısı</span><input class="text-input" name="installmentCount" inputmode="numeric" placeholder="1" autocomplete="off" /></label><span class="field-help">2 ve üstü girilirse sonraki aylar takvimde görünür.</span></div></details>` : ""}
      <details class="soft-details"><summary>Bildirim oyunu</summary><div class="form-grid notification-options"><label><span class="field-label">Bildirim modu</span><select class="select-input" name="notificationMode"><option value="open" ${draft.notificationMode === "open" ? "selected" : ""}>Açık bildir</option><option value="surprise" ${draft.notificationMode === "surprise" ? "selected" : ""}>Tahmin oyunu</option><option value="silent" ${draft.notificationMode === "silent" ? "selected" : ""}>Sessiz kaydet</option></select></label>${reactionSetupHtml()}</div></details>
      <button class="primary-button" data-action="save-entry" type="submit">Kaydet</button>
    </form>
  `;
}

async function handleEntrySubmit(form) {
  const data = new FormData(form);
  const enteredAmount = parseAmount(data.get("amount"));
  const currency = String(data.get("currency") || "TRY").toUpperCase();
  const exchangeRate = currency === "TRY" ? 1 : parseAmount(data.get("exchangeRate"));
  const amount = enteredAmount * exchangeRate;
  const headingName = kasamCleanText(data.get("headingName"));
  const projectId = String(data.get("projectId") || state.activeProjectId || "");
  const project = state.projects.find((item) => item.id === projectId) || activeProject();
  const userId = currentUser()?.id || String(data.get("userId") || "");
  const type = draft.type === "income" ? "income" : "expense";
  const date = String(data.get("date") || todayKey()).slice(0, 10);
  const now = kasamNow();
  const isFuture = date > todayKey();
  if (!project) return kasamToast("Önce bütçe oluştur.");
  if (!enteredAmount || enteredAmount <= 0) return kasamToast("Tutar pozitif bir sayı olmalı.");
  if (!currencyOptions.some((item) => item.code === currency)) return kasamToast("Para birimini seç.");
  if (!exchangeRate || exchangeRate <= 0) return kasamToast("Döviz için kuru yaz.");
  if (!headingName) return kasamToast("Bir başlık yaz.");
  if (!kasamCurrentUserCanSeeProject(project)) return kasamToast(KASAM_TOASTS.forbidden);
  if (userId && !project.memberIds.includes(userId)) project.memberIds.push(userId);
  if (userId) setProjectMemberSince(project, userId, projectMemberSince(project, userId) || date);

  const previousProjectId = state.activeProjectId;
  state.activeProjectId = project.id;
  const heading = ensureHeading(headingName, headingName, "");
  const split = splitForResponsibleEntry(project, type, userId, date);
  const media = await mediaFromForm(data, { emoji: "notificationEmoji", gif: "notificationGif", photo: "photo" });
  const successMedia = await mediaFromForm(data, { emoji: "successReaction", gif: "successGif", photo: "successPhoto" });
  const failMedia = await mediaFromForm(data, { emoji: "failReaction", gif: "failGif", photo: "failPhoto" });
  const installmentCount = type === "expense" ? Math.max(1, Math.min(48, Math.round(parseAmount(data.get("installmentCount")) || 1))) : 1;
  const installmentGroupId = installmentCount > 1 ? makeId() : "";
  const entry = {
    id: makeId(),
    projectId: project.id,
    type,
    amount,
    enteredAmount,
    currency,
    exchangeRate,
    headingId: heading.id,
    shortName: heading.name,
    emoji: "",
    userId,
    paidById: userId,
    splitWith: split.splitWith,
    splitRatio: split.splitRatio,
    date,
    note: "",
    photoName: media.photoName,
    photoData: media.photoData,
    ocrRawText: null,
    ocrParsedAmount: null,
    installmentGroupId,
    installmentIndex: installmentCount > 1 ? 1 : 0,
    installmentCount: installmentCount > 1 ? installmentCount : 0,
    settlement: type === "expense",
    status: isFuture ? "pending" : "done",
    autoRevealAt: "",
    rateLockedAt: now,
    createdAt: now,
    updatedAt: now,
  };
  state.entries.unshift(entry);
  if (installmentCount > 1) {
    for (let index = 2; index <= installmentCount; index += 1) {
      const installmentDate = addMonthsToKey(date, index - 1);
      const installmentSplit = splitForResponsibleEntry(project, type, userId, installmentDate);
      state.entries.push({ ...entry, id: makeId(), date: installmentDate, status: installmentDate > todayKey() ? "pending" : "done", splitWith: installmentSplit.splitWith, splitRatio: installmentSplit.splitRatio, lockedNotificationId: "", autoRevealAt: "", installmentIndex: index, createdAt: now, updatedAt: now });
    }
  }
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
  generateDailyInsights(userId);
  state.activeProjectId = previousProjectId || project.id;
  draft = makeDraft();
  state.addProjectId = "";
  state.activeView = state.previousView && state.previousView !== "add" ? state.previousView : "home";
  state.previousView = "";
  saveState();
  render();
  kasamToast(delay || (installmentCount > 1 ? "Taksitli gider takvime işlendi." : KASAM_TOASTS.saved));
}

function renderNotifications() {
  const notifications = notificationEntries();
  return `
    <section class="card">
      <div class="section-head"><div><h2>Bildirimler</h2><p>Yeni tahminler, tepkiler ve kasa hareketleri.</p></div></div>
      <div class="expense-list">${notifications.length ? notifications.map(notificationRow).join("") : `<div class="empty-state">${KASAM_EMPTY.notifications}</div>`}</div>
    </section>
  `;
}

function projectSummaryRow(project) {
  projectMemberSinceMap(project);
  const impact = projectImpactForUser(project);
  const members = state.users.filter((user) => (project.memberIds || []).includes(user.id));
  return `
    <button class="project-list-row ${project.id === state.activeProjectId ? "active" : ""}" data-action="activate-project-detail" data-id="${project.id}" type="button">
      ${projectPhotoHtml(project, "project-thumb")}
      <span>
        <strong>${kasamSafe(project.name)}</strong>
        <small>${members.length} üye · ${money(impact.totals.comfortable)}</small>
        <span class="member-bullets inline-bullets">${members.map((member) => `<i>${projectUserLabel(member, project)}</i>`).join("")}</span>
      </span>
    </button>
  `;
}

function renderProjectList() {
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();
  return `
    <section class="card">
      <div class="section-head"><div><h2>Bütçeler</h2></div></div>
      <div class="project-list">${kasamVisibleProjects().map(projectSummaryRow).join("") || `<div class="empty-state">${KASAM_EMPTY.budgets}</div>`}</div>
    </section>
    <section class="card">
      <h2>Yeni bütçe oluştur</h2>
      <form class="inline-form" id="projectForm">
        <input class="text-input" name="projectName" maxlength="200" placeholder="Bütçe adı" autocomplete="off" />
        <input class="text-input" name="purpose" maxlength="200" placeholder="Amaç" autocomplete="off" />
        <button class="primary-button" type="submit">Kaydet</button>
      </form>
      ${cloudReady ? `<form class="inline-form cloud-join-card" id="joinProjectForm"><input class="text-input" name="projectCode" maxlength="40" placeholder="Bütçe kodu" autocomplete="off" /><button class="secondary-button" type="submit">Katılma talebi gönder</button></form>` : ""}
    </section>
  `;
}

function joinRequestsForActiveProject() {
  const project = activeProject();
  if (!project) return [];
  return (state.joinRequests || []).filter((request) => request.projectId === project.id && request.status === "pending");
}

function joinRequestRows() {
  const requests = joinRequestsForActiveProject();
  if (!requests.length) return `<div class="empty-state">Bekleyen katılma talebi yok.</div>`;
  return requests
    .map((request) => {
      const requester = state.users.find((user) => user.id === request.userId);
      return `
        <div class="expense-row">
          <div class="expense-main"><p class="expense-title">${requester ? projectUserLabel(requester) : kasamSafe(request.email || "Yeni kullanıcı")}</p><p class="expense-meta">${kasamFormatDateTime(request.createdAt)}</p></div>
          <div class="inline-actions"><button class="mini-action" data-action="approve-join-request" data-id="${request.id}" type="button">Onayla</button><button class="mini-action danger-link" data-action="reject-join-request" data-id="${request.id}" type="button">Reddet</button></div>
        </div>
      `;
    })
    .join("");
}

function renderGroup() {
  const project = activeProject();
  if (state.groupMode === "member" && state.activeMemberProfileId) return renderMemberProfile();
  if (state.groupMode !== "detail") return renderProjectList();
  projectMemberSinceMap(project);
  const balances = calculateBalances();
  const transfers = minimumTransfers(balances);
  const canManageUsers = isProjectOwner(project);
  const owner = projectOwner(project);
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();
  const impact = projectImpactForUser(project);
  return `
    <section class="card project-detail-card">
      <div class="section-head">
        <div class="project-card-title">${projectPhotoHtml(project)}<div><h2>${kasamSafe(project.name)}</h2><p>${projectCode(project)}</p></div></div>
        <button class="tiny-button" data-action="open-projects-list" type="button">Bütçeler</button>
      </div>
      <div class="grid-2 compact-stats">
        <article class="stat-card small"><p class="stat-label">Bu bütçenin etkisi</p><p class="stat-value ${impact.totals.comfortable >= 0 ? "positive" : "warning"}">${money(impact.totals.comfortable)}</p></article>
        <article class="stat-card small"><p class="stat-label">Hareket</p><p class="stat-value">${impact.count}</p></article>
      </div>
      ${canManageUsers ? `<form class="inline-form project-photo-form" id="projectPhotoForm"><label class="photo-pick compact-pick"><span data-file-label>Bütçe resmi</span><strong>Seç</strong><input name="projectPhoto" type="file" accept="image/*" /></label><button class="secondary-button" type="submit">Kaydet</button></form>` : ""}
    </section>
    <section class="card"><h2>Üyeler</h2><div class="expense-list" style="margin-top:12px;">${activeMembers().map(userLinkRow).join("") || `<div class="empty-state">Bu bütçede üye yok.</div>`}</div></section>
    <section class="card"><div class="section-head"><div><h2>Erişim</h2><p>${cloudReady ? "Katılma talepleri kasa sahibi onayladıktan sonra açılır." : "Yerel denemede kullanıcılar bu cihazda tutulur."}</p></div></div><div class="invite-box"><div><span class="field-label">Kod</span><strong>${projectCode(project)}</strong><p>${inviteLink(project)}</p></div><button class="mini-action" data-action="copy-project-link" type="button">Kopyala</button></div></section>
    ${canManageUsers ? `<section class="card"><h2>Katılma talepleri</h2><div class="expense-list">${joinRequestRows()}</div></section>` : ""}
    <section class="card"><div class="section-head"><div><h2>Borç & alacak</h2><p>Minimum transfer listesi.</p></div></div><div style="margin-top:10px;">${balances.length ? balances.map(balanceRow).join("") : `<div class="empty-state">Hesaplaşmaya dahil gider yok.</div>`}</div><div style="margin-top:12px;">${transferRows(transfers)}</div></section>
    <section class="card">
      <h2>Bütçeye kişi ekle</h2>
      <p>${canManageUsers ? (cloudReady ? `E-posta ile hesabı olan kişiyi ekle veya talebini onayla.` : `Bu cihazda açılmış kullanıcı adını yaz.`) : `Kullanıcı eklemek için ${projectUserLabel(owner)} hesabıyla giriş yap.`}</p>
      ${canManageUsers ? `<form class="inline-form featured-form" id="projectUserForm"><input class="text-input" name="userName" maxlength="120" placeholder="${cloudReady ? "mail@ornek.com" : "Kullanıcı adı"}" autocomplete="${cloudReady ? "email" : "off"}" /><label><span class="field-label">Sorumluluk başlangıcı</span><input class="select-input" name="memberSince" type="date" value="${todayKey()}" /></label><button class="primary-button" type="submit">Ekle</button></form>` : `<div class="empty-state" style="margin-top:12px;">Sadece bütçe sahibi ekleme yapabilir.</div>`}
    </section>
  `;
}

function renderMovements() {
  const period = state.movementPeriod || "month";
  const baseEntries = personalLedgerEntries().sort(byDateDesc);
  const entries = period === "all" ? baseEntries : entriesForPeriod(baseEntries, period);
  const totals = calculateTotals(entries);
  return `
    <section class="hero movement-impact-hero"><div class="hero-row"><div><p class="hero-title">${periodLabel(period)}</p><p class="hero-money">${money(totals.actual)}</p><p class="hero-note">Bu listedeki hareketlerin kişisel kasana etkisi.</p></div><span class="quick-pill ${totals.actual < 0 ? "danger-pill" : ""}">${totals.actual >= 0 ? "Artı" : "Eksi"}</span></div></section>
    <section class="card">
      <div class="section-head"><div><h2>Hareketler</h2></div><button class="tiny-button" data-action="go-add-movement" type="button">Ekle</button></div>
      <div class="segmented segmented-four"><button class="segment ${period === "day" ? "active" : ""}" data-movement-period="day" type="button">Gün</button><button class="segment ${period === "week" ? "active" : ""}" data-movement-period="week" type="button">Hafta</button><button class="segment ${period === "month" ? "active" : ""}" data-movement-period="month" type="button">Ay</button><button class="segment ${period === "all" ? "active" : ""}" data-movement-period="all" type="button">Tümü</button></div>
      <div class="expense-list">${entries.length ? entries.map(entrySummaryRow).join("") : `<div class="empty-state">${KASAM_EMPTY.movements}</div>`}</div>
    </section>
  `;
}

function calendarGridHtml(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const labels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const entries = calendarEntries();
  const cells = [];
  for (let index = 0; index < startOffset; index += 1) cells.push(`<div class="calendar-cell muted"></div>`);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const items = entries.filter((entry) => entry.date === key);
    cells.push(`<button class="calendar-cell ${key === todayKey() ? "today" : ""} ${key === state.calendarDay ? "selected" : ""}" data-action="open-calendar-day" data-date="${key}" type="button"><strong>${day}</strong>${items.slice(0, 2).map((entry) => `<span class="${entry.type === "income" || entry.type === "receivable" ? "cal-in" : "cal-out"}">${entryTitle(entry)}</span>`).join("")}${items.length > 2 ? `<em>+${items.length - 2}</em>` : ""}</button>`);
  }
  return `<div class="calendar-weekdays">${labels.map((label) => `<span>${label}</span>`).join("")}</div><div class="calendar-grid">${cells.join("")}</div>`;
}

function renderCalendar() {
  const base = state.calendarMonth ? dateFromKey(`${state.calendarMonth}-01`) : new Date();
  const monthText = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(base);
  const selectedDay = state.calendarDay || todayKey();
  const dayEntries = calendarEntries().filter((entry) => entry.date === selectedDay).sort(byDateAsc);
  const planned = calendarEntries().filter((entry) => entry.status === "pending").sort(byDateAsc).slice(0, 6);
  return `
    <section class="card desk-calendar-card"><div class="calendar-top"><button class="tiny-button" data-action="month-prev" type="button">${kasamIcon("chevron-left", "icon-neutral")} Önceki</button><div><p class="eyebrow">Takvim</p><h2>${kasamSafe(monthText)}</h2></div><button class="tiny-button" data-action="month-next" type="button">Sonraki ${kasamIcon("chevron-right", "icon-neutral")}</button></div><div class="desk-calendar" data-flip="${state.calendarFlip || 0}">${calendarGridHtml(base)}</div></section>
    <section class="card"><div class="section-head"><div><h2>${formatShortDate(selectedDay)}</h2><p>Seçilen günün hareketleri.</p></div></div><div class="expense-list">${dayEntries.length ? dayEntries.map(entrySummaryRow).join("") : `<div class="empty-state">${KASAM_EMPTY.calendarDay}</div>`}</div></section>
    <section class="card"><div class="section-head"><div><h2>Planlananlar</h2></div></div><div class="expense-list">${planned.length ? planned.map(entrySummaryRow).join("") : `<div class="empty-state">Takvime bağlı plan yok.</div>`}</div></section>
  `;
}

function reconciliationCardsHtml() {
  const items = (state.reconciliations || []).filter((item) => item.userId === currentUser()?.id).slice(0, 2);
  if (!items.length) return "";
  return items
    .map((item) => {
      const matched = item.status === "matched";
      const message = matched ? "Her şey tuttu. Terfi ettiniz." : `Ekstren ${money(Math.abs(item.diff || 0))} fark gösteriyor. Cebinde delik mi var?`;
      return `<section class="card reconciliation-card"><div class="section-head"><div><h2>Ekstre sonucu</h2><p>${kasamSafe(message)}</p></div><button class="tiny-button" data-action="show-reconciliation" data-id="${item.id}" type="button">Detayları gör</button></div>${state.reconciliationDetailId === item.id ? `<pre class="raw-block">${kasamSafe(JSON.stringify(item.unmatchedRows?.length ? item.unmatchedRows : item.rawRows || [], null, 2), 3000)}</pre>` : ""}</section>`;
    })
    .join("");
}

function renderReport() {
  const period = state.reportPeriod || "month";
  const entries = personalLedgerEntries().filter((entry) => entry.status === "done" && entryConfirmed(entry));
  const currentEntries = kasamPeriodEntries(entries, period);
  const previousEntries = kasamPeriodEntries(entries, period, -1);
  const totals = calculateTotals(currentEntries);
  const previousTotals = calculateTotals(previousEntries);
  const diff = period === "all" ? totals.actual : totals.actual - previousTotals.actual;
  const label = period === "day" ? "günlük" : period === "week" ? "haftalık" : period === "month" ? "aylık" : "genel";
  return `
    <section class="card">
      <div class="section-head"><div><h2>Rapor</h2><p>${period === "all" ? "Tüm kişisel kasa etkisi." : `${reportPeriodTitle(period)} ile ${reportPeriodTitle(period, -1)} karşılaştırılır.`}</p></div><button class="share-button compact-share" data-action="share-receipt" type="button">Fişi paylaş</button></div>
      <div class="segmented segmented-four"><button class="segment ${period === "day" ? "active" : ""}" data-period="day" type="button">Gün</button><button class="segment ${period === "week" ? "active" : ""}" data-period="week" type="button">Hafta</button><button class="segment ${period === "month" ? "active" : ""}" data-period="month" type="button">Ay</button><button class="segment ${period === "all" ? "active" : ""}" data-period="all" type="button">Genel</button></div>
      <div class="grid-2 report-grid"><article class="stat-card"><p class="stat-label">Giren</p><p class="stat-value positive">${money(totals.income)}</p></article><article class="stat-card"><p class="stat-label">Çıkan</p><p class="stat-value warning">${money(totals.expense)}</p></article></div>
      <div class="report-compare-card ${diff >= 0 ? "positive-soft" : "warning-soft"}"><strong>${diff >= 0 ? "+" : ""}${money(diff)}</strong><span>${period === "all" ? "Toplam net etki." : `${label} net fark.`}</span></div>
    </section>
    ${reconciliationCardsHtml()}
    <section class="card receipt-card" id="receiptCard"><div class="receipt-header receipt-header-stacked"><strong>KASAM FİŞİ</strong><span>${new Date().toLocaleDateString("tr-TR")}</span></div>${reportRows(currentEntries)}${projectBreakdownRows(currentEntries)}${exchangeReceiptLines(currentEntries)}<div class="receipt-line total"><span>Net</span><strong>${money(totals.actual)}</strong></div><p class="receipt-watermark">${KASAM_BRAND.watermark}</p></section>
  `;
}

async function shareReceipt() {
  const card = document.querySelector("#receiptCard");
  const text = card?.innerText || "KASAM FİŞİ";
  try {
    if (window.html2canvas && card) {
      const canvas = await window.html2canvas(card, { backgroundColor: "#ffffff", scale: 2 });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob && navigator.canShare) {
        const file = new File([blob], "kasam-fisi.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: "Kasam Fişi", text: "Kasam fişi", files: [file] });
          return;
        }
      }
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "kasam-fisi.png";
      link.click();
      return kasamToast("Fiş görseli indirildi.");
    }
    if (navigator.share) await navigator.share({ title: "Kasam Fişi", text });
    else {
      await navigator.clipboard.writeText(text);
      kasamToast("Fiş metni kopyalandı.");
    }
  } catch {
    kasamToast("Paylaşım iptal edildi.");
  }
}

function renderStatementAdd() {
  return `
    <form class="form-card form-grid" id="statementForm">
      <div class="section-head"><div><h2>Ekstre yükle</h2><p>CSV, PDF, görüntü veya Excel ekstresini Kasam hareketlerinle karşılaştır.</p></div></div>
      <label><span class="field-label">Format</span><select class="select-input" name="formatType"><option value="csv">CSV</option><option value="pdf">PDF</option><option value="image">Görüntü / ekran görüntüsü</option><option value="xlsx">Excel</option></select></label>
      <label><span class="field-label">Banka</span><select class="select-input" name="bankName">${Object.entries(bankColumnMaps).map(([id, item]) => `<option value="${id}">${kasamSafe(item.label)}</option>`).join("")}</select></label>
      <label><span class="field-label">Ay</span><input class="select-input" name="month" type="month" value="${monthKey()}" /></label>
      <details class="soft-details"><summary>Diğer banka kolonları</summary><div class="inline-form"><input class="text-input" name="dateCol" inputmode="numeric" placeholder="Tarih kolonu: 0" autocomplete="off" /><input class="text-input" name="descCol" inputmode="numeric" placeholder="Açıklama kolonu: 1" autocomplete="off" /><input class="text-input" name="amountCol" inputmode="numeric" placeholder="Tutar kolonu: 2" autocomplete="off" /><input class="text-input" name="delimiter" placeholder="Ayraç: ; veya ," autocomplete="off" /></div></details>
      <label class="photo-pick"><span data-file-label>Ekstre dosyası</span><strong>Seç</strong><input name="statementFile" type="file" accept=".csv,.pdf,.xlsx,.xls,image/*,text/csv,application/pdf" /></label>
      <button class="primary-button" type="submit">Analiz et</button>
    </form>
  `;
}

function normalizeStatementDate(value) {
  const text = String(value || "").trim();
  const tr = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (tr) {
    const year = tr[3].length === 2 ? `20${tr[3]}` : tr[3];
    return `${year}-${tr[2].padStart(2, "0")}-${tr[1].padStart(2, "0")}`;
  }
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  return text;
}

function parsePdfTextRows(text) {
  const rows = [];
  const patterns = [
    /(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})\s+(.+?)\s+(-?[\d.]+,\d{2})\s*(TRY|TL|USD|EUR)?$/i,
    /(\d{4}-\d{2}-\d{2})\s+(.+?)\s+(-?[\d.,]+)\s*(TRY|TL|USD|EUR)?$/i,
  ];
  String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          rows.push({ date: normalizeStatementDate(match[1]), description: kasamCleanText(match[2]), amount: parseAmount(match[3]), currency: (match[4] || "TRY").replace("TL", "TRY") });
          break;
        }
      }
    });
  return rows;
}

async function parsePdfFile(file) {
  if (!window.pdfjsLib) throw new Error("PDF okuma kütüphanesi yüklenemedi.");
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = "";
  for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
    const page = await pdf.getPage(pageIndex);
    const content = await page.getTextContent();
    text += `${content.items.map((item) => item.str).join(" ")}\n`;
  }
  return parsePdfTextRows(text);
}

async function parseXlsxFile(file) {
  if (!window.XLSX) throw new Error("Excel okuma kütüphanesi yüklenemedi.");
  const arrayBuffer = await file.arrayBuffer();
  const workbook = window.XLSX.read(arrayBuffer, { type: "array" });
  const first = workbook.Sheets[workbook.SheetNames[0]];
  const rows = window.XLSX.utils.sheet_to_json(first, { header: 1 });
  return rows
    .map((cells) => ({ date: normalizeStatementDate(cells[0]), description: kasamCleanText(cells[1] || cells[2] || ""), amount: parseAmount(cells[2] || cells[3] || cells[4] || 0), currency: "TRY" }))
    .filter((row) => row.description || row.amount);
}

async function analyzeStatementImage(file) {
  const dataUrl = await readImageAsDataUrl(file);
  const response = await fetch("/.netlify/functions/kasam-vision", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ imageBase64: dataUrl.split(",")[1], mimeType: file.type || "image/png" }),
  });
  if (!response.ok) throw new Error("Görüntü analizi tamamlanamadı.");
  const json = await response.json();
  return (json.rows || json.transactions || []).map((row) => ({
    date: normalizeStatementDate(row.date || row.tarih),
    description: kasamCleanText(row.description || row.aciklama || row.açıklama || ""),
    amount: parseAmount(row.amount || row.tutar),
    currency: row.currency || row.paraBirimi || "TRY",
  }));
}

function matchStatementRows(rows, month) {
  const entries = personalLedgerEntries().filter((entry) => entry.status === "done" && entryConfirmed(entry) && entryMonth(entry) === month);
  const matchedEntryIds = new Set();
  const unmatchedRows = [];
  rows.forEach((row) => {
    const amount = Number(row.amount || 0);
    const rowDate = normalizeStatementDate(row.date);
    const exact = entries.find((entry) => !matchedEntryIds.has(entry.id) && entry.date === rowDate && Math.round(Number(entry.amount || 0)) === Math.round(amount));
    if (exact) {
      matchedEntryIds.add(exact.id);
      return;
    }
    const near = entries.find((entry) => {
      if (matchedEntryIds.has(entry.id) || Math.round(Number(entry.amount || 0)) !== Math.round(amount)) return false;
      return Math.abs(dateFromKey(entry.date) - dateFromKey(rowDate)) <= 2 * 86400000;
    });
    if (near) {
      matchedEntryIds.add(near.id);
      return;
    }
    const weak = entries.find((entry) => !matchedEntryIds.has(entry.id) && Math.round(Number(entry.amount || 0)) === Math.round(amount) && normalize(entryTitle(entry)).includes(normalize(row.description).slice(0, 4)));
    if (weak) {
      matchedEntryIds.add(weak.id);
      return;
    }
    unmatchedRows.push(row);
  });
  return { matchedEntryIds: [...matchedEntryIds], unmatchedRows };
}

function addReconciliation({ bankId, month, rows, formatType = "csv", aiAnalysis = null }) {
  const map = bankColumnMaps[bankId] || bankColumnMaps.other;
  const statementTotal = rows.reduce((total, row) => total + Number(row.amount || 0), 0);
  const kasaEntries = personalLedgerEntries().filter((entry) => entry.status === "done" && entryConfirmed(entry) && entry.type === "expense" && entryMonth(entry) === month);
  const kasaTotal = sum(kasaEntries);
  const matched = matchStatementRows(rows, month);
  const diff = statementTotal - kasaTotal;
  state.reconciliations = state.reconciliations || [];
  state.reconciliations.push({
    id: makeId(),
    projectId: activeProject()?.id || "",
    userId: currentUser()?.id || "",
    month,
    bankName: map.label,
    formatType,
    uploadedAt: kasamNow(),
    statementTotal,
    kasaTotal,
    diff,
    status: Math.abs(diff) < 1 && !matched.unmatchedRows.length ? "matched" : "unmatched",
    rawRows: rows,
    matchedEntryIds: matched.matchedEntryIds,
    unmatchedRows: matched.unmatchedRows,
    aiAnalysis,
  });
}

async function handleStatementSubmit(form) {
  const data = new FormData(form);
  const bankId = String(data.get("bankName") || "other");
  const formatType = String(data.get("formatType") || "csv");
  const month = String(data.get("month") || monthKey());
  const file = formFile(data, "statementFile");
  if (!file) return kasamToast("Ekstre dosyası seç.");
  const baseMap = bankColumnMaps[bankId] || bankColumnMaps.other;
  const manualMap =
    bankId === "other"
      ? { ...baseMap, dateCol: Number(data.get("dateCol") || baseMap.dateCol), descCol: Number(data.get("descCol") || baseMap.descCol), amountCol: Number(data.get("amountCol") || baseMap.amountCol), delimiter: String(data.get("delimiter") || baseMap.delimiter || ";") }
      : baseMap;
  try {
    let rows = [];
    let aiAnalysis = null;
    if (formatType === "csv") rows = parseCsvRows(await file.text(), manualMap);
    else if (formatType === "pdf") rows = await parsePdfFile(file);
    else if (formatType === "xlsx") rows = await parseXlsxFile(file);
    else if (formatType === "image") {
      rows = await analyzeStatementImage(file);
      aiAnalysis = { provider: "anthropic", via: "netlify-function", analyzedAt: kasamNow() };
    }
    if (!rows.length) return kasamToast("Ekstre içinde okunabilir işlem yok.");
    addReconciliation({ bankId, month, rows, formatType, aiAnalysis });
    generateDailyInsights(currentUser()?.id);
    saveState();
    state.activeView = "report";
    render();
    kasamToast(`Analiz tamamlandı: ${rows.length} işlem bulundu.`);
  } catch (error) {
    logError(error, "statement-parse");
    kasamToast(error.message || "Ekstre okunamadı.");
  }
}

function createInsight({ userId = currentUser()?.id || "", projectId = "", type = "coaching", period = monthKey(), message, actionSuggestion = "", insightData = {} }) {
  if (!userId || !message) return null;
  state.insights = Array.isArray(state.insights) ? state.insights : [];
  const duplicate = state.insights.find((item) => item.userId === userId && item.type === type && item.period === period && normalize(item.message) === normalize(message));
  if (duplicate) return duplicate;
  const insight = { id: makeId(), userId, projectId, type, period, insightData, message: kasamCleanText(message, 300), actionSuggestion: kasamCleanText(actionSuggestion, 300), isRead: false, createdAt: kasamNow() };
  state.insights.unshift(insight);
  state.insights = state.insights.slice(0, 80);
  return insight;
}

function groupByHeading(entries) {
  const map = new Map();
  entries.forEach((entry) => {
    const key = entryTitle(entry);
    map.set(key, (map.get(key) || 0) + Number(entry.amount || 0));
  });
  return [...map.entries()].map(([name, amount]) => ({ name, amount })).sort((a, b) => b.amount - a.amount);
}

function averageDailyHeading(userId, headingId, days = 30) {
  const cutoff = Date.now() - days * 86400000;
  const rows = personalLedgerEntries(state.users.find((user) => user.id === userId)).filter((entry) => entry.type === "expense" && entry.headingId === headingId && dateFromKey(entry.date).getTime() >= cutoff);
  return sum(rows) / Math.max(1, days);
}

function generateDailyInsights(userId = currentUser()?.id) {
  const user = state.users.find((item) => item.id === userId);
  if (!user) return [];
  const todayEntries = personalLedgerEntries(user).filter((entry) => entry.type === "expense" && entry.status === "done" && entryConfirmed(entry) && entry.date === todayKey());
  const grouped = groupByHeading(todayEntries);
  const created = [];
  grouped.forEach((group) => {
    const sample = todayEntries.find((entry) => entryTitle(entry) === group.name);
    const avg = averageDailyHeading(userId, sample?.headingId, 30);
    if (avg > 0 && group.amount > avg * 1.5) {
      created.push(createInsight({ userId, type: "anomaly", period: todayKey(), message: `${group.name} bugün ${money(group.amount)} oldu. Normal ritmin üstünde.`, actionSuggestion: "Bu başlığı haftalık raporda kontrol et.", insightData: { heading: group.name, amount: group.amount, avg } }));
    }
  });
  const funTotal = grouped.filter((item) => /eğlence|kahve|yemek|sinema/i.test(item.name)).reduce((total, item) => total + item.amount, 0);
  if (funTotal > 500) created.push(createInsight({ userId, type: "coaching", period: todayKey(), message: `Bugün keyif tarafına ${money(funTotal)} gitti. Müsriflik bu.`, actionSuggestion: "Yarın aynı başlıklara küçük limit koy.", insightData: { funTotal } }));
  return created.filter(Boolean);
}

function generateWeeklyInsights(userId = currentUser()?.id) {
  const user = state.users.find((item) => item.id === userId);
  if (!user) return [];
  const entries = personalLedgerEntries(user).filter((entry) => entry.status === "done" && entryConfirmed(entry));
  const current = entriesForPeriod(entries, "week");
  const previous = entriesForPeriod(entries, "week", -1);
  const currentExpense = sum(current.filter((entry) => entry.type === "expense"));
  const previousExpense = sum(previous.filter((entry) => entry.type === "expense"));
  const top = groupByHeading(current.filter((entry) => entry.type === "expense"))[0];
  const diffRate = previousExpense ? Math.round(((currentExpense - previousExpense) / previousExpense) * 100) : 0;
  return [
    createInsight({
      userId,
      type: "weekly",
      period: `${monthKey()}-W`,
      message: `Bu hafta ${money(currentExpense)} harcandı. ${top ? `En çok ${top.name}: ${money(top.amount)}.` : "Hareket az."}`,
      actionSuggestion: previousExpense ? `Geçen haftaya göre ${diffRate}% değişim var.` : "Bir hafta daha veri biriksin, karşılaştırma netleşir.",
      insightData: { currentExpense, previousExpense, top },
    }),
  ].filter(Boolean);
}

function generateMonthlyInsights(userId = currentUser()?.id) {
  const user = state.users.find((item) => item.id === userId);
  if (!user) return [];
  const entries = personalLedgerEntries(user).filter((entry) => entry.status === "done" && entryConfirmed(entry));
  const current = entriesForPeriod(entries, "month");
  const previous = entriesForPeriod(entries, "month", -1);
  const currentTotals = calculateTotals(current);
  const previousTotals = calculateTotals(previous);
  const diff = currentTotals.actual - previousTotals.actual;
  const message = diff >= 500 ? `Bu ay kasada ${money(diff)} daha iyi net alan var.` : diff <= -500 ? `Bu ay geçen aya göre ${money(Math.abs(diff))} daha fazla zorlandı.` : "Bu ay geçen aya yakın gidiyor.";
  return [
    createInsight({
      userId,
      type: "monthly",
      period: monthKey(),
      message,
      actionSuggestion: "Ay sonunda kategori kırılımını fiş olarak paylaşabilirsin.",
      insightData: { currentTotals, previousTotals, diff },
    }),
  ].filter(Boolean);
}

function detectAnomalies(userId = currentUser()?.id) {
  const created = [];
  const user = state.users.find((item) => item.id === userId);
  if (!user) return created;
  const entries = personalLedgerEntries(user).filter((entry) => entry.status === "done" && entryConfirmed(entry) && entry.type === "expense");
  const current = groupByHeading(entriesForPeriod(entries, "month"));
  const previous = groupByHeading(entriesForPeriod(entries, "month", -1));
  current.forEach((item) => {
    const old = previous.find((prev) => normalize(prev.name) === normalize(item.name));
    if (old && old.amount > 0 && item.amount >= old.amount * 2) {
      created.push(createInsight({ userId, type: "anomaly", period: monthKey(), message: `${item.name} geçen aya göre iki katına çıktı.`, actionSuggestion: "Bu başlığa aylık limit koy.", insightData: { current: item.amount, previous: old.amount } }));
    }
    if (!old) {
      created.push(createInsight({ userId, type: "anomaly", period: monthKey(), message: `${item.name} bu ay yeni bir harcama başlığı olarak göründü.`, actionSuggestion: "Tek seferlik mi, düzenli mi kontrol et.", insightData: item }));
    }
  });
  return created.filter(Boolean);
}

function generateGoalInsights(userId = currentUser()?.id, goalId = "") {
  const goals = (state.goals || []).filter((goal) => (!goalId || goal.id === goalId) && goal.createdBy === userId && goal.status === "active");
  return goals
    .map((goal) => {
      const current = goalCurrentAmount(goal);
      const remaining = Math.max(0, Number(goal.targetAmount || 0) - current);
      if (!goal.targetAmount) return null;
      const percent = Math.round((current / goal.targetAmount) * 100);
      return createInsight({ userId, projectId: goal.projectId, type: "goal", period: monthKey(), message: `${goal.title} hedefinde %${percent} tamamlandı.`, actionSuggestion: remaining ? `Kalan: ${money(remaining)}.` : "Hedef tamamlandı.", insightData: { goalId: goal.id, current, remaining, percent } });
    })
    .filter(Boolean);
}

function runInsightEngineQuietly() {
  if (!state || !currentUser()) return;
  const userId = currentUser().id;
  const key = `${todayKey()}-${userId}`;
  state.lastInsightRun = state.lastInsightRun || {};
  if (state.lastInsightRun.daily === key) return;
  state.lastInsightRun.daily = key;
  generateDailyInsights(userId);
  if (new Date().getDay() === 0) generateWeeklyInsights(userId);
  if (new Date().getDate() === 1) generateMonthlyInsights(userId);
  detectAnomalies(userId);
  generateGoalInsights(userId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function requestAiCoachReport() {
  const user = currentUser();
  if (!user) return null;
  const summaries = [0, -1, -2].map((offset) => {
    const entries = entriesForPeriod(personalLedgerEntries(user).filter((entry) => entry.status === "done" && entryConfirmed(entry)), "month", offset);
    const totals = calculateTotals(entries);
    return { month: offset === 0 ? monthKey() : monthKey(addPeriod(new Date(), "month", offset)), totalIncome: totals.income, totalExpense: totals.expense, byCategory: groupByHeading(entries), goals: (state.goals || []).filter((goal) => goal.createdBy === user.id), anomalies: kasamUnreadInsights().filter((item) => item.type === "anomaly") };
  });
  const response = await fetch("/.netlify/functions/kasam-ai-coach", { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify({ userId: user.id, last3MonthsSummary: summaries }) });
  if (!response.ok) throw new Error("Koç raporu alınamadı.");
  const data = await response.json();
  return createInsight({ userId: user.id, type: "coaching", period: monthKey(), message: data.summary || "Aylık koç raporu hazır.", actionSuggestion: Array.isArray(data.actions) ? data.actions.slice(0, 2).join(" ") : "", insightData: data });
}

async function exportMyData() {
  const user = currentUser();
  if (!user) return;
  const data = {
    exportedAt: kasamNow(),
    user: { id: user.id, name: user.name, nickname: user.nickname, email: user.email },
    projects: kasamVisibleProjects(),
    entries: (state.entries || []).filter((entry) => personalAmountForEntry(entry, user) > 0 || entry.userId === user.id),
    notifications: (state.notifications || []).filter((item) => item.actorId === user.id || item.recipients?.includes(user.id)),
    reactions: (state.reactions || []).filter((item) => item.userId === user.id),
    reconciliations: (state.reconciliations || []).filter((item) => item.userId === user.id),
    goals: (state.goals || []).filter((item) => item.createdBy === user.id),
    insights: (state.insights || []).filter((item) => item.userId === user.id),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `kasam-verilerim-${todayKey()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  kasamToast("Veriler indirildi.");
}

async function deleteMyAccount() {
  const user = currentUser();
  if (!user) return;
  const ok = window.confirm("Tüm verilerin silinecek. Emin misin?");
  if (!ok) return;
  try {
    if (typeof isCloudReady === "function" && isCloudReady()) {
      const { error } = await cloudDb().rpc("delete_my_kasam_account");
      if (error) throw error;
      await cloudSignOut();
    }
  } catch (error) {
    logError(error, "delete-account");
    kasamToast(friendlyCloudError(error));
    return;
  }
  state.projects.forEach((project) => {
    if (project.createdBy === user.id) project.archivedAt = kasamNow();
    project.memberIds = (project.memberIds || []).filter((id) => id !== user.id);
  });
  state.users = state.users.filter((item) => item.id !== user.id);
  state.signedInUserId = "";
  state.activeUserId = "";
  state.activeProjectId = "";
  state.authMode = "signup";
  state.onboardingStep = "welcome";
  localStorage.removeItem(STORAGE_KEY);
  state = structuredClone(seedState);
  state.onboardingStep = "welcome";
  draft = makeDraft();
  render();
  kasamToast("Silindi.");
}

var KASAM_FORBIDDEN_HEADING_RE = /(yerde\s*para|allah\s*verdi|hara[cç]|gofret|çikolata|cikolata|\bxd\b)/i;

function kasamAllowedHeadingName(name) {
  return Boolean(kasamCleanText(name)) && !KASAM_FORBIDDEN_HEADING_RE.test(kasamCleanText(name).toLocaleLowerCase("tr-TR"));
}

function kasamCleanProjectHeadings(project) {
  if (!project) return project;
  project.defaultHeadings = (project.defaultHeadings || []).filter(kasamAllowedHeadingName);
  return project;
}

function kasamSplitIdsForEntry(entry) {
  const project = kasamProjectForEntry(entry);
  const existing = Array.isArray(entry?.splitWith) ? entry.splitWith.filter(Boolean) : [];
  const paidById = entry?.paidById || entry?.userId || "";
  const shared = project && project.splitType !== "individual" && (project.memberIds || []).length > 1;
  const legacySoloSplit = shared && existing.length === 1 && existing[0] === paidById;
  if (existing.length && !legacySoloSplit) return existing;
  return responsibleMemberIds(project, entry?.date || todayKey(), paidById);
}

function kasamOriginalAmount(entry) {
  return Number(entry?.originalAmount || entry?.amount || 0);
}

function kasamShareForUser(entry, userId) {
  const ids = kasamSplitIdsForEntry(entry);
  const ratios = Array.isArray(entry?.splitRatio) ? entry.splitRatio : [];
  const index = ids.indexOf(userId);
  if (index === -1) return 0;
  const fallback = ids.length ? 1 / ids.length : 1;
  return kasamOriginalAmount(entry) * Number(ratios[index] || fallback);
}

var kasamBaseEntryShareForUserSafe = typeof entryShareForUserSafe === "function" ? entryShareForUserSafe : null;
entryShareForUserSafe = function entryShareForUserSafeKasam(entry, userId) {
  return kasamShareForUser(entry, userId);
};

var kasamBasePersonalAmountForEntry = typeof personalAmountForEntry === "function" ? personalAmountForEntry : null;
personalAmountForEntry = function personalAmountForEntryKasam(entry, user = currentUser()) {
  if (!entry || !user || !entryVisibleForCurrentUser(entry, user.id)) return 0;
  const project = kasamProjectForEntry(entry);
  if (!project || !memberResponsibleForEntry(project, user.id, entry.date)) return 0;
  const shared = project.splitType !== "individual" && (project.memberIds || []).length > 1;
  const directOwner = entry.userId === user.id || entry.paidById === user.id;
  if (!shared) return directOwner ? Number(entry.amount || 0) : 0;
  const share = kasamShareForUser(entry, user.id);
  if (share > 0) return share;
  return directOwner ? Number(entry.amount || 0) : 0;
};

personalLedgerEntries = function personalLedgerEntriesKasam(user = currentUser()) {
  if (!user) return [];
  return (state.entries || [])
    .map((entry) => personalEntryCopy(entry, user))
    .filter(Boolean);
};

personalProjectEntries = function personalProjectEntriesKasam(project, user = currentUser()) {
  if (!project || !user) return [];
  return personalLedgerEntries(user).filter((entry) => entry.projectId === project.id);
};

function kasamEntrySplitText(entry, compact = false) {
  const project = kasamProjectForEntry(entry);
  const payer = state.users.find((user) => user.id === (entry?.paidById || entry?.userId));
  const ids = kasamSplitIdsForEntry(entry);
  const payLabel = entry?.type === "income" || entry?.type === "receivable" ? "Giren" : "Ödeyen";
  const payerText = `${payLabel}: ${payer ? projectUserLabel(payer, project) : "Bilinmiyor"}`;
  const shares = ids
    .map((userId) => {
      const user = state.users.find((item) => item.id === userId);
      if (!user) return "";
      return `${projectUserLabel(user, project)} ${money(kasamShareForUser(entry, userId))}`;
    })
    .filter(Boolean)
    .join(compact ? " · " : " / ");
  return shares ? `${payerText} · Paylaşım: ${shares}` : payerText;
}

function kasamProjectMovementRows(project) {
  const rows = (state.entries || [])
    .filter((entry) => entry.projectId === project?.id)
    .filter((entry) => entry.status === "pending" || (entry.status === "done" && entryConfirmed(entry)))
    .sort(byDateDesc)
    .slice(0, 8);
  if (!rows.length) return `<div class="empty-state">Bu bütçede henüz hareket yok.</div>`;
  return rows
    .map((entry) => {
      const isIncome = entry.type === "income" || entry.type === "receivable";
      const locked = entry.lockedNotificationId && !entryConfirmed(entry);
      return `
        <div class="expense-row movement-card-row project-entry-row">
          <span class="emoji-dot system-icon-dot">${kasamMovementIcon(entry)}</span>
          <div class="expense-main">
            <p class="expense-title">${locked ? "Tahmin oyunu açık" : entryTitle(entry)}</p>
            <p class="expense-meta">${formatShortDate(entry.date)}${entry.status === "pending" ? " · planlandı" : ""}</p>
            ${locked ? `<p class="expense-note">Detaylar tahmin bitince açılır.</p>` : `<p class="expense-note">${kasamEntrySplitText(entry)}</p>`}
          </div>
          <strong class="expense-price ${isIncome ? "price-positive" : "price-negative"}">${locked ? "??" : `${isIncome ? "+" : "-"}${money(kasamOriginalAmount(entry))}`}</strong>
        </div>
      `;
    })
    .join("");
}

function kasamSplitPreviewHtml(project, type = draft?.type || "expense") {
  const user = currentUser();
  if (!project || !user) return "";
  const ids = responsibleMemberIds(project, draft?.date || todayKey(), user.id);
  const members = ids
    .map((userId) => {
      const member = state.users.find((item) => item.id === userId);
      return member ? projectUserLabel(member, project) : "";
    })
    .filter(Boolean);
  const label = type === "income" ? "Gelir paylaşımı" : "Gider paylaşımı";
  return `
    <section class="split-preview-box">
      <strong>${label}</strong>
      <span>${type === "income" ? "Giren kişi" : "Ödeyen kişi"}: ${projectUserLabel(user, project)}</span>
      <span>${members.length ? members.join(" / ") : "Sadece sen"}</span>
    </section>
  `;
}

function kasamPlannedSummaryHtml(entries) {
  const totals = calculateTotals(entries);
  const hasPending = entries.some((entry) => entry.status === "pending");
  return `
    <section class="grid-2 compact-stats planned-stats">
      <article class="stat-card small"><p class="stat-label">Şu an</p><p class="stat-value ${totals.actual >= 0 ? "positive" : "warning"}">${money(totals.actual)}</p></article>
      <article class="stat-card small"><p class="stat-label">Plan sonrası</p><p class="stat-value ${totals.comfortable >= 0 ? "positive" : "warning"}">${money(totals.comfortable)}</p></article>
      ${hasPending ? `<p class="field-help planned-help">İleri tarihli kayıtlar şu anki bakiyeye girmez; plan sonrası alanda görünür.</p>` : ""}
    </section>
  `;
}

function kasamBackfillEntryNotifications() {
  if (!state?.entries?.length || !state?.projects?.length) return 0;
  state.notifications = Array.isArray(state.notifications) ? state.notifications : [];
  let created = 0;
  state.entries.forEach((entry) => {
    if (!entry?.id) return;
    const project = kasamProjectForEntry(entry);
    if (!project || (project.memberIds || []).length <= 1) return;
    const actorId = entry.userId || entry.paidById || project.createdBy || "";
    const splitIds = kasamSplitIdsForEntry(entry);
    const recipients = [...new Set([...(splitIds.length ? splitIds : project.memberIds)].filter((id) => id && id !== actorId))];
    if (!actorId || !recipients.length) return;
    const existing = state.notifications.find((notification) => notification.entryId === entry.id);
    if (existing) {
      const mergedRecipients = [...new Set([...(existing.recipients || []), ...recipients])];
      if (mergedRecipients.length !== (existing.recipients || []).length) {
        existing.recipients = mergedRecipients;
        created += 1;
      }
      return;
    }
    const isSurprise = Boolean(entry.lockedNotificationId);
    const now = entry.createdAt || kasamNow();
    const guessDeadline = entry.autoRevealAt || addHours(now, 48);
    const deadlinePassed = new Date(guessDeadline).getTime() <= Date.now();
    state.notifications.unshift({
      id: entry.lockedNotificationId || makeId(),
      projectId: entry.projectId,
      entryId: entry.id,
      actorId,
      recipients,
      mode: isSurprise ? "surprise" : "open",
      actualType: entry.type,
      title: entryTitle(entry),
      amount: Number(entry.amount || 0),
      emoji: entry.emoji || "🎲",
      photoName: entry.photoName || "",
      photoData: entry.photoData || "",
      gif: "",
      successReaction: "✅",
      successPhotoName: "",
      successPhotoData: "",
      successGif: "",
      failReaction: "🙂",
      failPhotoName: "",
      failPhotoData: "",
      failGif: "",
      guessDeadline,
      revealedAt: isSurprise ? (deadlinePassed ? kasamNow() : "") : now,
      isCompleted: isSurprise ? deadlinePassed : true,
      notificationType: "entry",
      reactionEmoji: "",
      guesses: [],
      createdAt: now,
      backfilled: true,
    });
    if (isSurprise) {
      entry.lockedNotificationId = entry.lockedNotificationId || state.notifications[0].id;
      entry.autoRevealAt = entry.autoRevealAt || guessDeadline;
    }
    created += 1;
  });
  if (created) {
    state.notificationBackfillAt = kasamNow();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (typeof scheduleCloudSync === "function") scheduleCloudSync();
  }
  return created;
}

var kasamNormalizeSharedLedgerBase = normalizeState;
normalizeState = function normalizeStateSharedLedger(saved) {
  const normalized = kasamNormalizeSharedLedgerBase(saved);
  normalized.headings = (normalized.headings || []).filter((heading) => kasamAllowedHeadingName(heading.name) && kasamAllowedHeadingName(heading.shortName || heading.name));
  normalized.projects = (normalized.projects || []).map(kasamCleanProjectHeadings);
  normalized.entries = (normalized.entries || []).map((entry) => {
    const project = (normalized.projects || []).find((item) => item.id === entry.projectId);
    const paidById = entry.paidById || entry.userId || "";
    const existingSplit = Array.isArray(entry.splitWith) ? entry.splitWith.filter(Boolean) : [];
    const shared = project && project.splitType !== "individual" && (project.memberIds || []).length > 1;
    const legacySoloSplit = shared && existingSplit.length === 1 && existingSplit[0] === paidById;
    const splitWith = existingSplit.length && !legacySoloSplit ? existingSplit : responsibleMemberIds(project, entry.date || todayKey(), paidById);
    return {
      ...entry,
      paidById,
      splitWith,
      splitRatio: Array.isArray(entry.splitRatio) && entry.splitRatio.length === splitWith.length ? entry.splitRatio : cleanRatioList(splitWith, []),
    };
  });
  return normalized;
};

headingAutocompleteHtml = function headingAutocompleteHtmlKasam(typeId) {
  const headings = projectHeadings().filter((heading) => kasamAllowedHeadingName(heading.name));
  return `
    <div class="chips heading-matches" id="headingMatches">
      ${headings.slice(0, 8).map((item) => `<button class="chip" data-suggestion="${kasamSafe(item.name)}" data-short="${kasamSafe(item.shortName || item.name)}" type="button">${kasamSafe(item.shortName || item.name)}</button>`).join("")}
    </div>
  `;
};

entrySummaryRow = function entrySummaryRowKasam(entry) {
  const isIncome = entry.type === "income" || entry.type === "receivable";
  const locked = entry.lockedNotificationId && !entryConfirmed(entry);
  return `
    <div class="expense-row movement-card-row">
      <span class="emoji-dot system-icon-dot">${kasamMovementIcon(entry)}</span>
      <div class="expense-main">
        <p class="expense-title">${locked ? "Tahmin oyunu açık" : entryTitle(entry)}</p>
        <p class="expense-meta">${entryProjectName(entry)} · ${formatShortDate(entry.date)}${entry.status === "pending" ? " · planlandı" : ""}</p>
        ${locked ? `<p class="expense-note">Detaylar tahmin bitince açılır.</p>` : `<p class="expense-note">${kasamEntrySplitText(entry, true)}</p>`}
      </div>
      <strong class="expense-price ${isIncome ? "price-positive" : "price-negative"}">${locked ? "??" : `${isIncome ? "+" : "-"}${money(entry.amount)}`}</strong>
    </div>
  `;
};

entryRow = function entryRowKasam(entry) {
  const type = entryTypes.find((item) => item.id === entry.type);
  const isIncome = entry.type === "income" || entry.type === "receivable";
  const reactions = reactionSummary(entry.id);
  const locked = entry.lockedNotificationId && !entryConfirmed(entry);
  return `
    <div class="expense-row">
      <span class="emoji-dot system-icon-dot">${kasamMovementIcon(entry)}</span>
      <div class="expense-main">
        <p class="expense-title">${locked ? "Tahmin oyunu açık" : entryTitle(entry)}</p>
        <p class="expense-meta">${type?.label || "Hareket"} · ${formatShortDate(entry.date)}${entry.status === "pending" ? " · planlandı" : ""}</p>
        ${locked ? `<p class="expense-note">Detaylar tahmin bitince açılır.</p>` : `<p class="expense-note">${kasamEntrySplitText(entry, true)}</p>`}
        ${reactions ? `<p class="expense-note reaction-line">${reactions}</p>` : ""}
      </div>
      <strong class="expense-price ${isIncome ? "price-positive" : "price-negative"}">${locked ? "??" : `${isIncome ? "+" : "-"}${money(kasamOriginalAmount(entry))}`}</strong>
      <button class="reaction-button" data-action="toggle-reaction-picker" data-id="${entry.id}" type="button" aria-label="Tepki ver">${kasamIcon("smile", "icon-neutral")}</button>
    </div>
    ${state.reactionPickerEntryId === entry.id ? reactionPicker(entry) : ""}
  `;
};

notificationEntries = function notificationEntriesKasam() {
  const user = currentUser();
  if (!user) return [];
  return (state.notifications || [])
    .filter((item) => item.actorId === user.id || (Array.isArray(item.recipients) && item.recipients.includes(user.id)))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
};

renderAdd = function renderAddKasam() {
  const visibleProjects = kasamVisibleProjects();
  const targetProjectId = state.addProjectId || state.activeProjectId || visibleProjects[0]?.id || "";
  const targetProject = visibleProjects.find((project) => project.id === targetProjectId) || visibleProjects[0] || activeProject();
  const type = KASA_UI_ENTRY_TYPES.find((item) => item.id === draft.type) || KASA_UI_ENTRY_TYPES[0];
  const amountValue = draft.amountInput || "";
  const isExpense = type.id === "expense";
  return `
    <form class="form-card form-grid movement-form" id="entryForm">
      <div class="section-head"><div><h2>${isExpense ? "Gider ekle" : "Gelir ekle"}</h2><p>Hareket seçilen bütçeye işlenir; ortak bütçelerde paylar üyelere yansır.</p></div></div>
      <label><span class="field-label">Nereye işlensin?</span><select class="select-input" name="projectId">${visibleProjects.map((project) => `<option value="${project.id}" ${project.id === targetProject?.id ? "selected" : ""}>${kasamSafe(project.name)}</option>`).join("")}</select></label>
      <div class="type-grid two-types">${KASA_UI_ENTRY_TYPES.map((item) => `<button class="type-chip ${type.id === item.id ? "selected" : ""}" data-entry-type="${item.id}" type="button">${kasamIcon(kasamEntryTypeIcon(item.id), item.id === "income" ? "icon-income" : "icon-expense")}<strong>${kasamSafe(item.label)}</strong><small>${kasamSafe(item.helper)}</small></button>`).join("")}</div>
      ${kasamSplitPreviewHtml(targetProject, type.id)}
      <input type="hidden" name="userId" value="${currentUser()?.id || ""}" />
      <div><label class="field-label" for="amount">Tutar</label><input class="amount-input" id="amount" name="amount" inputmode="decimal" placeholder="1.000" value="${kasamEscape(amountValue)}" autocomplete="off" /></div>
      <div class="grid-2 currency-grid ${draft.currency === "TRY" ? "single" : ""}">
        <label><span class="field-label">Para birimi</span><select class="select-input" name="currency">${currencyOptions.map((item) => `<option value="${item.code}" ${draft.currency === item.code ? "selected" : ""}>${kasamSafe(item.label)}</option>`).join("")}</select></label>
        <label class="fx-rate-field ${draft.currency === "TRY" ? "is-hidden" : ""}"><span class="field-label">Kur</span><input class="select-input" name="exchangeRate" inputmode="decimal" placeholder="32,50" value="${draft.exchangeRate || 1}" autocomplete="off" /></label>
      </div>
      <label class="date-field"><span class="field-label">${isExpense ? "Gider tarihi" : "Gelir tarihi"}</span><input class="select-input" name="date" type="date" value="${draft.date || todayKey()}" /></label>
      <label class="heading-field"><span class="field-label" for="headingName">${isExpense ? "Gider başlığı" : "Gelir başlığı"}</span><input class="text-input" id="headingName" name="headingName" maxlength="200" placeholder="Başlık yaz" autocomplete="off" />${headingAutocompleteHtml(type.id)}</label>
      <div class="heading-media-row media-inline-row"><span class="field-label">Emoji, GIF, fotoğraf</span>${mediaHubHtml()}</div>
      ${isExpense ? `<details class="soft-details"><summary>Taksitli harcama</summary><div class="inline-form installment-fields"><label><span class="field-label">Taksit sayısı</span><input class="text-input" name="installmentCount" inputmode="numeric" placeholder="1" autocomplete="off" /></label><span class="field-help">2 ve üstü girilirse sonraki aylar takvimde görünür.</span></div></details>` : ""}
      <details class="soft-details"><summary>Bildirim oyunu</summary><div class="form-grid notification-options"><label><span class="field-label">Bildirim modu</span><select class="select-input" name="notificationMode"><option value="open" ${draft.notificationMode === "open" ? "selected" : ""}>Açık bildir</option><option value="surprise" ${draft.notificationMode === "surprise" ? "selected" : ""}>Tahmin oyunu</option><option value="silent" ${draft.notificationMode === "silent" ? "selected" : ""}>Sessiz kaydet</option></select></label>${reactionSetupHtml()}</div></details>
      <button class="primary-button" data-action="save-entry" type="submit">Kaydet</button>
    </form>
  `;
};

renderGroup = function renderGroupKasam() {
  const project = activeProject();
  if (state.groupMode === "member" && state.activeMemberProfileId) return renderMemberProfile();
  if (state.groupMode !== "detail") return renderProjectList();
  projectMemberSinceMap(project);
  const balances = calculateBalances();
  const transfers = minimumTransfers(balances);
  const canManageUsers = isProjectOwner(project);
  const owner = projectOwner(project);
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();
  const personalEntries = personalProjectEntries(project);
  const movementCount = (state.entries || []).filter((entry) => entry.projectId === project?.id).length;
  return `
    <section class="card project-detail-card">
      <div class="section-head">
        <div class="project-card-title">${projectPhotoHtml(project)}<div><h2>${kasamSafe(project.name)}</h2><p>${projectCode(project)}</p></div></div>
        <button class="tiny-button" data-action="open-projects-list" type="button">Bütçeler</button>
      </div>
      ${kasamPlannedSummaryHtml(personalEntries)}
      <div class="inline-actions stacked-actions project-actions">
        <button class="primary-button" data-action="go-add-movement" data-project-id="${project.id}" type="button">Bu bütçeye hareket ekle</button>
      </div>
      <p class="field-help">Hareket sayısı: ${movementCount}. İleri tarihli kayıtlar plan sonrası alana gider.</p>
      ${canManageUsers ? `<form class="inline-form project-photo-form" id="projectPhotoForm"><label class="photo-pick compact-pick"><span data-file-label>Bütçe resmi</span><strong>Seç</strong><input name="projectPhoto" type="file" accept="image/*" /></label><button class="secondary-button" type="submit">Kaydet</button></form>` : ""}
    </section>
    <section class="card"><h2>Üyeler</h2><div class="expense-list" style="margin-top:12px;">${activeMembers().map(userLinkRow).join("") || `<div class="empty-state">Bu bütçede üye yok.</div>`}</div></section>
    <section class="card"><div class="section-head"><div><h2>Bütçe hareketleri</h2><p>Bu bütçedeki açık hareketler ve pay dağılımı.</p></div></div><div class="expense-list">${kasamProjectMovementRows(project)}</div></section>
    <section class="card"><div class="section-head"><div><h2>Erişim</h2><p>${cloudReady ? "Katılma talepleri kasa sahibi onayladıktan sonra açılır." : "Yerel denemede kullanıcılar bu cihazda tutulur."}</p></div></div><div class="invite-box"><div><span class="field-label">Kod</span><strong>${projectCode(project)}</strong><p>${inviteLink(project)}</p></div><button class="mini-action" data-action="copy-project-link" type="button">Kopyala</button></div></section>
    ${canManageUsers ? `<section class="card"><h2>Katılma talepleri</h2><div class="expense-list">${joinRequestRows()}</div></section>` : ""}
    <section class="card"><div class="section-head"><div><h2>Borç & alacak</h2><p>Kim ödedi, kimin payına ne düştü.</p></div></div><div style="margin-top:10px;">${balances.length ? balances.map(balanceRow).join("") : `<div class="empty-state">Hesaplaşmaya dahil gider yok.</div>`}</div><div style="margin-top:12px;">${transferRows(transfers)}</div></section>
    <section class="card">
      <h2>Bütçeye kişi ekle</h2>
      <p>${canManageUsers ? (cloudReady ? `E-posta ile hesabı olan kişiyi ekle veya talebini onayla.` : `Bu cihazda açılmış kullanıcı adını yaz.`) : `Kullanıcı eklemek için ${projectUserLabel(owner)} hesabıyla giriş yap.`}</p>
      ${canManageUsers ? `<form class="inline-form featured-form" id="projectUserForm"><input class="text-input" name="userName" maxlength="120" placeholder="${cloudReady ? "mail@ornek.com" : "Kullanıcı adı"}" autocomplete="${cloudReady ? "email" : "off"}" /><label><span class="field-label">Sorumluluk başlangıcı</span><input class="select-input" name="memberSince" type="date" value="${todayKey()}" /></label><button class="primary-button" type="submit">Ekle</button></form>` : `<div class="empty-state" style="margin-top:12px;">Sadece bütçe sahibi ekleme yapabilir.</div>`}
    </section>
  `;
};

var kasamBaseLoadCloudData = typeof loadCloudData === "function" ? loadCloudData : null;
loadCloudData = async function loadCloudDataKasam() {
  if (kasamBaseLoadCloudData) await kasamBaseLoadCloudData();
  if (!(typeof isCloudReady === "function" && isCloudReady()) || !state.signedInUserId) return;
  const client = cloudDb();
  const projectIds = (state.projects || []).map((project) => project.id);
  try {
    if (projectIds.length) {
      const [joinResult, insightResult] = await Promise.all([
        client.from("kasa_join_requests").select("*").in("project_id", projectIds).order("created_at", { ascending: false }),
        client.from("kasa_insights").select("*").eq("user_id", state.signedInUserId).order("created_at", { ascending: false }),
      ]);
      if (!joinResult.error) {
        state.joinRequests = (joinResult.data || []).map((item) => ({
          id: item.id,
          projectId: item.project_id,
          userId: item.requester_id,
          email: item.requester_email || "",
          status: item.status,
          createdAt: item.created_at,
          decidedAt: item.decided_at || "",
        }));
      }
      if (!insightResult.error) {
        state.insights = (insightResult.data || []).map((item) => ({
          id: item.id,
          userId: item.user_id,
          projectId: item.project_id || "",
          type: item.type,
          period: item.period,
          insightData: item.insight_data || {},
          message: item.message,
          actionSuggestion: item.action_suggestion || "",
          isRead: Boolean(item.is_read),
          createdAt: item.created_at,
        }));
      }
    }
    state.reconciliations = (state.reconciliations || []).map((item) => ({
      ...item,
      formatType: item.formatType || "csv",
      matchedEntryIds: item.matchedEntryIds || [],
      unmatchedRows: item.unmatchedRows || [],
      aiAnalysis: item.aiAnalysis || null,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    logError(error, "load-cloud-production-fields");
    setCloudStatus(friendlyCloudError(error));
  }
};

var kasamBaseCloudPushState = typeof cloudPushState === "function" ? cloudPushState : null;
cloudPushState = async function cloudPushStateKasam() {
  if (!kasamBaseCloudPushState || !(typeof isCloudReady === "function" && isCloudReady()) || !state?.signedInUserId) return;
  if (!kasamIsOnline()) {
    queueCloudRetry({ operation: "pushState" });
    setCloudStatus("Çevrimdışı");
    kasamToast("Kaydedildi (senkronize edilecek)");
    return;
  }
  try {
    await kasamBaseCloudPushState();
    const client = cloudDb();
    const user = currentUser();
    if (!user) return;

    const projectRows = (state.projects || [])
      .filter((project) => project.createdBy === user.id)
      .map((project) => ({
        id: project.id,
        name: project.name,
        purpose: project.purpose,
        code: projectCode(project),
        created_by: project.createdBy,
        join_approval_required: project.joinApprovalRequired !== false,
        archived_at: project.archivedAt || null,
        updated_at: kasamNow(),
      }));
    if (projectRows.length) await client.from("kasa_projects").upsert(projectRows, { onConflict: "id" });

    const entryRows = (state.entries || [])
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
        emoji: entry.emoji || "",
        entry_date: entry.date,
        note: entry.note || "",
        photo_name: entry.photoName || "",
        photo_data: entry.photoData || "",
        locked_notification_id: entry.lockedNotificationId || null,
        auto_reveal_at: entry.autoRevealAt || null,
        rate_locked_at: entry.rateLockedAt || entry.createdAt || kasamNow(),
        paid_by_id: entry.paidById || entry.userId,
        split_with: entry.splitWith || [],
        split_ratio: entry.splitRatio || [],
        ocr_raw_text: entry.ocrRawText || null,
        ocr_parsed_amount: entry.ocrParsedAmount ?? null,
        installment_group_id: entry.installmentGroupId || null,
        installment_index: Number(entry.installmentIndex || 0),
        installment_count: Number(entry.installmentCount || 0),
        settlement: Boolean(entry.settlement),
        status: entry.status,
        created_at: entry.createdAt || kasamNow(),
        updated_at: entry.updatedAt || kasamNow(),
      }));
    if (entryRows.length) await client.from("kasa_entries").upsert(entryRows, { onConflict: "id" });

    const reconciliationRows = (state.reconciliations || [])
      .filter((item) => item.userId === user.id)
      .map((item) => ({
        id: item.id,
        project_id: item.projectId || null,
        user_id: item.userId,
        month: item.month,
        bank_name: item.bankName,
        format_type: item.formatType || "csv",
        uploaded_at: item.uploadedAt || kasamNow(),
        statement_total: item.statementTotal || 0,
        kasa_total: item.kasaTotal || 0,
        diff: item.diff || 0,
        status: item.status || "pending",
        raw_rows: item.rawRows || [],
        matched_entry_ids: item.matchedEntryIds || [],
        unmatched_rows: item.unmatchedRows || [],
        ai_analysis: item.aiAnalysis || null,
      }));
    if (reconciliationRows.length) await client.from("kasa_reconciliations").upsert(reconciliationRows, { onConflict: "id" });

    const insightRows = (state.insights || [])
      .filter((item) => item.userId === user.id)
      .map((item) => ({
        id: item.id,
        user_id: item.userId,
        project_id: item.projectId || null,
        type: item.type,
        period: item.period,
        insight_data: item.insightData || {},
        message: item.message,
        action_suggestion: item.actionSuggestion || "",
        is_read: Boolean(item.isRead),
        created_at: item.createdAt || kasamNow(),
      }));
    if (insightRows.length) await client.from("kasa_insights").upsert(insightRows, { onConflict: "id" });

    state.cloudSyncAt = kasamNow();
    setCloudStatus("Bulut senkron");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    logError(error, "cloud-push-production");
    queueCloudRetry({ operation: "pushState" });
    setCloudStatus(friendlyCloudError(error));
    throw error;
  }
};

var kasamBaseBindScreen = bindScreen;
bindScreen = function bindScreenKasam() {
  kasamBaseBindScreen();
  const entryForm = app.querySelector("#entryForm");
  if (entryForm && !entryForm.dataset.kasamSubmitBound) {
    entryForm.dataset.kasamSubmitBound = "1";
    entryForm.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        try {
          await handleEntrySubmit(entryForm);
        } catch (error) {
          window.__lastKasamEntryError = error?.message || String(error);
          logError(error, "entry-submit");
          kasamToast(KASAM_TOASTS.general);
        }
      },
      true,
    );
  }
  app.querySelectorAll("[data-action='save-entry']").forEach((button) => {
    if (button.dataset.kasamClickBound) return;
    button.dataset.kasamClickBound = "1";
    button.addEventListener(
      "click",
      async (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        const form = button.closest("#entryForm");
        if (form) {
          try {
            await handleEntrySubmit(form);
          } catch (error) {
            window.__lastKasamEntryError = error?.message || String(error);
            logError(error, "entry-save-click");
            kasamToast(KASAM_TOASTS.general);
          }
        }
      },
      true,
    );
  });
  app.querySelectorAll("[data-action='onboarding-start']").forEach((button) =>
    button.addEventListener("click", () => {
      state.onboardingStep = "account";
      state.authMode = "signup";
      saveState();
      render();
    }),
  );
  app.querySelectorAll("[data-action='auth-mode']").forEach((button) =>
    button.addEventListener("click", () => {
      state.onboardingStep = button.dataset.mode === "signup" ? "account" : "login";
      state.authMode = button.dataset.mode === "signup" ? "signup" : "login";
      saveState();
      render();
    }),
  );
  app.querySelectorAll("[data-action='demo-start']").forEach((button) =>
    button.addEventListener("click", () => {
      if (!state.users.length) {
        const user = createUser("Demo Kullanıcı", "demo", { nickname: "Demo", email: "demo@kasam.app", linkToProject: false });
        state.signedInUserId = user.id;
        state.activeUserId = user.id;
      }
      if (!state.projects.length) createProject("Kendi Kasam", "Demo bütçe");
      state.onboardingStep = "done";
      state.activeView = "home";
      saveState();
      render();
      kasamToast("Demo açıldı.");
    }),
  );
  app.querySelectorAll("[data-action='manual-retry']").forEach((button) => button.addEventListener("click", () => processRetryQueue(true)));
  app.querySelectorAll("[data-action='legal-back']").forEach((button) =>
    button.addEventListener("click", () => {
      history.pushState({}, "", "/");
      render();
    }),
  );
  app.querySelectorAll("[data-action='mark-insight-read']").forEach((button) =>
    button.addEventListener("click", () => {
      const insight = (state.insights || []).find((item) => item.id === button.dataset.id);
      if (insight) insight.isRead = true;
      saveState();
      render();
    }),
  );
  app.querySelectorAll("[data-action='open-report']").forEach((button) => button.addEventListener("click", () => goToView("report")));
  app.querySelectorAll("[data-action='approve-join-request'], [data-action='reject-join-request']").forEach((button) =>
    button.addEventListener("click", async () => {
      const approved = button.dataset.action === "approve-join-request";
      const request = (state.joinRequests || []).find((item) => item.id === button.dataset.id);
      try {
        if (typeof isCloudReady === "function" && isCloudReady()) await cloudApproveJoinRequest(button.dataset.id, approved);
        if (request) request.status = approved ? "approved" : "rejected";
        saveState();
        render();
        kasamToast(approved ? "Güncellendi." : "Silindi.");
      } catch (error) {
        logError(error, "join-approval");
        kasamToast(friendlyCloudError(error));
      }
    }),
  );
  app.querySelectorAll("[data-action='export-my-data']").forEach((button) => button.addEventListener("click", exportMyData));
  app.querySelectorAll("[data-action='delete-account']").forEach((button) => button.addEventListener("click", deleteMyAccount));
};
