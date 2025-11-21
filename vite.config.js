import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "./index.js"),
      name: "axiom-api",
      formats: ["es", "cjs"],
      fileName: (format) => `${format}/index.js`,
    },
  },
});