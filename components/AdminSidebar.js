// components/AdminSidebar.js
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function AdminSidebar({ onLogout }) {
  const router = useRouter();

  const navLinks = [
    { href: "/", label: "View Website", external: true },
    { href: "/admin/admin-profile", label: "Profile" },
    { href: "/admin/dashboard", label: "All Properties" },
    { href: "/admin/add-property", label: "Add New Property" },
    { href: "/admin/quote-form-enquiries", label: "Enquiry Contact" },
    { href: "/admin/review-rating-list", label: "Review Rating list" },
    { href: "/admin/cms-pages/pages", label: "Pages" },
  ];

  return (
    <aside className="bg-gray-800 text-white w-64 min-h-screen p-6 flex flex-col">
      <h2 className="text-2xl font-bold mb-8">Property Admin</h2>

      <nav className="flex-1 flex flex-col space-y-2">
        {navLinks.map((link) => (
          link.external ? (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 rounded hover:bg-gray-700"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </Link>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded hover:bg-gray-700 ${
                router.pathname === link.href ? "bg-gray-700" : ""
              }`}
            >
              {link.label}
            </Link>
          )
        ))}

        <button
          onClick={onLogout}
          className="mt-auto bg-red-500 hover:bg-red-600 w-full py-2 rounded text-white"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}
