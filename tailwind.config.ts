import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Manrope", "system-ui", "sans-serif"],
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          deep: "hsl(var(--primary-deep))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
          active: "hsl(var(--sidebar-active))",
        },
        flame: {
          deep: "hsl(var(--flame-deep))",
          red: "hsl(var(--flame-red))",
          orange: "hsl(var(--flame-orange))",
          amber: "hsl(var(--flame-amber))",
          gold: "hsl(var(--flame-gold))",
          "red-tint": "hsl(var(--flame-red-tint))",
          "orange-tint": "hsl(var(--flame-orange-tint))",
          "amber-tint": "hsl(var(--flame-amber-tint))",
        },
        litmus: {
          dark: "hsl(var(--litmus-dark))",
          teal: "hsl(var(--litmus-teal))",
          emerald: "hsl(var(--litmus-emerald))",
          mint: "hsl(var(--litmus-mint))",
        },
        /** Consumer marketing — see :root in index.css */
        brand: {
          primary: "var(--brand-primary)",
          "text-from": "var(--brand-text-from)",
          "text-to": "var(--brand-text-to)",
          "card-from": "var(--brand-card-from)",
          "card-to": "var(--brand-card-to)",
          "card-deep": "var(--brand-card-deep)",
          action: "var(--brand-action)",
          "action-hover": "var(--brand-action-hover)",
        },
        status: {
          pending: "hsl(var(--status-pending))",
          "pending-bg": "hsl(var(--status-pending-bg))",
          approved: "hsl(var(--status-approved))",
          "approved-bg": "hsl(var(--status-approved-bg))",
          rejected: "hsl(var(--status-rejected))",
          "rejected-bg": "hsl(var(--status-rejected-bg))",
          completed: "hsl(var(--status-completed))",
          "completed-bg": "hsl(var(--status-completed-bg))",
          inprogress: "hsl(var(--status-inprogress))",
          "inprogress-bg": "hsl(var(--status-inprogress-bg))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        shimmer: "shimmer 1.5s infinite linear",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
