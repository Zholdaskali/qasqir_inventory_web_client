const IconButton = ({ onClick, disabled, label, className = "", children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-2 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    aria-label={label}
  >
    {children}
  </button>
);

export default IconButton;
