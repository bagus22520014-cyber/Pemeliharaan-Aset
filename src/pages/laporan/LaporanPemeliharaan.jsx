import React from "react";
import EmptyPage from "@/components/EmptyPage";
import { FaFileAlt } from "react-icons/fa";

export default function LaporanPemeliharaan() {
  return (
    <EmptyPage
      title="Laporan Pemeliharaan Bulanan"
      subtitle="Laporan maintenance per bulan"
      icon={FaFileAlt}
    />
  );
}
