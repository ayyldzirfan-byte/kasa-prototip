import type { AppState, CurrencyCode, Entry, EntryMedia, EntryStatus, Notification, Profile, Project, ProjectMember, UserPlan } from "./types";

export type ProfileRow = {
  id: string;
  email?: string | null;
  name?: string | null;
  nickname?: string | null;
  photo_data?: string | null;
  plan?: string | null;
};

export type ProjectRow = {
  id: string;
  name?: string | null;
  purpose?: string | null;
  type?: string | null;
  code?: string | null;
  created_by?: string | null;
  photo_data?: string | null;
};

export type ProjectMemberRow = {
  project_id: string;
  user_id: string;
  role?: string | null;
  member_since?: string | null;
  created_at?: string | null;
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
  heading_name?: string | null;
  short_name?: string | null;
  title?: string | null;
  entry_date?: string | null;
  date?: string | null;
  status?: string | null;
  split_with?: string[] | null;
  split_ratio?: number[] | null;
  locked_notification_id?: string | null;
  revealed_at?: string | null;
  auto_reveal_at?: string | null;
  media_type?: string | null;
  media_value?: string | null;
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
  game_phase?: number | string | null;
  is_completed?: boolean | null;
  revealed_at?: string | null;
  created_at?: string | null;
};

type BuildCloudStateInput = {
  activeUserId: string;
  profiles: ProfileRow[];
  projects: ProjectRow[];
  members: ProjectMemberRow[];
  entries: EntryRow[];
  notifications: NotificationRow[];
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

function normalizeSplit(entry: EntryRow) {
  const payerId = entry.paid_by_id || entry.user_id || "";
  const splitWith = Array.isArray(entry.split_with) && entry.split_with.length ? entry.split_with : [payerId].filter(Boolean);
  const splitRatio = Array.isArray(entry.split_ratio) && entry.split_ratio.length === splitWith.length ? entry.split_ratio : splitWith.map(() => 1 / splitWith.length);
  return { splitWith, splitRatio };
}

export function mapCloudProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.name || row.nickname || row.email || "Kullanıcı",
    email: row.email || "",
    plan: asPlan(row.plan),
    photoUrl: row.photo_data || undefined
  };
}

export function mapCloudProject(row: ProjectRow, members: ProjectMemberRow[]): Project {
  const projectMembers: ProjectMember[] = members
    .filter((member) => member.project_id === row.id)
    .map((member) => ({
      userId: member.user_id,
      memberSince: asIsoDate(member.member_since || member.created_at),
      role: member.role === "owner" ? "owner" : "member"
    }));

  const isPersonal = row.type === "personal" || row.purpose === "personal" || projectMembers.length <= 1;
  return {
    id: row.id,
    name: row.name || "Kasam",
    type: isPersonal ? "personal" : "shared",
    createdBy: row.created_by || projectMembers.find((member) => member.role === "owner")?.userId || "",
    members: projectMembers,
    photoUrl: row.photo_data || undefined,
    joinCode: row.code || undefined
  };
}

export function mapCloudEntry(row: EntryRow): Entry {
  const currency = asCurrency(row.currency);
  const exchangeRate = currency === "TL" ? 1 : asNumber(row.exchange_rate, 1);
  const amount = asNumber(row.entered_amount ?? row.amount, 0);
  const { splitWith, splitRatio } = normalizeSplit(row);
  const createdAt = asIsoDate(row.created_at);
  const mediaType = asMediaType(row.media_type);

  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id || row.paid_by_id || "",
    paidById: row.paid_by_id || row.user_id || "",
    type: row.type === "income" ? "income" : "expense",
    title: row.short_name || row.heading_name || row.title || "Hareket",
    amount,
    currency,
    exchangeRate,
    rateLockedAt: asIsoDate(row.rate_locked_at || row.created_at),
    date: asIsoDate(row.entry_date || row.date || row.created_at),
    status: asStatus(row.status),
    splitWith,
    splitRatio,
    lockedNotificationId: row.locked_notification_id || null,
    revealedAt: row.revealed_at || null,
    autoRevealAt: row.auto_reveal_at || null,
    media: mediaType && row.media_value ? { type: mediaType, value: row.media_value } : undefined,
    createdAt,
    updatedAt: asIsoDate(row.updated_at || row.created_at)
  };
}

export function mapCloudNotification(row: NotificationRow): Notification {
  const rawPhase = row.game_phase === "done" ? "done" : Number(row.game_phase || 1);
  const gamePhase = rawPhase === 2 || rawPhase === 3 ? rawPhase : row.is_completed ? "done" : 1;
  return {
    id: row.id,
    projectId: row.project_id,
    entryId: row.entry_id || "",
    actorId: row.actor_id || "",
    recipients: Array.isArray(row.recipients) ? row.recipients : [],
    type: row.type === "movement" || row.mode === "open" ? "movement" : "guess",
    gamePhase,
    isCompleted: Boolean(row.is_completed),
    revealedAt: row.revealed_at || null
  };
}

export function buildCommercialStateFromCloud(input: BuildCloudStateInput): AppState {
  return {
    activeUserId: input.activeUserId,
    profiles: input.profiles.map(mapCloudProfile),
    projects: input.projects.map((project) => mapCloudProject(project, input.members)),
    entries: input.entries.map(mapCloudEntry),
    notifications: input.notifications.map(mapCloudNotification)
  };
}
