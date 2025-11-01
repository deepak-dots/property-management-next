// pages/compare.js
import React, { useEffect, useState } from 'react';
import { useCompare } from '../../context/CompareContext';
import api from '../../utils/axiosInstance';
import Link from 'next/link';
import { useRouter } from 'next/router';


const ATTRS = [
  { key: 'title', label: 'Title' },
  { key: 'images', label: 'Image', isImage: true },
  { key: 'price', label: 'Price' },
  { key: 'bhkType', label: 'BHK / Type' },
  { key: 'bedrooms', label: 'Bedrooms' },
  { key: 'bathrooms', label: 'Bathrooms' },
  { key: 'superBuiltupArea', label: 'Area (sqft)' },
  { key: 'address', label: 'Address' },
];

export default function ComparePage() {
  const router = useRouter();
  const { compareList, clearCompare, toggleCompare } = useCompare();
  const [propsMap, setPropsMap] = useState({});
  const [allProperties, setAllProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch compare properties
  useEffect(() => {
    if (!compareList || compareList.length === 0) {
      setPropsMap({});
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const ids = compareList.join(',');
        const res = await api.get(
          `/properties/compare-properties?ids=${encodeURIComponent(ids)}`
        );
        const data = res.data || [];
        const map = {};
        data.forEach((p) => (map[p._id] = p));
        setPropsMap(map);
      } catch (err) {
        console.error('Compare page fetch error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [compareList]);

// 🔹 Fetch all properties for dropdown
useEffect(() => {
  const fetchAll = async () => {
    try {
      const res = await api.get('/properties?limit=1000');
      // safe check
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.properties || [];
      setAllProperties(list);
    } catch (err) {
      console.error('All properties fetch error', err);
      setAllProperties([]); // fallback empty
    }
  };
  fetchAll();
}, []);


  const ordered = compareList.map((id) => propsMap[id]).filter(Boolean);

  if (loading) return <div className="p-8">Loading…</div>;

  return (
      <div className="p-4 md:p-8">

      {/* Compare Control Panel */}
      <section className="max-w-6xl mx-auto mt-4 mb-8 p-4 md:p-6 bg-blue-50 rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold mb-4 text-center">Compare Properties</h1>

        <div className="flex flex-wrap justify-center items-center gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-200 text-blue-800 rounded hover:bg-blue-300 transition text-sm md:text-base"
          >
            Back to listings
          </button>

          <select
            className="border rounded px-3 py-2 bg-white text-sm md:text-base"
            onChange={(e) => {
              const id = e.target.value;
              if (id) toggleCompare(id);
              e.target.value = '';
            }}
          >
            <option value="">➕ Add property to compare</option>
            {Array.isArray(allProperties) && allProperties.length > 0
              ? allProperties.map((p) => (
                  <option
                    key={p._id}
                    value={p._id}
                    disabled={compareList.includes(p._id)}
                  >
                    {p.title} ({p.city})
                  </option>
                ))
              : <option disabled>No properties available</option>}
          </select>

          <button
            onClick={clearCompare}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm md:text-base"
          >
            Clear All
          </button>
        </div>
      </section>

      {/* No properties selected */}
      {ordered.length === 0 ? (
        <div className="text-center text-gray-600 mt-6">No properties selected. Use the dropdown above.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] md:min-w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="border p-2 md:p-3 bg-gray-50 text-left">Attribute</th>
                {ordered.map((p) => (
                  <th key={p._id} className="border p-2 md:p-3 align-top">
                    <div className="flex justify-between items-start">
                      <div className="text-left">
                          <div className="font-semibold text-sm md:text-base">
                            <Link href={`/properties/${p._id}`}
                              className=""
                              >{p.title}
                            </Link>
                          </div>
                          <div className="text-xs md:text-sm text-gray-600">
                            {p.address}, {p.city}
                          </div>
                      </div>
                      <button
                        onClick={() => toggleCompare(p._id)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 ml-2"
                      >
                        X
                      </button>
                    </div>
                  </th>
                ))}
              </tr> 

            </thead>

            <tbody>
              {ATTRS.map((attr) => (
                <tr key={attr.key} className="text-sm md:text-base">
                  <td className="border p-2 md:p-3 font-medium bg-gray-50">{attr.label}</td>
                  {ordered.map((p) => (
                    <td key={`${p._id}-${attr.key}`} className="border p-2 md:p-3 align-top">
                      {attr.isImage ? (
                        p.images?.[0] ? (
                          <div className="w-20 md:w-32 h-20 md:h-32 overflow-hidden rounded">
                            <Link href={`/properties/${p._id}`}
                              className=""
                              >
                            <img
                              src={
                                p.images[0].startsWith('http')
                                  ? p.images[0]
                                  : `${process.env.NEXT_PUBLIC_API_URL}/uploads/${p.images[0]}`
                              }
                              alt={p.title}
                              className="w-full h-full object-cover block"
                            />
                            </Link>
                          </div>
                        ) : '—'
                      ) : attr.key === 'price' ? (
                        p.price ? `₹ ${p.price.toLocaleString()}` : '—'
                      )  : (
                        p[attr.key] ?? '—'
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>

  );
}
