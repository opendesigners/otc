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
  useRouteLoaderData,
} from "react-router";
import type { Route } from "./+types/root";
import { AskBar } from "./components/AskBar";
import { PageHero } from "./components/Page";
import { SiteFooter, type FooterData } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { SiteMenu } from "./components/SiteMenu";
import { siteConfig } from "./config";
import { getCommunitySummaries, getOrg } from "./content";
import "./app.css";

/**
 * Per-route layout switches, set with `export const handle: RouteHandle = {…}`.
 * - hydrate: load client JS. Pages are static HTML with zero JS by default;
 *   only home and /ask should opt in (PromptBox, CommunityCycler, AnswerStream).
 * - ownHeader: the route draws SiteHeader itself (home puts it inside the hero panel).
 * - askBar: the floating "Ask anything…" pill. Shown by default; false hides it;
 *   "dock" keeps it hidden until the page's `.hero-prompt` scrolls away (home).
 */
export type RouteHandle = { hydrate?: boolean; ownHeader?: boolean; askBar?: boolean | "dock" };

export function loader(): { org: FooterData } {
  const { title, registration } = getOrg();
  return {
    org: { name: title, registration, communityNames: getCommunitySummaries().map((c) => c.title) },
  };
}

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  { rel: "preload", href: "/fonts/newsreader-display.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
];

export const meta: Route.MetaFunction = () => [
  { title: `${siteConfig.name} · Nigeria's open tech communities` },
  {
    name: "description",
    content:
      "One front door to Nigeria's open tech communities: GDG Ilorin, Open Designers and Open Devs. Ask a question, get a short answer and the right link.",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const matches = useMatches();
  const framework = useContext(UNSAFE_FrameworkContext);
  const rootData = useRouteLoaderData<typeof loader>("root");
  const handles = matches.map((m) => (m.handle ?? {}) as RouteHandle);
  const hydrate =
    // Dev always loads scripts so HMR works.
    import.meta.env.DEV ||
    // With `ssr: false` React Router also emits an SPA fallback shell
    // (__spa-fallback.html) and refuses to build unless it can hydrate. We never
    // route traffic to it (postbuild deletes it). isSpaMode is true only for that
    // shell, never for a prerendered page; if an upgrade changes this, the build
    // fails loudly. See CLAUDE.md → "React Router internals we depend on".
    framework?.isSpaMode ||
    handles.some((h) => h.hydrate);
  const ownHeader = handles.some((h) => h.ownHeader);
  const askBar = handles.findLast((h) => h.askBar !== undefined)?.askBar ?? true;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a100d" />
        <Meta />
        <Links />
      </head>
      <body className={`flex min-h-dvh flex-col ${askBar ? "pb-28" : ""}`}>
        <a
          href="#main"
          className="sr-only rounded-full bg-ink px-4 py-2 text-page focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-30"
        >
          Skip to content
        </a>
        {!ownHeader && (
          <div className="w-full">
            <SiteHeader />
          </div>
        )}
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter org={rootData?.org} />
        {askBar && <AskBar dock={askBar === "dock"} />}
        <SiteMenu />
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
    <PageHero
      title={notFound ? "Page not found" : "Something went wrong"}
      lede={
        <>
          {notFound ? "That page doesn't exist." : "Please try again in a moment."}{" "}
          <a className="link" href="/">
            Go to the home page
          </a>
          .
        </>
      }
    />
  );
}
