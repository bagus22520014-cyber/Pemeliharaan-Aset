import React from "react";
import EmptyPage from "@/components/EmptyPage";
import { FaHammer } from "react-icons/fa";

export default function AsetDalamPerbaikan() {
  return (
    <EmptyPage
      title="Aset Dalam Perbaikan"
      subtitle="Monitor aset yang sedang diperbaiki"
      icon={FaHammer}
    />
  );
}
