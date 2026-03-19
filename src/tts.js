/**
 * Neural TTS powered by kokoro-js (Kokoro-82M model).
 *
 * - The model (~80 MB, q4 quantized) is downloaded from Hugging Face on first
 *   use and cached by the browser indefinitely – subsequent loads are instant.
 * - While the model is downloading, speech falls back to the browser's built-in
 *   Web Speech API so no donation announcements are ever missed.
 * - Call initTts() inside a user-gesture handler to create the AudioContext and
 *   kick off the background model download.
 */
import { KokoroTTS } from "kokoro-js";
import { TTS_ENABLED, TTS_KOKORO_VOICE, TTS_VOICE } from "./constants.js";

let engine = null;
let audioCtx = null;
let activeSource = null;
let lastLoggedPct = -1;

/**
 * Must be called once inside a user-gesture handler (click / keydown / touch).
 * @param {(pct: number|null) => void} [onProgress] Called with 0-100 while
 *   downloading, then null when the model is ready (or failed).
 */
export function initTts(onProgress) {
  // AudioContext must be created / resumed inside a user gesture
  if (!audioCtx) {
    audioCtx = new AudioContext();
  } else if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  // Prime Web Speech API (used as fallback while Kokoro loads)
  if (window.speechSynthesis) {
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
  }

  // Start downloading the Kokoro model in the background (only once)
  if (!engine) {
    console.log("[Kokoro TTS] Downloading model (first run only, ~80 MB)…");
    lastLoggedPct = -1;
    KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", {
      dtype: "q4", // ~80 MB – best balance of size, speed, and quality
      device: "wasm", // single-threaded WASM; works without COOP/COEP headers
      progress_callback: ({ status, progress }) => {
        if (status === "progress" && progress != null) {
          const pct = Math.round(progress);
          onProgress?.(pct);
          // Only log at every 10% boundary to avoid console spam
          if (pct >= lastLoggedPct + 10) {
            lastLoggedPct = Math.floor(pct / 10) * 10;
            console.log(`[Kokoro TTS] Downloading… ${lastLoggedPct}%`);
          }
        }
      },
    })
      .then((tts) => {
        engine = tts;
        onProgress?.(null); // signal: ready
        console.log("[Kokoro TTS] Model ready ✓");
      })
      .catch((err) => {
        onProgress?.(null); // signal: done (failed)
        console.warn("[Kokoro TTS] Failed to load model, using Web Speech API:", err);
      });
  }
}

/**
 * Speak `text` using Kokoro neural TTS, falling back to Web Speech API if the
 * model is not yet loaded.
 * @param {string} text
 */
export function speak(text) {
  if (!TTS_ENABLED) return;

  if (!engine) {
    // Kokoro not ready yet – use Web Speech API immediately
    _webSpeechFallback(text);
    return;
  }

  // Cancel any in-flight playback before starting new speech
  if (activeSource) {
    try {
      activeSource.stop();
    // eslint-disable-next-line no-unused-vars
    } catch (e) { /* ignore if already stopped */ }
    activeSource = null;
  }

  engine
    .generate(text, { voice: TTS_KOKORO_VOICE })
    .then((audio) => {
      if (!audioCtx || audioCtx.state === "closed") {
        audioCtx = new AudioContext();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const buffer = audioCtx.createBuffer(
        1,
        audio.audio.length,
        audio.sampling_rate,
      );
      buffer.getChannelData(0).set(audio.audio);

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      activeSource = source;
      source.onended = () => {
        activeSource = null;
      };
      source.start();
    })
    .catch((err) => {
      console.error("[Kokoro TTS] Generation error, falling back:", err);
      _webSpeechFallback(text);
    });
}

function _webSpeechFallback(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const preferred =
    voices.find((v) => v.name === TTS_VOICE) ||
    voices.find((v) => v.lang === "en-GB") ||
    voices.find((v) => v.lang.startsWith("en"));
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}
