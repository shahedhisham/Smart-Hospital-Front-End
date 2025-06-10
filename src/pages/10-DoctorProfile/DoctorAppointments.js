import React, { useState, useEffect } from 'react';
import './doctorprofile.css';
import emailjs from '@emailjs/browser';
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));
const doctorId = user?.userId;

console.log(doctorId)
const DoctorAppointments = () => {
  const [showDiagnosis, setShowDiagnosis] = useState(null);
  const [diagnoses, setDiagnoses] = useState({});
  const [treatments, setTreatments] = useState({});
  const [activeTab, setActiveTab] = useState('today');
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationType, setNotificationType] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDelay, setSelectedDelay] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [appointments, setAppointments] = useState([]);


  const delayOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' }
  ];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const id = user?.userId;
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/get-doctor-bookings/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`, // أو المكان اللي بتخزن فيه التوكن
          }
        });

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        setAppointments(data.booking);
        console.log("Fetched appointments:", data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  // Handlers
  const handleUploadClick = (appointmentId) => {
    setShowDiagnosis(showDiagnosis === appointmentId ? null : appointmentId);
  };

  const handleDiagnosisChange = (appointmentId, value) => {
    setDiagnoses(prev => ({
      ...prev,
      [appointmentId]: value
    }));
  };

  const handleTreatmentChange = (appointmentId, value) => {
    setTreatments((prev) => ({ ...prev, [appointmentId]: value }));
  };

  const openNotificationModal = (type, appointment = null) => {
    setNotificationType(type);
    setSelectedAppointment(appointment);
    setShowNotificationModal(true);
    setSelectedDelay('');
  };

  const submitDiagnosis = async (appointment) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const Id = user?.userId;
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/create-medical-record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: Id,
          patientId: appointment.patientId,
          diagnosis: diagnoses[appointment.id],
          treatmentDetails: treatments[appointment.id],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit diagnosis");
      }

      const updateResponse = await fetch(`${process.env.REACT_APP_API_URL}/update-booking`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: appointment.id,
          status: "confirmed",
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update booking status");
      }

      alert("Diagnosis submitted and booking status updated successfully!");
      setShowDiagnosis(null);

      setAppointments((prev) =>
        prev.map((app) =>
          app.id === appointment.id ? { ...app, status: "confirmed" } : app
        )
      );

    } catch (error) {
      alert("Error submitting diagnosis or updating booking status");
      console.error(error);
    }
  };



  const handleDelayAndNotify = async () => {
    if (!selectedAppointment) return;

    if (notificationType === 'delay' && !selectedDelay) {
      alert('يرجى تحديد مدة التأخير');
      return;
    }

    const delayMinutes = parseInt(selectedDelay);
    if (isNaN(delayMinutes)) {
      alert("قيمة التأخير غير صالحة");
      return;
    }

    setIsSending(true);

    const originalDate = new Date(selectedAppointment.date);
    const newDate = new Date(originalDate.getTime() + delayMinutes * 60000);

    try {
      // 1. تحديث الموعد
      const response = await fetch(`${process.env.REACT_APP_API_URL}/update-booking`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: selectedAppointment.id,
          date: newDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("فشل تحديث الموعد");
      }

      // 2. تحديث المواعيد محلياً
      setAppointments((prevAppointments) =>
        prevAppointments.map((app) =>
          app.id === selectedAppointment.id ? { ...app, date: newDate.toISOString() } : app
        )
      );

      // 3. إرسال الإشعار بالإيميل
      const patientEmail = selectedAppointment.patient.email;
      const patientName = selectedAppointment.patient.name;
      const doctorName = selectedAppointment.doctorName;

      // استخدم التاريخ الجديد بعد التأخير عشان تظهر في الإشعار
      const formattedTime = newDate.toLocaleString("en-EG", {
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const templateParams = {
        email: patientEmail,
        to_name: patientName,
        doctor_name: doctorName,
        new_time: formattedTime,
      };

      await emailjs.send(
        'service_y6vn5pt',
        'template_aalcj2d',
        templateParams,
        'FhTcF7m0QfVZjJ_6Z'
      );

      alert('تم تحديث الموعد وإرسال الإشعار للمريض');
      setShowNotificationModal(false);

    } catch (error) {
      console.error('حدث خطأ:', error);
      alert('حدث خطأ أثناء تأجيل الموعد أو إرسال الإشعار');
    } finally {
      setIsSending(false);
    }
  };


  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <div className="appointments-container">
      <h2 className="section-title">My Appointments</h2>

      {/* Appointment tabs */}
      <div className="appointment-tabs">
        <div
          className={`tab ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          {getDayName(new Date())}<br />
          {new Date().toLocaleDateString()}
        </div>

        <div
          className={`tab ${activeTab === 'tomorrow' ? 'active' : ''}`}
          onClick={() => setActiveTab('tomorrow')}
        >
          {getDayName(new Date(Date.now() + 86400000))}<br />
          {new Date(Date.now() + 86400000).toLocaleDateString()}
        </div>

        <div
          className={`tab ${activeTab === '3rd' ? 'active' : ''}`}
          onClick={() => setActiveTab('3rd')}
        >
          {getDayName(new Date(Date.now() + 86400000 * 2))}<br />
          {new Date(Date.now() + 86400000 * 2).toLocaleDateString()}
        </div>

        <div
          className={`tab ${activeTab === '4rd' ? 'active' : ''}`}
          onClick={() => setActiveTab('4rd')}
        >
          {getDayName(new Date(Date.now() + 86400000 * 3))}<br />
          {new Date(Date.now() + 86400000 * 3).toLocaleDateString()}
        </div>

        <div
          className={`tab ${activeTab === '5rd' ? 'active' : ''}`}
          onClick={() => setActiveTab('5rd')}
        >
          {getDayName(new Date(Date.now() + 86400000 * 4))}<br />
          {new Date(Date.now() + 86400000 * 4).toLocaleDateString()}
        </div>

        <div
          className={`tab ${activeTab === '6rd' ? 'active' : ''}`}
          onClick={() => setActiveTab('6rd')}
        >
          {getDayName(new Date(Date.now() + 86400000 * 5))}<br />
          {new Date(Date.now() + 86400000 * 5).toLocaleDateString()}
        </div>
      </div>

      {/* Appointments list */}
      <div className="appointments-list">
        {(() => {
          // حدد التاريخ اللي عايز تعرض مواعيده بناءً على التاب النشط
          let filterDate;
          const today = new Date();
          if (activeTab === 'today') {
            filterDate = today;
          } else if (activeTab === 'tomorrow') {
            filterDate = new Date(today.getTime() + 86400000 * 1);
          } else if (activeTab === '3rd') {
            filterDate = new Date(today.getTime() + 86400000 * 2);
          } else if (activeTab === '4rd') {
            filterDate = new Date(today.getTime() + 86400000 * 3);
          } else if (activeTab === '5rd') {
            filterDate = new Date(today.getTime() + 86400000 * 4);
          } else if (activeTab === '6rd') {
            filterDate = new Date(today.getTime() + 86400000 * 5);
          } else {
            filterDate = null;
          }

          // فلترة المواعيد حسب التاريخ
          const filteredAppointments = appointments.filter(app => {
            if (!filterDate) return false;
            const appDate = new Date(app.date);
            return appDate.toDateString() === filterDate.toDateString() && app.status.toLowerCase() === 'pending';
          });



          // لو فاضية أظهر رسالة
          if (filteredAppointments.length === 0) {
            return <p className="no-appointments">لا يوجد مواعيد لـ {activeTab === 'today' ? 'اليوم' : activeTab === 'tomorrow' ? 'غدًا' : ''}.</p>;
          }

          // لو في مواعيد اعرضهم
          return filteredAppointments.map(appointment => (
            <div className="appointment-card" key={appointment.id}>
              <div className="appointment-info">
                <h3>{appointment.patientName}</h3>
                <p className="appointment-time">
                  {(() => {
                    const originalDate = new Date(appointment.date);
                    let hours = originalDate.getHours();
                    const minutes = originalDate.getMinutes().toString().padStart(2, '0');
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // لو الساعة 0 خليها 12
                    return `${hours}:${minutes} ${ampm}`;
                  })()}
                </p>
                <span className={`status-badge ${appointment.status}`}>
                  {appointment.status}
                </span>
              </div>

              <div className="appointment-actions">
                <button
                  className="upload-btn"
                  onClick={() => handleUploadClick(appointment.id)}
                >
                  {showDiagnosis === appointment.id ? 'Hide' : 'Upload Diagnosis'}
                </button>

                <button
                  className="delay-btn"
                  onClick={() => openNotificationModal('delay', appointment)}
                >
                  Report Delay
                </button>
              </div>

              {showDiagnosis === appointment.id && (
                <div className="diagnosis-section">
                  <h4>Patient Diagnosis</h4>
                  <textarea
                    value={diagnoses[appointment.id] || ''}
                    onChange={(e) => handleDiagnosisChange(appointment.id, e.target.value)}
                    placeholder="Enter diagnosis..."
                    rows="5"
                  />

                  <h4>Treatment Plan</h4>
                  <textarea
                    value={treatments[appointment.id] || ''}
                    onChange={(e) => handleTreatmentChange(appointment.id, e.target.value)}
                    placeholder="Enter medications and recommendations..."
                    rows="5"
                  />

                  <div className="diagnosis-actions">
                    <button className="cancel-btn" onClick={() => setShowDiagnosis(null)}>
                      Cancel
                    </button>
                    <button className="submit-btn" onClick={() => submitDiagnosis(appointment)}>
                      Submit Diagnosis
                    </button>
                  </div>
                </div>
              )}

            </div>
          ));
        })()}
      </div>


      {/* Notification modal */}
      {showNotificationModal && (
        <div className="notification-modal">
          <div className="modal-content">
            <h3>
              {notificationType === 'delay'
                ? `Report Delay for ${selectedAppointment?.name}'s Appointment`
                : 'Report Absence for All Today\'s Appointments'}
            </h3>

            {notificationType === 'delay' ? (
              <div className="delay-options">
                <p>Select delay duration:</p>
                <div className="delay-buttons">
                  {delayOptions.map(option => (
                    <button
                      key={option.value}
                      className={`delay-option ${selectedDelay === option.value ? 'selected' : ''}`}
                      onClick={() => setSelectedDelay(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <p>This will notify all patients with appointments today. Are you sure?</p>
            )}

            <div className="modal-actions">
              <button
                onClick={handleDelayAndNotify}
                disabled={isSending || (notificationType === 'delay' && !selectedDelay)}
                className="confirm-btn"
              >
                {isSending ? 'Sending...' : 'Confirm'}
              </button>

              <button
                onClick={() => setShowNotificationModal(false)}
                disabled={isSending}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default DoctorAppointments;