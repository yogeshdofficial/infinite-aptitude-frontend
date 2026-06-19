import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from "@capacitor-community/sqlite";

class SQLiteService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;

  async initialize() {
    if (this.db) return;

    await CapacitorSQLite.copyFromAssets({});

    this.db = await this.sqlite.createConnection(
      "infinite_aptitude",
      false,
      "no-encryption",
      1,
      false,
    );

    await this.db.open();
  }

  getDB() {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return this.db;
  }
}

export default new SQLiteService();
