import React, { useState, useEffect } from "react";
import "./AnimatedNumber.scss";

export default function AnimatedNumber({ value, duration = 800 }) {
  const formattedValue = value.toLocaleString();
  const digits = formattedValue.split("");

  return (
    <span className="animated-number">
      {digits.map((char, index) => (
        <span key={index} className="digit-container">
          {char === "," ? (
            <span className="comma">,</span>
          ) : (
            <RollingDigit digit={parseInt(char)} duration={duration} />
          )}
        </span>
      ))}
    </span>
  );
}

function RollingDigit({ digit, duration }) {
  const [displayDigit, setDisplayDigit] = useState(digit);

  useEffect(() => {
    setDisplayDigit(digit);
  }, [digit]);

  return (
    <span className="digit-roller">
      <span
        className="digit-strip"
        style={{
          transform: `translateY(-${displayDigit * 1.2}em)`,
          transitionDuration: `${duration}ms`,
          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(
          (num, index) => (
            <span key={index} className="digit">
              {num}
            </span>
          )
        )}
      </span>
    </span>
  );
}
