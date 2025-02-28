import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateRepo = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found"); 
      const response = await axios.post(
        "http://localhost:5000/api/repos",
        { name, description, visibility },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Repository created:', response.data);
      navigate("/dashboard"); // Redirect to dashboard after creation
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create repository");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Repository</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Repository Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter repository name"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Repository Type
            </label>
            <select
              id="type"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="private">Private</option>
              <option value="public">Public</option>
            </select>
          </div> 
          
          <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
             Description </label>
             <textarea
              id="description"
              value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter repository description"
              rows="3"  />
           </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Repository
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRepo;