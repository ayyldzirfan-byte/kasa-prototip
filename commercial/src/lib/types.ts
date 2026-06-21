export type EntryType = "income" | "expense";

export type EntryStatus = "done" | "pending";

export type CurrencyCode = "TL" | "USD" | "EUR" | "GBP";

export type UserPlan = "free" | "premium";

export type Profile = {
  id: string;
  displayName: string;
  email: string;
  plan: UserPlan;
  photoUrl?: string;
};

export type ProjectMember = {
  userId: string;
  memberSince: string;
  role: "owner" | "member";
};

export type Project = {
  id: string;
  name: string;
  type: "personal" | "shared";
  createdBy: string;
  members: ProjectMember[];
  photoUrl?: string;
  joinCode?: string;
};

export type EntryMedia = {
  type: "emoji" | "gif" | "photo" | "sticker";
  value: string;
};

export type Entry = {
  id: string;
  projectId: string;
  userId: string;
  paidById: string;
  type: EntryType;
  title: string;
  amount: number;
  currency: CurrencyCode;
  exchangeRate: number;
  rateLockedAt: string;
  date: string;
  status: EntryStatus;
  splitWith: string[];
  splitRatio: number[];
  lockedNotificationId?: string | null;
  revealedAt?: string | null;
  autoRevealAt?: string | null;
  media?: EntryMedia;
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  id: string;
  projectId: string;
  entryId: string;
  actorId: string;
  recipients: string[];
  type: "movement" | "guess";
  gamePhase: 1 | 2 | 3 | "done";
  isCompleted: boolean;
  revealedAt?: string | null;
};

export type AppState = {
  activeUserId: string;
  profiles: Profile[];
  projects: Project[];
  entries: Entry[];
  notifications: Notification[];
};

export type PeriodSummary = {
  income: number;
  expense: number;
  net: number;
  pendingIncome: number;
  upcomingPayment: number;
};

export type RhythmScore = {
  score: number;
  label: "Güçlü" | "Dengede" | "Dikkat";
  message: string;
};

export type Transfer = {
  fromUserId: string;
  toUserId: string;
  amount: number;
};
