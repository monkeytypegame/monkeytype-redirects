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
  try {
    await client.connect();
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

/**
 * Logs the current hostname with today's date in year-month-day format
 * and stores this information in the MongoDB hostnames collection
 * @returns {Promise<string>} The formatted log message
 */
export async function logHostnameWithDate(hostname: string): Promise<void> {
  const today = new Date();
  const formattedDate = format(today, "yyyy-MM-dd");

  try {
    const db = getDb();
    const hostnamesCollection = db.collection("hostnames");

    // Try to find an existing document for this hostname
    const existingDoc = await hostnamesCollection.findOne({ hostname });

    if (existingDoc) {
      // Update the existing document
      const redirectCounts = existingDoc.redirectCounts || {};

      // Increment the count for today's date or initialize it to 1
      redirectCounts[formattedDate] = (redirectCounts[formattedDate] || 0) + 1;

      // Calculate the total redirects by adding 1 to the existing total or initialize to 1
      const totalRedirects = (existingDoc.totalRedirects || 0) + 1;

      await hostnamesCollection.updateOne(
        { hostname },
        {
          $set: {
            lastRedirected: today,
            redirectCounts,
            totalRedirects,
          },
        }
      );

      console.log(`Updated redirect count for hostname: ${hostname}`);
    } else {
      // Create a new document
      const redirectCounts = {
        [formattedDate]: 1,
      };

      await hostnamesCollection.insertOne({
        hostname,
        lastRedirected: today,
        redirectCounts,
        totalRedirects: 1,
      });

      console.log(`Created new hostname entry for: ${hostname}`);
    }
  } catch (error) {
    console.error("Failed to log hostname to database:", error);
  }
}

// Export MongoDB client to be used elsewhere in the application
export const getDb = () => client.db();

// Default export for easier importing
export default {
  connectToMongo,
  logHostnameWithDate,
  getDb,
};
