import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import MedicalRecord from './MedicalRecord';
import RequestMedicalExcuse from './RequestMedicalExecuse';
import PreviousAppointments from './PreviousAppointments';
import LabResults from './LabResults';
import './patientprofile.css';

const PatientProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const [activePage, setActivePage] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 30,
    aspect: 1,
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [patient, setPatient] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    id: '',
    university: '',
    profileImage: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
  });

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const id = user?.userId;

        const response = await fetch(`${process.env.REACT_APP_API_URL}/getPatient/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch patient data');

        const data = await response.json();

        const birthDate = new Date(data.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();

        setPatient({
          name: data.name,
          email: data.email,
          phone: data.phone,
          age: age,
          id: data.userId,
          university: data.university || 'Not specified',
          profileImage: data.user?.image || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
          medicalHistory: data.medicalHistory
        });
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    fetchPatientData();
  }, []);

  // Image crop functions
  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setSrc(reader.result));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(prev => ({
      ...prev,
      height: (prev.width * height) / width
    }));
    imgRef.current = e.currentTarget;
  };

  const getCroppedImg = (image, crop) => {
    if (!image || !crop) return;

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = Math.floor(crop.width * scaleX);
    canvas.height = Math.floor(crop.height * scaleY);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            return;
          }
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    });
  };

  const handleSaveCrop = async () => {
    try {
      if (imgRef.current && completedCrop) {
        const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPatient(prev => ({
            ...prev,
            profileImage: reader.result
          }));
          setSrc(null);
        };
        reader.readAsDataURL(croppedImageBlob);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatient({
      ...patient,
      [name]: value
    });
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const saveChanges = () => {
    setIsEditing(false);
    console.log("Saved changes:", patient);
  };

  const goToHome = () => {
    navigate('/');
  };

  const logout = () => {
    localStorage.clear();
    navigate('/logIn');
  };


  const renderContent = () => {
    switch (activePage) {
      case 'MedicalRecord':
        return <MedicalRecord />;
      case 'RequestMedicalExcuse':
        return <RequestMedicalExcuse />;
      case 'PreviousAppointments':
        return <PreviousAppointments />;
      case 'LabResults':
        return <LabResults />;
      case 'profile':
      default:
        return (
          <div className="profile-content">
            {src && (
              <div className="crop-modal">
                <div className="crop-container">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                  >
                    <img
                      ref={imgRef}
                      src={src}
                      onLoad={onImageLoad}
                      alt="Crop me"
                    />
                  </ReactCrop>
                  <div className="crop-buttons">
                    <button onClick={() => setSrc(null)}>Cancel</button>
                    <button onClick={handleSaveCrop}>Save Crop</button>
                  </div>
                </div>
              </div>
            )}

            <div className="profile-header">
              <div className="profile-image-container">
                <img
                  src={patient.profileImage}
                  alt="Profile"
                  className="profile-image"
                />
                {isEditing && (
                  <>
                    <button
                      onClick={triggerFileInput}
                      className="change-photo-btn"
                    >
                      Change Photo
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={onSelectFile}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                  </>
                )}
              </div>
              <div>
                <h2>{patient.name}</h2>
                <p className="profile-title">{patient.major} Student</p>
              </div>
            </div>

            <div className="rating-box">
              <img src="/iscon-identification 1.png" alt="ID" className="icon" />
              Student ID: {patient.id}
            </div>

            <div className="contact-box">
              <div className="contact-header">
                <h3>Contact</h3>
                {isEditing ? (
                  <button onClick={saveChanges} className="save-btn">Save</button>
                ) : (
                  <button onClick={toggleEdit} className="edit-btn">Edit</button>
                )}
              </div>

              {isEditing ? (
                <>
                  <div className="editable-field">
                    <img src="/phone-call.png" alt="Phone" className="icon" />
                    <input
                      type="text"
                      name="phone"
                      value={patient.phone}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  </div>
                  <div className="editable-field">
                    <img src="/iscon-identification 1.png" alt="ID" className="icon" />
                    <span>{patient.id}</span>
                  </div>
                  <div className="editable-field">
                    <img src="/mail.png" alt="Email" className="icon" />
                    <input
                      type="email"
                      name="email"
                      value={patient.email}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  </div>
                </>
              ) : (
                <>
                  <p>
                    <img src="/phone-call.png" alt="Phone" className="icon" />
                    {patient.phone}
                  </p>
                  <p>
                    <img src="/iscon-identification 1.png" alt="ID" className="icon" />
                    {patient.id}
                  </p>
                  <p>
                    <img src="/mail.png" alt="Email" className="icon" />
                    {patient.email}
                  </p>
                </>
              )}
            </div>

            <div className="details-box">
              <h3>Student Details</h3>
              <p><strong>Name:</strong> {patient.name}</p>
              <p><strong>Age:</strong> {patient.age}</p>
              <p><strong>University:</strong> {patient.university}</p>
              <div>
                <strong>Medical History:</strong>
                <ul>
                  {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                    patient.medicalHistory.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))
                  ) : (
                    <li>No medical history available</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="profile-container">
      <div className="sidebar">
        <div className="sidebar-item" onClick={goToHome}>
          <img src="/icon-home.png" alt="Home" className="sidebar-icon" />
          <span>Home</span>
        </div>
        <div className="sidebar-item" onClick={() => setActivePage('profile')}>
          <img src="/icon-User.png" alt="Profile" className="sidebar-icon" />
          <span>My Profile</span>
        </div>
        <div className="sidebar-item" onClick={() => setActivePage('MedicalRecord')}>
          <img src="/icon-report.png" alt="Medical Record" className="sidebar-icon" />
          <span>Medical Record</span>
        </div>
        <div className="sidebar-item" onClick={() => setActivePage('PreviousAppointments')}>
          <img src="/icon-app1.png" alt="Appointments" className="sidebar-icon" />
          <span>Previous Appointments</span>
        </div>
        <div className="sidebar-item" onClick={() => setActivePage('LabResults')}>
          <img src="/result.png" alt="Lab Results" className="sidebar-icon" />
          <span>Lab Results</span>
        </div>
        <div className="sidebar-item" onClick={() => setActivePage('RequestMedicalExcuse')}>
          <img src="/icon-event.png" alt="Request Excuse" className="sidebar-icon" />
          <span>Request Medical Excuse</span>
        </div>
        <div className="sidebar-logout" onClick={logout}>
          <img src="/logout 1.png" alt="Logout" className="sidebar-icon" />
          <span>Logout</span>
        </div>
      </div>
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default PatientProfile;