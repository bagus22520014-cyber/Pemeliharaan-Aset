import React from "react";
import EmptyPage from "@/components/EmptyPage";
import { FaCog } from "react-icons/fa";

export default function Pengaturan() {
  return (
    <EmptyPage
      title="Pengaturan Sistem"
      subtitle="Konfigurasi sistem dan preferensi"
      icon={FaCog}
    />
  );
}
