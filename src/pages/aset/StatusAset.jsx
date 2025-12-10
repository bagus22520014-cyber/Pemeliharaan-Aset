import React from "react";
import EmptyPage from "@/components/EmptyPage";
import { FaCheckCircle } from "react-icons/fa";

export default function StatusAset() {
  return (
    <EmptyPage
      title="Status Aset"
      subtitle="Monitor status dan kondisi aset"
      icon={FaCheckCircle}
    />
  );
}
