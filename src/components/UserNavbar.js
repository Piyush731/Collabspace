// src/components/UserNavbar.js

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/UserNavbar.css";

const UserNavbar = () => {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        {/* Navbar Brand */}
        <div className="auth-navbar-logo">
        <Link to="/dashboard" className="text-white font-bold text-xl">
          CollabSpace
        </Link>
      </div>

        {/* Right-side Icons */}
        <div className="d-flex align-items-center ms-auto">
          {/* Search Box */}
          <form className="d-flex me-3" role="search">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
            />
          </form>

          {/* Pull Request Icon */}
          <button className="btn btn-dark border-0 me-2">
            <i className="bi bi-git-pull-request"></i> PullRequest
          </button>

          {/* Issues Icon */}
          <button className="btn btn-dark border-0 me-2">
            <i className="bi bi-exclamation-circle"></i>Issues
          </button>

          {/* Notifications Icon */}
          <button className="btn btn-dark border-0 me-2"> Notification
            <i className="bi bi-bell"></i>
          </button>

          {/* Profile Icon with Dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-dark border-0 dropdown-toggle"
              type="button"
              id="profileDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="bi bi-person-circle"></i> Profile
            </button>
            <ul
              className="dropdown-menu dropdown-menu-end dropdown-menu-dark"
              aria-labelledby="profileDropdown"
            >
              <li>
                <Link className="dropdown-item" to="/profile">
                  Profile
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/settings">
                  Settings
                </Link>
              </li>
              <li>
                <button className="dropdown-item" onClick={logout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar;
