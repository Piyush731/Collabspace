import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUser, FaEnvelope, FaMapMarker, FaLink, FaLock, FaCode, FaCalendar,
  FaChartLine, FaBookmark, FaUsers, FaPalette, FaBell, FaTerminal, FaGraduationCap,
  FaTransgender, FaInfoCircle, FaLockOpen, FaStar,
    FaGithub, FaTwitter, FaLinkedin, FaEdit
} from "react-icons/fa";
import API_URL from "../config";
import RepositoryCard from "../components/RepositoryCard";
import { useNavigate } from "react-router-dom";

const UserProfilePage = () => {
  const [user, setUser] = useState(null);
  const [ownedRepos, setOwnedRepos] = useState([]);
  const [collabRepos, setCollabRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const [userRes, reposRes] = await Promise.all([
          axios.get(`${API_URL}/api/auth/user`, { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          axios.get(`${API_URL}/api/repos/my-repos`, { 
            headers: { Authorization: `Bearer ${token}` } 
          })
        ]);

        const userData = userRes.data.user;
        const allRepos = reposRes.data;

        // Separate owned and collaborated repositories
        const owned = allRepos.filter(repo => repo.owner._id === userData._id);
        const collaborated = allRepos.filter(repo => repo.owner._id !== userData._id);

        setUser(userData);
        setOwnedRepos(owned);
        setCollabRepos(collaborated);
        setIsPublic(userData.isPublic);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const toggleVisibility = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_URL}/api/users/visibility`,
        { isPublic: !isPublic },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsPublic(!isPublic);
    } catch (error) {
      console.error("Failed to toggle visibility:", error.message);
    }
  };

  // Calculate collaboration stats
  const collabStats = {
    ownedRepos: ownedRepos.length,
    collabRepos: collabRepos.length,
    totalContributions: collabRepos.reduce((sum, repo) => sum + repo.contributions, 0)
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-4xl text-blue-500"
        >
          <i className="bi bi-arrow-repeat"></i>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen  w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white
                     w-screen mx-[-20px] mb-[-20px] px-[20px] pb-[20px] overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Cover Image Section */}
      <div className="relative h-64 bg-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30">
          <div className="absolute inset-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-stripes.png')]"></div>
        </div>
        
        {/* Profile Avatar */}
        <motion.div 
          className="absolute -bottom-16 left-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <div className="relative w-32 h-32 rounded-full border-4 border-blue-500 bg-slate-700">
            <FaUser className="w-full h-full p-6 text-blue-300" />
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto -px-6 pt-20 pb-8">
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-9 mb-8">
          {/* Left Column - Basic Info */}
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold mb-2">{user.name}</h1>
            <div className="space-y-2">
              <p className="text-blue-400 flex items-center">
                <FaEnvelope className="mr-2" />
                {user.email}
              </p>
              <p className="flex items-center">
                <FaMapMarker className="mr-2 text-blue-400" />
                {user.location || 'Unknown location'}
              </p>
              <motion.button 
                className={`w-fit px-4 py-1 rounded-full text-sm ${
                  isPublic ? 'bg-green-500' : 'bg-red-500'
                }`}
                whileHover={{ scale: 1.05 }}
                onClick={toggleVisibility}
              >
                {isPublic ? 'Public Profile' : 'Private Profile'}
              </motion.button>
            </div>
          </div>

          {/* Right Column - Social & Actions */}
          <div className="space-y-4">
            <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <FaLink className="mr-2 text-blue-400" />
                Social Links
              </h3>
              <div className="flex space-x-4">
                {user.github && (
                  <a href={user.github} target="_blank" rel="noopener noreferrer">
                    <FaGithub className="text-2xl hover:text-blue-400 transition-colors" />
                  </a>
                )}
                {user.twitter && (
                  <a href={user.twitter} target="_blank" rel="noopener noreferrer">
                    <FaTwitter className="text-2xl hover:text-blue-400 transition-colors" />
                  </a>
                )}
                {user.linkedIn && (
                  <a href={user.linkedIn} target="_blank" rel="noopener noreferrer">
                    <FaLinkedin className="text-2xl hover:text-blue-400 transition-colors" />
                  </a>
                )}
              </div>
            </div>

            <motion.button
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-xl flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/edit-profile')}
            >
              <FaEdit />
              <span>Edit Profile</span>
            </motion.button>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-8 bg-slate-800/50 backdrop-blur-md p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <FaInfoCircle className="mr-2 text-blue-400" />
            About
          </h2>
          <p className="text-gray-300">{user.bio || 'No bio available'}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard 
            icon={<FaStar className="text-2xl text-yellow-400" />}
            label="Owned Repositories"
            value={collabStats.ownedRepos}
          />
          <StatCard 
            icon={<FaUsers className="text-2xl text-blue-400" />}
            label="Collaborations"
            value={collabStats.collabRepos}
          />
          <StatCard 
            icon={<FaCode className="text-2xl text-green-400" />}
            label="Total Contributions"
            value={collabStats.totalContributions}
          />
        </div>

        {/* Repository Sections */}
        <div className="space-y-8">
          <RepoSection 
            title="Your Repositories" 
            repos={ownedRepos} 
            icon={<FaStar className="mr-2 text-yellow-400" />} 
          />
          <RepoSection
            title="Collaborating Repositories"
            repos={collabRepos}
            icon={<FaUsers className="mr-2 text-blue-400" />}
          />
        </div>
      </div>
    </motion.div>
  );
};

// New StatCard component
const StatCard = ({ icon, label, value }) => (
  <motion.div 
    className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl"
    whileHover={{ y: -5 }}
  >
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-slate-700 rounded-lg">{icon}</div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-gray-400">{label}</div>
      </div>
    </div>
  </motion.div>
);
// Helper components

const RepoSection = ({ title, repos, icon, navigate }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <h3 className="text-xl font-bold mb-4 flex items-center">
      {icon}
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <AnimatePresence>
        {repos.map((repo, index) => (
          <motion.div
            key={repo._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <RepositoryCard
              repo={repo}
              onClick={() => navigate(`/repo/${repo._id}`)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  </motion.div>
);

export default UserProfilePage;