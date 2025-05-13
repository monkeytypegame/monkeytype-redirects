import { MongoClient } from "mongodb";
import { format } from "date-fns";

// MongoDB connection URI
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/redirects";

// Create a MongoDB client
const client = new MongoClient(MONGO_URI, {
  timeoutMS: 1000,
  connectTimeoutMS: 1000,
  serverSelectionTimeoutMS: 1000,
});

/**
 * Connects to MongoDB using native MongoDB driver
 */
export async function connectToMongo(): Promise<void> {
  await client.connect();
}

type Redirect = {
  uuid: string;
  source: string;
  target: string;
  createdAt: Date;
};

export function findConfigByHostname(
  hostname: string
): Promise<Redirect | null> {
  return client
    .db()
    .collection<Redirect>("configs")
    .findOne({ source: hostname });
}

export async function getConfigs(): Promise<Redirect[]> {
  return client.db().collection<Redirect>("configs").find().toArray();
}

export async function getConfigByUUID(uuid: string): Promise<Redirect | null> {
  return client.db().collection<Redirect>("configs").findOne({ uuid });
}

export type RedirectStats = {
  uuid: string;
  redirectCounts: Record<string, number>;
  totalRedirects: number;
  lastRedirected: Date;
};

export async function getRedirectStats(
  uuid: string
): Promise<RedirectStats | null> {
  return client.db().collection<RedirectStats>("stats").findOne({ uuid });
}

export async function logRedirect(uuid: string): Promise<void> {
  const today = new Date();
  const formattedDate = format(today, "yyyy-MM-dd");

  const db = getDb();
  const redirectsCollection = db.collection("stats");

  // Try to update, and if no document exists, insert a new one
  const updateResult = await redirectsCollection.updateOne(
    { uuid },
    {
      $inc: { totalRedirects: 1, [`redirectCounts.${formattedDate}`]: 1 },
      $set: { lastRedirected: today },
    }
  );

  if (updateResult.matchedCount === 0) {
    // No document found, insert a new one
    const redirectCounts = { [formattedDate]: 1 };
    await redirectsCollection.insertOne({
      uuid,
      redirectCounts,
      totalRedirects: 1,
      lastRedirected: today,
    });
    console.log(`Created new redirect entry for UUID: ${uuid}`);
  }
}

// Export MongoDB client to be used elsewhere in the application
export const getDb = () => client.db();

// Default export for easier importing
export default {
  connectToMongo,
  getDb,
};
