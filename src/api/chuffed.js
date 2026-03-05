import { GRAPHQL_URL, SUPPORTERS_URL, CAMPAIGN_ID } from "../constants";

/**
 * Fetches live campaign totals from the Chuffed GraphQL API.
 * Returns { collectedAmount, targetAmount, currency }
 */
export async function fetchCampaign() {
  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify([
      {
        operationName: "getCampaign",
        variables: { id: CAMPAIGN_ID },
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
    Number(data[0].data.campaign.target.amount) / 100,
  );
  const currency = data[0].data.campaign.target.currencyNode.symbol;
  return { collectedAmount, targetAmount, currency };
}

/**
 * Fetches the most recent supporter from the Chuffed REST API.
 * Returns the latest supporter object, or null if none found.
 */
export async function fetchLatestSupporter() {
  const response = await fetch(`${SUPPORTERS_URL}?limit=20&offset=0`);
  const data = await response.json();
  if (data.data && data.data.length > 0) {
    return data.data[0];
  }
  return null;
}
