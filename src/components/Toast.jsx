import React, { useEffect, useState } from "react";
import "./Toast.scss";

const Toast = ({ supporter, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (supporter) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [supporter, onClose]);

  if (!supporter) return null;

  const displayName = supporter.is_anonymous ? "Anonymous" : supporter.name;
  const amount = `${supporter.currency_symbol}${supporter.amount}`;

  return (
    <div className={`toast ${isVisible ? "toast--visible" : ""}`}>
      <div className="toast__content">
        <div className="toast__details">
          <div className="toast__name">💚 {displayName}</div>
          <div className="toast__amount">{amount}</div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
