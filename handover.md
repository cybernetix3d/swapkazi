# SwapKazi Project Handover Document

SwapKazi is a skills-based bartering platform that allows users to exchange services and talents rather than focusing on second-hand goods. The application consists of:

1. **Backend**: Express.js/Node.js server with MongoDB database
2. **Frontend**: React Native mobile application using Expo

The platform enables users to:
- Create listings for services they can offer
- Browse available services from other users
- Filter and search for specific services
- Message other users
- Create and manage transactions
- Manage their profile and account

## Technical Architecture

### Backend (Server)

- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT-based authentication
- **API Structure**: RESTful API endpoints
- **Server Port**: 5000
- **MongoDB Connection**: Connected to MongoDB Atlas (swapkazi.mongodb.net)

### Frontend (Mobile)

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Context API
- **API Integration**: Axios for HTTP requests
- **UI Components**: Custom components with theming support
- **Image Storage**: Firebase Storage (bucket: gs://swapkazi.firebasestorage.app)

## Project Structure

### Backend Structure

```
server/
├── src/
│   ├── controllers/       # Business logic for each entity
│   ├── middleware/        # Auth middleware and request handlers
│   ├── models/            # MongoDB schema definitions
│   ├── routes/            # API route definitions
│   ├── services/          # Shared services (email, storage, etc.)
│   ├── utils/             # Helper functions
│   └── index.js           # Main server entry point
├── package.json
└── .env                   # Environment variables (not in repo)
```

### Frontend Structure

```
mobile/
├── app/                   # Expo Router app directory
│   ├── (app)/             # Main app screens (authenticated)
│   │   ├── home/          # Home screen
│   │   ├── marketplace/   # Listings and search
│   │   ├── messages/      # Messaging system
│   │   ├── profile/       # User profile
│   │   └── transactions/  # Transaction management
│   ├── (auth)/            # Authentication screens
│   └── _layout.tsx        # Root layout component
├── assets/                # Images, fonts, etc.
├── components/            # Reusable UI components
├── constants/             # App constants and theme
├── contexts/              # React Context providers
├── services/              # API service integrations
├── types/                 # TypeScript type definitions
├── utils/                 # Helper functions
├── app.json               # Expo configuration
└── package.json
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/update` - Update user profile

### Listings

- `GET /api/listings` - Get all listings
- `GET /api/listings/search` - Search listings with filters
- `GET /api/listings/:id` - Get a specific listing
- `POST /api/listings` - Create a new listing
- `PUT /api/listings/:id` - Update a listing
- `DELETE /api/listings/:id` - Delete a listing
- `GET /api/listings/nearby` - Get listings near user's location

### Users

- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/nearby` - Get users near current location
- `POST /api/users/:id/rate` - Rate a user

### Messages

- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/conversations/:id` - Get a specific conversation
- `GET /api/messages/conversations/:id/messages` - Get messages in a conversation
- `POST /api/messages` - Send a new message

### Transactions

- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get a specific transaction
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update transaction status
- `POST /api/transactions/:id/complete` - Complete a transaction

### Upload

- `POST /api/upload/image` - Upload an image to Firebase Storage

## Authentication Flow

1. User registers or logs in through the auth screens
2. Server validates credentials and returns a JWT token
3. Token is stored in the AuthContext and used for all subsequent API requests
4. Token is validated on each request via the auth middleware
5. Token expiration is handled by refreshing or redirecting to login

## Database Models

### User Model

```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  fullName: String,
  bio: String,
  avatar: String (URL),
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number, Number], // [longitude, latitude]
    address: String
  },
  skills: [String],
  rating: Number,
  reviews: [{
    user: ObjectId (ref: 'User'),
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  talentBalance: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Listing Model

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  title: String,
  description: String,
  category: String,
  subCategory: String,
  images: [{
    _id: ObjectId,
    url: String,
    caption: String
  }],
  condition: String, // "New", etc.
  listingType: String, // "Offer" or "Request"
  exchangeType: String, // "Talent", "Direct Swap", or "Both"
  talentPrice: Number,
  swapFor: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number, Number], // [longitude, latitude]
    address: String
  },
  isActive: Boolean,
  isFeatured: Boolean,
  views: Number,
  likes: [ObjectId (ref: 'User')],
  completedTransaction: ObjectId (ref: 'Transaction'),
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Transaction Model

```javascript
{
  _id: ObjectId,
  initiator: ObjectId (ref: 'User'),
  recipient: ObjectId (ref: 'User'),
  listing: ObjectId (ref: 'Listing'),
  status: String, // "Proposed", "Accepted", "Rejected", "Completed", "Cancelled", "Disputed", "Resolved"
  type: String, // "Talent", "Direct Swap", or "Combined"
  talentAmount: Number,
  items: [String], // For direct swap items
  messages: [{
    sender: ObjectId (ref: 'User'),
    content: String,
    timestamp: Date
  }],
  meetupLocation: {
    type: { type: String, default: 'Point' },
    coordinates: [Number, Number], // [longitude, latitude]
    address: String
  },
  meetupTime: Date,
  statusHistory: [{
    status: String,
    timestamp: Date,
    updatedBy: ObjectId (ref: 'User')
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Conversation Model

```javascript
{
  _id: ObjectId,
  participants: [ObjectId (ref: 'User')],
  listing: ObjectId (ref: 'Listing'),
  lastMessage: {
    sender: ObjectId (ref: 'User'),
    content: String,
    createdAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Message Model

```javascript
{
  _id: ObjectId,
  conversation: ObjectId (ref: 'Conversation'),
  sender: ObjectId (ref: 'User'),
  content: String,
  readBy: [ObjectId (ref: 'User')],
  isSystemMessage: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Key Features Implemented

1. **Authentication System**
   - Registration and login
   - JWT token-based authentication
   - Password hashing with bcrypt
   - Profile management

2. **Listing Management**
   - Create, read, update, delete listings
   - Image upload to Firebase Storage
   - Filtering and searching
   - Categories and subcategories

3. **Messaging System**
   - Real-time messaging between users
   - Conversation management
   - Message history

4. **Transaction System**
   - Create and manage transactions
   - Different transaction statuses (Proposed, Accepted, Rejected, Completed, Cancelled, Disputed, Resolved)
   - Transaction history with detailed status tracking
   - Talent currency transfers between users
   - Listing status updates when transactions complete

5. **User Interface**
   - Responsive design
   - Dark/light theme support
   - Custom components
   - Error handling and loading states

6. **Geolocation Features**
   - Nearby listings
   - Nearby users
   - Location-based filtering

## Error Handling

The application implements comprehensive error handling:

1. **Backend Error Handling**
   - Consistent error response format
   - HTTP status codes for different error types
   - Validation error handling

2. **Frontend Error Handling**
   - Custom ErrorMessage component
   - Loading states with LoadingIndicator component
   - Retry mechanisms for failed API calls
   - Null checks for missing data

## Recent Improvements

1. **Removed Mock Data**
   - Replaced all mock data with real API calls
   - Implemented proper error handling for API responses

2. **Enhanced Error Handling**
   - Added reusable ErrorMessage component
   - Added reusable LoadingIndicator component
   - Improved error states in all screens

3. **Fixed Critical Bugs**
   - Fixed "Cannot read properties of undefined (reading 'address')" error in listing details
   - Added null checks for missing data
   - Improved handling of edge cases

4. **UI Improvements**
   - Better loading states
   - More informative error messages
   - Enhanced empty states

5. **Transaction System Improvements**
   - Removed all mock data from transaction screens
   - Enhanced transaction completion flow with confirmation dialogs
   - Added balance verification before completing transactions
   - Improved transaction history display with detailed status descriptions
   - Added proper error handling for all transaction operations

6. **Profile Viewing Implementation**
   - Added profile/[id] route for viewing other users' profiles
   - Implemented ability to message users directly from their profile
   - Added proper error handling for profile data loading
   - Enhanced UI for profile viewing

## Known Issues

1. **Route Improvements** ✅
   - The "profile/[id]" route has been implemented
   - Users can now view other users' profiles by ID
   - Added ability to message users directly from their profile

2. **Deprecated Style Props**
   - Some components use deprecated style properties
   - Should update to use newer style properties

3. **Firebase Storage Configuration**
   - Ensure Firebase Storage bucket is correctly configured

## Next Steps and Recommendations

### High Priority

1. **Route Improvements** ✅
   - The profile/[id] route has been implemented
   - Users can now view other users' profiles
   - Added ability to message users directly from their profile

2. **Transaction System Improvements** ✅
   - Transaction flow has been finalized
   - Talent balance updates implemented
   - Transaction completion with confirmation dialogs added
   - Enhanced transaction history with detailed status descriptions
   - Improved error handling for all transaction operations

3. **Enhance Search and Filtering**
   - Improve geospatial queries
   - Add more filter options
   - Optimize search performance

### Medium Priority

1. **UI/UX Improvements**
   - Update deprecated style props
   - Enhance accessibility
   - Improve responsive design

2. **Performance Optimization**
   - Implement caching for API responses
   - Add pagination for large data sets
   - Optimize image loading

3. **Testing**
   - Add unit tests for critical components
   - Implement integration tests for API services
   - Add end-to-end testing

### Low Priority

1. **Additional Features**
   - Implement notifications
   - Add social sharing
   - Enhance user profiles

2. **Analytics**
   - Add analytics to track user behavior
   - Monitor error rates
   - Track performance metrics

## Development Environment Setup

### Backend Setup

1. Clone the repository
2. Navigate to the server directory: `cd server`
3. Install dependencies: `npm install`
4. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@swapkazi.mongodb.net/swapkazi
   JWT_SECRET=your_jwt_secret
   FIREBASE_STORAGE_BUCKET=gs://swapkazi.firebasestorage.app
   ```
5. Start the server: `npm start`

### Frontend Setup

1. Navigate to the mobile directory: `cd mobile`
2. Install dependencies: `npm install`
3. Create a `config.js` file in the `mobile/config` directory:
   ```javascript
   export default {
     apiBaseUrl: 'http://192.168.1.224:5000/api',
     enableMockData: false,
     firebaseConfig: {
       // Your Firebase configuration
       storageBucket: 'swapkazi.firebasestorage.app'
     }
   };
   ```
4. Start the Expo development server: `npx expo start`

## Deployment

### Backend Deployment

The server can be deployed to any Node.js hosting service:

1. **Heroku**
   - Create a Heroku account
   - Install Heroku CLI
   - Run `heroku create`
   - Set environment variables in Heroku dashboard
   - Deploy with `git push heroku main`

2. **AWS/Digital Ocean/Other VPS**
   - Set up a VPS with Node.js
   - Use PM2 for process management
   - Set up Nginx as a reverse proxy
   - Configure SSL with Let's Encrypt

### Frontend Deployment

The mobile app can be deployed to app stores:

1. **Expo Build**
   - Run `expo build:android` or `expo build:ios`
   - Follow Expo's instructions for app store submission

2. **EAS Build**
   - Configure `eas.json`
   - Run `eas build --platform android` or `eas build --platform ios`
   - Submit builds to app stores

## Conclusion

SwapKazi is a comprehensive skills-based bartering platform with a solid foundation. The backend API is well-structured and the mobile app provides a good user experience. With the recent improvements to error handling, the removal of mock data, the implementation of the transaction system, and the addition of profile viewing functionality, the application is now more robust and ready for further development.

The next steps should focus on enhancing the search functionality, improving UI/UX, and optimizing performance. With these improvements, SwapKazi will be ready for beta testing and eventual production deployment.

## Contact Information

For any questions or issues regarding this handover document, please contact the development team.
