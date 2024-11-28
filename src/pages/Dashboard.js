// src/pages/Dashboard.js
import React from 'react';
import '../styles/Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard">
      <h2>Your Dashboard</h2>
      <div className="widgets">
        <div className="widget">Active Projects</div>
        <div className="widget">Tasks Overview</div>
        <div className="widget">JIRA Updates</div>
      </div>
    </div>
  );
}

export default Dashboard;
