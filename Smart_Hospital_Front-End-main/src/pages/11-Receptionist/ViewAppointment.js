import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import './Receptionist.css';
import axios from 'axios';


const ViewAppointment = () => {


  const [appointments, setAppointments] = useState([]);

  const [filters, setFilters] = useState({
    category: '',
    doctor: '',
    date: '',
    status: 'all'
  });
  const [categories, setCategories] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editFormData, setEditFormData] = useState({
    patientName: '',
    category: '',
    doctor: '',
    date: '',
    time: ''
  });


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/get-booking`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = response.data;

        // استخراج التخصصات مع أسم الدكتور
        const uniqueCategories = {};

        data.booking.forEach(slot => {
          const categoryId = slot.doctor.specializationShort.toLowerCase();
          if (!uniqueCategories[categoryId]) {
            uniqueCategories[categoryId] = {
              id: categoryId,
              name: slot.doctor.specializationShort,
              doctors: []
            };
          }

          if (!uniqueCategories[categoryId].doctors.includes(slot.doctor.name)) {
            uniqueCategories[categoryId].doctors.push(slot.doctor.name);
          }
        });

        const dynamicCategories = Object.values(uniqueCategories);
        setCategories(dynamicCategories);

        // تجهيز المواعيد
        const mappedAppointments = data.booking.flatMap(slot =>
          slot.bookings.map(booking => ({
            id: booking.id,
            patientName: booking.patientName,
            category: slot.doctor.specializationShort.toLowerCase(),
            doctor: slot.doctor.name,
            date: booking.date.slice(0, 10),
            time: new Date(booking.date).toLocaleTimeString(),
            status: booking.status.charAt(0).toUpperCase() + booking.status.slice(1)
          }))
        );


        setAppointments(mappedAppointments);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);




  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    const selectedCategory = categories.find(cat => cat.id === categoryId);

    setFilters({
      ...filters,
      category: categoryId,
      doctor: ''
    });

    if (selectedCategory) {
      setFilteredDoctors(selectedCategory.doctors);
    } else {
      setFilteredDoctors([]);
    }
  };

  const handleDoctorSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (filters.category) {
      const selectedCategory = categories.find(cat => cat.id === filters.category);
      const filtered = selectedCategory.doctors.filter(doctor =>
        doctor.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredDoctors(filtered);
    }
  };



  const handleCancelAppointment = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API_URL}/delete-booking/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // بعد الحذف بنشيل الموعد من الحالة (state)
      setAppointments(appointments.filter(appointment => appointment.id !== id));

    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("فشل في إلغاء الموعد.");
    }
  };




  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment.id);
    setEditFormData({
      patientName: appointment.patientName,
      category: appointment.category,
      doctor: appointment.doctor,
      date: appointment.date,
      time: appointment.time
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleSaveEdit = async (id) => {
    try {
      const token = localStorage.getItem("token");

      // جيب بيانات الموعد الأصلي من appointments بناءً على id
      const originalAppointment = appointments.find(app => app.id === id);

      // تحويل التاريخ والوقت مع بعض ل ISO string
      const newDate = new Date(`${editFormData.date}T${editFormData.time}`);
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/update-booking`, {
        bookingId: id,
        date: newDate.toISOString()
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.status === 200) {
        setAppointments(appointments.map(appointment =>
          appointment.id === id ? {
            ...appointment,
            patientName: editFormData.patientName,
            category: editFormData.category,
            doctor: editFormData.doctor,
            date: editFormData.date,
            time: editFormData.time,
          } : appointment
        ));
        setEditingAppointment(null);
        console.log(originalAppointment, newDate)

        // هنا هنستخدم بيانات originalAppointment للارسال (البيانات اللي في الجدول قبل التعديل)
        const patientEmail = originalAppointment.patientEmail || 'karimkashkoush5@gmail.com'; // لو معاك الإيميل موجود هنا
        const patientName = originalAppointment.patientName;
        const doctorName = originalAppointment.doctor;
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

        try {
          await emailjs.send(
            'service_y6vn5pt',
            'template_aalcj2d',
            templateParams,
            'FhTcF7m0QfVZjJ_6Z'
          );
          alert('تم تحديث الموعد وإرسال الإشعار للمريض');
        } catch (emailError) {
          console.error('خطأ في إرسال الإيميل:', emailError);
          alert('تم تحديث الموعد لكن حدث خطأ في إرسال الإشعار.');
        }

      } else {
        alert("فشل في تحديث الموعد. حاول مرة أخرى.");
      }

    } catch (error) {
      console.error("Error updating appointment:", error);
      alert("فشل في تحديث الموعد. حاول مرة أخرى.");
    }
  };





  const handleCancelEdit = () => {
    setEditingAppointment(null);
  };

  const filteredAppointments = appointments.filter(appointment => {
    return (
      (filters.category === '' || appointment.category === filters.category) &&
      (filters.doctor === '' || appointment.doctor === filters.doctor) &&
      (filters.date === '' || appointment.date === filters.date) &&
      (filters.status === 'all' || appointment.status.toLowerCase() === filters.status)
    );
  });

  return (
    <div className="receptionist-page">

      <div className="content">
        <h2>View Appointments</h2>

        <div className="appointment-filters">
          <div className="form-row">
            <div className="form-group">
              <label>Filter by Category:</label>
              <select
                value={filters.category}
                onChange={handleCategoryChange}
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Filter by Doctor:</label>
              <div className="search-select">
                <input
                  type="text"
                  placeholder="Search doctors..."
                  value={searchTerm}
                  onChange={handleDoctorSearch}
                  disabled={!filters.category}
                />
                <select
                  value={filters.doctor}
                  onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
                  disabled={!filters.category}
                >
                  <option value="">All Doctors</option>
                  {filteredDoctors.map(doctor => (
                    <option key={doctor} value={doctor}>{doctor}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Filter by Date:</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Filter by Status:</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="appointments-list">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Category</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(appointment => (
                <tr key={appointment.id}>
                  {editingAppointment === appointment.id ? (
                    <>
                      <td>
                        <input
                          type="text"
                          name="patientName"
                          value={editFormData.patientName}
                          onChange={handleEditFormChange}
                        />
                      </td>
                      <td>
                        <select
                          name="category"
                          value={editFormData.category}
                          onChange={handleEditFormChange}
                        >
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <select
                          name="doctor"
                          value={editFormData.doctor}
                          onChange={handleEditFormChange}
                        >
                          {categories.find(c => c.id === editFormData.category)?.doctors.map(doctor => (
                            <option key={doctor} value={doctor}>{doctor}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="date"
                          name="date"
                          value={editFormData.date}
                          onChange={handleEditFormChange}
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          name="time"
                          value={editFormData.time}
                          onChange={handleEditFormChange}
                        />
                      </td>
                      <td>
                        <span className={`status-badge confirmed`}>
                          Confirmed
                        </span>
                      </td>
                      <td>
                        <button
                          className="save-btn"
                          onClick={() => handleSaveEdit(appointment.id)}
                        >
                          Save
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{appointment.patientName}</td>
                      <td>{categories.find(c => c.id === appointment.category)?.name || ''}</td>
                      <td>{appointment.doctor}</td>
                      <td>{appointment.date}</td>
                      <td>{appointment.time}</td>
                      <td>
                        <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="edit-btn"
                          onClick={() => handleEditAppointment(appointment)}
                          disabled={appointment.status === 'Cancelled'}
                        >
                          Edit
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => handleCancelAppointment(appointment.id)}
                          disabled={appointment.status === 'Cancelled'}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewAppointment;