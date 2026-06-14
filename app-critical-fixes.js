const KASAM_CRITICAL_VERSION = "14.06.2026 19:05";

if (typeof KASAM_EMPTY === "object" && KASAM_EMPTY) {
  KASAM_EMPTY.notifications = "Sessizlik...";
}

function kasamCriticalUserImpact(entry, userId = currentUser()?.id) {
  if (!entry || !userId) return 0;
  const amount = Number(entry.amount || 0);
  const splitWith = Array.isArray(entry.splitWith) ? entry.splitWith : [];
  const splitRatio = Array.isArray(entry.splitRatio) ? entry.splitRatio : [];
  const index = splitWith.indexOf(userId);
  const ratio = index >= 0 ? Number(splitRatio[index] || 0) : (entry.userId === userId ? 1 : 0);
  const share = amount * ratio;
  if (entry.type === "income" || entry.type === "receivable") return share;
  if (entry.type === "expense" || entry.type === "payable") return -share;
  return 0;
}

function kasamCriticalFxLabel(entry, value) {
  const currency = String(entry?.currency || "TRY").toUpperCase();
  const signed = kasamSignedMoney(value);
  if (currency === "TRY" || currency === "TL") return signed;
  const rate = Number(entry.exchangeRate || 1);
  const original = rate ? Math.abs(value) / rate : Number(entry.enteredAmount || 0);
  return `${signed} (${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(original)} ${currency})`;
}

function kasamCriticalNotificationFor(entry) {
  return (state.notifications || []).find((item) => item.entryId === entry?.id) || null;
}

function kasamCriticalIsPendingSurprise(notification, userId = currentUser()?.id) {
  if (!notification || notification.mode !== "surprise") return false;
  if (notification.actorId === userId) return false;
  if (!Array.isArray(notification.recipients) || !notification.recipients.includes(userId)) return false;
  if (notification.revealedAt || notification.isCompleted || notification.gameFullyCompleted) return false;
  return true;
}

function kasamCriticalEntryLockedForUser(entry, userId = currentUser()?.id) {
  if (!entry?.lockedNotificationId) return false;
  const notification = kasamCriticalNotificationFor(entry);
  return kasamCriticalIsPendingSurprise(notification, userId);
}

function kasamCriticalCompactDate(value) {
  try {
    return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" }).format(dateFromKey(String(value || todayKey()).slice(0, 10)));
  } catch (_error) {
    return String(value || "");
  }
}

function kasamCriticalProjectRows() {
  const user = currentUser();
  const projects = typeof kasamVisibleProjects === "function" ? kasamVisibleProjects() : state.projects || [];
  if (!user || !projects.length) return `<div class="empty-state">Bütçe yok. Kendi kasanı oluştur veya birine katıl.</div>`;
  return projects.map((project) => {
    const personal = typeof kasamIsPersonalProject === "function" && kasamIsPersonalProject(project);
    const impact = projectImpactForUser(project, user);
    const totals = typeof kasamProjectTotals === "function" ? kasamProjectTotals(project) : calculateTotals((state.entries || []).filter((entry) => entry.projectId === project.id));
    const members = (state.users || []).filter((member) => (project.memberIds || []).includes(member.id));
    const memberLine = members.slice(0, 4).map((member) => `<span>${memberAvatarHtml(member, project, "mini-avatar")}${kasamSafe(projectUserLabel(member, project))}</span>`).join("");
    return `
      <button class="budget-impact-row critical-budget-row ${personal ? "is-personal" : "is-shared"}" data-action="activate-project-detail" data-id="${project.id}" type="button">
        ${personal ? memberAvatarHtml(user, project, "project-thumb") : projectPhotoHtml(project, "project-thumb")}
        <span class="budget-impact-main">
          <strong>${personal ? `${projectUserLabel(user)} kasası` : kasamSafe(project.name)}</strong>
          <small>${personal ? "Kişisel kasa" : `${members.length} üye · ${impact.count} hareket`}</small>
          ${personal ? "" : `<span class="member-bullets critical-member-list">${memberLine}</span>`}
          ${personal ? "" : `<span class="budget-mini-totals"><i class="positive">Gelir ${kasamSignedMoney(totals.income)}</i><i class="warning">Gider -${money(totals.expense)}</i></span>`}
        </span>
        <span class="budget-impact-money ${kasamToneClass(impact.totals.comfortable)}">${kasamSignedMoney(impact.totals.comfortable)}</span>
      </button>
    `;
  }).join("");
}

if (typeof projectImpactRows === "function") {
  projectImpactRows = kasamCriticalProjectRows;
}

if (typeof projectSummaryRow === "function") {
  projectSummaryRow = function projectSummaryRowCritical(project) {
    return kasamCriticalProjectRows.call(null).includes(`data-id="${project.id}"`)
      ? kasamCriticalProjectRows().match(new RegExp(`<button[^]*?data-id="${project.id}"[^]*?</button>`))?.[0] || ""
      : "";
  };
}

if (typeof lockedSurpriseCountForUser === "function") {
  lockedSurpriseCountForUser = function lockedSurpriseCountForUserCritical(user = currentUser()) {
    if (!user) return 0;
    return (state.entries || []).filter((entry) => {
      if (!entry.lockedNotificationId || entryConfirmed(entry)) return false;
      const notification = kasamCriticalNotificationFor(entry);
      return kasamCriticalIsPendingSurprise(notification, user.id);
    }).length;
  };
}

if (typeof notificationEntries === "function") {
  notificationEntries = function notificationEntriesCritical() {
    const user = currentUser();
    if (!user) return [];
    return (state.notifications || [])
      .filter((item) => {
        const isRecipient = Array.isArray(item.recipients) && item.recipients.includes(user.id);
        const isActor = item.actorId === user.id;
        if (item.mode === "surprise") {
          if (typeof maybeRevealNotification === "function") maybeRevealNotification(item);
          if (!item.isCompleted && !item.revealedAt && !item.gameFullyCompleted) return isRecipient && !isActor;
          return isRecipient || isActor;
        }
        return isRecipient || isActor;
      })
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  };
}

function kasamCriticalEntryMedia(entry) {
  const notification = kasamCriticalNotificationFor(entry);
  return {
    photoData: notification?.photoData || entry?.photoData || "",
    photoName: notification?.photoName || entry?.photoName || "",
    gif: notification?.gif || entry?.gif || "",
    emoji: notification?.emoji || entry?.mediaEmoji || entry?.emoji || "",
  };
}

function kasamCriticalMediaThumb(media, icon) {
  if (media?.photoData || media?.gif) return `<span class="movement-media-thumb">${mediaPreviewHtml(media, icon)}</span>`;
  return `<span class="emoji-dot system-icon-dot">${media?.emoji ? kasamSafe(media.emoji, 24) : icon}</span>`;
}

if (typeof entrySummaryRow === "function") {
  entrySummaryRow = function entrySummaryRowCritical(entry) {
    const isIncome = entry.type === "income" || entry.type === "receivable";
    const locked = kasamCriticalEntryLockedForUser(entry);
    const project = typeof kasamProjectForEntry === "function" ? kasamProjectForEntry(entry) : (state.projects || []).find((item) => item.id === entry.projectId);
    const impact = kasamCriticalUserImpact(entry);
    const media = locked ? null : kasamCriticalEntryMedia(entry);
    const thumb = locked ? `<span class="emoji-dot system-icon-dot">${kasamMovementIcon(entry)}</span>` : kasamCriticalMediaThumb(media, kasamMovementIcon(entry));
    const title = locked ? "?? Hareket" : entryTitle(entry);
    const meta = `${kasamSafe(project?.name || "Kasa")} · ${kasamCriticalCompactDate(entry.date)}${entry.status === "pending" ? " · planlandı" : ""}`;
    const note = locked ? "Detaylar oyun bitince açılır." : (project?.id ? `Kişisel yansıma: ${kasamCriticalFxLabel(entry, impact)}` : "");
    return `
      <div class="expense-row movement-card-row compact-entry-row" data-action="open-entry-media" data-id="${entry.id}" role="button" tabindex="0">
        ${thumb}
        <div class="expense-main"><p class="expense-title">${title}</p><p class="expense-meta">${meta}</p>${note ? `<p class="expense-note">${note}</p>` : ""}</div>
        <strong class="expense-price ${impact >= 0 ? "price-positive" : "price-negative"}">${locked ? "?? TL" : kasamCriticalFxLabel(entry, impact)}</strong>
        <button class="entry-project-arrow" data-action="entry-project-open" data-id="${project?.id || entry.projectId}" type="button" aria-label="Kasaya git">${kasamIcon("chevron-right", "icon-neutral")}</button>
      </div>
    `;
  };
}

function kasamCriticalProjectMovementRows(project) {
  const entries = (state.entries || []).filter((entry) => entry.projectId === project?.id).sort(byDateDesc);
  if (!entries.length) return `<div class="empty-state">Henüz hareket yok. İlk hareketi sen ekle.</div>`;
  return entries.map((entry) => {
    const locked = entry.lockedNotificationId && !entryConfirmed(entry);
    const isIncome = entry.type === "income" || entry.type === "receivable";
    const actor = (state.users || []).find((user) => user.id === entry.userId);
    const splitText = locked ? "Detaylar oyun bitince açılır." : kasamEntrySplitText(entry, true);
    return `
      <div class="expense-row project-movement-row" data-action="open-entry-media" data-id="${entry.id}" role="button" tabindex="0">
        ${kasamCriticalMediaThumb(kasamCriticalEntryMedia(entry), kasamMovementIcon(entry))}
        <div class="expense-main">
          <p class="expense-title">${locked ? "?? Hareket" : entryTitle(entry)}</p>
          <p class="expense-meta">${projectUserLabel(actor, project)} · ${kasamCriticalCompactDate(entry.date)}</p>
          <p class="expense-note">${splitText}</p>
        </div>
        <strong class="expense-price ${isIncome ? "price-positive" : "price-negative"}">${locked ? "?? TL" : `${isIncome ? "+" : "-"}${money(kasamOriginalAmount(entry))}`}</strong>
      </div>
    `;
  }).join("");
}

if (typeof kasamProjectMovementRows === "function") {
  kasamProjectMovementRows = kasamCriticalProjectMovementRows;
}

function kasamCriticalSplitPicker(project, typeId) {
  const user = currentUser();
  if (!project || !user) return "";
  const members = (state.users || []).filter((member) => (project.memberIds || []).includes(member.id));
  const eligible = members.filter((member) => {
    const since = projectMemberSince(project, member.id);
    return !since || since <= (draft.date || todayKey());
  });
  const personal = typeof kasamIsPersonalProject === "function" && kasamIsPersonalProject(project);
  const selected = personal ? [user.id] : eligible.map((member) => member.id);
  const label = typeId === "income" ? "Gelir paylaşımı" : "Gider paylaşımı";
  return `
    <section class="split-picker-card">
      <div>
        <strong>${label}</strong>
        <p>Kasaya yansıması seçili kişilere eşit bölünür.</p>
      </div>
      <div class="split-toggle-grid">
        ${eligible.map((member) => `
          <label class="split-toggle ${selected.includes(member.id) ? "selected" : ""}">
            <input type="checkbox" name="splitWith" value="${member.id}" ${selected.includes(member.id) ? "checked" : ""} ${personal ? "disabled" : ""} />
            ${memberAvatarHtml(member, project, "mini-avatar")}
            <span>${kasamSafe(projectUserLabel(member, project))}</span>
          </label>
        `).join("")}
      </div>
    </section>
  `;
}

if (typeof kasamSplitPreviewHtml === "function") {
  kasamSplitPreviewHtml = kasamCriticalSplitPicker;
}

if (typeof splitForResponsibleEntry === "function") {
  const kasamCriticalBaseSplitForResponsibleEntry = splitForResponsibleEntry;
  splitForResponsibleEntry = function splitForResponsibleEntryCritical(project, type, userId, date) {
    const form = document.querySelector("#entryForm");
    const selected = [...(form?.querySelectorAll("input[name='splitWith']:checked") || [])].map((input) => input.value).filter(Boolean);
    if (selected.length) {
      return { splitWith: selected, splitRatio: selected.map(() => 1 / selected.length) };
    }
    return kasamCriticalBaseSplitForResponsibleEntry(project, type, userId, date);
  };
}

if (typeof renderHome === "function") {
  const kasamCriticalRenderHomeBase = renderHome;
  renderHome = function renderHomeCritical() {
    let html = kasamCriticalRenderHomeBase();
    html = html.replace(/<small>Kişisel ve ortak harcamaların tek ekranda\.<\/small>/g, "<small>Kendi kasan ve bağlı bütçelerin.</small>");
    html = html.replace(/<small>Kişisel ve ortak harcamaların tek ekranda\.<\/small>/g, "<small>Kendi kasan ve bağlı bütçelerin.</small>");
    html = html.replace(/<button class="tiny-button muted-button" data-action="logout"[^]*?<\/button>/g, "");
    html = html.replace(/<span class="quick-pill[^>]*>([^<]*)<\/span>/g, '<span class="rhythm-status-pill">$1</span>');
    return html;
  };
}

if (typeof renderOwnProfilePage === "function") {
  const kasamCriticalRenderOwnProfileBase = renderOwnProfilePage;
  renderOwnProfilePage = function renderOwnProfilePageCritical() {
    const html = kasamCriticalRenderOwnProfileBase();
    if (html.includes('data-action="logout"')) return html;
    return html.replace("</section>", `<div class="profile-logout-row"><button class="ghost-button" data-action="logout" type="button">${kasamIcon("log-out", "icon-neutral")} Çıkış yap</button></div></section>`);
  };
}

if (typeof renderProjectList === "function") {
  const kasamCriticalRenderProjectListBase = renderProjectList;
  renderProjectList = function renderProjectListCritical() {
    return kasamCriticalRenderProjectListBase().replace(/<form class="inline-form cloud-join-card"[^]*?<\/form>/g, "");
  };
}

if (typeof renderGroup === "function") {
  const kasamCriticalRenderGroupBase = renderGroup;
  renderGroup = function renderGroupCritical() {
    let html = kasamCriticalRenderGroupBase();
    html = html.replace(/<div class="invite-box"><div><span class="field-label">Kod<\/span><strong>[^<]*<\/strong><p>[^<]*<\/p><\/div><button class="mini-action" data-action="copy-project-link" type="button">Kopyala<\/button><\/div>/g, () => {
      const project = activeProject();
      const link = project ? inviteLink(project) : "";
      return `<div class="invite-box share-invite-box"><div><span class="field-label">Paylaşım bağlantısı</span><strong>Bu kasaya davet et</strong><p>${kasamSafe(link)}</p></div><button class="mini-action primary-share-action" data-action="share-project-link" type="button">${kasamIcon("share-2", "icon-neutral")} Paylaş</button><button class="mini-action" data-action="copy-project-link" type="button">Kopyala</button></div>`;
    });
    html = html.replace(/<section class="card"><h2>Katılma talepleri<\/h2><div class="expense-list"><div class="empty-state">Bekleyen katılma talebi yok\.<\/div><\/div><\/section>/g, "");
    return html;
  };
}

if (typeof notificationRow === "function") {
  const kasamCriticalNotificationRowBase = notificationRow;
  notificationRow = function notificationRowCritical(notification) {
    const user = currentUser();
    if (notification?.mode === "surprise" && kasamCriticalIsPendingSurprise(notification, user?.id)) {
      const project = (state.projects || []).find((item) => item.id === notification.projectId);
      const members = (state.users || []).filter((member) => (project?.memberIds || []).includes(member.id));
      return `
        <article class="notification-card critical-game-card">
          <div class="notification-copy">
            <p class="eyebrow">Yeni tahmin var</p>
            <h3>Bu hareketi kim ekledi?</h3>
            <p>Detaylar oyun bitene kadar kapalı.</p>
          </div>
          <form class="game-guess-form critical-game-form" data-id="${notification.id}" data-step="actor">
            <div class="game-member-grid">
              ${members.map((member) => `<button name="predictedActorId" value="${member.id}" type="submit">${memberAvatarHtml(member, project, "member-avatar")}<span>${kasamSafe(projectUserLabel(member, project))}</span></button>`).join("")}
            </div>
          </form>
        </article>
      `;
    }
    if (notification?.mode === "surprise" && (notification.isCompleted || notification.revealedAt || notification.gameFullyCompleted)) {
      const actor = (state.users || []).find((item) => item.id === notification.actorId);
      const correct = Array.isArray(notification.phase1Guesses)
        ? notification.phase1Guesses.find((guess) => guess.userId === user?.id)?.isCorrect
        : null;
      const story = correct === false ? `${projectUserLabel(actor)} bu hareketi eklemişti; bilememiştin.` : `${projectUserLabel(actor)} bu hareketi eklemişti.`;
      return `<article class="notification-card passive-history-card"><div class="expense-main"><p class="expense-title">${kasamSafe(notification.title || "Hareket")}</p><p class="expense-meta">${story}</p><p class="expense-note">${money(notification.amount || 0)} · ${relativeDate(notification.createdAt)}</p></div></article>`;
    }
    return kasamCriticalNotificationRowBase(notification);
  };
}

if (typeof renderNotifications === "function") {
  renderNotifications = function renderNotificationsCritical() {
    const notifications = notificationEntries();
    return `
      <section class="card notifications-page-card">
        <div class="section-head"><div><h2>Bildirimler</h2><p>Yeni tahminler, tepkiler ve kasa hareketleri.</p></div></div>
        <div class="expense-list">${notifications.length ? notifications.map(notificationRow).join("") : `<div class="empty-state">${KASAM_EMPTY.notifications}</div>`}</div>
      </section>
    `;
  };
}

function kasamCriticalAmountShell(html) {
  return html.replace(
    /<div><label class="field-label" for="amount">Tutar<\/label><input class="amount-input"([^>]*)\/?><\/div>/,
    (_match, attrs) => {
      const cleanedAttrs = String(attrs || "").replace(/\splaceholder="[^"]*"/g, "").trim();
      return `<div class="amount-shell"><label class="field-label" for="amount">Tutar</label><div class="amount-input-wrap"><input class="amount-input" ${cleanedAttrs} placeholder="" /><span class="amount-currency-suffix" data-amount-currency-suffix>TL</span></div></div>`;
    },
  );
}

if (typeof renderAdd === "function") {
  const kasamCriticalRenderAddBase = renderAdd;
  renderAdd = function renderAddCritical() {
    let html = kasamCriticalRenderAddBase();
    html = kasamCriticalAmountShell(html);
    html = html.replace(/placeholder="1\.000"/g, 'placeholder=""');
    html = html.replace(/<span class="field-label">Kur<\/span>/g, '<span class="field-label">Kur <small data-rate-source></small></span>');
    return html;
  };
}

async function kasamCriticalFetchRate(currency, date) {
  const code = String(currency || "TRY").toUpperCase();
  if (code === "TRY" || code === "TL") return 1;
  try {
    const response = await fetch(`/api/tcmb-rate?currency=${encodeURIComponent(code)}&date=${encodeURIComponent(date || todayKey())}`);
    if (!response.ok) throw new Error(`rate-${response.status}`);
    const payload = await response.json();
    const rate = Number(payload.rate || 0);
    return rate > 0 ? rate : 1;
  } catch (_error) {
    const fallback = { USD: 32, EUR: 35, GBP: 41 };
    return fallback[code] || 1;
  }
}

function kasamCriticalFormatAmountInput(input) {
  const raw = String(input.value || "").replace(/[^\d,\.]/g, "");
  if (!raw) return;
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  if (!Number.isFinite(value)) return;
  input.value = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(value);
}

async function kasamCriticalUpdateCurrencyUi(form) {
  const currency = String(form?.elements?.currency?.value || "TRY").toUpperCase();
  const suffix = form?.querySelector("[data-amount-currency-suffix]");
  if (suffix) suffix.textContent = currency === "TRY" ? "TL" : currency;
  const rateField = form?.querySelector(".fx-rate-field");
  if (rateField) rateField.classList.toggle("is-hidden", currency === "TRY");
  if (currency !== "TRY") {
    const rate = await kasamCriticalFetchRate(currency, form?.elements?.date?.value || todayKey());
    if (form?.elements?.exchangeRate) form.elements.exchangeRate.value = String(rate).replace(".", ",");
    const source = form?.querySelector("[data-rate-source]");
    if (source) source.textContent = "TCMB";
  }
}

if (typeof kasamMediaSheetHtml === "function") {
  kasamMediaSheetHtml = function kasamMediaSheetHtmlCritical(prefix) {
    return `
      <div class="media-sheet-backdrop" data-media-sheet="${prefix}">
        <div class="media-sheet compact-media-sheet critical-media-sheet" role="dialog" aria-modal="true" aria-label="Medya seç">
          <div class="media-sheet-handle"></div>
          <div class="media-sheet-tabs"><button class="active" data-media-tab="emoji" type="button">Emoji</button><button data-media-tab="gif" type="button">GIF</button><button data-media-tab="sticker" type="button">Sticker</button></div>
          <div class="media-sheet-panel active" data-media-panel="emoji"><div class="emoji-grid">${KASAM_MEDIA_EMOJIS.map((emoji) => `<button class="emoji-pick-button" data-media-emoji="${kasamEscape(emoji)}" type="button">${kasamSafe(emoji)}</button>`).join("")}</div></div>
          <div class="media-sheet-panel" data-media-panel="gif"><div class="game-gif-search-row"><input class="text-input media-search-input" data-gif-query="${prefix}" placeholder="GIF ara" autocomplete="off" /><button class="small-button" data-gif-search="${prefix}" type="button">Ara</button></div><div class="gif-result-grid" data-gif-results="${prefix}" aria-live="polite"><p class="gif-result-empty">GIF'ler yükleniyor...</p></div></div>
          <div class="media-sheet-panel" data-media-panel="sticker"><p class="field-help">iOS/WhatsApp sticker paketi PWA içinde doğrudan okunamaz. Kopyaladığın stickerı yapıştırabilir veya görsel seçebilirsin.</p><div class="sticker-grid">${KASAM_GAME_V2_STICKERS.slice(0, 20).map((sticker) => `<button class="sticker-button" data-media-sticker="${kasamEscape(sticker.data)}" type="button"><img src="${kasamGameV2SafeMedia(sticker.data)}" alt="${kasamSafe(sticker.label)}" /></button>`).join("")}</div></div>
          <div class="media-sheet-footer"><button class="ghost-button compact-action" data-media-photo="${prefix}" type="button">${kasamIcon("image", "icon-neutral")} Görsel seç</button><button class="ghost-button compact-action" data-media-paste="${prefix}" type="button">${kasamIcon("clipboard", "icon-neutral")} Yapıştır</button><button class="tiny-button" data-media-clear="${prefix}" type="button">Temizle</button></div>
        </div>
      </div>
    `;
  };
}

if (typeof kasamGameV2SearchGifs === "function") {
  kasamGameV2SearchGifs = async function kasamGameV2SearchGifsCritical(prefix, defaultQuery = "para") {
    const sheet = document.querySelector(`[data-media-sheet="${prefix}"]`);
    const queryInput = sheet?.querySelector(`[data-gif-query="${prefix}"]`);
    const results = sheet?.querySelector(`[data-gif-results="${prefix}"]`);
    const query = String(queryInput?.value || defaultQuery || "para").trim();
    if (!sheet || !results) return;
    results.innerHTML = `<p class="gif-result-empty">GIF aranıyor...</p>`;
    try {
      const gifs = await kasamGameV2FetchGifs(query);
      results.innerHTML = gifs.length
        ? gifs.map((gif) => `<button class="gif-result-button" data-gif-url="${kasamEscape(gif.url)}" type="button"><img src="${kasamGameV2SafeMedia(gif.url)}" alt="${kasamSafe(gif.title || "GIF")}" loading="lazy" /></button>`).join("")
        : `<p class="gif-result-empty">Sonuç bulunamadı.</p>`;
    } catch (_error) {
      results.innerHTML = `<p class="gif-result-empty">GIF servisi yanıt vermedi.</p>`;
    }
  };
}

if (typeof kasamBindMediaSheet === "function") {
  const kasamCriticalBindMediaBase = kasamBindMediaSheet;
  kasamBindMediaSheet = function kasamBindMediaSheetCritical(sheet, prefix) {
    kasamCriticalBindMediaBase(sheet, prefix);
    let gifTimer = null;
    const searchInput = sheet.querySelector(`[data-gif-query="${prefix}"]`);
    sheet.addEventListener("click", (event) => {
      const tabButton = event.target.closest("[data-media-tab]");
      if (tabButton?.dataset.mediaTab === "gif") {
        kasamGameV2SearchGifs(prefix, "para");
      }
      if (event.target.closest("[data-media-paste]")) {
        navigator.clipboard?.read?.().then((items) => {
          for (const item of items || []) {
            const type = item.types.find((candidate) => candidate.startsWith("image/"));
            if (!type) continue;
            item.getType(type).then((blob) => {
              const reader = new FileReader();
              reader.onload = () => {
                kasamSetMediaValue(prefix, "gif", reader.result);
                kasamCloseMediaSheet();
              };
              reader.readAsDataURL(blob);
            });
            break;
          }
        }).catch(() => kasamToast("Stickerı panodan okuyamadım. Görsel seç ile ekle."));
      }
    });
    searchInput?.addEventListener("input", () => {
      clearTimeout(gifTimer);
      gifTimer = setTimeout(() => kasamGameV2SearchGifs(prefix, "para"), 350);
    });
    kasamGameV2SearchGifs(prefix, "para");
  };
}

let kasamCriticalSaving = false;
let kasamCriticalLastEntrySignature = "";
let kasamCriticalLastEntryAt = 0;

function kasamCriticalEntrySignature(form) {
  if (!form) return "";
  const fields = ["type", "amount", "currency", "date", "headingName", "shortName", "projectId", "notificationMode"];
  const parts = fields.map((name) => `${name}:${form.elements?.[name]?.value || ""}`);
  const split = [...form.querySelectorAll('input[name="splitWith"]:checked')].map((item) => item.value).sort().join(",");
  parts.push(`split:${split}`);
  return parts.join("|");
}

if (typeof handleEntrySubmit === "function") {
  const kasamCriticalHandleEntryBase = handleEntrySubmit;
  handleEntrySubmit = async function handleEntrySubmitCritical(form) {
    if (kasamCriticalSaving) {
      kasamToast("Kaydediliyor.");
      return null;
    }
    const signature = kasamCriticalEntrySignature(form);
    const now = Date.now();
    if (signature && signature === kasamCriticalLastEntrySignature && now - kasamCriticalLastEntryAt < 8000) {
      kasamToast("Bu hareket kaydedildi.");
      return null;
    }
    kasamCriticalLastEntrySignature = signature;
    kasamCriticalLastEntryAt = now;
    kasamCriticalSaving = true;
    document.body.classList.add("is-saving-entry");
    document.body.insertAdjacentHTML("beforeend", `<div class="entry-saving-overlay" data-entry-saving-overlay><div>${kasamIcon("loader-circle", "icon-neutral")}<strong>Kaydediliyor</strong><p>Hareket işleniyor, tekrar basma.</p></div></div>`);
    form?.querySelectorAll("button").forEach((element) => {
      element.dataset.wasDisabled = element.disabled ? "1" : "0";
      element.disabled = true;
    });
    try {
      const result = await kasamCriticalHandleEntryBase(form);
      if (typeof isCloudReady === "function" && isCloudReady() && typeof cloudPushState === "function") {
        try {
          await cloudPushState();
          if (typeof kasamRefreshCloudData === "function") await kasamRefreshCloudData("entry-save");
          else if (typeof loadCloudData === "function") await loadCloudData();
        } catch (error) {
          setCloudStatus?.("Senkron bekliyor");
          logError?.(error, "entry-save-cloud-sync");
        }
      }
      return result;
    } finally {
      kasamCriticalSaving = false;
      document.body.classList.remove("is-saving-entry");
      document.querySelector("[data-entry-saving-overlay]")?.remove();
      form?.querySelectorAll("button").forEach((element) => {
        if (element.dataset.wasDisabled !== "1") element.disabled = false;
      });
    }
  };
}

let kasamCriticalRealtimeChannel = null;
let kasamCriticalRealtimeTimer = null;

function kasamCriticalStartRealtime() {
  if (!(typeof isCloudReady === "function" && isCloudReady()) || !state.signedInUserId || !window.supabase) return;
  if (kasamCriticalRealtimeChannel) return;
  const client = cloudDb();
  kasamCriticalRealtimeChannel = client.channel(`kasam-live-${state.signedInUserId}`);
  ["kasa_entries", "kasa_notifications", "kasa_projects", "kasa_project_members", "kasa_profiles"].forEach((table) => {
    kasamCriticalRealtimeChannel.on("postgres_changes", { event: "*", schema: "public", table }, () => {
      clearTimeout(kasamCriticalRealtimeTimer);
      kasamCriticalRealtimeTimer = setTimeout(async () => {
        try {
          if (typeof kasamRefreshCloudData === "function") await kasamRefreshCloudData("realtime");
          else if (typeof loadCloudData === "function") await loadCloudData();
          render();
        } catch (error) {
          logError(error, "critical-realtime-refresh");
        }
      }, 450);
    });
  });
  kasamCriticalRealtimeChannel.subscribe();
}

if (typeof cloudSignIn === "function") {
  const kasamCriticalCloudSignInBase = cloudSignIn;
  cloudSignIn = async function cloudSignInCritical(args) {
    const result = await kasamCriticalCloudSignInBase(args);
    kasamCriticalStartRealtime();
    return result;
  };
}

if (typeof loadCloudData === "function") {
  const kasamCriticalLoadCloudDataBase = loadCloudData;
  loadCloudData = async function loadCloudDataCritical() {
    await kasamCriticalLoadCloudDataBase();
    if (!(typeof isCloudReady === "function" && isCloudReady()) || !state.signedInUserId) return;
    const client = cloudDb();
    const profileIds = [...new Set((state.users || []).map((user) => user.id).filter(Boolean))];
    if (profileIds.length) {
      const { data } = await client.from("kasa_profiles").select("*").in("id", profileIds);
      (data || []).forEach((profile) => {
        const user = (state.users || []).find((item) => item.id === profile.id);
        if (user) {
          user.photoName = profile.photo_name || user.photoName || "";
          user.photoData = profile.photo_data || user.photoData || "";
        }
      });
    }
    const projectIds = [...new Set((state.projects || []).map((project) => project.id).filter(Boolean))];
    if (projectIds.length) {
      const { data } = await client.from("kasa_projects").select("*").in("id", projectIds);
      (data || []).forEach((row) => {
        const project = (state.projects || []).find((item) => item.id === row.id);
        if (project) {
          project.photoName = row.photo_name || project.photoName || "";
          project.photoData = row.photo_data || project.photoData || "";
        }
      });
    }
    kasamCriticalStartRealtime();
    saveState();
  };
}

if (typeof cloudPushState === "function") {
  const kasamCriticalCloudPushBase = cloudPushState;
  cloudPushState = async function cloudPushStateCritical() {
    await kasamCriticalCloudPushBase();
    if (!(typeof isCloudReady === "function" && isCloudReady()) || !state.signedInUserId) return;
    const client = cloudDb();
    const user = currentUser();
    if (!user) return;
    const { error } = await client.from("kasa_profiles").upsert({
      id: user.id,
      email: user.email || "",
      name: user.name || "",
      nickname: user.nickname || "",
      photo_name: user.photoName || "",
      photo_data: user.photoData || "",
      updated_at: kasamNow(),
    }, { onConflict: "id" });
    if (error && !String(error.message || "").includes("photo_")) throw error;
  };
}

if (typeof bindScreen === "function") {
  const kasamCriticalBindScreenBase = bindScreen;
  bindScreen = function bindScreenCritical() {
    kasamCriticalBindScreenBase();
    kasamCriticalStartRealtime();
    const stamp = document.querySelector(".update-stamp");
    if (stamp) stamp.textContent = `Güncellendi ${KASAM_CRITICAL_VERSION}`;
    const form = document.querySelector("#entryForm");
    if (form && !form.dataset.criticalBound) {
      form.dataset.criticalBound = "1";
      kasamCriticalUpdateCurrencyUi(form);
      form.elements?.amount?.addEventListener("blur", () => kasamCriticalFormatAmountInput(form.elements.amount));
      form.elements?.currency?.addEventListener("change", () => kasamCriticalUpdateCurrencyUi(form));
      form.elements?.date?.addEventListener("change", () => kasamCriticalUpdateCurrencyUi(form));
      form.addEventListener("change", (event) => {
        if (event.target?.name === "splitWith") {
          const checked = [...form.querySelectorAll("input[name='splitWith']:checked")].map((input) => input.closest(".split-toggle"));
          form.querySelectorAll(".split-toggle").forEach((item) => item.classList.toggle("selected", checked.includes(item)));
        }
      });
    }
    app.querySelectorAll("[data-action='share-project-link']").forEach((button) => {
      if (button.dataset.shareBound) return;
      button.dataset.shareBound = "1";
      button.addEventListener("click", async () => {
        const project = activeProject();
        const url = project ? inviteLink(project) : location.href;
        const text = `${project?.name || "Kasam"} kasasına katıl: ${url}`;
        try {
          if (navigator.share) await navigator.share({ title: "Kasam daveti", text, url });
          else {
            await navigator.clipboard.writeText(text);
            kasamToast("Bağlantı kopyalandı.");
          }
        } catch (_error) {}
      });
    });
    app.querySelectorAll("[data-action='forgot-password']").forEach((button) => {
      if (button.dataset.forgotBound) return;
      button.dataset.forgotBound = "1";
      button.addEventListener("click", async () => {
        const email = document.querySelector("input[name='email'], #loginEmail")?.value || window.prompt("E-posta adresin");
        if (!email) return;
        try {
          await cloudDb().auth.resetPasswordForEmail(String(email).trim().toLowerCase(), { redirectTo: `${location.origin}${location.pathname}` });
          kasamToast("Şifre sıfırlama bağlantısı gönderildi.");
        } catch (error) {
          kasamToast(friendlyCloudError(error));
        }
      });
    });
  };
}

if (typeof renderAuth === "function") {
  const kasamCriticalRenderAuthBase = renderAuth;
  renderAuth = function renderAuthCritical() {
    let html = kasamCriticalRenderAuthBase();
    if (!html.includes('data-action="forgot-password"')) {
      html = html.replace(/(<button[^>]*type="submit"[^>]*>[^<]*(?:Giriş|Gir)[^<]*<\/button>)/, `$1<button class="ghost-button forgot-password-button" data-action="forgot-password" type="button">Şifremi unuttum</button>`);
    }
    return html;
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const stamp = document.querySelector(".update-stamp");
  if (stamp) stamp.textContent = `Güncellendi ${KASAM_CRITICAL_VERSION}`;
});

