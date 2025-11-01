'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import axios from '../utils/axiosInstance';

export default function SearchBar({ initialSearch = '', onSearch }) {
  const [searchValue, setSearchValue] = useState(initialSearch);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef(null);

  // Close dropdown when clicked outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);


  // Fetch suggestions with debounce
  useEffect(() => {
    if (!searchValue) {
      setSuggestions([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        //  API call
        const res = await axios.get('/properties', {
          params: { search: searchValue },
        });
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.properties || [];
        setSuggestions(data);
      } catch (err) {
        console.error('Search error:', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400); // debounce 400ms

    return () => clearTimeout(t);
  }, [searchValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    onSearch(searchValue);
  };

  return (
    <div className="relative w-full" ref={boxRef}>
      {/* Search input */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={searchValue}
          placeholder="Search properties..."
          onFocus={() => setShowSuggestions(true)}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setShowSuggestions(true);
          }}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </form>

      {/* Suggestions Popup */}
      {showSuggestions && searchValue && (
        <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
          {loading && (
            <div className="p-3 text-sm text-gray-500">Loading...</div>
          )}

          {!loading && suggestions.length === 0 && (
            <div className="p-3 text-sm text-gray-500">No results found</div>
          )}

          {!loading &&
            suggestions.map((item) => (
              <Link
                key={item._id}
                href={`/properties/${item._id}`}
                onClick={() => setShowSuggestions(false)}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                <div className="text-sm font-medium">
                  {item.title ||
                    `${item.city || ''} ${item.bhkType || ''}`.trim()}
                </div>
                <div className="text-xs text-gray-600">
                  {[
                    item.city && `City: ${item.city}`,
                    item.bhkType && `BHK: ${item.bhkType}`,
                    item.price && `₹${item.price}`,
                  ]
                    .filter(Boolean)
                    .join(' • ')}
                </div>
              </Link>
            ))}

          {!loading && suggestions.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setShowSuggestions(false);
                onSearch(searchValue);
              }}
              className="w-full text-left px-4 py-2 text-sm border-t hover:bg-gray-50"
            >
              See all results for “{searchValue}”
            </button>
          )}
        </div>
      )}
    </div>
  );
}
