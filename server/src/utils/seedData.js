/**
 * Database Seeding Script - Professional Skills Focus (Complete Data)
 *
 * This script populates the database with realistic test data focused on professional
 * skill-based exchanges. It creates 20 users (with extra fields like avatar, phoneNumber,
 * averageRating, etc.), 10 listings, 3 transactions (with messages and status histories),
 * 3 conversations, and associated messages.
 *
 * Run with: node src/utils/seedData.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/user.model');
const Listing = require('../models/listing.model');
const Transaction = require('../models/transaction.model');
const { Conversation, Message } = require('../models/message.model');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected for seeding'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// -----------------------
// 20 Professional Users with Extra Fields
// -----------------------
const users = [
  {
    username: 'alexsmith',
    email: 'alex.smith@example.com',
    password: 'password123',
    fullName: 'Alex Smith',
    bio: 'Professional Web Developer specializing in modern frameworks and responsive design.',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    phoneNumber: '+27 71 123 4567',
    skills: ['Web Development', 'UX/UI Design', 'App Development'],
    location: {
      type: 'Point',
      coordinates: [18.4241, -33.9249],
      address: 'Cape Town CBD, Cape Town, South Africa'
    },
    talentBalance: 100,
    averageRating: 4.8,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'sarahjones',
    email: 'sarah.jones@example.com',
    password: 'password123',
    fullName: 'Sarah Jones',
    bio: 'Experienced Graphic Designer and visual communicator with a creative edge.',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    phoneNumber: '+27 82 234 5678',
    skills: ['Graphic Design', 'Photography', 'Digital Marketing'],
    location: {
      type: 'Point',
      coordinates: [18.4039, -33.9069],
      address: 'Green Point, Cape Town, South Africa'
    },
    talentBalance: 90,
    averageRating: 4.6,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'michaelbrown',
    email: 'michael.brown@example.com',
    password: 'password123',
    fullName: 'Michael Brown',
    bio: 'Seasoned Legal Advisor providing expert contract and business law counsel.',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    phoneNumber: '+27 73 345 6789',
    skills: ['Legal Consultation', 'Business Consulting', 'Negotiation'],
    location: {
      type: 'Point',
      coordinates: [18.4462, -33.9258],
      address: 'Woodstock, Cape Town, South Africa'
    },
    talentBalance: 110,
    averageRating: 4.7,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'emilydavis',
    email: 'emily.davis@example.com',
    password: 'password123',
    fullName: 'Emily Davis',
    bio: 'Digital Marketing Strategist with a passion for boosting online presence and growth.',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    phoneNumber: '+27 81 456 7890',
    skills: ['Digital Marketing', 'SEO', 'Content Strategy'],
    location: {
      type: 'Point',
      coordinates: [18.4607, -33.9366],
      address: 'Observatory, Cape Town, South Africa'
    },
    talentBalance: 80,
    averageRating: 4.5,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'danielwilson',
    email: 'daniel.wilson@example.com',
    password: 'password123',
    fullName: 'Daniel Wilson',
    bio: 'Experienced Photographer capturing business moments and creative visuals.',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    phoneNumber: '+27 74 567 8901',
    skills: ['Photography', 'Graphic Design', 'Video Editing'],
    location: {
      type: 'Point',
      coordinates: [18.3791, -33.9176],
      address: 'Sea Point, Cape Town, South Africa'
    },
    talentBalance: 95,
    averageRating: 4.9,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'oliviataylor',
    email: 'olivia.taylor@example.com',
    password: 'password123',
    fullName: 'Olivia Taylor',
    bio: 'Professional Tutor and educational consultant with a commitment to student success.',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    phoneNumber: '+27 65 678 9012',
    skills: ['Tutoring', 'Education', 'Public Speaking'],
    location: {
      type: 'Point',
      coordinates: [18.4115, -33.9352],
      address: 'Gardens, Cape Town, South Africa'
    },
    talentBalance: 85,
    averageRating: 4.4,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'jamesmartin',
    email: 'james.martin@example.com',
    password: 'password123',
    fullName: 'James Martin',
    bio: 'Business Consultant with expertise in strategy, operations, and financial planning.',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    phoneNumber: '+27 76 789 0123',
    skills: ['Business Consulting', 'Project Management', 'Finance'],
    location: {
      type: 'Point',
      coordinates: [18.4522, -33.9787],
      address: 'Claremont, Cape Town, South Africa'
    },
    talentBalance: 120,
    averageRating: 4.9,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'amandawilson',
    email: 'amanda.wilson@example.com',
    password: 'password123',
    fullName: 'Amanda Wilson',
    bio: 'Interior Designer dedicated to creating innovative and inspiring spaces.',
    avatar: 'https://example.com/avatars/amanda.png',
    phoneNumber: '+27 82 890 1234',
    skills: ['Interior Design', 'Painting', 'Creative Consulting'],
    location: {
      type: 'Point',
      coordinates: [18.4693, -33.9595],
      address: 'Rondebosch, Cape Town, South Africa'
    },
    talentBalance: 100,
    averageRating: 4.6,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'robertthomas',
    email: 'robert.thomas@example.com',
    password: 'password123',
    fullName: 'Robert Thomas',
    bio: 'Expert Event Planner ensuring every event is executed flawlessly.',
    avatar: 'https://randomuser.me/api/portraits/men/9.jpg',
    phoneNumber: '+27 63 901 2345',
    skills: ['Event Planning', 'Logistics', 'Project Coordination'],
    location: {
      type: 'Point',
      coordinates: [18.4097, -33.9313],
      address: 'Tamboerskloof, Cape Town, South Africa'
    },
    talentBalance: 90,
    averageRating: 4.5,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'laurabaker',
    email: 'laura.baker@example.com',
    password: 'password123',
    fullName: 'Laura Baker',
    bio: 'Copywriter and Content Creator with a flair for engaging storytelling.',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    phoneNumber: '+27 64 012 3456',
    skills: ['Copywriting', 'Content Strategy', 'Social Media Management'],
    location: {
      type: 'Point',
      coordinates: [18.4241, -33.9249],
      address: 'Cape Town CBD, Cape Town, South Africa'
    },
    talentBalance: 80,
    averageRating: 4.3,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'davidlee',
    email: 'david.lee@example.com',
    password: 'password123',
    fullName: 'David Lee',
    bio: 'Skilled App Developer building modern, scalable digital solutions.',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    phoneNumber: '+27 78 123 9876',
    skills: ['App Development', 'Web Development', 'UX/UI Design'],
    location: {
      type: 'Point',
      coordinates: [18.4607, -33.9366],
      address: 'Observatory, Cape Town, South Africa'
    },
    talentBalance: 110,
    averageRating: 4.7,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'nicolemartin',
    email: 'nicole.martin@example.com',
    password: 'password123',
    fullName: 'Nicole Martin',
    bio: 'SEO Specialist dedicated to improving online visibility and traffic.',
    avatar: 'https://example.com/avatars/nicole.png',
    phoneNumber: '+27 72 987 6543',
    skills: ['SEO', 'Digital Marketing', 'Analytics'],
    location: {
      type: 'Point',
      coordinates: [18.4039, -33.9069],
      address: 'Green Point, Cape Town, South Africa'
    },
    talentBalance: 85,
    averageRating: 4.4,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'robertjones',
    email: 'robert.jones@example.com',
    password: 'password123',
    fullName: 'Robert Jones',
    bio: 'Professional Photographer and Videographer capturing compelling business narratives.',
    avatar: 'https://example.com/avatars/robjones.png',
    phoneNumber: '+27 71 456 7890',
    skills: ['Photography', 'Video Editing', 'Graphic Design'],
    location: {
      type: 'Point',
      coordinates: [18.3791, -33.9176],
      address: 'Sea Point, Cape Town, South Africa'
    },
    talentBalance: 95,
    averageRating: 4.8,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'matthewwhite',
    email: 'matthew.white@example.com',
    password: 'password123',
    fullName: 'Matthew White',
    bio: 'Legal Advisor with a focus on corporate law and intellectual property.',
    avatar: 'https://example.com/avatars/matthew.png',
    phoneNumber: '+27 79 345 6123',
    skills: ['Legal Consultation', 'Business Consulting', 'Contract Drafting'],
    location: {
      type: 'Point',
      coordinates: [18.4462, -33.9258],
      address: 'Woodstock, Cape Town, South Africa'
    },
    talentBalance: 100,
    averageRating: 4.7,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'susanclark',
    email: 'susan.clark@example.com',
    password: 'password123',
    fullName: 'Susan Clark',
    bio: 'Dedicated Tutor with expertise in multiple subjects and educational mentoring.',
    avatar: 'https://example.com/avatars/susan.png',
    phoneNumber: '+27 76 543 2109',
    skills: ['Tutoring', 'Education', 'Mentoring'],
    location: {
      type: 'Point',
      coordinates: [18.4115, -33.9352],
      address: 'Gardens, Cape Town, South Africa'
    },
    talentBalance: 75,
    averageRating: 4.3,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'kevinmoore',
    email: 'kevin.moore@example.com',
    password: 'password123',
    fullName: 'Kevin Moore',
    bio: 'Innovative Digital Marketer with a focus on social media strategy and online growth.',
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
    phoneNumber: '+27 72 111 2222',
    skills: ['Digital Marketing', 'Social Media Management', 'SEO'],
    location: {
      type: 'Point',
      coordinates: [18.4241, -33.9249],
      address: 'Cape Town CBD, Cape Town, South Africa'
    },
    talentBalance: 95,
    averageRating: 4.5,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'emilyroberts',
    email: 'emily.roberts@example.com',
    password: 'password123',
    fullName: 'Emily Roberts',
    bio: 'Creative Graphic Designer with a modern aesthetic and attention to detail.',
    avatar: 'https://example.com/avatars/emilyr.png',
    phoneNumber: '+27 73 222 3333',
    skills: ['Graphic Design', 'Illustration', 'Branding'],
    location: {
      type: 'Point',
      coordinates: [18.4522, -33.9787],
      address: 'Claremont, Cape Town, South Africa'
    },
    talentBalance: 80,
    averageRating: 4.4,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'joshuaallen',
    email: 'joshua.allen@example.com',
    password: 'password123',
    fullName: 'Joshua Allen',
    bio: 'Seasoned Project Manager and Business Consultant focused on strategic growth.',
    avatar: 'https://randomuser.me/api/portraits/men/7.jpg',
    phoneNumber: '+27 71 333 4444',
    skills: ['Project Management', 'Business Consulting', 'Strategy'],
    location: {
      type: 'Point',
      coordinates: [18.4693, -33.9595],
      address: 'Rondebosch, Cape Town, South Africa'
    },
    talentBalance: 105,
    averageRating: 4.6,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'katherinehill',
    email: 'katherine.hill@example.com',
    password: 'password123',
    fullName: 'Katherine Hill',
    bio: 'Experienced Interior Designer with a passion for modern, functional spaces.',
    avatar: 'https://example.com/avatars/katherine.png',
    phoneNumber: '+27 73 444 5555',
    skills: ['Interior Design', 'Painting', 'Creative Consulting'],
    location: {
      type: 'Point',
      coordinates: [18.3791, -33.9176],
      address: 'Sea Point, Cape Town, South Africa'
    },
    talentBalance: 90,
    averageRating: 4.5,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: 'brianadams',
    email: 'brian.adams@example.com',
    password: 'password123',
    fullName: 'Brian Adams',
    bio: 'Skilled Event Planner and Logistics Expert ensuring flawless event execution.',
    avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
    phoneNumber: '+27 74 555 6666',
    skills: ['Event Planning', 'Logistics', 'Vendor Management'],
    location: {
      type: 'Point',
      coordinates: [18.4097, -33.9313],
      address: 'Tamboerskloof, Cape Town, South Africa'
    },
    talentBalance: 100,
    averageRating: 4.7,
    ratings: [],
    reservedTalents: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Listing categories
const categories = [
  'Goods', 'Services', 'Food', 'Crafts',
  'Electronics', 'Clothing', 'Furniture', 'Books',
  'Tools', 'Education', 'Transportation', 'Other'
];

// Listing data (will be populated with user IDs after user creation)
const createListings = (userIds) => {
  return [
    {
      user: userIds[2], // Thabo
      title: 'Handcrafted Pottery',
      description: 'Beautiful handmade clay pots and vases. Perfect for home decoration or gifting.',
      category: 'Crafts',
      subCategory: 'Pottery',
      images: [
        { url: 'https://images.unsplash.com/photo-1565193566173-7a0af771d71a', caption: 'Clay vase set' }
      ],
      condition: 'New',
      listingType: 'Offer',
      exchangeType: 'Talent',
      talentPrice: 15,
      location: {
        type: 'Point',
        coordinates: [18.5241, -33.9249],
        address: 'Khayelitsha, Cape Town'
      },
      isActive: true,
      isFeatured: true
    },
    {
      user: userIds[3], // Lerato
      title: 'Gardening Services',
      description: 'Professional gardening services including planting, pruning, and garden maintenance.',
      category: 'Services',
      subCategory: 'Gardening',
      images: [
        { url: 'https://images.unsplash.com/photo-1599629954294-14df9f8291b7', caption: 'Garden maintenance' }
      ],
      condition: 'New',
      listingType: 'Offer',
      exchangeType: 'Talent',
      talentPrice: 25,
      location: {
        type: 'Point',
        coordinates: [18.4541, -33.9149],
        address: 'Gugulethu, Cape Town'
      },
      isActive: true,
      isFeatured: true
    },
    {
      user: userIds[4], // Sipho
      title: 'Homemade Bread',
      description: 'Freshly baked artisanal bread. Available in sourdough, whole wheat, and rye varieties.',
      category: 'Food',
      subCategory: 'Baked Goods',
      images: [
        { url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7b', caption: 'Freshly baked bread' }
      ],
      condition: 'New',
      listingType: 'Offer',
      exchangeType: 'Talent',
      talentPrice: 8,
      location: {
        type: 'Point',
        coordinates: [18.4741, -33.9349],
        address: 'Nyanga, Cape Town'
      },
      isActive: true,
      isFeatured: true
    },
    {
      user: userIds[0], // John
      title: 'Carpentry Services',
      description: 'Offering carpentry services for furniture repair, custom shelving, and small woodworking projects.',
      category: 'Services',
      subCategory: 'Carpentry',
      images: [
        { url: 'https://images.unsplash.com/photo-1567604130959-7a3d4563030a', caption: 'Carpentry tools' }
      ],
      condition: 'New',
      listingType: 'Offer',
      exchangeType: 'Both',
      talentPrice: 30,
      swapFor: 'Tools or gardening services',
      location: {
        type: 'Point',
        coordinates: [18.4241, -33.9249],
        address: 'Cape Town, South Africa'
      },
      isActive: true,
      isFeatured: false
    },
    {
      user: userIds[1], // Jane
      title: 'Cooking Lessons',
      description: 'Learn to cook delicious, healthy meals with locally available ingredients. One-on-one or small group sessions available.',
      category: 'Education',
      subCategory: 'Cooking',
      images: [
        { url: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf', caption: 'Cooking class' }
      ],
      condition: 'New',
      listingType: 'Offer',
      exchangeType: 'Talent',
      talentPrice: 20,
      location: {
        type: 'Point',
        coordinates: [18.4241, -33.9249],
        address: 'Cape Town, South Africa'
      },
      isActive: true,
      isFeatured: false
    },
    {
      user: userIds[3], // Lerato
      title: 'Plant Care Consultation',
      description: 'Get expert advice on caring for your indoor and outdoor plants. Learn about watering, sunlight, and soil requirements.',
      category: 'Services',
      subCategory: 'Gardening',
      images: [
        { url: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735', caption: 'Indoor plants' }
      ],
      condition: 'New',
      listingType: 'Offer',
      exchangeType: 'Talent',
      talentPrice: 15,
      location: {
        type: 'Point',
        coordinates: [18.4541, -33.9149],
        address: 'Gugulethu, Cape Town'
      },
      isActive: true,
      isFeatured: false
    },
    {
      user: userIds[0], // John
      title: 'Basic Plumbing Repairs',
      description: 'Offering services for basic plumbing repairs including fixing leaky faucets, unclogging drains, and toilet repairs.',
      category: 'Services',
      subCategory: 'Plumbing',
      images: [
        { url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39', caption: 'Plumbing tools' }
      ],
      condition: 'New',
      listingType: 'Offer',
      exchangeType: 'Talent',
      talentPrice: 35,
      location: {
        type: 'Point',
        coordinates: [18.4241, -33.9249],
        address: 'Cape Town, South Africa'
      },
      isActive: true,
      isFeatured: false
    },
    {
      user: userIds[1], // Jane
      title: 'Vegetable Garden Setup',
      description: 'Help setting up your own vegetable garden. Includes planning, soil preparation, and initial planting.',
      category: 'Services',
      subCategory: 'Gardening',
      images: [
        { url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae', caption: 'Vegetable garden' }
      ],
      condition: 'New',
      listingType: 'Offer',
      exchangeType: 'Talent',
      talentPrice: 40,
      location: {
        type: 'Point',
        coordinates: [18.4241, -33.9249],
        address: 'Cape Town, South Africa'
      },
      isActive: true,
      isFeatured: false
    }
  ];
};

// Create transactions between users
const createTransactions = (userIds, listingIds) => {
  return [
    {
      initiator: userIds[0], // John
      recipient: userIds[2], // Thabo
      listing: listingIds[0], // Handcrafted Pottery
      status: 'Completed',
      type: 'Talent',
      talentAmount: 15,
      messages: [
        {
          sender: userIds[0],
          content: "Hi, I'm interested in your handcrafted pottery. Is it still available?",
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        },
        {
          sender: userIds[2],
          content: "Yes, it's available! When would you like to meet?",
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) // 6 days ago
        },
        {
          sender: userIds[0],
          content: "Great! How about tomorrow at 2pm?",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        }
      ],
      statusHistory: [
        {
          status: 'Proposed',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedBy: userIds[0]
        },
        {
          status: 'Accepted',
          timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          updatedBy: userIds[2]
        },
        {
          status: 'Completed',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          updatedBy: userIds[0]
        }
      ],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      initiator: userIds[1], // Jane
      recipient: userIds[3], // Lerato
      listing: listingIds[1], // Gardening Services
      status: 'Accepted',
      type: 'Talent',
      talentAmount: 25,
      messages: [
        {
          sender: userIds[1],
          content: "Hello, I need help with my garden. Are you available next week?",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        },
        {
          sender: userIds[3],
          content: "Hi Jane, yes I'm available. What kind of gardening work do you need?",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        }
      ],
      statusHistory: [
        {
          status: 'Proposed',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          updatedBy: userIds[1]
        },
        {
          status: 'Accepted',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedBy: userIds[3]
        }
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      initiator: userIds[0], // John
      recipient: userIds[4], // Sipho
      listing: listingIds[2], // Homemade Bread
      status: 'Proposed',
      type: 'Talent',
      talentAmount: 8,
      messages: [
        {
          sender: userIds[0],
          content: "I'd like to order some of your homemade bread. Do you deliver?",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        }
      ],
      statusHistory: [
        {
          status: 'Proposed',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          updatedBy: userIds[0]
        }
      ],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];
};

// Create conversations
const createConversations = (userIds, transactionIds) => {
  return [
    {
      participants: [userIds[0], userIds[2]], // John and Thabo
      transaction: transactionIds[0],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
    },
    {
      participants: [userIds[1], userIds[3]], // Jane and Lerato
      transaction: transactionIds[1],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      participants: [userIds[0], userIds[4]], // John and Sipho
      transaction: transactionIds[2],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];
};

// Create messages
const createMessages = (userIds, conversationIds) => {
  return [
    {
      conversation: conversationIds[0],
      sender: userIds[0],
      content: "Hi, I'm interested in your handcrafted pottery. Is it still available?",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    },
    {
      conversation: conversationIds[0],
      sender: userIds[2],
      content: "Yes, it's available! When would you like to meet?",
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
    },
    {
      conversation: conversationIds[0],
      sender: userIds[0],
      content: "Great! How about tomorrow at 2pm?",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      conversation: conversationIds[1],
      sender: userIds[1],
      content: "Hello, I need help with my garden. Are you available next week?",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      conversation: conversationIds[1],
      sender: userIds[3],
      content: "Hi Jane, yes I'm available. What kind of gardening work do you need?",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      conversation: conversationIds[2],
      sender: userIds[0],
      content: "I'd like to order some of your homemade bread. Do you deliver?",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  ];
};

// Seed the database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Listing.deleteMany({});
    await Transaction.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const user of users) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);

      const newUser = await User.create({
        ...user,
        password: hashedPassword
      });
      createdUsers.push(newUser);
    }

    const userIds = createdUsers.map(user => user._id);
    console.log('Created users:', userIds);

    // Create listings
    const listingsData = createListings(userIds);
    const createdListings = await Listing.insertMany(listingsData);
    const listingIds = createdListings.map(listing => listing._id);
    console.log('Created listings:', listingIds);

    // Create transactions
    const transactionsData = createTransactions(userIds, listingIds);
    const createdTransactions = await Transaction.insertMany(transactionsData);
    const transactionIds = createdTransactions.map(transaction => transaction._id);
    console.log('Created transactions:', transactionIds);

    // Create conversations
    const conversationsData = createConversations(userIds, transactionIds);
    const createdConversations = await Conversation.insertMany(conversationsData);
    const conversationIds = createdConversations.map(conversation => conversation._id);
    console.log('Created conversations:', conversationIds);

    // Create messages
    const messagesData = createMessages(userIds, conversationIds);
    await Message.insertMany(messagesData);
    console.log('Created messages');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDatabase();
