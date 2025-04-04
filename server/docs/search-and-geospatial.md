# SwapKazi Search and Geospatial Features

This document provides information about the search and geospatial features in the SwapKazi application.

## Overview

SwapKazi offers powerful search and location-based features:

- Full-text search across listings
- Advanced filtering options
- Geospatial queries for finding nearby listings
- Distance calculation and sorting
- Pagination and sorting options

## Search API

### Search Listings

```
GET /api/listings/search
```

**Description:** Search for listings with advanced filtering options

**Authentication:** Optional

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| query | string | Text search term |
| category | string | Filter by category |
| subCategory | string | Filter by sub-category |
| exchangeType | string | Filter by exchange type (Talent, Direct Swap, Both) |
| listingType | string | Filter by listing type (Offer, Request) |
| condition | string | Filter by condition |
| minPrice | number | Minimum talent price |
| maxPrice | number | Maximum talent price |
| longitude | number | User's longitude for location-based search |
| latitude | number | User's latitude for location-based search |
| distance | number | Search radius in meters (default: 50000) |
| sortBy | string | Sort field (createdAt, price, relevance) |
| order | string | Sort order (asc, desc) |
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 20) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "title": "Professional Photography",
      "description": "I offer professional photography services",
      "category": "Services",
      "images": [
        {
          "url": "https://example.com/image1.jpg",
          "caption": "Sample work"
        }
      ],
      "talentPrice": 50,
      "user": {
        "_id": "60d21b4667d0d8992e610c83",
        "username": "photographer",
        "fullName": "John Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "location": {
        "type": "Point",
        "coordinates": [18.4241, -33.9249],
        "address": "Cape Town, South Africa"
      },
      "createdAt": "2023-01-15T12:00:00.000Z"
    }
  ],
  "count": 1,
  "total": 10,
  "page": 1,
  "totalPages": 1
}
```

## Geospatial API

### Get Nearby Listings

```
GET /api/listings/nearby
```

**Description:** Find listings near a specific location

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| longitude | number | User's longitude (required) |
| latitude | number | User's latitude (required) |
| distance | number | Search radius in meters (default: 10000) |
| category | string | Filter by category |
| subCategory | string | Filter by sub-category |
| exchangeType | string | Filter by exchange type |
| listingType | string | Filter by listing type |
| minPrice | number | Minimum talent price |
| maxPrice | number | Maximum talent price |
| sortBy | string | Sort field (distance, price_asc, price_desc, date) |
| page | number | Page number (default: 1) |
| limit | number | Results per page (default: 20) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d21b4667d0d8992e610c85",
      "title": "Professional Photography",
      "description": "I offer professional photography services",
      "category": "Services",
      "images": [
        {
          "url": "https://example.com/image1.jpg",
          "caption": "Sample work"
        }
      ],
      "talentPrice": 50,
      "user": {
        "_id": "60d21b4667d0d8992e610c83",
        "username": "photographer",
        "fullName": "John Doe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "location": {
        "type": "Point",
        "coordinates": [18.4241, -33.9249],
        "address": "Cape Town, South Africa"
      },
      "distance": 2.5,
      "distanceFormatted": "2.5 km",
      "createdAt": "2023-01-15T12:00:00.000Z"
    }
  ],
  "count": 1,
  "total": 5,
  "page": 1,
  "totalPages": 1
}
```

## Implementation Details

### MongoDB Indexes

The following indexes are used to optimize search and geospatial queries:

1. **Text Index**:
   ```javascript
   {
     title: 'text',
     description: 'text',
     swapFor: 'text',
     subCategory: 'text'
   }
   ```
   With weights:
   ```javascript
   {
     title: 10,
     description: 5,
     swapFor: 3,
     subCategory: 2
   }
   ```

2. **Geospatial Index**:
   ```javascript
   { location: '2dsphere' }
   ```

3. **Other Indexes**:
   ```javascript
   { category: 1 }
   { user: 1 }
   { createdAt: -1 }
   { talentPrice: 1 }
   { exchangeType: 1 }
   { listingType: 1 }
   { isActive: 1 }
   { category: 1, createdAt: -1 }
   { user: 1, isActive: 1 }
   { exchangeType: 1, talentPrice: 1 }
   ```

### Distance Calculation

Distances are calculated using the Haversine formula, which accounts for the Earth's curvature:

```javascript
const calculateDistance = (coords1, coords2) => {
  const [lng1, lat1] = coords1;
  const [lng2, lat2] = coords2;
  
  // Haversine formula
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(1)); // Distance in km with 1 decimal place
};
```

## Best Practices

1. **Always include coordinates**: When creating or updating listings, always include valid coordinates in the location field.

2. **Use text search for queries with 3+ characters**: Text search is more efficient for longer queries.

3. **Use geospatial queries when location matters**: The `nearby` endpoint is optimized for location-based searches.

4. **Combine filters**: You can combine text search, category filters, and location filters for precise results.

5. **Use pagination**: Always use pagination for large result sets to improve performance.

## Troubleshooting

If you encounter issues with search or geospatial queries:

1. **Verify indexes**: Run the `createGeoIndexes.js` script to ensure all indexes are properly created.

2. **Check coordinates**: Make sure coordinates are in the correct format [longitude, latitude].

3. **Validate search parameters**: Ensure all parameters are properly formatted and within valid ranges.

4. **Monitor query performance**: Use MongoDB's explain() function to analyze query performance.

For any other issues, please contact the development team.
