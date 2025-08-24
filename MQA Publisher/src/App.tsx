import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./services/firebase";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import "./index.css";
import type { User } from "firebase/auth";
import Navbar from "./components/Navbar";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/admin"
            element={user ? <Admin /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
