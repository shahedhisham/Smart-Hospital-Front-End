import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./SignUp.css"
const SignUp = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    day: '',
    month: '',
    year: '',
    gender: 'male',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    universityAffiliation: {
      isAffiliated: false,
      type: '',
      id: ''
    },
    emergencyContact: '',
    emergencyRelation: '',
    emergencyContactNumber: '',
    conditions: {},
    additionalNotes: ''
  });

  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const specializations = ['Student', 'Teaching Assistant', 'University Doctor'];
  const relationships = ['Parent', 'Sibling', 'Spouse', 'Friend', 'Other'];
  const commonConditions = [
    'Diabetes', 'High Blood Pressure', 'Heart Disease', 'Asthma', 'Drug Allergy',
    'Liver Disease', 'Kidney Disease', 'Thyroid Disorder', 'Epilepsy',
    'Mental Health Issues', 'Cancer', 'Chronic Pain', 'Anemia', 'Obesity', 'Arthritis', 'Stroke'
  ];

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

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

  const handleAffiliationChange = (e) => {
    const { value } = e.target;
    const isAffiliated = value === "yes";
    setFormData({
      ...formData,
      universityAffiliation: {
        ...formData.universityAffiliation,
        isAffiliated,
        type: isAffiliated ? formData.universityAffiliation.type : '',
        id: isAffiliated ? formData.universityAffiliation.id : ''
      }
    });
  };

  const handleAffiliationTypeChange = (e) => {
    const { value } = e.target;
    setFormData({
      ...formData,
      universityAffiliation: {
        ...formData.universityAffiliation,
        type: value,
        id: ''
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

  const handleConditionChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      conditions: {
        ...formData.conditions,
        [name]: checked
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordError) {
      alert("Please fix password errors before submitting.");
      return;
    }

    // جهز بيانات تناسب الباك، لازم تحول data حسب ما الباك متوقع
    const birthDate = `${formData.year}-${formData.month.padStart(2, '0')}-${formData.day.padStart(2, '0')}`;

    // جهز medicalHistory من conditions المختارة
    const medicalHistory = Object.entries(formData.conditions)
      .filter(([_, checked]) => checked)
      .map(([condition]) => condition);

    // جهز بيانات الجامعة (لو مش منتمٍ) خليها null أو ""
    const university = formData.universityAffiliation.isAffiliated
      ? formData.universityAffiliation.type // أو أي قيمة سترينج مناسبة تمثل الجامعة
      : "";

    const bodyData = {
      username: formData.email,  // انت بتستخدم الايميل كاسم مستخدم؟ لو لأ غيرها
      password: formData.password,
      gender: formData.gender,
      phone: formData.mobile,
      birthDate,
      email: formData.email,
      name: formData.name,
      emergencyContactName: formData.emergencyContact,
      emergencyContactNumber: formData.emergencyContactNumber,
      emergencyContactRelationship: formData.emergencyRelation,
      medicalHistory,
      additionalNotes: formData.additionalNotes,
      university,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert("Error: " + errorData.message);
        return;
      }

      const data = await response.json();

      localStorage.setItem("token", data.token);
      alert("تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول.");
      navigate("/login");
    } catch (error) {
      alert("Network error: " + error.message);
    }
  };


  const renderStep1 = () => (
    <div className="form-box">
      <h2 className="form-title">Step 1/3</h2>

      <label>Patient's Name</label>
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleChange}
        className="input-field"
        required
      />

      <label>Date of Birth</label>
      <div className="flex-group">
        <select name="day" value={formData.day} onChange={handleChange} className="input-field" required>
          <option value="">Day</option>
          {[...Array(31)].map((_, i) => (
            <option key={`day-${i}`} value={i + 1}>{i + 1}</option>
          ))}
        </select>
        <select name="month" value={formData.month} onChange={handleChange} className="input-field" required>
          <option value="">Month</option>
          {[...Array(12)].map((_, i) => (
            <option key={`month-${i}`} value={i + 1}>{i + 1}</option>
          ))}
        </select>
        <select name="year" value={formData.year} onChange={handleChange} className="input-field" required>
          <option value="">Year</option>
          {[...Array(100)].map((_, i) => (
            <option key={`year-${i}`} value={2025 - i}>{2025 - i}</option>
          ))}
        </select>
      </div>

      <label>Gender</label>
      <div className="gender-group">
        <label>
          <input
            type="radio"
            name="gender"
            value="male"   // خليها lowercase
            checked={formData.gender === "male"}
            onChange={handleChange}
            required
          />
          Male
        </label>
        <label>
          <input
            type="radio"
            name="gender"
            value="female" // خليها lowercase
            checked={formData.gender === "female"}
            onChange={handleChange}
            required
          />
          Female
        </label>
      </div>


      <label>Mobile Number</label>
      <input
        type="tel"
        name="mobile"
        value={formData.mobile}
        onChange={handleChange}
        className="input-field"
        required
      />

      <label>Email</label>
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        className="input-field"
        required
      />

      <label>Are you affiliated with MUST University?</label>
      <div className="radio-group">
        <label>
          <input
            type="radio"
            name="universityAffiliated"
            value="yes"
            checked={formData.universityAffiliation.isAffiliated}
            onChange={handleAffiliationChange}
          />
          Yes
        </label>
        <label>
          <input
            type="radio"
            name="universityAffiliated"
            value="no"
            checked={!formData.universityAffiliation.isAffiliated}
            onChange={handleAffiliationChange}
          />
          No
        </label>
      </div>

      {formData.universityAffiliation.isAffiliated && (
        <>
          <label>Your Affiliation Type</label>
          <select
            name="affiliationType"
            value={formData.universityAffiliation.type}
            onChange={handleAffiliationTypeChange}
            className="input-field"
            required
          >
            <option value="">Select your role</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>

          {formData.universityAffiliation.type && (
            <>
              <label>Your {formData.universityAffiliation.type} ID</label>
              <input
                type="text"
                name="affiliationId"
                value={formData.universityAffiliation.id}
                onChange={handleAffiliationIdChange}
                className="input-field"
                required
              />
            </>
          )}
        </>
      )}

      <label>Password</label>
      <div className="password-input-container">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="input-field"
          required
        />
        <span
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
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
          value={formData.confirmPassword}
          onChange={handleChange}
          className="input-field"
          required
        />
        <span
          className="password-toggle"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          style={{
            backgroundImage: `url(${showConfirmPassword ? "/eye-open.png" : "/eye-closed.png"})`
          }}
        />
      </div>

      <button type="button" className="btn btn-primary" onClick={nextStep}>
        Continue
      </button>

      <p className="text-center">
        Already have an account?{" "}
        <span className="login-link" onClick={() => navigate("/login")}>
          Login
        </span>
      </p>
    </div>
  );

  const renderStep2 = () => (
    <div className="form-box">
      <h2 className="form-title">Step 2/3</h2>

      <label>Emergency Contact Name</label>
      <input
        type="text"
        name="emergencyContact"
        value={formData.emergencyContact}
        onChange={handleChange}
        className="input-field"
      />

      <label>Relationship</label>
      <select
        name="emergencyRelation"
        value={formData.emergencyRelation}
        onChange={handleChange}
        className="input-field"
      >
        <option value="">Select Relationship</option>
        {relationships.map((rel) => (
          <option key={rel} value={rel}>{rel}</option>
        ))}
      </select>

      <label>Emergency Contact Number</label>
      <input
        type="tel"
        name="emergencyContactNumber"
        value={formData.emergencyContactNumber}
        onChange={handleChange}
        className="input-field"
      />

      <div className="button-group">
        <button type="button" className="btn btn-secondary" onClick={prevStep}>
          Previous
        </button>
        <button type="button" className="btn btn-primary" onClick={nextStep}>
          Continue
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="form-box">
      <span className="step-title">Step 3/3</span>
      <h2 className="form-title">Medical History</h2>

      <label>Select any medical conditions you have:</label>
      <div className="checkbox-group">
        {commonConditions.map((condition) => (
          <label key={condition} className="checkbox-label">
            <input
              type="checkbox"
              name={condition}
              checked={formData.conditions[condition] || false}
              onChange={handleConditionChange}
            />
            {condition}
          </label>
        ))}
      </div>

      <label>Additional Notes (if any)</label>
      <textarea
        name="additionalNotes"
        value={formData.additionalNotes}
        onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
        className="input-field"
        rows="3"
        placeholder="Mention any other medical condition..."
      />

      <div className="step3-buttons">
        <button type="button" className="btn btn-secondary" onClick={prevStep}>
          Previous
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );

  return (
    <div className="signup-container">
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
};

export default SignUp;

