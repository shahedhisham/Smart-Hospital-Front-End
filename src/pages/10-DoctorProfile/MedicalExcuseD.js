import React from 'react';
import { useNavigate } from 'react-router-dom';
import './doctorprofile.css';
const token = localStorage.getItem('token');

const MedicalExcuseD = ({ doctorData }) => {
  const navigate = useNavigate();


  const handleViewDetails = (request) => {
    navigate('/MedicalExecuseDetails', { state: { request } });
  };

  const handleAccept = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/update-medical-excuse/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'Approved',
          // لو محتاج doctorId و patientId ممكن تمررهم هنا برده
        }),
      });

      if (!res.ok) throw new Error('Failed to approve request');

      alert(`Request #${id} approved successfully.`);
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };


  const handleReject = async (id, e) => {
    e.stopPropagation();

    // لو عايز سبب رفض لازم تضيف طريقة لإدخاله (مثلاً modal أو input)
    const rejectionReason = prompt('Please enter rejection reason:');
    if (!rejectionReason) {
      alert('Rejection reason is required');
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/update-medical-excuse/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: 'Rejected',
          rejectionReason,
          // لو محتاج doctorId و patientId ممكن تمررهم هنا برده
        }),
      });

      if (!res.ok) throw new Error('Failed to reject request');

      alert(`Request #${id} rejected successfully.`);
      // ممكن تحدث بيانات الواجهة أو تعمل إعادة جلب للبيانات هنا
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="medical-excuse-container">
      <h2 className="section-title">Medical Execuse Requests</h2>


      {doctorData.medicalExcuse?.length === 0 ? (
        <p className="no-requests">No current requests</p>
      ) : (
        <div className="excuse-cards-container">
          {doctorData.medicalExcuse
            ?.filter((req) => req.status === 'Pending')
            .map((req) => (
              <div className="excuse-card" key={req.id} onClick={() => handleViewDetails(req)}>
                <div className="patient-info">
                  <h3>{req.fullName}</h3>
                  <p><span className="info-label">Email:</span> {req.email}</p>
                  <p>
                    <span className="info-label">Period:</span>
                    From {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                  </p>
                  <p><span className="info-label">Reason:</span> {req.reason}</p>
                  <p><span className="info-label">Status:</span> {req.status || "Not reviewed"}</p>
                </div>

                <div className="card-actions">
                  <div className="decision-buttons">
                    <button className="excuse-btn reject-btn" onClick={(e) => handleReject(req.id, e)}>Reject</button>
                    <button className="excuse-btn accept-btn" onClick={(e) => handleAccept(req.id, e)}>Accept</button>
                  </div>
                  <button
                    className="excuse-btn details-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(req);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default MedicalExcuseD;