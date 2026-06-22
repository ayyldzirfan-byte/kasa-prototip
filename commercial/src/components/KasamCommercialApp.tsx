"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import {
  BarChart2,
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Home,
  Layers,
  List,
  LogOut,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
  type LucideIcon
} from "lucide-react";
import { createKasamSupabaseClient } from "@/lib/supabase";
import { defaultCommercialScenario, getCommercialScenario, type CommercialScenario } from "@/lib/commercial-scenarios";
import {
  monthSummary,
  pendingSurpriseCountForUser,
  personalEntryImpact,
  projectSummary,
  rhythmScore,
  todaySummary,
  validateSplitRatio,
  weekSummary
} from "@/lib/domain";
import { money, signedMoney } from "@/lib/money";
import { generateGuidancePlan as generateGuidancePlanBase, generateInsightDeck, type Insight } from "@/lib/insights";
import { createCommercialCloudEntry, ensureCommercialStarterData, loadCommercialCloudState } from "@/lib/cloud-client";
import type { AppState, Entry, EntryType, Profile, Project } from "@/lib/types";

type Tab = "home" | "entries" | "projects" | "calendar" | "reports";
type AppMode = "booting" | "auth" | "reset" | "cloud" | "demo";
type AuthMode = "sign-in" | "sign-up";

type AddForm = {
  projectId: string;
  type: EntryType;
  title: string;
  amount: string;
  date: string;
  splitWith: string[];
  surprise: boolean;
};

const tabItems: Array<{ id: Tab; label: string; icon: LucideIcon }> = [
  { id: "home", label: "Ana ekran", icon: Home },
  { id: "entries", label: "Hareketler", icon: List },
  { id: "projects", label: "Bütçeler", icon: Layers },
  { id: "calendar", label: "Takvim", icon: Calendar },
  { id: "reports", label: "Rapor", icon: BarChart2 }
];

const demoNow = new Date("2026-06-21T12:00:00.000Z");

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function splitEqually(userIds: string[]) {
  const ratio = Math.round((1 / userIds.length) * 10000) / 10000;
  const ratios = userIds.map(() => ratio);
  ratios[ratios.length - 1] += 1 - ratios.reduce((sum, item) => sum + item, 0);
  return ratios;
}

function projectMembers(project: Project, state: AppState) {
  return project.members
    .map((member) => state.profiles.find((profile) => profile.id === member.userId))
    .filter((profile): profile is Profile => Boolean(profile));
}

function createLocalEntryId() {
  return `e-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

function defaultForm(state: AppState): AddForm {
  const project = state.projects.find((item) => item.type === "personal") ?? state.projects[0];
  return {
    projectId: project?.id ?? "",
    type: "expense",
    title: "",
    amount: "",
    date: todayInputValue(),
    splitWith: project?.members.map((member) => member.userId) ?? [],
    surprise: false
  };
}

function signedClass(value: number) {
  if (value > 0) return "income";
  if (value < 0) return "expense";
  return "muted";
}

function messageFromError(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Bir şeyler ters gitti. Tekrar dene.";
}

function userLabel(user: Profile) {
  return user.displayName || user.email || "Kullanıcı";
}

function insightSeverityLabel(severity: Insight["severity"]) {
  if (severity === "positive") return "Fırsat";
  if (severity === "urgent") return "Acil";
  if (severity === "warning") return "Dikkat";
  return "Bilgi";
}

async function completeNotificationLocally(client: SupabaseClient, notificationId: string, entryId?: string) {
  const revealedAt = new Date().toISOString();
  const rpcResult = await client.rpc("complete_kasam_guess", { notification_uuid: notificationId });
  if (!rpcResult.error) return;

  const noteResult = await client.from("kasa_notifications").update({ is_completed: true, revealed_at: revealedAt }).eq("id", notificationId);
  if (noteResult.error) throw new Error(`kasa_notifications: ${noteResult.error.message}`);

  if (entryId) {
    await client.from("kasa_entries").update({ locked_notification_id: null, updated_at: revealedAt }).eq("id", entryId);
  }
}

export function KasamCommercialApp() {
  const [client] = useState(() => createKasamSupabaseClient());
  const [scenario, setScenario] = useState<CommercialScenario>(defaultCommercialScenario);
  const [state, setState] = useState<AppState>(defaultCommercialScenario.state);
  const [mode, setMode] = useState<AppMode>("booting");
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");
  const [session, setSession] = useState<Session | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [cloudBusy, setCloudBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("home");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AddForm>(() => defaultForm(defaultCommercialScenario.state));
  const [selectedDate, setSelectedDate] = useState(todayInputValue());

  const refreshCloudState = useCallback(
    async (activeSession: Session) => {
      if (!client) return;
      setCloudBusy(true);
      try {
        await ensureCommercialStarterData(client, activeSession.user);
        const nextState = await loadCommercialCloudState(client, activeSession.user.id);
        setState(nextState);
        setForm(defaultForm(nextState));
        setSession(activeSession);
        setMode("cloud");
        setStatusMessage("Cloud bağlantısı hazır.");
      } catch (error) {
        setMode("auth");
        setStatusMessage(messageFromError(error));
      } finally {
        setCloudBusy(false);
      }
    },
    [client]
  );

  useEffect(() => {
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const visualTestMode = params.has("visualTest");
    if (visualTestMode) {
      const selectedScenario = getCommercialScenario(params.get("scenario"));
      setScenario(selectedScenario);
      setState(selectedScenario.state);
      setForm(defaultForm(selectedScenario.state));
      setMode("demo");
      setStatusMessage("Demo mod.");
      return;
    }

    if (!client) {
      setScenario(defaultCommercialScenario);
      setMode("demo");
      setStatusMessage("Demo mod. Supabase env yok.");
      return;
    }

    let mounted = true;
    client.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setMode("auth");
        setStatusMessage(error.message);
        return;
      }
      if (data.session) {
        const resetMode = typeof window !== "undefined" && window.location.search.includes("resetPassword=1");
        if (resetMode) {
          setSession(data.session);
          setMode("reset");
        } else {
          void refreshCloudState(data.session);
        }
      } else {
        setMode("auth");
      }
    });

    const { data } = client.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY" && nextSession) {
        setSession(nextSession);
        setMode("reset");
        return;
      }
      if (nextSession && event !== "INITIAL_SESSION") void refreshCloudState(nextSession);
      if (!nextSession && event === "SIGNED_OUT") {
        setSession(null);
        setScenario(defaultCommercialScenario);
        setState(defaultCommercialScenario.state);
        setMode("auth");
      }
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [client, refreshCloudState]);

  const user = state.profiles.find((profile) => profile.id === state.activeUserId) ?? state.profiles[0];
  const personalProject = state.projects.find((project) => project.type === "personal");
  const currentProject = state.projects.find((project) => project.id === form.projectId) ?? state.projects[0];
  const now = mode === "demo" ? demoNow : new Date();
  const pendingCount = user ? pendingSurpriseCountForUser(state, user.id) : 0;
  const today = user ? todaySummary(state, user.id, now) : { income: 0, expense: 0, net: 0, pendingIncome: 0, upcomingPayment: 0 };
  const week = user ? weekSummary(state, user.id, now) : today;
  const month = user ? monthSummary(state, user.id, now) : today;
  const rhythm = rhythmScore(month);
  const insightDeck = user ? generateInsightDeck(state, user.id, now) : [];
  const generateGuidancePlan = useCallback(
    (currentState: AppState, userId: string, currentNow: Date, ..._ignored: unknown[]) =>
      generateGuidancePlanBase(currentState, userId, currentNow, scenario.receiptItems, scenario.commerceConsent),
    [scenario.commerceConsent, scenario.receiptItems]
  );
  const guidancePlan = user
    ? generateGuidancePlan(
        state,
        user.id,
        now,
        [
          { name: "Tavuk" },
          { name: "Pirinç" },
          { name: "Yoğurt" }
        ],
        false
      )
    : null;
  const recentEntries = user
    ? [...state.entries]
        .filter((entry) => personalEntryImpact(state, entry, user.id, now) !== 0 || entry.userId === user.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    : [];

  const selectedProjectMembers = useMemo(() => (currentProject ? projectMembers(currentProject, state) : []), [currentProject, state]);

  function openAdd(projectId?: string, date?: string) {
    const project = state.projects.find((item) => item.id === projectId) ?? personalProject ?? state.projects[0];
    setForm({
      projectId: project?.id ?? "",
      type: "expense",
      title: "",
      amount: "",
      date: date ?? todayInputValue(),
      splitWith: project?.members.map((member) => member.userId) ?? [],
      surprise: false
    });
    setShowAdd(true);
  }

  async function submitAuth() {
    if (!client) return;
    if (!authEmail.trim() || !authPassword.trim()) {
      setStatusMessage("E-posta ve şifre gir.");
      return;
    }
    setCloudBusy(true);
    setStatusMessage("");
    try {
      if (authMode === "sign-in") {
        const { data, error } = await client.auth.signInWithPassword({ email: authEmail.trim(), password: authPassword });
        if (error) throw error;
        if (data.session) await refreshCloudState(data.session);
      } else {
        const { data, error } = await client.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: { name: authName.trim() || authEmail.split("@")[0] },
            emailRedirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined
          }
        });
        if (error) throw error;
        if (data.session) {
          await refreshCloudState(data.session);
        } else {
          setStatusMessage("Kayıt alındı. Mailini kontrol et.");
        }
      }
    } catch (error) {
      setStatusMessage(messageFromError(error));
    } finally {
      setCloudBusy(false);
    }
  }

  async function sendPasswordReset() {
    if (!client) return;
    if (!authEmail.trim()) {
      setStatusMessage("Önce e-posta gir.");
      return;
    }
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;
    const { error } = await client.auth.resetPasswordForEmail(authEmail.trim(), { redirectTo });
    setStatusMessage(error ? error.message : "Şifre yenileme maili gönderildi.");
  }

  async function updatePassword() {
    if (!client || !newPassword.trim()) {
      setStatusMessage("Yeni şifre gir.");
      return;
    }
    setCloudBusy(true);
    const { data, error } = await client.auth.updateUser({ password: newPassword });
    if (error) {
      setStatusMessage(error.message);
      setCloudBusy(false);
      return;
    }
    if (data.user) {
      const { data: sessionData } = await client.auth.getSession();
      if (sessionData.session) await refreshCloudState(sessionData.session);
    }
    setStatusMessage("Şifre güncellendi.");
    setCloudBusy(false);
  }

  async function signOut() {
    if (!client) {
      setMode("auth");
      return;
    }
    await client.auth.signOut();
  }

  async function saveEntry() {
    if (saving || !user) return;
    const amount = Number(form.amount.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) {
      setStatusMessage("Tutar gir.");
      return;
    }
    if (!form.title.trim()) {
      setStatusMessage("Başlık gir.");
      return;
    }

    const project = state.projects.find((item) => item.id === form.projectId);
    if (!project) {
      setStatusMessage("Kasa seç.");
      return;
    }
    const splitWith = form.splitWith.length ? form.splitWith : project.members.map((member) => member.userId);
    const splitRatio = splitEqually(splitWith);
    if (!validateSplitRatio(splitRatio)) {
      setStatusMessage("Paylaşım oranı hatalı.");
      return;
    }

    setSaving(true);
    setStatusMessage("");
    try {
      if (mode === "cloud" && client && session) {
        await createCommercialCloudEntry(client, {
          projectId: project.id,
          userId: user.id,
          paidById: user.id,
          type: form.type,
          title: form.title.trim().slice(0, 200),
          amount,
          currency: "TL",
          exchangeRate: 1,
          entryDate: form.date,
          splitWith,
          splitRatio,
          surprise: form.surprise
        });
        const nextState = await loadCommercialCloudState(client, session.user.id);
        setState(nextState);
        setForm(defaultForm(nextState));
      } else {
        const entryId = createLocalEntryId();
        const notificationId = form.surprise ? `n-${entryId}` : null;
        const isoDate = `${form.date}T12:00:00.000Z`;
        const entry: Entry = {
          id: entryId,
          projectId: project.id,
          userId: user.id,
          paidById: user.id,
          type: form.type,
          title: form.title.trim().slice(0, 200),
          amount,
          currency: "TL",
          exchangeRate: 1,
          rateLockedAt: isoDate,
          date: isoDate,
          status: "done",
          splitWith,
          splitRatio,
          lockedNotificationId: notificationId,
          revealedAt: form.surprise ? null : isoDate,
          autoRevealAt: form.surprise ? new Date(new Date(isoDate).getTime() + 48 * 60 * 60 * 1000).toISOString() : null,
          media: form.surprise ? { type: "sticker", value: "gift" } : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setState((current) => ({
          ...current,
          entries: [entry, ...current.entries],
          notifications: notificationId
            ? [
                {
                  id: notificationId,
                  projectId: project.id,
                  entryId,
                  actorId: user.id,
                  recipients: project.members.map((member) => member.userId).filter((id) => id !== user.id),
                  type: "guess",
                  gamePhase: 1,
                  isCompleted: false,
                  revealedAt: null
                },
                ...current.notifications
              ]
            : current.notifications
        }));
      }
      setShowAdd(false);
      setTab("entries");
      setStatusMessage("Kaydedildi.");
    } catch (error) {
      setStatusMessage(messageFromError(error));
    } finally {
      setSaving(false);
    }
  }

  async function revealNotification(notificationId: string) {
    const notification = state.notifications.find((item) => item.id === notificationId);
    if (mode === "cloud" && client && session && notification) {
      setCloudBusy(true);
      try {
        await completeNotificationLocally(client, notificationId, notification.entryId);
        const nextState = await loadCommercialCloudState(client, session.user.id);
        setState(nextState);
        setStatusMessage("Oyun tamamlandı.");
      } catch (error) {
        setStatusMessage(messageFromError(error));
      } finally {
        setCloudBusy(false);
      }
      return;
    }

    setState((current) => ({
      ...current,
      entries: current.entries.map((entry) =>
        entry.lockedNotificationId === notificationId
          ? { ...entry, lockedNotificationId: null, revealedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : entry
      ),
      notifications: current.notifications.map((item) =>
        item.id === notificationId ? { ...item, gamePhase: "done", isCompleted: true, revealedAt: new Date().toISOString() } : item
      )
    }));
  }

  function renderEntry(entry: Entry, compact = false) {
    const project = state.projects.find((item) => item.id === entry.projectId);
    const impact = user ? personalEntryImpact(state, entry, user.id, now) : 0;
    const hidden = Boolean(entry.lockedNotificationId && !entry.revealedAt);
    return (
      <article className="entry-row" key={entry.id}>
        <div className={`icon-box ${hidden ? "pending" : entry.type === "income" ? "income" : "expense"}`}>
          {hidden ? <Sparkles size={18} /> : entry.type === "income" ? "+" : "-"}
        </div>
        <div className="entry-main">
          <p className="entry-title">{hidden ? "Gizli hareket" : entry.title}</p>
          <p className="entry-subtitle">
            {project?.name} · {new Date(entry.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
            {!compact && !hidden ? ` · Bana etkisi ${signedMoney(impact)}` : ""}
          </p>
        </div>
        <strong className={hidden ? "pending" : signedClass(impact)}>{hidden ? "?? TL" : signedMoney(impact)}</strong>
      </article>
    );
  }

  function AuthScreen() {
    return (
      <main className="screen-stack auth-screen">
        <section className="card auth-card">
          <p className="eyebrow">Paranın nereye gittiğini bil.</p>
          <h1 className="title-xl">Kasam</h1>
          <p className="muted">Kendi paranı ve ortak harcamaların sana etkisini tek ekranda gör.</p>
          <div className="segmented">
            <button className={authMode === "sign-in" ? "segment active" : "segment"} type="button" onClick={() => setAuthMode("sign-in")}>
              Giriş
            </button>
            <button className={authMode === "sign-up" ? "segment active" : "segment"} type="button" onClick={() => setAuthMode("sign-up")}>
              Kayıt
            </button>
          </div>
          <div className="form-grid">
            {authMode === "sign-up" ? (
              <div className="field">
                <label>Ad</label>
                <input value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Adın" />
              </div>
            ) : null}
            <div className="field">
              <label>E-posta</label>
              <input value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="mail@adres.com" type="email" />
            </div>
            <div className="field">
              <label>Şifre</label>
              <input value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="Şifre" type="password" />
            </div>
            <button className="pill full" type="button" onClick={submitAuth} disabled={cloudBusy}>
              {cloudBusy ? "Bekle..." : authMode === "sign-in" ? "Giriş yap" : "Kayıt ol"}
            </button>
            <button className="ghost-button full" type="button" onClick={sendPasswordReset}>
              Şifremi unuttum
            </button>
            <button className="ghost-button full" type="button" onClick={() => setMode("demo")}>
              Demoyu aç
            </button>
          </div>
          {statusMessage ? <p className="status-line">{statusMessage}</p> : null}
        </section>
      </main>
    );
  }

  function ResetScreen() {
    return (
      <main className="screen-stack auth-screen">
        <section className="card auth-card">
          <p className="eyebrow">Şifre yenileme</p>
          <h1 className="title-xl">Yeni şifre oluştur</h1>
          <div className="field">
            <label>Yeni şifre</label>
            <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Yeni şifre" type="password" />
          </div>
          <button className="pill full" type="button" onClick={updatePassword} disabled={cloudBusy}>
            {cloudBusy ? "Güncelleniyor..." : "Şifreyi güncelle"}
          </button>
          {statusMessage ? <p className="status-line">{statusMessage}</p> : null}
        </section>
      </main>
    );
  }

  function HomeScreen() {
    if (!user) return null;
    const sharedProjects = state.projects.filter((project) => project.type === "shared");
    return (
      <main className="screen-stack">
        <header className="hero-header">
          <div>
            <p className="eyebrow">Paranın nereye gittiğini bil.</p>
            <h1 className="title-xl">Kasam</h1>
          </div>
          <div className="header-actions">
            <span className="cloud-pill">{mode === "cloud" ? "Cloud" : "Demo"}</span>
            {mode === "cloud" ? (
              <button className="ghost-icon" type="button" onClick={signOut} aria-label="Çıkış">
                <LogOut size={18} />
              </button>
            ) : null}
          </div>
        </header>

        <section className="card row-between">
          <div className="profile-left">
            <div className="avatar">{initials(userLabel(user))}</div>
            <div>
              <h2>{user.displayName}</h2>
              <p className="muted tiny">Kendi kasan ve bağlı bütçelerin.</p>
            </div>
          </div>
          <button className="ghost-button" type="button" onClick={() => setTab("entries")}>
            <Bell size={18} />
            Bildirimler
            {pendingCount > 0 ? <span className="badge">{pendingCount > 9 ? "9+" : pendingCount}</span> : null}
          </button>
        </section>

        <section className="card row-between">
          <div className="score-ring" style={{ ["--score" as string]: rhythm.score } as CSSProperties}>
            <div className="score-inner">
              <strong>{rhythm.score}</strong>
              <span className="tiny">SKOR</span>
            </div>
          </div>
          <div>
            <p className="eyebrow">Finansal ritim</p>
            <h2 className="title-xl">{rhythm.label}</h2>
            <p className="muted">{rhythm.message}</p>
          </div>
          <strong className={signedClass(month.net)}>{signedMoney(month.net)}</strong>
        </section>

        <section className="metric-grid">
          {[
            ["Bugün", today.net],
            ["Bu hafta", week.net],
            ["Bu ay", month.net]
          ].map(([label, value]) => (
            <article className="metric-card" key={label}>
              <span className="muted tiny">{label}</span>
              <strong className={signedClass(Number(value))}>{signedMoney(Number(value))}</strong>
            </article>
          ))}
        </section>

        {insightDeck.length ? (
          <section className="card insight-card">
            <div className="row-between">
              <div>
                <p className="eyebrow">Kasam öneriyor</p>
                <h2>{insightDeck[0].title}</h2>
              </div>
              <Sparkles className={insightDeck[0].severity} size={22} />
            </div>
            <p className="muted">{insightDeck[0].message}</p>
            <div className="insight-meta">
              <span className={`insight-tag ${insightDeck[0].severity}`}>{insightSeverityLabel(insightDeck[0].severity)}</span>
              {insightDeck[0].actionLabel ? <span className="tiny muted">{insightDeck[0].actionLabel}</span> : null}
            </div>
            {insightDeck.length > 1 ? (
              <div className="insight-list">
                {insightDeck.slice(1, 3).map((insight) => (
                  <article className="insight-item" key={insight.id}>
                    <span className={`insight-dot ${insight.severity}`} />
                    <div>
                      <strong>{insight.title}</strong>
                      <p className="muted tiny">{insight.message}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {guidancePlan ? (
          <section className="card guidance-card">
            <div className="row-between">
              <div>
                <p className="eyebrow">Akıllı yönlendirme</p>
                <h2>Kasam ne yapabileceğini söyler</h2>
              </div>
              <Sparkles size={22} />
            </div>
            <div className="guidance-grid">
              <article className="guidance-item">
                <span className="tiny muted">Hedef</span>
                <strong>{guidancePlan.acceleration[0]?.title ?? "Hedef için yeterli veri yok"}</strong>
                <p className="muted tiny">
                  {guidancePlan.acceleration[0]?.message ?? "Harcama düzeni oluşunca hedefi öne çekme planı burada görünür."}
                </p>
              </article>
              <article className="guidance-item">
                <span className="tiny muted">Fişten yemek fikri</span>
                <strong>{guidancePlan.mealIdeas[0]?.title ?? "Sepet okununca öneri gelir"}</strong>
                <p className="muted tiny">
                  {guidancePlan.mealIdeas[0]?.reason ?? "Market fişi ürünleri yemeğe çevrilebilir sinyal verirse öneri üretilir."}
                </p>
              </article>
              <article className="guidance-item">
                <span className="tiny muted">Ticari sinyal</span>
                <strong>{guidancePlan.commerceSignals[0]?.allowed ? guidancePlan.commerceSignals[0].segment : "İzin olmadan kapalı"}</strong>
                <p className="muted tiny">{guidancePlan.commerceSignals[0]?.reason}</p>
              </article>
            </div>
            <div className="premium-strip" aria-label="Premium özellik adayları">
              {guidancePlan.premiumHooks.slice(0, 4).map((hook) => (
                <span key={hook}>{hook}</span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="card">
          <div className="row-between">
            <div>
              <h2>Kişisel kasa hareketleri</h2>
              <p className="muted tiny">Ortak kasalardan sana düşen etki dahil.</p>
            </div>
            <button className="ghost-button" type="button" onClick={() => setTab("entries")}>
              Tümü
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="list">{recentEntries.length ? recentEntries.slice(0, 3).map((entry) => renderEntry(entry, true)) : <p className="empty">Henüz hareket yok. İlk hareketi sen ekle.</p>}</div>
        </section>

        <section className="card">
          <h2>Ortak kasalardan gelen etkiler</h2>
          <div className="list">
            {sharedProjects.length ? (
              sharedProjects.map((project) => {
                const summary = projectSummary(state, project.id, now);
                const myImpact = state.entries
                  .filter((entry) => entry.projectId === project.id)
                  .reduce((sum, entry) => sum + personalEntryImpact(state, entry, user.id, now), 0);
                return (
                  <article className="entry-row" key={project.id}>
                    <div className="icon-box">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="entry-title">{project.name}</p>
                      <p className="entry-subtitle">
                        Ortak net {signedMoney(summary.net)} · Bana etkisi {signedMoney(myImpact)}
                      </p>
                    </div>
                    <strong className={signedClass(myImpact)}>{signedMoney(myImpact)}</strong>
                  </article>
                );
              })
            ) : (
              <p className="empty">Bütçe yok. Kendi kasanı oluştur veya birine katıl.</p>
            )}
          </div>
        </section>

        <button className="pill full" type="button" onClick={() => openAdd()}>
          <Plus size={18} />
          Hareket ekle
        </button>
      </main>
    );
  }

  function EntriesScreen() {
    if (!user) return null;
    const visibleNotifications = state.notifications.filter((notification) => notification.recipients.includes(user.id));
    return (
      <main className="screen-stack">
        <section className="card">
          <h1>Bildirimler</h1>
          <p className="muted">Yeni hareketler, tahminler ve geçmiş oyunlar.</p>
          <div className="list">
            {visibleNotifications.length === 0 ? <p className="empty">Sessizlik...</p> : null}
            {visibleNotifications.map((notification) => {
              const entry = state.entries.find((item) => item.id === notification.entryId);
              return (
                <article className={`notice ${notification.isCompleted ? "done" : ""}`} key={notification.id}>
                  <div>
                    <p className="entry-title">{notification.isCompleted ? "Oyun tamamlandı" : "Yeni tahmin var"}</p>
                    <p className="muted tiny">{notification.isCompleted ? entry?.title : "Detaylar oyun bitene kadar kapalı."}</p>
                  </div>
                  {!notification.isCompleted ? (
                    <button className="pill" type="button" onClick={() => revealNotification(notification.id)} disabled={cloudBusy}>
                      Tahmin et
                    </button>
                  ) : (
                    <Check className="income" size={18} />
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="card">
          <div className="row-between">
            <h1>Hareketler</h1>
            <button className="pill" type="button" onClick={() => openAdd()}>
              Ekle
            </button>
          </div>
          <div className="list">{state.entries.length ? state.entries.map((entry) => renderEntry(entry)) : <p className="empty">Henüz hareket yok. İlk hareketi sen ekle.</p>}</div>
        </section>
      </main>
    );
  }

  function ProjectsScreen() {
    if (!user) return null;
    return (
      <main className="screen-stack">
        <section className="card row-between">
          <h1>Bütçeler</h1>
          <button className="pill" type="button">
            Yeni bütçe
          </button>
        </section>
        <div className="list">
          {state.projects.map((project) => {
            const summary = project.type === "shared" ? projectSummary(state, project.id, now) : monthSummary(state, user.id, now);
            return (
              <article className="card project-card" key={project.id}>
                <div className="row-between">
                  <div className="profile-left">
                    <div className="avatar">{project.type === "personal" ? initials(userLabel(user)) : initials(project.name)}</div>
                    <div>
                      <h2>{project.type === "personal" ? `${user.displayName} kasası` : project.name}</h2>
                      <p className="muted tiny">{project.type === "personal" ? "Kişisel kasa" : `${project.members.length} üye · ortak kasa`}</p>
                    </div>
                  </div>
                  <strong className={signedClass(summary.net)}>{signedMoney(summary.net)}</strong>
                </div>
                <div className="row-between tiny">
                  <span className="income">Gelir {money(summary.income)}</span>
                  <span className="expense">Gider {money(summary.expense)}</span>
                </div>
                <button className="ghost-button" type="button" onClick={() => openAdd(project.id)}>
                  Bu kasaya hareket ekle
                </button>
              </article>
            );
          })}
        </div>
      </main>
    );
  }

  function CalendarScreen() {
    const days = Array.from({ length: 30 }, (_, index) => index + 1);
    const entriesForDay = state.entries.filter((entry) => entry.date.startsWith(selectedDate));
    return (
      <main className="screen-stack">
        <section className="card">
          <div className="row-between">
            <h1>Haziran 2026</h1>
            <button className="pill" type="button" onClick={() => openAdd(undefined, selectedDate)}>
              Bu güne ekle
            </button>
          </div>
          <div className="calendar-grid">
            {days.map((day) => {
              const date = `2026-06-${String(day).padStart(2, "0")}`;
              return (
                <button className={date === selectedDate ? "day active" : "day"} type="button" key={date} onClick={() => setSelectedDate(date)}>
                  {day}
                </button>
              );
            })}
          </div>
        </section>
        <section className="card">
          <h2>Seçili gün</h2>
          <div className="list">{entriesForDay.length ? entriesForDay.map((entry) => renderEntry(entry)) : <p className="empty">Bu gün temiz.</p>}</div>
        </section>
      </main>
    );
  }

  function ReportsScreen() {
    return (
      <main className="screen-stack">
        <section className="card">
          <h1>Rapor</h1>
          <p className="muted">Kişisel etkin, ortak kasa dağılımın ve paylaşılabilir fiş.</p>
        </section>
        <section className="receipt">
          <div className="receipt-head">
            <strong>KASAM FİŞİ</strong>
            <span>{new Date().toLocaleDateString("tr-TR")}</span>
          </div>
          <div className="receipt-line">
            <span>Kişisel net</span>
            <strong>{signedMoney(month.net)}</strong>
          </div>
          <div className="receipt-line">
            <span>Gelir</span>
            <strong>{money(month.income)}</strong>
          </div>
          <div className="receipt-line">
            <span>Gider</span>
            <strong>{money(month.expense)}</strong>
          </div>
          {user
            ? state.projects
                .filter((project) => project.type === "shared")
                .map((project) => (
                  <div className="receipt-line" key={project.id}>
                    <span>{project.name}</span>
                    <strong>
                      {signedMoney(
                        state.entries
                          .filter((entry) => entry.projectId === project.id)
                          .reduce((sum, entry) => sum + personalEntryImpact(state, entry, user.id, now), 0)
                      )}
                    </strong>
                  </div>
                ))
            : null}
          <p className="receipt-watermark">kasam.app</p>
        </section>
      </main>
    );
  }

  function AddSheet() {
    const members = selectedProjectMembers;
    return (
      <section className="sheet" aria-label="Hareket ekle">
        <div className="row-between">
          <h2>Hareket ekle</h2>
          <button className="ghost-button" type="button" onClick={() => setShowAdd(false)} disabled={saving}>
            Kapat
          </button>
        </div>
        <div className="form-grid">
          <div className="segmented">
            {(["expense", "income"] as EntryType[]).map((type) => (
              <button className={form.type === type ? "segment active" : "segment"} type="button" key={type} onClick={() => setForm({ ...form, type })}>
                {type === "expense" ? "Gider" : "Gelir"}
              </button>
            ))}
          </div>
          <div className="field">
            <label>Kasa</label>
            <select
              value={form.projectId}
              onChange={(event) => {
                const project = state.projects.find((item) => item.id === event.target.value) ?? state.projects[0];
                setForm({ ...form, projectId: project.id, splitWith: project.members.map((member) => member.userId) });
              }}
            >
              {state.projects.map((project) => (
                <option value={project.id} key={project.id}>
                  {project.type === "personal" && user ? `${user.displayName} kasası` : project.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Tutar</label>
            <input inputMode="decimal" placeholder="0 TL" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
          </div>
          <div className="field">
            <label>Tarih</label>
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          </div>
          <div className="field">
            <label>Başlık</label>
            <input maxLength={200} placeholder="Market, kira, maaş..." value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </div>
          <div className="field">
            <label>Paylaşılacak kişiler</label>
            <div className="member-grid">
              {members.map((member) => (
                <button
                  className={form.splitWith.includes(member.id) ? "member-chip active" : "member-chip"}
                  type="button"
                  key={member.id}
                  onClick={() => {
                    const next = form.splitWith.includes(member.id) ? form.splitWith.filter((id) => id !== member.id) : [...form.splitWith, member.id];
                    setForm({ ...form, splitWith: next.length ? next : [member.id] });
                  }}
                >
                  <span>{member.displayName}</span>
                  {form.splitWith.includes(member.id) ? <Check size={16} /> : null}
                </button>
              ))}
            </div>
          </div>
          <button className={form.surprise ? "segment active" : "segment"} type="button" onClick={() => setForm({ ...form, surprise: !form.surprise })}>
            Tahmin oyunu {form.surprise ? "açık" : "kapalı"}
          </button>
          <button className="pill full" type="button" onClick={saveEntry} disabled={saving}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </section>
    );
  }

  if (mode === "booting") {
    return (
      <div className="app-shell">
        <div className="phone-frame">
          <section className="card auth-card">
            <RefreshCw className="spin" size={22} />
            <p>Kasam açılıyor...</p>
          </section>
        </div>
      </div>
    );
  }

  if (mode === "auth") {
    return (
      <div className="app-shell">
        <div className="phone-frame">
          <AuthScreen />
        </div>
      </div>
    );
  }

  if (mode === "reset") {
    return (
      <div className="app-shell">
        <div className="phone-frame">
          <ResetScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="phone-frame">
        {statusMessage ? <p className="status-line floating">{statusMessage}</p> : null}
        {tab === "home" ? <HomeScreen /> : null}
        {tab === "entries" ? <EntriesScreen /> : null}
        {tab === "projects" ? <ProjectsScreen /> : null}
        {tab === "calendar" ? <CalendarScreen /> : null}
        {tab === "reports" ? <ReportsScreen /> : null}
      </div>
      <nav className="tabbar" aria-label="Ana menü">
        {tabItems.map((item) => {
          const Icon = item.icon;
          return (
            <button className={tab === item.id ? "tab-button active" : "tab-button"} type="button" key={item.id} onClick={() => setTab(item.id)}>
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      {showAdd ? <AddSheet /> : null}
    </div>
  );
}
