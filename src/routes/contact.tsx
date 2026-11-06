import type { Route } from "./+types/contact";
import { Container, Facts, PageHero, Section } from "~/components/Page";
import { Icon } from "~/components/icons";
import { siteConfig } from "~/config";
import { getCommunities, getOrg, isTodo } from "~/content";
import { pageMeta } from "~/lib/meta";

export function loader() {
  const org = getOrg();
  return {
    orgName: org.title,
    address: org.registration.address,
    communities: getCommunities().map((c) => ({
      slug: c.slug,
      title: c.title,
      route: c.route,
      email: c.email,
      joinUrl: isTodo(c.joinUrl) ? undefined : c.joinUrl,
    })),
  };
}

export const meta: Route.MetaFunction = () =>
  pageMeta({
    title: "Contact",
    description: "How to reach Open Tech Communities Foundation and each of its communities.",
    path: "/contact",
    crumbs: [{ name: "Contact", path: "/contact" }],
  });

const short = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export default function Contact({ loaderData }: Route.ComponentProps) {
  const { orgName, address, communities } = loaderData;
  const email = siteConfig.contactEmail;

  return (
    <>
      <PageHero
        title="Get in touch"
        lede="For OTCF itself, such as partnerships and sponsorship, write to the foundation. For a community's events and membership, contact that community directly."
      />

      <Facts
        rows={[
          ...(email
            ? [
                {
                  label: "Email OTCF",
                  icon: "letter" as const,
                  value: (
                    <a className="link" href={`mailto:${email}`}>
                      {email}
                    </a>
                  ),
                },
              ]
            : []),
          { label: "Registered address", icon: "mapPoint" as const, value: address },
          ...siteConfig.social.map((s) => ({
            label: s.label,
            icon: "arrowRightUp" as const,
            value: (
              <a className="link" href={s.url} rel="me">
                {short(s.url)}
              </a>
            ),
          })),
        ]}
      />
      <p className="mt-4 px-5 text-center text-sm text-muted">{orgName}</p>

      {communities.length > 0 && (
        <Section title="Communities">
          <Container>
            <ul className="mx-auto grid max-w-4xl gap-3 sm:grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] sm:gap-4">
              {communities.map((c) => (
                <li key={c.slug} className="rounded-[var(--radius-card)] bg-panel p-7 sm:p-8">
                  <a href={c.route} className="group inline-flex items-center gap-2 font-serif text-3xl tracking-[-0.03em]">
                    {c.title}
                    <Icon name="arrowRight" className="size-5 transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <ul className="mt-5 space-y-2 text-muted">
                    {c.email && (
                      <li className="flex items-center gap-2">
                        <Icon name="letter" className="size-4 shrink-0" />
                        <a className="link" href={`mailto:${c.email}`}>
                          {c.email}
                        </a>
                      </li>
                    )}
                    {c.joinUrl && (
                      <li className="flex items-center gap-2">
                        <Icon name="arrowRightUp" className="size-4 shrink-0" />
                        <a className="link" href={c.joinUrl}>
                          {short(c.joinUrl)}
                        </a>
                      </li>
                    )}
                  </ul>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}
    </>
  );
}
