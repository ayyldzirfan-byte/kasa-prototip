function kasamSignedMoney(value) {
  const number = Number(value || 0);
  if (number > 0) return `+${money(number)}`;
  if (number < 0) return `-${money(Math.abs(number))}`;
  return money(0);
}

function kasamToneClass(value) {
  const number = Number(value || 0);
  if (number > 0) return "positive";
  if (number < 0) return "warning";
  return "muted-value";
}

function kasamProjectTotals(project) {
  const entries = (state.entries || []).filter((entry) => entry.projectId === project?.id && (entry.status === "pending" || entryConfirmed(entry)));
  return calculateTotals(entries);
}

function kasamSyncIconHtml() {
  const synced = Boolean(state.cloudSyncAt);
  const title = synced ? `Son senkron ${new Date(state.cloudSyncAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}` : "Senkron bekliyor";
  return `<span class="sync-icon-only ${synced ? "is-synced" : ""}" title="${kasamSafe(title)}">${kasamIcon(synced ? "cloud-check" : "cloud-off", synced ? "icon-income" : "icon-neutral")}</span>`;
}

function kasamNotificationBadgeHtml(count) {
  const number = Number(count || 0);
  return number ? `<span class="notification-badge">${number > 9 ? "9+" : number}</span>` : "";
}

function kasamStripCloudStatusText() {
  const authBrand = document.querySelector(".auth-card .brand-lockup");
  if (!authBrand) return;
  authBrand.querySelectorAll(".cloud-pill, .field-help").forEach((element) => element.remove());
  if (!authBrand.querySelector(".sync-icon-only")) {
    authBrand.insertAdjacentHTML("beforeend", `<span class="auth-sync-icon">${kasamSyncIconHtml()}</span>`);
    if (window.lucide) lucide.createIcons();
  }
}

function kasamImageModalWrap(url, title, innerHtml) {
  if (!url) return innerHtml;
  return `<span class="image-modal-trigger" data-image-modal="${kasamSafeUrl(url)}" data-image-title="${kasamSafe(title || "Görsel")}">${innerHtml}</span>`;
}

var kasamUiBaseProjectPhotoHtml = typeof projectPhotoHtml === "function" ? projectPhotoHtml : null;
projectPhotoHtml = function projectPhotoHtmlUi(project, className = "project-thumb") {
  const fallback = kasamUiBaseProjectPhotoHtml ? kasamUiBaseProjectPhotoHtml(project, className) : `<span class="${className}">${kasamIcon("layers", "icon-neutral")}</span>`;
  return kasamImageModalWrap(project?.photoData || "", project?.name || "Bütçe resmi", fallback);
};

var kasamUiBaseMemberAvatarHtml = typeof memberAvatarHtml === "function" ? memberAvatarHtml : null;
memberAvatarHtml = function memberAvatarHtmlUi(user, project, className = "member-avatar") {
  const fallback = kasamUiBaseMemberAvatarHtml ? kasamUiBaseMemberAvatarHtml(user, project, className) : `<span class="${className}">${kasamSafe(shortName(user?.name || "K"))}</span>`;
  const projectPhoto = project?.memberPhotos?.[user?.id];
  return kasamImageModalWrap(projectPhoto?.photoData || user?.photoData || "", user?.name || "Profil resmi", fallback);
};

async function kasamReadSquareImage(file) {
  const dataUrl = await readImageAsDataUrl(file);
  if (!file || typeof Image === "undefined" || typeof document === "undefined") return dataUrl;
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const side = Math.min(image.width, image.height);
      if (!side) return resolve(dataUrl);
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 640;
      const context = canvas.getContext("2d");
      const sx = Math.round((image.width - side) / 2);
      const sy = Math.round((image.height - side) / 2);
      context.drawImage(image, sx, sy, side, side, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
}

handleOwnProfileForm = async function handleOwnProfileFormUi(form) {
  const user = currentUser();
  if (!user) return kasamToast("Kullanıcı bulunamadı.");
  const data = new FormData(form);
  const themeMode = String(data.get("themeMode") || state.themeMode || "system");
  if (["system", "light", "dark"].includes(themeMode)) state.themeMode = themeMode;
  if (typeof setKasamSoundEnabled === "function") setKasamSoundEnabled(data.get("soundEnabled") === "on");
  else state.soundEnabled = data.get("soundEnabled") === "on";
  const file = formFile(data, "profilePhoto");
  if (file) {
    user.photoName = file.name;
    user.photoData = await kasamReadSquareImage(file);
  }
  if (typeof applyProductionChrome === "function") applyProductionChrome();
  saveState();
  if (typeof isCloudReady === "function" && isCloudReady() && state.signedInUserId) {
    try { await cloudPushState(); } catch (error) { queueCloudRetry({ operation: "pushState" }); }
  }
  render();
  kasamToast("Profil kaydedildi.");
};

handleProjectPhotoForm = async function handleProjectPhotoFormUi(form) {
  const project = activeProject();
  if (!project) return kasamToast("Bütçe bulunamadı.");
  if (!isProjectOwner(project)) return kasamToast("Bütçe resmini sadece sahibi düzenler.");
  const file = formFile(new FormData(form), "projectPhoto");
  if (!file) return kasamToast("Bütçe resmi seç.");
  project.photoName = file.name;
  project.photoData = await kasamReadSquareImage(file);
  saveState();
  if (typeof isCloudReady === "function" && isCloudReady() && state.signedInUserId) {
    try { await cloudPushState(); } catch (error) { queueCloudRetry({ operation: "pushState" }); }
  }
  render();
  kasamToast("Bütçe resmi kaydedildi.");
};

kasamRhythmGridHtml = function kasamRhythmGridHtmlUi(entries) {
  const day = kasamPersonalPeriodTotals(entries, "day");
  const week = kasamPersonalPeriodTotals(entries, "week");
  const month = kasamPersonalPeriodTotals(entries, "month");
  const card = (icon, label, value) => `<article class="rhythm-card"><span>${kasamIcon(icon, kasamToneClass(value))}</span><p>${label}</p><strong class="${kasamToneClass(value)}">${kasamSignedMoney(value)}</strong></article>`;
  return `<section class="rhythm-grid">${card("activity", "Bugün", day.actual)}${card("calendar-check", "Bu hafta", week.actual)}${card("calendar-range", "Bu ay", month.actual)}</section>`;
};

projectImpactRows = function projectImpactRowsUi() {
  const user = currentUser();
  const projects = typeof kasamVisibleProjects === "function" ? kasamVisibleProjects() : state.projects || [];
  if (!user || !projects.length) return `<div class="empty-state">Henüz bütçe yok.</div>`;
  return projects.map((project) => {
    const impact = projectImpactForUser(project, user);
    const totals = kasamProjectTotals(project);
    const members = (state.users || []).filter((item) => (project.memberIds || []).includes(item.id));
    const personal = kasamIsPersonalProject(project);
    const bullets = personal ? "" : `<span class="member-bullets inline-bullets">${members.map((member) => `<i>${projectUserLabel(member, project)}</i>`).join("")}</span>`;
    return `
      <button class="budget-impact-row" data-action="activate-project-detail" data-id="${project.id}" type="button">
        ${personal ? memberAvatarHtml(user, project, "project-thumb") : projectPhotoHtml(project, "project-thumb")}
        <span class="budget-impact-main">
          <strong>${personal ? `${projectUserLabel(user)} kasası` : kasamSafe(project.name)}</strong>
          <small>${personal ? "Kişisel kasa" : `${members.length} üye · ${impact.count} hareket`}</small>
          ${bullets}
          ${personal ? "" : `<span class="budget-mini-totals"><i class="positive">Gelir ${kasamSignedMoney(totals.income)}</i><i class="warning">Gider -${money(totals.expense)}</i></span>`}
        </span>
        <span class="budget-impact-money ${kasamToneClass(impact.totals.comfortable)}">${kasamSignedMoney(impact.totals.comfortable)}</span>
      </button>
    `;
  }).join("");
};

renderHome = function renderHomeUi() {
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
        <span><strong>${projectUserLabel(user) || "Kasam"}</strong><small>${KASAM_BRAND.subSlogan}</small></span>
      </button>
      <div class="account-actions">
        ${kasamSyncIconHtml()}
        <button class="tiny-button notification-button" data-action="open-notifications" type="button">${kasamIcon("bell", "icon-neutral")} Bildirimler${kasamNotificationBadgeHtml(notificationCount)}</button>
        <button class="tiny-button muted-button" data-action="logout" type="button">${kasamIcon("log-out", "icon-neutral")} Çıkış</button>
      </div>
    </section>
    ${kasamFinanceIndexHtml(entries, totals)}
    ${kasamRhythmGridHtml(entries)}
    <section class="hero personal-hero compact-balance-card"><div class="hero-row"><div><p class="hero-title">Net durum</p><p class="hero-money ${kasamToneClass(totals.comfortable)}">${kasamSignedMoney(totals.comfortable)}</p><p class="hero-note">Kişisel kasan ve ortak bütçelerdeki payın.</p></div><span class="quick-pill ${totals.comfortable < 0 ? "danger-pill" : ""}">${statusSummaryLabel(totals.comfortable)}</span></div></section>
    ${insightCardHtml()}
    ${kasamContributorHtml(entries)}
    <section class="single-action-card"><button class="primary-button movement-add-button" data-action="go-add-movement" type="button">${kasamIcon("plus-circle", "icon-income")} Hareket ekle</button></section>
    <section class="grid-2">
      <article class="stat-card"><p class="stat-label">Gelir</p><p class="stat-value positive">${kasamSignedMoney(totals.income)}</p></article>
      <article class="stat-card"><p class="stat-label">Gider</p><p class="stat-value warning">-${money(totals.expense)}</p></article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="receivable"><p class="stat-label">Beklenen gelir</p><p class="stat-value positive">${kasamSignedMoney(totals.receivable)}</p></article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="payable"><p class="stat-label">Yaklaşan ödeme</p><p class="stat-value warning">-${money(totals.payable)}</p></article>
    </section>
    ${state.pendingDetail ? `<section class="card"><div class="section-head"><div><h2>${state.pendingDetail === "receivable" ? "Beklenen gelirler" : "Yaklaşan ödemeler"}</h2></div><button class="tiny-button" data-action="hide-pending-detail" type="button">Kapat</button></div><div class="expense-list">${pendingRowsForUser(state.pendingDetail)}</div></section>` : ""}
    <section class="card"><div class="section-head"><div><h2>Bütçeler</h2></div><button class="tiny-button" data-action="open-projects-list" type="button">Yeni bütçe oluştur</button></div><div class="project-list">${projectImpactRows()}</div></section>
    <section class="card"><div class="section-head"><div><h2>Beklenen hareketler</h2></div></div><div class="expense-list">${upcoming.length ? upcoming.map(entrySummaryRow).join("") : `<div class="empty-state">${KASAM_EMPTY.calendarDay}</div>`}</div></section>
    ${surpriseCount ? `<button class="surprise-alert-row" data-action="open-notifications" type="button">${kasamIcon("gift", "icon-pending")} ${surpriseCount} bekleyen sürpriz hareket</button>` : ""}
    <section class="card"><div class="section-head"><div><h2>Son hareketler</h2></div><button class="tiny-button" data-action="open-movements" type="button">Tümü</button></div><div class="expense-list">${recent.length ? recent.map(entrySummaryRow).join("") : `<div class="empty-state">${KASAM_EMPTY.movements}</div>`}</div></section>
  `;
};

renderOwnProfilePage = function renderOwnProfilePageUi() {
  const user = currentUser();
  if (!user) return "";
  return `
    <section class="card member-profile-page">
      <div class="section-head"><div class="project-card-title">${memberAvatarHtml(user, activeProject(), "profile-avatar")}<div><h2>${projectUserLabel(user)}</h2><p>${kasamDisplayName(user)}</p></div></div></div>
      <form class="form-grid profile-page-form" id="ownProfileForm">
        <label><span class="field-label">Tema</span><select class="select-input" name="themeMode"><option value="system" ${state.themeMode === "system" ? "selected" : ""}>Sistem</option><option value="light" ${state.themeMode === "light" ? "selected" : ""}>Açık</option><option value="dark" ${state.themeMode === "dark" ? "selected" : ""}>Koyu</option></select></label>
        <label class="switch-line"><input type="checkbox" name="soundEnabled" ${state.soundEnabled === false ? "" : "checked"} /> Bildirim ve oyun sesleri</label>
        <label class="photo-pick compact-pick"><span data-file-label>${user.photoData ? "Profil resmini değiştir" : "Profil resmi ekle"}</span><strong>${kasamIcon("camera", "icon-neutral")} Seç</strong><input name="profilePhoto" type="file" accept="image/*" /></label>
        <button class="primary-button" type="submit">Kaydet</button>
      </form>
      <div class="profile-score-row"><span>Skor ${Number(user.totalScore || 0)}</span><span>Doğru ${Number(user.correctGuesses || 0)}/${Number(user.totalGuesses || 0)}</span></div>
    </section>
    <section class="card"><h2>Veri ve hesap</h2><div class="inline-actions stacked-actions"><button class="secondary-button" data-action="export-my-data" type="button">${kasamIcon("download", "icon-neutral")} Verilerimi indir</button><button class="danger-button" data-action="delete-account" type="button">${kasamIcon("trash-2", "icon-expense")} Hesabımı sil</button></div></section>
  `;
};

entrySummaryRow = function entrySummaryRowUi(entry) {
  const isIncome = entry.type === "income" || entry.type === "receivable";
  const locked = entry.lockedNotificationId && !entryConfirmed(entry);
  const project = kasamProjectForEntry(entry);
  return `
    <div class="expense-row movement-card-row">
      <span class="emoji-dot system-icon-dot">${kasamMovementIcon(entry)}</span>
      <div class="expense-main"><p class="expense-title">${locked ? "?? Hareket" : entryTitle(entry)}</p><p class="expense-meta">${entryProjectName(entry)} · ${formatShortDate(entry.date)}${entry.status === "pending" ? " · planlandı" : ""}</p>${locked ? `<p class="expense-note">Detaylar oyun bitince açılır.</p>` : `<p class="expense-note">${kasamEntrySplitText(entry, true)}</p>`}</div>
      <strong class="expense-price ${isIncome ? "price-positive" : "price-negative"}">${locked ? "?? TL" : `${isIncome ? "+" : "-"}${money(kasamOriginalAmount(entry))}`}</strong>
      <button class="entry-project-arrow" data-action="entry-project-open" data-id="${project?.id || entry.projectId}" type="button" aria-label="Kasaya git">${kasamIcon("chevron-right", "icon-neutral")}</button>
    </div>
  `;
};

projectSummaryRow = function projectSummaryRowUi(project) {
  projectMemberSinceMap(project);
  const user = currentUser();
  const impact = projectImpactForUser(project);
  const totals = kasamProjectTotals(project);
  const members = (state.users || []).filter((member) => (project.memberIds || []).includes(member.id));
  const personal = kasamIsPersonalProject(project);
  return `
    <button class="project-list-row ${project.id === state.activeProjectId ? "active" : ""}" data-action="activate-project-detail" data-id="${project.id}" type="button">
      ${personal ? memberAvatarHtml(user, project, "project-thumb") : projectPhotoHtml(project, "project-thumb")}
      <span><strong>${personal ? `${projectUserLabel(user)} kasası` : kasamSafe(project.name)}</strong><small>${personal ? "Kişisel kasa" : `${members.length} üye`} · ${kasamSignedMoney(impact.totals.comfortable)}</small>${personal ? "" : `<span class="member-bullets inline-bullets">${members.map((member) => `<i>${projectUserLabel(member, project)}</i>`).join("")}</span><span class="budget-mini-totals"><i class="positive">Gelir ${kasamSignedMoney(totals.income)}</i><i class="warning">Gider -${money(totals.expense)}</i></span>`}</span>
      ${!personal ? `<span class="member-count-badge">${members.length}</span>` : ""}
    </button>
  `;
};

function kasamCalendarEntryRow(entry) {
  const isIncome = entry.type === "income" || entry.type === "receivable";
  const locked = entry.lockedNotificationId && !entryConfirmed(entry);
  const project = kasamProjectForEntry(entry);
  return `<div class="expense-row calendar-entry-row">${projectPhotoHtml(project, "calendar-project-thumb")}<div class="expense-main"><p class="expense-title">${locked ? "?? Hareket" : entryTitle(entry)}</p><p class="expense-meta">${kasamSafe(project?.name || "Kasa")} · ${formatShortDate(entry.date)}</p></div><strong class="expense-price ${isIncome ? "price-positive" : "price-negative"}">${locked ? "?? TL" : `${isIncome ? "+" : "-"}${money(kasamOriginalAmount(entry))}`}</strong></div>`;
}

renderCalendar = function renderCalendarUi() {
  const base = state.calendarMonth ? dateFromKey(`${state.calendarMonth}-01`) : new Date();
  const monthText = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(base);
  const selectedDay = state.calendarDay || todayKey();
  const dayEntries = calendarEntries().filter((entry) => entry.date === selectedDay).sort(byDateAsc);
  const planned = calendarEntries().filter((entry) => entry.status === "pending").sort(byDateAsc).slice(0, 6);
  return `
    <section class="card desk-calendar-card"><div class="calendar-top"><button class="tiny-button" data-action="month-prev" type="button">${kasamIcon("chevron-left", "icon-neutral")} Önceki</button><div><p class="eyebrow">Takvim</p><h2>${kasamSafe(monthText)}</h2></div><button class="tiny-button" data-action="month-next" type="button">Sonraki ${kasamIcon("chevron-right", "icon-neutral")}</button></div><div class="desk-calendar" data-flip="${state.calendarFlip || 0}">${calendarGridHtml(base)}</div></section>
    <section class="card"><div class="section-head"><div><h2>${formatShortDate(selectedDay)}</h2><p>Seçilen günün hareketleri.</p></div></div><div class="expense-list">${dayEntries.length ? dayEntries.map(kasamCalendarEntryRow).join("") : `<div class="empty-state">${KASAM_EMPTY.calendarDay}</div>`}</div><button class="secondary-button calendar-add-button" data-action="calendar-add-entry" data-date="${selectedDay}" type="button">${kasamIcon("plus-circle", "icon-neutral")} Bu güne hareket ekle</button></section>
    <section class="card"><div class="section-head"><div><h2>Planlananlar</h2></div></div><div class="expense-list">${planned.length ? planned.map(kasamCalendarEntryRow).join("") : `<div class="empty-state">Takvime bağlı plan yok.</div>`}</div></section>
  `;
};

reactionSetupHtml = function reactionSetupHtmlUi() {
  return `<div class="game-v2-setup compact-game-setup"><p class="field-help">Sorular hareket bilgisinden otomatik kurulur. Sadece doğru ve yanlış cevapta görünecek tepkiyi seç.</p><div class="media-response-grid">${kasamGameV2ContentPicker("gameCorrectReaction", "Doğru cevap tepkisi", "✓")}${kasamGameV2ContentPicker("gameWrongReaction", "Yanlış cevap tepkisi", "✕")}</div></div>`;
};

kasamGameV2PayloadFromForm = async function kasamGameV2PayloadFromFormUi(form) {
  const data = new FormData(form);
  const headingName = kasamCleanText(data.get("headingName") || "Hareket");
  const correctReaction = await kasamGameV2ReadReaction(data, "gameCorrectReaction", "✓");
  const wrongReaction = await kasamGameV2ReadReaction(data, "gameWrongReaction", "✕");
  return {
    hideActor: true,
    categoryOptions: kasamGameV2FourOptions([], headingName),
    phase3Correct: 0,
    phase3Image: "",
    actorWrongReaction: wrongReaction,
    actorCorrectReaction: correctReaction,
    typeWrongReaction: wrongReaction,
    typeCorrectReaction: correctReaction,
    categoryWrongReaction: wrongReaction,
    categoryCorrectReaction: correctReaction,
  };
};

kasamMediaSheetHtml = function kasamMediaSheetHtmlUi(prefix) {
  return `
    <div class="media-sheet-backdrop" data-media-sheet="${prefix}">
      <div class="media-sheet compact-media-sheet" role="dialog" aria-modal="true" aria-label="Medya seç">
        <div class="media-sheet-handle"></div>
        <div class="media-sheet-tabs"><button class="active" data-media-tab="emoji" type="button">Emoji</button><button data-media-tab="gif" type="button">GIF</button><button data-media-tab="sticker" type="button">Sticker</button></div>
        <div class="media-sheet-panel active" data-media-panel="emoji"><div class="emoji-grid">${KASAM_MEDIA_EMOJIS.map((emoji) => `<button class="emoji-pick-button" data-media-emoji="${kasamEscape(emoji)}" type="button">${kasamSafe(emoji)}</button>`).join("")}</div></div>
        <div class="media-sheet-panel" data-media-panel="gif"><input class="text-input media-search-input" data-gif-query="${prefix}" placeholder="GIF ara" autocomplete="off" /><div class="gif-result-grid" data-gif-results="${prefix}" aria-live="polite"><p class="gif-result-empty">GIF'ler açılıyor...</p></div></div>
        <div class="media-sheet-panel" data-media-panel="sticker"><div class="sticker-grid">${KASAM_GAME_V2_STICKERS.slice(0, 20).map((sticker) => `<button class="sticker-button" data-media-sticker="${kasamEscape(sticker.data)}" type="button"><img src="${kasamGameV2SafeMedia(sticker.data)}" alt="${kasamSafe(sticker.label)}" /></button>`).join("")}</div></div>
        <div class="media-sheet-footer"><button class="ghost-button compact-action" data-media-photo="${prefix}" type="button">${kasamIcon ? kasamIcon("keyboard", "icon-neutral") : ""} Klavyeden seç</button><button class="tiny-button" data-media-clear="${prefix}" type="button">Temizle</button></div>
      </div>
    </div>
  `;
};

kasamGameV2SearchGifs = async function kasamGameV2SearchGifsUi(prefix, defaultQuery = "para") {
  const sheet = document.querySelector(`[data-media-sheet="${prefix}"]`);
  const queryInput = sheet?.querySelector(`[data-gif-query="${prefix}"]`);
  const results = sheet?.querySelector(`[data-gif-results="${prefix}"]`);
  const query = String(queryInput?.value || defaultQuery || "para").trim();
  if (!sheet || !results) return;
  results.innerHTML = `<p class="gif-result-empty">GIF aranıyor...</p>`;
  try {
    const gifs = await kasamGameV2FetchGifs(query);
    results.innerHTML = gifs.length ? gifs.map((gif) => `<button class="gif-result-button" data-gif-url="${kasamEscape(gif.url)}" type="button"><img src="${kasamGameV2SafeMedia(gif.url)}" alt="${kasamSafe(gif.title || "GIF")}" /></button>`).join("") : `<p class="gif-result-empty">Sonuç bulunamadı.</p>`;
  } catch (error) {
    results.innerHTML = `<p class="gif-result-empty">GIF araması için Vercel key/deploy kontrol edilmeli.</p>`;
  }
};

var kasamUiBaseBindMediaSheet = kasamBindMediaSheet;
kasamBindMediaSheet = function kasamBindMediaSheetUi(sheet, prefix) {
  kasamUiBaseBindMediaSheet(sheet, prefix);
  sheet.addEventListener("click", (event) => {
    const tabButton = event.target.closest("[data-media-tab]");
    if (tabButton?.dataset.mediaTab === "gif") {
      const results = sheet.querySelector(`[data-gif-results="${prefix}"]`);
      if (results && !results.dataset.loadedOnce) {
        results.dataset.loadedOnce = "1";
        kasamGameV2SearchGifs(prefix, "para");
      }
    }
  });
};

var kasamUiBaseCreateEntryNotification = createEntryNotification;
createEntryNotification = function createEntryNotificationUi(entry, options = {}) {
  const notification = kasamUiBaseCreateEntryNotification(entry, options);
  if (notification && notification.mode !== "silent" && typeof playNotificationSound === "function") playNotificationSound();
  return notification;
};

handleGuessForm = function handleGuessFormUi(event, form) {
  event.preventDefault();
  event.stopImmediatePropagation();
  const notification = (state.notifications || []).find((item) => item.id === form.dataset.id);
  if (!notification || notification.gameVersion !== "v2") return kasamGameV2BaseHandleGuessForm ? kasamGameV2BaseHandleGuessForm(event, form) : null;
  const submitter = event.submitter;
  const data = new FormData(form);
  const step = form.dataset.step || "actor";
  const payload = { step };
  if (step === "actor") payload.predictedActorId = submitter?.value || String(data.get("predictedActorId") || "");
  if (step === "type") payload.predictedType = submitter?.value || String(data.get("predictedType") || "");
  if (step === "category") payload.predictedOption = Number(submitter?.value ?? data.get("predictedOption") ?? 0);
  const result = guessNotification(form.dataset.id, payload);
  if (result.status === "already") return kasamToast("Bu aşama cevaplandı.");
  if (result.status === "blocked") return kasamToast("Önceki aşama tamamlanmadı.");
  saveState();
  render();
  if (result.status === "saved") {
    kasamGameV2ShowOverlay(result.stepResult.correct, kasamGameV2ReactionFor(result.notification, result.phase, result.stepResult.correct));
    if (result.notification?.gameFullyCompleted && typeof playSuccessSound === "function") window.setTimeout(playSuccessSound, 350);
  }
  return result;
};

function kasamShowImageModal(url, title = "Görsel") {
  document.querySelector(".image-modal-overlay")?.remove();
  const overlay = document.createElement("div");
  overlay.className = "image-modal-overlay";
  overlay.innerHTML = `<button class="image-modal-close" data-action="close-image-modal" type="button" aria-label="Kapat">${kasamIcon("x", "icon-neutral")}</button><img src="${kasamSafeUrl(url)}" alt="${kasamSafe(title)}" />`;
  document.body.appendChild(overlay);
}

var kasamUiBaseBindScreen = bindScreen;
bindScreen = function bindScreenUi() {
  kasamUiBaseBindScreen();
  kasamStripCloudStatusText();
  app.querySelectorAll("[data-action='calendar-add-entry']").forEach((button) => {
    if (button.dataset.calendarAddBound) return;
    button.dataset.calendarAddBound = "1";
    button.addEventListener("click", () => {
      draft.date = button.dataset.date || state.calendarDay || todayKey();
      draft.type = "expense";
      state.previousView = "calendar";
      state.activeView = "add";
      saveState();
      render();
    });
  });
  app.querySelectorAll("[data-action='entry-project-open']").forEach((button) => {
    if (button.dataset.projectOpenBound) return;
    button.dataset.projectOpenBound = "1";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const project = (state.projects || []).find((item) => item.id === button.dataset.id);
      if (project) {
        state.activeProjectId = project.id;
        state.groupMode = "detail";
        state.activeView = "group";
        saveState();
        render();
      }
    });
  });
  app.querySelectorAll("[data-image-modal]").forEach((trigger) => {
    if (trigger.dataset.imageModalBound) return;
    trigger.dataset.imageModalBound = "1";
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      kasamShowImageModal(trigger.dataset.imageModal, trigger.dataset.imageTitle || "Görsel");
    });
  });
};

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-action='close-image-modal']") || event.target.classList?.contains("image-modal-overlay")) {
    document.querySelector(".image-modal-overlay")?.remove();
  }
});
