export type EntryType = "income" | "expense";

export type EntryStatus = "done" | "pending";

export type CurrencyCode = "TL" | "USD" | "EUR" | "GBP";

export type UserPlan = "free" | "premium";

export type Profile = {
  id: string;
  displayName: string;
  email: string;
  plan: UserPlan;
  nickname?: string;
  photoUrl?: string;
  totalScore?: number;
  correctGuesses?: number;
  totalGuesses?: number;
};

export type ProjectMember = {
  userId: string;
  memberSince: string;
  role: "owner" | "member";
  alias?: string;
  photoUrl?: string;
  familiarityScores?: Record<string, number>;
};

export type Project = {
  id: string;
  name: string;
  type: "personal" | "shared";
  createdBy: string;
  members: ProjectMember[];
  photoUrl?: string;
  joinCode?: string;
  defaultCurrency?: CurrencyCode;
  defaultHeadings?: string[];
  splitType?: "equal" | "weighted" | "individual";
  templateId?: string;
  joinApprovalRequired?: boolean;
  archivedAt?: string | null;
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
  headingId?: string | null;
  note?: string;
  ocrRawText?: string | null;
  ocrParsedAmount?: number | null;
  installmentGroupId?: string | null;
  installmentIndex?: number;
  installmentCount?: number;
  settlement?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Goal = {
  id: string;
  ownerId: string;
  projectId?: string | null;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
  monthlyTarget?: number;
  status: "active" | "completed" | "paused";
};

export type Notification = {
  id: string;
  projectId: string;
  entryId: string;
  actorId: string;
  recipients: string[];
  type: "movement" | "guess";
  mode?: "open" | "surprise" | "silent";
  title?: string;
  amount?: number;
  actualType?: EntryType;
  guessDeadline?: string | null;
  gamePhase: 1 | 2 | 3 | "done";
  isCompleted: boolean;
  revealedAt?: string | null;
  guesses?: Array<Record<string, unknown>>;
  game?: {
    hideActor?: boolean;
    phase1Completed?: boolean;
    phase2Completed?: boolean;
    phase3Completed?: boolean;
    phase1Guesses?: Array<Record<string, unknown>>;
    phase2Guesses?: Array<Record<string, unknown>>;
    phase3Options?: string[];
    phase3Correct?: number | null;
    phase3Guesses?: Array<Record<string, unknown>>;
    phase3Image?: string | null;
    reactions?: Record<string, unknown>;
  };
};

export type Reaction = {
  id: string;
  entryId: string;
  projectId: string;
  userId: string;
  emoji: string;
  createdAt: string;
};

export type Settlement = {
  id: string;
  projectId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  settledAt: string;
  note?: string;
};

export type Reconciliation = {
  id: string;
  userId: string;
  projectId?: string | null;
  month: string;
  bankName: string;
  formatType: "csv" | "pdf" | "image" | "xlsx";
  statementTotal: number;
  kasaTotal: number;
  diff: number;
  status: "matched" | "unmatched" | "pending";
  uploadedAt: string;
  rawRows: Array<Record<string, unknown>>;
  matchedEntryIds: string[];
  unmatchedRows: Array<Record<string, unknown>>;
  aiAnalysis?: Record<string, unknown> | null;
};

export type StoredInsight = {
  id: string;
  userId: string;
  projectId?: string | null;
  type: "daily" | "weekly" | "monthly" | "goal" | "anomaly" | "coaching" | "success";
  period: string;
  insightData: Record<string, unknown>;
  message: string;
  actionSuggestion?: string;
  isRead: boolean;
  createdAt: string;
};

export type AppState = {
  activeUserId: string;
  profiles: Profile[];
  projects: Project[];
  entries: Entry[];
  notifications: Notification[];
  goals?: Goal[];
  reactions?: Reaction[];
  settlements?: Settlement[];
  reconciliations?: Reconciliation[];
  insights?: StoredInsight[];
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
