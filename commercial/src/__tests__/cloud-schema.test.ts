import { buildCommercialStateFromCloud, buildEntryInsertPayload, buildNotificationInsertPayload } from "@/lib/cloud-schema";
import { pendingSurpriseCountForUser, personalEntryImpact } from "@/lib/domain";

const now = new Date("2026-06-21T12:00:00.000Z");

describe("commercial cloud schema adapter", () => {
  const state = buildCommercialStateFromCloud({
    activeUserId: "u-owner",
    profiles: [
      { id: "u-owner", email: "owner@kasam.test", name: "Owner", total_score: 20, correct_guesses: 2, total_guesses: 3 },
      { id: "u-partner", email: "partner@kasam.test", name: "Partner", nickname: "Ev arkadasi" }
    ],
    projects: [
      {
        id: "p-home",
        name: "Ev Kasasi",
        code: "EV-1",
        created_by: "u-owner",
        default_currency: "TRY",
        default_headings: ["Kira", "Market"],
        split_type: "weighted",
        join_approval_required: true
      }
    ],
    members: [
      {
        project_id: "p-home",
        user_id: "u-owner",
        role: "owner",
        alias: "Ev sahibi",
        member_since: "2026-06-01",
        familiarity_scores: { "u-partner": 42 }
      },
      { project_id: "p-home", user_id: "u-partner", role: "member", member_since: "2026-06-01" }
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
        note: "Haziran",
        entry_date: "2026-06-10",
        status: "done",
        split_with: ["u-owner", "u-partner"],
        split_ratio: [0.5, 0.5],
        created_at: "2026-06-10T00:00:00.000Z",
        updated_at: "2026-06-10T00:00:00.000Z"
      },
      {
        id: "e-usd",
        project_id: "p-home",
        user_id: "u-partner",
        paid_by_id: "u-partner",
        type: "expense",
        amount: 3200,
        currency: "USD",
        exchange_rate: 32,
        short_name: "Yurt disi",
        entry_date: "2026-06-12",
        status: "done",
        split_with: ["u-owner", "u-partner"],
        split_ratio: ["0.5", "0.5"],
        media_type: "gif",
        media_value: "https://example.test/a.gif",
        ocr_raw_text: "100 USD",
        ocr_parsed_amount: 100,
        installment_group_id: "i-1",
        installment_index: 1,
        installment_count: 3,
        created_at: "2026-06-12T00:00:00.000Z",
        updated_at: "2026-06-12T00:00:00.000Z"
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
        entry_date: "2026-06-11",
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
        notification_type: "guess",
        actual_type: "expense",
        title: "Gizli",
        amount: 300,
        guess_deadline: "2026-06-13T00:00:00.000Z",
        game_phase: 1,
        is_completed: false,
        hide_actor: true,
        phase1_guesses: [{ userId: "u-partner", guess: "u-owner" }],
        phase3_options: ["Market", "Kira", "Ulasim", "Kafe"],
        phase3_correct: 0,
        actor_correct_reaction: { type: "emoji", data: "ok" },
        created_at: "2026-06-11T00:00:00.000Z"
      }
    ],
    goals: [
      {
        id: "g-1",
        project_id: "p-home",
        created_by: "u-owner",
        title: "Tatil",
        target_amount: 100000,
        current_amount: 25000,
        deadline: "2026-09-01",
        status: "active"
      }
    ],
    reactions: [{ id: "r-1", entry_id: "e-rent", project_id: "p-home", user_id: "u-partner", emoji: "fire" }],
    settlements: [{ id: "s-1", project_id: "p-home", from_user_id: "u-partner", to_user_id: "u-owner", amount: 500 }],
    reconciliations: [
      {
        id: "rec-1",
        user_id: "u-owner",
        project_id: "p-home",
        month: "2026-06",
        bank_name: "Banka",
        format_type: "csv",
        statement_total: 1000,
        kasa_total: 950,
        diff: 50,
        status: "unmatched",
        raw_rows: [{ amount: 1000 }],
        matched_entry_ids: ["e-rent"],
        unmatched_rows: [{ amount: 50 }],
        ai_analysis: { note: "fark" }
      }
    ],
    insights: [
      {
        id: "ins-1",
        user_id: "u-owner",
        project_id: "p-home",
        type: "goal",
        period: "2026-06",
        insight_data: { days: 4 },
        message: "Hedef etkisi",
        action_suggestion: "Market kis",
        is_read: false,
        created_at: "2026-06-21T00:00:00.000Z"
      }
    ]
  });

  test("maps production profile, project and member fields", () => {
    expect(state.profiles[0].totalScore).toBe(20);
    expect(state.profiles[1].nickname).toBe("Ev arkadasi");
    expect(state.projects[0].type).toBe("shared");
    expect(state.projects[0].defaultCurrency).toBe("TL");
    expect(state.projects[0].defaultHeadings).toEqual(["Kira", "Market"]);
    expect(state.projects[0].splitType).toBe("weighted");
    expect(state.projects[0].members[0].alias).toBe("Ev sahibi");
    expect(state.projects[0].members[0].familiarityScores?.["u-partner"]).toBe(42);
  });

  test("maps entry split, date, media, ocr and installment fields", () => {
    expect(state.entries[0].currency).toBe("TL");
    expect(state.entries[0].title).toBe("Kira");
    expect(state.entries[0].note).toBe("Haziran");
    expect(state.entries[1].amount).toBe(100);
    expect(state.entries[1].exchangeRate).toBe(32);
    expect(state.entries[1].media).toEqual({ type: "gif", value: "https://example.test/a.gif" });
    expect(state.entries[1].ocrParsedAmount).toBe(100);
    expect(state.entries[1].installmentIndex).toBe(1);
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
    expect(personalEntryImpact(state, state.entries[2], "u-partner", now)).toBe(0);
  });

  test("maps game v2 notification fields without exposing details early", () => {
    const notification = state.notifications[0];
    expect(notification.type).toBe("guess");
    expect(notification.actualType).toBe("expense");
    expect(notification.title).toBe("Gizli");
    expect(notification.game?.hideActor).toBe(true);
    expect(notification.game?.phase1Guesses?.[0]?.guess).toBe("u-owner");
    expect(notification.game?.phase3Options).toEqual(["Market", "Kira", "Ulasim", "Kafe"]);
    expect(notification.game?.reactions?.actorCorrect).toEqual({ type: "emoji", data: "ok" });
  });

  test("maps optional commercial tables", () => {
    expect(state.goals?.[0].targetAmount).toBe(100000);
    expect(state.reactions?.[0].emoji).toBe("fire");
    expect(state.settlements?.[0].amount).toBe(500);
    expect(state.reconciliations?.[0].diff).toBe(50);
    expect(state.insights?.[0].actionSuggestion).toBe("Market kis");
  });

  test("builds production compatible insert payloads", () => {
    const draft = {
      projectId: "p-home",
      userId: "u-owner",
      paidById: "u-owner",
      type: "expense" as const,
      title: "Market",
      amount: 100,
      currency: "USD",
      exchangeRate: 32,
      entryDate: "2026-06-21",
      splitWith: ["u-owner", "u-partner"],
      splitRatio: [0.5, 0.5],
      surprise: true
    };
    const entryPayload = buildEntryInsertPayload(draft, "e-1", "n-1", "2026-06-21T12:00:00.000Z");
    expect(entryPayload.amount).toBe(3200);
    expect(entryPayload.entered_amount).toBe(100);
    expect(entryPayload.currency).toBe("USD");
    expect(entryPayload.locked_notification_id).toBe("n-1");
    expect(entryPayload.auto_reveal_at).toBeTruthy();

    const notificationPayload = buildNotificationInsertPayload(draft, "e-1", "n-1", "2026-06-21T12:00:00.000Z");
    expect(notificationPayload.notification_type).toBe("guess");
    expect(notificationPayload.recipients).toEqual(["u-partner"]);
    expect(notificationPayload.actual_type).toBe("expense");
    expect(notificationPayload.guess_deadline).toBeTruthy();
  });
});
