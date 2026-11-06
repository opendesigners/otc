import type { Route } from "./+types/communities";
import { Icon } from "~/components/icons";
import { Container, PageHero } from "~/components/Page";
import { Mark } from "~/components/Mark";
import { getCommunitySummaries, getOrg } from "~/content";
import { pageMeta } from "~/lib/meta";

export function loader() {
  return { intro: getOrg().summary, communities: getCommunitySummaries() };
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  pageMeta({
    title: "Communities",
    description: loaderData.intro,
    path: "/communities",
    crumbs: [{ name: "Communities", path: "/communities" }],
  });

export default function Communities({ loaderData }: Route.ComponentProps) {
  const { intro, communities } = loaderData;

  return (
    <>
      <PageHero title="Communities" lede={intro} />
      <Container>
        <ul className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] sm:gap-4">
          {communities.map((c) => {
            const body = (
              <>
                <span className="grid size-14 place-items-center rounded-2xl bg-page">
                  <Mark slug={c.slug} size={36} className="size-9" />
                </span>
                <span className="mt-16 block font-serif text-[2.25rem] leading-none tracking-[-0.035em] sm:mt-24">
                  {c.title}
                </span>
                <span className="mt-3 block text-muted">{c.tagline}</span>
                <span className="mt-8 flex items-center gap-1.5 text-sm font-medium">
                  {c.route ? (
                    <>
                      Visit {c.title}
                      <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  ) : (
                    <span className="text-muted">Page coming soon</span>
                  )}
                </span>
              </>
            );
            return (
              <li key={c.slug}>
                {c.route ? (
                  <a href={c.route} className="group block h-full rounded-[var(--radius-card)] bg-panel p-7 sm:p-8">
                    {body}
                  </a>
                ) : (
                  <div className="h-full rounded-[var(--radius-card)] bg-panel p-7 sm:p-8">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </>
  );
}
