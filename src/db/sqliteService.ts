import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";

class SQLiteService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private isWeb = false;

  async initialize() {
    if (this.db) return;

    this.isWeb = Capacitor.getPlatform() === "web";

    if (this.isWeb) {
      await customElements.whenDefined("jeep-sqlite");
      await this.sqlite.initWebStore();
    }

    await CapacitorSQLite.copyFromAssets({});

    const consistency = (await this.sqlite.checkConnectionsConsistency())
      .result;

    const isConn = (await this.sqlite.isConnection("infinite_aptitude", false))
      .result;

    if (consistency && isConn) {
      this.db = await this.sqlite.retrieveConnection(
        "infinite_aptitude",
        false,
      );
    } else {
      this.db = await this.sqlite.createConnection(
        "infinite_aptitude",
        false,
        "no-encryption",
        1,
        false,
      );
    }

    if (!(await this.db.isDBOpen()).result) {
      await this.db.open();
    }

    // "Save for later" support. This is the one writable table in an
    // otherwise read-only, asset-copied database. CREATE TABLE IF NOT EXISTS
    // is idempotent and cheap, so running it on every init needs no separate
    // migration/versioning step and never touches the bundled question data.
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS saved_questions (
        question_id TEXT PRIMARY KEY,
        saved_at    INTEGER NOT NULL
      );
    `);
  }

  getDB() {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return this.db;
  }

  /**
   * On the web platform the SQLite file lives in IndexedDB via jeep-sqlite
   * and writes aren't guaranteed to be flushed to that store until this is
   * called. Native (Android/iOS) connections write straight to disk, so
   * this is a no-op there. Call after any INSERT/UPDATE/DELETE (e.g. the
   * saved-questions toggle) so "save for later" actually survives a reload
   * offline, not just for the current session.
   */
  async persist() {
    if (!this.isWeb) return;
    await this.sqlite.saveToStore("infinite_aptitude");
  }
}

export default new SQLiteService();
