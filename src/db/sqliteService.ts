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

    if (Capacitor.getPlatform() === "web") {
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
  }

  getDB() {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return this.db;
  }
}

export default new SQLiteService();

// import {
//   CapacitorSQLite,
//   SQLiteConnection,
//   type SQLiteDBConnection,
// } from "@capacitor-community/sqlite";
// import { Capacitor } from "@capacitor/core";

// class SQLiteService {
//   private sqlite = new SQLiteConnection(CapacitorSQLite);
//   private db: SQLiteDBConnection | null = null;

//   async initialize() {
//     if (this.db) return;

//     const platform = Capacitor.getPlatform();

//     if (platform === "web") {
//       // 1. Wait for jeep-sqlite component
//       await customElements.whenDefined("jeep-sqlite");

//       // 2. Web initWebStore AUTOMATICALLY reads databases.json and imports assets.
//       // Do NOT call copyFromAssets on the web platform.
//       await this.sqlite.initWebStore();
//     } else {
//       // 3. Mobile platforms explicitly require the file stream copy
//       await CapacitorSQLite.copyFromAssets({});
//     }

//     // 4. Create the connection to the asset-defined database name
//     this.db = await this.sqlite.createConnection(
//       "infinite_aptitude", // Must exactly match the name in databases.json
//       false,
//       "no-encryption",
//       1,
//       false,
//     );

//     // 5. Open the connection
//     await this.db.open();
//   }

//   getDB() {
//     if (!this.db) {
//       throw new Error("Database not initialized");
//     }
//     return this.db;
//   }
// }

// export default new SQLiteService();
