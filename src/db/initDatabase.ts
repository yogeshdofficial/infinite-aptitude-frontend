import sqliteService from "./sqliteService";

export async function initDatabase() {
  await sqliteService.initialize();
}
