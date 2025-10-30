import { useState, useEffect } from "react";
import "./UserDropdown.css";

export function UserDropdown({ user, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isDropdownOpen && !e.target.closest(".user-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    onLogout();
  };

  return (
    <div className="user-dropdown">
      <button
        className={`user-button ${isDropdownOpen ? "open" : ""}`}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
      >
        <span className="user-name">{user.name}</span>
        <span className="dropdown-arrow">▼</span>
      </button>
      {isDropdownOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-user-info">
            <div className="dropdown-user-name">
              <span className="label">Name:</span> {user.name}
            </div>
            <div className="dropdown-user-email">
              <span className="label">Email:</span> {user.email}
            </div>
          </div>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}
