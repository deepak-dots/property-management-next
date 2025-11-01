"use client";

import { useEffect, useState } from "react";
import axios from "../utils/axiosInstance";
import PropertyCard from "../components/PropertyCard";

export default function Home() {
  const [recentProperties, setRecentProperties] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [recentRes, featuredRes] = await Promise.all([
          axios.get("/properties?limit=6"),
          axios.get("/properties?limit=7&featured=true"),
        ]);

        setRecentProperties(recentRes.data || []);
        setFeaturedProperties(featuredRes.data || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading properties...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">🏠 Welcome to Dotsquares eProperty</h1>

      {/* Featured Properties */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Featured Properties</h2>
        {featuredProperties.length === 0 ? (
          <p>No featured properties available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Properties */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Recently Added Properties</h2>
        {recentProperties.length === 0 ? (
          <p>No recent properties found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recentProperties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
