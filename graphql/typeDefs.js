const { gql } = require('apollo-server-express');

const typeDefs = gql`
  scalar Date

  type User {
    id: ID!
    userName: String!
    email: String!
    password: String!
    address: [String]
    phone: String!
    usertype: String!
    profile: String
    answer: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type AuthPayload {
    token: String!
    user: User!
    success: Boolean!
    message: String!
  }

  type Restaurant {
    id: ID!
    title: String!
    imageUrl: String!
    foods: [String]
    time: String!
    pickup: Boolean!
    delivery: Boolean!
    isOpen: Boolean!
    logoUrl: String!
    rating: Float
    ratingCount: String
    code: String!
    coords: Coords
    createdAt: Date!
    updatedAt: Date!
  }

  type Coords {
    id: String!
    latitude: Float!
    longitude: Float!
    latitudeDelta: Float!
    longitudeDelta: Float!
    address: String!
    title: String!
  }

  type Category {
    id: ID!
    title: String!
    imageUrl: String!
    createdAt: Date!
    updatedAt: Date!
  }

  type Food {
    id: ID!
    title: String!
    description: String!
    price: Float!
    imageUrl: String!
    foodTags: String!
    category: String!
    code: String!
    isAvailable: Boolean!
    restaurant: String!
    rating: Float
    ratingCount: String
    createdAt: Date!
    updatedAt: Date!
  }

  type Order {
    id: ID!
    foods: [OrderFood!]!
    payment: Payment!
    buyer: String!
    status: OrderStatus!
    totalAmount: Float!
    createdAt: Date!
    updatedAt: Date!
  }

  type OrderFood {
    food: String!
    quantity: Int!
    price: Float!
  }

  type Payment {
    method: String!
    status: String!
    transactionId: String
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    PREPARING
    OUT_FOR_DELIVERY
    DELIVERED
    CANCELLED
  }

  input UserInput {
    userName: String!
    email: String!
    password: String!
    phone: String!
    address: [String]
    answer: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input RestaurantInput {
    title: String!
    imageUrl: String!
    time: String!
    pickup: Boolean!
    delivery: Boolean!
    logoUrl: String!
    rating: Float
    code: String!
    coords: CoordsInput!
  }

  input CoordsInput {
    latitude: Float!
    longitude: Float!
    latitudeDelta: Float!
    longitudeDelta: Float!
    address: String!
    title: String!
  }

  input CategoryInput {
    title: String!
    imageUrl: String!
  }

  input FoodInput {
    title: String!
    description: String!
    price: Float!
    imageUrl: String!
    foodTags: String!
    category: String!
    code: String!
    restaurant: String!
    rating: Float
  }

  input OrderInput {
    foods: [OrderFoodInput!]!
    payment: PaymentInput!
    totalAmount: Float!
  }

  input OrderFoodInput {
    food: String!
    quantity: Int!
    price: Float!
  }

  input PaymentInput {
    method: String!
    status: String!
    transactionId: String
  }

  type Query {
    # User queries
    getUser(id: ID!): User
    getAllUsers: [User!]!
    
    # Restaurant queries
    getRestaurant(id: ID!): Restaurant
    getAllRestaurants: [Restaurant!]!
    
    # Category queries
    getCategory(id: ID!): Category
    getAllCategories: [Category!]!
    
    # Food queries
    getFood(id: ID!): Food
    getAllFoods: [Food!]!
    getFoodsByCategory(category: String!): [Food!]!
    getFoodsByRestaurant(restaurant: String!): [Food!]!
    
    # Order queries
    getOrder(id: ID!): Order
    getAllOrders: [Order!]!
    getUserOrders(userId: String!): [Order!]!
    
    # Search
    searchFoods(query: String!): [Food!]!
    searchRestaurants(query: String!): [Restaurant!]!
  }

  type Mutation {
    # Auth mutations
    register(input: UserInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateProfile(id: ID!, input: UserInput!): User!
    deleteUser(id: ID!): Boolean!
    
    # Restaurant mutations
    createRestaurant(input: RestaurantInput!): Restaurant!
    updateRestaurant(id: ID!, input: RestaurantInput!): Restaurant!
    deleteRestaurant(id: ID!): Boolean!
    
    # Category mutations
    createCategory(input: CategoryInput!): Category!
    updateCategory(id: ID!, input: CategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
    
    # Food mutations
    createFood(input: FoodInput!): Food!
    updateFood(id: ID!, input: FoodInput!): Food!
    deleteFood(id: ID!): Boolean!
    
    # Order mutations
    createOrder(input: OrderInput!): Order!
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
    cancelOrder(id: ID!): Boolean!
  }

  type Subscription {
    orderUpdated: Order!
    newOrder: Order!
  }
`;

module.exports = typeDefs;
