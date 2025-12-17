import React, { useState, useEffect, useMemo } from "react";
import {
  listUsers,
  createUser,
  updateUser,
  resetUserPassword,
} from "@/api/user";
import { listBeban } from "@/api/beban";
import { simplifyBebansForDisplay } from "@/utils/format";
import {
  FaPlus,
  FaEdit,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaUserPlus,
  FaUser,
} from "react-icons/fa";
import Confirm from "@/components/Confirm";
import Alert from "@/components/Alert";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [bebans, setBebans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [formNama, setFormNama] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("User#1234");
  const [formRole, setFormRole] = useState("user");
  const [selectedBases, setSelectedBases] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditBebanPopup, setShowEditBebanPopup] = useState(false);
  const [editSelectedBases, setEditSelectedBases] = useState([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [resetStatus, setResetStatus] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null,
    user: null,
    data: {},
  });
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("user");
  const [forbiddenMsg, setForbiddenMsg] = useState(null);

  // Load users
  useEffect(() => {
    loadUsers();
    loadBebans();
  }, []);

  // Keep password default in sync with selected role
  useEffect(() => {
    if (formRole === "admin") setFormPassword("Admin#1234");
    else setFormPassword((p) => (p ? p : "User#1234"));
  }, [formRole]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await listUsers();
      setUsers(Array.isArray(all) ? all : []);
      setForbiddenMsg(null);
    } catch (err) {
      if (err && err.status === 403) {
        setForbiddenMsg(err.message || "Akses ditolak: hanya admin");
        setUsers([]);
        setError(null);
      } else {
        setError(err.message || "Gagal memuat daftar user");
      }
    } finally {
      setLoading(false);
    }
  };

  const displayedUsers = useMemo(() => {
    const key = String(activeTab || "user").toLowerCase();
    return (users || []).filter(
      (u) =>
        String(u?.role ?? "").toLowerCase() ===
        (key === "admin" ? "admin" : "user")
    );
  }, [users, activeTab]);

  const counts = useMemo(() => {
    const all = users || [];
    return {
      users: all.filter((u) => String(u?.role ?? "").toLowerCase() !== "admin")
        .length,
      admins: all.filter((u) => String(u?.role ?? "").toLowerCase() === "admin")
        .length,
    };
  }, [users]);

  const loadBebans = async () => {
    try {
      const all = await listBeban();
      const aktif = (Array.isArray(all) ? all : []).filter((b) => b.aktif);
      setBebans(aktif);
    } catch (err) {
      // failed to load beban — ignore silently
    }
  };

  const handleCreateUser = async () => {
    setCreating(true);
    setCreateError(null);
    try {
      const bebanPayload =
        formRole === "user" ? selectedBases.join(",") : ["MLM"];
      await createUser({
        nama: formNama,
        username: formUsername,
        password: formPassword,
        role: formRole,
        beban: bebanPayload,
      });
      setAlert({ type: "success", message: "User berhasil dibuat" });
      setShowCreatePopup(false);
      resetCreateForm();
      await loadUsers();
    } catch (err) {
      setCreateError(err.message || "Gagal membuat user");
    } finally {
      setCreating(false);
    }
  };

  const handleEditBeban = async () => {
    if (!editingUser) return;
    setEditLoading(true);
    setEditError(null);
    try {
      // Backend expects { username, beban: [...] }
      const bebanArray = Array.isArray(editSelectedBases)
        ? editSelectedBases
        : String(editSelectedBases || "")
            .split(/[,;|]/)
            .map((s) => s.trim())
            .filter(Boolean);
      await updateUser({ username: editingUser.username, beban: bebanArray });
      setAlert({ type: "success", message: "Beban berhasil diperbarui" });
      setShowEditBebanPopup(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      setEditError(err.message || "Gagal update beban");
    } finally {
      setEditLoading(false);
    }
  };

  const handleResetPassword = async (username, role) => {
    if (!username) {
      setAlert({ type: "error", message: "Username tidak tersedia" });
      return;
    }
    const newPassword = String(role).toLowerCase() === "admin" ? "Admin#1234" : "User#1234";
    setResetStatus((prev) => ({ ...prev, [username]: "loading" }));
    try {
      await resetUserPassword(username, newPassword);
      setResetStatus((prev) => ({ ...prev, [username]: "success" }));
      setAlert({ type: "success", message: `Password direset ke ${newPassword}` });
      setTimeout(() => {
        setResetStatus((prev) => {
          const copy = { ...prev };
          delete copy[username];
          return copy;
        });
      }, 3000);
    } catch (err) {
      setResetStatus((prev) => ({ ...prev, [username]: "error" }));
      setAlert({
        type: "error",
        message: err.message || "Gagal reset password",
      });
    }
  };

  const resetCreateForm = () => {
    setFormNama("");
    setFormUsername("");
    setFormPassword("User#1234");
    setFormRole("user");
    setSelectedBases([]);
    setCreateError(null);
  };

  const openEditBebanPopup = (user) => {
    setEditingUser(user);
    let currentBases = [];
    try {
      const b = user?.beban;
      if (Array.isArray(b)) {
        currentBases = b.map((s) => String(s).trim()).filter(Boolean);
      } else if (typeof b === "string") {
        currentBases = b
          .split(/[,;|]/)
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (b == null) {
        currentBases = [];
      } else {
        // fallback: coerce to string
        currentBases = [String(b).trim()];
      }
    } catch (e) {
      currentBases = [];
    }
    setEditSelectedBases(currentBases);
    setShowEditBebanPopup(true);
    setEditError(null);
  };

  const toggleBase = (kode, isEdit = false) => {
    if (isEdit) {
      setEditSelectedBases((prev) =>
        prev.includes(kode) ? prev.filter((b) => b !== kode) : [...prev, kode]
      );
    } else {
      setSelectedBases((prev) =>
        prev.includes(kode) ? prev.filter((b) => b !== kode) : [...prev, kode]
      );
    }
  };

  // Group available bebans by prefix (e.g., MLG -> [MLG-MEDIA, MLG-NET])
  const bebanGroups = useMemo(() => {
    const m = {};
    for (const b of bebans || []) {
      const kode = String(b?.kode ?? "");
      const prefix = kode.split("-")[0] || kode;
      if (!m[prefix]) m[prefix] = [];
      if (kode && !m[prefix].includes(kode)) m[prefix].push(kode);
    }
    return m;
  }, [bebans]);

  const toggleGroup = (prefix, isEdit = false) => {
    const codes = bebanGroups[prefix] || [];
    if (isEdit) {
      const allSelected = codes.every((c) => editSelectedBases.includes(c));
      if (allSelected) {
        setEditSelectedBases((prev) => prev.filter((p) => !codes.includes(p)));
      } else {
        setEditSelectedBases((prev) =>
          Array.from(new Set([...prev, ...codes]))
        );
      }
    } else {
      const allSelected = codes.every((c) => selectedBases.includes(c));
      if (allSelected) {
        setSelectedBases((prev) => prev.filter((p) => !codes.includes(p)));
      } else {
        setSelectedBases((prev) => Array.from(new Set([...prev, ...codes])));
      }
    }
  };

  return (
    <div className="p-6">
      {alert && (
        <div className="mb-4">
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-600 text-sm">
            Kelola pengguna dan hak akses sistem
          </p>
        </div>
        <button
          onClick={() => setShowCreatePopup(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <FaPlus />
          <span>Tambah User</span>
        </button>
      </div>

      {forbiddenMsg && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {forbiddenMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setActiveTab("user")}
          className={`px-3 py-1 rounded-lg border text-sm ${
            activeTab === "user"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-700 border-gray-200"
          }`}
        >
          Users ({counts.users})
        </button>
        <button
          onClick={() => !forbiddenMsg && setActiveTab("admin")}
          className={`px-3 py-1 rounded-lg border text-sm ${
            activeTab === "admin"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-700 border-gray-200"
          }`}
          title={forbiddenMsg || "Lihat admin"}
          disabled={!!forbiddenMsg}
        >
          Admins ({counts.admins})
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat data...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : displayedUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {activeTab === "admin"
              ? "Belum ada admin terdaftar"
              : "Belum ada user terdaftar"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  {activeTab !== "admin" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beban
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedUsers.map((user, idx) => (
                  <tr
                    key={user.id ?? user.username ?? `user-${idx}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.nama || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    {activeTab !== "admin" && (
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {(() => {
                          const bases =
                            simplifyBebansForDisplay(user.beban) || [];
                          return bases.length ? bases.join(", ") : "-";
                        })()}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {user.role !== "admin" && activeTab !== "admin" && (
                          <button
                            onClick={() => openEditBebanPopup(user)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Beban"
                          >
                            <FaEdit />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              open: true,
                              type: "resetPassword",
                              user,
                              data: {},
                            })
                          }
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition"
                          title="Reset Password"
                          disabled={resetStatus[user.username] === "loading"}
                        >
                          <FaKey />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreatePopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-transparent">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FaUserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Tambah User Baru
                  </h2>
                  <p className="text-xs text-gray-500">
                    Buat akun pengguna dan atur beban akses
                  </p>
                </div>
              </div>

              {createError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {createError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FaUser className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={formNama}
                      onChange={(e) => setFormNama(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FaUser className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Masukkan username"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <FaKey className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Masukkan password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {formRole === "user" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pilih Beban (Base)
                    </label>
                    <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                      {Object.keys(bebanGroups).map((prefix) => {
                        const codes = bebanGroups[prefix];
                        const allSelected = codes.every((c) =>
                          selectedBases.includes(c)
                        );
                        return (
                          <label
                            key={prefix}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={() => toggleGroup(prefix, false)}
                              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">
                              {prefix}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {selectedBases.length > 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        Dipilih: {selectedBases.join(", ")}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() =>
                    setConfirmDialog({
                      open: true,
                      type: "create",
                      user: null,
                      data: {
                        nama: formNama,
                        username: formUsername,
                        role: formRole,
                        beban: selectedBases.join(","),
                      },
                    })
                  }
                  disabled={
                    creating ||
                    !formNama ||
                    !formUsername ||
                    !formPassword ||
                    (formRole === "user" && selectedBases.length === 0)
                  }
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-600/95 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  <FaPlus />
                  <span>{creating ? "Membuat..." : "Buat User"}</span>
                </button>
                <button
                  onClick={() => {
                    setShowCreatePopup(false);
                    resetCreateForm();
                  }}
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Beban Modal */}
      {showEditBebanPopup && editingUser && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm bg-transparent">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Edit Beban: {editingUser.nama}
              </h2>

              {editError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {editError}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Beban (Base)
                </label>
                <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                  {Object.keys(bebanGroups).map((prefix) => {
                    const codes = bebanGroups[prefix];
                    const allSelected = codes.every((c) =>
                      editSelectedBases.includes(c)
                    );
                    return (
                      <label
                        key={prefix}
                        className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => toggleGroup(prefix, true)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{prefix}</span>
                      </label>
                    );
                  })}
                </div>
                {editSelectedBases.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Dipilih: {editSelectedBases.join(", ")}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setConfirmDialog({
                      open: true,
                      type: "editBeban",
                      user: editingUser,
                      data: { beban: editSelectedBases.join(",") },
                    })
                  }
                  disabled={editLoading || editSelectedBases.length === 0}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {(() => {
                    const raw =
                      typeof window !== "undefined"
                        ? localStorage.getItem("user")
                        : null;
                    let isAdmin = false;
                    try {
                      const u = raw ? JSON.parse(raw) : null;
                      isAdmin = u?.role === "admin" || u?.role === "Admin";
                    } catch (e) {
                      isAdmin = false;
                    }
                    if (editLoading) return "Menyimpan...";
                    return isAdmin ? "Simpan" : "Ajukan";
                  })()}
                </button>
                <button
                  onClick={() => {
                    setShowEditBebanPopup(false);
                    setEditingUser(null);
                    setEditError(null);
                  }}
                  disabled={editLoading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <Confirm
        open={confirmDialog.open}
        title={
          confirmDialog.type === "create"
            ? "Konfirmasi Buat User"
            : confirmDialog.type === "editBeban"
            ? "Konfirmasi Edit Beban"
            : "Konfirmasi Reset Password"
        }
        message={
          confirmDialog.type === "create"
            ? `Buat user baru dengan username "${confirmDialog.data.username}"?`
            : confirmDialog.type === "editBeban"
            ? `Update beban user "${confirmDialog.user?.nama}"?`
            : `Reset password user "${confirmDialog.user?.nama}" ke default?`
        }
        confirmLabel="Ya, Lanjutkan"
        cancelLabel="Batal"
        onConfirm={() => {
          if (confirmDialog.type === "create") {
            handleCreateUser();
          } else if (confirmDialog.type === "editBeban") {
            handleEditBeban();
          } else if (confirmDialog.type === "resetPassword") {
            handleResetPassword(confirmDialog.user.username, confirmDialog.user.role);
          }
          setConfirmDialog({ open: false, type: null, user: null, data: {} });
        }}
        onClose={() =>
          setConfirmDialog({ open: false, type: null, user: null, data: {} })
        }
      />
    </div>
  );
}
