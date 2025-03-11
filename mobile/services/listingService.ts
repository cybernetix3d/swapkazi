import { Listing, ListingFormData, ListingFilter, PaginatedResponse, ApiResponse } from '../types';

// Mock listings data
const mockListings: Listing[] = [
  {
    _id: '1',
    user: {
      _id: '101',
      username: 'thabo_m',
      email: 'thabo@example.com',
      fullName: 'Thabo M',
      skills: ['Crafts', 'Pottery'],
      talentBalance: 75,
      location: {
        type: 'Point',
        coordinates: [18.4241, -33.9249],
        address: 'Khayelitsha, Cape Town'
      },
      ratings: [],
      averageRating: 4.5,
      isActive: true,
      createdAt: '2023-01-15T10:30:00Z',
      updatedAt: '2023-01-15T10:30:00Z'
    },
    title: 'Handcrafted Pottery',
    description: 'Beautiful handmade clay pots and vases. Perfect for home decoration or gifting.',
    category: 'Crafts',
    subCategory: 'Pottery',
    images: [
      {
        url: 'https://via.placeholder.com/400',
        caption: 'Clay vase set'
      }
    ],
    condition: 'New',
    listingType: 'Offer',
    exchangeType: 'Both',
    talentPrice: 15,
    swapFor: 'Gardening tools or plant cuttings',
    location: {
      type: 'Point',
      coordinates: [18.4241, -33.9249],
      address: 'Khayelitsha, Cape Town'
    },
    isActive: true,
    isFeatured: true,
    views: 45,
    likes: [],
    expiresAt: '2023-03-15T10:30:00Z',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-01-15T10:30:00Z'
  },
  {
    _id: '2',
    user: {
      _id: '102',
      username: 'lerato_k',
      email: 'lerato@example.com',
      fullName: 'Lerato K',
      skills: ['Gardening', 'Landscaping'],
      talentBalance: 120,
      location: {
        type: 'Point',
        coordinates: [18.4641, -33.9249],
        address: 'Gugulethu, Cape Town'
      },
      ratings: [],
      averageRating: 4.8,
      isActive: true,
      createdAt: '2023-01-10T09:20:00Z',
      updatedAt: '2023-01-10T09:20:00Z'
    },
    title: 'Garden Maintenance Services',
    description: 'Professional garden maintenance including pruning, planting, and general care. Make your garden beautiful!',
    category: 'Services',
    subCategory: 'Gardening',
    images: [
      {
        url: 'https://via.placeholder.com/400',
        caption: 'Garden work'
      }
    ],
    condition: 'Not Applicable',
    listingType: 'Offer',
    exchangeType: 'Talent',
    talentPrice: 25,
    location: {
      type: 'Point',
      coordinates: [18.4641, -33.9249],
      address: 'Gugulethu, Cape Town'
    },
    isActive: true,
    isFeatured: true,
    views: 68,
    likes: [],
    expiresAt: '2023-03-10T09:20:00Z',
    createdAt: '2023-01-10T09:20:00Z',
    updatedAt: '2023-01-10T09:20:00Z'
  },
  {
    _id: '3',
    user: {
      _id: '103',
      username: 'sipho_n',
      email: 'sipho@example.com',
      fullName: 'Sipho N',
      skills: ['Baking', 'Cooking'],
      talentBalance: 85,
      location: {
        type: 'Point',
        coordinates: [18.5041, -33.9449],
        address: 'Langa, Cape Town'
      },
      ratings: [],
      averageRating: 4.7,
      isActive: true,
      createdAt: '2023-01-05T14:15:00Z',
      updatedAt: '2023-01-05T14:15:00Z'
    },
    title: 'Fresh Homemade Bread',
    description: 'Delicious homemade bread baked daily. Varieties include whole wheat, sourdough, and traditional loaves.',
    category: 'Food',
    subCategory: 'Baked Goods',
    images: [
      {
        url: 'https://via.placeholder.com/400',
        caption: 'Fresh bread'
      }
    ],
    condition: 'New',
    listingType: 'Offer',
    exchangeType: 'Both',
    talentPrice: 8,
    swapFor: 'Fresh vegetables or fruits',
    location: {
      type: 'Point',
      coordinates: [18.5041, -33.9449],
      address: 'Langa, Cape Town'
    },
    isActive: true,
    isFeatured: true,
    views: 37,
    likes: [],
    expiresAt: '2023-02-05T14:15:00Z',
    createdAt: '2023-01-05T14:15:00Z',
    updatedAt: '2023-01-05T14:15:00Z'
  },
  {
    _id: '4',
    user: {
      _id: '104',
      username: 'mandla_j',
      email: 'mandla@example.com',
      fullName: 'Mandla J',
      skills: ['Carpentry', 'Plumbing'],
      talentBalance: 95,
      location: {
        type: 'Point',
        coordinates: [18.4841, -33.9649],
        address: 'Philippi, Cape Town'
      },
      ratings: [],
      averageRating: 4.6,
      isActive: true,
      createdAt: '2022-12-20T11:45:00Z',
      updatedAt: '2022-12-20T11:45:00Z'
    },
    title: 'Handcrafted Wooden Furniture',
    description: 'Custom wooden furniture made from reclaimed wood. Beautiful, durable, and environmentally friendly.',
    category: 'Furniture',
    subCategory: 'Custom',
    images: [
      {
        url: 'https://via.placeholder.com/400',
        caption: 'Wooden table'
      }
    ],
    condition: 'New',
    listingType: 'Offer',
    exchangeType: 'Both',
    talentPrice: 45,
    swapFor: 'Power tools or home repair services',
    location: {
      type: 'Point',
      coordinates: [18.4841, -33.9649],
      address: 'Philippi, Cape Town'
    },
    isActive: true,
    isFeatured: false,
    views: 29,
    likes: [],
    expiresAt: '2023-03-20T11:45:00Z',
    createdAt: '2022-12-20T11:45:00Z',
    updatedAt: '2022-12-20T11:45:00Z'
  },
  {
    _id: '5',
    user: {
      _id: '105',
      username: 'nomsa_t',
      email: 'nomsa@example.com',
      fullName: 'Nomsa T',
      skills: ['Sewing', 'Designing'],
      talentBalance: 110,
      location: {
        type: 'Point',
        coordinates: [18.5241, -33.9249],
        address: 'Nyanga, Cape Town'
      },
      ratings: [],
      averageRating: 4.9,
      isActive: true,
      createdAt: '2022-12-15T13:30:00Z',
      updatedAt: '2022-12-15T13:30:00Z'
    },
    title: 'Traditional Clothing and Alterations',
    description: 'Handmade traditional South African clothing and garment alteration services.',
    category: 'Clothing',
    subCategory: 'Traditional',
    images: [
      {
        url: 'https://via.placeholder.com/400',
        caption: 'Traditional dress'
      }
    ],
    condition: 'New',
    listingType: 'Offer',
    exchangeType: 'Talent',
    talentPrice: 30,
    location: {
      type: 'Point',
      coordinates: [18.5241, -33.9249],
      address: 'Nyanga, Cape Town'
    },
    isActive: true,
    isFeatured: false,
    views: 52,
    likes: [],
    expiresAt: '2023-03-15T13:30:00Z',
    createdAt: '2022-12-15T13:30:00Z',
    updatedAt: '2022-12-15T13:30:00Z'
  }
];

/**
 * Mock implementation of getListings
 */
export const getListings = async (filters?: ListingFilter): Promise<PaginatedResponse<Listing>> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  let filteredListings = [...mockListings];
  
  // Apply filters if provided
  if (filters) {
    if (filters.category) {
      filteredListings = filteredListings.filter(
        listing => listing.category === filters.category
      );
    }
    
    if (filters.listingType) {
      filteredListings = filteredListings.filter(
        listing => listing.listingType === filters.listingType
      );
    }
    
    if (filters.exchangeType) {
      filteredListings = filteredListings.filter(
        listing => listing.exchangeType === filters.exchangeType
      );
    }
    
    if (filters.priceMin !== undefined) {
      filteredListings = filteredListings.filter(
        listing => listing.talentPrice >= filters.priceMin!
      );
    }
    
    if (filters.priceMax !== undefined) {
      filteredListings = filteredListings.filter(
        listing => listing.talentPrice <= filters.priceMax!
      );
    }
    
    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      filteredListings = filteredListings.filter(
        listing => 
          listing.title.toLowerCase().includes(searchTermLower) ||
          listing.description.toLowerCase().includes(searchTermLower)
      );
    }
    
    // Sort listings
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          filteredListings.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case 'oldest':
          filteredListings.sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          break;
        case 'priceAsc':
          filteredListings.sort((a, b) => a.talentPrice - b.talentPrice);
          break;
        case 'priceDesc':
          filteredListings.sort((a, b) => b.talentPrice - a.talentPrice);
          break;
      }
    }
  }
  
  // Paginate results
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedListings = filteredListings.slice(startIndex, endIndex);
  
  return {
    success: true,
    data: paginatedListings,
    count: paginatedListings.length,
    total: filteredListings.length,
    page,
    totalPages: Math.ceil(filteredListings.length / limit)
  };
};

/**
 * Mock implementation of getFeaturedListings
 */
export const getFeaturedListings = async (limit: number = 10): Promise<Listing[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const featuredListings = mockListings.filter(listing => listing.isFeatured);
  return featuredListings.slice(0, limit);
};

/**
 * Mock implementation of getListingById
 */
export const getListingById = async (id: string): Promise<Listing> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const listing = mockListings.find(listing => listing._id === id);
  
  if (!listing) {
    throw new Error('Listing not found');
  }
  
  return listing;
};

/**
 * Mock implementation of createListing
 */
export const createListing = async (listingData: ListingFormData): Promise<Listing> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newListing: Listing = {
    _id: (mockListings.length + 1).toString(),
    user: {
      _id: '101', // Mock user ID
      username: 'current_user',
      email: 'user@example.com',
      fullName: 'Current User',
      skills: [],
      talentBalance: 50,
      location: {
        type: 'Point',
        coordinates: [18.4241, -33.9249],
        address: 'Cape Town, South Africa'
      },
      ratings: [],
      averageRating: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    ...listingData,
    isActive: true,
    isFeatured: false,
    views: 0,
    likes: [],
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // In a real implementation, this would save to a database
  // mockListings.push(newListing);
  
  return newListing;
};

// Other methods would be implemented similarly with mock data
// These implementations are simplified for demo purposes

export const updateListing = async () => {} 
export const deleteListing = async () => {}
export const toggleLikeListing = async () => {}
export const getNearbyListings = async () => {}
export const searchListings = async () => {}
export const uploadListingImage = async () => {}
export const deleteListingImage = async () => {}