const SearchInput = ({
  searchQuery,
  setSearchQuery,
  placeholder = "Поиск...",
  className,
  ...props
}) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className={`px-4 py-2.5 bg-white border border-[#9BA8AB] rounded-xl text-sm font-['Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif] placeholder-[#9BA8AB] focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-[#4A5C6A] w-full sm:w-72 lg:w-96 hover:shadow-lg transition-all duration-300 ease-in-out ${className}`}
      {...props}
    />
  );
};

export default SearchInput;