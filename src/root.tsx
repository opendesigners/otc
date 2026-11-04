import { useContext } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  UNSAFE_FrameworkContext,
  useMatches,
} from "react-router";
import type { Route } from "./+types/root";
import { siteConfig } from "./config";
import "./app.css";

/**
 * Pages are static HTML with zero client JS by default. A route opts in to
 * hydration with `export const handle: RouteHandle = { hydrate: true }` —
 * only home and /ask should (they host PromptBox, CommunityCycler and
 * AnswerStream).
 */
export type RouteHandle = { hydrate?: boolean };

export const links: Route.LinksFunction = () => [{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" }];

export const meta: Route.MetaFunction = () => [
  { title: `${siteConfig.name} — Nigeria's open tech communities` },
  {
    name: "description",
    content:
      "One front door to Nigeria's open tech communities: Open Designers, Open Devs and GDG Ilorin. Ask a question, get a short answer and the right link.",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const matches = useMatches();
  const framework = useContext(UNSAFE_FrameworkContext);
  const hydrate =
    // Dev always loads scripts so HMR works.
    import.meta.env.DEV ||
    // With `ssr: false` React Router also emits an SPA fallback shell
    // (__spa-fallback.html) and refuses to build unless it can hydrate. We never
    // route traffic to it. isSpaMode is true only for that shell, never for a
    // prerendered page; if an upgrade changes this, the build fails loudly.
    framework?.isSpaMode ||
    matches.some((m) => (m.handle as RouteHandle | undefined)?.hydrate);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#faf8f4" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#161513" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-dvh flex flex-col">
        {children}
        {hydrate && (
          <>
            <ScrollRestoration />
            <Scripts />
          </>
        )}
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16">
      <h1 className="font-serif text-3xl">{notFound ? "Page not found" : "Something went wrong"}</h1>
      <p className="mt-3 text-muted">
        {notFound ? "That page doesn't exist." : "Please try again in a moment."}{" "}
        <a className="underline" href="/">
          Go to the home page
        </a>
        .
      </p>
    </main>
  );
}
