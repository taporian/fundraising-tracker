import React from "react";
import { motion } from "framer-motion"; // eslint-disable-line
import "./SparklyText.scss";

export default function SparklyText({ lines, colors }) {
  return (
    <motion.div
      className="sparkly-text"
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {lines.map((line, lineIndex) => {
        let colorIndex = 0;
        return (
          <div key={lineIndex} className="sparkly-line">
            {Array.from(line).map((char, i) => {
              if (char === " ")
                return (
                  <span key={i} className="space">
                    {" "}
                  </span>
                );

              const currentColor = colors[colorIndex % colors.length];
              colorIndex++;

              return (
                <span
                  key={i}
                  className="sparkly-letter"
                  style={{
                    color: currentColor,
                    textShadow: `0 0 10px ${currentColor}`,
                  }}
                >
                  {char}
                </span>
              );
            })}
          </div>
        );
      })}
    </motion.div>
  );
}
