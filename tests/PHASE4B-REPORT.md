# Phase 4B — Rich Search Scenarios

Implemented locally without resetting, committing, pushing or deploying. The existing
Phase 4A UI, location sheets, seller flows, mock fitment records and 24 tests are preserved.

## Behavior

- **Part + vehicle:** `دیسک و صفحه ۲۰۶ تیپ ۵` still shows four candidates immediately,
  collects only missing year/gearbox, and supports incomplete, unknown and conflicting
  configurations. The existing ۱۳۹۷/manual demonstration has confirmed and unknown
  mock states; ۱۴۰۱/automatic remains unverified and warns about the Type 5 configuration.
- **Manufacturer identifier:** `والئو 826211` opens one canonical product with four
  distinct fictional offers: two physical and two online. Counts, prices, store groups,
  map previews and detail offers are derived from that product's offers. No vehicle
  wizard opens. The real Torob listing count is neither verified nor claimed.
- **Broad category:** `کلاچ` opens a five-step bottom sheet: brand, dependent model,
  optional year, transmission and part type. All five requested brands and twelve
  models have demonstration journeys. Changing brand resets model/specification drafts.
  Back/edit, close/Escape and unknown paths are supported; dismissal discards drafts.
  Applying commits vehicle/year/gearbox/part selections together. The chosen query,
  vehicle, area, discovery view and product context survive navigation.
- Each catalog model has two mock kit candidates plus bearing, cable and hydraulic
  candidates. These are conceptual choices requiring verification, not evidence that
  every listed model actually uses each component. New catalog fitment stays UNKNOWN.
- Product/store/map share the matching offer set. Result price sorts and area-based
  nearest ordering work. Map discovery stays physical and illustrative. Card labels
  distinguish the two kit options while retaining the dark two-column RTL layout.

## Files changed in this phase

| Files | Responsibility |
| --- | --- |
| `src/App.tsx` | New search suggestions, registry lookup, manufacturer identity details, wizard mounting and clearer fictional-offer labels |
| `src/SearchResults.tsx` | Guided-search entry/summary and results, exact-number explanation |
| `src/Discovery.tsx` | Unified product registry and explicit fictional-offer labels |
| `src/demo.ts` | Shared wizard/journey state and common matching, sorting and offer navigation |
| `src/index.css` | Small wizard and technical-reference styles; existing visual structure retained |
| `src/GuidedSearch.tsx` (new) | Accessible progressive bottom-sheet UI |
| `src/domain.ts` (new) | Shared data types |
| `src/query.ts` (new) | Explicit normalized identifier/phrase grammar; no arbitrary identifier substring matching |
| `src/vehicleCatalog.ts` (new) | Five brands, twelve models and deliberately unspecified production-year metadata |
| `src/guided.ts` (new) | Dependent choices, draft validation and year normalization |
| `src/products.ts` (new) | Preserved four products, canonical Valeo item and separate fictional catalog candidates |
| `src/offers.ts` (new) | Product-owned offer fixtures, canonical four offers and coherent mock store distances |
| `src/fitment.ts` (new) | Preserved explicit mock fitment tuples and conservative rules |
| `src/assets.ts` (new) | Asset identity/provenance/reuse decisions |
| `public/assets/neutral-part.svg` (new) | Locally authored neutral placeholder, explicitly not an actual product photo |
| `tests/rich-search.test.ts` (new) | 18 focused regression tests |
| `tests/README.md` | Updated fixture limitations and browser verification notes |
| `tests/PHASE4B-REPORT.md` (new) | This report |

The existing uncommitted `tsconfig.json`, `BottomSheet.tsx` and earlier tests were not
overwritten. Configuration/dependencies were not changed.

## Verification

- `node --test tests/*.test.ts`: **42 passed**, including all 24 existing tests unchanged.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed, no warnings.
- Browser walkthroughs at **390×844** and **360×800** covered all three scenarios,
  product/store/map switching, physical/online offers and back navigation.
- Complete journeys for all five brands were checked at 390px. Dependent model reset,
  invalid year blocking, unspecified year/part, wizard dismissal and sorting were checked.
- Nearest ordering changes from ثریاکو in یوسف‌آباد to یدک غرب in صادقیه.
- Images loaded, no horizontal overflow or browser console warnings/errors were observed.
  At 360px the last seller action's bottom was 695px, above fixed navigation beginning
  at 744px. Scrolling remains available for long results/sheets/seller lists.
- **55 screenshots** capture initial search, compatibility states, wizard steps, all
  five brand results, location, product/store/map views and physical/online seller flows.
  Gallery: `C:/Users/SadidGostaran.Co/.codex/visualizations/2026/10/13/01a134f8-13d2-70d1-9287-173b997cc011/phase4b-gallery.html`.

## Reference and remaining limitations

Valeo's official page confirms KIT3P, part **826211**, and EAN **3276428262116**:
https://www.valeoservice.co.uk/en-uk/techassist/supplier/21/product/826211
This establishes identity, not fitment for a chosen Iranian model/year/transmission.

Reuse permission for the supplied CDN photo was not established. It was not copied,
stored or hotlinked; the project uses its own neutral placeholder. Existing Phase 4A
photos remain untouched, with their original licence provenance still unverified.

The parser/catalog are intentionally small fixtures. Year input validates four-digit
format only, not actual production validity. All prices, sellers' offers, ratings and
distances are fictional; map pins are schematic, without actual coordinates. There is
no backend, GPS, real inventory, purchase, contact or routing integration. Physical
devices, mobile keyboards and assistive technology were not tested beyond browser
keyboard/focus interactions. Journey state is in React memory and resets on reload.
No blocking visual problem was observed; placeholders and inherited low-resolution
photos remain a visual limitation compared with licensed product photography.
