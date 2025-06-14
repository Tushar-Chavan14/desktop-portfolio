import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#c6a0f6",
        secondary: "#181926",

        "mocha-base": "#1e1e2e",
        "mocha-mantle": "#181825",
        "mocha-crust": "#11111b",
        "mocha-surface0": "#313244",
        "mocha-surface1": "#45475a",
        "mocha-surface2": "#585b70",
        "mocha-overlay0": "#6c7086",
        "mocha-overlay1": "#7f849c",
        "mocha-overlay2": "#9399b2",
        "mocha-subtext0": "#a6adc8",
        "mocha-subtext1": "#bac2de",
        // 🖋️ Foreground / Text
        "mocha-text": "#cdd6f4",
        // 🎨 Accent Colors
        "mocha-rosewater": "#f5e0dc",
        "mocha-flamingo": "#f2cdcd",
        "mocha-pink": "#f5c2e7",
        "mocha-mauve": "#cba6f7",
        "mocha-red": "#f38ba8",
        "mocha-maroon": "#eba0ac",
        "mocha-peach": "#fab387",
        "mocha-yellow": "#f9e2af",
        "mocha-green": "#a6e3a1",
        "mocha-teal": "#94e2d5",
        "mocha-sky": "#89dceb",
        "mocha-sapphire": "#74c7ec",
        "mocha-blue": "#89b4fa",
        "mocha-lavender": "#b4befe",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        planet: "url('/planet.jpg')",
      },
    },
  },
  plugins: [],
};
export default config;
