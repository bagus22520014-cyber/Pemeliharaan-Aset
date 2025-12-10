import React from "react";
import EmptyPage from "@/components/EmptyPage";
import { FaMoneyBillWave } from "react-icons/fa";

export default function LaporanBiaya() {
  return (
    <EmptyPage
      title="Laporan Biaya Perawatan"
      subtitle="Laporan biaya maintenance dan perbaikan"
      icon={FaMoneyBillWave}
    />
  );
}
