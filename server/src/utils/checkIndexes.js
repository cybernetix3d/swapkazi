/**
 * MongoDB Index Check Script
 * 
 * This script checks and displays all indexes in the SwapKazi database.
 * Run with: node src/utils/checkIndexes.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for index checking'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const checkIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    // Check indexes for each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`\n=== Indexes for ${collectionName} collection ===`);
      
      const indexes = await db.collection(collectionName).indexes();
      
      // Display each index
      indexes.forEach((index, i) => {
        console.log(`\nIndex ${i + 1}:`);
        console.log(`  Name: ${index.name}`);
        console.log(`  Key: ${JSON.stringify(index.key)}`);
        if (index.unique) {
          console.log('  Type: Unique');
        } else if (index.sparse) {
          console.log('  Type: Sparse');
        } else if (index.background) {
          console.log('  Type: Background');
        }
        
        // Display additional properties for special index types
        if (index.weights) {
          console.log('  Text Index Weights:');
          Object.entries(index.weights).forEach(([field, weight]) => {
            console.log(`    ${field}: ${weight}`);
          });
        }
        
        if (index['2dsphereIndexVersion']) {
          console.log('  Type: 2dsphere (Geospatial)');
        }
      });
    }
    
    console.log('\nIndex check completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error checking indexes:', error);
    process.exit(1);
  }
};

// Run the index check function
checkIndexes();
