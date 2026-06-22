import type { AppState, Entry } from "./types";
import type { BasketItem } from "./insights";

type ScenarioEntry = Omit<Entry, "currency" | "exchangeRate" | "rateLockedAt" | "status" | "createdAt" | "updatedAt"> & {
  exchangeRate?: number;
  status?: Entry["status"];
};

function scenarioEntry(data: ScenarioEntry): Entry {
  return {
    currency: "TL",
    exchangeRate: data.exchangeRate ?? 1,
    rateLockedAt: data.date,
    status: data.status ?? "done",
    createdAt: data.date,
    updatedAt: data.date,
    ...data
  };
}

export type CommercialScenario = {
  id: string;
  label: string;
  description: string;
  state: AppState;
  receiptItems: BasketItem[];
  commerceConsent: boolean;
};

const sharedHome: CommercialScenario = {
  id: "shared-home",
  label: "Ortak ev etkisi",
  description: "Kişisel kasa merkezi, ortak ev hareketleri kullanıcının pay etkisine çevrilir.",
  receiptItems: [
    { name: "Tavuk" },
    { name: "Pirinç" },
    { name: "Yoğurt" }
  ],
  commerceConsent: false,
  state: {
    activeUserId: "u-deniz",
    profiles: [
      { id: "u-deniz", displayName: "Deniz Karaca", email: "deniz@kasam.app", plan: "premium" },
      { id: "u-ece", displayName: "Ece Yalın", email: "ece@kasam.app", plan: "free" },
      { id: "u-mert", displayName: "Mert Uzun", email: "mert@kasam.app", plan: "free" }
    ],
    projects: [
      {
        id: "p-deniz",
        name: "Deniz kasası",
        type: "personal",
        createdBy: "u-deniz",
        members: [{ userId: "u-deniz", memberSince: "2026-01-01T00:00:00.000Z", role: "owner" }]
      },
      {
        id: "p-home",
        name: "Ev Ortak Kasası",
        type: "shared",
        createdBy: "u-deniz",
        joinCode: "KASAM-EV",
        splitType: "weighted",
        members: [
          { userId: "u-deniz", memberSince: "2026-01-01T00:00:00.000Z", role: "owner" },
          { userId: "u-ece", memberSince: "2026-01-01T00:00:00.000Z", role: "member" },
          { userId: "u-mert", memberSince: "2026-05-01T00:00:00.000Z", role: "member" }
        ]
      }
    ],
    goals: [
      {
        id: "g-vacation",
        ownerId: "u-deniz",
        projectId: "p-deniz",
        title: "Tatil hedefi",
        targetAmount: 100000,
        currentAmount: 42000,
        deadline: "2026-09-01T00:00:00.000Z",
        monthlyTarget: 15000,
        status: "active"
      }
    ],
    entries: [
      scenarioEntry({
        id: "e-salary",
        projectId: "p-deniz",
        userId: "u-deniz",
        paidById: "u-deniz",
        type: "income",
        title: "Maaş",
        amount: 45000,
        date: "2026-06-01T09:00:00.000Z",
        splitWith: ["u-deniz"],
        splitRatio: [1]
      }),
      scenarioEntry({
        id: "e-rent",
        projectId: "p-home",
        userId: "u-deniz",
        paidById: "u-deniz",
        type: "expense",
        title: "Kira",
        amount: 18000,
        date: "2026-06-05T10:00:00.000Z",
        splitWith: ["u-deniz", "u-ece", "u-mert"],
        splitRatio: [0.4, 0.35, 0.25]
      }),
      scenarioEntry({
        id: "e-market",
        projectId: "p-home",
        userId: "u-ece",
        paidById: "u-ece",
        type: "expense",
        title: "Market",
        amount: 3600,
        date: "2026-06-18T17:00:00.000Z",
        splitWith: ["u-deniz", "u-ece", "u-mert"],
        splitRatio: [0.4, 0.35, 0.25],
        media: { type: "gif", value: "receipt" }
      }),
      scenarioEntry({
        id: "e-bonus",
        projectId: "p-deniz",
        userId: "u-deniz",
        paidById: "u-deniz",
        type: "income",
        title: "Ek iş",
        amount: 4000,
        date: "2026-06-21T08:00:00.000Z",
        splitWith: ["u-deniz"],
        splitRatio: [1]
      }),
      scenarioEntry({
        id: "e-surprise",
        projectId: "p-home",
        userId: "u-deniz",
        paidById: "u-deniz",
        type: "expense",
        title: "Hediye",
        amount: 1200,
        date: "2026-06-21T10:00:00.000Z",
        splitWith: ["u-deniz", "u-ece", "u-mert"],
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
        actorId: "u-deniz",
        recipients: ["u-ece", "u-mert"],
        type: "guess",
        gamePhase: 1,
        isCompleted: false,
        revealedAt: null
      }
    ]
  }
};

const studentGoal: CommercialScenario = {
  id: "student-goal",
  label: "Lise hedefi",
  description: "Tek kişilik hedef kasasında küçük harcamaların hedef tarihine etkisi ölçülür.",
  receiptItems: [
    { name: "Makarna" },
    { name: "Domates" },
    { name: "Peynir" }
  ],
  commerceConsent: false,
  state: {
    activeUserId: "u-arda",
    profiles: [{ id: "u-arda", displayName: "Arda Koçak", email: "arda@kasam.app", plan: "free" }],
    projects: [
      {
        id: "p-arda",
        name: "Arda kasası",
        type: "personal",
        createdBy: "u-arda",
        members: [{ userId: "u-arda", memberSince: "2026-03-01T00:00:00.000Z", role: "owner" }]
      }
    ],
    goals: [
      {
        id: "g-ps5",
        ownerId: "u-arda",
        projectId: "p-arda",
        title: "PlayStation hedefi",
        targetAmount: 30500,
        currentAmount: 3400,
        deadline: "2026-12-31T00:00:00.000Z",
        monthlyTarget: 900,
        status: "active"
      }
    ],
    entries: [
      scenarioEntry({
        id: "e-allowance",
        projectId: "p-arda",
        userId: "u-arda",
        paidById: "u-arda",
        type: "income",
        title: "Harçlık",
        amount: 2000,
        date: "2026-06-01T09:00:00.000Z",
        splitWith: ["u-arda"],
        splitRatio: [1]
      }),
      scenarioEntry({
        id: "e-canteen",
        projectId: "p-arda",
        userId: "u-arda",
        paidById: "u-arda",
        type: "expense",
        title: "Kantin",
        amount: 420,
        date: "2026-06-20T12:00:00.000Z",
        splitWith: ["u-arda"],
        splitRatio: [1]
      }),
      scenarioEntry({
        id: "e-phone",
        projectId: "p-arda",
        userId: "u-arda",
        paidById: "u-arda",
        type: "expense",
        title: "Telefon aboneliği",
        amount: 199,
        date: "2026-06-15T12:00:00.000Z",
        splitWith: ["u-arda"],
        splitRatio: [1]
      })
    ],
    notifications: []
  }
};

const travelPair: CommercialScenario = {
  id: "travel-pair",
  label: "Tatil kumbarası",
  description: "İki arkadaşın ortak hedefinde katkı ve ortak gider etkisi izlenir.",
  receiptItems: [],
  commerceConsent: true,
  state: {
    activeUserId: "u-selin",
    profiles: [
      { id: "u-selin", displayName: "Selin Koç", email: "selin@kasam.app", plan: "premium" },
      { id: "u-buse", displayName: "Buse Yıldız", email: "buse@kasam.app", plan: "free" }
    ],
    projects: [
      {
        id: "p-selin",
        name: "Selin kasası",
        type: "personal",
        createdBy: "u-selin",
        members: [{ userId: "u-selin", memberSince: "2026-03-01T00:00:00.000Z", role: "owner" }]
      },
      {
        id: "p-travel",
        name: "Tatil Kumbarası",
        type: "shared",
        createdBy: "u-selin",
        joinCode: "TATIL-2026",
        splitType: "weighted",
        members: [
          { userId: "u-selin", memberSince: "2026-03-01T00:00:00.000Z", role: "owner" },
          { userId: "u-buse", memberSince: "2026-03-01T00:00:00.000Z", role: "member" }
        ]
      }
    ],
    goals: [
      {
        id: "g-bali",
        ownerId: "u-selin",
        projectId: "p-travel",
        title: "Bali turu",
        targetAmount: 100000,
        currentAmount: 75000,
        deadline: "2026-07-20T00:00:00.000Z",
        monthlyTarget: 15000,
        status: "active"
      }
    ],
    entries: [
      scenarioEntry({
        id: "e-selin-contribution",
        projectId: "p-travel",
        userId: "u-selin",
        paidById: "u-selin",
        type: "income",
        title: "Tatil katkısı",
        amount: 15000,
        date: "2026-06-02T09:00:00.000Z",
        splitWith: ["u-selin", "u-buse"],
        splitRatio: [0.6, 0.4]
      }),
      scenarioEntry({
        id: "e-ticket",
        projectId: "p-travel",
        userId: "u-selin",
        paidById: "u-selin",
        type: "expense",
        title: "Uçak bileti",
        amount: 38000,
        date: "2026-06-12T12:00:00.000Z",
        splitWith: ["u-selin", "u-buse"],
        splitRatio: [0.6, 0.4]
      }),
      scenarioEntry({
        id: "e-coffee",
        projectId: "p-selin",
        userId: "u-selin",
        paidById: "u-selin",
        type: "expense",
        title: "Kahve",
        amount: 620,
        date: "2026-06-20T10:00:00.000Z",
        splitWith: ["u-selin"],
        splitRatio: [1]
      })
    ],
    notifications: []
  }
};

export const commercialScenarios = [sharedHome, studentGoal, travelPair] as const;

export const defaultCommercialScenario = sharedHome;

export function getCommercialScenario(id?: string | null): CommercialScenario {
  return commercialScenarios.find((scenario) => scenario.id === id) ?? defaultCommercialScenario;
}
