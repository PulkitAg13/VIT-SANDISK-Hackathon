import React from "react";

const ConfidenceBar = ({ value }) => {
  return (
    <div className="confidence-wrapper">
      <div
        className="confidence-bar"
        style={{ width: `${value}%` }}
      ></div>
      <span className="confidence-value">{value}%</span>
    </div>
  );
};

export default ConfidenceBar;