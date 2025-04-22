// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from "./context/AuthContext";
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import Workspace from './pages/Workspace';
import UserProfilePage from './pages/UserProfilePage';
import SettingsPage from './pages/SettingsPage'
import ReportsPage from './pages/ReportsPage'
import RepositoriesPage from './pages/RepositoriesPage';
import Navbar from './components/Navbar';
import AuthNavbar from "./components/AuthNavbar";
import UserNavbar from "./components/UserNavbar";
import Footer from './components/Footer';
import ContactUs from './pages/ContactUs';
import './styles/custom-animations.css';
import Signup from './pages/signup'
import Sidebar from "./components/sidebar";
import 'bootstrap-icons/font/bootstrap-icons.css'; 
import './styles/App.css';
import CreateRepo from "./pages/CreateRepo";
import RepositoryView from './pages/RepositoryView'; 
import ErrorBoundary from './components/ErrorBoundary';
import FileViewer from './components/FileViewer';
import { SocketProvider, useSocket } from './context/SocketContext';
import AuthContainer from "./pages/AuthContainer";

function App() {
  const location = useLocation();
  const { isLoggedIn, loading } = useAuth();
  const authPages = ["/login", "/signup"]; // Keep the original auth pages
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <div className="app">
      <SocketProvider>
        {/* Conditionally render Navbar and sidebar based on login state */}
        {isLoggedIn && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />}
        {isLoggedIn ? (
          <UserNavbar /> // Show after login
        ) : authPages.includes(location.pathname) ? (
          <AuthNavbar /> // Show on auth pages
        ) : (
          <Navbar /> // Default navbar
        )}

        <ErrorBoundary>
          <div className="content">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<AuthContainer initialMode="login" />} />
              <Route path="/signup" element={<AuthContainer initialMode="signup" />} />
              <Route path="/signup2" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workspace/:id" element={<Workspace />} />
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/repositories" element={<RepositoriesPage />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/create-repo" element={<CreateRepo />} />
              <Route path="*" element={<div>Page Not Found</div>} />
              <Route path="/repo/:repoId" element={<RepositoryView />} />
              <Route path="/repos/:repoId/files/:filePath" element={<FileViewer />} />
            </Routes>
          </div>
        </ErrorBoundary>
        <Footer />
      </SocketProvider>
    </div>
  );
}

export default App;
