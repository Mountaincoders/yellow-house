import express, { Response, Express } from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './db.js';
import authRoutes from './routes/auth.js';
import groupRoutes from './routes/groups.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Run migrations on startup
async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    const schemaPath = path.join(__dirname, '../database/001-initial-schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolon and execute statements
    const statements = sql.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
        } catch (err: any) {
          // Warn on non-fatal errors (duplicate objects, etc)
          if (!err.message?.includes('already exists') && err.code !== 'DUPLICATE_OBJECT') {
            throw err;
          }
          console.warn('⚠ Non-fatal migration warning:', err.message?.substring(0, 100));
        }
      }
    }
    console.log('✓ Database migrations completed successfully');
  } catch (error) {
    console.error('✗ Migration failed:', error);
    process.exit(1);
  }
}

// Routes
app.get('/health', (_, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/groups', groupRoutes);

// Error handler
app.use((_, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
(async () => {
  await runMigrations();
  
  const server = app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
    });
  });
})();

export default app;
