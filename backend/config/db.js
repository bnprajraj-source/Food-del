import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async () => {
  try {
    const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/food-del';
    
    console.log("Connecting to MongoDB...");
    
    await mongoose.connect(connectionString, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log("DB Connected Successfully");
    return true;
  } catch (error) {
    console.error("DB Connection Error:", error.message);
    process.exit(1);
  }
}