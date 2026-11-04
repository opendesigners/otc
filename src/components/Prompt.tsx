// The "Ask anything…" pill. A plain GET form to /ask, so it works with no
// JavaScript at all; Phase 3 enhances it on the home page (in-place answer,
// arrow → OTCF mark morph). Used large in the home hero and compact in the
// floating AskBar on inner pages.

import { siteConfig } from "~/config";
import { Icon } from "./icons";

export const QUESTION_MAX_LENGTH = 500;

export function Prompt({ size = "large", id = "ask" }: { size?: "large" | "compact"; id?: string }) {
  const large = size === "large";
  return (
    <form
      action="/ask"
      method="get"
      role="search"
      className={`flex w-full items-center gap-2 rounded-full border border-line bg-page ${
        large ? "py-2 pr-2 pl-6 sm:py-2.5 sm:pr-2.5 sm:pl-7" : "py-1.5 pr-1.5 pl-5"
      }`}
    >
      <label htmlFor={id} className="sr-only">
        Ask a question about OTCF or its communities
      </label>
      <input
        id={id}
        name="q"
        type="text"
        required
        maxLength={QUESTION_MAX_LENGTH}
        autoComplete="off"
        enterKeyHint="send"
        placeholder="Ask anything…"
        className={`min-w-0 flex-1 bg-transparent text-ink placeholder:text-muted focus:outline-none ${
          large ? "text-lg sm:text-xl" : "text-base"
        }`}
      />
      <button
        type="submit"
        className={`morph grid shrink-0 place-items-center rounded-full bg-accent text-accent-ink transition-transform active:scale-95 ${
          large ? "size-12 sm:size-14" : "size-10"
        }`}
      >
        <span className="morph-arrow grid place-items-center">
          <Icon name="arrowRightBold" className={large ? "size-6" : "size-5"} />
        </span>
        <img src={siteConfig.brand.otcf.src} alt="" width={32} height={32} className="morph-mark" />
        <span className="sr-only">Ask</span>
      </button>
    </form>
  );
}
