import React, { useState, useEffect } from 'react';
import './patientprofile.css';

const LabResults = () => {
  const [labResults, setLabResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedResult, setExpandedResult] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.userId;
  useEffect(() => {
    const fetchLabTests = async () => {
      try {

        const response = await fetch(`${process.env.REACT_APP_API_URL}/getPatient/${userId}`);
        const data = await response.json();
        setLabResults(data.LabTest || []);

      } catch (error) {
        console.error("Failed to fetch lab tests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLabTests();
  }, [userId]);

  const toggleResultDetails = (id) => {
    setExpandedResult(expandedResult === id ? null : id);
  };

  if (loading) return <p>Loading lab results...</p>;

  if (labResults.length === 0) return <p>No lab results found.</p>;

  return (
    <div className="records-timeline">
      <h1 className="records-title">Lab Results</h1>
      <div className="timeline-container">
        {labResults.map((test) => (
          <div key={test.id} className="timeline-item">
            <div className="timeline-header">
              <div className="timeline-date">{new Date(test.date).toLocaleDateString()}</div>
              <div className="timeline-time">{test.name}</div>
            </div>
            <div className="timeline-content">
              <div className="doctor-info">Result: {/* هنا ممكن تضيف حاجة لو عندك */}</div>
              <div className="patient-info">Status: {test.status}</div>

              <button
                className="view-button"
                onClick={() => toggleResultDetails(test.id)}
              >
                {expandedResult === test.id ? 'Hide Details' : 'View Details'}
              </button>

              {expandedResult === test.id && (
                <div className="record-details">
                  <h4>Attachment:</h4>
                  {test.attachment ? (
                    <a
                      href={`${process.env.REACT_APP_API_URL}${test.attachment}`}
                      download={`${test.name}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download Attachment
                    </a>

                  ) : (
                    <p>No attachment available</p>
                  )}
                  {/* لو عندك تفاصيل زيادة ممكن تعرضها هنا */}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabResults;
