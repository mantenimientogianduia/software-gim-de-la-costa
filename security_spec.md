# Security Specification - Gimnasio de la Costa

## 1. Data Invariants
- A `User` profile can only be created by an authenticated user for their own UID, but their `role` and `status` can only be modified by admins.
- `Payments` can only be created by admins. Users can read their own payments.
- `TrainingPlans` (templates) are read-only for Socios, read-write for Admins/Instructors. Assignments are read-write for the specific Socio owner (recording sessions) and instructors.
- `GymClasses` are managed by Admins/Instructors. Socios can only read.
- `Bookings` must link to a valid `GymClass`. A user can only book for themselves.
- `Attendance` records are strictly controlled. Check-in typically automated by QR scan (Admin logic) or user for self-check-out.

## 2. The Dirty Dozen Payloads (Denial Tests)
1. **Identity Spoofing**: Attempt to create a payment for another user from a Socio account.
2. **Privilege Escalation**: Socio trying to update their own `role` to 'admin'.
3. **Ghost Payment**: Socio creating a payment record with `status: 'confirmed'`.
4. **Orphaned Booking**: Creating a booking for a class ID that doesn't exist.
5. **Unauthorized Plan Mod**: Socio trying to delete a Training Plan template.
6. **Double Enrollment**: (App logic mostly, but rules should verify role).
7. **Junk ID**: Injecting 2KB string as `userId`.
8. **Invalid Status**: Setting `status: 'god-mode'` in a training plan.
9. **Timestamp Hijack**: Sending a client-side `createdAt` date from 2001.
10. **Shadow Field**: Adding `isVerified: true` to a user profile update.
11. **PII Leak**: Non-admin user trying to list all users' phone numbers/DNI.
12. **Negative Payment**: Socio (if they could write) trying to set `amount: -100`.

## 3. Test Runner (Mock)
(Tests will be implemented in `firestore.rules.test.ts`)
