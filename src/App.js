// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from "./context/AuthContext";
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import Repositories from './pages/Projects';
import Issues from './pages/Issues';
import PullRequest from './pages/PullRequest';
import Settings from './pages/Settings'
import Marketplace from './pages/Marketplace';
import Navbar from './components/Navbar';
import AuthNavbar from "./components/AuthNavbar";
import UserNavbar from "./components/UserNavbar";
import Footer from './components/Footer';
import ContactUs from './pages/ContactUs';
import Login from "./pages/login";
import Signup from "./pages/signup";
import Sidebar  from './components/sidebar';
import './styles/App.css';

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
        <div className="content">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/repositories" element={<Repositories />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/pull-requests" element={<PullRequest />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/contact" element={<ContactUs />} /> 
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />  
            <Route path="/sidebar" element={<Sidebar />} />
            <Route path="*" element={<div>Page Not Found</div>} />
          </Routes>
        </div>
        <Footer />
      </div>
  );
}

export default App;
