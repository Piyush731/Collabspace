import React from "react";
import { Link } from "react-router-dom";
import "../styles/sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar bg-dark">
      <ul className="list-unstyled">
        <li>
          <Link to="/dashboard" className="text-white">
            <i className="bi bi-speedometer2 me-2"></i> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/repositories" className="text-white">
            <i className="bi bi-folder me-2"></i> Repositories
          </Link>
        </li>
        <li>
          <Link to="/tasks" className="text-white">
            <i className="bi bi-list-check me-2"></i> Tasks
          </Link>
        </li>
        <li>
          <Link to="/reports" className="text-white">
            <i className="bi bi-bar-chart me-2"></i> Reports
          </Link>
        </li>
        <li>
          <Link to="/settings" className="text-white">
            <i className="bi bi-gear me-2"></i> Settings
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;