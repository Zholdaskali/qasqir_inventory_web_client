/* eslint-disable react/prop-types */
// icons
    import { CiCalendarDate } from "react-icons/ci";
    import { FaFilter } from "react-icons/fa6";
// icons

import { useState } from "react";

const SearchLog = ({
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        fetchLogs,
        downloadLogsAsTxt,
        fields
    }) => {

        const [showFilter, setShowFilter] = useState(false)

    return (
        <div className="w-full">
            <div 
                className="bg-white w-full flex gap-x-5 items-center justify-between px-10 py-3 rounded-xl shadow-xl">
            <div className="flex  gap-2 mb-2">
            <div>
                <label htmlFor="start-date" className="flex items-start gap-x-2">
                <CiCalendarDate />
                <p>Начальная дата</p>
                </label>
                <input
                type="date"
                id="start-date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border px-4 py-5"
                />
            </div>
            <div>
                <label htmlFor="end-date">Конечная дата</label>
                <input
                type="date"
                id="end-date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border px-4 py-5"
                />
            </div>
            </div>
                <div className="w-full flex items-center">
                    <div className="">
                        <button 
                            className="flex items-center border  p-4 rounded-xl border-main-purp"
                            onClick={()=>setShowFilter((prev)=>!prev)}
                        >
                            <FaFilter color="#7400B8" size={25}/>
                            <p className="text-xl">Фильтр</p>
                        </button>
                        {
                            showFilter &&
                            <div className="bg-white absolute w-56 py-5 px-10 mt-5 rounded-xl shadow-xl ">
                                <ul>
                                    <h1>Сортировка по</h1>
                                    {fields.map((field) => (
                                    <li
                                        key={field}
                                        className="cursor-pointer hover:underline capitalize"
                                    >
                                    {field}</li>
                                    ))}
                                </ul>
                            </div>
                        }
                    </div>
                    <input type="text" placeholder="Поиск" className="w-full mx-5 border border-main-purp px-8 py-4 rounded-xl"/>
                </div>

                <div className="flex gap-x-2 flex-row items-center">
                    <button
                        onClick={fetchLogs}
                        className="bg-main-purp px-4 text-sm py-4 text-white rounded-lg shadow-xl hover:bg-main-green"
                    >
                        Вывести
                    </button>

                    <button
                        onClick={downloadLogsAsTxt}
                        className="bg-main-purp px-4 text-sm py-4 text-white rounded-lg shadow-xl hover:bg-main-green"
                    >
                        Скачать
                    </button>
                </div>
            </div>      
        </div>
    );
}

export default SearchLog;
