import mongoose from "mongoose";

const mongoUrl = process.env.MONGODB_URL ?? "mongodb://127.0.0.1:27017/repairhub";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongo = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache: MongooseCache = globalForMongo.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!globalForMongo.mongooseCache) {
  globalForMongo.mongooseCache = cache;
}

export async function connectMongo() {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(mongoUrl, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
