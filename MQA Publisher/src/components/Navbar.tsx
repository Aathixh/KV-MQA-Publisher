import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Navbar.css";

function Navbar() {
  const { currentUser } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          <span className="logo-text">MQA</span>
          <span className="logo-highlight">Publisher</span>
        </Link>

        <div className="nav-links">
          {currentUser ? (
            <Link to="/admin" className="nav-button">
              Dashboard
            </Link>
          ) : (
            <Link to="/login" className="nav-button">
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
