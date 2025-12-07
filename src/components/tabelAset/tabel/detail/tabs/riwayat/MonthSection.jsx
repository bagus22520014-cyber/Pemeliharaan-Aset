import React from "react";
import { TimelineItem } from "./TimelineItem";

export function MonthSection({
  month,
  items,
  getMonthName,
  getIconColor,
  getAksiColor,
  getAksiLabel,
  formatDate,
  renderRecordDetail,
  renderPerubahan,
}) {
  return (
    <div className="relative mb-10">
      <div className="sticky top-14 bg-white/70 backdrop-blur-md z-10 py-1 pl-16">
        <div className="text-gray-700 text-sm font-medium tracking-wide flex items-center gap-2">
          <svg
            className="w-4 h-4 text-purple-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          {getMonthName(parseInt(month))}
        </div>
      </div>

      <div className="pl-6 border-l border-gray-300 space-y-4 mt-4">
        {items.map((item) => (
          <TimelineItem
            key={item.id}
            item={item}
            getIconColor={getIconColor}
            getAksiColor={getAksiColor}
            getAksiLabel={getAksiLabel}
            formatDate={formatDate}
            renderRecordDetail={renderRecordDetail}
            renderPerubahan={renderPerubahan}
          />
        ))}
      </div>
    </div>
  );
}
