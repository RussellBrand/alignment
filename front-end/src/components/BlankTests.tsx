import { risk_alignment_blanktest } from "../data/blanktest_data";
import CollapsibleSection from "./CollapsibleSection";

export function BlankTestsBody() {
  return (
    <>
      <pre>{JSON.stringify(risk_alignment_blanktest, null, 2)}</pre>
    </>
  );
}
export default function BlankTests() {
  const title = `${risk_alignment_blanktest.name}`;
  return (
    <CollapsibleSection title={title}>
      <BlankTestsBody />
    </CollapsibleSection>
  );
}
