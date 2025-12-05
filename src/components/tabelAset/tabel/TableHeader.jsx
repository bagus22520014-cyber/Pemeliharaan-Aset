import React from "react";
import { Sort } from "@/components/Icons";

export default function TableHeader({
  sortBy,
  handleSort,
  getIconClass,
  showActions,
}) {
  return (
    <thead className="bg-gray-50 text-gray-700">
      <tr>
        <th
          style={{ width: "4%" }}
          className="p-3 text-center cursor-pointer hover:text-indigo-600 border-l border-gray-200"
          onClick={() => handleSort("statusAset")}
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && handleSort("statusAset")
          }
          aria-sort={
            sortBy.key === "statusAset"
              ? sortBy.direction === "asc"
                ? "ascending"
                : sortBy.direction === "desc"
                ? "descending"
                : "none"
              : "none"
          }
        >
          <div className="flex items-center justify-center gap-2">
            <span className="sr-only">Status</span>
            <Sort
              className={getIconClass("statusAset")}
              direction={
                sortBy.key === "statusAset" ? sortBy.direction : "none"
              }
            />
          </div>
        </th>

        <th
          style={{ width: "12%" }}
          className="p-3 font-semibold text-center cursor-pointer hover:text-indigo-600 border-l border-gray-200"
          onClick={() => handleSort("asetId")}
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && handleSort("asetId")
          }
          aria-sort={
            sortBy.key === "asetId"
              ? sortBy.direction === "asc"
                ? "ascending"
                : sortBy.direction === "desc"
                ? "descending"
                : "none"
              : "none"
          }
        >
          <div className="flex items-center justify-center gap-2">
            Aset Id
            <Sort
              className={getIconClass("asetId")}
              direction={sortBy.key === "asetId" ? sortBy.direction : "none"}
            />
          </div>
        </th>

        <th
          style={{ width: "10%" }}
          className="p-3 font-semibold text-center cursor-pointer hover:text-indigo-600 border-l border-gray-200"
          onClick={() => handleSort("accurateId")}
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && handleSort("accurateId")
          }
          aria-sort={
            sortBy.key === "accurateId"
              ? sortBy.direction === "asc"
                ? "ascending"
                : sortBy.direction === "desc"
                ? "descending"
                : "none"
              : "none"
          }
        >
          <div className="flex items-center justify-center gap-2">
            Accurate Id
            <Sort
              className={getIconClass("accurateId")}
              direction={
                sortBy.key === "accurateId" ? sortBy.direction : "none"
              }
            />
          </div>
        </th>

        <th
          style={{ width: "15%" }}
          className="p-3 font-semibold text-center cursor-pointer hover:text-indigo-600 border-l border-gray-200"
          onClick={() => handleSort("namaAset")}
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && handleSort("namaAset")
          }
          aria-sort={
            sortBy.key === "namaAset"
              ? sortBy.direction === "asc"
                ? "ascending"
                : sortBy.direction === "desc"
                ? "descending"
                : "none"
              : "none"
          }
        >
          <div className="flex items-center justify-center gap-2">
            Nama
            <Sort
              className={getIconClass("namaAset")}
              direction={sortBy.key === "namaAset" ? sortBy.direction : "none"}
            />
          </div>
        </th>

        <th
          style={{ width: "10%" }}
          className="p-3 font-semibold text-center border-l border-gray-200"
        >
          Kategori
        </th>

        <th
          style={{ width: "9%" }}
          className="p-3 font-semibold text-center border-l border-gray-200"
        >
          Departemen
        </th>

        <th
          style={{ width: "8%" }}
          className="p-3 font-semibold text-center cursor-pointer hover:text-indigo-600 border-l border-gray-200"
          onClick={() => handleSort("tglPembelian")}
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && handleSort("tglPembelian")
          }
          aria-sort={
            sortBy.key === "tglPembelian"
              ? sortBy.direction === "asc"
                ? "ascending"
                : sortBy.direction === "desc"
                ? "descending"
                : "none"
              : "none"
          }
        >
          <div className="flex items-center justify-center gap-2">
            Pembelian
            <Sort
              className={getIconClass("tglPembelian")}
              direction={
                sortBy.key === "tglPembelian" ? sortBy.direction : "none"
              }
            />
          </div>
        </th>

        <th
          style={{ width: "7%" }}
          className="p-3 font-semibold text-center cursor-pointer hover:text-indigo-600 border-l border-gray-200"
          onClick={() => handleSort("masaManfaat")}
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && handleSort("masaManfaat")
          }
          aria-sort={
            sortBy.key === "masaManfaat"
              ? sortBy.direction === "asc"
                ? "ascending"
                : sortBy.direction === "desc"
                ? "descending"
                : "none"
              : "none"
          }
        >
          <div className="flex items-center justify-center gap-2">
            Masa
            <Sort
              className={getIconClass("masaManfaat")}
              direction={
                sortBy.key === "masaManfaat" ? sortBy.direction : "none"
              }
            />
          </div>
        </th>

        <th
          style={{ width: "9%" }}
          className="p-3 font-semibold text-center border-l border-gray-200"
        >
          Pengguna
        </th>

        <th
          style={{ width: "8%" }}
          className="p-3 font-semibold text-center border-l border-gray-200"
        >
          Lokasi
        </th>

        <th
          style={{ width: "8%" }}
          className="p-3 font-semibold text-center border-l border-gray-200"
        >
          Tempat
        </th>

        <th
          style={{ width: "10%" }}
          className="p-3 font-semibold text-center cursor-pointer hover:text-indigo-600 border-l border-gray-200"
          onClick={() => handleSort("nilaiAset")}
          tabIndex={0}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && handleSort("nilaiAset")
          }
          aria-sort={
            sortBy.key === "nilaiAset"
              ? sortBy.direction === "asc"
                ? "ascending"
                : sortBy.direction === "desc"
                ? "descending"
                : "none"
              : "none"
          }
        >
          <div className="flex items-center justify-center gap-2">
            Nilai
            <Sort
              className={getIconClass("nilaiAset")}
              direction={sortBy.key === "nilaiAset" ? sortBy.direction : "none"}
            />
          </div>
        </th>

        {showActions && (
          <th
            style={{ width: "8%" }}
            className="p-3 font-semibold text-center border-l border-gray-200"
          >
            Aksi
          </th>
        )}
      </tr>
    </thead>
  );
}
