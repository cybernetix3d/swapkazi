/**
 * MongoDB Index Creation Script
 *
 * This script creates optimized indexes for the SwapKazi database collections.
 * Run with: node src/utils/createIndexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for index creation'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const createIndexes = async () => {
  try {
    const db = mongoose.connection;

    // Function to safely create an index
    const safeCreateIndex = async (collection, indexSpec, options) => {
      try {
        // Create the index and handle errors appropriately
        await db.collection(collection).createIndex(indexSpec, options);
        console.log(`Created ${options.name} index`);
      } catch (error) {
        // If index already exists with a different name (code 85) or other error
        if (error.code === 85) {
          console.log(`Index for ${JSON.stringify(indexSpec)} already exists with a different name. Skipping...`);
        } else if (error.code === 86) {
          console.log(`Index with same name ${options.name} but different options already exists. Skipping...`);
        } else {
          console.log(`Error creating index ${options.name}: ${error.message}`);
        }
      }
    };

    console.log('Creating indexes for users collection...');

    // Skills index for finding users with specific skills
    await safeCreateIndex('users',
      { "skills": 1 },
      { name: "skills_index", background: true }
    );

    // Talent balance index for sorting/filtering by balance
    await safeCreateIndex('users',
      { "talentBalance": 1 },
      { name: "talent_balance_index", background: true }
    );

    // Average rating index for finding top-rated professionals
    await safeCreateIndex('users',
      { "averageRating": -1 },
      { name: "average_rating_index", background: true }
    );

    // Compound index for finding highly-rated professionals with specific skills
    await safeCreateIndex('users',
      { "skills": 1, "averageRating": -1 },
      { name: "skills_rating_index", background: true }
    );

    // Text index for searching across user profiles
    await safeCreateIndex('users',
      { "bio": "text", "skills": "text", "fullName": "text" },
      {
        name: "user_text_search_index",
        background: true,
        weights: {
          "skills": 10,
          "fullName": 5,
          "bio": 3
        }
      }
    );

    // Active users index
    await safeCreateIndex('users',
      { "isActive": 1 },
      { name: "active_users_index", background: true }
    );

    // Now let's create indexes for the listings collection
    console.log('Creating indexes for listings collection...');

    // Category index
    await safeCreateIndex('listings',
      { "category": 1 },
      { name: "category_index", background: true }
    );

    // Featured listings index
    await safeCreateIndex('listings',
      { "isFeatured": 1 },
      { name: "featured_index", background: true }
    );

    // Active listings index
    await safeCreateIndex('listings',
      { "isActive": 1 },
      { name: "active_listings_index", background: true }
    );

    // Talent price index
    await safeCreateIndex('listings',
      { "talentPrice": 1 },
      { name: "talent_price_index", background: true }
    );

    // Geospatial index for location-based searches
    await safeCreateIndex('listings',
      { "location.coordinates": "2dsphere" },
      { name: "listing_location_index", background: true }
    );

    // Text index for searching listings
    await safeCreateIndex('listings',
      { "title": "text", "description": "text", "category": "text", "subCategory": "text" },
      {
        name: "listing_text_search_index",
        background: true,
        weights: {
          "title": 10,
          "category": 5,
          "subCategory": 3,
          "description": 2
        }
      }
    );

    // Compound index for category and price
    await safeCreateIndex('listings',
      { "category": 1, "talentPrice": 1 },
      { name: "category_price_index", background: true }
    );

    // Now let's create indexes for the transactions collection
    console.log('Creating indexes for transactions collection...');

    // Status index
    await safeCreateIndex('transactions',
      { "status": 1 },
      { name: "transaction_status_index", background: true }
    );

    // Initiator and recipient indexes
    await safeCreateIndex('transactions',
      { "initiator": 1 },
      { name: "initiator_index", background: true }
    );

    await safeCreateIndex('transactions',
      { "recipient": 1 },
      { name: "recipient_index", background: true }
    );

    // Listing index
    await safeCreateIndex('transactions',
      { "listing": 1 },
      { name: "transaction_listing_index", background: true }
    );

    // Date index for sorting by most recent
    await safeCreateIndex('transactions',
      { "createdAt": -1 },
      { name: "transaction_date_index", background: true }
    );

    // Now let's create indexes for the conversations collection
    console.log('Creating indexes for conversations collection...');

    // Participants index
    await safeCreateIndex('conversations',
      { "participants": 1 },
      { name: "participants_index", background: true }
    );

    // Transaction index
    await safeCreateIndex('conversations',
      { "transaction": 1 },
      { name: "conversation_transaction_index", background: true }
    );

    // Updated at index for sorting by most recent
    await safeCreateIndex('conversations',
      { "updatedAt": -1 },
      { name: "conversation_updated_index", background: true }
    );

    // Now let's create indexes for the messages collection
    console.log('Creating indexes for messages collection...');

    // Conversation index
    await safeCreateIndex('messages',
      { "conversation": 1 },
      { name: "message_conversation_index", background: true }
    );

    // Sender index
    await safeCreateIndex('messages',
      { "sender": 1 },
      { name: "message_sender_index", background: true }
    );

    // Created at index for sorting by most recent
    await safeCreateIndex('messages',
      { "createdAt": 1 },
      { name: "message_date_index", background: true }
    );

    console.log('All indexes created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
};

// Run the index creation function
createIndexes();
