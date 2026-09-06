/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Primary — deep petrol teal, evoking an old account-book cloth binding.
        petrol: {
          50: "#EAF3F2",
          100: "#CFE4E2",
          200: "#A0C9C5",
          300: "#6FADA7",
          400: "#3F8F87",
          500: "#1F6F6B",
          600: "#195A57",
          700: "#144745",
          800: "#0F3736",
          900: "#0A2726",
        },
        // Pending — mustard/ochre, like a ledger tab or a rubber-stamp ink pad.
        ochre: {
          100: "#F6E7C6",
          300: "#E5BD68",
          500: "#C4922B",
          600: "#A97719",
          700: "#875E14",
        },
        // Paid / positive — muted sage green, kept distinct from the teal primary.
        meadow: {
          100: "#DEE9DA",
          300: "#A8C6A0",
          500: "#5C8A55",
          600: "#496F43",
          700: "#385735",
        },
        // Overdue / danger — oxblood, the colour of a register's cloth spine.
        oxblood: {
          100: "#EAD4D2",
          300: "#C48884",
          500: "#8E3A34",
          600: "#752E29",
          700: "#5C2420",
        },
        // Partial / informational — slate, cooler and quieter than the primary teal.
        slate: {
          100: "#E1E5E9",
          300: "#AAB4BE",
          500: "#5C6B7A",
          600: "#4A5763",
          700: "#3A4450",
        },
        ink: {
          DEFAULT: "#1E252B",
          light: "#57626B",
          faint: "#98A1A8",
        },
        paper: "#F4F1E7",
      },
      fontFamily: {
        display: ["'IBM Plex Sans'", "sans-serif"],
        body: ["'IBM Plex Sans'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      borderRadius: {
        "2.5xl": "1.1rem",
        "3.5xl": "1.35rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(30, 37, 43, 0.06), 0 1px 12px -4px rgba(30, 37, 43, 0.08)",
        lifted: "0 8px 24px -8px rgba(30, 37, 43, 0.18)",
      },
      backgroundImage: {
        "ledger-rule":
          "repeating-linear-gradient(transparent, transparent 27px, rgba(142,58,52,0.08) 27px, rgba(142,58,52,0.08) 28px)",
      },
    },
  },
  plugins: [],
};
