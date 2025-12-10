import React from "react";
import EmptyPage from "@/components/EmptyPage";
import { FaTags } from "react-icons/fa";

export default function KategoriAset() {
  return (
    <EmptyPage
      title="Kategori Aset"
      subtitle="Kelola kategori dan klasifikasi aset"
      icon={FaTags}
    />
  );
}
