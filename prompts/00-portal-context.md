# Portal Context: firedrill-portal

**Purpose:**
- Fire drill check-in system for tracking staff and student presence during drills
- Real-time check-in/check-out tracking
- Separate views for staff and students
- Integration with Veracross attendance (highlights absent students)
- Admin features for managing excluded staff
- Statistics dashboard showing check-in counts

**Repo type:**
- Next.js 14 (App Router) + Supabase + Google OAuth
- TypeScript
- Tailwind CSS with custom Shefa design system
- Framer Motion for animations

**Vercel:**
- Project name: (needs confirmation - check Vercel dashboard)
- Primary domain: `firedrill.shefaschool.org` (inferred from ecosystem)
- Dev port: 3006 (from package.json scripts)
- Auto-deploys on push to `main` branch

**Key files:**
- Supabase client (browser): `lib/supabase/client.ts`
- Supabase client (server): `lib/supabase/server.ts`
- Auth hook: `lib/hooks/useAuth.tsx` (or inline in page.tsx)
- Auth callback route: `app/auth/callback/route.ts`
- Main data hook: `lib/hooks/useFireDrill.ts`
- Admin hook: `lib/hooks/useAdmin.ts`
- Types: (check lib/types.ts or inline)
- Audit logging: `lib/audit-events.ts`
- App Router root: `app/`
- Main page: `app/page.tsx`
- **Note:** Check for middleware.ts
- **Supabase client rule:** Supabase client helpers in this repo are authoritative. Do not introduce new Supabase client initialization patterns.

**Access control:**
- Admin table: `firedrill_admins`
- Roles: Admin vs regular user (check table structure)
- Domain restriction: `@shefaschool.org` required
- Access check: OAuth callback queries `firedrill_admins` table by email
- Staff exclusion: `staff.exclude_fire_drill` flag excludes staff from check-in list

**Database tables (portal-specific):**
- `firedrill_status` - Check-in status per person (staff or student)
- `firedrill_history` - Historical check-in records
- `firedrill_admins` - Portal access control

**Shared tables used:**
- `students` - Student information (canonical source)
- `staff` - Staff information (with `exclude_fire_drill` flag)
- `master_attendance` - Daily attendance from Veracross (to highlight absent students)
- `audit_events` - Unified audit logging

**Dependencies:**
- **Supabase project URL is always derived from project ref rkfwphowryckqkozscfi. Do not hardcode alternate Supabase URLs.**
- **Shared Supabase project:** All portals share same Supabase instance (`rkfwphowryckqkozscfi`)
- **No dependencies on other portals:** Portal is self-contained except for shared auth/schema
- **Real-time subscriptions:** Subscribes to changes on `firedrill_status` for live updates
- **Veracross integration:** Uses `master_attendance` to show absent students

**Data sync schedules:**
- `students` table: **Every 2 hours** (shared canonical table, synced from Veracross)
- `staff` table: **Daily 6 AM ET** (shared canonical table, synced from BigQuery)
- `master_attendance` table: **Every 15 minutes** (synced from Veracross via pg_cron)

**Common workflows/patterns:**

1. **Check-in workflow:**
   - Staff/students appear in list (staff with `exclude_fire_drill = false`)
   - Tap person → toggle check-in status
   - Can mark as "out today" (absent/off-site)
   - Changes sync in real-time to all connected devices
   - Status colors: Green (checked in), Red (not checked in), Gray (out today)

2. **Staff vs Students tabs:**
   - Separate tabs for staff and students
   - Staff tab shows all active staff (excluding those with `exclude_fire_drill = true`)
   - Students tab shows all students
   - Filter by class (students only)

3. **Reset workflow:**
   - Admin can reset all check-ins
   - Confirmation dialog before reset
   - Resets all `checked_in` flags to false
   - Preserves history in `firedrill_history`

4. **Real-time updates:**
   - Uses Supabase Realtime subscriptions
   - All check-in changes broadcast immediately
   - Statistics update automatically
   - No manual refresh needed

5. **Attendance integration:**
   - Highlights students/staff marked absent in Veracross
   - Uses `master_attendance` table (attendance_category = 1 means absent)
   - Visual indicator for absent people

6. **Search and filter:**
   - Search by name (first or last)
   - Filter students by class
   - Filter staff (all or excluded)
   - Real-time search results

7. **Statistics:**
   - Total people (staff + students)
   - Total checked in
   - Percentage checked in
   - Breakdown by type (staff vs students)

**Issues/gotchas:**

1. **Session refresh handling:**
   - **Rule:** Session refresh must continue to be handled in `app/auth/callback/route.ts`. Do not introduce middleware-based refresh unless explicitly requested.

2. **Staff exclusion:**
   - Staff with `exclude_fire_drill = true` don't appear in check-in list
   - Excluded staff managed from Sharks Portal admin panel
   - If staff should be excluded, set flag in `staff` table

2. **Real-time connection:**
   - Real-time subscriptions can disconnect
   - If disconnected, changes won't sync until reconnected
   - May need manual refresh if connection lost

3. **Attendance data freshness:**
   - `master_attendance` synced every 15 minutes
   - Absent status may be up to 15 minutes old
   - Check sync schedule if absent indicators seem wrong

4. **Reset behavior:**
   - Reset clears all check-ins but preserves history
   - History stored in `firedrill_history` table
   - Reset is admin-only action

5. **Check-in status:**
   - Status stored per person per day
   - `checked_in` boolean flag
   - `out_today` boolean flag (for absent/off-site)
   - `checked_in_at` timestamp
   - `checked_in_by` email of user who checked in

6. **Class filtering:**
   - Students can be filtered by class
   - Class name comes from `students.class` field
   - If class is null, student appears in "all" view only

7. **Person type:**
   - `person_type` field: 'staff' or 'student'
   - Used to distinguish between staff and students
   - Combined with `person_id` for unique identification

8. **History tracking:**
   - Check-ins recorded in `firedrill_history`
   - Includes timestamp and user who performed action
   - Can be used for audit/reporting

**Environment variables:**
- Environment variables follow standard Supabase naming (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`). Do not introduce alternate env naming.

**Portal-specific rules:**
- Do not change shared Supabase schema/policies unless explicitly requested
- Prefer existing shared patterns used in this repo
- All check-ins must be tracked in `firedrill_status` table
- Real-time subscriptions are critical - ensure they're working
- Staff exclusion is important - respect `exclude_fire_drill` flag
- Reset is destructive - require confirmation
- Attendance integration is helpful - maintain Veracross sync
- Statistics should update in real-time

**Response expectation:**
When implementing changes, first state whether the change is portal-only or cross-portal.
