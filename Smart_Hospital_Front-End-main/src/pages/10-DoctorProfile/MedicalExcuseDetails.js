import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './doctorprofile.css';
const token = localStorage.getItem('token');


const MedicalExcuseDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isApproving, setIsApproving] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // If no data is available, go back to previous page
  if (!state?.request) {
    navigate(-1);
    return null;
  }

  const { request } = state;

  const handleBack = () => {
    navigate(-1);
  };


  const handleAccept = async () => {
    setIsApproving(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/update-medical-excuse/${request.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "Approved",
          doctorId: request.doctorId,
          patientId: request.patientId,
        }),
      });

      if (!res.ok) throw new Error("Failed to update medical excuse");

      alert("Medical excuse approved successfully");
      navigate(-1);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/update-medical-excuse/${request.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "Rejected",
          rejectionReason,
          doctorId: request.doctorId,
          patientId: request.patientId,
        }),
      });

      if (!res.ok) throw new Error("Failed to update medical excuse");

      alert("Medical excuse rejected successfully");
      navigate(-1);
    } catch (error) {
      alert("Error: " + error.message);
    }
  };



  return (
    <div className="excuse-details-container">
      <button className="back-button" onClick={handleBack}>
        &larr; Back
      </button>

      <h2 className="details-title">Medical Excuse Details</h2>

      <div className="details-section">
        <h3>Patient Information</h3>
        <div className="patient-details">
          <p><strong>Name:</strong> {request.fullName}</p>
          <p><strong>Email:</strong> {request.email}</p>
          <p>
            <strong>Requested Period:</strong> From {new Date(request.startDate).toLocaleDateString()}
            to {new Date(request.endDate).toLocaleDateString()}
          </p>
          <p><strong>Reason:</strong> {request.reason}</p>
        </div>
      </div>

      <div className="details-section">
        <h3>Diagnosis and Notes</h3>
        <div className="diagnosis-info">
          <p><strong>Diagnosis:</strong></p>
          <p>{request.diagnosis || 'No information available'}</p>

          <p><strong>Suggested Medications:</strong></p>
          <p>{request.medications || 'No information available'}</p>
        </div>
      </div>

      <div className="details-section">
        <h3>Attached Documents</h3>
        <div className="document-preview">
          <p>
            <strong>File:</strong>
            <a href={`/files/${request.file}`} target="_blank" rel="noopener noreferrer">
              {request.file}
            </a>
          </p>
          <div className="preview-area">
            {request.image ? (
              <img
                src={`${process.env.REACT_APP_API_URL}/uploads${request.image}`}
                alt="attachment"
                className="preview-image"
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
              />
            ) : (
              <p>لا يوجد صورة مرفقة</p>
            )}
          </div>

        </div>
      </div>

      {/* Rejection Reason Section */}
      <div className="details-section">
        <h3>Rejection Reason</h3>
        {request.rejectionReason ? (
          <p>{request.rejectionReason}</p>
        ) : (
          <p>لا يوجد سبب رفض مسجل</p>
        )}

        {/* Textarea للإدخال */}
        <textarea
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="If rejecting, please provide a reason..."
          className="rejection-textarea"
        />
      </div>


      <div className="action-buttons">
        <button className="btn reject-btn" onClick={handleReject}>
          Reject Request
        </button>
        <button
          className="btn accept-btn"
          onClick={handleAccept}
          disabled={isApproving}
        >
          {isApproving ? 'Approving...' : 'Approve Request'}
        </button>
      </div>
    </div>
  );
};

export default MedicalExcuseDetails;