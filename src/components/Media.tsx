// Photos and sponsor logos. All server-rendered; images are responsive
// (srcset from content/photos.json) and lazy unless marked as the priority image.

import type { EventDoc, Photo } from "~/content";
import { SPONSOR_TIERS, type SponsorTier } from "~/content/tiers";

export function PhotoImg({
  photo,
  sizes,
  priority = false,
  className = "",
}: {
  photo: Photo;
  /** Rendered width hint for srcset, e.g. "(min-width: 640px) 50vw, 100vw". */
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <img
      src={photo.src}
      srcSet={photo.srcSet}
      sizes={sizes}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      loading={priority ? undefined : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={`object-cover ${className}`}
    />
  );
}

/** Captioned photo grid: each photo names the event it's from. */
export function Gallery({ photos }: { photos: Photo[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-2 gap-y-4 sm:gap-4 lg:grid-cols-3">
      {photos.map((photo) => (
        <li key={photo.src} className="rise-in">
          <figure>
            <div className="overflow-hidden rounded-2xl bg-panel sm:rounded-[var(--radius-card)]">
              <PhotoImg
                photo={photo}
                sizes="(min-width: 1024px) 380px, 50vw"
                className="aspect-[3/2] w-full"
              />
            </div>
            <figcaption className="mt-2 px-1 text-xs text-muted sm:mt-2.5 sm:text-sm">{photo.event}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

type Sponsor = EventDoc["sponsors"][number];

function Logo({ sponsor, large = false }: { sponsor: Sponsor; large?: boolean }) {
  return (
    <div
      className={`logo-tile grid place-items-center rounded-[1.5rem] px-6 ${large ? "h-32 sm:h-40" : "h-24"}`}
      title={sponsor.name}
    >
      {sponsor.logo ? (
        <img
          src={`/sponsors/${sponsor.logo}`}
          alt={sponsor.name}
          loading="lazy"
          decoding="async"
          className={`w-auto max-w-full object-contain ${large ? "max-h-16 sm:max-h-20" : "max-h-10"}`}
        />
      ) : (
        <span className="text-center text-sm font-medium text-[oklch(0.204_0.02_166.5)]">{sponsor.name}</span>
      )}
    </div>
  );
}

const TIER_LABEL: Record<SponsorTier, string> = {
  "Headline sponsor": "Headline sponsor",
  "Diamond sponsor": "Diamond sponsor",
  Sponsor: "Sponsors",
  Partner: "Partners",
  "Community partner": "Community partners",
};

/** An event's sponsors, grouped by tier in the order devfestilorin.com uses. */
export function SponsorTiers({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <div className="space-y-12">
      {SPONSOR_TIERS.map((tier) => {
        const group = sponsors.filter((s) => s.tier === tier);
        if (group.length === 0) return null;
        const top = tier === "Headline sponsor" || tier === "Diamond sponsor";
        return (
          <section key={tier} aria-label={TIER_LABEL[tier]}>
            <h3 className="mb-4 text-center text-sm font-medium text-muted">{TIER_LABEL[tier]}</h3>
            <ul
              className={`grid gap-3 ${
                top ? "mx-auto max-w-md" : "grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]"
              }`}
            >
              {group.map((s) => (
                <li key={s.name} className="rise-in">
                  <Logo sponsor={s} large={top} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/** A quiet wall of logos (no tiers), e.g. "Backed by" on home and /partner. */
export function LogoWall({ sponsors }: { sponsors: Sponsor[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
      {sponsors.map((s) => (
        <li key={s.name} className="rise-in">
          <Logo sponsor={s} />
        </li>
      ))}
    </ul>
  );
}
