import React from 'react';
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from "./context/AuthContext"; 
import { SocketProvider} from './context/SocketContext';
import { TaskProvider } from './context/TaskContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';



const root = createRoot(document.getElementById("root")); // Correct usage
root.render(
  <Router>
     <AuthProvider>
      <SocketProvider>
        <TaskProvider>
          <React.StrictMode>
            <App />
          </React.StrictMode>
        </TaskProvider>
     </SocketProvider>
    </AuthProvider>
  </Router>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
