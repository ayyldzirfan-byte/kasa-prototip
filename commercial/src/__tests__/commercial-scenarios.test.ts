import { pendingSurpriseCountForUser, personalEntryImpact, validateSplitRatio } from "@/lib/domain";
import { commercialScenarios, defaultCommercialScenario, getCommercialScenario } from "@/lib/commercial-scenarios";
import { generateCommerceSignals, generateGuidancePlan, generateMealIdeasFromReceipt } from "@/lib/insights";

const now = new Date("2026-06-21T12:00:00.000Z");

describe("Kasam commercial scenarios", () => {
  test("all scenarios are loadable and structurally valid", () => {
    for (const scenario of commercialScenarios) {
      const state = scenario.state;
      const activeUser = state.profiles.find((profile) => profile.id === state.activeUserId);
      const personalProject = state.projects.find((project) => project.type === "personal");
      const entryIds = new Set(state.entries.map((entry) => entry.id));

      expect(activeUser).toBeDefined();
      expect(personalProject).toBeDefined();
      expect(state.entries.length).toBeGreaterThan(0);
      expect(entryIds.size).toBe(state.entries.length);
      expect(state.entries.every((entry) => validateSplitRatio(entry.splitRatio))).toBe(true);
    }
  });

  test("unknown scenario falls back to default commercial scenario", () => {
    expect(getCommercialScenario("missing")).toBe(defaultCommercialScenario);
  });

  test("shared home scenario explains personal impact and keeps actor surprise hidden from actor counter", () => {
    const scenario = getCommercialScenario("shared-home");
    const state = scenario.state;
    const marketEntry = state.entries.find((entry) => entry.id === "e-market");
    const surpriseEntry = state.entries.find((entry) => entry.id === "e-surprise");

    expect(marketEntry).toBeDefined();
    expect(surpriseEntry).toBeDefined();
    expect(personalEntryImpact(state, marketEntry!, "u-deniz", now)).toBeLessThan(0);
    expect(personalEntryImpact(state, surpriseEntry!, "u-deniz", now)).toBe(0);
    expect(pendingSurpriseCountForUser(state, "u-deniz")).toBe(0);
    expect(pendingSurpriseCountForUser(state, "u-ece")).toBe(1);

    const plan = generateGuidancePlan(state, "u-deniz", now, scenario.receiptItems, scenario.commerceConsent);
    expect(plan.mealIdeas.some((idea) => idea.title === "Tavuklu pilav")).toBe(true);
    expect(plan.commerceSignals[0].allowed).toBe(false);
  });

  test("student goal scenario turns small spending into goal guidance and meal ideas", () => {
    const scenario = getCommercialScenario("student-goal");
    const plan = generateGuidancePlan(
      scenario.state,
      scenario.state.activeUserId,
      now,
      scenario.receiptItems,
      scenario.commerceConsent
    );

    expect(plan.acceleration.some((insight) => insight.title.includes("PlayStation hedefi"))).toBe(true);
    expect(plan.acceleration.some((insight) => insight.message.includes("gün"))).toBe(true);
    expect(generateMealIdeasFromReceipt(scenario.receiptItems).some((idea) => idea.title === "Domatesli makarna")).toBe(true);
    expect(plan.commerceSignals[0].allowed).toBe(false);
  });

  test("travel pair scenario enables consent based commerce signals and shared personal effect", () => {
    const scenario = getCommercialScenario("travel-pair");
    const state = scenario.state;
    const ticketEntry = state.entries.find((entry) => entry.id === "e-ticket");

    expect(ticketEntry).toBeDefined();
    expect(personalEntryImpact(state, ticketEntry!, "u-selin", now)).toBeLessThan(0);

    const signals = generateCommerceSignals(state, "u-selin", now, scenario.commerceConsent);
    expect(signals.length).toBeGreaterThan(0);
    expect(signals.every((signal) => signal.allowed)).toBe(true);
    expect(signals.some((signal) => signal.segment === "kahve")).toBe(true);
  });
});
