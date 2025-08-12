// appRouter.js
import { createBrowserRouter } from "react-router-dom";
import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import FormFillPage from "./pages/FormFillPage";
import ContactPage from "./pages/ContactPage";
import DonatePage from "./pages/DonatePage";
import NotFoundPage from "./pages/NotFoundPage";

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
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export default router;
