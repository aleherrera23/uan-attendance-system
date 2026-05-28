import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import CreateQR from "./pages/CreateQR";
import ScanQR from "./pages/ScanQR";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateQR />} />
          <Route path="/scan" element={<ScanQR />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}