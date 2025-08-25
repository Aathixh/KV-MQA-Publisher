import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Login.css";
import showIcon from "../assets/eye.png";
import hideIcon from "../assets/hidden.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, lastRemovedDeleted } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

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
          <div className="password-field-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <img
                src={showPassword ? hideIcon : showIcon}
                alt=""
                draggable="false"
              />
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
