const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { redis } = require('../config/redis');

let mongoServer;

// Setup before all tests
before(async function() {
    this.timeout(60000); // Increase timeout for MongoDB setup
    
    try {
        // Create in-memory MongoDB instance for testing
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        // Connect to the in-memory database
        await mongoose.connect(mongoUri);
        console.log('✅ Test MongoDB connected');
        
        // Clear Redis test database
        await redis.flushdb();
        console.log('✅ Redis test database cleared');
        
    } catch (error) {
        console.error('❌ Test setup failed:', error);
        throw error;
    }
});

// Cleanup after all tests
after(async function() {
    this.timeout(30000);
    
    try {
        // Close mongoose connection
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        
        // Stop the in-memory MongoDB server
        if (mongoServer) {
            await mongoServer.stop();
        }
        
        // Clear Redis and close connection
        await redis.flushdb();
        await redis.disconnect();
        
        console.log('🧹 Test cleanup completed');
    } catch (error) {
        console.error('❌ Test cleanup failed:', error);
    }
});

// Clean up before each test
beforeEach(async function() {
    // Clear all collections
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
    
    // Clear Redis cache
    await redis.flushdb();
});
