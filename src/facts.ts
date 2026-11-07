// Headline numbers quoted across /content and the UI. Change a value here and
// every page, the assistant prompt and the keyword fallback pick it up.
//
// Content files reference these as {{key}} (e.g. "{{gdgIlorinMembers}} members");
// scripts/build-content.ts fills them in and rejects unknown keys.
export const facts = {
  /** Communities under OTCF (published or not — this is the organisation's structure). */
  communityCount: "3",
  /** Live count on gdg.community.dev/gdg-ilorin, rounded down. */
  gdgIlorinMembers: "4,600+",
  /** Total across past DevFest Ilorin editions. */
  devfestAttendees: "2,500+",
  /** Open Designers community members (supplied by the user, 2026-11-07). */
  openDesignersMembers: "2,000+",
  /**
   * Sum of the "users" counts on Open Designers' six Figma Community files
   * (figma.com/@opendesigners, 2026-11-07: 44.9k + 7.4k + 2.6k + 1.4k + 934 + 151),
   * rounded down. Per-file numbers are in content/projects.md.
   */
  figmaFileUses: "57,000+",
} as const;

export type FactKey = keyof typeof facts;
