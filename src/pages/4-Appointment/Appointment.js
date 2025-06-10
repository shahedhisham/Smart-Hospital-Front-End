import { useEffect, useState } from "react"; // Add these imports
import { Link } from 'react-router-dom';
import './appointment.css';
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Appointment = () => {
    const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userData, setUserData] = useState(null);
  const { id } = useParams();
  const [doctors, setDoctors] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setIsLoggedIn(true);
      setUserName(parsedUser.name);
      setUserData(parsedUser);
    }

    const fetchDoctor = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-category-doctors/${id}`);
        setDoctors(response.data.doctors);
        console.log(response.data.doctors);
      } catch (error) {
        console.error("Error fetching doctor details:", error);
      }
    };

    fetchDoctor();
  }, [id]);


  return (
    <>
      <header className="contact-header">
        <div className="nav-logo">
          <img src="/logo.png" alt="Hospital Logo" className="hospital-logo" />
        </div>
        <nav className="navbar1">
          <ul className="nav-links1">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
          <div className="nav-right">
            {isLoggedIn ? (
              <Link to={`/${userData.role}Profile/${userData.userId}`} className="welcome-message">
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
        <div className="appointment-doctors-container">
          <h2>Available Doctors</h2>
          {!doctors || doctors.length === 0 ? (
            <h2 style={{ textAlign: "center", fontSize: "32px" }}>
              لا يوجد دكاترة في هذا القسم
            </h2>
          ) : (
            <div className="appointment-doctors-grid">
              {doctors.map((doctor) => (
                <div key={doctor.userId} className="appointment-doctor-card">
                  <div className="appointment-doctor-image">
                    <img
                      src={doctor.profileImage || '/main-logo.png'}
                      alt={doctor.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/main-logo.png";
                      }}
                    />
                  </div>
                  <div className="appointment-doctor-info">
                    <h3>{doctor.name}</h3>
                    <p className="appointment-doctor-title">{doctor.education}</p>
                    <button className="appointment-book-button"
                      onClick={() => navigate(`/DoctorDetails/${doctor.userId}`, { state: { doctor } })}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </>
  );
}

export default Appointment;