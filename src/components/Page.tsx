// Building blocks for the static pages, in america.gov's language: centred
// oversized serif titles ending in a full stop, a narrow column of large muted
// text, pill buttons, and soft grey rounded cards. No shadows.

import type { ReactNode } from "react";
import { Icon, type IconName } from "./icons";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>;
}

/** The reading column: ~60–70 characters at the prose size. */
export function Narrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[38rem] px-5 ${className}`}>{children}</div>;
}

/** Adds the closing full stop america.gov puts on titles, unless one's there. */
export function withStop(title: string) {
  return /[.!?]$/.test(title) ? title : `${title}.`;
}

export function PageHero({
  title,
  lede,
  label,
  children,
}: {
  title: string;
  lede?: ReactNode;
  /** A short status pill above the title (e.g. an event's state). Not an eyebrow on every page. */
  label?: ReactNode;
  children?: ReactNode;
}) {
  const long = title.length > 28;
  return (
    <header className="px-5 pt-14 pb-12 text-center sm:pt-24 sm:pb-16">
      {label && (
        <p className="enter mb-6 inline-flex rounded-full bg-accent-soft px-3.5 py-1 text-sm font-medium text-accent">{label}</p>
      )}
      <h1 className={`type-title enter mx-auto max-w-5xl ${long ? "type-title-long" : ""}`} style={{ "--d": 40 } as React.CSSProperties}>
        {withStop(title)}
      </h1>
      {lede && (
        <p className="type-lede enter mx-auto mt-6 max-w-2xl sm:mt-8" style={{ "--d": 160 } as React.CSSProperties}>
          {lede}
        </p>
      )}
      {children && (
        <div className="enter mt-8 flex flex-wrap justify-center gap-3 sm:mt-10" style={{ "--d": 260 } as React.CSSProperties}>
          {children}
        </div>
      )}
    </header>
  );
}

/** Content HTML rendered from Markdown at build time (trusted: authored in this repo). */
export function Prose({ html }: { html: string }) {
  return (
    <Narrow>
      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
    </Narrow>
  );
}

/** A centred serif section heading with generous space above, like america.gov's "Press". */
export function Section({
  title,
  id,
  children,
  className = "",
}: {
  title: string;
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`mt-28 scroll-mt-10 sm:mt-40 ${className}`} aria-labelledby={id ? `${id}-title` : undefined}>
      <h2 id={id ? `${id}-title` : undefined} className="type-section px-5 text-center">
        {withStop(title)}
      </h2>
      <div className="mt-12 sm:mt-16">{children}</div>
    </section>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[var(--radius-card)] bg-panel p-6 sm:p-8 ${className}`}>{children}</div>;
}

const external = (href: string) => /^https?:\/\//.test(href);

/** Rounded-full link styled as a button. Primary = accent; soft = panel grey. */
export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "soft";
}) {
  const style = variant === "primary" ? "bg-accent text-accent-ink" : "bg-panel text-ink";
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-[0.9375rem] font-medium tracking-[-0.01em] transition-transform active:scale-[0.97] ${style}`}
    >
      {children}
      {external(href) && <Icon name="arrowRightUp" className="size-4" />}
    </a>
  );
}

/** Ink, medium-weight text link with an arrow — america.gov's "See how it works". */
export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="group inline-flex items-center gap-1.5 font-medium text-ink">
      <span className="underline decoration-line decoration-1 underline-offset-4 group-hover:decoration-ink">
        {children}
      </span>
      <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

export function DraftBanner({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <Narrow className="mb-10">
      <p className="rounded-full border border-dashed border-accent px-4 py-2 text-center text-sm text-accent">
        Draft — visible in development only. Publish once every TODO is filled.
      </p>
    </Narrow>
  );
}

/** Label/value rows for key facts, inside a soft card. */
export function Facts({ rows }: { rows: Array<{ label: string; value: ReactNode; icon?: IconName }> }) {
  return (
    <Narrow>
      <Card className="py-2 sm:py-2">
        <dl className="divide-y divide-line">
          {rows.map(({ label, value, icon }) => (
            <div key={label} className="grid gap-1 py-4 sm:grid-cols-[9.5rem_1fr] sm:gap-6">
              <dt className="flex items-center gap-2 text-sm text-muted">
                {icon && <Icon name={icon} className="size-4" />}
                {label}
              </dt>
              <dd className="text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </Narrow>
  );
}
