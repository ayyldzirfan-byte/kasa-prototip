import { buildCommercialStateFromCloud } from "@/lib/cloud-schema";
import { pendingSurpriseCountForUser, personalEntryImpact } from "@/lib/domain";

const now = new Date("2026-06-21T12:00:00.000Z");

describe("commercial cloud schema adapter", () => {
  const state = buildCommercialStateFromCloud({
    activeUserId: "u-owner",
    profiles: [
      { id: "u-owner", email: "owner@kasam.test", name: "Owner" },
      { id: "u-partner", email: "partner@kasam.test", name: "Partner" }
    ],
    projects: [{ id: "p-home", name: "Ev Kasası", code: "EV-1", created_by: "u-owner" }],
    members: [
      { project_id: "p-home", user_id: "u-owner", role: "owner", member_since: "2026-06-01T00:00:00.000Z" },
      { project_id: "p-home", user_id: "u-partner", role: "member", member_since: "2026-06-01T00:00:00.000Z" }
    ],
    entries: [
      {
        id: "e-rent",
        project_id: "p-home",
        user_id: "u-owner",
        paid_by_id: "u-owner",
        type: "expense",
        amount: 1000,
        entered_amount: 1000,
        currency: "TRY",
        exchange_rate: 1,
        short_name: "Kira",
        entry_date: "2026-06-10T00:00:00.000Z",
        status: "done",
        split_with: ["u-owner", "u-partner"],
        split_ratio: [0.5, 0.5],
        created_at: "2026-06-10T00:00:00.000Z",
        updated_at: "2026-06-10T00:00:00.000Z"
      },
      {
        id: "e-hidden",
        project_id: "p-home",
        user_id: "u-owner",
        paid_by_id: "u-owner",
        type: "expense",
        amount: 300,
        entered_amount: 300,
        currency: "TL",
        exchange_rate: 1,
        short_name: "Gizli",
        entry_date: "2026-06-11T00:00:00.000Z",
        status: "done",
        split_with: ["u-owner", "u-partner"],
        split_ratio: [0.5, 0.5],
        locked_notification_id: "n-hidden",
        created_at: "2026-06-11T00:00:00.000Z",
        updated_at: "2026-06-11T00:00:00.000Z"
      }
    ],
    notifications: [
      {
        id: "n-hidden",
        project_id: "p-home",
        entry_id: "e-hidden",
        actor_id: "u-owner",
        recipients: ["u-partner"],
        mode: "surprise",
        game_phase: 1,
        is_completed: false,
        created_at: "2026-06-11T00:00:00.000Z"
      }
    ]
  });

  test("maps cloud rows into commercial state", () => {
    expect(state.projects[0].type).toBe("shared");
    expect(state.entries[0].currency).toBe("TL");
    expect(state.entries[0].title).toBe("Kira");
  });

  test("shared expense affects payer and recipient with their own share", () => {
    expect(personalEntryImpact(state, state.entries[0], "u-owner", now)).toBe(500);
    expect(personalEntryImpact(state, state.entries[0], "u-partner", now)).toBe(-500);
  });

  test("surprise count is visible to recipient but not actor", () => {
    expect(pendingSurpriseCountForUser(state, "u-owner")).toBe(0);
    expect(pendingSurpriseCountForUser(state, "u-partner")).toBe(1);
  });

  test("hidden surprise stays out of balance before game completion", () => {
    expect(personalEntryImpact(state, state.entries[1], "u-partner", now)).toBe(0);
  });
});
