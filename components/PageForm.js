"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// 👇 SSR issue avoid karne ke liye dynamic import
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ align: [] }],
  ["link"],
  ["clean"],
];

export default function PageForm({ onSubmit, initialData }) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
  });

  const [isSlugEdited, setIsSlugEdited] = useState(false);

  // edit mode ke liye
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setIsSlugEdited(true);
    }
  }, [initialData]);

  // title → slug auto generate
  useEffect(() => {
    if (!isSlugEdited && formData.title) {
      const generatedSlug = formData.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, isSlugEdited]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "slug") setIsSlugEdited(true);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData); // content = HTML string
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded shadow"
    >
      <div>
        <label className="block font-semibold mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Slug</label>
        <input
          type="text"
          name="slug"
          value={formData.slug}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-1">Content</label>
        {/* 👇 textarea ki jagah RichText Editor */}
        <ReactQuill
          theme="snow"
          value={formData.content}
          onChange={(html) => setFormData((p) => ({ ...p, content: html }))}
          modules={{ toolbar: toolbarOptions }}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Save Page
      </button>
    </form>
  );
}
