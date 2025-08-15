import { useEffect, useState } from "react";
import api from "../api"; // your axios instance pointing to backend
import { Link } from "react-router-dom";

export default function ApiDocs() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await api.get("/api/docs");
        setSections(res.data);
      } catch (err) {
        console.error("Failed to fetch API docs:", err);
      }
    };
    fetchDocs();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        API Documentation
      </h1>

      {sections.map((section) => (
        <div
          key={section.id}
          className="mb-4 p-4 rounded-lg border border-gray-300 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
        >
          <Link
            to={`/api/docs/${section.id}`}
            className="block text-blue-600 dark:text-blue-400 font-semibold text-lg"
          >
            {section.name}
          </Link>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {section.description}
          </p>
        </div>
      ))}
    </div>
  );
}
