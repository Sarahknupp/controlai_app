import mongoose from 'mongoose';
import { config } from '../../config';

/**
 * Run database seeds
 */
async function runSeeds() {
  try {
    await mongoose.connect(config.database.uri, config.database.options);
    console.log('Connected to database');

    // Add seeds here
    // Example: await require('./001_admin_user').seed();
    // Example: await require('./002_default_products').seed();

    console.log('Seeds completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

runSeeds(); 