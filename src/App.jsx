import { useEffect, useState } from "react";
import "./App.scss";

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
      const collectedAmount = Math.floor(
        Number(data[0].data.campaign.collected.amount) / 100
      );
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
      console.error(err);
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
            <p>
              Collected:{" "}
              <span className="collected">
                {currency}
                {amount.toLocaleString()}
              </span>
            </p>
            <p>
              Target:{" "}
              <span className="target">
                {currency}
                {target.toLocaleString()}
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
