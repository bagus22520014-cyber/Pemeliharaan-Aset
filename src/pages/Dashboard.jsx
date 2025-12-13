import React, { useState, useEffect } from "react";
import {
  FaBox,
  FaTools,
  FaExclamationTriangle,
  FaClock,
  FaDollarSign,
  FaChartLine,
  FaPlus,
  FaWrench,
  FaBell,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { listAset } from "@/api/aset";

export default function Dashboard() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await listAset({ includeBebanHeader: false });
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      // ignore dashboard load errors
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalAktif = assets.filter((a) => a.statusAset === "aktif").length;
  const totalRusak = assets.filter((a) => a.statusAset === "rusak").length;
  const totalPerbaikan = assets.filter(
    (a) => a.statusAset === "diperbaiki"
  ).length;
  const totalOverdue = 0; // TODO: Calculate based on maintenance schedule
  const totalDowntime = 0; // TODO: Calculate from repair records

  // Recent activities (mock data for now)
  const recentActivities = [
    {
      id: 1,
      type: "perbaikan",
      title: "Router Mikrotik CCR - Selesai Diperbaiki",
      time: "2 jam yang lalu",
      status: "success",
    },
    {
      id: 2,
      type: "rusak",
      title: "Laptop Dell Latitude - Dilaporkan Rusak",
      time: "5 jam yang lalu",
      status: "warning",
    },
    {
      id: 3,
      type: "maintenance",
      title: "Server Mini HP ProLiant - Maintenance Terjadwal",
      time: "1 hari yang lalu",
      status: "info",
    },
  ];

  // Overdue assets (mock)
  const overdueAssets = [
    {
      id: 1,
      name: "AC Standing Samsung 2PK",
      dueDate: "2025-12-01",
      days: 9,
    },
    {
      id: 2,
      name: "Switch Cisco 24 Port",
      dueDate: "2025-12-05",
      days: 5,
    },
  ];

  // Upcoming maintenance (mock)
  const upcomingMaintenance = [
    {
      id: 1,
      name: "UPS APC 1000VA",
      date: "2025-12-15",
      type: "Preventive Maintenance",
    },
    {
      id: 2,
      name: "Access Point UniFi U6",
      date: "2025-12-18",
      type: "Routine Check",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards - Ringkasan Cepat */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Aset Aktif</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {totalAktif}
              </p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <FaArrowUp className="text-xs" />
                <span>8.5% vs bulan lalu</span>
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FaBox className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Butuh Maintenance</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {totalOverdue}
              </p>
              <p className="text-xs text-gray-500 mt-1">Hari ini</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <FaCalendarAlt className="text-orange-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Aset Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {overdueAssets.length}
              </p>
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <FaClock className="text-xs" />
                <span>Perlu perhatian</span>
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Dalam Perbaikan</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {totalPerbaikan}
              </p>
              <p className="text-xs text-gray-500 mt-1">Sedang proses</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FaTools className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Total Downtime</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {totalDowntime}h
              </p>
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <FaArrowDown className="text-xs" />
                <span>12% vs bulan lalu</span>
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <FaClock className="text-gray-600 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tren Pemeliharaan */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Tren Pemeliharaan
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Aktivitas 6 bulan terakhir
                </p>
              </div>
              <FaChartLine className="text-indigo-600 text-xl" />
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {[65, 78, 45, 82, 56, 90].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-indigo-500 rounded-t-lg hover:bg-indigo-600 transition cursor-pointer relative group"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {height} aktivitas
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Jul</span>
              <span>Agu</span>
              <span>Sep</span>
              <span>Okt</span>
              <span>Nov</span>
              <span>Des</span>
            </div>
          </div>

          {/* Aset Rusak per Kategori */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Aset Rusak per Kategori
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Distribusi kerusakan
                </p>
              </div>
              <FaExclamationTriangle className="text-red-600 text-xl" />
            </div>
            <div className="space-y-3">
              {[
                { name: "KOMPUTER", count: 5, total: 45, color: "bg-blue-500" },
                {
                  name: "HEADEND",
                  count: 3,
                  total: 28,
                  color: "bg-purple-500",
                },
                {
                  name: "DISTRIBUSI JARINGAN",
                  count: 2,
                  total: 32,
                  color: "bg-green-500",
                },
                {
                  name: "PERALATAN KANTOR",
                  count: 4,
                  total: 38,
                  color: "bg-orange-500",
                },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 font-medium">
                      {item.name}
                    </span>
                    <span className="text-gray-600">
                      {item.count}/{item.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all`}
                      style={{ width: `${(item.count / item.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aktivitas Terbaru */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Aktivitas Terbaru
              </h3>
              <Link
                to="/pemeliharaan/riwayat"
                className="text-xs text-indigo-600 hover:text-indigo-700"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <div
                    className={`p-2 rounded-lg ${
                      activity.status === "success"
                        ? "bg-green-100"
                        : activity.status === "warning"
                        ? "bg-yellow-100"
                        : "bg-blue-100"
                    }`}
                  >
                    {activity.type === "perbaikan" ? (
                      <FaTools
                        className={`${
                          activity.status === "success"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      />
                    ) : activity.type === "rusak" ? (
                      <FaExclamationTriangle className="text-yellow-600" />
                    ) : (
                      <FaWrench className="text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Reminders & Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Link
                to="/aset/daftar"
                className="flex items-center gap-3 p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition group"
              >
                <div className="bg-indigo-600 p-2 rounded-lg group-hover:scale-110 transition">
                  <FaPlus className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Tambah Aset
                  </p>
                  <p className="text-xs text-gray-500">Daftarkan aset baru</p>
                </div>
              </Link>

              <Link
                to="/pemeliharaan/request"
                className="flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition group"
              >
                <div className="bg-orange-600 p-2 rounded-lg group-hover:scale-110 transition">
                  <FaWrench className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Request Perbaikan
                  </p>
                  <p className="text-xs text-gray-500">Buat tiket perbaikan</p>
                </div>
              </Link>

              <Link
                to="/pemeliharaan/jadwal"
                className="flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition group"
              >
                <div className="bg-green-600 p-2 rounded-lg group-hover:scale-110 transition">
                  <FaCalendarAlt className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Jadwal Maintenance
                  </p>
                  <p className="text-xs text-gray-500">
                    Atur jadwal pemeliharaan
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Aset Overdue */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <FaBell className="text-red-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Aset Overdue
              </h3>
            </div>
            <div className="space-y-3">
              {overdueAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {asset.name}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-600">
                      Due: {asset.dueDate}
                    </p>
                    <span className="text-xs font-semibold text-red-600">
                      {asset.days} hari
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Jadwal Maintenance Terdekat */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <FaCalendarAlt className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-800">
                Maintenance Terdekat
              </h3>
            </div>
            <div className="space-y-3">
              {upcomingMaintenance.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{item.type}</p>
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    📅 {item.date}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Notifikasi Status */}
          <div className="bg-linear-to-br from-yellow-50 to-orange-50 rounded-xl p-6 shadow-md border border-yellow-200">
            <div className="flex items-center gap-2 mb-3">
              <FaBell className="text-yellow-600 animate-pulse" />
              <h3 className="text-sm font-semibold text-gray-800">
                Aset Mendekati Usia Depresiasi
              </h3>
            </div>
            <p className="text-xs text-gray-700 mb-2">
              5 aset akan mencapai akhir masa manfaat dalam 30 hari
            </p>
            <Link
              to="/monitoring/overdue"
              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
            >
              Lihat Detail →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
