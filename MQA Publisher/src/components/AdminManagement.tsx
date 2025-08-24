import { useState, useEffect } from "react";
import { getAdmins, addAdmin, removeAdmin } from "../services/admins";
import type { Admin } from "../services/admins";
import "../styles/AdminManagement.css";
import showIcon from "../assets/eye.png";
import hideIcon from "../assets/hidden.png";

function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    try {
      setLoading(true);
      const adminList = await getAdmins();
      setAdmins(adminList);
    } catch (error) {
      console.error("Error fetching admins:", error);
      setError("Failed to load administrators");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    try {
      setError("");
      setSuccess("");
      setIsAdding(true);
      await addAdmin(email.trim(), password, displayName.trim());
      setSuccess(`Admin ${email} added.`);
      setEmail("");
      setPassword("");
      setDisplayName("");
      fetchAdmins();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Add failed.";
      setError(msg);
    } finally {
      setIsAdding(false);
    }
  }

  async function handleRemoveAdmin(admin: Admin) {
    if (!window.confirm(`Remove ${admin.email}?`)) return;
    try {
      setError("");
      await removeAdmin(admin.uid);
      setSuccess(`Removed ${admin.email}.`);
      fetchAdmins();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Remove failed.";
      setError(msg);
    }
  }

  return (
    <div className="admin-management">
      <h2>Administrator Management</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="admin-section">
        <h3>Current Administrators</h3>
        {loading ? (
          <p>Loading...</p>
        ) : admins.length === 0 ? (
          <p>No administrators found.</p>
        ) : (
          <ul className="admin-list">
            {admins.map((admin) => (
              <li key={admin.uid} className="admin-item">
                <div className="admin-info">
                  <p className="admin-name">
                    {admin.displayName || "Unnamed Admin"}
                  </p>
                  <p className="admin-email">{admin.email}</p>
                </div>
                {admin.email !== "nandu.narain@gmail.com" && (
                  <button
                    onClick={() => handleRemoveAdmin(admin)}
                    className="remove-admin-btn"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="add-admin-section">
        <h3>Add New Administrator</h3>
        <form onSubmit={handleAddAdmin} className="add-admin-form">
          <div className="form-group">
            <label htmlFor="displayName">Name (Optional)</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Administrator name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@example.com"
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
                minLength={6}
                placeholder="Minimum 6 characters"
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

          <button type="submit" disabled={isAdding}>
            {isAdding ? "Adding..." : "Add Administrator"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminManagement;
