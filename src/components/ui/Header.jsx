import IconButton from "./IconButton";
import SearchInput from "./SearchInput";

const TableHeader = ({
  title,
  searchQuery,
  setSearchQuery,
  onExport,
  exportDisabled,
  searchPlaceholder = "Поиск...",
  onAction,
  actionLabel,
  actionDisabled,
  actionClassName = "bg-[#4A5C6A] text-white hover:bg-[#3b4a55] focus:ring-2 focus:ring-[#9BA8AB] transition-all duration-300 ease-in-out whitespace-nowrap",
}) => {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-white via-gray-50 to-gray-100 py-5 px-6 lg:px-10 gap-6 rounded-t-xl font-['Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif]">
      <h1 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#4A5C6A] to-[#3b4a55] tracking-tight transition-all duration-300 ease-in-out">
        {title}
      </h1>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
        <SearchInput
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder={searchPlaceholder}
          className="flex-1 md:flex-none w-full sm:w-72 lg:w-96 bg-white border border-[#9BA8AB] rounded-xl shadow-sm hover:shadow-lg focus-within:ring-2 focus-within:ring-[#4A5C6A] focus-within:border-[#4A5C6A] transition-all duration-300 ease-in-out text-sm"
          aria-label="Поиск по таблице"
        />
        <div className="flex items-center gap-4">
          {onAction && (
            <IconButton
              onClick={onAction}
              disabled={actionDisabled}
              label={actionLabel}
              className={`${actionClassName} font-medium text-sm px-5 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9BA8AB] transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out`}
              aria-label={actionLabel}
            >
              {actionLabel}
            </IconButton>
          )}
          <IconButton
            onClick={onExport}
            disabled={exportDisabled}
            label="Экспорт в Excel"
            className="bg-gradient-to-r from-[#4A5C6A] to-[#3b4a55] text-white hover:from-[#3b4a55] hover:to-[#2e3b44] font-medium text-sm px-5 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-offset-2 focus:ring-[#9BA8AB] hover:shadow-xl focus:outline-none transform hover:-translate-y-0.5 transition-all duration-300 ease-in-out"
            aria-label="Экспорт данных в Excel"
          >
            Экспорт в Excel
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default TableHeader;