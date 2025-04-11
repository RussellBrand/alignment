import CollapsibleSection from "./CollapsibleSection";
import { USER, users } from "../data/user_data";
import { JSX } from "react";
import {
  ANSWER,
  BLANK_QUESTION,
  risk_blankquestions,
} from "../data/blankquestion_data";
import { completed_questions } from "../data/completedquestion_data";

type PAIR = [USER, USER];
export function ComparisonsBody() {
  const pairs: PAIR[] = [];

  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      pairs.push([users[i], users[j]]);
    }
  }
  return (
    <div>
      <ul>
        {pairs.map((pair, idx) => (
          <Pair key={idx} user1={pair[0]} user2={pair[1]} />
        ))}
      </ul>
    </div>
  );
}

function Pair({ user1, user2 }: { user1: USER; user2: USER }): JSX.Element {
  const q_a_a: ([BLANK_QUESTION, ANSWER, ANSWER] | undefined)[] =
    risk_blankquestions.map((q) => {
      const user1_answer = completed_questions.find(
        (c) => c.question_id === q._id && c.user_id === user1._id
      );
      const user2_answer = completed_questions.find(
        (c) => c.question_id === q._id && c.user_id === user2._id
      );
      if (user1_answer && user2_answer) {
        return [q, user1_answer.answer, user2_answer.answer];
      }
      return undefined;
    });

  const filtered_q_a_a: [BLANK_QUESTION, ANSWER, ANSWER][] = q_a_a.filter(
    (q) => q !== undefined
  ) as [BLANK_QUESTION, ANSWER, ANSWER][];

  return (
    <li>
      <h3>
        {user1.name} ({user1.description}) ----- {user2.name}(
        {user2.description})
      </h3>
      {filtered_q_a_a.length === 0 ? (
        "No questions answered in common"
      ) : (
        // filtered_q_a_a.map((q_a_a) => <QQA qqa={q_a_a[0]} />)
        <>
          <h4 className={score_to_class(score_many(filtered_q_a_a))}>
            total {Math.round(score_many(filtered_q_a_a))} %{" "}
          </h4>
          <MANY_QQA
            many_qqa={filtered_q_a_a}
            user1name={user1.name}
            user2name={user2.name}
          />
        </>
      )}
    </li>
  );
}

function MANY_QQA({
  many_qqa,
  user1name,
  user2name,
}: {
  user1name: string;
  user2name: string;
  many_qqa: [BLANK_QUESTION, ANSWER, ANSWER][];
}): JSX.Element {
  return (
    <ul>
      {many_qqa.map((qqa, index) => (
        <QQA
          key={index}
          qqa={qqa}
          user1name={user1name}
          user2name={user2name}
        />
      ))}
    </ul>
  );
}

function QQA({
  user1name,
  user2name,
  qqa,
}: {
  user1name: string;
  user2name: string;
  qqa: [BLANK_QUESTION, ANSWER, ANSWER];
}): JSX.Element {
  const [q, a1, a2] = qqa;
  const score = score_answers(a1, a2, q);
  const score_class = score_to_class(score);
  return (
    <li>
      <h4 className={score_class}>
        {Math.round(score)}% {q.question}
      </h4>
      <ul>
        <li>
          <b>{user1name}:</b> {a1}
        </li>
        <li>
          <b>{user2name}:</b> {a2}
        </li>
      </ul>
    </li>
  );
}

function score_to_class(score: number): string {
  if (score === 100) {
    return "score100";
  }
  if (score === 0) {
    return "score0";
  }
  return "scoremiddle";
}

function score_many(many_qqa: [BLANK_QUESTION, ANSWER, ANSWER][]): number {
  const scores = many_qqa.map((qqa) => {
    const [q, a1, a2] = qqa;
    return score_answers(a1, a2, q);
  });
  const total = scores.reduce((acc, score) => acc + score, 0);
  return total / scores.length;
}

function score_answers(a1: ANSWER, a2: ANSWER, q: BLANK_QUESTION): number {
  const n = q.answers.length;
  const i1 = q.answers.indexOf(a1);
  const i2 = q.answers.indexOf(a2);
  if (i1 === -1 || i2 === -1) {
    return -1;
  }
  if (i1 === i2) {
    return 100;
  }
  const d = Math.abs(i1 - i2);
  return ((n - 1 - d) / (n - 1)) * 100;
}

export default function Comparisons() {
  return (
    <CollapsibleSection title="Comparisons">
      <ComparisonsBody />
    </CollapsibleSection>
  );
}
