import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchData = async () => {
    setLoading(true);

    const { data: sessionsData } = await supabase
      .from("attendance_sessions")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: recordsData } = await supabase
      .from("attendance_records")
      .select("*")
      .order("created_at", { ascending: false });

    setSessions(sessionsData || []);
    setRecords(recordsData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const countStatus = (status) =>
    records.filter((r) => r.status === status).length;

  // 🎯 filtrar registros por sesión seleccionada
  const sessionRecords = selectedSession
    ? records.filter(
        (r) => r.session_code === selectedSession.code
      )
    : [];

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        Cargando dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold text-uanBlue">
        Dashboard de Asistencia
      </h1>

      {/* 📊 ESTADÍSTICAS */}
      <div className="grid grid-cols-3 gap-4">

        <div className="p-4 bg-green-100 rounded">
          <p className="font-bold">Válidos</p>
          <p className="text-xl">{countStatus("valido")}</p>
        </div>

        <div className="p-4 bg-yellow-100 rounded">
          <p className="font-bold">Sospechosos</p>
          <p className="text-xl">{countStatus("sospechoso")}</p>
        </div>

        <div className="p-4 bg-red-100 rounded">
          <p className="font-bold">Fuera</p>
          <p className="text-xl">{countStatus("fuera")}</p>
        </div>

      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* 📚 SESIONES */}
        <div>
          <h2 className="text-xl font-semibold mt-6">
            Sesiones creadas
          </h2>

          <div className="space-y-2 mt-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedSession(s)}
                className="p-3 border rounded cursor-pointer hover:bg-gray-100"
              >
                <p className="font-bold">{s.title}</p>
                <p className="text-sm text-gray-500">
                  Código: {s.code}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 📌 DETALLE SESIÓN */}
        <div>
          <h2 className="text-xl font-semibold mt-6">
            Detalle sesión
          </h2>

          {selectedSession ? (
            <div className="p-4 border rounded space-y-2">

              <p>
                <strong>Clase:</strong> {selectedSession.title}
              </p>

              <p>
                <strong>Código:</strong> {selectedSession.code}
              </p>

              <p className="text-sm text-gray-500">
                Inicio: {selectedSession.start_time || "N/A"}
              </p>

              <p className="text-sm text-gray-500">
                Fin: {selectedSession.end_time || "N/A"}
              </p>

              {/* 🎯 QR */}
              {selectedSession.qr_data && (
                <img
                  src={selectedSession.qr_data}
                  className="w-48 border rounded"
                />
              )}

              {/* 👥 ESTUDIANTES DE ESA CLASE */}
              <div className="mt-4">
                <h3 className="font-semibold">
                  Estudiantes registrados
                </h3>

                {sessionRecords.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No hay registros aún
                  </p>
                ) : (
                  sessionRecords.map((r) => (
                    <div
                      key={r.id}
                      className="mt-2 p-2 border rounded"
                    >
                      <p className="font-bold">
                        {r.student_name}
                      </p>
                      <p className="text-sm">
                        {r.student_email}
                      </p>

                      <p className="text-sm">
                        Distancia:{" "}
                        {r.distance_meters?.toFixed(2)} m
                      </p>

                      <p className="text-sm">
                        Estado:{" "}
                        <span
                          className={
                            r.status === "valido"
                              ? "text-green-600"
                              : r.status === "sospechoso"
                              ? "text-yellow-600"
                              : "text-red-600"
                          }
                        >
                          {r.status}
                        </span>
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">
              Selecciona una sesión
            </p>
          )}
        </div>

      </div>

      {/* 📋 ÚLTIMAS ASISTENCIAS */}
      <div>
        <h2 className="text-xl font-semibold mt-6">
          Últimas asistencias
        </h2>

        <div className="space-y-2 mt-2">
          {records.slice(0, 10).map((r) => (
            <div key={r.id} className="p-3 border rounded">

              <p className="font-bold">
                {r.student_name}
              </p>

              <p className="text-sm">{r.student_email}</p>

              <p className="text-sm">
                Clase:{" "}
                <span className="font-semibold">
                  {sessions.find(
                    (s) => s.code === r.session_code
                  )?.title || "Desconocida"}
                </span>
              </p>

              <p className="text-sm">
                Distancia: {r.distance_meters?.toFixed(2)} m
              </p>

              <p className="text-sm">
                Estado:{" "}
                <span
                  className={
                    r.status === "valido"
                      ? "text-green-600"
                      : r.status === "sospechoso"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }
                >
                  {r.status}
                </span>
              </p>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
}