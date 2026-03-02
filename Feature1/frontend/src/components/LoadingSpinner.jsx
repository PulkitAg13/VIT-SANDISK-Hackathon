import React from "react";

const LoadingSpinner = () => {
  return (
    <div style={{ textAlign: "center", padding: "30px" }}>
      <div className="loader"></div>
      <p style={{ marginTop: "10px", color: "#777" }}>
        Searching intelligently...
      </p>
    </div>
  );
};

export default LoadingSpinner;