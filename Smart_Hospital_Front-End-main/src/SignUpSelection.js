import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpSelection.css';

const SignUpSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="selection-container">
      <div className="selection-box">
        <h2 className="selection-title">Create New Account</h2>
        <p className="selection-subtitle">Select your account type</p>
        
        <div className="options-grid">
          <div className="option-card" onClick={() => navigate('/SignUp')}>
            <img 
              src="/icon-patient.png" 
              alt="Patient" 
              className="option-icon"
            />
            <h3>Patient</h3>
            <p>Register as a patient</p>
          </div>
          
          <div className="option-card" onClick={() => navigate('/DoctorSignUp')}>
            <img 
              src="/icon-doctor.png" 
              alt="Doctor" 
              className="option-icon"
            />
            <h3>Doctor</h3>
            <p>Register as a doctor</p>
          </div>
          
          <div className="option-card" onClick={() => navigate('/EmployeeSignUp')}>
            <img 
              src="/icon-receptionist.png" 
              alt="Receptionist" 
              className="option-icon"
            />
            <h3>Receptionist</h3>
            <p>Register as receptionist</p>
          </div>
          
          <div className="option-card" onClick={() => navigate('/LabSignUp')}>
            <img 
              src="/icon-lab.png" 
              alt="Lab" 
              className="option-icon"
            />
            <h3>Lab Receptionist</h3>
            <p>Register as lab receptionist</p>
          </div>
        </div>
        
        <div className="login-redirect">
          Already have an account? <span onClick={() => navigate('/login')}>Login</span>
        </div>
      </div>
    </div>
  );
};

export default SignUpSelection;