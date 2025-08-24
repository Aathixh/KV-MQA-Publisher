import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, lastRemovedDeleted } = useAuth();

  const removedParam = new URLSearchParams(location.search).get("removed");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      const cred = await login(email, password);
      if (!cred) {
        // Account deleted during enforcement
        setError("Your account has been removed. Contact a super admin.");
        return;
      }
      navigate("/admin");
    } catch (error) {
      setError("Failed to sign in. Please check your credentials.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      {(lastRemovedDeleted || removedParam) && !error && (
        <div className="error-message">
          Your admin access was removed. Contact a super admin.
        </div>
      )}
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
