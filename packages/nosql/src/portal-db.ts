import mongoose, { type Connection } from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var portalMongoose: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}

let cached = global.portalMongoose;

if (!cached) {
  cached = global.portalMongoose = { conn: null, promise: null };
}

async function getPortalDb(): Promise<Connection> {
  const portalDatabaseUrl = process.env.MONGODB_URI_COASTS;
  if (!portalDatabaseUrl) throw new Error("MONGODB_URI_COASTS is not defined");

  if (process.env.NODE_ENV !== "production") {
    cached.conn = null;
    cached.promise = null;
  }

  if (cached.conn) {
    if (cached.conn.readyState === 1) {
      return cached.conn;
    }
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 30000,
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      retryReads: true,
    };

    cached.promise = mongoose
      .createConnection(portalDatabaseUrl, opts)
      .asPromise()
      .then((conn) => {
        console.log("Portal MongoDB connected — db:", conn.db?.databaseName ?? "unknown");
        return conn;
      })
      .catch((error: Error) => {
        console.error("Portal MongoDB connection error:", error.message);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default getPortalDb;
