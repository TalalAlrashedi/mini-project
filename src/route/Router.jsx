import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import AdminPage from "../Pages/AdminPage";
import StudentPage from "../Pages/StudentPage";
import TeacherPage from "../Pages/TeacherPage";
import AuthPage from "../Pages/AuthPage";


const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/auth" />;
  if (role && user.role !== role) return <Navigate to="/auth" />;
  return children;
};

const Layout = () => {
  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <AuthPage /> },

      {
        path: "admin",
        element: (
          <ProtectedRoute role="admin">
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "student",
        element: (
          <ProtectedRoute role="student">
            <StudentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "teacher",
        element: (
          <ProtectedRoute role="teacher">
            <TeacherPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ],
  },
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;