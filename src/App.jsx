import React, { useState, useEffect } from "react";
import "./App.scss";
import AnimatedNumber from "./components/AnimatedNumber";
import ConfettiAnimation from "./components/ConfettiAnimation";
import SparklyText from "./components/SparklyText";
import Toast from "./components/Toast";

function App() {
  const [celebrationTrigger, setCelebrationTrigger] = useState(false);
  const [amount, setAmount] = useState(0);
  const [target, setTarget] = useState(0);
  const [currency, setCurrency] = useState("£");
  const [percentage, setPercentage] = useState(0);
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [, setLastSupporterId] = useState(null);
  const [newSupporter, setNewSupporter] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://chuffed.org/api/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify([
            {
              operationName: "getCampaign",
              variables: { id: 147526 },
              query: `
                query getCampaign($id: ID!) {
                  campaign(id: $id) {
                    collected { amount }
                    target { amount currency currencyNode { symbol } }
                  }
                }
              `,
            },
          ]),
        });
        const data = await response.json();
        const rawCollected = Number(data[0].data.campaign.collected.amount);
        const collectedAmount = Math.floor(rawCollected / 100);
        const targetAmount = Math.floor(
          Number(data[0].data.campaign.target.amount) / 100
        );
        const curr = data[0].data.campaign.target.currencyNode.symbol;
        setAmount(collectedAmount);
        setTarget(targetAmount);
        setCurrency(curr);
        setPercentage(Math.min((collectedAmount / targetAmount) * 100, 100));
        setLoading(false);
      } catch (err) {
        console.error("API Error:", err);
      }
    };

    const fetchSupporters = async () => {
      try {
        const response = await fetch(
          "https://chuffed.org/api/v2/campaigns/147526/supporters?limit=20&offset=0"
        );
        const data = await response.json();

        if (data.data && data.data.length > 0) {
          const latestSupporter = data.data[0];

          // Check if this is a new supporter (different ID from last time)
          setLastSupporterId((prevId) => {
            if (prevId !== null && latestSupporter.id !== prevId) {
              setNewSupporter(latestSupporter);
            }
            return latestSupporter.id;
          });
        }
      } catch (err) {
        console.error("Supporters API Error:", err);
      }
    };

    fetchData();
    fetchSupporters();
    const interval = setInterval(() => {
      fetchData();
      fetchSupporters();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (amount === target && amount > 0) {
      setCelebrationTrigger(true);
      setTimeout(() => setCelebrationTrigger(false), 5000);
    }
  }, [amount, target]);

  // Animate progress bar fill
  useEffect(() => {
    if (percentage > 0) {
      const duration = 2000; // 2 seconds
      const startTime = Date.now();
      const startPercentage = displayPercentage;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentPercentage =
          startPercentage + (percentage - startPercentage) * easeOut;

        setDisplayPercentage(currentPercentage);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [percentage, displayPercentage]);

  // Animate progress bar fill
  useEffect(() => {
    if (percentage > 0) {
      const duration = 2000; // 2 seconds
      const startTime = Date.now();
      const startPercentage = displayPercentage;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentPercentage =
          startPercentage + (percentage - startPercentage) * easeOut;

        setDisplayPercentage(currentPercentage);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [percentage, displayPercentage]);

  const handleToastClose = () => {
    setNewSupporter(null);
  };

  const testToast = () => {
    setNewSupporter({
      id: 999999,
      amount: 25,
      name: "Test User",
      is_anonymous: false,
      currency_symbol: "£",
    });
  };

  return (
    <div className="app">
      <div className="card">
        <Toast supporter={newSupporter} onClose={handleToastClose} />
        <h1 className="dnpf-heading">
          <SparklyText
            lines={["Do Not Worry", "Podcast Fundraiser"]}
            colors={[
              "#ff8000",
              "#ffe163",
              "#fea5d9",
              "#0dc2f5",
              "#02f2a8",
              "#06efa7",
              "#fee062",
              "#faa906",
              "#fe8002",
            ]}
          />
        </h1>
        <ConfettiAnimation trigger={celebrationTrigger} />
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="main-amount">
              <span className="currency-large">{currency}</span>
              <AnimatedNumber value={amount} />
            </div>
            <p className="raised-of-target">
              Raised of{" "}
              <span className="target-amount">
                {currency}
                <AnimatedNumber value={target} />
              </span>
            </p>
            <div className="progress">
              <div
                className="progress-bar"
                style={{ width: `${displayPercentage}%` }}
              ></div>
            </div>
            {/* <button
              onClick={testToast}
              style={{
                marginTop: "1rem",
                padding: "0.5rem 1rem",
                background: "#007a3d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Test Toast
            </button> */}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
