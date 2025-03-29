const express = require('express');
const router = express.Router();
const axios = require('axios');
const authJWT = require('../middleware/authJWT');

// Link file to JIRA issue
router.post('/create-issue', authJWT, async (req, res) => {
  try {
    const { filePath, codeSnippet, branch, message } = req.body;
    
    const jiraResponse = await axios.post(
      `${JIRA_BASE_URL}/rest/api/3/issue`,
      {
        fields: {
          project: { key: process.env.JIRA_PROJECT_KEY },
          summary: `Bug in ${filePath}: ${message}`,
          description: {
            type: "doc",
            content: [{
              type: "codeBlock",
              content: [{
                type: "text",
                text: codeSnippet.substring(0, 5000)
              }]
            }]
          },
          issuetype: { name: "Bug" }
        }
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.JIRA_EMAIL}:${process.env.JIRA_API_TOKEN}`
          ).toString('base64')}`
        }
      }
    );

    res.status(201).json(jiraResponse.data);
  } catch (error) {
    res.status(500).json({ error: 'JIRA integration failed' });
  }
});