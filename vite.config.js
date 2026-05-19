import { defineConfig, loadEnv } from "vite";
import path from "path";
import fs from "fs";

export default ({ mode }) => {

  const srcEntry = path.resolve(__dirname, "./src/index.js");
  const env = loadEnv(mode, process.cwd())

  // Only override the committed src/config.js when VITE_API_URL is explicitly
  // set. On a default build, leave the committed file alone so the working
  // tree stays clean and source checkouts can run tests without a build step.
  if (env.VITE_API_URL) {
    const configPath = path.resolve(__dirname, "./src/config.js");
    fs.writeFileSync(configPath, `export const ENDPOINT = "${env.VITE_API_URL}";\n`);
  }

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