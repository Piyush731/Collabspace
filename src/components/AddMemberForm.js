import React, { useState } from 'react';
import axios from 'axios';

const AddMemberForm = ({ repoId }) => {
  const [username, setUsername] = useState('');
  const [permission, setPermission] = useState('read');
  const [error, setError] = useState('');
  const API_URL= process.env.REACT_APP_API_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/collaborators`,
        { repoId, username, permission },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Member added successfully!');
      setUsername('');  //temp state true
      setPermission('read');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <select value={permission} onChange={(e) => setPermission(e.target.value)}>
        <option value="read">Read</option>
        <option value="write">Write</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">Add Member</button>
      {error && <p>{error}</p>}
    </form>
  );
};
export default AddMemberForm;
