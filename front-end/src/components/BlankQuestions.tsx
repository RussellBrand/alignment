import {
  BLANK_QUESTION,
  risk_blankquestions,
} from "../data/blankquestion_data";
import CollapsibleSection from "./CollapsibleSection";

export function BlankQuestionsBody({
  blankquestions,
}: {
  blankquestions: BLANK_QUESTION[];
}) {
  return <pre>{JSON.stringify(blankquestions, null, 2)}</pre>;
}

export default function BlankQuestions() {
  const title = `${risk_blankquestions.length} Blank Questions`;
  return (
    <CollapsibleSection title={title}>
      <BlankQuestionsBody blankquestions={risk_blankquestions} />
    </CollapsibleSection>
  );
}
