const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null
    };
}

const connectDB = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log(`MongoDB connected: ${cached.conn.connection.host}`);
    } catch (error) {
        cached.promise = null;
        console.error(`MongoDB connection error: ${error.message}`);
        throw error;
    }

    return cached.conn;
};

module.exports = connectDB;