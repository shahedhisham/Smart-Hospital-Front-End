import React from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import check from "../Animation/check.json";
import "./confirmation.css";

const Confirmation = () => {
  const location = useLocation();
  const { 
    doctorName = "",
    date = new Date().toISOString().split('T')[0],
    time = "",
    cost = "50 EGP",
    discount = "No discount",
    total = cost,
    reservationNumber = `D-${Math.floor(100000 + Math.random() * 900000)}`
  } = location.state || {};

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="thank-you-container">
      <div className="thank-you-card">
        <div className="lottie-container1">
          <Lottie 
            animationData={check} 
            style={{ width: 100, height: 100 }} 
          />
        </div>

        <h1 className="thank-you-title">Thank You!</h1>
        <p className="appointment-success">
          Your Appointment Was Booked Successfully
        </p>

        <div className="appointment-details">
          <p>
            You booked an appointment with <strong>{doctorName}</strong>
          </p>
          <p>
            on <strong>{formattedDate}</strong>, at <strong>{time}</strong>
          </p>
          <p>
            Reservation Number: <strong>{reservationNumber}</strong>
          </p>
          <p>
            Base Cost: <strong>{cost}</strong>
          </p>
          <p>
            Discount: <strong>{discount}</strong>
          </p>
          <p>
            Total Cost: <strong>{total}</strong>
          </p>
        </div>

        <div className="divider"></div>

        <Link to="/"> <button className="done-button"> Done </button></Link>
      </div>
    </div>
  );
};

export default Confirmation;
