import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  getQuizzes,
  addQuiz,
  updateQuiz,
  deleteQuiz,
} from "../services/firestore";
import type { Quiz, Question } from "../services/firestore";
import "../styles/Admin.css";

function Admin() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    month: "",
    year: new Date().getFullYear(),
    questions: [{ id: 1, text: "", answer: "" }],
  });

  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

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

  function resetForm() {
    setFormData({
      title: "",
      month: "",
      year: new Date().getFullYear(),
      questions: [{ id: 1, text: "", answer: "" }],
    });
    setEditing(null);
  }

  function handleQuestionChange(
    index: number,
    field: keyof Question,
    value: string | number
  ) {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setFormData({ ...formData, questions: updatedQuestions });
  }

  function addQuestion() {
    const newId =
      formData.questions.length > 0
        ? Math.max(...formData.questions.map((q) => q.id)) + 1
        : 1;

    setFormData({
      ...formData,
      questions: [...formData.questions, { id: newId, text: "", answer: "" }],
    });
  }

  function removeQuestion(index: number) {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: updatedQuestions });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      if (editing) {
        await updateQuiz(editing, formData);
      } else {
        await addQuiz({
          title: formData.title,
          month: formData.month,
          year: formData.year,
          questions: formData.questions,
        });
      }
      resetForm();
      fetchQuizzes();
    } catch (error) {
      console.error("Error saving quiz:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(quiz: Quiz) {
    if (!quiz.id) return;

    setEditing(quiz.id);
    setFormData({
      title: quiz.title,
      month: quiz.month,
      year: quiz.year,
      questions: quiz.questions,
    });
  }

  async function handleDelete(id: string | undefined) {
    if (!id) return;

    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        setLoading(true);
        await deleteQuiz(id);
        fetchQuizzes();
      } catch (error) {
        console.error("Error deleting quiz:", error);
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  return (
    <div className="admin-container">
      <header>
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>{currentUser?.email}</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="admin-content">
        <section className="quiz-form">
          <h2>{editing ? "Edit Quiz" : "Add New Quiz"}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Quiz Title</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="month">Month</label>
                <select
                  id="month"
                  value={formData.month}
                  onChange={(e) =>
                    setFormData({ ...formData, month: e.target.value })
                  }
                  required
                >
                  <option value="">Select Month</option>
                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="year">Year</label>
                <input
                  type="number"
                  id="year"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: parseInt(e.target.value) })
                  }
                  required
                />
              </div>
            </div>

            <h3>Questions & Answers</h3>
            {formData.questions.map((question, index) => (
              <div key={question.id} className="question-item">
                <div className="form-group">
                  <label>Question {index + 1}</label>
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) =>
                      handleQuestionChange(index, "text", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Answer</label>
                  <input
                    type="text"
                    value={question.answer}
                    onChange={(e) =>
                      handleQuestionChange(index, "answer", e.target.value)
                    }
                    required
                  />
                </div>
                {formData.questions.length > 1 && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeQuestion(index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="add-question-btn"
              onClick={addQuestion}
            >
              + Add Question
            </button>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading
                  ? "Saving..."
                  : editing
                  ? "Update Quiz"
                  : "Create Quiz"}
              </button>
              {editing && (
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="quiz-list">
          <h2>Existing Quizzes</h2>
          {loading ? (
            <p>Loading quizzes...</p>
          ) : quizzes.length === 0 ? (
            <p>No quizzes available yet.</p>
          ) : (
            <ul>
              {quizzes.map((quiz) => (
                <li key={quiz.id} className="quiz-list-item">
                  <div>
                    <h3>{quiz.title}</h3>
                    <p>
                      {quiz.month} {quiz.year}
                    </p>
                  </div>
                  <div className="actions">
                    <button onClick={() => handleEdit(quiz)}>Edit</button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(quiz.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default Admin;
