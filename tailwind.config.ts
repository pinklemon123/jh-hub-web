import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fbf5f6",
          100: "#f2e3e6",
          500: "#8B2E3A",
          600: "#6E1F28",
          700: "#541820"
        },
        ink: "#1A1A1A",
        paper: "#F5F5F5",
        line: "#E7E2E1"
      },
      boxShadow: {
        subtle: "0 12px 36px rgba(26, 26, 26, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
