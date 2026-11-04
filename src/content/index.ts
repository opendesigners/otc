// Runtime accessors over src/generated/content.json (built by
// scripts/build-content.ts). Drafts are already filtered out of that JSON in
// production builds, so nothing here needs to know about publish flags.
//
// In route modules, call these from `loader` only: loaders run at build time
// during prerender and are stripped from client bundles, so the JSON never
// ships to the browser.

import { bundle } from "../generated/content";
import type { CommunityDoc, ContentDoc, EventDoc, FaqDoc, OrgDoc, PartnerDoc } from "./schema";

export type * from "./schema";

export const includesDrafts = bundle.includesDrafts;

export function getContent(): ContentDoc[] {
  return bundle.docs;
}

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

export const getCommunities = (): CommunityDoc[] => only("community");
export const getCommunity = (slug: string): CommunityDoc | undefined =>
  getCommunities().find((doc) => doc.slug === slug);

/** Soonest first. */
export const getEvents = (): EventDoc[] =>
  only("event").sort((a, b) => a.startDate.localeCompare(b.startDate));
export const getEvent = (slug: string): EventDoc | undefined =>
  getEvents().find((doc) => doc.slug === slug);
