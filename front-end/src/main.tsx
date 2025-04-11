import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import App from "./App.tsx";
// import App from './components/RoutingSample.tsx'
// import App from "./components/CountDemo.tsx";
import App from "./components/QuizDemo.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
