// src/pages/Homepage.js
import React from 'react';
import '../styles/Homepage.css';
import contacticon from '../icons/contact.jpg';
import collabImg from '../icons/collab.jpg'; 
import Fileshareing from '../icons/filesharing.jpg'; 
import taskicon from '../icons/task.jpg'; 
import projecticon from '../icons/projecticon.jpg'; 
import chaticon from '../icons/chat.jpg'; 
import Jira from '../icons/jira.jpg';

function Homepage() {
    
  return (
    <div className="homepage">
      {/* Navbar */} 

      {/* Hero Section */} 
      <div id="Hero" className="hero-section">
        <h1 className='tex'>
          Boost Your Team's Productivity with Our Collaborative <br></br> Workspace Platform
        </h1>
        <p className='hero-discription'>
          Streamline your project management, communication, and collaboration with our innovative platform. Empower your team to work smarter and achieve better results.
        </p>
        <div className="hero-buttons">
          <button className="get-started-btn">Get Started</button>
          <button className="learn-more-btn">Learn More</button>
        </div>
      </div> 
           {/* Features Section */} 
           <div id="features" className="features-section">
  <h2>Key Features</h2>
  <div className="feature-cards">
  <div className="feature-card">
      <img src= {collabImg} alt="Collaboration Icon" className="feature-image" />
      <div className="feature-content">
        <h3>Collaboration and Communication</h3>
        <p>Seamlessly collaborate with your team in real-time. Share ideas, provide feedback, and make decisions faster with enhanced communication tools.</p>
      </div>
    </div>
    <div className="feature-card">
      <img src={Fileshareing} alt="File Sharing Icon" className="feature-image" />
      <div className="feature-content">
        <h3>File Sharing</h3>
        <p>Share files securely with your team, ensuring everyone has access to the latest resources. With version control, managing project documents is easier than ever.</p>
      </div>
    </div>
  <div className="feature-card">
      <img src={chaticon} alt="Chat Icon" className="feature-image" />
      <div className="feature-content">
        <h3>Chat</h3>
        <p>Stay connected with team members through integrated real-time chat features. Streamline communication and reduce delays with instant messaging.</p>
      </div>
    </div>
    <div className="feature-card">
      <img src={taskicon} alt="Task Management Icon" className="feature-image" />
      <div className="feature-content">
        <h3>Task Management</h3>
        <p>Efficiently organize, assign, and track tasks with built-in task management tools. Keep your team aligned and ensure deadlines are met with ease.</p>
      </div>
    </div>
  <div className="feature-card">
      <img src={projecticon} alt="Project Management Icon" className="feature-image" />
      <div className="feature-content">
        <h3>Project Management</h3>
        <p>Oversee projects from start to finish with tools for planning, execution, and monitoring. Track progress, set milestones, and keep your projects on course.</p>
      </div>
    </div>
    <div className="feature-card">
      <img src={Jira} alt="JIRA Integration Icon" className="feature-image" />
      <div className="feature-content">
        <h3>JIRA Integration</h3>
        <p>Integrate seamlessly with JIRA to manage issues, track bugs, and prioritize tasks. Leverage JIRA’s powerful capabilities directly within our platform.</p>
      </div>
    </div>
  </div>
</div>


      {/* Testimonials Section */}
      <div className="testimonials-section">
        <h2>What Our Customers Say</h2>
        <div className="testimonial-card">
          <p>"[Testimonial 1]"</p>
          <p>- [Customer Name], [Company Name]</p>
        </div>
        <div className="testimonial-card">
          <p>"[Testimonial 2]"</p>
          <p>- [Customer Name], [Company Name]</p>
        </div>
      </div>
      
        {/* Pricing Section */} 
      <div id="pricing" className="pricing-section">
  <h2>Choose the perfect plan for you</h2>
  <p></p>
  <div className="pricing-plans">
    <div className="pricing-plan">
      <h3>Basic Plan</h3>
      <div className="price">$0.00/month</div> 
      <ul>
        <li>User Dashboard</li>
        <li>File Sharing</li>
        <li>Chat Module</li>
      </ul>
      <button className="get-started-btn2">Get Started</button>
    </div>
    <div className="pricing-plan">
      <h3>Business Plan</h3>
      <div className="price">$19/mo</div> 
      <ul>
        <li>All features of Basic Plan</li>
        <li>Task Management</li>
        <li>Project Management</li>
        <li>Team Collaboration</li> 
      </ul>
      <button className="get-started-btn2">Get Started</button>
    </div>
    <div className="pricing-plan">
      <h3>Enterprise Plan</h3>
      <div className="price">$49/mo</div> 
      <ul>
        <li>All features of Business Plan</li> 
        <li>JIRA Intregation for bug Detection</li>
        <li>Integration with third-party tools</li> 
        <li>Enhanced security features</li> 
        <li>Video Conferencing</li>
        <li>Priority support</li>
      </ul>
      <button className="get-started-btn2">Get Started</button>
    </div>
  </div>
</div> 

      {/* Contact us */}
      <div id="contact" className="cta-section">
        <h1>Contact Us</h1> 
      </div>
      {/* Form Section */}
      <div className="form-section">
        <img src={contacticon} alt="Contact Us Hero" className="form-image" />
        <form className="contact-form">
          <input type="text" placeholder="Name" className="input-field" />
          <input type="email" placeholder="Email" className="input-field" />
          <textarea placeholder="Message" className="textarea-field"></textarea>
          <button type="submit" className="submit-btn">Send</button>
        </form>
      </div>

      <div class="contact-section">
  <div class="contact-info">
    <p>Have any questions? <a href= "contact">Contact Us</a></p>
  </div> 
</div>

    </div> 
  );
}

export default Homepage;