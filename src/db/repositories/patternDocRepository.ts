import {
  PatternDocSchema,
  type PatternDoc,
} from "@/lib/schema";
import sqliteService from "@/db/sqliteService";
import { dbCache } from "@/lib/db-cache";

export class PatternDocRepository {
  /** Revision note for a specific pattern. */
  async getByPattern(patternId: string): Promise<PatternDoc | null> {
    return dbCache.get(`patternDocs:pattern:${patternId}`, async () => {
      const db = sqliteService.getDB();
      const result = await db.query(
        `SELECT id, chapter_id, pattern_id, markdown
         FROM pattern_docs
         WHERE pattern_id = ?`,
        [patternId],
      );
      if (!result.values?.length) return null;
      return PatternDocSchema.parse(result.values[0]);
    });
  }

  /** All revision notes for a chapter — for a chapter index or search. */
  async getByChapter(chapterId: string): Promise<PatternDoc[]> {
    return dbCache.get(`patternDocs:chapter:${chapterId}`, async () => {
      const db = sqliteService.getDB();
      const result = await db.query(
        `SELECT id, chapter_id, pattern_id, markdown
         FROM pattern_docs
         WHERE chapter_id = ?
         ORDER BY id ASC`,
        [chapterId],
      );
      return PatternDocSchema.array().parse(result.values ?? []);
    });
  }

  /** List view — id + pattern_id only, no markdown blob. */
  async listByChapter(
    chapterId: string,
  ): Promise<Pick<PatternDoc, "id" | "pattern_id">[]> {
    return dbCache.get(`patternDocs:list:${chapterId}`, async () => {
      const db = sqliteService.getDB();
      const result = await db.query(
        `SELECT id, pattern_id
         FROM pattern_docs
         WHERE chapter_id = ?
         ORDER BY id ASC`,
        [chapterId],
      );
      return (result.values ?? []) as Pick<PatternDoc, "id" | "pattern_id">[];
    });
  }
}

export const patternDocRepository = new PatternDocRepository();
