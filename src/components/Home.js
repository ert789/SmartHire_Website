import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from './NavBar.js'; // Import the Navbar component
import Footer from './Footer.js'
import introImage from '../1st.jpeg';
import aboutUsImage from '../2nd.jpeg';
import './Home.css'; // Import the new CSS file

const Home = () => {
  return (
    <div className="home-container">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="main-content">
        <section className="section mb-5">
          {/* Left Side: Text */}
          <div className="left-side-text">
            <h2 className="main-heading">SmartHire</h2>
            <p className="lead-text">
              Your one-stop solution for efficient recruitment and job matching.
            </p>
            <Link to="/role-selection">
              <button className="btn-custom">
                Get Started
              </button>
            </Link>
          </div>

          {/* Right Side: Image */}
          <div className="right-side-image">
            <img
              src={introImage}
              alt="introImage"
              className="image-custom"
            />
          </div>
        </section>

        <hr className="hr-style" />

        <section className="section-choose">
          {/* Left Side: Image */}
          <div className="left-side-image">
            <img
              src={aboutUsImage}
              alt="Why Choose Us"
              className="image-custom"
            />
          </div>

          {/* Right Side: Text */}
          <div className="left-side-text text-center-custom">
            <h3 className="mb-4" style={{color: 'white'}}>Why Choose Us?</h3>
            <div className="d-flex flex-column align-items-center" style={{ gap: '20px' }}>
              <div className="p-4 shadow rounded card-custom text-center">
                <h4>AI-Powered Screening</h4>
                <p>Our advanced AI analyzes resumes to quickly match candidates with the best job opportunities, streamlining the hiring process and ensuring top talent is never overlooked.</p>
              </div>
              <div className="p-4 shadow rounded card-custom text-center">
                <h4>Quick & Easy</h4>
                <p>With an intuitive interface, both candidates and hiring managers can navigate effortlessly, ensuring a smooth experience from application submission to job offer.</p>
              </div>
              <div className="p-4 shadow rounded card-custom text-center">
                <h4>Data Security</h4>
                <p>Your privacy is our priority. All personal and professional data is encrypted and securely stored, ensuring full compliance with the latest data protection regulations.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;