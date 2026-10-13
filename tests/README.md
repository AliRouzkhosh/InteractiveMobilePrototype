# Prototype regression checks

Run `node --test tests/*.test.ts`, `npx tsc --noEmit`, and `npm run build`.
The tests use Node's built-in TypeScript support (Node 22.18+ or Node 24).

Phase 2 regression checks retain offer ownership, price sorting, area-dependent proximity,
skip/decline browsing and navigation coverage. Their default-vehicle assumptions were
updated for Phase 3: initial year and gearbox are unset; fitment tests explicitly select
the known demo tuple instead of treating defaults as user input.

Phase 3 checks cover the fixture query interpreter, uncommitted sheet drafts, dismissal,
unknown details, exact SKU filtering, three-view navigation, matching store and map offers,
and independent channel/proximity controls. The TypeScript check also includes these tests.

## Fixture limitations

- The parser recognizes the explicit `دیسک و صفحه` / `کیت کلاچ` + `۲۰۶ تیپ ۵` pattern
  and the four exact `SKU-DEMO-*` IDs. It is not a general search engine or AI model.
- Demo fitment confirmations only cover products 1 and 4 for ۱۳۹۷ manual, and product 2
  for ۱۳۹۹ manual. Missing/other combinations are unknown, not confirmed or rejected.
- Prices are fictional integer tomans. Counts and minima come from the applicable offers.
- Store ratings, addresses and area distances are fixtures, not verified reputation,
  live availability, GPS or routing information. Pins are diagram percentages, not coordinates.
- Near Me limits discovery to physical offers and orders by the chosen area's mock distances;
  no real geographic radius or coverage is implied. Online offers do not have proximity.
- Map previews link to the correct product and highlight the selected offer in the existing
  seller list. Switching the purchase tab clears that offer highlight.
- Journey context is kept in React memory through screen changes; page reload resets it.

## Mobile browser checklist

At 390px and a narrower viewport, verify initial results without a dialog; open the vehicle
sheet; select ۱۳۹۷/manual and apply; check confirmed and unknown badges; edit and dismiss
without committing; select ۱۳۹۹/automatic and check the no-confirmation explanation.
Use Near Me, choose each area, switch products/stores/map, select a marker, open its offer,
switch seller tabs and return. Verify price scope and preserved query/vehicle/area/view.
Check exact SKU and ambiguous query examples, sheet Escape/backdrop dismissal and keyboard
focus containment/restoration, image containment, and scrolling above the fixed navigation.

Verified in the local Vite browser at 390 × 844 and 360 × 800: vehicle apply/dismiss/skip,
۱۳۹۹ automatic preservation on detail/back, confirmed and unknown fixture states,
location decline and both area selections, changing nearest store order, all three views,
store and map offer ownership, seller channel switching, exact SKU and ambiguous examples,
typed search submission, price sorting, Escape/backdrop dismissal, keyboard focus wrap and
restoration, loaded/contained product images, and seller actions above fixed navigation.
No browser console warnings or errors were observed.

Phase 4A retains these 17 tests unchanged and adds seven in `ux.test.ts`.
See `UX-AUDIT.md` for the interaction audit, updated presentation rules and mobile checks.

## Phase 4B rich search

All 24 existing regression tests are retained unchanged. `rich-search.test.ts` adds 18 checks
for manufacturer-number grammar, exact-product grouping, all five brands and twelve models,
dependent selections, wizard draft/apply/dismiss, unknown and invalid values, conservative
automatic fitment, product-specific offers, sorting, proximity, views and navigation.

The three suggestions are the existing 206 Type 5 query, `والئو 826211`, and `کلاچ`.
The parser uses complete supported identifiers/phrases. Internal SKU aliases remain accepted
for backwards-compatible regression fixtures, but are absent from search suggestions/titles.

Data responsibilities are split between `query.ts`, `vehicleCatalog.ts`, `fitment.ts`,
`products.ts`, `offers.ts`, `assets.ts` and shared `domain.ts`. `guided.ts` validates wizard
drafts. `demo.ts` retains journey state and discovery/sorting helpers.

Valeo's technical page was checked and confirms KIT3P, reference 826211 and EAN
3276428262116: https://www.valeoservice.co.uk/en-uk/techassist/supplier/21/product/826211
This confirms identity, not the chosen Iranian vehicle/year fitment. The canonical item has
four fictional offers (two physical, two online), from the same mock store/distance dataset.
No real Torob offer count has been checked or claimed.

No external product photo was stored or hotlinked: reuse permission for the supplied CDN
reference was not established. The new neutral SVG is locally authored, explicitly labeled,
and does not depict actual branded packaging. Existing Phase 4A images are preserved;
their original licences remain outside this verification.

Each catalog model has two fictional kit candidates and one bearing, cable and hydraulic
candidate. These are conceptual demonstration choices, not assertions that each car uses
all these components. All new catalog products have UNKNOWN fitment, including automatic
configurations. The three existing mock fitment tuples are unchanged. Catalog year metadata
is empty: users may enter a four-digit year or skip it; the input validates format only,
not real production-year validity. The catalog and parser are intentionally incomplete.

Browser walkthroughs at 390×844 and 360×800 covered all three searches, all five brand
journeys (at 390px), all wizard steps, dependent brand/model resets, invalid year blocking,
unknown year/part paths, Escape/draft dismissal, product/store/map views, selected offer
ownership, seller tabs/back, result price sorting, area-dependent nearest ordering and
scrolling the last seller action above fixed navigation. No horizontal overflow, broken
images or browser console warnings/errors were observed. Real device keyboards, GPS,
real inventory/contact/purchases and real geographic accuracy are not implemented/verified.
State remains in React memory; page reload starts a new journey.

## Phase 4C current baseline

All 42 previous tests remain unchanged; `polish.test.ts` adds ten checks. Run the same
test/build/TypeScript commands above. The current total is 52 passing tests.

Every model now has three illustrative year chips plus Other Year and Unknown options.
Authoritative production-validity metadata remains unspecified. Five exact fictional
broad-search tuples add documented mixed green/unknown paths; automatic kits remain
unverified. These supersede Phase 4B's all-unknown catalog state described above.

See `PHASE4C-REPORT.md` for demonstration paths, changed files, unified badges,
disclosure behavior, browser checks at both mobile widths and the self-contained
51-screenshot gallery. Existing historical reports remain unchanged.
