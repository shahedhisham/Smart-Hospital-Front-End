import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ourdoctors.css";

const OurDoctors = () => {
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setIsLoggedIn(true);
      setUserName(userData.name);
    }
  }, []);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors`);
        if (!response.ok) throw new Error("Failed to fetch doctors");
        const data = await response.json();
        setDoctors(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDoctors();
  }, []);


  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId;
  const role = user?.role;

  const calculateAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
    return sum / ratings.length;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="star">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="star">½</span>);
    }
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }
    return stars;
  };


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
              <Link to={`/${role}Profile/${userId}`} className="About-welcome-message">
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
        <div className="ourdoctors-grid-container">
          <h2 className="oursection-title">Our Medical Specialists</h2>
          <p className="oursection-subtitle">Top-rated healthcare professionals</p>

          {loading && <p>Loading doctors...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}

          {!loading && !error && (
            <div className="ourcompact-doctors-grid">
              {doctors.length === 0 && <p>No doctors found.</p>}
              {doctors.map((doctor) => {
                const avgRating = calculateAverageRating(doctor.Rating);
                return (
                  <div key={doctor.userId} className={`ourcompact-doctor-card ${doctor.className || ""}`}>
                    <div className="ourdoctor-image-container">
                      <img
                        src={doctor.profileImage || "logo1.png"}
                        alt={doctor.name}
                        className="ourdoctor-image"
                      />
                    </div>
                    <div className="ourcompact-doctor-info">
                      <h3 className="ourdoctor-name">{doctor.name}</h3>
                      <p className="ourdoctor-title">{doctor.specializationShort}</p>
                      <div className="ourdoctor-rating">
                        <div className="starss">
                          {renderStars(avgRating)}
                          <span className="rating-valuee">{avgRating.toFixed(1)}</span>
                        </div>
                        <p className="review-count">({doctor.Rating.length} reviews)</p>
                      </div>
                      <div className="ourdoctor-description">
                        <p>{doctor.education}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
                26th of July Corridor<br />6th of October, Egypt
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

export default OurDoctors;
