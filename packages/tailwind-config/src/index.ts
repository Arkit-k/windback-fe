// Zed Light Mode Design Tokens
// Fonts: Cal Sans (display) + Inter (body) + Geist Mono (code)

export const zedTokens = {
  colors: {
    surface: {
      0: "#FAFAF9",
      1: "#FFFFFF",
      2: "#F5F5F4",
    },
    border: {
      DEFAULT: "#E7E5E4",
      subtle: "#F5F5F4",
    },
    text: {
      primary: "#1C1917",
      secondary: "#57534E",
      tertiary: "#A8A29E",
    },
    accent: {
      DEFAULT: "#084CCF",
      hover: "#063BA3",
      light: "#E9F0FB",
    },
  },
  fontFamily: {
    display: ["Cal Sans", "Inter", "sans-serif"],
    sans: ["Inter", "sans-serif"],
    mono: ["Geist Mono", "monospace"],
  },
} as const;
