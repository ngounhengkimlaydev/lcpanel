export default defineAppConfig({
  ui: {
    colors: {
      primary: "green",
      neutral: "zinc",
    },
    strategy: "override", // important (force override default UI)
    theme: {
      font: {
        sans: "Kantumruy Pro, sans-serif",
      },
    },
  },
});
