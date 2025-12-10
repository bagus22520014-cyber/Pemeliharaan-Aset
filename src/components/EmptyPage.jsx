import React from "react";

export default function EmptyPage({ title, subtitle, icon: Icon }) {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100">
        <div className="text-center">
          <div className="mb-4">
            {Icon && <Icon className="mx-auto text-6xl text-gray-300" />}
          </div>
          <p className="text-gray-500 text-lg">
            Halaman {title} dalam pengembangan
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Fitur akan segera ditambahkan
          </p>
        </div>
      </div>
    </div>
  );
}
