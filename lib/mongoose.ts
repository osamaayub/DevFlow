import dns from "dns";
import { MongoClient } from "mongodb";
import mongoose, { Mongoose } from "mongoose";

import logger from "./logger";

// Fix for ECONNREFUSED on querySrv: Node's built-in resolver (c-ares) sometimes
// fails to resolve mongodb+srv SRV records even when the OS resolver (nslookup/dig)
// succeeds — common on Windows, WSL2, and some VPN/corporate networks.
// Forcing a known-good public DNS server avoids this.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in the env");
}

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
      .connect(MONGODB_URI, {
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
let clientPromise: Promise<MongoClient>;

// This creates the connection immediately at import time, so it MUST have a
// .catch attached right here — otherwise a failure surfaces as an
// unhandledRejection at the process level instead of being handled where
// clientPromise is eventually awaited/consumed.
const createClientPromise = (): Promise<MongoClient> => {
  client = new MongoClient(MONGODB_URI);
  return client.connect().catch((error: unknown) => {
    logger.error(
      { err: error },
      "error connecting to mongodb (nextauth client)"
    );
    throw error;
  });
};

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createClientPromise();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  clientPromise = createClientPromise();
}

export default clientPromise;