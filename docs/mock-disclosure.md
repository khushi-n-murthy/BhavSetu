# What is real and what is simulated

The organisers allow sandboxed or simulated integrations if they are disclosed and labelled. This file is the disclosure for every version of the website and prototype.

## Website v1 (idea round, 8 Nov 2026)

| Part | Status |
| --- | --- |
| Landed cost, delay risk, Loss Guard, savings engines | **Real.** Python (`packages/engines`) and TypeScript (`apps/web/lib/engines`), tested against `tests/vectors.json` on every push |
| Numbers in the hero, simulator and calculators | **Real.** Computed live by the TypeScript engines |
| WhatsApp conversation in "Try a purchase" | **Simulated.** Scripted in `apps/web/content/demo-script.json` |
| Suppliers, owner, buyer, Ravi Engineering | **Fictional** names and sample data |
| Speech and vision confidence scores in the trace | **Simulated** illustrative values |
| Purchase order BS-1042 | **Simulated.** No PO is sent |
| GeM, ONDC, TReDS, UPI, Tally, e-way bill | **Planned.** Will be sandboxed and labelled on screen |

The page shows a "Simulation with sample data" banner on the simulator and this line in the footer:

> WhatsApp, supplier and buyer conversations on this page are simulated with sample data. GeM, ONDC, TReDS and payment integrations are planned and will be sandboxed and labelled.

## Prototype round (target 6 Dec 2026)

To be updated: real WhatsApp Cloud API test number, real speech-to-text, real quote extraction with measured accuracy, simulator driven by the Python engines through an API.
