import { execSync } from 'child_process';

export default async () => {
  // Set test database URL
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 
    'postgresql://agilepm:agilepm_secret@localhost:5432/agilepm_test';

  console.log('Setting up test database...');

  try {
    // Run migrations on test database
    execSync('npx prisma migrate deploy', {
      cwd: '../../packages/database',
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    });
    console.log('Test database ready');
  } catch (error) {
    console.log('Migration failed, but continuing...');
    // If migration fails (e.g., DB doesn't exist), we'll skip and let tests fail
  }
};
