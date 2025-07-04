const { MongoClient } = require("mongodb");

class SyncController {
  // Endpoint to upload Excel file
  static async uploadData(req, res) {
    try {
      const localClient = await MongoClient.connect(
        "mongodb://127.0.0.1:27017"
      );
      const localDb = localClient.db("tca-db");
      const localResults = await localDb.collection("results").find().toArray();

      const atlasClient = await MongoClient.connect(
        process.env.MONGO_ATLAS_URI
      );
      const atlasDb = atlasClient.db("tca-db");
      await atlasDb.collection("results").insertMany(localResults);

      res.json({ success: true, message: "Data synced to MongoDB Atlas" });
    } catch (err) {
      console.error("Sync failed:", err);
      res.status(500).json({ success: false, message: "Sync failed" });
    }
  }
}

module.exports = SyncController;
