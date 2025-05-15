import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bar, Pie } from "react-chartjs-2";
import axios from "axios";
import API_URL from "../config";
import Sidebar from "../components/sidebar";
import UserNavbar from "../components/UserNavbar";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const ReportsPage = () => {
  const [taskStats, setTaskStats] = useState({ status: [], priority: [] });
  const [repoStats, setRepoStats] = useState({ total: 0, byVisibility: {} });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [taskRes, repoRes] = await Promise.all([
          axios.get(`${API_URL}/api/tasks/stats`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/repos/my-repos`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setTaskStats(taskRes.data);
        const repos = repoRes.data;
        const byVisibility = repos.reduce((acc, r) => {
          acc[r.visibility] = (acc[r.visibility] || 0) + 1;
          return acc;
        }, {});
        setRepoStats({ total: repos.length, byVisibility });
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statusLabels = taskStats.status.map(s => s._id);
  const statusData = taskStats.status.map(s => s.count);
  const priorityLabels = taskStats.priority.map(p => p._id);
  const priorityData = taskStats.priority.map(p => p.count);
  const visibilityLabels = Object.keys(repoStats.byVisibility);
  const visibilityData = Object.values(repoStats.byVisibility);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white w-screen mx-[-20px] mb-[-20px] px-[20px] pb-[20px] overflow-x-hidden relative"
    >
      <div className="absolute inset-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-stripes.png')]" />
      <UserNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`pt-16 transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <div className="max-w-6xl mx-auto pt-10 px-6">
          <h1 className="text-3xl font-bold mb-6">Reports</h1>
          {loading ? (
            <p>Loading reports...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded shadow">
                <h2 className="font-semibold mb-2">Tasks by Status</h2>
                <Bar data={{ labels: statusLabels, datasets: [{ label: '# Tasks', data: statusData, backgroundColor: 'rgba(59, 130, 246, 0.5)' }] }} />
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h2 className="font-semibold mb-2">Tasks by Priority</h2>
                <Pie data={{ labels: priorityLabels, datasets: [{ label: '# Tasks', data: priorityData, backgroundColor: ['#f87171', '#fbbf24', '#34d399'] }] }} />
              </div>
              <div className="bg-white p-4 rounded shadow md:col-span-2">
                <h2 className="font-semibold mb-2">Repositories by Visibility</h2>
                <Bar data={{ labels: visibilityLabels, datasets: [{ label: '# Repositories', data: visibilityData, backgroundColor: 'rgba(16, 185, 129, 0.5)' }] }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ReportsPage;