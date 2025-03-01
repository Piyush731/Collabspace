// src/pages/Homepage.js
import React, {useEffect} from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiMessageSquare, FiUsers, FiFile, FiCheckSquare, FiSlack, FiZap  } from 'react-icons/fi';
import { FiMail, FiPhone, FiMapPin, FiTwitter, FiLinkedin } from 'react-icons/fi'
import { FaRocket, FaRegSmileBeam, FaJira } from 'react-icons/fa';
import { Link as ScrollLink } from "react-scroll";
import { Container, Row, Col } from 'react-bootstrap';
import { useInView } from 'react-intersection-observer'; 

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

// Define features array
const features = [
  { icon: <FiUsers />, title: 'Team Collaboration', text: 'Real-time collaboration with integrated chat and video conferencing' },
  { icon: <FiFile />, title: 'Smart File Management', text: 'Version control, advanced sharing permissions, and AI-organized docs' },
  { icon: <FiCheckSquare />, title: 'Task Automation', text: 'Automate repetitive tasks with custom workflows and triggers' },
  { icon: <FaJira />, title: 'Jira Integration', text: 'Seamless integration with Jira for complete project tracking' },
  { icon: <FiSlack />, title: 'Slack Connect', text: 'Direct messaging and channel integration with Slack' },
  { icon: <FiZap />, title: 'AI Assistant', text: '24/7 AI-powered project recommendations and automation' },
];

// Define plans array
const plans = [
  { tier: 'Starter', price: '0', features: ['Basic Collaboration', '5GB Storage', 'Up to 10 Members'], bg: 'bg-slate-800' },
  { tier: 'Pro', price: '19', features: ['Advanced Analytics', 'Unlimited Storage', 'Jira Integration', 'Priority Support'], bg: 'bg-gradient-to-br from-indigo-600 to-blue-600' },
  { tier: 'Enterprise', price: '49', features: ['Custom Workflows', 'SLA', 'Dedicated Support', 'AI Features'], bg: 'bg-slate-800' },
]; 

// src/pages/Homepage.js
function Homepage() {

  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal-animation');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(element => observer.observe(element));
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen  w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white
                     w-screen mx-[-20px] mb-[-20px] px-[20px] pb-[20px] overflow-x-hidden">
      <div className="absolute inset-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-stripes.png')]"></div>
        <div className="absolute left-0 -top-32 -right-32 w-96 h-96 bg-indigo-600 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        
      {/* Hero Section - Updated with animated gradient */}
      <section id="Hero" className="relative min-h-screen w-full flex flex-col justify-center items-center pt-32"> 
        <Container fluid className="h-full px-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mx-auto max-w-full"
          >
            {/* Updated with glass effect and hover scale */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-effect hover-scale mb-8 inline-block px-6 py-2 rounded-full"
            >
              <span className="flex items-center gap-2">
                <FaRocket className="text-indigo-400 animate-float" />
                Welcome to Collabspace 2.0
              </span>
            </motion.div>
            
            {/* Animated gradient text */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Transform Your Team's{' '}
              <span className="animated-gradient-text">
                Productivity
              </span>
            </h1>
            
            {/* Reveal animation for paragraph */}
            <div className="reveal-animation">
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto">
                Revolutionize collaboration with AI-powered workflows, seamless integrations, and real-time synchronization.
              </p>
            </div>

            <div className="flex justify-center gap-4">
              {/* Hover scale added */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-xl font-semibold flex items-center gap-2">
                  Get Started <FiArrowRight />
                </Link>
              </motion.div>
              <ScrollLink
                to="features"
                smooth={true}
                className="glass-effect hover-scale px-8 py-4 rounded-xl cursor-pointer flex items-center gap-2"
              >
                Explore Features
              </ScrollLink>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Features Section - Enhanced with reveal animations */}
      <section id="features" className="py-20 w-full">
        <Container fluid className="px-0">
          <div className="reveal-animation">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="text-center mb-20"
            >
              <h2 className="text-4xl font-bold mb-4 animated-gradient-text">Powerful Features</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Everything you need to manage, collaborate, and succeed
              </p>
            </motion.div>
          </div>

          <Row className="gap-8">
            {features.map((feature, index) => (
              <Col md={4} key={index}>
                {/* Added glass effect and reveal animation */}
                <div className="reveal-animation">
                  <motion.div
                    whileHover={{ y: -10 }}
                    className="glass-effect hover-scale p-8 ml-5 rounded-xl transition-all"
                  >
                    <div className="text-4xl text-indigo-500 mb-4 animate-float">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.text}</p>
                  </motion.div>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Pricing Section - Enhanced with glass effects */}
      <section className="w-full py-20 bg-slate-900/50">
        <Container fluid>
          <div className="text-center mb-20 reveal-animation">
            <h2 className="text-4xl font-bold mb-4 animated-gradient-text">Simple Pricing</h2>
            <p className="text-gray-400">Choose the perfect plan for your team size and needs</p>
          </div>

          <Row className="gap-8 justify-center">
            {plans.map((plan, index) => (
              <Col md={3} key={index}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`glass-effect p-8 rounded-2xl shadow-xl relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -m-8"></div>
                  <h3 className="text-2xl font-bold mb-4">{plan.tier}</h3>
                  <div className="text-4xl font-bold mb-6">
                    ${plan.price}<span className="text-xl text-gray-400">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 reveal-animation">
                        <FiCheckSquare className="text-indigo-400" /> {feature}
                      </li>
                    ))}
                  </ul>
                  <button className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors">
                    Get Started
                  </button>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Enhanced CTA Section */}
<section className="w-full py-20 relative">
  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-blue-600/20"></div>
  <Container fluid>
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="glass-effect backdrop-blur-lg rounded-2xl p-12 border border-slate-700"
    >
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          className="space-y-6"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Empower Your Team, Elevate Your Work
          </h2>
          <div className="space-y-4 text-gray-300">
            <p className="flex items-start gap-3">
              <FiUsers className="flex-shrink-0 text-indigo-400 mt-1" />
              <span><strong>Seamless Collaboration:</strong> Connect in real-time, share ideas, and collaborate efficiently</span>
            </p>
            <p className="flex items-start gap-3">
              <FiCheckSquare className="flex-shrink-0 text-indigo-400 mt-1" />
              <span><strong>Smart Project Management:</strong> Plan, track, and manage projects with intuitive tools</span>
            </p>
            <p className="flex items-start gap-3">
              <FiFile className="flex-shrink-0 text-indigo-400 mt-1" />
              <span><strong>Secure File Sharing:</strong> Collaborate on documents with version control and permissions</span>
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link 
              to="/signup" 
              className="inline-block bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
            >
              Start Free Trial
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Content - Feature Steps */}
        <div className="grid grid-cols-1 gap-6">
          {[
            { number: '01', title: 'Sign Up in Seconds', text: 'Create your account with email and password', bg: 'bg-slate-800' },
            { number: '02', title: 'Explore Dashboard', text: 'Access projects, chat, and files in one place', bg: 'bg-indigo-600/20' },
            { number: '03', title: 'Launch Project', text: 'Define scope, add members, set milestones', bg: 'bg-slate-800' },
            { number: '04', title: 'Integrate Tools', text: 'Connect Jira, Slack, and other essential apps', bg: 'bg-indigo-600/20' },
          ].map((step, index) => (
            <motion.div 
              key={index}
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.2 }}
              className={`${step.bg} p-6 rounded-xl border border-slate-700 hover:border-indigo-500 transition-colors`}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-indigo-400">{step.number}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  </Container>
</section>

{/* Enhanced Contact Section */}
<section id="contact" className="w-full py-20 relative">
  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900/20"></div>
  <Container fluid>
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      className="glass-effect backdrop-blur-lg rounded-2xl p-12 border border-slate-700"
    >
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Contact Info */}
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          className="space-y-8"
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
            Let's Connect
          </h2>
          <div className="space-y-6 text-gray-300">
            <div className="flex items-center gap-4">
              <FiMail className="text-2xl text-indigo-400" />
              <div>
                <p className="font-semibold">Email Us</p>
                <p>support@collabspace.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <FiPhone className="text-2xl text-indigo-400" />
              <div>
                <p className="font-semibold">Call Us</p>
                <p>+91 (73)10703247 </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <FiMapPin className="text-2xl text-indigo-400" />
              <div>
                <p className="font-semibold">Visit Us</p>
                <p>Clement Town, Dehradun</p>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <motion.a whileHover={{ y: -5 }} href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 transition-colors">
              <FiTwitter className="text-2xl" />
            </motion.a>
            <motion.a whileHover={{ y: -5 }} href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 transition-colors">
              <FiLinkedin className="text-2xl" />
            </motion.a>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.form 
          initial={{ x: 50 }}
          whileInView={{ x: 0 }}
          className="space-y-6"
        >
          <motion.div variants={fadeIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                placeholder="john@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
              <textarea 
                rows="4"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500"
                placeholder="Your message..."
              ></textarea>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
            >
              Send Message
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </motion.div>
  </Container>
</section>

    </div>
  );
}
export default Homepage;