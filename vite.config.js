import { defineConfig, loadEnv } from "vite";
import path from "path";
import fs from "fs";

export default ({ mode }) => {

  const srcEntry = path.resolve(__dirname, "./src/index.js");
  const env = loadEnv(mode, process.cwd())
  const apiUrl = env.VITE_API_URL ?? "https://lar.axiom.ai";

  const configPath = path.resolve(__dirname, "./src/config.js");
  fs.writeFileSync(configPath, `export const ENDPOINT = "${apiUrl}";\n`);

  return defineConfig({
    build: {
      lib: {
        entry: srcEntry,
        name: "axiom-api",
        formats: ["es", "cjs"],
        fileName: (format) => `${format}/index.js`,
      }
    }
  })

}