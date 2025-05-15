import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';
import Sidebar from '../components/sidebar';
import UserNavbar from '../components/UserNavbar';
import { motion } from 'framer-motion';
import RepositoryCard from '../components/RepositoryCard'

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState({ tasks: [], repositories: [] });
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${API_URL}/api/search?q=${encodeURIComponent(q)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setResults(res.data);
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setLoading(false);
      }
    };
    if (q) fetchResults();
  }, [q]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white w-screen mx-[-20px] mb-[-20px] px-[20px] pb-[20px] overflow-x-hidden relative"
    >
      <div className="absolute inset-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-stripes.png')]" />
      <UserNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`pt-16 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <div className="max-w-6xl mx-auto pt-10 px-6">
          <h1 className="text-3xl font-bold mb-4">Search Results for "{q}"</h1>
          {loading ? (
            <p>Searching...</p>
          ) : (
            <>
              <div className="mb-6 space-y-2">
                <h2 className="text-2xl font-semibold mb-2">Tasks</h2>
                {results.tasks.length ? (
                  <ul className="space-y-2">
                    {results.tasks.map(task => (
                      <li key={task._id} className="bg-white text-gray-900 p-4 rounded shadow cursor-pointer hover:bg-gray-200" onClick={() => navigate(`/tasks`)}>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm">Status: {task.status}</p>
                        <p className="text-sm">Repo: {task.repository?.name}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No tasks found.</p>
                )}
              </div>

              
              <div className="space-y-4">
  <h2 className="text-2xl font-semibold mb-2">Repositories</h2>
  {results.repositories.length ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.repositories.map(repo => (
        <motion.div
          key={repo._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <RepositoryCard 
            repo={repo}
            onClick={() => navigate(`/repo/${repo._id}`)}
            className="hover:border-indigo-500 transition-all"
          />
        </motion.div>
      ))}
    </div>
  ) : (
    <div className="text-center py-6 text-slate-400">
      No repositories found matching your search
    </div>
  )}
</div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SearchResultsPage; 