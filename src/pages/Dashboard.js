import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import { motion } from "framer-motion";
import axios from "axios";
import Sidebar from "../components/sidebar";
import RepositoryCard from "../components/RepositoryCard"; 
import { useAuth } from "../context/AuthContext"; 
import api from "../utils/api";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]); 
  const [loading, setLoading] = useState(true); //User Loading state
  const [repoLoading, setRepoLoading] = useState(true);
  const navigate = useNavigate(); // Navigation hook 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }
        const response = await axios.get("http://localhost:5000/api/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data.user); // Matches backend structure
      } catch (error) {
        console.error("Failed to fetch user data", error.message);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);


  useEffect(() => {
    if (!user) return; // Wait until user data is loaded

    const fetchRepos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const reposRes = await api.get("http://localhost:5000/api/repos/my-repos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRepos(reposRes.data);
      } catch (error) {
        console.error("Failed to fetch repositories:", error.message);
      } finally {
        setRepoLoading(false);
      }
    };
    if (user) fetchRepos(); // Fetch only if user exists
  }, [user]); 

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-red-500">
          Failed to load user data.
        </p>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-100 min-h-screen">
     
    <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        {/* Profile Section */}
        <motion.div
          className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Welcome, {user.username}!
              </h2>
              <p className="text-gray-600">Email: {user.email}</p>
              <p className="text-gray-600">
                Member Since: {new Date(user.createdAt).toDateString()}
              </p>
              <p className="text-gray-600">
                Membership:{" "}
                <span
                  className={`${
                    user.userType === "premium"
                      ? "text-green-600"
                      : user.userType === "enterprise"
                      ? "text-purple-600"
                      : "text-gray-600"
                  } font-semibold`}
                >
                  {user.userType.charAt(0).toUpperCase() +
                    user.userType.slice(1)}
                </span>
              </p>
            </div>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </motion.div>

        {/* Dashboard Features Section */}
        <motion.div
          className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-blue-500 text-white p-6 rounded-lg shadow-lg hover:bg-blue-600 cursor-pointer"
          >
            <h3 className="text-xl font-bold mb-2">Active Projects</h3>
            <p className="text-sm">Manage your ongoing projects efficiently.</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-green-500 text-white p-6 rounded-lg shadow-lg hover:bg-green-600 cursor-pointer"
          >
            <h3 className="text-xl font-bold mb-2">Tasks Overview</h3>
            <p className="text-sm">Keep track of your tasks and deadlines.</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-purple-500 text-white p-6 rounded-lg shadow-lg hover:bg-purple-600 cursor-pointer"
          >
            <h3 className="text-xl font-bold mb-2">JIRA Updates</h3>
            <p className="text-sm">View and manage your JIRA bug updates.</p>
          </motion.div>
        </motion.div>


      {/* Repository Section (New Code) */}
      <div className="mt-8">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-bold">Your Repositories</h2>
    <button
      className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600"
      onClick={() => navigate("/create-repo")}
    >
      Create Repository
    </button>
  </div>
  {repoLoading ? (
    <div className="text-gray-500 text-center py-8">Loading repositories...</div>
  ) : repos.length === 0 ? (
    <div className="text-gray-500 text-center py-8">
      No repositories found. Create your first repository!
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {repos.map((repo) => (
        <RepositoryCard
          key={repo._id}
          repo={repo}
          onClick={() => navigate(`/repo/${repo._id}`)}
        />
      ))}
    </div>
  )}
</div>
      </main>
    </div>
  );
};

export default Dashboard;