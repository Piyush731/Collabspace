import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/RepositoryDetails.css";

const RepositoryDetails = () => {
  const { id } = useParams();
  const [repository, setRepository] = useState(null);

  useEffect(() => {
    const fetchRepositoryDetails = async () => {
      try {
        const response = await axios.get(`/api/repository/${id}`);
        setRepository(response.data);
      } catch (error) {
        console.error("Error fetching repository details:", error);
      }
    };
    fetchRepositoryDetails();
  }, [id]);

  return repository ? (
    <div className="container mt-4">
      <h2>{repository.name}</h2>
      <p>{repository.description}</p>
      <h3>Files:</h3>
      <ul>
        {repository.files.map((file) => (
          <li key={file.name}>{file.name}</li>
        ))}
      </ul>
      <div>
        <button className="btn btn-primary me-2">Commit</button>
        <button className="btn btn-secondary me-2">Push</button>
        <button className="btn btn-dark">Pull</button>
      </div>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default RepositoryDetails;
