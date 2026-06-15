import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 18px 60px rgba(16, 24, 40, 0.10)",
      },
      colors: {
        ink: "#151922",
      },
    },
  },
  plugins: [],
} satisfies Config;
