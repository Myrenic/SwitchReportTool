"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: {
    light: {
      palette: {
        mode: "light",
        background: {
          default: "#F9F9FE", // Clean, professional white
          paper: "#FFFFFF",
        },
        primary: {
          main: "rgb(249, 79, 79)", // Warm, vibrant golden-yellow
        },
        secondary: {
          main: "rgb(231, 236, 76)", // Strong corporate red
        },
        text: {
          primary: "#191919",
          secondary: "#444444",
        },
      },
    },
    dark: {
      palette: {
        mode: "dark",
        background: {
          default: "#191919", // True dark mode
          paper: "#232323", // Slightly lighter for contrast
        },
        primary: {
          main: "#8D50EF", // Rich purple, vibrant but professional
        },
        secondary: {
          main: "#D05353", // Consistent corporate red
        },
        text: {
          primary: "#F9F9FE",
          secondary: "#BBBBBB",
        },
      },
    },
  },
});

export default theme;
