// components/ui/AddButton.jsx

const AddButton = ({ onClick, disabled = false, title = "Добавить", className = "" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg text-white text-xl 
        flex items-center justify-center transition-all 
        bg-main-dull-blue hover:bg-blue-700
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      aria-label={title}
      title={title}
    >
      +
    </button>
  );
};

export default AddButton;
