import { data } from "react-router";
import type { Route } from "./+types/community";
import { EventStateLabel, EventStateScript, eventStateAttrs } from "~/components/EventState";
import { Icon } from "~/components/icons";
import { Gallery } from "~/components/Media";
import { ButtonLink, Container, DraftBanner, Facts, Narrow, PageHero, Prose, Section } from "~/components/Page";
import { getCommunity, getEvents, getGalleryPhotos, isTodo } from "~/content";
import { eventState, formatDateRange } from "~/lib/dates";
import { pageMeta } from "~/lib/meta";

export function loader({ params }: Route.LoaderArgs) {
  const community = getCommunity(params.slug);
  if (!community) throw data("Not found", { status: 404 });
  const events = getEvents()
    .filter((e) => e.community === community.slug)
    .map((e) => ({ ...e, buildState: eventState(e.startDate, e.endDate) }));
  return { community, events, photos: getGalleryPhotos(community.slug) };
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  loaderData
    ? pageMeta({
        title: loaderData.community.title,
        description: loaderData.community.summary,
        path: loaderData.community.route,
      })
    : [];

export default function Community({ loaderData }: Route.ComponentProps) {
  const { community, events, photos } = loaderData;
  const links = community.links.filter((l) => !isTodo(l.url));

  return (
    <>
      <PageHero title={community.title} lede={community.summary}>
        {!isTodo(community.joinUrl) && <ButtonLink href={community.joinUrl}>Join {community.title}</ButtonLink>}
        {community.email && (
          <ButtonLink href={`mailto:${community.email}`} variant="soft">
            Email {community.title}
          </ButtonLink>
        )}
      </PageHero>
      <DraftBanner show={!community.publish} />

      <Prose html={community.html} />

      {community.leads.length > 0 && (
        <Section title="Who leads it">
          <Container>
            <ul className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
              {community.leads.map((p) => (
                <li key={p.name} className="rounded-[var(--radius-card)] bg-panel px-6 py-5">
                  <p className="font-medium text-ink">{p.name}</p>
                  <p className="text-sm text-muted">{p.role}</p>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {events.length > 0 && (
        <Section title="Events">
          <Narrow>
            <ul className="space-y-3">
              {events.map((e) => (
                <li key={e.slug} {...eventStateAttrs(e, e.buildState)}>
                  <a href={e.route} className="group block rounded-[var(--radius-card)] bg-panel px-7 py-6">
                    <span className="text-sm font-medium text-accent">
                      <EventStateLabel />
                    </span>
                    <span className="mt-2 block font-serif text-3xl leading-tight tracking-[-0.03em]">{e.title}</span>
                    <span className="mt-2 flex items-center justify-between gap-4 text-muted">
                      {formatDateRange(e.startDate, e.endDate)} · {e.venue.name}
                      <Icon name="arrowRight" className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Narrow>
          <EventStateScript />
        </Section>
      )}

      {photos.length > 0 && (
        <Section title="From our events">
          <Container>
            <Gallery photos={photos} />
          </Container>
        </Section>
      )}

      {(links.length > 0 || community.email) && (
        <Section title="Links">
          <Facts
            rows={[
              ...links.map((l) => ({
                label: l.label,
                icon: "arrowRightUp" as const,
                value: (
                  <a className="link" href={l.url}>
                    {l.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                ),
              })),
              ...(community.email
                ? [
                    {
                      label: "Email",
                      icon: "letter" as const,
                      value: (
                        <a className="link" href={`mailto:${community.email}`}>
                          {community.email}
                        </a>
                      ),
                    },
                  ]
                : []),
            ]}
          />
        </Section>
      )}

      <Narrow className="mt-20 text-center">
        <p className="text-muted">
          {community.title} is one of the communities under Open Tech Communities Foundation. It keeps its own
          identity, leadership and activities.{" "}
          <a className="link" href="/about">
            About OTCF
          </a>
          .
        </p>
      </Narrow>
    </>
  );
}
