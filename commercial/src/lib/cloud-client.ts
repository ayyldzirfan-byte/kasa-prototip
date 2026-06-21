import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  buildCommercialStateFromCloud,
  buildEntryInsertPayload,
  buildNotificationInsertPayload,
  type CommercialEntryDraft,
  type EntryRow,
  type GoalRow,
  type InsightRow,
  type NotificationRow,
  type ProfileRow,
  type ProjectMemberRow,
  type ProjectRow,
  type ReactionRow,
  type ReconciliationRow,
  type SettlementRow
} from "./cloud-schema";
import type { AppState } from "./types";

function uniqueIds(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function displayNameFromUser(user: Pick<User, "email" | "user_metadata">) {
  const metadataName = typeof user.user_metadata?.name === "string" ? user.user_metadata.name.trim() : "";
  const emailName = user.email?.split("@")[0]?.trim() || "Kullanıcı";
  return metadataName || emailName;
}

function personalProjectCode(userId: string) {
  return `KASAM-${userId.replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

async function selectRows<T>(query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>, label: string) {
  const { data, error } = await query;
  if (error) throw new Error(`${label}: ${error.message}`);
  return data || [];
}

async function selectOptionalRows<T>(query: PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function ensureCommercialStarterData(client: SupabaseClient, user: Pick<User, "id" | "email" | "user_metadata">) {
  const now = new Date().toISOString();
  const displayName = displayNameFromUser(user);
  const email = user.email || "";

  const profileResult = await client.from("kasa_profiles").upsert(
    {
      id: user.id,
      email,
      name: displayName,
      nickname: displayName,
      updated_at: now
    },
    { onConflict: "id" }
  );
  if (profileResult.error) throw new Error(`kasa_profiles: ${profileResult.error.message}`);

  const currentMemberships = await selectRows<ProjectMemberRow>(
    client.from("kasa_project_members").select("*").eq("user_id", user.id),
    "kasa_project_members"
  );
  if (currentMemberships.length) return;

  const projectId = crypto.randomUUID();
  const projectResult = await client.from("kasa_projects").insert({
    id: projectId,
    name: `${displayName} kasası`,
    purpose: "personal",
    code: personalProjectCode(user.id),
    created_by: user.id,
    created_at: now,
    updated_at: now
  });
  if (projectResult.error) throw new Error(`kasa_projects: ${projectResult.error.message}`);

  const memberResult = await client.from("kasa_project_members").insert({
    project_id: projectId,
    user_id: user.id,
    role: "owner",
    member_since: now.slice(0, 10),
    created_at: now
  });
  if (memberResult.error) throw new Error(`kasa_project_members: ${memberResult.error.message}`);
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

  const [projects, allMembers, entries, notifications, goals, reactions, settlements, reconciliations, insights] = await Promise.all([
    selectRows<ProjectRow>(client.from("kasa_projects").select("*").in("id", projectIds), "kasa_projects"),
    selectRows<ProjectMemberRow>(client.from("kasa_project_members").select("*").in("project_id", projectIds), "kasa_project_members"),
    selectRows<EntryRow>(client.from("kasa_entries").select("*").in("project_id", projectIds).order("entry_date", { ascending: false }), "kasa_entries"),
    selectRows<NotificationRow>(client.from("kasa_notifications").select("*").in("project_id", projectIds).order("created_at", { ascending: false }), "kasa_notifications"),
    selectOptionalRows<GoalRow>(client.from("kasa_goals").select("*").in("project_id", projectIds)),
    selectOptionalRows<ReactionRow>(client.from("kasa_reactions").select("*").in("project_id", projectIds)),
    selectOptionalRows<SettlementRow>(client.from("kasa_settlements").select("*").in("project_id", projectIds)),
    selectOptionalRows<ReconciliationRow>(client.from("kasa_reconciliations").select("*").or(`project_id.in.(${projectIds.join(",")}),user_id.eq.${activeUserId}`)),
    selectOptionalRows<InsightRow>(client.from("kasa_insights").select("*").eq("user_id", activeUserId))
  ]);

  const profileIds = uniqueIds([...allMembers.map((member) => member.user_id), activeUserId]);
  const profiles = await selectRows<ProfileRow>(client.from("kasa_profiles").select("*").in("id", profileIds), "kasa_profiles");

  return buildCommercialStateFromCloud({
    activeUserId,
    profiles,
    projects,
    members: allMembers,
    entries,
    notifications,
    goals,
    reactions,
    settlements,
    reconciliations,
    insights
  });
}

export async function createCommercialCloudEntry(client: SupabaseClient, draft: CommercialEntryDraft) {
  const now = new Date().toISOString();
  const entryId = crypto.randomUUID();
  const notificationId = draft.surprise ? crypto.randomUUID() : null;
  const entryPayload = buildEntryInsertPayload(draft, entryId, notificationId, now);

  const { data: entry, error: entryError } = await client.from("kasa_entries").insert(entryPayload).select("*").single<EntryRow>();
  if (entryError) throw new Error(`kasa_entries: ${entryError.message}`);

  if (notificationId) {
    const notificationPayload = buildNotificationInsertPayload(draft, entry?.id || entryId, notificationId, now);
    const { error: notificationError } = await client.from("kasa_notifications").insert(notificationPayload);
    if (notificationError) throw new Error(`kasa_notifications: ${notificationError.message}`);
  }

  return entry;
}
