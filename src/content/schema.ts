// Frontmatter schemas for /content and the document types built from them.
// The schemas run in scripts/ (build time); app and server code import types only.

import { z } from "zod";
import { SPONSOR_TIERS } from "./tiers.ts";

export { SPONSOR_TIERS, type SponsorTier } from "./tiers.ts";

export const TODO = "TODO";

const text = z.string().trim().min(1);

// YAML turns unquoted 2026-11-06 into a Date at UTC midnight; accept both and
// normalise to a plain YYYY-MM-DD string.
const isoDate = z.union([z.date().transform((d) => d.toISOString().slice(0, 10)), z.iso.date()]);

// A real URL, or the literal TODO while it's unknown (which keeps the file a draft).
const urlOrTodo = z.union([z.literal(TODO), z.url()]);

const person = z.strictObject({ name: text, role: text });
const link = z.strictObject({ label: text, url: urlOrTodo });

const base = z.strictObject({
  title: text,
  slug: text,
  summary: text,
  /** ISO date the facts in this file were last checked. */
  updated: isoDate,
  publish: z.boolean(),
});

export const orgFrontmatter = base.extend({
  registration: z.strictObject({ type: text, authority: text, date: isoDate, address: text }),
  trustees: z.array(person),
});

export const communityFrontmatter = base.extend({
  /** One line used by the home-page community cycler. */
  tagline: text,
  leads: z.array(person),
  joinUrl: urlOrTodo,
  links: z.array(link),
  email: z.email().optional(),
});

export const eventFrontmatter = base
  .extend({
    /** Slug of the organising community. */
    community: text,
    /** Interpreted in Africa/Lagos. */
    startDate: isoDate,
    endDate: isoDate,
    venue: z.strictObject({ name: text, address: text }),
    /** The event's own website. Shown until endDate. */
    url: z.url().optional(),
    /** Where to get a ticket / register. Shown until endDate. */
    registrationUrl: z.url().optional(),
    schedule: z.array(z.strictObject({ date: isoDate, title: text, detail: text })),
    sponsors: z.array(
      z.strictObject({
        name: text,
        tier: z.enum(SPONSOR_TIERS),
        /** File name in public/sponsors/ (svg or webp). Name shown as text when absent. */
        logo: z.string().regex(/^[a-z0-9-]+\.(svg|webp|png)$/).optional(),
      }),
    ),
    expectedAttendance: text.optional(),
    /** Filled in after the event; the page switches to recap mode on its own. */
    recordingsUrl: z.url().optional(),
  })
  .refine((e) => e.endDate >= e.startDate, { message: "endDate is before startDate", path: ["endDate"] });

export const plainFrontmatter = base;

type DocMeta = {
  /** Site route this file renders at; also what the assistant cites. */
  route: string;
  /** Path relative to /content, e.g. "communities/gdg-ilorin.md". */
  file: string;
  /** Markdown body with {{facts}} filled in and frontmatter stripped. */
  body: string;
  /** `body` rendered to HTML at build time, with site routes ("/about") linked. */
  html: string;
  /** True if the literal TODO appears anywhere in the file. */
  hasTodo: boolean;
};

export type Person = z.infer<typeof person>;
export type Link = z.infer<typeof link>;
export type FaqItem = { question: string; answer: string; answerHtml: string; id: string };

export type OrgDoc = z.infer<typeof orgFrontmatter> & DocMeta & { kind: "org" };
export type CommunityDoc = z.infer<typeof communityFrontmatter> & DocMeta & { kind: "community" };
export type EventDoc = z.infer<typeof eventFrontmatter> &
  DocMeta & {
    kind: "event";
    /**
     * Optional "## Recap" section, split out of the body. The page shows
     * `body` before endDate and the recap after; the assistant gets both.
     */
    recap?: { body: string; html: string };
  };
export type FaqDoc = z.infer<typeof plainFrontmatter> & DocMeta & { kind: "faq"; items: FaqItem[] };
export type PartnerDoc = z.infer<typeof plainFrontmatter> & DocMeta & { kind: "partner" };
/** A standalone prose page at /<slug>, e.g. content/pages/privacy.md → /privacy. */
export type PageDoc = z.infer<typeof plainFrontmatter> & DocMeta & { kind: "page" };

export type ContentDoc = OrgDoc | CommunityDoc | EventDoc | FaqDoc | PartnerDoc | PageDoc;
export type ContentKind = ContentDoc["kind"];

/**
 * content/photos.json — real OTCF photos (with permission to publish) for the
 * home hero. Files live in public/photos/. Empty until photos are supplied.
 */
export const photosFile = z.strictObject({
  photos: z.array(
    z.strictObject({
      /**
       * File name in public/photos/, e.g. "devfest-ilorin-2025-keynote.webp".
       * Smaller copies named "<name>-640.webp" / "<name>-960.webp" are picked
       * up automatically for srcset.
       */
      file: z.string().regex(/^[a-z0-9][a-z0-9._-]*\.(jpe?g|webp|avif|png)$/, "lowercase file name in public/photos/"),
      /** Describes the scene for screen readers, e.g. "Attendees filling the main hall at DevFest Ilorin 2025". */
      alt: text,
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      /** Event the photo is from, shown as its caption, e.g. "DevFest Ilorin 2025". */
      event: text,
      /** Slug of the community that ran the event; its page shows the photo. */
      community: text.optional(),
      /** Use as the home-page hero (first one wins). */
      hero: z.boolean().optional(),
      /** Use in the "Three communities" feature row on home (first one wins). */
      feature: z.boolean().optional(),
      credit: text.optional(),
    }),
  ),
});
export type Photo = z.infer<typeof photosFile>["photos"][number] & {
  src: string;
  /** Ready-made srcset ("…-640.webp 640w, …-960.webp 960w, … 1200w"). */
  srcSet: string;
};

/**
 * Every community, drafts included, as name + tagline only. Lets the UI say
 * "three communities" truthfully without ever linking to an unpublished page:
 * `route` is present only when the community's page is published.
 */
export type CommunitySummary = { slug: string; title: string; tagline: string; route?: string };

/** Shape of src/generated/content.json. */
export type ContentBundle = {
  /** Whether publish:false docs were included when this bundle was built. */
  includesDrafts: boolean;
  docs: ContentDoc[];
  communities: CommunitySummary[];
  photos: Photo[];
};
