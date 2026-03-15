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
 * Fetches recent supporters from the Chuffed REST API.
 * Returns an array of supporter objects (newest first by id).
 */
export async function fetchSupporters() {
  const response = await fetch(
    `${SUPPORTERS_URL}?limit=20&offset=0&_t=${Date.now()}`,
    {
      cache: "no-store",
    },
  );
  const data = await response.json();
  if (data.data && data.data.length > 0) {
    return data.data.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }
  return [];
}
