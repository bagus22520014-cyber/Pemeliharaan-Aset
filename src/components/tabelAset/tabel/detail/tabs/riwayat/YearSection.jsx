import React from "react";
import { MonthSection } from "./MonthSection";

export function YearSection({
  year,
  months,
  getMonthName,
  getIconColor,
  getAksiColor,
  getAksiLabel,
  formatDate,
  renderRecordDetail,
  renderPerubahan,
}) {
  return (
    <div className="relative">
      <div className="sticky top-0 z-20 mb-6">
        <div className="bg-indigo-500 text-white px-6 py-3 rounded-lg shadow font-semibold text-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
          {year}
        </div>
      </div>

      {Object.keys(months)
        .sort((a, b) => b - a)
        .map((month) => (
          <MonthSection
            key={month}
            month={month}
            items={months[month]}
            getMonthName={getMonthName}
            getIconColor={getIconColor}
            getAksiColor={getAksiColor}
            getAksiLabel={getAksiLabel}
            formatDate={formatDate}
            renderRecordDetail={renderRecordDetail}
            renderPerubahan={renderPerubahan}
          />
        ))}
    </div>
  );
}
