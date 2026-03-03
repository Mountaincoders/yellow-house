# Render Deployment Guide

## Overview

Deploy Yellow House Backend on Render.com with PostgreSQL database.

**Stack:**
- Backend: Node.js + Express (on Render Web Service)
- Database: PostgreSQL (on Render PostgreSQL)
- Frontend: Vercel (separate)

---

## Step 1: Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (easier)
3. Go to Dashboard: https://dashboard.render.com

---

## Step 2: Create PostgreSQL Database

1. Click **+ New** → Select **PostgreSQL**
2. Fill in:
   - **Name:** `yellow-house-db`
   - **Database:** `yellow_house` (auto-fills)
   - **User:** `postgres` (auto-fills)
   - **Region:** `Frankfurt` (closest to Europe)
   - **PostgreSQL Version:** `15` (or latest)
3. Click **Create Database**
4. **⏳ Wait for creation** (2-3 minutes)
5. Once created, copy the **Internal Database URL** (will need it in Step 4)
   - Format: `postgresql://user:password@host:5432/database`

---

## Step 3: Create Web Service (Backend)

1. Click **+ New** → Select **Web Service**
2. Fill in:
   - **Repository:** Connect `Mountaincoders/yellow-house`
   - **Name:** `yellow-house-api`
   - **Region:** `Frankfurt`
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `pnpm install`
   - **Start Command:** `pnpm -F backend start`
3. Click **Create Web Service**
4. **⏳ Wait for build** (3-5 minutes)

---

## Step 4: Add Environment Variables to Backend

After Web Service is created:

1. Go to **Environment** tab
2. Add these variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `DATABASE_URL` | (Paste from PostgreSQL internal URL in Step 2) |

3. Click **Save**
4. Service will auto-redeploy

---

## Step 5: Get Backend API URL

1. Go to Web Service dashboard
2. Look for **Render URL** at the top (e.g., `https://yellow-house-api.onrender.com`)
3. **Copy this URL** - you'll need it for Vercel

---

## Step 6: Update Vercel with API URL

1. Go to https://vercel.com/projects
2. Select **yellow-house** project
3. Go to **Settings** → **Environment Variables**
4. Find or create `VITE_API_URL`
5. Set value to: `https://yellow-house-api.onrender.com`
6. Click **Save**
7. Go to **Deployments** → Redeploy latest (or just push to `main`)

---

## Step 7: Run Database Migrations

1. Go back to Render Backend Web Service
2. Click **Shell** (in the top right)
3. Run:
   ```bash
   pnpm -F backend run db:migrate
   ```
4. If successful: ✅ Database schema created
5. If fails: Check `DATABASE_URL` env var is correct

---

## Step 8: Test the Deployment

1. Go to `https://yellow-house.vercel.app` (Frontend URL)
2. Try to **Register** a new user
3. Should work end-to-end ✅

### Troubleshooting

**Backend logs:**
```
Render Dashboard → Web Service → Logs (tail last 100 lines)
```

**Database connection failed?**
- Check `DATABASE_URL` format: `postgresql://user:password@host:5432/db`
- Host should be from PostgreSQL service (internal URL)
- Username/password must match PostgreSQL creation

**Migrations won't run?**
- Check DATABASE_URL is set
- Run manually in Shell: `pnpm -F backend run db:migrate`

**Frontend can't reach API?**
- Verify `VITE_API_URL` is set in Vercel
- Check Backend URL is correct
- Check CORS headers in backend code

---

## DNS / Custom Domain (Optional)

Add custom domain to Render Backend:

1. Render Web Service → **Settings** → **Custom Domain**
2. Add domain (e.g., `api.yellow-house.com`)
3. Follow DNS instructions

Then update Vercel: `VITE_API_URL = https://api.yellow-house.com`

---

## Monitoring

**Render Dashboard:**
- Logs: Real-time deployment/runtime logs
- Metrics: CPU, Memory, Requests
- Events: Deploys, restarts, errors

**Vercel Dashboard:**
- Analytics: Frontend performance
- Deployments: Frontend build logs

---

## Notes

- Render free tier: 750 free dyno hours/month (sufficient for MVP)
- PostgreSQL on free tier: Limited to 1GB storage
- Auto-sleeps after 15 min inactivity (not ideal for production, upgrade later)
- Database persists even when service sleeps

---

## Next Steps

1. ✅ Deploy to Render (this guide)
2. ✅ Deploy Frontend to Vercel
3. 📈 Monitor logs for 24 hours
4. 🔒 Set up backups (Phase 2)
5. 🚀 Add custom domains (Phase 2)
6. 📊 Add monitoring/alerts (Phase 2)

---

**Questions?** Check Render docs: https://render.com/docs
