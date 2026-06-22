import {
  ChapterResourceSchema,
  type ChapterResource,
  type ResourceType,
} from "@/db/schema";
import sqliteService from "@/services/sqliteService";

export class ChapterResourceRepository {
  /** Cheatsheet markdown for a chapter. */
  async getCheatsheet(chapterId: string): Promise<ChapterResource | null> {
    return this._getByType(chapterId, "cheatsheet");
  }

  /** Patterns overview markdown for a chapter. */
  async getOverview(chapterId: string): Promise<ChapterResource | null> {
    return this._getByType(chapterId, "overview");
  }

  /** Both resources for a chapter in one query. */
  async getAllForChapter(chapterId: string): Promise<ChapterResource[]> {
    const db = sqliteService.getDB();
    const result = await db.query(
      `SELECT id, chapter_id, resource_type, markdown
       FROM chapter_resources
       WHERE chapter_id = ?`,
      [chapterId],
    );
    return ChapterResourceSchema.array().parse(result.values ?? []);
  }

  private async _getByType(
    chapterId: string,
    type: ResourceType,
  ): Promise<ChapterResource | null> {
    const db = sqliteService.getDB();
    const result = await db.query(
      `SELECT id, chapter_id, resource_type, markdown
       FROM chapter_resources
       WHERE chapter_id = ? AND resource_type = ?`,
      [chapterId, type],
    );
    if (!result.values?.length) return null;
    return ChapterResourceSchema.parse(result.values[0]);
  }
}

export const chapterResourceRepository = new ChapterResourceRepository();
