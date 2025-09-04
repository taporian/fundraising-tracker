import React, { useState, useEffect } from "react";
import "./App.scss";
import AnimatedNumber from "./components/AnimatedNumber";

function App() {
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

  return (
    <div className="app">
      <div className="card">
        <h1>Do Not Worry Podcast Fundraiser</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <p className="amounts center">
              Collected:
              <span className="collected large">
                <span className="currency">{currency}</span>
                <AnimatedNumber value={amount} />
              </span>
            </p>

            <p className="amounts center">
              Target:
              <span className="target large">
                <span className="currency">{currency}</span>
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
