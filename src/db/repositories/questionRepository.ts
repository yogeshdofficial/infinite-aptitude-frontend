import {
  QuestionSchema,
  QuestionDetailSchema,
  type Question,
  type QuestionDetail,
  type Difficulty,
} from "@/lib/schema";
import sqliteService from "@/db/sqliteService";

/** Shape returned by the raw GROUP_CONCAT join query. */
interface QuestionRow {
  id: string;
  chapter_id: string;
  pattern_id: string | null;
  question_number: string;
  difficulty: string | null;
  question_text: string | null;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  correct_option: string | null;
  final_answer: string | null;
  traditional_solution: string | null;
  shortcut_solution: string | null;
  hints_raw: string | null;
  formulas_raw: string | null;
  mistakes_raw: string | null;
}

/** Convert the GROUP_CONCAT strings into proper arrays. */
function toDetail(row: QuestionRow): QuestionDetail {
  return QuestionDetailSchema.parse({
    ...row,
    hints: row.hints_raw ? row.hints_raw.split("||") : [],
    formulas: row.formulas_raw ? row.formulas_raw.split("||") : [],
    mistakes: row.mistakes_raw ? row.mistakes_raw.split("||") : [],
  });
}

/**
 * Full question SELECT with hints / formulas / mistakes aggregated in one
 * query — avoids N+1 round trips to the DB.
 */
const DETAIL_SELECT = `
  SELECT
    q.id,
    q.chapter_id,
    q.pattern_id,
    q.question_number,
    q.difficulty,
    q.question_text,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.correct_option,
    q.final_answer,
    q.traditional_solution,
    q.shortcut_solution,
    GROUP_CONCAT(DISTINCT qh.hint,    '||') AS hints_raw,
    GROUP_CONCAT(DISTINCT qf.formula, '||') AS formulas_raw,
    GROUP_CONCAT(DISTINCT qm.mistake, '||') AS mistakes_raw
  FROM questions q
  LEFT JOIN question_hints    qh ON qh.question_id = q.id
  LEFT JOIN question_formulas qf ON qf.question_id = q.id
  LEFT JOIN question_mistakes qm ON qm.question_id = q.id
`;

const DETAIL_GROUP = `GROUP BY q.id`;

export class QuestionRepository {
  // ── single question ───────────────────────────────────────────────────────

  async getById(id: string): Promise<QuestionDetail | null> {
    const db = sqliteService.getDB();
    const result = await db.query(
      `${DETAIL_SELECT} WHERE q.id = ? ${DETAIL_GROUP}`,
      [id],
    );
    if (!result.values?.length) return null;
    return toDetail(result.values[0] as QuestionRow);
  }

  /** Thin fetch — no hints/formulas/mistakes. For list screens. */
  async getByIdShallow(id: string): Promise<Question | null> {
    const db = sqliteService.getDB();
    const result = await db.query(`SELECT * FROM questions WHERE id = ?`, [id]);
    if (!result.values?.length) return null;
    return QuestionSchema.parse(result.values[0]);
  }

  // ── by chapter ────────────────────────────────────────────────────────────

  async getByChapter(chapterId: string): Promise<Question[]> {
    const db = sqliteService.getDB();
    const result = await db.query(
      `SELECT * FROM questions
       WHERE chapter_id = ?
       ORDER BY rowid`,
      [chapterId],
    );
    return QuestionSchema.array().parse(result.values ?? []);
  }

  async getDetailsByChapter(chapterId: string): Promise<QuestionDetail[]> {
    const db = sqliteService.getDB();
    const result = await db.query(
      `${DETAIL_SELECT}
       WHERE q.chapter_id = ?
       ${DETAIL_GROUP}
       ORDER BY q.question_number ASC`,
      [chapterId],
    );
    return (result.values ?? []).map((r) => toDetail(r as QuestionRow));
  }

  // ── by pattern ────────────────────────────────────────────────────────────

  async getByPattern(patternId: string): Promise<Question[]> {
    const db = sqliteService.getDB();
    const result = await db.query(
      `SELECT * FROM questions
       WHERE pattern_id = ?
       ORDER BY question_number ASC`,
      [patternId],
    );
    return QuestionSchema.array().parse(result.values ?? []);
  }

  async getDetailsByPattern(patternId: string): Promise<QuestionDetail[]> {
    const db = sqliteService.getDB();
    const result = await db.query(
      `${DETAIL_SELECT}
       WHERE q.pattern_id = ?
       ${DETAIL_GROUP}
       ORDER BY q.question_number ASC`,
      [patternId],
    );
    return (result.values ?? []).map((r) => toDetail(r as QuestionRow));
  }

  // ── filters ───────────────────────────────────────────────────────────────

  async getByDifficulty(
    chapterId: string,
    difficulty: Difficulty,
  ): Promise<Question[]> {
    const db = sqliteService.getDB();
    const result = await db.query(
      `SELECT * FROM questions
       WHERE chapter_id = ? AND difficulty = ?
       ORDER BY question_number ASC`,
      [chapterId, difficulty],
    );
    return QuestionSchema.array().parse(result.values ?? []);
  }

  async countByPattern(
    patternId: string,
  ): Promise<{ total: number; easy: number; medium: number; hard: number }> {
    const db = sqliteService.getDB();
    const result = await db.query(
      `SELECT
         COUNT(*) AS total,
         SUM(difficulty = 'easy')   AS easy,
         SUM(difficulty = 'medium') AS medium,
         SUM(difficulty = 'hard')   AS hard
       FROM questions
       WHERE pattern_id = ?`,
      [patternId],
    );
    const row = result.values?.[0] ?? { total: 0, easy: 0, medium: 0, hard: 0 };
    return row as { total: number; easy: number; medium: number; hard: number };
  }
}

export const questionRepository = new QuestionRepository();
