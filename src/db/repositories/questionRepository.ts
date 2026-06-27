import {
  QuestionSchema,
  QuestionDetailSchema,
  type Question,
  type QuestionDetail,
  type Difficulty,
} from "@/lib/schema";
import sqliteService from "@/db/sqliteService";
import { dbCache } from "@/lib/db-cache";

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
 * Full question SELECT with hints / formulas / mistakes aggregated via
 * correlated subqueries — NOT a multi-table LEFT JOIN. A 3-way join here
 * would fan out (e.g. 3 hints × 1 formula × 3 mistakes = 9 joined rows),
 * duplicating every value before GROUP_CONCAT even runs. Subqueries
 * aggregate each child table independently, so counts stay correct
 * regardless of how many hints/formulas/mistakes a question has.
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
    (SELECT GROUP_CONCAT(hint,    '||') FROM question_hints    WHERE question_id = q.id) AS hints_raw,
    (SELECT GROUP_CONCAT(formula, '||') FROM question_formulas WHERE question_id = q.id) AS formulas_raw,
    (SELECT GROUP_CONCAT(mistake, '||') FROM question_mistakes WHERE question_id = q.id) AS mistakes_raw
  FROM questions q
`;

/**
 * `question_number` is stored as TEXT (it occasionally has non-numeric
 * suffixes like "12a"), so a plain `ORDER BY question_number ASC` sorts
 * lexicographically — "10" comes before "2". CAST-ing to INTEGER for the
 * primary sort fixes that for the common case, with the raw text as a
 * tie-breaker so "12" sorts before "12a" when both cast to 12.
 */
const NUMERIC_ORDER = `CAST(question_number AS INTEGER) ASC, question_number ASC`;
const NUMERIC_ORDER_Q = `CAST(q.question_number AS INTEGER) ASC, q.question_number ASC`;

export class QuestionRepository {
  // ── single question ───────────────────────────────────────────────────────

  async getById(id: string): Promise<QuestionDetail | null> {
    return dbCache.get(`questions:detail:${id}`, async () => {
      const db = sqliteService.getDB();
      const result = await db.query(
        `${DETAIL_SELECT} WHERE q.id = ?`,
        [id],
      );
      if (!result.values?.length) return null;
      return toDetail(result.values[0] as QuestionRow);
    });
  }

  /** Thin fetch — no hints/formulas/mistakes. For list screens. */
  async getByIdShallow(id: string): Promise<Question | null> {
    return dbCache.get(`questions:shallow:${id}`, async () => {
      const db = sqliteService.getDB();
      const result = await db.query(`SELECT * FROM questions WHERE id = ?`, [id]);
      if (!result.values?.length) return null;
      return QuestionSchema.parse(result.values[0]);
    });
  }

  /**
   * Hints / formulas / mistakes only — the question's own columns
   * (text, solutions) are already on hand from the list query, so the
   * drawer only needs this much smaller follow-up fetch.
   */
  async getExtrasById(
    id: string,
  ): Promise<{ hints: string[]; formulas: string[]; mistakes: string[] }> {
    return dbCache.get(`questions:extras:${id}`, async () => {
      const db = sqliteService.getDB();
      const result = await db.query(
        `SELECT
           (SELECT GROUP_CONCAT(hint,    '||') FROM question_hints    WHERE question_id = ?) AS hints_raw,
           (SELECT GROUP_CONCAT(formula, '||') FROM question_formulas WHERE question_id = ?) AS formulas_raw,
           (SELECT GROUP_CONCAT(mistake, '||') FROM question_mistakes WHERE question_id = ?) AS mistakes_raw`,
        [id, id, id],
      );
      const row = result.values?.[0] as
        | { hints_raw: string | null; formulas_raw: string | null; mistakes_raw: string | null }
        | undefined;
      return {
        hints: row?.hints_raw ? row.hints_raw.split("||") : [],
        formulas: row?.formulas_raw ? row.formulas_raw.split("||") : [],
        mistakes: row?.mistakes_raw ? row.mistakes_raw.split("||") : [],
      };
    });
  }

  // ── by chapter ────────────────────────────────────────────────────────────

  async getByChapter(chapterId: string): Promise<Question[]> {
    return dbCache.get(`questions:chapter:${chapterId}`, async () => {
      const db = sqliteService.getDB();
      const result = await db.query(
        `SELECT * FROM questions
         WHERE chapter_id = ?
         ORDER BY ${NUMERIC_ORDER}`,
        [chapterId],
      );
      return QuestionSchema.array().parse(result.values ?? []);
    });
  }

  async getDetailsByChapter(chapterId: string): Promise<QuestionDetail[]> {
    return dbCache.get(`questions:details:chapter:${chapterId}`, async () => {
      const db = sqliteService.getDB();
      const result = await db.query(
        `${DETAIL_SELECT}
         WHERE q.chapter_id = ?
         ORDER BY ${NUMERIC_ORDER_Q}`,
        [chapterId],
      );
      return (result.values ?? []).map((r) => toDetail(r as QuestionRow));
    });
  }

  // ── by pattern ────────────────────────────────────────────────────────────

  async getByPattern(patternId: string): Promise<Question[]> {
    return dbCache.get(`questions:pattern:${patternId}`, async () => {
      const db = sqliteService.getDB();
      const result = await db.query(
        `SELECT * FROM questions
         WHERE pattern_id = ?
         ORDER BY ${NUMERIC_ORDER}`,
        [patternId],
      );
      return QuestionSchema.array().parse(result.values ?? []);
    });
  }

  async getDetailsByPattern(patternId: string): Promise<QuestionDetail[]> {
    return dbCache.get(`questions:details:pattern:${patternId}`, async () => {
      const db = sqliteService.getDB();
      const result = await db.query(
        `${DETAIL_SELECT}
         WHERE q.pattern_id = ?
         ORDER BY ${NUMERIC_ORDER_Q}`,
        [patternId],
      );
      return (result.values ?? []).map((r) => toDetail(r as QuestionRow));
    });
  }

  // ── filters ───────────────────────────────────────────────────────────────

  async getByDifficulty(
    chapterId: string,
    difficulty: Difficulty,
  ): Promise<Question[]> {
    return dbCache.get(`questions:difficulty:${chapterId}:${difficulty}`, async () => {
      const db = sqliteService.getDB();
      const result = await db.query(
        `SELECT * FROM questions
         WHERE chapter_id = ? AND difficulty = ?
         ORDER BY ${NUMERIC_ORDER}`,
        [chapterId, difficulty],
      );
      return QuestionSchema.array().parse(result.values ?? []);
    });
  }

  async countByPattern(
    patternId: string,
  ): Promise<{ total: number; easy: number; medium: number; hard: number }> {
    return dbCache.get(`questions:count:pattern:${patternId}`, async () => {
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
    });
  }
}

export const questionRepository = new QuestionRepository();
