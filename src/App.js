// src/App.js
import React,{ useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import TaskManagement from './pages/TaskManagement';
import JiraIntegration from './pages/JiraIntegration';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ContactUs from './pages/ContactUs';
import Login from "./pages/login";
import Signup from "./pages/signup";
import './styles/App.css';

function App() {
  useEffect(() => {
    document.title = 'CollabSpace';
  }, []);
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/task-management" element={<TaskManagement />} />
            <Route path="/jira" element={<JiraIntegration />} />
            <Route path="/contact" element={<ContactUs />} /> 
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />  
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
