// Install dependencies: npm install react-router-dom

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

const questions = [
  { id: 1, question: "What is React?", options: ["Library", "Framework", "Language", "Tool"], answer: "Library" },
  { id: 2, question: "What is JSX?", options: ["JavaScript", "XML", "HTML", "Syntax Extension"], answer: "Syntax Extension" },

];

const Home = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h1>Welcome to the Quiz</h1>
      <button onClick={() => navigate("/quiz/1")}>Start Quiz</button>
    </div>
  );
};

const Question = ({ question, currentIndex, totalQuestions, onNext, onBack }) => {
  const [selectedOption, setSelectedOption] = useState(null);

  return (
    <div>
      <h2>Question {currentIndex + 1}</h2>
      <p>{question.question}</p>
      <div>
        {question.options.map((option, index) => (
          <button
            key={index}
            style={{
              margin: "5px",
              backgroundColor: selectedOption === option ? "#ddd" : "#fff",
            }}
            onClick={() => setSelectedOption(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div style={{ marginTop: "20px" }}>
        <button onClick={onBack} disabled={currentIndex === 0}>
          Back
        </button>
        <button
          onClick={() => onNext(selectedOption)}
          disabled={!selectedOption}
        >
          {currentIndex === totalQuestions - 1 ? "Submit" : "Next"}
        </button>
      </div>
    </div>
  );
};

const Quiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const navigate = useNavigate();

  const handleNext = (selectedOption) => {
    if (currentQuestionIndex === questions.length - 1) {
      navigate("/result");
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentQuestionIndex((prev) => prev - 1);
  };

  return (
    <Question
      question={questions[currentQuestionIndex]}
      currentIndex={currentQuestionIndex}
      totalQuestions={questions.length}
      onNext={handleNext}
      onBack={handleBack}
    />
  );
};

const Result = () => {
  return (
    <div>
      <h1>Quiz Completed!</h1>
      <p>Your results will be displayed here.</p>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </Router>
  );
};

export default App;
