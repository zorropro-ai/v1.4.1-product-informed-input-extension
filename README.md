# K-NanoMFA Web v1.4.1 — Product-Informed Nanomaterial Inventory Release

K-NanoMFA is a browser-based platform for country-resolved static, probabilistic, inflow-driven dynamic, and stock-driven dynamic material-flow analysis of nanomaterials. Version 1.4 adds a product-informed input layer that converts product-market quantities, nanomaterial content, and nano-enabled market shares into product-specific nanomaterial inputs. The complete v1.3 interface, custom-geography registry, v1.2.1 scientific functions, and v1.2 multi-material functions remain available without reduction.

## Software identity

- Developer: Prof. Younghun Kim
- Affiliation: Kwangwoon University
- Contact: korea1@kw.ac.kr
- Initial release: 17 July 2026
- Current release: 22 July 2026
- Current version: 1.4.1-en
- License: MIT License


## What is new in v1.4.1

- Optional **Product-informed inventory** input mode; direct ENM input remains the default
- Five product-input bases: direct ENM mass, product mass × content, unit sales × unit mass, coated area × loading, and product volume × concentration
- Product-specific nano-enabled market fractions and evidence metadata
- Product-specific annual changes in market quantity, ENM content, and nano-enabled share
- Automatic conversion to annual ENM mass and automatic replacement of product-allocation shares when the new mode is active
- Product-specific dynamic trajectories passed to the existing cohort, stock, EoL, treatment, and PEC engines
- Product-specific uncertainty terms for quantity, content, and nano-enabled share, propagated as independent lognormal inputs
- Product-source contribution chart and table in the results workspace
- Product-inventory JSON import/export and embedding in complete scenario and audit JSON
- Product-informed current scenarios can be captured in the multi-material workspace using their derived first-year input and allocation
- Added `product_inventory.js`, `test_product_inventory.js`, and `test_browser_v14.py`

## What is retained from v1.3

- Five guided stages replace the crowded single-row navigation while preserving every original v1.2.1 workspace
- **All workspaces** view restores the complete ten-workspace tab row at any time
- Custom-country manager for user-defined national statistics, environmental denominators, waste routes, and sewage-sludge routes
- Optional custom subnational domains under each user-defined country
- Custom geographies are stored locally, exported/imported as JSON, and embedded in complete scenario JSON files
- Custom countries are available to deterministic, probabilistic, dynamic, multi-material, advanced-fate, validation, comparison, and export modules without a separate calculation engine
- Improved responsive navigation and reduced rendering cost for long tables and charts
- Added `test_geography.js` and headless-browser checks for custom-country creation and scenario portability

## Compatibility guarantee

v1.4.1 retains all v1.4, v1.3 and v1.2.1 materials, bundled and custom countries, Korean subnational domains, static and dynamic engines, uncertainty, evidence, sensitivity, benchmarks, custom materials, multi-material/co-exposure, advanced MFA/fate, validation, life-cycle burden, import/export, and audit functions. Direct ENM input remains the default, and existing v1.2.1/v1.3 scenario JSON files remain importable.

## What is corrected in v1.2.1

- Correct handling of negative annual growth down to −100%
- Opening landfill stock included in cumulative dynamic mass-balance accounting
- Mass-conserving repeated reuse when an EoL route is 100% reuse
- Range and finite-number validation for imported percentages, trajectories, dynamic settings, environmental capacities, and mixture inputs
- Water-to-sediment transfer accepts 0% and rejects values above 100%
- Bayesian calibration now refreshes all visible input editors
- Built-in material changes now reset the reduced-form fate preset to the corresponding material class
- Dynamic multi-material summaries and Sankey inputs now use the final-year primary input rather than the first-year input
- Imported mixture projects are normalized and incomplete definitions are rejected with a clear message
- User-entered table values are escaped by default
- Added `test_regression_v121.js` for the corrected edge cases

The scientific scope remains screening-level. This maintenance release corrects implementation and validation errors; it does not convert bundled priors into calibrated national inventories.

## What is new in v1.2

- **Assessment mode** selector for single-material or multiple-material/co-exposure projects
- Parallel MFA calculation for bundled and custom nanomaterials in one country/domain
- Material-specific inputs, growth rates, active years, tracking bases, co-use groups, and evidence metadata
- **Co-formulated product/blend groups** with a shared blend input, composition fractions, use releases, EoL routes, and lifetime distribution
- Material-specific treatment transfer coefficients retained inside co-formulated products
- Multi-material Sankey diagram with common terminal destinations
- Medium-specific co-occurrence tables and material contribution profiles
- Tracking-basis compatibility gate before summing physical mass concentrations
- Component HQ and cumulative HI within user-defined assessment groups
- Automatic blocking of HI when endpoint descriptions are inconsistent within an assessment group
- Optional user-entered pairwise interaction coefficient β; default β = 0
- Dynamic material-specific PEC and HI time series
- Joint Monte Carlo simulation with shared country/environment samples and shared formulation-input uncertainty
- P5/P50/P95 mixture output and probability that HI exceeds 1
- Mixture project JSON and co-exposure CSV export/import
- Complete mixture configuration embedded in the main scenario JSON and audit output

## Product-informed workflow

1. Select **Product-informed inventory** under Project settings.
2. Open **Product and life cycle**.
3. For each product category, choose an input basis and enter the product quantity.
4. For product-mass and unit-sales bases, enter ENM content and the nano-enabled market fraction.
5. For area- or volume-based inputs, enter the ENM loading or concentration and the nano-enabled fraction.
6. Review the calculated ENM mass and the automatically derived product allocations.
7. For dynamic runs, enter annual changes in market quantity, content, and nano-enabled share.
8. Document quantity, content, and nano-enabled uncertainty, evidence class, year, geography, and source limitations.
9. Run the model and inspect the product-source contribution results.

The product-informed layer converts market data to nanomaterial mass before geographic scaling and MFA. It does not treat total product mass as nanomaterial mass. Product-specific uncertainty terms are independent in v1.4.1; correlations and alternative distribution families are not yet implemented.

## Multi-material workflow

1. Select **Multiple nanomaterials / co-exposure** under Assessment mode.
2. Open **Multi-material / mixtures**.
3. Add at least two bundled materials or capture an edited custom scenario.
4. Use **Direct material input** for independent co-occurrence.
5. For nanomaterials in the same product or blend, create a formulation group and assign fractions that total 100%.
6. Select a common tracking basis only when the physical masses are scientifically commensurable.
7. Enter medium-specific PNECs only for comparable nanoforms, endpoints, and assessment groups.
8. Run the multi-material assessment.
9. Inspect material-specific MFA, PECs, co-occurrence, HQ/HI, and dominant contributors.
10. Run joint mixture uncertainty and export the project and results.

## Independent co-occurrence and co-formulation

### Independent co-occurrence

Each component uses its own product allocation, use-stage releases, EoL routes, treatment coefficients, and lifetime distribution. All components share the selected geographic domain and environmental capacities.

### Co-formulated product or blend

The formulation group defines:

- Total nanomaterial-blend input
- Material fractions
- Use-stage release pattern
- End-of-life routing
- Mean lifetime and Weibull shape
- Active years and growth trajectory

The group fractions are applied to the blend input. Each component then uses its own material-specific WWTP, incineration, landfill, recycling, reuse, and biological-treatment transfer coefficients.

## Mixture screening equations

For component `i`:

```text
HQ_i = PEC_i / PNEC_i
```

For components with a common medium, assessment group, and comparable endpoint:

```text
HI = Σ HQ_i
```

Optional user-entered interaction adjustment:

```text
HI_adjusted = HI + Σ β_ij HQ_i HQ_j
```

The software does not predict β. A nonzero value should be used only when the material pair, medium, endpoint, concentration range, coating, size, and other nanoform conditions are supported by directly relevant evidence.

## Important interpretation boundaries

- A summed concentration is a physical mass-concentration total, not a toxic-equivalence concentration.
- Concentration sums are blocked when component tracking bases differ, unless the user explicitly overrides the compatibility gate and documents the justification.
- HQ/HI is calculated only from user-supplied PNECs and does not create or infer toxicity thresholds.
- HI is a component-based screening index, not proof of additive toxicodynamics.
- Different endpoints must not be combined in one assessment group.
- An interaction-adjusted HI is exploratory and is not a mechanistic mixture-toxicity model.
- The multi-material module runs the existing MFA engines independently for each material; it does not model direct particle-particle transformation, heteroaggregation, surface exchange, or dissolution interactions between mixture components.

## Included nanomaterials

- Carbon nanotubes
- Carbon black
- Graphene and graphene-based nanomaterials
- Fullerenes
- Silver nanoparticles
- Nano-TiO₂
- Nano-ZnO
- Nano-SiO₂
- Nanocellulose
- Nanoclay
- Custom nanomaterial scenario

## Geographic domains

National domains are included for the Republic of Korea, China, United States, Japan, Germany, France, United Kingdom, India, Canada, and Australia. Korea additionally contains 17 subnational domains.

## Model modes

- **Static deterministic MFA:** one year, fixed parameters.
- **Static probabilistic MFA:** one-year uncertainty and P5/P50/P95 output.
- **Dynamic probabilistic MFA:** inflow-driven cohorts, stocks, delayed EoL, recycling, reuse, and landfill stock.
- **Stock-driven dynamic MFA:** inverse solution for a target stock in the single-material advanced workspace.

The multi-material module supports the static deterministic, static probabilistic, and inflow-driven dynamic structures. Stock-driven inverse calculation remains a single-material advanced module in v1.2.

## Run locally

```bash
python -m http.server 8080
```

Open `http://localhost:8080`. Windows users may run `serve_local.bat`; macOS and Linux users may run `./serve_local.sh`.

## Verification

```bash
node test_engine.js
node test_advanced.js
node test_custom_material.js
node test_mixture.js
node test_regression_v121.js
node test_geography.js
node test_product_inventory.js
python test_browser_v13.py
python test_browser_v14.py
```

The tests cover product-market conversion, product-specific trajectories and uncertainty, bundled and custom national domains, custom subnational domains, bundled and custom materials, static and dynamic mass-balance closure, PEC calculation, formulation fractions, component-based co-exposure, joint uncertainty, reconciliation, stock-driven inverse MFA, reduced-form multimedia fate, validation statistics, five-stage navigation, preservation of all ten original workspaces, and scenario portability. The Python browser test requires Playwright and Chromium; all numerical tests require Node.js only.

## User manual

Open `K-NanoMFA_User_Manual_v1.2.docx`, `MANUAL_ADDENDUM_v1.3.md`, and `MANUAL_ADDENDUM_v1.4.1.md`, or use the manual links in the application.

## License and disclaimer

K-NanoMFA is distributed under the MIT License. Free use, modification, and redistribution are permitted if the copyright and license notices are retained. See `LICENSE` and `DISCLAIMER.md`.


## v1.4.1 maintenance

Version 1.4.1 corrects a responsive-layout defect in the custom country and geographic-domain manager. The country-identity grid, domain grid, route grids, and action rows now wrap cleanly at narrower widths without clipping the right-hand panel or input fields. No scientific calculation logic was changed in this maintenance release.
