import React, { useState } from "react";
import confetti from "canvas-confetti";
import FireworksDisplay from "./FireworksDisplay";

// const celebrationSound = "/celebration.mp3"; // Place your sound file in public/

export default function ConfettiButton() {
  const [fireworksTrigger, setFireworksTrigger] = useState(false);
  const handleClick = () => {
    // Play sound
    // const audio = new window.Audio(celebrationSound);
    // audio.play();
    // Confetti bursts (wider and more particles)
    confetti({
      particleCount: 1000,
      angle: 60,
      spread: 120,
      origin: { x: 0, y: 1 },
      startVelocity: 55,
      ticks: 5000, // longer duration
    });
    confetti({
      particleCount: 1000,
      angle: 120,
      spread: 120,
      origin: { x: 1, y: 1 },
      startVelocity: 55,
      ticks: 5000, // longer duration
    });
    setFireworksTrigger(true);
    setTimeout(() => setFireworksTrigger(false), 2200); // Reset trigger after fireworks
  };

  return (
    <>
      <FireworksDisplay trigger={fireworksTrigger} />
      <button
        style={{
          margin: "16px auto",
          display: "block",
          background: "#ffc107",
          color: "#222",
          fontWeight: 700,
          fontSize: "1.1rem",
          border: "none",
          borderRadius: "6px",
          padding: "10px 24px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        }}
        onClick={handleClick}
      >
        🎉 Celebrate!
      </button>
    </>
  );
}
