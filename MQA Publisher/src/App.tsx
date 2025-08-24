import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import "./index.css";
import Navbar from "./components/Navbar";
import { useAuth } from "./contexts/AuthContext";

function App() {
  const { currentUser, isAdmin, authLoading } = useAuth();

  if (authLoading) return <div className="loading">Loading...</div>;

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/admin"
          element={
            currentUser ? (
              isAdmin ? (
                <Admin />
              ) : (
                <Navigate to="/login?removed=1" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
