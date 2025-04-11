import { AdvanceCounterButton, ShowCounter } from "./CountInternals";

export default function App() {
  return (
    <div>
      <h1>Counter Demo</h1>
      <ShowCounter />
      <AdvanceCounterButton />
    </div>
  );
}
