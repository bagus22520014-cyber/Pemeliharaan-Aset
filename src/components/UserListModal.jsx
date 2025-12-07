import React, { useState, useEffect } from "react";
import {
  listUsers,
  createUser,
  updateUser,
  resetUserPassword,
} from "@/api/user";
import { simplifyBebansForDisplay } from "@/utils/format";
import { Pencil, Save, Close, Eye, MoreVertical } from "./Icons";
import Confirm from "./Confirm";

export default function UserListModal({ open, onClose, bebans = [] }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
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
    type: null, // 'create', 'editBeban', 'resetPassword'
    user: null,
    data: {},
  });

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const all = await listUsers();
        if (!mounted) return;
        // show all users except admin role
        const filtered = (Array.isArray(all) ? all : []).filter(
          (u) => String(u?.role ?? "").toLowerCase() !== "admin"
        );
        setUsers(filtered);
      } catch (err) {
        if (!mounted) return;
        setError(String(err || "Failed to load users"));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open]);

  const baseOptions = React.useMemo(() => {
    // derive base options from full bebans list or fall back to simplified ones
    if (bebans && bebans.length) {
      const bases = new Set();
      for (const b of bebans) {
        if (!b) continue;
        const normalized = String(b).trim();
        const base = normalized.includes("-")
          ? normalized.split("-")[0]
          : normalized;
        bases.add(base);
      }
      return Array.from(bases);
    }
    return [];
  }, [bebans]);

  const toggleBase = (base) => {
    setSelectedBases((prev) => {
      const s = new Set(prev);
      if (s.has(base)) s.delete(base);
      else s.add(base);
      return Array.from(s);
    });
  };

  const toggleEditBase = (base) => {
    setEditSelectedBases((prev) => {
      const s = new Set(prev);
      if (s.has(base)) s.delete(base);
      else s.add(base);
      return Array.from(s);
    });
  };

  const expandBasesToDbValues = (bases) => {
    // Expand `BJR` => [`BJR-NET`, `BJR-MEDIA`] if these exist in `bebans` prop, otherwise include base as-is
    if (!bases || bases.length === 0) return [];
    const all = Array.isArray(bebans) ? bebans : [];
    const results = new Set();
    for (const base of bases) {
      const candidates = all.filter((b) =>
        String(b || "").startsWith(`${base}-`)
      );
      if (candidates.length > 0) {
        for (const c of candidates) results.add(c);
      } else {
        // if no hyphen variants found, use the base itself if present
        if (all.includes(base)) results.add(base);
      }
    }
    return Array.from(results);
  };

  const resetCreateForm = () => {
    setFormNama("");
    setFormUsername("");
    setSelectedBases([]);
    setCreateError(null);
    setFormRole("user");
    setFormPassword("User#1234");
  };

  const openEditBeban = (user) => {
    setEditingUser(user);
    // derive base list from user's beban
    const bases = simplifyBebansForDisplay(user?.beban || "");
    setEditSelectedBases(Array.isArray(bases) ? bases : []);
    setEditError(null);
    setShowEditBebanPopup(true);
  };

  const closeEditBeban = () => {
    setEditingUser(null);
    setEditSelectedBases([]);
    setShowEditBebanPopup(false);
    setEditError(null);
  };

  const saveEditBeban = async () => {
    if (!editingUser) return;
    if (!editSelectedBases || editSelectedBases.length === 0) {
      setEditError("Pilih minimal 1 Beban");
      return;
    }
    const dbBebans = expandBasesToDbValues(editSelectedBases);
    setConfirmDialog({
      open: true,
      type: "editBeban",
      user: editingUser,
      data: { dbBebans },
    });
  };

  const confirmEditBeban = async () => {
    const { user, data } = confirmDialog;
    setConfirmDialog({ open: false, type: null, user: null, data: {} });
    setEditLoading(true);
    try {
      await updateUser({
        username: user.username,
        beban: data.dbBebans.join(","),
      });
      const refreshed = await listUsers();
      setUsers(
        (Array.isArray(refreshed) ? refreshed : []).filter(
          (u) => String(u?.role ?? "").toLowerCase() !== "admin"
        )
      );
      closeEditBeban();
    } catch (err) {
      setEditError(String(err || "Gagal menyimpan beban"));
    } finally {
      setEditLoading(false);
    }
  };

  const handleResetPassword = async (user) => {
    const uname = user?.username;
    if (!uname) return;
    const newPassword =
      String((user?.role || "").toLowerCase()) === "admin"
        ? "Admin#1234"
        : "User#1234";
    setConfirmDialog({
      open: true,
      type: "resetPassword",
      user: user,
      data: { newPassword },
    });
  };

  const confirmResetPassword = async () => {
    const { user, data } = confirmDialog;
    const uname = user?.username;
    if (!uname) return;
    setConfirmDialog({ open: false, type: null, user: null, data: {} });
    setResetStatus((s) => ({ ...s, [uname]: { loading: true } }));
    try {
      await resetUserPassword(uname, data.newPassword);
      setResetStatus((s) => ({
        ...s,
        [uname]: { loading: false, ok: true, password: data.newPassword },
      }));
    } catch (err) {
      setResetStatus((s) => ({
        ...s,
        [uname]: {
          loading: false,
          ok: false,
          error: String(err || "Gagal reset password"),
        },
      }));
    }
  };

  const handleCreate = async (e) => {
    e?.preventDefault?.();
    setCreateError(null);
    if (!formNama || !formUsername) {
      setCreateError("Nama dan Username wajib diisi");
      return;
    }
    if (
      formRole !== "admin" &&
      (!selectedBases || selectedBases.length === 0)
    ) {
      setCreateError("Pilih minimal 1 Beban");
      return;
    }
    const dbBebans =
      formRole === "admin" ? ["MLM"] : expandBasesToDbValues(selectedBases);
    setConfirmDialog({
      open: true,
      type: "create",
      user: null,
      data: { nama: formNama, username: formUsername, dbBebans },
    });
  };

  const confirmCreate = async () => {
    const { data } = confirmDialog;
    setConfirmDialog({ open: false, type: null, user: null, data: {} });
    setCreating(true);
    try {
      const payload = {
        nama: data.nama,
        username: data.username,
        password: formPassword,
        role: formRole,
        beban: data.dbBebans.join(","),
      };
      await createUser(payload);
      const refreshed = await listUsers();
      setUsers(
        (Array.isArray(refreshed) ? refreshed : []).filter(
          (u) => String(u?.role ?? "").toLowerCase() !== "admin"
        )
      );
      resetCreateForm();
      setShowCreatePopup(false);
    } catch (err) {
      setCreateError(String(err || "Gagal membuat user"));
    } finally {
      setCreating(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg ring-1 ring-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="text-lg font-semibold">Daftar User</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                resetCreateForm();
                setShowCreatePopup(true);
              }}
              className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-500"
            >
              Tambah User
            </button>
            <button
              onClick={() => onClose?.()}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Close"
              title="Close"
            >
              <Close className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : users.length === 0 ? (
            <div className="text-sm text-gray-500">
              Tidak ada user selain admin
            </div>
          ) : (
            <div className="overflow-auto rounded-lg">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-2 font-semibold">Nama</th>
                    <th className="p-2 font-semibold">Username</th>
                    <th className="p-2 font-semibold">Role</th>
                    <th className="p-2 font-semibold">Beban</th>
                    <th className="p-2 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id ?? u.username} className="border-t">
                      <td className="p-2">{u.nama ?? u.name ?? "-"}</td>
                      <td className="p-2">{u.username}</td>
                      <td className="p-2">{u.role}</td>
                      <td className="p-2">
                        {(() => {
                          const simplified = simplifyBebansForDisplay(u.beban);
                          if (!simplified || simplified.length === 0)
                            return "-";
                          return simplified.join(", ");
                        })()}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditBeban(u)}
                            className="p-2 rounded-full border bg-white hover:bg-gray-50"
                            title="Edit Beban"
                          >
                            <Pencil className="h-5 w-5 text-indigo-600" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(u)}
                            className="p-2 rounded-full border bg-white hover:bg-yellow-100"
                            title="Reset Password"
                          >
                            <Save className="h-5 w-5 text-yellow-600" />
                          </button>
                        </div>
                        {resetStatus[u.username] && (
                          <div className="text-xs mt-1">
                            {resetStatus[u.username].loading && (
                              <span>Resetting...</span>
                            )}
                            {resetStatus[u.username].ok && (
                              <span className="text-green-600">
                                Password reset:{" "}
                                {resetStatus[u.username].password}
                              </span>
                            )}
                            {resetStatus[u.username].error && (
                              <span className="text-red-600">
                                {resetStatus[u.username].error}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end p-4 border-t gap-2">
          <button
            onClick={() => onClose?.()}
            className="px-3 py-1 rounded-md border bg-white text-sm hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
      {showCreatePopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg ring-1 ring-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-lg font-semibold">Tambah User Baru</div>
              <button
                onClick={() => {
                  resetCreateForm();
                  setShowCreatePopup(false);
                }}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close"
                title="Close"
              >
                <Close className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Nama
                  </label>
                  <input
                    placeholder="Masukan nama"
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Username
                  </label>
                  <input
                    placeholder="Masukan username"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Role
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormRole(v);
                      setFormPassword(
                        v === "admin" ? "Admin#1234" : "User#1234"
                      );
                    }}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Password
                  </label>
                  <input
                    placeholder="Password"
                    value={formPassword}
                    readOnly
                    className="w-full p-2 border rounded-md bg-gray-50"
                    title="Default password ketika membuat user"
                    aria-readonly
                  />
                </div>
                {formRole !== "admin" && (
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Beban (pilih 1 atau lebih)
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                      {baseOptions.map((b) => {
                        const bebanValue =
                          typeof b === "string" ? b : b?.kode || String(b);
                        return (
                          <label
                            key={bebanValue}
                            className="inline-flex items-center gap-2 whitespace-nowrap"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBases.includes(bebanValue)}
                              onChange={() => toggleBase(bebanValue)}
                            />
                            <span className="text-sm">{bebanValue}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {createError && (
                <div className="text-red-600 text-sm mt-3">{createError}</div>
              )}
              <div className="flex items-center gap-2 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetCreateForm();
                    setShowCreatePopup(false);
                  }}
                  className="px-3 py-1 rounded-md border bg-white text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-500 disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Confirm
        open={confirmDialog.open && confirmDialog.type === "create"}
        title="Konfirmasi Buat User"
        message={`Buat user baru dengan nama "${confirmDialog.data.nama}" (${confirmDialog.data.username})?`}
        confirmLabel="Create"
        cancelLabel="Cancel"
        onConfirm={() => confirmCreate()}
        onClose={() =>
          setConfirmDialog({ open: false, type: null, user: null, data: {} })
        }
      />
      <Confirm
        open={confirmDialog.open && confirmDialog.type === "editBeban"}
        title="Konfirmasi Edit Beban"
        message={`Ubah beban user "${confirmDialog.user?.username}"?`}
        confirmLabel="Save"
        cancelLabel="Cancel"
        onConfirm={() => confirmEditBeban()}
        onClose={() =>
          setConfirmDialog({ open: false, type: null, user: null, data: {} })
        }
      />
      <Confirm
        open={confirmDialog.open && confirmDialog.type === "resetPassword"}
        title="Konfirmasi Reset Password"
        message={`Reset password user "${confirmDialog.user?.username}" ke "${confirmDialog.data.newPassword}"?`}
        confirmLabel="Reset"
        cancelLabel="Cancel"
        danger
        onConfirm={() => confirmResetPassword()}
        onClose={() =>
          setConfirmDialog({ open: false, type: null, user: null, data: {} })
        }
      />
      {showEditBebanPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg ring-1 ring-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="text-lg font-semibold">Edit Beban</div>
              <button
                onClick={() => closeEditBeban()}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Close"
                title="Close"
              >
                <Close className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Beban (pilih 1 atau lebih)
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                    {baseOptions.map((b) => {
                      const bebanValue =
                        typeof b === "string" ? b : b?.kode || String(b);
                      return (
                        <label
                          key={bebanValue}
                          className="inline-flex items-center gap-2 whitespace-nowrap"
                        >
                          <input
                            type="checkbox"
                            checked={editSelectedBases.includes(bebanValue)}
                            onChange={() => toggleEditBase(bebanValue)}
                          />
                          <span className="text-sm">{bebanValue}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
                {editError && (
                  <div className="text-red-600 text-sm">{editError}</div>
                )}
              </div>
              <div className="flex items-center gap-2 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => closeEditBeban()}
                  className="px-3 py-1 rounded-md border bg-white text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => saveEditBeban()}
                  disabled={editLoading}
                  className="px-3 py-1 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-500 disabled:opacity-60"
                >
                  {editLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
