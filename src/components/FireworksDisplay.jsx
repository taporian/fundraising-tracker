import React, { useEffect, useRef } from "react";
import { Fireworks } from "fireworks-js";

export default function FireworksDisplay({ trigger }) {
  const containerRef = useRef(null);
  const fireworksRef = useRef(null);

  useEffect(() => {
    if (trigger && containerRef.current) {
      if (!fireworksRef.current) {
        fireworksRef.current = new Fireworks(containerRef.current, {
          rocketsPoint: {
            min: 0,
            max: 100, // wider spread
          },
          hue: { min: 0, max: 360 },
          delay: { min: 20, max: 40 }, // more time between launches
          speed: 2.5,
          acceleration: 1.08,
          friction: 0.92,
          gravity: 1.3,
          particles: 200,
          trace: 12,
          explosion: 100, // much wider and more intense explosions
          autoresize: true,
          brightness: { min: 70, max: 100 },
          flickering: true,
          boundaries: {
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight,
          },
        });
      }
      fireworksRef.current.start();
      setTimeout(() => {
        fireworksRef.current.stop();
      }, 5000); // Show fireworks for 5 seconds, let all shots finish
    }
  }, [trigger]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
