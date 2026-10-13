# Phase 4A verification — 2026-10-13

## Changes

- `src/App.tsx`: progressive location method/area steps, explicit vehicle variant correction,
  automatic configuration warning, search suggestions, working bottom search navigation,
  SKU removal from product titles, image notes and clearer product/seller presentation.
- `src/demo.ts`: location step and warning acknowledgement state, incomplete/unknown/mock-match
  presentation, configuration rule, corrected VASURE identity, removed authenticity/warranty
  title claims, temporary physical channel for map with restoration on exit.
- `src/SearchResults.tsx`: compact vehicle context, warning acknowledgement/explanation sheet,
  removed permanent example shortcuts, disabled internet-only map filter with explanation.
- `src/Discovery.tsx`: clearer store/offer grouping, selected marker preview, action to the
  matching store's offers with focus and scrolling.
- `src/BottomSheet.tsx`: focus stays inside the sheet when its contents change or one sheet
  replaces another; returns to a surviving trigger or the search input on dismissal.
- `src/index.css`: image containment, consistent card spacing, separate brand text,
  dark scrollbars, readable seller hierarchy and compact disclosure styling.
- `tests/ux.test.ts`, `tests/README.md`, `tests/UX-AUDIT.md`: seven new focused tests and audit.

The existing 17 tests and prior uncommitted baseline work were preserved.

## Interaction audit

| Visible control | Behavior |
| --- | --- |
| Search field | Opens suggestion sheet by click or Arrow Down; typed query submits with Enter/search button. |
| Suggestions | Query input/submit, vehicle-part example, exact demo ID and ambiguous example work. Escape/close retains committed query. |
| Bottom search | Opens suggestions on results; returns to search results from a product. |
| Vehicle year/gearbox/variant | Dark radio groups edit drafts only. Apply commits; close/Escape/backdrop discard; skip keeps browsing. |
| Type 5 automatic correction | Explicitly select unknown variant or manual gearbox, or continue with unknown compatibility. Never selects Type 6 automatically. |
| Compatibility explanation | Acknowledge compresses warning; explanation remains accessible; correction opens vehicle sheet. |
| Location method | Simulated current location selects Yousefabad; manual opens area step; decline permits browsing. |
| Manual location | Selected area has check/pressed state; Back returns to method; Close cancels; selecting an area commits it. |
| Discovery tabs | Product/store/map views, RTL arrow keys and Home/End work. Query and journey context persist. |
| Purchase channel | All/online/physical filter offers. Map temporarily uses physical when entering from online, restores online on exit unless explicitly changed. |
| Near Me | Uses selected mock area; prompts if absent. Disabled online. Nearby store ordering changes with area. |
| Result sorting | Relevance fixture order, ascending/descending minimum price and proximity work; unavailable proximity is disabled. |
| Product/store offers | Open matching product and offer. Selected offer is highlighted; card minimum prices/counts use correct channel offers. |
| Map pins/list | Select same physical store fixtures; preview opens correct offer; view-offers action scrolls/focuses matching store. |
| Product Back / seller tabs | Return preserves context; seller tabs update offers/counts/price scope and clear selected-offer highlight. |
| Seller sorting | Fixture rank, lowest price and area proximity work. Online/no-area proximity disabled. |
| Contact / routing / online purchase | Accessible status explains unavailable real actions; no fake success or external launch. |
| Price/brand/category/installment footer; other nav; alert/favorite/share | Explicitly disabled with prototype-scope descriptions; no blocking native alerts. |
| Specs | Opens existing vehicle sheet. Camera/mic-like static search decorations and false carousel dots removed. |

## Automated and browser verification

`npm run build`, `npx tsc --noEmit`, `node --test tests/*.test.ts`: 24 tests pass.
No build warnings. Existing regression files were not edited for this phase.

Browser journeys checked at measured 390 × 844 and 360 × 800 viewports:
initial results, search suggestions/SKU/ambiguous/typed queries, vehicle apply/dismiss and
keyboard focus wrapping, ۱۳۹۷/manual mixed mock matches, ۱۴۰۱/automatic all unknown,
correction and compressed explanation, progressive manual back/close/selected states,
simulated current location, location decline, both areas' proximity ordering, three views,
map selection/preview/store offers, product identity and seller channels, sorting, back,
and scope-limited seller actions. Images/icons loaded; no horizontal document overflow;
seller actions remain accessible above fixed navigation through scrolling. No console
warnings/errors observed after local server restart.

Screenshots include initial search, compatibility/conflicting sheet, mock-match and
uncertain scenarios, location/method/manual, products, stores, map, product, and
physical/online offers at both widths. A separate HTML screenshot gallery accompanies
the task artifacts.

## Remaining limitations and assumptions

- All fitment records, offers, ratings, distances and addresses remain fictional. A green
  label means an exact match in the mock dataset, never genuine automotive validation.
- The Type 5/manual association is a consistency rule requested in the brief, not a
  certified variant catalogue. An attempted independent web lookup was unavailable.
  Variant correction supports Type 5 or unknown; there is no invented Type 6 dataset.
- The VASURE name follows the visible packaging in the original photo. The Golden photo
  does not independently establish its brand; detail labels this limitation. Product 4
  retains the shared Valeo photo with an explicit representative-image note.
- Original images are small (roughly 176–180px wide); enlarged detail photos remain soft.
  No unrelated or generated replacement photos were used.
- The longer configuration sheet scrolls on mobile; its actions are reachable within
  the modal and are not covered by the application's fixed footer.
- Search supports only existing fixture patterns and demo IDs. Location is simulated;
  pins are schematic percentages, not real coordinates. No GPS/backend or live stock.
- State persists through screen transitions in React memory; reload resets the journey.
- Auxiliary disabled controls and real purchasing/contact/routing remain outside scope.

No commit, push or deployment was performed.
