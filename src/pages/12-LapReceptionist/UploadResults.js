import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UploadResults.css';

function UploadResults() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [labTestName, setLabTestName] = useState("");
  // جديد: الدكاترة
  const [doctors, setDoctors] = useState([]);
  const [searchDoctorTerm, setSearchDoctorTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Lab receptionist info
  const [labReceptionist, setLabReceptionist] = useState({
    name: "",
    email: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const id = user?.userId;

        const [receptionistRes, patientsRes, doctorsRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/get-lab-receptionist/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${process.env.REACT_APP_API_URL}/getAllPatients`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${process.env.REACT_APP_API_URL}/doctors`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!receptionistRes.ok) throw new Error('Failed to fetch lab receptionist');
        if (!patientsRes.ok) throw new Error('Failed to fetch patients');
        if (!doctorsRes.ok) throw new Error('Failed to fetch doctors');

        const receptionistData = await receptionistRes.json();
        const patientsData = await patientsRes.json();
        const doctorsData = await doctorsRes.json();

        setPatients(patientsData.patients);
        setDoctors(doctorsData); // افترضت هي بترد doctors

        setLabReceptionist({
          name: receptionistData.labReceptionist.name,
          email: receptionistData.labReceptionist.email,
        });

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.userId?.toString().includes(searchTerm)
  );

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name?.toLowerCase().includes(searchDoctorTerm.toLowerCase()) ||
    doctor.userId?.toString().includes(searchDoctorTerm)
  );

  const calculateAge = (birthDateString) => {
    const birthDate = new Date(birthDateString);
    const ageDiff = Date.now() - birthDate.getTime();
    return Math.floor(ageDiff / (1000 * 60 * 60 * 24 * 365.25));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile ? selectedFile.name : "");
  };

  const handleSubmit = async () => {
    if (!labTestName.trim()) {
      alert("Please enter the lab test name");
      return;
    }
    if (!selectedPatient) {
      alert("Please select a patient first");
      return;
    }
    if (!selectedDoctor) {
      alert("Please select a doctor first");
      return;
    }
    if (!file) {
      alert("Please select a file to upload");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      formData.append("name", labTestName.trim()); // هنا الاسم المرسل
      formData.append("date", new Date().toISOString());
      formData.append("patientUsername", selectedPatient.username ?? selectedPatient.userId?.toString());
      formData.append("referringDoctorId", selectedDoctor.userId ?? selectedDoctor.id);
      formData.append("attachment", file);

      // Debug print
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/create-lab-test`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // بدون Content-Type
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("Server response error text:", errText);
        throw new Error("Failed to upload lab test");
      }

      alert(`Report uploaded successfully!\nTest: ${labTestName}\nPatient: ${selectedPatient.name}\nDoctor: ${selectedDoctor.name}\nFile: ${fileName}`);

      // Reset form
      setLabTestName("");
      setFile(null);
      setFileName("");
      setSelectedPatient(null);
      setSearchTerm("");
      setSelectedDoctor(null);
      setSearchDoctorTerm("");

    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file");
    }
  };



  return (
    <div className="profile-container">
      <div className="sidebar">
        <div className="sidebar-logout" onClick={handleLogout}>
          <img src="/logout 1.png" alt="Logout" className="sidebar-icon" />
          <span>Logout</span>
        </div>
      </div>

      <div className="main-content">
        <div className="upload-container">
          <h1 className="Upload-page-title">Upload Lab Results</h1>

          <div className="receptionist-info">
            <h3>Lab Receptionist</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Name:</span>
                <span>{labReceptionist.name}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email:</span>
                <span>{labReceptionist.email}</span>
              </div>
            </div>
          </div>

          {/* Patient Search */}
          <div className="form-group">
            <label className="form-label">Search Patient (Name or ID)</label>
            <div className="search-input-container">
              <input
                type="text"
                className="search-input"
                placeholder="Enter patient name or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedPatient(null);
                }}
              />
              {searchTerm && (
                <button
                  className="clear-search-btn"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedPatient(null);
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {searchTerm && !selectedPatient && (
              <div className="search-results">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(patient => (
                    <div
                      key={patient.userId}
                      className="patient-result"
                      onClick={() => {
                        setSelectedPatient(patient);
                        setSearchTerm(`${patient.name} (ID: ${patient.userId})`);
                      }}
                    >
                      <div className="patient-info">
                        <span className="patient-name">{patient.name}</span>
                        <span className="patient-id">ID: {patient.userId}</span>
                      </div>
                      <span className="patient-age-gender">
                        {calculateAge(patient.birthDate)}y, {patient.gender}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    No patients found for "{searchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Patient Info */}
          {selectedPatient && (
            <div className="patient-info-card">
              <div className="patient-header">
                <h3>Patient Information</h3>
                <span className="patient-status">Active</span>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name:</span>
                  <span>{selectedPatient.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Patient ID:</span>
                  <span>{selectedPatient.userId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Gender:</span>
                  <span>{selectedPatient.gender}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Age:</span>
                  <span>{calculateAge(selectedPatient.birthDate)} years</span>
                </div>
              </div>
            </div>
          )}

          {/* Doctor Search */}
          <div className="form-group" style={{ marginTop: "2rem" }}>
            <label className="form-label">Select Doctor (Name or ID)</label>
            <div className="search-input-container">
              <input
                type="text"
                className="search-input"
                placeholder="Enter doctor name or ID..."
                value={searchDoctorTerm}
                onChange={(e) => {
                  setSearchDoctorTerm(e.target.value);
                  setSelectedDoctor(null);
                }}
              />
              {searchDoctorTerm && (
                <button
                  className="clear-search-btn"
                  onClick={() => {
                    setSearchDoctorTerm("");
                    setSelectedDoctor(null);
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {searchDoctorTerm && !selectedDoctor && (
              <div className="search-results">
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map(doctor => (
                    <div
                      key={doctor.userId}
                      className="patient-result"
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setSearchDoctorTerm(`${doctor.name} (ID: ${doctor.userId})`);
                      }}
                    >
                      <div className="patient-info">
                        <span className="patient-name">{doctor.name}</span>
                        <span className="patient-id">ID: {doctor.userId}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-results">
                    No doctors found for "{searchDoctorTerm}"
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selected Doctor Info */}
          {selectedDoctor && (
            <div className="patient-info-card">
              <div className="patient-header">
                <h3>Doctor Information</h3>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Full Name:</span>
                  <span>{selectedDoctor.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Doctor ID:</span>
                  <span>{selectedDoctor.userId}</span>
                </div>
              </div>
            </div>
          )}


          <div className="form-group">
            <label className="form-label">Lab Test Name</label>
            <input
              type="text"
              className="search-input"
              placeholder="Enter lab test name..."
              value={labTestName}
              onChange={(e) => setLabTestName(e.target.value)}
            />
          </div>


          {/* File Upload */}
          <div className="form-group">
            <label className="form-label">Upload Lab Report</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="labReport"
                className="file-input"
                onChange={handleFileChange}
                accept=".pdf"
              />
              <label htmlFor="labReport" className="file-label">
                <span className="file-name">
                  {fileName || "Choose file or drag here"}
                </span>
                <span className="browse-btn">Select File</span>
              </label>
            </div>
            <div className="file-requirements">
              Supported formats: PDF (Max 10MB)
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="upload-cancel-btn"
              onClick={() => {
                setSelectedPatient(null);
                setSearchTerm("");
                setFile(null);
                setFileName("");
                setSelectedDoctor(null);
                setSearchDoctorTerm("");
              }}
            >
              Cancel
            </button>
            <button
              className="Lab-upload-btn"
              onClick={handleSubmit}
              disabled={!selectedPatient || !selectedDoctor || !file}
            >
              <span className="Lab-upload-icon">↑</span> Upload Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadResults;
