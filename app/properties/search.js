import { useState } from 'react';
import axios from '../../utils/axiosInstance';
import Link from 'next/link';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    try {
      const res = await axios.get('/properties');
      const filtered = res.data.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Search Properties</h1>
      <input
        type="text"
        placeholder="Search by title or category"
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ marginRight: 10, padding: 5 }}
      />
      <button onClick={handleSearch}>Search</button>

      <div style={{ marginTop: 20 }}>
        {results.length === 0 && <p>No results found.</p>}
        {results.map(p => (
          <div key={p._id} style={{ marginBottom: 15 }}>
            <Link href={`/properties/${p._id}`}>
             {p.title} ({p.category})
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
