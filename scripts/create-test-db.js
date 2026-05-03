const { Client } = require('pg');

async function createTestDatabase() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'agilepm',
    password: 'agilepm_secret',
    database: 'postgres',
  });

  try {
    await client.connect();
    
    const res = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'agilepm_test'"
    );
    
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE agilepm_test');
      console.log('✅ Created agilepm_test database');
    } else {
      console.log('ℹ️  agilepm_test database already exists');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTestDatabase();
