// appRouter.js
import { createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import FormFillPage from "./pages/FormFillPage";
import ContactPage from "./pages/ContactPage";
import DonatePage from "./pages/DonatePage";
import NotFoundPage from "./pages/NotFoundPage";
import StoragePage from "./pages/StoragePage";
import ProgressPage from "./pages/ProgressPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFoundPage />, // error boundary cho nhánh này
    children: [
      { index: true, element: <HomePage /> },
      { path: "formfill", element: <FormFillPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "donate", element: <DonatePage /> },
      { path: "storage", element: <StoragePage /> },
      { path: "progress", element: <ProgressPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;
