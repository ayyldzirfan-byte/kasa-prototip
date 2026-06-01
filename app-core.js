function makeDraft() {
  const members = activeMembers();
  const activeUserInProject = members.find((user) => user.id === state?.activeUserId);

  return {
    type: "expense",
    emoji: "💸",
    settlement: "in",
    userId: activeUserInProject?.id || members[0]?.id || state?.activeUserId || state?.users?.[0]?.id || "",
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
                  ${state.users.map((user) => `<option value="${user.id}"${user.id === selectedLoginUserId ? " selected" : ""}>${shortName(user.name)}${user.email ? ` · ${user.email}` : ""}</option>`).join("")}
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
        <h2>${shortName(user.name)}, şimdi kasa seç</h2>
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
