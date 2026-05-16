# Membership Payments Design

## Scope

This pass improves two small mobile usability issues and lays the first functional layer for admin-managed membership payments.

## Mobile UX

- Class labels in the weekly calendar should show enough of the class title to be useful, using two lines instead of hard truncation.
- The member home screen should expose the access QR near the top on mobile, before secondary progress or membership cards.

## Payment Plans

Admins need configurable payment choices. The first implementation keeps the plans local in the finance UI so the workflow becomes usable without a larger settings module.

Initial plans:

- Cuota normal: 1 month, 40000
- Combo 3 cuotas: 3 months, 100000

Payments should record the selected plan name, amount, months covered, payment method, and optional notes.

## Renewal Rule

When a payment is confirmed:

- If the member already has a membership expiration date, extend from that expiration date, even if it is in the past.
- If the member has no expiration date, extend from the payment date.

Examples:

- Expires 2026-05-20, pays 2026-05-16, 1 month: new expiration is 2026-06-20.
- Expires 2026-05-10, pays 2026-05-16, 1 month: new expiration is 2026-06-10.
- No expiration, pays 2026-05-16, 1 month: new expiration is 2026-06-16.
