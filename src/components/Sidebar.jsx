import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaBox,
  FaList,
  FaTags,
  FaCheckCircle,
  FaTools,
  FaCalendarAlt,
  FaHistory,
  FaWrench,
  FaCog,
  FaCubes,
  FaTruck,
  FaExclamationTriangle,
  FaClock,
  FaHammer,
  FaUsers,
  FaFileAlt,
  FaChevronDown,
  FaChevronRight,
  FaClipboardCheck,
} from "react-icons/fa";

const menuItems = [
  {
    title: "Dashboard",
    icon: FaHome,
    path: "/dashboard",
  },
  {
    title: "Data Aset",
    icon: FaBox,
    children: [
      { title: "Daftar Aset", path: "/aset/daftar", icon: FaList },
      { title: "Kategori Aset", path: "/aset/kategori", icon: FaTags },
      { title: "Status Aset", path: "/aset/status", icon: FaCheckCircle },
    ],
  },
  {
    title: "Pemeliharaan",
    icon: FaTools,
    children: [
      {
        title: "Jadwal Pemeliharaan",
        path: "/pemeliharaan/jadwal",
        icon: FaCalendarAlt,
      },
      {
        title: "Riwayat Pemeliharaan",
        path: "/pemeliharaan/riwayat",
        icon: FaHistory,
      },
      {
        title: "Request Perbaikan",
        path: "/pemeliharaan/request",
        icon: FaWrench,
      },
    ],
  },
  {
    title: "Monitoring",
    icon: FaExclamationTriangle,
    children: [
      {
        title: "Aset Rusak",
        path: "/monitoring/rusak",
        icon: FaExclamationTriangle,
      },
      {
        title: "Aset Overdue Maintenance",
        path: "/monitoring/overdue",
        icon: FaClock,
      },
      {
        title: "Aset Dalam Perbaikan",
        path: "/monitoring/perbaikan",
        icon: FaHammer,
      },
    ],
  },
  {
    title: "Persetujuan",
    icon: FaClipboardCheck,
    path: "/approval/pending",
    adminOnly: true,
  },
  {
    title: "User dan Role",
    icon: FaUsers,
    path: "/users",
    adminOnly: true,
  },
  {
    title: "Laporan",
    icon: FaFileAlt,
    children: [
      {
        title: "Laporan Pemeliharaan Bulanan",
        path: "/laporan/pemeliharaan",
        icon: FaFileAlt,
      },
      { title: "Laporan Downtime", path: "/laporan/downtime", icon: FaClock },
      {
        title: "Laporan Biaya Perawatan",
        path: "/laporan/biaya",
        icon: FaFileAlt,
      },
    ],
  },
  {
    title: "Pengaturan Sistem",
    icon: FaCog,
    path: "/pengaturan",
  },
];

export default function Sidebar({ isOpen, onClose, user }) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});

  // Filter menu based on user role
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.adminOnly && user?.role !== "admin") {
      return false;
    }
    return true;
  });

  const toggleMenu = (title) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isParentActive = (children) => {
    return children?.some((child) => location.pathname === child.path);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 overflow-y-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          lg:translate-x-0 lg:static w-64`}
      >
        {/* Logo/Title */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Pemeliharaan Aset</h2>
          <p className="text-xs text-gray-500 mt-1">Sistem Manajemen Aset</p>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isOpen = openMenus[item.title];
            const isItemActive = item.path
              ? isActive(item.path)
              : isParentActive(item.children);

            if (hasChildren) {
              return (
                <div key={item.title}>
                  {/* Parent Menu Button */}
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors
                      ${
                        isItemActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.title}</span>
                    </div>
                    {isOpen ? (
                      <FaChevronDown className="w-3 h-3" />
                    ) : (
                      <FaChevronRight className="w-3 h-3" />
                    )}
                  </button>

                  {/* Children Menu */}
                  {isOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm
                              ${
                                isActive(child.path)
                                  ? "bg-indigo-100 text-indigo-700 font-medium"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                          >
                            <ChildIcon className="w-4 h-4" />
                            <span>{child.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Single menu item without children
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors
                  ${
                    isActive(item.path)
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
