# BridgeLink production deployment

This guide deploys BridgeLink as a Render Static Site backed by a new Supabase project.

## 0. Security rules

- Never commit `.env` or any Supabase `service_role` key.
- The browser may use only the Supabase publishable/anon key.
- Do not put `LOVABLE_API_KEY` in Render frontend variables; it belongs only in Supabase Edge Function secrets.
- The management panel now uses Supabase Auth and the `admin` role. The old hard-coded browser password has been removed.

## 1. Create the Supabase account and project

1. Go to https://supabase.com and choose **Start your project**.
2. Create an account or sign in with an account you control. Complete email verification if requested.
3. Create a new organization if Supabase asks for one.
4. Click **New project**.
5. Choose the organization, enter a project name such as `bridgelink-production`, select a strong database password, choose a region close to your users, and create the project.
6. Wait until the project status is ready.

## 2. Create the database schema

1. Open the new project dashboard.
2. Go to **SQL Editor → New query**.
3. Paste the contents of `bridgelink-supabase-schema.sql`.
4. Run it once in the empty project.
5. Confirm that the tables appear under **Table Editor** and the three storage buckets appear under **Storage**.

The schema bundle includes the final auth hardening migration. If you already ran an older bundle, run the final migration file separately only once:

`supabase/migrations/20261003221200_auth_signup_hardening.sql`

## 3. Configure authentication

Open **Authentication → Providers**:

- Enable **Email**.
- Keep **Confirm email** enabled for production.
- Leave public signups enabled while onboarding users; disable it later if accounts should be invite-only.

Open **Authentication → URL Configuration**. Temporarily use your future Render URL once known. Add both local and production redirects:

```text
http://localhost:5173/auth
https://YOUR-RENDER-SERVICE.onrender.com/auth
https://YOUR-CUSTOM-DOMAIN.com/auth
```

Also set the Site URL to the production Render URL after the first deployment. These URLs are required for signup confirmation and password reset links.

## 4. Create the first administrator

1. In the app, create a normal account using the signup screen and verify its email.
2. In Supabase **SQL Editor**, replace the email below and run:

```sql
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE email = 'YOUR_ADMIN_EMAIL@example.com'
ON CONFLICT (user_id, role) DO NOTHING;

UPDATE public.profiles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_ADMIN_EMAIL@example.com'
);
```

3. Sign out of the normal app session.
4. Open `/mgmt` and sign in with the same verified email and password.
5. Confirm that `/mgmt-panel` loads.

## 5. Deploy Edge Functions

Install the Supabase CLI using the current official instructions at https://supabase.com/docs/guides/cli.

From the project root:

```bash
supabase login
supabase link --project-ref YOUR_NEW_PROJECT_ID
supabase functions deploy parse-resume
supabase functions deploy expire-slots
```

If resume parsing is needed, set the secret:

```bash
supabase secrets set LOVABLE_API_KEY=YOUR_LOVABLE_API_KEY
```

The `expire-slots` function uses Supabase-provided server environment variables. Do not add service-role credentials to Render.

## 6. Prepare the frontend environment

Create `.env` locally, but do not commit it:

```env
VITE_SUPABASE_PROJECT_ID=YOUR_NEW_PROJECT_ID
VITE_SUPABASE_URL=https://YOUR_NEW_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Test locally:

```bash
npm ci
npm run build
npm run dev
```

Test signup, confirmation, login, resend verification, password reset, profile update, file upload, messaging, and the admin panel.

## 7. Deploy on Render

### Option A: Blueprint deployment

1. Push the project to a GitHub/GitLab repository.
2. In Render, choose **New → Blueprint**.
3. Connect the repository and select the branch.
4. Render detects `render.yaml`.
5. Enter these environment values when prompted:
   - `VITE_SUPABASE_PROJECT_ID`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
6. Deploy.

### Option B: Dashboard deployment

Create a **Static Site** with:

- Build Command: `npm ci --no-audit --no-fund && npm run build`
- Publish Directory: `dist`
- Environment variables: the three `VITE_` variables above

Add a rewrite rule:

```text
Source: /*
Destination: /index.html
Action: Rewrite
```

The rewrite is required because React Router handles routes such as `/auth`, `/dashboard`, and `/mgmt` in the browser.

## 8. Finish the production URL setup

After Render provides the service URL:

1. Copy the exact `https://...onrender.com` URL.
2. In Supabase **Authentication → URL Configuration**, set it as the Site URL.
3. Add `https://...onrender.com/auth` and `https://...onrender.com/reset-password` as redirect URLs.
4. Redeploy if you changed Render variables.
5. Test signup from the production URL and click the email link.

## 9. Production checklist

- [ ] New Supabase project belongs to your account.
- [ ] Schema and RLS policies applied successfully.
- [ ] Storage buckets exist.
- [ ] Email confirmation is enabled.
- [ ] Render URL is in Supabase redirect allow-list.
- [ ] Signup confirmation works.
- [ ] Unconfirmed login shows resend verification.
- [ ] Password reset works.
- [ ] First admin has the `admin` role.
- [ ] `/mgmt` rejects non-admin accounts.
- [ ] Edge Functions are deployed.
- [ ] `LOVABLE_API_KEY` is set only as an Edge Function secret if needed.
- [ ] No `.env`, service-role key, or API secret is committed.
- [ ] Existing old-project users/files/data are understood to be unavailable without a backup.
