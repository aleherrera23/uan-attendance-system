import { useState } from "react";
import QRCode from "qrcode";
import { supabase } from "../services/supabase";

export default function CreateQR() {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [location, setLocation] = useState(null);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingQR, setLoadingQR] = useState(false);

  // 📍 obtener ubicación (robusto)
  const getLocation = () => {
    setLoadingLocation(true);

    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoadingLocation(false);
      },
      (error) => {
        console.error(error);
        alert("Activa permisos de ubicación");
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // 📥 descargar QR
  const downloadQR = () => {
    if (!qrUrl) return;

    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `qr-${code || "asistencia"}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🚀 generar QR + guardar sesión
  const generateQR = async () => {
    if (!title || !startTime || !endTime) {
      alert("Completa todos los campos");
      return;
    }

    if (!location) {
      alert("Primero registra tu ubicación");
      return;
    }

    setLoadingQR(true);

    try {
      // 🔑 código único
      const randomCode =
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 6);

      setCode(randomCode);

      // 📦 guardar en Supabase
      const sessionData = {
        title,
        code: randomCode,
        latitude: location.lat,
        longitude: location.lng,
        start_time: startTime,
        end_time: endTime,
        qr_data: null,
      };

      const { error } = await supabase
        .from("attendance_sessions")
        .insert(sessionData);

      if (error) {
        console.error(error);
        alert("Error guardando sesión");
        setLoadingQR(false);
        return;
      }

      // 📱 QR payload liviano
      const qrPayload = {
        code: randomCode,
        title,
      };

      const qr = await QRCode.toDataURL(JSON.stringify(qrPayload));

      setQrUrl(qr);

    } catch (err) {
      console.error(err);
      alert("Error generando QR");
    }

    setLoadingQR(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">

      <h1 className="text-2xl font-bold text-uanBlue">
        Crear Asistencia QR
      </h1>

      {/* TITULO */}
      <input
        className="w-full border p-2"
        placeholder="Nombre de la clase"
        onChange={(e) => setTitle(e.target.value)}
      />

      {/* HORARIOS */}
      <input
        type="datetime-local"
        className="w-full border p-2"
        onChange={(e) => setStartTime(e.target.value)}
      />

      <input
        type="datetime-local"
        className="w-full border p-2"
        onChange={(e) => setEndTime(e.target.value)}
      />

      {/* UBICACIÓN */}
      <button
        onClick={getLocation}
        disabled={loadingLocation}
        className="bg-gray-200 p-2 w-full hover:bg-gray-300"
      >
        {loadingLocation
          ? "Obteniendo ubicación..."
          : "Registrar mi ubicación"}
      </button>

      {location && (
        <p className="text-sm text-gray-600">
          📍 {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
        </p>
      )}

      {/* GENERAR */}
      <button
        onClick={generateQR}
        disabled={loadingQR}
        className="bg-uanBlue text-white p-2 w-full hover:bg-blue-900"
      >
        {loadingQR ? "Generando QR..." : "Generar QR"}
      </button>

      {/* CÓDIGO */}
      {code && (
        <p className="text-sm">
          Código: <strong>{code}</strong>
        </p>
      )}

      {/* QR */}
      {qrUrl && (
        <div className="flex flex-col items-center space-y-2">

          <img src={qrUrl} className="w-48" />

          {/* DESCARGAR */}
          <button
            onClick={downloadQR}
            className="bg-green-600 text-white p-2 w-full hover:bg-green-700"
          >
            Descargar QR
          </button>

        </div>
      )}

    </div>
  );
}