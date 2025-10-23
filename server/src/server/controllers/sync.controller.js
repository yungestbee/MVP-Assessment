const { MongoClient } = require("mongodb");
const db = require("../../database/embedded");

class SyncController {
  // Endpoint to upload Excel file
  static async uploadData(req, res) {
 try {
    const unsynced = db.getUnsyncedResults();
    if (unsynced.length === 0) {
      return res.json({ success: true, message: "Nothing to sync" });
    }

    const atlasClient = await MongoClient.connect(process.env.MONGO_ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const atlasDb = atlasClient.db("tca-db");
    const collection = atlasDb.collection("results");

    // Upsert each record (to avoid duplicates)
    const ops = unsynced.map((r) => ({
      updateOne: {
        filter: { id: r.id },
        update: {
          $set: {
            firstName: r.firstName,
            lastName: r.lastName,
            grade: r.grade,
            score: r.score,
            timeSubmitted: r.timeSubmitted,
            syncedAt: new Date().toISOString(),
          },
        },
        upsert: true,
      },
    }));

    const result = await collection.bulkWrite(ops);
    // Mark them as synced in local DB
    db.markAsSynced(unsynced.map((r) => r.id));

    res.json({
      success: true,
      message: `Synced ${unsynced.length} record(s) to Atlas`,
      detail: result,
    });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ success: false, message: "Sync failed", error: err.message });
  }
}
}

module.exports = SyncController;
