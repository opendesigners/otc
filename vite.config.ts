import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { buildContent } from "./scripts/build-content.ts";

// Build-time values pages may print. Allowlisted so secrets that live in the
// same .env (ANTHROPIC_API_KEY) can never reach a client bundle.
const PUBLIC_ENV_KEYS = [
  "SITE_URL",
  "OTCF_CONTACT_EMAIL",
  "OTCF_SOCIAL_X",
  "OTCF_SOCIAL_LINKEDIN",
  "OTCF_SOCIAL_INSTAGRAM",
  "OTCF_SOCIAL_GITHUB",
  "OTCF_SOCIAL_YOUTUBE",
];

// Dev only: rebuild src/generated/content.json (drafts included) whenever a
// file under /content changes, then reload the page.
function contentWatcher(): Plugin {
  const dir = path.resolve("content");
  return {
    name: "otcf-content-watcher",
    apply: "serve",
    configureServer(server) {
      server.watcher.add(dir);
      const rebuild = (file: string) => {
        if (!file.startsWith(dir)) return;
        try {
          buildContent({ drafts: true });
          server.ws.send({ type: "full-reload" });
        } catch (error) {
          server.config.logger.error(`[content] ${(error as Error).message}`);
        }
      };
      server.watcher.on("add", rebuild).on("change", rebuild).on("unlink", rebuild);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const publicEnv = Object.fromEntries(PUBLIC_ENV_KEYS.map((key) => [key, env[key] ?? ""]));

  return {
    plugins: [tailwindcss(), reactRouter(), contentWatcher()],
    define: { __OTCF_PUBLIC_ENV__: JSON.stringify(publicEnv) },
    resolve: { tsconfigPaths: true },
    server: {
      // The Hono API runs as its own process in dev (server/node.ts or `wrangler dev`).
      proxy: { "/api": `http://localhost:${env.OTCF_API_PORT || "8787"}` },
    },
  };
});
