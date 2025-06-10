import React, { useState, useEffect } from 'react';
import './Receptionist.css';
import axios from "axios";

const AddAppointment = () => {


  const [categories, setCategories] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);


  const [submittedExcuses, setSubmittedExcuses] = useState([
  ]);
  const [doctors, setDoctors] = useState([]);
  const [appointment, setAppointment] = useState({
    patientName: '',
    patientId: '',     // ضيفها هنا
    category: '',
    doctor: '',
    day: '',
    time: '',
    notes: '',
    timeSlotId: ''
  });




  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/getAllPatients`);
        setPatients(res.data.patients || []); // بناء على شكل الرد
      } catch (err) {
        console.error(err);
      }
    };
    fetchPatients();
  }, []);

  // فلترة المرضى حسب ما بيتكتب في input الاسم
  useEffect(() => {
    if (!patientSearchTerm) {
      setFilteredPatients([]);
      return;
    }
    const filtered = patients.filter(patient =>
      patient.name.toLowerCase().includes(patientSearchTerm.toLowerCase())
    );
    setFilteredPatients(filtered);
  }, [patientSearchTerm, patients]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/doctors`);
        console.log("Response from /doctors API:", res.data);      
        setDoctors(res.data);           
      } catch (err) {
        console.error(err);
      }
    };

    fetchDoctors();
  }, []);


  useEffect(() => {
    const fetchAllExcuses = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!token || !user.userId || !Array.isArray(doctors) || doctors.length === 0 || !Array.isArray(categories) || categories.length === 0) {
        return;
      }
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch patient data");

        const data = await response.json();

        if (data.MedicalExcuse) {
          const enrichedExcuses = data.MedicalExcuse.map(excuse => {
            const categoryName = categories.find(cat => cat.id === excuse.categoryId)?.name || "No Category";
            const doctor = doctors.find(d => d.userId === excuse.doctorId);

            return {
              id: excuse.id,
              fullName: data.fullName || data.name || "",
              email: excuse.email || data.email || "",
              startDate: excuse.startDate?.split('T')[0] || "",
              endDate: excuse.endDate?.split('T')[0] || "",
              category: categoryName,
              doctor: doctor ? doctor.name : "Unknown Doctor",
              reason: excuse.reason,
              status: excuse.status || "Pending",
              submittedDate: excuse.createdAt?.split('T')[0] || "",
              image: excuse.image,
              rejectionReason: excuse.rejectionReason || ""
            };
          });

          setSubmittedExcuses(enrichedExcuses);
        }
      } catch (error) {
        console.error("Error fetching excuses:", error);
      }
    };

    fetchAllExcuses();
  }, [categories, doctors]);

  useEffect(() => {
    // 1- تجيب الكاتيجوريز
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-categories`);
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);


  const handlePatientInputChange = (e) => {
    setPatientSearchTerm(e.target.value);
    setAppointment({ ...appointment, patientName: e.target.value, patientId: '' });  
  };


  const handleSelectPatient = (name, userId) => {
    setAppointment({ ...appointment, patientName: name, patientId: userId });
    setPatientSearchTerm(name);
    setFilteredPatients([]);
  };


  const handleCategoryChange = (e) => {
    const categoryId = parseInt(e.target.value);
    const selectedCategory = categories.find(cat => cat.id === categoryId);

    setAppointment({
      ...appointment,
      category: categoryId,
      doctor: '',
      day: '',
      time: ''
    });

    if (selectedCategory && Array.isArray(doctors)) {
      const filtered = doctors.filter(doc => doc.categoryId === categoryId);
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors([]);
    }
  };




  const handleDoctorSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    const filtered = doctors.filter(doctor =>
      doctor.categoryId === appointment.category &&
      doctor.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredDoctors(filtered);
  };

  function getNextDateOfWeek(dayName) {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayIndex = daysOfWeek.indexOf(dayName);
    if (dayIndex === -1) return null;

    const today = new Date();
    const todayIndex = today.getDay();

    let daysUntil = dayIndex - todayIndex;
    if (daysUntil < 0) daysUntil += 7;   

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    return nextDate;
  }



  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    const nextDate = getNextDateOfWeek(appointment.day);
    const [hours, minutes] = appointment.time.split(':');
    nextDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const dateTime = nextDate.toISOString();

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/create-booking`, {
        doctorId: appointment.doctor,
        patientId: appointment.patientId || undefined,
        patientName: appointment.patientName,
        dateTime: dateTime,
        notes: appointment.notes,
        timeSlotId: appointment.timeSlotId
      },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });


      if (res.data.success) {
        alert("Appointment booked successfully!");
        setAppointment({
          patientName: '',
          patientId: '',
          category: '',
          doctor: '',
          day: '',
          time: '',
          timeSlotId: '',
          notes: ''
        });
      } else {
        alert("Booking failed: " + res.data.message);
      }
    } catch (error) {
      console.error("Failed to create booking:", error.response?.data || error.message);
      alert("An error occurred while booking the appointment: " + (error.response?.data?.message || error.message));
    }
  };



  return (
    <div className="add-appointment-container">
      <h2>Add New Appointment</h2>

      <form className="appointment-form" onSubmit={handleSubmit}>
        <div className="form-group" style={{ position: 'relative' }}>
          <label>Patient Name:</label>
          <input
            type="text"
            value={appointment.patientName}
            onChange={handlePatientInputChange}
            autoComplete="off"
            required
          />
          {filteredPatients.length > 0 && (
            <ul className="autocomplete-list" style={{
              position: 'absolute',
              backgroundColor: 'white',
              border: '1px solid #ccc',
              listStyle: 'none',
              paddingLeft: 0,
              maxHeight: '150px',
              overflowY: 'auto',
              width: '100%',
              zIndex: 1000,
              marginTop: 0,
            }}>
              {filteredPatients.map((patient) => (
                <li key={patient.userId} onClick={() => handleSelectPatient(patient.name, patient.userId)}>
                  {patient.name}
                </li>
              ))}

            </ul>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category:</label>
            <select
              value={appointment.category}
              onChange={handleCategoryChange}
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Doctor:</label>
            <div className="search-select">
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={handleDoctorSearch}
                disabled={!appointment.category}
              />
              <select
                value={appointment.doctor}
                onChange={(e) => {
                  const selectedDoctorId = parseInt(e.target.value);
                  const selectedDoctor = doctors.find(doc => doc.userId === selectedDoctorId);

                  setAppointment({ ...appointment, doctor: selectedDoctorId, day: '', time: '', timeSlotId: '' });

                  if (selectedDoctor) {
                    const slots = selectedDoctor.timeSlots || [];
                    setTimeSlots(slots);

                    const uniqueDays = [...new Set(slots.map(slot => slot.dayOfWeek).filter(Boolean))];
                    if (uniqueDays.length > 0) {
                      setAppointment(prev => ({ ...prev, day: uniqueDays[0] }));  
                    }

                  } else {
                    setTimeSlots([]);
                    setAppointment(prev => ({ ...prev, day: '' }));
                  }

                }}
                required
                disabled={!appointment.category}
              >
                <option value="">-- Select Doctor --</option>
                {filteredDoctors.map((doctor) => (
                  <option key={doctor.userId} value={doctor.userId}>{doctor.name}</option>
                ))}
              </select>

            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Day:</label>
            <select
              value={appointment.day}
              onChange={(e) => setAppointment({ ...appointment, day: e.target.value })}
              required
            >
              <option value="">-- Select Day --</option>
              {[...new Set(timeSlots.map(slot => slot.dayOfWeek).filter(day => day))].map((day, index) => (
                <option key={index} value={day}>{day}</option>
              ))}
            </select>

          </div>


          <div className="form-group">
            <label>Time:</label>
            <select
              value={appointment.time}
              onChange={(e) => {
                const selectedTime = e.target.value;
                setAppointment({ ...appointment, time: selectedTime });

                const slot = timeSlots.find(slot => {
                  const start = new Date(`1970-01-01T${slot.startTime}`);
                  const end = new Date(`1970-01-01T${slot.endTime}`);
                  const selected = new Date(`1970-01-01T${selectedTime}`);

                  return slot.dayOfWeek === appointment.day &&
                    selected >= start && selected < end;
                });


                if (slot) {
                  setAppointment(prev => ({ ...prev, timeSlotId: slot.id }));
                }
              }}
              required
            >
              <option value="">-- Select Time --</option>
              {[...new Set(
                timeSlots
                  .filter(slot => slot.dayOfWeek === appointment.day)
                  .flatMap(slot => {
                    const times = [];
                    let current = new Date(`1970-01-01T${slot.startTime}`);
                    const endTime = new Date(`1970-01-01T${slot.endTime}`);

                    while (current < endTime) {
                      times.push(current.toTimeString().slice(0, 5));
                      current = new Date(current.getTime() + 15 * 60000);
                    }

                    return times;
                  })
              )].map((time, idx) => (
                <option key={idx} value={time}>{time}</option>
              ))}
            </select>

          </div>
        </div>

        <div className="form-group">
          <label>Notes:</label>
          <textarea
            value={appointment.notes}
            onChange={(e) => setAppointment({ ...appointment, notes: e.target.value })}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="save-btn">Save Appointment</button>
          <button type="button" className="cancel-btn" >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAppointment;