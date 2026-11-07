// Full-screen menu built on the native popover API: the header's "Menu" button
// opens it, Escape or "Close" dismisses it, and none of it needs JavaScript.
// Browsers without popover support still have every link in the footer.

import { useLocation } from "react-router";
import { Logo, MENU_ID } from "./SiteHeader";

export const SITE_LINKS = [
  { href: "/", label: "Ask a question" },
  { href: "/about", label: "About" },
  { href: "/communities", label: "Communities" },
  { href: "/projects", label: "Projects" },
  { href: "/impact", label: "Impact" },
  { href: "/events", label: "Events" },
  { href: "/partner", label: "Partner with us" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteMenu() {
  const { pathname } = useLocation();

  return (
    <div id={MENU_ID} popover="auto" className="site-menu" aria-label="Site menu">
      <div className="flex min-h-full flex-col">
        <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-7">
          <Logo />
          <button
            type="button"
            popoverTarget={MENU_ID}
            popoverTargetAction="hide"
            className="rounded-full bg-panel px-5 py-2.5 text-[0.9375rem] font-medium tracking-[-0.01em] text-ink"
          >
            Close
          </button>
        </div>
        <nav aria-label="Main" className="flex flex-1 items-center justify-center px-5 py-10">
          <ul className="space-y-1 text-center sm:space-y-2">
            {SITE_LINKS.map(({ href, label }, i) => {
              const current = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href} style={{ "--i": i } as React.CSSProperties}>
                  <a
                    href={href}
                    aria-current={current ? "page" : undefined}
                    className="font-serif text-[clamp(2.25rem,1.6rem+3vw,4.25rem)] leading-[1.12] tracking-[-0.035em] text-ink decoration-1 underline-offset-[0.12em] hover:underline aria-[current=page]:text-accent"
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
