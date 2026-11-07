import type { Route } from "./+types/impact";
import { ButtonLink, Container, DraftBanner, PageHero, Prose } from "~/components/Page";
import { getImpact } from "~/content";
import { pageMeta } from "~/lib/meta";

export function loader() {
  return { doc: getImpact() };
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  pageMeta({
    title: loaderData.doc.title,
    description: loaderData.doc.summary,
    path: "/impact",
    crumbs: [{ name: loaderData.doc.title, path: "/impact" }],
  });

export default function Impact({ loaderData }: Route.ComponentProps) {
  const { doc } = loaderData;
  return (
    <>
      <PageHero title={doc.title} lede={doc.summary}>
        <ButtonLink href="/projects">See the projects</ButtonLink>
        <ButtonLink href="/partner" variant="soft">
          Partner with OTCF
        </ButtonLink>
      </PageHero>
      <DraftBanner show={!doc.publish} />

      {/* Headline numbers: big serif figures on soft panels, two across on phones. */}
      <Container className="mb-20 sm:mb-28">
        <dl className="grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          {doc.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse justify-end gap-2 rounded-[var(--radius-card)] bg-panel px-5 py-7 sm:px-7 sm:py-9">
              <dt className="text-sm text-muted sm:text-base">{stat.label}</dt>
              <dd className="font-serif text-[clamp(2.25rem,1.6rem+2.6vw,3.75rem)] leading-none tracking-[-0.04em] text-ink">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>

      <Prose html={doc.html} />
    </>
  );
}
