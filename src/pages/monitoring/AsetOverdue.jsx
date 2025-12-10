import React from "react";
import EmptyPage from "@/components/EmptyPage";
import { FaClock } from "react-icons/fa";

export default function AsetOverdue() {
  return (
    <EmptyPage
      title="Aset Overdue Maintenance"
      subtitle="Aset yang melewati jadwal maintenance"
      icon={FaClock}
    />
  );
}
