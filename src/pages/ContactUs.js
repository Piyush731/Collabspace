// src/pages/ContactUs.js
import React from 'react';
import '../styles/ContactUs.css';

function ContactUs() {
  return (
    <div className="contact-us">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>Contact Us</h1>
        <p>Let us know how we can help. Feel free to reach out to us anytime!</p>
      </div>

      {/* Form Section */}
      <div className="form-section">
        <img src="https://via.placeholder.com/500" alt="Contact Us Hero" className="form-image" />
        <form className="contact-form">
          <input type="text" placeholder="Name" className="input-field" />
          <input type="email" placeholder="Email" className="input-field" />
          <textarea placeholder="Message" className="textarea-field"></textarea>
          <button type="submit" className="submit-btn">Send</button>
        </form>
      </div>

      {/* Info Section */}
      <div className="info-section">
        <div className="info-item">
          <i className="fas fa-phone"></i>
          <p>+123 456 789</p>
        </div>
        <div className="info-item">
          <i className="fas fa-map-marker-alt"></i>
          <p>123 Main Street, City, Country</p>
        </div>
        <div className="info-item">
          <i className="fas fa-envelope"></i>
          <p>support@collabspace.com</p>
        </div>
      </div>

      {/* Images Section */}
      <div className="images-section">
        <div className="image-item">
          <img src="https://via.placeholder.com/300" alt="Headquarters" />
          <p>Headquarters</p>
        </div>
        <div className="image-item">
          <img src="https://via.placeholder.com/300" alt="Support Center" />
          <p>Support Center</p>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
