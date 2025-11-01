// // utils/axiosInstance.js

// // utils/axiosInstance.js
// import axios from "axios";

// const instance = axios.create({
//   //baseURL: 'https://property-management-backend-hrjp.onrender.com/api',
//   baseURL: "http://localhost:5000/api", // or your production backend
//   withCredentials: true,
// });

// // Attach token from localStorage safely (only on client-side)
// instance.interceptors.request.use(
//   (config) => {
//     if (typeof window !== "undefined") {
//       // Check for adminToken first
//       const adminToken = localStorage.getItem("adminToken");
//       const userToken = localStorage.getItem("userToken");

//       if (adminToken) {
//         //config.headers.Authorization = `Bearer ${adminToken}`;
//       } else if (userToken) {
//         config.headers.Authorization = `Bearer ${userToken}`;
//       }
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor to handle 401 globally
// instance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.status === 401) {
//       if (typeof window !== "undefined") {
//         // Remove both tokens
//         localStorage.removeItem("userToken");
//         localStorage.removeItem("adminToken");

//         // Redirect based on current path
//         if (window.location.pathname.startsWith("/admin")) {
//          // window.location.href = "/admin/login";
//         } else {
//           window.location.href = "/user/login";
//         }
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// export default instance;


import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
});

export default instance;
