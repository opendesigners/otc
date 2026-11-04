// Public, build-time site configuration. Values come from env at build time
// (allowlisted in vite.config.ts) so nothing about URLs, inboxes or social
// handles is hardcoded. Server secrets never pass through here.

import { facts } from "./facts";

function clean(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const env = __OTCF_PUBLIC_ENV__;

export type SocialLink = { label: string; url: string };

const socialEnv: Array<[label: string, key: string]> = [
  ["X", "OTCF_SOCIAL_X"],
  ["LinkedIn", "OTCF_SOCIAL_LINKEDIN"],
  ["Instagram", "OTCF_SOCIAL_INSTAGRAM"],
  ["GitHub", "OTCF_SOCIAL_GITHUB"],
  ["YouTube", "OTCF_SOCIAL_YOUTUBE"],
];

export const siteConfig = {
  name: "Open Tech Communities Foundation",
  shortName: "OTCF",
  url: (clean(env.SITE_URL) ?? "http://localhost:5173").replace(/\/$/, ""),
  contactEmail: clean(env.OTCF_CONTACT_EMAIL),
  social: socialEnv.flatMap(([label, key]): SocialLink[] => {
    const url = clean(env[key]);
    return url ? [{ label, url }] : [];
  }),
  // Placeholder monograms until final SVGs land. Swap files in /public/brand/.
  brand: {
    otcf: "/brand/otcf-mark.svg",
    communities: {
      "open-designers": "/brand/open-designers-mark.svg",
      "open-devs": "/brand/open-devs-mark.svg",
      "gdg-ilorin": "/brand/gdg-ilorin-mark.svg",
    } as Record<string, string>,
  },
  // Events are dated in Nigerian time regardless of where code runs.
  timeZone: "Africa/Lagos",
  facts,
} as const;
