import React from "react";
import './patientprofile.css';

const PatientDetails = ({ patient }) => {
  return (
    <>
      <div className="profile-header">
        <div className="name-card">
          <h2>{patient.name}</h2>
          <p>{patient.major}</p>
        </div>
        <div className="contact-card">
          <h4>Contact</h4>
          <p>📞 {patient.phone}</p>
          <p>🆔 {patient.id}</p>
          <p>✉️ {patient.email}</p>
          <a href="#" className="edit-link">Edit</a>
        </div>
      </div>

      <div className="student-details-box">
        <h4>Student Details</h4>
        <p><strong>Name:</strong> {patient.name}</p>
        <p><strong>Age:</strong> {patient.age}</p>
        <p><strong>Major:</strong> {patient.major}</p>
      </div>
    </>
  );
};

export default PatientDetails;
