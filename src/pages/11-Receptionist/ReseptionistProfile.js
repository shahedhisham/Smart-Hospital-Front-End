import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import AddAppointment from "./AddAppointment";
import ViewAppointment from "./ViewAppointment";
import DoctorSchedule from "./DoctorSchedule";
import './Receptionist.css';

const ReceptionistProfile = () => {
  
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
  const [receptionistData, setReceptionistData] = useState({
    name: "",
    phone: "",
    id: "",
    email: "",
    department: "",
    experience: "",
    education: "Bachelor's in Healthcare Administration",
    certifications: "Certified Medical Receptionist",
    profileImage: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
  });

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
          setReceptionistData(prev => ({
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
    setReceptionistData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const id = user?.userId;

        const response = await fetch(`${process.env.REACT_APP_API_URL}/receptionist/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch patient data');

        const data = await response.json();

        const birthDate = new Date(data.birthDate);
        const age = new Date().getFullYear() - birthDate.getFullYear();

        setReceptionistData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          age: age,
          id: data.userId,
          university: data.university || 'Not specified',
          profileImage: data.user?.image || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
        });
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    fetchPatientData();
  }, []);

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically send the updated data to your backend
  };

  const renderContent = () => {
    switch (activePage) {
      case 'add-appointment':
        return <AddAppointment />;
      case 'view-appointment':
        return <ViewAppointment />;
      case 'doctor-schedule':
        return <DoctorSchedule />;
      case 'profile':
      default:
        return (
          <div className="receptionist-profile-content">
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
                  src={receptionistData.profileImage}
                  alt="Receptionist"
                  className="receptionist-image"
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
                <h2>{receptionistData.name}</h2>
                <p className="receptionist-title">{receptionistData.title}</p>
              </div>
            </div>

            <div className="contact-box">
              <h3>Contact</h3>
              {isEditing ? (
                <>
                  <div className="editable-field">
                    <img src="/phone-call.png" alt="Phone" className="icon" />
                    <input
                      type="text"
                      name="phone"
                      value={receptionistData.phone}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  </div>
                  <div className="editable-field">
                    <img src="/iscon-identification 1.png" alt="ID" className="icon" />
                    <span>{receptionistData.id}</span>
                  </div>
                  <div className="editable-field">
                    <img src="/mail.png" alt="Email" className="icon" />
                    <input
                      type="text"
                      name="email"
                      value={receptionistData.email}
                      onChange={handleInputChange}
                      className="edit-input"
                    />
                  </div>
                </>
              ) : (
                <>
                  <p><img src="/phone-call.png" alt="Phone" className="icon" />
                    {receptionistData.phone}</p>
                  <p><img src="/iscon-identification 1.png" alt="ID" className="icon" />
                    {receptionistData.id}</p>
                  <p><img src="/mail.png" alt="Email" className="icon" />
                    {receptionistData.email}</p>
                </>
              )}
            </div>

            <div className="details-box">
              <h3>Receptionist Details</h3>

              <>
                <p><strong>Name:</strong> {receptionistData.name}</p>
                <p><strong>Department:</strong> {receptionistData.department}</p>
              </>
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <button onClick={handleSave} className="save-btn">Save Changes</button>
              ) : (
                <button onClick={() => setIsEditing(true)} className="edit-btn">Edit Profile</button>
              )}
            </div>
          </div>
        );
    }
  };

  const goToHome = () => {
    navigate('/');
  };

  const logout = () => {
    localStorage.clear()
    navigate('/logIn');
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
        <div className="sidebar-item" onClick={() => setActivePage('add-appointment')}>
          <img src="/icon-app4.png" alt="Add Appointment" className="sidebar-icon" />
          <span>Add Appointment</span>
        </div>
        <div className="sidebar-item" onClick={() => setActivePage('view-appointment')}>
          <img src="/icon-app1.png" alt="View Appointments" className="sidebar-icon" />
          <span>View Appointments</span>
        </div>
        <div className="sidebar-item" onClick={() => setActivePage('doctor-schedule')}>
          <img src="/icon-app2.png" alt="Doctor Schedule" className="sidebar-icon" />
          <span>Doctor Schedule</span>
        </div>
        <div className="sidebar-logout" onClick={logout}>
          <img src="/logout 1.png" alt="Logout" className="sidebar-icon" />
          <span>Logout</span>
        </div>
      </div>
      <div className="main-content">{renderContent()}</div>
    </div>
  );
};

export default ReceptionistProfile;