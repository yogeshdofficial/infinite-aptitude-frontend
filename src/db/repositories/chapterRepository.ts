import { ChapterSchema, type Chapter } from "@/lib/schema";
import sqliteService from "@/db/sqliteService";

export class ChapterRepository {
  /** All chapters, ordered by chapter number. */
  async getAll(): Promise<Chapter[]> {
    const db = sqliteService.getDB();
    const result = await db.query(
      `SELECT id, display_name, number
       FROM chapters
       ORDER BY number ASC`,
    );
    return ChapterSchema.array().parse(result.values ?? []);
  }

  /** Single chapter by slug id, e.g. 'profit_and_loss'. */
  async getById(id: string): Promise<Chapter | null> {
    const db = sqliteService.getDB();
    const result = await db.query(
      `SELECT id, display_name, number
       FROM chapters
       WHERE id = ?`,
      [id],
    );
    if (!result.values?.length) return null;
    return ChapterSchema.parse(result.values[0]);
  }
}

export const chapterRepository = new ChapterRepository();
