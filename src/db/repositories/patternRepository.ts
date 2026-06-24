import { PatternSchema, type Pattern } from "@/lib/schema";
import sqliteService from "@/db/sqliteService";
import { dbCache } from "@/lib/db-cache";

export class PatternRepository {
  /** All patterns for a chapter, alphabetically by name. */
  async getByChapter(chapterId: string): Promise<Pattern[]> {
    return dbCache.get(`patterns:chapter:${chapterId}`, async () => {
      const db = sqliteService.getDB();
      const result = await db.query(
        `SELECT id, chapter_id, name
         FROM patterns
         WHERE chapter_id = ?`,
        [chapterId],
      );
      return PatternSchema.array().parse(result.values ?? []);
    });
  }

  /** Single pattern by its compound id, e.g. 'profit_and_loss__find_sp'. */
  async getById(id: string): Promise<Pattern | null> {
    return dbCache.get(`patterns:id:${id}`, async () => {
      const db = sqliteService.getDB();
      const result = await db.query(
        `SELECT id, chapter_id, name
         FROM patterns
         WHERE id = ?`,
        [id],
      );
      if (!result.values?.length) return null;
      return PatternSchema.parse(result.values[0]);
    });
  }

  /** How many questions each pattern has — useful for a chapter index screen. */
  async getCountsByChapter(
    chapterId: string,
  ): Promise<{ pattern_id: string; name: string; count: number }[]> {
    return dbCache.get(`patterns:counts:${chapterId}`, async () => {
      const db = sqliteService.getDB();
      const result = await db.query(
        `SELECT p.id AS pattern_id, p.name, COUNT(q.id) AS count
         FROM patterns p
         LEFT JOIN questions q ON q.pattern_id = p.id
         WHERE p.chapter_id = ?
         GROUP BY p.id
         ORDER BY p.name ASC`,
        [chapterId],
      );
      return (result.values ?? []) as {
        pattern_id: string;
        name: string;
        count: number;
      }[];
    });
  }
}

export const patternRepository = new PatternRepository();
