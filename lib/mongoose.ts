import dns from "dns";

import { MongoClient } from "mongodb";
import mongoose, { Mongoose } from "mongoose";

import logger from "./logger";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

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

/* eslint-disable no-var */
declare global {
  var mongoose: MongooseCache;
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}
/* eslint-enable no-var */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
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
        logger.info("connected to mongodb");
        return res;
      })
      .catch((error: unknown) => {
        logger.error({ err: error }, "error connecting to mongodb");
        // Reset the cached promise so the next call retries instead of
        // permanently returning a rejected promise
        cached.promise = null;
        throw error;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};

// For NextAuth MongoDBAdapter
let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;

const createClientPromise = (): Promise<MongoClient> => {
  client = new MongoClient(getMongoUri());
  return client.connect().catch((error: unknown) => {
    logger.error(
      { err: error },
      "error connecting to mongodb (nextauth client)"
    );
    throw error;
  });
};

const getClientPromise = (): Promise<MongoClient> => {
  if (!clientPromise) {
    if (process.env.NODE_ENV === "development") {
      if (!global._mongoClientPromise) {
        global._mongoClientPromise = createClientPromise();
      }
      clientPromise = global._mongoClientPromise;
    } else {
      clientPromise = createClientPromise();
    }
  }
  return clientPromise;
};

export default getClientPromise;
