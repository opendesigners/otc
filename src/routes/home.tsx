import type { Route } from "./+types/home";
import { getContent, includesDrafts } from "~/content";

// Phase 1 placeholder: proves the content pipeline end to end. Replaced by the
// prompt-first home (which will opt in to hydration) in Phase 3.

export function loader() {
  return {
    includesDrafts,
    docs: getContent().map(({ file, route, kind, title, summary, publish }) => ({
      file,
      route,
      kind,
      title,
      summary,
      publish,
    })),
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { docs, includesDrafts } = loaderData;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16">
      <h1 className="font-serif text-3xl leading-tight">Find your way into Nigeria&rsquo;s open tech communities.</h1>
      <p className="mt-3 text-muted">
        Scaffold check — {docs.length} content files loaded{includesDrafts ? " (drafts shown)" : ""}.
      </p>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {docs.map((doc) => (
          <li key={doc.file} className="py-4">
            <p className="text-sm text-muted">
              {doc.route} · {doc.kind}
              {!doc.publish && " · draft"}
            </p>
            <p className="mt-1 font-medium">{doc.title}</p>
            <p className="mt-1 text-sm text-muted">{doc.summary}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
