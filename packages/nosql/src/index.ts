import type Mongoose from "mongoose";
import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var mongoose: {
    conn: typeof Mongoose | null;
    promise: Promise<typeof Mongoose> | null;
  };
}

const databaseUrl = process.env.MONGODB_URI;
if (!databaseUrl) throw new Error("DATABASE_URL is not defined");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function getDb() {
  if (process.env.NODE_ENV !== 'production') {
    cached.conn = null
    cached.promise = null
  }

  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose
      .connect(databaseUrl as string, opts)
      .then((mongoose) => mongoose);
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default getDb;
