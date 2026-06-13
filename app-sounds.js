var KASAM_SOUND_STORAGE_KEY = "kasam-sound-enabled";

function kasamSoundEnabled() {
  if (state && state.soundEnabled === false) return false;
  return localStorage.getItem(KASAM_SOUND_STORAGE_KEY) !== "false";
}

function setKasamSoundEnabled(enabled) {
  const value = Boolean(enabled);
  if (state) state.soundEnabled = value;
  localStorage.setItem(KASAM_SOUND_STORAGE_KEY, value ? "true" : "false");
}

function kasamAudioContext() {
  if (!kasamSoundEnabled()) return null;
  const AudioConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioConstructor) return null;
  if (!window.__kasamAudioContext) window.__kasamAudioContext = new AudioConstructor();
  return window.__kasamAudioContext;
}

function kasamPlayTone(frequency, startAt, duration, options = {}) {
  const context = options.context || kasamAudioContext();
  if (!context) return null;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = options.type || "sine";
  oscillator.frequency.setValueAtTime(frequency, startAt);
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(options.gain || 0.25, startAt + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + 0.02);
  return oscillator;
}

function kasamPlaySequence(notes, options = {}) {
  const context = kasamAudioContext();
  if (!context) return false;
  const start = context.currentTime + 0.01;
  notes.forEach((frequency, index) => {
    kasamPlayTone(frequency, start + index * (options.spacing || 0.09), options.duration || 0.08, {
      context,
      gain: options.gain || 0.3,
      type: options.type || "sine",
    });
  });
  return true;
}

function playCorrectSound() {
  return kasamPlaySequence([523, 659, 784], { duration: 0.08, spacing: 0.09, gain: 0.3, type: "sine" });
}

function playWrongSound() {
  const context = kasamAudioContext();
  if (!context) return false;
  const start = context.currentTime + 0.01;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sawtooth";
  oscillator.frequency.setValueAtTime(300, start);
  oscillator.frequency.exponentialRampToValueAtTime(220, start + 0.3);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.3, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + 0.34);
  return true;
}

function playNotificationSound() {
  return kasamPlaySequence([440, 554], { duration: 0.075, spacing: 0.075, gain: 0.2, type: "sine" });
}

function playSuccessSound() {
  return kasamPlaySequence([262, 330, 392, 523], { duration: 0.1, spacing: 0.105, gain: 0.3, type: "sine" });
}

if (typeof handleOwnProfileForm === "function") {
  var kasamSoundBaseHandleOwnProfileForm = handleOwnProfileForm;
  handleOwnProfileForm = async function handleOwnProfileFormSound(form) {
    const data = new FormData(form);
    setKasamSoundEnabled(data.get("soundEnabled") === "on");
    return kasamSoundBaseHandleOwnProfileForm(form);
  };
}
