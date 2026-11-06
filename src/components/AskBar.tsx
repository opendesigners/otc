import { Prompt } from "./Prompt";

/**
 * Floating "Ask anything…" pill pinned to the bottom of inner pages, as on
 * america.gov. Pure HTML form (no JS). Instead of a shadow, the page fades into
 * a page-coloured band behind it so scrolling text never collides with the
 * pill. The page reserves space for it via `pb-28` on <body> (see root.tsx).
 *
 * `dock` (home): hidden while the hero prompt is on screen, then rises into
 * place as it scrolls off the top — a CSS scroll timeline, still no JS. See
 * .ask-dock in app.css.
 */
export function AskBar({ dock = false }: { dock?: boolean }) {
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-page from-45% to-transparent px-3 pt-10 pb-3 sm:pb-5 ${dock ? "ask-dock" : ""}`}
    >
      <div className="pointer-events-auto mx-auto max-w-xl">
        <Prompt size="compact" id="ask-bar" />
      </div>
    </div>
  );
}
