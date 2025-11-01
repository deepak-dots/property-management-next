import { useState } from "react";
import axios from "../../../utils/axiosInstance";
import { useRouter } from "next/router";
import AdminSidebar from "../../../components/AdminSidebar";
import PageForm from "../../../components/PageForm";

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      await axios.post("/pages", data);
      router.push("/admin/cms-pages/pages"); // redirect to pages list
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Page</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* PageForm Component */}
        <PageForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
