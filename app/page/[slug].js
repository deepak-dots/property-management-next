import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from '../../utils/axiosInstance';

export default function CmsPage() {
  const router = useRouter();
  const { slug } = router.query;

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return; 

    async function fetchPage() {
      try {
        const res = await axios.get(`/pages/${slug}`);
        setPage(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    }

    fetchPage();
  }, [slug]);

  if (loading) return <p className="text-center py-10">Loading...</p>;
  if (!page) return <p className="text-center py-10">Page not found</p>;

  // Check if content contains HTML tags
  const hasHTML = /<\/?[a-z][\s\S]*>/i.test(page.content);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{page.title}</h1>

      {hasHTML ? (
        <div
          className="prose max-w-full"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        // Convert plain text into paragraphs
        <div className="prose max-w-full">
          {page.content.split("\n\n").map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      )}
    </div>
  );
}
