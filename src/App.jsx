import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {
  FaHome,
  FaBox,
  FaTags,
  FaCheckCircle,
  FaCalendarAlt,
  FaHistory,
  FaWrench,
  FaCubes,
  FaExchangeAlt,
  FaTruck,
  FaExclamationTriangle,
  FaClock,
  FaTools,
  FaUsers,
  FaFileAlt,
  FaChartLine,
  FaDollarSign,
  FaCog,
  FaClipboardCheck,
} from "react-icons/fa";
import Login from "@/pages/Login";
import DaftarAset from "@/pages/aset/DaftarAset";
import DaftarAsetUser from "@/pages/aset/DaftarAsetUser";
import MainLayout from "@/components/MainLayout";
import Dashboard from "@/pages/Dashboard";
import KategoriAset from "@/pages/aset/KategoriAset";
import StatusAset from "@/pages/aset/StatusAset";
import JadwalPemeliharaan from "@/pages/pemeliharaan/JadwalPemeliharaan";
import RiwayatPemeliharaan from "@/pages/pemeliharaan/RiwayatPemeliharaan";
import RequestPerbaikan from "@/pages/pemeliharaan/RequestPerbaikan";
import AsetRusak from "@/pages/monitoring/AsetRusak";
import AsetOverdue from "@/pages/monitoring/AsetOverdue";
import AsetDalamPerbaikan from "@/pages/monitoring/AsetDalamPerbaikan";
import UserManagement from "@/pages/UserManagement";
import LaporanPemeliharaan from "@/pages/laporan/LaporanPemeliharaan";
import LaporanDowntime from "@/pages/laporan/LaporanDowntime";
import LaporanBiaya from "@/pages/laporan/LaporanBiaya";
import Pengaturan from "@/pages/Pengaturan";
import PendingApprovals from "@/pages/approval/PendingApprovals";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => setUser(null);

  if (!user) return <Login onLogin={handleLogin} />;
  if (user.role !== "admin" && user.role !== "user") {
    handleLogout();
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard and New Pages */}
        <Route
          path="/dashboard"
          element={
            <MainLayout
              user={user}
              onLogout={handleLogout}
              title="Dashboard"
              icon={FaHome}
            >
              <Dashboard />
            </MainLayout>
          }
        />

        {/* Data Aset */}
        <Route
          path="/aset/daftar"
          element={
            <MainLayout
              user={user}
              onLogout={handleLogout}
              title="Daftar Aset"
              icon={FaBox}
            >
              {user.role === "admin" ? (
                <DaftarAset
                  user={user}
                  sessionUser={user}
                  onLogout={handleLogout}
                />
              ) : (
                <DaftarAsetUser
                  user={user}
                  sessionUser={user}
                  onLogout={handleLogout}
                />
              )}
            </MainLayout>
          }
        />
        <Route
          path="/aset/kategori"
          element={
            <MainLayout
              user={user}
              onLogout={handleLogout}
              title="Kategori Aset"
              icon={FaTags}
            >
              <KategoriAset />
            </MainLayout>
          }
        />
        <Route
          path="/aset/status"
          element={
            <MainLayout
              user={user}
              onLogout={handleLogout}
              title="Status Aset"
              icon={FaCheckCircle}
            >
              <StatusAset />
            </MainLayout>
          }
        />

        {/* Pemeliharaan */}
        <Route
          path="/pemeliharaan/jadwal"
          element={
            <MainLayout
              user={user}
              onLogout={handleLogout}
              title="Jadwal Pemeliharaan"
              icon={FaCalendarAlt}
            >
              <JadwalPemeliharaan />
            </MainLayout>
          }
        />
        <Route
          path="/pemeliharaan/riwayat"
          element={
            <MainLayout
              user={user}
              onLogout={handleLogout}
              title="Riwayat Pemeliharaan"
              icon={FaHistory}
            >
              <RiwayatPemeliharaan />
            </MainLayout>
          }
        />
        <Route
          path="/pemeliharaan/request"
          element={
            <MainLayout
              user={user}
              onLogout={handleLogout}
              title="Request Perbaikan"
              icon={FaWrench}
            >
              <RequestPerbaikan />
            </MainLayout>
          }
        />

        {/* Monitoring */}
        <Route
          path="/monitoring/rusak"
          element={
            <MainLayout
              user={user}
              onLogout={handleLogout}
              title="Aset Rusak"
              icon={FaExclamationTriangle}
            >
              <AsetRusak />
            </MainLayout>
          }
        />
        <Route
          path="/monitoring/overdue"
          element={
            <MainLayout
              user={user}
              onLogout={handleLogout}
              title="Aset Overdue"
              icon={FaClock}
            >
              <AsetOverdue />
            </MainLayout>
          }
        />
        <Route
          path="/monitoring/perbaikan"
          element={
            <MainLayout
              user={user}
              onLogout={handleLogout}
              title="Aset Dalam Perbaikan"
              icon={FaTools}
            >
              <AsetDalamPerbaikan />
            </MainLayout>
          }
        />

        {/* User Management */}
        <Route
          path="/users"
          element={
            <MainLayout
              user={user}
              onLogout={handleLogout}
              title="User Management"
              icon={FaUsers}
            >
              <UserManagement />
            </MainLayout>
          }
        />

        {/* Laporan */}
        <Route
          path="/laporan/pemeliharaan"
          element={
            <MainLayout
              user={user}
              onLogout={handleLogout}
              title="Laporan Pemeliharaan"
              icon={FaFileAlt}
            >
              <LaporanPemeliharaan />
            </MainLayout>
          }
        />
        <Route
          path="/laporan/downtime"
          element={
            <MainLayout
              user={user}
              onLogout={handleLogout}
              title="Laporan Downtime"
              icon={FaChartLine}
            >
              <LaporanDowntime />
            </MainLayout>
          }
        />
        <Route
          path="/laporan/biaya"
          element={
            <MainLayout
              user={user}
              onLogout={handleLogout}
              title="Laporan Biaya"
              icon={FaDollarSign}
            >
              <LaporanBiaya />
            </MainLayout>
          }
        />

        {/* Approval - Admin Only */}
        {user.role === "admin" && (
          <Route
            path="/approval/pending"
            element={
              <MainLayout
                user={user}
                onLogout={handleLogout}
                title="Persetujuan Menunggu"
                icon={FaClipboardCheck}
              >
                <PendingApprovals />
              </MainLayout>
            }
          />
        )}

        {/* Pengaturan */}
        <Route
          path="/pengaturan"
          element={
            <MainLayout
              user={user}
              onLogout={handleLogout}
              title="Pengaturan"
              icon={FaCog}
            >
              <Pengaturan />
            </MainLayout>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
