export const searchFiles = async (query) => {
  const response = await fetch("http://localhost:8000/api/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: query,
      top_k: 5
    })
  });

  if (!response.ok) {
    throw new Error("Search failed");
  }

  return response.json();
};