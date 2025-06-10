
const Step3 = ({ formData, setFormData, prevStep, handleSubmit }) => {
  const commonConditions = [
    "Diabetes",
    "High Blood Pressure",
    "Heart Disease",
    "Asthma",
    "Drug Allergy",
    "Liver Disease",
    "Kidney Disease",
    "Thyroid Disorder",
    "Epilepsy",
    "Mental Health Issues",
    "Cancer",
    "Chronic Pain",
    "Anemia",
    "Obesity",
    "Arthritis",
    "Stroke",
  ];

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      conditions: { ...prev.conditions, [name]: checked },
    }));
  };

  const handleTextChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      additionalNotes: e.target.value,
    }));
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="form-box">
        {/* ✅ عنوان Step 3/3 في الأعلى ومتمركز */}
        <span className="step-title">Step 3/3</span>

        <h2 className="form-title">Medical History</h2>

        <label>Select any medical conditions you have:</label>
        <div className="checkbox-group">
          {commonConditions.map((condition) => (
            <label key={condition} className="checkbox-label">
              <input
                type="checkbox"
                name={condition}
                checked={formData.conditions?.[condition] || false}
                onChange={handleCheckboxChange}
              />
              {condition}
            </label>
          ))}
        </div>

        <label>Additional Notes (if any)</label>
        <textarea
          name="additionalNotes"
          value={formData.additionalNotes || ""}
          onChange={handleTextChange}
          className="input-field"
          rows="3"
          placeholder="Mention any other medical condition..."
        />

<div className="step3-buttons">
  <button type="button" className="btn-btn-secondary" onClick={prevStep}>
    Previous
  </button>
  <button type="submit" className="btn btn-primary">
    Submit
  </button>
</div>


      </form>
    </div>
  );
};

export default Step3;
