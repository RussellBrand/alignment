import { make_id } from "./make_id";

export type ANSWER = string & {
  __brand: "Answer";
};

export type BLANK_QUESTION_ID = string & { _brand: "BlankQuestionId" };

export type BLANK_QUESTION = {
  _id: BLANK_QUESTION_ID;
  question: string;
  answers: ANSWER[];
} & { _brand: "BlankQuestion" };

export const frequency_list: ANSWER[] = [
  "never",
  "almost never",
  "very rarely",
  "rarely",
  "ocassionally",
  "sometimes",
  "frequently",
  "very frequently",
  "routinely",
] as ANSWER[];

export const millions_list: ANSWER[] = [
  "quarter",
  "half",
  "one",
  "five",
  "twenty-five",
  "fifty",
  "one-hundred",
  "two-hundred fifty",
  "much more",
  "never",
] as ANSWER[];

function make_by_millions_questions(question_text: string): BLANK_QUESTION {
  return make_question(question_text, millions_list);
}

function make_frequency_question(question_text: string): BLANK_QUESTION {
  return make_question(question_text, frequency_list);
}

function make_question(question: string, answers: ANSWER[]): BLANK_QUESTION {
  const _id = make_id();
  return { _id, question, answers } as BLANK_QUESTION;
}

export const risk_blankquestions: BLANK_QUESTION[] = [
  make_frequency_question("how often is it OK to lie to our customers"),
  make_frequency_question("how often is it OK to be late with a deliverable"),
  make_by_millions_questions(
    "how many millions would you need to offered to be comfortable selling the business"
  ),
];
