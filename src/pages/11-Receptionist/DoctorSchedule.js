import React, { useState, useEffect } from 'react';
import './Receptionist.css';

const DoctorSchedule = () => {
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [newSchedule, setNewSchedule] = useState({
    doctor: '',
    date: '',
    timeSlots: [{ from: '', to: '' }]
  });

  const [editingId, setEditingId] = useState(null);
  const [editSchedule, setEditSchedule] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/doctors`)
      .then(res => res.json())
      .then(data => {
        console.log(data); // للتأكد من شكل الداتا

        const doctorsArray = Array.isArray(data) ? data : data.doctors || [];

        setDoctors(doctorsArray);

        const loadedSchedules = [];
        doctorsArray.forEach(doctor => {
          doctor.timeSlots.forEach(slot => {
            loadedSchedules.push({
              id: slot.id,
              doctor: doctor.name,
              date: slot.dayOfWeek,
              timeSlots: [{ from: slot.startTime, to: slot.endTime }]
            });
          });
        });
        setSchedules(loadedSchedules);
      })
      .catch(err => console.error('Error loading doctors:', err));
  }, []);

  const removeTimeSlot = (index, isEdit = false) => {
    if (isEdit) {
      const updatedSlots = editSchedule.timeSlots.filter((_, i) => i !== index);
      setEditSchedule({ ...editSchedule, timeSlots: updatedSlots });
    } else {
      const updatedSlots = newSchedule.timeSlots.filter((_, i) => i !== index);
      setNewSchedule({ ...newSchedule, timeSlots: updatedSlots });
    }
  };

  const handleTimeSlotChange = (index, field, value, isEdit = false) => {
    if (isEdit) {
      const updatedSlots = [...editSchedule.timeSlots];
      updatedSlots[index][field] = value;
      setEditSchedule({ ...editSchedule, timeSlots: updatedSlots });
    } else {
      const updatedSlots = [...newSchedule.timeSlots];
      updatedSlots[index][field] = value;
      setNewSchedule({ ...newSchedule, timeSlots: updatedSlots });
    }
  };

  const determineShift = (fromTime) => {
    const hour = parseInt(fromTime.split(":")[0], 10);
    return hour < 15 ? "Morning" : "Evening";
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();

    const doctorObj = doctors.find(d => d.name === newSchedule.doctor);
    if (!doctorObj) {
      alert("Doctor not found");
      return;
    }

    try {
      for (const slot of newSchedule.timeSlots) {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/create-timeslots`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctorId: doctorObj.userId,
            dayOfWeek: newSchedule.date,
            startTime: slot.from,
            endTime: slot.to,
            shift: determineShift(slot.from),
          }),
        });

        if (!response.ok) throw new Error("Failed to add a timeslot");
      }

      alert("All time slots added successfully");
      // حدث الواجهة بإضافة المواعيد الجديدة (ممكن تجيب من الباك اند مجددا أو تحدث من محلياً)
      setSchedules([...schedules, ...newSchedule.timeSlots.map(slot => ({
        id: Date.now() + Math.random(),
        doctor: newSchedule.doctor,
        date: newSchedule.date,
        timeSlots: [slot]
      }))]);

      setNewSchedule({
        doctor: '',
        date: '',
        timeSlots: [{ from: '', to: '' }],
      });

    } catch (err) {
      console.error("Add schedule error:", err);
      alert("Error adding schedule");
    }
  };



  const handleDeleteSchedule = async (id) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/delete-timeslots/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete schedule");
      }

      setSchedules(schedules.filter(schedule => schedule.id !== id));
      alert("Schedule deleted successfully");
    } catch (error) {
      console.error("Delete schedule error:", error);
      alert("Error deleting schedule");
    }
  };


  const handleEditSchedule = (schedule) => {
    setEditingId(schedule.id);
    setEditSchedule({ ...schedule });
  };

  const handleUpdateSchedule = async (e) => {
    e.preventDefault();
    if (editSchedule.doctor && editSchedule.date && editSchedule.timeSlots[0].from) {
      try {
        const doctorId = doctors.find(d => d.name === editSchedule.doctor)?.userId;
        if (!doctorId) throw new Error("Doctor not found");

        // 1. جلب الحجوزات الموجودة للدكتور في نفس اليوم
        const bookingsResponse = await fetch(`${process.env.REACT_APP_API_URL}/get-booking`);
        const bookingsData = await bookingsResponse.json();

        // فلترة الحجوزات الخاصة بالدكتور واليوم المعين
        const doctorBookings = bookingsData.booking.filter(b =>
          b.doctor.userId === doctorId && b.dayOfWeek === editSchedule.date
        );

        // الوقت القديم (من timeSlots قبل التعديل)
        const oldStartTime = schedules.find(s => s.id === editingId)?.timeSlots[0]?.from;
        const oldEndTime = schedules.find(s => s.id === editingId)?.timeSlots[0]?.to;

        // الوقت الجديد
        const newStartTime = editSchedule.timeSlots[0].from;
        const newEndTime = editSchedule.timeSlots[0].to;

        // دالة لمقارنة الأوقات لو داخل فترة معينة
        const isTimeInRange = (time, start, end) => {
          return time >= start && time <= end;
        };

        // 2. فحص الحجوزات اللي هتتأثر
        for (const booking of doctorBookings) {
          // المواعيد المحجوزة (bookings) داخل الـ timeslot (booking.startTime - booking.endTime)
          // هنشوف كل حجز داخلي فيها
          for (const b of booking.bookings) {
            const bookingTime = b.date.slice(11, 16); // ناخد الوقت فقط من تاريخ الحجز

            const inOldRange = isTimeInRange(bookingTime, oldStartTime, oldEndTime);
            const inNewRange = isTimeInRange(bookingTime, newStartTime, newEndTime);

            // 3. لو في الوقت ده في الرينج القديم ومش في الرينج الجديد => نحذف الحجز ده
            if (inOldRange && !inNewRange) {
              // حذف الحجز من الباك اند
              await fetch(`${process.env.REACT_APP_API_URL}/delete-booking/${b.id}`, {
                method: 'DELETE',
              });
            }
          }
        }

        // 4. تحديث الـ timeslot بعد حذف الحجوزات المتعارضة
        await fetch(`${process.env.REACT_APP_API_URL}/update-timeslots/${editSchedule.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            doctorId,
            dayOfWeek: editSchedule.date,
            startTime: newStartTime,
            endTime: newEndTime,
          }),
        });

        setSchedules(schedules.map(schedule =>
          schedule.id === editingId ? editSchedule : schedule
        ));
        setEditingId(null);
        setEditSchedule(null);
        alert("Schedule updated successfully");
      } catch (error) {
        console.error("Failed to update schedule:", error);
        alert("Error updating schedule");
      }
    }
  };



  const cancelEdit = () => {
    setEditingId(null);
    setEditSchedule(null);
  };

  return (
    <div className="receptionist-page">
      <div className="content">
        <h2>Doctor Schedules</h2>

        <div className="schedule-management">
          {editingId ? (
            <div className="add-schedule-form">
              <h3>Edit Schedule</h3>
              <form onSubmit={handleUpdateSchedule}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Doctor:</label>
                    <select
                      value={editSchedule.doctor}
                      onChange={(e) => setEditSchedule({ ...editSchedule, doctor: e.target.value })}
                      required
                    >
                      <option value="">-- Select Doctor --</option>
                      {doctors.map(doctor => (
                        <option key={doctor.userId} value={doctor.name}>{doctor.name}</option>))}

                    </select>
                  </div>

                  <div className="form-group">
                    <label>Day:</label>
                    <select
                      value={editSchedule.date}
                      onChange={(e) => setEditSchedule({ ...editSchedule, date: e.target.value })}
                      required
                    >
                      <option value="">-- Select Day --</option>
                      {["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>

                  </div>
                </div>

                <div className="time-slots">
                  <label>Working Hours:</label>
                  {editSchedule.timeSlots.map((slot, index) => (
                    <div key={index} className="time-slot-row">
                      <input
                        type="time"
                        value={slot.from}
                        onChange={(e) => handleTimeSlotChange(index, 'from', e.target.value, true)}
                        required
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={slot.to}
                        onChange={(e) => handleTimeSlotChange(index, 'to', e.target.value, true)}
                        required
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          className="remove-slot-btn"
                          onClick={() => removeTimeSlot(index, true)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn">Update Schedule</button>
                  <button type="button" className="cancel-btn" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="add-schedule-form">
              <h3>Add New Schedule</h3>
              <form onSubmit={handleAddSchedule}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Doctor:</label>
                    <select
                      value={newSchedule.doctor}
                      onChange={(e) => setNewSchedule({ ...newSchedule, doctor: e.target.value })}
                      required
                    >
                      <option value="">-- Select Doctor --</option>
                      {doctors.map(doctor => (
                        <option key={doctor.userId} value={doctor.name}>{doctor.name}</option>))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Day:</label>
                    <select
                      value={newSchedule.date}
                      onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
                      required
                    >
                      <option value="">-- Select Day --</option>
                      {["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>

                </div>

                <div className="time-slots">
                  <label>Working Hours:</label>
                  {newSchedule.timeSlots.map((slot, index) => (
                    <div key={index} className="time-slot-row">
                      <input
                        type="time"
                        value={slot.from}
                        onChange={(e) => handleTimeSlotChange(index, 'from', e.target.value)}
                        required
                      />
                      <span>to</span>
                      <input
                        type="time"
                        value={slot.to}
                        onChange={(e) => handleTimeSlotChange(index, 'to', e.target.value)}
                        required
                      />
                      {index > 0 && (
                        <button
                          type="button"
                          className="remove-slot-btn"
                          onClick={() => removeTimeSlot(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button type="submit" className="save-btn">Add Schedule</button>
              </form>
            </div>
          )}

          <div className="schedules-list">
            <h3>Current Schedules</h3>
            {schedules.length > 0 ? (
              <div className="schedule-table">
                <table>
                  <thead>
                    <tr>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Working Hours</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map(schedule => (
                      <tr key={schedule.id}>
                        <td>{schedule.doctor}</td>
                        <td>{schedule.date}</td>
                        <td>
                          {schedule.timeSlots.map((slot, i) => (
                            <div key={i}>
                              {slot.from} - {slot.to}
                              {i < schedule.timeSlots.length - 1 && ', '}
                            </div>
                          ))}
                        </td>
                        <td>
                          <button
                            className="edit-btn"
                            onClick={() => handleEditSchedule(schedule)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No schedules available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;