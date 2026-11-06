// /privacy, from content/pages/privacy.md. For another prose page, copy this
// file, change SLUG, and add the route in src/routes.ts.

import type { Route } from "./+types/privacy";
import { DraftBanner, Narrow, PageHero, Prose } from "~/components/Page";
import { getPage } from "~/content";
import { formatDate } from "~/lib/dates";
import { pageMeta } from "~/lib/meta";

const SLUG = "privacy";

export function loader() {
  const page = getPage(SLUG);
  if (!page) throw new Error(`content/pages/${SLUG}.md is missing or unpublished`);
  return { page };
}

export const meta: Route.MetaFunction = ({ loaderData }) =>
  pageMeta({
    title: loaderData.page.title,
    description: loaderData.page.summary,
    path: loaderData.page.route,
    crumbs: [{ name: loaderData.page.title, path: loaderData.page.route }],
  });

export default function Privacy({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;

  return (
    <>
      <PageHero title={page.title} lede={page.summary} />
      <DraftBanner show={!page.publish} />
      <Prose html={page.html} />
      <Narrow className="mt-12">
        <p className="text-sm text-muted">Last updated {formatDate(page.updated)}.</p>
      </Narrow>
    </>
  );
}
