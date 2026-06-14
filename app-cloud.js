let cloudClient = null;
let cloudAuthSubscribed = false;
let cloudSyncTimer = null;
let cloudSyncBusy = false;
let cloudSyncPaused = false;

function cloudConfig() {
  return window.KASA_CLOUD_CONFIG || {};
}

function cloudCanonicalAppUrl() {
  const configured = String(cloudConfig().appUrl || "https://kasa-prototip.vercel.app").trim();
  return (configured || "https://kasa-prototip.vercel.app").replace(/\/+$/, "");
}

function cloudPasswordResetRedirectUrl() {
  return `${cloudCanonicalAppUrl()}/index.html?authAction=reset-password`;
}

function cloudIsPasswordRecoveryUrl() {
  const query = new URLSearchParams(location.search || "");
  const hash = new URLSearchParams(String(location.hash || "").replace(/^#/, ""));
  return query.get("authAction") === "reset-password" || query.get("type") === "recovery" || hash.get("type") === "recovery";
}

function cloudRedirectLegacyHost() {
  if (typeof location === "undefined" || !String(location.protocol || "").startsWith("http")) return;
  const host = String(location.hostname || "").toLowerCase();
  if (!host.endsWith("netlify.app")) return;
  const target = new URL(`${location.pathname || "/index.html"}${location.search || ""}${location.hash || ""}`, cloudCanonicalAppUrl());
  location.replace(target.toString());
}

cloudRedirectLegacyHost();

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
        if (_event === "PASSWORD_RECOVERY" || cloudIsPasswordRecoveryUrl()) {
          state.authMode = "reset-password";
          state.activeView = "home";
          state.cloudStatus = "Mail linki doğrulandı. Yeni şifreni oluştur.";
        }
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
    if (cloudIsPasswordRecoveryUrl()) {
      state.authMode = "reset-password";
      state.activeView = "home";
      setCloudStatus("Mail linki doğrulandı. Yeni şifreni oluştur.");
      saveState();
      return;
    }
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
        photoName: project.photo_name || "",
        photoData: project.photo_data || "",
        memberIds: projectMembers.map((member) => member.user_id),
        memberAliases: Object.fromEntries(projectMembers.filter((member) => member.alias).map((member) => [member.user_id, member.alias])),
        memberSince: Object.fromEntries(projectMembers.filter((member) => member.member_since).map((member) => [member.user_id, String(member.member_since).slice(0, 10)])),
        familiarityScores: Object.fromEntries(projectMembers.filter((member) => member.familiarity_scores).map((member) => [member.user_id, member.familiarity_scores || {}])),
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
      paidById: entry.paid_by_id || entry.user_id,
      splitWith: Array.isArray(entry.split_with) ? entry.split_with : [],
      splitRatio: Array.isArray(entry.split_ratio) ? entry.split_ratio.map(Number) : [],
      autoRevealAt: entry.auto_reveal_at || "",
      rateLockedAt: entry.rate_locked_at || entry.created_at || new Date().toISOString(),
      lockedNotificationId: entry.locked_notification_id || "",
      settlement: Boolean(entry.settlement),
      status: entry.status,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at || entry.created_at,
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
      hideActor: notification.hide_actor ?? true,
      gamePhase: Number(notification.game_phase || 1),
      phase1Guesses: Array.isArray(notification.phase1_guesses) ? notification.phase1_guesses : [],
      phase2Guesses: Array.isArray(notification.phase2_guesses) ? notification.phase2_guesses : [],
      phase3Options: Array.isArray(notification.phase3_options) ? notification.phase3_options : [],
      phase3Correct: Number(notification.phase3_correct || 0),
      phase3Guesses: Array.isArray(notification.phase3_guesses) ? notification.phase3_guesses : [],
      phase3Image: notification.phase3_image || "",
      actorWrongReaction: notification.actor_wrong_reaction || null,
      actorCorrectReaction: notification.actor_correct_reaction || null,
      typeWrongReaction: notification.type_wrong_reaction || null,
      typeCorrectReaction: notification.type_correct_reaction || null,
      categoryWrongReaction: notification.category_wrong_reaction || null,
      categoryCorrectReaction: notification.category_correct_reaction || null,
      phase1Completed: Boolean(notification.phase1_completed),
      phase2Completed: Boolean(notification.phase2_completed),
      phase3Completed: Boolean(notification.phase3_completed),
      gameFullyCompleted: Boolean(notification.game_fully_completed),
      gameVersion: notification.game_version || "v1",
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
          photo_name: project.photoName || "",
          photo_data: project.photoData || "",
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
        member_since: project.memberSince?.[userId] || project.createdAt || new Date().toISOString(),
        familiarity_scores: project.familiarityScores?.[userId] || {},
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
        paid_by_id: entry.paidById || entry.userId,
        split_with: Array.isArray(entry.splitWith) ? entry.splitWith : [entry.userId].filter(Boolean),
        split_ratio: Array.isArray(entry.splitRatio) ? entry.splitRatio.map(Number) : [1],
        auto_reveal_at: entry.autoRevealAt || null,
        rate_locked_at: entry.rateLockedAt || entry.createdAt || new Date().toISOString(),
        locked_notification_id: entry.lockedNotificationId || null,
        settlement: Boolean(entry.settlement),
        status: entry.status,
        created_at: entry.createdAt || new Date().toISOString(),
        updated_at: entry.updatedAt || new Date().toISOString(),
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
        hide_actor: notification.hideActor ?? true,
        game_phase: notification.gamePhase || 1,
        phase1_guesses: notification.phase1Guesses || [],
        phase2_guesses: notification.phase2Guesses || [],
        phase3_options: notification.phase3Options || [],
        phase3_correct: notification.phase3Correct || 0,
        phase3_guesses: notification.phase3Guesses || [],
        phase3_image: notification.phase3Image || "",
        actor_wrong_reaction: notification.actorWrongReaction || null,
        actor_correct_reaction: notification.actorCorrectReaction || null,
        type_wrong_reaction: notification.typeWrongReaction || null,
        type_correct_reaction: notification.typeCorrectReaction || null,
        category_wrong_reaction: notification.categoryWrongReaction || null,
        category_correct_reaction: notification.categoryCorrectReaction || null,
        phase1_completed: Boolean(notification.phase1Completed),
        phase2_completed: Boolean(notification.phase2Completed),
        phase3_completed: Boolean(notification.phase3Completed),
        game_fully_completed: Boolean(notification.gameFullyCompleted),
        game_version: notification.gameVersion || "v1",
        created_at: notification.createdAt || new Date().toISOString(),
      }));
    if (notificationRows.length) {
      const { error } = await client.from("kasa_notifications").upsert(notificationRows, { onConflict: "id" });
      if (error) throw error;
    }

    state.cloudSyncAt = new Date().toISOString();
    setCloudStatus("Senkron tamam");
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

async function cloudDeleteEntry(entryId) {
  const client = cloudDb();
  if (!client || !entryId) return;

  const notificationResult = await client.from("kasa_notifications").delete().eq("entry_id", entryId);
  if (notificationResult.error) logError?.(notificationResult.error, "cloud-delete-entry-notifications");

  const reactionResult = await client.from("kasa_reactions").delete().eq("entry_id", entryId);
  if (reactionResult.error) logError?.(reactionResult.error, "cloud-delete-entry-reactions");

  const { error } = await client.from("kasa_entries").delete().eq("id", entryId);
  if (error) throw error;
}
