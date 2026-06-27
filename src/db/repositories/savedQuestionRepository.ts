import { QuestionSchema, type Question } from "@/lib/schema";
import sqliteService from "@/db/sqliteService";
import { dbCache } from "@/lib/db-cache";

/**
 * "Save for later" — backed by the single writable `saved_questions` table
 * (see sqliteService.initialize). Everything else in the app reads from a
 * static, read-only question bank, so this is the only repository that
 * writes, and it's the only one that needs to call sqliteService.persist().
 */
export class SavedQuestionRepository {
  /** All saved question ids — cheap, used to decide bookmark state in lists. */
  async getAllIds(): Promise<Set<string>> {
    return dbCache.get("savedQuestions:ids", async () => {
      const db = sqliteService.getDB();
      const result = await db.query(
        `SELECT question_id FROM saved_questions`,
      );
      return new Set(
        (result.values ?? []).map((r) => (r as { question_id: string }).question_id),
      );
    });
  }

  /** Full question rows for every saved question, most recently saved first. */
  async getSavedQuestions(): Promise<Question[]> {
    return dbCache.get("savedQuestions:rows", async () => {
      const db = sqliteService.getDB();
      const result = await db.query(`
        SELECT q.*
        FROM saved_questions s
        JOIN questions q ON q.id = s.question_id
        ORDER BY s.saved_at DESC
      `);
      return QuestionSchema.array().parse(result.values ?? []);
    });
  }

  async save(questionId: string): Promise<void> {
    const db = sqliteService.getDB();
    await db.run(
      `INSERT OR IGNORE INTO saved_questions (question_id, saved_at) VALUES (?, ?)`,
      [questionId, Date.now()],
    );
    await sqliteService.persist();
    this.invalidate();
  }

  async unsave(questionId: string): Promise<void> {
    const db = sqliteService.getDB();
    await db.run(`DELETE FROM saved_questions WHERE question_id = ?`, [
      questionId,
    ]);
    await sqliteService.persist();
    this.invalidate();
  }

  /** Flips saved state and returns the new state (true = now saved). */
  async toggle(questionId: string, currentlySaved: boolean): Promise<boolean> {
    if (currentlySaved) {
      await this.unsave(questionId);
      return false;
    }
    await this.save(questionId);
    return true;
  }

  private invalidate() {
    dbCache.invalidate("savedQuestions:");
  }
}

export const savedQuestionRepository = new SavedQuestionRepository();
