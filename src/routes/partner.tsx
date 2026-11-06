import type { Route } from "./+types/partner";
import { Icon } from "~/components/icons";
import { LogoWall } from "~/components/Media";
import { ButtonLink, Container, DraftBanner, Narrow, PageHero, Prose, Section } from "~/components/Page";
import { siteConfig } from "~/config";
import { getBackers, getPartner } from "~/content";
import { pageMeta } from "~/lib/meta";

export function loader() {
  return { partner: getPartner(), ...getBackers() };
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  pageMeta({
    title: loaderData.partner.title,
    description: loaderData.partner.summary,
    path: "/partner",
    crumbs: [{ name: loaderData.partner.title, path: "/partner" }],
  });

export default function Partner({ loaderData }: Route.ComponentProps) {
  const { partner, backers, communityPartners } = loaderData;
  const email = siteConfig.contactEmail;
  const mailto = email && `mailto:${email}?subject=${encodeURIComponent("Partnering with OTCF")}`;

  return (
    <>
      <PageHero title={partner.title} lede={partner.summary}>
        {mailto ? (
          <ButtonLink href={mailto}>
            <Icon name="letter" className="size-4" />
            Email OTCF
          </ButtonLink>
        ) : (
          <ButtonLink href="/contact">Contact OTCF</ButtonLink>
        )}
      </PageHero>
      <DraftBanner show={!partner.publish} />

      <Prose html={partner.html} />

      {backers.length > 0 && (
        <Section title="Organisations that back our events">
          <Container>
            <LogoWall sponsors={backers} />
            {communityPartners.length > 0 && (
              <p className="mx-auto mt-10 max-w-2xl text-center text-muted">
                Community partners: {communityPartners.map((p) => p.name).join(", ")}.
              </p>
            )}
          </Container>
        </Section>
      )}

      {mailto && (
        <Narrow className="mt-16">
          <div className="rounded-[var(--radius-card)] bg-brand px-8 py-10 text-center text-brand-ink sm:px-12 sm:py-14">
            <p className="font-serif text-[clamp(2rem,1.5rem+2vw,3rem)] leading-[1.05] tracking-[-0.035em]">
              Start a conversation.
            </p>
            <p className="mt-4">
              Write to{" "}
              <a className="underline underline-offset-4" href={mailto}>
                {email}
              </a>{" "}
              with a line about who you are and what you&rsquo;d like to support.
            </p>
          </div>
        </Narrow>
      )}
    </>
  );
}
