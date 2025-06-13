import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";

const Layout = () => {
  <Outlet />;
};
let router = createBrowserRouter([
  {
    path: "/",
    elemnt:<Layout/>
  },
]);
const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
