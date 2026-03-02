import React, { useState } from "react";
import { motion } from "framer-motion";
import "../styles/smartsearch.css";
import SearchBar from "../components/SearchBar";
import ResultCard from "../components/ResultCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { searchFiles } from "../services/api";

const SmartSearchPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await searchFiles(query);
      setResults(response.results || []);
    } catch (error) {
      console.error(error);
      alert("Search failed.");
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* HEADER */}
      <div className="header">
        <h1>Smart File Finder</h1>
        <p>AI-Powered Hybrid Semantic Search Engine</p>
      </div>

      {/* SEARCH SECTION */}
      <div className="search-container">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* RESULTS SECTION */}
      <div className="results">
        {loading && <LoadingSpinner />}

        {!loading && results.length === 0 && (
          <p className="empty-state">
            No results yet. Try searching something.
          </p>
        )}

        {!loading &&
          results.map((result, index) => (
            <ResultCard
              key={index}
              result={result}
              index={index}   // 👈 PASSING INDEX FOR TOP BADGE + ANIMATION
            />
          ))}
      </div>
    </motion.div>
  );
};

export default SmartSearchPage;