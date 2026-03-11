import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import { connectToSocket } from './controllers/socketManager.js';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

// Middleware
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true })); // Fixed typo: "4Okb" → "40kb"

// Routes
app.use("/api/users", userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    message: 'Server is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const start = async () => {
  try {
    // Validate environment variable
    const uri = process.env.MONGO_URI;
    
    if (!uri) {
      throw new Error("MONGO_URI environment variable is not defined");
    }

    console.log("🔄 Connecting to MongoDB Atlas...");
    console.log("📍 Connection string:", uri.replace(/:([^:@]+)@/, ':****@')); // Hide password

    // ✅ MongoDB connection with TLS/SSL configuration
    await mongoose.connect(uri, {
      // TLS/SSL settings (fixes Render SSL error)
      tls: true,
      tlsAllowInvalidCertificates: false,
      
      // Timeouts
      serverSelectionTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
      
      // Connection pool
      maxPoolSize: 10,
      minPoolSize: 2,
      
      // Retry configuration
      retryWrites: true,
      retryReads: true,
    });

    console.log("✅ MongoDB connected successfully!");
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Host: ${mongoose.connection.host}`);

    // Start server
    const PORT = process.env.PORT || 8000;
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    
    // Provide helpful troubleshooting info
    if (error.name === 'MongooseServerSelectionError') {
      console.error("\n💡 MongoDB Connection Troubleshooting:");
      console.error("1. Verify MONGO_URI is set in Render environment variables");
      console.error("2. Check MongoDB Atlas IP whitelist includes 0.0.0.0/0");
      console.error("3. Verify database user credentials are correct");
      console.error("4. Ensure MongoDB cluster is active (not paused)");
      console.error("5. Check if connection string includes database name: /meetspace");
    }
    
    if (error.code === 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR') {
      console.error("\n💡 SSL/TLS Error Troubleshooting:");
      console.error("1. Ensure connection string has tls=true parameter");
      console.error("2. Update MongoDB driver: npm install mongoose@latest");
      console.error("3. Use Node.js 18.x instead of 22.x");
    }
    
    process.exit(1);
  }
};

// Mongoose connection event listeners
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Mongoose disconnected from MongoDB');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose reconnected to MongoDB');
});

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('\n👋 SIGTERM signal received: closing HTTP server');
  
  server.close(async () => {
    console.log('🔌 HTTP server closed');
    
    try {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error closing MongoDB:', error);
      process.exit(1);
    }
  });
});

process.on('SIGINT', async () => {
  console.log('\n👋 SIGINT signal received: closing HTTP server');
  
  server.close(async () => {
    console.log('🔌 HTTP server closed');
    
    try {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error closing MongoDB:', error);
      process.exit(1);
    }
  });
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

start();