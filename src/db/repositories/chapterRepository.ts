import { ChapterSchema, type Chapter } from "@/lib/schema";
import sqliteService from "@/db/sqliteService";
import { dbCache } from "@/lib/db-cache";

export class ChapterRepository {
  /** All chapters, ordered by chapter number. */
  async getAll(): Promise<Chapter[]> {
    return dbCache.get("chapters:all", async () => {
      const db = sqliteService.getDB();
      const result = await db.query(
        `SELECT id, display_name, number
         FROM chapters
         ORDER BY number ASC`,
      );
      return ChapterSchema.array().parse(result.values ?? []);
    });
  }

  /** Single chapter by slug id, e.g. 'profit_and_loss'. */
  async getById(id: string): Promise<Chapter | null> {
    return dbCache.get(`chapters:id:${id}`, async () => {
      const db = sqliteService.getDB();
      const result = await db.query(
        `SELECT id, display_name, number
         FROM chapters
         WHERE id = ?`,
        [id],
      );
      if (!result.values?.length) return null;
      return ChapterSchema.parse(result.values[0]);
    });
  }
}

export const chapterRepository = new ChapterRepository();
