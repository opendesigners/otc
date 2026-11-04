// Load .env.local / .env for Node-side scripts (Vite loads them for the app on
// its own). Values already in the environment win, as on Cloudflare builds.
export function loadLocalEnv(): void {
  for (const file of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(file);
    } catch {
      // Missing file is fine.
    }
  }
}
