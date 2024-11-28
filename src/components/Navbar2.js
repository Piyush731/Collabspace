// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <Link to="/">CollabSpace</Link>
        </div>
        <div className="navbar-links">
          <Link to="/dashboard">Dashboard</Link> 
          <Link to="/file-sharing">File Sharing</Link> 
          <Link to="/chat">Chat</Link>
          <Link to="/task-management">Task Management</Link>
          <Link to="/project-management">Project Management</Link>
          <Link to="/plugins">Plugins</Link>
          <Link to="/contact">Help/Support</Link>
        </div>
      </div>
      <div className="navbar-right">
        <Link to="/login" className="login-btn">Log Out</Link>
      </div>
    </nav>
  );
}

export default Navbar;
