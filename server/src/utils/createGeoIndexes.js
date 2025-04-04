/**
 * Create Geospatial Indexes
 * 
 * This script ensures that all necessary geospatial indexes are created in MongoDB.
 * Run this script after deploying to a new environment or if you're experiencing
 * issues with geospatial queries.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('../models/listing.model');
const User = require('../models/user.model');

async function createGeoIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Create geospatial index on Listing model
    console.log('Creating geospatial index on Listing.location...');
    await Listing.collection.createIndex({ 'location': '2dsphere' });
    console.log('Geospatial index created on Listing.location');

    // Create geospatial index on User model
    console.log('Creating geospatial index on User.location...');
    await User.collection.createIndex({ 'location': '2dsphere' });
    console.log('Geospatial index created on User.location');

    // Create text indexes for search
    console.log('Creating text index on Listing fields...');
    await Listing.collection.createIndex(
      { 
        title: 'text', 
        description: 'text',
        swapFor: 'text',
        subCategory: 'text'
      },
      {
        weights: {
          title: 10,
          description: 5,
          swapFor: 3,
          subCategory: 2
        },
        name: 'listing_text_index'
      }
    );
    console.log('Text index created on Listing fields');

    // Create other useful indexes
    console.log('Creating additional indexes...');
    await Listing.collection.createIndex({ category: 1 });
    await Listing.collection.createIndex({ user: 1 });
    await Listing.collection.createIndex({ createdAt: -1 });
    await Listing.collection.createIndex({ talentPrice: 1 });
    await Listing.collection.createIndex({ exchangeType: 1 });
    await Listing.collection.createIndex({ listingType: 1 });
    await Listing.collection.createIndex({ isActive: 1 });
    await Listing.collection.createIndex({ category: 1, createdAt: -1 });
    await Listing.collection.createIndex({ user: 1, isActive: 1 });
    await Listing.collection.createIndex({ exchangeType: 1, talentPrice: 1 });
    console.log('Additional indexes created');

    // List all indexes to verify
    console.log('\nListing indexes:');
    const listingIndexes = await Listing.collection.indexes();
    listingIndexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\nUser indexes:');
    const userIndexes = await User.collection.indexes();
    userIndexes.forEach(index => {
      console.log(`- ${index.name}: ${JSON.stringify(index.key)}`);
    });

    console.log('\nAll indexes created successfully!');
  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  createGeoIndexes()
    .then(() => {
      console.log('Index creation completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Index creation failed:', err);
      process.exit(1);
    });
}

module.exports = createGeoIndexes;
