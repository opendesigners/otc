// schema.org JSON-LD builders. Rendered via React Router's `meta`
// ({ "script:ld+json": … }) so they're in the prerendered HTML. They only
// restate facts from /content — never add claims the pages don't make.

import { siteConfig } from "~/config";
import type { CommunityDoc, CommunitySummary, EventDoc, FaqItem, OrgDoc } from "~/content";

const abs = (path: string) => `${siteConfig.url}${path === "/" ? "" : path}`;
const ORG_ID = `${siteConfig.url}/#organization`;

/**
 * OTCF as a nonprofit, with its communities. Used on home and /about. Build it
 * in the loader so a hydrated page ships this object, not the whole org doc.
 */
export function organizationLd(org: OrgDoc, communities: CommunitySummary[]) {
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    "@id": ORG_ID,
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    logo: abs(siteConfig.brand.otcf.src),
    description: org.summary,
    foundingDate: org.registration.date,
    address: { "@type": "PostalAddress", streetAddress: org.registration.address, addressCountry: "NG" },
    ...(siteConfig.contactEmail ? { email: siteConfig.contactEmail } : {}),
    ...(siteConfig.social.length ? { sameAs: siteConfig.social.map((s) => s.url) } : {}),
    member: org.leadership.map((p) => ({
      "@type": "OrganizationRole",
      roleName: p.role,
      member: { "@type": "Person", name: p.name },
    })),
    subOrganization: communities.map((c) => ({
      "@type": "Organization",
      name: c.title,
      description: c.tagline,
      ...(c.route ? { url: abs(c.route) } : {}),
    })),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    alternateName: siteConfig.shortName,
    url: siteConfig.url,
    inLanguage: "en-NG",
    publisher: { "@id": ORG_ID },
  };
}

/** A community page: the community as an organisation under OTCF. */
export function communityLd(c: CommunityDoc) {
  const external = c.links.map((l) => l.url).filter((u) => u.startsWith("http"));
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: c.title,
    url: abs(c.route),
    description: c.summary,
    parentOrganization: { "@id": ORG_ID },
    ...(c.email ? { email: c.email } : {}),
    ...(external.length ? { sameAs: [...new Set(external)] } : {}),
    ...(c.leads.length
      ? {
          member: c.leads.map((p) => ({
            "@type": "OrganizationRole",
            roleName: p.role,
            member: { "@type": "Person", name: p.name },
          })),
        }
      : {}),
  };
}

/** An event. Dates are Lagos-local days; no prices are invented. */
export function eventLd(e: EventDoc, organiser?: { title: string; route: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    description: e.summary,
    url: abs(e.route),
    startDate: e.startDate,
    endDate: e.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: e.venue.name,
      address: { "@type": "PostalAddress", streetAddress: e.venue.address, addressCountry: "NG" },
    },
    ...(organiser ? { organizer: { "@type": "Organization", name: organiser.title, url: abs(organiser.route) } } : {}),
    ...(e.registrationUrl ? { offers: { "@type": "Offer", url: e.registrationUrl } } : {}),
    ...(e.sponsors.length
      ? { sponsor: e.sponsors.filter((s) => s.tier !== "Community partner").map((s) => ({ "@type": "Organization", name: s.name })) }
      : {}),
  };
}

export function faqLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)") },
    })),
  };
}

/** Breadcrumb trail; Home is added automatically. */
export function breadcrumbLd(trail: Array<{ name: string; path: string }>) {
  const items = [{ name: "Home", path: "/" }, ...trail];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
  };
}
