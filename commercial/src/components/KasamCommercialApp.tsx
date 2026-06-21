"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  BarChart2,
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Home,
  Layers,
  List,
  Plus,
  ReceiptText,
  Sparkles,
  Users,
  type LucideIcon
} from "lucide-react";
import { demoState } from "@/lib/seed";
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
import type { AppState, Entry, EntryType, Project } from "@/lib/types";

type Tab = "home" | "entries" | "projects" | "calendar" | "reports";

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

const now = new Date("2026-06-21T12:00:00.000Z");

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
    .filter(Boolean);
}

function createEntryId() {
  return `e-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

function defaultForm(state: AppState): AddForm {
  const project = state.projects.find((item) => item.type === "personal") ?? state.projects[0];
  return {
    projectId: project.id,
    type: "expense",
    title: "",
    amount: "",
    date: "2026-06-21",
    splitWith: project.members.map((member) => member.userId),
    surprise: false
  };
}

function signedClass(value: number) {
  if (value > 0) return "income";
  if (value < 0) return "expense";
  return "muted";
}

export function KasamCommercialApp() {
  const [state, setState] = useState<AppState>(demoState);
  const [tab, setTab] = useState<Tab>("home");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AddForm>(() => defaultForm(demoState));
  const [selectedDate, setSelectedDate] = useState("2026-06-21");

  const user = state.profiles.find((profile) => profile.id === state.activeUserId) ?? state.profiles[0];
  const personalProject = state.projects.find((project) => project.type === "personal");
  const currentProject = state.projects.find((project) => project.id === form.projectId) ?? state.projects[0];
  const pendingCount = pendingSurpriseCountForUser(state, user.id);
  const today = todaySummary(state, user.id, now);
  const week = weekSummary(state, user.id, now);
  const month = monthSummary(state, user.id, now);
  const rhythm = rhythmScore(month);
  const recentEntries = [...state.entries]
    .filter((entry) => personalEntryImpact(state, entry, user.id, now) !== 0 || entry.userId === user.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const selectedProjectMembers = useMemo(() => projectMembers(currentProject, state), [currentProject, state]);

  function openAdd(projectId?: string, date?: string) {
    const project = state.projects.find((item) => item.id === projectId) ?? personalProject ?? state.projects[0];
    setForm({
      projectId: project.id,
      type: "expense",
      title: "",
      amount: "",
      date: date ?? "2026-06-21",
      splitWith: project.members.map((member) => member.userId),
      surprise: false
    });
    setShowAdd(true);
  }

  function saveEntry() {
    if (saving) return;
    const amount = Number(form.amount.replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) return;
    if (!form.title.trim()) return;

    const project = state.projects.find((item) => item.id === form.projectId);
    if (!project) return;
    const splitWith = form.splitWith.length ? form.splitWith : project.members.map((member) => member.userId);
    const splitRatio = splitEqually(splitWith);
    if (!validateSplitRatio(splitRatio)) return;

    setSaving(true);
    const entryId = createEntryId();
    const notificationId = form.surprise ? `n-${entryId}` : null;
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
      rateLockedAt: `${form.date}T12:00:00.000Z`,
      date: `${form.date}T12:00:00.000Z`,
      status: "done",
      splitWith,
      splitRatio,
      lockedNotificationId: notificationId,
      revealedAt: form.surprise ? null : `${form.date}T12:00:00.000Z`,
      autoRevealAt: form.surprise ? "2026-06-23T12:00:00.000Z" : null,
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

    window.setTimeout(() => {
      setSaving(false);
      setShowAdd(false);
      setTab("entries");
    }, 350);
  }

  function revealNotification(notificationId: string) {
    setState((current) => ({
      ...current,
      entries: current.entries.map((entry) =>
        entry.lockedNotificationId === notificationId
          ? { ...entry, lockedNotificationId: null, revealedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : entry
      ),
      notifications: current.notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, gamePhase: "done", isCompleted: true, revealedAt: new Date().toISOString() }
          : notification
      )
    }));
  }

  function renderEntry(entry: Entry, compact = false) {
    const project = state.projects.find((item) => item.id === entry.projectId);
    const impact = personalEntryImpact(state, entry, user.id, now);
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

  function HomeScreen() {
    const sharedProjects = state.projects.filter((project) => project.type === "shared");
    return (
      <main className="screen-stack">
        <header className="hero-header">
          <div>
            <p className="eyebrow">Paranın nereye gittiğini bil.</p>
            <h1 className="title-xl">Kasam</h1>
          </div>
          <button className="ghost-button" type="button">
            Sıfırla
          </button>
        </header>

        <section className="card row-between">
          <div className="profile-left">
            <div className="avatar">{initials(user.displayName)}</div>
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
          <div className="list">{recentEntries.slice(0, 3).map((entry) => renderEntry(entry, true))}</div>
        </section>

        <section className="card">
          <h2>Ortak kasalardan gelen etkiler</h2>
          <div className="list">
            {sharedProjects.map((project) => {
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
            })}
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
                    <button className="pill" type="button" onClick={() => revealNotification(notification.id)}>
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
          <div className="list">{state.entries.map((entry) => renderEntry(entry))}</div>
        </section>
      </main>
    );
  }

  function ProjectsScreen() {
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
                    <div className="avatar">{project.type === "personal" ? initials(user.displayName) : initials(project.name)}</div>
                    <div>
                      <h2>{project.type === "personal" ? `${user.displayName} kasası` : project.name}</h2>
                      <p className="muted tiny">
                        {project.type === "personal" ? "Kişisel kasa" : `${project.members.length} üye · ortak kasa`}
                      </p>
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
          {state.projects
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
            ))}
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
                  {project.type === "personal" ? `${user.displayName} kasası` : project.name}
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
              {members.map((member) =>
                member ? (
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
                ) : null
              )}
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

  return (
    <div className="app-shell">
      <div className="phone-frame">
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
