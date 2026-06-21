import { isSameDay, isSameMonth, isSameWeek } from "./date";
import { entryTlAmount } from "./money";
import type { AppState, Entry, Notification, PeriodSummary, Project, RhythmScore, Transfer } from "./types";

export function validateSplitRatio(splitRatio: number[]) {
  const total = splitRatio.reduce((sum, item) => sum + item, 0);
  return Math.abs(total - 1) < 0.001;
}

export function entryIsRevealed(entry: Entry, now = new Date()) {
  if (!entry.lockedNotificationId) return true;
  if (entry.revealedAt) return true;
  if (entry.autoRevealAt && new Date(entry.autoRevealAt).getTime() <= now.getTime()) return true;
  return false;
}

export function entryIsConfirmed(entry: Entry, now = new Date()) {
  return entry.status === "done" && entryIsRevealed(entry, now);
}

export function pendingSurpriseCountForUser(state: AppState, userId: string) {
  return state.notifications.filter((notification) => {
    if (notification.actorId === userId) return false;
    if (!notification.recipients.includes(userId)) return false;
    if (notification.isCompleted) return false;
    const entry = state.entries.find((item) => item.id === notification.entryId);
    return Boolean(entry?.lockedNotificationId && !entry.revealedAt);
  }).length;
}

export function entryProject(state: AppState, entry: Entry) {
  return state.projects.find((project) => project.id === entry.projectId);
}

export function userIsProjectMember(project: Project, userId: string, entryDate?: string) {
  const member = project.members.find((item) => item.userId === userId);
  if (!member) return false;
  if (!entryDate) return true;
  return new Date(member.memberSince).getTime() <= new Date(entryDate).getTime();
}

export function personalEntryImpact(state: AppState, entry: Entry, userId: string, now = new Date()) {
  const project = entryProject(state, entry);
  if (!project) return 0;
  if (!entryIsConfirmed(entry, now)) return 0;
  if (!userIsProjectMember(project, userId, entry.date)) return 0;

  const tlAmount = entryTlAmount(entry.amount, entry.exchangeRate);
  const splitIndex = entry.splitWith.indexOf(userId);
  const share = splitIndex >= 0 ? tlAmount * entry.splitRatio[splitIndex] : 0;
  const paid = entry.paidById === userId ? tlAmount : 0;

  if (entry.type === "income") return share || paid;
  return paid - share;
}

export function projectEntryImpact(entry: Entry, now = new Date()) {
  if (!entryIsConfirmed(entry, now)) return 0;
  const tlAmount = entryTlAmount(entry.amount, entry.exchangeRate);
  return entry.type === "income" ? tlAmount : -tlAmount;
}

export function periodSummary(state: AppState, userId: string, filter: (entry: Entry) => boolean, now = new Date()): PeriodSummary {
  const result: PeriodSummary = {
    income: 0,
    expense: 0,
    net: 0,
    pendingIncome: 0,
    upcomingPayment: 0
  };

  state.entries.filter(filter).forEach((entry) => {
    const impact = personalEntryImpact(state, entry, userId, now);
    if (impact > 0) result.income += impact;
    if (impact < 0) result.expense += Math.abs(impact);

    const dateInFuture = new Date(entry.date).getTime() > now.getTime();
    if (dateInFuture && entry.type === "income") result.pendingIncome += entryTlAmount(entry.amount, entry.exchangeRate);
    if (dateInFuture && entry.type === "expense") result.upcomingPayment += entryTlAmount(entry.amount, entry.exchangeRate);
  });

  result.net = result.income - result.expense;
  return result;
}

export function todaySummary(state: AppState, userId: string, now = new Date()) {
  return periodSummary(state, userId, (entry) => isSameDay(entry.date, now), now);
}

export function weekSummary(state: AppState, userId: string, now = new Date()) {
  return periodSummary(state, userId, (entry) => isSameWeek(entry.date, now), now);
}

export function monthSummary(state: AppState, userId: string, now = new Date()) {
  return periodSummary(state, userId, (entry) => isSameMonth(entry.date, now), now);
}

export function projectSummary(state: AppState, projectId: string, now = new Date()) {
  return state.entries.filter((entry) => entry.projectId === projectId).reduce(
    (summary, entry) => {
      const impact = projectEntryImpact(entry, now);
      if (impact > 0) summary.income += impact;
      if (impact < 0) summary.expense += Math.abs(impact);
      summary.net += impact;
      return summary;
    },
    { income: 0, expense: 0, net: 0 }
  );
}

export function rhythmScore(summary: PeriodSummary): RhythmScore {
  if (summary.net >= 0) {
    const score = Math.min(99, 70 + Math.round(summary.net / 1000));
    return { score, label: score >= 85 ? "Güçlü" : "Dengede", message: "Gelir etkisi gider baskısının üzerinde." };
  }

  const pressure = Math.min(60, Math.round(Math.abs(summary.net) / 1000));
  const score = Math.max(12, 70 - pressure);
  return { score, label: score < 45 ? "Dikkat" : "Dengede", message: "Bu dönem gider etkisi öne geçmiş." };
}

export function minimumTransfers(balances: Record<string, number>): Transfer[] {
  const debtors = Object.entries(balances)
    .filter(([, amount]) => amount < -0.01)
    .map(([userId, amount]) => ({ userId, amount: Math.abs(amount) }))
    .sort((a, b) => b.amount - a.amount);
  const creditors = Object.entries(balances)
    .filter(([, amount]) => amount > 0.01)
    .map(([userId, amount]) => ({ userId, amount }))
    .sort((a, b) => b.amount - a.amount);
  const transfers: Transfer[] = [];

  while (debtors.length && creditors.length) {
    const debtor = debtors[0];
    const creditor = creditors[0];
    const amount = Math.min(debtor.amount, creditor.amount);
    transfers.push({ fromUserId: debtor.userId, toUserId: creditor.userId, amount: Math.round(amount * 100) / 100 });
    debtor.amount -= amount;
    creditor.amount -= amount;
    if (debtor.amount <= 0.01) debtors.shift();
    if (creditor.amount <= 0.01) creditors.shift();
  }

  return transfers;
}

export function notificationIsVisibleForUser(notification: Notification, userId: string) {
  return notification.actorId === userId || notification.recipients.includes(userId);
}
