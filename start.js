// Startup script that runs migrations then starts the server
import { fileURLToPath } from 'url';
import path from 'path';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

// Run migration first
const migrate = spawn('node', ['packages/backend/scripts/migrate.js'], {
  stdio: 'inherit',
  env: process.env,
});

migrate.on('close', (code) => {
  if (code !== 0) {
    console.error('Migration failed with code:', code);
    process.exit(code);
  }
  
  console.log('\n✓ Migration completed. Starting server...\n');
  
  // Then start the server
  const server = spawn('node', ['packages/backend/dist/index.js'], {
    stdio: 'inherit',
    env: process.env,
  });
  
  server.on('close', (code) => {
    process.exit(code);
  });
});
