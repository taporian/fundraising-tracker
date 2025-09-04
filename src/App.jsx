import React, { useState, useEffect } from "react";
import "./App.scss";
import AnimatedNumber from "./components/AnimatedNumber";
import ConfettiAnimation from "./components/ConfettiAnimation";
import SparklyText from "./components/SparklyText";

function App() {
  const [celebrationTrigger, setCelebrationTrigger] = useState(false);
  const [amount, setAmount] = useState(0);
  const [target, setTarget] = useState(0);
  const [currency, setCurrency] = useState("£");
  const [percentage, setPercentage] = useState(0);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (amount === target && amount > 0) {
      setCelebrationTrigger(true);
      setTimeout(() => setCelebrationTrigger(false), 5000);
    }
  }, [amount, target]);

  return (
    <div className="app">
      <div className="card">
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
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
