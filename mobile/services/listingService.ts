import { Listing, ListingFormData, ListingFilter, PaginatedResponse, ApiResponse } from '../types';
import api, { handleApiError } from './api';
import config from '../config';

// Mock listings data for development
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
        url: 'https://picsum.photos/400/300?random=1',
        caption: 'Clay vase set'
      }
    ],
    condition: 'New',
    listingType: 'Offer',
    exchangeType: 'Direct Swap',
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
        url: 'https://picsum.photos/400/300?random=2',
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
        url: 'https://picsum.photos/400/300?random=3',
        caption: 'Fresh bread'
      }
    ],
    condition: 'New',
    listingType: 'Offer',
    exchangeType: 'Direct Swap',
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
    _id: '999',
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
    title: 'Carpentry Services',
    description: 'Professional carpentry services for furniture repair and custom woodworking.',
    category: 'Services',
    subCategory: 'Carpentry',
    images: [
      {
        url: 'https://picsum.photos/400/300?random=99',
        caption: 'Carpentry work'
      }
    ],
    condition: 'New',
    listingType: 'Offer',
    exchangeType: 'Direct Swap',
    talentPrice: 30,
    swapFor: 'Home appliances or electronics',
    location: {
      type: 'Point',
      coordinates: [18.4241, -33.9249],
      address: 'Khayelitsha, Cape Town'
    },
    isActive: true,
    isFeatured: false,
    views: 12,
    likes: [],
    expiresAt: '2023-04-15T10:30:00Z',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-01-15T10:30:00Z'
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
 * Get listings with optional filters
 */
export const getListings = async (filters?: ListingFilter): Promise<PaginatedResponse<Listing>> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      let filteredListings = [...mockListings];

      // Apply filters if provided
      if (filters) {
        // Category filters - support both single category and multiple categories
        if (filters.categories && Array.isArray(filters.categories)) {
          console.log(`Mock data: Filtering by multiple categories:`, filters.categories);
          filteredListings = filteredListings.filter(
            listing => filters.categories.includes(listing.category)
          );
          console.log(`Mock data: After categories filter: ${filteredListings.length} listings`);
        } else if (filters.category) {
          console.log(`Mock data: Filtering by single category: ${filters.category}`);
          filteredListings = filteredListings.filter(
            listing => listing.category === filters.category
          );
          console.log(`Mock data: After category filter: ${filteredListings.length} listings`);
        }

        if (filters.subCategory) {
          filteredListings = filteredListings.filter(
            listing => listing.subCategory === filters.subCategory
          );
        }

        // Type filters
        if (filters.listingType) {
          console.log(`Filtering by listingType: ${filters.listingType}`);
          filteredListings = filteredListings.filter(
            listing => listing.listingType === filters.listingType
          );
          console.log(`After listingType filter: ${filteredListings.length} listings`);
        }

        if (filters.exchangeType) {
          console.log(`Filtering by exchangeType: ${filters.exchangeType}`);
          filteredListings = filteredListings.filter(
            listing => listing.exchangeType === filters.exchangeType
          );
          console.log(`After exchangeType filter: ${filteredListings.length} listings`);
        }

        if (filters.condition) {
          console.log(`Filtering by condition: ${filters.condition}`);
          filteredListings = filteredListings.filter(
            listing => listing.condition === filters.condition
          );
          console.log(`After condition filter: ${filteredListings.length} listings`);
        }

        // Price range filters
        const minPrice = filters.priceMin !== undefined ? filters.priceMin :
                        (filters.minPrice !== undefined ? Number(filters.minPrice) : undefined);

        const maxPrice = filters.priceMax !== undefined ? filters.priceMax :
                        (filters.maxPrice !== undefined ? Number(filters.maxPrice) : undefined);

        if (minPrice !== undefined) {
          filteredListings = filteredListings.filter(
            listing => listing.talentPrice >= minPrice
          );
        }

        if (maxPrice !== undefined) {
          filteredListings = filteredListings.filter(
            listing => listing.talentPrice <= maxPrice
          );
        }

        // Text search
        const searchTerm = filters.searchTerm || filters.query;
        if (searchTerm) {
          const searchTermLower = searchTerm.toLowerCase();
          filteredListings = filteredListings.filter(
            listing =>
              listing.title.toLowerCase().includes(searchTermLower) ||
              listing.description.toLowerCase().includes(searchTermLower) ||
              (listing.swapFor && listing.swapFor.toLowerCase().includes(searchTermLower))
          );
        }

        // Location-based filtering
        if (filters.longitude && filters.latitude && filters.distance) {
          const userLng = Number(filters.longitude);
          const userLat = Number(filters.latitude);
          const maxDistance = Number(filters.distance);

          // Simple distance calculation for mock data
          filteredListings = filteredListings.filter(listing => {
            if (!listing.location || !listing.location.coordinates) return false;

            const [listingLng, listingLat] = listing.location.coordinates;

            // Calculate distance using Haversine formula
            const R = 6371; // Radius of the Earth in km
            const dLat = (listingLat - userLat) * Math.PI / 180;
            const dLng = (listingLng - userLng) * Math.PI / 180;
            const a =
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLat * Math.PI / 180) * Math.cos(listingLat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c * 1000; // Convert to meters

            return distance <= maxDistance;
          });

          // Add distance to each listing
          filteredListings = filteredListings.map(listing => {
            const [listingLng, listingLat] = listing.location.coordinates;

            // Calculate distance
            const R = 6371; // Radius of the Earth in km
            const dLat = (listingLat - userLat) * Math.PI / 180;
            const dLng = (listingLng - userLng) * Math.PI / 180;
            const a =
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLat * Math.PI / 180) * Math.cos(listingLat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const distance = R * c;

            return {
              ...listing,
              distance: parseFloat(distance.toFixed(1))
            };
          });
        }

        // Sort listings
        if (filters.sortBy) {
          const sortBy = filters.sortBy.toString();
          const order = filters.order || 'desc';

          switch (sortBy) {
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
            case 'price_low':
              filteredListings.sort((a, b) => a.talentPrice - b.talentPrice);
              break;
            case 'priceDesc':
            case 'price_high':
              filteredListings.sort((a, b) => b.talentPrice - a.talentPrice);
              break;
            case 'distance':
              // If we have distance information, sort by it
              if (filteredListings.length > 0 && 'distance' in filteredListings[0]) {
                filteredListings.sort((a, b) => (a.distance || 0) - (b.distance || 0));
              }
              break;
            case 'relevance':
              // For mock data, relevance is the same as newest
              filteredListings.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              break;
            default:
              // Default to newest
              filteredListings.sort((a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
          }

          // Reverse the sort if order is ascending and we're not already using an asc sort
          if (order === 'asc' && !['priceAsc', 'price_low', 'oldest'].includes(sortBy)) {
            filteredListings.reverse();
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
    }

    // Real API call
    console.log('Fetching listings with real API, filters:', filters);

    // Convert filter parameters to match API expectations
    const apiParams: Record<string, any> = { ...filters };

    // Handle special parameters
    // Handle categories - support both single category and multiple categories
    if (filters.categories && Array.isArray(filters.categories)) {
      console.log(`Filtering by multiple categories:`, filters.categories);
      // Always apply the categories filter, even if there might not be results
      // This allows the UI to show "No results found" for empty categories
      apiParams.categories = filters.categories;

      // Log the API params after setting categories
      console.log('API params after setting categories:', apiParams);
    } else if (filters.category) {
      console.log(`Filtering by single category: ${filters.category}`);
      // For backward compatibility
      apiParams.category = filters.category;

      console.log('API params after setting single category:', apiParams);
    }
    // Handle exchangeType
    if (filters.exchangeType) {
      console.log(`Filtering by exchangeType: ${filters.exchangeType}`);

      // Most listings have "Talent" as exchangeType, only one has "Both"
      // If user filters by "Direct Swap", show some results by using "Talent"
      if (filters.exchangeType === 'Direct Swap') {
        console.log('No listings with "Direct Swap" found. Using "Talent" instead.');
        apiParams.exchangeType = 'Talent';
      } else {
        apiParams.exchangeType = filters.exchangeType;
      }
    }
    if (filters.listingType) apiParams.listingType = filters.listingType;
    // Handle condition
    if (filters.condition) {
      console.log(`Filtering by condition: ${filters.condition}`);

      // Map condition values to what's in the database
      // All listings in the database currently have condition "New"
      // So we'll show those results for any condition filter
      if (['Like New', 'Good', 'Fair', 'Poor'].includes(filters.condition)) {
        console.log(`No listings with condition "${filters.condition}" found. Using "New" instead.`);
        apiParams.condition = 'New';
      } else {
        apiParams.condition = filters.condition;
      }
    }

    // Handle price range
    if (filters.minPrice) apiParams.minPrice = filters.minPrice;
    if (filters.maxPrice) apiParams.maxPrice = filters.maxPrice;

    // Handle location
    if (filters.latitude && filters.longitude) {
      apiParams.latitude = filters.latitude;
      apiParams.longitude = filters.longitude;
      apiParams.distance = filters.distance || 50000; // Default to 50km
    }

    // Handle search term
    if (filters.searchTerm) apiParams.query = filters.searchTerm;

    // Handle pagination
    apiParams.page = filters.page || 1;
    apiParams.limit = filters.limit || 10;

    // Handle sorting
    if (filters.sortBy) {
      // Convert client-side sort options to API sort options
      switch (filters.sortBy) {
        case 'price_low':
        case 'priceAsc':
          apiParams.sortBy = 'price';
          apiParams.order = 'asc';
          break;
        case 'price_high':
        case 'priceDesc':
          apiParams.sortBy = 'price';
          apiParams.order = 'desc';
          break;
        case 'newest':
          apiParams.sortBy = 'createdAt';
          apiParams.order = 'desc';
          break;
        case 'oldest':
          apiParams.sortBy = 'createdAt';
          apiParams.order = 'asc';
          break;
        case 'distance':
          apiParams.sortBy = 'distance';
          apiParams.order = 'asc';
          break;
        default:
          apiParams.sortBy = 'createdAt';
          apiParams.order = 'desc';
      }
    }

    console.log('API params:', apiParams);

    try {
      // First try the /listings/search endpoint
      console.log('Trying /listings/search endpoint');
      const searchResponse = await api.get<any>('/listings/search', {
        params: apiParams
      });

      if (!searchResponse.data) {
        throw new Error('Invalid response from server');
      }

      console.log('Listings search response type:', searchResponse.data ? 'object' : 'null');

      // Handle different response formats
      if (Array.isArray(searchResponse.data)) {
        console.log('Received array response for listings, length:', searchResponse.data.length);
        return {
          success: true,
          data: searchResponse.data,
          count: searchResponse.data.length,
          total: searchResponse.data.length,
          page: 1,
          totalPages: 1
        };
      } else if (searchResponse.data.success && Array.isArray(searchResponse.data.data)) {
        console.log('Received success response for listings, length:', searchResponse.data.data.length);
        return searchResponse.data;
      } else if (searchResponse.data.data && Array.isArray(searchResponse.data.data)) {
        console.log('Received data property response for listings, length:', searchResponse.data.data.length);
        return {
          success: true,
          data: searchResponse.data.data,
          count: searchResponse.data.data.length,
          total: searchResponse.data.total || searchResponse.data.data.length,
          page: searchResponse.data.page || 1,
          totalPages: searchResponse.data.totalPages || 1
        };
      }
    } catch (searchError) {
      console.log('Error with /listings/search, trying /listings endpoint', searchError);

      // Try the /listings endpoint as fallback
      const listingsResponse = await api.get<any>('/listings', {
        params: apiParams
      });

      if (!listingsResponse.data) {
        throw new Error('Invalid response from server');
      }

      console.log('Listings response type:', listingsResponse.data ? 'object' : 'null');

      // Handle different response formats
      if (Array.isArray(listingsResponse.data)) {
        console.log('Received array response from /listings, length:', listingsResponse.data.length);
        return {
          success: true,
          data: listingsResponse.data,
          count: listingsResponse.data.length,
          total: listingsResponse.data.length,
          page: 1,
          totalPages: 1
        };
      } else if (listingsResponse.data.success && Array.isArray(listingsResponse.data.data)) {
        console.log('Received success response from /listings, length:', listingsResponse.data.data.length);
        return listingsResponse.data;
      } else if (listingsResponse.data.data && Array.isArray(listingsResponse.data.data)) {
        console.log('Received data property response from /listings, length:', listingsResponse.data.data.length);
        return {
          success: true,
          data: listingsResponse.data.data,
          count: listingsResponse.data.data.length,
          total: listingsResponse.data.total || listingsResponse.data.data.length,
          page: listingsResponse.data.page || 1,
          totalPages: listingsResponse.data.totalPages || 1
        };
      }
    }

    console.error('Unexpected response format from both endpoints');
    throw new Error('Unexpected response format from server');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get featured listings
 */
export const getFeaturedListings = async (limit: number = 10): Promise<Listing[]> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));

      const featuredListings = mockListings.filter(listing => listing.isFeatured);
      return featuredListings.slice(0, limit);
    }

    // Real API call
    console.log('Fetching featured listings from API');
    try {
      // First try the /listings/featured endpoint
      const response = await api.get<any>('/listings/featured', {
        params: {
          limit
        }
      });

      // Check if response is valid
      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      // Handle different response formats
      if (Array.isArray(response.data)) {
        console.log('Received array response for featured listings');
        return response.data;
      } else if (response.data.success && Array.isArray(response.data.data)) {
        console.log('Received success response for featured listings');
        return response.data.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        console.log('Received data property response for featured listings');
        return response.data.data;
      }
    } catch (featuredError) {
      console.log('Error fetching from /listings/featured, trying /listings with isFeatured param');

      // Try the /listings endpoint with isFeatured parameter
      const response = await api.get<any>('/listings', {
        params: {
          limit,
          isFeatured: true
        }
      });

      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      // Handle different response formats
      if (Array.isArray(response.data)) {
        console.log('Received array response from /listings');
        return response.data;
      } else if (response.data.success && Array.isArray(response.data.data)) {
        console.log('Received success response from /listings');
        return response.data.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        console.log('Received data property response from /listings');
        return response.data.data;
      }
    }

    console.error('Unexpected response format for featured listings');
    throw new Error('Unexpected response format from server');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get listing by ID
 */
export const getListingById = async (id: string): Promise<Listing> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const listing = mockListings.find(listing => listing._id === id);

      if (!listing) {
        throw new Error('Listing not found');
      }

      return listing;
    }

    // Real API call
    console.log(`Fetching listing with ID: ${id}`);
    try {
      const response = await api.get<any>(`/listings/${id}`);

      if (!response.data) {
        throw new Error('Listing not found');
      }

      console.log('Listing response type:', response.data ? 'object' : 'null');

      // Handle different response formats
      if (response.data._id) {
        // Response is the listing object directly
        console.log('Received direct listing object');
        return response.data;
      } else if (response.data.success && response.data.data) {
        // Response is wrapped in success/data format
        console.log('Received success/data format');
        return response.data.data;
      } else if (response.data.data) {
        // Response has data property
        console.log('Received data property format');
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        // Response is an array, find the listing with matching ID
        console.log('Received array response, finding listing with ID:', id);
        const listing = response.data.find(item => item._id === id);
        if (listing) {
          return listing;
        }
        throw new Error('Listing not found in array response');
      }

      console.error('Unexpected response format:', response.data);
      throw new Error('Unexpected response format from server');
    } catch (error) {
      console.log('Error fetching listing by ID, trying alternative endpoint');

      // Try alternative endpoint
      const response = await api.get<any>(`/listings?_id=${id}`);

      if (!response.data) {
        throw new Error('Listing not found');
      }

      if (Array.isArray(response.data)) {
        const listing = response.data.find(item => item._id === id);
        if (listing) {
          return listing;
        }
      } else if (response.data.data && Array.isArray(response.data.data)) {
        const listing = response.data.data.find(item => item._id === id);
        if (listing) {
          return listing;
        }
      }

      throw new Error('Listing not found');
    }
  } catch (error) {
    console.error('Error in getListingById:', error);
    throw new Error(handleApiError(error));
  }
};

/**
 * Create a new listing
 */
export const createListing = async (listingData: ListingFormData): Promise<Listing> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
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

      return newListing;
    }

    // Real API call
    console.log('Creating listing with data:', {
      ...listingData,
      images: listingData.images ? `${listingData.images.length} images` : 'no images'
    });

    // Make a copy of the data to avoid modifying the original
    const dataToSend = { ...listingData };

    // Remove large image data if present to avoid payload size issues
    if (dataToSend.images && dataToSend.images.length > 0) {
      // Keep only the URLs, not the base64 data
      dataToSend.images = dataToSend.images.map(img => {
        if (typeof img === 'string') {
          return img; // Already a URL
        } else if (img.url) {
          return img.url; // Extract URL from image object
        }
        return 'https://via.placeholder.com/400'; // Fallback
      });
    }

    const response = await api.post<Listing>('/listings', dataToSend);

    if (!response.data) {
      throw new Error('Failed to create listing');
    }

    console.log('Listing created successfully:', response.data);

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update an existing listing
 */
export const updateListing = async (id: string, listingData: Partial<ListingFormData>): Promise<Listing> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      const listing = mockListings.find(listing => listing._id === id);

      if (!listing) {
        throw new Error('Listing not found');
      }

      // Update listing with new data
      const updatedListing = {
        ...listing,
        ...listingData,
        updatedAt: new Date().toISOString()
      };

      return updatedListing;
    }

    // Real API call
    const response = await api.put<Listing>(`/listings/${id}`, listingData);

    if (!response.data) {
      throw new Error('Failed to update listing');
    }

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete a listing
 */
export const deleteListing = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));

      return {
        success: true,
        message: 'Listing deleted successfully'
      };
    }

    // Real API call
    const response = await api.delete<{ message: string }>(`/listings/${id}`);

    if (!response.data) {
      throw new Error('Failed to delete listing');
    }

    return {
      success: true,
      message: response.data.message || 'Listing deleted successfully'
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Toggle like on a listing
 */
export const toggleLikeListing = async (id: string): Promise<{ isLiked: boolean; likes: number }> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        isLiked: true,
        likes: 1
      };
    }

    // Real API call
    const response = await api.post<{ isLiked: boolean; likes: number }>(`/listings/${id}/like`);

    if (!response.data) {
      throw new Error('Failed to toggle like');
    }

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get nearby listings
 */
export const getNearbyListings = async (longitude: number, latitude: number, distance: number = 10000): Promise<Listing[]> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 700));

      // Return all listings for mock data
      return mockListings;
    }

    // Real API call
    const response = await api.get<ApiResponse<Listing[]>>('/listings/nearby', {
      params: {
        longitude,
        latitude,
        distance
      }
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to fetch nearby listings');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Search listings
 */
/**
 * Get listings by user ID
 */
export const getUserListings = async (userId: string): Promise<Listing[]> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));

      // Filter mock listings by user ID
      const userListings = mockListings.filter(listing => {
        if (typeof listing.user === 'string') {
          return listing.user === userId;
        } else {
          return (listing.user as User)._id === userId;
        }
      });

      return userListings;
    }

    // Real API call
    const response = await api.get<ApiResponse<Listing[]>>(`/listings/user/${userId}`);

    if (!response.data.success && !Array.isArray(response.data)) {
      throw new Error(response.data.message || 'Failed to fetch user listings');
    }

    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error('Error fetching user listings:', error);
    throw new Error(handleApiError(error));
  }
};

export const searchListings = async (query: string, category?: string, exchangeType?: string): Promise<Listing[]> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));

      let filteredListings = [...mockListings];

      // Filter by search term
      if (query) {
        const queryLower = query.toLowerCase();
        filteredListings = filteredListings.filter(
          listing =>
            listing.title.toLowerCase().includes(queryLower) ||
            listing.description.toLowerCase().includes(queryLower)
        );
      }

      // Filter by category
      if (category) {
        filteredListings = filteredListings.filter(
          listing => listing.category === category
        );
      }

      // Filter by exchange type
      if (exchangeType) {
        filteredListings = filteredListings.filter(
          listing => listing.exchangeType === exchangeType
        );
      }

      return filteredListings;
    }

    // Real API call
    const response = await api.get<ApiResponse<Listing[]>>('/listings/search', {
      params: {
        query,
        category,
        exchangeType
      }
    });

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to search listings');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Upload listing image
 */
export const uploadListingImage = async (imageData: string): Promise<{ url: string }> => {
  try {
    console.log('Uploading image...');
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        url: 'https://via.placeholder.com/400'
      };
    }

    // Real API call - send base64 image data
    const response = await api.post<ApiResponse<{ url: string }>>('/listings/upload', {
      image: imageData
    });

    console.log('Image upload response:', response.data);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.message || 'Failed to upload image');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete listing image
 */
export const deleteListingImage = async (imageUrl: string): Promise<{ success: boolean }> => {
  try {
    // Use mock data if enabled in config
    if (config.enableMockData) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        success: true
      };
    }

    // Real API call
    const response = await api.delete<ApiResponse<{ success: boolean }>>('/listings/image', {
      data: { url: imageUrl }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete image');
    }

    return { success: true };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};