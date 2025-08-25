import { useState, useEffect } from "react";
import { getQuizzes } from "../services/firestore";
import QuizCard from "../components/QuizCard";
import "../styles/Home.css";
import type { Quiz } from "../services/firestore";

function Home() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    async function fetchQuizzes() {
      try {
        const quizData = await getQuizzes();
        setQuizzes(quizData);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, []);

  return (
    <div className="home-container">
      <header>
        <h1>School Monthly Quiz Answers</h1>
        <p>Select a month to view quiz questions and answers</p>
      </header>

      <div className="content">
        <div className="quiz-list">
          {loading ? (
            <p>Loading quizzes...</p>
          ) : quizzes.length === 0 ? (
            <p>No quizzes available yet.</p>
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className={`quiz-item ${
                  selectedQuiz?.id === quiz.id ? "selected" : ""
                }`}
                onClick={() => setSelectedQuiz(quiz)}
              >
                <h3>{quiz.title}</h3>
                <p>
                  {quiz.month} {quiz.year}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="quiz-details">
          {selectedQuiz ? (
            <QuizCard quiz={selectedQuiz} />
          ) : (
            <p className="select-prompt">Please select a quiz from the list</p>
          )}
        </div>
      </div>
      <footer id="footer">
        Developed By
        <br />
        <a href="https://www.linkedin.com/in/aathishrviswam">
          Aathish R Viswam
        </a>
      </footer>
    </div>
  );
}

export default Home;
