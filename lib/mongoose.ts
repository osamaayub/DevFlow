import { MongoClient } from "mongodb"
import mongoose, { Mongoose } from "mongoose"

import logger from "./logger"

const getMongoUri = (): string => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined in the env");
  }
  return uri;
};

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Properly extend global namespace
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient>;
}

// Initialize cached mongoose connection
const cached = global.mongoose || { conn: null, promise: null };
if (!global.mongoose) {
  global.mongoose = cached;
}

export const dbConnect = async (): Promise<Mongoose> => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(getMongoUri(), {
        dbName: "DevFlow",
      })
      .then((res) => {
        logger.info("Connected to MongoDB successfully");
        return res;
      })
      .catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(
          {
            err: error,
            message: errorMessage,
          },
          "MongoDB connection failed during initial connection"
        );
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

// For NextAuth MongoDBAdapter
const createClientPromise = async (): Promise<MongoClient> => {
  const client = new MongoClient(getMongoUri());
  try {
    await client.connect();
    return client;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(
      {
        err: error,
        message: errorMessage,
      },
      "MongoDB connection failed for NextAuth client"
    );
    throw error;
  }
};

const getClientPromise = (): Promise<MongoClient> => {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createClientPromise();
    }
    return global._mongoClientPromise;
  } else {
    return createClientPromise();
  }
};

export default getClientPromise;