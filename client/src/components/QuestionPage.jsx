import React, { useState, useEffect } from "react";
import { Link, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Swal from "sweetalert2";
import quizDataRaw from "./questions.json";
import "../css/quesionPages.css";

// Utility to shuffle an array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const QuestionPage = () => {
  const [quizData, setQuizData] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [nextButtonLabel, setNextButtonLabel] = useState("Next");
  const navigate = useNavigate();

  useEffect(() => {
    const shuffled = shuffleArray(quizDataRaw);
    setQuizData(shuffled);
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !showResult) {
      const timerId = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0 && !showResult) {
      handleSubmit(); // Submit if time runs out
    }
  }, [timeLeft, showResult]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentQuestionIndex]);

  const handleOptionSelect = (option) => {
    const updatedAnswers = {
      ...userAnswers,
      [currentQuestionIndex]: option,
    };
    setUserAnswers(updatedAnswers);

    setNextButtonLabel(
      currentQuestionIndex === quizData.length - 1 ? "Submit" : "Next"
    );
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizData.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setNextButtonLabel("Next");
    } else {
      Swal.fire({
        title: "Are you sure you want to submit?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Submit!",
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Submited!",
            text: "Your Score has been saved.",
            icon: "success",
          });
          handleSubmit();
        }
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      setNextButtonLabel("Next");
    }
  };

  const restartQuiz = () => {
    navigate("/");
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const handleSubmit = async () => {
    const score = Object.keys(userAnswers).reduce((acc, key) => {
      const question = quizData[key];
      const selected = userAnswers[key];
      return selected === question.answer ? acc + 1 : acc;
    }, 0);

    let neededId = localStorage.getItem("std_id");

    // If it starts and ends with quotes, strip them
    if (neededId?.startsWith('"') && neededId.endsWith('"')) {
      neededId = neededId.slice(1, -1);
    }

    const payload = {
      id: neededId,
      score,
      total: quizData.length,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch(
        "http://localhost:8000/api/v1/students/submit-score",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        console.log("Score submitted successfully");
      } else {
        console.error("Failed to submit score");
      }
    } catch (error) {
      console.error("Error submitting score:", error);
    } finally {
      setShowResult(true);
    }
  };

  const currentQuestion = quizData[currentQuestionIndex];
  const selectedOption = userAnswers[currentQuestionIndex] || null;

  // Score is recalculated on result screen
  const score = Object.keys(userAnswers).reduce((acc, key) => {
    const question = quizData[key];
    const selected = userAnswers[key];
    return selected === question.answer ? acc + 1 : acc;
  }, 0);

  return (
    <div className="body">
      <div className="Qcontainer">
        <h1>Robotics Assessment</h1>

        {!showResult && (
          <div className="timer">Time Left: {formatTime(timeLeft)}</div>
        )}

        {!showResult ? (
          <div id="quiz-container">
            {currentQuestion && (
              <>
                <div className="question-container">
                  <div id="question" className="question">
                    <h2>{currentQuestion.question}</h2>
                  </div>
                  <div className="option-container">
                    <div className="options">
                      <div id="options">
                        {currentQuestion.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => handleOptionSelect(option)}
                            className={`option ${
                              selectedOption === option ? "selected" : ""
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      <div className="navigation-buttons">
                        <button
                          id="previous-button"
                          onClick={handlePrevious}
                          disabled={currentQuestionIndex === 0}
                          className="prevOption"
                        >
                          Previous
                        </button>
                        <button
                          id="next-button"
                          onClick={handleNext}
                          disabled={!selectedOption}
                          className="nextOption"
                        >
                          {nextButtonLabel}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="question-numbers">
              {quizData.map((_, index) => {
                const isCurrent = currentQuestionIndex === index;
                const isAnswered = userAnswers.hasOwnProperty(index);

                let statusClass = "";
                if (isCurrent) {
                  statusClass = "current";
                } else if (isAnswered) {
                  statusClass = "answered";
                } else {
                  statusClass = "unanswered";
                }

                return (
                  <button
                    key={index}
                    className={`question-number ${statusClass}`}
                    onClick={() => {
                      setCurrentQuestionIndex(index);
                      setNextButtonLabel(
                        index === quizData.length - 1 ? "Submit" : "Next"
                      );
                    }}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div id="result">
            <h2>Thank you for taking the assessment</h2>
            <button
              id="restart-button"
              onClick={restartQuiz}
              className="option"
            >
              Go to Homepage
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionPage;
