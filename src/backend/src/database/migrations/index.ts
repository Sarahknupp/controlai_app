import mongoose from 'mongoose';
import { config } from '../../config';

/**
 * Run database migrations
 */
async function runMigrations() {
  try {
    await mongoose.connect(config.database.uri, config.database.options);
    console.log('Connected to database');

    // Add migrations here
    // Example: await require('./001_initial_schema').up();

    console.log('Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations(); 