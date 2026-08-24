/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        iris: {
          50: "#F1EEFE",
          100: "#E3DCFD",
          200: "#C7B9FB",
          300: "#A491F5",
          400: "#8A72EE",
          500: "#6C5CE7",
          600: "#5A46D6",
          700: "#4936B0",
          800: "#392A87",
          900: "#241E38",
        },
        tangerine: {
          100: "#FFE7D3",
          300: "#FFB27A",
          500: "#FF8C42",
          600: "#F5731F",
          700: "#C85A15",
        },
        meadow: {
          100: "#DCF7EE",
          300: "#8FE0C4",
          500: "#3DB88B",
          600: "#2C9C73",
          700: "#20805D",
        },
        blossom: {
          100: "#FEE3EE",
          300: "#FBA6CB",
          500: "#F45B93",
          600: "#DD3B78",
          700: "#B32A5F",
        },
        sky: {
          100: "#E1EEFF",
          300: "#93C0FF",
          500: "#4C9AFF",
          600: "#2E7BE0",
          700: "#1F5FB3",
        },
        ink: {
          DEFAULT: "#241E38",
          light: "#5B5470",
          faint: "#9691A8",
        },
        cream: "#F7F5FC",
      },
      fontFamily: {
        display: ["'Baloo 2'", "cursive"],
        body: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        "2.5xl": "1.375rem",
        "3.5xl": "1.75rem",
      },
      boxShadow: {
        glow: "0 8px 30px -8px rgba(108, 92, 231, 0.35)",
        "glow-tangerine": "0 8px 30px -8px rgba(255, 140, 66, 0.4)",
        "glow-meadow": "0 8px 30px -8px rgba(61, 184, 139, 0.4)",
        "glow-blossom": "0 8px 30px -8px rgba(244, 91, 147, 0.4)",
        soft: "0 2px 20px -4px rgba(36, 30, 56, 0.08)",
      },
      backgroundImage: {
        "mesh-cream":
          "radial-gradient(at 15% 0%, rgba(108,92,231,0.10) 0px, transparent 50%), radial-gradient(at 85% 15%, rgba(255,140,66,0.10) 0px, transparent 50%), radial-gradient(at 50% 100%, rgba(244,91,147,0.08) 0px, transparent 50%)",
        "sidebar-gradient": "linear-gradient(165deg, #6C5CE7 0%, #4936B0 55%, #392A87 100%)",
      },
    },
  },
  plugins: [],
};
