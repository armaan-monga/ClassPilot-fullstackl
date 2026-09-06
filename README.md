# ClassPilot — Tuition & Coaching Center Management System

A full-stack MERN application for local tuition teachers and coaching institutes to manage
students, batches, attendance, fees, and reminders — built to be simple and colorful, not
a corporate admin panel.

# ClassPilot — Tuition & Coaching Center Management System

A full-stack MERN application for local tuition teachers and coaching institutes to manage
students, batches, attendance, fees, and reminders — built to be simple and colorful, not
a corporate admin panel.

**Status: complete, full-stack, and build-verified.** Backend boots cleanly against a
real MongoDB connection; frontend runs `vite build` with zero errors.

## Tech Stack

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT authentication + bcrypt password hashing
- express-async-handler for clean controllers
- Centralized error handling

**Frontend**
- React 18 + Vite
- Tailwind CSS (custom design system — see `tailwind.config.js`) + Framer Motion
- React Router, React Hook Form, Axios
- Recharts (charts), React Hot Toast, Lucide React icons
- jsPDF + jspdf-autotable (PDF reports & fee receipts), SheetJS/xlsx (Excel export)

## Folder Structure

```
classpilot/
├── src/                    React frontend
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── context/
│   ├── services/            one module per backend resource (axios)
│   ├── App.jsx
│   └── main.jsx
├── api/                    Backend/API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── index.js
├── public/
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
├── .env
├── .gitignore
└── README.md
```

## Setup

1. Run `npm install` from the project root.
2. Copy `.env.example` to `.env`, then fill in `MONGO_URI` and `JWT_SECRET`.
3. Run `npm run api:dev` for the API at `http://localhost:5000`.
4. In another terminal, run `npm run dev` for the app at `http://localhost:5173`.

**Vercel + Render deployment**

Deploy the frontend to Vercel and the API to Render. If this project is inside a repository
wrapper folder, set both services' **Root Directory** to `classpilot`.

For Vercel, use `npm run build` as the build command and `dist` as the output directory. Add:

- `VITE_API_URL=https://<your-render-service>.onrender.com/api`

For Render, use the included `render.yaml`, or create a Node web service with `npm install` as
the build command and `node server/index.js` as the start command. Add these environment values:

- `MONGO_URI` — a reachable MongoDB Atlas connection string; localhost MongoDB is not reachable from Render
- `JWT_SECRET` — a long random secret
- `JWT_EXPIRE=7d`
- `CLIENT_URL` — the deployed Vercel URL, for example `https://classpilot.vercel.app`
- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_PORT=587`
- `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_FROM` — Gmail SMTP credentials; use a Google App Password

After the first deploy, copy the Render URL into Vercel's `VITE_API_URL`, copy the Vercel URL
into Render's `CLIENT_URL`, then redeploy both services. Verify the API at
`https://<your-render-service>.onrender.com/api/health` before opening the Vercel site.

Register a teacher account from the app itself (`/register`) — there's no seed script,
so your first account creates the institute.

## API Overview

| Module | Base route | Notes |
|---|---|---|
| Auth | `/api/auth` | register, login, profile, forgot/reset password |
| Students | `/api/students` | CRUD, search/filter/pagination, move batch |
| Batches | `/api/batches` | CRUD, live student counts |
| Attendance | `/api/attendance` | bulk mark, batch/date view, student monthly report |
| Fees | `/api/fees` | generate monthly, mark paid, partial payments, pending/overdue |
| Notifications | `/api/notifications` | simulated WhatsApp/SMS/Email reminders (single + bulk) |
| Dashboard | `/api/dashboard` | all stats/widgets/charts in one aggregated call |
| Settings | `/api/settings` | institute name, logo, theme color, currency, reminder day |

All routes except `/api/auth/register`, `/api/auth/login`, and `/api/auth/forgot-password`
require an `Authorization: Bearer <token>` header.

## What's implemented

- **Auth** — register, login, JWT-protected routes, profile edit, forgot/reset password
- **Dashboard** — every widget from the spec: totals, today's classes, pending fees, this-month
  collection, total revenue, upcoming birthdays, attendance %, recent activity, monthly
  collection trend chart, students-per-batch chart, quick actions
- **Students** — full CRUD, search/filter/pagination, batch reassignment, profile page with
  fee history + attendance ring
- **Batches** — full CRUD, color-tagged, live capacity bar, batch detail page with roster
- **Attendance** — mark Present/Absent/Leave per batch/date, "mark all present" shortcut,
  per-student monthly attendance % (surfaced on the student profile)
- **Fees** — bulk-generate monthly fees, mark paid, partial payments, status filtering,
  auto-generated PDF receipt on full payment
- **Notifications** — WhatsApp/SMS/Email-ready reminder text (single fee or bulk "send all
  pending"), simulated send + history log
- **Global Search** — students, batches, and parents from the topbar
- **Reports** — collection, pending fees, student, and batch reports with PDF and Excel export
- **Calendar** — month view combining class schedule (by batch weekday), fee due dates, and birthdays
- **Settings** — institute name/logo, theme color, currency, fee reminder day, late fee toggle
- **Design** — custom Tailwind token system (Iris/Tangerine/Meadow/Blossom/Sky palette,
  Baloo 2 + Plus Jakarta Sans), glassmorphism cards, gradient sidebar, responsive down to mobile

### Notification simulation

Fee reminders are generated as real WhatsApp/SMS/Email-ready text (see
`api/utils/messageTemplates.js`) and logged to the `Notification` collection — the actual
send is simulated rather than wired to a live provider. Swapping in Twilio (SMS/WhatsApp) or
Nodemailer (Email) later just means calling their API inside `notificationController.js`
instead of only creating the DB record.

## Known trade-offs / not included

Built to be complete and genuinely usable rather than to check every bonus box. Left out,
on purpose, to keep the delivered code correct and maintainable:

- **QR-code attendance, Excel bulk import, role-based multi-staff access** — bonus items;
  would each need their own backend model/endpoint, not just UI
- **"Upcoming Holidays" on the Calendar** — there's no Holiday collection in the schema;
  the calendar shows classes, fee due dates, and birthdays, which the current models support
- **Dark mode toggle** — the UI is intentionally colorful/glassmorphic rather than
  plain-white by default, which was the actual spec requirement; a separate dark theme
  wasn't built on top of it
- **Photo upload** — the `Student.photo` field and `multer` dependency are wired up
  backend-side, but the frontend form doesn't yet have a file picker (URL field only)
- Recharts and the PDF/export libraries push the frontend's main JS bundle past Vite's
  500kB warning threshold — the app still builds and runs fine, but code-splitting those
  libraries behind `import()` would be the next optimization for production

## Future Improvements

- Real WhatsApp Business API / Twilio SMS / Nodemailer integration
- Role-based access (multiple staff per institute)
- QR-code based attendance
- Excel import for bulk student onboarding
- Holiday calendar (new backend model)



ClassPilot deployment test