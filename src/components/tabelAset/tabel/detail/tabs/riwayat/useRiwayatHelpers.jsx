export const useRiwayatHelpers = () => {
  const getAksiLabel = (jenisAksi) => {
    const labels = {
      input: "Baru",
      edit: "Edit",
      delete: "Hapus",
      perbaikan_input: "Perbaikan",
      perbaikan_edit: "Perbaikan - Edit",
      perbaikan_delete: "Perbaikan - Hapus",
      rusak_input: "Rusak",
      rusak_edit: "Rusak - Edit",
      rusak_delete: "Rusak - Hapus",
      dipinjam_input: "Dipinjam",
      dipinjam_edit: "Dipinjam - Edit",
      dipinjam_delete: "Dipinjam - Hapus",
      dijual_input: "Dijual",
      dijual_edit: "Dijual - Edit",
      dijual_delete: "Dijual - Hapus",
      mutasi_input: "Mutasi",
      mutasi_edit: "Mutasi - Edit",
      mutasi_delete: "Mutasi - Hapus",
    };
    return labels[jenisAksi] || jenisAksi;
  };

  const getAksiColor = (jenisAksi) => {
    // Check for mutasi first with includes
    if (jenisAksi?.includes("mutasi")) {
      if (jenisAksi?.includes("delete"))
        return "bg-red-100 text-red-700 border-red-300";
      return "bg-blue-100 text-blue-700 border-blue-300";
    }

    const colors = {
      input: "bg-green-100 text-green-700 border-green-300",
      edit: "bg-blue-100 text-blue-700 border-blue-300",
      delete: "bg-red-100 text-red-700 border-red-300",
      perbaikan_input: "bg-yellow-100 text-yellow-700 border-yellow-300",
      perbaikan_edit: "bg-yellow-100 text-yellow-700 border-yellow-300",
      perbaikan_delete: "bg-red-100 text-red-700 border-red-300",
      rusak_input: "bg-red-100 text-red-700 border-red-300",
      rusak_edit: "bg-red-100 text-red-700 border-red-300",
      rusak_delete: "bg-red-100 text-red-700 border-red-300",
      dipinjam_input: "bg-indigo-100 text-indigo-700 border-indigo-300",
      dipinjam_edit: "bg-indigo-100 text-indigo-700 border-indigo-300",
      dipinjam_delete: "bg-red-100 text-red-700 border-red-300",
      dijual_input: "bg-gray-100 text-gray-700 border-gray-300",
      dijual_edit: "bg-gray-100 text-gray-700 border-gray-300",
      dijual_delete: "bg-red-100 text-red-700 border-red-300",
      mutasi_input: "bg-blue-100 text-blue-700 border-blue-300",
      mutasi_edit: "bg-blue-100 text-blue-700 border-blue-300",
      mutasi_delete: "bg-red-100 text-red-700 border-red-300",
    };
    return colors[jenisAksi] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const getIconColor = (jenisAksi) => {
    if (jenisAksi?.includes("perbaikan")) return "bg-yellow-500";
    if (jenisAksi?.includes("rusak")) return "bg-red-500";
    if (jenisAksi?.includes("dipinjam")) return "bg-indigo-600";
    if (jenisAksi?.includes("dijual")) return "bg-gray-500";
    if (jenisAksi?.includes("mutasi")) return "bg-blue-500";
    if (jenisAksi?.includes("delete")) return "bg-red-500";
    if (jenisAksi?.includes("edit")) return "bg-blue-500";
    if (jenisAksi?.includes("input")) return "bg-green-500";
    return "bg-gray-500";
  };

  const getMonthName = (monthIndex) => {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return months[monthIndex];
  };

  const formatDate = (waktu) => {
    if (!waktu) return "-";
    try {
      const d = new Date(waktu);
      if (isNaN(d.getTime())) return waktu;

      const pad = (n) => String(n).padStart(2, "0");
      const date = `${pad(d.getDate())}/${pad(
        d.getMonth() + 1
      )}/${d.getFullYear()}`;
      const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
        d.getSeconds()
      )}`;

      // Always show time
      return `${date} ${time}`;
    } catch {
      return waktu;
    }
  };

  const renderPerubahan = (perubahan) => {
    if (!perubahan || typeof perubahan !== "object") return null;

    const formatValue = (field, value) => {
      if (value == null) return "null";

      if (
        (field === "TglPembelian" || field === "tglPembelian") &&
        typeof value === "string" &&
        value.includes("T")
      ) {
        const datePart = value.split("T")[0];
        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
          return datePart;
        }
      }

      return value;
    };

    return (
      <div className="mt-2 space-y-1 text-sm">
        {Object.entries(perubahan).map(([field, change]) => {
          // Special handling for approvals merged into perubahan
          if (field === "approvals" && Array.isArray(change)) {
            return (
              <div key={field} className="mt-2 space-y-2">
                <div className="font-semibold text-gray-700">
                  Riwayat Persetujuan:
                </div>
                {change.map((apr, idx) => {
                  const who =
                    apr.user ||
                    apr.username ||
                    apr.dilakukan_oleh ||
                    apr.by ||
                    apr.approved_by ||
                    apr.oleh_username ||
                    apr.approver_username ||
                    apr.approver ||
                    "-";
                  const role =
                    apr.role ||
                    apr.user_role ||
                    apr.by_role ||
                    apr.oleh_role ||
                    apr.approver_role ||
                    "-";
                  const status = (
                    apr.status ||
                    apr.action ||
                    apr.approval_action ||
                    ""
                  ).toString();
                  const time =
                    apr.timestamp ||
                    apr.waktu ||
                    apr.created_at ||
                    apr.tanggal ||
                    apr.time ||
                    "";
                  const alasan =
                    apr.alasan ||
                    apr.reason ||
                    apr.note ||
                    apr.notes ||
                    apr.keterangan ||
                    null;

                  const statusText = status
                    ? String(status).charAt(0).toUpperCase() +
                      String(status).slice(1)
                    : "";
                  const isApproved =
                    status &&
                    (String(status).toLowerCase().includes("setuj") ||
                      String(status).toLowerCase().includes("approve"));
                  return (
                    <div
                      key={idx}
                      className="flex flex-col text-sm bg-gray-50 p-2 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            isApproved ? "text-green-700" : "text-red-600"
                          }`}
                        >
                          {statusText}
                        </span>
                        <span className="text-gray-600">oleh:</span>
                        <span className="font-medium text-gray-900">
                          {who || "-"}
                        </span>
                        {role ? (
                          <span className="text-gray-500 text-xs">
                            ({role})
                          </span>
                        ) : null}
                        {time && (
                          <span className="ml-auto text-xs text-gray-400">
                            {formatDate(time)}
                          </span>
                        )}
                      </div>
                      {alasan && (
                        <div className="mt-1 text-sm text-gray-700">
                          <span className="font-medium">Alasan: </span>
                          <span>{alasan}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          }

          if (!change || typeof change !== "object") return null;
          const { before, after } = change;
          return (
            <div key={field} className="flex gap-2">
              <span className="font-semibold text-gray-700">{field}:</span>
              <span className="text-red-600">{formatValue(field, before)}</span>
              <span>→</span>
              <span className="text-green-600">
                {formatValue(field, after)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return {
    getAksiLabel,
    getAksiColor,
    getIconColor,
    getMonthName,
    formatDate,
    renderPerubahan,
  };
};
