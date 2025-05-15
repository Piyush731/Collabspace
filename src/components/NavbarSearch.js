import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NavbarSearch = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?` + new URLSearchParams({ q: query }));
    }
  };

  return (
    <input
      type="text"
      value={query}
      onChange={e => setQuery(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="Search..."
      className="w-40 md:w-64 px-3 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};

export default NavbarSearch; 