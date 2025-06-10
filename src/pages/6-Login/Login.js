import React, { useState, useEffect } from "react";
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';  // استيراد المكتبة
import "./login.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Email and password are required!',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK',
        position: 'center',
      });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }


      localStorage.clear();
      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);
      localStorage.setItem('user', JSON.stringify(data.user));

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Login successful!',
        timer: 2000,
        showConfirmButton: false,
        position: 'center',
      });

      // بعد انتهاء التنبيه نعمل التنقل
      setTimeout(() => {
        switch (data.user.role) {
          case 'patient':
            navigate('/');
            break;
          case 'doctor':
            navigate(`/DoctorProfile/${data.user.userId}`);
            break;
          case 'receptionist':
            navigate(`/receptionistProfile/${data.user.userId}`);
            break;
          case 'lab_receptionist':
            navigate('/UploadResults');
            break;
          default:
            navigate('/');
        }
      }, 2000);

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: error.message,
        confirmButtonColor: '#d33',
        confirmButtonText: 'OK',
        position: 'center',
      });
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="login-auth-container">
      <div className="login-main-container">
        <div className="login-form-box">
          <h2 className="login-form-title">Login</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-input-group">
              <label className="login-input-label">Email</label>
              <input
                type="email"
                className="login-input-field"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-input-group">
              <label className="login-input-label">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-input-field"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  style={{
                    backgroundImage: `url(${showPassword ? "/eye-open.png" : "/eye-closed.png"})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}
                />
              </div>
            </div>

            <div className="login-forgot-password">
              <Link to="/forgot-password" className="login-forgot-link">Forgot Password?</Link>
            </div>

            <button type="submit" className="login-submit-btn">Log In</button>

            <div className="login-signup-option">
              <p className="login-signup-text">Or <Link to="/SignUpSelection" className="login-signup-link">Sign Up</Link></p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
