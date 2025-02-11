import React, { useState } from "react";
import axios from "axios";

const PredictionForm = () => {
  const [inputData, setInputData] = useState(""); // User input
  const [prediction, setPrediction] = useState(null); // AI Response
  const [error, setError] = useState(null); // Error handling

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error message

    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", {
        features: [parseFloat(inputData)], // Convert input to number
      });

      setPrediction(response.data.prediction); // Set prediction result
    } catch (err) {
      setError("Error connecting to server. Is Flask running?");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>SpendSense AI Prediction</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          placeholder="Enter a value"
        />
        <button type="submit">Predict</button>
      </form>

      {prediction !== null && <h3>Prediction: {prediction}</h3>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default PredictionForm;
