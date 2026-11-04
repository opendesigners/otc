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
export type BrandMark = { src: string; invertInDark: boolean };

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
  // Logo files live in /public/brand/. `invertInDark` flips single-colour black
  // marks so they stay visible in dark mode; leave it off for colour logos.
  // OTCF and Open Devs are still placeholder monograms.
  brand: {
    otcf: { src: "/brand/otcf-mark.svg", invertInDark: true },
    communities: {
      "open-designers": { src: "/brand/open-designers-mark.svg", invertInDark: true },
      "open-devs": { src: "/brand/open-devs-mark.svg", invertInDark: true },
      "gdg-ilorin": { src: "/brand/gdg-ilorin-mark.svg", invertInDark: false },
    } as Record<string, BrandMark>,
  },
  // Events are dated in Nigerian time regardless of where code runs.
  timeZone: "Africa/Lagos",
  facts,
  // Suggestion chips under the home prompt. Only ask what the published
  // content can answer ("How do I join Open Designers?" returns once that
  // page is published).
  suggestions: [
    "What is OTCF?",
    "When is DevFest Ilorin?",
    "How do I join GDG Ilorin?",
    "I want to sponsor an event",
    "I want to speak at DevFest",
    "Where is GDG Ilorin based?",
  ],
} as const;
