// src/components/UserNavbar.js

import React,{ useState } from "react";
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
    <nav className="user-navbar">
      {/* Logo Section */}
      <div className="navbar-left">
          <button className="menu-icon" onClick={toggleMenu}>
            ☰
          </button>
          <div className="user-navbar-logo">
        <Link to="/dashboard" className="logo-text">
          Collaborative Workspace
        </Link>
      </div>
       </div> 

      {/* Main Navigation */}
      <div className="user-navbar-links">
        <ul className="main-nav">
          <li>
            <Link to="/dashboard">Home</Link>
          </li>
          <li>
            <Link to="/repository">Projects</Link>
          </li>
          <li>
            <Link to="/issues">Issues</Link>
          </li>
          <li>
            <Link to="/pull-requests">Pull Requests</Link>
          </li>
          <li>
            <Link to="/marketplace">Marketplace</Link>
          </li>
          <li>
            <Link to="/settings">Settings</Link>
          </li>
        </ul>
      </div>

      {/* User Profile Menu */}
      <div className="user-profile-menu">
        <div className="profile-dropdown">
          <button className="profile-btn">User Menu</button>
          <div className="dropdown-menu">
            <Link to="/profile">Profile</Link>
            <Link to="/notifications">Notifications</Link>
            <Link to="/help">Help and Support</Link>
            <button onClick={logout} className="dropdown-logout">
              Logout
            </button>
          </div>
        </div>
      </div>

            {/* Dropdown Menu */}
            {menuOpen && (
        <div className="dropdown-menu2">
          <ul>
            <li><Link to="/option1">Option 1</Link></li>
            <li><Link to="/option2">Option 2</Link></li>
            <li><Link to="/option3">Option 3</Link></li>
          </ul>
        </div>
      )}


    </nav>
  );
};

export default UserNavbar;
