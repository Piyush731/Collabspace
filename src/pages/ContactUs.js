import React, { useState }from "react";
import { motion } from 'framer-motion'; 
import Sidebar from "../components/sidebar";
import UserNavbar from "../components/UserNavbar";
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import { FiHeadphones, FiLifeBuoy } from 'react-icons/fi';
import { FaBuilding, FaUsers } from "react-icons/fa"; 

const ContactUs = () => {

  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen); 
  return (
    <motion.div
      className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white
                  w-screen mx-[-20px] mb-[-20px] px-[20px] pb-[20px] overflow-x-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/dark-stripes.png')]"></div> 
      <UserNavbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="max-w-6xl mx-auto pt-12 mt-4"> 
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          variants={itemVariants}
        >
          <motion.h1
            className="text-4xl font-bold mb-4"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            Contact Us
          </motion.h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Let's create something amazing together! Reach out to our team for support, partnerships, 
            or just to say hello. We're here to help 24/7.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            className="bg-slate-800/50 backdrop-blur-md p-8 rounded-xl shadow-2xl"
            variants={itemVariants}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FaPaperPlane className="text-blue-400" />
              Send a Message
            </h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-700/30 border border-slate-600 rounded-lg p-3
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full bg-slate-700/30 border border-slate-600 rounded-lg p-3
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="hello@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  rows="4"
                  className="w-full bg-slate-700/30 border border-slate-600 rounded-lg p-3
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 px-6 rounded-lg font-medium
                          flex items-center justify-center gap-2 transition-all"
              >
                Send Message
                <FaPaperPlane className="text-sm" />
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <div className="space-y-8">
            {/* Support Channels */}
            <motion.div
              className="grid md:grid-cols-2 gap-6"
              variants={itemVariants}
            >
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl">
                <FiLifeBuoy className="text-3xl text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Technical Support</h3>
                <p className="text-gray-400">24/7 dedicated support for technical issues</p>
                <p className="text-blue-400 mt-3">support@collabspace.com</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl">
                <FiHeadphones className="text-3xl text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">General Inquiry</h3>
                <p className="text-gray-400">For partnerships and general questions</p>
                <p className="text-blue-400 mt-3">hello@collabspace.com</p>
              </div>
            </motion.div>

            {/* Contact Details */}
            <motion.div
              className="bg-slate-800/50 backdrop-blur-md p-8 rounded-xl space-y-6"
              variants={itemVariants}
            >
              <div className="flex items-center gap-4">
                <FaMapMarkerAlt className="text-2xl text-blue-400 flex-shrink-0" />
                <div>
                  <h3 className="font-medium mb-1">Headquarters</h3>
                  <p className="text-gray-400">123 Tech Valley Drive<br/>San Francisco, CA 94107</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FaPhone className="text-2xl text-blue-400 flex-shrink-0" />
                <div>
                  <h3 className="font-medium mb-1">Phone</h3>
                  <p className="text-gray-400">+91 (73)10703247 <br/>Mon-Fri: 9AM - 5PM PST</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Team Section */}
        <motion.div
          className="mt-16 grid md:grid-cols-2 gap-8"
          variants={itemVariants}
        >
          <div className="relative group overflow-hidden rounded-xl"> 
            <FaBuilding className="text-4xl text-gray-400 w-full h-64 object-cover transform group-hover:scale-105 transition-all duration-500" /> 
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 p-6 flex items-end">
              <h3 className="text-xl font-semibold">Visit Our Headquarters</h3>
            </div>
          </div>
          <div className="relative group overflow-hidden rounded-xl"> 
            <FaUsers className="w-full h-64 object-cover transform group-hover:scale-105 transition-all duration-500" />  
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 p-6 flex items-end">
              <h3 className="text-xl font-semibold">Meet Our Support Team</h3>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ContactUs;