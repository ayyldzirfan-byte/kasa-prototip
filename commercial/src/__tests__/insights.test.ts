import {
  calculateGoalAdvanceDays,
  calculateGoalDelayDays,
  generateCommerceSignals,
  generateGoalAccelerationSuggestions,
  generateGuidancePlan,
  generateInsightDeck,
  generateMealIdeasFromReceipt,
  requiredDailySaving
} from "@/lib/insights";
import { defaultCommercialScenario, getCommercialScenario } from "@/lib/commercial-scenarios";
import { demoState } from "@/lib/seed";
import type { AppState, Goal } from "@/lib/types";

const now = new Date("2026-06-21T12:00:00.000Z");

describe("Kasam commercial insight engine", () => {
  test("goal delay days are deterministic", () => {
    expect(calculateGoalDelayDays(2000, 500)).toBe(4);
    expect(calculateGoalDelayDays(0, 500)).toBe(0);
    expect(calculateGoalDelayDays(2000, 0)).toBe(0);
    expect(calculateGoalAdvanceDays(1500, 500)).toBe(3);
  });

  test("required daily saving follows remaining target and deadline", () => {
    const goal: Goal = {
      id: "g-test",
      ownerId: "u-irfan",
      title: "Test hedefi",
      targetAmount: 10000,
      currentAmount: 7000,
      deadline: "2026-07-21T12:00:00.000Z",
      status: "active"
    };
    expect(Math.round(requiredDailySaving(goal, now))).toBe(100);
  });

  test("demo state produces goal delay and advance recommendations", () => {
    const insights = generateInsightDeck(demoState, demoState.activeUserId, now);
    expect(insights.some((insight) => insight.type === "goal-delay")).toBe(true);
    expect(insights.some((insight) => insight.type === "goal-advance")).toBe(true);
    expect(insights[0].source).toBe("rules");
  });

  test("shared project impact is explained through personal cash effect", () => {
    const insights = generateInsightDeck(demoState, demoState.activeUserId, now);
    const sharedInsight = insights.find((insight) => insight.type === "shared-impact");
    expect(sharedInsight).toBeDefined();
    expect(sharedInsight?.message).toContain("kişisel kasana etkisi");
  });

  test("cashflow pressure appears when upcoming payments exceed expected income", () => {
    const pressureState: AppState = {
      ...demoState,
      entries: [
        ...demoState.entries,
        {
          id: "e-future-rent",
          projectId: "p-deniz",
          userId: "u-deniz",
          paidById: "u-deniz",
          type: "expense",
          title: "Yaklaşan kira",
          amount: 15000,
          currency: "TL",
          exchangeRate: 1,
          rateLockedAt: "2026-06-29T12:00:00.000Z",
          date: "2026-06-29T12:00:00.000Z",
          status: "done",
          splitWith: ["u-deniz"],
          splitRatio: [1],
          createdAt: "2026-06-21T12:00:00.000Z",
          updatedAt: "2026-06-21T12:00:00.000Z"
        }
      ]
    };
    const insights = generateInsightDeck(pressureState, "u-deniz", now);
    expect(insights.some((insight) => insight.type === "cashflow")).toBe(true);
  });

  test("goal acceleration suggestions turn spending categories into action", () => {
    const scenario = getCommercialScenario("student-goal");
    const suggestions = generateGoalAccelerationSuggestions(scenario.state, scenario.state.activeUserId, now);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].type).toBe("goal-advance");
    expect(suggestions[0].message).toContain("öne");
  });

  test("receipt basket can produce meal ideas without AI math", () => {
    const ideas = generateMealIdeasFromReceipt([{ name: "Tavuk" }, { name: "Pirinç" }, { name: "Yoğurt" }]);
    expect(ideas[0].title).toBe("Tavuklu pilav");
    expect(ideas[0].uses).toContain("Tavuk");
  });

  test("commerce signals require consent and stay segment based", () => {
    const scenario = getCommercialScenario("travel-pair");
    const signalState: AppState = {
      ...scenario.state,
      entries: [
        ...scenario.state.entries,
        {
          id: "e-market-signal",
          projectId: "p-selin",
          userId: "u-selin",
          paidById: "u-selin",
          type: "expense",
          title: "Market",
          amount: 1200,
          currency: "TL",
          exchangeRate: 1,
          rateLockedAt: "2026-06-20T12:00:00.000Z",
          date: "2026-06-20T12:00:00.000Z",
          status: "done",
          splitWith: ["u-selin"],
          splitRatio: [1],
          createdAt: "2026-06-20T12:00:00.000Z",
          updatedAt: "2026-06-20T12:00:00.000Z"
        }
      ]
    };
    const closed = generateCommerceSignals(signalState, "u-selin", now, false);
    expect(closed[0].allowed).toBe(false);
    const open = generateCommerceSignals(signalState, "u-selin", now, true);
    expect(open.every((signal) => signal.allowed)).toBe(true);
    expect(open.some((signal) => signal.segment === "market")).toBe(true);
  });

  test("guidance plan excludes unlimited shared budget as a premium hook", () => {
    const plan = generateGuidancePlan(
      demoState,
      demoState.activeUserId,
      now,
      defaultCommercialScenario.receiptItems,
      defaultCommercialScenario.commerceConsent
    );
    expect(plan.premiumHooks.join(" ").toLocaleLowerCase("tr-TR")).not.toContain("sınırsız ortak kasa");
    expect(plan.premiumHooks).toContain("Ekstre analizi");
  });
});
