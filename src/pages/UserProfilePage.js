import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "../styles/UserProfile.css";

const UserProfilePage = () => {
  const [userData, setUserData] = useState({});
  const [repositories, setRepositories] = useState([]);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get("/api/user");
        const repoResponse = await axios.get("/api/repositories");
        setUserData(userResponse.data);
        setRepositories(repoResponse.data);
        setIsPublic(userResponse.data.isPublic);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };
    fetchUserData();
  }, []);

  const toggleVisibility = async () => {
    try {
      await axios.post("/api/user/toggle-visibility", { isPublic: !isPublic });
      setIsPublic(!isPublic);
    } catch (error) {
      console.error("Failed to toggle visibility");
    }
  };

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
      </div>
      <div className="profile-data">
        <div className="profile-info">
          <h3>{userData.name}</h3>
          <p>Email: {userData.email}</p>
          <p>Gender: {userData.gender}</p>
          <p>Pronouns: {userData.pronouns}</p>
          <p>About: {userData.about}</p>
          <p>Location: {userData.location}</p>
          <button className="visibility-btn" onClick={toggleVisibility}>
            {isPublic ? "Make Private" : "Make Public"}
          </button>
        </div>
        <div className="repo-section">
          <h3>Your Repositories</h3>
          {repositories.length > 0 ? (
            <ul>
              {repositories.map((repo) => (
                <li key={repo._id}>
                  <Link to={`/repository/${repo._id}`}>{repo.name}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No repositories found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
