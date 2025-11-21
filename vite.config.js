import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "./src/axiom-api.js"),
      name: "axiom-api",
      formats: ["es", "cjs"],
      fileName: (format) => `axiom-api.${format}.js`,
    },
  },
});