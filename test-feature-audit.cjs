const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");

const root = __dirname;
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const source = ["app-state.js", "app-blocks.js", "app-production.js", "styles.css"].map(read).join("\n");

[
  "guessNotification",
  "amountGuessCorrect",
  "maybeRevealNotification",
  "autoRevealAt",
  "totalScore",
  "correctGuesses",
  "+10 puan",
  "confetti-burst",
  "shake-once",
  "standart",
  "fatihterim",
  "efsane",
  "sakin",
].forEach((marker) => assert(source.includes(marker), `surprise:${marker}`));

[
  "reactionPreset",
  "setReaction",
  "reactionSummary",
  "reactionPicker",
  "kasa_reactions",
  "reaction-notification",
  "scale",
].forEach((marker) => assert(source.includes(marker), `reaction:${marker}`));

[
  "dailyWarningCards",
  "weeklySummaryCard",
  "monthlyComparisonCard",
  "Math.random",
  "funnyMessages",
].forEach((marker) => assert(source.includes(marker), `funny:${marker}`));

[
  "goalCurrentAmount",
  "goalDelayWarning",
  "goalCard",
  "projectTemplates",
  "roommates",
  "couple-trip",
  "group-trip",
  "personal-goal",
  "family-budget",
].forEach((marker) => assert(source.includes(marker), `goal-template:${marker}`));

[
  "html2canvas",
  "KASAM FİŞİ",
  "kasam.app",
  "Courier New",
  "navigator.share",
].forEach((marker) => assert(source.includes(marker), `receipt:${marker}`));

[
  "calculateBalances",
  "minimumTransfers",
  "settleTransfer",
  "paidById",
  "splitRatio",
  "Kasaya da ekle",
].forEach((marker) => assert(source.includes(marker), `settlement:${marker}`));

[
  "headingAutocompleteHtml",
  "keywordEmojiMap",
  "market",
  "kira",
  "tatil",
].forEach((marker) => assert(source.includes(marker), `autocomplete:${marker}`));

[
  "lockedSurpriseCountForUser",
  "surprise-alert-row",
  "bekleyen sürpriz hareket",
].forEach((marker) => assert(source.includes(marker), `surprise-counter:${marker}`));

console.log("FEATURE AUDIT TEST OK");
