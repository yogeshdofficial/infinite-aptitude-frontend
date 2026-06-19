import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";

class SQLiteService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;

  async initialize() {
    if (this.db) return;

    // Skip web for now
    if (Capacitor.getPlatform() === "web") {
      console.log("[SQLite] skipping web");
      return;
    }

    console.log("[SQLite] copyFromAssets");

    await CapacitorSQLite.copyFromAssets({});

    console.log("[SQLite] createConnection");

    this.db = await this.sqlite.createConnection(
      "infinite_aptitude",
      false,
      "no-encryption",
      1,
      false,
    );

    console.log("[SQLite] open");

    await this.db.open();

    console.log("[SQLite] ready");
  }

  getDB() {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return this.db;
  }
}

export default new SQLiteService();
