import React from "react";
import EmptyPage from "@/components/EmptyPage";
import { FaHistory } from "react-icons/fa";

export default function RiwayatPemeliharaan() {
  return (
    <EmptyPage
      title="Riwayat Pemeliharaan"
      subtitle="Lihat history maintenance aset"
      icon={FaHistory}
    />
  );
}
