// The front door. Static for now; Phase 3 adds `hydrate: true` and the
// interactive pieces (in-place answers, community cycling, arrow → mark morph).

import type { Route } from "./+types/home";
import type { RouteHandle } from "~/root";
import { EventStateLabel, EventStateScript, eventStateAttrs } from "~/components/EventState";
import { Icon } from "~/components/icons";
import { Mark } from "~/components/Mark";
import { LogoWall, PhotoImg } from "~/components/Media";
import { ArrowLink, Container, Section } from "~/components/Page";
import { Prompt } from "~/components/Prompt";
import { SiteHeader } from "~/components/SiteHeader";
import { siteConfig } from "~/config";
import {
  getBackers,
  getCommunitySummaries,
  getEvents,
  getFeaturePhoto,
  getHeroPhoto,
  getOrg,
  getPage,
  getPartner,
  includesDrafts,
} from "~/content";
import { eventState, formatDateRange, lagosToday } from "~/lib/dates";
import { pageMeta } from "~/lib/meta";
import { organizationLd, websiteLd } from "~/lib/seo";

// The floating ask bar docks once the hero prompt scrolls away (.ask-dock in app.css).
export const handle: RouteHandle = { ownHeader: true, askBar: "dock" };

export function loader() {
  const today = lagosToday();
  const events = getEvents();
  // The next event that hasn't ended, else the most recent one.
  const event = events.find((e) => e.endDate >= today) ?? events.at(-1);
  return {
    heroPhoto: getHeroPhoto(),
    featurePhoto: getFeaturePhoto(),
    showPhotoSlot: includesDrafts,
    communities: getCommunitySummaries(),
    backers: getBackers().backers,
    orgSummary: getOrg().summary,
    jsonLd: [organizationLd(getOrg(), getCommunitySummaries()), websiteLd()],
    privacySummary: getPage("privacy")?.summary,
    partnerSummary: getPartner().summary,
    event: event && {
      title: event.title,
      summary: event.summary,
      route: event.route,
      startDate: event.startDate,
      endDate: event.endDate,
      venue: event.venue.name,
      buildState: eventState(event.startDate, event.endDate, today),
    },
  };
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  pageMeta({
    title: `${siteConfig.name} (${siteConfig.shortName}) — Nigeria's open tech communities`,
    description:
      "One front door to Nigeria's open tech communities: Open Designers, Open Devs and GDG Ilorin, home of DevFest Ilorin. Ask a question, get a short answer and the right link.",
    path: "/",
    jsonLd: loaderData.jsonLd,
  });

const { facts } = siteConfig;

// Split into words so each can rise in turn (see .hero-word in app.css).
const HEADLINE = "Find your way into Nigeria\u2019s open tech communities.";

export default function Home({ loaderData }: Route.ComponentProps) {
  const { heroPhoto, featurePhoto, showPhotoSlot, communities, backers, orgSummary, privacySummary, partnerSummary, event } =
    loaderData;

  return (
    <>
      <div className="px-2 pt-2 sm:px-4 sm:pt-4">
        <section className="rounded-[var(--radius-panel)] bg-panel pb-8 sm:pb-10">
          <SiteHeader />

          <div className="px-5 pt-8 text-center sm:pt-14">
            <h1 className="type-display mx-auto max-w-[13em]">
              {HEADLINE.split(" ").map((word, i) => (
                <span key={i}>
                  <span className="hero-word" style={{ "--i": i } as React.CSSProperties}>
                    {word}
                  </span>{" "}
                </span>
              ))}
            </h1>
            <p className="type-lede enter mx-auto mt-5 max-w-xl sm:mt-7" style={{ "--d": 380 } as React.CSSProperties}>
              Ask a question. Get a short answer and the right link.
            </p>
          </div>

          {/* The prompt overlaps the top edge of the photo panel, as on america.gov. */}
          <div className="relative mx-auto mt-14 max-w-5xl px-2 sm:mt-20 sm:px-8">
            <div className="enter-pop hero-prompt absolute inset-x-4 top-0 z-10 -translate-y-1/2 sm:inset-x-14" style={{ "--d": 480 } as React.CSSProperties}>
              <div className="mx-auto max-w-3xl">
                <Prompt size="large" />
              </div>
            </div>

            <div className="hero-media relative overflow-hidden rounded-[var(--radius-card)] bg-brand">
              {heroPhoto && (
                <PhotoImg
                  photo={heroPhoto}
                  priority
                  sizes="(min-width: 1024px) 960px, 100vw"
                  className="absolute inset-0 size-full"
                />
              )}

              <div
                className={`relative flex flex-col justify-between ${
                  heroPhoto ? "min-h-[28rem] sm:aspect-[16/9] sm:min-h-0" : "gap-12 sm:gap-20"
                }`}
              >
                <ul className="flex flex-wrap justify-center gap-2 px-4 pt-14 sm:px-16 sm:pt-20" aria-label="Suggested questions">
                  {siteConfig.suggestions.map((q, i) => (
                    // Four fit comfortably on a phone; all six from sm up.
                    <li
                      key={q}
                      className={`enter-pop ${i >= 4 ? "hidden sm:block" : ""}`}
                      style={{ "--d": 640 + i * 45 } as React.CSSProperties}
                    >
                      <a
                        href={`/ask?q=${encodeURIComponent(q)}`}
                        className="inline-block rounded-full bg-brand-ink px-3.5 py-1.5 text-[0.8125rem] font-medium text-brand transition-transform active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
                      >
                        {q}
                      </a>
                    </li>
                  ))}
                </ul>

                {heroPhoto ? (
                  <p className="m-4 w-fit rounded-full bg-page/90 px-3 py-1 text-xs text-ink sm:m-6">{heroPhoto.event}</p>
                ) : (
                  <div className="px-3 pb-8 sm:pb-14">
                    {showPhotoSlot && (
                      <p className="mx-auto w-fit rounded-full border border-dashed border-brand-ink/60 px-4 py-1.5 text-xs text-brand-ink">
                        Photo slot — list images in content/photos.json (files in public/photos/)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* The three communities, in a row below the box (Phase 3 makes this cycle). */}
          <ul className="mx-auto mt-8 grid max-w-3xl grid-cols-3 gap-2 px-3 sm:mt-10" aria-label="The communities">
            {communities.map((c, i) => {
              const inner = (
                <>
                  <span className="grid size-14 place-items-center rounded-full bg-page sm:size-16">
                    <Mark slug={c.slug} size={40} className="size-8 sm:size-9" />
                  </span>
                  <span className="mt-2.5 font-serif text-lg leading-tight tracking-[-0.02em] sm:text-xl">{c.title}</span>
                </>
              );
              return (
                <li key={c.slug} className="enter-pop flex justify-center" style={{ "--d": 760 + i * 80 } as React.CSSProperties}>
                  {c.route ? (
                    <a href={c.route} className="flex flex-col items-center text-center hover:underline">
                      {inner}
                    </a>
                  ) : (
                    <div className="flex flex-col items-center text-center">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>

          <p className="enter mt-8 px-5 text-center text-sm text-muted sm:mt-10" style={{ "--d": 1000 } as React.CSSProperties}>
            {facts.communityCount} communities · {facts.gdgIlorinMembers} GDG Ilorin members · {facts.devfestAttendees}{" "}
            DevFest attendees
          </p>
        </section>
      </div>

      <Container className="mt-28 space-y-24 sm:mt-44 sm:space-y-36">
        <FeatureRow
          tile={
            featurePhoto ? (
              <figure className="relative size-full">
                <PhotoImg
                  photo={featurePhoto}
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="absolute inset-0 size-full"
                />
                <figcaption className="absolute bottom-4 left-4 rounded-full bg-page/90 px-3 py-1 text-xs text-ink sm:bottom-6 sm:left-6">
                  {featurePhoto.event}
                </figcaption>
              </figure>
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-1 bg-panel px-6 text-center">
                {communities.map((c) => (
                  <p key={c.slug} className="font-serif text-[clamp(2rem,1.4rem+2.4vw,3.25rem)] leading-[1.08] tracking-[-0.035em]">
                    {c.title}
                  </p>
                ))}
              </div>
            )
          }
          title="Three communities. One home."
          body={orgSummary}
          link={{ href: "/communities", label: "Meet the communities" }}
        />

        {privacySummary && (
          <FeatureRow
            tile={
              <div className="grid size-full place-items-center bg-ink">
                <span className="grid size-32 place-items-center rounded-full bg-page text-ink sm:size-40">
                  <Icon name="lock" className="size-12 sm:size-14" />
                </span>
              </div>
            }
            title="Private by design."
            body={privacySummary}
            link={{ href: "/privacy", label: "How we handle your questions" }}
          />
        )}

        {event && (
          <div {...eventStateAttrs(event, event.buildState)}>
            <FeatureRow
              tile={
                <div className="flex size-full flex-col justify-between bg-brand p-8 text-brand-ink sm:p-10">
                  <p className="text-sm font-medium">
                    <EventStateLabel />
                  </p>
                  <div>
                    <p className="font-serif text-[clamp(3.5rem,2.4rem+4.6vw,6rem)] leading-[0.95] tracking-[-0.04em]">
                      {formatDateRange(event.startDate, event.endDate).replace(/ \d{4}$/, "")}
                    </p>
                    <p className="mt-3 text-lg">{event.venue}</p>
                  </div>
                </div>
              }
              title={`${event.title}.`}
              body={
                <>
                  <span className="when-not-past">{event.summary}</span>
                  <span className="when-past">
                    {event.title} took place on {formatDateRange(event.startDate, event.endDate)} at {event.venue}.
                  </span>
                </>
              }
              link={{ href: event.route, label: "Event details" }}
            />
          </div>
        )}

        <FeatureRow
          tile={
            <div className="grid size-full place-items-center bg-accent-soft">
              <span className="grid size-32 place-items-center rounded-full bg-accent text-accent-ink sm:size-40">
                <Icon name="handShake" className="size-12 sm:size-14" />
              </span>
            </div>
          }
          title="Partner with OTCF."
          body={partnerSummary}
          link={{ href: "/partner", label: "Ways to partner" }}
        />
      </Container>

      {backers.length > 0 && (
        <Section title="Backed by">
          <Container>
            <LogoWall sponsors={backers} />
            <p className="mt-8 text-center">
              <ArrowLink href="/partner">Become a partner</ArrowLink>
            </p>
          </Container>
        </Section>
      )}
      {event && <EventStateScript />}
    </>
  );
}

/** america.gov's feature row: a rounded square tile, then heading, text and a link. */
function FeatureRow({
  tile,
  title,
  body,
  link,
}: {
  tile: React.ReactNode;
  title: string;
  body: React.ReactNode;
  link: { href: string; label: string };
}) {
  return (
    <section className="grid items-center gap-8 sm:grid-cols-2 sm:gap-16 lg:gap-24">
      <div className="tile-reveal aspect-square overflow-hidden rounded-[var(--radius-panel)]">{tile}</div>
      <div className="max-w-md">
        <h2 className="type-feature">{title}</h2>
        <p className="mt-5 text-lg leading-relaxed text-muted sm:text-xl">{body}</p>
        <p className="mt-7">
          <ArrowLink href={link.href}>{link.label}</ArrowLink>
        </p>
      </div>
    </section>
  );
}
