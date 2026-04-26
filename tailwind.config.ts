import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Race brand colors
        "race-yellow": "#FFD700",
        "race-black": "#1A1A1A",
        "race-white": "#FFFFFF",
        "strava-orange": "#FC4C02",
      },
      fontSize: {
        // Editorial scale
        "display-xl": ["4rem", { lineHeight: "1.05", fontWeight: "900" }],
        "display-lg": ["2.5rem", { lineHeight: "1.1", fontWeight: "800" }],
        "display-md": ["1.75rem", { lineHeight: "1.15", fontWeight: "700" }],
        "editorial-sm": ["0.875rem", { lineHeight: "1.5", fontWeight: "500", letterSpacing: "0.05em" }],
      },
      // Team color utilities are applied via inline styles (dynamic values)
    },
  },
  plugins: [],
  safelist: [
    // Stage type badges
    "bg-race-yellow",
    "text-race-black",
    "bg-race-black",
    "text-race-white",
  ],
};
export default config;
