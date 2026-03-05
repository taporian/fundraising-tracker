/**
 * Theme definitions.
 * VITE_THEME=1 → Palestinian flag colours
 * VITE_THEME=2 → Lebanese flag colours
 *
 * Each theme supplies CSS custom property values applied to :root at startup.
 */
export const THEMES = {
  1: {
    name: "Palestinian",
    flagBarLeft: "#CE1126",
    flagBarRight: "#007A3D",
    progressBarBg: "linear-gradient(90deg, #CE1126 0%, #007A3D 100%)",
    amountColor: "#007A3D",
    titleAccentColor: "#CE1126",
    cedarColor: "#007A3D",
    toastGradient: "linear-gradient(135deg, #007A3D 0%, #CE1126 100%)",
    toastAmountColor: "#ffe163",
  },
  2: {
    name: "Lebanese",
    // Both bars red — Lebanese flag has red top & bottom stripes
    flagBarLeft: "#EE161F",
    flagBarRight: "#EE161F",
    // Red → cedar green — the two colours of the Lebanese flag
    progressBarBg: "linear-gradient(90deg, #EE161F 0%, #00A850 100%)",
    // #00A850 is the exact Lebanese flag cedar green
    amountColor: "#00A850",
    titleAccentColor: "#EE161F",
    cedarColor: "#00A850",
    // Toast: green → red mix, same palette as Palestinian flag bars
    toastGradient: "linear-gradient(135deg, #007A3D 0%, #CE1126 100%)",
    toastAmountColor: "#ffe163",
  },
};
