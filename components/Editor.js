"use client";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// SSR issues avoid: dynamic import with ssr:false
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const toolbar = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline", "strike"],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ align: [] }],
  ["link"],
  ["clean"],
];

export default function RichText({ value, onChange }) {
  return (
    <div className="border rounded">
      <ReactQuill
        theme="snow"
        value={value || ""}
        onChange={onChange}
        modules={{ toolbar }}
      />
    </div>
  );
}
