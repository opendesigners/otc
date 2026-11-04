import type { Route } from "./+types/events";
import { EventStateLabel, EventStateScript, eventStateAttrs } from "~/components/EventState";
import { Icon } from "~/components/icons";
import { Gallery } from "~/components/Media";
import { Container, Narrow, PageHero, Section } from "~/components/Page";
import { getCommunity, getEvents, getGalleryPhotos } from "~/content";
import { eventState, formatDateRange } from "~/lib/dates";
import { pageMeta } from "~/lib/meta";

export function loader() {
  return {
    photos: getGalleryPhotos(),
    events: getEvents().map((e) => ({
      slug: e.slug,
      route: e.route,
      title: e.title,
      startDate: e.startDate,
      endDate: e.endDate,
      venue: e.venue.name,
      organiser: getCommunity(e.community)?.title,
      buildState: eventState(e.startDate, e.endDate),
      publish: e.publish,
    })),
  };
}

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Events",
    description: "Conferences, workshops and meetups run by OTCF's communities, including DevFest Ilorin.",
    path: "/events",
  });

export default function Events({ loaderData }: Route.ComponentProps) {
  const { events, photos } = loaderData;

  return (
    <>
      <PageHero title="Events" lede="Conferences, workshops and meetups run by OTCF's communities." />
      <Narrow>
        {events.length === 0 ? (
          <p className="text-center text-muted">No events are listed yet.</p>
        ) : (
          <ul className="space-y-3">
            {events.map((e) => (
              <li key={e.slug} {...eventStateAttrs(e, e.buildState)}>
                <a href={e.route} className="group block rounded-[var(--radius-card)] bg-panel px-7 py-7 sm:px-8">
                  <span className="text-sm font-medium text-accent">
                    <EventStateLabel />
                    {!e.publish && " · draft"}
                  </span>
                  <span className="mt-3 block font-serif text-[2.25rem] leading-[1.05] tracking-[-0.035em] sm:text-[2.75rem]">
                    {e.title}
                  </span>
                  <span className="mt-3 flex items-center justify-between gap-4 text-muted">
                    <span>
                      {formatDateRange(e.startDate, e.endDate)} · {e.venue}
                      {e.organiser && ` · ${e.organiser}`}
                    </span>
                    <Icon name="arrowRight" className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </Narrow>
      <EventStateScript />

      {photos.length > 0 && (
        <Section title="From past events">
          <Container>
            <Gallery photos={photos} />
          </Container>
        </Section>
      )}
    </>
  );
}
