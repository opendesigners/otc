import { siteConfig, type BrandMark } from "~/config";

/** The OTCF mark, or a community's mark by slug (falls back to OTCF's). */
export function markFor(slug?: string): BrandMark {
  return (slug && siteConfig.brand.communities[slug]) || siteConfig.brand.otcf;
}

/** Decorative logo image; the surrounding text always names the organisation. */
export function Mark({ slug, size, className = "" }: { slug?: string; size: number; className?: string }) {
  const mark = markFor(slug);
  return (
    <img
      src={mark.src}
      alt=""
      width={size}
      height={size}
      className={`object-contain ${mark.invertInDark ? "invert-dark" : ""} ${className}`}
    />
  );
}
