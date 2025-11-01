'use client';

import { useState, useEffect } from 'react';

export default function FilterBar({
  initialPropertyType = '',
  initialCity = '',
  initialBhkType = '',
  initialFurnishing = '',
  initialTransactionType = '',
  initialStatus = '',
  propertyTypes = [],
  cities = [],
  bhkTypes = [],
  furnishings = [],
  transactionTypes = [],
  statuses = [],
  onFilter,
  loading = false,
  coordsAllowed = false,
  handleShowNearest = () => {},
}) {
  const [propertyType, setPropertyType] = useState(initialPropertyType);
  const [city, setCity] = useState(initialCity);
  const [bhkType, setBhkType] = useState(initialBhkType);
  const [furnishing, setFurnishing] = useState(initialFurnishing);
  const [transactionType, setTransactionType] = useState(initialTransactionType);
  const [status, setStatus] = useState(initialStatus);

  // Sync props updates to local state
  useEffect(() => setPropertyType(initialPropertyType), [initialPropertyType]);
  useEffect(() => setCity(initialCity), [initialCity]);
  useEffect(() => setBhkType(initialBhkType), [initialBhkType]);
  useEffect(() => setFurnishing(initialFurnishing), [initialFurnishing]);
  useEffect(() => setTransactionType(initialTransactionType), [initialTransactionType]);
  useEffect(() => setStatus(initialStatus), [initialStatus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter({ city, bhkType, propertyType, furnishing, transactionType, status });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="flex gap-2 w-full flex-wrap">
        {/* Property Type */}
        <select
          value={propertyType}
          onChange={(e) => setPropertyType(e.target.value)}
          className="border border-gray-600 rounded-md px-3 py-2 bg-black text-white"
          disabled={loading}
        >
          <option value="">All Types</option>
          {propertyTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* City */}
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="border border-gray-600 rounded-md px-3 py-2 bg-black text-white"
          disabled={loading}
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* BHK Type */}
        <select
          value={bhkType}
          onChange={(e) => setBhkType(e.target.value)}
          className="border border-gray-600 rounded-md px-3 py-2 bg-black text-white"
          disabled={loading}
        >
          <option value="">All BHK</option>
          {bhkTypes.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Furnishing */}
        <select
          value={furnishing}
          onChange={(e) => setFurnishing(e.target.value)}
          className="border border-gray-600 rounded-md px-3 py-2 bg-black text-white"
          disabled={loading}
        >
          <option value="">All Furnishings</option>
          {furnishings.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>

        {/* Transaction Type */}
        <select
          value={transactionType}
          onChange={(e) => setTransactionType(e.target.value)}
          className="border border-gray-600 rounded-md px-3 py-2 bg-black text-white"
          disabled={loading}
        >
          <option value="">All Transactions</option>
          {transactionTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-600 rounded-md px-3 py-2 bg-black text-white"
          disabled={loading}
        >
          <option value="">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Submit button */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          Find Properties
        </button>

        
      </form>

     
 
    </div>
  );
}
