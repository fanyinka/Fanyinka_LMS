# FANYINKA LMS — Starter project

A Next.js starter for the online church management and attendance system for Harry Fanyinka Temple.

## Included in this first build
- Navy and gold responsive dashboard
- Member directory with search
- Add-member form
- Department, ministry and Bible-study-group fields
- Supabase cloud database connection point
- Initial database schema for members, attendance, staff roles and message logs
- Navigation placeholders for QR, face registration, messaging and reports

## Important: this is a starter, not a live production service
It does not yet provide production authentication, QR check-in, face matching, WhatsApp delivery, Gmail contact sync, or role enforcement. Do not upload real member or biometric information until those protections are implemented and tested.

## Run locally
1. Install Node.js 20 or newer.
2. Extract this folder.
3. In this folder run `npm install`.
4. Copy `.env.example` to `.env.local`.
5. Create a Supabase project and copy its Project URL and anon key into `.env.local`.
6. In Supabase SQL Editor, run `supabase/schema.sql`.
7. Run `npm run dev` and open `http://localhost:3000`.

Without Supabase credentials the dashboard loads in demo/setup mode; member records will not persist.

## Publish online
Deploy the project to a hosting provider such as Vercel and add the same environment variables in the hosting project's settings. Connect a domain after deployment.

## Production work still required
1. Authentication, password reset, invitation flow and role-based access control.
2. Database Row Level Security policies and audit logs.
3. Secure QR session creation with short-lived, one-use tokens and duplicate protection.
4. Face verification using a vetted provider with liveness detection, explicit informed consent, encryption, retention/deletion controls and a non-biometric alternative. Complete a privacy/legal review under applicable Ghanaian data-protection requirements before collecting biometric data.
5. Remote attendance review workflow and anti-abuse checks.
6. Gmail/Google Contacts OAuth import and WhatsApp contact import via user-selected VCF/CSV export. A website cannot silently read a user's Gmail or WhatsApp contacts.
7. WhatsApp Business Platform integration and approved messaging templates; email provider integration.
8. Backups, monitoring, rate limits, security testing and accessibility review.

## Suggested rollout
Start with member directory + staff login + manual/QR attendance. Add facial verification only after consent, privacy, liveness and security design are approved.
