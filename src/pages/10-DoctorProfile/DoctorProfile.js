import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './doctorprofile.css';
import DoctorAppointments from './DoctorAppointments';
import MedicalExcuseD from './MedicalExcuseD';
import Swal from 'sweetalert2';
const DoctorProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const imgRef = useRef(null);
  const [activePage, setActivePage] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState({ unit: '%', width: 30, aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [doctorData, setDoctorData] = useState({
    name: '',
    phone: '',
    id: '',
    email: '',
    age: '',
    specialization: '',
    experience: '',
    education: '',
    medicalExcuse: [],
    profileImage: '',
    Rating: [],
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
    setCrop(prev => ({ ...prev, height: (prev.width * height) / width }));
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
      canvas.toBlob((blob) => {
        if (!blob) return;
        resolve(blob);
      }, 'image/jpeg', 0.9);
    });
  };

  const handleSaveCrop = async () => {
    try {
      if (imgRef.current && completedCrop) {
        const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64Image = reader.result;

          setDoctorData(prev => {
            const updated = { ...prev, profileImage: base64Image };
            return updated;
          });

          setSrc(null);
        };
        reader.readAsDataURL(croppedImageBlob);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const triggerFileInput = () => fileInputRef.current.click();

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const id = user?.userId;

        const response = await fetch(`${process.env.REACT_APP_API_URL}/get-doctor/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch doctor data');

        const data = await response.json();
        
        setDoctorData(prev => ({
          ...prev,
          name: data.name,
          phone: data.phone,
          email: data.email,
          specialization: data.specializationShort,
          experience: data.yearsofExperience,
          education: data.education,
          age: calculateAge(data.birthDate),
          id: data.userId,
          medicalExcuse: data.medicalExcuse,
          profileImage: data.profileImage || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
          Rating: data.Rating
        }));
      } catch (err) {
        console.error(err.message);
      }
    };

    fetchDoctorData();
  }, []);

  const calculateAge = (birthDate) => {
    const dob = new Date(birthDate);
    const diff = Date.now() - dob.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDoctorData(prev => ({ ...prev, [name]: value }));
  };

  console.log(doctorData)

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');

      const payload = {
        userId: doctorData.id,
        name: doctorData.name,
        phone: doctorData.phone,
        email: doctorData.email,
        birthDate: '1980-01-01',
        yearsofExperience: doctorData.experience,
        education: doctorData.education,
        specializationShort: doctorData.specialization,
        specializationLong: doctorData.specialization,
        ...(doctorData.profileImage && doctorData.profileImage.startsWith('data:image') && {
          profileImage: doctorData.profileImage,
        }),
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/update-doctor/${doctorData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          icon: 'success',
          title: 'Profile updated!',
          text: 'تم تحديث الملف الشخصي بنجاح',
          timer: 2000,
          showConfirmButton: false
        });
        setIsEditing(false);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update failed',
          text: data.message || 'حدث خطأ أثناء التحديث'
        });
      }
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'حدث خطأ أثناء تحديث الملف الشخصي'
      });
    }
  };
  const renderContent = () => {
    switch (activePage) {
      case 'appointments': return <DoctorAppointments doctorData={doctorData} />;
      case 'excuses': return <MedicalExcuseD doctorData={doctorData} />;
      case 'profile':
      default:
        return (
          <div className="doctor-profile-content">
            {src && (
              <div className="crop-modal">
                <div className="crop-container">
                  <ReactCrop crop={crop} onChange={setCrop} onComplete={setCompletedCrop}>
                    <img ref={imgRef} src={src} onLoad={onImageLoad} alt="Crop" />
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
                <img src={doctorData.profileImage} alt="Doctor" className="doctor-image" />
                {isEditing && (
                  <>
                    <button onClick={triggerFileInput} className="change-photo-btn">Change Photo</button>
                    <input type="file" ref={fileInputRef} onChange={onSelectFile} accept="image/*" style={{ display: 'none' }} />
                  </>
                )}
              </div>
              <div>
                <h2>{doctorData.name}</h2>
              </div>
            </div>
            <div className="rating-box">
              {doctorData.specialization} {' '}
              {'⭐'.repeat(Math.round(calculateAverageRating()))}
              {'☆'.repeat(5 - Math.round(calculateAverageRating()))} {' '}
              {calculateAverageRating()} Rating
            </div>


            <div className="contact-box">
              <h3>Contact</h3>
              {isEditing ? (
                <>
                  <div className="editable-field">
                    <img src="/phone-call.png" alt="Phone" className="icon" />
                    <input type="text" name="phone" value={doctorData.phone} onChange={handleInputChange} className="edit-input" />
                  </div>
                  <div className="editable-field">
                    <img src="/iscon-identification 1.png" alt="ID" className="icon" />
                    <input disabled type="text" name="id" value={doctorData.id} onChange={handleInputChange} className="edit-input" />
                  </div>
                  <div className="editable-field">
                    <img src="/mail.png" alt="Email" className="icon" />
                    <input type="text" name="email" value={doctorData.email} onChange={handleInputChange} className="edit-input" />
                  </div>
                </>
              ) : (
                <>
                  <p><img src="/phone-call.png" alt="Phone" className="icon" /> {doctorData.phone}</p>
                  <p><img src="/iscon-identification 1.png" alt="ID" className="icon" /> {doctorData.id}</p>
                  <p><img src="/mail.png" alt="Email" className="icon" /> {doctorData.email}</p>
                </>
              )}
            </div>
            <div className="details-box">
              <h3>Doctor Details</h3>
              <p><strong>Name:</strong> {doctorData.name}</p>
              <p><strong>Specialization:</strong> {doctorData.specialization}</p>
              {!isEditing && (
                <>
                  <p><strong>Age:</strong> {doctorData.age}</p>
                  <p><strong>Experience:</strong> {doctorData.experience}</p>
                  <p><strong>Education:</strong> {doctorData.education}</p>
                </>
              )}
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

  const goToHome = () => navigate('/');
  const logout = () => {
    localStorage.clear();
    navigate('/logIn');
  };

  const calculateAverageRating = () => {
    if (!doctorData.Rating || doctorData.Rating.length === 0) return 0;
    const total = doctorData.Rating.reduce((sum, r) => sum + r.rating, 0);
    return (total / doctorData.Rating.length).toFixed(1); // عدد عشري واحد
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
        <div className="sidebar-item" onClick={() => setActivePage('appointments')}>
          <img src="/icon-report.png" alt="Appointments" className="sidebar-icon" />
          <span>Appointments</span>
        </div>

        <div className="sidebar-item" onClick={() => setActivePage('excuses')}>
          <img src="/icon-event.png" alt="Medical Excuse" className="sidebar-icon" />
          <span>Medical Excuse</span>
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

export default DoctorProfile;