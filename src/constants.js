export const CAMPAIGN_ID = 172939;

export const GRAPHQL_URL = "https://chuffed.org/api/graphql";
export const SUPPORTERS_URL = `https://chuffed.org/api/v2/campaigns/${CAMPAIGN_ID}/supporters`;

// How often (in milliseconds) both API calls are re-fired to keep data fresh
export const FETCH_INTERVAL_MS = 5000;

// ── Donation TTS settings ────────────────────────────────────────────────────
// Set to false to disable spoken announcements entirely
export const TTS_ENABLED = true;

// Voice to use for TTS. Matches against the browser's available voice names.
// Tip: run this in the browser console to see ALL voices on your machine:
//   speechSynthesis.getVoices().map(v => `"${v.name}" (${v.lang})`).join('\n')
//
// ── Chrome (macOS & Windows) ─────────────────────────────────────────────
//   "Google UK English Male"      – British male   ★ closest to Twitch TTS
//   "Google UK English Female"    – British female
//   "Google US English"           – American female
//
// ── macOS system voices (Safari & Chrome) ────────────────────────────────
//   "Daniel"                      – British male
//   "Moira"                       – Irish female
//   "Rishi"                       – Indian English male
//   "Tessa"                       – South African female
//   "Veena"                       – Indian English female
//   "Samantha"                    – American female (default macOS)
//   "Karen"                       – Australian female
//   "Victoria"                    – American female (older)
//   "Alex"                        – American male
//   "Fred"                        – American male (robotic)
//
// ── Windows system voices ─────────────────────────────────────────────────
//   "Microsoft David Desktop"     – American male
//   "Microsoft Zira Desktop"      – American female
//   "Microsoft Mark Desktop"      – American male
//   "Microsoft Hazel Desktop"     – British female
//   "Microsoft George Desktop"    – British male
//
// Leave as "" to use the browser default voice
export const TTS_VOICE = "Google UK English Male";

// ── Kokoro neural TTS (AI voice) ────────────────────────────────────────────
// Set to false to skip the AI model entirely and always use the browser voice.
// TTS_ENABLED = false still disables ALL speech regardless of this setting.
export const TTS_KOKORO_ENABLED = true;

// Voice used when the kokoro-js engine is ready (sounds far more human).
// Falls back to TTS_VOICE (Web Speech API) while the model is downloading,
// or always if TTS_KOKORO_ENABLED = false.
//
// Voice key format: {region}{gender}_{name}
//   a = American  |  b = British
//   f = Female    |  m = Male
//
// American female:  af_heart ★  af_alloy  af_nova  af_sarah  af_sky  af_river
// American male:    am_adam     am_echo   am_fenrir am_michael am_puck
// British female:   bf_emma     bf_isabella bf_alice bf_lily
// British male:     bm_george ★ bm_lewis  bm_daniel bm_fable
//
// ★ recommended defaults
export const TTS_KOKORO_VOICE = "bm_daniel"; // British male — clear & natural

// Minimum donation amount (in main currency units, e.g. £) that triggers a TTS
// announcement. Donations below this threshold are shown in the Toast but spoken
// announcements are skipped. Set to 0 to speak all donations.
export const TTS_MIN_AMOUNT = 50;

// ── Toast notification settings ──────────────────────────────────────────────
// Set to false to disable the donor toast notification entirely
export const TOAST_ENABLED = true;
