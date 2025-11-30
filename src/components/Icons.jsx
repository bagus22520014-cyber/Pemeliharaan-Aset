import {
  FiEdit3,
  FiTrash2,
  FiLogOut,
  FiSave,
  FiPlus,
  FiChevronUp,
  FiChevronDown,
  FiX,
  FiEye,
  FiMoreVertical,
} from "react-icons/fi";
import React from "react";

export const Pencil = (props) => <FiEdit3 {...props} />;
export const Trash = (props) => <FiTrash2 {...props} />;
export const Logout = (props) => <FiLogOut {...props} />;
export const Save = (props) => <FiSave {...props} />;
export const Plus = (props) => <FiPlus {...props} />;
export const Close = (props) => <FiX {...props} />;
export const Eye = (props) => <FiEye {...props} />;
export const MoreVertical = (props) => <FiMoreVertical {...props} />;

export const Sort = ({
  direction = "none",
  className = "h-4 w-4",
  ...props
}) => (
  <span className={`inline-flex items-center ${className}`} {...props}>
    <FiChevronUp
      className={`h-3 w-3 ${direction === "desc" ? "opacity-30" : ""}`}
    />
    <FiChevronDown
      className={`h-3 w-3 ${direction === "asc" ? "opacity-30" : ""}`}
    />
  </span>
);
