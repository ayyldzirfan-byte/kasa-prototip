import type { SupabaseClient } from "@supabase/supabase-js";
import { buildCommercialStateFromCloud, type EntryRow, type NotificationRow, type ProfileRow, type ProjectMemberRow, type ProjectRow } from "./cloud-schema";
import type { AppState, Entry, EntryType } from "./types";

type CommercialEntryDraft = {
  projectId: string;
  userId: string;
  paidById: string;
  type: EntryType;
  title: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  entryDate: string;
  splitWith: string[];
  splitRatio: number[];
  surprise?: boolean;
};

function uniqueIds(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

async function selectRows<T>(query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>, label: string) {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data || [];
}

export async function loadCommercialCloudState(client: SupabaseClient, activeUserId: string): Promise<AppState> {
  const memberRows = await selectRows<ProjectMemberRow>(
    client.from("kasa_project_members").select("*").eq("user_id", activeUserId),
    "kasa_project_members"
  );
  const projectIds = uniqueIds(memberRows.map((member) => member.project_id));

  if (!projectIds.length) {
    const profiles = await selectRows<ProfileRow>(client.from("kasa_profiles").select("*").eq("id", activeUserId), "kasa_profiles");
    return buildCommercialStateFromCloud({ activeUserId, profiles, projects: [], members: [], entries: [], notifications: [] });
  }

  const [projects, allMembers, entries, notifications] = await Promise.all([
    selectRows<ProjectRow>(client.from("kasa_projects").select("*").in("id", projectIds), "kasa_projects"),
    selectRows<ProjectMemberRow>(client.from("kasa_project_members").select("*").in("project_id", projectIds), "kasa_project_members"),
    selectRows<EntryRow>(client.from("kasa_entries").select("*").in("project_id", projectIds).order("entry_date", { ascending: false }), "kasa_entries"),
    selectRows<NotificationRow>(client.from("kasa_notifications").select("*").in("project_id", projectIds).order("created_at", { ascending: false }), "kasa_notifications")
  ]);

  const profileIds = uniqueIds([...allMembers.map((member) => member.user_id), activeUserId]);
  const profiles = await selectRows<ProfileRow>(client.from("kasa_profiles").select("*").in("id", profileIds), "kasa_profiles");

  return buildCommercialStateFromCloud({
    activeUserId,
    profiles,
    projects,
    members: allMembers,
    entries,
    notifications
  });
}

export async function createCommercialCloudEntry(client: SupabaseClient, draft: CommercialEntryDraft) {
  const now = new Date().toISOString();
  const notificationId = draft.surprise ? crypto.randomUUID() : null;
  const status = "done";

  const entryPayload = {
    project_id: draft.projectId,
    user_id: draft.userId,
    paid_by_id: draft.paidById,
    type: draft.type,
    amount: draft.amount * draft.exchangeRate,
    entered_amount: draft.amount,
    currency: draft.currency,
    exchange_rate: draft.exchangeRate,
    rate_locked_at: now,
    short_name: draft.title,
    entry_date: draft.entryDate,
    split_with: draft.splitWith,
    split_ratio: draft.splitRatio,
    status,
    locked_notification_id: notificationId,
    created_at: now,
    updated_at: now
  };

  const { data: entry, error: entryError } = await client.from("kasa_entries").insert(entryPayload).select("*").single<Entry>();
  if (entryError) throw new Error(`kasa_entries: ${entryError.message}`);

  if (notificationId) {
    const recipients = draft.splitWith.filter((userId) => userId !== draft.userId);
    const notificationPayload = {
      id: notificationId,
      project_id: draft.projectId,
      entry_id: entry?.id,
      actor_id: draft.userId,
      recipients,
      mode: "surprise",
      type: "guess",
      game_phase: 1,
      is_completed: false,
      created_at: now
    };
    const { error: notificationError } = await client.from("kasa_notifications").insert(notificationPayload);
    if (notificationError) throw new Error(`kasa_notifications: ${notificationError.message}`);
  }

  return entry;
}
