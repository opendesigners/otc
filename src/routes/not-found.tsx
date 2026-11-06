import type { Route } from "./+types/not-found";
import { ArrowLink, PageHero } from "~/components/Page";
import { pageMeta } from "~/lib/meta";

// Prerendered as /404 → 404.html. Hosts serve it with a 404 status for any
// unknown path; it is never linked to or listed in the sitemap.

export const meta: Route.MetaFunction = () =>
  pageMeta({ title: "Page not found", description: "This page doesn't exist.", path: "/404", noindex: true });

export default function NotFound() {
  return (
    <PageHero title="Page not found" lede="That page doesn't exist, or it has moved. Ask a question below, or try one of these.">
      <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3">
        <li>
          <ArrowLink href="/">Home</ArrowLink>
        </li>
        <li>
          <ArrowLink href="/communities">Communities</ArrowLink>
        </li>
        <li>
          <ArrowLink href="/events">Events</ArrowLink>
        </li>
      </ul>
    </PageHero>
  );
}
