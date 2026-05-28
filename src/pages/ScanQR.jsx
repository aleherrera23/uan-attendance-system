import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { supabase } from "../services/supabase";

export default function ScanQR() {
  const [manualCode, setManualCode] = useState("");
  const [student, setStudent] = useState({ name: "", email: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // 📍 ubicación
  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject("No soportado");

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        reject,
        { enableHighAccuracy: true }
      );
    });

  // 📏 distancia
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // 🚨 procesar asistencia
  const processCode = async (code) => {
    if (!code) return;

    if (!student.name || !student.email) {
      alert("Completa datos del estudiante");
      return;
    }

    setLoading(true);

    try {
      // 🔎 sesión
      const { data: session } = await supabase
        .from("attendance_sessions")
        .select("*")
        .eq("code", code)
        .single();

      if (!session) {
        alert("Código inválido");
        setLoading(false);
        return;
      }

      const location = await getLocation();

      const distance = calculateDistance(
        session.latitude,
        session.longitude,
        location.lat,
        location.lng
      );

      const statusValue =
        distance < 100
          ? "valido"
          : distance <= 300
          ? "sospechoso"
          : "fuera";

      // 🚫 ANTI DUPLICADO (MEJORADO)
      const { data: existing } = await supabase
        .from("attendance_records")
        .select("id")
        .eq("session_code", code)
        .eq("student_email", student.email)
        .maybeSingle();

      if (existing) {
        alert("Ya registraste esta asistencia");
        setLoading(false);
        return;
      }

      // 💾 guardar
      const { error } = await supabase
        .from("attendance_records")
        .insert({
          session_code: code,
          student_name: student.name,
          student_email: student.email,
          student_latitude: location.lat,
          student_longitude: location.lng,
          distance_meters: distance,
          status: statusValue,
        });

      if (error) {
        console.error(error);
        alert("Error guardando asistencia");
        setLoading(false);
        return;
      }

      setStatus(statusValue);
      alert("Asistencia registrada");

    } catch (err) {
      console.error(err);
      alert("Error en el proceso");
    }

    setLoading(false);
  };

  // 📷 scanner
  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    });

    scanner.render(async (decodedText) => {
      try {
        const parsed = JSON.parse(decodedText);
        await processCode(parsed.code);
        scanner.clear();
      } catch {
        alert("QR inválido");
      }
    });

    return () => scanner.clear();
  }, [student]);

  return (
    <div className="max-w-xl mx-auto space-y-4">

      <h1 className="text-xl font-bold">
        Escanear / Código manual
      </h1>

      <input
        placeholder="Nombre"
        className="border p-2 w-full"
        onChange={(e) =>
          setStudent({ ...student, name: e.target.value })
        }
      />

      <input
        placeholder="Correo"
        className="border p-2 w-full"
        onChange={(e) =>
          setStudent({ ...student, email: e.target.value })
        }
      />

      <input
        placeholder="Código manual"
        className="border p-2 w-full"
        value={manualCode}
        onChange={(e) => setManualCode(e.target.value)}
      />

      <button
        className="bg-uanBlue text-white w-full p-2"
        onClick={() => processCode(manualCode)}
        disabled={loading}
      >
        {loading ? "Validando..." : "Validar"}
      </button>

      <div id="reader"></div>

      {status && (
        <p className="text-center font-bold">
          Estado: {status}
        </p>
      )}

    </div>
  );
}