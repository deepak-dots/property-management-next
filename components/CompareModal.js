// components/CompareModal.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useCompare } from '../context/CompareContext';
import api from '../utils/axiosInstance';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CompareModal({ isOpen, onClose }) {
  const router = useRouter();
  const { compareList, toggleCompare, clearCompare } = useCompare();
  const [propsData, setPropsData] = useState([]);
  const [loading, setLoading] = useState(false);

  // fetch property details for ids in compareList
  useEffect(() => {
    if (!isOpen) return;
    if (!compareList || compareList.length === 0) {
      setPropsData([]);
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const ids = compareList.join(',');
        const res = await api.get(`/properties/compare-properties?ids=${encodeURIComponent(ids)}`);
        setPropsData(res.data || []);
      } catch (err) {
        console.error('CompareModal fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isOpen, compareList]);

  if (!isOpen) return null;

  const getImageUrl = (img) => (img?.startsWith?.('http') ? img : `${API_URL}/uploads/${img}`);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black opacity-50" />

      <div
        className="relative bg-white rounded-lg shadow-lg w-full max-w-3xl p-5 z-60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Compare ({compareList.length})</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 px-2 py-1"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : compareList.length === 0 ? (
          <div>No properties selected for comparison.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3">
              {propsData.map((p) => (
                <div key={p._id} className="flex items-center gap-3 border rounded p-2">
                  <img
                    src={getImageUrl(p.images?.[0] || '')}
                    alt={p.title}
                    className="w-20 h-14 object-cover rounded"
                    onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{p.title}</div>
                    <div className="text-sm text-gray-600">₹ {p.price ?? '-'}</div>
                    <div className="text-sm text-gray-500">{p.address ?? p.city ?? ''}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => toggleCompare(p._id)}
                      className="px-3 py-1 rounded bg-red-500 text-white text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-4">
              <button
                onClick={() => { clearCompare(); onClose(); }}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Clear All
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClose();
                    router.push('/properties/compare');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Go to Compare Page
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
