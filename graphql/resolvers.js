const User = require('../models/userModel');
const Restaurant = require('../models/resturantModel');
const Category = require('../models/categoryModel');
const Food = require('../models/foodModel');
const Order = require('../models/orderModel');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const { CacheService } = require('../config/redis');

const resolvers = {
  Query: {
    // User queries
    getUser: async (_, { id }) => {
      try {
        const cacheKey = `user:${id}`;
        let user = await CacheService.get(cacheKey);
        
        if (!user) {
          user = await User.findById(id).select('-password');
          if (user) {
            await CacheService.set(cacheKey, user, 1800); // 30 minutes
          }
        }
        
        return user;
      } catch (error) {
        throw new Error(`Error fetching user: ${error.message}`);
      }
    },

    getAllUsers: async () => {
      try {
        const cacheKey = 'users:all';
        let users = await CacheService.get(cacheKey);
        
        if (!users) {
          users = await User.find().select('-password');
          await CacheService.set(cacheKey, users, 600); // 10 minutes
        }
        
        return users;
      } catch (error) {
        throw new Error(`Error fetching users: ${error.message}`);
      }
    },

    // Restaurant queries
    getRestaurant: async (_, { id }) => {
      try {
        const cacheKey = `restaurant:${id}`;
        let restaurant = await CacheService.get(cacheKey);
        
        if (!restaurant) {
          restaurant = await Restaurant.findById(id);
          if (restaurant) {
            await CacheService.set(cacheKey, restaurant, 1800);
          }
        }
        
        return restaurant;
      } catch (error) {
        throw new Error(`Error fetching restaurant: ${error.message}`);
      }
    },

    getAllRestaurants: async () => {
      try {
        const cacheKey = 'restaurants:all';
        let restaurants = await CacheService.get(cacheKey);
        
        if (!restaurants) {
          restaurants = await Restaurant.find();
          await CacheService.set(cacheKey, restaurants, 600);
        }
        
        return restaurants;
      } catch (error) {
        throw new Error(`Error fetching restaurants: ${error.message}`);
      }
    },

    // Category queries
    getCategory: async (_, { id }) => {
      try {
        const cacheKey = `category:${id}`;
        let category = await CacheService.get(cacheKey);
        
        if (!category) {
          category = await Category.findById(id);
          if (category) {
            await CacheService.set(cacheKey, category, 1800);
          }
        }
        
        return category;
      } catch (error) {
        throw new Error(`Error fetching category: ${error.message}`);
      }
    },

    getAllCategories: async () => {
      try {
        const cacheKey = 'categories:all';
        let categories = await CacheService.get(cacheKey);
        
        if (!categories) {
          categories = await Category.find();
          await CacheService.set(cacheKey, categories, 600);
        }
        
        return categories;
      } catch (error) {
        throw new Error(`Error fetching categories: ${error.message}`);
      }
    },

    // Food queries
    getFood: async (_, { id }) => {
      try {
        const cacheKey = `food:${id}`;
        let food = await CacheService.get(cacheKey);
        
        if (!food) {
          food = await Food.findById(id);
          if (food) {
            await CacheService.set(cacheKey, food, 1800);
          }
        }
        
        return food;
      } catch (error) {
        throw new Error(`Error fetching food: ${error.message}`);
      }
    },

    getAllFoods: async () => {
      try {
        const cacheKey = 'foods:all';
        let foods = await CacheService.get(cacheKey);
        
        if (!foods) {
          foods = await Food.find();
          await CacheService.set(cacheKey, foods, 600);
        }
        
        return foods;
      } catch (error) {
        throw new Error(`Error fetching foods: ${error.message}`);
      }
    },

    getFoodsByCategory: async (_, { category }) => {
      try {
        const cacheKey = `foods:category:${category}`;
        let foods = await CacheService.get(cacheKey);
        
        if (!foods) {
          foods = await Food.find({ category });
          await CacheService.set(cacheKey, foods, 600);
        }
        
        return foods;
      } catch (error) {
        throw new Error(`Error fetching foods by category: ${error.message}`);
      }
    },

    getFoodsByRestaurant: async (_, { restaurant }) => {
      try {
        const cacheKey = `foods:restaurant:${restaurant}`;
        let foods = await CacheService.get(cacheKey);
        
        if (!foods) {
          foods = await Food.find({ restaurant });
          await CacheService.set(cacheKey, foods, 600);
        }
        
        return foods;
      } catch (error) {
        throw new Error(`Error fetching foods by restaurant: ${error.message}`);
      }
    },

    // Order queries
    getOrder: async (_, { id }) => {
      try {
        const order = await Order.findById(id);
        return order;
      } catch (error) {
        throw new Error(`Error fetching order: ${error.message}`);
      }
    },

    getAllOrders: async () => {
      try {
        const orders = await Order.find().sort({ createdAt: -1 });
        return orders;
      } catch (error) {
        throw new Error(`Error fetching orders: ${error.message}`);
      }
    },

    getUserOrders: async (_, { userId }) => {
      try {
        const orders = await Order.find({ buyer: userId }).sort({ createdAt: -1 });
        return orders;
      } catch (error) {
        throw new Error(`Error fetching user orders: ${error.message}`);
      }
    },

    // Search queries
    searchFoods: async (_, { query }) => {
      try {
        const cacheKey = `search:foods:${query}`;
        let foods = await CacheService.get(cacheKey);
        
        if (!foods) {
          foods = await Food.find({
            $or: [
              { title: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { foodTags: { $regex: query, $options: 'i' } }
            ]
          });
          await CacheService.set(cacheKey, foods, 300); // 5 minutes
        }
        
        return foods;
      } catch (error) {
        throw new Error(`Error searching foods: ${error.message}`);
      }
    },

    searchRestaurants: async (_, { query }) => {
      try {
        const cacheKey = `search:restaurants:${query}`;
        let restaurants = await CacheService.get(cacheKey);
        
        if (!restaurants) {
          restaurants = await Restaurant.find({
            title: { $regex: query, $options: 'i' }
          });
          await CacheService.set(cacheKey, restaurants, 300);
        }
        
        return restaurants;
      } catch (error) {
        throw new Error(`Error searching restaurants: ${error.message}`);
      }
    }
  },

  Mutation: {
    // Auth mutations
    register: async (_, { input }) => {
      try {
        const existingUser = await User.findOne({ email: input.email });
        if (existingUser) {
          throw new Error('User already exists with this email');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(input.password, salt);

        const user = await User.create({
          ...input,
          password: hashedPassword,
          usertype: 'client'
        });

        const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '7d'
        });

        // Cache user data
        const cacheKey = `user:${user._id}`;
        await CacheService.set(cacheKey, { ...user.toObject(), password: undefined }, 1800);

        // Invalidate users list cache
        await CacheService.del('users:all');

        return {
          token,
          user: { ...user.toObject(), password: undefined },
          success: true,
          message: 'Registration successful'
        };
      } catch (error) {
        throw new Error(`Registration failed: ${error.message}`);
      }
    },

    login: async (_, { input }) => {
      try {
        const user = await User.findOne({ email: input.email });
        if (!user) {
          throw new Error('User not found');
        }

        const isMatch = await bcrypt.compare(input.password, user.password);
        if (!isMatch) {
          throw new Error('Invalid credentials');
        }

        const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '7d'
        });

        // Cache user data
        const cacheKey = `user:${user._id}`;
        await CacheService.set(cacheKey, { ...user.toObject(), password: undefined }, 1800);

        return {
          token,
          user: { ...user.toObject(), password: undefined },
          success: true,
          message: 'Login successful'
        };
      } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
      }
    },

    // Restaurant mutations
    createRestaurant: async (_, { input }) => {
      try {
        const restaurant = await Restaurant.create(input);
        
        // Invalidate cache
        await CacheService.del('restaurants:all');
        
        return restaurant;
      } catch (error) {
        throw new Error(`Error creating restaurant: ${error.message}`);
      }
    },

    updateRestaurant: async (_, { id, input }) => {
      try {
        const restaurant = await Restaurant.findByIdAndUpdate(id, input, { new: true });
        
        // Invalidate cache
        await CacheService.del(`restaurant:${id}`);
        await CacheService.del('restaurants:all');
        
        return restaurant;
      } catch (error) {
        throw new Error(`Error updating restaurant: ${error.message}`);
      }
    },

    // Category mutations
    createCategory: async (_, { input }) => {
      try {
        const category = await Category.create(input);
        
        // Invalidate cache
        await CacheService.del('categories:all');
        
        return category;
      } catch (error) {
        throw new Error(`Error creating category: ${error.message}`);
      }
    },

    // Food mutations
    createFood: async (_, { input }) => {
      try {
        const food = await Food.create(input);
        
        // Invalidate cache
        await CacheService.del('foods:all');
        await CacheService.del(`foods:category:${input.category}`);
        await CacheService.del(`foods:restaurant:${input.restaurant}`);
        
        return food;
      } catch (error) {
        throw new Error(`Error creating food: ${error.message}`);
      }
    },

    updateFood: async (_, { id, input }) => {
      try {
        const food = await Food.findByIdAndUpdate(id, input, { new: true });
        
        // Invalidate cache
        await CacheService.del(`food:${id}`);
        await CacheService.del('foods:all');
        if (input.category) await CacheService.del(`foods:category:${input.category}`);
        if (input.restaurant) await CacheService.del(`foods:restaurant:${input.restaurant}`);
        
        return food;
      } catch (error) {
        throw new Error(`Error updating food: ${error.message}`);
      }
    },

    // Order mutations
    createOrder: async (_, { input }, { user }) => {
      try {
        if (!user) {
          throw new Error('Authentication required');
        }

        const order = await Order.create({
          ...input,
          buyer: user.id,
          status: 'PENDING'
        });

        return order;
      } catch (error) {
        throw new Error(`Error creating order: ${error.message}`);
      }
    },

    updateOrderStatus: async (_, { id, status }) => {
      try {
        const order = await Order.findByIdAndUpdate(
          id,
          { status },
          { new: true }
        );

        return order;
      } catch (error) {
        throw new Error(`Error updating order status: ${error.message}`);
      }
    }
  }
};

module.exports = resolvers;
