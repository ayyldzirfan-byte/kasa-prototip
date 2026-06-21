import type { AppState, Entry } from "./types";

const baseDate = "2026-06-21T09:00:00.000Z";

function entry(data: Omit<Entry, "id" | "currency" | "exchangeRate" | "rateLockedAt" | "status" | "createdAt" | "updatedAt"> & { id: string; exchangeRate?: number }) {
  return {
    currency: "TL",
    exchangeRate: data.exchangeRate ?? 1,
    rateLockedAt: data.date,
    status: "done",
    createdAt: data.date,
    updatedAt: baseDate,
    ...data
  } satisfies Entry;
}

export const demoState: AppState = {
  activeUserId: "u-irfan",
  profiles: [
    { id: "u-irfan", displayName: "İrfan", email: "irfan@kasam.app", plan: "premium" },
    { id: "u-havva", displayName: "Havva", email: "havva@kasam.app", plan: "free" },
    { id: "u-derya", displayName: "Derya", email: "derya@kasam.app", plan: "free" }
  ],
  projects: [
    {
      id: "p-personal",
      name: "İrfan kasası",
      type: "personal",
      createdBy: "u-irfan",
      members: [{ userId: "u-irfan", memberSince: "2026-01-01T00:00:00.000Z", role: "owner" }]
    },
    {
      id: "p-home",
      name: "Ayyıldız Home",
      type: "shared",
      createdBy: "u-irfan",
      joinCode: "KASAM-AYY",
      members: [
        { userId: "u-irfan", memberSince: "2026-01-01T00:00:00.000Z", role: "owner" },
        { userId: "u-havva", memberSince: "2026-01-01T00:00:00.000Z", role: "member" },
        { userId: "u-derya", memberSince: "2026-05-01T00:00:00.000Z", role: "member" }
      ]
    }
  ],
  entries: [
    entry({
      id: "e-salary",
      projectId: "p-personal",
      userId: "u-irfan",
      paidById: "u-irfan",
      type: "income",
      title: "Maaş",
      amount: 45000,
      date: "2026-06-01T09:00:00.000Z",
      splitWith: ["u-irfan"],
      splitRatio: [1]
    }),
    entry({
      id: "e-market",
      projectId: "p-home",
      userId: "u-irfan",
      paidById: "u-irfan",
      type: "expense",
      title: "Market",
      amount: 3600,
      date: "2026-06-18T17:00:00.000Z",
      splitWith: ["u-irfan", "u-havva", "u-derya"],
      splitRatio: [0.4, 0.35, 0.25],
      media: { type: "gif", value: "receipt" }
    }),
    entry({
      id: "e-rent",
      projectId: "p-home",
      userId: "u-havva",
      paidById: "u-havva",
      type: "expense",
      title: "Kira",
      amount: 18000,
      date: "2026-06-05T10:00:00.000Z",
      splitWith: ["u-irfan", "u-havva", "u-derya"],
      splitRatio: [0.4, 0.35, 0.25]
    }),
    entry({
      id: "e-bonus",
      projectId: "p-personal",
      userId: "u-irfan",
      paidById: "u-irfan",
      type: "income",
      title: "Ek iş",
      amount: 4000,
      date: "2026-06-21T08:00:00.000Z",
      splitWith: ["u-irfan"],
      splitRatio: [1]
    }),
    entry({
      id: "e-surprise",
      projectId: "p-home",
      userId: "u-irfan",
      paidById: "u-irfan",
      type: "expense",
      title: "Hediye",
      amount: 1200,
      date: "2026-06-21T10:00:00.000Z",
      splitWith: ["u-irfan", "u-havva", "u-derya"],
      splitRatio: [0.4, 0.35, 0.25],
      lockedNotificationId: "n-surprise",
      revealedAt: null,
      autoRevealAt: "2026-06-23T10:00:00.000Z",
      media: { type: "sticker", value: "gift" }
    })
  ],
  notifications: [
    {
      id: "n-surprise",
      projectId: "p-home",
      entryId: "e-surprise",
      actorId: "u-irfan",
      recipients: ["u-havva", "u-derya"],
      type: "guess",
      gamePhase: 1,
      isCompleted: false,
      revealedAt: null
    }
  ]
};
