import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            dbName: "votingSys",
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Error occurred while connecting to MongoDB", error);
        process.exit(1);
    }
};


export default connectDB;
