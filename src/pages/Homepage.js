// src/pages/Homepage.js
import React, { useRef, useMemo, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { FiArrowRight, FiMessageSquare, FiUsers, FiFile, FiCheckSquare, FiSlack, FiZap } from 'react-icons/fi';
import { FiMail, FiPhone, FiMapPin, FiTwitter, FiLinkedin } from 'react-icons/fi';
import { FaRocket, FaRegSmileBeam, FaJira } from 'react-icons/fa';
import { Link as ScrollLink } from "react-scroll";
import { Container, Row, Col } from 'react-bootstrap';
import { useInView } from 'react-intersection-observer';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error in 3D scene:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null; // Return null to hide the 3D scene if there's an error
    }

    return this.props.children;
  }
}

// Enhanced Particle Background Component
function ParticleBackground() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress || 0, [0, 1], [0, 50]);
  const particlesRef = useRef();

  const particlesGeometry = useMemo(() => {
    const count = 3000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40;
      positions[i + 1] = (Math.random() - 0.5) * 40;
      positions[i + 2] = (Math.random() - 0.5) * 40 - 5;
      
      colors[i] = Math.random() * 0.4 + 0.5;
      colors[i + 1] = Math.random() * 0.3 + 0.3;
      colors[i + 2] = Math.random() * 0.4 + 0.6;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, []);

  const particlesMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      const time = state.clock.getElapsedTime();
      const yValue = y ? y.get() : 0;
      particlesRef.current.rotation.y = yValue * 0.02;
      particlesRef.current.rotation.x = Math.sin(time * 0.2) * 0.2;
    }
  });

  return (
    <points ref={particlesRef}>
      <primitive object={particlesGeometry} attach="geometry" />
      <primitive object={particlesMaterial} attach="material" />
    </points>
  );
}

// Enhanced Ring Component with better movement
function Ring() {
  const { scrollYProgress } = useScroll();
  const ringRef = useRef();
  
  // More dynamic position movement with center focus
  const position = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [
      [15, 15, -5],      // Start: top right
      [-10, 5, 0],       // Move to middle left
      [10, -15, 5],      // Move to bottom right
      [-15, -10, 0],     // Move up and left
      [-15, 15, -5]      // End: top left
    ]
  );

  // Enhanced rotation patterns
  const rotationX = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 4]);
  const rotationY = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 3]);
  const rotationZ = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 5]);

  // Dynamic scale for more interesting movement
  const scale = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], [1, 1.3, 1, 1.3, 1]);

  useFrame((state) => {
    if (ringRef.current) {
      const pos = position.get();
      ringRef.current.position.set(pos[0], pos[1], pos[2]);
      
      // Apply all rotations
      ringRef.current.rotation.x = rotationX.get();
      ringRef.current.rotation.y = rotationY.get();
      ringRef.current.rotation.z = rotationZ.get();
      
      // Apply scale
      const currentScale = scale.get();
      ringRef.current.scale.set(currentScale, currentScale, currentScale);
    }
  });

  return (
    <group ref={ringRef}>
      {/* Main ring body */}
      <mesh>
        <torusGeometry args={[4, 0.8, 32, 100]} />
        <meshStandardMaterial 
          color="#4f46e5" 
          emissive="#4f46e5"
          emissiveIntensity={0.8}
          metalness={0.7}
          roughness={0.2}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Inner ring for depth */}
      <mesh>
        <torusGeometry args={[3.2, 0.3, 32, 100]} />
          <meshStandardMaterial
          color="#6366f1"
          emissive="#6366f1"
            emissiveIntensity={0.5}
            metalness={0.5}
          roughness={0.3}
          transparent
          opacity={0.7}
          />
        </mesh>
      
      {/* Outer ring for depth */}
      <mesh>
        <torusGeometry args={[4.8, 0.3, 32, 100]} />
        <meshStandardMaterial 
          color="#6366f1"
          emissive="#6366f1"
          emissiveIntensity={0.5}
          metalness={0.5}
          roughness={0.3}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

// Main Scene Component
function Scene() {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <Canvas 
          camera={{ position: [0, 0, 15], fov: 60 }}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 0 }}
        >
          <color attach="background" args={['#0f172a']} />
          <ambientLight intensity={1.0} />
          <pointLight position={[10, 10, 10]} intensity={2.0} />
          <pointLight position={[-10, -10, -10]} intensity={1.0} />
          <ParticleBackground />
          <Ring />
          <EffectComposer>
            <Bloom intensity={1.2} luminanceThreshold={0.1} />
          </EffectComposer>
        </Canvas>
      </Suspense>
    </ErrorBoundary>
  );
}

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

function Homepage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-x-hidden relative">
      {/* 3D Scene */}
      <div className="fixed inset-0 z-0">
        <Scene />
      </div>

      {/* Content wrapper with proper z-indexing */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section id="Hero" className="relative min-h-screen w-full flex flex-col justify-center items-center pt-32">
          <Container fluid className="h-full px-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mx-auto max-w-full relative z-10"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mb-8 inline-block px-6 py-2 rounded-full"
              >
                <span className="flex items-center gap-2">
                  <FaRocket className="text-indigo-400 animate-float" />
                  Welcome to Collabspace 2.0
                </span>
              </motion.div>

              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Transform Your Team's{' '}
                <span className="animated-gradient-text">
                  Productivity
                </span>
              </motion.h1>

              <motion.p 
                className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Revolutionize collaboration with AI-powered workflows, seamless integrations, and real-time synchronization.
              </motion.p>

              <motion.div 
                className="flex justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-xl font-semibold flex items-center gap-2">
                    Get Started <FiArrowRight />
                  </Link>
                </motion.div>
                <ScrollLink
                  to="features"
                  smooth={true}
                  className="px-8 py-4 rounded-xl cursor-pointer flex items-center gap-2"
                >
                  Explore Features
                </ScrollLink>
              </motion.div>
            </motion.div>
          </Container>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-blue-600/5"></div>
          <Container fluid>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <motion.h2 
                className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Powerful Features
              </motion.h2>
              <motion.p 
                className="text-gray-400 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Everything you need to manage, collaborate, and succeed
              </motion.p>
            </motion.div>

            <Row className="gap-8 justify-center">
              {features.map((feature, index) => (
                <Col md={4} key={index}>
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="p-8 rounded-2xl bg-slate-900/50 border border-slate-700/30 hover:border-indigo-500/50 transition-all duration-300 group"
                  >
                    <motion.div 
                      className="text-4xl text-indigo-500 mb-4 inline-block"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-400 transition-colors">{feature.title}</h3>
                    <p className="text-gray-400">{feature.text}</p>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 to-slate-800/20"></div>
          <Container fluid>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <motion.h2 
                className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Simple Pricing
              </motion.h2>
              <motion.p 
                className="text-gray-400"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Choose the perfect plan for your team size and needs
              </motion.p>
            </motion.div>

            <Row className="gap-8 justify-center">
              {plans.map((plan, index) => (
                <Col md={3} key={index}>
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.2 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className={`${plan.bg} p-8 rounded-2xl shadow-xl relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -m-8"></div>
                    <h3 className="text-2xl font-bold mb-4">{plan.tier}</h3>
                    <div className="text-4xl font-bold mb-6">
                      ${plan.price}<span className="text-xl text-gray-400">/mo</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <motion.li 
                          key={i} 
                          className="flex items-center gap-2"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <FiCheckSquare className="text-indigo-400" /> {feature}
                        </motion.li>
                      ))}
                    </ul>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                      Get Started
                    </motion.button>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

         {/* Enhanced CTA Section */}
         <section className="w-full py-20 relative">
         <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-blue-600/5"></div>
          <Container fluid>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl p-12 border border-slate-700 bg-slate-900/50"
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

        {/* Contact Section */}
        <section id="contact" className="w-full py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-indigo-900/10"></div>
          <Container fluid>
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid md:grid-cols-2 gap-12 items-center"
            >
              {/* Contact Info */}
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                  Let's Connect
                </h2>
                <div className="space-y-6 text-gray-300">
                  <div className="flex items-center gap-4 group">
                    <div className="p-3 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                      <FiMail className="text-2xl text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-semibold">Email Us</p>
                      <p>support@collabspace.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="p-3 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                      <FiPhone className="text-2xl text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-semibold">Call Us</p>
                      <p>+91 (73)10703247</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="p-3 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 transition-colors">
                      <FiMapPin className="text-2xl text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-semibold">Visit Us</p>
                      <p>Clement Town, Dehradun</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <motion.a 
                    whileHover={{ y: -5 }} 
                    href="#" 
                    className="p-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
                  >
                    <FiTwitter className="text-2xl" />
                  </motion.a>
                  <motion.a 
                    whileHover={{ y: -5 }} 
                    href="#" 
                    className="p-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
                  >
                    <FiLinkedin className="text-2xl" />
                  </motion.a>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.form 
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                      placeholder="john@company.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                    <textarea 
                      rows="4"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/30 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
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
                </div>
              </motion.form>
            </motion.div>
          </Container>
        </section>

      </div>
    </div>
  );
}

export default Homepage;