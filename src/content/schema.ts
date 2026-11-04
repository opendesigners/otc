// Frontmatter schemas for /content and the document types built from them.
// The schemas run in scripts/ (build time); app and server code import types only.

import { z } from "zod";

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
    url: z.url().optional(),
    schedule: z.array(z.strictObject({ date: isoDate, title: text, detail: text })),
    sponsors: z.array(z.strictObject({ name: text, tier: text })),
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
  /** True if the literal TODO appears anywhere in the file. */
  hasTodo: boolean;
};

export type Person = z.infer<typeof person>;
export type Link = z.infer<typeof link>;
export type FaqItem = { question: string; answer: string };

export type OrgDoc = z.infer<typeof orgFrontmatter> & DocMeta & { kind: "org" };
export type CommunityDoc = z.infer<typeof communityFrontmatter> & DocMeta & { kind: "community" };
export type EventDoc = z.infer<typeof eventFrontmatter> & DocMeta & { kind: "event" };
export type FaqDoc = z.infer<typeof plainFrontmatter> & DocMeta & { kind: "faq"; items: FaqItem[] };
export type PartnerDoc = z.infer<typeof plainFrontmatter> & DocMeta & { kind: "partner" };

export type ContentDoc = OrgDoc | CommunityDoc | EventDoc | FaqDoc | PartnerDoc;
export type ContentKind = ContentDoc["kind"];

/** Shape of src/generated/content.json. */
export type ContentBundle = {
  /** Whether publish:false docs were included when this bundle was built. */
  includesDrafts: boolean;
  docs: ContentDoc[];
};
