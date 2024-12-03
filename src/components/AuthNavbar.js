// src/components/AuthNavbar.js
import React from "react";
import { Link } from "react-router-dom";
import "../styles/AuthNavbar.css"; // Add styles specific to AuthNavbar if needed

function AuthNavbar() {
  return (
    <nav className="auth-navbar bg-indigo-600 text-white p-4">
      <div className="auth-navbar-logo">
        <Link to="/" className="text-white font-bold text-xl">
          CollabSpace
        </Link>
      </div>
      <div className="auth-navbar-links">
        <ul className="flex space-x-4">
          <li>
            <Link to="/login" className="hover:underline">
              Log In
            </Link>
          </li>
          <li>
            <Link to="/signup" className="hover:underline">
              Sign Up
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default AuthNavbar;
