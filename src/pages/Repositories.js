import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/Repositories.css";

const Repositories = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRepositories, setFilteredRepositories] = useState([]);



  const apiClient = axios.create({
    baseURL: "http://localhost:5000/api",
  });


  useEffect(() => {
    // Fetch user's repositories
    const fetchRepositories = async () => {
      try {
        const response = await axios.get("/api/repositories");
        setRepositories(response.data);
        setFilteredRepositories(response.data);
      } catch (error) {
        console.error("Error fetching repositories:", error);
      }
    };
    fetchRepositories();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = repositories.filter((repo) =>
      repo.name.toLowerCase().includes(query)
    );
    setFilteredRepositories(filtered);
  };

  const handleCreateRepository = async () => {
    const repoName = prompt("Enter the name of the new repository:");
    if (repoName) {
      try {
        const response = await axios.post("/api/repositories", { name: repoName });
        setRepositories([...repositories, response.data]);
        setFilteredRepositories([...repositories, response.data]);
      } catch (error) {
        console.error("Error creating repository:", error);
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>Your Repositories</h2>

      {/* Search and Create New Repository */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Search repositories..."
          value={searchQuery}
          onChange={handleSearch}
          style={{ width: "70%" }}
        />

        <button
          className="btn btn-primary"
          onClick={handleCreateRepository}
        >
          Create New Repository
        </button>
      </div>

      {/* Repository List */}
      <div className="list-group">
        {filteredRepositories.map((repo) => (
          <Link
            to={`/repository/${repo._id}`}
            key={repo._id}
            className="list-group-item list-group-item-action"
          >
            {repo.name}
          </Link>
        ))}

        {filteredRepositories.length === 0 && (
          <p className="text-muted">No repositories found.</p>
        )}
      </div>
    </div>
  );
};

export default Repositories;
