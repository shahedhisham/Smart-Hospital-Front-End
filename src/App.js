import SignUp from "./pages/SignUp";
import Home from './pages/1-Home/Home';
import About from './pages/2-About/About';
import Contact from './pages/3-Contact/Contact';
import Appointment from './pages/4-Appointment/Appointment';
import DoctorDetails from './pages/5-Doctor/DoctorDetails';
import LogIn from "./pages/6-Login/Login";
import OurDoctors from './pages/7-OurDoctors/OurDoctors';
import Confirmation from './pages/8-Confirmation/Confirmation';
import PatientProfile from "./pages/9-PatientProfile/PatientProfile";
import DoctorProfile from "./pages/10-DoctorProfile/DoctorProfile";
import MedicalExecuseD from "./pages/10-DoctorProfile/MedicalExcuseD";
import MedicalExecuseDetails from "./pages/10-DoctorProfile/MedicalExcuseDetails";
import ReseptionistProfile from "./pages/11-Receptionist/ReseptionistProfile";
import AddAppointment from "./pages/11-Receptionist/AddAppointment";
import ViewAppointment from "./pages/11-Receptionist/ViewAppointment";
import DoctorSchedule from "./pages/11-Receptionist/DoctorSchedule";
import UploadResults from "./pages/12-LapReceptionist/UploadResults";
import EmployeeSignUp from "./pages/13-SignUps/EmployeeSignUp";
import DoctorSignUp from "./pages/13-SignUps/DoctorSignUp";
import LabSignUp from "./pages/13-SignUps/LabSignUp";
import SignUpSelection from "./SignUpSelection";
import PreviousAppointments from "./pages/9-PatientProfile/PreviousAppointments";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MedicalRecord from "./pages/9-PatientProfile/MedicalRecord";
import RequestMedicalExcuse from "./pages/9-PatientProfile/RequestMedicalExecuse";
import LabResults from "./pages/9-PatientProfile/LabResults";
function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/OurDoctors" element={<OurDoctors />} />
          <Route path="/LogIn" element={<LogIn />} />
          <Route path="/About" element={<About />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/Appointment/:id" element={<Appointment />} />
          <Route path="/DoctorDetails/:id" element={<DoctorDetails />} />
          <Route path="/Confirmation" element={<Confirmation />} />
          <Route path="/PatientProfile/:id" element={<PatientProfile />} />
          <Route path="/MedicalRecord" element={<MedicalRecord />} />
          <Route path="/RequestMedicalExcuse" element={<RequestMedicalExcuse />} />
          <Route path="/PreviousAppointments" element={<PreviousAppointments />} />
          <Route path="/LabResults" element={<LabResults />} />
          <Route path="/DoctorProfile/:id" element={<DoctorProfile />} />
          <Route path="/MedicalExecuseD" element={<MedicalExecuseD />} />
          <Route path="/MedicalExecuseDetails" element={<MedicalExecuseDetails />} />
          <Route path="/receptionistProfile/:id" element={<ReseptionistProfile />} />
          <Route path="/AddAppointment" element={<AddAppointment />} />
          <Route path="/ViewAppointment" element={<ViewAppointment />} />
          <Route path="/DoctorSchedule" element={<DoctorSchedule />} />
          <Route path="/labProfile/:id" element={<UploadResults />} />
          <Route path="/EmployeeSignUp" element={<EmployeeSignUp />} />
          <Route path="/DoctorSignUp" element={<DoctorSignUp />} />
          <Route path="/LabSignUp" element={<LabSignUp />} />
          <Route path="/SignUpSelection" element={<SignUpSelection />} />
          <Route path="/PreviousAppointments" element={<PreviousAppointments />} />
        </Routes>
      </Router>
    </div>
  )


}

export default App;



