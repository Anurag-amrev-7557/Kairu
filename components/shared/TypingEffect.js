"use client";

import { useState, useEffect } from "react";

const TypingEffect = ({ text, speed = 50, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!text) return;

    setDisplayedText("");
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i > text.length - 1) {
        clearInterval(intervalId);
        if (onComplete) {
          onComplete();
        }
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed, onComplete]);

  return <p>{displayedText}</p>;
};

export default TypingEffect;
