import React, { useState, useEffect, useRef } from "react";
import "./App.scss";
import AnimatedNumber from "./components/AnimatedNumber";
import ConfettiAnimation from "./components/ConfettiAnimation";
import Toast from "./components/Toast";
import SparklyText from "./components/SparklyText";
import CedarSvg from "./assets/Cedar_tiles.svg";
import { fetchCampaign, fetchLatestSupporter } from "./api/chuffed";
import { FETCH_INTERVAL_MS, ACTIVE_THEME } from "./constants";
import { THEMES } from "./themes";

const SPARKLY_COLORS = [
  "#FF8000",
  "#FFE163",
  "#FEA5D9",
  "#0DC2F5",
  "#02F2A8",
  "#06EFA7",
  "#FEE062",
  "#FAA906",
];

// Apply theme CSS custom properties to :root before first render
const theme = THEMES[ACTIVE_THEME] ?? THEMES[1];
document.documentElement.style.setProperty(
  "--theme-flag-bar-left",
  theme.flagBarLeft,
);
document.documentElement.style.setProperty(
  "--theme-flag-bar-right",
  theme.flagBarRight,
);
document.documentElement.style.setProperty(
  "--theme-progress-bar-bg",
  theme.progressBarBg,
);
document.documentElement.style.setProperty(
  "--theme-amount-color",
  theme.amountColor,
);
document.documentElement.style.setProperty(
  "--theme-title-accent",
  theme.titleAccentColor,
);
document.documentElement.style.setProperty(
  "--theme-cedar-color",
  theme.cedarColor,
);
document.documentElement.style.setProperty(
  "--theme-toast-gradient",
  theme.toastGradient,
);
document.documentElement.style.setProperty(
  "--theme-toast-amount-color",
  theme.toastAmountColor,
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
  // Tracks last seen ID separately from toast state so closing the toast
  // doesn't cause the same supporter to re-appear on the next poll.
  const lastSupporterIdRef = useRef(null);

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
        const latest = await fetchLatestSupporter();
        if (!latest) return;

        if (latest.id !== lastSupporterIdRef.current) {
          lastSupporterIdRef.current = latest.id;
          setNewSupporter(latest);
        }
      } catch (err) {
        console.error("Supporters API Error:", err);
      }
    };

    loadCampaign();
    loadSupporters();

    const interval = setInterval(() => {
      loadCampaign();
      loadSupporters();
    }, FETCH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (amount === target && amount > 0) {
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

  const handleToastClose = () => {
    setNewSupporter(null);
  };

  return (
    <div className="app">
      <div className="card-wrapper">
        <Toast supporter={newSupporter} onClose={handleToastClose} />
        <div className="card">
          <div className="card__flag-bar card__flag-bar--left" />
          <div className="card__body">
            <div className="card__cedar">
              <div className="card__cedar-glow" />
              <img
                src={CedarSvg}
                className="card__cedar-icon"
                alt="Cedar tree"
              />
            </div>
            <div className="card__content">
              <SparklyText
                lines={["Do Not Worry", "Podcast Fundraiser"]}
                colors={SPARKLY_COLORS}
              />
              <ConfettiAnimation trigger={celebrationTrigger} />
              {loading ? (
                <p className="card__loading">Loading…</p>
              ) : (
                <div className="card__stats">
                  <div className="card__amount-row">
                    <span className="card__amount">
                      {currency}
                      <AnimatedNumber value={amount} />
                    </span>
                    <span className="card__raised-label">
                      raised of{" "}
                      <strong>
                        {currency}
                        {target.toLocaleString("en-US")}
                      </strong>
                    </span>
                  </div>
                  <div className="card__progress">
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${displayPercentage}%` }}
                      />
                    </div>
                    <div className="progress-labels">
                      <span>Started</span>
                      <span className="progress-labels__pct">
                        {Math.round(displayPercentage)}% Completed
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="card__flag-bar card__flag-bar--right" />
        </div>
      </div>
    </div>
  );
}

export default App;
