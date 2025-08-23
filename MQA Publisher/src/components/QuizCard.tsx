import type { Quiz } from "../services/firestore";
import "../styles/QuizCard.css";

function QuizCard({ quiz }: { quiz: Quiz }) {
  return (
    <div className="quiz-card">
      <div className="quiz-header">
        <h2>{quiz.title}</h2>
        <p className="quiz-date">
          {quiz.month} {quiz.year}
        </p>
      </div>

      <div className="quiz-content">
        {quiz.questions.map((question) => (
          <div key={question.id} className="question-answer">
            <div className="question">
              <span className="question-number">{question.id}.</span>
              <span className="question-text">{question.text}</span>
            </div>
            <div className="answer">
              <strong>Answer:</strong> {question.answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuizCard;
