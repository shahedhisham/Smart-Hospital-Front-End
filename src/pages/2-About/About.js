import { Link } from "react-router-dom";
import { useEffect, useState } from "react"; // Add these imports

import "./about.css";
const AboutUs = () => {
    const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;
  const role = user?.role;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  // Check if user is logged in when component mounts
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setIsLoggedIn(true);
      setUserName(userData.name); // Assuming you store the name in your user object
    }
  }, [])
  return (
    <>
<header className="contact-header">
  <div className="nav-logo">
    <img src="logo.png" alt="Hospital Logo" className="hospital-logo" />
  </div>
  <nav className="navbar1">
    <ul className="nav-links1">
      <li><Link to="/">Home</Link></li>
      <li><Link to="/about">About Us</Link></li>
      <li><Link to="/contact">Contact Us</Link></li>
    </ul>
    <div className="nav-right">
      {isLoggedIn ? (
            <Link to={`/${role}Profile/${userId}`} className="welcome-message">
              Hello, {userName}
            </Link>
      ) : (
        <>
          <Link to="/LogIn">Log In</Link>
          <Link to="/SignUpSelection">Sign Up</Link>
        </>
      )}
    </div>
  </nav>
</header>
      <main>
        <div className="big-logo">
          <img
            src="logo1.png"
            alt="Hospital Logo"
            className="big-hospital-logo"
          />
        </div>
        <div className="note">
          <p>
            Souad Kafafi University Hospital (SKUH) is a premier healthcare
            institution in Egypt, affiliated with Misr University for Science
            and Technology (MUST). Dedicated to excellence in medical care,
            education, and research, we provide cutting-edge treatments across
            multiple specialties, including cardiology, oncology, neurology, and
            orthopedics.
          </p>
        </div>
        <div className="container3">
          <div className="card-text">
            <h2>Education & Research</h2>
            <p>
              At SKUH, we believe in the power of education and research to
              transform healthcare. As a teaching hospital, we provide hands-on
              training to future medical professionals, ensuring they gain the
              knowledge and expertise needed to excel in their fields. Our
              commitment to medical research allows us to stay at the forefront
              of medical advancements, offering patients the most effective
              treatments available.
            </p>
          </div>
          <div className="card-image">
            <img src="doctours.png" alt="Doctors" />
          </div>
        </div>
        <section className="why-choose-us">
          <div className="header-section">
            <h1 className="page-title">Why Choose Us</h1>
            <p className="page-intro">
              Choose Squad Kafafi University Hospital for exceptional care,
              advanced expertise, and a patient-centered approach that
              prioritizes your health and well-being.
            </p>
          </div>

          <div className="features-grid">
            {[
              {
                title: "Exceptional Expertise",
                text: "Our healthcare professionals are highly skilled and dedicated to providing top-notch medical expertise across a broad spectrum of specialties.",
              },
              {
                title: "Patient-Centered Approach",
                text: "We offer holistic care that places the patient at the center, ensuring personalized treatment, comfort, and overall well-being.",
              },
              {
                title: "Advanced Technology",
                text: "Our hospital is equipped with state-of-the-art technology and modern facilities, enabling accurate diagnoses and effective treatments.",
              },
              {
                title: "Comprehensive Services",
                text: "We provide a wide range of services under one roof including preventive care, diagnostics, surgeries, and rehabilitation.",
              },
              {
                title: "Community Engagement",
                text: "We are actively involved in community outreach and health education to improve healthcare accessibility and promote wellness.",
              },
            ].map((feature, index) => (
              <div key={index} className="feature-card">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-text">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
  <div className="footer__content">
    <img
      src="Hosptal1.png"
      alt="Hospital Building"
      className="footer__image"
    />

    <div className="footer-links">
      <h3>Quick Links</h3>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/contact">Contact Us</Link></li>
        <li><Link to="/OurDoctors">Our Doctors</Link></li>
      </ul>
    </div>

    {/* Contact Section with your original image icons */}
    <div className="footer-contact">
      <h3>Get in Touch</h3>
      <div className="footer-contact-item">
        <a href="tel:16111" className="footer-contact-link">Call Us: 16111</a>
      </div>
      
      <div className="footer-contact-item">
        <a 
          href="https://maps.google.com?q=26th+of+July+Corridor,+6th+of+October,+Egypt" 
          target="_blank" 
          rel="noopener noreferrer"
          className="footer-contact-link"
        >
          26th of July Corridor<br/>6th of October, Egypt
        </a>
      </div>
      
      <div className="footer-contact-item">
        <a href="mailto:info@souadkafafihospital.com" className="footer-contact-link">
          info@souadkafafihospital.com
        </a>
      </div>
      <div className="footer__social-icons">
        <a
          href="https://www.instagram.com/souad_kafafi_hospital"
          aria-label="Instagram"
          className="footer__social-icon"
        >
          <img src="instagram.png" alt="Instagram" />
        </a>
        <a
          href="https://x.com/themskuh"
          aria-label="Twitter"
          className="footer__social-icon"
        >
          <img src="twitter.png" alt="Twitter" />
        </a>
        <a href="https://m.facebook.com/themskuh" aria-label="Facebook" className="footer__social-icon">
          <img src="facebook.png" alt="Facebook" />
        </a>
      </div>
    </div>
  </div>

  <div className="footer__copyright">
    <p>© 2025 Souad Kafafi Hospital. All Rights Reserved.</p>
  </div>
</footer>
    </>
  );
};

export default AboutUs;
