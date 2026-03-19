import React, { useState, useEffect, useRef, useCallback } from "react";
import "./App.scss";
import AnimatedNumber from "./components/AnimatedNumber";
import ConfettiAnimation from "./components/ConfettiAnimation";
import Toast from "./components/Toast";
import DnwLogo from "./assets/dnw-logo.png";
import { fetchCampaign, fetchSupporters } from "./api/chuffed";
import {
  FETCH_INTERVAL_MS,
  TTS_ENABLED,
  TTS_MIN_AMOUNT,
  TOAST_ENABLED,
} from "./constants";
import { speak, initTts } from "./tts";

// Variation 4 colour palette — toast notification colours
document.documentElement.style.setProperty(
  "--theme-toast-gradient",
  "linear-gradient(135deg, #FF6B9D 0%, #66CCFF 100%)",
);
document.documentElement.style.setProperty(
  "--theme-toast-amount-color",
  "#4ade80",
);

function App() {
  const [celebrationTrigger, setCelebrationTrigger] = useState(false);
  const [amount, setAmount] = useState(0);
  const [target, setTarget] = useState(0);
  const [currency, setCurrency] = useState("£");
  const [percentage, setPercentage] = useState(0);
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newSupporter, setNewSupporter] = useState(null);
  const [soundUnlocked, setSoundUnlocked] = useState(false);
  const seenSupporterIdsRef = useRef(null); // null = first load not done yet
  const soundUnlockedRef = useRef(false);
  const pendingTtsRef = useRef(null);
  const celebratedTargetRef = useRef(null); // the target value we already fired confetti for

  useEffect(() => {
    const loadCampaign = async () => {
      try {
        const { collectedAmount, targetAmount, currency } =
          await fetchCampaign();
        setAmount(collectedAmount);
        setTarget(targetAmount);
        setCurrency(currency);
        setPercentage(Math.min((collectedAmount / targetAmount) * 100, 100));
        setLoading(false);
      } catch (err) {
        console.error("Campaign API Error:", err);
      }
    };

    const loadSupporters = async () => {
      try {
        const supporters = await fetchSupporters();
        if (!supporters.length) return;

        // First load: show the most recent donor toast, then seed the Set with
        // all visible keys so only genuinely new donations trigger on future polls
        if (seenSupporterIdsRef.current === null) {
          seenSupporterIdsRef.current = new Set(
            supporters.map((s) => s.created_at),
          );
          const latest = supporters[0];
          setNewSupporter(latest);
          const name = latest.is_anonymous ? "Anonymous" : latest.name;
          const text = `${name} just donated ${latest.currency_symbol}${latest.amount}!`;
          if (Number(latest.amount) >= TTS_MIN_AMOUNT) {
            if (soundUnlockedRef.current) {
              speakTts(text);
            } else {
              pendingTtsRef.current = text;
            }
          }
          return;
        }

        // Find genuinely new supporters (IDs not seen before)
        const newSupporters = supporters.filter(
          (s) => !seenSupporterIdsRef.current.has(s.created_at),
        );

        if (newSupporters.length === 0) return;

        // Mark all new IDs as seen
        newSupporters.forEach((s) =>
          seenSupporterIdsRef.current.add(s.created_at),
        );

        // Show the newest new donation as the toast + TTS
        const latest = newSupporters[0];
        setNewSupporter(latest);

        const name = latest.is_anonymous ? "Anonymous" : latest.name;
        const text = `${name} just donated ${latest.currency_symbol}${latest.amount}!`;
        if (Number(latest.amount) >= TTS_MIN_AMOUNT) {
          if (soundUnlockedRef.current) {
            speakTts(text);
          } else {
            pendingTtsRef.current = text;
          }
        }
      } catch (err) {
        console.error("Supporters API Error:", err);
      }
    };

    loadCampaign();
    loadSupporters();

    // Auto-unlock speech on first interaction (browser autoplay policy).
    // touchstart is required for iOS Safari, which may not fire click reliably.
    const unlock = () => {
      if (soundUnlockedRef.current) return;
      soundUnlockedRef.current = true;
      initTts(); // creates AudioContext, primes Web Speech, starts Kokoro download
      if (pendingTtsRef.current) {
        const text = pendingTtsRef.current;
        pendingTtsRef.current = null;
        setTimeout(() => speakTts(text), 200);
      }
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("touchstart", unlock);
    };
    document.addEventListener("click", unlock);
    document.addEventListener("keydown", unlock);
    document.addEventListener("touchstart", unlock);

    const interval = setInterval(() => {
      loadCampaign();
      loadSupporters();
    }, FETCH_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (
      amount > 0 &&
      target > 0 &&
      amount >= target &&
      celebratedTargetRef.current !== target
    ) {
      celebratedTargetRef.current = target;
      setCelebrationTrigger(true);
      setTimeout(() => setCelebrationTrigger(false), 5000);
    }
  }, [amount, target]);

  useEffect(() => {
    if (percentage > 0) {
      const duration = 2000;
      const startTime = Date.now();
      const startPercentage = displayPercentage;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        setDisplayPercentage(
          startPercentage + (percentage - startPercentage) * easeOut,
        );
        if (progress < 1) requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [percentage]);

  const speakTts = (text) => {
    speak(text);
  };

  const handleToastClose = useCallback(() => {
    setNewSupporter(null);
  }, []);

  const handleUnlockSound = () => {
    soundUnlockedRef.current = true;
    setSoundUnlocked(true); // hide the button immediately
    initTts(); // download Kokoro silently; speak() switches over automatically when ready
    if (pendingTtsRef.current) {
      const text = pendingTtsRef.current;
      pendingTtsRef.current = null;
      setTimeout(() => speakTts(text), 200);
    }
  };

  return (
    <div className="app">
      {!soundUnlocked && TTS_ENABLED && (
        <button
          onClick={handleUnlockSound}
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "12px",
            padding: "14px 24px",
            cursor: "pointer",
            fontSize: "15px",
            fontFamily: "inherit",
            letterSpacing: "0.02em",
          }}
        >
          🔊 Click to enable donation sounds
        </button>
      )}
      <div className="card-wrapper">
        {TOAST_ENABLED && (
          <Toast supporter={newSupporter} onClose={handleToastClose} />
        )}
        <ConfettiAnimation trigger={celebrationTrigger} />
        {import.meta.env.DEV && !loading && (
          <button
            onClick={() => {
              setAmount((prev) => prev + 500);
              setPercentage((prev) =>
                Math.min(prev + (500 / target) * 100, 100),
              );
            }}
            style={{
              position: "absolute",
              bottom: "-2.5rem",
              right: 0,
              fontSize: "11px",
              padding: "4px 10px",
              background: "#ff6b9d33",
              color: "#ff6b9d",
              border: "1px solid #ff6b9d66",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            +£500 (dev)
          </button>
        )}
        <div className="card">
          <div className="card__logo">
            <img src={DnwLogo} className="card__logo-img" alt="DNW Logo" />
          </div>
          <div className="card__content">
            <div className="card__header-row">
              <h3 className="card__title">DNW Fundraiser</h3>
              {!loading && (
                <div className="card__amount">
                  {currency}
                  <AnimatedNumber value={amount} />
                </div>
              )}
            </div>
            {loading ? (
              <p className="card__loading">Loading…</p>
            ) : (
              <>
                <div className="card__progress">
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${displayPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="card__meta-row">
                  <span className="card__meta-left">
                    {Math.round(displayPercentage)}% &bull; {currency}
                    {target.toLocaleString("en-US")} Goal
                  </span>
                  <span className="card__meta-right">Active</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
