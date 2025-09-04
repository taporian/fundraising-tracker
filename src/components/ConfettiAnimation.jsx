import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import FireworksDisplay from "./FireworksDisplay";

// const celebrationSound = "/celebration.mp3"; // Place your sound file in public/

export default function ConfettiAnimation({ trigger }) {
  const [fireworksTrigger, setFireworksTrigger] = useState(false);

  useEffect(() => {
    if (trigger) {
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
      setTimeout(() => setFireworksTrigger(false), 5000); // Reset trigger after fireworks
    }
  }, [trigger]);

  return (
    <>
      <FireworksDisplay trigger={fireworksTrigger} />
    </>
  );
}
