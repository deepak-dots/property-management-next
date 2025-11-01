'use client';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  HomeIcon, UserIcon, PencilIcon, HeartIcon, 
  ChatBubbleLeftEllipsisIcon, ArrowRightOnRectangleIcon, Bars3Icon 
} from '@heroicons/react/24/outline';

export default function UserSidebar({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    window.dispatchEvent(new Event('logout'));
    router.push('/user/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <HomeIcon className="h-5 w-5 mr-2" />, path: '/user/dashboard' },
    { name: 'My Profile', icon: <UserIcon className="h-5 w-5 mr-2" />, path: '/user/profile' },
    { name: 'Edit Profile', icon: <PencilIcon className="h-5 w-5 mr-2" />, path: '/user/profile/edit' },
    { name: 'My Favorites', icon: <HeartIcon className="h-5 w-5 mr-2" />, path: '/user/favorites' },
    { name: 'My Enquiries', icon: <ChatBubbleLeftEllipsisIcon className="h-5 w-5 mr-2" />, path: '/user/enquiries' },
  ];

  // Determine active index
  let activeIndex = -1;
  if (pathname) {
    // Try exact match first
    activeIndex = menuItems.findIndex(item => item.path === pathname);
    // If no exact match, try startsWith for parent route
    if (activeIndex === -1) {
      activeIndex = menuItems.findIndex(item => pathname.startsWith(item.path + '/'));
    }
  }

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="sm:hidden flex justify-between items-center bg-white p-4 shadow-md">
        <span className="font-semibold">{user?.name || 'User'}</span>
        <button onClick={() => setIsOpen(!isOpen)}>
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`bg-white shadow-md sm:block fixed sm:relative top-0 left-0 h-full sm:h-auto w-64 p-6 transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0 z-50`}>
        <h2 className="text-2xl font-bold mb-6 hidden sm:block">Welcome, {user?.name || 'User'}</h2>
        <nav className="flex flex-col space-y-2">
          {menuItems.map((item, idx) => {
            const isActive = idx === activeIndex; // only one active
            return (
              <button
                key={idx}
                onClick={() => { router.push(item.path); setIsOpen(false); }}
                className={`flex items-center px-4 py-2 rounded text-left transition
                  ${isActive ? 'bg-gray-300 font-semibold' : 'hover:bg-gray-200'}`}
              >
                {item.icon} {item.name}
              </button>
            );
          })}

          <button
            onClick={handleLogout}
            className="mt-4 flex items-center px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" /> Logout
          </button>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black opacity-30 z-40 sm:hidden" onClick={() => setIsOpen(false)} />}
    </>
  );
}
