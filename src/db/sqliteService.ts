import {
  CapacitorSQLite,
  SQLiteConnection,
  type SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";

/**
 * Versioned localStorage key. Bump the version string whenever you ship
 * a new database (schema change or content update) so all clients
 * re-seed automatically on next startup.
 */
const DB_SEED_KEY = "ia:db:seeded:v1";

class SQLiteService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private isWeb = false;

  async initialize() {
    if (this.db) return;

    this.isWeb = Capacitor.getPlatform() === "web";

    if (this.isWeb) {
      // Wait for the jeep-sqlite custom element to be defined and ready.
      await customElements.whenDefined("jeep-sqlite");
      await this.sqlite.initWebStore();

      // copyFromAssets copies the bundled DB into IndexedDB (jeep-sqlite's
      // storage layer). Once it's there it persists across reloads, so we
      // only need to do this on the very first launch. A versioned
      // localStorage flag lets us skip the round-trip every other time,
      // which meaningfully speeds up subsequent startups.
      if (!localStorage.getItem(DB_SEED_KEY)) {
        await CapacitorSQLite.copyFromAssets({});
        localStorage.setItem(DB_SEED_KEY, "1");
      }
    } else {
      // On Android/iOS, copyFromAssets already checks whether the DB file
      // exists in the Documents directory before copying; this is fast on
      // subsequent launches. We leave the native path unchanged.
      await CapacitorSQLite.copyFromAssets({});
    }

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
