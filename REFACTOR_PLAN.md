# Refactor Plan: Webinar Online Integration & System Improvements

## 1. Objectives
- Consolidate online webinar support with clean module boundaries.
- Reduce coupling between Order, Payment, Ticket, and Email flows.
- Ensure backward compatibility while enabling secure online access in phases.
- Improve observability, testability, and performance.

## 2. Scope (What/Why)
- Introduce clear separation of concerns:
  - Order vs Payment processing
  - Event (config) vs Webinar (access & attendance)
  - Email templates per use-case (ticket, webinar, reminder)
- Support free tickets (total=0) end-to-end without payment provider.
- Prepare architecture for optional secure access (Phase 2) and multi-session (Phase 3).

## 3. Current Issues & Risks
- Order.createOrder handles reservation and immediate invoice creation; mixing concerns.
- No explicit boundary for Webinar access/attendance.
- Email templates not specialized for webinar use-cases.
- Redeem strategies include NONE but not leveraged as first-class online path.

## 4. Target Architecture
- Modules
  - EventsModule (keep): event config + webinar fields
  - OrderModule (keep): order lifecycle & reservation
  - PaymentModule (keep): invoice/webhook → ticket generation
  - TicketModule (keep)
  - EmailModule (keep) → add webinar templates
  - WebinarModule (new, Phase 2): optional secure access & attendance

- Data Model Additions
  - Event.deliveryMode (ONLINE/ONSITE/HYBRID) [done]
  - Event.webinarJoinUrl [done]
  - Event.webinarStartAt, Event.webinarEndAt, Event.webinarLobbyOpenMinutes (Phase 1/2)
  - WebinarAccessLog (Phase 2): ticket_id, event_id, joined_at, ip, ua, status
  - EventSession (Phase 3 - optional): per-session link/schedule

- Flow Overview
  - Free (total=0): Order → PAID, generate tickets, Email webinar access.
  - Paid: Payment webhook → PAID → generate tickets, Email webinar access.
  - Online check-in: Phase 2 via access endpoint logs (optional), not scan.

## 5. Phased Roadmap
- Phase 1 (Now)
  - [x] Event fields: deliveryMode, webinarJoinUrl.
  - [x] Order zero-total branch: auto PAID + generate tickets.
  - [ ] Email: Webinar Access template + trigger (Order.zeroTotal & Payment.paid)
  - [ ] Docs: finalize developer and ops guides.

- Phase 2 (Security & Attendance - Optional)
  - [ ] WebinarModule with `GET /events/:id/webinar/access?ticketCode=...`
  - [ ] Attendance logging (WebinarAccessLog), rate limit, waiting window.
  - [ ] Optional: mark ticket CHECKED_IN on first valid access; reminder automation H-1/H-1 jam.

- Phase 3 (Advanced)
  - [ ] EventSession for multi-track/schedule.
  - [ ] Provider abstractions (Zoom/Meet/Teams) and Web SDK signatures.
  - [ ] Single-session enforcement, signed short-lived URLs.

## 6. Service Refactors
- OrderService
  - Keep reservation + order persistence.
  - Zero-total path (implemented): mark PAID, move reserved→sold, generate tickets.
  - Extract invoice creation to PaymentService (already done) - continue best practice.

- PaymentService
  - Ensure webhook is idempotent (already handled by check).
  - After PAID, generate tickets and queue emails.

- WebinarService (Phase 2)
  - Validate access window, ownership, and log.
  - Return/redirect join URL.

- EmailQueueService
  - Add `addWebinarAccessEmail` and `addWebinarReminderEmail`.
  - Keep existing ticket/order summary emails.

## 7. Database & Migrations
- Phase 1
  - Add columns on events: `webinarStartAt`, `webinarEndAt`, `webinarLobbyOpenMinutes` (nullable, defaults).
- Phase 2
  - Create `webinar_access_logs` table.
  - Optional: add ticket fields for attendance counts/timestamps.
- Strategy
  - Non-breaking additive migrations.
  - Backfill defaults; deliveryMode default ONSITE ensures compatibility.

## 8. Security
- Phase 1: Email direct Zoom link (fast track) + organizer guidance (waiting room/password, regenerate link if leaked).
- Phase 2: secure access endpoint (JWT + ticket ownership + time window), rate limiting, logging.
- Phase 3: signed URLs, single-session.

## 9. Observability
- Structured logs for order creation, zero-total branch, payment success.
- Email queue metrics (queued, sent, failed).
- Access logs (Phase 2) with dashboards.

## 10. Testing Strategy
- Unit
  - Order zero-total path → PAID, tickets generated, no invoice.
  - Payment webhook → tickets generated once (idempotent). 
- Integration
  - Free order flow end-to-end with attendees.
  - Paid order flow with mocked invoice creation.
- E2E
  - Email access sent on both paths.
  - (Phase 2) Access endpoint window/ownership checks.

## 11. Rollout Plan & Backward Compatibility
- Ship Phase 1 first; feature toggles not required (additive changes only).
- Monitor order creation, ticket generation, email deliveries.
- Prepare migration rollback scripts (safe drops unused columns only if necessary).

## 12. Risks & Mitigations
- Link sharing: mitigated by Zoom waiting room/password (Phase 1) and secure access (Phase 2).
- Mixed free/paid items: policy decision (disallow mix or accept; revenue correct regardless).
- Email deliverability: ensure templates simple and tested.

## 13. Acceptance Criteria
- Free orders auto-PAID, tickets generated, paymentUrl null.
- Paid orders PAID via webhook, tickets generated once.
- Webinar access emails sent for ONLINE events on both paths.
- No regressions for onsite redeem/check-in.

## 14. Follow-ups
- Implement email templates and triggers.
- Decide on Phase 2 timeline based on security needs.
- Document organizer guidelines for Zoom setup.
