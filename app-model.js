function activeProject() {
  return state.projects.find((project) => project.id === state.activeProjectId) || state.projects[0];
}

function activeMembers() {
  const project = activeProject();
  if (!project) return [];
  return state.users.filter((user) => project.memberIds.includes(user.id));
}

function currentUser() {
  return state.users.find((user) => user.id === state.signedInUserId);
}

function createdByLabel(user) {
  if (!user.createdBy) return "İlk hesap";
  const creator = state.users.find((item) => item.id === user.createdBy);
  return creator ? `${shortName(creator.name)} oluşturdu` : "Oluşturan bilinmiyor";
}

function createUser(name, password = "", options = {}) {
  const user = {
    id: makeId(),
    name,
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
  if (!project.memberIds.includes(userId)) {
    project.memberIds.push(userId);
    return;
  }
  if (project.memberIds.length === 1) {
    toast("Projede en az bir kullanıcı kalsın.");
    return;
  }
  project.memberIds = project.memberIds.filter((id) => id !== userId);
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
  const linked = activeProject().memberIds.includes(user.id);
  return `
    <div class="expense-row">
      <span class="emoji-dot">👤</span>
      <div class="expense-main">
        <p class="expense-title">${shortName(user.name)}</p>
        <p class="expense-meta">${linked ? "Bu projeye bağlı" : "Bu projede yok"} · ${user.password ? "Şifreli" : "Şifresiz"} · ${createdByLabel(user)}</p>
      </div>
      <button class="mini-action ${linked ? "linked" : ""}" data-action="toggle-user-project" data-id="${user.id}" type="button">${linked ? "Çıkar" : "Bağla"}</button>
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
  return `
    <div class="expense-row">
      <span class="emoji-dot">${entry.emoji || type?.emoji || "🧾"}</span>
      <div class="expense-main">
        <p class="expense-title">${entry.shortName || entry.headingName}</p>
        <p class="expense-meta">${shortName(user?.name || "Kullanıcı")} · ${type?.label || "Hareket"} · ${formatShortDate(entry.date)}</p>
      </div>
      <strong class="expense-price ${entry.type === "income" ? "price-positive" : entry.type === "expense" ? "price-negative" : ""}">
        ${entry.type === "income" ? "+" : entry.type === "expense" ? "-" : ""}${money(entry.amount)}
      </strong>
    </div>
  `;
}

function pendingRow(entry) {
  const isReceivable = entry.type === "receivable";
  return `
    <div class="expense-row">
      <span class="emoji-dot">${entry.emoji || (isReceivable ? "🤝" : "⏰")}</span>
      <div class="expense-main">
        <p class="expense-title">${entry.shortName || entry.headingName}</p>
        <p class="expense-meta">${isReceivable ? "Beklenen alacak" : "Yaklaşan ödeme"} · ${formatShortDate(entry.date)}</p>
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
        <div class="balance-name">${shortName(item.name)}</div>
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
        name: user.name,
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
  return Number(String(value || "").replace(/[^\d,.-]/g, "").replace(",", "."));
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
  const text = `KASA FİŞİ\n${activeProject().name}\n${label} giren: ${money(totals.income)}\n${label} çıkan: ${money(totals.expense)}\nNet: ${money(totals.actual)}\nEn hareketli başlık: ${topHeading(entries)}`;

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
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(Math.round(Number(value || 0)));
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
