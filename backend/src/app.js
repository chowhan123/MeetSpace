import express from 'express';
import {createServer} from 'http';
import mongoose from 'mongoose';
import {connectToSocket} from './controllers/socketManager.js'; // Importing the socket connection manager
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import dotenv from "dotenv";

dotenv.config();
const app = express();
const server = createServer(app);  //app.js connected to server
const io = connectToSocket(server);  // when server runs app and io both runs

app.use(cors());  // Enable CORS for all routes
app.use(express.json({limit: "40kb"}));  // Parse JSON bodies
app.use(express.urlencoded({ limit: "4Okb" , extended: true }));  // Parse URL-encoded bodies

//Routes
app.use("/api/users", userRoutes);


const start = async () => {
  // MongoDB connection
  const uri = process.env.MONGO_URI;
   if (!uri) {
    console.error("MONGO_URI is not defined!");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log(`MongoDB connected successfully`);

  // Server connection
  const PORT = process.env.PORT || 8000;
  server.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

start();
