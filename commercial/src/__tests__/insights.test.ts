import { calculateGoalDelayDays, generateInsightDeck, requiredDailySaving } from "@/lib/insights";
import { demoState } from "@/lib/seed";
import type { AppState, Goal } from "@/lib/types";

const now = new Date("2026-06-21T12:00:00.000Z");

describe("Kasam commercial insight engine", () => {
  test("goal delay days are deterministic", () => {
    expect(calculateGoalDelayDays(2000, 500)).toBe(4);
    expect(calculateGoalDelayDays(0, 500)).toBe(0);
    expect(calculateGoalDelayDays(2000, 0)).toBe(0);
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
    const insights = generateInsightDeck(demoState, "u-irfan", now);
    expect(insights.some((insight) => insight.type === "goal-delay")).toBe(true);
    expect(insights.some((insight) => insight.type === "goal-advance")).toBe(true);
    expect(insights[0].source).toBe("rules");
  });

  test("shared project impact is explained through personal cash effect", () => {
    const insights = generateInsightDeck(demoState, "u-irfan", now);
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
          projectId: "p-personal",
          userId: "u-irfan",
          paidById: "u-irfan",
          type: "expense",
          title: "Yaklaşan kira",
          amount: 15000,
          currency: "TL",
          exchangeRate: 1,
          rateLockedAt: "2026-06-29T12:00:00.000Z",
          date: "2026-06-29T12:00:00.000Z",
          status: "done",
          splitWith: ["u-irfan"],
          splitRatio: [1],
          createdAt: "2026-06-21T12:00:00.000Z",
          updatedAt: "2026-06-21T12:00:00.000Z"
        }
      ]
    };
    const insights = generateInsightDeck(pressureState, "u-irfan", now);
    expect(insights.some((insight) => insight.type === "cashflow")).toBe(true);
  });
});
