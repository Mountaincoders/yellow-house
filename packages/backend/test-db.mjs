import pg from 'pg';
import crypto from 'crypto';

const client = new pg.Client({
  connectionString: 'postgresql://com_yellowhouse_app_user:z8Ez8jiRgRiUjsa2ZAPRwEVbbT2MxlpE@dpg-d6jcobrh46gs739f39jg-a/com_yellowhouse_app'
});

try {
  await client.connect();
  console.log('✓ Connected to database');
  
  const schema = await client.query(`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    ORDER BY ordinal_position
  `);
  
  console.log('\n✓ Users table columns:');
  schema.rows.forEach(row => {
    console.log(`  ${row.column_name}: ${row.data_type} ${row.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
  });
  
  console.log('\n🔄 Attempting insert...');
  const hash = crypto.createHash('sha256').update('TestPass123!').digest('hex');
  
  const result = await client.query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
    ['testdb@example.com', hash, 'Test User']
  );
  
  console.log('✓ Insert successful:', result.rows[0]);
  
  await client.query('DELETE FROM users WHERE email = $1', ['testdb@example.com']);
  console.log('✓ Cleanup complete');
  
} catch (err) {
  console.error('✗ Error:', err.message);
  process.exit(1);
} finally {
  await client.end();
}
