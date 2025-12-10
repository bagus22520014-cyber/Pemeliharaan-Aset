import React from "react";
import EmptyPage from "@/components/EmptyPage";
import { FaClock } from "react-icons/fa";

export default function LaporanDowntime() {
  return (
    <EmptyPage
      title="Laporan Downtime"
      subtitle="Laporan waktu tidak aktif aset"
      icon={FaClock}
    />
  );
}
