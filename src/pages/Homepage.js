// src/pages/Homepage.js
import React from 'react';
import '../styles/Homepage.css';
import contacticon from '../icons/contact.jpg';
import collabImg from '../icons/collaboration.jpg'; 
import Filesharing from '../icons/filesharing.jpg'; 
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
  <div className="feature-pair">
    {/* Feature 1 */}
    <div className="feature">
      <div className="feature-image">
        <img src={collabImg}alt="Collaboration and Communication" />
      </div>
      <div className="feature-content">
        <h3>Collaboration and Communication</h3>
        <p>Seamlessly collaborate with your team in real-time. Share ideas, provide feedback, and make decisions faster with enhanced communication tools.</p>
      </div>
    </div>
    {/* Feature 2 */}
    <div className="feature">
      <div className="feature-image">
        <img src={Filesharing} alt="File Sharing" />
      </div>
      <div className="feature-content">
        <h3>File Sharing</h3>
        <p>Share files securely with your team, ensuring everyone has access to the latest resources. With version control, managing project documents is easier than ever.</p>
      </div>
    </div>
  </div>

  <div className="feature-pair">
    {/* Feature 3 */}
    <div className="feature">
      <div className="feature-image">
        <img src={chaticon} alt="Chat" />
      </div>
      <div className="feature-content">
        <h3>Chat</h3>
        <p>Stay connected with team members through integrated real-time chat features. Streamline communication and reduce delays with instant messaging.</p>
      </div>
    </div>
    {/* Feature 4 */}
    <div className="feature">
      <div className="feature-image">
        <img src={taskicon} alt="Task Management" />
      </div>
      <div className="feature-content">
        <h3>Task Management</h3>
        <p>Efficiently organize, assign, and track tasks with built-in task management tools. Keep your team aligned and ensure deadlines are met with ease.</p>
      </div>
    </div>
  </div>

  <div className="feature-pair">
    {/* Feature 5 */}
    <div className="feature">
      <div className="feature-image">
        <img src={projecticon} alt="Project Management" />
      </div>
      <div className="feature-content">
        <h3>Project Management</h3>
        <p>Oversee projects from start to finish with tools for planning, execution, and monitoring. Track progress, set milestones, and keep your projects on course.</p>
      </div>
    </div>
    {/* Feature 6 */}
    <div className="feature">
      <div className="feature-image">
        <img src={Jira} alt="JIRA Integration" />
      </div>
      <div className="feature-content">
        <h3>JIRA Integration</h3>
        <p>Integrate seamlessly with JIRA to manage issues, track bugs, and prioritize tasks. Leverage JIRA’s powerful capabilities directly within our platform.</p>
      </div>
    </div>
  </div>
</div>

      {/* Testimonials Section */}
      <section class="testimonials">
  <h2>What Our Customers Say</h2>
  <div class="testimonial-card">
    <p>"This product has revolutionized our workflow. It's easy to use and incredibly powerful."</p>
    <p>- John Doe, Acme Corporation</p>
  </div>
  <div class="testimonial-card">
    <p>"I'm amazed at how much time and effort this tool has saved us. Highly recommended!"</p>
    <p>- Jane Smith, Tech Solutions</p>
  </div>
  </section>
      
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

<div class="discover-section">
  <div class="left-content">
    <h2>Discover the Power of Our Products</h2>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare.
    </p>
    <button class="main-action-btn">Sign Up</button>
  </div>
  <div class="right-content">
    <div class="feature-box white-box">
      <h3>01</h3>
      <h4>Sign Up for an Account</h4>
      <p>Create a new account on the platform by providing your email and setting up a password.</p>
    </div>
    <div class="feature-box peach-box">
      <h3>02</h3>
      <h4>Explore Dashboard</h4>
      <p>Navigate through the user dashboard to access projects, chat modules, file sharing, and other features.</p>
    </div>
    <div class="feature-box white-box">
      <h3>03</h3>
      <h4>Start a New Project</h4>
      <p>Initiate a new project by defining its scope, adding team members, and setting up milestones.</p>
    </div>
    <div class="feature-box peach-box">
      <h3>04</h3>
      <h4>JIRA Integration</h4>
      <p>Integrate with JIRA to manage tasks, track bugs, and enhance team productivity seamlessly.</p>
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