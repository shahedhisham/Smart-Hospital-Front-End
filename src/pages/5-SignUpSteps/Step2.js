import React from "react";

const Step2 = ({ formData, setFormData, nextStep, prevStep }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-box">
        <h2 className="form-title">Step 2/3</h2>

        <label>Emergency Contact Name</label>
        <input
          type="text"
          name="emergencyContact"
          value={formData.emergencyContact}
          onChange={handleChange}
          className="input-field"
        />

        <label>Relationship</label>
        <select name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange} className="input-field">
          <option value="">Select Relationship</option>
          <option value="Parent">Parent</option>
          <option value="Sibling">Sibling</option>
          <option value="Spouse">Spouse</option>
          <option value="Friend">Friend</option>
          <option value="Other">Other</option>
        </select>

        <label>Emergency Contact Number</label>
        <input
          type="tel"
          name="emergencyContactNumber"
          value={formData.emergencyContactNumber}
          onChange={handleChange}
          className="input-field"
        />

        <div className="button-group">
          <button type="button" className="btn btn-secondary" onClick={prevStep}>
            Previous
          </button>
          <button type="submit" className="btn">
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step2;
