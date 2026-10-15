import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1280px" } },
    extend: {
      fontFamily: {
        sans: ['"Nunito"', '"Mali"', "system-ui", "sans-serif"],
        // Nunito thiếu ǎ ǐ ǒ ǔ (dấu ˇ); Baloo 2 hỏng dấu ngang ā ē → pinyin dùng Mali (đã kiểm tra hiển thị đủ)
        pinyin: ['"Mali"', '"Nunito"', "system-ui", "sans-serif"],
        han: ['"Noto Serif SC"', '"Songti SC"', '"SimSun"', "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
        candy: {
          pink: { DEFAULT: "hsl(var(--candy-pink))", foreground: "hsl(var(--candy-pink-foreground))" },
          yellow: { DEFAULT: "hsl(var(--candy-yellow))", foreground: "hsl(var(--candy-yellow-foreground))" },
          mint: { DEFAULT: "hsl(var(--candy-mint))", foreground: "hsl(var(--candy-mint-foreground))" },
          sky: { DEFAULT: "hsl(var(--candy-sky))", foreground: "hsl(var(--candy-sky-foreground))" },
          lilac: { DEFAULT: "hsl(var(--candy-lilac))", foreground: "hsl(var(--candy-lilac-foreground))" },
        },
        chart: {
          series: "hsl(var(--chart-series))",
          new: "hsl(var(--chart-new))",
          learning: "hsl(var(--chart-learning))",
          mature: "hsl(var(--chart-mature))",
        },
        tone: {
          1: "hsl(var(--tone-1))",
          2: "hsl(var(--tone-2))",
          3: "hsl(var(--tone-3))",
          4: "hsl(var(--tone-4))",
          5: "hsl(var(--tone-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [animate],
} satisfies Config;
