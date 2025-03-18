import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; 
import { motion, AnimatePresence } from "framer-motion";
import { FaCodeBranch, FaFolderOpen, FaPlus } from "react-icons/fa";
import Sidebar from "../components/sidebar";
import UserNavbar from "../components/UserNavbar"; 
import API_URL from "../config";
import RepositoryCard from "../components/RepositoryCard";


const RepositoriesPage = () => { 
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [repoLoading, setRepoLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const [userRes, reposRes] = await Promise.all([
          axios.get(`${API_URL}/api/auth/user`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/repos/my-repos`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setUser(userRes.data.user);
        setRepos(reposRes.data);
      } catch (error) {
        console.error("Error fetching data:", error.message);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
        setRepoLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-4xl text-blue-500"
        >
          ⏳
        </motion.div>
        Loading...
      </div>
    );
  }

  const ownedRepos = user ? repos.filter(repo => repo.owner?._id === user._id) : [];
  const collaboratedRepos = user ? repos.filter(repo => repo.owner?._id !== user._id) : [];

  return (
    <div className="min-h-screen  w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white
                     w-screen mx-[-20px] mb-[-20px] px-[20px] pb-[20px] overflow-x-hidden">
      <UserNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <main className={`pt-16 transition-all duration-300 ${ isSidebarOpen ? "lg:pl-64" : "pl-0"}`}>
        <div className="p-8">
          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Repositories</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/create-repo")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="text-lg" />
              <span>New Repository</span>
            </motion.button>
          </div>

          <AnimatePresence>
            {repoLoading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="animate-pulse text-gray-500">Loading repositories...</div>
              </motion.div>
            ) : repos.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-gray-500">
                No repositories found
              </motion.div>
            ) : (
              <div className="space-y-12">
                {/* Owned Repositories Section */}
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="flex items-center space-x-4 border-b border-slate-700 pb-4">
                    <FaFolderOpen className="text-2xl text-blue-400" />
                    <h3 className="text-xl font-semibold">Your Repositories ({ownedRepos.length})</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> 
                      {ownedRepos.map((repo, index) => (
                        <motion.div key={repo._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.02 }}>
                          <RepositoryCard repo={repo} isOwner />
                        </motion.div>
                      ))} 
                  </div>
                </motion.section>

                {/* Collaborated Repositories Section */}
                {collaboratedRepos.length > 0 && (
                  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex items-center space-x-4 border-b border-slate-700 pb-4">
                      <FaCodeBranch className="text-2xl text-purple-400" />
                      <h3 className="text-xl font-semibold">Collaborating ({collaboratedRepos.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {collaboratedRepos.map((repo, index) => (
                        <motion.div key={repo._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.02 }}>
                          <RepositoryCard repo={repo} />
                        </motion.div>
                      ))}
                    </div>
                  </motion.section>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default RepositoriesPage;
