import React, { useState } from "react";
import Sidebar2 from "../components/Sidebar2";
import "../styles/Settings.css";

const SettingsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="settings-page-container">
      <div className="settings-page-header">
        <button onClick={toggleSidebar} className="settings-action-btn">
          Open Settings
        </button>
      </div>
      <Sidebar2 isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="settings-main-conten">
        <h2>Welcome to Settings</h2>
        <p>Manage your settings using the sidebar.</p>
      </div>
    </div>
  );
};

export default SettingsPage;
