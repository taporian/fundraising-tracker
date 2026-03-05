export const CAMPAIGN_ID = 147526;

export const GRAPHQL_URL = "https://chuffed.org/api/graphql";
export const SUPPORTERS_URL = `https://chuffed.org/api/v2/campaigns/${CAMPAIGN_ID}/supporters`;

// How often (in milliseconds) both API calls are re-fired to keep data fresh
export const FETCH_INTERVAL_MS = 5000;

// Read from .env — set VITE_THEME=1 (Palestinian) or VITE_THEME=2 (Lebanese)
export const ACTIVE_THEME = Number(import.meta.env.VITE_THEME ?? 1);
