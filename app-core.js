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
