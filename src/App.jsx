import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout";
import HomePage from "./pages/HomePage";
import FormFillPage from "./pages/FormFillPage";
import ContactPage from "./pages/ContactPage";
import DonatePage from "./pages/DonatePage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  const [page, setPage] = useState("main");

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="introduce" element={<FormFillPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="donate" element={<DonatePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
