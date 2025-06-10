import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./EmployeeSignUp.css";

const LabSignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: "male",
    birthDate: "2000-01-01",
    supervisorDoctorId: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    if (name === 'password') {
      const newValidation = {
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      };
      setPasswordValidation(newValidation);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email is required';
    if (!formData.phone || formData.phone.length < 10) newErrors.phone = 'Valid phone number is required';

    // Enhanced password validation
    if (!passwordValidation.length) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!passwordValidation.uppercase || !passwordValidation.number || !passwordValidation.specialChar) {
      newErrors.password = 'Password must include an uppercase letter, a number, and a special character';
    }

    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords must match';

    if (!formData.supervisorDoctorId.trim()) newErrors.supervisorDoctorId = 'Supervisor Doctor is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/create-lab-receptionist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          password: formData.password,
          phone: formData.phone,
          email: formData.email,
          gender: formData.gender,
          birthDate: formData.birthDate,
          supervisorDoctorId: formData.supervisorDoctorId,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong");

      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPasswordValid = passwordValidation.length &&
    passwordValidation.uppercase &&
    passwordValidation.number &&
    passwordValidation.specialChar;

  return (
    <div className="employee-signup-container">
      <div className="employee-signup-box">
        <h2 className="employee-signup-title">Lab Receptionist Registration</h2>

        {success && (
          <div className="employee-signup-alert success">
            Registration successful! Redirecting...
          </div>
        )}

        {errors.submit && (
          <div className="employee-signup-alert error">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="employee-signup-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name*</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label>Last Name*</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Email Address*</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Phone Number*</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label>Date of Birth*</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label>Supervisor Doctor ID*</label>
            <input
              type="text"
              name="supervisorDoctorId"
              value={formData.supervisorDoctorId}
              onChange={handleChange}
              className={errors.supervisorDoctorId ? 'error' : ''}
              placeholder="Enter Supervisor Doctor ID"
            />
            {errors.supervisorDoctorId && (
              <span className="error-message">{errors.supervisorDoctorId}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password*</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    backgroundImage: `url(${showPassword ? "/eye-open.png" : "/eye-closed.png"})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}
                />
              </div>
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
              {formData.password && !isPasswordValid && (
                <div className="password-requirements">
                  <p className="password-requirement" style={{ color: passwordValidation.length ? 'green' : 'red' }}>
                    • At least 8 characters
                  </p>
                  <p className="password-requirement" style={{ color: passwordValidation.uppercase ? 'green' : 'red' }}>
                    • At least one uppercase letter
                  </p>
                  <p className="password-requirement" style={{ color: passwordValidation.number ? 'green' : 'red' }}>
                    • At least one number
                  </p>
                  <p className="password-requirement" style={{ color: passwordValidation.specialChar ? 'green' : 'red' }}>
                    • At least one special character
                  </p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Confirm Password*</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                />
                <span
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    backgroundImage: `url(${showConfirmPassword ? "/eye-open.png" : "/eye-closed.png"})`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center'
                  }}
                />
              </div>
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </div>
      </div>
    </div>
  );
};

export default LabSignUp;
