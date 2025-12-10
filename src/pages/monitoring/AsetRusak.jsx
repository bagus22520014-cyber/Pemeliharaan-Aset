import React from "react";
import EmptyPage from "@/components/EmptyPage";
import { FaExclamationTriangle } from "react-icons/fa";

export default function AsetRusak() {
  return (
    <EmptyPage
      title="Aset Rusak"
      subtitle="Monitor aset yang mengalami kerusakan"
      icon={FaExclamationTriangle}
    />
  );
}
