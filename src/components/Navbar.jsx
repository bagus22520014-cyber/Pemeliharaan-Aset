import React, { useState, useRef, useEffect } from "react";
import { FaBars, FaChevronDown } from "react-icons/fa";

export default function Navbar({
  title = "Pemeliharaan Aset",
  user,
  onLogout,
  leftControls = null,
  rightControls = null,
  className = "",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-200 
                  flex items-center justify-between px-6 py-3 ${className}`}
      role="banner"
    >
      {/* LEFT AREA */}
      <div className="flex items-center gap-4">
        {/* MOBILE MENU BUTTON */}
        <button
          onClick={() => setMobileOpen((s) => !s)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition text-gray-700"
        >
          <FaBars className="h-5 w-5" />
        </button>

        {/* APP TITLE */}
        <div className="hidden sm:block">
          <h1 className="text-xl font-semibold tracking-wide text-gray-800">
            {title}
          </h1>
        </div>

        {/* OPTIONAL LEFT CONTROLS */}
        <div className="hidden md:flex items-center gap-3">{leftControls}</div>
      </div>

      {/* RIGHT AREA */}
      <nav className="flex items-center gap-3">
        {/* OPTIONAL RIGHT CONTROLS */}
        {rightControls}

        {/* USER MENU */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((s) => !s)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 
                       transition text-gray-700"
          >
            {/* Avatar */}
            <div
              className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 
                            flex items-center justify-center font-semibold shadow-sm"
            >
              {(user?.username || "?").charAt(0).toUpperCase()}
            </div>

            {/* Username + Chevron */}
            <div className="hidden md:flex items-center gap-6">
              <span className="text-sm font-medium">
                {user?.username ?? "Unknown"}
              </span>
              <FaChevronDown
                className={`h-3 w-3 transition ${menuOpen ? "rotate-180" : ""}`}
              />
            </div>
          </button>

          {/* MENU DROPDOWN */}
          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-gray-100 
                         overflow-hidden animate-fade-in z-50"
            >
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogout?.();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
