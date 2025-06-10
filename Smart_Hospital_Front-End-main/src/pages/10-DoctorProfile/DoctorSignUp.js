import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorSignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    licenseNumber: '',
    specialty: 'Neurologist',
    experience: '',
    education: '',
    age: '',
    awards: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('كلمة السر غير متطابقة!');
      return;
    }

    const newDoctor = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      licenseNumber: formData.licenseNumber,
      specialty: formData.specialty,
      experience: formData.experience,
      education: formData.education,
      age: formData.age,
      awards: formData.awards
    };

    const existingDoctors = JSON.parse(localStorage.getItem('doctors')) || [];
    localStorage.setItem('doctors', JSON.stringify([...existingDoctors, newDoctor]));
    alert('تم تسجيل الطبيب بنجاح!');
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>تسجيل طبيب جديد</h2>
      <form onSubmit={handleSubmit}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>الاسم بالكامل:</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            style={styles.input}
            required
          />
        </div>
                
        <button type="submit" style={styles.button}>
          تسجيل الحساب
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '30px auto',
    padding: '20px',
    fontFamily: 'Arial Arabic',
    textAlign: 'right'
  },
  header: {
    color: '#41095d',
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#41095d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer'
  }
};

export default DoctorSignUp;