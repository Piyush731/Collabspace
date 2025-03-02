import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaTransgender, FaMapMarker, FaInfoCircle, FaLock, FaLockOpen, FaCode } from "react-icons/fa";

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white w-screen mx-[-20px] mb-[-20px] px-[20px] pb-[20px] overflow-x-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-stripes.png')]"></div>

      {/* Profile Header */}
      <motion.div className="pt-10 text-center" variants={itemVariants}>
        <h1 className="text-4xl font-bold">User Profile</h1>
      </motion.div>

      {/* Profile Data */}
      <motion.div className="flex flex-col md:flex-row justify-around mt-10 space-y-8 md:space-y-0 md:space-x-8" variants={itemVariants}>
        {/* Profile Info Section */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-md p-6 rounded-lg shadow-lg w-full md:w-1/2"
          variants={itemVariants}
        >
          <h3 className="text-2xl font-semibold flex items-center space-x-2">
            <FaUser className="text-blue-400" />
            <span>{userData.name}</span>
          </h3>
          <div className="mt-4 space-y-4">
            <p className="flex items-center space-x-2">
              <FaEnvelope className="text-blue-400" />
              <span>Email: {userData.email}</span>
            </p>
            <p className="flex items-center space-x-2">
              <FaTransgender className="text-blue-400" />
              <span>Gender: {userData.gender}</span>
            </p>
            <p className="flex items-center space-x-2">
              <FaTransgender className="text-blue-400" />
              <span>Pronouns: {userData.pronouns}</span>
            </p>
            <p className="flex items-center space-x-2">
              <FaInfoCircle className="text-blue-400" />
              <span>About: {userData.about}</span>
            </p>
            <p className="flex items-center space-x-2">
              <FaMapMarker className="text-blue-400" />
              <span>Location: {userData.location}</span>
            </p>
          </div>
          <motion.button
            className="mt-6 w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-all duration-300"
            onClick={toggleVisibility}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPublic ? <FaLock className="text-white" /> : <FaLockOpen className="text-white" />}
            <span>{isPublic ? "Make Private" : "Make Public"}</span>
          </motion.button>
        </motion.div>

        {/* Repositories Section */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-md p-6 rounded-lg shadow-lg w-full md:w-1/2"
          variants={itemVariants}
        >
          <h3 className="text-2xl font-semibold flex items-center space-x-2">
            <FaCode className="text-blue-400" />
            <span>Your Repositories</span>
          </h3>
          {repositories.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {repositories.map((repo) => (
                <motion.li
                  key={repo._id}
                  className="hover:bg-slate-700/50 transition-all duration-300 p-2 rounded-lg"
                  variants={itemVariants}
                >
                  <Link to={`/repository/${repo._id}`} className="text-blue-400 hover:text-blue-300">
                    {repo.name}
                  </Link>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-gray-400">No repositories found.</p>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default UserProfilePage;