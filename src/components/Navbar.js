import React from "react";
import { Link as ScrollLink } from "react-scroll"; // Import Scroll Link
import "../styles/Navbar.css";

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
        <ScrollLink
          to="login"
          smooth={true}
          duration={500}
          className="login-btn"
        >
          Log In
        </ScrollLink>
        <ScrollLink
          to="signup"
          smooth={true}
          duration={500}
          className="signup-btn"
        >
          Sign Up
        </ScrollLink>
      </div>
    </nav>
  );
}

export default Navbar;
