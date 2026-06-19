export default interface Question {
  id: string;
  chapter_title: string;
  question_number: string;
  pattern_doc: string;
  paraphrased_question: string;
  paraphrased_option_a: string;
  paraphrased_option_b: string;
  paraphrased_option_c: string;
  paraphrased_option_d: string;
  paraphrased_correct_option: string;
  paraphrased_final_answer: string;
  traditional_solution: string;
  shortcut_solution: string;
  chapter: string;
  diffculty: string;
  formulas_used: string;
  hints: string;
  common_mistakes: string;
}
