import { signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";

const counter = signal(["hello"]);

function increment_counter() {
  // counter.value.push("<");

  counter.value = [...counter.value, "9"];
  // counter.value.push(">");

  console.log(`increment_counter ${counter.value}`);
}

function Counter_value() {
  useSignals();
  console.log(`counter_value ${counter.value}`);
  return counter.value;
}
// counter_value();

function ShowCounter() {
  // useSignals();
  return <pre>{JSON.stringify(Counter_value())}</pre>;
  return <pre>{JSON.stringify(counter.value, null, 2)}</pre>;
}

function AdvanceCounterButton() {
  // useSignals();
  return <button onClick={increment_counter}> : Add One</button>;
}

export { ShowCounter, AdvanceCounterButton };
