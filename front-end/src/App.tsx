// import { useState } from 'react'

import BlankQuestions from "./components/BlankQuestions";
import BlankTests from "./components/BlankTests";
import Comparisons from "./components/Comparisons";
import CompletedQuestions from "./components/CompletedQuestions";
import CompletedTests from "./components/CompletedTests";
import Overview from "./components/Overview";
import Users from "./components/Users";

function App() {
  return (
    <>
      <div>
        <h1>Partnership Alignment Tester</h1>
      </div>
      <Overview />
      <Users />
      <BlankTests />
      <BlankQuestions />
      <CompletedQuestions /> <CompletedTests />
      <Comparisons />
    </>
  );
}

export default App;
