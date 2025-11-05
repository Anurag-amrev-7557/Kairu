// File: lib/useIsMac.js

import { useState, useEffect } from "react";

export const useIsMac = () => {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    // This check ensures the code only runs in the browser
    if (typeof window !== "undefined") {
      setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform));
    }
  }, []);

  return isMac;
};
