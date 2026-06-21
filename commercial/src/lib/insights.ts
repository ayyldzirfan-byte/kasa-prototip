import { monthSummary, personalEntryImpact, projectSummary } from "./domain";
import { money, signedMoney } from "./money";
import type { AppState, Entry, Goal } from "./types";

export type InsightSeverity = "positive" | "info" | "warning" | "urgent";

export type InsightType =
  | "goal-delay"
  | "goal-advance"
  | "cashflow"
  | "shared-impact"
  | "spending-pressure"
  | "receipt-meal"
  | "commerce-signal";

export type Insight = {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  message: string;
  actionLabel?: string;
  amount?: number;
  daysImpact?: number;
  confidence: number;
  priority: number;
  source: "rules";
};

type ExpenseCategory = {
  title: string;
  amount: number;
};

export type BasketItem = {
  name: string;
  amount?: number;
  category?: string;
};

export type MealIdea = {
  title: string;
  reason: string;
  uses: string[];
  effort: "quick" | "normal";
};

export type CommerceSignal = {
  segment: string;
  reason: string;
  allowed: boolean;
  partnerCategory?: string;
};

export type GuidancePlan = {
  acceleration: Insight[];
  mealIdeas: MealIdea[];
  commerceSignals: CommerceSignal[];
  premiumHooks: string[];
};

export function calculateGoalDelayDays(amount: number, dailyContribution: number) {
  if (!Number.isFinite(amount) || !Number.isFinite(dailyContribution) || amount <= 0 || dailyContribution <= 0) return 0;
  return Math.max(1, Math.round(amount / dailyContribution));
}

export function calculateGoalAdvanceDays(savingAmount: number, dailyContribution: number) {
  return calculateGoalDelayDays(savingAmount, dailyContribution);
}

export function requiredDailySaving(goal: Goal, now = new Date()) {
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  if (remaining <= 0) return 0;
  if (!goal.deadline) return goal.monthlyTarget ? goal.monthlyTarget / 30 : 0;
  const days = Math.max(1, Math.ceil((new Date(goal.deadline).getTime() - now.getTime()) / 86400000));
  return remaining / days;
}

function activeGoalsForUser(state: AppState, userId: string) {
  return (state.goals ?? []).filter((goal) => goal.ownerId === userId && goal.status === "active");
}

function visibleEntriesForUser(state: AppState, userId: string, now: Date) {
  return state.entries.filter((entry) => personalEntryImpact(state, entry, userId, now) !== 0);
}

function latestExpense(state: AppState, userId: string, now: Date) {
  return visibleEntriesForUser(state, userId, now)
    .map((entry) => ({ entry, impact: personalEntryImpact(state, entry, userId, now) }))
    .filter((item) => item.impact < 0)
    .sort((a, b) => new Date(b.entry.date).getTime() - new Date(a.entry.date).getTime())[0];
}

function expenseCategories(state: AppState, userId: string, now: Date): ExpenseCategory[] {
  const map = new Map<string, number>();
  visibleEntriesForUser(state, userId, now).forEach((entry) => {
    const impact = personalEntryImpact(state, entry, userId, now);
    if (impact >= 0) return;
    map.set(entry.title, (map.get(entry.title) ?? 0) + Math.abs(impact));
  });
  return [...map.entries()]
    .map(([title, amount]) => ({ title, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => b.amount - a.amount);
}

function goalDailyContribution(goal: Goal, now: Date) {
  if (goal.monthlyTarget && goal.monthlyTarget > 0) return goal.monthlyTarget / 30;
  return requiredDailySaving(goal, now);
}

function createGoalInsights(state: AppState, userId: string, now: Date): Insight[] {
  const goal = activeGoalsForUser(state, userId)[0];
  if (!goal) return [];
  const dailyContribution = goalDailyContribution(goal, now);
  if (dailyContribution <= 0) return [];
  const recentExpense = latestExpense(state, userId, now);
  const categories = expenseCategories(state, userId, now);
  const insights: Insight[] = [];

  if (recentExpense) {
    const impactAmount = Math.abs(recentExpense.impact);
    const days = calculateGoalDelayDays(impactAmount, dailyContribution);
    insights.push({
      id: `goal-delay-${goal.id}-${recentExpense.entry.id}`,
      type: "goal-delay",
      severity: days >= 7 ? "warning" : "info",
      title: `${goal.title} ${days} gün ileri gider`,
      message: `${recentExpense.entry.title} hareketinin sana etkisi ${money(impactAmount)}. Bu tempo hedefi yaklaşık ${days} gün geciktirir.`,
      actionLabel: "Hedef etkisi",
      amount: impactAmount,
      daysImpact: days,
      confidence: 0.86,
      priority: 95,
      source: "rules"
    });
  }

  const topCategory = categories[0];
  if (topCategory) {
    const saving = Math.max(100, Math.round(topCategory.amount * 0.15));
    const days = calculateGoalDelayDays(saving, dailyContribution);
    insights.push({
      id: `goal-advance-${goal.id}-${topCategory.title}`,
      type: "goal-advance",
      severity: "positive",
      title: `${goal.title} ${days} gün öne gelir`,
      message: `${topCategory.title} tarafında ${money(saving)} kısmak hedefi yaklaşık ${days} gün öne çeker.`,
      actionLabel: "Ne yapabilirim?",
      amount: saving,
      daysImpact: days,
      confidence: 0.78,
      priority: 88,
      source: "rules"
    });
  }

  return insights;
}

function createCashflowInsights(state: AppState, userId: string, now: Date): Insight[] {
  const month = monthSummary(state, userId, now);
  const insights: Insight[] = [];
  const categories = expenseCategories(state, userId, now);
  const topCategory = categories[0];

  if (month.upcomingPayment > month.pendingIncome) {
    const gap = month.upcomingPayment - month.pendingIncome;
    insights.push({
      id: "cashflow-upcoming-gap",
      type: "cashflow",
      severity: gap > 5000 ? "urgent" : "warning",
      title: "Yaklaşan ödeme baskısı var",
      message: `Yaklaşan ödeme, beklenen gelirden ${money(gap)} fazla. Bu tutarı ay bitmeden kapatmak gerekir.`,
      actionLabel: "Nakit akışı",
      amount: gap,
      confidence: 0.9,
      priority: 84,
      source: "rules"
    });
  }

  if (month.net < 0) {
    insights.push({
      id: "spending-pressure-month",
      type: "spending-pressure",
      severity: "warning",
      title: "Bu ay gider önde",
      message: topCategory
        ? `Net etkin ${signedMoney(month.net)}. En yüksek baskı ${topCategory.title}: ${money(topCategory.amount)}.`
        : `Net etkin ${signedMoney(month.net)}. Gider tarafı gelirden hızlı büyüyor.`,
      actionLabel: "Ay kontrolü",
      amount: Math.abs(month.net),
      confidence: 0.82,
      priority: 76,
      source: "rules"
    });
  }

  return insights;
}

function createSharedImpactInsights(state: AppState, userId: string, now: Date): Insight[] {
  const sharedImpacts = state.projects
    .filter((project) => project.type === "shared")
    .map((project) => {
      const projectNet = projectSummary(state, project.id, now).net;
      const personalImpact = state.entries
        .filter((entry: Entry) => entry.projectId === project.id)
        .reduce((sum, entry) => sum + personalEntryImpact(state, entry, userId, now), 0);
      return { project, projectNet, personalImpact };
    })
    .filter((item) => Math.abs(item.personalImpact) > 0.01)
    .sort((a, b) => Math.abs(b.personalImpact) - Math.abs(a.personalImpact));

  const top = sharedImpacts[0];
  if (!top) return [];

  return [
    {
      id: `shared-impact-${top.project.id}`,
      type: "shared-impact",
      severity: top.personalImpact < 0 ? "warning" : "info",
      title: `${top.project.name} sana ${signedMoney(top.personalImpact)} yazdı`,
      message: `Ortak kasanın toplam neti ${signedMoney(top.projectNet)}. Senin kişisel kasana etkisi ${signedMoney(top.personalImpact)}.`,
      actionLabel: "Ortak kasa etkisi",
      amount: Math.abs(top.personalImpact),
      confidence: 0.88,
      priority: 70,
      source: "rules"
    }
  ];
}

export function generateGoalAccelerationSuggestions(state: AppState, userId: string, now = new Date()): Insight[] {
  const goal = activeGoalsForUser(state, userId)[0];
  if (!goal) return [];
  const dailyContribution = goalDailyContribution(goal, now);
  if (dailyContribution <= 0) return [];

  return expenseCategories(state, userId, now)
    .slice(0, 3)
    .map((category, index) => {
      const saving = Math.max(100, Math.round(category.amount * (index === 0 ? 0.18 : 0.12)));
      const days = calculateGoalAdvanceDays(saving, dailyContribution);
      return {
        id: `goal-plan-${goal.id}-${category.title}-${index}`,
        type: "goal-advance",
        severity: "positive",
        title: `${goal.title} ${days} gün öne gelir`,
        message: `${category.title} tarafında ${money(saving)} azaltırsan hedef yaklaşık ${days} gün öne çekilir.`,
        actionLabel: "Öne çekme planı",
        amount: saving,
        daysImpact: days,
        confidence: 0.74,
        priority: 80 - index,
        source: "rules"
      } satisfies Insight;
    });
}

export function generateMealIdeasFromReceipt(items: BasketItem[]): MealIdea[] {
  const names = items.map((item) => item.name.toLocaleLowerCase("tr-TR"));
  const has = (keywords: string[]) => keywords.some((keyword) => names.some((name) => name.includes(keyword)));
  const ideas: MealIdea[] = [];

  if (has(["tavuk", "but", "göğüs"]) && has(["pirinç", "bulgur"])) {
    ideas.push({
      title: "Tavuklu pilav",
      reason: "Sepette protein ve ana karbonhidrat birlikte görünüyor.",
      uses: items.filter((item) => /tavuk|but|göğüs|pirinç|bulgur/i.test(item.name)).map((item) => item.name),
      effort: "normal"
    });
  }

  if (has(["makarna"]) && has(["domates", "salça", "peynir"])) {
    ideas.push({
      title: "Domatesli makarna",
      reason: "Sepet hızlı bir akşam yemeği için yeterli sinyal veriyor.",
      uses: items.filter((item) => /makarna|domates|salça|peynir/i.test(item.name)).map((item) => item.name),
      effort: "quick"
    });
  }

  if (has(["yumurta"]) && has(["peynir", "ekmek"])) {
    ideas.push({
      title: "Kahvaltı tabağı",
      reason: "Temel kahvaltılık ürünler aynı fişte yer alıyor.",
      uses: items.filter((item) => /yumurta|peynir|ekmek/i.test(item.name)).map((item) => item.name),
      effort: "quick"
    });
  }

  return ideas.slice(0, 2);
}

export function generateCommerceSignals(state: AppState, userId: string, now = new Date(), consent = false): CommerceSignal[] {
  if (!consent) {
    return [
      {
        segment: "kapalı",
        reason: "Kişiselleştirilmiş teklif için açık kullanıcı izni gerekir.",
        allowed: false
      }
    ];
  }

  const categories = expenseCategories(state, userId, now);
  const signals = new Map<string, CommerceSignal>();
  const addSignal = (segment: string, reason: string, partnerCategory: string) => {
    if (!signals.has(segment)) signals.set(segment, { segment, reason, partnerCategory, allowed: true });
  };

  categories.forEach((category) => {
    const title = category.title.toLocaleLowerCase("tr-TR");
    if (/(kahve|kafe|starbucks)/i.test(title)) addSignal("kahve", "Kahve/kafe harcaması tekrar ediyor.", "kahve");
    if (/(market|migros|carrefour|getir)/i.test(title)) addSignal("market", "Market harcaması güçlü bir alışveriş sinyali veriyor.", "market");
    if (/(yakıt|akaryakıt|benzin|ulaşım|taksi)/i.test(title)) addSignal("ulaşım", "Ulaşım harcaması düzenli görünüyor.", "ulaşım");
    if (/(oyun|steam|playstation|abonelik)/i.test(title)) addSignal("dijital", "Dijital eğlence harcaması tespit edildi.", "dijital");
  });

  return [...signals.values()].slice(0, 3);
}

export function generateGuidancePlan(
  state: AppState,
  userId: string,
  now = new Date(),
  receiptItems: BasketItem[] = [],
  commerceConsent = false
): GuidancePlan {
  return {
    acceleration: generateGoalAccelerationSuggestions(state, userId, now),
    mealIdeas: generateMealIdeasFromReceipt(receiptItems),
    commerceSignals: generateCommerceSignals(state, userId, now, commerceConsent),
    premiumHooks: ["Gelişmiş rapor ve fiş", "Tahmin oyunu", "Hedef/kumbara", "Döviz ve taksit", "Ekstre analizi"]
  };
}

export function generateInsightDeck(state: AppState, userId: string, now = new Date()): Insight[] {
  return [...createGoalInsights(state, userId, now), ...createCashflowInsights(state, userId, now), ...createSharedImpactInsights(state, userId, now)]
    .sort((a, b) => b.priority - a.priority || b.confidence - a.confidence)
    .slice(0, 5);
}
