// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from "./context/AuthContext";
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import UserProfilePage from './pages/UserProfilePage';
import Issues from './pages/Issues';
import PullRequest from './pages/PullRequest';
import SettingsPage from './pages/SettingsPage'
import ReportsPage from './pages/ReportsPage'
import TasksPage from './pages/TasksPage';
import RepositoriesPage from './pages/RepositoriesPage';
import Navbar from './components/Navbar';
import AuthNavbar from "./components/AuthNavbar";
import UserNavbar from "./components/UserNavbar";
import Footer from './components/Footer';
import ContactUs from './pages/ContactUs';
import './styles/custom-animations.css';
import Login from "./pages/login";
import Signup from "./pages/signup";
import Sidebar from "./components/sidebar";
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import './styles/App.css';
import CreateRepo from "./pages/CreateRepo";
import RepositoryView from './pages/RepositoryView'; 
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const location = useLocation(); // Safe to use here as it's inside Router
  const { isLoggedIn, loading } = useAuth();
  const authPages = ["/login", "/signup"];

  if (loading) {
    return <div className="loading-screen">Loading...</div>; // Or a spinner component
  } 
  return (
      <div className="app">
         {/* Conditionally render Navbar based on login state */}
      {isLoggedIn ? (
        <UserNavbar /> // Show after login
      ) : authPages.includes(location.pathname) ? (
        <AuthNavbar /> // Show on login and signup pages
      ) : (
        <Navbar /> // Default navbar
      )}
      <ErrorBoundary>
        <div className="content ">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/pull-requests" element={<PullRequest />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/repositories" element={<RepositoriesPage />} />
            <Route path="/contact" element={<ContactUs />} /> 
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />  
            <Route path="/sidebar" element={<Sidebar />} /> 
            <Route path="/create-repo" element={<CreateRepo />} />
            <Route path="*" element={<div>Page Not Found</div>} />
            <Route path="/repo/:repoId" element={<RepositoryView />} />
          </Routes>
        </div>
        </ErrorBoundary>
        <Footer />
      </div>
  );
}

export default App;
