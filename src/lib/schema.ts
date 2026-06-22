import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// chapters
// ─────────────────────────────────────────────────────────────────────────────

export const ChapterSchema = z.object({
  id:           z.string(),   // slug: 'profit_and_loss'
  display_name: z.string(),   // 'Profit and Loss'
  number:       z.number().int().nullable(),
});

export type Chapter = z.infer<typeof ChapterSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// patterns
// ─────────────────────────────────────────────────────────────────────────────

export const PatternSchema = z.object({
  id:         z.string(),  // 'profit_and_loss__profit_loss_percent'
  chapter_id: z.string(),
  name:       z.string(),  // 'Profit Loss Percent'
});

export type Pattern = z.infer<typeof PatternSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// pattern_docs
// ─────────────────────────────────────────────────────────────────────────────

export const PatternDocSchema = z.object({
  id:         z.string(),
  chapter_id: z.string(),
  pattern_id: z.string().nullable(),
  markdown:   z.string(),
});

export type PatternDoc = z.infer<typeof PatternDocSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// questions
// ─────────────────────────────────────────────────────────────────────────────

export const DifficultySchema = z.enum(["easy", "medium", "hard"]);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const QuestionSchema = z.object({
  id:                   z.string(),
  chapter_id:           z.string(),
  pattern_id:           z.string().nullable(),
  question_number:      z.string(),
  difficulty:           DifficultySchema.nullable(),
  question_text:        z.string().nullable(),
  option_a:             z.string().nullable(),
  option_b:             z.string().nullable(),
  option_c:             z.string().nullable(),
  option_d:             z.string().nullable(),
  correct_option:       z.string().nullable(),
  final_answer:         z.string().nullable(),
  traditional_solution: z.string().nullable(),
  shortcut_solution:    z.string().nullable(),
});

export type Question = z.infer<typeof QuestionSchema>;

// A question with its hints / formulas / mistakes pre-joined
export const QuestionDetailSchema = QuestionSchema.extend({
  hints:    z.array(z.string()),
  formulas: z.array(z.string()),
  mistakes: z.array(z.string()),
});

export type QuestionDetail = z.infer<typeof QuestionDetailSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// question_hints / question_formulas / question_mistakes
// ─────────────────────────────────────────────────────────────────────────────

export const QuestionHintSchema = z.object({
  id:          z.number().int(),
  question_id: z.string(),
  hint:        z.string(),
});
export type QuestionHint = z.infer<typeof QuestionHintSchema>;

export const QuestionFormulaSchema = z.object({
  id:          z.number().int(),
  question_id: z.string(),
  formula:     z.string(),
});
export type QuestionFormula = z.infer<typeof QuestionFormulaSchema>;

export const QuestionMistakeSchema = z.object({
  id:          z.number().int(),
  question_id: z.string(),
  mistake:     z.string(),
});
export type QuestionMistake = z.infer<typeof QuestionMistakeSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// chapter_resources
// ─────────────────────────────────────────────────────────────────────────────

export const ResourceTypeSchema = z.enum(["cheatsheet", "overview"]);
export type ResourceType = z.infer<typeof ResourceTypeSchema>;

export const ChapterResourceSchema = z.object({
  id:            z.number().int(),
  chapter_id:    z.string(),
  resource_type: ResourceTypeSchema,
  markdown:      z.string(),
});

export type ChapterResource = z.infer<typeof ChapterResourceSchema>;
