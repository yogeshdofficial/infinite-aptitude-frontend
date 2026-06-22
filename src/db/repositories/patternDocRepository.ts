import {
  PatternDocSchema,
  type PatternDoc,
} from "@/db/schema";
import sqliteService from "@/services/sqliteService";

export class PatternDocRepository {
  /** Revision note for a specific pattern. */
  async getByPattern(patternId: string): Promise<PatternDoc | null> {
    const db = sqliteService.getDB();
    const result = await db.query(
      `SELECT id, chapter_id, pattern_id, markdown
       FROM pattern_docs
       WHERE pattern_id = ?`,
      [patternId],
    );
    if (!result.values?.length) return null;
    return PatternDocSchema.parse(result.values[0]);
  }

  /** All revision notes for a chapter — for a chapter index or search. */
  async getByChapter(chapterId: string): Promise<PatternDoc[]> {
    const db = sqliteService.getDB();
    const result = await db.query(
      `SELECT id, chapter_id, pattern_id, markdown
       FROM pattern_docs
       WHERE chapter_id = ?
       ORDER BY id ASC`,
      [chapterId],
    );
    return PatternDocSchema.array().parse(result.values ?? []);
  }

  /** List view — id + pattern_id only, no markdown blob. */
  async listByChapter(
    chapterId: string,
  ): Promise<Pick<PatternDoc, "id" | "pattern_id">[]> {
    const db = sqliteService.getDB();
    const result = await db.query(
      `SELECT id, pattern_id
       FROM pattern_docs
       WHERE chapter_id = ?
       ORDER BY id ASC`,
      [chapterId],
    );
    return (result.values ?? []) as Pick<PatternDoc, "id" | "pattern_id">[];
  }
}

export const patternDocRepository = new PatternDocRepository();
