import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './patientprofile.css';

const RequestMedicalExcuse = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    startDate: "",
    endDate: "",
    category: "",
    doctor: "",
    reason: "",
    document: null,
    patientId: ""
  });

  const [categories, setCategories] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedExcuses, setSubmittedExcuses] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/doctors`);
        setDoctors(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDoctors();
  }, []);


  useEffect(() => {
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


  useEffect(() => {
    console.log("Categories:", categories);
    console.log("Doctors:", doctors);

    const fetchAllExcuses = async () => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      console.log("Token:", token);
      console.log("User ID:", user.userId);
      console.log("Doctors length:", doctors?.length);
      console.log("Categories length:", categories?.length);

      if (!token || !user.userId || !doctors?.length || !categories?.length) {
        console.log("One or more required values missing, stopping fetch");
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/getPatient/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch patient data");

        const data = await response.json();

        console.log("Patient Data:", data);

        if (Array.isArray(data.MedicalExcuse)) {
          const enrichedExcuses = data.MedicalExcuse.map((excuse) => {
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

          console.log("Enriched excuses:", enrichedExcuses);

          setSubmittedExcuses(enrichedExcuses);
        }
      } catch (error) {
        console.error("Error fetching excuses:", error);
      }
    };

    if (Array.isArray(categories) && Array.isArray(doctors)) {
      fetchAllExcuses();
    }
  }, [categories, doctors]);



  const handleCategoryChange = (e) => {
    const categoryId = Number(e.target.value);
    const selectedCategory = categories.find(cat => cat.id === categoryId);

    setFormData({
      ...formData,
      category: categoryId,
      doctor: ""
    });

    if (selectedCategory) {
      setFilteredDoctors(selectedCategory.doctor);
    } else {
      setFilteredDoctors([]);
    }
  };

  const handleDoctorSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);

    if (formData.category) {
      const selectedCategory = categories.find(cat => cat.id === formData.category);
      const filtered = selectedCategory?.doctor?.filter(doctor =>
        doctor.name.toLowerCase().includes(term.toLowerCase())
      ) || [];
      setFilteredDoctors(filtered);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      document: e.target.files[0]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      return;
    }

    const selectedDoctor = filteredDoctors.find(doc => doc.name === formData.doctor);
    if (!selectedDoctor) {
      alert("Please select a valid doctor.");
      return;
    }

    const data = new FormData();
    data.append("fullName", formData.fullName);
    data.append("email", formData.email);
    data.append("startDate", new Date(formData.startDate).toISOString());
    data.append("endDate", new Date(formData.endDate).toISOString());
    data.append("reason", formData.reason);
    data.append("doctorId", Number(selectedDoctor.userId));
    data.append("categoryId", Number(formData.category));

    if (formData.document) {
      data.append("attachment", formData.document);
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.userId) {
      data.append("patientId", Number(user.userId));
    } else {
      alert("User ID not found. Please login again.");
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/create-medical-excuse`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Medical excuse request submitted successfully!");
      navigate("/home");
    } catch (error) {
      console.error("Submission failed:", error);
      alert("An error occurred while submitting the excuse.");
    }
  };

  return (
    <div className="excuse-container">
      <h1 className="excuse-title">Request Medical Excuse</h1>

      <form onSubmit={handleSubmit} className="excuse-form">
        <div className="excuse-section">
          <h2 className="excuse-section-title">Patient Information</h2>
          <div className="excuse-group">
            <label className="excuse-label">Full Name:</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="excuse-input" required />
          </div>
          <div className="excuse-group">
            <label className="excuse-label">Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="excuse-input" required />
          </div>
          <div className="excuse-group">
            <label className="excuse-label">Phone:</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="excuse-input" required />
          </div>
        </div>

        <div className="excuse-section">
          <h2 className="excuse-section-title">Excuse Details</h2>
          <div className="excuse-row">
            <div className="excuse-group">
              <label className="excuse-label">Start Date:</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="excuse-input" required />
            </div>
            <div className="excuse-group">
              <label className="excuse-label">End Date:</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="excuse-input" required />
            </div>
          </div>

          <div className="excuse-group">
            <label className="excuse-label">Category:</label>
            <select name="category" value={formData.category} onChange={handleCategoryChange} className="excuse-select" required>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {formData.category && (
            <div className="excuse-group">
              <label className="excuse-label">Doctor:</label>
              <div className="excuse-search-container">
                <input type="text" placeholder="Search doctors..." value={searchTerm} onChange={handleDoctorSearch} className="excuse-search" />
                <select name="doctor" value={formData.doctor} onChange={handleChange} className="excuse-select" required>
                  <option value="">Select Doctor</option>
                  {filteredDoctors.map(doctor => (
                    <option key={doctor.userId} value={doctor.name}>{doctor.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="excuse-group">
            <label className="excuse-label">Reason for medical excuse:</label>
            <textarea name="reason" value={formData.reason} onChange={handleChange} className="excuse-textarea" required rows="4" />
          </div>
        </div>

        <div className="excuse-section">
          <h2 className="excuse-section-title">Document Upload</h2>
          <div className="excuse-group">
            <label className="excuse-label">Please upload your document:</label>
            <input type="file" onChange={handleFileChange} className="excuse-file-input" accept=".pdf,.doc,.docx,.jpg,.png" />
          </div>
        </div>

        <div className="excuse-actions">
          <button type="submit" className="excuse-submit-btn">Submit Request</button>
        </div>
      </form>

      <div className="status-section">
        <h2 className="status-title">Your Medical Excuse Requests</h2>
        {submittedExcuses.length === 0 ? (
          <p className="no-requests">No requests submitted yet.</p>
        ) : (
          <div className="excuse-list">
            {submittedExcuses.map(excuse => (
              <div key={excuse.id} className={`excuse-card ${excuse.status ? excuse.status.toLowerCase() : ''}`}>
                <div className="excuse-card-header">
                  <h3>{excuse.category} - {excuse.doctor}</h3>
                  <span className={`status-badge ${excuse.status ? excuse.status.toLowerCase() : ''}`}>
                    {excuse.status}
                  </span>
                </div>
                <div className="excuse-card-details">
                  <p><strong>Period:</strong> {excuse.startDate} to {excuse.endDate}</p>
                  <p><strong>Reason:</strong> {excuse.reason}</p>
                  <p><strong>Submitted on:</strong> {excuse.submittedDate}</p>
                  {typeof excuse.rejectionReason === 'string' && excuse.rejectionReason.trim() !== '' && (
                    <div className="rejection-reason">
                      <p><strong>Rejection Reason:</strong> {excuse.rejectionReason}</p>
                    </div>
                  )}
                </div>
                {excuse.status === "Approved" && (
                  <div className="excuse-approved-message">
                    <p>Your medical excuse has been approved.</p>
                    <button className="download-btn">Download Excuse</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestMedicalExcuse;
