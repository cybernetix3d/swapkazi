import { User } from './auth';

export type ListingCategory = 
  | 'Goods'
  | 'Services'
  | 'Food'
  | 'Crafts'
  | 'Electronics'
  | 'Clothing'
  | 'Furniture'
  | 'Books'
  | 'Tools'
  | 'Education'
  | 'Transportation'
  | 'Other';

export type ItemCondition = 
  | 'New'
  | 'Like New'
  | 'Good'
  | 'Fair'
  | 'Poor'
  | 'Not Applicable';

export type ListingType = 'Offer' | 'Request';

export type ExchangeType = 'Talent' | 'Direct Swap' | 'Both';

export interface ListingImage {
  url: string;
  caption?: string;
}

export interface Listing {
  _id: string;
  user: string | User;
  title: string;
  description: string;
  category: ListingCategory;
  subCategory?: string;
  images: ListingImage[];
  condition: ItemCondition;
  listingType: ListingType;
  exchangeType: ExchangeType;
  talentPrice: number;
  swapFor?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
    address: string;
  };
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  likes: string[] | User[];
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListingFormData {
  title: string;
  description: string;
  category: ListingCategory;
  subCategory?: string;
  images: ListingImage[];
  condition: ItemCondition;
  listingType: ListingType;
  exchangeType: ExchangeType;
  talentPrice?: number;
  swapFor?: string;
  location?: {
    coordinates: [number, number];
    address: string;
  };
}

export interface ListingFilter {
  category?: ListingCategory;
  listingType?: ListingType;
  exchangeType?: ExchangeType;
  priceMin?: number;
  priceMax?: number;
  nearMe?: boolean;
  distance?: number;
  searchTerm?: string;
  sortBy?: 'newest' | 'oldest' | 'priceAsc' | 'priceDesc';
  page?: number;
  limit?: number;
}