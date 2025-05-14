import { MongoClient } from "mongodb";
import { format } from "date-fns";
import logger from "./logger";

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
  logger.info("Connected to MongoDB");
}

type Config = {
  uuid: string;
  source: string;
  target: string;
  createdAt: Date;
};

export async function addConfig(source: string, target: string): Promise<void> {
  // Check if the config already exists
  const config = await findConfigByHostname(source);
  if (config) {
    logger.warn(`Attempted to add duplicate config for ${source}`);
    throw new Error(
      `Config for ${source} already exists with UUID: ${config.uuid}`
    );
  }

  const newConfig: Config = {
    uuid: crypto.randomUUID(),
    source,
    target,
    createdAt: new Date(),
  };
  await client.db().collection<Config>("configs").insertOne(newConfig);
  logger.info(
    `Added new config for ${source} -> ${target} with UUID: ${newConfig.uuid}`
  );
}

export function findConfigByHostname(hostname: string): Promise<Config | null> {
  return client
    .db()
    .collection<Config>("configs")
    .findOne({ source: hostname });
}

export async function getConfigs(): Promise<Config[]> {
  return client.db().collection<Config>("configs").find().toArray();
}

export async function getConfigByUUID(uuid: string): Promise<Config | null> {
  return client.db().collection<Config>("configs").findOne({ uuid });
}

export type RedirectStats = {
  uuid: string;
  redirectCounts: Record<string, number>;
  totalRedirects: number;
  lastRedirected: Date;
  firstRedirected: Date;
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
      firstRedirected: today,
    });
    logger.info(`Created new redirect stats entry for UUID: ${uuid}`);
  }
}

// Export MongoDB client to be used elsewhere in the application
export const getDb = () => client.db();

// Default export for easier importing
export default {
  connectToMongo,
  getDb,
};
