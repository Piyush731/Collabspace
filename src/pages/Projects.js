import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Projects = () => {
  const [repositories, setRepositories] = useState([]);

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const response = await axios.get('/api/repositories'); // Assuming a backend API to fetch repositories
        setRepositories(response.data);
      } catch (error) {
        console.error('Error fetching repositories:', error);
      }
    };

    fetchRepositories();
  }, []);

  const handleCreateRepository = async (event) => {
    event.preventDefault();
    // ... Handle creating a new repository
  };

  return (
    <div>
      {/* User Profile and Search Bar */}
      {/* ... */}

      <h2>Your Repositories</h2>

      <form onSubmit={handleCreateRepository}>
        <input type="text" placeholder="Repository Name" />
        <button type="submit">Create Repository</button>
      </form>

      <ul>
        {repositories.map((repository) => (
          <li key={repository._id}>
            <a href={`/repository/${repository._id}`}>
              {repository.name}
            </a>
            <p>{repository.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;