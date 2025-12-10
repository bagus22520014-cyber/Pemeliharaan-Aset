import React from "react";
import EmptyPage from "@/components/EmptyPage";
import { FaWrench } from "react-icons/fa";

export default function RequestPerbaikan() {
  return (
    <EmptyPage
      title="Request Perbaikan"
      subtitle="Kelola permintaan perbaikan aset"
      icon={FaWrench}
    />
  );
}
