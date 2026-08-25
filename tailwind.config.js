/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0b1120",
        darkCard: "#0f172a",
        darkBorder: "#1e293b",
        neonCyan: "#00f2fe",
        neonBlue: "#4facfe",
      },
      fontFamily: {
        lao: ["Phetsarath OT", "Noto Sans Lao", "sans-serif"],
      },
      animation: {
        "rainbow-glow": "rainbowBorder 10s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        rainbowBorder: {
          "0%, 100%": { borderColor: "#ff007f", boxShadow: "0 0 15px #ff007f" },
          "20%": { borderColor: "#00f2fe", boxShadow: "0 0 15px #00f2fe" },
          "40%": { borderColor: "#00ff88", boxShadow: "0 0 15px #00ff88" },
          "60%": { borderColor: "#ffea00", boxShadow: "0 0 15px #ffea00" },
          "80%": { borderColor: "#9d4edd", boxShadow: "0 0 15px #9d4edd" },
        },
      },
    },
  },
  plugins: [],
};
