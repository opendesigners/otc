import { data } from "react-router";
import type { Route } from "./+types/event";
import { EventStateLabel, EventStateScript, eventStateAttrs } from "~/components/EventState";
import { SponsorTiers } from "~/components/Media";
import { ButtonLink, Container, DraftBanner, Facts, Narrow, PageHero, Prose, Section } from "~/components/Page";
import { getCommunity, getEvent } from "~/content";
import { eventState, formatDateRange, formatDay } from "~/lib/dates";
import { pageMeta } from "~/lib/meta";
import { eventLd } from "~/lib/seo";

export function loader({ params }: Route.LoaderArgs) {
  const event = getEvent(params.slug);
  if (!event) throw data("Not found", { status: 404 });
  const community = getCommunity(event.community);
  return {
    event,
    organiser: community ? { title: community.title, route: community.route, email: community.email } : undefined,
    buildState: eventState(event.startDate, event.endDate),
  };
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  loaderData
    ? pageMeta({
        title: loaderData.event.title,
        description: loaderData.event.summary,
        path: loaderData.event.route,
        crumbs: [
          { name: "Events", path: "/events" },
          { name: loaderData.event.title, path: loaderData.event.route },
        ],
        jsonLd: [eventLd(loaderData.event, loaderData.organiser)],
      })
    : [];

export default function Event({ loaderData }: Route.ComponentProps) {
  const { event, organiser, buildState } = loaderData;
  const when = formatDateRange(event.startDate, event.endDate);
  const headline = event.sponsors.filter((s) => /headline/i.test(s.tier));

  return (
    // Everything inside switches between upcoming / live / past via data-event-state.
    <article {...eventStateAttrs(event, buildState)}>
      <PageHero
        label={<EventStateLabel />}
        title={event.title}
        lede={
          <>
            <span className="when-not-past">{event.summary}</span>
            <span className="when-past">
              {event.title} took place on {when} at {event.venue.name}.
            </span>
          </>
        }
      >
        {event.registrationUrl && (
          <span className="when-not-past">
            <ButtonLink href={event.registrationUrl}>Get a ticket</ButtonLink>
          </span>
        )}
        {event.url && (
          <span className="when-not-past">
            <ButtonLink href={event.url} variant="soft">
              Event website
            </ButtonLink>
          </span>
        )}
      </PageHero>
      <DraftBanner show={!event.publish} />

      <Facts
        rows={[
          { label: "When", icon: "calendar", value: when },
          {
            label: "Where",
            icon: "mapPoint",
            value: (
              <>
                {event.venue.name}
                <span className="block text-sm text-muted">{event.venue.address}</span>
              </>
            ),
          },
          ...(organiser
            ? [
                {
                  label: "Organised by",
                  icon: "usersGroup" as const,
                  value: (
                    <a className="link" href={organiser.route}>
                      {organiser.title}
                    </a>
                  ),
                },
              ]
            : []),
          ...(headline.length > 0 ? [{ label: "Headline sponsor", value: headline.map((s) => s.name).join(", ") }] : []),
        ]}
      />

      {/* Before and during the event */}
      <div className="when-not-past">
        {event.schedule.length > 0 && (
          <Section title="Schedule">
            <Narrow>
              <ol className="space-y-3">
                {event.schedule.map((day) => (
                  <li key={day.date} className="rounded-[var(--radius-card)] bg-panel px-7 py-6">
                    <p className="text-sm font-medium text-accent">{formatDay(day.date)}</p>
                    <p className="mt-2 font-serif text-3xl leading-tight tracking-[-0.03em]">{day.title}</p>
                    <p className="mt-2 text-muted">{day.detail}</p>
                  </li>
                ))}
              </ol>
            </Narrow>
          </Section>
        )}
        <div className="mt-24 sm:mt-32">
          <Prose html={event.html} />
        </div>
      </div>

      {/* After endDate */}
      <div className="when-past">
        <Section title="What happened">
          {event.recap ? (
            <Prose html={event.recap.html} />
          ) : (
            <Narrow>
              <p className="text-center text-lg text-muted">A recap of {event.title} will be posted here.</p>
            </Narrow>
          )}
        </Section>
        <Section title="Recordings">
          <Narrow className="text-center">
            {event.recordingsUrl ? (
              <ButtonLink href={event.recordingsUrl}>Watch the talks</ButtonLink>
            ) : (
              <p className="text-lg text-muted">Links to talk recordings will be added here once they're published.</p>
            )}
          </Narrow>
        </Section>
      </div>

      {event.sponsors.length > 0 && (
        <Section title="Sponsors and partners">
          <Container className="max-w-4xl">
            <SponsorTiers sponsors={event.sponsors} />
          </Container>
        </Section>
      )}

      {organiser?.email && (
        <Narrow className="mt-20 text-center">
          <p className="text-muted">
            Questions about {event.title}? Email {organiser.title} at{" "}
            <a className="link" href={`mailto:${organiser.email}`}>
              {organiser.email}
            </a>
            .
          </p>
        </Narrow>
      )}
      <EventStateScript />
    </article>
  );
}
