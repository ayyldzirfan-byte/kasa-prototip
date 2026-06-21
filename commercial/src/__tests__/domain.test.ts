import {
  entryIsConfirmed,
  minimumTransfers,
  monthSummary,
  pendingSurpriseCountForUser,
  personalEntryImpact,
  projectSummary,
  validateSplitRatio
} from "@/lib/domain";
import { demoState } from "@/lib/seed";

const now = new Date("2026-06-21T12:00:00.000Z");

describe("Kasam commercial domain", () => {
  test("personal cash impact includes shared project personal share", () => {
    const market = demoState.entries.find((entry) => entry.id === "e-market");
    expect(market).toBeDefined();
    expect(personalEntryImpact(demoState, market!, "u-irfan", now)).toBe(2160);
  });

  test("locked surprise is not confirmed before reveal", () => {
    const surprise = demoState.entries.find((entry) => entry.id === "e-surprise");
    expect(surprise).toBeDefined();
    expect(entryIsConfirmed(surprise!, now)).toBe(false);
  });

  test("pending surprise count is visible to recipients but not actor", () => {
    expect(pendingSurpriseCountForUser(demoState, "u-irfan")).toBe(0);
    expect(pendingSurpriseCountForUser(demoState, "u-havva")).toBe(1);
  });

  test("monthly summary keeps hidden game out of balance", () => {
    const summary = monthSummary(demoState, "u-irfan", now);
    expect(summary.income).toBe(51160);
    expect(summary.expense).toBe(7200);
    expect(summary.net).toBe(43960);
  });

  test("project summary shows cumulative shared project effect", () => {
    const summary = projectSummary(demoState, "p-home", now);
    expect(summary.income).toBe(0);
    expect(summary.expense).toBe(21600);
    expect(summary.net).toBe(-21600);
  });

  test("split ratio validation blocks invalid totals", () => {
    expect(validateSplitRatio([0.4, 0.35, 0.25])).toBe(true);
    expect(validateSplitRatio([0.6, 0.6])).toBe(false);
  });

  test("minimum transfer algorithm returns compact settlement list", () => {
    const transfers = minimumTransfers({ owner: 500, partner: -300, child: -200 });
    expect(transfers).toEqual([
      { fromUserId: "partner", toUserId: "owner", amount: 300 },
      { fromUserId: "child", toUserId: "owner", amount: 200 }
    ]);
  });
});
