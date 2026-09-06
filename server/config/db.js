const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
        memoryServer: null
    };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = (async () => {
            const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/classpilot";

            try {
                return await mongoose.connect(mongoUri, {
                    serverSelectionTimeoutMS: 10000
                });
            } catch (error) {
                if (process.env.USE_MEMORY_DB === "false") {
                    throw error;
                }

                console.warn("MongoDB not available. Starting in-memory MongoDB for local development...");
                cached.memoryServer = await MongoMemoryServer.create();
                return await mongoose.connect(cached.memoryServer.getUri(), {
                    serverSelectionTimeoutMS: 10000
                });
            }
        })();
    }

    try {
        cached.conn = await cached.promise;
        const host = cached.memoryServer ? "memory-server" : cached.conn.connection.host;
        console.log(`MongoDB connected: ${host}`);
    } catch (error) {
        cached.promise = null;
        console.error(`MongoDB connection error: ${error.message}`);
        throw error;
    }

    return cached.conn;
};

module.exports = connectDB;