from datetime import datetime
from app.database.db import get_connection


class HybridRanker:

    def __init__(self):
        pass

    # ------------------------------------------
    # Compute Recency Score
    # ------------------------------------------
    def _recency_score(self, last_accessed):

        if not last_accessed:
            return 0.0

        try:
            last_time = datetime.fromisoformat(last_accessed)
        except Exception:
            return 0.0

        days_since = (datetime.now() - last_time).days

        if days_since < 1:
            return 1.0
        elif days_since < 7:
            return 0.7
        elif days_since < 30:
            return 0.4
        else:
            return 0.1

    # ------------------------------------------
    # Compute Frequency Score
    # ------------------------------------------
    def _frequency_score(self, access_count):

        if access_count >= 20:
            return 1.0
        elif access_count >= 10:
            return 0.7
        elif access_count >= 5:
            return 0.4
        elif access_count >= 1:
            return 0.2
        else:
            return 0.0

    # ------------------------------------------
    # Filename Keyword Boost
    # ------------------------------------------
    def _filename_boost(self, query, file_name):

        query_words = set(query.lower().split())

        # Split filename on underscores, spaces, dots
        file_words = set(
            file_name.lower()
            .replace(".", " ")
            .replace("_", " ")
            .split()
        )

        match_count = len(query_words.intersection(file_words))

        if match_count >= 2:
            return 1.0
        elif match_count == 1:
            return 0.5
        else:
            return 0.0

    # ------------------------------------------
    # Main Hybrid Ranking Function
    # ------------------------------------------
    def rank(self, query, semantic_results):

        conn = get_connection()
        cursor = conn.cursor()

        ranked_results = []

        for result in semantic_results:

            file_path = result["file_path"]
            semantic_score = result["semantic_score"]

            # Normalize semantic score safely to [0,1]
            semantic_normalized = max(0.0, min(float(semantic_score), 1.0))

            cursor.execute("""
                SELECT access_count, last_accessed
                FROM files
                WHERE file_path = ?
            """, (file_path,))

            row = cursor.fetchone()

            if not row:
                continue

            access_count, last_accessed = row

            recency = self._recency_score(last_accessed)
            frequency = self._frequency_score(access_count)
            filename_score = self._filename_boost(query, result["file_name"])

            # Final weighted score
            final_score = (
                0.6 * semantic_normalized +
                0.2 * recency +
                0.1 * frequency +
                0.1 * filename_score
            )

            confidence = round(final_score * 100, 2)

            # ----------------------------
            # Generate Explanation
            # ----------------------------
            reason_parts = []

            if semantic_normalized > 0.7:
                reason_parts.append("Strong semantic similarity")
            elif semantic_normalized > 0.4:
                reason_parts.append("Moderate semantic similarity")
            elif semantic_normalized > 0.2:
                reason_parts.append("Low semantic similarity")

            if recency >= 0.7:
                reason_parts.append("Recently accessed")

            if frequency >= 0.7:
                reason_parts.append("Frequently used")

            if filename_score > 0:
                reason_parts.append("Filename matches query")

            reason = ", ".join(reason_parts) if reason_parts else "Moderate relevance"

            ranked_results.append({
                "file_name": result["file_name"],
                "file_path": file_path,
                "confidence": confidence,
                "reason": reason
            })

        conn.close()

        # Sort descending by confidence
        ranked_results.sort(key=lambda x: x["confidence"], reverse=True)

        return ranked_results