// context/CompareContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const CompareContext = createContext();

export const CompareProvider = ({ children, max = 4 }) => {
  const [compareList, setCompareList] = useState([]);

  // load from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('compareList');
      if (saved) setCompareList(JSON.parse(saved));
    } catch (err) {
      console.warn('CompareContext load error', err);
    }
  }, []);

  // persist to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('compareList', JSON.stringify(compareList));
    } catch (err) {
      console.warn('CompareContext save error', err);
    }
  }, [compareList]);

  // toggle (add/remove)
  const toggleCompare = (id) => {
    const sid = String(id);
    setCompareList(prev => {
      if (prev.includes(sid)) return prev.filter(x => x !== sid);
      if (prev.length >= max) {
        alert(`You can compare up to ${max} properties at once.`);
        return prev;
      }
      return [...prev, sid];
    });
  };

  const clearCompare = () => setCompareList([]);

  return (
    <CompareContext.Provider value={{ compareList, toggleCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => useContext(CompareContext);
