# Yellow House MVP - Disaster Recovery Plan

## Recovery Time Objectives (RTO) & Recovery Point Objectives (RPO)

| Component | RTO | RPO | Strategy |
|-----------|-----|-----|----------|
| Database | 4 hours | 1 hour | Automated hourly backups + replication |
| Application | 30 minutes | <5 min | Container-based quick restart + blue-green deploy |
| Frontend | 15 minutes | <5 min | CDN with failover, automatic reruns |
| Email Service | 2 hours | 1 hour | Retry queue + fallback SMTP |

---

## Backup Strategy

### Database Backups

#### Automated Hourly Backups
```bash
#!/bin/bash
# /usr/local/bin/backup-db.sh

BACKUP_DIR="/backups/yellow-house"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_$TIMESTAMP.sql"
RETENTION_DAYS=30

# Create backup
pg_dump $DATABASE_URL | gzip > $BACKUP_FILE.gz

# Upload to S3
aws s3 cp $BACKUP_FILE.gz s3://yellow-house-backups/

# Delete old backups
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Log backup
echo "Backup completed: $BACKUP_FILE.gz" >> /var/log/backups.log
```

**Cron Schedule**:
```bash
0 * * * * /usr/local/bin/backup-db.sh
```

#### Point-in-Time Recovery (PITR)
```bash
# Enable WAL archiving in PostgreSQL
# postgresql.conf:
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /var/lib/postgresql/wal_archive/%f && cp %p /var/lib/postgresql/wal_archive/%f'
```

#### Backup Verification
```bash
# Weekly verification (Monday 2 AM)
0 2 * * 1 pg_restore --list /backups/yellow-house/db_latest.sql.gz > /dev/null && echo "OK" || echo "FAILED" | mail -s "Backup verification" admin@mountaincoders.ch
```

### Application Backups

#### Code Repository
- Use GitHub for code versioning
- Tags for production releases
- Automated branch protection and tests before merge

#### Configuration Backups
```bash
# Backup environment variables (encrypted)
tar czf /backups/configs_$(date +%Y%m%d).tar.gz \
  /app/.env \
  /app/packages/backend/.env \
  /app/packages/frontend/.env

# Encrypt backup
gpg --symmetric /backups/configs_*.tar.gz
```

### Upload to Cloud Storage

#### AWS S3 Configuration
```bash
#!/bin/bash
# /usr/local/bin/sync-backups-s3.sh

S3_BUCKET="s3://yellow-house-backups"
BACKUP_DIR="/backups"

# Sync to S3 (with versioning enabled)
aws s3 sync $BACKUP_DIR $S3_BUCKET \
  --storage-class GLACIER \
  --metadata "backup-date=$(date +%Y-%m-%d)"

# Enable S3 versioning
aws s3api put-bucket-versioning \
  --bucket yellow-house-backups \
  --versioning-configuration Status=Enabled
```

#### Cross-Region Replication
```bash
# Enable S3 cross-region replication
aws s3api put-bucket-replication \
  --bucket yellow-house-backups \
  --replication-configuration file://replication.json
```

---

## Disaster Scenarios & Recovery

### Scenario 1: Database Corruption

**Symptoms**: 
- Query errors
- Data integrity violations
- High error rate on API

**Recovery Steps**:
```bash
# Step 1: Stop application
docker-compose down

# Step 2: Identify latest valid backup
ls -la /backups/yellow-house/db_*.sql.gz | tail -10

# Step 3: Create new empty database
dropdb yellow-house-recovery
createdb yellow-house-recovery

# Step 4: Restore from backup
gunzip < /backups/yellow-house/db_20240302_120000.sql.gz | \
  psql -h localhost -d yellow-house-recovery

# Step 5: Verify restoration
psql -d yellow-house-recovery -c "SELECT COUNT(*) FROM users;"

# Step 6: Switch to restored database
pg_ctl reload  # or update connection string

# Step 7: Restart application
docker-compose up -d

# Step 8: Verify all endpoints working
curl -s https://api.yellowhouse.app/health
```

**Time to Recover**: 30-45 minutes

### Scenario 2: Data Breach / Unauthorized Access

**Symptoms**:
- Suspicious access logs
- Unauthorized API calls
- Reports of account compromises

**Immediate Actions** (First 5 minutes):
```bash
# 1. Kill all connections
psql $DATABASE_URL -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'yellow-house';"

# 2. Rotate secrets
NEW_JWT_SECRET=$(openssl rand -base64 32)
# Update environment variable

# 3. Force logout all users
TRUNCATE TABLE token_blacklist;  -- Forces re-authentication

# 4. Take snapshot of logs
cp /var/log/yellow-house.log /secure-evidence/breach_logs_$(date +%s).log

# 5. Notify security team
# Escalate to security@mountaincoders.ch
```

**Within 1 hour**:
- Identify compromised accounts
- Reset passwords for affected users
- Review access logs (last 7 days)
- Identify how breach occurred
- Plan patches

**Within 4 hours**:
- Deploy security patches
- Rotate database credentials
- Update API keys/secrets
- Deploy hotfix to production

### Scenario 3: Complete Server Failure

**Symptoms**:
- All endpoints return 503
- No database connectivity
- Infrastructure down

**Recovery** (Blue-Green Deployment):
```bash
# Assuming running on Vercel + RDS

# 1. Verify backup database (RDS backup)
aws rds describe-db-snapshots --db-instance-identifier yellow-house-prod

# 2. Restore from snapshot (creates new RDS instance)
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier yellow-house-recovery \
  --db-snapshot-identifier yellow-house-20240302-120000

# 3. Wait for restore (10-15 minutes)
aws rds wait db-instance-available --db-instance-identifier yellow-house-recovery

# 4. Update connection string
export DATABASE_URL=postgresql://user:pass@yellow-house-recovery.xxx.rds.amazonaws.com:5432/yellow-house

# 5. Deploy application to new infrastructure
vercel deploy --prod --env DATABASE_URL=$DATABASE_URL

# 6. Health check
curl https://api.yellowhouse.app/health

# 7. Decommission old instance
aws rds delete-db-instance --db-instance-identifier yellow-house-prod --skip-final-snapshot
```

**Time to Recover**: 30-45 minutes

### Scenario 4: Accidental Data Deletion

**Recovery with PITR**:
```bash
# 1. Stop application immediately
# 2. Identify deletion time from logs
# 3. Restore to point just before deletion

pg_basebackup -D /data/recovery -Xstream -c fast

# or create new database from point-in-time
ALTER SYSTEM SET recovery_target_timeline = 'latest';
ALTER SYSTEM SET recovery_target_time = '2024-03-02 12:00:00';
pg_ctl start
```

---

## Testing & Validation

### Monthly Disaster Recovery Drill

```bash
#!/bin/bash
# /usr/local/bin/dr-drill.sh

echo "Starting Disaster Recovery Drill at $(date)"

# 1. Test database backup restoration
BACKUP_FILE=$(ls -t /backups/yellow-house/db_*.sql.gz | head -1)
TEST_DB="yellow-house-dr-test-$(date +%s)"

createdb $TEST_DB
gunzip < $BACKUP_FILE | psql -d $TEST_DB > /dev/null

if [ $? -eq 0 ]; then
  echo "✓ Database restoration successful"
  dropdb $TEST_DB
else
  echo "✗ Database restoration failed - ALERT"
  exit 1
fi

# 2. Test application deployment
vercel inspect --prod > /tmp/vercel-status.txt

if [ $? -eq 0 ]; then
  echo "✓ Application deployment verified"
else
  echo "✗ Application deployment check failed - ALERT"
  exit 1
fi

# 3. Test all critical API endpoints
endpoints=(
  "https://api.yellowhouse.app/health"
  "https://api.yellowhouse.app/groups"
  "https://api.yellowhouse.app/auth/login"
)

for endpoint in "${endpoints[@]}"; do
  response=$(curl -s -o /dev/null -w "%{http_code}" $endpoint)
  if [ "$response" = "200" ] || [ "$response" = "401" ]; then
    echo "✓ Endpoint $endpoint OK"
  else
    echo "✗ Endpoint $endpoint FAILED (HTTP $response)"
  fi
done

echo "Disaster Recovery Drill completed at $(date)"
```

**Schedule**: First Monday of each month at 2 AM UTC

### Backup Retention Policy

| Backup Type | Retention | Storage | Notes |
|------------|-----------|---------|-------|
| Hourly | 7 days | Local SSD | Fastest recovery |
| Daily | 30 days | S3 Standard | Balance speed/cost |
| Weekly | 1 year | S3 Glacier | Long-term archive |
| Monthly | 7 years | S3 Deep Archive | Legal/compliance |

---

## Communication Plan

### Disaster Response Team

| Role | Person | Contact | Escalation |
|------|--------|---------|------------|
| Incident Commander | On-call Dev | Slack/SMS | Tech Lead |
| Database Admin | DBA Team | Slack/Email | CTO |
| Infrastructure | Ops Team | Slack/Email | DevOps Lead |
| Communications | PM | Email/Slack | CEO |

### Status Page Communication

- Initial notification: within 5 minutes
- Updates: every 15 minutes during outage
- Resolution: within 2 hours
- Post-mortem: within 24 hours

---

## Checklist

- [ ] Backup script running and verified
- [ ] S3 bucket created with versioning/encryption
- [ ] IAM roles configured for AWS access
- [ ] PITR enabled in PostgreSQL
- [ ] Monthly DR drills scheduled
- [ ] Disaster response team trained
- [ ] Status page configured
- [ ] Alert notifications set up
- [ ] Recovery runbooks documented
- [ ] Backup retention policies enforced

---

**Last Updated**: 2024-03-02
**Next Review**: 2024-06-02
**Maintained By**: Ops Team
