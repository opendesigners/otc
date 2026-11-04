// Kept in its own module (no zod, no content JSON) so components can import it
// without pulling the schema or the content bundle into client JavaScript.

/** Sponsor tiers in display order (as on devfestilorin.com). */
export const SPONSOR_TIERS = ["Headline sponsor", "Diamond sponsor", "Sponsor", "Partner", "Community partner"] as const;
export type SponsorTier = (typeof SPONSOR_TIERS)[number];
