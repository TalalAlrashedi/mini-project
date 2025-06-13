import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import AdminPage from "../Pages/AdminPage";
import StudentPage from "../Pages/StudentPage";
import TeacherPage from "../Pages/TeacherPage";
const Layout = () => {
  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "admin", element: <AdminPage /> },
      { path: "student", element: <StudentPage /> },
      { path: "teacher", element: <TeacherPage /> },
    ],
  },
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
