// Runtime accessors over src/generated/content.json (built by
// scripts/build-content.ts). Drafts are already filtered out of that JSON in
// production builds, so nothing here needs to know about publish flags.
//
// In route modules, call these from `loader` only: loaders run at build time
// during prerender and are stripped from client bundles, so the JSON never
// ships to the browser.

import { bundle } from "../generated/content";
import type { CommunityDoc, ContentDoc, EventDoc, FaqDoc, OrgDoc, PageDoc, PartnerDoc } from "./schema";
import { SPONSOR_TIERS } from "./tiers";

export type * from "./schema";

export const includesDrafts = bundle.includesDrafts;

/** Unknown values are written as TODO (only possible in drafts). */
export const isTodo = (value: string | undefined) => value === undefined || value.includes("TODO");

export function getContent(): ContentDoc[] {
  return bundle.docs;
}

/** Photos from content/photos.json, in file order. */
export const getPhotos = () => bundle.photos;
export const getHeroPhoto = () => bundle.photos.find((p) => p.hero) ?? bundle.photos[0];
export const getFeaturePhoto = () => bundle.photos.find((p) => p.feature);
/** Everything that isn't the hero or feature photo, for galleries. */
export const getGalleryPhotos = (community?: string) =>
  bundle.photos.filter((p) => !p.hero && !p.feature && (!community || p.community === community));

/**
 * Sponsors and partners across published events, de-duplicated by name, in
 * tier order. Community partners are returned separately.
 */
export function getBackers() {
  const seen = new Map<string, EventDoc["sponsors"][number]>();
  for (const event of getEvents()) for (const s of event.sponsors) if (!seen.has(s.name)) seen.set(s.name, s);
  const all = [...seen.values()].sort((a, b) => SPONSOR_TIERS.indexOf(a.tier) - SPONSOR_TIERS.indexOf(b.tier));
  return {
    backers: all.filter((s) => s.tier !== "Community partner"),
    communityPartners: all.filter((s) => s.tier === "Community partner"),
  };
}

/** All communities (drafts included) as name/tagline; `route` only if published. */
export const getCommunitySummaries = () => bundle.communities;

function only<K extends ContentDoc["kind"]>(kind: K) {
  return bundle.docs.filter((doc): doc is Extract<ContentDoc, { kind: K }> => doc.kind === kind);
}

function required<T>(doc: T | undefined, what: string): T {
  if (!doc) throw new Error(`Missing or unpublished content: ${what}`);
  return doc;
}

export const getOrg = (): OrgDoc => required(only("org")[0], "content/otcf.md");
export const getFaq = (): FaqDoc => required(only("faq")[0], "content/faq.md");
export const getPartner = (): PartnerDoc => required(only("partner")[0], "content/partner.md");
export const getPage = (slug: string): PageDoc | undefined => only("page").find((doc) => doc.slug === slug);

export const getCommunities = (): CommunityDoc[] => only("community");
export const getCommunity = (slug: string): CommunityDoc | undefined =>
  getCommunities().find((doc) => doc.slug === slug);

/** Soonest first. */
export const getEvents = (): EventDoc[] =>
  only("event").sort((a, b) => a.startDate.localeCompare(b.startDate));
export const getEvent = (slug: string): EventDoc | undefined =>
  getEvents().find((doc) => doc.slug === slug);
