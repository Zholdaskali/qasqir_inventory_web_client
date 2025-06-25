const DateRangePicker = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  className = "",
}) => {
  return (
    <div className={`flex flex-col sm:flex-row gap-4 w-full sm:w-auto font-['Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Open Sans','Helvetica Neue',sans-serif] ${className}`}>
      <div className="flex-1">
        <label className="block text-sm font-medium text-[#4A5C6A] mb-1">
          Начало
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-4 py-2.5 bg-white border border-[#9BA8AB] rounded-xl text-sm text-[#4A5C6A] focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-[#4A5C6A] w-full hover:shadow-lg transition-all duration-300 ease-in-out"
        />
      </div>
      <div className="flex-1">
        <label className="block text-sm font-medium text-[#4A5C6A] mb-1">
          Конец
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-4 py-2.5 bg-white border border-[#9BA8AB] rounded-xl text-sm text-[#4A5C6A] focus:outline-none focus:ring-2 focus:ring-[#4A5C6A] focus:border-[#4A5C6A] w-full hover:shadow-lg transition-all duration-300 ease-in-out"
        />
      </div>
    </div>
  );
};

export default DateRangePicker;