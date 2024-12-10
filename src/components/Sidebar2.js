import React from "react";
import "../styles/sidebar.css";

const Sidebar2 = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`sidebar-container ${isOpen ? "open" : ""}`}>
      <div className="sidebar-header">
        <h3>Settings</h3>
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          ✖
        </button>
      </div>
      <div className="sidebar-content">
        <div className="settings-menu-item">
          <h4>General Settings</h4>
          <div className="settings-menu-group">
            <label>
              <input type="checkbox" /> Notifications
            </label>
            <label>
              <input type="checkbox" /> Dark Theme
            </label>
          </div>
        </div>
        <div className="setting-option">
          <h4>Security Settings</h4>
          <label>
            <input type="password" placeholder="Change Password" />
          </label>
          <p>Last Login: 12 Dec, 2023</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar2;
