import { defineConfig } from "vite";
import path from "path";

const srcEntry = path.resolve(__dirname, "./src/index.js");

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "./src/index.js"),
      name: "axiom-api",
      formats: ["es", "cjs"],
      fileName: (format) => `${format}/index.js`,
    }
  }
});