import React from "react";
import { Link as ScrollLink } from "react-scroll"; // Import Scroll Link
import "../styles/Navbar.css";
import { Link } from 'react-router-dom';
import login1 from "../pages/login.js"

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">
          <ScrollLink
            to="Hero"
            smooth={true}
            duration={500}
            className="navbar-logo-link"
          >
            CollabSpace
          </ScrollLink>
        </div>
        <div className="navbar-links">
          <ul>
            <li>
              <ScrollLink
                to="features"
                smooth={true}
                duration={500}
                spy={true}
                activeClass="active"
              >
                Features
              </ScrollLink>
            </li>
            <li>
              <ScrollLink
                to="pricing"
                smooth={true}
                duration={500}
                spy={true}
                activeClass="active"
              >
                Pricing
              </ScrollLink>
            </li>
            <li>
              <ScrollLink
                to="contact"
                smooth={true}
                duration={500}
                spy={true}
                activeClass="active"
              >
                Contact
              </ScrollLink>
            </li>
          </ul>
        </div>
      </div>
      <div className="navbar-right">
      {/* Use React Router's Link component */}
      <Link to= "/Login.js" className="login-btn">
        Log In
      </Link>
      <Link to="../pages/signup.js" className="signup-btn">
        Sign Up
      </Link>
    </div>
    </nav>
  );
}

export default Navbar;
