import CollapsibleSection from "./CollapsibleSection";
import {
  COMPLETED_QUESTION,
  completed_questions,
} from "../data/completedquestion_data";

export function CompletedQuestionsBody({
  questions,
}: {
  questions: COMPLETED_QUESTION[];
}) {
  return (
    <>
      <pre>{JSON.stringify(questions, null, 2)}</pre>
    </>
  );
}

export default function CompletedQuestions() {
  const title = `${completed_questions.length} Completed Questions`;
  return (
    <CollapsibleSection title={title}>
      <CompletedQuestionsBody questions={completed_questions} />
    </CollapsibleSection>
  );
}
