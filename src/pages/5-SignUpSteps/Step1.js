import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Step1 = ({ formData, setFormData, nextStep }) => {
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState("");
  const [isUniversityAffiliated, setIsUniversityAffiliated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password) => {
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "password") {
      if (!validatePassword(value)) {
        setPasswordError("Password must be at least 8 characters, include an uppercase letter, a number, and a special character.");
      } else {
        setPasswordError("");
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleAffiliationChange = (e) => {
    const { value } = e.target;
    setIsUniversityAffiliated(value === "yes");
    setFormData({
      ...formData,
      universityAffiliation: value === "yes" ? { ...formData.universityAffiliation, isAffiliated: true } : null
    });
  };

  const handleAffiliationTypeChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      universityAffiliation: {
        ...formData.universityAffiliation,
        type: value,
        id: "" // Reset ID when changing type
      }
    });
  };

  const handleAffiliationIdChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      universityAffiliation: {
        ...formData.universityAffiliation,
        id: value
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validatePassword(formData.password)) {
      setPasswordError("Your password is too weak. Please make it stronger.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    nextStep();
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-box">
        <h2 className="form-title">Step 1/3</h2>

        {/* Personal Information Section */}
        <label>Patient's Name</label>
        <input
          type="text"
          name="name"
          value={formData.name || ""}
          onChange={handleChange}
          className="input-field"
          required
        />

        <label>Age</label>
        <div className="flex-group">
          <select name="day" value={formData.day || ""} onChange={handleChange} className="input-field" required>
            <option value="">Day</option>
            {[...Array(31)].map((_, i) => (
              <option key={`day-${i}`} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <select name="month" value={formData.month || ""} onChange={handleChange} className="input-field" required>
            <option value="">Month</option>
            {[...Array(12)].map((_, i) => (
              <option key={`month-${i}`} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
          <select name="year" value={formData.year || ""} onChange={handleChange} className="input-field" required>
            <option value="">Year</option>
            {[...Array(100)].map((_, i) => (
              <option key={`year-${i}`} value={2025 - i}>
                {2025 - i}
              </option>
            ))}
          </select>
        </div>

        <label>Gender</label>
        <div className="gender-group">
          <label>
            <input type="radio" name="gender" value="Male" checked={formData.gender === "Male"} onChange={handleChange} required />
            Male
          </label>
          <label>
            <input type="radio" name="gender" value="Female" checked={formData.gender === "Female"} onChange={handleChange} required />
            Female
          </label>
        </div>

        {/* Contact Information Section */}
        <label>Mobile Number</label>
        <input type="tel" name="mobile" value={formData.mobile || ""} onChange={handleChange} className="input-field" required />

        <label>Email</label>
        <input type="email" name="email" value={formData.email || ""} onChange={handleChange} className="input-field" required />

        {/* University Affiliation Section */}
        <label>Are you a student or an emplye on MUST University?</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="universityAffiliated"
              value="yes"
              checked={isUniversityAffiliated}
              onChange={handleAffiliationChange}
            />
            Yes
          </label>
          <label>
            <input
              type="radio"
              name="universityAffiliated"
              value="no"
              checked={!isUniversityAffiliated}
              onChange={handleAffiliationChange}
            />
            No
          </label>
        </div>

        {isUniversityAffiliated && (
          <>
            <label>Your Affiliation Type</label>
            <select
              name="affiliationType"
              value={formData.universityAffiliation?.type || ""}
              onChange={handleAffiliationTypeChange}
              className="input-field"
              required
            >
              <option value="">Select your role</option>
              <option value="student">Student</option>
              <option value="Teaching Assistant">Teaching Assistant </option>
              <option value="doctor">University Doctor</option>
            </select>

            {formData.universityAffiliation?.type && (
              <>
                <label>Your {formData.universityAffiliation.type} ID</label>
                <input
                  type="text"
                  name="affiliationId"
                  value={formData.universityAffiliation?.id || ""}
                  onChange={handleAffiliationIdChange}
                  className="input-field"
                  placeholder={`Enter your ${formData.universityAffiliation.type} ID`}
                  required
                />
              </>
            )}
          </>
        )}

{/* Password Section */}
<label>Password</label>
<div className="password-input-container">
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    value={formData.password || ""}
    onChange={handleChange}
    className="input-field"
    required
  />
  <span
    className="password-toggle"
    onClick={togglePasswordVisibility}
    style={{
      backgroundImage: `url(${showPassword ? "/eye-open.png" : "/eye-closed.png"})`
    }}
  />
</div>
{passwordError && <p className="error-text">{passwordError}</p>}

<label>Confirm Password</label>
<div className="password-input-container">
  <input
    type={showConfirmPassword ? "text" : "password"}
    name="confirmPassword"
    value={formData.confirmPassword || ""}
    onChange={handleChange}
    className="input-field"
    required
  />
  <span
    className="password-toggle"
    onClick={toggleConfirmPasswordVisibility}
    style={{
      backgroundImage: `url(${showConfirmPassword ? "/eye-open.png" : "/eye-closed.png"})`
    }}
  />
</div>

        <button type="submit" className="btn-btn-primary">
          Continue
        </button>

        <p className="text-center">
          Already have an account?{" "}
          <span className="login-link" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </form>
    </div>
  );
};

export default Step1;