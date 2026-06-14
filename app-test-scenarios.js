/* Kasam realistic test scenarios. */
(function kasamTestScenariosModule(root) {
  const TEST_SCENARIO_VERSION = "20260613-2012";
  const REPORT_DATE = "13.06.2026";

  function kasamScenarioMoney(value) {
    return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(Math.round(Number(value || 0))) + " TL";
  }

  function kasamScenarioDate(month, day) {
    return `${month}-${String(day).padStart(2, "0")}`;
  }

  function kasamScenarioIso(date, hour = 9) {
    return `${date}T${String(hour).padStart(2, "0")}:00:00.000Z`;
  }

  function kasamScenarioId(scenarioId, type, key) {
    return `test-s${scenarioId}-${type}-${String(key).toLocaleLowerCase("tr-TR").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}`;
  }

  function kasamScenarioSingleRatios(memberIds, userId) {
    return memberIds.map((id) => (id === userId ? 1 : 0));
  }

  function kasamScenarioEqualRatios(memberIds) {
    const ratio = memberIds.length ? 1 / memberIds.length : 1;
    return memberIds.map(() => ratio);
  }

  function kasamScenarioWeightedRatios(memberIds, weightsByUserId) {
    return memberIds.map((id) => Number(weightsByUserId[id] || 0));
  }

  function kasamScenarioTitle(value) {
    return String(value || "").trim();
  }

  function kasamScenarioBaseState() {
    return {
      activeView: "home",
      reportPeriod: "month",
      movementPeriod: "month",
      calendarTab: "calendar",
      addTab: "entry",
      settlementVisible: false,
      pendingDetail: "",
      reconciliationDetailId: "",
      reactionPickerEntryId: "",
      selectedTemplateId: "",
      previousView: "",
      groupMode: "list",
      activeMemberProfileId: "",
      lockedEntryType: "",
      calendarMonth: "2026-06",
      calendarDay: "2026-06-13",
      calendarFlip: 0,
      activeProjectId: "",
      activeUserId: "",
      signedInUserId: "",
      pendingLoginUserId: "",
      pendingLoginEmail: "",
      testScenarioActiveEmail: "",
      authMode: "login",
      cloudEnabled: false,
      cloudStatus: "",
      cloudUserId: "",
      cloudSyncAt: "",
      soundEnabled: true,
      themeMode: "auto",
      users: [],
      projects: [],
      headings: [],
      entries: [],
      notifications: [],
      reactions: [],
      reconciliations: [],
      goals: [],
      settlements: [],
      insights: [],
      joinRequests: [],
      testScenarioVersion: TEST_SCENARIO_VERSION,
      testScenarioLoadedAt: new Date().toISOString(),
      testScenarioMode: false,
      testScenarioSelector: "",
      testScenarioExitUrl: "",
      testScenarioMeta: [],
    };
  }

  function kasamScenarioContext(state, scenario) {
    const ctx = {
      state,
      scenario,
      usersByKey: {},
      headingsByName: {},
      project: null,
      entryCount: 0,
      gameCount: 0,
      featureUse: new Set(),
    };

    ctx.addUser = function addUser(key, data) {
      const user = {
        id: kasamScenarioId(scenario.id, "u", key),
        name: data.name,
        nickname: data.nickname || "",
        email: data.email || `${key}.s${scenario.id}@kasam.test`,
        password: data.password || "Test1234",
        photoName: "",
        photoData: "",
        onayModu: "standart",
        totalScore: 0,
        correctGuesses: 0,
        totalGuesses: 0,
        createdAt: kasamScenarioIso(scenario.startDate, 8),
        createdBy: "",
        testProfile: {
          age: data.age,
          role: data.role,
          income: data.income,
          gender: data.gender || "",
        },
      };
      state.users.push(user);
      ctx.usersByKey[key] = user;
      return user;
    };

    ctx.addProject = function addProject(data) {
      const memberIds = data.members.map((key) => ctx.usersByKey[key].id);
      const memberSince = {};
      memberIds.forEach((id) => {
        memberSince[id] = scenario.startDate;
      });
      const project = {
        id: kasamScenarioId(scenario.id, "p", data.code),
        name: data.name,
        purpose: data.purpose,
        code: data.code,
        createdAt: kasamScenarioIso(scenario.startDate, 8),
        createdBy: ctx.usersByKey[data.owner].id,
        memberIds,
        memberAliases: {},
        memberPhotos: {},
        memberSince,
        photoName: "",
        photoData: "",
        defaultCurrency: "TL",
        defaultHeadings: [],
        splitType: data.splitType || "equal",
        templateId: data.templateId || "",
        budgetLimits: { __memberSince: memberSince },
        hasBudgetTarget: Boolean(data.hasBudgetTarget),
        hasGoalItems: Boolean(data.hasGoalItems),
      };
      state.projects.push(project);
      ctx.project = project;
      return project;
    };

    ctx.heading = function heading(name, type = "expense") {
      const key = `${type}:${name}`;
      if (ctx.headingsByName[key]) return ctx.headingsByName[key];
      const item = {
        id: kasamScenarioId(scenario.id, "h", `${type}-${name}`),
        projectId: ctx.project.id,
        name,
        shortName: name,
        emoji: "",
        type,
        createdAt: kasamScenarioIso(scenario.startDate, 8),
      };
      state.headings.push(item);
      ctx.headingsByName[key] = item;
      return item;
    };

    ctx.entry = function entry(data) {
      const actor = ctx.usersByKey[data.user];
      const paidBy = ctx.usersByKey[data.paidBy || data.user];
      const memberIds = ctx.project.memberIds;
      const splitWith = data.splitWith ? data.splitWith.map((key) => ctx.usersByKey[key].id) : memberIds;
      const splitRatio = data.splitRatio || kasamScenarioSingleRatios(splitWith, paidBy.id);
      const heading = ctx.heading(data.heading, data.type);
      const id = kasamScenarioId(scenario.id, "e", `${++ctx.entryCount}-${data.date}-${data.heading}-${data.amount}`);
      const item = {
        id,
        projectId: ctx.project.id,
        type: data.type,
        amount: Number(data.amount),
        originalAmount: Number(data.amount),
        enteredAmount: Number(data.amount),
        currency: "TRY",
        exchangeRate: 1,
        headingId: heading.id,
        headingName: "",
        shortName: data.title || data.heading,
        note: data.note || "",
        userId: actor.id,
        paidById: paidBy.id,
        splitWith,
        splitRatio,
        date: data.date,
        status: data.status || "done",
        lockedNotificationId: "",
        autoRevealAt: data.autoRevealAt || "",
        rateLockedAt: kasamScenarioIso(data.date, 9),
        photoName: "",
        photoData: "",
        ocrRawText: data.ocrRawText || null,
        ocrParsedAmount: data.ocrParsedAmount ?? null,
        installmentGroupId: data.installmentGroupId || "",
        installmentIndex: Number(data.installmentIndex || 0),
        installmentCount: Number(data.installmentCount || 0),
        createdAt: kasamScenarioIso(data.date, data.hour || 9),
        updatedAt: kasamScenarioIso(data.date, data.hour || 9),
      };
      state.entries.push(item);
      return item;
    };

    ctx.game = function game(entry, data) {
      const actor = state.users.find((user) => user.id === entry.userId);
      const recipients = (data.recipients || ctx.project.memberIds.filter((id) => id !== actor.id)).filter((id) => id !== actor.id);
      const id = kasamScenarioId(scenario.id, "n", `${++ctx.gameCount}-${entry.id}`);
      const options = data.options || [entry.shortName, "Market", "Fatura", "Ulaşım"];
      const completed = data.completed !== false;
      const phase1Guesses = recipients.map((userId, index) => ({ userId, guess: index % 2 === 0 ? actor.id : ctx.project.memberIds.find((id) => id !== actor.id) || actor.id, isCorrect: index % 2 === 0, guessedAt: kasamScenarioIso(entry.date, 18) }));
      const phase2Guesses = recipients.map((userId) => ({ userId, guess: entry.type, isCorrect: true, guessedAt: kasamScenarioIso(entry.date, 18) }));
      const phase3Guesses = recipients.map((userId, index) => ({ userId, guess: index % 2 === 0 ? 0 : Math.min(1, options.length - 1), isCorrect: index % 2 === 0, guessedAt: kasamScenarioIso(entry.date, 18) }));
      recipients.forEach((userId, index) => {
        const user = state.users.find((item) => item.id === userId);
        if (!user) return;
        user.totalGuesses = Number(user.totalGuesses || 0) + 3;
        user.correctGuesses = Number(user.correctGuesses || 0) + (index % 2 === 0 ? 3 : 1);
        user.totalScore = Number(user.totalScore || 0) + (index % 2 === 0 ? 30 : 14);
      });
      const notification = {
        id,
        projectId: ctx.project.id,
        entryId: entry.id,
        actorId: actor.id,
        recipients,
        mode: "surprise",
        actualType: entry.type,
        title: entry.shortName,
        amount: entry.amount,
        emoji: data.emoji || "🎁",
        photoName: "",
        photoData: "",
        gif: "",
        successReaction: "✓",
        successPhotoName: "",
        successPhotoData: "",
        successGif: "",
        failReaction: "✕",
        failPhotoName: "",
        failPhotoData: "",
        failGif: "",
        guessDeadline: kasamScenarioIso(data.deadline || entry.date, 23),
        revealedAt: completed ? kasamScenarioIso(entry.date, 20) : "",
        isCompleted: completed,
        notificationType: "entry",
        reactionEmoji: "",
        guesses: [],
        createdAt: kasamScenarioIso(entry.date, 17),
        gameVersion: "v2",
        hideActor: true,
        gamePhase: completed ? 3 : 1,
        phase1Guesses: completed ? phase1Guesses : [],
        phase2Guesses: completed ? phase2Guesses : [],
        phase3Options: options.slice(0, 4),
        phase3Correct: 0,
        phase3Guesses: completed ? phase3Guesses : [],
        phase3Image: "",
        actorWrongReaction: { type: "emoji", data: "🙃" },
        actorCorrectReaction: { type: "emoji", data: "✅" },
        typeWrongReaction: { type: "emoji", data: "🤦" },
        typeCorrectReaction: { type: "emoji", data: "🎯" },
        categoryWrongReaction: { type: "emoji", data: "😅" },
        categoryCorrectReaction: { type: "emoji", data: "🏆" },
        phase1Completed: completed,
        phase2Completed: completed,
        phase3Completed: completed,
        gameFullyCompleted: completed,
      };
      if (!completed) entry.lockedNotificationId = id;
      state.notifications.push(notification);
      ctx.featureUse.add("tahmin oyunu");
      return notification;
    };

    ctx.reaction = function reaction(entry, userKey, emoji) {
      state.reactions.push({
        id: kasamScenarioId(scenario.id, "r", `${entry.id}-${userKey}`),
        entryId: entry.id,
        projectId: ctx.project.id,
        userId: ctx.usersByKey[userKey].id,
        emoji,
        createdAt: kasamScenarioIso(entry.date, 21),
      });
      ctx.featureUse.add("tepki");
    };

    ctx.goal = function goal(data) {
      state.goals.push({
        id: kasamScenarioId(scenario.id, "g", data.title),
        projectId: ctx.project.id,
        createdBy: ctx.usersByKey[data.createdBy].id,
        title: data.title,
        targetAmount: data.targetAmount,
        currentAmount: data.currentAmount || 0,
        deadline: data.deadline || "",
        items: data.items || [],
        status: data.status || "active",
        createdAt: kasamScenarioIso(scenario.startDate, 8),
      });
      ctx.featureUse.add("hedef");
    };

    ctx.reconciliation = function reconciliation(data) {
      state.reconciliations.push({
        id: kasamScenarioId(scenario.id, "rec", `${data.month}-${data.bankName}`),
        projectId: ctx.project.id,
        userId: ctx.usersByKey[data.user].id,
        month: data.month,
        bankName: data.bankName,
        uploadedAt: kasamScenarioIso(`${data.month}-28`, 20),
        statementTotal: data.statementTotal,
        kasaTotal: data.kasaTotal,
        diff: data.diff,
        status: data.diff === 0 ? "matched" : "unmatched",
        rawRows: data.rawRows || [],
        matchedEntryIds: [],
        unmatchedRows: [],
        aiAnalysis: data.aiAnalysis || {},
      });
      ctx.featureUse.add("ekstre");
    };

    ctx.settlement = function settlement(data) {
      state.settlements.push({
        id: kasamScenarioId(scenario.id, "s", `${data.from}-${data.to}-${data.amount}`),
        projectId: ctx.project.id,
        fromUserId: ctx.usersByKey[data.from].id,
        toUserId: ctx.usersByKey[data.to].id,
        amount: data.amount,
        settledAt: kasamScenarioIso(data.date, 19),
        note: data.note || "",
      });
      ctx.featureUse.add("hesaplaşma");
    };

    ctx.insight = function insight(data) {
      state.insights.push({
        id: kasamScenarioId(scenario.id, "i", `${data.type}-${data.period}`),
        userId: ctx.usersByKey[data.user].id,
        projectId: ctx.project.id,
        type: data.type,
        period: data.period,
        insightData: data.insightData || {},
        message: data.message,
        actionSuggestion: data.actionSuggestion || "",
        isRead: false,
        createdAt: kasamScenarioIso(data.createdAt || scenario.endDate, 12),
      });
      ctx.featureUse.add("koç");
    };

    return ctx;
  }

  function kasamScenarioAddMonthly(ctx, month, rows) {
    rows.forEach((row) => ctx.entry({ ...row, date: kasamScenarioDate(month, row.day) }));
  }

  function kasamScenarioUsers(ctx, users) {
    users.forEach((user) => ctx.addUser(user.key, user));
  }

  function scenario1(state) {
    const scenario = { id: 1, key: "turk-aile-butcesi", title: "Türk Aile Bütçesi", folder: "01-turk-aile-butcesi", startDate: "2026-04-01", endDate: "2026-06-30", months: ["2026-04", "2026-05", "2026-06"] };
    const ctx = kasamScenarioContext(state, scenario);
    kasamScenarioUsers(ctx, [
      { key: "mehmet", name: "Mehmet Yılmaz", nickname: "Mehmet", age: 48, role: "Fabrika ustabaşı", income: 32000, gender: "erkek" },
      { key: "fatma", name: "Fatma Yılmaz", nickname: "Fatma", age: 45, role: "Ev hanımı", income: 0, gender: "kadın" },
      { key: "burak", name: "Burak Yılmaz", nickname: "Burak", age: 22, role: "Üniversite öğrencisi", income: 3500, gender: "erkek" },
      { key: "selin", name: "Selin Yılmaz", nickname: "Selin", age: 17, role: "Lise öğrencisi", income: 1500, gender: "kadın" },
    ]);
    ctx.addProject({ name: "Yılmaz Ailesi", purpose: "Aile bütçesi", code: "YILMAZ-EV-1", owner: "mehmet", members: ["mehmet", "fatma", "burak", "selin"], splitType: "weighted", templateId: "family-budget" });
    const members = ["mehmet", "fatma", "burak", "selin"];
    const equal = kasamScenarioEqualRatios(members);
    const mehmetOnly = [1, 0, 0, 0];
    const burakOnly = [0, 0, 1, 0];
    const selinOnly = [0, 0, 0, 1];
    scenario.months.forEach((month, index) => {
      kasamScenarioAddMonthly(ctx, month, [
        { day: 1, type: "income", amount: 32000, heading: "Maaş", title: "Mehmet maaş", user: "mehmet", paidBy: "mehmet", splitWith: members, splitRatio: mehmetOnly },
        { day: 5, type: "income", amount: 3500, heading: "Burs", title: "Burak burs", user: "burak", paidBy: "burak", splitWith: members, splitRatio: burakOnly },
        { day: 6, type: "income", amount: 1500, heading: "Harçlık", title: "Selin harçlık", user: "selin", paidBy: "selin", splitWith: members, splitRatio: selinOnly },
        { day: 1, type: "expense", amount: 18000, heading: "Kira", title: "Kira", user: "mehmet", paidBy: "mehmet", splitWith: members, splitRatio: equal },
        { day: 8, type: "expense", amount: [1750, 1450, 1250][index], heading: "Elektrik", title: "Elektrik faturası", user: "mehmet", paidBy: "mehmet", splitWith: members, splitRatio: equal },
        { day: 9, type: "expense", amount: [2300, 1500, 850][index], heading: "Doğalgaz", title: "Doğalgaz faturası", user: "mehmet", paidBy: "mehmet", splitWith: members, splitRatio: equal },
        { day: 10, type: "expense", amount: 400, heading: "Su", title: "Su faturası", user: "mehmet", paidBy: "mehmet", splitWith: members, splitRatio: equal },
        { day: 11, type: "expense", amount: 599, heading: "İnternet", title: "İnternet", user: "mehmet", paidBy: "mehmet", splitWith: members, splitRatio: equal },
        { day: 12, type: "expense", amount: 750, heading: "Aidat", title: "Aidat", user: "mehmet", paidBy: "mehmet", splitWith: members, splitRatio: equal },
        { day: 13, type: "expense", amount: [9600, 10800, 11600][index], heading: "Market", title: "Aylık market", user: "fatma", paidBy: "mehmet", splitWith: members, splitRatio: equal },
        { day: 15, type: "expense", amount: 2000, heading: "Ulaşım", title: "Mehmet ulaşım", user: "mehmet", paidBy: "mehmet", splitWith: members, splitRatio: mehmetOnly },
        { day: 16, type: "expense", amount: 600, heading: "Okul ulaşımı", title: "Burak ulaşım", user: "burak", paidBy: "burak", splitWith: members, splitRatio: burakOnly },
        { day: 17, type: "expense", amount: 400, heading: "Okul ulaşımı", title: "Selin ulaşım", user: "selin", paidBy: "selin", splitWith: members, splitRatio: selinOnly },
        { day: 20, type: "expense", amount: [700, 1800, 520][index], heading: "Sağlık", title: "Sağlık masrafı", user: "fatma", paidBy: "mehmet", splitWith: members, splitRatio: equal },
        { day: 22, type: "expense", amount: [1200, 2600, 1700][index], heading: "Giyim", title: "Giyim", user: "fatma", paidBy: "mehmet", splitWith: members, splitRatio: equal },
        { day: 24, type: "expense", amount: [1800, 2450, 2800][index], heading: "Eğlence", title: "Aile dışarı yemeği", user: "mehmet", paidBy: "mehmet", splitWith: members, splitRatio: equal },
        { day: 26, type: "expense", amount: [750, 1200, 900][index], heading: "Üniversite", title: "Burak okul masrafı", user: "burak", paidBy: "burak", splitWith: members, splitRatio: burakOnly },
        { day: 27, type: "expense", amount: [350, 650, 500][index], heading: "Lise", title: "Selin okul masrafı", user: "selin", paidBy: "selin", splitWith: members, splitRatio: selinOnly },
      ]);
    });
    const game1 = ctx.entry({ date: "2026-06-14", type: "expense", amount: 1847, heading: "Market", title: "Market alışverişi", user: "fatma", paidBy: "mehmet", splitWith: members, splitRatio: equal });
    const game2 = ctx.entry({ date: "2026-06-18", type: "expense", amount: 380, heading: "Yemek", title: "Arkadaş yemeği", user: "burak", paidBy: "burak", splitWith: members, splitRatio: burakOnly });
    ctx.game(game1, { options: ["Market", "Temizlik", "Fatura", "Yakıt"] });
    ctx.game(game2, { options: ["Yemek", "Kafe", "Ulaşım", "Okul"] });
    ctx.reaction(game1, "mehmet", "👀");
    ctx.reconciliation({ user: "mehmet", month: "2026-06", bankName: "Ziraat", statementTotal: 50796, kasaTotal: 50796, diff: 0 });
    ctx.insight({ user: "mehmet", type: "monthly", period: "2026-06", message: "Haziran aile bütçesinde market ve eğitim kalemleri arttı.", actionSuggestion: "Market alışverişini haftalık listeyle takip et." });
    return { scenario, ctx };
  }

  function scenario2(state) {
    const scenario = { id: 2, key: "universite-ev-arkadaslari", title: "Üniversite Ev Arkadaşları", folder: "02-universite-ev-arkadaslari", startDate: "2026-04-01", endDate: "2026-06-30", months: ["2026-04", "2026-05", "2026-06"] };
    const ctx = kasamScenarioContext(state, scenario);
    kasamScenarioUsers(ctx, [
      { key: "kerem", name: "Kerem Arslan", age: 23, role: "Bilgisayar mühendisliği öğrencisi", income: 8500, gender: "erkek" },
      { key: "deniz", name: "Deniz Kaya", age: 22, role: "İşletme öğrencisi", income: 4200, gender: "kadın" },
    ]);
    ctx.addProject({ name: "Kerem & Deniz Evi", purpose: "Üniversite ev arkadaşlığı", code: "KEREM-DENIZ-1", owner: "kerem", members: ["kerem", "deniz"], splitType: "equal", templateId: "roommates" });
    const members = ["kerem", "deniz"];
    const equal = kasamScenarioEqualRatios(members);
    scenario.months.forEach((month, index) => {
      kasamScenarioAddMonthly(ctx, month, [
        { day: 1, type: "income", amount: 8500, heading: "Gelir", title: "Kerem burs ve part-time", user: "kerem", paidBy: "kerem", splitWith: members, splitRatio: [1, 0] },
        { day: 1, type: "income", amount: 4200, heading: "Burs", title: "Deniz burs", user: "deniz", paidBy: "deniz", splitWith: members, splitRatio: [0, 1] },
        { day: 2, type: "expense", amount: 12000, heading: "Kira", title: "Kira", user: "kerem", paidBy: "kerem", splitWith: members, splitRatio: equal },
        { day: 8, type: "expense", amount: [1350, 1420, 1480][index], heading: "Faturalar", title: "Elektrik su internet", user: "deniz", paidBy: "deniz", splitWith: members, splitRatio: equal },
        { day: 13, type: "expense", amount: [3200, 3900, 4300][index], heading: "Market", title: "Ortak market", user: index % 2 ? "deniz" : "kerem", paidBy: index % 2 ? "deniz" : "kerem", splitWith: members, splitRatio: equal },
        { day: 16, type: "expense", amount: 800, heading: "Ulaşım", title: "Kerem ulaşım", user: "kerem", paidBy: "kerem", splitWith: members, splitRatio: [1, 0] },
        { day: 17, type: "expense", amount: 600, heading: "Ulaşım", title: "Deniz ulaşım", user: "deniz", paidBy: "deniz", splitWith: members, splitRatio: [0, 1] },
        { day: 20, type: "expense", amount: 500, heading: "Kitap kurs", title: "Kerem kurs", user: "kerem", paidBy: "kerem", splitWith: members, splitRatio: [1, 0] },
        { day: 21, type: "expense", amount: [420, 380, 450][index], heading: "Kafe", title: "Deniz kafe", user: "deniz", paidBy: "deniz", splitWith: members, splitRatio: [0, 1] },
        { day: 22, type: "expense", amount: [300, 299, 350][index], heading: "Oyun abonelik", title: "Kerem oyun abonelik", user: "kerem", paidBy: "kerem", splitWith: members, splitRatio: [1, 0] },
        { day: 24, type: "expense", amount: [500, 650, 540][index], heading: "Kıyafet", title: "Deniz kıyafet", user: "deniz", paidBy: "deniz", splitWith: members, splitRatio: [0, 1] },
      ]);
    });
    const game1 = ctx.entry({ date: "2026-05-22", type: "expense", amount: 299, heading: "Oyun", title: "Steam oyunu", user: "kerem", paidBy: "kerem", splitWith: members, splitRatio: [1, 0] });
    const game2 = ctx.entry({ date: "2026-06-27", type: "income", amount: 1500, heading: "Ek iş", title: "Part-time iş ödemesi", user: "deniz", paidBy: "deniz", splitWith: members, splitRatio: [0, 1] });
    ctx.game(game1, { options: ["Steam oyunu", "Kurs", "Ulaşım", "Market"] });
    ctx.game(game2, { options: ["Part-time ödeme", "Burs", "İade", "Hediye"] });
    ctx.settlement({ from: "deniz", to: "kerem", amount: 2750, date: "2026-06-30", note: "Haziran kira ve market farkı" });
    return { scenario, ctx };
  }

  function scenario3(state) {
    const scenario = { id: 3, key: "calisan-ev-arkadaslari", title: "Çalışan Ev Arkadaşları", folder: "03-calisan-ev-arkadaslari", startDate: "2026-04-01", endDate: "2026-06-30", months: ["2026-04", "2026-05", "2026-06"] };
    const ctx = kasamScenarioContext(state, scenario);
    kasamScenarioUsers(ctx, [
      { key: "ayse", name: "Ayşe Demir", age: 28, role: "Öğretmen", income: 24000, gender: "kadın" },
      { key: "merve", name: "Merve Çelik", age: 26, role: "Grafik tasarımcı", income: 28000, gender: "kadın" },
      { key: "can", name: "Can Öztürk", age: 29, role: "Yazılımcı", income: 45000, gender: "erkek" },
    ]);
    ctx.addProject({ name: "Nişantaşı Evi", purpose: "Çalışan ev arkadaşlığı", code: "NISANTASI-1", owner: "can", members: ["ayse", "merve", "can"], splitType: "weighted", templateId: "roommates" });
    const members = ["ayse", "merve", "can"];
    const weighted = [0.25, 0.35, 0.4];
    scenario.months.forEach((month, index) => {
      kasamScenarioAddMonthly(ctx, month, [
        { day: 1, type: "income", amount: 24000, heading: "Maaş", title: "Ayşe maaş", user: "ayse", paidBy: "ayse", splitWith: members, splitRatio: [1, 0, 0] },
        { day: 1, type: "income", amount: 28000, heading: "Maaş", title: "Merve maaş", user: "merve", paidBy: "merve", splitWith: members, splitRatio: [0, 1, 0] },
        { day: 1, type: "income", amount: 45000, heading: "Maaş", title: "Can maaş", user: "can", paidBy: "can", splitWith: members, splitRatio: [0, 0, 1] },
        { day: 2, type: "expense", amount: 25000, heading: "Kira", title: "Kira", user: "can", paidBy: "can", splitWith: members, splitRatio: weighted },
        { day: 8, type: "expense", amount: [1900, 2050, 2150][index], heading: "Faturalar", title: "Faturalar", user: "ayse", paidBy: "ayse", splitWith: members, splitRatio: weighted },
        { day: 13, type: "expense", amount: [6200, 7600, 8900][index], heading: "Market", title: "Ortak market", user: "merve", paidBy: "merve", splitWith: members, splitRatio: weighted },
        { day: 15, type: "expense", amount: 2000, heading: "Temizlikçi", title: "Temizlikçi", user: "ayse", paidBy: "ayse", splitWith: members, splitRatio: weighted },
        { day: 18, type: "expense", amount: [3300, 4700, 5600][index], heading: "Dışarı yemek", title: "Dışarı yemek", user: "can", paidBy: "can", splitWith: members, splitRatio: weighted },
        { day: 20, type: "expense", amount: [1800, 2600, 3800][index], heading: "Eğlence", title: "Sinema konser", user: "merve", paidBy: "merve", splitWith: members, splitRatio: weighted },
        { day: 21, type: "expense", amount: 1200, heading: "Ulaşım", title: "Ayşe ulaşım", user: "ayse", paidBy: "ayse", splitWith: members, splitRatio: [1, 0, 0] },
        { day: 22, type: "expense", amount: 1200, heading: "Spor", title: "Can spor salonu", user: "can", paidBy: "can", splitWith: members, splitRatio: [0, 0, 1] },
        { day: 23, type: "expense", amount: 800, heading: "Teknoloji", title: "Can abonelik", user: "can", paidBy: "can", splitWith: members, splitRatio: [0, 0, 1] },
        { day: 25, type: "income", amount: [6000, 12000, 9000][index], heading: "Freelance", title: "Merve freelance", user: "merve", paidBy: "merve", splitWith: members, splitRatio: [0, 1, 0] },
      ]);
    });
    const game1 = ctx.entry({ date: "2026-06-25", type: "income", amount: 15000, heading: "Freelance", title: "Logo işi ödemesi", user: "merve", paidBy: "merve", splitWith: members, splitRatio: [0, 1, 0] });
    const game2 = ctx.entry({ date: "2026-06-26", type: "expense", amount: 2850, heading: "Teknoloji", title: "Mekanik klavye", user: "can", paidBy: "can", splitWith: members, splitRatio: [0, 0, 1] });
    ctx.game(game1, { options: ["Freelance gelir", "Maaş", "İade", "Prim"] });
    ctx.game(game2, { options: ["Mekanik klavye", "Kulaklık", "Kurs", "Oyun"] });
    ctx.reaction(game2, "ayse", "🤦");
    ctx.settlement({ from: "ayse", to: "can", amount: 5200, date: "2026-06-30", note: "Ağırlıklı kira farkı" });
    return { scenario, ctx };
  }

  function scenario4(state) {
    const scenario = { id: 4, key: "yeni-evli-ikisi-calisiyor", title: "Yeni Evli İkisi de Çalışıyor", folder: "04-yeni-evli-ikisi-calisiyor", startDate: "2026-04-01", endDate: "2026-06-30", months: ["2026-04", "2026-05", "2026-06"] };
    const ctx = kasamScenarioContext(state, scenario);
    kasamScenarioUsers(ctx, [
      { key: "hakan", name: "Hakan Şahin", age: 31, role: "Mühendis", income: 52000, gender: "erkek" },
      { key: "elif", name: "Elif Şahin", age: 29, role: "Pazarlama uzmanı", income: 38000, gender: "kadın" },
    ]);
    ctx.addProject({ name: "Şahin Yuvası", purpose: "Yeni evli ev bütçesi", code: "SAHIN-1", owner: "hakan", members: ["hakan", "elif"], splitType: "equal", templateId: "couple-home", hasBudgetTarget: true, hasGoalItems: true });
    const members = ["hakan", "elif"];
    const equal = [0.5, 0.5];
    scenario.months.forEach((month, index) => {
      kasamScenarioAddMonthly(ctx, month, [
        { day: 1, type: "income", amount: 52000, heading: "Maaş", title: "Hakan maaş", user: "hakan", paidBy: "hakan", splitWith: members, splitRatio: [1, 0] },
        { day: 1, type: "income", amount: 38000, heading: "Maaş", title: "Elif maaş", user: "elif", paidBy: "elif", splitWith: members, splitRatio: [0, 1] },
        { day: 2, type: "expense", amount: 22000, heading: "Kira mortgage", title: "Kira mortgage", user: "hakan", paidBy: "hakan", splitWith: members, splitRatio: equal },
        { day: 7, type: "expense", amount: 2500, heading: "Faturalar", title: "Faturalar", user: "elif", paidBy: "elif", splitWith: members, splitRatio: equal },
        { day: 8, type: "expense", amount: 1200, heading: "Aidat", title: "Aidat", user: "hakan", paidBy: "hakan", splitWith: members, splitRatio: equal },
        { day: 13, type: "expense", amount: [7200, 8700, 9800][index], heading: "Market", title: "Market", user: "elif", paidBy: "elif", splitWith: members, splitRatio: equal },
        { day: 15, type: "expense", amount: 3000, heading: "Akaryakıt", title: "Akaryakıt", user: "hakan", paidBy: "hakan", splitWith: members, splitRatio: [1, 0] },
        { day: 17, type: "expense", amount: [3600, 6400, 7900][index], heading: "Ev eşyası", title: "Ev eşyası dekorasyon", user: "elif", paidBy: "elif", splitWith: members, splitRatio: equal },
        { day: 20, type: "expense", amount: [3300, 4200, 5000][index], heading: "Restoran kafe", title: "Restoran kafe", user: "hakan", paidBy: "hakan", splitWith: members, splitRatio: equal },
        { day: 21, type: "expense", amount: [2200, 3500, 2900][index], heading: "Giyim", title: "Giyim", user: "elif", paidBy: "elif", splitWith: members, splitRatio: equal },
        { day: 23, type: "expense", amount: 1000, heading: "Spor", title: "Hakan spor", user: "hakan", paidBy: "hakan", splitWith: members, splitRatio: [1, 0] },
        { day: 24, type: "expense", amount: 1500, heading: "Bakım", title: "Elif bakım", user: "elif", paidBy: "elif", splitWith: members, splitRatio: [0, 1] },
        { day: 25, type: "income", amount: [8000, 12000, 15000][index], heading: "Tatil katkısı", title: "Tatil kumbarası katkı", user: index % 2 ? "elif" : "hakan", paidBy: index % 2 ? "elif" : "hakan", splitWith: members, splitRatio: equal },
      ]);
    });
    const game1 = ctx.entry({ date: "2026-06-24", type: "expense", amount: 1850, heading: "Bakım", title: "Güzellik bakımı", user: "elif", paidBy: "elif", splitWith: members, splitRatio: [0, 1] });
    const game2 = ctx.entry({ date: "2026-06-28", type: "income", amount: 15000, heading: "İkramiye", title: "Hakan ikramiye", user: "hakan", paidBy: "hakan", splitWith: members, splitRatio: [1, 0] });
    const pending = ctx.entry({ date: "2026-07-05", type: "payable", amount: 4200, heading: "Taksit", title: "Mobilya taksidi", user: "hakan", paidBy: "hakan", splitWith: members, splitRatio: equal, status: "pending" });
    ctx.game(game1, { options: ["Güzellik bakımı", "Kurs", "Kafe", "Giyim"] });
    ctx.game(game2, { options: ["İkramiye", "Maaş", "İade", "Satış"] });
    ctx.goal({ createdBy: "hakan", title: "Yunanistan Tatili", targetAmount: 100000, currentAmount: 35000, deadline: "2026-09-01", items: [{ name: "Uçak", price: 30000, purchased: false }, { name: "Otel", price: 45000, purchased: false }, { name: "Yeme içme", price: 25000, purchased: false }] });
    ctx.insight({ user: "elif", type: "goal", period: "2026-06", message: "Tatil kumbarası %35 tamamlandı.", actionSuggestion: "Temmuzda 22.000 TL katkı hedefi koyun." });
    ctx.featureUse.add("planlı ödeme");
    return { scenario, ctx };
  }

  function scenario5(state) {
    const scenario = { id: 5, key: "yeni-evli-tek-gelir", title: "Yeni Evli Tek Gelir", folder: "05-yeni-evli-tek-gelir", startDate: "2026-04-01", endDate: "2026-06-30", months: ["2026-04", "2026-05", "2026-06"] };
    const ctx = kasamScenarioContext(state, scenario);
    kasamScenarioUsers(ctx, [
      { key: "murat", name: "Murat Kara", age: 34, role: "Muhasebeci", income: 38000, gender: "erkek" },
      { key: "zeynep", name: "Zeynep Kara", age: 31, role: "Ev hanımı", income: 0, gender: "kadın" },
    ]);
    ctx.addProject({ name: "Kara Ailesi", purpose: "Tek gelirli ev bütçesi", code: "KARA-1", owner: "murat", members: ["murat", "zeynep"], splitType: "weighted", templateId: "family-budget", hasBudgetTarget: true, hasGoalItems: true });
    const members = ["murat", "zeynep"];
    const muratOnly = [1, 0];
    scenario.months.forEach((month, index) => {
      kasamScenarioAddMonthly(ctx, month, [
        { day: 1, type: "income", amount: 38000, heading: "Maaş", title: "Murat maaş", user: "murat", paidBy: "murat", splitWith: members, splitRatio: muratOnly },
        { day: 2, type: "expense", amount: 14500, heading: "Kira", title: "Kira", user: "murat", paidBy: "murat", splitWith: members, splitRatio: muratOnly },
        { day: 7, type: "expense", amount: [2200, 2100, 2400][index], heading: "Faturalar", title: "Faturalar", user: "murat", paidBy: "murat", splitWith: members, splitRatio: muratOnly },
        { day: 13, type: "expense", amount: [7600, 8200, 9100][index], heading: "Market", title: "Market", user: "zeynep", paidBy: "murat", splitWith: members, splitRatio: muratOnly },
        { day: 15, type: "expense", amount: [2400, 2800, 3000][index], heading: "Bez mama", title: "Bez mama", user: "zeynep", paidBy: "murat", splitWith: members, splitRatio: muratOnly },
        { day: 18, type: "expense", amount: [600, 1800, 950][index], heading: "Doktor ilaç", title: "Doktor ilaç", user: "zeynep", paidBy: "murat", splitWith: members, splitRatio: muratOnly },
        { day: 20, type: "expense", amount: [750, 1250, 1400][index], heading: "Oyuncak giysi", title: "Bebek oyuncak giysi", user: "zeynep", paidBy: "murat", splitWith: members, splitRatio: muratOnly },
        { day: 26, type: "income", amount: [5000, 6500, 7200][index], heading: "Araç hedef katkısı", title: "Araç değişimi birikimi", user: "murat", paidBy: "murat", splitWith: members, splitRatio: muratOnly },
      ]);
    });
    const game1 = ctx.entry({ date: "2026-06-20", type: "expense", amount: 1320, heading: "Oyuncak giysi", title: "Bebek kıyafeti", user: "zeynep", paidBy: "murat", splitWith: members, splitRatio: muratOnly });
    const game2 = ctx.entry({ date: "2026-06-23", type: "expense", amount: 4500, heading: "Araç bakım", title: "Araba bakım", user: "murat", paidBy: "murat", splitWith: members, splitRatio: muratOnly });
    ctx.game(game1, { options: ["Bebek kıyafeti", "Mama", "Doktor", "Oyuncak"] });
    ctx.game(game2, { options: ["Araç bakım", "Market", "Kira", "Fatura"] });
    ctx.goal({ createdBy: "murat", title: "Araç Değişimi", targetAmount: 800000, currentAmount: 18700, deadline: "2028-06-01", items: [{ name: "Peşinat", price: 350000, purchased: false }, { name: "Satış sonrası masraf", price: 50000, purchased: false }] });
    ctx.insight({ user: "murat", type: "goal", period: "2026-06", message: "Araç hedefinde aylık gereken tutar gerçekçi birikimin üstünde.", actionSuggestion: "Hedef süresini uzat veya ek gelir kalemi planla." });
    return { scenario, ctx };
  }

  function scenario6(state) {
    const scenario = { id: 6, key: "iki-kadin-tatil-hedefi", title: "İki Kadın Arkadaş Tatil Hedefi", folder: "06-iki-kadin-tatil-hedefi", startDate: "2026-03-01", endDate: "2026-06-30", months: ["2026-03", "2026-04", "2026-05", "2026-06"] };
    const ctx = kasamScenarioContext(state, scenario);
    kasamScenarioUsers(ctx, [
      { key: "selin", name: "Selin Koç", age: 27, role: "Avukat", income: 55000, gender: "kadın" },
      { key: "buse", name: "Buse Yıldız", age: 26, role: "Hemşire", income: 32000, gender: "kadın" },
    ]);
    ctx.addProject({ name: "Tatil Kumbarası", purpose: "Bali tatili hedefi", code: "TATIL-1", owner: "selin", members: ["selin", "buse"], splitType: "weighted", templateId: "group-trip", hasBudgetTarget: true, hasGoalItems: true });
    const members = ["selin", "buse"];
    const weighted = [0.6, 0.4];
    scenario.months.forEach((month) => {
      kasamScenarioAddMonthly(ctx, month, [
        { day: 1, type: "income", amount: 15000, heading: "Tatil katkısı", title: "Selin katkı", user: "selin", paidBy: "selin", splitWith: members, splitRatio: [1, 0] },
        { day: 1, type: "income", amount: 10000, heading: "Tatil katkısı", title: "Buse katkı", user: "buse", paidBy: "buse", splitWith: members, splitRatio: [0, 1] },
      ]);
    });
    ctx.entry({ date: "2026-03-12", type: "expense", amount: 38000, heading: "Uçak bileti", title: "Bali uçak bileti", user: "selin", paidBy: "selin", splitWith: members, splitRatio: weighted });
    ctx.entry({ date: "2026-04-10", type: "expense", amount: 25000, heading: "Otel", title: "Otel ön ödemesi", user: "buse", paidBy: "buse", splitWith: members, splitRatio: weighted });
    ctx.entry({ date: "2026-05-08", type: "expense", amount: 6000, heading: "Vize", title: "Vize masrafı", user: "selin", paidBy: "selin", splitWith: members, splitRatio: weighted });
    ctx.entry({ date: "2026-06-15", type: "expense", amount: 8000, heading: "Tatil alışverişi", title: "Tatil alışverişi", user: "buse", paidBy: "buse", splitWith: members, splitRatio: weighted });
    ctx.entry({ date: "2026-06-25", type: "income", amount: 5000, heading: "Acil fon", title: "Acil fon rezerv", user: "selin", paidBy: "selin", splitWith: members, splitRatio: weighted });
    const game1 = ctx.entry({ date: "2026-03-12", type: "expense", amount: 38000, heading: "Uçak bileti", title: "Bilet ödemesi", user: "selin", paidBy: "selin", splitWith: members, splitRatio: weighted });
    const game2 = ctx.entry({ date: "2026-06-20", type: "income", amount: 4500, heading: "Ek vardiya", title: "Ek vardiya ödemesi", user: "buse", paidBy: "buse", splitWith: members, splitRatio: [0, 1] });
    ctx.game(game1, { options: ["Bilet", "Otel", "Vize", "Alışveriş"] });
    ctx.game(game2, { options: ["Ek vardiya", "Hediye", "İade", "Maaş"] });
    ctx.goal({ createdBy: "selin", title: "Bali Turu", targetAmount: 100000, currentAmount: 78000, deadline: "2026-07-20", items: [{ name: "Uçak", price: 38000, purchased: true }, { name: "Otel", price: 25000, purchased: true }, { name: "Vize", price: 6000, purchased: true }, { name: "Cep harçlığı", price: 31000, purchased: false }] });
    ctx.insight({ user: "buse", type: "goal", period: "2026-06", message: "Hedefe 67 gün kaldı, kasa %78 seviyesinde.", actionSuggestion: "Haziran katkısında eksik kalma riskini kontrol et." });
    return { scenario, ctx };
  }

  function scenario7(state) {
    const scenario = { id: 7, key: "lise-ogrencisi-playstation", title: "Lise Öğrencisi PlayStation Hedefi", folder: "07-lise-ogrencisi-playstation", startDate: "2026-03-01", endDate: "2026-06-30", months: ["2026-03", "2026-04", "2026-05", "2026-06"] };
    const ctx = kasamScenarioContext(state, scenario);
    kasamScenarioUsers(ctx, [{ key: "arda", name: "Arda Koçak", age: 16, role: "Lise öğrencisi", income: 2000, gender: "erkek" }]);
    ctx.addProject({ name: "PlayStation Kumbarası", purpose: "Kişisel hedef", code: "ARDA-PS5-1", owner: "arda", members: ["arda"], splitType: "individual", templateId: "personal-goal", hasBudgetTarget: true, hasGoalItems: true });
    scenario.months.forEach((month, index) => {
      kasamScenarioAddMonthly(ctx, month, [
        { day: 1, type: "income", amount: 2000, heading: "Harçlık", title: "Aylık harçlık", user: "arda", paidBy: "arda", splitWith: ["arda"], splitRatio: [1] },
        { day: 6, type: "income", amount: [250, 400, 300, 500][index], heading: "Ek iş", title: "Komşu yardımı", user: "arda", paidBy: "arda", splitWith: ["arda"], splitRatio: [1] },
        { day: 10, type: "expense", amount: [420, 380, 500, 460][index], heading: "Kantin", title: "Okul kantini", user: "arda", paidBy: "arda", splitWith: ["arda"], splitRatio: [1] },
        { day: 12, type: "expense", amount: 400, heading: "Ulaşım", title: "Ulaşım", user: "arda", paidBy: "arda", splitWith: ["arda"], splitRatio: [1] },
        { day: 18, type: "expense", amount: [260, 320, 390, 280][index], heading: "Arkadaş aktivitesi", title: "Arkadaş aktivitesi", user: "arda", paidBy: "arda", splitWith: ["arda"], splitRatio: [1] },
        { day: 20, type: "expense", amount: 199, heading: "Telefon", title: "Telefon aboneliği", user: "arda", paidBy: "arda", splitWith: ["arda"], splitRatio: [1] },
        { day: 28, type: "income", amount: [800, 700, 900, 650][index], heading: "Birikim", title: "PS5 kumbarası", user: "arda", paidBy: "arda", splitWith: ["arda"], splitRatio: [1] },
      ]);
    });
    const game1 = ctx.entry({ date: "2026-06-10", type: "expense", amount: 85, heading: "Kantin", title: "Kantin tost ayran", user: "arda", paidBy: "arda", splitWith: ["arda"], splitRatio: [1] });
    const game2 = ctx.entry({ date: "2026-06-06", type: "income", amount: 500, heading: "Ek iş", title: "Komşu yardımı ek gelir", user: "arda", paidBy: "arda", splitWith: ["arda"], splitRatio: [1] });
    ctx.game(game1, { recipients: [ctx.usersByKey.arda.id], options: ["Kantin", "Ulaşım", "Oyun", "Telefon"] });
    ctx.game(game2, { recipients: [ctx.usersByKey.arda.id], options: ["500 TL", "200 TL", "1000 TL", "150 TL"] });
    ctx.goal({ createdBy: "arda", title: "PlayStation 5 Seti", targetAmount: 30500, currentAmount: 3150, deadline: "2028-12-01", items: [{ name: "PlayStation 5", price: 25000, purchased: false }, { name: "Ekstra joystick", price: 2500, purchased: false }, { name: "2 oyun", price: 3000, purchased: false }] });
    ctx.insight({ user: "arda", type: "goal", period: "2026-06", message: "Bu hızla hedefe yaklaşık 34 ayda ulaşırsın.", actionSuggestion: "Kantinden ayda 150 TL kısarsan süreyi azaltırsın." });
    return { scenario, ctx };
  }

  function scenario8(state) {
    const scenario = { id: 8, key: "arac-degisimi-tasarrufu", title: "Araç Değişimi Tasarrufu", folder: "08-arac-degisimi-tasarrufu", startDate: "2025-07-01", endDate: "2026-06-30", months: ["2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"] };
    const ctx = kasamScenarioContext(state, scenario);
    kasamScenarioUsers(ctx, [{ key: "serkan", name: "Serkan Başaran", age: 35, role: "Satış müdürü", income: 68000, gender: "erkek" }]);
    ctx.addProject({ name: "Yeni Araç", purpose: "Araç değişimi hedefi", code: "SERKAN-ARAC-1", owner: "serkan", members: ["serkan"], splitType: "individual", templateId: "personal-goal", hasBudgetTarget: true, hasGoalItems: true });
    const savings = [26000, 27500, 25000, 31000, 29000, 28000, 32000, 25500, 30000, 27000, 29500, 350000];
    scenario.months.forEach((month, index) => {
      kasamScenarioAddMonthly(ctx, month, [
        { day: 1, type: "income", amount: 68000, heading: "Maaş", title: "Maaş", user: "serkan", paidBy: "serkan", splitWith: ["serkan"], splitRatio: [1] },
        { day: 3, type: "expense", amount: 18000, heading: "Kira", title: "Kira", user: "serkan", paidBy: "serkan", splitWith: ["serkan"], splitRatio: [1] },
        { day: 9, type: "expense", amount: [9200, 9600, 10100, 9800, 10500, 11200, 10800, 9900, 10300, 11000, 11500, 11800][index], heading: "Yaşam gideri", title: "Aylık yaşam gideri", user: "serkan", paidBy: "serkan", splitWith: ["serkan"], splitRatio: [1] },
        { day: 25, type: "income", amount: savings[index], heading: "Araç birikimi", title: "Araç hedef birikimi", user: "serkan", paidBy: "serkan", splitWith: ["serkan"], splitRatio: [1] },
      ]);
    });
    ctx.entry({ date: "2025-10-20", type: "income", amount: 25000, heading: "Prim", title: "Satış primi", user: "serkan", paidBy: "serkan", splitWith: ["serkan"], splitRatio: [1] });
    ctx.entry({ date: "2026-02-20", type: "income", amount: 50000, heading: "Prim", title: "Büyük satış primi", user: "serkan", paidBy: "serkan", splitWith: ["serkan"], splitRatio: [1] });
    ctx.entry({ date: "2025-12-18", type: "expense", amount: 15000, heading: "Tatil", title: "Kış tatili", user: "serkan", paidBy: "serkan", splitWith: ["serkan"], splitRatio: [1] });
    ctx.entry({ date: "2026-04-14", type: "expense", amount: 15000, heading: "Araç arıza", title: "Araç arıza", user: "serkan", paidBy: "serkan", splitWith: ["serkan"], splitRatio: [1] });
    ctx.entry({ date: "2026-05-10", type: "income", amount: 450000, heading: "Araç satışı", title: "Mevcut araç satışı", user: "serkan", paidBy: "serkan", splitWith: ["serkan"], splitRatio: [1] });
    ctx.entry({ date: "2026-05-12", type: "expense", amount: 800000, heading: "Yeni araç", title: "Yeni araç alımı", user: "serkan", paidBy: "serkan", splitWith: ["serkan"], splitRatio: [1] });
    const game1 = ctx.entry({ date: "2026-02-20", type: "income", amount: 50000, heading: "Prim", title: "Büyük prim", user: "serkan", paidBy: "serkan", splitWith: ["serkan"], splitRatio: [1] });
    const game2 = ctx.entry({ date: "2026-05-12", type: "expense", amount: 800000, heading: "Yeni araç", title: "Yeni araç ödemesi", user: "serkan", paidBy: "serkan", splitWith: ["serkan"], splitRatio: [1] });
    ctx.game(game1, { recipients: [ctx.usersByKey.serkan.id], options: ["Prim", "Araç satışı", "Maaş", "İade"] });
    ctx.game(game2, { recipients: [ctx.usersByKey.serkan.id], options: ["Yeni araç", "Araç bakım", "Tatil", "Kira"] });
    ctx.goal({ createdBy: "serkan", title: "Yeni Araç Bütçesi", targetAmount: 800000, currentAmount: 800000, deadline: "2026-06-30", items: [{ name: "Mevcut araç satışı", price: 450000, purchased: true }, { name: "Üst ödeme", price: 350000, purchased: true }] });
    ctx.insight({ user: "serkan", type: "monthly", period: "2026-05", message: "Mayısta araç hedefi tamamlandı.", actionSuggestion: "Yeni araç sonrası acil fonu yeniden kur." });
    return { scenario, ctx };
  }

  const KASAM_TEST_SCENARIO_BUILDERS = [scenario1, scenario2, scenario3, scenario4, scenario5, scenario6, scenario7, scenario8];

  function buildKasamTestScenarioState(selector = "all") {
    const selected = String(selector || "all").toLocaleLowerCase("tr-TR");
    const state = kasamScenarioBaseState();
    const summaries = [];
    KASAM_TEST_SCENARIO_BUILDERS.forEach((builder, index) => {
      const scenarioNumber = index + 1;
      if (selected !== "all" && selected !== String(scenarioNumber)) return;
      const beforeEntries = state.entries.length;
      const beforeNotifications = state.notifications.length;
      const { scenario, ctx } = builder(state);
      const entries = state.entries.slice(beforeEntries);
      const notifications = state.notifications.slice(beforeNotifications);
      summaries.push({
        id: scenario.id,
        key: scenario.key,
        title: scenario.title,
        folder: scenario.folder,
        projectId: ctx.project.id,
        projectName: ctx.project.name,
        code: ctx.project.code,
        userIds: ctx.project.memberIds,
        months: scenario.months,
        startDate: scenario.startDate,
        endDate: scenario.endDate,
        entryCount: entries.length,
        gameCount: notifications.filter((item) => item.notificationType === "entry").length,
        featureUse: [...ctx.featureUse],
      });
    });
    if (summaries.length) {
      const first = summaries[0];
      state.activeProjectId = first.projectId;
      state.activeUserId = first.userIds[0] || "";
      state.signedInUserId = first.userIds[0] || "";
      state.pendingLoginUserId = first.userIds[0] || "";
      const activeUser = state.users.find((user) => user.id === state.activeUserId);
      state.pendingLoginEmail = activeUser?.email || "";
      state.testScenarioActiveEmail = activeUser?.email || "";
      state.authMode = "login";
      state.onboardingStep = "done";
      state.activeView = "home";
      state.cloudEnabled = false;
      state.cloudStatus = "Test modu";
      state.cloudUserId = "";
      state.cloudSyncAt = "";
      state.testScenarioMode = true;
      state.testScenarioSelector = selected;
      state.testScenarioExitUrl = root.location ? `${root.location.origin}${root.location.pathname}` : "";
      state.testScenarioMeta = summaries;
    }
    return state;
  }

  function assignTestScenarioNoop(name, fn) {
    try {
      if (typeof root[name] === "function") root[name] = fn;
    } catch (error) {
      root.__kasamTestScenarioBypassErrors = [...(root.__kasamTestScenarioBypassErrors || []), `${name}: ${error.message}`];
    }
    try {
      if (/^[A-Za-z_$][\w$]*$/.test(name) && typeof root.Function === "function") root.Function("fn", `${name} = fn;`)(fn);
    } catch (error) {
      root.__kasamTestScenarioBypassErrors = [...(root.__kasamTestScenarioBypassErrors || []), `${name}: ${error.message}`];
    }
  }

  function testScenarioSelectorFromUrl() {
    try {
      return new URLSearchParams(location.search || "").get("testScenario") || "";
    } catch {
      return "";
    }
  }

  function testScenarioUserIndexFromUrl() {
    try {
      const raw = new URLSearchParams(location.search || "").get("simUser") || "";
      const index = Number.parseInt(raw, 10);
      return Number.isFinite(index) && index > 0 ? index : 0;
    } catch {
      return 0;
    }
  }

  function testScenarioEscape(value) {
    if (typeof kasamSafe === "function") return kasamSafe(value);
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function testScenarioProject() {
    const summary = state?.testScenarioMeta?.[0];
    return state?.projects?.find((project) => project.id === summary?.projectId) || state?.projects?.find((project) => project.id === state?.activeProjectId) || null;
  }

  function testScenarioUsers() {
    const project = testScenarioProject();
    const ids = Array.isArray(project?.memberIds) ? project.memberIds : [];
    return ids.map((id) => state.users.find((user) => user.id === id)).filter(Boolean);
  }

  function activateTestScenarioUser(userId) {
    const user = state?.users?.find((item) => item.id === userId) || state?.users?.[0];
    if (!user) return null;
    state.activeUserId = user.id;
    state.signedInUserId = user.id;
    state.pendingLoginUserId = user.id;
    state.pendingLoginEmail = user.email || "";
    state.testScenarioActiveEmail = user.email || "";
    state.authMode = "login";
    state.onboardingStep = "done";
    state.activeView = "home";
    state.cloudEnabled = false;
    state.cloudStatus = "Test modu";
    state.cloudUserId = "";
    state.cloudSyncAt = "";
    state.testScenarioMode = true;
    return user;
  }

  function activateTestScenarioUserByIndex(index) {
    const users = testScenarioUsers();
    const safeIndex = Number(index || 0);
    const user = users[Math.max(0, safeIndex - 1)] || users[0] || state?.users?.[0];
    return user ? activateTestScenarioUser(user.id) : null;
  }

  function applyTestScenarioAuthBypass(selector) {
    if (!selector || root.__kasamTestScenarioBypassApplied) return Boolean(selector);
    root.__kasamTestScenarioBypassApplied = true;
    root.KASAM_TEST_MODE = true;
    root.KASAM_TEST_SCENARIO_SELECTOR = selector;
    root.KASA_CLOUD_CONFIG = {};
    try {
      if (typeof cloudSyncTimer !== "undefined" && cloudSyncTimer) {
        clearTimeout(cloudSyncTimer);
        cloudSyncTimer = null;
      }
    } catch (error) {
      root.__kasamTestScenarioBypassErrors = [...(root.__kasamTestScenarioBypassErrors || []), `cloudSyncTimer: ${error.message}`];
    }
    try {
      if (typeof kasamCloudRefreshTimer !== "undefined" && kasamCloudRefreshTimer) {
        clearInterval(kasamCloudRefreshTimer);
        kasamCloudRefreshTimer = null;
      }
    } catch (error) {
      root.__kasamTestScenarioBypassErrors = [...(root.__kasamTestScenarioBypassErrors || []), `kasamCloudRefreshTimer: ${error.message}`];
    }
    assignTestScenarioNoop("isCloudReady", () => false);
    assignTestScenarioNoop("initCloudSession", async () => {
      if (typeof state !== "undefined") {
        state.cloudEnabled = false;
        state.cloudStatus = "Test modu";
        state.cloudUserId = "";
        state.cloudSyncAt = "";
      }
      if (typeof setCloudStatus === "function") setCloudStatus("Test modu");
    });
    assignTestScenarioNoop("cloudPushState", async () => undefined);
    assignTestScenarioNoop("scheduleCloudSync", () => undefined);
    assignTestScenarioNoop("kasamRefreshCloudData", async () => undefined);
    assignTestScenarioNoop("kasamStartCloudRefresh", () => undefined);
    return true;
  }

  function initTestScenario(selector = "all", options = {}) {
    if (typeof seedState === "undefined" || typeof normalizeState !== "function") {
      throw new Error("Kasam uygulama durumu hazır değil.");
    }
    const scenarioState = buildKasamTestScenarioState(selector);
    state = normalizeState({ ...seedState, ...scenarioState });
    const simUserIndex = Number(options.simUser || testScenarioUserIndexFromUrl() || 0);
    if (simUserIndex) activateTestScenarioUserByIndex(simUserIndex);
    else activateTestScenarioUser(state.activeUserId);
    if (typeof makeDraft === "function") draft = makeDraft();
    if (typeof saveState === "function") saveState();
    if (options.render !== false && typeof render === "function") render();
    return state.testScenarioMeta || [];
  }

  function ensureTestScenarioState(selector) {
    if (!selector) return false;
    applyTestScenarioAuthBypass(selector);
    const normalizedSelector = String(selector || "all").toLocaleLowerCase("tr-TR");
    const hasMatchingState = state?.testScenarioMode && state?.testScenarioSelector === normalizedSelector && state?.users?.length && state?.projects?.length;
    if (!hasMatchingState) initTestScenario(selector, { render: false });
    else {
      const simUserIndex = testScenarioUserIndexFromUrl();
      if (simUserIndex) activateTestScenarioUserByIndex(simUserIndex);
      else activateTestScenarioUser(state.signedInUserId || state.activeUserId);
    }
    return true;
  }

  function testScenarioEnsureHeading(projectId, title, type) {
    const name = kasamScenarioTitle(title) || (type === "income" ? "Gelir" : "Gider");
    let heading = state.headings.find((item) => item.projectId === projectId && item.name === name && item.type === type);
    if (heading) return heading;
    heading = {
      id: `sim-h-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      projectId,
      name,
      shortName: name,
      emoji: "",
      type,
      createdAt: new Date().toISOString(),
    };
    state.headings.push(heading);
    return heading;
  }

  function testScenarioEqualSplit(ids) {
    const list = Array.isArray(ids) && ids.length ? ids : [];
    const ratio = list.length ? 1 / list.length : 1;
    return list.map(() => ratio);
  }

  function testScenarioSummary() {
    const project = testScenarioProject();
    const user = state?.users?.find((item) => item.id === state?.signedInUserId) || null;
    const entries = state?.entries?.filter((entry) => !project || entry.projectId === project.id) || [];
    const visibleEntries = entries.filter((entry) => !(entry.lockedNotificationId && !entry.revealedAt));
    const income = visibleEntries.filter((entry) => entry.type === "income").reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const expense = visibleEntries.filter((entry) => entry.type === "expense").reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
    const personalNet = visibleEntries.reduce((sum, entry) => {
      const splitWith = Array.isArray(entry.splitWith) ? entry.splitWith : [];
      const index = splitWith.indexOf(user?.id);
      const ratio = index >= 0 ? Number((entry.splitRatio || [])[index] || 0) : 0;
      const amount = Number(entry.amount || 0) * ratio;
      if (entry.type === "income") return sum + amount;
      if (entry.type === "expense" || entry.type === "payable") return sum - amount;
      return sum;
    }, 0);
    const unread = state?.notifications?.filter((item) => (item.recipients || []).includes(user?.id) && !item.isCompleted).length || 0;
    return {
      userId: user?.id || "",
      userName: user?.name || "",
      userEmail: user?.email || "",
      projectId: project?.id || "",
      projectName: project?.name || "",
      entryCount: entries.length,
      notificationCount: state?.notifications?.length || 0,
      unread,
      income,
      expense,
      net: income - expense,
      personalNet,
    };
  }

  function testScenarioAddSimEntry(payload = {}) {
    const selector = testScenarioSelectorFromUrl() || state?.testScenarioSelector || "1";
    ensureTestScenarioState(selector);
    const users = testScenarioUsers();
    const actor = state.users.find((item) => item.id === payload.userId) || users[Math.max(0, Number(payload.simUser || 1) - 1)] || users[0] || state.users[0];
    const project = testScenarioProject();
    if (!actor || !project) throw new Error("Test kullanıcısı veya kasa bulunamadı.");
    activateTestScenarioUser(actor.id);
    state.activeProjectId = project.id;
    const type = payload.type === "income" ? "income" : "expense";
    const amount = Math.max(0, Number(payload.amount || 0));
    if (!amount) throw new Error("Tutar gir.");
    const title = kasamScenarioTitle(payload.title || payload.heading || (type === "income" ? "Test geliri" : "Test gideri"));
    const date = payload.date || new Date().toISOString().slice(0, 10);
    const heading = testScenarioEnsureHeading(project.id, payload.heading || title, type);
    const splitWith = Array.isArray(payload.splitWith) && payload.splitWith.length ? payload.splitWith : project.memberIds.slice();
    const splitRatio = Array.isArray(payload.splitRatio) && payload.splitRatio.length === splitWith.length ? payload.splitRatio.map(Number) : testScenarioEqualSplit(splitWith);
    const entry = {
      id: `sim-e-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      projectId: project.id,
      type,
      amount,
      originalAmount: amount,
      enteredAmount: amount,
      currency: "TRY",
      exchangeRate: 1,
      headingId: heading.id,
      headingName: "",
      shortName: title,
      note: payload.note || "",
      userId: actor.id,
      paidById: actor.id,
      splitWith,
      splitRatio,
      date,
      status: "done",
      lockedNotificationId: "",
      autoRevealAt: "",
      rateLockedAt: new Date().toISOString(),
      photoName: "",
      photoData: payload.photoData || "",
      gif: payload.gif || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const mode = payload.mode || "open";
    if (mode !== "silent") {
      const notification = {
        id: `sim-n-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        projectId: project.id,
        entryId: entry.id,
        actorId: actor.id,
        recipients: project.memberIds.filter((id) => id !== actor.id),
        mode,
        actualType: type,
        title,
        amount,
        emoji: mode === "surprise" ? "🎁" : "",
        photoName: "",
        photoData: payload.photoData || "",
        gif: payload.gif || "",
        successReaction: "✓",
        failReaction: "✕",
        guessDeadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        revealedAt: mode === "surprise" ? "" : new Date().toISOString(),
        isCompleted: mode !== "surprise",
        notificationType: "entry",
        guesses: [],
        createdAt: new Date().toISOString(),
        gameVersion: "v2",
        hideActor: mode === "surprise",
        gamePhase: 1,
        phase1Guesses: [],
        phase2Guesses: [],
        phase3Options: [heading.name, "Market", "Fatura", "Ulaşım"],
        phase3Correct: 0,
        phase3Guesses: [],
        actorWrongReaction: { type: "emoji", data: "✕" },
        actorCorrectReaction: { type: "emoji", data: "✓" },
        typeWrongReaction: { type: "emoji", data: "✕" },
        typeCorrectReaction: { type: "emoji", data: "✓" },
        categoryWrongReaction: { type: "emoji", data: "✕" },
        categoryCorrectReaction: { type: "emoji", data: "✓" },
        phase1Completed: false,
        phase2Completed: false,
        phase3Completed: false,
        gameFullyCompleted: false,
      };
      if (mode === "surprise") entry.lockedNotificationId = notification.id;
      state.notifications.push(notification);
    }
    state.entries.push(entry);
    if (typeof normalizeState === "function") state = normalizeState(state);
    activateTestScenarioUser(actor.id);
    if (typeof makeDraft === "function") draft = makeDraft();
    if (typeof saveState === "function") saveState();
    if (typeof render === "function") render();
    return { entry, summary: testScenarioSummary(), stateSnapshot: state };
  }

  function hydrateTestScenarioState(nextState, simUserIndex) {
    if (!nextState) return false;
    state = typeof normalizeState === "function" ? normalizeState(nextState) : nextState;
    const index = Number(simUserIndex || testScenarioUserIndexFromUrl() || 0);
    if (index) activateTestScenarioUserByIndex(index);
    else activateTestScenarioUser(state.signedInUserId || state.activeUserId);
    if (typeof makeDraft === "function") draft = makeDraft();
    if (typeof saveState === "function") saveState();
    if (typeof render === "function") render();
    return true;
  }

  function testScenarioBannerHtml() {
    const selector = testScenarioSelectorFromUrl();
    if (!selector || !state?.testScenarioMode) return "";
    const summary = state.testScenarioMeta?.[0] || {};
    const project = testScenarioProject();
    const users = testScenarioUsers();
    const scenarioName = summary.projectName || project?.name || summary.title || "Test senaryosu";
    return `
      <section class="test-mode-banner" data-testid="test-mode-banner">
        <div class="test-mode-copy">
          <strong>🧪 Test modu</strong>
          <span>Senaryo ${testScenarioEscape(summary.id || selector)}: ${testScenarioEscape(scenarioName)}</span>
        </div>
        <label class="test-user-switch">
          <span>Kullanıcı değiştir</span>
          <select data-action="test-user-switch" aria-label="Test kullanıcısı seç">
            ${users.map((user) => `<option value="${testScenarioEscape(user.id)}" ${user.id === state.signedInUserId ? "selected" : ""}>${testScenarioEscape(user.name)} · ${testScenarioEscape(user.email)}</option>`).join("")}
          </select>
        </label>
        <button class="tiny-button test-exit-button" data-action="exit-test-mode" type="button">Test modundan çık</button>
      </section>
    `;
  }

  root.KASAM_TEST_SCENARIO_VERSION = TEST_SCENARIO_VERSION;
  root.KASAM_TEST_SCENARIO_BUILDERS = KASAM_TEST_SCENARIO_BUILDERS;
  root.buildKasamTestScenarioState = buildKasamTestScenarioState;
  root.applyTestScenarioAuthBypass = applyTestScenarioAuthBypass;
  root.ensureTestScenarioState = ensureTestScenarioState;
  root.initTestScenario = initTestScenario;
  root.testScenarioUserIndexFromUrl = testScenarioUserIndexFromUrl;
  root.testScenarioSummary = testScenarioSummary;
  root.testScenarioAddSimEntry = testScenarioAddSimEntry;
  root.hydrateTestScenarioState = hydrateTestScenarioState;

  if (typeof render === "function" && !root.__kasamTestScenarioRenderWrapped) {
    const baseRender = render;
    root.__kasamTestScenarioRenderWrapped = true;
    render = function renderWithTestScenarioBypass() {
      const selector = testScenarioSelectorFromUrl();
      if (selector) ensureTestScenarioState(selector);
      return baseRender();
    };
  }

  if (typeof renderHome === "function" && !root.__kasamTestScenarioHomeWrapped) {
    const baseRenderHome = renderHome;
    root.__kasamTestScenarioHomeWrapped = true;
    renderHome = function renderHomeWithTestBanner() {
      return `${testScenarioBannerHtml()}${baseRenderHome()}`;
    };
  }

  if (typeof bindScreen === "function" && !root.__kasamTestScenarioBindWrapped) {
    const baseBindScreen = bindScreen;
    root.__kasamTestScenarioBindWrapped = true;
    bindScreen = function bindScreenWithTestScenarioControls() {
      baseBindScreen();
      app.querySelectorAll("[data-action='test-user-switch']").forEach((select) => {
        if (select.dataset.testSwitchBound) return;
        select.dataset.testSwitchBound = "1";
        select.addEventListener("change", () => {
          activateTestScenarioUser(select.value);
          if (typeof saveState === "function") saveState();
          if (typeof render === "function") render();
        });
      });
      app.querySelectorAll("[data-action='exit-test-mode']").forEach((button) => {
        if (button.dataset.testExitBound) return;
        button.dataset.testExitBound = "1";
        button.addEventListener("click", () => {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {}
          root.KASAM_TEST_MODE = false;
          const cleanUrl = state?.testScenarioExitUrl || `${location.origin}${location.pathname}`;
          location.replace(cleanUrl);
        });
      });
    };
  }

  if (typeof initApp === "function" && !root.__kasamTestScenarioInitWrapped) {
    const baseInitApp = initApp;
    root.__kasamTestScenarioInitWrapped = true;
    initApp = async function initAppWithTestScenarios() {
      const selector = testScenarioSelectorFromUrl();
      if (selector) {
        applyTestScenarioAuthBypass(selector);
        initTestScenario(selector, { render: false });
      }
      await baseInitApp();
      if (selector) {
        ensureTestScenarioState(selector);
        if (typeof render === "function") render();
      }
    };
  }

  if (typeof root.addEventListener === "function" && !root.__kasamSimulatorBridgeBound) {
    root.__kasamSimulatorBridgeBound = true;
    root.addEventListener("message", (event) => {
      const message = event.data || {};
      if (message.source !== "kasam-simulator") return;
      const requestId = message.requestId || "";
      try {
        const selector = testScenarioSelectorFromUrl() || message.selector || state?.testScenarioSelector || "1";
        ensureTestScenarioState(selector);
        let result = null;
        if (message.action === "add-entry") {
          result = testScenarioAddSimEntry(message.payload || {});
        } else if (message.action === "hydrate-state") {
          hydrateTestScenarioState(message.stateSnapshot, message.simUser);
          result = { summary: testScenarioSummary() };
        } else if (message.action === "get-summary") {
          result = { summary: testScenarioSummary() };
        } else {
          return;
        }
        if (event.source && typeof event.source.postMessage === "function") {
          event.source.postMessage({
            source: "kasam-app",
            action: `${message.action}:result`,
            requestId,
            ok: true,
            simUser: testScenarioUserIndexFromUrl(),
            result,
          }, "*");
        }
      } catch (error) {
        if (event.source && typeof event.source.postMessage === "function") {
          event.source.postMessage({
            source: "kasam-app",
            action: `${message.action || "unknown"}:result`,
            requestId,
            ok: false,
            error: error.message,
          }, "*");
        }
      }
    });
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      TEST_SCENARIO_VERSION,
      REPORT_DATE,
      kasamScenarioMoney,
      buildKasamTestScenarioState,
      applyTestScenarioAuthBypass,
      ensureTestScenarioState,
      testScenarioUserIndexFromUrl,
      testScenarioSummary,
    };
  }
})(typeof window !== "undefined" ? window : globalThis);

