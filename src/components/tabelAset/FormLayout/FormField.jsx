import React, { useEffect, useState } from "react";
import { FaCopy, FaCheck, FaRegEdit, FaLock } from "react-icons/fa";

export default function FormField({
  label,
  value,
  displayValue,
  isViewMode,
  type = "text",
  placeholder,
  onChange,
  children,
  copyable = false,
  copiedKey,
  fieldKey,
  onCopy,
  readOnly = false,
  disabled = false,
  className = "",
  editButton = null,
}) {
  const renderLabel = () => {
    if (typeof label !== "string") return label;
    // In view mode, strip asterisks from labels (don't show required mark)
    if (isViewMode) return String(label).replace(/\*/g, "").trim();
    // Split on '*' and insert a red '*' element between parts
    const parts = label.split("*");
    if (parts.length === 1) return label;
    return (
      <>
        {parts.map((part, idx) => (
          <span key={idx}>
            {part}
            {idx < parts.length - 1 && <span className="text-red-500">*</span>}
          </span>
        ))}
      </>
    );
  };

  return (
    <div
      className={`p-4 rounded-xl bg-white shadow-sm border border-gray-100 ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="font-medium text-gray-600">{renderLabel()}</div>
        {isViewMode && copyable && onCopy && (
          <button
            type="button"
            onClick={() => onCopy(displayValue ?? "-", fieldKey)}
            className="ml-2 p-1 rounded text-gray-500 hover:bg-gray-100"
            title={`Copy ${label}`}
          >
            {copiedKey === fieldKey ? (
              <FaCheck className="text-green-600" />
            ) : (
              <FaCopy />
            )}
          </button>
        )}
      </div>

      <div
        className={`mt-1 transition-opacity duration-200 ease-in-out ${
          typeof window !== "undefined" && typeof document !== "undefined"
            ? ""
            : ""
        } ${"opacity-100"}`}
      >
        {/* Fade trigger: toggle visibility briefly when key props change */}
        <FadeContent
          children={children}
          isViewMode={isViewMode}
          displayValue={displayValue}
          value={value}
          type={type}
          onChange={onChange}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={disabled}
          editButton={editButton}
        />
      </div>
    </div>
  );
}

function FadeContent({
  children,
  isViewMode,
  displayValue,
  value,
  type,
  onChange,
  placeholder,
  readOnly,
  disabled,
  editButton,
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Trigger fade-in on the next frame(s) to avoid a visible blank frame
    // (using double requestAnimationFrame is more reliable than setTimeout)
    setVisible(false);
    let raf1 = null;
    let raf2 = null;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setVisible(true));
    });
    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [children, isViewMode, displayValue, value]);

  return (
    <div
      className={`transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {children ? (
        children
      ) : isViewMode ? (
        <div className="text-base">{displayValue ?? "-"}</div>
      ) : (
        <div className="relative">
          <input
            type={type}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            readOnly={readOnly}
            disabled={disabled}
            className="w-full text-base bg-transparent border-none p-0 focus:outline-none focus:ring-0 disabled:opacity-50"
          />
          {editButton}
        </div>
      )}
    </div>
  );
}
