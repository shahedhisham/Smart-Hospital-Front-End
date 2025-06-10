import React, { useState, useEffect } from 'react';
import "./MedicalRecird.css";

const MedicalRecord = () => {
  const [expandedRecords, setExpandedRecords] = useState({});
  const [records, setRecords] = useState([]);
  const [doctorNames, setDoctorNames] = useState({}); // خزن أسماء الدكاترة

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (!userString) return;

    const user = JSON.parse(userString);
    const patientId = user.userId;
    if (!patientId) return;

    fetch(`http://localhost:5987/getPatient/${patientId}`)
      .then(res => res.json())
      .then(async data => {
        if (data.medicalRecord) {
          const formattedRecords = data.medicalRecord.map(record => {
            const dateObj = new Date(record.datetime);
            const options = { day: '2-digit', month: 'short' };
            const date = dateObj.toLocaleDateString('en-US', options).toUpperCase();
            let hours = dateObj.getHours();
            const minutes = dateObj.getMinutes().toString().padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            const time = `${hours}:${minutes} ${ampm}`;

            return {
              id: record.id,
              date,
              time,
              doctorId: record.doctorId,  // هنخزن الـ doctorId هنا
              patient: `Record for ${data.name}`,
              diagnosis: record.diagnosis,
              treatment: record.treatmentDetails,
              status: record.status,
              isRated: record.isRated
            };
          });

          setRecords(formattedRecords);

          // جلب أسماء الدكاترة بشكل منفصل
          const uniqueDoctorIds = [...new Set(formattedRecords.map(r => r.doctorId))];

          // نعمل fetch لكل دكتور ونخزن اسمه
          const namesMap = {};
          await Promise.all(uniqueDoctorIds.map(async (id) => {
            try {
              const res = await fetch(`http://localhost:5987/get-doctor/${id}`);
              if (res.ok) {
                const doctorData = await res.json();
                namesMap[id] = doctorData.name;
              } else {
                namesMap[id] = `DR/ID ${id}`; // fallback لو مفيش داتا
              }
            } catch {
              namesMap[id] = `DR/ID ${id}`; // fallback لو في error
            }
          }));

          setDoctorNames(namesMap);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const toggleDetails = (recordId) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };

  return (
    <div className="records-timeline">
      <h1 className="records-title">Medical Records Timeline</h1>
      <div className="timeline-container">
        {records.map((record) => (
          <div key={record.id} className="timeline-item">
            <div className="timeline-header">
              <div className="timeline-date">{record.date}</div>
              <div className="timeline-time">{record.time}</div>
            </div>
            <div className="timeline-content">
              <div className="doctor-info">{doctorNames[record.doctorId] || `DR/ID ${record.doctorId}`}</div>
              <div className="patient-info">{record.patient}</div>

              <button
                className="view-button"
                onClick={() => toggleDetails(record.id)}
              >
                {expandedRecords[record.id] ? 'Hide Details' : 'View Details'}
              </button>

              {expandedRecords[record.id] && (
                <>
                  <div className="record-details">
                    <h4>Diagnosis:</h4>
                    <p>{record.diagnosis}</p>
                  </div>
                  <div className="record-details">
                    <h4>Treatment:</h4>
                    <p>{record.treatment}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalRecord;
