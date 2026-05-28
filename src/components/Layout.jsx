import { Link } from "react-router-dom";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      
      {/* NAVBAR */}
      <nav className="bg-uanBlue text-white px-6 py-4 flex justify-between items-center">
        <h1 className="font-bold text-lg">
          UAN Asistencia QR
        </h1>

        <div className="flex gap-4">
          <Link to="/" className="hover:text-uanGold">Dashboard</Link>
          <Link to="/create" className="hover:text-uanGold">Crear QR</Link>
          <Link to="/scan" className="hover:text-uanGold">Escanear</Link>
        </div>
      </nav>

      {/* CONTENIDO */}
      <div className="p-6">
        {children}
      </div>

    </div>
  );
}