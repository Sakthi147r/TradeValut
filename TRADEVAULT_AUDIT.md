# TradeValut Product and Engineering Audit

**Repository audited:** `Sakthi147r/TradeValut`  
**Branch and revision:** `main` at `96acd2c`  
**Audit date:** 2026-09-05  
**Author:** Manus AI

## Executive conclusion

TradeValut has a polished storefront foundation, a coherent visual identity, a functioning Shopify catalog and checkout handoff, authenticated favorites, quote requests, newsletter capture, supplier pages, and a buyer guide. The repository is in good shape as a **curated wholesale storefront prototype**.

It is not yet a differentiated or operationally complete **B2B sourcing marketplace**. The largest gap is not visual design. It is the distance between the product’s claims and the data, workflows, and evidence that a business buyer needs before placing a wholesale order. The next phase should therefore prioritize **trustable product data, MOQ-correct purchasing, quote and logistics workflows, buyer workspaces, and measurement** before adding more decorative features.

The most important immediate risk is that several trust signals appear hardcoded rather than sourced from verifiable records. Examples include buyer ratings, review counts, supplier founding dates, verification dates, laboratory-testing claims, and global-delivery claims. These should either be backed by real data and evidence or be removed until they can be substantiated.

## Current baseline

The current implementation has several strengths.

| Area | Current state | Assessment |
|---|---|---|
| Catalog | Shopify Storefront API returns 50 products with INR prices, titles, images, and variants | Strong prototype baseline |
| Commerce | Shopify cart creation, retrieval, line updates, removal, and checkout URL handoff | Functional, but not yet MOQ-aware |
| Frontend | Home, product, supplier, and buyer-guide routes with responsive styling | Visually differentiated and coherent |
| Customer features | OAuth-backed profile lookup, favorites, newsletter subscriptions, and quote requests | Good initial coverage |
| Architecture | Backend-agnostic commerce types and a Shopify adapter seam | Sound direction |
| Validation | Zod inputs, protected customer procedures, typed tRPC router | Good foundation |
| Verification | TypeScript check, 11 automated tests, production build | Passing after dependencies were installed |
| Production readiness | Missing operational safeguards, evidence-backed trust data, SEO infrastructure, and full buyer workflow | Not ready for serious B2B scale |

The local verification run produced the following result:

- `pnpm check`: passed.
- `pnpm test`: passed, with **11 tests passed and 1 live smoke test skipped** because live Shopify credentials were not present in the audit shell.
- `pnpm build`: passed.
- The build emitted warnings because the analytics placeholders in `client/index.html` were not defined and the analytics script lacks `type="module"`.
- `pnpm` also warned that the legacy `pnpm` configuration block in `package.json` is no longer read by the installed pnpm version.

## Highest-priority gaps

### 1. Trust claims are stronger than the underlying evidence

The product page presents `4.9 (86 buyer notes)` and `Best seller` as if they were live product data. It also displays `Lab tested & certified`, `Global delivery`, `Verified supplier`, and supplier establishment or verification dates. Supplier pages present `Documentation on file`, `Organic-first`, and `Global delivery support`. The implementation does not show a review model, certification model, evidence document model, supplier verification workflow, or source of truth for these statements.[1] [2] [3]

This creates a material credibility and compliance risk. A wholesale buyer may reasonably interpret these as factual commercial claims. Replace hardcoded claims with one of three states: **verified and linked to evidence**, **seller-provided and clearly labeled**, or **not displayed**. Add a visible verification method, document type, issuer, issue date, expiry date, and last-reviewed date for each certification or claim.

### 2. The purchase flow does not enforce wholesale minimums

The UI displays a product MOQ, but product cards, supplier cards, product detail, and cart actions commonly add or start with quantity `1`. The product detail quantity stepper also starts at `1`, while the interface tells the buyer that the order is being sourced at the minimum order quantity. The cart permits decrementing to zero or incrementing one unit at a time. This is inconsistent with the core wholesale promise.[2] [4]

Represent MOQ as structured data rather than a display tag. Initialize quantities to the MOQ, enforce quantity multiples where applicable, validate the rule on the server, show the next price tier, and explain pack size or case size. If a product is quote-only, do not expose a misleading retail-like add-to-cart path.

### 3. Pricing tiers are illustrative and disconnected from commerce pricing

The product page calculates discount tiers by multiplying the first Shopify price by fixed percentages. These tiers are not returned by Shopify, are not persisted in the database, and are not used to create the cart. The packaging/specification selector is also visual only; its selected value is not submitted to Shopify or the quote request.[2]

This is dangerous for a B2B buyer because the page can show a price that differs from the checkout price. Store price breaks, pack units, currency, effective dates, and eligibility in a server-owned pricing model or retrieve them from the commerce system. Mark estimates as estimates and show the authoritative checkout or quote amount before commitment.

### 4. Product variants are not actually selectable

The normalized product contract includes options and variants, but the UI selects `product.variants[0]` on cards, supplier pages, and product pages. Buyers cannot choose a size, grade, pack, or specification when multiple variants exist. This can produce the wrong price, wrong availability, or wrong merchandise ID.[2] [5]

Add a variant-selection component driven by `product.options` and `selectedOptions`. Recompute price, availability, MOQ, pack size, and cart payload when a selection changes. Add automated tests for variant selection and unavailable combinations.

### 5. The site is a storefront, not yet a complete sourcing workflow

A serious wholesale buyer needs company identity, business email, destination country, target volume, packaging requirements, certifications, expected delivery date, incoterms, payment terms, samples, recurring-order support, and a response SLA. The quote form currently accepts only email, optional product handle, quantity, and free-text message.[3]

The quote workflow should become a first-class RFQ object. Add structured fields, attachments, multiple line items, status transitions, buyer notifications, internal assignment, supplier response, quote expiry, and an audit trail. A buyer should be able to turn an RFQ into a cart or order without re-entering the brief.

## Product and UX assessment

### What is working

The visual system is consistent and distinctive. The landing page communicates the intended positioning quickly, product cards expose MOQ and starting price, the product detail page includes supplier context, and the buyer guide gives new users a clear four-step orientation. The cart drawer keeps the purchase path visible and uses Shopify for checkout rather than attempting to recreate payments.

The product also has the right early conversion primitives: browse, search, category and MOQ filters, saved products, quote request, supplier profile, newsletter capture, cart, and checkout handoff. These are useful building blocks for a wholesale marketplace.

### Where the buyer experience lags

| Buyer job | Current friction | Recommended improvement |
|---|---|---|
| Find a product | Search and filters run only over the first 50 loaded products; no pagination, supplier filter, sort, or URL-persisted filter state | Add server-side search, pagination or cursor loading, supplier/category/MOQ/availability filters, sorting, and shareable query URLs |
| Compare options | No comparison, side-by-side specifications, or shortlist workspace | Add compare mode for up to four products with MOQ, pack size, origin, certifications, lead time, and price tiers |
| Evaluate a supplier | Supplier page is derived from product vendor names and hardcoded origin/verification text | Create supplier records with evidence, capacity, response time, products, locations, and last verification date |
| Understand price | Starting price and fabricated tiers are not enough for bulk procurement | Show pack economics, price breaks, landed-cost estimate, currency conversion, and quote-required thresholds |
| Build an order | Cart quantities can violate MOQ and product options are ignored | Make cart MOQ-aware, support variant and pack selection, and validate every line server-side |
| Request a quote | Only a minimal form; no status or confirmation workflow | Create structured RFQs with multiple products, attachments, destination, target date, and status tracking |
| Reorder | No order history or repeat-order action | Add authenticated buyer workspace with orders, saved suppliers, quote history, and reorder templates |
| Trust the marketplace | “Verified” and “lab tested” lack evidence | Add a verification center with documents, issuers, dates, and claim provenance |
| Get help | Mail links exist, but there is no SLA, ticket state, or notification path | Add response-time expectations, email confirmations, and support/RFQ status notifications |

The header’s account and saved-product controls currently produce a toast rather than opening a real account or saved-products destination. This is a clear expectation mismatch. Either implement those destinations or label the controls as unavailable until they are ready.[4]

The supplier route also derives a supplier name from an arbitrary URL slug when no matching product is found. A nonexistent supplier URL should return a not-found state, not a page that appears to describe an invented supplier.[3]

## Data and domain-model assessment

The current schema contains users, favorites, newsletter subscriptions, and quote requests. It does not model suppliers, certifications, product specifications, product-to-supplier relationships, price breaks, pack sizes, inventory snapshots, shipping zones, lead times, orders, quote line items, buyer companies, or supplier responses.[6]

The `catalog.ts` helper maps supplier names to origins in application code. MOQ is inferred from product tags. This is acceptable for a seeded prototype, but it will become fragile as the catalog grows or suppliers update their information. Move business-critical metadata into structured records with validation and effective dates.

A recommended minimum domain model is:

| Entity | Purpose |
|---|---|
| `companies` | Buyer organization, billing identity, industry, and destinations |
| `company_members` | Buyer roles and permissions |
| `suppliers` | Supplier profile, locations, capacity, contact, status, and verification state |
| `supplier_documents` | Certificates, licenses, audits, issuer, dates, and file references |
| `product_specs` | Origin, ingredients, grade, pack unit, shelf life, storage, and regulatory fields |
| `product_commercial_terms` | MOQ, order multiples, lead time, incoterms, price breaks, and quote threshold |
| `rfqs` and `rfq_lines` | Structured quote request, status, ownership, and multiple products |
| `orders` and `order_events` | Synced order state, fulfillment milestones, and reorder support |
| `notifications` | Email or in-app status updates and delivery tracking |
| `activity_events` | Auditable buyer and internal workflow events |

## Security and reliability assessment

The repository correctly keeps the Shopify Storefront token on the server and uses Zod validation on tRPC inputs. Protected procedures guard profile and favorites routes. The adapter also maps Shopify user errors to a client-facing bad-request response.[5] [7]

The main security and abuse gaps are operational rather than syntactic.

1. Cart read and mutation procedures are public and accept opaque cart IDs from the client. This is common for guest carts, but rate limiting, abuse monitoring, and a policy for stolen cart IDs should be defined.
2. Newsletter and quote endpoints are public and have no CAPTCHA, rate limit, spam scoring, deduplication policy for quotes, or email verification. They are potential spam targets.
3. `express.json` and `urlencoded` are configured with a 50 MB limit even though the visible application does not implement upload handling in these routes. Reduce limits by endpoint and add explicit attachment handling when RFQs support files.
4. Shopify calls have no explicit timeout, retry policy, circuit breaker, response-size guard, or cache. A slow upstream call can directly become a slow buyer experience.
5. Errors are not consistently surfaced in cart actions. `CartContext` uses `finally` to clear loading but does not provide a user-visible error path for failed add, update, or remove operations.[4]
6. The `withChannelParam` helper always appends `channel=online_store`, which can duplicate the parameter if Shopify already returns it.[5]
7. Database methods silently return empty results or skip writes when the database is unavailable in some paths. This can make a degraded deployment appear healthy while dropping product behavior or customer data.[8]

Add request IDs, structured logging, upstream timing, rate limits, alerting, error budgets, and clear degraded-state behavior before onboarding real buyers.

## Performance, SEO, and accessibility

The homepage requests up to 50 products, up to eight images per product, and up to 25 variants per product in a single Storefront API request. Supplier pages fetch the same 50-product set and filter it in the browser. This is workable for the seeded catalog but will not scale to hundreds or thousands of products.[2] [5]

The production JavaScript bundle is approximately 490 KB before compression and approximately 142 KB gzip in the verification build. The implementation should add image lazy loading, explicit image dimensions, responsive image variants, route-level code splitting, server-side pagination, catalog caching, and stale-while-revalidate behavior. The Storefront adapter should cache public catalog responses for a short period and invalidate on catalog change rather than requesting the complete catalog on every view.

The document includes a title and description, but there is no visible implementation of product-specific metadata, canonical URLs, Open Graph cards, structured product or organization data, sitemap, or robots policy.[9] Add these to make product pages discoverable and shareable. Product pages should expose price, currency, availability, brand or supplier, and review data only when those values are authoritative.

Accessibility is better than a purely visual prototype because many controls have labels and the cart has dialog semantics. It still needs a formal pass. The custom cart drawer should support Escape-to-close, focus trapping, focus restoration, and an accessible live region for cart updates. The mobile menu should manage focus. Images should use meaningful alt text rather than relying on product titles for every context. Color contrast, keyboard navigation, reduced motion, and screen-reader announcements should be tested with automated and manual tooling.

The analytics script currently contains unresolved Vite placeholders in the production build. This should be configured by environment or omitted entirely in builds where analytics is disabled.[9]

## Testing and delivery maturity

The current automated tests cover authentication logout, commerce router behavior, customer router behavior, and a live Shopify smoke test that is skipped when credentials are absent. They do not cover the most commercially important failure modes: MOQ enforcement, variant selection, quote creation semantics, cart recovery, checkout handoff, supplier not-found behavior, accessibility, responsive layouts, analytics events, or real browser conversion flows.

The recommended testing pyramid is:

| Layer | Additions |
|---|---|
| Unit | MOQ parsing and validation, price-break selection, variant matching, money formatting, supplier slug resolution |
| Router/API | Rate limits, idempotency, quote validation, auth boundaries, cart ownership policy, upstream timeout behavior |
| Component | Product card, variant selector, quantity stepper, RFQ form, cart error states, saved-products page |
| Browser end-to-end | Search to product, variant to cart, MOQ violation, checkout handoff, quote submission, mobile navigation |
| Contract | Shopify schema fixtures, currency/availability behavior, pagination, webhook or sync payloads |
| Accessibility | Automated axe checks plus keyboard and screen-reader smoke paths |
| Performance | Catalog response latency, bundle budget, image weight, largest-contentful-paint budget |

Add CI that installs with the lockfile, runs typecheck and tests, builds production assets, checks for unresolved environment placeholders, and runs a small authenticated live smoke suite in a protected environment.

## Recommended roadmap

### Phase 0: Correctness and trust, 1–2 weeks

Remove or relabel unsupported review, certification, supplier-age, verification, and delivery claims. Fix MOQ initialization and validation. Implement real variant selection. Remove the visual-only packaging selector or connect it to the quote/cart model. Add cart error notifications. Make nonexistent supplier routes return a proper not-found state. Fix analytics build configuration and add a concise README with environment setup and deployment instructions.

### Phase 1: B2B conversion, 2–4 weeks

Create a real RFQ workflow with company, destination, volume, packaging, certification, target date, and attachment support. Add email confirmation and an internal status view. Add product comparison, supplier filtering, sorting, URL-persisted filters, and a real saved-products page. Define and expose pack units, order multiples, lead times, and quote-required thresholds.

### Phase 2: Buyer workspace and operational scale, 4–8 weeks

Add buyer organizations, team roles, quote history, order history, reorder templates, saved supplier lists, and notification preferences. Add structured supplier profiles and verification documents. Introduce catalog pagination, caching, search indexing, image optimization, and event instrumentation. Add support for a real order and fulfillment status model, even if checkout remains on Shopify.

### Phase 3: Marketplace differentiation, 8–12 weeks

Build landed-cost estimation, destination-aware shipping and duties, samples, recurring procurement, supplier response-time scoring, verified buyer reviews, supplier performance analytics, and repeat-order automation. Add supplier-side workflows only after buyer demand and internal sourcing operations are measurable.

## Metrics that should guide the next build

Do not measure success only by product count. Instrument the full sourcing funnel.

| Metric | Why it matters |
|---|---|
| Product-list to product-detail click-through | Measures discovery quality |
| Product-detail to cart-add rate | Measures merchandising and purchase clarity |
| MOQ-correct cart rate | Measures whether wholesale rules are understood and respected |
| Cart to checkout handoff rate | Measures checkout readiness |
| Quote-start to quote-submit rate | Measures RFQ form friction |
| Quote response time | Measures sourcing operations |
| Quote-to-order conversion | Measures commercial value |
| Repeat order rate | Measures ongoing buyer value |
| Supplier document coverage | Measures trust readiness |
| Catalog freshness and availability accuracy | Measures data reliability |
| Search zero-result rate | Identifies catalog and taxonomy gaps |
| Mobile conversion rate | Identifies responsive UX problems |

Every event should avoid collecting unnecessary personal data and should have a documented retention policy.

## Final prioritization

If only five improvements can be funded next, implement them in this order:

1. **Replace unsupported trust claims with evidence-backed supplier and certification data.**
2. **Make MOQ, pack size, variant selection, and price breaks authoritative and enforceable.**
3. **Turn quote requests into structured, trackable RFQs for real wholesale buying.**
4. **Build the buyer workspace: saved products, quotes, orders, reorder, and team identity.**
5. **Add instrumentation, catalog caching, server-side discovery, and browser-level conversion tests.**

These changes would move TradeValut from a compelling catalog presentation to a more defensible procurement product. More products and more visual polish should come after the buying data and operational promises are made reliable.

## References

[1]: https://github.com/Sakthi147r/TradeValut/blob/main/client/src/pages/ProductPage.tsx "TradeValut product detail page"

[2]: https://github.com/Sakthi147r/TradeValut/blob/main/client/src/pages/Home.tsx "TradeValut homepage and product discovery"

[3]: https://github.com/Sakthi147r/TradeValut/blob/main/client/src/pages/SupplierPage.tsx "TradeValut supplier page"

[4]: https://github.com/Sakthi147r/TradeValut/blob/main/client/src/contexts/CartContext.tsx "TradeValut cart state and checkout handoff"

[5]: https://github.com/Sakthi147r/TradeValut/blob/main/server/_core/shopify.ts "TradeValut Shopify Storefront API adapter"

[6]: https://github.com/Sakthi147r/TradeValut/blob/main/drizzle/schema.ts "TradeValut database schema"

[7]: https://github.com/Sakthi147r/TradeValut/blob/main/server/routers/customer.ts "TradeValut customer router"

[8]: https://github.com/Sakthi147r/TradeValut/blob/main/server/db.ts "TradeValut database access layer"

[9]: https://github.com/Sakthi147r/TradeValut/blob/main/client/index.html "TradeValut HTML metadata and analytics configuration"

---

**Scope note:** This report is based on static source inspection, repository history, and local typecheck/test/build verification. It does not claim that the external Shopify store, production database, email provider, analytics account, or supplier documents were independently verified.
