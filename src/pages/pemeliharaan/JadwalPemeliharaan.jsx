import React from "react";
import EmptyPage from "@/components/EmptyPage";
import { FaCalendarAlt } from "react-icons/fa";

export default function JadwalPemeliharaan() {
  return (
    <EmptyPage
      title="Jadwal Pemeliharaan"
      subtitle="Kelola jadwal maintenance aset"
      icon={FaCalendarAlt}
    />
  );
}
