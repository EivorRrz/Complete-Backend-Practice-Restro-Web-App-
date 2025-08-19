const express = require("express");
const colors = require("colors");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const { ApolloServer } = require("apollo-server-express");

// Import configurations
const connectDb = require("./config/db");
const { redis } = require("./config/redis");

// Import GraphQL schema
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const { getGraphQLUser } = require("./middlewares/enhancedAuthMiddleware");

// Initialize dotenv configuration
dotenv.config();

// Connect to databases
connectDb();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://studio.apollographql.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://studio.apollographql.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://studio.apollographql.com"],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "https://studio.apollographql.com"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Session configuration with Redis store
app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET || 'your-session-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'restaurant_session'
}));

// CORS configuration
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:4000",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan("combined"));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/restaurant", require("./routes/restaurantRoutes"));
app.use("/api/category", require("./routes/categoryRoutes"));
app.use("/api/test", require("./routes/testRoutes"));
app.use("/api/auth", require("./routes/authControllers"));
app.use("/api/food", require("./routes/foodRoutes"));

// GraphQL server setup
async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      // Get user from token for GraphQL context
      const user = await getGraphQLUser(req);
      return { user };
    },
    introspection: true,
    playground: true,
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        code: error.extensions?.code,
        path: error.path
      };
    }
  });

  await server.start();
  server.applyMiddleware({ 
    app, 
    path: '/graphql',
    cors: false // We handle CORS above
  });

  console.log(`🚀 GraphQL Server ready at http://localhost:${PORT}${server.graphqlPath}`.cyan.bold);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  // Default error
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await redis.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await redis.disconnect();
  process.exit(0);
});

// Start the server
startServer().then(() => {
  app.listen(PORT, () => {
    console.log(`🌟 Server listening on port ${PORT}`.white.bgMagenta);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`.green);
    console.log(`📡 Redis: Connected`.green.bold);
    console.log(`🗄️  MongoDB: Connected`.green.bold);
    console.log(`🔒 Security: Enabled`.green.bold);
    console.log(`⚡ Rate Limiting: Active`.green.bold);
  });
}).catch(error => {
  console.error('❌ Server startup failed:', error);
  process.exit(1);
});
