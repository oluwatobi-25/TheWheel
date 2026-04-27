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
        throw err;
      }
    }
    return cached.conn;
}