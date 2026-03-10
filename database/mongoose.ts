import { error } from "console";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
    var mongooseCache: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };
}

if (!MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
}

let cached = global.mongooseCache;

if (!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase() {
    if (!MONGODB_URI) throw new Error('Please add your Mongo URI to .env.local');

    if (cached.conn) return cached.conn;

    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
      })    

      try {
        cached.conn = await cached.promise;
      } catch (err) {
        cached.promise = null;
        const errorMessage = err instanceof Error ? err.message : String(err);
        const isServerSelectionError = /MongooseServerSelectionError|Server selection timed out|Could not connect to any servers/i.test(errorMessage);

        if (isServerSelectionError) {
            throw new Error(
                'MongoDB connection failed. If you use MongoDB Atlas, confirm Network Access includes your current IP (or allow 0.0.0.0/0 for development), verify the cluster is running, and re-check MONGODB_URI credentials.',
                { cause: err instanceof Error ? err : undefined }
            );
        }

        throw err;
      }
    }
console.log(`Connected to database ${process.env.NODE_ENV}`);
    return cached.conn;
}