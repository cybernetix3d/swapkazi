# SwapKazi Image Upload Documentation

This document provides information about the image upload functionality in the SwapKazi application.

## Overview

SwapKazi uses Firebase Storage for storing images, with the following features:

- Secure upload of images to Firebase Storage
- Automatic URL generation for uploaded images
- Image deletion when listings are deleted or updated
- Support for multiple image uploads
- Validation of file types and sizes

## API Endpoints

### Upload User Avatar

```
POST /api/upload/avatar
```

**Description:** Upload a user profile picture

**Authentication:** Required

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file`: Image file (JPEG, PNG, GIF, or WebP)

**Response:**
```json
{
  "success": true,
  "fileUrl": "https://firebasestorage.googleapis.com/v0/b/swapkazi.firebasestorage.app/o/avatars%2F1234567890.jpg?alt=media&token=abcdef"
}
```

### Upload Listing Image

```
POST /api/upload/listing
```

**Description:** Upload a single image for a listing

**Authentication:** Required

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `file`: Image file (JPEG, PNG, GIF, or WebP)

**Response:**
```json
{
  "success": true,
  "fileUrl": "https://firebasestorage.googleapis.com/v0/b/swapkazi.firebasestorage.app/o/listings%2F1234567890.jpg?alt=media&token=abcdef"
}
```

### Upload Multiple Listing Images

```
POST /api/upload/multiple
```

**Description:** Upload multiple images for a listing (up to 5)

**Authentication:** Required

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `files`: Array of image files (JPEG, PNG, GIF, or WebP)

**Response:**
```json
{
  "success": true,
  "fileUrls": [
    "https://firebasestorage.googleapis.com/v0/b/swapkazi.firebasestorage.app/o/listings%2F1234567890-1.jpg?alt=media&token=abcdef",
    "https://firebasestorage.googleapis.com/v0/b/swapkazi.firebasestorage.app/o/listings%2F1234567890-2.jpg?alt=media&token=ghijkl"
  ]
}
```

### Delete Image

```
DELETE /api/upload
```

**Description:** Delete an image from Firebase Storage

**Authentication:** Required

**Request:**
- Content-Type: `application/json`
- Body:
  ```json
  {
    "fileUrl": "https://firebasestorage.googleapis.com/v0/b/swapkazi.firebasestorage.app/o/listings%2F1234567890.jpg?alt=media&token=abcdef"
  }
  ```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## Integration with Listings

When creating or updating listings, you should:

1. First upload the images using the appropriate upload endpoint
2. Then include the returned URLs in the listing creation/update request

### Example: Creating a Listing with Images

```javascript
// 1. Upload images
const formData = new FormData();
formData.append('file', {
  uri: imageUri,
  name: 'image.jpg',
  type: 'image/jpeg'
});

const uploadResponse = await fetch('http://your-api.com/api/upload/listing', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const { fileUrl } = await uploadResponse.json();

// 2. Create listing with the image URL
const listingData = {
  title: 'My Listing',
  description: 'Description here',
  category: 'Goods',
  listingType: 'Offer',
  exchangeType: 'Talent',
  talentPrice: 10,
  images: [{ url: fileUrl, caption: 'My image' }]
};

const listingResponse = await fetch('http://your-api.com/api/listings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(listingData)
});
```

## File Limitations

- Maximum file size: 5MB per file
- Allowed file types: JPEG, PNG, GIF, WebP
- Maximum number of files per upload: 5 (for multiple upload endpoint)

## Security Considerations

- All uploads require authentication
- Files are validated for type and size
- Firebase Storage security rules restrict access to authenticated users
- When a listing is deleted, associated images are automatically deleted
- When a listing is updated and images are removed, those images are automatically deleted

## Implementation Details

The image upload functionality is implemented using:

- Firebase Storage for storing images
- Multer for handling multipart/form-data requests
- Firebase Admin SDK for server-side operations
- Custom utility functions for uploading and deleting files

## Troubleshooting

If you encounter issues with image uploads:

1. Check that you're using the correct Content-Type (`multipart/form-data`)
2. Ensure the file size is under 5MB
3. Verify that the file type is supported (JPEG, PNG, GIF, WebP)
4. Check that you're properly authenticated
5. Verify that the Firebase Storage bucket is correctly configured

For any other issues, please contact the development team.
