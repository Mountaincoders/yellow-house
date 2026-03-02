# Yellow House MVP - Operations Runbook

## Table of Contents
1. [Deployment](#deployment)
2. [Monitoring](#monitoring)
3. [Troubleshooting](#troubleshooting)
4. [Maintenance](#maintenance)
5. [Emergency Procedures](#emergency-procedures)

---

## Deployment

### Prerequisites
- Node.js 24.13.1
- pnpm 10.30+
- PostgreSQL 12+
- Vercel account (for frontend hosting)
- Environment variables configured

### Environment Variables

Create `.env` files for each package:

**packages/backend/.env**:
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/yellow-house
JWT_SECRET=your-secure-random-secret-here
```

**packages/frontend/.env**:
```bash
VITE_API_URL=https://api.yellowhouse.app
VITE_APP_URL=https://yellowhouse.app
```

### Local Development

```bash
# Install dependencies
pnpm install

# Start database (PostgreSQL required)
# Create database: createdb yellow-house

# Run migrations
cd packages/backend
pnpm run migrate

# Start development servers
pnpm run dev
```

### Production Deployment

#### Option 1: Vercel (Recommended for MVP)
```bash
# Deploy frontend automatically on push to main
# Configure backend on Vercel as serverless function

vercel deploy --prod
```

#### Option 2: Docker + Kubernetes
```bash
# Build Docker image
docker build -t yellow-house:latest .

# Push to registry
docker tag yellow-house:latest myregistry/yellow-house:latest
docker push myregistry/yellow-house:latest

# Deploy to Kubernetes
kubectl apply -f k8s/deployment.yaml
```

#### Option 3: Heroku
```bash
# Deploy backend
git push heroku main

# Run migrations
heroku run "pnpm run migrate"
```

### Database Migrations

```bash
# Run migrations
pnpm run migrate

# Rollback (manual - edit migration files)
# Drop tables and re-run migrations

# Check migration status
psql $DATABASE_URL -c "\dt"
```

---

## Monitoring

### Health Check Endpoint

```bash
curl https://api.yellowhouse.app/health
# Response: { "status": "ok", "timestamp": "2024-03-02T20:40:00Z" }
```

### Key Metrics to Monitor

1. **API Response Times**: Target < 200ms (p95)
2. **Database Query Times**: Target < 100ms (p95)
3. **Error Rate**: Target < 0.1%
4. **Uptime**: Target 99.9%
5. **CPU/Memory**: Alert if > 80%

### Logging

- All requests logged with: method, path, status, duration
- Errors logged with full stack trace
- Database queries logged in development only

### Sentry Integration (Optional)

```bash
npm install @sentry/node
```

Configure in `packages/backend/src/index.ts`:
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## Troubleshooting

### Issue: 401 Unauthorized on Protected Routes

**Cause**: Invalid or expired JWT token

**Solution**:
1. Check token expiration: tokens expire after 7 days
2. User must login again: `POST /auth/login`
3. Verify JWT_SECRET matches across services

### Issue: 400 Bad Request on Availability Endpoint

**Cause**: Invalid time_slot format

**Solution**:
- time_slot must be ISO 8601: `YYYY-MM-DDTHH:mm:ss`
- Example: `2024-03-02T14:00:00`

### Issue: Database Connection Refused

**Cause**: PostgreSQL not running or wrong credentials

**Solution**:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Verify connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: CORS Errors in Frontend

**Cause**: API_URL misconfigured or CORS not enabled

**Solution**:
1. Check `VITE_API_URL` in frontend .env
2. Verify backend CORS middleware enabled
3. Ensure credentials included in requests

### Issue: Token Blacklist Growing Unbounded

**Cause**: Expired tokens not cleaned up

**Solution**:
```bash
# Run cleanup SQL directly
psql $DATABASE_URL -c "DELETE FROM token_blacklist WHERE expires_at < NOW()"

# Or add cron job
0 * * * * psql $DATABASE_URL -c "DELETE FROM token_blacklist WHERE expires_at < NOW()"
```

---

## Maintenance

### Regular Tasks (Daily)

- [ ] Check uptime monitoring dashboard
- [ ] Review error logs for critical errors
- [ ] Monitor database storage usage

### Regular Tasks (Weekly)

- [ ] Review API metrics (response times, error rates)
- [ ] Check security logs for suspicious activity
- [ ] Backup database
- [ ] Test password reset flow

### Regular Tasks (Monthly)

- [ ] Review and update dependencies
- [ ] Security audit of code changes
- [ ] Performance optimization review
- [ ] User feedback analysis

### Database Backup

```bash
# Create backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup-20240302.sql

# Automated backup (cron)
0 2 * * * pg_dump $DATABASE_URL > /backups/yellow-house-$(date +\%Y\%m\%d).sql
```

### Dependency Updates

```bash
# Check for outdated packages
pnpm outdated

# Update all dependencies
pnpm update -r

# Run tests after update
pnpm test
```

---

## Emergency Procedures

### Issue: Complete API Outage

**Step 1: Assess**
- Check health endpoint: `curl https://api.yellowhouse.app/health`
- Check server logs: `tail -f /var/log/yellow-house.log`
- Check database: `psql $DATABASE_URL -c "SELECT 1"`

**Step 2: Identify**
- Is it backend? Database? Network?
- Check error messages in logs
- Verify recent deployments

**Step 3: Recover**
- If code issue: rollback to last working version
- If database issue: check connection and restore from backup if needed
- If infrastructure: restart server and reboot if necessary

**Step 4: Communicate**
- Post status update on status page
- Notify users via email
- Create incident report after recovery

### Issue: Password Reset Not Working

**Cause**: Email service down or SMTP not configured

**Solution**:
- For MVP: Reset token returned in API response (for testing)
- Configure SMTP for production
- Use third-party email service (SendGrid, Mailgun)

### Issue: Massive Database Growth

**Cause**: Token blacklist or old data not cleaned up

**Solution**:
```bash
# Check table sizes
SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables WHERE schemaname != 'pg_catalog' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Archive old availability data
DELETE FROM availability WHERE date < NOW() - INTERVAL '6 months';

# Vacuum to reclaim space
VACUUM ANALYZE;
```

### Issue: Security Breach

**Immediate Actions**:
1. Revoke all JWT_SECRET
2. Force all users to re-login
3. Rotate database credentials
4. Review logs for unauthorized access
5. Patch vulnerabilities
6. Redeploy

**Command to invalidate all sessions**:
```sql
-- Clear token blacklist (force re-auth for everyone)
TRUNCATE TABLE token_blacklist;
```

---

## On-Call Runbook

### Critical Alerts Response

| Alert | Response Time | Action |
|-------|---------------|--------|
| API Down | 5 min | Check health endpoint, review logs, restart if needed |
| Database Down | 10 min | Check PostgreSQL status, restore from backup |
| High Error Rate (>5%) | 15 min | Review logs, identify cause, patch if needed |
| Security Alert | 5 min | Review logs, isolate if compromised, rotate secrets |

### Escalation Path

1. **On-Call Developer** (0-30 min)
2. **Backend Lead** (if not resolved in 30 min)
3. **Ops Team** (if infrastructure issue)
4. **Security Team** (if security issue)

---

## Contacts

- **Backend Support**: dev-team@mountaincoders.ch
- **Database DBA**: dba@mountaincoders.ch
- **Security Team**: security@mountaincoders.ch
- **Ops Team**: ops@mountaincoders.ch

---

## Useful Commands

```bash
# Check server status
curl https://api.yellowhouse.app/health

# View logs (Vercel)
vercel logs --prod

# View logs (Docker)
docker logs <container-id>

# Restart backend
pm2 restart yellow-house-backend

# Run migrations
pnpm run migrate

# Check database size
psql $DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()))"

# Monitor real-time logs
tail -f /var/log/yellow-house.log | grep ERROR
```

---

**Last Updated**: 2024-03-02
**Maintained By**: Dev Team
**Review Frequency**: Quarterly
