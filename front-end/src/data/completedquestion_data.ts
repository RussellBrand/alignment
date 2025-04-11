import {
  ANSWER,
  BLANK_QUESTION_ID,
  risk_blankquestions,
} from "./blankquestion_data";
import { make_id } from "./make_id";
import { leo, linda, robert, sally, USER_ID } from "./user_data";

type COMPLETED_QUESTION_ID = string & { _brand: "CompletedQuestionId" };

export type COMPLETED_QUESTION = {
  _id: COMPLETED_QUESTION_ID;
  question_id: BLANK_QUESTION_ID;
  user_id: USER_ID;
  answer: ANSWER;
} & { _brand: "CompletedQuestion" };

export const completed_questions: COMPLETED_QUESTION[] = [];

export function make_completed_question(
  question_id: BLANK_QUESTION_ID,
  user_id: USER_ID,
  answer: ANSWER
): COMPLETED_QUESTION {
  const _id = make_id("com_question") as COMPLETED_QUESTION_ID;
  return { _id, question_id, user_id, answer } as COMPLETED_QUESTION;
}

export function add_completed_question(
  question_id: BLANK_QUESTION_ID,
  user_id: USER_ID,
  answer: ANSWER
): COMPLETED_QUESTION {
  const completed_question = make_completed_question(
    question_id,
    user_id,
    answer
  );
  completed_questions.push(completed_question);
  return completed_question;
}

function complete_the_questions() {
  completed_questions.length = 0;

  risk_blankquestions.forEach((blank_question) => {
    add_completed_question(
      blank_question._id,
      leo._id,
      blank_question.answers[0]
    );
    add_completed_question(
      blank_question._id,
      linda._id,
      blank_question.answers[0]
    );
    add_completed_question(
      blank_question._id,
      sally._id,
      blank_question.answers[1]
    );
    add_completed_question(
      blank_question._id,
      robert._id,
      blank_question.answers[blank_question.answers.length - 1]
    );
  });
}
complete_the_questions();
