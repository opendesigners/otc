import type { Route } from "./+types/about";
import { Icon } from "~/components/icons";
import { DraftBanner, Narrow, PageHero, Prose, Section } from "~/components/Page";
import { getFaq, getOrg } from "~/content";
import { pageMeta } from "~/lib/meta";

export function loader() {
  return { org: getOrg(), faq: getFaq() };
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  pageMeta({ title: "About OTCF", description: loaderData.org.summary, path: "/about" });

export default function About({ loaderData }: Route.ComponentProps) {
  const { org, faq } = loaderData;

  return (
    <>
      <PageHero title={org.title} lede={org.summary} />
      <DraftBanner show={!org.publish} />
      <Prose html={org.html} />

      <Section title="Questions people ask" id="faq">
        <Narrow>
          <div className="faq border-t border-line">
            {faq.items.map((item) => (
              <details key={item.id} id={item.id} className="scroll-mt-10 border-b border-line">
                <summary className="flex items-center justify-between gap-6 py-5 text-lg text-ink sm:text-xl">
                  {item.question}
                  <Icon name="chevronDown" className="faq-chevron size-5 shrink-0 text-muted" />
                </summary>
                <div className="prose pb-6" dangerouslySetInnerHTML={{ __html: item.answerHtml }} />
              </details>
            ))}
          </div>
        </Narrow>
      </Section>
    </>
  );
}
