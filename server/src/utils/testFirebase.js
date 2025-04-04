// server/src/utils/testFirebase.js
const { bucket } = require('../config/firebase');

async function testFirebaseConnection() {
  try {
    console.log('Testing Firebase Storage connection...');
    console.log(`Bucket name: ${bucket.name}`);

    // List files in the bucket
    const [files] = await bucket.getFiles({ maxResults: 10 });

    console.log('Connection successful!');
    console.log(`Found ${files.length} files in bucket:`);

    if (files.length > 0) {
      files.forEach(file => {
        console.log(`- ${file.name} (${file.metadata.size || 'unknown'} bytes)`);
        console.log(`  URL: https://storage.googleapis.com/${bucket.name}/${file.name}`);
      });
    } else {
      console.log('No files found in the bucket.');
    }
  } catch (error) {
    console.error('Firebase connection error:', error);
  }
}

testFirebaseConnection();