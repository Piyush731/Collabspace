// src/pages/JiraIntegration.js
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/JiraIntegration.css';

function JiraIntegration() {
  const [issues, setIssues] = useState([]);

  const fetchJiraIssues = async () => {
    try {
      const response = await axios.get('/api/jira/issues'); // Update with your API endpoint
      setIssues(response.data.issues);
    } catch (error) {
      console.error('Error fetching JIRA issues:', error);
    }
  };

  return (
    <div className="jira-integration">
      <h2>JIRA Integration</h2>
      <button onClick={fetchJiraIssues}>Fetch JIRA Issues</button>
      <ul>
        {issues.map((issue) => (
          <li key={issue.id}>
            {issue.key}: {issue.fields.summary}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default JiraIntegration;
