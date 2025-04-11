import { BLANK_QUESTION, risk_blankquestions } from "./blankquestion_data";
import { make_id } from "./make_id";

type BLANK_TEST_ID = string & { _brand: "BlankTestId" };

export type BLANK_TEST = {
  _id: BLANK_TEST_ID;
  name: string;
  questions: BLANK_QUESTION["_id"][];
} & { _brand: "BlankTest" };

export const risk_alignment_blanktest: BLANK_TEST = make_blanktest(
  "Risk Aligment Test",
  risk_blankquestions
);

export function make_blanktest(name: string, questions: BLANK_QUESTION[]) {
  const _id = make_id(name);
  return { _id, name, questions: questions.map((q) => q._id) } as BLANK_TEST;
}
