// Date-aware events on static HTML.
//
// Pages are prerendered once, so an event's "upcoming" / "happening now" /
// "recap" state is baked in on build day. Any element with data-event-start
// and data-event-end carries that state in data-event-state, and CSS in
// app.css shows the matching .when-* blocks. This tiny inline script (no React,
// no hydration) recomputes the state from today's date in Lagos, so pages flip
// to "recap" on their own after endDate. Without JS, the build-day state stays.

import type { EventState } from "~/lib/dates";

const SCRIPT = `(function(){try{var p={};new Intl.DateTimeFormat("en",{timeZone:"Africa/Lagos",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).forEach(function(x){p[x.type]=x.value});var t=p.year+"-"+p.month+"-"+p.day;document.querySelectorAll("[data-event-start]").forEach(function(e){var s=e.getAttribute("data-event-start"),n=e.getAttribute("data-event-end");e.setAttribute("data-event-state",t<s?"upcoming":t>n?"past":"live")})}catch(_){}})();`;

/** Spread onto the element that wraps an event's .when-* blocks. */
export function eventStateAttrs(event: { startDate: string; endDate: string }, buildState: EventState) {
  return {
    "data-event-start": event.startDate,
    "data-event-end": event.endDate,
    "data-event-state": buildState,
  };
}

/** Render once, after all event elements on the page. */
export function EventStateScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}

/** "Upcoming" / "Happening now" / "Recap", switched by CSS. */
export function EventStateLabel() {
  return (
    <>
      <span className="when-upcoming">Upcoming</span>
      <span className="when-live">
        <span className="live-dot" aria-hidden="true" />
        Happening now
      </span>
      <span className="when-past">Recap</span>
    </>
  );
}
