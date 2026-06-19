import sqliteService from "../sqliteService";

export class QuestionRepository {
  async getQuestion(id: number) {
    const db = sqliteService.getDB();

    const result = await db.query(
      `
      SELECT *
      FROM questions
      WHERE id = ?
      `,
      [id],
    );

    return result.values?.[0];
  }
}
