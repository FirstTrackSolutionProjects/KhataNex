# KhataNex — Frontend

React (Vite + Tailwind) frontend for FIRST TRACK KHATANEX, wired to the
[backend API](../first-track-khatanex-backend) (kept as a separate repo/project
on purpose — deploy independently, e.g. this on Netlify and the backend on
Render/Railway/a VPS).

## 1. Setup

```bash
npm install
cp .env.example .env      # set VITE_API_BASE_URL to your backend's URL
npm run dev
```

By default `VITE_API_BASE_URL=http://localhost:5000`, matching the backend's
default port. In Netlify, set the same variable under **Site settings →
Environment variables** pointing at your deployed backend.

## 2. Roles & routing

- **Login** (`/login`) works for all three roles. After login, the app reads
  `role` from the response and redirects: `superadmin` → `/dashboard`,
  everyone else (`user` / `employee`) → `/customers`.
- **`/dashboard`** is the super admin's overview page — restricted via
  `ProtectedRoute allowedRoles={["superadmin"]}` in `App.jsx`. Anyone else
  hitting that URL directly is redirected to `/customers`. It's also the only
  place the "Add Employee" flow lives — the super admin creates an employee's
  login credentials directly there (no self-registration for employees, no
  promote-a-user flow).
- **`/customers` onward** (Khata, Payments, Invoices, Inventory, Vehicles,
  Reports, Profile, Settings) is the normal operational dashboard, shared by
  `user` and `employee` accounts. The sidebar hides the "Dashboard" link
  unless you're logged in as super admin.
- Every dashboard route is wrapped in `ProtectedRoute` (see
  `src/components/ProtectedRoute.jsx`) — unauthenticated visitors are sent to
  `/login`.

## 3. What's wired up

- `src/lib/api.js` — fetch wrapper: attaches the JWT, unwraps the backend's
  `{ success, ... }` response envelope, throws a plain `Error` with the
  backend's message on failure.
- `src/context/AuthContext.jsx` — holds the logged-in user + token
  (`localStorage`), exposes `login`, `register`, `logout`, `updateProfile`.
  Hydrates on page load via `GET /api/auth/me`.
- Every dashboard page (`Customers`, `CustomerDetails`, `Khata`, `Payments`,
  `Invoices`, `Inventory`, `Vehicles`, `Reports`, `Profile`, `Dashboard`) now
  fetches real data from the backend instead of using mock arrays, with
  loading and error states.
- **Nothing is required** on any form in the dashboard — matching the backend,
  every field can be left blank.

## 4. New/changed vs. the original design

- **Vehicles page** (`/vehicles`) is new — the backend's way-bill feature had
  no frontend screen before. Outgoing trips (loading photo optional, way bill
  auto-generated, Start Trip / Mark Reached buttons) and incoming trips
  (upload the seller's way bill) both live here.
- **Invoices page** now creates Invoice, Quotation, or Merchant Bill — one
  form, a document-type selector, same downloadable-PDF flow for all three
  (backend endpoint: `POST /api/documents`).
- **Khata page** reads from the backend's unified `GET /api/khata` feed
  (merges sales + payments into one credit/debit ledger) and its "New Entry"
  modal writes to either `/api/collections` (credit) or `/api/payments`
  (debit) accordingly.
- **Inventory page** gained an HSN-code autofill on the Add Product form
  (blurring the HSN field checks `/api/purchase-invoices/lookup`) and a
  secondary "Record Purchase" modal to feed that lookup.
- **Signup**'s "Business Name" field now actually saves — the backend gained
  `business_name`/`address` columns and a `PATCH /api/auth/me` endpoint, so
  Profile is fully editable and persists (email is intentionally read-only,
  since it's the login identifier).
- The two public/marketing pages `/digital-khata` and `/customer-management`
  were left as-is (static demo content, `required` removed from their forms
  for consistency but otherwise untouched) — they're separate from the real
  `/khata` and `/customers` dashboard pages and were not wired to the API, to
  avoid two competing implementations of the same feature.

## 5. Netlify deployment

- `netlify.toml` is included (`npm run build`, publish `dist`) alongside the
  existing `public/_redirects` for SPA routing.
- Set `VITE_API_BASE_URL` in Netlify's environment variables to your deployed
  backend's URL before building.
- The backend's CORS is currently wide open (no origin restriction), so no
  Netlify-side CORS configuration is needed right now.
