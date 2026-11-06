import { siteConfig } from "~/config";
import { formatDate } from "~/lib/dates";
import { SITE_LINKS } from "./SiteMenu";

export type FooterData = {
  name: string;
  registration: { type: string; authority: string; date: string };
  communityNames: string[];
};

/** Big serif link list, an edge-to-edge wordmark, then the small print. */
export function SiteFooter({ org }: { org?: FooterData }) {
  return (
    <footer className="mt-32 pb-10 sm:mt-44">
      <nav aria-label="Footer" className="px-5">
        <ul className="text-center">
          {SITE_LINKS.filter((l) => l.href !== "/").map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="font-serif text-[clamp(2rem,1.45rem+2.4vw,3.5rem)] leading-[1.15] tracking-[-0.035em] text-ink decoration-1 underline-offset-[0.12em] hover:underline"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="wordmark-wrap mx-auto mt-24 max-w-[90rem] px-5 sm:mt-32 sm:px-8">
        <p className="wordmark text-center text-ink" aria-hidden="true">
          Open Tech Communities
        </p>
      </div>

      <div className="mx-auto mt-10 grid max-w-[90rem] gap-6 px-5 text-sm text-muted sm:grid-cols-3 sm:items-start sm:px-8">
        <p>
          {org ? (
            <>
              <span className="text-ink">{org.name}</span>
              <br />
              {org.registration.type}, {org.registration.authority}. Registered {formatDate(org.registration.date)}.
            </>
          ) : (
            siteConfig.name
          )}
        </p>
        {org && org.communityNames.length > 0 && (
          <p className="sm:text-center">
            <span className="text-ink">{org.communityNames.join(" · ")}</span>
            <br />
            Independent communities, one home.
          </p>
        )}
        <p className="sm:text-right">
          No login, no tracking, no cookies.
          <br />
          Icons: Solar by 480 Design,{" "}
          <a className="underline underline-offset-2" href="https://creativecommons.org/licenses/by/4.0/">
            CC BY 4.0
          </a>
          .
        </p>
      </div>

      <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 px-5 text-sm text-muted">
        <li>
          <a className="hover:text-ink" href="/privacy">
            Privacy
          </a>
        </li>
        <li>
          <a className="hover:text-ink" href="/contact">
            Contact
          </a>
        </li>
        {siteConfig.social.map(({ label, url }) => (
          <li key={label}>
            <a className="hover:text-ink" href={url} rel="me">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
