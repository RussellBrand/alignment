import CollapsibleSection from "./CollapsibleSection";

function OverviewBody() {
  return (
    <div className="overview">
      <p>
        {" "}
        The Partnership Alignment Test assses how well two potential partners
        share the same views and values.{" "}
      </p>
      <p>
        {" "}
        Each partner is given a series of questions with ordered values as
        potential answers.
      </p>
      For example,
      <ul>
        <li>"always", "often", "sometimes", "rarely", "never" </li>
        <li>
          "half a million", "one million", "five million", "fifty million",
          "more than fifty million", "not at any price"
        </li>
      </ul>
      <CollapsibleSection title="Scoring">
        <p>
          {" "}
          If the users select the same answer, they get 100% on that question.{" "}
        </p>
        <p>
          {" "}
          If they select answers at the opposite ends of the scale, they get 0%.
        </p>

        <p>
          If there are N choices, and they are one apart, they get ((N-2)/(N-1)) *
          100%.
        </p>

	<p>
          If there are N choices, and they are D apart, they get ((N-D)/(N-1)) * 100%.
        </p>


	<p>
          If there are N choices, and they are one apart, they get ((N-2)/(N-1)) *
          100%, etc.
        </p>



        <p>

          For example, if there are 5 choices, and they are one apart, they get
          75%; two apart, 50%
        </p>
        <p>
          {" "}
          The Final is score is the (potentially weighted average over all the
          questions.
        </p>
      </CollapsibleSection>
    </div>
	  );
}

    function Overview() {
  return (
    <CollapsibleSection title="Overview">
      <OverviewBody />
    </CollapsibleSection>
  );
}

export default Overview;
