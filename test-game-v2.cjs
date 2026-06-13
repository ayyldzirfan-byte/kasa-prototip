const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const files = [
  "app-state.js",
  "app-core.js",
  "app-views.js",
  "app-bind.js",
  "app-model.js",
  "app-cloud.js",
  "app-blocks.js",
  "app-product-pass.js",
  "app-production.js",
  "app-sounds.js",
  "app-game-v2.js",
];

class FakeOscillator {
  constructor() {
    this.type = "sine";
    this.frequency = {
      setValueAtTime() {},
      exponentialRampToValueAtTime() {},
    };
  }

  connect() {}
  start() {}
  stop() {}
}

class FakeGain {
  constructor() {
    this.gain = {
      setValueAtTime() {},
      exponentialRampToValueAtTime() {},
    };
  }

  connect() {}
}

class FakeAudioContext {
  constructor() {
    this.currentTime = 0;
    this.destination = {};
  }

  createOscillator() {
    return new FakeOscillator();
  }

  createGain() {
    return new FakeGain();
  }
}

function makeElement(tagName = "div") {
  return {
    tagName,
    style: {},
    dataset: {},
    classList: { add() {}, remove() {}, toggle() {} },
    children: [],
    innerHTML: "",
    setAttribute() {},
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    addEventListener() {},
    remove() {},
    querySelector(selector) {
      if (selector === "button") return makeElement("button");
      if (selector === "canvas") {
        return {
          width: 320,
          height: 480,
          getContext() {
            return {
              clearRect() {},
              save() {},
              translate() {},
              rotate() {},
              fillRect() {},
              restore() {},
              fillStyle: "",
            };
          },
        };
      }
      return null;
    },
    querySelectorAll() {
      return [];
    },
  };
}

function createSandbox() {
  const appElement = makeElement("div");
  const documentElement = { style: { setProperty() {} } };
  const sandbox = {
    console,
    window: {
      addEventListener() {},
      removeEventListener() {},
      location: { origin: "http://test.local", pathname: "/index.html" },
      Sentry: null,
      setInterval() { return 1; },
      clearInterval() {},
      setTimeout() { return 1; },
      AudioContext: FakeAudioContext,
      webkitAudioContext: FakeAudioContext,
    },
    document: {
      hidden: false,
      body: {
        dataset: {},
        classList: { toggle() {}, add() {}, remove() {} },
        appendChild() {},
      },
      documentElement,
      addEventListener() {},
      querySelector(selector) {
        if (selector === "#app") return appElement;
        return null;
      },
      querySelectorAll(selector) {
        if (selector === ".tab") {
          return Array.from({ length: 5 }, () => makeElement("button"));
        }
        return [];
      },
      createElement: makeElement,
    },
    location: { origin: "http://test.local", pathname: "/index.html" },
    localStorage: {
      data: {},
      getItem(key) { return this.data[key] || null; },
      setItem(key, value) { this.data[key] = String(value); },
      removeItem(key) { delete this.data[key]; },
      clear() { this.data = {}; },
    },
    navigator: { onLine: true, share: null },
    crypto: { randomUUID: () => `test-${Math.random().toString(16).slice(2)}` },
    app: appElement,
    setTimeout() { return 1; },
    clearTimeout() {},
    setInterval() { return 1; },
    clearInterval() {},
    requestAnimationFrame(callback) {
      callback(2600);
      return 1;
    },
    getComputedStyle() {
      const tokens = {
        "--color-accent": "#e8c547",
        "--color-income": "#2d6a4f",
        "--color-expense": "#c0392b",
        "--color-bg": "#f4f1eb",
        "--color-text-primary": "#1a1a18",
      };
      return { getPropertyValue: (token) => tokens[token] || "" };
    },
    URLSearchParams,
    FormData,
    Blob,
    File: function File() {},
    Intl,
    Date,
    Math,
    performance: { now: () => 0 },
  };
  sandbox.window.document = sandbox.document;
  sandbox.window.localStorage = sandbox.localStorage;
  sandbox.window.navigator = sandbox.navigator;
  sandbox.window.performance = sandbox.performance;
  sandbox.window.requestAnimationFrame = sandbox.requestAnimationFrame;
  vm.createContext(sandbox);
  for (const file of files) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, file), "utf8"), sandbox, { filename: file });
  }
  vm.runInContext(`
    state = normalizeState({
      activeView: "notifications",
      activeProjectId: "p_shared",
      signedInUserId: "u_guess",
      activeUserId: "u_guess",
      users: [
        { id: "u_actor", name: "Actor User", nickname: "", email: "actor@test.local", totalScore: 0, correctGuesses: 0, totalGuesses: 0 },
        { id: "u_guess", name: "Guess User", nickname: "", email: "guess@test.local", totalScore: 0, correctGuesses: 0, totalGuesses: 0 },
        { id: "u_other", name: "Other User", nickname: "", email: "other@test.local", totalScore: 0, correctGuesses: 0, totalGuesses: 0 }
      ],
      projects: [{
        id: "p_shared",
        name: "Shared",
        purpose: "Test",
        code: "KASAM-TST",
        createdBy: "u_actor",
        memberIds: ["u_actor", "u_guess", "u_other"],
        memberSince: { u_actor: "2026-06-01", u_guess: "2026-06-01", u_other: "2026-06-01" },
        splitType: "equal",
        familiarityScores: {}
      }],
      headings: [{ id: "h_electric", projectId: "p_shared", name: "Elektrik", shortName: "Elektrik", emoji: "" }],
      entries: [],
      notifications: [],
      reactions: [],
      goals: [],
      settlements: [],
      reconciliations: [],
      insights: [],
      retryQueue: [],
      soundEnabled: true
    });
    draft = makeDraft();
  `, sandbox);
  return sandbox;
}

function runInSandbox(sandbox, code) {
  return vm.runInContext(code, sandbox);
}

function seedGame(sandbox, overrides = {}) {
  runInSandbox(sandbox, `
    state.users.forEach((user) => {
      user.totalScore = 0;
      user.correctGuesses = 0;
      user.totalGuesses = 0;
    });
    state.projects[0].familiarityScores = {};
    state.entries = [{
      id: "e_game",
      projectId: "p_shared",
      type: "expense",
      amount: 1000,
      headingId: "h_electric",
      shortName: "Elektrik",
      userId: "u_actor",
      paidById: "u_actor",
      splitWith: ["u_actor", "u_guess", "u_other"],
      splitRatio: [1 / 3, 1 / 3, 1 / 3],
      date: "2026-06-06",
      status: "done",
      lockedNotificationId: "n_game",
      createdAt: "2026-06-06T10:00:00.000Z",
      updatedAt: "2026-06-06T10:00:00.000Z"
    }];
    state.notifications = [kasamGameV2NormalizeNotification({
      id: "n_game",
      projectId: "p_shared",
      entryId: "e_game",
      actorId: "u_actor",
      recipients: ["u_guess", "u_other"],
      mode: "surprise",
      gameVersion: "v2",
      hideActor: true,
      actualType: "expense",
      title: "Elektrik",
      amount: 1000,
      phase3Options: ["Elektrik", "Market", "Kira", "Yakıt"],
      phase3Correct: 0,
      createdAt: "2026-06-06T10:00:00.000Z",
      guessDeadline: "2099-01-01T00:00:00.000Z",
      actorWrongReaction: { type: "emoji", data: "x" },
      actorCorrectReaction: { type: "emoji", data: "ok" },
      typeWrongReaction: { type: "emoji", data: "x" },
      typeCorrectReaction: { type: "emoji", data: "ok" },
      categoryWrongReaction: { type: "emoji", data: "x" },
      categoryCorrectReaction: { type: "emoji", data: "ok" },
      ${Object.entries(overrides).map(([key, value]) => `${key}: ${JSON.stringify(value)}`).join(",")}
    })];
  `);
}

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

test("GRUP 1.1 Aşama 1 doğru üye tahmini skoru artırır", () => {
  const sandbox = createSandbox();
  seedGame(sandbox);
  const result = runInSandbox(sandbox, `
    const result = guessNotification("n_game", { step: "actor", predictedActorId: "u_actor" });
    ({
      status: result.status,
      phase1Completed: state.notifications[0].phase1Completed,
      score: currentUser().totalScore,
      correctGuesses: currentUser().correctGuesses,
      familiarity: state.projects[0].familiarityScores.u_guess.u_actor
    });
  `);
  assert.equal(result.status, "saved");
  assert.equal(result.phase1Completed, true);
  assert.equal(result.score, 10);
  assert.equal(result.correctGuesses, 1);
  assert.equal(result.familiarity, 10);
});

test("GRUP 1.2 Aşama 1 yanlış tahmin tanışma skoruna +2 yazar", () => {
  const sandbox = createSandbox();
  seedGame(sandbox);
  const result = runInSandbox(sandbox, `
    const result = guessNotification("n_game", { step: "actor", predictedActorId: "u_other" });
    ({
      status: result.status,
      phase1Completed: state.notifications[0].phase1Completed,
      score: currentUser().totalScore,
      correctGuesses: currentUser().correctGuesses,
      familiarity: state.projects[0].familiarityScores.u_guess.u_actor
    });
  `);
  assert.equal(result.status, "saved");
  assert.equal(result.phase1Completed, true);
  assert.equal(result.score, 0);
  assert.equal(result.correctGuesses, 0);
  assert.equal(result.familiarity, 2);
});

test("GRUP 1.3 Aşama 1 bitmeden Aşama 2 açılmaz", () => {
  const sandbox = createSandbox();
  seedGame(sandbox);
  const result = runInSandbox(sandbox, `guessNotification("n_game", { step: "type", predictedType: "expense" }).status`);
  assert.equal(result, "blocked");
});

test("GRUP 1.4 Aşama 2 doğru tip tahmini tamamlanır", () => {
  const sandbox = createSandbox();
  seedGame(sandbox);
  const result = runInSandbox(sandbox, `
    guessNotification("n_game", { step: "actor", predictedActorId: "u_actor" });
    const result = guessNotification("n_game", { step: "type", predictedType: "expense" });
    ({ status: result.status, phase2Completed: state.notifications[0].phase2Completed, gamePhase: state.notifications[0].gamePhase });
  `);
  assert.equal(result.status, "saved");
  assert.equal(result.phase2Completed, true);
  assert.equal(result.gamePhase, 3);
});

test("GRUP 1.5 Aşama 3 doğru kategori tamamlanır", () => {
  const sandbox = createSandbox();
  seedGame(sandbox);
  const result = runInSandbox(sandbox, `
    guessNotification("n_game", { step: "actor", predictedActorId: "u_actor" });
    guessNotification("n_game", { step: "type", predictedType: "expense" });
    const result = guessNotification("n_game", { step: "category", predictedOption: 0 });
    ({ status: result.status, phase3Completed: state.notifications[0].phase3Completed });
  `);
  assert.equal(result.status, "saved");
  assert.equal(result.phase3Completed, true);
});

test("GRUP 1.6 Tüm aşamalar bitince oyun tamamlanır ve hareket açılır", () => {
  const sandbox = createSandbox();
  seedGame(sandbox);
  const result = runInSandbox(sandbox, `
    guessNotification("n_game", { step: "actor", predictedActorId: "u_actor" });
    guessNotification("n_game", { step: "type", predictedType: "expense" });
    guessNotification("n_game", { step: "category", predictedOption: 0 });
    ({
      gameFullyCompleted: state.notifications[0].gameFullyCompleted,
      entryLock: state.entries[0].lockedNotificationId,
      confirmed: entryConfirmed(state.entries[0])
    });
  `);
  assert.equal(result.gameFullyCompleted, true);
  assert.equal(result.entryLock, "");
  assert.equal(result.confirmed, true);
});

test("GRUP 1.7 Oyun bitmeden sürpriz hareket bakiyeye yansımaz", () => {
  const sandbox = createSandbox();
  seedGame(sandbox);
  const result = runInSandbox(sandbox, `entryConfirmed(state.entries[0])`);
  assert.equal(result, false);
});

test("GRUP 2.1 Aşama 1 sonrası bildirim DOM'da kalır", () => {
  const sandbox = createSandbox();
  seedGame(sandbox);
  const result = runInSandbox(sandbox, `
    guessNotification("n_game", { step: "actor", predictedActorId: "u_actor" });
    const html = notificationRow(state.notifications[0]);
    ({ hasNext: html.includes("Gelir mi gider mi?"), completedClass: html.includes("game-completed") });
  `);
  assert.equal(result.hasNext, true);
  assert.equal(result.completedClass, false);
});

test("GRUP 2.2 Sonuç overlay'i 3 saniye otomatik kapanacak şekilde kurulur", () => {
  const source = fs.readFileSync(path.join(__dirname, "app-game-v2.js"), "utf8");
  assert.match(source, /window\.setTimeout\(remove,\s*3000\)/);
});

test("GRUP 2.3 Sadece oyun tamamen bitince bildirim soluklaşır", () => {
  const sandbox = createSandbox();
  seedGame(sandbox);
  const result = runInSandbox(sandbox, `
    const before = notificationRow(state.notifications[0]).includes("game-completed");
    guessNotification("n_game", { step: "actor", predictedActorId: "u_actor" });
    const middle = notificationRow(state.notifications[0]).includes("game-completed");
    guessNotification("n_game", { step: "type", predictedType: "expense" });
    guessNotification("n_game", { step: "category", predictedOption: 0 });
    const after = notificationRow(state.notifications[0]).includes("game-completed");
    ({ before, middle, after });
  `);
  assert.equal(result.before, false);
  assert.equal(result.middle, false);
  assert.equal(result.after, true);
});

test("GRUP 3.1 Doğru kim tahmini tanışma skoruna +10 yazar", () => {
  const sandbox = createSandbox();
  seedGame(sandbox);
  const score = runInSandbox(sandbox, `
    guessNotification("n_game", { step: "actor", predictedActorId: "u_actor" });
    state.projects[0].familiarityScores.u_guess.u_actor;
  `);
  assert.equal(score, 10);
});

test("GRUP 3.2 Yanlış kim tahmini tanışma skoruna +2 yazar", () => {
  const sandbox = createSandbox();
  seedGame(sandbox);
  const score = runInSandbox(sandbox, `
    guessNotification("n_game", { step: "actor", predictedActorId: "u_other" });
    state.projects[0].familiarityScores.u_guess.u_actor;
  `);
  assert.equal(score, 2);
});

test("GRUP 3.3 91+ skor doğru tanışma seviyesini verir", () => {
  const sandbox = createSandbox();
  const label = runInSandbox(sandbox, `kasamGameV2ScoreLabel(91)`);
  assert.match(label, /Birbirinizi cok iyi taniyorsunuz/);
});

test("GRUP 4.1 soundEnabled=false iken ses fonksiyonları çalışmaz", () => {
  const sandbox = createSandbox();
  const result = runInSandbox(sandbox, `
    state.soundEnabled = false;
    localStorage.setItem("kasam-sound-enabled", "false");
    playCorrectSound();
  `);
  assert.equal(result, false);
});

test("GRUP 4.2 AudioContext oluşturulur ve ses fonksiyonu hata fırlatmaz", () => {
  const sandbox = createSandbox();
  const result = runInSandbox(sandbox, `
    state.soundEnabled = true;
    localStorage.setItem("kasam-sound-enabled", "true");
    playCorrectSound();
  `);
  assert.equal(result, true);
});

test("GRUP 5.1 Dark temada overlay koyu okunur arka plan içerir", () => {
  const css = fs.readFileSync(path.join(__dirname, "styles.css"), "utf8");
  assert.match(css, /\.game-result-overlay\.correct\s*\{[\s\S]*rgba\(0,\s*0,\s*0,\s*0\.85\)/);
});

test("GRUP 5.2 Light temada overlay açık okunur arka plan içerir", () => {
  const css = fs.readFileSync(path.join(__dirname, "styles.css"), "utf8");
  assert.match(css, /:root\[data-theme="light"\]\s+\.game-result-overlay\.correct\s*\{[\s\S]*rgba\(255,\s*255,\s*255,\s*0\.90\)/);
});

test("GRUP 5.3 Yeni oyun bileşeni CSS'i hex renk içermez", () => {
  const css = fs.readFileSync(path.join(__dirname, "styles.css"), "utf8");
  const block = css.slice(css.indexOf(".game-v2-notification"), css.indexOf(".icon-income"));
  assert.doesNotMatch(block, /#[0-9a-fA-F]{3,8}\b/);
});

test("GRUP 6.1 Emoji, GIF ve Sticker sekmeleri mevcut", () => {
  const sandbox = createSandbox();
  const html = runInSandbox(sandbox, `kasamGameV2ContentPicker("actorCorrect", "Doğru tepki", "ok")`);
  assert.match(html, /data-media-open="actorCorrect"/);
  assert.match(html, /data-media-hidden-gif="actorCorrect"/);
  assert.doesNotMatch(html, /GIF linki/);
  const sheet = runInSandbox(sandbox, `kasamMediaSheetHtml("actorCorrect")`);
  assert.match(sheet, /Emoji/);
  assert.match(sheet, /GIF/);
  assert.match(sheet, /Sticker/);
  assert.match(sheet, /data-gif-search="actorCorrect"/);
  assert.match(sheet, /data-gif-results="actorCorrect"/);
});

test("GRUP 6.2 Sticker paketi en az 20 item içerir", () => {
  const sandbox = createSandbox();
  const count = runInSandbox(sandbox, `KASAM_GAME_V2_STICKERS.length`);
  assert.ok(count >= 20);
});

test("GRUP 6.3 GIF arama Edge Function env key ve Giphy çağrısı kullanır", () => {
  const source = fs.readFileSync(path.join(__dirname, "netlify", "functions", "kasa-giphy-search.js"), "utf8");
  const vercelSource = fs.readFileSync(path.join(__dirname, "api", "kasa-giphy-search.js"), "utf8");
  assert.match(source, /process\.env\.GIPHY_API_KEY/);
  assert.match(source, /api\.giphy\.com/);
  assert.match(vercelSource, /process\.env\.GIPHY_API_KEY/);
  assert.match(vercelSource, /api\.giphy\.com/);
});

let passed = 0;
let failed = 0;

for (const item of tests) {
  try {
    item.fn();
    passed += 1;
    console.log(`\x1b[32m✓\x1b[0m ${item.name}`);
  } catch (error) {
    failed += 1;
    console.error(`\x1b[31m✗\x1b[0m ${item.name}`);
    console.error(error.stack || error.message);
  }
}

console.log(`Toplam: ${tests.length} test, ${passed} geçti, ${failed} başarısız`);
process.exit(failed ? 1 : 0);
