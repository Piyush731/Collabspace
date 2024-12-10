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
    <nav className="navbar navbar-dark bg-dark fixed-top z-1050  w-full">
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
           <button className="btn btn-dark border-0 me-2 relative group">
               <Link to="/git-pull" className="text-white">
                  <i className="bi bi-git"></i> {/* Change icon name if necessary */}
               </Link>
              <span className="tooltiptext group-hover:visible group-hover:opacity-100">
                 Pull Requests
              </span>
            </button>

          {/* Issues Icon */}
          <button className="btn btn-dark border-0 me-2">
          <Link to="/issues" className="text-white">
            <i className="bi bi-exclamation-circle"></i> 
            </Link>
            <span className="tooltiptext group-hover:visible group-hover:opacity-100">
                 Issues
              </span>
          </button>

          {/* Notifications Icon */}
          <button className="btn btn-dark border-0 me-2">
          <Link to="/notifications" className="text-white">
            <i className="bi bi-bell"></i> 
            </Link>
            <span className="tooltiptext group-hover:visible group-hover:opacity-100">
                 Notifications
              </span>
          </button> 

          {/* Profile Icon with Dropdown */}
          <div className="dropdown">
  <button
    className="btn btn-dark border-0 dropdown-toggle"
    type="button"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  >
    <i className="bi bi-person-circle"></i>
    <span className="tooltiptext group-hover:visible group-hover:opacity-100">
                 Profile</span>
  </button>
  <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark">
    <li>
      <Link className="dropdown-item" to="/profile">
        Profile
      </Link>
    </li>
    <li>
      <Link className="dropdown-item" to="/dashboard">
        Dashboard
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
