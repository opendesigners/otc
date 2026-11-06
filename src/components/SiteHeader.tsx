import { siteConfig } from "~/config";
import { Mark } from "./Mark";

export const MENU_ID = "site-menu";

export function Logo() {
  return (
    <a href="/" className="flex items-center gap-2.5" aria-label={`${siteConfig.name} — home`}>
      <Mark size={30} className="size-[1.875rem]" />
      <span className="font-serif text-[1.625rem] leading-none tracking-[-0.035em]">
        <span className="sm:hidden">{siteConfig.shortName}</span>
        <span className="hidden sm:inline">Open Tech Communities</span>
      </span>
    </a>
  );
}

/** Logo left, one "Menu" pill right (opens the popover in SiteMenu). */
export function SiteHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-5 py-5 sm:px-8 sm:py-7">
      <Logo />
      <button
        type="button"
        popoverTarget={MENU_ID}
        className="rounded-full bg-accent px-5 py-2.5 text-[0.9375rem] font-medium tracking-[-0.01em] text-accent-ink transition-transform active:scale-95"
      >
        Menu
      </button>
    </header>
  );
}
