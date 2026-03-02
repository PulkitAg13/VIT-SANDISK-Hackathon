import React from "react";
import { motion } from "framer-motion";

const ResultCard = ({ result, index }) => {

  const openFile = () => {
    const fileUrl = `http://localhost:8000/api/file?path=${encodeURIComponent(result.file_path)}`;
    window.open(fileUrl, "_blank");
  };

  return (
    <motion.div
      className="result-card"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {index === 0 && <div className="top-badge">Top Match</div>}

      <div className="result-title">{result.file_name}</div>
      <div className="result-path">{result.file_path}</div>

      <div className="confidence-bar-bg">
        <motion.div
          className="confidence-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${result.confidence}%` }}
        />
      </div>

      <div className="confidence-text">
        Confidence: {result.confidence}% — {result.reason}
      </div>

      <button className="open-button" onClick={openFile}>
        Open File
      </button>
    </motion.div>
  );
};

export default ResultCard;