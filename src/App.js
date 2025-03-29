// src/App.js
import React,{useState} from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from "./context/AuthContext";
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import UserProfilePage from './pages/UserProfilePage';
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
import FileViewer from './components/FileViewer';
import { SocketProvider, useSocket } from './context/SocketContext';
import { TaskProvider } from './context/TaskContext';

function App() {
  const location = useLocation(); // Safe to use here as it's inside Router
  const { isLoggedIn, loading } = useAuth();
  const authPages = ["/login", "/signup"];
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (loading) {
    return <div className="loading-screen">Loading...</div>; // Or a spinner component
  } 
  return (
      <div className="app">
        <SocketProvider>
         <TaskProvider>
              {/* Conditionally render Navbar nd sidebar based on login state */}
              {isLoggedIn && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />} 
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
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/repositories" element={<RepositoriesPage />} />
                  <Route path="/contact" element={<ContactUs />} /> 
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />  
                  <Route path="/create-repo" element={<CreateRepo />} />
                  <Route path="*" element={<div>Page Not Found</div>} />
                  <Route path="/repo/:repoId" element={<RepositoryView />} />
                  <Route path="/repos/:repoId/files/:filePath" element={<FileViewer />} />
                </Routes>
              </div>
            </ErrorBoundary>
           <Footer /> 
         </TaskProvider>
        </SocketProvider>
      </div>
  );
}

export default App;
