import { Word } from './types';

export const EXPLAIN_ACTIONS = [
  'simple',
  'examples',
  'natural_usage',
  'quiz',
  'check_sentence',
  'compare',
  'compare_suggestions',
] as const;

export type ExplainAction = (typeof EXPLAIN_ACTIONS)[number];

export type ExplainActionInput = {
  userSentence?: string | null;
  compareWord?: string | null;
};

export type ExplainRequestOptions = ExplainActionInput & {
  action?: ExplainAction;
  forceRefresh?: boolean;
};

export type ExplainPromptInput = ExplainActionInput & {
  action: ExplainAction;
  word: string;
  partOfSpeech: string;
  meaning: string;
  example: string;
  language: string;
};

export type SimpleExplanation = {
  type: 'simple';
  mainMeaning: string;
  usage: string;
  example: string;
  exampleMeaning: string;
  shortMeaning?: string;
};

export type ExamplesExplanation = {
  type: 'examples';
  examples: {
    sentence: string;
    meaning: string;
  }[];
};

export type NaturalUsageExplanation = {
  type: 'natural_usage';
  collocations: string[];
  patterns: string[];
  situations: string[];
  commonMistake: string;
};

export type QuizExplanation = {
  type: 'quiz';
  questions: {
    kind: 'multiple_choice' | 'fill_blank' | 'correction';
    question: string;
    options?: string[];
    answer: string;
    explanation: string;
  }[];
};

export type CheckSentenceExplanation = {
  type: 'check_sentence';
  isCorrect: boolean;
  correctedSentence?: string;
  explanation: string;
  naturalVersion?: string;
};

export type CompareExplanation = {
  type: 'compare';
  compareWord: string;
  meaningDifference: string;
  usageDifference: string;
  examples: {
    word: string;
    sentence: string;
    meaning: string;
  }[];
  rule: string;
};

export type CompareSuggestionsExplanation = {
  type: 'compare_suggestions';
  suggestions: {
    word: string;
    reason: string;
  }[];
};

export type RawExplanation = {
  type: 'raw';
  text: string;
};

export type AiExplanation =
  | SimpleExplanation
  | ExamplesExplanation
  | NaturalUsageExplanation
  | QuizExplanation
  | CheckSentenceExplanation
  | CompareExplanation
  | CompareSuggestionsExplanation
  | RawExplanation;

export const DEFAULT_EXPLAIN_ACTION: ExplainAction = 'simple';

export function isExplainAction(value: unknown): value is ExplainAction {
  return (
    typeof value === 'string' &&
    (EXPLAIN_ACTIONS as readonly string[]).includes(value)
  );
}

export function normalizeExplainAction(value: unknown): ExplainAction {
  return isExplainAction(value) ? value : DEFAULT_EXPLAIN_ACTION;
}

export function needsExplainActionInput(action: ExplainAction) {
  return action === 'check_sentence' || action === 'compare';
}

export function getExplainActionInput(
  action: ExplainAction,
  input: ExplainActionInput = {},
) {
  return {
    userSentence: action === 'check_sentence' ? input.userSentence?.trim() ?? '' : '',
    compareWord: action === 'compare' ? input.compareWord?.trim() ?? '' : '',
  };
}

export function getExplainCacheKey(
  wordId: string,
  language: string = 'en',
  options: ExplainRequestOptions = {},
) {
  const action = normalizeExplainAction(options.action);
  const { userSentence, compareWord } = getExplainActionInput(action, options);

  return [
    language,
    wordId,
    action,
    encodeURIComponent(userSentence),
    encodeURIComponent(compareWord),
  ].join(':');
}

export function parseExplainCacheKey(key: string) {
  const [language = 'en', wordId = '', action = DEFAULT_EXPLAIN_ACTION] =
    key.split(':');

  return {
    language,
    wordId,
    action: normalizeExplainAction(action),
  };
}

export function buildExplainRequestBody(
  word: Word,
  language: string,
  options: ExplainRequestOptions = {},
) {
  const action = normalizeExplainAction(options.action);
  const actionInput = getExplainActionInput(action, options);

  return {
    word: word.word,
    partOfSpeech: word.partOfSpeech,
    meaning: word.meaning,
    example: word.example,
    exampleMeaning: word.exampleMeaning,
    language,
    action,
    forceRefresh: options.forceRefresh === true,
    ...actionInput,
  };
}

export function getExplainMaxTokens(action: ExplainAction) {
  return action === 'simple' ? 700 : 1100;
}

function getJsonSchemaInstruction(action: ExplainAction) {
  const schemas: Record<ExplainAction, string> = {
    simple: `{
  "type": "simple",
  "mainMeaning": "string",
  "usage": "string",
  "example": "string",
  "exampleMeaning": "string",
  "shortMeaning": "string"
}`,
    examples: `{
  "type": "examples",
  "examples": [
    { "sentence": "string", "meaning": "string" }
  ]
}`,
    natural_usage: `{
  "type": "natural_usage",
  "collocations": ["string"],
  "patterns": ["string"],
  "situations": ["string"],
  "commonMistake": "string"
}`,
    quiz: `{
  "type": "quiz",
  "questions": [
    {
      "kind": "multiple_choice",
      "question": "string",
      "options": ["string"],
      "answer": "string",
      "explanation": "string"
    },
    {
      "kind": "fill_blank",
      "question": "string",
      "options": ["string"],
      "answer": "string",
      "explanation": "string"
    },
    {
      "kind": "correction",
      "question": "string",
      "options": ["string"],
      "answer": "string",
      "explanation": "string"
    }
  ]
}`,
    check_sentence: `{
  "type": "check_sentence",
  "isCorrect": true,
  "correctedSentence": "string",
  "explanation": "string",
  "naturalVersion": "string"
}`,
    compare: `{
  "type": "compare",
  "compareWord": "string",
  "meaningDifference": "string",
  "usageDifference": "string",
  "examples": [
    { "word": "string", "sentence": "string", "meaning": "string" }
  ],
  "rule": "string"
}`,
    compare_suggestions: `{
  "type": "compare_suggestions",
  "suggestions": [
    { "word": "string", "reason": "string" }
  ]
}`,
  };

  return `
Return JSON only. Do not use markdown. Do not wrap the JSON in code fences.
Use exactly this JSON shape:
${schemas[action]}
`;
}

export function buildExplainPrompt({
  action,
  word,
  partOfSpeech,
  meaning,
  example,
  userSentence,
  compareWord,
  language,
}: ExplainPromptInput) {
  const isVietnamese = language === 'vi';
  const responseLanguage = isVietnamese ? 'Vietnamese' : 'English';

  const baseContext = `
Word: ${word}
Part of speech: ${partOfSpeech}
Definition: ${meaning}
Original example: "${example}"
Learner level: intermediate English learner
Response language: ${responseLanguage}
`;

  const commonRules = `
Rules:
- Use simple, natural language.
- Do not use complex grammar terms unless necessary.
- Do not repeat the original example unless needed.
- Keep the answer practical for real-life usage.
- If responding in Vietnamese, explain clearly in Vietnamese but keep English examples in English.
- Keep English example sentences in English.
- Do not use Chinese, Japanese, Korean, or other non-English/non-Vietnamese characters.
${getJsonSchemaInstruction(action)}
`;

  const prompts: Record<ExplainAction, string> = {
    simple: `
${baseContext}

Task:
Explain this word simply.

Your answer should include:
1. The main meaning of the word.
2. How people usually use it in real life.
3. One new example sentence.
4. A short Vietnamese meaning if response language is Vietnamese.

${commonRules}
`,

    examples: `
${baseContext}

Task:
Give more example sentences using this word.

Your answer should include:
1. 5 natural example sentences.
2. Each example must be different from the original example.
3. Include a short meaning or translation for each example.
4. Use common daily-life situations.

${commonRules}
`,

    natural_usage: `
${baseContext}

Task:
Explain how to use this word naturally.

Your answer should include:
1. Common word combinations or collocations.
2. Common sentence patterns.
3. Situations where native speakers often use this word.
4. One common mistake learners should avoid.

${commonRules}
`,

    quiz: `
${baseContext}

Task:
Create a short quiz for this word.

Your answer should include:
1. 3 questions only.
2. Mix question types: multiple choice, fill in the blank, and sentence correction.
3. Every question must include 3 answer options.
4. The answer field must exactly match one string from options.
5. Briefly explain why the answer is correct.

${commonRules}
`,

    check_sentence: `
${baseContext}

User sentence:
"${userSentence || ''}"

Task:
Check the user's sentence using this word.

Your answer should include:
1. Say whether the sentence is correct or incorrect.
2. If incorrect, provide the corrected sentence.
3. Explain the mistake simply.
4. Give one more natural version if possible.

${commonRules}
`,

    compare: `
${baseContext}

Word to compare with:
"${compareWord || ''}"

Task:
Compare the main word with the similar word.

Your answer should include:
1. The difference in meaning.
2. The difference in usage.
3. One example for each word.
4. A simple rule to help learners choose the right word.

${commonRules}
`,
    compare_suggestions: `
${baseContext}

Task:
Suggest similar or easily confused words that are useful to compare with the main word.

Your answer should include:
1. 4 short word suggestions only.
2. Each suggestion should be a single English word or short phrase.
3. A short reason explaining why learners may confuse it with the main word.
4. Avoid obscure words.

${commonRules}
`,
  };

  return prompts[action];
}
