import type {
  AppState,
  CurrencyCode,
  Entry,
  EntryMedia,
  EntryStatus,
  EntryType,
  Goal,
  Notification,
  Profile,
  Project,
  ProjectMember,
  Reaction,
  Reconciliation,
  Settlement,
  StoredInsight,
  UserPlan
} from "./types";

type JsonRecord = Record<string, unknown>;

export type ProfileRow = {
  id: string;
  email?: string | null;
  name?: string | null;
  nickname?: string | null;
  photo_data?: string | null;
  plan?: string | null;
  total_score?: number | string | null;
  correct_guesses?: number | string | null;
  total_guesses?: number | string | null;
};

export type ProjectRow = {
  id: string;
  name?: string | null;
  purpose?: string | null;
  type?: string | null;
  code?: string | null;
  created_by?: string | null;
  photo_data?: string | null;
  default_currency?: string | null;
  default_headings?: string[] | null;
  split_type?: string | null;
  template_id?: string | null;
  join_approval_required?: boolean | null;
  archived_at?: string | null;
};

export type ProjectMemberRow = {
  project_id: string;
  user_id: string;
  role?: string | null;
  alias?: string | null;
  photo_data?: string | null;
  member_since?: string | null;
  created_at?: string | null;
  familiarity_scores?: JsonRecord | null;
};

export type EntryRow = {
  id: string;
  project_id: string;
  user_id?: string | null;
  paid_by_id?: string | null;
  type?: string | null;
  amount?: number | string | null;
  entered_amount?: number | string | null;
  currency?: string | null;
  exchange_rate?: number | string | null;
  rate_locked_at?: string | null;
  heading_id?: string | null;
  heading_name?: string | null;
  short_name?: string | null;
  title?: string | null;
  note?: string | null;
  emoji?: string | null;
  entry_date?: string | null;
  date?: string | null;
  status?: string | null;
  split_with?: string[] | null;
  split_ratio?: Array<number | string> | null;
  locked_notification_id?: string | null;
  revealed_at?: string | null;
  auto_reveal_at?: string | null;
  media_type?: string | null;
  media_value?: string | null;
  photo_data?: string | null;
  ocr_raw_text?: string | null;
  ocr_parsed_amount?: number | string | null;
  installment_group_id?: string | null;
  installment_index?: number | string | null;
  installment_count?: number | string | null;
  settlement?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type NotificationRow = {
  id: string;
  project_id: string;
  entry_id?: string | null;
  actor_id?: string | null;
  recipients?: string[] | null;
  mode?: string | null;
  type?: string | null;
  notification_type?: string | null;
  actual_type?: string | null;
  title?: string | null;
  amount?: number | string | null;
  guess_deadline?: string | null;
  game_phase?: number | string | null;
  is_completed?: boolean | null;
  revealed_at?: string | null;
  guesses?: Array<JsonRecord> | null;
  hide_actor?: boolean | null;
  phase1_completed?: boolean | null;
  phase2_completed?: boolean | null;
  phase3_completed?: boolean | null;
  phase1_guesses?: Array<JsonRecord> | null;
  phase2_guesses?: Array<JsonRecord> | null;
  phase3_options?: string[] | null;
  phase3_correct?: number | string | null;
  phase3_guesses?: Array<JsonRecord> | null;
  phase3_image?: string | null;
  actor_wrong_reaction?: JsonRecord | null;
  actor_correct_reaction?: JsonRecord | null;
  type_wrong_reaction?: JsonRecord | null;
  type_correct_reaction?: JsonRecord | null;
  category_wrong_reaction?: JsonRecord | null;
  category_correct_reaction?: JsonRecord | null;
  created_at?: string | null;
};

export type GoalRow = {
  id: string;
  project_id?: string | null;
  created_by?: string | null;
  title?: string | null;
  target_amount?: number | string | null;
  current_amount?: number | string | null;
  deadline?: string | null;
  status?: string | null;
  created_at?: string | null;
};

export type ReactionRow = {
  id: string;
  entry_id: string;
  project_id: string;
  user_id: string;
  emoji?: string | null;
  created_at?: string | null;
};

export type SettlementRow = {
  id: string;
  project_id: string;
  from_user_id: string;
  to_user_id: string;
  amount?: number | string | null;
  settled_at?: string | null;
  note?: string | null;
};

export type ReconciliationRow = {
  id: string;
  user_id: string;
  project_id?: string | null;
  month?: string | null;
  bank_name?: string | null;
  format_type?: string | null;
  uploaded_at?: string | null;
  statement_total?: number | string | null;
  kasa_total?: number | string | null;
  diff?: number | string | null;
  status?: string | null;
  raw_rows?: Array<JsonRecord> | null;
  matched_entry_ids?: string[] | null;
  unmatched_rows?: Array<JsonRecord> | null;
  ai_analysis?: JsonRecord | null;
};

export type InsightRow = {
  id: string;
  user_id: string;
  project_id?: string | null;
  type?: string | null;
  period?: string | null;
  insight_data?: JsonRecord | null;
  message?: string | null;
  action_suggestion?: string | null;
  is_read?: boolean | null;
  created_at?: string | null;
};

export type BuildCloudStateInput = {
  activeUserId: string;
  profiles: ProfileRow[];
  projects: ProjectRow[];
  members: ProjectMemberRow[];
  entries: EntryRow[];
  notifications: NotificationRow[];
  goals?: GoalRow[];
  reactions?: ReactionRow[];
  settlements?: SettlementRow[];
  reconciliations?: ReconciliationRow[];
  insights?: InsightRow[];
};

export type CommercialEntryDraft = {
  projectId: string;
  userId: string;
  paidById: string;
  type: EntryType;
  title: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  entryDate: string;
  splitWith: string[];
  splitRatio: number[];
  surprise?: boolean;
};

function asNumber(value: number | string | null | undefined, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.replace(",", ".");
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function asInteger(value: number | string | null | undefined, fallback = 0) {
  return Math.trunc(asNumber(value, fallback));
}

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

function asRecord(value: JsonRecord | null | undefined): JsonRecord {
  return value && typeof value === "object" ? value : {};
}

function asNumberRecord(value: JsonRecord | null | undefined): Record<string, number> {
  return Object.fromEntries(
    Object.entries(asRecord(value))
      .map(([key, item]) => [key, asNumber(typeof item === "number" || typeof item === "string" ? item : null, Number.NaN)] as const)
      .filter(([, item]) => Number.isFinite(item))
  );
}

function asCurrency(value: string | null | undefined): CurrencyCode {
  const normalized = (value || "TL").toUpperCase();
  if (normalized === "TRY") return "TL";
  if (normalized === "USD" || normalized === "EUR" || normalized === "GBP" || normalized === "TL") return normalized;
  return "TL";
}

function asStatus(value: string | null | undefined): EntryStatus {
  return value === "pending" ? "pending" : "done";
}

function asPlan(value: string | null | undefined): UserPlan {
  return value === "premium" ? "premium" : "free";
}

function asEntryType(value: string | null | undefined): EntryType {
  return value === "income" ? "income" : "expense";
}

function asMode(value: string | null | undefined): Notification["mode"] {
  if (value === "surprise" || value === "silent") return value;
  return "open";
}

function asSplitType(value: string | null | undefined): Project["splitType"] {
  if (value === "weighted" || value === "individual") return value;
  return "equal";
}

function asFormatType(value: string | null | undefined): Reconciliation["formatType"] {
  if (value === "pdf" || value === "image" || value === "xlsx") return value;
  return "csv";
}

function asReconciliationStatus(value: string | null | undefined): Reconciliation["status"] {
  if (value === "matched" || value === "unmatched") return value;
  return "pending";
}

function asInsightType(value: string | null | undefined): StoredInsight["type"] {
  if (value === "weekly" || value === "monthly" || value === "goal" || value === "anomaly" || value === "coaching" || value === "success") return value;
  return "daily";
}

function asGoalStatus(value: string | null | undefined): Goal["status"] {
  if (value === "completed" || value === "paused") return value;
  return "active";
}

function asMediaType(value: string | null | undefined): EntryMedia["type"] | null {
  if (value === "emoji" || value === "gif" || value === "photo" || value === "sticker") return value;
  return null;
}

function asIsoDate(value: string | null | undefined) {
  if (!value) return new Date().toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}

function asDateOnlyIso(value: string | null | undefined) {
  if (!value) return new Date().toISOString();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T12:00:00.000Z`;
  return asIsoDate(value);
}

function normalizeRatios(ratios: Array<number | string>) {
  return ratios.map((ratio) => asNumber(ratio));
}

function normalizeSplit(entry: EntryRow) {
  const payerId = entry.paid_by_id || entry.user_id || "";
  const splitWith = asArray(entry.split_with).filter(Boolean);
  const safeSplitWith = splitWith.length ? splitWith : [payerId].filter(Boolean);
  const ratioRows = normalizeRatios(asArray(entry.split_ratio));
  const ratioTotal = ratioRows.reduce((sum, item) => sum + item, 0);
  const splitRatio =
    ratioRows.length === safeSplitWith.length && Math.abs(ratioTotal - 1) < 0.001
      ? ratioRows
      : safeSplitWith.map(() => 1 / safeSplitWith.length);
  return { splitWith: safeSplitWith, splitRatio };
}

function mapEntryMedia(row: EntryRow): EntryMedia | undefined {
  const mediaType = asMediaType(row.media_type);
  if (mediaType && row.media_value) return { type: mediaType, value: row.media_value };
  if (row.photo_data) return { type: "photo", value: row.photo_data };
  if (row.emoji) return { type: "emoji", value: row.emoji };
  return undefined;
}

export function mapCloudProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.name || row.nickname || row.email || "Kullanici",
    email: row.email || "",
    plan: asPlan(row.plan),
    nickname: row.nickname || undefined,
    photoUrl: row.photo_data || undefined,
    totalScore: asInteger(row.total_score),
    correctGuesses: asInteger(row.correct_guesses),
    totalGuesses: asInteger(row.total_guesses)
  };
}

export function mapCloudProject(row: ProjectRow, members: ProjectMemberRow[]): Project {
  const projectMembers: ProjectMember[] = members
    .filter((member) => member.project_id === row.id)
    .map((member) => ({
      userId: member.user_id,
      memberSince: asDateOnlyIso(member.member_since || member.created_at),
      role: member.role === "owner" ? "owner" : "member",
      alias: member.alias || undefined,
      photoUrl: member.photo_data || undefined,
      familiarityScores: asNumberRecord(member.familiarity_scores)
    }));

  const isPersonal = row.type === "personal" || row.purpose === "personal" || projectMembers.length <= 1;
  return {
    id: row.id,
    name: row.name || "Kasam",
    type: isPersonal ? "personal" : "shared",
    createdBy: row.created_by || projectMembers.find((member) => member.role === "owner")?.userId || "",
    members: projectMembers,
    photoUrl: row.photo_data || undefined,
    joinCode: row.code || undefined,
    defaultCurrency: asCurrency(row.default_currency),
    defaultHeadings: asArray(row.default_headings),
    splitType: asSplitType(row.split_type),
    templateId: row.template_id || undefined,
    joinApprovalRequired: row.join_approval_required ?? true,
    archivedAt: row.archived_at || null
  };
}

export function mapCloudEntry(row: EntryRow): Entry {
  const currency = asCurrency(row.currency);
  const exchangeRate = currency === "TL" ? 1 : asNumber(row.exchange_rate, 1);
  const storedAmount = asNumber(row.amount, 0);
  const amount = row.entered_amount !== null && row.entered_amount !== undefined ? asNumber(row.entered_amount, 0) : currency === "TL" ? storedAmount : storedAmount / exchangeRate;
  const { splitWith, splitRatio } = normalizeSplit(row);
  const createdAt = asIsoDate(row.created_at);

  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id || row.paid_by_id || "",
    paidById: row.paid_by_id || row.user_id || "",
    type: asEntryType(row.type),
    title: row.short_name || row.heading_name || row.title || "Hareket",
    amount,
    currency,
    exchangeRate,
    rateLockedAt: asIsoDate(row.rate_locked_at || row.created_at),
    date: asDateOnlyIso(row.entry_date || row.date || row.created_at),
    status: asStatus(row.status),
    splitWith,
    splitRatio,
    lockedNotificationId: row.locked_notification_id || null,
    revealedAt: row.revealed_at || null,
    autoRevealAt: row.auto_reveal_at || null,
    media: mapEntryMedia(row),
    headingId: row.heading_id || null,
    note: row.note || "",
    ocrRawText: row.ocr_raw_text || null,
    ocrParsedAmount: row.ocr_parsed_amount === null || row.ocr_parsed_amount === undefined ? null : asNumber(row.ocr_parsed_amount),
    installmentGroupId: row.installment_group_id || null,
    installmentIndex: asInteger(row.installment_index),
    installmentCount: asInteger(row.installment_count),
    settlement: Boolean(row.settlement),
    createdAt,
    updatedAt: asIsoDate(row.updated_at || row.created_at)
  };
}

export function mapCloudNotification(row: NotificationRow): Notification {
  const mode = asMode(row.mode);
  const rawPhase = row.game_phase === "done" ? "done" : Number(row.game_phase || 1);
  const gamePhase = rawPhase === 2 || rawPhase === 3 ? rawPhase : row.is_completed ? "done" : 1;
  const isGuess = mode === "surprise" || row.notification_type === "guess";
  const reactions: Record<string, unknown> = {
    actorWrong: asRecord(row.actor_wrong_reaction),
    actorCorrect: asRecord(row.actor_correct_reaction),
    typeWrong: asRecord(row.type_wrong_reaction),
    typeCorrect: asRecord(row.type_correct_reaction),
    categoryWrong: asRecord(row.category_wrong_reaction),
    categoryCorrect: asRecord(row.category_correct_reaction)
  };

  return {
    id: row.id,
    projectId: row.project_id,
    entryId: row.entry_id || "",
    actorId: row.actor_id || "",
    recipients: asArray(row.recipients),
    type: isGuess ? "guess" : "movement",
    mode,
    title: row.title || undefined,
    amount: asNumber(row.amount),
    actualType: row.actual_type ? asEntryType(row.actual_type) : undefined,
    guessDeadline: row.guess_deadline || null,
    gamePhase,
    isCompleted: Boolean(row.is_completed || row.revealed_at || rawPhase === "done"),
    revealedAt: row.revealed_at || null,
    guesses: asArray(row.guesses),
    game: {
      hideActor: Boolean(row.hide_actor),
      phase1Completed: Boolean(row.phase1_completed),
      phase2Completed: Boolean(row.phase2_completed),
      phase3Completed: Boolean(row.phase3_completed),
      phase1Guesses: asArray(row.phase1_guesses),
      phase2Guesses: asArray(row.phase2_guesses),
      phase3Options: asArray(row.phase3_options),
      phase3Correct: row.phase3_correct === null || row.phase3_correct === undefined ? null : asInteger(row.phase3_correct),
      phase3Guesses: asArray(row.phase3_guesses),
      phase3Image: row.phase3_image || null,
      reactions
    }
  };
}

export function mapCloudGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    ownerId: row.created_by || "",
    projectId: row.project_id || null,
    title: row.title || "Hedef",
    targetAmount: asNumber(row.target_amount),
    currentAmount: asNumber(row.current_amount),
    deadline: row.deadline || null,
    status: asGoalStatus(row.status)
  };
}

export function mapCloudReaction(row: ReactionRow): Reaction {
  return {
    id: row.id,
    entryId: row.entry_id,
    projectId: row.project_id,
    userId: row.user_id,
    emoji: row.emoji || "",
    createdAt: asIsoDate(row.created_at)
  };
}

export function mapCloudSettlement(row: SettlementRow): Settlement {
  return {
    id: row.id,
    projectId: row.project_id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    amount: asNumber(row.amount),
    settledAt: asIsoDate(row.settled_at),
    note: row.note || ""
  };
}

export function mapCloudReconciliation(row: ReconciliationRow): Reconciliation {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id || null,
    month: row.month || "",
    bankName: row.bank_name || "",
    formatType: asFormatType(row.format_type),
    statementTotal: asNumber(row.statement_total),
    kasaTotal: asNumber(row.kasa_total),
    diff: asNumber(row.diff),
    status: asReconciliationStatus(row.status),
    uploadedAt: asIsoDate(row.uploaded_at),
    rawRows: asArray(row.raw_rows),
    matchedEntryIds: asArray(row.matched_entry_ids),
    unmatchedRows: asArray(row.unmatched_rows),
    aiAnalysis: row.ai_analysis || null
  };
}

export function mapCloudInsight(row: InsightRow): StoredInsight {
  return {
    id: row.id,
    userId: row.user_id,
    projectId: row.project_id || null,
    type: asInsightType(row.type),
    period: row.period || "",
    insightData: asRecord(row.insight_data),
    message: row.message || "",
    actionSuggestion: row.action_suggestion || "",
    isRead: Boolean(row.is_read),
    createdAt: asIsoDate(row.created_at)
  };
}

export function buildEntryInsertPayload(draft: CommercialEntryDraft, entryId: string, notificationId: string | null, now: string) {
  const amountTl = draft.amount * draft.exchangeRate;
  return {
    id: entryId,
    project_id: draft.projectId,
    user_id: draft.userId,
    paid_by_id: draft.paidById,
    type: draft.type,
    amount: amountTl,
    entered_amount: draft.amount,
    currency: draft.currency === "TL" ? "TRY" : draft.currency,
    exchange_rate: draft.exchangeRate,
    rate_locked_at: now,
    short_name: draft.title,
    entry_date: draft.entryDate,
    split_with: draft.splitWith,
    split_ratio: draft.splitRatio,
    status: "done" as const,
    locked_notification_id: notificationId,
    auto_reveal_at: notificationId ? new Date(new Date(now).getTime() + 48 * 60 * 60 * 1000).toISOString() : null,
    revealed_at: notificationId ? null : now,
    created_at: now,
    updated_at: now
  };
}

export function buildNotificationInsertPayload(draft: CommercialEntryDraft, entryId: string, notificationId: string, now: string) {
  const recipients = draft.splitWith.filter((userId) => userId !== draft.userId);
  return {
    id: notificationId,
    project_id: draft.projectId,
    entry_id: entryId,
    actor_id: draft.userId,
    recipients,
    mode: "surprise",
    notification_type: "guess",
    actual_type: draft.type,
    title: draft.title,
    amount: draft.amount * draft.exchangeRate,
    success_reaction: "OK",
    fail_reaction: "NO",
    guesses: [],
    guess_deadline: new Date(new Date(now).getTime() + 48 * 60 * 60 * 1000).toISOString(),
    game_phase: 1,
    is_completed: false,
    revealed_at: null,
    created_at: now
  };
}

export function buildCommercialStateFromCloud(input: BuildCloudStateInput): AppState {
  return {
    activeUserId: input.activeUserId,
    profiles: input.profiles.map(mapCloudProfile),
    projects: input.projects.map((project) => mapCloudProject(project, input.members)),
    entries: input.entries.map(mapCloudEntry),
    notifications: input.notifications.map(mapCloudNotification),
    goals: asArray(input.goals).map(mapCloudGoal),
    reactions: asArray(input.reactions).map(mapCloudReaction),
    settlements: asArray(input.settlements).map(mapCloudSettlement),
    reconciliations: asArray(input.reconciliations).map(mapCloudReconciliation),
    insights: asArray(input.insights).map(mapCloudInsight)
  };
}
