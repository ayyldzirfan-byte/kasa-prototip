/*
  Blocks 0-9 expansion layer.
  Loaded after the existing prototype files and before initApp().
*/

function blockNow() {
  return new Date().toISOString();
}

function blockProject(project = activeProject()) {
  return project || state.projects[0] || null;
}

function friendlyCloudError(error) {
  const message = error?.message || String(error || "");
  if (message.includes("column") && message.includes("does not exist")) return "Supabase yeni alanları eksik. supabase-blocks-0-9.sql dosyasını SQL Editor'da çalıştır.";
  if (message.includes("relation") || message.includes("does not exist")) return "Supabase yeni tabloları eksik. supabase-blocks-0-9.sql ve gerekirse supabase-schema.sql çalıştırılmalı.";
  if (message.includes("row-level security")) return "Supabase izin kuralı engelledi. SQL politikalarını kontrol etmemiz gerekiyor.";
  if (message.includes("Invalid login credentials")) return "E-posta veya şifre hatalı.";
  if (message.includes("Email not confirmed")) return "Önce e-postadaki doğrulama linkine tıkla.";
  return message || "Bulut işlemi tamamlanamadı.";
}

function blockRawEntries(project = activeProject()) {
  if (!project) return [];
  return (state.entries || []).filter((entry) => entry.projectId === project.id);
}

function blockConfirmedEntries(project = activeProject()) {
  return blockRawEntries(project).filter((entry) => entryConfirmed(entry));
}

function relativeDate(value) {
  const date = new Date(value || blockNow());
  const diffMs = date.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat("tr-TR", { numeric: "auto" });
  if (abs >= 86400000) return rtf.format(Math.round(diffMs / 86400000), "day");
  if (abs >= 3600000) return rtf.format(Math.round(diffMs / 3600000), "hour");
  return rtf.format(Math.round(diffMs / 60000), "minute");
}

function cleanRatioList(ids, ratios) {
  const list = Array.isArray(ratios) ? ratios.map(Number) : [];
  const fallback = ids.length ? 1 / ids.length : 1;
  const raw = ids.map((_id, index) => (Number.isFinite(list[index]) && list[index] > 0 ? list[index] : fallback));
  const total = raw.reduce((sumValue, value) => sumValue + value, 0) || 1;
  return raw.map((value) => value / total);
}

function splitForEntry(type, settlement, paidById) {
  const project = activeProject();
  if (!project || type !== "expense" || !settlement) return { splitWith: paidById ? [paidById] : [], splitRatio: [1] };
  if (project.splitType === "individual") return { splitWith: paidById ? [paidById] : [], splitRatio: [1] };
  const ids = activeMembers().map((user) => user.id);
  const splitWith = ids.length ? ids : paidById ? [paidById] : [];
  return { splitWith, splitRatio: cleanRatioList(splitWith, []) };
}

function entryConfirmed(entry) {
  if (!entry || entry.status !== "done") return false;
  if (!entry.lockedNotificationId) return true;
  const notification = entryNotification(entry);
  if (!notification) return false;
  maybeRevealNotification(notification);
  return Boolean(notification.revealedAt || notification.isCompleted);
}

function entryVisibleForCurrentUser(entry) {
  if (!entry?.lockedNotificationId) return true;
  const notification = entryNotification(entry);
  if (!notification) return false;
  if (notification.mode !== "surprise") return true;
  maybeRevealNotification(notification);
  return Boolean(notification.revealedAt || notification.isCompleted);
}

function projectEntries() {
  return blockRawEntries().filter((entry) => entryVisibleForCurrentUser(entry));
}

function visibleProjectEntries() {
  return projectEntries();
}

function confirmedProjectEntries(project = activeProject()) {
  return blockConfirmedEntries(project);
}

function pendingSurpriseCount(project = activeProject()) {
  return blockRawEntries(project).filter((entry) => entry.status === "done" && entry.lockedNotificationId && !entryConfirmed(entry)).length;
}

function calculateTotals(entries = blockRawEntries()) {
  const done = entries.filter((entry) => entry.status === "done" && entryConfirmed(entry));
  const pending = entries.filter((entry) => entry.status === "pending");
  const income = sum(done.filter((entry) => entry.type === "income"));
  const expense = sum(done.filter((entry) => entry.type === "expense"));
  const receivable = sum(pending.filter((entry) => entry.type === "receivable"));
  const payable = sum(pending.filter((entry) => entry.type === "payable"));
  const actual = income - expense;
  const comfortable = income - expense + receivable - payable;
  return { income, expense, receivable, payable, actual, comfortable };
}

function maybeRevealNotification(notification) {
  if (!notification || notification.mode !== "surprise" || notification.revealedAt) return notification;
  const recipients = Array.isArray(notification.recipients) ? notification.recipients : [];
  const guesses = Array.isArray(notification.guesses) ? notification.guesses : [];
  const allGuessed = recipients.length > 0 && recipients.every((userId) => guesses.some((guess) => guess.userId === userId));
  const entry = (state.entries || []).find((item) => item.id === notification.entryId);
  const deadline = notification.guessDeadline || entry?.autoRevealAt || addHours(notification.createdAt || blockNow(), 48);
  const deadlinePassed = new Date(deadline).getTime() <= Date.now();
  if (allGuessed || deadlinePassed) {
    notification.revealedAt = blockNow();
    notification.isCompleted = true;
    if (entry) {
      entry.autoRevealAt = entry.autoRevealAt || deadline;
      entry.lockedNotificationId = null;
    }
  }
  return notification;
}

function createEntryNotification(entry, options = {}) {
  const project = activeProject();
  const actor = currentUser();
  if (!project || !actor || options.mode === "silent") return null;
  const recipients = project.memberIds.filter((id) => id !== actor.id);
  if (!recipients.length) return null;

  state.notifications = state.notifications || [];
  const now = blockNow();
  const deadline = options.guessDeadline || addHours(now, 48);
  const notification = {
    id: makeId(),
    projectId: project.id,
    entryId: entry.id,
    actorId: actor.id,
    recipients,
    mode: options.mode || "open",
    actualType: entry.type,
    title: entryTitle(entry),
    amount: Number(entry.amount || 0),
    emoji: options.emoji || "🎲",
    photoName: options.photoName || "",
    photoData: options.photoData || "",
    gif: options.gif || "",
    successReaction: options.successReaction || "✅",
    successPhotoName: options.successPhotoName || "",
    successPhotoData: options.successPhotoData || "",
    successGif: options.successGif || "",
    failReaction: options.failReaction || "🙂",
    failPhotoName: options.failPhotoName || "",
    failPhotoData: options.failPhotoData || "",
    failGif: options.failGif || "",
    guessDeadline: deadline,
    revealedAt: options.mode === "surprise" ? "" : now,
    isCompleted: options.mode !== "surprise",
    notificationType: "entry",
    reactionEmoji: "",
    guesses: [],
    createdAt: now,
  };
  state.notifications.unshift(notification);
  return notification;
}

function amountGuessCorrect(actual, predicted) {
  if (predicted === null || predicted === undefined || predicted === "") return true;
  const value = Number(predicted);
  if (!Number.isFinite(value) || value <= 0) return true;
  const base = Math.abs(Number(actual || 0));
  return Math.abs(base - value) <= base * 0.15;
}

function guessNotification(id, guessInput) {
  const notification = (state.notifications || []).find((item) => item.id === id);
  const user = currentUser();
  if (!notification || !user) return { status: "missing" };
  notification.guesses = Array.isArray(notification.guesses) ? notification.guesses : [];
  const existing = notification.guesses.find((guess) => guess.userId === user.id);
  if (existing) return { status: "already", guess: existing };

  const predictedType = typeof guessInput === "string" ? guessInput : String(guessInput?.predictedType || "");
  const predictedAmountRaw = typeof guessInput === "object" ? guessInput.predictedAmount : null;
  const predictedAmount = predictedAmountRaw === "" || predictedAmountRaw === null || predictedAmountRaw === undefined ? null : Number(predictedAmountRaw);
  const isCorrect = predictedType === notification.actualType && amountGuessCorrect(notification.amount, predictedAmount);
  const result = {
    userId: user.id,
    predictedType,
    predictedAmount,
    isCorrect,
    guessedAt: blockNow(),
    guess: predictedType,
    correct: isCorrect,
    at: blockNow(),
  };
  notification.guesses.push(result);
  user.totalGuesses = Number(user.totalGuesses || 0) + 1;
  if (isCorrect) {
    user.totalScore = Number(user.totalScore || 0) + 10;
    user.correctGuesses = Number(user.correctGuesses || 0) + 1;
  }
  maybeRevealNotification(notification);
  return { status: "saved", guess: result, notification };
}

function onayText(user, correct) {
  const mode = personalityModes[user?.onayModu || "standart"] || personalityModes.standart;
  return correct ? mode.success : mode.fail;
}

function notificationMedia(notification) {
  return {
    emoji: notification?.emoji || "🎲",
    photoName: notification?.photoName || "",
    photoData: notification?.photoData || "",
    gif: notification?.gif || "",
  };
}

function notificationReactionMedia(notification, guess) {
  if (!notification || !guess) return {};
  if (guess.isCorrect ?? guess.correct) {
    return {
      emoji: notification.successReaction || "✅",
      photoName: notification.successPhotoName || "",
      photoData: notification.successPhotoData || "",
      gif: notification.successGif || "",
    };
  }
  return {
    emoji: notification.failReaction || "🙂",
    photoName: notification.failPhotoName || "",
    photoData: notification.failPhotoData || "",
    gif: notification.failGif || "",
  };
}

function mediaPreviewHtml(media = {}, fallback = "🎲") {
  if (media.photoData) return `<img class="media-image" src="${media.photoData}" alt="${media.photoName || "Medya"}" />`;
  if (media.gif) {
    const value = String(media.gif).trim();
    if (/^https?:\/\//i.test(value)) return `<img class="media-image" src="${value}" alt="GIF" />`;
    return `<span class="media-gif">${value}</span>`;
  }
  if (media.photoName) return `<span class="media-gif">📎 ${media.photoName}</span>`;
  return `<span>${media.emoji || fallback}</span>`;
}

function notificationRow(notification) {
  const actor = state.users.find((user) => user.id === notification.actorId);
  const guess = notificationGuessFor(notification);
  const isSurprise = notification.mode === "surprise";
  const isReaction = notification.notificationType === "reaction";
  const typeLabel = notification.actualType === "income" ? "gelir" : notification.actualType === "expense" ? "gider" : "hareket";
  const media = mediaPreviewHtml(notificationMedia(notification));
  const completed = Boolean(notification.revealedAt || notification.isCompleted);

  if (isReaction) {
    return `
      <div class="notification-card reaction-notification">
        <div class="notification-hero pop-emoji">${notification.reactionEmoji || "👀"}</div>
        <div class="expense-main">
          <p class="expense-title">${projectUserLabel(actor)} tepki verdi</p>
          <p class="expense-meta">${notification.title}</p>
        </div>
      </div>
    `;
  }

  if (!isSurprise) {
    return `
      <div class="notification-card">
        <div class="notification-hero">${media}</div>
        <div class="expense-main">
          <p class="expense-title">${projectUserLabel(actor)} ${typeLabel} ekledi</p>
          <p class="expense-meta">${notification.title} · ${money(notification.amount)} · ${relativeDate(notification.createdAt)}</p>
        </div>
      </div>
    `;
  }

  if (guess && !completed) {
    return `
      <div class="notification-card surprise-locked">
        <div class="notification-hero">${media}</div>
        <div class="expense-main">
          <p class="expense-title">Tahmin kaydedildi</p>
          <p class="expense-meta">Sen ${guess.predictedType === "income" ? "gelir" : "gider"} dedin. Detay, herkes tahmin edince veya süre dolunca açılacak.</p>
        </div>
      </div>
    `;
  }

  if (guess && completed) {
    const correct = Boolean(guess.isCorrect ?? guess.correct);
    const ownerText = onayText(actor, correct);
    return `
      <div class="notification-card ${correct ? "guess-correct" : "guess-wrong"}">
        <div class="notification-hero">${mediaPreviewHtml(notificationReactionMedia(notification, guess), correct ? "✅" : "🙂")}</div>
        <div class="expense-main">
          <p class="expense-title">${correct ? "Kestirdin! +10 puan" : "Sürpriz geldi geçti."}</p>
          <p class="expense-meta">${ownerText} Gerçek: ${typeLabel} · ${money(notification.amount)} · ${completed ? "kasa açıldı" : "diğer tahminler bekleniyor"}</p>
          <div class="reaction-result ${correct ? "correct confetti-burst" : "wrong shake-once"}">
            <span>${correct ? "Doğru tahmin" : "Yanlış tahmin"}</span>
            <span class="reaction-media">${mediaPreviewHtml(notificationReactionMedia(notification, guess), correct ? "✅" : "🙂")}</span>
          </div>
        </div>
      </div>
    `;
  }

  if (completed) {
    return `
      <div class="notification-card">
        <div class="notification-hero">${media}</div>
        <div class="expense-main">
          <p class="expense-title">Sürpriz açıldı</p>
          <p class="expense-meta">Gerçek: ${typeLabel} · ${notification.title} · ${money(notification.amount)}</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="notification-card surprise-locked">
      <div class="notification-hero">${media}</div>
      <div class="expense-main">
        <p class="expense-title">${projectUserLabel(actor)} sürpriz hareket gönderdi</p>
        <p class="expense-meta">?? · ?? · ${relativeDate(notification.createdAt)} · ${notification.title ? "başlık kapalı" : "detay kapalı"}</p>
        <form class="guess-form" data-guess-form data-id="${notification.id}">
          <div class="guess-actions">
            <button class="mini-action" name="predictedType" value="income" type="submit">Gelir mi?</button>
            <button class="mini-action" name="predictedType" value="expense" type="submit">Gider mi?</button>
          </div>
          <input class="text-input guess-amount" name="predictedAmount" inputmode="numeric" placeholder="Tutar tahmini" autocomplete="off" />
        </form>
      </div>
    </div>
  `;
}

function reactionSummary(entryId) {
  const items = (state.reactions || []).filter((reaction) => reaction.entryId === entryId);
  if (!items.length) return "";
  const grouped = items.reduce((acc, item) => {
    acc[item.emoji] = (acc[item.emoji] || 0) + 1;
    return acc;
  }, {});
  const parts = Object.entries(grouped)
    .slice(0, 3)
    .map(([emoji, count]) => `${emoji}${count > 1 ? ` ${count}` : ""}`);
  const extra = Object.keys(grouped).length > 3 ? `+${Object.keys(grouped).length - 3}` : "";
  return [...parts, extra].filter(Boolean).join(" ");
}

function reactionPicker(entry) {
  return `
    <div class="reaction-picker">
      ${reactionPreset.map((emoji) => `<button class="emoji-chip" data-action="set-reaction" data-id="${entry.id}" data-emoji="${emoji}" type="button">${emoji}</button>`).join("")}
      <form class="custom-reaction-form" data-custom-reaction data-id="${entry.id}">
        <input class="text-input" name="emoji" maxlength="4" placeholder="Emoji" autocomplete="off" />
        <button class="mini-action" type="submit">Ekle</button>
      </form>
    </div>
  `;
}

function createReactionNotification(entry, emoji) {
  const actor = currentUser();
  if (!entry || !actor || entry.userId === actor.id) return;
  state.notifications = state.notifications || [];
  const heading = entryTitle(entry);
  state.notifications.unshift({
    id: makeId(),
    projectId: entry.projectId,
    entryId: entry.id,
    actorId: actor.id,
    recipients: [entry.userId],
    mode: "reaction",
    actualType: entry.type,
    title: `${projectUserLabel(actor)} senin ${heading} harcamanı ${emoji} ile işaretledi`,
    amount: entry.amount,
    emoji,
    reactionEmoji: emoji,
    notificationType: "reaction",
    guesses: [],
    createdAt: blockNow(),
  });
}

function setReaction(entryId, emoji) {
  const user = currentUser();
  const entry = (state.entries || []).find((item) => item.id === entryId);
  if (!user || !entry || !emoji) return;
  state.reactions = state.reactions || [];
  const existing = state.reactions.find((reaction) => reaction.entryId === entryId && reaction.userId === user.id);
  if (existing) {
    existing.emoji = emoji;
    existing.createdAt = blockNow();
  } else {
    state.reactions.push({ id: makeId(), entryId, projectId: entry.projectId, userId: user.id, emoji, createdAt: blockNow() });
  }
  createReactionNotification(entry, emoji);
}

function entryRow(entry) {
  const type = entryTypes.find((item) => item.id === entry.type);
  const user = state.users.find((item) => item.id === entry.userId);
  const exchange = exchangeText(entry);
  const reactions = reactionSummary(entry.id);
  return `
    <div class="expense-row">
      <span class="emoji-dot">${entry.emoji || entryHeading(entry).emoji || type?.emoji || "🧾"}</span>
      <div class="expense-main">
        <p class="expense-title">${entryTitle(entry)}</p>
        <p class="expense-meta">${projectUserLabel(user)} · ${type?.label || "Hareket"} · ${formatShortDate(entry.date)}${exchange ? ` · ${exchange}` : ""}</p>
        ${entry.note ? `<p class="expense-note">${entry.note}</p>` : ""}
        ${reactions ? `<p class="expense-note reaction-line">${reactions}</p>` : ""}
      </div>
      <strong class="expense-price ${entry.type === "income" ? "price-positive" : entry.type === "expense" ? "price-negative" : ""}">
        ${entry.type === "income" ? "+" : entry.type === "expense" ? "-" : ""}${money(entry.amount)}
      </strong>
      <button class="reaction-button" data-action="toggle-reaction-picker" data-id="${entry.id}" type="button" aria-label="Tepki ver">☺</button>
    </div>
    ${state.reactionPickerEntryId === entry.id ? reactionPicker(entry) : ""}
  `;
}

function movementEntryRow(entry) {
  const notification = entryNotification(entry);
  const guess = notificationGuessFor(notification);
  const gameStatus = entryGameStatus(entry);
  const entryMedia = entry.photoData ? mediaPreviewHtml({ photoData: entry.photoData, photoName: entry.photoName }, "📎") : "";
  const reactionMedia = guess ? mediaPreviewHtml(notificationReactionMedia(notification, guess), guess.isCorrect ? "✅" : "🙂") : "";
  return `
    <div class="movement-card">
      ${entryRow(entry)}
      ${
        gameStatus || entryMedia || reactionMedia
          ? `
            <div class="movement-extra">
              ${gameStatus ? `<span class="neutral-pill">${gameStatus}</span>` : ""}
              ${reactionMedia ? `<span class="movement-media">${reactionMedia}</span>` : ""}
              ${entryMedia ? `<span class="movement-media">${entryMedia}</span>` : ""}
            </div>
          `
          : ""
      }
    </div>
  `;
}

function calculateNetBalances(project = activeProject()) {
  const members = activeMembers();
  const balances = Object.fromEntries(members.map((user) => [user.id, 0]));
  blockConfirmedEntries(project)
    .filter((entry) => entry.type === "expense" && entry.settlement)
    .forEach((entry) => {
      const paidById = entry.paidById || entry.userId;
      const splitWith = Array.isArray(entry.splitWith) && entry.splitWith.length ? entry.splitWith : members.map((user) => user.id);
      const ratios = cleanRatioList(splitWith, entry.splitRatio);
      if (balances[paidById] !== undefined) balances[paidById] += Number(entry.amount || 0);
      splitWith.forEach((userId, index) => {
        if (balances[userId] !== undefined) balances[userId] -= Number(entry.amount || 0) * ratios[index];
      });
    });

  (state.settlements || [])
    .filter((settlement) => settlement.projectId === project?.id)
    .forEach((settlement) => {
      if (balances[settlement.fromUserId] !== undefined) balances[settlement.fromUserId] += Number(settlement.amount || 0);
      if (balances[settlement.toUserId] !== undefined) balances[settlement.toUserId] -= Number(settlement.amount || 0);
    });

  return members
    .map((user) => ({ userId: user.id, name: projectUserLabel(user), balance: Math.round(balances[user.id] || 0) }))
    .filter((item) => item.balance !== 0);
}

function calculateBalances() {
  return calculateNetBalances();
}

function minimumTransfers(balances = calculateNetBalances()) {
  const creditors = balances.filter((item) => item.balance > 0).map((item) => ({ ...item, amount: item.balance })).sort((a, b) => b.amount - a.amount);
  const debtors = balances.filter((item) => item.balance < 0).map((item) => ({ ...item, amount: Math.abs(item.balance) })).sort((a, b) => b.amount - a.amount);
  const transfers = [];
  let c = 0;
  let d = 0;
  while (creditors[c] && debtors[d]) {
    const amount = Math.min(creditors[c].amount, debtors[d].amount);
    if (amount > 0) {
      transfers.push({
        fromUserId: debtors[d].userId,
        toUserId: creditors[c].userId,
        from: debtors[d].name,
        to: creditors[c].name,
        amount: Math.round(amount),
      });
    }
    creditors[c].amount -= amount;
    debtors[d].amount -= amount;
    if (creditors[c].amount <= 0.5) c += 1;
    if (debtors[d].amount <= 0.5) d += 1;
  }
  return transfers;
}

function settleTransfer(transfer, addToKasa = false) {
  if (!transfer) return;
  state.settlements = state.settlements || [];
  const now = blockNow();
  state.settlements.push({
    id: makeId(),
    projectId: activeProject()?.id || "",
    fromUserId: transfer.fromUserId,
    toUserId: transfer.toUserId,
    amount: Number(transfer.amount || 0),
    settledAt: now,
    note: "Hesaplaşma ekranından ödendi",
  });
  if (addToKasa) {
    const heading = ensureHeading("Hesaplaşma", "Hesaplaşma", "🤝");
    const base = {
      projectId: activeProject()?.id || "",
      amount: Number(transfer.amount || 0),
      enteredAmount: Number(transfer.amount || 0),
      currency: "TRY",
      exchangeRate: 1,
      headingId: heading.id,
      shortName: heading.shortName,
      emoji: heading.emoji,
      date: todayKey(),
      note: "Hesaplaşma ödendi",
      photoName: "",
      photoData: "",
      lockedNotificationId: "",
      autoRevealAt: "",
      rateLockedAt: now,
      splitWith: [],
      splitRatio: [],
      ocrRawText: null,
      ocrParsedAmount: null,
      settlement: false,
      status: "done",
      createdAt: now,
    };
    state.entries.unshift({ ...base, id: makeId(), type: "expense", userId: transfer.fromUserId, paidById: transfer.fromUserId });
    state.entries.unshift({ ...base, id: makeId(), type: "income", userId: transfer.toUserId, paidById: transfer.toUserId });
  }
}

function transferRows(transfers) {
  if (!transfers.length) return `<div class="empty-state">Şimdilik hesap kapanmış görünüyor.</div>`;
  return transfers
    .map(
      (tx, index) => `
        <div class="split-row">
          <strong>${tx.from} → ${tx.to}</strong>
          <span>${money(tx.amount)}</span>
          <label class="settle-check"><input type="checkbox" data-cash-transfer="${index}" /> Kasaya da ekle</label>
          <button class="mini-action" data-action="settle-transfer" data-index="${index}" type="button">Ödendi</button>
        </div>
      `,
    )
    .join("");
}

function fillMessage(template, data) {
  return String(template || "").replace(/\{([^}]+)\}/g, (_match, key) => data[key] ?? "");
}

function pickMessage(list) {
  return list[Math.floor(Math.random() * list.length)] || "";
}

function entriesByPeriod(period, project = activeProject()) {
  return blockConfirmedEntries(project).filter((entry) => isInPeriod(entry.date, period));
}

function headingTotalForDate(headingId, date) {
  return blockConfirmedEntries()
    .filter((entry) => entry.type === "expense" && entry.headingId === headingId && entry.date === date)
    .reduce((total, entry) => total + Number(entry.amount || 0), 0);
}

function dailyWarningCards() {
  const project = activeProject();
  const cards = [];
  projectHeadings().forEach((heading) => {
    const todayTotal = headingTotalForDate(heading.id, todayKey());
    if (!todayTotal) return;
    const limit = Number(project?.budgetLimits?.[heading.id] || 0);
    const historical = blockConfirmedEntries()
      .filter((entry) => entry.type === "expense" && entry.headingId === heading.id && entry.date !== todayKey())
      .slice(-90);
    const average = historical.length ? sum(historical) / Math.max(1, new Set(historical.map((entry) => entry.date)).size) : 0;
    const threshold = limit || average * 1.2;
    if (!threshold || todayTotal <= threshold) return;
    const entertainment = /eglence|eğlence|kahve|sinema|oyun/i.test(normalize(heading.name));
    const template = pickMessage(entertainment ? funnyMessages.asimEglence : funnyMessages.asimGenel);
    cards.push(fillMessage(template, { tutar: formatNumber(todayTotal), hedefGun: 2, başlık: heading.shortName, gecenAy: formatNumber(previousMonthHeadingTotal(heading.id)) }));
  });
  return cards
    .slice(0, 2)
    .map((text) => `<section class="card alert-card"><p>${text}</p></section>`)
    .join("");
}

function previousMonthHeadingTotal(headingId) {
  const prev = previousMonthKey();
  return sum(blockConfirmedEntries().filter((entry) => entry.type === "expense" && entry.headingId === headingId && entryMonth(entry) === prev));
}

function weeklySummaryCard() {
  const day = new Date().getDay();
  if (day !== 0) return "";
  const weekEntries = entriesByPeriod("week");
  if (!weekEntries.length) return "";
  const project = activeProject();
  const weekExpense = sum(weekEntries.filter((entry) => entry.type === "expense"));
  const previousWeekExpense = sum(blockConfirmedEntries(project).filter((entry) => {
    const date = dateFromKey(entry.date);
    const now = startOfDay(new Date());
    const diff = Math.round((now - startOfDay(date)) / 86400000);
    return entry.type === "expense" && diff >= 7 && diff < 14;
  }));
  const words = weekExpense > previousWeekExpense * 1.1 ? ["zorladı", "ağlattı"] : weekExpense < previousWeekExpense * 0.9 ? ["rahatlattı", "kurtardı"] : ["şoke etti"];
  const top = topHeading(weekEntries);
  const balances = calculateNetBalances(project);
  const least = activeMembers().map((user) => ({
    name: projectUserLabel(user),
    total: sum(weekEntries.filter((entry) => entry.type === "expense" && entry.userId === user.id)),
  })).sort((a, b) => a.total - b.total)[0];
  return `
    <section class="card summary-card">
      <h2>Haftalık özet</h2>
      <p>${projectUserLabel(currentUser())} bu hafta kasayı ${pickMessage(words)}.</p>
      <p>En çok: ${top}. En az harcayan: ${least?.name || "Yok"}. ${balances.length ? `${balances.length} açık hesap var.` : ""}</p>
    </section>
  `;
}

function monthlyComparisonCard() {
  const current = monthKey();
  const prev = previousMonthKey();
  const currentNet = calculateTotals(blockConfirmedEntries().filter((entry) => entryMonth(entry) === current)).actual;
  const previousNet = calculateTotals(blockConfirmedEntries().filter((entry) => entryMonth(entry) === prev)).actual;
  if (!previousNet && !currentNet) return "";
  const diff = currentNet - previousNet;
  const list = diff < -500 ? funnyMessages.monthlyWin : diff > 500 ? funnyMessages.monthlyWarn : funnyMessages.monthlyNeutral;
  const text = fillMessage(pickMessage(list), { fark: formatNumber(diff), farkMutlak: formatNumber(Math.abs(diff)) });
  return `<section class="card summary-card"><h2>Aylık karşılaştırma</h2><p>${text}</p></section>`;
}

function reconciliationCards() {
  const items = (state.reconciliations || []).filter((item) => item.projectId === activeProject()?.id).slice(-2).reverse();
  if (!items.length) return "";
  return items
    .map((item) => {
      const matched = Math.abs(Number(item.diff || 0)) < 1;
      const text = fillMessage(pickMessage(matched ? funnyMessages.reconciliationMatch : funnyMessages.reconciliationDiff), { diff: formatNumber(Math.abs(item.diff)) });
      return `
        <section class="card reconciliation-card">
          <div class="section-head">
            <div>
              <h2>${item.bankName || "Ekstre"} uzlaşması</h2>
              <p>${text}</p>
            </div>
            <button class="tiny-button" data-action="show-reconciliation" data-id="${item.id}" type="button">Detay</button>
          </div>
          ${state.reconciliationDetailId === item.id ? reconciliationDetail(item) : ""}
        </section>
      `;
    })
    .join("");
}

function reconciliationDetail(item) {
  return `
    <div class="expense-list">
      <div class="split-row"><strong>Ekstre</strong><span>${money(item.statementTotal)}</span></div>
      <div class="split-row"><strong>Kasa</strong><span>${money(item.kasaTotal)}</span></div>
      <div class="split-row"><strong>Fark</strong><span>${money(item.diff)}</span></div>
      ${item.rawRows.slice(0, 8).map((row) => `<div class="expense-row"><div class="expense-main"><p class="expense-title">${row.description}</p><p class="expense-meta">${row.date}</p></div><strong>${money(row.amount)}</strong></div>`).join("")}
    </div>
  `;
}

function goalCurrentAmount(goal) {
  const title = normalize(goal.title);
  return sum(blockConfirmedEntries().filter((entry) => entry.type === "income" && normalize(entryTitle(entry)).includes(title)));
}

function goalCard(goal) {
  const current = goalCurrentAmount(goal);
  const target = Number(goal.targetAmount || 0);
  const percent = target ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const start = new Date(goal.createdAt || blockNow());
  const elapsedDays = daysBetween(start);
  const daily = current / Math.max(1, elapsedDays);
  const remaining = Math.max(0, target - current);
  const remainingDays = daily ? Math.ceil(remaining / daily) : 0;
  const finish = remainingDays ? new Date(Date.now() + remainingDays * 86400000) : null;
  const deadline = goal.deadline ? new Date(goal.deadline) : null;
  const months = deadline ? Math.max(1, (deadline.getFullYear() - new Date().getFullYear()) * 12 + deadline.getMonth() - new Date().getMonth() + 1) : 1;
  return `
    <div class="goal-card">
      <div class="section-head">
        <div>
          <h2>${goal.title}</h2>
          <p>${money(current)} / ${money(target)} · aylık gerekli ${money(remaining / months)}</p>
        </div>
        <span class="quick-pill">${percent}%</span>
      </div>
      <div class="progress-bg"><div class="progress-fill" style="width:${percent}%"></div></div>
      <p class="field-help">${finish ? `Bu hızla ${finish.toLocaleDateString("tr-TR")} tarihinde tamamlanır.` : "Henüz hız hesabı için katkı yok."}</p>
      ${
        goal.items?.length
          ? `<div class="expense-list">${goal.items.map((item) => `<div class="split-row"><strong>${item.purchased ? "✓" : "○"} ${item.name}</strong><span>${money(item.price)}</span></div>`).join("")}</div>`
          : ""
      }
    </div>
  `;
}

function renderGoalSection() {
  const goals = (state.goals || []).filter((goal) => goal.projectId === activeProject()?.id && goal.status !== "completed");
  return `
    <section class="card">
      <div class="section-head">
        <div>
          <h2>Hedefler</h2>
          <p>Kumbara modu. Gelir başlığı hedef adıyla eşleşirse otomatik ilerler.</p>
        </div>
      </div>
      <form class="inline-form" id="goalForm">
        <input class="text-input" name="title" placeholder="Hedef adı: Tatil, PC, depozito" autocomplete="off" />
        <input class="text-input" name="targetAmount" inputmode="numeric" placeholder="Hedef tutar" autocomplete="off" />
        <input class="select-input" name="deadline" type="date" />
        <input class="text-input" name="items" placeholder="Kalemler: uçak 5000, otel 12000" autocomplete="off" />
        <button class="primary-button" type="submit">Hedef ekle</button>
      </form>
      <div class="expense-list">${goals.length ? goals.map(goalCard).join("") : `<div class="empty-state">Aktif hedef yok.</div>`}</div>
    </section>
  `;
}

function goalDelayWarning(entry) {
  if (!entry || entry.type !== "expense") return "";
  const goal = (state.goals || []).find((item) => item.projectId === entry.projectId && item.status === "active");
  if (!goal) return "";
  const remaining = Math.max(0, Number(goal.targetAmount || 0) - goalCurrentAmount(goal));
  if (!remaining) return "";
  const deadline = goal.deadline ? new Date(goal.deadline) : new Date(Date.now() + 30 * 86400000);
  const months = Math.max(1, (deadline.getFullYear() - new Date().getFullYear()) * 12 + deadline.getMonth() - new Date().getMonth() + 1);
  const monthly = remaining / months;
  const delayed = Math.round((Number(entry.amount || 0) / Math.max(1, monthly)) * 30);
  return delayed > 0 ? `Bu harcama hedefini yaklaşık ${delayed} gün erteledi.` : "";
}

function templateOptionsHtml(selected = state.selectedTemplateId || "") {
  return `
    <div class="template-grid">
      ${projectTemplates
        .map(
          (template) => `
            <button class="template-card ${selected === template.id ? "selected" : ""}" data-action="select-template" data-id="${template.id}" type="button">
              <strong>${template.name}</strong>
              <span>${template.headings.slice(0, 4).join(", ")}</span>
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function applyTemplateToProject(project, templateId) {
  const template = projectTemplates.find((item) => item.id === templateId);
  if (!project || !template) return;
  project.templateId = template.id;
  project.splitType = template.splitType || "equal";
  project.defaultHeadings = template.headings || [];
  project.hasBudgetTarget = Boolean(template.hasBudgetTarget);
  project.hasGoalItems = Boolean(template.hasGoalItems);
  template.headings.forEach((name) => {
    const emoji = emojiForHeadingName(name);
    ensureHeading(name, name, emoji);
  });
}

function createProject(name, purpose = "Genel kasa", options = {}) {
  const project = {
    id: options.id || makeId(),
    name,
    purpose,
    code: options.code || generateProjectCode(name),
    createdAt: options.createdAt || blockNow(),
    createdBy: options.createdBy || currentUser()?.id || "",
    memberIds: options.memberIds || (currentUser()?.id ? [currentUser().id] : []),
    memberAliases: options.memberAliases || {},
    memberPhotos: options.memberPhotos || {},
    photoName: options.photoName || "",
    photoData: options.photoData || "",
    defaultCurrency: options.defaultCurrency || "TL",
    defaultHeadings: options.defaultHeadings || [],
    splitType: options.splitType || "equal",
    templateId: options.templateId || "",
    budgetLimits: options.budgetLimits || {},
    hasBudgetTarget: Boolean(options.hasBudgetTarget),
    hasGoalItems: Boolean(options.hasGoalItems),
  };
  state.projects.push(project);
  state.activeProjectId = project.id;
  draft = makeDraft();
  if (options.templateId) applyTemplateToProject(project, options.templateId);
  return project;
}

function emojiForHeadingName(name) {
  const normalized = normalize(name);
  const key = Object.keys(keywordEmojiMap).find((item) => normalized.includes(normalize(item)));
  if (key) return keywordEmojiMap[key];
  return draft?.emoji || "💰";
}

function headingAutocompleteHtml(typeId) {
  const headings = projectHeadings();
  const suggestions = headingSuggestionsFor(typeId);
  const combined = [...headings.map((heading) => ({ ...heading, source: "project" })), ...suggestions.map((item) => ({ ...item, source: "suggestion" }))];
  return `
    <div class="chips heading-matches" id="headingMatches">
      ${combined
        .slice(0, 10)
        .map((item) => `<button class="chip" data-suggestion="${item.name}" data-short="${item.shortName}" data-emoji="${item.emoji}" type="button">${item.emoji} ${item.shortName || item.name}</button>`)
        .join("")}
    </div>
  `;
}

function mediaHubHtml() {
  return `
    <div class="media-picker media-hub">
      <div>
        <span class="field-label">Medya</span>
        <p class="field-help">Emoji, GIF/sticker linki ve fotoğraf tek alanda. Fiş için aynı fotoğraf alanı kullanılabilir.</p>
      </div>
      <div class="media-grid">
        <input class="text-input" name="notificationEmoji" maxlength="4" value="${draft.notificationEmoji || "🎲"}" autocomplete="off" />
        <input class="text-input" name="notificationGif" placeholder="GIF / sticker linki veya kısa adı" value="${draft.notificationGif || ""}" autocomplete="off" />
        <label class="photo-pick compact-pick">
          <span>Fotoğraf / Fişten tara</span>
          <strong>Seç</strong>
          <input name="photo" type="file" accept="image/*" />
        </label>
      </div>
    </div>
  `;
}

function reactionSetupHtml() {
  return `
    <div class="media-picker">
      <span class="field-label">Tahmin sonucu tepkileri</span>
      <div class="reaction-grid">
        <div class="reaction-column">
          <strong>Doğru</strong>
          <input class="text-input" name="successReaction" value="${draft.successReaction || "✅"}" autocomplete="off" />
          <input class="text-input" name="successGif" placeholder="GIF / sticker linki" value="${draft.successGif || ""}" autocomplete="off" />
          <label class="photo-pick compact-pick"><span>Fotoğraf</span><strong>Seç</strong><input name="successPhoto" type="file" accept="image/*" /></label>
        </div>
        <div class="reaction-column">
          <strong>Yanlış</strong>
          <input class="text-input" name="failReaction" value="${draft.failReaction || "🙂"}" autocomplete="off" />
          <input class="text-input" name="failGif" placeholder="GIF / sticker linki" value="${draft.failGif || ""}" autocomplete="off" />
          <label class="photo-pick compact-pick"><span>Fotoğraf</span><strong>Seç</strong><input name="failPhoto" type="file" accept="image/*" /></label>
        </div>
      </div>
    </div>
  `;
}

function renderHome() {
  const project = activeProject();
  const user = currentUser();
  const totals = calculateTotals(blockRawEntries(project));
  const recent = actualEntries().slice(0, 4);
  const upcoming = pendingEntries().slice(0, 2);
  const notificationCount = notificationEntries().length;
  const surpriseCount = pendingSurpriseCount(project);

  return `
    <section class="account-strip">
      <div>
        <span class="field-label">Aktif kullanıcı</span>
        <strong>${projectUserLabel(user)}</strong>
      </div>
      <div class="account-actions">
        <button class="tiny-button" data-action="open-notifications" type="button">Bildirimler${notificationCount ? ` (${notificationCount})` : ""}</button>
        <button class="tiny-button" data-action="logout" type="button">Çıkış</button>
      </div>
    </section>

    <section class="hero">
      <div class="hero-row">
        <div>
          <p class="hero-title">${project.purpose}</p>
          <p class="hero-money">${money(totals.comfortable)}</p>
          <p class="hero-note">Rahat kalan: onaylı gelir - onaylı gider + beklenen - yaklaşan</p>
          ${surpriseCount ? `<p class="surprise-counter">${surpriseCount} bekleyen sürpriz var. Kasa etkisi oyun bitince açılır.</p>` : ""}
        </div>
        <span class="quick-pill">${totals.comfortable >= 0 ? "İyi" : "Dikkat"}</span>
      </div>
    </section>

    ${dailyWarningCards()}
    ${weeklySummaryCard()}
    ${monthlyComparisonCard()}
    ${reconciliationCards()}

    <section class="card">
      <div class="section-head">
        <div>
          <h2>${project.name}</h2>
          <p>${activeMembers().map((member) => projectUserLabel(member)).join(", ") || "Henüz üye yok"}</p>
        </div>
        <button class="tiny-button" data-action="open-projects-list" type="button">Yeni proje oluştur</button>
      </div>
      <label style="display:block; margin-top: 12px;">
        <span class="field-label">Aktif proje</span>
        <select class="select-input" id="projectSelect">
          ${state.projects.map((item) => `<option value="${item.id}" ${item.id === state.activeProjectId ? "selected" : ""}>${item.name}</option>`).join("")}
        </select>
      </label>
    </section>

    <section class="quick-actions">
      <button class="action-button income" data-action="go-add-income" type="button"><span>💰</span>Gelir ekle</button>
      <button class="action-button expense" data-action="go-add-expense" type="button"><span>💸</span>Gider ekle</button>
    </section>

    <section class="grid-2">
      <article class="stat-card"><p class="stat-label">Gelir</p><p class="stat-value positive">${money(totals.income)}</p></article>
      <article class="stat-card"><p class="stat-label">Gider</p><p class="stat-value warning">${money(totals.expense)}</p></article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="receivable"><p class="stat-label">Beklenen</p><p class="stat-value">${money(totals.receivable)}</p></article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="payable"><p class="stat-label">Yaklaşan</p><p class="stat-value">${money(totals.payable)}</p></article>
    </section>

    ${
      state.pendingDetail
        ? `<section class="card"><div class="section-head"><div><h2>${state.pendingDetail === "receivable" ? "Beklenen gelirler" : "Yaklaşan ödemeler"}</h2><p>Detay dökümü.</p></div><button class="tiny-button" data-action="hide-pending-detail" type="button">Kapat</button></div><div class="expense-list">${pendingDetailRows(state.pendingDetail)}</div></section>`
        : ""
    }

    <section class="card">
      <div class="section-head"><div><h2>Yaklaşanlar</h2><p>Ödeme hatırlatıcıları burada görünür.</p></div><button class="tiny-button" data-action="go-add-payable" type="button">Ekle</button></div>
      <div class="expense-list">${upcoming.length ? upcoming.map(pendingRow).join("") : `<div class="empty-state">Henüz beklenen alacak veya yaklaşan ödeme yok.</div>`}</div>
    </section>

    <section class="card">
      <div class="section-head"><div><h2>Son hareketler</h2><p>Son 4 hareket. Detay için tümünü aç.</p></div><button class="tiny-button" data-action="open-movements" type="button">Tümü</button></div>
      <div class="expense-list">${recent.length ? recent.map(entryRow).join("") : `<div class="empty-state">Kasa boş. İlk hareketi ekleyerek başlayalım.</div>`}</div>
    </section>
  `;
}

function renderAdd() {
  if ((state.addTab || "entry") === "statement") return renderStatementAdd();
  const type = entryTypes.find((item) => item.id === draft.type) || entryTypes[0];
  const amountValue = draft.amountInput || "";
  const dateLabel = { expense: "Gider tarihi", income: "Gelir tarihi", receivable: "Beklenen gelir tarihi", payable: "Beklenen ödeme tarihi" }[type.id];
  const headingLabel = type.id === "income" || type.id === "receivable" ? "Gelir başlığı" : "Gider başlığı";
  const headingPlaceholder = "Başlık yaz";
  const shortPlaceholder = "Kısa isim";
  const notePlaceholder = "Açıklama";
  return `
    <section class="segmented">
      <button class="segment active" data-add-tab="entry" type="button">Hareket</button>
      <button class="segment" data-add-tab="statement" type="button">Ekstre</button>
      <button class="segment" data-action="open-headings" type="button">Başlık</button>
    </section>
    <form class="form-card form-grid" id="entryForm">
      <div class="section-head"><div><h2>${type.label} hareketi ekle</h2><p>${activeProject().name} içine kayıt düşer.</p></div></div>
      <div class="type-grid">${entryTypes.map((item) => `<button class="type-chip ${draft.type === item.id ? "selected" : ""}" data-entry-type="${item.id}" type="button"><span>${item.emoji}</span>${item.label}</button>`).join("")}</div>
      <input type="hidden" name="userId" value="${currentUser()?.id || ""}" />
      <div><label class="field-label" for="amount">Tutar</label><input class="amount-input" id="amount" name="amount" inputmode="numeric" placeholder="1.000" value="${amountValue}" autocomplete="off" /></div>
      <div class="grid-2 currency-grid ${draft.currency === "TRY" ? "single" : ""}">
        <label><span class="field-label">Para birimi</span><select class="select-input" name="currency">${currencyOptions.map((item) => `<option value="${item.code}" ${draft.currency === item.code ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>
        <label class="fx-rate-field ${draft.currency === "TRY" ? "is-hidden" : ""}"><span class="field-label">Kur</span><input class="select-input" name="exchangeRate" inputmode="decimal" placeholder="32,50" value="${draft.exchangeRate || 1}" autocomplete="off" /></label>
      </div>
      <div class="grid-2 timing-grid ${type.id === "expense" ? "" : "single"}">
        <label><span class="field-label">${dateLabel}</span><input class="select-input" name="date" type="date" value="${draft.date || todayKey()}" /><span class="field-help">Her kayıt sonrası tarih tekrar bugüne döner.</span></label>
        ${
          type.id === "expense"
            ? `<label><span class="field-label">Hesaplaşma</span><select class="select-input" name="settlement"><option value="in" ${draft.settlement === "in" ? "selected" : ""}>Dahil</option><option value="out" ${draft.settlement === "out" ? "selected" : ""}>Dahil değil</option></select></label>`
            : `<input type="hidden" name="settlement" value="out" />`
        }
      </div>
      <div><label class="field-label" for="headingName">${headingLabel}</label><input class="text-input" id="headingName" name="headingName" placeholder="${headingPlaceholder}" autocomplete="off" />${headingAutocompleteHtml(type.id)}</div>
      <div><label class="field-label" for="shortName">Kısa isim / lakap</label><input class="text-input" id="shortName" name="shortName" placeholder="${shortPlaceholder}" autocomplete="off" /></div>
      <div><span class="field-label">Emoji</span><div class="chips">${emojiOptionsFor(type.id).map((emoji) => `<button class="emoji-chip ${draft.emoji === emoji ? "selected" : ""}" data-chip="emoji" data-value="${emoji}" type="button">${emoji}</button>`).join("")}</div></div>
      ${
        ["income", "expense"].includes(type.id)
          ? `<details class="soft-details"><summary>Bildirim oyunu</summary><div class="form-grid notification-options"><label><span class="field-label">Bildirim modu</span><select class="select-input" name="notificationMode"><option value="open" ${draft.notificationMode === "open" ? "selected" : ""}>Açık bildir</option><option value="surprise" ${draft.notificationMode === "surprise" ? "selected" : ""}>Sürpriz tahmin</option><option value="silent" ${draft.notificationMode === "silent" ? "selected" : ""}>Sessiz kaydet</option></select></label>${mediaHubHtml()}${reactionSetupHtml()}</div></details>`
          : `<input type="hidden" name="notificationMode" value="silent" />${mediaHubHtml()}`
      }
      <label><span class="field-label">Not (opsiyonel)</span><input class="text-input" name="note" placeholder="${notePlaceholder}" autocomplete="off" /><span class="field-help">Hesaba katılmaz; sadece hareket açıklaması olarak saklanır.</span></label>
      <button class="primary-button" type="submit">Kaydet</button>
    </form>
  `;
}

/* Product pass: personal kasa first, budgets secondary, simpler movement flow. */

const kasaEntryTypes = [
  { id: "expense", label: "Gider", emoji: "💸", helper: "Para çıktıysa ya da ileri tarihli ödemeyse." },
  { id: "income", label: "Gelir", emoji: "💰", helper: "Para girdiyse ya da ileri tarihli beklenen gelirse." },
];

function viewLabel(view) {
  const labels = {
    home: "Kasa",
    movements: "Hareketler",
    group: "Bütçeler",
    calendar: "Takvim",
    report: "Rapor",
    add: "Hareket ekle",
    notifications: "Bildirimler",
    headings: "Kategoriler",
  };
  return labels[view] || "Kasa";
}

function goToView(view, options = {}) {
  const previous = options.previousView || state.activeView || "home";
  if (previous !== view) state.previousView = previous;
  state.activeView = view;
  if (options.groupMode) state.groupMode = options.groupMode;
  if (options.memberId !== undefined) state.activeMemberProfileId = options.memberId;
  if (options.lockedEntryType !== undefined) state.lockedEntryType = options.lockedEntryType;
  if (options.addProjectId !== undefined) state.addProjectId = options.addProjectId;
  saveState();
  render();
}

function goBack() {
  const target = state.previousView && state.previousView !== state.activeView ? state.previousView : "home";
  state.activeView = target;
  state.previousView = target === "home" ? "" : "home";
  if (target !== "group") state.groupMode = state.groupMode === "member" ? "detail" : state.groupMode;
  saveState();
  render();
}

function backHeader() {
  const target = state.previousView && state.previousView !== state.activeView ? state.previousView : "home";
  const typeLabel = draft?.type === "income" ? "Gelir" : draft?.type === "expense" ? "Gider" : "";
  const trail =
    state.activeView === "add"
      ? `${viewLabel(target)} > Hareket ekle${typeLabel ? ` > ${typeLabel}` : ""}`
      : state.activeView === "group" && state.groupMode === "member"
        ? "Bütçeler > Üye"
        : `${viewLabel(target)} > ${viewLabel(state.activeView)}`;
  return `
    <div class="back-row smart-back">
      <button class="back-button" data-action="go-back" type="button" aria-label="${viewLabel(target)} ekranına dön">
        <span aria-hidden="true">‹</span>
        Geri: ${viewLabel(target)}
      </button>
      <small class="breadcrumb-trail">${trail}</small>
    </div>
  `;
}

function calculateTotals(entries = blockRawEntries()) {
  const done = entries.filter((entry) => entry.status === "done" && entryConfirmed(entry));
  const pending = entries.filter((entry) => entry.status === "pending");
  const income = sum(done.filter((entry) => entry.type === "income" || entry.type === "receivable"));
  const expense = sum(done.filter((entry) => entry.type === "expense" || entry.type === "payable"));
  const receivable = sum(pending.filter((entry) => entry.type === "income" || entry.type === "receivable"));
  const payable = sum(pending.filter((entry) => entry.type === "expense" || entry.type === "payable"));
  const actual = income - expense;
  const comfortable = income - expense + receivable - payable;
  return { income, expense, receivable, payable, actual, comfortable };
}

function entryBelongsToUser(entry, user = currentUser()) {
  if (!entry || !user) return false;
  const ids = Array.isArray(entry.splitWith) ? entry.splitWith : [];
  return entry.userId === user.id || entry.paidById === user.id || ids.includes(user.id);
}

function userCashEntries(user = currentUser()) {
  if (!user) return [];
  return (state.entries || []).filter((entry) => (entry.userId === user.id || entry.paidById === user.id) && entryVisibleForCurrentUser(entry));
}

function userVisibleEntries(user = currentUser()) {
  if (!user) return [];
  return (state.entries || []).filter((entry) => entryBelongsToUser(entry, user) && entryVisibleForCurrentUser(entry));
}

function projectEntriesForUser(project, user = currentUser()) {
  if (!project || !user) return [];
  return (state.entries || []).filter((entry) => entry.projectId === project.id && entryBelongsToUser(entry, user) && entryVisibleForCurrentUser(entry));
}

function notificationEntries() {
  const user = currentUser();
  if (!user) return [];
  return (state.notifications || [])
    .filter((item) => Array.isArray(item.recipients) && item.recipients.includes(user.id))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function pendingSurpriseCountForUser(user = currentUser()) {
  if (!user) return 0;
  return (state.entries || []).filter((entry) => entryBelongsToUser(entry, user) && entry.status === "done" && entry.lockedNotificationId && !entryConfirmed(entry)).length;
}

function entryShareForUser(entry, userId) {
  const ids = Array.isArray(entry.splitWith) ? entry.splitWith : [];
  const ratios = Array.isArray(entry.splitRatio) ? entry.splitRatio : [];
  const index = ids.indexOf(userId);
  if (index === -1) return 0;
  const fallback = ids.length ? 1 / ids.length : 1;
  return Number(entry.amount || 0) * Number(ratios[index] || fallback);
}

function projectImpactForUser(project, user = currentUser()) {
  const entries = projectEntriesForUser(project, user);
  const totals = calculateTotals(entries.filter((entry) => entry.userId === user?.id || entry.paidById === user?.id));
  const confirmed = entries.filter((entry) => entry.status === "done" && entryConfirmed(entry));
  const paid = sum(confirmed.filter((entry) => entry.type === "expense" && (entry.paidById === user?.id || entry.userId === user?.id)));
  const share = confirmed
    .filter((entry) => entry.type === "expense")
    .reduce((total, entry) => total + entryShareForUser(entry, user?.id), 0);
  return { totals, settlementNet: paid - share, count: entries.length };
}

function projectImpactRows() {
  const user = currentUser();
  if (!user || !state.projects.length) return `<div class="empty-state">Henüz bütçe yok.</div>`;
  return state.projects
    .map((project) => {
      const impact = projectImpactForUser(project, user);
      const members = state.users.filter((item) => project.memberIds.includes(item.id));
      return `
        <button class="budget-impact-row" data-action="activate-project-detail" data-id="${project.id}" type="button">
          ${projectPhotoHtml(project, "project-thumb")}
          <span class="budget-impact-main">
            <strong>${project.name}</strong>
            <small>${project.purpose || "Genel bütçe"} · ${members.length} üye · ${impact.count} hareket</small>
            <span class="member-bullets inline-bullets">${members.map((member) => `<i>${projectUserLabel(member, project)}</i>`).join("")}</span>
          </span>
          <span class="budget-impact-money ${impact.totals.comfortable >= 0 ? "positive" : "warning"}">${money(impact.totals.comfortable)}</span>
        </button>
      `;
    })
    .join("");
}

function entryProjectName(entry) {
  return state.projects.find((project) => project.id === entry.projectId)?.name || "Kasa";
}

function entrySummaryRow(entry) {
  const isIncome = entry.type === "income" || entry.type === "receivable";
  const locked = entry.lockedNotificationId && !entryConfirmed(entry);
  return `
    <div class="expense-row movement-card-row">
      <span class="emoji-dot">${isIncome ? "💰" : "💸"}</span>
      <div class="expense-main">
        <p class="expense-title">${locked ? "Tahmin oyunu açık" : entryTitle(entry)}</p>
        <p class="expense-meta">${entryProjectName(entry)} · ${formatShortDate(entry.date)}${entry.status === "pending" ? " · planlandı" : ""}</p>
      </div>
      <strong class="expense-price ${isIncome ? "price-positive" : "price-negative"}">${locked ? "??" : `${isIncome ? "+" : "-"}${money(entry.amount)}`}</strong>
    </div>
  `;
}

function pendingRowsForUser(kind) {
  const typeIsIncome = kind === "receivable";
  const entries = userVisibleEntries()
    .filter((entry) => entry.status === "pending")
    .filter((entry) => (typeIsIncome ? entry.type === "income" || entry.type === "receivable" : entry.type === "expense" || entry.type === "payable"))
    .sort(byDateAsc);
  return entries.length ? entries.map(entrySummaryRow).join("") : `<div class="empty-state">Bu alanda kayıt yok.</div>`;
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
          <p>${state.cloudSyncAt ? `Senkron tamam: ${new Date(state.cloudSyncAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}` : "Kendi paran ve bağlı bütçeler tek yerde."}</p>
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
      <article class="stat-card"><p class="stat-label">Gelir</p><p class="stat-value positive">${money(totals.income)}</p></article>
      <article class="stat-card"><p class="stat-label">Gider</p><p class="stat-value warning">${money(totals.expense)}</p></article>
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

function renderAdd() {
  const targetProjectId = state.addProjectId || state.activeProjectId || state.projects[0]?.id || "";
  const targetProject = state.projects.find((project) => project.id === targetProjectId) || activeProject();
  const type = kasaEntryTypes.find((item) => item.id === draft.type) || kasaEntryTypes[0];
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
        ${kasaEntryTypes
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

function settlePending(id) {
  const entry = (state.entries || []).find((item) => item.id === id);
  if (!entry || entry.status !== "pending") return;
  entry.status = "done";
  entry.date = todayKey();
  entry.rateLockedAt = entry.rateLockedAt || blockNow();
  saveState();
  render();
  toast(entry.type === "income" || entry.type === "receivable" ? "Gelir gerçekleşti." : "Gider gerçekleşti.");
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
    return `
      <div class="notification-card member-notification">
        <div class="notification-hero member-added-pulse">+</div>
        <div class="expense-main">
          <p class="expense-title">Yeni kişi eklendi</p>
          <p class="expense-meta">${notification.title} · ${project?.name || "Bütçe"} · ${relativeDate(notification.createdAt)}</p>
        </div>
      </div>
    `;
  }

  if (isReaction) {
    return `
      <div class="notification-card reaction-notification">
        <div class="notification-hero pop-emoji">${notification.reactionEmoji || "👀"}</div>
        <div class="expense-main">
          <p class="expense-title">${projectUserLabel(actor, project)} tepki verdi</p>
          <p class="expense-meta">${notification.title}</p>
        </div>
      </div>
    `;
  }

  if (!isSurprise) {
    return `
      <div class="notification-card">
        <div class="notification-hero">${media}</div>
        <div class="expense-main">
          <p class="expense-title">${projectUserLabel(actor, project)} ${typeLabel} ekledi</p>
          <p class="expense-meta">${notification.title} · ${money(notification.amount)} · ${project?.name || "Bütçe"} · ${relativeDate(notification.createdAt)}</p>
        </div>
      </div>
    `;
  }

  if (guess && completed) {
    const correct = Boolean(guess.isCorrect ?? guess.correct);
    const ownerText = onayText(actor, correct);
    return `
      <div class="notification-card ${correct ? "guess-correct" : "guess-wrong"}">
        <div class="notification-hero">${mediaPreviewHtml(notificationReactionMedia(notification, guess), correct ? "✅" : "🙂")}</div>
        <div class="expense-main">
          <p class="expense-title">${correct ? "Kestirdin! +10 puan" : "Tahmin tutmadı"}</p>
          <p class="expense-meta">${ownerText} Gerçek: ${typeLabel} · ${money(notification.amount)} · ${project?.name || "Bütçe"}</p>
          <div class="reaction-result ${correct ? "correct confetti-burst" : "wrong shake-once"}">
            <span>${correct ? "Doğru tahmin" : "Yanlış tahmin"}</span>
            <span class="reaction-media">${mediaPreviewHtml(notificationReactionMedia(notification, guess), correct ? "✅" : "🙂")}</span>
          </div>
        </div>
      </div>
    `;
  }

  if (guess && !completed) {
    return `
      <div class="notification-card surprise-locked">
        <div class="notification-hero">?</div>
        <div class="expense-main">
          <p class="expense-title">Tahmin kaydedildi</p>
          <p class="expense-meta">Detay herkes tahmin edince veya süre dolunca açılacak.</p>
        </div>
      </div>
    `;
  }

  if (completed) {
    return `
      <div class="notification-card">
        <div class="notification-hero">${media}</div>
        <div class="expense-main">
          <p class="expense-title">Tahmin sonucu</p>
          <p class="expense-meta">Gerçek: ${typeLabel} · ${notification.title} · ${money(notification.amount)}</p>
        </div>
      </div>
    `;
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
          <input class="text-input guess-amount" name="predictedAmount" inputmode="numeric" placeholder="Tutar tahmini" autocomplete="off" />
        </form>
      </div>
    </div>
  `;
}

function periodStart(date, period) {
  const clone = startOfDay(date);
  if (period === "day") return clone;
  if (period === "week") {
    const day = clone.getDay() || 7;
    clone.setDate(clone.getDate() - day + 1);
    return clone;
  }
  clone.setDate(1);
  return clone;
}

function addPeriod(date, period, amount) {
  const clone = new Date(date);
  if (period === "day") clone.setDate(clone.getDate() + amount);
  else if (period === "week") clone.setDate(clone.getDate() + amount * 7);
  else clone.setMonth(clone.getMonth() + amount);
  return clone;
}

function entriesForPeriod(entries, period, offset = 0) {
  const start = addPeriod(periodStart(dateFromKey(todayKey()), period), period, offset);
  const end = addPeriod(start, period, 1);
  return entries.filter((entry) => {
    const date = dateFromKey(entry.date);
    return date >= start && date < end;
  });
}

function periodTitle(period, offset = 0) {
  const names = { day: "gün", week: "hafta", month: "ay" };
  if (offset === 0) return `Bu ${names[period]}`;
  return `Geçen ${names[period]}`;
}

function renderMovements() {
  const period = state.movementPeriod || "month";
  const baseEntries = userVisibleEntries().sort(byDateDesc);
  const entries = period === "all" ? baseEntries : entriesForPeriod(baseEntries, period);
  return `
    <section class="card">
      <div class="section-head"><div><h2>Hareketler</h2><p>Günlük, haftalık, aylık veya tüm kayıtlar.</p></div><button class="tiny-button" data-action="go-add-movement" type="button">Hareket ekle</button></div>
      <div class="segmented segmented-four">
        <button class="segment ${period === "day" ? "active" : ""}" data-movement-period="day" type="button">Gün</button>
        <button class="segment ${period === "week" ? "active" : ""}" data-movement-period="week" type="button">Hafta</button>
        <button class="segment ${period === "month" ? "active" : ""}" data-movement-period="month" type="button">Ay</button>
        <button class="segment ${period === "all" ? "active" : ""}" data-movement-period="all" type="button">Tümü</button>
      </div>
      <div class="expense-list">${entries.length ? entries.map(entrySummaryRow).join("") : `<div class="empty-state">Bu aralıkta hareket yok.</div>`}</div>
    </section>
  `;
}

function reportRows(entries) {
  const map = new Map();
  entries.forEach((entry) => {
    const key = entryTitle(entry);
    const item = map.get(key) || { title: key, income: 0, expense: 0 };
    if (entry.type === "income" || entry.type === "receivable") item.income += Number(entry.amount || 0);
    else item.expense += Number(entry.amount || 0);
    map.set(key, item);
  });
  const rows = [...map.values()].sort((a, b) => b.expense + b.income - (a.expense + a.income));
  if (!rows.length) return `<div class="empty-state">Rapor için hareket yok.</div>`;
  return rows
    .map((row) => `<div class="receipt-line"><span>${row.title}</span><strong>${row.income ? `+${money(row.income)}` : ""}${row.income && row.expense ? " / " : ""}${row.expense ? `-${money(row.expense)}` : ""}</strong></div>`)
    .join("");
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
      <div class="segmented">
        <button class="segment ${period === "day" ? "active" : ""}" data-period="day" type="button">Gün</button>
        <button class="segment ${period === "week" ? "active" : ""}" data-period="week" type="button">Hafta</button>
        <button class="segment ${period === "month" ? "active" : ""}" data-period="month" type="button">Ay</button>
      </div>
      <div class="grid-2 report-grid">
        <article class="stat-card"><p class="stat-label">Gelir</p><p class="stat-value positive">${money(totals.income)}</p></article>
        <article class="stat-card"><p class="stat-label">Gider</p><p class="stat-value warning">${money(totals.expense)}</p></article>
      </div>
      <div class="report-compare-card ${diff >= 0 ? "positive-soft" : "warning-soft"}">
        <strong>${diff >= 0 ? "+" : ""}${money(diff)}</strong>
        <span>${label} net fark. Pozitif değer geçen döneme göre kasada daha iyi net alan demek.</span>
      </div>
    </section>
    <section class="card receipt-card" id="receiptCard">
      <div class="receipt-header receipt-header-stacked"><strong>KASAM FİŞİ</strong><span>${new Date().toLocaleDateString("tr-TR")}</span></div>
      ${reportRows(currentEntries)}
      ${exchangeReceiptLines(currentEntries)}
      <div class="receipt-line total"><span>Net</span><strong>${money(totals.actual)}</strong></div>
      <p class="receipt-watermark">kasam.app</p>
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
    cells.push(`
      <div class="calendar-cell ${key === todayKey() ? "today" : ""}">
        <strong>${day}</strong>
        ${items.slice(0, 2).map((entry) => `<span class="${entry.type === "income" || entry.type === "receivable" ? "cal-in" : "cal-out"}">${entryTitle(entry)}</span>`).join("")}
        ${items.length > 2 ? `<em>+${items.length - 2}</em>` : ""}
      </div>
    `);
  }
  return `<div class="calendar-weekdays">${labels.map((label) => `<span>${label}</span>`).join("")}</div><div class="calendar-grid">${cells.join("")}</div>`;
}

function renderCalendar() {
  const base = state.calendarMonth ? dateFromKey(`${state.calendarMonth}-01`) : new Date();
  const monthText = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" }).format(base);
  const entries = userVisibleEntries().filter((entry) => entry.status === "pending").sort(byDateAsc).slice(0, 6);
  return `
    <section class="card desk-calendar-card">
      <div class="calendar-top">
        <button class="tiny-button" data-action="month-prev" type="button">Önceki</button>
        <div><p class="eyebrow">Takvim</p><h2>${monthText}</h2></div>
        <button class="tiny-button" data-action="month-next" type="button">Sonraki</button>
      </div>
      <div class="desk-calendar" data-flip="${state.calendarFlip || 0}">${calendarGridHtml(base)}</div>
    </section>
    <section class="card">
      <div class="section-head"><div><h2>Planlananlar</h2><p>İleri tarihli gelir, gider ve taksitler.</p></div></div>
      <div class="expense-list">${entries.length ? entries.map(entrySummaryRow).join("") : `<div class="empty-state">Takvime bağlı plan yok.</div>`}</div>
    </section>
  `;
}

function changeCalendarMonth(offset) {
  const base = state.calendarMonth ? dateFromKey(`${state.calendarMonth}-01`) : new Date();
  base.setMonth(base.getMonth() + offset);
  state.calendarMonth = `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}`;
  state.calendarFlip = Number(state.calendarFlip || 0) + 1;
  saveState();
  render();
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
        <div class="project-card-title">
          ${projectPhotoHtml(project)}
          <div><h2>${project.name}</h2><p>${project.purpose || "Genel bütçe"} · ${projectCode(project)}</p></div>
        </div>
        <button class="tiny-button" data-action="open-projects-list" type="button">Bütçeler</button>
      </div>
      ${
        canManageUsers
          ? `<form class="inline-form project-photo-form" id="projectPhotoForm"><label class="photo-pick compact-pick"><span data-file-label>Bütçe resmi</span><strong>Seç</strong><input name="projectPhoto" type="file" accept="image/*" /></label><button class="secondary-button" type="submit">Resmi kaydet</button></form>`
          : ""
      }
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
      ${
        canManageUsers
          ? `<form class="inline-form featured-form" id="projectUserForm"><input class="text-input" name="userName" placeholder="${cloudReady ? "mail@ornek.com" : "Kullanıcı adı"}" autocomplete="${cloudReady ? "email" : "off"}" /><button class="primary-button" type="submit">Bütçeye ekle</button></form>`
          : `<div class="empty-state" style="margin-top:12px;">Sadece bütçe sahibi ekleme yapabilir.</div>`
      }
    </section>
    <section class="card">
      <div class="section-head"><div><h2>Erişim</h2><p>${cloudReady ? "Bu kod başka telefondan aynı bütçeye katılmak için kullanılır." : "Yerel denemede kullanıcılar bu cihazda tutulur."}</p></div></div>
      <div class="invite-box"><div><span class="field-label">Kod</span><strong>${projectCode(project)}</strong><p>${inviteLink(project)}</p></div><button class="mini-action" data-action="copy-project-link" type="button">Kopyala</button></div>
    </section>
    <section class="card">
      <h2>Üyeler</h2>
      <div class="expense-list" style="margin-top:12px;">${activeMembers().map(userLinkRow).join("") || `<div class="empty-state">Bu bütçede üye yok.</div>`}</div>
    </section>
    <section class="card">
      <div class="section-head"><div><h2>Borç & alacak</h2><p>${state.settlementVisible ? "Minimum transfer listesi görünür." : "Şu an gizli."}</p></div><button class="tiny-button" data-action="toggle-settlement" type="button">${state.settlementVisible ? "Gizle" : "Göster"}</button></div>
      ${
        state.settlementVisible
          ? `<div style="margin-top:10px;">${balances.length ? balances.map(balanceRow).join("") : `<div class="empty-state">Hesaplaşmaya dahil gider yok.</div>`}</div><div style="margin-top:12px;">${transferRows(transfers)}</div>`
          : `<div class="empty-state" style="margin-top:12px;">Açınca kim kime ne kadar göndermeli görünür.</div>`
      }
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
    if (button.dataset.addTab) {
      state.addTab = button.dataset.addTab;
      state.lockedEntryType = "";
      saveState();
      render();
      return;
    }
    if (button.dataset.period) {
      state.reportPeriod = button.dataset.period;
      saveState();
      render();
      return;
    }
    if (button.dataset.movementPeriod) {
      state.movementPeriod = button.dataset.movementPeriod;
      saveState();
      render();
      return;
    }
    if (action === "go-back") return goBack();
    if (action === "go-add-movement" || action === "go-add") {
      draft.type = "expense";
      draft.emoji = "💸";
      draft.userId = currentUser()?.id || "";
      draft.date = todayKey();
      draft.amountInput = "";
      state.addProjectId = button.dataset.projectId || state.activeProjectId || state.projects[0]?.id || "";
      goToView("add");
      return;
    }
    if (action === "go-add-income" || action === "go-add-expense") {
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
    if (action === "activate-project" || action === "activate-project-detail") {
      state.activeProjectId = button.dataset.id;
      draft = makeDraft();
      goToView("group", { groupMode: "detail" });
      return;
    }
    if (action === "open-member-profile") {
      state.activeMemberProfileId = button.dataset.id;
      return goToView("group", { groupMode: "member" });
    }
    if (action === "close-member-profile") {
      state.groupMode = "detail";
      state.activeMemberProfileId = "";
      saveState();
      render();
      return;
    }
    if (action === "month-prev") return changeCalendarMonth(-1);
    if (action === "month-next") return changeCalendarMonth(1);
    if (action === "show-pending-detail") {
      state.pendingDetail = button.dataset.detail;
      saveState();
      render();
      return;
    }
    if (action === "hide-pending-detail") {
      state.pendingDetail = "";
      saveState();
      render();
      return;
    }
    if (action === "toggle-settlement") {
      state.settlementVisible = !state.settlementVisible;
      saveState();
      render();
      return;
    }
    if (action === "select-template") {
      state.selectedTemplateId = state.selectedTemplateId === button.dataset.id ? "" : button.dataset.id;
      saveState();
      render();
      return;
    }
    if (action === "copy-project-link") return copyProjectInvite();
    if (action === "share-receipt") return shareReceipt();
    if (action === "settle-pending") return settlePending(button.dataset.id);
    if (action === "toggle-reaction-picker") {
      state.reactionPickerEntryId = state.reactionPickerEntryId === button.dataset.id ? "" : button.dataset.id;
      saveState();
      render();
      return;
    }
    if (action === "set-reaction") {
      setReaction(button.dataset.id, button.dataset.emoji);
      state.reactionPickerEntryId = "";
      saveState();
      render();
      toast("Tepki eklendi.");
      return;
    }
    if (action === "show-reconciliation") {
      state.reconciliationDetailId = state.reconciliationDetailId === button.dataset.id ? "" : button.dataset.id;
      saveState();
      render();
      return;
    }
    if (action === "settle-transfer") {
      const index = Number(button.dataset.index);
      const transfers = minimumTransfers(calculateBalances());
      const addToKasa = Boolean(app.querySelector(`[data-cash-transfer="${index}"]`)?.checked);
      settleTransfer(transfers[index], addToKasa);
      saveState();
      render();
      toast(addToKasa ? "Ödendi ve kasaya işlendi." : "Ödendi işaretlendi.");
      return;
    }
    if (action === "auth-mode") {
      state.authMode = button.dataset.mode === "signup" ? "signup" : "login";
      saveState();
      render();
      return;
    }
    if (action === "logout") {
      try { if (typeof isCloudReady === "function" && isCloudReady()) await cloudSignOut(); } catch (error) { toast(friendlyCloudError(error)); }
      state.signedInUserId = "";
      state.activeUserId = "";
      state.activeView = "home";
      state.authMode = "login";
      draft = makeDraft();
      saveState();
      render();
      toast("Çıkış yapıldı.");
    }
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

  const forms = {
    accountForm: handleAccountForm,
    loginForm: handleLoginForm,
    firstProjectForm: handleFirstProjectForm,
    joinProjectForm: handleJoinProjectForm,
    statementForm: bindStatementForm,
    goalForm: handleGoalSubmit,
    projectUserForm: handleProjectUserForm,
    userForm: handleProjectUserForm,
    projectForm: handleProjectForm,
    memberProfileForm: handleMemberProfileForm,
    ownProfileForm: handleOwnProfileForm,
    projectPhotoForm: handleProjectPhotoForm,
  };
  Object.entries(forms).forEach(([id, handler]) => {
    const form = app.querySelector(`#${id}`);
    if (!form) return;
    if (id === "statementForm") return handler(form);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await handler(form);
    });
  });
  const entryForm = app.querySelector("#entryForm");
  if (entryForm) bindEntryForm(entryForm);
}

var __kasaProductFns = {
  bindEntryForm,
  bindScreen,
  calendarGridHtml,
  changeCalendarMonth,
  handleEntrySubmit,
  headingAutocompleteHtml,
  notificationRow,
  projectSummaryRow,
  renderAdd,
  renderCalendar,
  renderGroup,
  renderHome,
  renderProjectList,
  renderProjectSetup,
  renderReport,
};

function headingRow(heading) {
  return `
    <div class="expense-row">
      <div class="expense-main">
        <p class="expense-title">${heading.name}</p>
        <p class="expense-meta">${entryCountForHeading(heading.id)} hareket</p>
      </div>
      <strong class="expense-price">${entryCountForHeading(heading.id)}</strong>
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
          <div class="bar-text"><span>${heading.shortName || heading.name}</span><span>${money(heading.total)}</span></div>
          <div class="bar-bg"><div class="bar-fill" style="width: ${percent}%"></div></div>
        </div>
      `;
    })
    .join("");
}

function renderCalendar() {
  const tab = state.calendarTab || "calendar";
  const monthValue = state.calendarMonth || monthKey();
  const baseDate = new Date(`${monthValue}-01T12:00:00`);
  const monthLabel = baseDate.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
  return `
    <section class="segmented">
      <button class="segment ${tab === "calendar" ? "active" : ""}" data-calendar-tab="calendar" type="button">Takvim</button>
      <button class="segment ${tab === "goals" ? "active" : ""}" data-calendar-tab="goals" type="button">Hedefler</button>
      <button class="segment" data-action="go-add-payable" type="button">Ödeme</button>
    </section>
    ${
      tab === "goals"
        ? renderGoalSection()
        : `
          <section class="card desk-calendar-card">
            <div class="calendar-top">
              <button class="tiny-button" data-action="calendar-prev" type="button">Önceki</button>
              <div><h2>${monthLabel}</h2><p>Masaüstü takvim görünümü.</p></div>
              <button class="tiny-button" data-action="calendar-next" type="button">Sonraki</button>
            </div>
            <div class="desk-calendar flip-${state.calendarFlip || 0}">
              ${calendarGridHtml(baseDate)}
            </div>
          </section>
        `
    }
  `;
}

function calendarGridHtml(baseDate) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const labels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
  const cells = [];
  for (let index = 0; index < startOffset; index += 1) cells.push(`<div class="calendar-cell muted"></div>`);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const items = visibleProjectEntries().filter((entry) => entry.date === key);
    cells.push(`
      <div class="calendar-cell ${key === todayKey() ? "today" : ""}">
        <strong>${day}</strong>
        ${items.slice(0, 2).map((entry) => `<span class="${entry.type === "income" || entry.type === "receivable" ? "cal-in" : "cal-out"}">${entryTitle(entry)}</span>`).join("")}
        ${items.length > 2 ? `<em>+${items.length - 2}</em>` : ""}
      </div>
    `);
  }
  return `<div class="calendar-weekdays">${labels.map((label) => `<span>${label}</span>`).join("")}</div><div class="calendar-grid">${cells.join("")}</div>`;
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
        <div class="project-card-title">
          ${projectPhotoHtml(project)}
          <div><h2>${project.name}</h2><p>${project.purpose || "Genel kasa"} · ${projectCode(project)}</p></div>
        </div>
        <button class="tiny-button" data-action="open-projects-list" type="button">Projelerim</button>
      </div>
      ${
        canManageUsers
          ? `<form class="inline-form project-photo-form" id="projectPhotoForm"><label class="photo-pick compact-pick"><span data-file-label>Proje resmi</span><strong>Seç</strong><input name="projectPhoto" type="file" accept="image/*" /></label><button class="secondary-button" type="submit">Proje resmini kaydet</button></form>`
          : ""
      }
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
      <h2>Projeye kişi ekle</h2>
      <p>${canManageUsers ? (cloudReady ? `E-posta ile hesap açmış kişiyi kasaya ekle.` : `Bu cihazda açılmış kullanıcı adını yaz.`) : `Kullanıcı eklemek için ${projectUserLabel(owner)} hesabıyla giriş yap.`}</p>
      ${
        canManageUsers
          ? `<form class="inline-form featured-form" id="projectUserForm"><input class="text-input" name="userName" placeholder="${cloudReady ? "mail@ornek.com" : "Kullanıcı adı"}" autocomplete="${cloudReady ? "email" : "off"}" /><button class="primary-button" type="submit">Kasaya ekle</button></form>`
          : `<div class="empty-state" style="margin-top:12px;">Sadece kasa sahibi ekleme yapabilir.</div>`
      }
    </section>
    <section class="card">
      <div class="section-head"><div><h2>Proje erişimi</h2><p>${cloudReady ? "Bu kod başka telefondan aynı kasaya katılmak için kullanılır." : "Yerel denemede kullanıcılar bu cihazda tutulur."}</p></div></div>
      <div class="invite-box"><div><span class="field-label">Kod</span><strong>${projectCode(project)}</strong><p>${inviteLink(project)}</p></div><button class="mini-action" data-action="copy-project-link" type="button">Kopyala</button></div>
    </section>
    <section class="card">
      <h2>Kasa kullanıcıları</h2>
      <div class="expense-list" style="margin-top:12px;">${activeMembers().map(userLinkRow).join("") || `<div class="empty-state">Bu projede üye yok.</div>`}</div>
    </section>
    <section class="card">
      <div class="section-head"><div><h2>Borç & alacak</h2><p>${state.settlementVisible ? "Minimum transfer listesi görünür." : "Şu an gizli."}</p></div><button class="tiny-button" data-action="toggle-settlement" type="button">${state.settlementVisible ? "Gizle" : "Göster"}</button></div>
      ${
        state.settlementVisible
          ? `<div style="margin-top:10px;">${balances.length ? balances.map(balanceRow).join("") : `<div class="empty-state">Hesaplaşmaya dahil gider yok.</div>`}</div><div style="margin-top:12px;">${transferRows(transfers)}</div>`
          : `<div class="empty-state" style="margin-top:12px;">Açınca kim kime ne kadar göndermeli görünür.</div>`
      }
    </section>
  `;
}

function renderProjectList() {
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();
  return `
    <section class="card">
      <div class="section-head"><div><h2>Projelerim</h2><p>Projeyi seç; detaylar proje içinde düzenlenir.</p></div></div>
      <div class="project-list">${state.projects.map(projectSummaryRow).join("") || `<div class="empty-state">Henüz proje yok.</div>`}</div>
    </section>
    <section class="card">
      <h2>Yeni proje oluştur</h2>
      <form class="inline-form" id="projectForm">
        <input class="text-input" name="projectName" placeholder="Yeni proje adı" autocomplete="off" />
        <input class="text-input" name="purpose" list="purposeList" placeholder="Kasa amacı" autocomplete="off" />
        <datalist id="purposeList">${purposeOptions.map((purpose) => `<option value="${purpose}"></option>`).join("")}</datalist>
        <span class="field-label">Şablondan başla</span>
        ${templateOptionsHtml(state.selectedTemplateId)}
        <button class="primary-button" type="submit">Proje ekle</button>
      </form>
      ${cloudReady ? `<form class="inline-form cloud-join-card" id="joinProjectForm"><input class="text-input" name="projectCode" placeholder="Kasa kodu" autocomplete="off" /><button class="secondary-button" type="submit">Kodla katıl</button></form>` : ""}
    </section>
  `;
}

function renderMemberProfile() {
  const project = activeProject();
  const user = state.users.find((item) => item.id === state.activeMemberProfileId);
  if (!user) return `<section class="card"><div class="empty-state">Kullanıcı bulunamadı.</div></section>`;
  const canManage = isProjectOwner(project);
  const alias = projectAliasFor(user.id, project);
  const memberPhoto = project?.memberPhotos?.[user.id];
  return `
    <section class="card member-profile-page">
      <div class="section-head">
        <div class="project-card-title">
          ${memberAvatarHtml(user, project, "profile-avatar")}
          <div><h2>${profileLabel(user)}</h2><p>${user.name}${user.email ? ` · ${user.email}` : ""}</p></div>
        </div>
        <button class="tiny-button" data-action="close-member-profile" type="button">Kasa</button>
      </div>
      <div class="profile-split">
        <div><span class="field-label">Kendi profili</span><p>Ad, e-posta ve kendi profil resmi tüm projelerde aynı kalır.</p></div>
        <div><span class="field-label">Bu kasadaki görünüm</span><p>${alias ? `Lakap: ${alias}` : "Lakap yok"}${memberPhoto?.photoData ? " · kasa resmi var" : ""}</p></div>
      </div>
      ${
        canManage
          ? `<form class="form-grid" id="memberProfileForm" data-id="${user.id}">
              <label><span class="field-label">Bu kasadaki lakap</span><input class="text-input" name="alias" value="${alias}" placeholder="Lakap" autocomplete="off" /></label>
              <label class="photo-pick compact-pick"><span data-file-label>Bu kasadaki kişi resmi</span><strong>Seç</strong><input name="memberPhoto" type="file" accept="image/*" /></label>
              <button class="primary-button" type="submit">Kasa profilini kaydet</button>
            </form>`
          : `<div class="empty-state">Kasa içi lakap ve resmi sadece kasa sahibi düzenler.</div>`
      }
    </section>
  `;
}

function userLinkRow(user) {
  const project = activeProject();
  const isOwner = user.id === projectOwnerId(project);
  return `
    <button class="member-list-button" data-action="open-member-profile" data-id="${user.id}" type="button">
      ${memberAvatarHtml(user, project)}
      <span>
        <strong>${profileLabel(user)}</strong>
        <small>${isOwner ? "Kasa sahibi" : "Üye"}</small>
      </span>
    </button>
  `;
}

function notificationRow(notification) {
  const actor = state.users.find((user) => user.id === notification.actorId);
  const guess = notificationGuessFor(notification);
  const isSurprise = notification.mode === "surprise";
  const isReaction = notification.notificationType === "reaction";
  const isMember = notification.notificationType === "member";
  const typeLabel = notification.actualType === "income" ? "gelir" : notification.actualType === "expense" ? "gider" : "hareket";
  const media = mediaPreviewHtml(notificationMedia(notification));
  const completed = Boolean(notification.revealedAt || notification.isCompleted);

  if (isMember) {
    return `
      <div class="notification-card member-notification">
        <div class="notification-hero member-added-pulse">+</div>
        <div class="expense-main">
          <p class="expense-title">Yeni kişi eklendi</p>
          <p class="expense-meta">${notification.title} · ${projectUserLabel(actor)} ekledi · ${relativeDate(notification.createdAt)}</p>
        </div>
      </div>
    `;
  }

  if (isReaction) {
    return `
      <div class="notification-card reaction-notification">
        <div class="notification-hero pop-emoji">${notification.reactionEmoji || "👀"}</div>
        <div class="expense-main">
          <p class="expense-title">${projectUserLabel(actor)} tepki verdi</p>
          <p class="expense-meta">${notification.title}</p>
        </div>
      </div>
    `;
  }

  if (!isSurprise) {
    return `
      <div class="notification-card">
        <div class="notification-hero">${media}</div>
        <div class="expense-main">
          <p class="expense-title">${projectUserLabel(actor)} ${typeLabel} ekledi</p>
          <p class="expense-meta">${notification.title} · ${money(notification.amount)} · ${relativeDate(notification.createdAt)}</p>
        </div>
      </div>
    `;
  }

  if (guess && !completed) {
    return `
      <div class="notification-card surprise-locked">
        <div class="notification-hero">${media}</div>
        <div class="expense-main">
          <p class="expense-title">Tahmin kaydedildi</p>
          <p class="expense-meta">Detay herkes tahmin edince veya süre dolunca açılacak.</p>
        </div>
      </div>
    `;
  }

  if (guess && completed) {
    const correct = Boolean(guess.isCorrect ?? guess.correct);
    const ownerText = onayText(actor, correct);
    return `
      <div class="notification-card ${correct ? "guess-correct" : "guess-wrong"}">
        <div class="notification-hero">${mediaPreviewHtml(notificationReactionMedia(notification, guess), correct ? "✅" : "🙂")}</div>
        <div class="expense-main">
          <p class="expense-title">${correct ? "Kestirdin! +10 puan" : "Sürpriz geldi geçti."}</p>
          <p class="expense-meta">${ownerText} Gerçek: ${typeLabel} · ${money(notification.amount)} · kasa açıldı</p>
          <div class="reaction-result ${correct ? "correct confetti-burst" : "wrong shake-once"}">
            <span>${correct ? "Doğru tahmin" : "Yanlış tahmin"}</span>
            <span class="reaction-media">${mediaPreviewHtml(notificationReactionMedia(notification, guess), correct ? "✅" : "🙂")}</span>
          </div>
        </div>
      </div>
    `;
  }

  if (completed) {
    return `
      <div class="notification-card">
        <div class="notification-hero">${media}</div>
        <div class="expense-main">
          <p class="expense-title">Sürpriz açıldı</p>
          <p class="expense-meta">Gerçek: ${typeLabel} · ${notification.title} · ${money(notification.amount)}</p>
        </div>
      </div>
    `;
  }

  return `
    <div class="notification-card surprise-locked">
      <div class="notification-hero">?</div>
      <div class="expense-main">
        <p class="expense-title">Yeni tahmin var</p>
        <p class="expense-meta">${projectUserLabel(actor)} gönderdi · ${relativeDate(notification.createdAt)} · detay kapalı</p>
        <form class="guess-form" data-guess-form data-id="${notification.id}">
          <div class="guess-actions">
            <button class="mini-action" name="predictedType" value="income" type="submit">Gelir mi?</button>
            <button class="mini-action" name="predictedType" value="expense" type="submit">Gider mi?</button>
          </div>
          <input class="text-input guess-amount" name="predictedAmount" inputmode="numeric" placeholder="Tutar tahmini" autocomplete="off" />
        </form>
      </div>
    </div>
  `;
}

function bindScreen() {
  app.onclick = async (event) => {
    const button = event.target.closest("button");
    if (!button || !app.contains(button)) return;
    const action = button.dataset.action;
    if (button.dataset.addTab) {
      state.addTab = button.dataset.addTab;
      state.lockedEntryType = "";
      saveState();
      render();
      return;
    }
    if (button.dataset.calendarTab) {
      state.calendarTab = button.dataset.calendarTab;
      saveState();
      render();
      return;
    }
    if (button.dataset.period) {
      state.reportPeriod = button.dataset.period;
      saveState();
      render();
      return;
    }
    if (button.dataset.movementPeriod) {
      state.movementPeriod = button.dataset.movementPeriod;
      saveState();
      render();
      return;
    }
    if (button.dataset.entryType) {
      draft.type = button.dataset.entryType;
      draft.userId = currentUser()?.id || "";
      render();
      return;
    }
    if (button.dataset.suggestion) {
      const form = app.querySelector("#entryForm");
      if (form) form.elements.headingName.value = button.dataset.suggestion;
      return;
    }
    if (!action) return;
    if (action === "go-back") {
      if (state.activeView === "group" && state.groupMode === "member") {
        state.groupMode = "detail";
        state.activeMemberProfileId = "";
      } else if (state.previousView && state.previousView !== state.activeView) {
        state.activeView = state.previousView;
        state.previousView = "";
      } else {
        state.activeView = "home";
        state.groupMode = "list";
      }
      state.lockedEntryType = "";
      saveState();
      render();
    }
    if (action === "open-active-project") goToView("group", { groupMode: "detail" });
    if (action === "open-projects-list" || action === "open-group") goToView("group", { groupMode: action === "open-group" ? "detail" : "list" });
    if (action === "open-notifications") goToView("notifications");
    if (action === "open-movements") goToView("movements");
    if (action === "open-headings") goToView("headings");
    if (action === "go-add" || action === "go-add-expense") {
      draft = makeDraft();
      draft.type = "expense";
      draft.userId = currentUser()?.id || "";
      draft.date = todayKey();
      state.addTab = "entry";
      goToView("add", { lockedEntryType: "expense" });
    }
    if (action === "go-add-income") {
      draft = makeDraft();
      draft.type = "income";
      draft.userId = currentUser()?.id || "";
      draft.date = todayKey();
      state.addTab = "entry";
      goToView("add", { lockedEntryType: "income" });
    }
    if (action === "go-add-payable") {
      draft = makeDraft();
      draft.type = "payable";
      draft.userId = currentUser()?.id || "";
      draft.date = todayKey();
      state.addTab = "entry";
      goToView("add", { lockedEntryType: "payable" });
    }
    if (action === "calendar-prev" || action === "calendar-next") {
      const date = new Date(`${state.calendarMonth || monthKey()}-01T12:00:00`);
      date.setMonth(date.getMonth() + (action === "calendar-next" ? 1 : -1));
      state.calendarMonth = monthKey(date);
      state.calendarFlip = Number(state.calendarFlip || 0) + 1;
      saveState();
      render();
    }
    if (action === "toggle-settlement") {
      state.settlementVisible = !state.settlementVisible;
      saveState();
      render();
    }
    if (action === "show-pending-detail") {
      state.pendingDetail = button.dataset.detail;
      saveState();
      render();
    }
    if (action === "hide-pending-detail") {
      state.pendingDetail = "";
      saveState();
      render();
    }
    if (action === "activate-project") {
      state.activeProjectId = button.dataset.id;
      state.groupMode = "detail";
      draft = makeDraft();
      saveState();
      render();
    }
    if (action === "open-member-profile") {
      state.activeMemberProfileId = button.dataset.id;
      state.groupMode = "member";
      goToView("group", { groupMode: "member", memberId: button.dataset.id });
    }
    if (action === "close-member-profile") {
      state.groupMode = "detail";
      state.activeMemberProfileId = "";
      saveState();
      render();
    }
    if (action === "toggle-user-project") {
      toggleUserInProject(button.dataset.id);
      saveState();
      render();
    }
    if (action === "copy-project-link") copyProjectInvite();
    if (action === "logout") {
      try {
        if (typeof isCloudReady === "function" && isCloudReady()) await cloudSignOut();
      } catch (error) {
        toast(friendlyCloudError(error));
      }
      state.signedInUserId = "";
      state.activeUserId = "";
      state.activeView = "home";
      state.authMode = "login";
      state.lockedEntryType = "";
      draft = makeDraft();
      saveState();
      render();
      toast("Çıkış yapıldı.");
    }
    if (action === "auth-mode") {
      state.authMode = button.dataset.mode === "signup" ? "signup" : "login";
      saveState();
      render();
    }
    if (action === "share-receipt") shareReceipt();
    if (action === "settle-pending") settlePending(button.dataset.id);
    if (action === "toggle-reaction-picker") {
      state.reactionPickerEntryId = state.reactionPickerEntryId === button.dataset.id ? "" : button.dataset.id;
      saveState();
      render();
    }
    if (action === "set-reaction") {
      setReaction(button.dataset.id, button.dataset.emoji);
      state.reactionPickerEntryId = "";
      saveState();
      render();
      toast("Tepki eklendi.");
    }
    if (action === "show-reconciliation") {
      state.reconciliationDetailId = state.reconciliationDetailId === button.dataset.id ? "" : button.dataset.id;
      saveState();
      render();
    }
    if (action === "settle-transfer") {
      const index = Number(button.dataset.index);
      const transfers = minimumTransfers(calculateBalances());
      const addToKasa = Boolean(app.querySelector(`[data-cash-transfer="${index}"]`)?.checked);
      settleTransfer(transfers[index], addToKasa);
      saveState();
      render();
      toast(addToKasa ? "Ödendi ve kasaya işlendi." : "Ödendi işaretlendi.");
    }
    if (action === "select-template") {
      state.selectedTemplateId = state.selectedTemplateId === button.dataset.id ? "" : button.dataset.id;
      saveState();
      render();
    }
  };

  app.onchange = (event) => {
    const target = event.target;
    if (!target) return;
    if (target.id === "projectSelect") {
      state.activeProjectId = target.value;
      draft = makeDraft();
      saveState();
      render();
      return;
    }
    if (target.name === "currency") {
      const form = target.closest("form");
      const isTry = target.value === "TRY";
      form?.querySelector(".fx-rate-field")?.classList.toggle("is-hidden", isTry);
      form?.querySelector(".currency-grid")?.classList.toggle("single", isTry);
      if (isTry && form?.elements.exchangeRate) form.elements.exchangeRate.value = "1";
      draft.currency = target.value;
    }
    if (target.type === "file") {
      const label = target.closest("label")?.querySelector("[data-file-label]") || target.closest("label")?.querySelector("span");
      if (label) label.textContent = target.files?.length ? "Fotoğraf yüklendi" : "Fotoğraf";
    }
  };

  app.oninput = (event) => {
    const target = event.target;
    if (!target) return;
    if (target.id === "amount") {
      target.value = formatAmountInput(target.value);
      draft.amountInput = target.value;
    }
    if (target.id === "headingName") {
      const matches = app.querySelector("#headingMatches");
      if (!matches) return;
      const value = normalize(target.value);
      const items = projectHeadings().filter((heading) => normalize(heading.name).includes(value) || normalize(heading.shortName).includes(value)).slice(0, 8);
      matches.innerHTML = items.map((item) => `<button class="chip" data-suggestion="${item.name}" data-short="${item.name}" type="button">${item.name}</button>`).join("");
    }
  };

  app.onsubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    if (form.matches("[data-guess-form]")) return handleGuessForm(event, form);
    if (form.matches("[data-custom-reaction]")) {
      const emoji = String(new FormData(form).get("emoji") || "").trim();
      setReaction(form.dataset.id, emoji);
      state.reactionPickerEntryId = "";
      saveState();
      render();
      return;
    }
    if (form.id === "accountForm") return handleAccountForm(form);
    if (form.id === "loginForm") return handleLoginForm(form);
    if (form.id === "firstProjectForm") return handleFirstProjectForm(form);
    if (form.id === "joinProjectForm") return handleJoinProjectForm(form);
    if (form.id === "entryForm") return handleEntrySubmit(form);
    if (form.id === "statementForm") return handleStatementSubmit(form);
    if (form.id === "goalForm") return handleGoalSubmit(form);
    if (form.id === "projectUserForm" || form.id === "userForm") return handleProjectUserForm(form);
    if (form.id === "projectForm") return handleProjectForm(form);
    if (form.id === "memberProfileForm") return handleMemberProfileForm(form);
    if (form.id === "ownProfileForm") return handleOwnProfileForm(form);
    if (form.id === "projectPhotoForm") return handleProjectPhotoForm(form);
  };
}

function handleGuessForm(event, form) {
  const submitter = event.submitter;
  const data = new FormData(form);
  const predictedType = submitter?.value || String(data.get("predictedType") || "");
  const predictedAmount = parseAmount(data.get("predictedAmount"));
  const result = guessNotification(form.dataset.id, { predictedType, predictedAmount: predictedAmount || null });
  if (result.status === "already") return toast("Bu sürprizi zaten tahmin ettin.");
  saveState();
  render();
  toast(result.guess?.isCorrect ? "Kestirdin. +10 puan" : "Tahmin kaydedildi.");
}

async function handleAccountForm(form) {
  const data = new FormData(form);
  const name = String(data.get("userName") || "").trim();
  const email = String(data.get("email") || "").trim().toLowerCase();
  const password = normalizePassword(data.get("password"));
  if (!name) return toast("Ad soyad yazalım.");
  if (typeof isCloudReady === "function" && isCloudReady()) {
    if (!email || !email.includes("@")) return toast("Geçerli bir e-posta yazalım.");
    if (password.length < 6) return toast("Bulut hesabı için şifre en az 6 karakter olsun.");
    try {
      const result = await cloudSignUp({ name, email, password, nickname: String(data.get("nickname") || "").trim() });
      render();
      return toast(result.session ? "Hesap açıldı ve giriş yapıldı." : "Hesap açıldı. E-postadaki doğrulama linkini kontrol et.");
    } catch (error) {
      return toast(friendlyCloudError(error));
    }
  }
  if (password.length < 4) return toast("Şifre en az 4 karakter olsun.");
  const user = createUser(name, password, { email, nickname: String(data.get("nickname") || "").trim(), linkToProject: false });
  state.signedInUserId = "";
  state.activeUserId = "";
  state.pendingLoginUserId = user.id;
  state.authMode = "login";
  saveState();
  render();
  toast("Hesap oluşturuldu. Şimdi giriş yap.");
}

async function handleLoginForm(form) {
  const data = new FormData(form);
  if (typeof isCloudReady === "function" && isCloudReady()) {
    const email = String(data.get("loginEmail") || "").trim().toLowerCase();
    const password = normalizePassword(data.get("loginPassword"));
    if (!email || !email.includes("@")) return toast("E-postanı yazalım.");
    if (!password) return toast("Şifreni yazalım.");
    try {
      await cloudSignIn({ email, password });
      render();
      return toast("Giriş yapıldı.");
    } catch (error) {
      return toast(friendlyCloudError(error));
    }
  }
  const user = state.users.find((item) => item.id === String(data.get("loginUserId")));
  if (!state.users.length) return toast("Önce kullanıcı oluştur.");
  if (!user) return toast("Kullanıcı bulunamadı.");
  const password = normalizePassword(data.get("loginPassword"));
  if (user.password && normalizePassword(user.password) !== password) return toast("Şifre yanlış.");
  state.signedInUserId = user.id;
  state.activeUserId = user.id;
  state.pendingLoginUserId = "";
  draft = makeDraft();
  saveState();
  render();
  toast(`${profileLabel(user)} giriş yaptı.`);
}

async function handleFirstProjectForm(form) {
  const data = new FormData(form);
  const name = String(data.get("projectName") || "").trim();
  if (!name) return toast("Kasa adını yazalım.");
  createProject(name, String(data.get("purpose") || "").trim() || "Genel kasa", { templateId: state.selectedTemplateId || "" });
  try {
    saveState();
    if (typeof isCloudReady === "function" && isCloudReady()) await cloudPushState();
    render();
    toast("Kasa oluşturuldu.");
  } catch (error) {
    toast(friendlyCloudError(error));
  }
}

async function handleJoinProjectForm(form) {
  const code = normalizeCode(new FormData(form).get("projectCode"));
  if (!code) return toast("Proje kodunu yazalım.");
  if (typeof isCloudReady === "function" && isCloudReady()) {
    try {
      await cloudJoinProjectByCode(code);
      render();
      return toast("Kasaya katıldın.");
    } catch (error) {
      return toast(friendlyCloudError(error));
    }
  }
  const project = state.projects.find((item) => normalizeCode(projectCode(item)) === code);
  if (!project) return toast("Bu kod bu cihazda yok.");
  const userId = state.activeUserId || state.users[0]?.id;
  if (userId && !project.memberIds.includes(userId)) project.memberIds.push(userId);
  state.activeProjectId = project.id;
  state.groupMode = "detail";
  draft = makeDraft();
  saveState();
  render();
  toast("Projeye katıldın.");
}

async function handleEntrySubmit(form) {
  const data = new FormData(form);
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
  const heading = ensureHeading(headingName, headingName, "");
  const userId = currentUser()?.id || String(data.get("userId"));
  const date = String(data.get("date") || todayKey());
  const settlement = String(data.get("settlement")) === "in";
  if (userId && activeProject() && !activeProject().memberIds.includes(userId)) activeProject().memberIds.push(userId);
  const split = splitForEntry(draft.type, settlement, userId);
  const media = await mediaFromForm(data, { emoji: "notificationEmoji", gif: "notificationGif", photo: "photo" });
  const successMedia = await mediaFromForm(data, { emoji: "successReaction", gif: "successGif", photo: "successPhoto" });
  const failMedia = await mediaFromForm(data, { emoji: "failReaction", gif: "failGif", photo: "failPhoto" });
  const now = blockNow();
  const installmentCount = draft.type === "expense" ? Math.max(1, Math.min(48, Math.round(parseAmount(data.get("installmentCount")) || 1))) : 1;
  const installmentGroupId = installmentCount > 1 ? makeId() : "";
  const entry = {
    id: makeId(),
    projectId: state.activeProjectId,
    type: draft.type,
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
    settlement,
    status: ["receivable", "payable"].includes(draft.type) ? "pending" : "done",
    autoRevealAt: "",
    rateLockedAt: now,
    createdAt: now,
  };
  state.entries.unshift(entry);
  if (installmentCount > 1) {
    for (let index = 2; index <= installmentCount; index += 1) {
      state.entries.push({
        ...entry,
        id: makeId(),
        type: "payable",
        status: "pending",
        date: addMonthsToKey(date, index - 1),
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
  saveState();
  state.activeView = "home";
  state.lockedEntryType = "";
  draft = makeDraft();
  render();
  toast(delay || (installmentCount > 1 ? "Taksitli harcama takvime işlendi." : "Hareket kasaya girdi."));
}

async function handleStatementSubmit(form) {
  const data = new FormData(form);
  const bankId = String(data.get("bankName") || "other");
  const month = String(data.get("month") || monthKey());
  const file = formFile(data, "statementFile");
  if (!file) return toast("CSV dosyası seç.");
  const text = await file.text();
  const baseMap = bankColumnMaps[bankId] || bankColumnMaps.other;
  const manualMap =
    bankId === "other"
      ? {
          ...baseMap,
          dateCol: Number(data.get("dateCol") || baseMap.dateCol),
          descCol: Number(data.get("descCol") || baseMap.descCol),
          amountCol: Number(data.get("amountCol") || baseMap.amountCol),
          delimiter: String(data.get("delimiter") || baseMap.delimiter || ";"),
        }
      : baseMap;
  const rows = parseCsvRows(text, manualMap);
  if (!rows.length) return toast("CSV içinde okunabilir satır yok.");
  addReconciliation({ bankId, month, rows });
  saveState();
  state.activeView = "home";
  render();
  toast("Ekstre karşılaştırıldı.");
}

function handleGoalSubmit(form) {
  const data = new FormData(form);
  const title = String(data.get("title") || "").trim();
  const targetAmount = parseAmount(data.get("targetAmount"));
  if (!title || !targetAmount) return toast("Hedef adı ve tutarı yaz.");
  const items = String(data.get("items") || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const match = part.match(/(.+?)\s+([\d.,]+)$/);
      return { name: match ? match[1].trim() : part, price: match ? parseAmount(match[2]) : 0, purchased: false };
    });
  state.goals.push({ id: makeId(), projectId: activeProject().id, createdBy: currentUser()?.id || "", title, targetAmount, currentAmount: 0, deadline: String(data.get("deadline") || ""), items, status: "active", createdAt: blockNow() });
  saveState();
  render();
  toast("Hedef eklendi.");
}

async function handleProjectUserForm(form) {
  const name = String(new FormData(form).get("userName") || "").trim();
  if (!name) return toast((typeof isCloudReady === "function" && isCloudReady()) ? "Kasaya eklenecek e-postayı yazalım." : "Kasaya eklenecek kullanıcı adını yazalım.");
  if (typeof isCloudReady === "function" && isCloudReady()) {
    try {
      const email = name.toLowerCase();
      await cloudAddMemberByEmail(email);
      const added = state.users.find((user) => normalize(user.email) === normalize(email));
      if (added) createMemberNotification(added.id);
      saveState();
      render();
      return toast("Kullanıcı kasaya eklendi.");
    } catch (error) {
      return toast(friendlyCloudError(error));
    }
  }
  const result = addUserToActiveProjectByName(name);
  if (result.status === "forbidden") return toast("Kullanıcı eklemeyi sadece kasa sahibi yapar.");
  if (result.status === "missing-user") return toast("Bu adda kullanıcı yok. Önce profilini oluştur.");
  if (result.status === "already") return toast(`${shortName(result.user.name)} zaten bu kasada.`);
  createMemberNotification(result.user.id);
  state.groupMode = "detail";
  saveState();
  render();
  toast(`${shortName(result.user.name)} kasaya eklendi.`);
}

async function handleProjectForm(form) {
  const data = new FormData(form);
  const name = String(data.get("projectName") || "").trim();
  if (!name) return toast("Proje adını yazalım.");
  createProject(name, String(data.get("purpose") || "").trim() || "Genel kasa", { templateId: state.selectedTemplateId || "" });
  state.groupMode = "detail";
  try {
    saveState();
    if (typeof isCloudReady === "function" && isCloudReady()) await cloudPushState();
    render();
    toast("Proje eklendi.");
  } catch (error) {
    toast(friendlyCloudError(error));
  }
}

async function handleMemberProfileForm(form) {
  const userId = form.dataset.id;
  const project = activeProject();
  if (!project || !isProjectOwner(project)) return toast("Bu alanı sadece kasa sahibi düzenler.");
  const data = new FormData(form);
  setProjectMemberAlias(userId, data.get("alias"));
  const file = formFile(data, "memberPhoto");
  project.memberPhotos = project.memberPhotos || {};
  if (file) project.memberPhotos[userId] = { photoName: file.name, photoData: await readImageAsDataUrl(file) };
  saveState();
  render();
  toast("Kasa içi profil kaydedildi.");
}

async function handleOwnProfileForm(form) {
  const user = currentUser();
  if (!user) return;
  const data = new FormData(form);
  const onayMode = String(data.get("onayMode") || user.onayModu);
  const themeMode = String(data.get("themeMode") || state.themeMode || "system");
  if (personalityModes[onayMode]) user.onayModu = onayMode;
  if (["system", "light", "dark"].includes(themeMode)) state.themeMode = themeMode;
  const file = formFile(data, "profilePhoto");
  if (file) {
    user.photoName = file.name;
    user.photoData = await readImageAsDataUrl(file);
  }
  saveState();
  render();
  toast("Profil kaydedildi.");
}

async function handleProjectPhotoForm(form) {
  const project = activeProject();
  if (!project || !isProjectOwner(project)) return toast("Proje resmini sadece kasa sahibi düzenler.");
  const file = formFile(new FormData(form), "projectPhoto");
  if (!file) return toast("Proje resmi seç.");
  project.photoName = file.name;
  project.photoData = await readImageAsDataUrl(file);
  saveState();
  render();
  toast("Proje resmi kaydedildi.");
}

function renderStatementAdd() {
  return `
    <section class="segmented">
      <button class="segment" data-add-tab="entry" type="button">Hareket</button>
      <button class="segment active" data-add-tab="statement" type="button">Ekstre</button>
      <button class="segment" data-action="open-headings" type="button">Başlık</button>
    </section>
    <form class="form-card form-grid" id="statementForm">
      <div class="section-head"><div><h2>Ekstre uzlaşması</h2><p>CSV yükle, banka toplamı ile kasa toplamı karşılaştırılsın.</p></div></div>
      <label><span class="field-label">Banka</span><select class="select-input" name="bankName">${Object.entries(bankColumnMaps).map(([id, item]) => `<option value="${id}">${item.label}</option>`).join("")}</select></label>
      <label><span class="field-label">Ay</span><input class="select-input" name="month" type="month" value="${monthKey()}" /></label>
      <details class="soft-details">
        <summary>Diğer banka kolonları</summary>
        <div class="inline-form">
          <input class="text-input" name="dateCol" inputmode="numeric" placeholder="Tarih kolonu: 0" autocomplete="off" />
          <input class="text-input" name="descCol" inputmode="numeric" placeholder="Açıklama kolonu: 1" autocomplete="off" />
          <input class="text-input" name="amountCol" inputmode="numeric" placeholder="Tutar kolonu: 2" autocomplete="off" />
          <input class="text-input" name="delimiter" placeholder="Ayraç: ; veya ," autocomplete="off" />
        </div>
      </details>
      <label class="photo-pick"><span>CSV dosyası</span><strong>Seç</strong><input name="statementFile" type="file" accept=".csv,text/csv" /></label>
      <button class="primary-button" type="submit">Ekstreyi karşılaştır</button>
    </form>
  `;
}

function pendingRow(entry) {
  const isReceivable = entry.type === "receivable";
  const exchange = exchangeText(entry);
  return `
    <div class="expense-row">
      <span class="emoji-dot">${entry.emoji || (isReceivable ? "🤝" : "⏰")}</span>
      <div class="expense-main">
        <p class="expense-title">${entryTitle(entry)}</p>
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

function renderCalendar() {
  const tab = state.calendarTab || "calendar";
  const pending = pendingEntries();
  const actual = actualEntries().slice(0, 6);
  return `
    <section class="segmented">
      <button class="segment ${tab === "calendar" ? "active" : ""}" data-calendar-tab="calendar" type="button">Takvim</button>
      <button class="segment ${tab === "goals" ? "active" : ""}" data-calendar-tab="goals" type="button">Hedefler</button>
      <button class="segment" data-action="go-add-payable" type="button">Ekle</button>
    </section>
    ${
      tab === "goals"
        ? renderGoalSection()
        : `
          <section class="card">
            <div class="section-head"><div><h2>Takvim</h2><p>Beklenen alacaklar ve yaklaşan ödemeler.</p></div><button class="tiny-button" data-action="go-add-payable" type="button">Ekle</button></div>
            <div class="expense-list">${pending.length ? pending.map(pendingRow).join("") : `<div class="empty-state">Takvim boş.</div>`}</div>
          </section>
          <section class="card"><h2>Son tarihli kayıtlar</h2><div class="expense-list">${actual.length ? actual.map(entryRow).join("") : `<div class="empty-state">Gerçekleşmiş kayıt yok.</div>`}</div></section>
        `
    }
  `;
}

function weeklyChampions(entries) {
  const members = activeMembers();
  const spent = members.map((user) => ({
    user,
    total: sum(entries.filter((entry) => entry.type === "expense" && entry.userId === user.id)),
    guesses: Number(user.correctGuesses || 0),
  }));
  const saver = spent.slice().sort((a, b) => a.total - b.total)[0];
  const guesser = spent.slice().sort((a, b) => b.guesses - a.guesses)[0];
  return `
    <section class="card">
      <h2>Haftalık şampiyonlar</h2>
      <div class="expense-list">
        <div class="split-row"><strong>Tasarruf şampiyonu: ${projectUserLabel(saver?.user)}</strong><span>${money(saver?.total || 0)} harcadı</span></div>
        <div class="split-row"><strong>Sürpriz ustası: ${projectUserLabel(guesser?.user)}</strong><span>${guesser?.guesses || 0} doğru tahmin</span></div>
        <div class="split-row"><strong>En hareketli başlık</strong><span>${topHeading(entries)}</span></div>
      </div>
    </section>
  `;
}

function renderReport() {
  const period = state.reportPeriod || "month";
  const entries = actualEntries().filter((entry) => isInPeriod(entry.date, period));
  const totals = calculateTotals(entries);
  const label = periodLabel(period);
  const netClass = totals.actual >= 0 ? "positive" : "warning";
  return `
    <section class="segmented">${[["day", "Gün"], ["week", "Hafta"], ["month", "Ay"]].map(([value, labelText]) => `<button class="segment ${period === value ? "active" : ""}" data-period="${value}" type="button">${labelText}</button>`).join("")}</section>
    <section class="card">
      <div class="section-head"><div><h2>${label} raporu</h2><p>Gelir ${money(totals.income)}, çıkan ${money(totals.expense)}, net ${money(totals.actual)}.</p></div><span class="quick-pill">${entries.length} kayıt</span></div>
      <div class="grid-2 compact-stats">
        <article class="stat-card small"><p class="stat-label">Gelir</p><p class="stat-value positive">${money(totals.income)}</p></article>
        <article class="stat-card small"><p class="stat-label">Gider</p><p class="stat-value warning">${money(totals.expense)}</p></article>
        <article class="stat-card small"><p class="stat-label">Net</p><p class="stat-value ${netClass}">${money(totals.actual)}</p></article>
        <article class="stat-card small"><p class="stat-label">Ortalama</p><p class="stat-value">${money(entries.length ? totals.expense / entries.length : 0)}</p></article>
      </div>
      <div class="bars" style="margin-top:16px;">${headingBars(entries)}</div>
    </section>
    ${period === "week" ? weeklyChampions(entries) : ""}
    ${reconciliationCards()}
    <section class="card"><div class="section-head"><div><h2>Rapor detayı</h2><p>Bu dönemde görünen gelir ve giderler.</p></div></div><div class="expense-list">${entries.length ? entries.map(movementEntryRow).join("") : `<div class="empty-state">Bu dönem için raporlanacak hareket yok.</div>`}</div></section>
    <section class="receipt-card" id="receiptCard">
      <h2 class="receipt-title">KASAM FİŞİ</h2>
      <div class="receipt-line"><span>Tarih</span><strong>${new Date().toLocaleDateString("tr-TR")} ${new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</strong></div>
      <div class="receipt-line"><span>Proje</span><strong>${activeProject().name}</strong></div>
      <div class="receipt-line"><span>${label} giren</span><strong>${money(totals.income)}</strong></div>
      <div class="receipt-line"><span>${label} çıkan</span><strong>${money(totals.expense)}</strong></div>
      <div class="receipt-line"><span>Net</span><strong>${money(totals.actual)}</strong></div>
      ${exchangeReceiptLines(entries)}
      <div class="receipt-line"><span>En hareketli başlık</span><strong>${topHeading(entries)}</strong></div>
      <p class="receipt-watermark">kasam.app</p>
      <button class="share-button" data-action="share-receipt" type="button">Fişi paylaş</button>
    </section>
  `;
}

function renderGroup() {
  const project = activeProject();
  const balances = calculateBalances();
  const transfers = minimumTransfers(balances);
  const canManageUsers = isProjectOwner(project);
  const owner = projectOwner(project);
  const user = currentUser();
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();
  return `
    <section class="card">
      <div class="section-head"><div><h2>Projelerim</h2><p>Proje seç, üyeleri bağla, gelir/gider senaryosunu kur.</p></div></div>
      <div class="quick-actions compact"><button class="action-button income" data-action="go-add-income" type="button"><span>💰</span>Gelir ekle</button><button class="action-button expense" data-action="go-add-expense" type="button"><span>💸</span>Gider ekle</button></div>
      <div class="expense-list" style="margin-top:12px;">${state.projects.map(projectRow).join("")}</div>
      <form class="inline-form" id="projectForm">
        <input class="text-input" name="projectName" placeholder="Yeni proje adı" autocomplete="off" />
        <input class="text-input" name="purpose" list="purposeList" placeholder="Kasa amacı: Ev, iş, araç..." autocomplete="off" />
        <datalist id="purposeList">${purposeOptions.map((purpose) => `<option value="${purpose}"></option>`).join("")}</datalist>
        <span class="field-label">Şablondan başla</span>
        ${templateOptionsHtml(state.selectedTemplateId)}
        <button class="primary-button" type="submit">Proje ekle</button>
      </form>
      ${cloudReady ? `<form class="inline-form cloud-join-card" id="joinProjectForm"><input class="text-input" name="projectCode" placeholder="Kasa kodu: KASA-EVK-1234" autocomplete="off" /><button class="secondary-button" type="submit">Kodla katıl</button></form>` : ""}
    </section>
    <section class="card">
      <h2>Profil ayarları</h2>
      <label><span class="field-label">Onay modu</span><select class="select-input" id="onayModeSelect">${Object.entries(personalityModes).map(([id, item]) => `<option value="${id}" ${currentUser()?.onayModu === id ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>
      <p>Skor: ${currentUser()?.totalScore || 0} · Doğru: ${currentUser()?.correctGuesses || 0}/${currentUser()?.totalGuesses || 0}</p>
    </section>
    <section class="card">
      <h2>Projeye kişi ekle</h2>
      <p>${canManageUsers ? (cloudReady ? `Diğer kişi e-posta ile hesap açtıktan sonra e-postasını buraya yaz.` : `Önce diğer profili oluştur. Sonra adını buraya yaz.`) : `Kullanıcı eklemek için ${projectUserLabel(owner)} hesabıyla giriş yap.`}</p>
      ${
        canManageUsers
          ? `<form class="inline-form featured-form" id="projectUserForm"><input class="text-input" name="userName" placeholder="${cloudReady ? "mail@ornek.com" : "Kullanıcı adı"}" autocomplete="${cloudReady ? "email" : "off"}" /><button class="primary-button" type="submit">Kasaya ekle</button></form>`
          : `<div class="inline-form featured-form"><button class="secondary-button" data-action="logout" type="button">Çıkış yap</button><span class="field-help">Sonra kasa sahibi profiliyle tekrar giriş yap.</span></div>`
      }
    </section>
    <section class="card">
      <div class="section-head"><div><h2>Proje erişimi</h2><p>${cloudReady ? "Bu kodu başka telefondaki kullanıcı girerse aynı kasaya katılır." : "Yerel denemede kullanıcılar bu cihazda tutulur."}</p></div></div>
      <div class="invite-box"><div><span class="field-label">Kod</span><strong>${projectCode(project)}</strong><p>${inviteLink(project)}</p></div><button class="mini-action" data-action="copy-project-link" type="button">Kopyala</button></div>
    </section>
    <section class="card">
      <h2>Kasa kullanıcıları</h2>
      <div class="expense-list" style="margin-top:12px;">${state.users.map(userLinkRow).join("")}</div>
      ${canManageUsers ? `<form class="inline-form" id="userForm"><input class="text-input" name="userName" placeholder="${cloudReady ? "E-posta: mail@ornek.com" : "Kullanıcı adı"}" autocomplete="${cloudReady ? "email" : "off"}" /><button class="primary-button" type="submit">Kasaya ekle</button></form>` : `<div class="empty-state" style="margin-top:12px;">Kullanıcı eklemek için kasa sahibi hesabıyla giriş yap.</div>`}
    </section>
    <section class="card">
      <div class="section-head"><div><h2>Borç & alacak</h2><p>${state.settlementVisible ? "Minimum transfer listesi görünür." : "Şu an gizli."}</p></div><button class="tiny-button" data-action="toggle-settlement" type="button">${state.settlementVisible ? "Gizle" : "Göster"}</button></div>
      ${
        state.settlementVisible
          ? `<div style="margin-top:10px;">${balances.length ? balances.map(balanceRow).join("") : `<div class="empty-state">Hesaplaşmaya dahil gider yok.</div>`}</div><div style="margin-top:12px;">${transferRows(transfers)}</div>`
          : `<div class="empty-state" style="margin-top:12px;">Açınca kim kime ne kadar göndermeli görünür.</div>`
      }
    </section>
  `;
}

function renderProjectSetup() {
  const user = currentUser();
  const cloudReady = typeof isCloudReady === "function" && isCloudReady();
  return `
    <section class="form-card form-grid onboarding-card">
      <div><p class="eyebrow">Kasa kurulumu</p><h2>${profileLabel(user)}, şimdi kasa seç</h2><p class="hero-note">${cloudReady ? "Hesabın hazır. İlk kasanı oluştur veya kodla katıl." : "Deneme sürümünde önce kendi kasanı kur."}</p></div>
      <form class="form-grid" id="firstProjectForm">
        <label><span class="field-label">Kasa / proje adı</span><input class="text-input" name="projectName" placeholder="Proje adı" autocomplete="off" /></label>
        <label><span class="field-label">Amaç</span><input class="text-input" name="purpose" list="purposeList" placeholder="Ev, iş, ev arkadaşlığı..." autocomplete="off" /></label>
        <datalist id="purposeList">${purposeOptions.map((purpose) => `<option value="${purpose}"></option>`).join("")}</datalist>
        <span class="field-label">Şablondan başla</span>
        ${templateOptionsHtml(state.selectedTemplateId)}
        <button class="primary-button" type="submit">Kasa oluştur</button>
      </form>
      ${cloudReady ? `<form class="form-grid" id="joinProjectForm"><input class="text-input" name="projectCode" placeholder="Kasa kodu" autocomplete="off" /><button class="secondary-button" type="submit">Kodla katıl</button></form>` : ""}
    </section>
  `;
}

function exchangeText(entry) {
  const currency = entry.currency || "TRY";
  if (currency === "TRY") return "";
  const locked = entry.rateLockedAt ? ` (kilitlendi: ${new Date(entry.rateLockedAt).toLocaleDateString("tr-TR")})` : "";
  return `Kur: ${formatCurrencyAmount(entry.enteredAmount || entry.amount, currency)} × ${formatRate(entry.exchangeRate || 1)} = ${money(entry.amount)}${locked}`;
}

function exchangeReceiptLines(entries) {
  const foreignEntries = entries.filter((entry) => entry.currency && entry.currency !== "TRY");
  if (!foreignEntries.length) return "";
  return foreignEntries.slice(0, 3).map((entry) => `<div class="receipt-line exchange-line"><span>Döviz notu</span><strong>${exchangeText(entry)}</strong></div>`).join("");
}

async function shareReceipt() {
  const card = document.querySelector("#receiptCard");
  const text = card?.innerText || "KASAM FİŞİ";
  try {
    if (window.html2canvas && card) {
      const canvas = await window.html2canvas(card, { backgroundColor: "#fffaf1", scale: 2 });
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
      link.download = "kasa-fisi.png";
      link.click();
      return toast("Fiş görseli indirildi.");
    }
    if (navigator.share) await navigator.share({ title: "Kasam Fişi", text });
    else {
      await navigator.clipboard.writeText(text);
      toast("Fiş metni kopyalandı.");
    }
  } catch {
    toast("Paylaşım iptal edildi.");
  }
}

function parseCsvRows(text, map) {
  const delimiter = map.delimiter || ";";
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(delimiter).map((cell) => cell.replace(/^"|"$/g, "").trim()))
    .map((cells) => ({
      date: cells[map.dateCol] || "",
      description: cells[map.descCol] || "",
      amount: parseAmount(cells[map.amountCol] || 0),
    }))
    .filter((row) => row.description || row.amount);
}

function addReconciliation({ bankId, month, rows }) {
  const map = bankColumnMaps[bankId] || bankColumnMaps.other;
  const statementTotal = rows.reduce((total, row) => total + Number(row.amount || 0), 0);
  const kasaTotal = sum(blockConfirmedEntries().filter((entry) => entry.type === "expense" && entryMonth(entry) === month));
  const diff = statementTotal - kasaTotal;
  state.reconciliations = state.reconciliations || [];
  state.reconciliations.push({
    id: makeId(),
    projectId: activeProject()?.id || "",
    userId: currentUser()?.id || "",
    month,
    bankName: map.label,
    uploadedAt: blockNow(),
    statementTotal,
    kasaTotal,
    diff,
    status: Math.abs(diff) < 1 ? "matched" : "unmatched",
    rawRows: rows,
  });
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
    photoName: profileInput.photoName || metadata.photoName || existing?.photoName || "",
    photoData: profileInput.photoData || metadata.photoData || existing?.photoData || "",
    onayModu: existing?.onayModu || "standart",
    totalScore: Number(existing?.totalScore || 0),
    correctGuesses: Number(existing?.correctGuesses || 0),
    totalGuesses: Number(existing?.totalGuesses || 0),
    createdAt: existing?.createdAt || blockNow(),
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
        photo_name: user.photoName || "",
        photo_data: user.photoData || "",
        onay_modu: user.onayModu,
        total_score: user.totalScore,
        correct_guesses: user.correctGuesses,
        total_guesses: user.totalGuesses,
        updated_at: blockNow(),
      },
      { onConflict: "id" },
    );
    if (error) setCloudStatus(friendlyCloudError(error));
  }
  return user;
}

function cloudMapProject(project, members) {
  const projectMembers = members.filter((member) => member.project_id === project.id);
  return {
    id: project.id,
    name: project.name,
    purpose: project.purpose || "Genel kasa",
    code: project.code,
    createdAt: project.created_at,
    createdBy: project.created_by,
    memberIds: projectMembers.map((member) => member.user_id),
    memberAliases: Object.fromEntries(projectMembers.filter((member) => member.alias).map((member) => [member.user_id, member.alias])),
    memberPhotos: Object.fromEntries(projectMembers.filter((member) => member.photo_data || member.photo_name).map((member) => [member.user_id, { photoName: member.photo_name || "", photoData: member.photo_data || "" }])),
    photoName: project.photo_name || "",
    photoData: project.photo_data || "",
    defaultCurrency: project.default_currency || "TL",
    defaultHeadings: project.default_headings || [],
    splitType: project.split_type || "equal",
    templateId: project.template_id || "",
    budgetLimits: project.budget_limits || {},
    hasBudgetTarget: Boolean(project.has_budget_target),
    hasGoalItems: Boolean(project.has_goal_items),
  };
}

async function safeCloudTable(name, queryFactory) {
  const result = await queryFactory();
  if (result.error) {
    setCloudStatus(friendlyCloudError(result.error));
    return [];
  }
  return result.data || [];
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
    let reactions = [];
    let reconciliations = [];
    let goals = [];
    let settlements = [];
    if (projectIds.length) {
      const [memberResult, headingResult, entryResult, notificationResult, reactionResult, reconciliationResult, goalResult, settlementResult] = await Promise.all([
        client.from("kasa_project_members").select("*").in("project_id", projectIds),
        client.from("kasa_headings").select("*").in("project_id", projectIds),
        client.from("kasa_entries").select("*").in("project_id", projectIds),
        client.from("kasa_notifications").select("*").in("project_id", projectIds),
        client.from("kasa_reactions").select("*").in("project_id", projectIds),
        client.from("kasa_reconciliations").select("*").in("project_id", projectIds),
        client.from("kasa_goals").select("*").in("project_id", projectIds),
        client.from("kasa_settlements").select("*").in("project_id", projectIds),
      ]);
      if (memberResult.error) throw memberResult.error;
      if (headingResult.error) throw headingResult.error;
      if (entryResult.error) throw entryResult.error;
      if (notificationResult.error) throw notificationResult.error;
      members = memberResult.data || [];
      headings = headingResult.data || [];
      entries = entryResult.data || [];
      notifications = notificationResult.data || [];
      reactions = reactionResult.error ? [] : reactionResult.data || [];
      reconciliations = reconciliationResult.error ? [] : reconciliationResult.data || [];
      goals = goalResult.error ? [] : goalResult.data || [];
      settlements = settlementResult.error ? [] : settlementResult.data || [];
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
      photoName: profile.photo_name || "",
      photoData: profile.photo_data || "",
      onayModu: profile.onay_modu || "standart",
      totalScore: Number(profile.total_score || 0),
      correctGuesses: Number(profile.correct_guesses || 0),
      totalGuesses: Number(profile.total_guesses || 0),
      createdAt: profile.created_at || blockNow(),
      createdBy: "",
    }));
    if (current && !state.users.some((user) => user.id === current.id)) state.users.push(current);
    state.projects = (projects || []).map((project) => cloudMapProject(project, members));
    state.headings = headings.map((heading) => ({ id: heading.id, projectId: heading.project_id, name: heading.name, shortName: heading.short_name, emoji: heading.emoji }));
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
      lockedNotificationId: entry.locked_notification_id || "",
      autoRevealAt: entry.auto_reveal_at || "",
      rateLockedAt: entry.rate_locked_at || entry.created_at,
      paidById: entry.paid_by_id || entry.user_id,
      splitWith: entry.split_with || [],
      splitRatio: entry.split_ratio || [],
      ocrRawText: entry.ocr_raw_text || null,
      ocrParsedAmount: entry.ocr_parsed_amount ?? null,
      installmentGroupId: entry.installment_group_id || "",
      installmentIndex: Number(entry.installment_index || 0),
      installmentCount: Number(entry.installment_count || 0),
      settlement: Boolean(entry.settlement),
      status: entry.status,
      createdAt: entry.created_at,
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
      failReaction: notification.fail_reaction || "🙂",
      failPhotoName: notification.fail_photo_name || "",
      failPhotoData: notification.fail_photo_data || "",
      failGif: notification.fail_gif || "",
      guessDeadline: notification.guess_deadline || "",
      revealedAt: notification.revealed_at || "",
      isCompleted: Boolean(notification.is_completed),
      notificationType: notification.notification_type || "entry",
      reactionEmoji: notification.reaction_emoji || "",
      guesses: Array.isArray(notification.guesses) ? notification.guesses : [],
      createdAt: notification.created_at,
    }));
    state.reactions = reactions.map((item) => ({ id: item.id, entryId: item.entry_id, projectId: item.project_id, userId: item.user_id, emoji: item.emoji, createdAt: item.created_at }));
    state.reconciliations = reconciliations.map((item) => ({ id: item.id, projectId: item.project_id, userId: item.user_id, month: item.month, bankName: item.bank_name, uploadedAt: item.uploaded_at, statementTotal: Number(item.statement_total || 0), kasaTotal: Number(item.kasa_total || 0), diff: Number(item.diff || 0), status: item.status, rawRows: item.raw_rows || [] }));
    state.goals = goals.map((item) => ({ id: item.id, projectId: item.project_id, createdBy: item.created_by, title: item.title, targetAmount: Number(item.target_amount || 0), currentAmount: Number(item.current_amount || 0), deadline: item.deadline || "", items: item.items || [], status: item.status, createdAt: item.created_at }));
    state.settlements = settlements.map((item) => ({ id: item.id, projectId: item.project_id, fromUserId: item.from_user_id, toUserId: item.to_user_id, amount: Number(item.amount || 0), settledAt: item.settled_at, note: item.note || "" }));
    state.activeProjectId = state.projects.some((project) => project.id === state.activeProjectId) ? state.activeProjectId : state.projects[0]?.id || "";
    state.activeUserId = state.signedInUserId;
    state.cloudSyncAt = blockNow();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    setCloudStatus(friendlyCloudError(error));
    throw error;
  } finally {
    cloudSyncPaused = false;
  }
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
        photo_name: user.photoName || "",
        photo_data: user.photoData || "",
        onay_modu: user.onayModu || "standart",
        total_score: Number(user.totalScore || 0),
        correct_guesses: Number(user.correctGuesses || 0),
        total_guesses: Number(user.totalGuesses || 0),
        updated_at: blockNow(),
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
          default_currency: project.defaultCurrency || "TL",
          default_headings: project.defaultHeadings || [],
          split_type: project.splitType || "equal",
          template_id: project.templateId || "",
          budget_limits: project.budgetLimits || {},
          has_budget_target: Boolean(project.hasBudgetTarget),
          has_goal_items: Boolean(project.hasGoalItems),
          photo_name: project.photoName || "",
          photo_data: project.photoData || "",
          created_at: project.createdAt || blockNow(),
          updated_at: blockNow(),
        })),
        { onConflict: "id" },
      );
      if (error) throw error;
    }
    const membershipRows = ownedProjects.flatMap((project) => project.memberIds.map((userId) => ({ project_id: project.id, user_id: userId, role: userId === project.createdBy ? "owner" : "member", alias: project.memberAliases?.[userId] || "", photo_name: project.memberPhotos?.[userId]?.photoName || "", photo_data: project.memberPhotos?.[userId]?.photoData || "" })));
    if (membershipRows.length) {
      const { error } = await client.from("kasa_project_members").upsert(membershipRows, { onConflict: "project_id,user_id" });
      if (error) throw error;
    }
    const projectIds = state.projects.map((project) => project.id);
    const headingRows = state.headings.filter((heading) => projectIds.includes(heading.projectId)).map((heading) => ({ id: heading.id, project_id: heading.projectId, name: heading.name, short_name: heading.shortName, emoji: heading.emoji }));
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
        short_name: entry.shortName || entryTitle(entry),
        emoji: entry.emoji,
        entry_date: entry.date,
        note: entry.note || "",
        photo_name: entry.photoName || "",
        photo_data: entry.photoData || "",
        locked_notification_id: entry.lockedNotificationId || null,
        auto_reveal_at: entry.autoRevealAt || null,
        rate_locked_at: entry.rateLockedAt || entry.createdAt || blockNow(),
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
        created_at: entry.createdAt || blockNow(),
      }));
    if (entryRows.length) {
      const { error } = await client.from("kasa_entries").upsert(entryRows, { onConflict: "id" });
      if (error) throw error;
    }
    const notificationRows = (state.notifications || [])
      .filter((notification) => notification.actorId === user.id)
      .map((notification) => ({
        id: notification.id,
        project_id: notification.projectId,
        entry_id: notification.entryId,
        actor_id: notification.actorId,
        recipients: notification.recipients || [],
        mode: notification.mode,
        actual_type: notification.actualType || "expense",
        title: notification.title || "",
        amount: notification.amount || 0,
        emoji: notification.emoji || "",
        photo_name: notification.photoName || "",
        photo_data: notification.photoData || "",
        gif: notification.gif || "",
        success_reaction: notification.successReaction || "✅",
        success_photo_name: notification.successPhotoName || "",
        success_photo_data: notification.successPhotoData || "",
        success_gif: notification.successGif || "",
        fail_reaction: notification.failReaction || "🙂",
        fail_photo_name: notification.failPhotoName || "",
        fail_photo_data: notification.failPhotoData || "",
        fail_gif: notification.failGif || "",
        guess_deadline: notification.guessDeadline || null,
        revealed_at: notification.revealedAt || null,
        is_completed: Boolean(notification.isCompleted),
        notification_type: notification.notificationType || "entry",
        reaction_emoji: notification.reactionEmoji || "",
        guesses: notification.guesses || [],
        created_at: notification.createdAt || blockNow(),
      }));
    if (notificationRows.length) {
      const { error } = await client.from("kasa_notifications").upsert(notificationRows, { onConflict: "id" });
      if (error) throw error;
    }
    const notificationUpdates = (state.notifications || []).filter((notification) => notification.actorId !== user.id && notification.recipients?.includes(user.id));
    for (const notification of notificationUpdates) {
      const { error } = await client
        .from("kasa_notifications")
        .update({
          guesses: notification.guesses || [],
          revealed_at: notification.revealedAt || null,
          is_completed: Boolean(notification.isCompleted),
        })
        .eq("id", notification.id);
      if (error) throw error;
    }
    const reactionRows = (state.reactions || []).filter((reaction) => reaction.userId === user.id).map((reaction) => ({ id: reaction.id, entry_id: reaction.entryId, project_id: reaction.projectId, user_id: reaction.userId, emoji: reaction.emoji, created_at: reaction.createdAt || blockNow() }));
    if (reactionRows.length) await client.from("kasa_reactions").upsert(reactionRows, { onConflict: "id" });
    const reconciliationRows = (state.reconciliations || []).filter((item) => item.userId === user.id).map((item) => ({ id: item.id, project_id: item.projectId, user_id: item.userId, month: item.month, bank_name: item.bankName, uploaded_at: item.uploadedAt || blockNow(), statement_total: item.statementTotal, kasa_total: item.kasaTotal, diff: item.diff, status: item.status, raw_rows: item.rawRows || [] }));
    if (reconciliationRows.length) await client.from("kasa_reconciliations").upsert(reconciliationRows, { onConflict: "id" });
    const goalRows = (state.goals || []).filter((goal) => goal.createdBy === user.id).map((goal) => ({ id: goal.id, project_id: goal.projectId, created_by: goal.createdBy, title: goal.title, target_amount: goal.targetAmount, current_amount: goalCurrentAmount(goal), deadline: goal.deadline || null, items: goal.items || [], status: goal.status, created_at: goal.createdAt || blockNow() }));
    if (goalRows.length) await client.from("kasa_goals").upsert(goalRows, { onConflict: "id" });
    const settlementRows = (state.settlements || []).map((settlement) => ({ id: settlement.id, project_id: settlement.projectId, from_user_id: settlement.fromUserId, to_user_id: settlement.toUserId, amount: settlement.amount, settled_at: settlement.settledAt || blockNow(), note: settlement.note || "" }));
    if (settlementRows.length) await client.from("kasa_settlements").upsert(settlementRows, { onConflict: "id" });
    state.cloudSyncAt = blockNow();
    setCloudStatus("Senkron tamam");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } finally {
    cloudSyncBusy = false;
  }
}

function bindScreen() {
  app.querySelectorAll("[data-action='go-back']").forEach((button) => button.addEventListener("click", () => { state.activeView = "home"; saveState(); render(); }));
  app.querySelectorAll("[data-action='open-group']").forEach((button) => button.addEventListener("click", () => { state.activeView = "group"; saveState(); render(); }));
  app.querySelectorAll("[data-action='open-notifications']").forEach((button) => button.addEventListener("click", () => { state.activeView = "notifications"; saveState(); render(); }));
  app.querySelectorAll("[data-action='open-movements']").forEach((button) => button.addEventListener("click", () => { state.activeView = "movements"; saveState(); render(); }));
  app.querySelectorAll("[data-action='open-headings']").forEach((button) => button.addEventListener("click", () => { state.activeView = "headings"; saveState(); render(); }));
  app.querySelectorAll("[data-add-tab]").forEach((button) => button.addEventListener("click", () => { state.addTab = button.dataset.addTab; saveState(); render(); }));
  app.querySelectorAll("[data-calendar-tab]").forEach((button) => button.addEventListener("click", () => { state.calendarTab = button.dataset.calendarTab; saveState(); render(); }));
  app.querySelectorAll("[data-action='select-template']").forEach((button) => button.addEventListener("click", () => {
    state.selectedTemplateId = state.selectedTemplateId === button.dataset.id ? "" : button.dataset.id;
    button.closest(".template-grid")?.querySelectorAll(".template-card").forEach((card) => card.classList.toggle("selected", card.dataset.id === state.selectedTemplateId));
    saveState();
  }));
  app.querySelectorAll("[data-action='go-add'], [data-action='go-add-expense']").forEach((button) => button.addEventListener("click", () => { draft.type = "expense"; draft.emoji = "💸"; draft.userId = currentUser()?.id || ""; draft.date = todayKey(); draft.amountInput = ""; state.addTab = "entry"; state.activeView = "add"; saveState(); render(); }));
  app.querySelectorAll("[data-action='go-add-income']").forEach((button) => button.addEventListener("click", () => { draft.type = "income"; draft.emoji = "💰"; draft.userId = currentUser()?.id || ""; draft.date = todayKey(); draft.amountInput = ""; state.addTab = "entry"; state.activeView = "add"; saveState(); render(); }));
  app.querySelectorAll("[data-action='go-add-payable']").forEach((button) => button.addEventListener("click", () => { draft.type = "payable"; draft.emoji = "⏰"; draft.userId = currentUser()?.id || ""; draft.date = todayKey(); draft.amountInput = ""; state.addTab = "entry"; state.activeView = "add"; saveState(); render(); }));
  app.querySelectorAll("[data-action='toggle-settlement']").forEach((button) => button.addEventListener("click", () => { state.settlementVisible = !state.settlementVisible; saveState(); render(); }));
  app.querySelectorAll("[data-action='show-pending-detail']").forEach((button) => button.addEventListener("click", () => { state.pendingDetail = button.dataset.detail; saveState(); render(); }));
  app.querySelectorAll("[data-action='hide-pending-detail']").forEach((button) => button.addEventListener("click", () => { state.pendingDetail = ""; saveState(); render(); }));
  app.querySelectorAll("[data-action='activate-project']").forEach((button) => button.addEventListener("click", () => { state.activeProjectId = button.dataset.id; draft = makeDraft(); saveState(); render(); }));
  app.querySelectorAll("[data-action='toggle-user-project']").forEach((button) => button.addEventListener("click", () => { toggleUserInProject(button.dataset.id); saveState(); render(); }));
  app.querySelectorAll("[data-action='copy-project-link']").forEach((button) => button.addEventListener("click", () => copyProjectInvite()));
  app.querySelectorAll("[data-action='logout']").forEach((button) => button.addEventListener("click", async () => {
    try { if (typeof isCloudReady === "function" && isCloudReady()) await cloudSignOut(); } catch (error) { toast(friendlyCloudError(error)); }
    state.signedInUserId = ""; state.activeUserId = ""; state.activeView = "home"; state.authMode = "login"; draft = makeDraft(); saveState(); render(); toast("Çıkış yapıldı.");
  }));
  app.querySelectorAll("[data-action='auth-mode']").forEach((button) => button.addEventListener("click", () => { state.authMode = button.dataset.mode === "signup" ? "signup" : "login"; saveState(); render(); }));
  app.querySelectorAll("[data-action='share-receipt']").forEach((button) => button.addEventListener("click", shareReceipt));
  app.querySelectorAll("[data-action='settle-pending']").forEach((button) => button.addEventListener("click", () => settlePending(button.dataset.id)));
  app.querySelectorAll("[data-period]").forEach((button) => button.addEventListener("click", () => { state.reportPeriod = button.dataset.period; saveState(); render(); }));
  app.querySelectorAll("[data-movement-period]").forEach((button) => button.addEventListener("click", () => { state.movementPeriod = button.dataset.movementPeriod; saveState(); render(); }));
  app.querySelectorAll("[data-action='toggle-reaction-picker']").forEach((button) => button.addEventListener("click", () => { state.reactionPickerEntryId = state.reactionPickerEntryId === button.dataset.id ? "" : button.dataset.id; saveState(); render(); }));
  app.querySelectorAll("[data-action='set-reaction']").forEach((button) => button.addEventListener("click", () => { setReaction(button.dataset.id, button.dataset.emoji); state.reactionPickerEntryId = ""; saveState(); render(); toast("Tepki eklendi."); }));
  app.querySelectorAll("[data-custom-reaction]").forEach((form) => form.addEventListener("submit", (event) => { event.preventDefault(); const emoji = String(new FormData(form).get("emoji") || "").trim(); setReaction(form.dataset.id, emoji); state.reactionPickerEntryId = ""; saveState(); render(); }));
  app.querySelectorAll("[data-action='show-reconciliation']").forEach((button) => button.addEventListener("click", () => { state.reconciliationDetailId = state.reconciliationDetailId === button.dataset.id ? "" : button.dataset.id; saveState(); render(); }));
  app.querySelectorAll("[data-action='settle-transfer']").forEach((button) => button.addEventListener("click", () => {
    const index = Number(button.dataset.index);
    const transfers = minimumTransfers(calculateBalances());
    const addToKasa = Boolean(app.querySelector(`[data-cash-transfer="${index}"]`)?.checked);
    settleTransfer(transfers[index], addToKasa);
    saveState();
    render();
    toast(addToKasa ? "Ödendi ve kasaya işlendi." : "Ödendi işaretlendi.");
  }));
  app.querySelectorAll("[data-guess-form]").forEach((form) => form.addEventListener("submit", (event) => {
    event.preventDefault();
    const submitter = event.submitter;
    const data = new FormData(form);
    const predictedType = submitter?.value || String(data.get("predictedType") || "");
    const predictedAmount = parseAmount(data.get("predictedAmount"));
    const result = guessNotification(form.dataset.id, { predictedType, predictedAmount: predictedAmount || null });
    if (result.status === "already") return toast("Bu sürprizi zaten tahmin ettin.");
    saveState();
    render();
    toast(result.guess?.isCorrect ? "Kestirdin. +10 puan" : "Tahmin kaydedildi.");
  }));
  const onaySelect = app.querySelector("#onayModeSelect");
  if (onaySelect) onaySelect.addEventListener("change", () => { const user = currentUser(); if (user) user.onayModu = onaySelect.value; saveState(); render(); });

  app.querySelectorAll("[data-entry-type]").forEach((button) => button.addEventListener("click", () => {
    const form = app.querySelector("#entryForm");
    if (form) {
      draft.amountInput = formatAmountInput(form.elements.amount?.value);
      draft.currency = String(form.elements.currency?.value || draft.currency || "TRY");
      draft.exchangeRate = parseAmount(form.elements.exchangeRate?.value || draft.exchangeRate || 1);
      draft.date = String(form.elements.date?.value || draft.date || todayKey());
      draft.settlement = String(form.elements.settlement?.value || draft.settlement || "in");
      draft.notificationMode = String(form.elements.notificationMode?.value || draft.notificationMode || "open");
    }
    draft.type = button.dataset.entryType;
    draft.emoji = emojiOptionsFor(draft.type)[0] || entryTypes.find((type) => type.id === draft.type)?.emoji || draft.emoji;
    render();
  }));
  app.querySelectorAll("[data-chip='emoji']").forEach((button) => button.addEventListener("click", () => { draft.emoji = button.dataset.value; button.closest(".chips")?.querySelectorAll(".emoji-chip").forEach((chip) => chip.classList.toggle("selected", chip === button)); }));
  app.querySelectorAll("[data-suggestion]").forEach((button) => button.addEventListener("click", () => {
    const form = app.querySelector("#entryForm");
    if (!form) return;
    form.elements.headingName.value = button.dataset.suggestion;
    form.elements.shortName.value = button.dataset.short || button.dataset.suggestion;
    draft.emoji = button.dataset.emoji || draft.emoji;
  }));
  const projectSelect = app.querySelector("#projectSelect");
  if (projectSelect) projectSelect.addEventListener("change", () => { state.activeProjectId = projectSelect.value; draft = makeDraft(); saveState(); render(); });

  const accountForm = app.querySelector("#accountForm");
  if (accountForm) accountForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(accountForm);
    const name = String(data.get("userName") || "").trim();
    const email = String(data.get("email") || "").trim().toLowerCase();
    const password = normalizePassword(data.get("password"));
    if (!name) return toast("Ad soyad yazalım.");
    if (typeof isCloudReady === "function" && isCloudReady()) {
      if (!email || !email.includes("@")) return toast("Geçerli bir e-posta yazalım.");
      if (password.length < 6) return toast("Bulut hesabı için şifre en az 6 karakter olsun.");
      try {
        const result = await cloudSignUp({ name, email, password, nickname: String(data.get("nickname") || "").trim() });
        render();
        return toast(result.session ? "Hesap açıldı ve giriş yapıldı." : "Hesap açıldı. E-postadaki doğrulama linkini kontrol et.");
      } catch (error) { return toast(friendlyCloudError(error)); }
    }
    if (password.length < 4) return toast("Şifre en az 4 karakter olsun.");
    const user = createUser(name, password, { email, nickname: String(data.get("nickname") || "").trim(), linkToProject: false });
    state.signedInUserId = ""; state.activeUserId = ""; state.pendingLoginUserId = user.id; state.authMode = "login"; saveState(); render(); toast("Hesap oluşturuldu. Şimdi giriş yap.");
  });

  const loginForm = app.querySelector("#loginForm");
  if (loginForm) loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(loginForm);
    if (typeof isCloudReady === "function" && isCloudReady()) {
      const email = String(data.get("loginEmail") || "").trim().toLowerCase();
      const password = normalizePassword(data.get("loginPassword"));
      if (!email || !email.includes("@")) return toast("E-postanı yazalım.");
      if (!password) return toast("Şifreni yazalım.");
      try { await cloudSignIn({ email, password }); render(); return toast("Giriş yapıldı."); } catch (error) { return toast(friendlyCloudError(error)); }
    }
    const user = state.users.find((item) => item.id === String(data.get("loginUserId")));
    if (!state.users.length) return toast("Önce kullanıcı oluştur.");
    if (!user) return toast("Kullanıcı bulunamadı.");
    const password = normalizePassword(data.get("loginPassword"));
    if (user.password && normalizePassword(user.password) !== password) return toast("Şifre yanlış.");
    state.signedInUserId = user.id; state.activeUserId = user.id; state.pendingLoginUserId = ""; draft = makeDraft(); saveState(); render(); toast(`${profileLabel(user)} giriş yaptı.`);
  });

  const firstProjectForm = app.querySelector("#firstProjectForm");
  if (firstProjectForm) firstProjectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(firstProjectForm);
    const name = String(data.get("projectName") || "").trim();
    if (!name) return toast("Kasa adını yazalım.");
    createProject(name, String(data.get("purpose") || "").trim() || "Genel kasa", { templateId: state.selectedTemplateId || "" });
    try { saveState(); if (typeof isCloudReady === "function" && isCloudReady()) await cloudPushState(); render(); toast("Kasa oluşturuldu."); } catch (error) { toast(friendlyCloudError(error)); }
  });

  const joinProjectForm = app.querySelector("#joinProjectForm");
  if (joinProjectForm) joinProjectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const code = normalizeCode(new FormData(joinProjectForm).get("projectCode"));
    if (!code) return toast("Proje kodunu yazalım.");
    if (typeof isCloudReady === "function" && isCloudReady()) {
      try { await cloudJoinProjectByCode(code); render(); return toast("Kasaya katıldın."); } catch (error) { return toast(friendlyCloudError(error)); }
    }
    const project = state.projects.find((item) => normalizeCode(projectCode(item)) === code);
    if (!project) return toast("Bu kod bu cihazda yok.");
    const userId = state.activeUserId || state.users[0]?.id;
    if (userId && !project.memberIds.includes(userId)) project.memberIds.push(userId);
    state.activeProjectId = project.id; draft = makeDraft(); saveState(); render(); toast("Projeye katıldın.");
  });

  const entryForm = app.querySelector("#entryForm");
  if (entryForm) bindEntryForm(entryForm);
  const statementForm = app.querySelector("#statementForm");
  if (statementForm) bindStatementForm(statementForm);
  const goalForm = app.querySelector("#goalForm");
  if (goalForm) goalForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(goalForm);
    const title = String(data.get("title") || "").trim();
    const targetAmount = parseAmount(data.get("targetAmount"));
    if (!title || !targetAmount) return toast("Hedef adı ve tutarı yaz.");
    const items = String(data.get("items") || "").split(",").map((part) => part.trim()).filter(Boolean).map((part) => {
      const match = part.match(/(.+?)\s+([\d.,]+)$/);
      return { name: match ? match[1].trim() : part, price: match ? parseAmount(match[2]) : 0, purchased: false };
    });
    state.goals.push({ id: makeId(), projectId: activeProject().id, createdBy: currentUser()?.id || "", title, targetAmount, currentAmount: 0, deadline: String(data.get("deadline") || ""), items, status: "active", createdAt: blockNow() });
    saveState(); render(); toast("Hedef eklendi.");
  });
  app.querySelectorAll("#userForm, #projectUserForm").forEach((userForm) => userForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = String(new FormData(userForm).get("userName") || "").trim();
    if (!name) return toast((typeof isCloudReady === "function" && isCloudReady()) ? "Kasaya eklenecek e-postayı yazalım." : "Kasaya eklenecek kullanıcı adını yazalım.");
    if (typeof isCloudReady === "function" && isCloudReady()) {
      try { await cloudAddMemberByEmail(name); render(); return toast("Kullanıcı kasaya eklendi."); } catch (error) { return toast(friendlyCloudError(error)); }
    }
    const result = addUserToActiveProjectByName(name);
    if (result.status === "forbidden") return toast("Kullanıcı eklemeyi sadece kasa sahibi yapar.");
    if (result.status === "missing-user") return toast("Bu adda kullanıcı yok. Önce profilini oluştur.");
    if (result.status === "already") return toast(`${shortName(result.user.name)} zaten bu kasada.`);
    saveState(); render(); toast(`${shortName(result.user.name)} kasaya eklendi.`);
  }));
  app.querySelectorAll("[data-alias-form]").forEach((aliasForm) => aliasForm.addEventListener("submit", (event) => { event.preventDefault(); const result = setProjectMemberAlias(aliasForm.dataset.id, new FormData(aliasForm).get("alias")); if (result.status === "forbidden") return toast("Lakap vermeyi sadece kasa sahibi yapar."); saveState(); render(); toast("Kasa içi lakap kaydedildi."); }));
  const projectForm = app.querySelector("#projectForm");
  if (projectForm) projectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(projectForm);
    const name = String(data.get("projectName") || "").trim();
    if (!name) return toast("Proje adını yazalım.");
    createProject(name, String(data.get("purpose") || "").trim() || "Genel kasa", { templateId: state.selectedTemplateId || "" });
    try { saveState(); if (typeof isCloudReady === "function" && isCloudReady()) await cloudPushState(); render(); toast("Proje eklendi."); } catch (error) { toast(friendlyCloudError(error)); }
  });
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
    matches.innerHTML = items.map((item) => `<button class="chip" data-suggestion="${item.name}" data-short="${item.shortName}" data-emoji="${item.emoji}" type="button">${item.emoji} ${item.shortName}</button>`).join("");
    bindScreen();
  });
  entryForm.addEventListener("submit", async (event) => {
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
    const heading = ensureHeading(headingName, short, draft.emoji || emojiForHeadingName(headingName));
    const userId = currentUser()?.id || String(data.get("userId"));
    const date = String(data.get("date") || todayKey());
    const settlement = String(data.get("settlement")) === "in";
    if (userId && activeProject() && !activeProject().memberIds.includes(userId)) activeProject().memberIds.push(userId);
    const split = splitForEntry(draft.type, settlement, userId);
    const media = await mediaFromForm(data, { emoji: "notificationEmoji", gif: "notificationGif", photo: "photo" });
    const successMedia = await mediaFromForm(data, { emoji: "successReaction", gif: "successGif", photo: "successPhoto" });
    const failMedia = await mediaFromForm(data, { emoji: "failReaction", gif: "failGif", photo: "failPhoto" });
    const now = blockNow();
    const entry = {
      id: makeId(),
      projectId: state.activeProjectId,
      type: draft.type,
      amount,
      enteredAmount,
      currency,
      exchangeRate,
      headingId: heading.id,
      shortName: heading.shortName,
      emoji: heading.emoji,
      userId,
      paidById: userId,
      splitWith: split.splitWith,
      splitRatio: split.splitRatio,
      date,
      note: String(data.get("note") || "").trim(),
      photoName: media.photoName,
      photoData: media.photoData,
      ocrRawText: null,
      ocrParsedAmount: null,
      settlement,
      status: ["receivable", "payable"].includes(draft.type) ? "pending" : "done",
      autoRevealAt: "",
      rateLockedAt: now,
      createdAt: now,
    };
    state.entries.unshift(entry);
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
    saveState();
    state.activeView = "home";
    draft.amountInput = "";
    draft.date = todayKey();
    render();
    toast(delay || "Hareket kasaya girdi.");
  });
}

function bindStatementForm(statementForm) {
  statementForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(statementForm);
    const bankId = String(data.get("bankName") || "other");
    const month = String(data.get("month") || monthKey());
    const file = formFile(data, "statementFile");
    if (!file) return toast("CSV dosyası seç.");
    const text = await file.text();
    const baseMap = bankColumnMaps[bankId] || bankColumnMaps.other;
    const manualMap =
      bankId === "other"
        ? {
            ...baseMap,
            dateCol: Number(data.get("dateCol") || baseMap.dateCol),
            descCol: Number(data.get("descCol") || baseMap.descCol),
            amountCol: Number(data.get("amountCol") || baseMap.amountCol),
            delimiter: String(data.get("delimiter") || baseMap.delimiter || ";"),
          }
        : baseMap;
    const rows = parseCsvRows(text, manualMap);
    if (!rows.length) return toast("CSV içinde okunabilir satır yok.");
    addReconciliation({ bankId, month, rows });
    saveState();
    state.activeView = "home";
    render();
    toast("Ekstre karşılaştırıldı.");
  });
}

/* Latest UX pass: project-first home, separate member profile, compact media, desk calendar. */

function goToView(view, options = {}) {
  if (state.activeView !== view) state.previousView = state.activeView;
  state.activeView = view;
  if (options.groupMode) state.groupMode = options.groupMode;
  if (options.memberId !== undefined) state.activeMemberProfileId = options.memberId;
  if (options.lockedEntryType !== undefined) state.lockedEntryType = options.lockedEntryType;
  saveState();
  render();
}

function projectPhotoHtml(project, className = "project-photo") {
  if (project?.photoData) return `<img class="${className}" src="${project.photoData}" alt="${project.name || "Proje"}" />`;
  return `<div class="${className} project-photo-empty">${String(project?.name || "K").slice(0, 1).toLocaleUpperCase("tr-TR")}</div>`;
}

function memberAvatarHtml(user, project = activeProject(), className = "member-avatar") {
  const projectPhoto = project?.memberPhotos?.[user?.id];
  if (projectPhoto?.photoData) return `<img class="${className}" src="${projectPhoto.photoData}" alt="${user?.name || "Üye"}" />`;
  if (user?.photoData) return `<img class="${className}" src="${user.photoData}" alt="${user.name || "Üye"}" />`;
  return `<span class="${className}">${String(profileLabel(user) || "K").slice(0, 1).toLocaleUpperCase("tr-TR")}</span>`;
}

function projectMemberBulletList(project = activeProject()) {
  const members = activeMembers();
  if (!members.length) return `<li>Henüz üye yok</li>`;
  return members.map((member) => `<li><button class="text-link" data-action="open-member-profile" data-id="${member.id}" type="button">${profileLabel(member)}</button></li>`).join("");
}

function projectSummaryRow(project) {
  const totals = calculateTotals(blockRawEntries(project));
  const members = state.users.filter((user) => project.memberIds.includes(user.id));
  return `
    <button class="project-list-row ${project.id === state.activeProjectId ? "active" : ""}" data-action="activate-project" data-id="${project.id}" type="button">
      ${projectPhotoHtml(project, "project-thumb")}
      <span>
        <strong>${project.name}</strong>
        <small>${project.purpose || "Genel kasa"} · ${members.length} üye · ${money(totals.comfortable)}</small>
      </span>
    </button>
  `;
}

function createMemberNotification(addedUserId, project = activeProject()) {
  const actor = currentUser();
  const added = state.users.find((user) => user.id === addedUserId);
  if (!actor || !project || !added) return null;
  const recipients = project.memberIds.filter((id) => id !== actor.id);
  if (!recipients.length) return null;
  const notification = {
    id: makeId(),
    projectId: project.id,
    entryId: "",
    actorId: actor.id,
    recipients,
    mode: "member",
    actualType: "member",
    title: `${profileLabel(added)} kasaya eklendi`,
    amount: 0,
    emoji: "+",
    photoName: "",
    photoData: "",
    gif: "",
    guessDeadline: "",
    revealedAt: blockNow(),
    isCompleted: true,
    notificationType: "member",
    reactionEmoji: "+",
    guesses: [],
    createdAt: blockNow(),
  };
  state.notifications = state.notifications || [];
  state.notifications.unshift(notification);
  return notification;
}

function addMonthsToKey(key, months) {
  const date = dateFromKey(key || todayKey());
  date.setMonth(date.getMonth() + Number(months || 0));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function renderHome() {
  const project = activeProject();
  const user = currentUser();
  const totals = calculateTotals(blockRawEntries(project));
  const recent = actualEntries().slice(0, 4);
  const upcoming = pendingEntries().slice(0, 2);
  const notificationCount = notificationEntries().length;
  const surpriseCount = pendingSurpriseCount(project);

  return `
    <section class="account-strip">
      <div>
        <span class="field-label">Oturum</span>
        <strong>${profileLabel(user)}</strong>
      </div>
      <div class="account-actions">
        <button class="tiny-button" data-action="open-notifications" type="button">Bildirimler${notificationCount ? ` (${notificationCount})` : ""}</button>
        <button class="tiny-button" data-action="logout" type="button">Çıkış</button>
      </div>
    </section>

    <section class="hero">
      <div class="hero-row">
        <div>
          <p class="hero-title">${project?.purpose || "Genel kasa"}</p>
          <p class="hero-money">${money(totals.comfortable)}</p>
          <p class="hero-note">Rahat kalan: onaylı gelir - onaylı gider + beklenen - yaklaşan</p>
          ${surpriseCount ? `<p class="surprise-counter">${surpriseCount} bekleyen sürpriz var. Bakiye oyun bitince açılır.</p>` : ""}
        </div>
        <span class="quick-pill">${totals.comfortable >= 0 ? "İyi" : "Dikkat"}</span>
      </div>
    </section>

    ${dailyWarningCards()}
    ${weeklySummaryCard()}
    ${monthlyComparisonCard()}
    ${reconciliationCards()}

    <section class="card active-project-card">
      <div class="section-head">
        <div class="project-card-title">
          ${projectPhotoHtml(project)}
          <div>
            <button class="project-title-button" data-action="open-active-project" type="button">${project?.name || "Kasa"}</button>
            <ul class="member-bullets">${projectMemberBulletList(project)}</ul>
          </div>
        </div>
        <button class="tiny-button" data-action="open-projects-list" type="button">Yeni proje oluştur</button>
      </div>
      <label style="display:block; margin-top: 12px;">
        <span class="field-label">Aktif proje</span>
        <select class="select-input" id="projectSelect">
          ${state.projects.map((item) => `<option value="${item.id}" ${item.id === state.activeProjectId ? "selected" : ""}>${item.name}</option>`).join("")}
        </select>
      </label>
    </section>

    <section class="quick-actions">
      <button class="action-button income" data-action="go-add-income" type="button"><span>+</span>Gelir ekle</button>
      <button class="action-button expense" data-action="go-add-expense" type="button"><span>-</span>Gider ekle</button>
    </section>

    <section class="grid-2">
      <article class="stat-card"><p class="stat-label">Gelir</p><p class="stat-value positive">${money(totals.income)}</p></article>
      <article class="stat-card"><p class="stat-label">Gider</p><p class="stat-value warning">${money(totals.expense)}</p></article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="receivable"><p class="stat-label">Beklenen</p><p class="stat-value">${money(totals.receivable)}</p></article>
      <article class="stat-card" data-action="show-pending-detail" data-detail="payable"><p class="stat-label">Yaklaşan</p><p class="stat-value">${money(totals.payable)}</p></article>
    </section>

    ${
      state.pendingDetail
        ? `<section class="card"><div class="section-head"><div><h2>${state.pendingDetail === "receivable" ? "Beklenen gelirler" : "Yaklaşan ödemeler"}</h2><p>Detay dökümü.</p></div><button class="tiny-button" data-action="hide-pending-detail" type="button">Kapat</button></div><div class="expense-list">${pendingDetailRows(state.pendingDetail)}</div></section>`
        : ""
    }

    <section class="card">
      <div class="section-head"><div><h2>Yaklaşanlar</h2><p>Ödeme hatırlatıcıları ve taksitler.</p></div></div>
      <div class="expense-list">${upcoming.length ? upcoming.map(pendingRow).join("") : `<div class="empty-state">Henüz beklenen alacak veya yaklaşan ödeme yok.</div>`}</div>
    </section>

    <section class="card">
      <div class="section-head"><div><h2>Son hareketler</h2><p>Son 4 hareket.</p></div><button class="tiny-button" data-action="open-movements" type="button">Tümü</button></div>
      <div class="expense-list">${recent.length ? recent.map(entryRow).join("") : `<div class="empty-state">Kasa boş. İlk hareketi ekleyerek başla.</div>`}</div>
    </section>
  `;
}

function headingAutocompleteHtml(typeId) {
  const headings = projectHeadings();
  const suggestions = headingSuggestionsFor(typeId);
  const combined = [...headings.map((heading) => ({ ...heading, source: "project" })), ...suggestions.map((item) => ({ ...item, source: "suggestion" }))];
  return `
    <div class="chips heading-matches text-only" id="headingMatches">
      ${combined
        .slice(0, 8)
        .map((item) => `<button class="chip" data-suggestion="${item.name}" data-short="${item.name}" type="button">${item.name}</button>`)
        .join("")}
    </div>
  `;
}

function mediaHubHtml(prefix = "notification") {
  const emojiName = prefix === "notification" ? "notificationEmoji" : `${prefix}Reaction`;
  const gifName = prefix === "notification" ? "notificationGif" : `${prefix}Gif`;
  const photoName = prefix === "notification" ? "photo" : `${prefix}Photo`;
  const emojiValue = prefix === "notification" ? draft.notificationEmoji || "🎲" : prefix === "success" ? draft.successReaction || "✅" : draft.failReaction || "🙂";
  const gifValue = prefix === "notification" ? draft.notificationGif || "" : prefix === "success" ? draft.successGif || "" : draft.failGif || "";
  return `
    <div class="media-toolbar" data-media-prefix="${prefix}">
      <input class="emoji-input" name="${emojiName}" maxlength="4" value="${emojiValue}" autocomplete="off" aria-label="Emoji" />
      <input class="gif-input" name="${gifName}" placeholder="GIF / sticker" value="${gifValue}" autocomplete="off" />
      <label class="media-file-button">
        <span data-file-label>Fotoğraf</span>
        <input name="${photoName}" type="file" accept="image/*" />
      </label>
    </div>
  `;
}

function reactionSetupHtml() {
  return `
    <div class="reaction-compact">
      <span class="field-label">Tahmin sonucu tepkileri</span>
      <div class="reaction-grid compact-reactions">
        <div><strong>Doğru</strong>${mediaHubHtml("success")}</div>
        <div><strong>Yanlış</strong>${mediaHubHtml("fail")}</div>
      </div>
    </div>
  `;
}

function renderAdd() {
  if ((state.addTab || "entry") === "statement" && !state.lockedEntryType) return renderStatementAdd();
  const type = entryTypes.find((item) => item.id === draft.type) || entryTypes[0];
  const locked = Boolean(state.lockedEntryType);
  const amountValue = draft.amountInput || "";
  const dateLabel = { expense: "Gider tarihi", income: "Gelir tarihi", receivable: "Beklenen gelir tarihi", payable: "Beklenen ödeme tarihi" }[type.id];
  const headingLabel = type.id === "income" || type.id === "receivable" ? "Gelir başlığı" : "Gider başlığı";
  return `
    ${
      locked
        ? ""
        : `<section class="segmented">
            <button class="segment active" data-add-tab="entry" type="button">Hareket</button>
            <button class="segment" data-add-tab="statement" type="button">Ekstre</button>
            <button class="segment" data-action="open-headings" type="button">Başlık</button>
          </section>`
    }
    <form class="form-card form-grid" id="entryForm">
      <div class="section-head"><div><h2>${type.label} ekle</h2><p>${activeProject().name} içine kaydedilir.</p></div></div>
      ${locked ? `<input type="hidden" name="entryType" value="${type.id}" />` : `<div class="type-grid">${entryTypes.map((item) => `<button class="type-chip ${draft.type === item.id ? "selected" : ""}" data-entry-type="${item.id}" type="button"><span>${item.label.slice(0, 1)}</span>${item.label}</button>`).join("")}</div>`}
      <input type="hidden" name="userId" value="${currentUser()?.id || ""}" />
      <div><label class="field-label" for="amount">Tutar</label><input class="amount-input" id="amount" name="amount" inputmode="numeric" placeholder="1.000" value="${amountValue}" autocomplete="off" /></div>
      <div class="grid-2 currency-grid ${draft.currency === "TRY" ? "single" : ""}">
        <label><span class="field-label">Para birimi</span><select class="select-input" name="currency">${currencyOptions.map((item) => `<option value="${item.code}" ${draft.currency === item.code ? "selected" : ""}>${item.label}</option>`).join("")}</select></label>
        <label class="fx-rate-field ${draft.currency === "TRY" ? "is-hidden" : ""}"><span class="field-label">Kur</span><input class="select-input" name="exchangeRate" inputmode="decimal" placeholder="32,50" value="${draft.exchangeRate || 1}" autocomplete="off" /></label>
      </div>
      <div class="grid-2 timing-grid ${type.id === "expense" ? "" : "single"}">
        <label><span class="field-label">${dateLabel}</span><input class="select-input" name="date" type="date" value="${draft.date || todayKey()}" /></label>
        ${
          type.id === "expense"
            ? `<label><span class="field-label">Hesaplaşma</span><select class="select-input" name="settlement"><option value="in" ${draft.settlement === "in" ? "selected" : ""}>Dahil</option><option value="out" ${draft.settlement === "out" ? "selected" : ""}>Dahil değil</option></select></label>`
            : `<input type="hidden" name="settlement" value="out" />`
        }
      </div>
      <div class="heading-media-row">
        <label class="heading-field"><span class="field-label" for="headingName">${headingLabel}</span><input class="text-input" id="headingName" name="headingName" placeholder="Başlık yaz" autocomplete="off" />${headingAutocompleteHtml(type.id)}</label>
        ${mediaHubHtml()}
      </div>
      ${
        type.id === "expense"
          ? `<details class="soft-details"><summary>Taksitli harcama</summary><div class="inline-form installment-fields"><label><span class="field-label">Taksit sayısı</span><input class="text-input" name="installmentCount" inputmode="numeric" placeholder="1" autocomplete="off" /></label><span class="field-help">2 ve üstü girilirse kalan aylar takvimde ödeme olarak görünür.</span></div></details>`
          : ""
      }
      ${
        ["income", "expense"].includes(type.id)
          ? `<details class="soft-details"><summary>Bildirim oyunu</summary><div class="form-grid notification-options"><label><span class="field-label">Bildirim modu</span><select class="select-input" name="notificationMode"><option value="open" ${draft.notificationMode === "open" ? "selected" : ""}>Açık bildir</option><option value="surprise" ${draft.notificationMode === "surprise" ? "selected" : ""}>Sürpriz tahmin</option><option value="silent" ${draft.notificationMode === "silent" ? "selected" : ""}>Sessiz kaydet</option></select></label>${reactionSetupHtml()}</div></details>`
          : `<input type="hidden" name="notificationMode" value="silent" />`
      }
      <button class="primary-button" type="submit">Kaydet</button>
    </form>
  `;
}
