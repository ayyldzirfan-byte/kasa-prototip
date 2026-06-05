var KASA_UI_ENTRY_TYPES = [
  { id: "expense", label: "Gider", emoji: "💸", helper: "Para çıktıysa ya da ileri tarihli ödemeyse." },
  { id: "income", label: "Gelir", emoji: "💰", helper: "Para girdiyse ya da ileri tarihli beklenen gelirse." },
];

function headingAutocompleteHtml(typeId) {
  const headings = projectHeadings();
  const suggestions = headingSuggestionsFor(typeId).filter((item) => item.name && !["Borç verdim", "Beklenen ödeme"].includes(item.name));
  const combined = [...headings.map((heading) => ({ ...heading, source: "project" })), ...suggestions.map((item) => ({ ...item, source: "suggestion" }))];
  return `
    <div class="chips heading-matches text-only" id="headingMatches">
      ${combined.slice(0, 8).map((item) => `<button class="chip" data-suggestion="${item.name}" data-short="${item.name}" type="button">${item.name}</button>`).join("")}
    </div>
  `;
}

function renderHome() {
  const user = currentUser();
  const entries = userCashEntries(user);
  const totals = calculateTotals(entries);
  const recent = entries.filter((entry) => entry.status === "done" && entryConfirmed(entry)).sort(byDateDesc).slice(0, 4);
  const upcoming = entries.filter((entry) => entry.status === "pending").sort(byDateAsc).slice(0, 3);
  const notificationCount = notificationEntries().length;
  const surpriseCount = pendingSurpriseCountForUser(user);

  return `
    <section class="account-strip clean-strip">
      <div class="profile-line">
        ${memberAvatarHtml(user, activeProject(), "member-avatar")}
        <div>
          <strong>${profileLabel(user) || "Kasa"}</strong>
          <p>${state.cloudSyncAt ? `Bulut senkron: ${new Date(state.cloudSyncAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}` : "Kendi paran ve bağlı bütçeler tek yerde."}</p>
        </div>
      </div>
      <div class="account-actions">
        <button class="tiny-button" data-action="open-notifications" type="button">Bildirimler${notificationCount ? ` (${notificationCount})` : ""}</button>
        <button class="tiny-button muted-button" data-action="logout" type="button">Çıkış</button>
      </div>
    </section>

    <section class="hero personal-hero">
      <div class="hero-row">
        <div>
          <p class="hero-title">Kalan rahat alan</p>
          <p class="hero-money">${money(totals.comfortable)}</p>
          <p class="hero-note">Onaylı gelir - onaylı gider + beklenen - yaklaşan.</p>
          ${surpriseCount ? `<p class="surprise-counter">${surpriseCount} bekleyen sürpriz var. Bakiye oyun bitince açılır.</p>` : ""}
        </div>
        <span class="quick-pill ${totals.comfortable < 0 ? "danger-pill" : ""}">${totals.comfortable >= 0 ? "Dengede" : "Açık"}</span>
      </div>
    </section>

    <section class="single-action-card">
      <button class="primary-button movement-add-button" data-action="go-add-movement" type="button">Hareket ekle</button>
    </section>

    <section class="grid-2">
      <article class="stat-card"><p class="stat-label">Giren</p><p class="stat-value positive">${money(totals.income)}</p></article>
      <article class="stat-card"><p class="stat-label">Çıkan</p><p class="stat-value warning">${money(totals.expense)}</p></article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="receivable"><p class="stat-label">Beklenen</p><p class="stat-value">${money(totals.receivable)}</p></article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="payable"><p class="stat-label">Yaklaşan</p><p class="stat-value">${money(totals.payable)}</p></article>
    </section>

    ${
      state.pendingDetail
        ? `<section class="card"><div class="section-head"><div><h2>${state.pendingDetail === "receivable" ? "Beklenen gelirler" : "Yaklaşan giderler"}</h2><p>İleri tarihli gelir/gider kayıtları.</p></div><button class="tiny-button" data-action="hide-pending-detail" type="button">Kapat</button></div><div class="expense-list">${pendingRowsForUser(state.pendingDetail)}</div></section>`
        : ""
    }

    <section class="card">
      <div class="section-head"><div><h2>Bütçe etkileri</h2><p>Bağlı bütçelerin senin kasana yansıması.</p></div><button class="tiny-button" data-action="open-projects-list" type="button">Yeni bütçe oluştur</button></div>
      <div class="project-list">${projectImpactRows()}</div>
    </section>

    <section class="card">
      <div class="section-head"><div><h2>Yaklaşanlar</h2><p>İleri tarihli gelir, gider ve taksitler.</p></div></div>
      <div class="expense-list">${upcoming.length ? upcoming.map(entrySummaryRow).join("") : `<div class="empty-state">Takvime düşecek ileri tarihli kayıt yok.</div>`}</div>
    </section>

    <section class="card">
      <div class="section-head"><div><h2>Son hareketler</h2><p>Son 4 onaylı hareket.</p></div><button class="tiny-button" data-action="open-movements" type="button">Tümü</button></div>
      <div class="expense-list">${recent.length ? recent.map(entrySummaryRow).join("") : `<div class="empty-state">İlk hareketi ekleyerek başla.</div>`}</div>
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
      <div class="section-head">
        <div>
          <h2>Hareket ekle</h2>
          <p>Gelir veya gider seç; ileri tarihli kayıtlar takvime düşer.</p>
        </div>
      </div>
      <label>
        <span class="field-label">Nereye işlensin?</span>
        <select class="select-input" name="projectId">
          ${state.projects.map((project) => `<option value="${project.id}" ${project.id === targetProject?.id ? "selected" : ""}>${project.name}</option>`).join("")}
        </select>
      </label>
      <div class="type-grid two-types">
        ${KASA_UI_ENTRY_TYPES
          .map((item) => `<button class="type-chip ${type.id === item.id ? "selected" : ""}" data-entry-type="${item.id}" type="button"><span>${item.emoji}</span><strong>${item.label}</strong><small>${item.helper}</small></button>`)
          .join("")}
      </div>
      <input type="hidden" name="userId" value="${currentUser()?.id || ""}" />
      <div><label class="field-label" for="amount">Tutar</label><input class="amount-input" id="amount" name="amount" inputmode="numeric" placeholder="1.000" value="${amountValue}" autocomplete="off" /></div>
      <div class="grid-2 currency-grid ${draft.currency === "TRY" ? "single" : ""}">
        <label><span class="field-label">Para birimi</span><select class="select-input" name="currency">${currencyOptions.map((item) => `<option value="${item.code}" ${draft.currency === item.code ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>
        <label class="fx-rate-field ${draft.currency === "TRY" ? "is-hidden" : ""}"><span class="field-label">Kur</span><input class="select-input" name="exchangeRate" inputmode="decimal" placeholder="32,50" value="${draft.exchangeRate || 1}" autocomplete="off" /></label>
      </div>
      <label><span class="field-label">${isExpense ? "Gider tarihi" : "Gelir tarihi"}</span><input class="select-input" name="date" type="date" value="${draft.date || todayKey()}" /></label>
      <label class="heading-field"><span class="field-label" for="headingName">${isExpense ? "Gider başlığı" : "Gelir başlığı"}</span><input class="text-input" id="headingName" name="headingName" placeholder="Örn. Market, maaş, fatura" autocomplete="off" />${headingAutocompleteHtml(type.id)}</label>
      <div class="heading-media-row media-inline-row">
        <span class="field-label">Emoji, GIF, fotoğraf</span>
        ${mediaHubHtml()}
      </div>
      ${
        isExpense
          ? `<details class="soft-details"><summary>Taksitli harcama</summary><div class="inline-form installment-fields"><label><span class="field-label">Taksit sayısı</span><input class="text-input" name="installmentCount" inputmode="numeric" placeholder="1" autocomplete="off" /></label><span class="field-help">2 ve üstü girilirse sonraki aylar takvimde yaklaşan gider olarak görünür.</span></div></details>`
          : ""
      }
      <details class="soft-details"><summary>Bildirim oyunu</summary><div class="form-grid notification-options"><label><span class="field-label">Bildirim modu</span><select class="select-input" name="notificationMode"><option value="open" ${draft.notificationMode === "open" ? "selected" : ""}>Açık bildir</option><option value="surprise" ${draft.notificationMode === "surprise" ? "selected" : ""}>Tahmin oyunu</option><option value="silent" ${draft.notificationMode === "silent" ? "selected" : ""}>Sessiz kaydet</option></select></label>${reactionSetupHtml()}</div></details>
      <button class="primary-button" type="submit">Kaydet</button>
    </form>
  `;
}

async function handleEntrySubmit(form) {
  const data = new FormData(form);
  const enteredAmount = parseAmount(data.get("amount"));
  const currency = String(data.get("currency") || "TRY").toUpperCase();
  const exchangeRate = currency === "TRY" ? 1 : parseAmount(data.get("exchangeRate"));
  const amount = enteredAmount * exchangeRate;
  const headingName = String(data.get("headingName") || "").trim();
  const projectId = String(data.get("projectId") || state.activeProjectId || "");
  const project = state.projects.find((item) => item.id === projectId) || activeProject();
  const userId = currentUser()?.id || String(data.get("userId") || "");
  const type = draft.type === "income" ? "income" : "expense";
  const date = String(data.get("date") || todayKey());
  const now = blockNow();
  const isFuture = date > todayKey();
  if (!project) return toast("Önce bütçe oluştur.");
  if (!enteredAmount || enteredAmount <= 0) return toast("Önce tutarı yaz.");
  if (!currencyOptions.some((item) => item.code === currency)) return toast("Para birimini seç.");
  if (!exchangeRate || exchangeRate <= 0) return toast("Döviz için kuru yaz.");
  if (!headingName) return toast("Bir başlık yaz.");
  if (userId && !project.memberIds.includes(userId)) project.memberIds.push(userId);

  const previousProjectId = state.activeProjectId;
  state.activeProjectId = project.id;
  const heading = ensureHeading(headingName, headingName, "");
  const split = splitForEntry(type, type === "expense", userId);
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
  };
  state.entries.unshift(entry);
  if (installmentCount > 1) {
    for (let index = 2; index <= installmentCount; index += 1) {
      const installmentDate = addMonthsToKey(date, index - 1);
      state.entries.push({
        ...entry,
        id: makeId(),
        date: installmentDate,
        status: installmentDate > todayKey() ? "pending" : "done",
        lockedNotificationId: "",
        autoRevealAt: "",
        installmentIndex: index,
        createdAt: now,
      });
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
  state.activeProjectId = previousProjectId || project.id;
  draft = makeDraft();
  state.addProjectId = "";
  state.activeView = state.previousView && state.previousView !== "add" ? state.previousView : "home";
  state.previousView = "";
  saveState();
  render();
  const plannedText = isFuture ? "Planlandı ve takvime eklendi." : "Hareket kaydedildi.";
  toast(delay || (installmentCount > 1 ? "Taksitli gider takvime işlendi." : plannedText));
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
    matches.innerHTML = items.map((item) => `<button class="chip" data-suggestion="${item.name}" data-short="${item.shortName}" type="button">${item.name}</button>`).join("");
  });
  entryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await handleEntrySubmit(entryForm);
  });
}

function notificationRow(notification) {
  const actor = state.users.find((user) => user.id === notification.actorId);
  const project = state.projects.find((item) => item.id === notification.projectId) || activeProject();
  const guess = notificationGuessFor(notification);
  const isSurprise = notification.mode === "surprise";
  const isReaction = notification.notificationType === "reaction";
  const isMember = notification.notificationType === "member";
  const completed = Boolean(notification.revealedAt || notification.isCompleted);
  const typeLabel = notification.actualType === "income" ? "gelir" : notification.actualType === "expense" ? "gider" : "hareket";
  const media = mediaPreviewHtml(notificationMedia(notification));

  if (isMember) {
    return `<div class="notification-card member-notification"><div class="notification-hero member-added-pulse">+</div><div class="expense-main"><p class="expense-title">Yeni kişi eklendi</p><p class="expense-meta">${notification.title} · ${project?.name || "Bütçe"} · ${relativeDate(notification.createdAt)}</p></div></div>`;
  }
  if (isReaction) {
    return `<div class="notification-card reaction-notification"><div class="notification-hero pop-emoji">${notification.reactionEmoji || "👀"}</div><div class="expense-main"><p class="expense-title">${projectUserLabel(actor, project)} tepki verdi</p><p class="expense-meta">${notification.title}</p></div></div>`;
  }
  if (!isSurprise) {
    return `<div class="notification-card"><div class="notification-hero">${media}</div><div class="expense-main"><p class="expense-title">${projectUserLabel(actor, project)} ${typeLabel} ekledi</p><p class="expense-meta">${notification.title} · ${money(notification.amount)} · ${project?.name || "Bütçe"} · ${relativeDate(notification.createdAt)}</p></div></div>`;
  }
  if (guess && completed) {
    const correct = Boolean(guess.isCorrect ?? guess.correct);
    const ownerText = onayText(actor, correct);
    return `<div class="notification-card ${correct ? "guess-correct" : "guess-wrong"}"><div class="notification-hero">${mediaPreviewHtml(notificationReactionMedia(notification, guess), correct ? "✅" : "🙂")}</div><div class="expense-main"><p class="expense-title">${correct ? "Kestirdin! +10 puan" : "Tahmin tutmadı"}</p><p class="expense-meta">${ownerText} Gerçek: ${typeLabel} · ${money(notification.amount)} · ${project?.name || "Bütçe"}</p><div class="reaction-result ${correct ? "correct confetti-burst" : "wrong shake-once"}"><span>${correct ? "Doğru tahmin" : "Yanlış tahmin"}</span><span class="reaction-media">${mediaPreviewHtml(notificationReactionMedia(notification, guess), correct ? "✅" : "🙂")}</span></div></div></div>`;
  }
  if (guess && !completed) {
    return `<div class="notification-card surprise-locked"><div class="notification-hero">${media}</div><div class="expense-main"><p class="expense-title">Tahmin kaydedildi</p><p class="expense-meta">Detay herkes tahmin edince veya süre dolunca açılacak.</p></div></div>`;
  }
  if (completed) {
    return `<div class="notification-card"><div class="notification-hero">${media}</div><div class="expense-main"><p class="expense-title">Tahmin sonucu</p><p class="expense-meta">Gerçek: ${typeLabel} · ${notification.title} · ${money(notification.amount)}</p></div></div>`;
  }
  return `
    <div class="notification-card surprise-locked">
      <div class="notification-hero">${media}</div>
      <div class="expense-main">
        <p class="expense-title">Yeni tahmin var</p>
        <p class="expense-meta">?? · ?? · ${project?.name || "Bütçe"} · ${relativeDate(notification.createdAt)}</p>
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

function projectSummaryRow(project) {
  const impact = projectImpactForUser(project);
  const members = state.users.filter((user) => project.memberIds.includes(user.id));
  return `
    <button class="project-list-row ${project.id === state.activeProjectId ? "active" : ""}" data-action="activate-project-detail" data-id="${project.id}" type="button">
      ${projectPhotoHtml(project, "project-thumb")}
      <span>
        <strong>${project.name}</strong>
        <small>${project.purpose || "Genel bütçe"} · ${members.length} üye · kasa etkisi ${money(impact.totals.comfortable)}</small>
        <span class="member-bullets inline-bullets">${members.map((member) => `<i>${projectUserLabel(member, project)}</i>`).join("")}</span>
      </span>
    </button>
  `;
}

function renderProjectList() {
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();
  return `
    <section class="card">
      <div class="section-head"><div><h2>Bütçeler</h2><p>Kendi kasana bağlı bütçeleri seç veya yenisini oluştur.</p></div></div>
      <div class="project-list">${state.projects.map(projectSummaryRow).join("") || `<div class="empty-state">Henüz bütçe yok.</div>`}</div>
    </section>
    <section class="card">
      <h2>Yeni bütçe oluştur</h2>
      <form class="inline-form" id="projectForm">
        <input class="text-input" name="projectName" placeholder="Bütçe adı" autocomplete="off" />
        <input class="text-input" name="purpose" list="purposeList" placeholder="Amaç: ev, tatil, iş..." autocomplete="off" />
        <datalist id="purposeList">${purposeOptions.map((purpose) => `<option value="${purpose}"></option>`).join("")}</datalist>
        <span class="field-label">Şablondan başla</span>
        ${templateOptionsHtml(state.selectedTemplateId)}
        <button class="primary-button" type="submit">Bütçe ekle</button>
      </form>
      ${cloudReady ? `<form class="inline-form cloud-join-card" id="joinProjectForm"><input class="text-input" name="projectCode" placeholder="Kasa kodu" autocomplete="off" /><button class="secondary-button" type="submit">Kodla katıl</button></form>` : ""}
    </section>
  `;
}

function renderGroup() {
  const project = activeProject();
  if (state.groupMode === "member" && state.activeMemberProfileId) return renderMemberProfile();
  if (state.groupMode !== "detail") return renderProjectList();
  const balances = calculateBalances();
  const transfers = minimumTransfers(balances);
  const canManageUsers = isProjectOwner(project);
  const owner = projectOwner(project);
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();
  return `
    <section class="card project-detail-card">
      <div class="section-head">
        <div class="project-card-title">${projectPhotoHtml(project)}<div><h2>${project.name}</h2><p>${project.purpose || "Genel bütçe"} · ${projectCode(project)}</p></div></div>
        <button class="tiny-button" data-action="open-projects-list" type="button">Bütçeler</button>
      </div>
      ${canManageUsers ? `<form class="inline-form project-photo-form" id="projectPhotoForm"><label class="photo-pick compact-pick"><span data-file-label>Bütçe resmi</span><strong>Seç</strong><input name="projectPhoto" type="file" accept="image/*" /></label><button class="secondary-button" type="submit">Resmi kaydet</button></form>` : ""}
    </section>
    <section class="card">
      <h2>Profil ayarları</h2>
      <form class="inline-form" id="ownProfileForm">
        <label><span class="field-label">Onay modu</span><select class="select-input" name="onayMode">${Object.entries(personalityModes).map(([id, item]) => `<option value="${id}" ${currentUser()?.onayModu === id ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>
        <label class="photo-pick compact-pick"><span data-file-label>Kendi profil resmin</span><strong>Seç</strong><input name="profilePhoto" type="file" accept="image/*" /></label>
        <button class="secondary-button" type="submit">Profilimi kaydet</button>
      </form>
      <p>Skor: ${currentUser()?.totalScore || 0} · Doğru: ${currentUser()?.correctGuesses || 0}/${currentUser()?.totalGuesses || 0}</p>
    </section>
    <section class="card">
      <h2>Bütçeye kişi ekle</h2>
      <p>${canManageUsers ? (cloudReady ? `E-posta ile hesap açmış kişiyi bu bütçeye ekle.` : `Bu cihazda açılmış kullanıcı adını yaz.`) : `Kullanıcı eklemek için ${projectUserLabel(owner)} hesabıyla giriş yap.`}</p>
      ${canManageUsers ? `<form class="inline-form featured-form" id="projectUserForm"><input class="text-input" name="userName" placeholder="${cloudReady ? "mail@ornek.com" : "Kullanıcı adı"}" autocomplete="${cloudReady ? "email" : "off"}" /><button class="primary-button" type="submit">Bütçeye ekle</button></form>` : `<div class="empty-state" style="margin-top:12px;">Sadece bütçe sahibi ekleme yapabilir.</div>`}
    </section>
    <section class="card"><div class="section-head"><div><h2>Erişim</h2><p>${cloudReady ? "Bu kod başka telefondan aynı bütçeye katılmak için kullanılır." : "Yerel denemede kullanıcılar bu cihazda tutulur."}</p></div></div><div class="invite-box"><div><span class="field-label">Kod</span><strong>${projectCode(project)}</strong><p>${inviteLink(project)}</p></div><button class="mini-action" data-action="copy-project-link" type="button">Kopyala</button></div></section>
    <section class="card"><h2>Üyeler</h2><div class="expense-list" style="margin-top:12px;">${activeMembers().map(userLinkRow).join("") || `<div class="empty-state">Bu bütçede üye yok.</div>`}</div></section>
    <section class="card">
      <div class="section-head"><div><h2>Borç & alacak</h2><p>${state.settlementVisible ? "Minimum transfer listesi görünür." : "Şu an gizli."}</p></div><button class="tiny-button" data-action="toggle-settlement" type="button">${state.settlementVisible ? "Gizle" : "Göster"}</button></div>
      ${state.settlementVisible ? `<div style="margin-top:10px;">${balances.length ? balances.map(balanceRow).join("") : `<div class="empty-state">Hesaplaşmaya dahil gider yok.</div>`}</div><div style="margin-top:12px;">${transferRows(transfers)}</div>` : `<div class="empty-state" style="margin-top:12px;">Açınca kim kime ne kadar göndermeli görünür.</div>`}
    </section>
  `;
}

function renderProjectSetup() {
  const user = currentUser();
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();
  return `
    <section class="form-card form-grid onboarding-card">
      <div><p class="eyebrow">Kasa kurulumu</p><h2>${profileLabel(user)}, ilk bütçeni seç</h2><p class="hero-note">${cloudReady ? "Hesabın hazır. İlk bütçeni oluştur veya kodla katıl." : "Deneme sürümünde önce kendi kasanı kur."}</p></div>
      <form class="form-grid" id="firstProjectForm">
        <label><span class="field-label">Bütçe adı</span><input class="text-input" name="projectName" placeholder="Örn. Kişisel kasa" autocomplete="off" /></label>
        <label><span class="field-label">Amaç</span><input class="text-input" name="purpose" list="purposeList" placeholder="Kendi bütçem, ev, iş..." autocomplete="off" /></label>
        <datalist id="purposeList">${purposeOptions.map((purpose) => `<option value="${purpose}"></option>`).join("")}</datalist>
        <span class="field-label">Şablondan başla</span>
        ${templateOptionsHtml(state.selectedTemplateId)}
        <button class="primary-button" type="submit">Bütçe oluştur</button>
      </form>
      ${cloudReady ? `<form class="form-grid" id="joinProjectForm"><input class="text-input" name="projectCode" placeholder="Kasa kodu" autocomplete="off" /><button class="secondary-button" type="submit">Kodla katıl</button></form>` : ""}
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
  const entries = userVisibleEntries().filter((entry) => entry.status === "pending" || (entry.status === "done" && entryConfirmed(entry)));
  const cells = [];
  for (let index = 0; index < startOffset; index += 1) cells.push(`<div class="calendar-cell muted"></div>`);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const items = entries.filter((entry) => entry.date === key);
    cells.push(`<div class="calendar-cell ${key === todayKey() ? "today" : ""}"><strong>${day}</strong>${items.slice(0, 2).map((entry) => `<span class="${entry.type === "income" || entry.type === "receivable" ? "cal-in" : "cal-out"}">${entryTitle(entry)}</span>`).join("")}${items.length > 2 ? `<em>+${items.length - 2}</em>` : ""}</div>`);
  }
  return `<div class="calendar-weekdays">${labels.map((label) => `<span>${label}</span>`).join("")}</div><div class="calendar-grid">${cells.join("")}</div>`;
}

function renderCalendar() {
  const base = state.calendarMonth ? dateFromKey(`${state.calendarMonth}-01`) : new Date();
  const monthText = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(base);
  const entries = userVisibleEntries().filter((entry) => entry.status === "pending").sort(byDateAsc).slice(0, 6);
  return `<section class="card desk-calendar-card"><div class="calendar-top"><button class="tiny-button" data-action="month-prev" type="button">Önceki</button><div><p class="eyebrow">Takvim</p><h2>${monthText}</h2></div><button class="tiny-button" data-action="month-next" type="button">Sonraki</button></div><div class="desk-calendar" data-flip="${state.calendarFlip || 0}">${calendarGridHtml(base)}</div></section><section class="card"><div class="section-head"><div><h2>Planlananlar</h2><p>İleri tarihli gelir, gider ve taksitler.</p></div></div><div class="expense-list">${entries.length ? entries.map(entrySummaryRow).join("") : `<div class="empty-state">Takvime bağlı plan yok.</div>`}</div></section>`;
}

function renderReport() {
  const period = state.reportPeriod || "month";
  const entries = userVisibleEntries().filter((entry) => entry.status === "done" && entryConfirmed(entry));
  const currentEntries = entriesForPeriod(entries, period);
  const previousEntries = entriesForPeriod(entries, period, -1);
  const totals = calculateTotals(currentEntries);
  const previousTotals = calculateTotals(previousEntries);
  const diff = totals.actual - previousTotals.actual;
  const label = period === "day" ? "günlük" : period === "week" ? "haftalık" : "aylık";
  return `
    <section class="card">
      <div class="section-head"><div><h2>Rapor</h2><p>${periodTitle(period)} ile ${periodTitle(period, -1)} karşılaştırılır.</p></div><button class="share-button compact-share" data-action="share-receipt" type="button">Fişi paylaş</button></div>
      <div class="segmented"><button class="segment ${period === "day" ? "active" : ""}" data-period="day" type="button">Gün</button><button class="segment ${period === "week" ? "active" : ""}" data-period="week" type="button">Hafta</button><button class="segment ${period === "month" ? "active" : ""}" data-period="month" type="button">Ay</button></div>
      <div class="grid-2 report-grid"><article class="stat-card"><p class="stat-label">Giren</p><p class="stat-value positive">${money(totals.income)}</p></article><article class="stat-card"><p class="stat-label">Çıkan</p><p class="stat-value warning">${money(totals.expense)}</p></article></div>
      <div class="report-compare-card ${diff >= 0 ? "positive-soft" : "warning-soft"}"><strong>${diff >= 0 ? "+" : ""}${money(diff)}</strong><span>${label} net fark. Pozitif değer geçen döneme göre kasada daha iyi net alan demek.</span></div>
    </section>
    <section class="card receipt-card" id="receiptCard"><div class="receipt-header"><strong>KASA FİŞİ</strong><span>${new Date().toLocaleDateString("tr-TR")}</span></div>${reportRows(currentEntries)}${exchangeReceiptLines(currentEntries)}<div class="receipt-line total"><span>Net</span><strong>${money(totals.actual)}</strong></div><p class="receipt-watermark">kasa.app</p></section>
  `;
}

function bindScreen() {
  app.onclick = async (event) => {
    const button = event.target.closest("button");
    if (!button || !app.contains(button)) return;
    const action = button.dataset.action;
    if (button.dataset.entryType) {
      const form = app.querySelector("#entryForm");
      if (form) {
        draft.amountInput = formatAmountInput(form.elements.amount?.value);
        draft.currency = String(form.elements.currency?.value || draft.currency || "TRY");
        draft.exchangeRate = parseAmount(form.elements.exchangeRate?.value || draft.exchangeRate || 1);
        draft.date = String(form.elements.date?.value || draft.date || todayKey());
        state.addProjectId = String(form.elements.projectId?.value || state.addProjectId || state.activeProjectId || "");
        draft.notificationMode = String(form.elements.notificationMode?.value || draft.notificationMode || "open");
      }
      draft.type = button.dataset.entryType === "income" ? "income" : "expense";
      draft.emoji = draft.type === "income" ? "💰" : "💸";
      saveState();
      render();
      return;
    }
    if (button.dataset.suggestion) {
      const form = app.querySelector("#entryForm");
      if (form?.elements?.headingName) form.elements.headingName.value = button.dataset.suggestion;
      return;
    }
    if (button.dataset.period) { state.reportPeriod = button.dataset.period; saveState(); render(); return; }
    if (button.dataset.movementPeriod) { state.movementPeriod = button.dataset.movementPeriod; saveState(); render(); return; }
    if (action === "go-back") return goBack();
    if (action === "go-add-movement" || action === "go-add" || action === "go-add-expense" || action === "go-add-income") {
      draft.type = action === "go-add-income" ? "income" : "expense";
      draft.emoji = draft.type === "income" ? "💰" : "💸";
      draft.userId = currentUser()?.id || "";
      draft.date = todayKey();
      draft.amountInput = "";
      state.addProjectId = button.dataset.projectId || state.activeProjectId || state.projects[0]?.id || "";
      goToView("add");
      return;
    }
    if (action === "open-notifications") return goToView("notifications");
    if (action === "open-movements") return goToView("movements");
    if (action === "open-projects-list" || action === "open-group") return goToView("group", { groupMode: "list" });
    if (action === "open-active-project") return goToView("group", { groupMode: "detail" });
    if (action === "activate-project" || action === "activate-project-detail") { state.activeProjectId = button.dataset.id; draft = makeDraft(); goToView("group", { groupMode: "detail" }); return; }
    if (action === "open-member-profile") { state.activeMemberProfileId = button.dataset.id; return goToView("group", { groupMode: "member" }); }
    if (action === "close-member-profile") { state.groupMode = "detail"; state.activeMemberProfileId = ""; saveState(); render(); return; }
    if (action === "month-prev") return changeCalendarMonth(-1);
    if (action === "month-next") return changeCalendarMonth(1);
    if (action === "show-pending-detail") { state.pendingDetail = button.dataset.detail; saveState(); render(); return; }
    if (action === "hide-pending-detail") { state.pendingDetail = ""; saveState(); render(); return; }
    if (action === "toggle-settlement") { state.settlementVisible = !state.settlementVisible; saveState(); render(); return; }
    if (action === "select-template") { state.selectedTemplateId = state.selectedTemplateId === button.dataset.id ? "" : button.dataset.id; saveState(); render(); return; }
    if (action === "copy-project-link") return copyProjectInvite();
    if (action === "share-receipt") return shareReceipt();
    if (action === "settle-pending") return settlePending(button.dataset.id);
    if (action === "toggle-reaction-picker") { state.reactionPickerEntryId = state.reactionPickerEntryId === button.dataset.id ? "" : button.dataset.id; saveState(); render(); return; }
    if (action === "set-reaction") { setReaction(button.dataset.id, button.dataset.emoji); state.reactionPickerEntryId = ""; saveState(); render(); toast("Tepki eklendi."); return; }
    if (action === "show-reconciliation") { state.reconciliationDetailId = state.reconciliationDetailId === button.dataset.id ? "" : button.dataset.id; saveState(); render(); return; }
    if (action === "settle-transfer") { const index = Number(button.dataset.index); const transfers = minimumTransfers(calculateBalances()); const addToKasa = Boolean(app.querySelector(`[data-cash-transfer="${index}"]`)?.checked); settleTransfer(transfers[index], addToKasa); saveState(); render(); toast(addToKasa ? "Ödendi ve kasaya işlendi." : "Ödendi işaretlendi."); return; }
    if (action === "auth-mode") { state.authMode = button.dataset.mode === "signup" ? "signup" : "login"; saveState(); render(); return; }
    if (action === "logout") { try { if (typeof isCloudReady === "function" && isCloudReady()) await cloudSignOut(); } catch (error) { toast(friendlyCloudError(error)); } state.signedInUserId = ""; state.activeUserId = ""; state.activeView = "home"; state.authMode = "login"; draft = makeDraft(); saveState(); render(); toast("Çıkış yapıldı."); }
  };

  app.querySelectorAll("[data-guess-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitter = event.submitter;
    const data = new FormData(form);
    const predictedType = submitter?.value || String(data.get("predictedType") || "");
    const predictedAmount = parseAmount(data.get("predictedAmount"));
    const result = guessNotification(form.dataset.id, { predictedType, predictedAmount: predictedAmount || null });
    if (result.status === "already") return toast("Bu tahmini zaten yaptın.");
    saveState();
    render();
    toast(result.guess?.isCorrect ? "Kestirdin. +10 puan" : "Tahmin kaydedildi.");
  }));

  app.querySelectorAll("input[type='file']").forEach((input) => input.addEventListener("change", () => {
    const label = input.closest("label")?.querySelector("[data-file-label]");
    if (label && input.files?.[0]) label.textContent = "Fotoğraf yüklendi";
  }));

  app.querySelectorAll("[data-custom-reaction]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    const emoji = String(new FormData(form).get("emoji") || "").trim();
    setReaction(form.dataset.id, emoji);
    state.reactionPickerEntryId = "";
    saveState();
    render();
  }));

  const forms = { accountForm: handleAccountForm, loginForm: handleLoginForm, firstProjectForm: handleFirstProjectForm, joinProjectForm: handleJoinProjectForm, statementForm: bindStatementForm, goalForm: handleGoalSubmit, projectUserForm: handleProjectUserForm, userForm: handleProjectUserForm, projectForm: handleProjectForm, memberProfileForm: handleMemberProfileForm, ownProfileForm: handleOwnProfileForm, projectPhotoForm: handleProjectPhotoForm };
  Object.entries(forms).forEach(([id, handler]) => {
    const form = app.querySelector(`#${id}`);
    if (!form) return;
    if (id === "statementForm") return handler(form);
    form.addEventListener("submit", async (event) => { event.preventDefault(); await handler(form); });
  });
  const entryForm = app.querySelector("#entryForm");
  if (entryForm) bindEntryForm(entryForm);
}
