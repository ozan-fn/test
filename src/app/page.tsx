'use client';
import { useEffect, useState } from 'react';

type Report = {
  id: string;
  battery_percent: number;
  battery_voltage: number;
  signal: number;
  provider: string;
  timestamp: string;
};

export default function ReportViewer() {
  const [reports, setReports] = useState<Report[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReports = async () => {
    const res = await fetch(`/api/report/list?page=${page}&limit=10`);
    const json = await res.json();
    setReports(json.data);
    setTotalPages(json.totalPages);
  };

  useEffect(() => {
    fetchReports();
  }, [page]);

  return (
    <div className="min-h-screen  bg-gray-900 text-white p-4">
        <div className='max-w-7xl mx-auto'>
      <h1 className="text-xl font-bold mb-4">📊 Data SIM800L</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-md shadow-md">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="p-3">No</th>
              <th className="p-3">Battery %</th>
              <th className="p-3">Voltage</th>
              <th className="p-3">Signal</th>
              <th className="p-3">Provider</th>
              <th className="p-3">Waktu</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r, i) => (
              <tr key={r.id} className="border-b border-gray-600 hover:bg-gray-700">
                <td className="p-3">{i + 1}.</td>
                <td className="p-3">{r.battery_percent}%</td>
                <td className="p-3">{r.battery_voltage}V</td>
                <td className="p-3">{r.signal}</td>
                <td className="p-3">{r.provider}</td>
                <td className="p-3">{new Date(r.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          disabled={page <= 1}
          onClick={() => setPage((prev) => prev - 1)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
        >
          ← Prev
        </button>
        <span className="text-sm">Halaman {page} / {totalPages}</span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
        >
          Next →
        </button>
      </div></div>
    </div>
  );
}
