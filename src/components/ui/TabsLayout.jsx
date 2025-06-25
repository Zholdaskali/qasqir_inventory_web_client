import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const TabsLayout = ({ tabs = [], defaultTab, className = "" }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialTab = searchParams.get("tab") || defaultTab || tabs[0]?.id;
  const [activeTab, setActiveTab] = useState(initialTab);

  // Обновляем URL при смене вкладки
  useEffect(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", activeTab);
      return newParams;
    });
  }, [activeTab, setSearchParams]);

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className={`min-h-screen w-full flex flex-col bg-white sm:bg-gray-50 ${className}`}>
      {/* Вкладки */}
      <div className="flex-shrink-0 p-2 sm:p-4 border-b bg-white shadow-sm">
        <div className="flex gap-1 sm:gap-2 overflow-x-auto whitespace-nowrap snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 sm:px-4 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-medium transition-all min-h-[36px] snap-center ${
                tab.id === activeTab
                  ? "bg-main-dull-blue text-white shadow-md border-b-2 border-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              role="tab"
              aria-selected={tab.id === activeTab}
              aria-controls={`panel-${tab.id}`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Контент активной вкладки */}
      <div id={`panel-${activeTab}`} role="tabpanel" className="flex-grow p-2 sm:p-4 overflow-auto">
        {ActiveComponent ? <ActiveComponent /> : <p>Нет содержимого</p>}
      </div>
    </div>
  );
};

export default TabsLayout;
