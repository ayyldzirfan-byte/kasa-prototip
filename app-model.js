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
  state.notifications.unshift({
    id: makeId(),
    projectId: project.id,
    entryId: entry.id,
    actorId: actor.id,
    recipients,
    mode: options.mode || "open",
    actualType: entry.type,
    title: entry.shortName || entry.headingName,
    amount: entry.amount,
    emoji: options.emoji || "🎲",
    photoName: options.photoName || "",
    successReaction: options.successReaction || "✅",
    successPhotoName: options.successPhotoName || "",
    failReaction: options.failReaction || "🙃",
    failPhotoName: options.failPhotoName || "",
    guesses: [],
    createdAt: new Date().toISOString(),
  });
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
  return notification.guesses?.find((guess) => guess.userId === userId);
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
            <p class="expense-title">${entry.shortName || entry.headingName}</p>
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
  const media = notification.photoName ? `📎 ${notification.photoName}` : notification.emoji || "🎲";

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
        <p class="expense-meta">${guess ? `Tahminin: ${guess.guess === "income" ? "Gelir" : "Gider"}` : "Gelir mi gider mi? Tahmin et."}</p>
        ${
          guess
            ? `<div class="reaction-result ${guess.correct ? "correct" : "wrong"}">${guess.correct ? notification.successReaction : notification.failReaction} ${guess.correct ? "Doğru bildin." : "Yanlış tahmin."}${guess.correct && notification.successPhotoName ? ` · ${notification.successPhotoName}` : ""}${!guess.correct && notification.failPhotoName ? ` · ${notification.failPhotoName}` : ""}</div>`
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
