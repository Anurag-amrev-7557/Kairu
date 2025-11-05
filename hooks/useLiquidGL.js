import { useEffect } from "react";

export default function useLiquidGL() {
  useEffect(() => {
    // Wait for liquidGL to be available and DOM to be ready
    if (typeof window !== "undefined" && window.liquidGL) {
      // Small delay to ensure all DOM elements are rendered
      const timer = setTimeout(() => {
        // Initialize glass effect on stat cards
        window.liquidGL({
          target: ".glass-stat-card",
          snapshot: "body",
          resolution: 2.5,
          refraction: 0.026,
          bevelDepth: 0.119,
          bevelWidth: 0.057,
          frost: 0,
          magnify: 1,
          shadow: true,
          specular: true,
          tilt: true,
          tiltFactor: 5,
          reveal: "fade",
        });

        // Initialize glass effect on chart cards
        window.liquidGL({
          target: ".glass-chart-card",
          snapshot: "body",
          resolution: 2.5,
          refraction: 0.026,
          bevelDepth: 0.119,
          bevelWidth: 0.057,
          frost: 0,
          magnify: 1,
          shadow: true,
          specular: true,
          tilt: true,
          tiltFactor: 5,
          reveal: "fade",
        });

        // Initialize glass effect on AI insights card
        window.liquidGL({
          target: ".glass-ai-card",
          snapshot: "body",
          resolution: 2.5,
          refraction: 0.026,
          bevelDepth: 0.119,
          bevelWidth: 0.057,
          frost: 0,
          magnify: 1,
          shadow: true,
          specular: true,
          tilt: true,
          tiltFactor: 5,
          reveal: "fade",
        });

        // Initialize glass effect on onboarding steps
        window.liquidGL({
          target: ".glass-onboarding",
          snapshot: "body",
          resolution: 2.5,
          refraction: 0.026,
          bevelDepth: 0.119,
          bevelWidth: 0.057,
          frost: 0,
          magnify: 1,
          shadow: true,
          specular: true,
          tilt: true,
          tiltFactor: 5,
          reveal: "fade",
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);
}
