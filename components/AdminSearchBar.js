'use client';

import { useState, useEffect } from 'react';

export default function SearchBar({ initialSearch = '', onSearch }) {
  const [search, setSearch] = useState(initialSearch);

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = search.trim();
    onSearch(trimmed);
  };

  const handleClear = () => {
    setSearch('');
    onSearch(''); // all list dikhane ke liye
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full">
      <div className="relative flex-grow">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search properties..."
          className="w-full border border-gray-600 rounded-md px-4 py-2 pr-10 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Search
      </button>
    </form>
  );
}
