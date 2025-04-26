import React, { useState } from 'react';
import AdminTicketApprovalPage from './AdminTicketApprovalPage';

const tabs = [
  { name: 'УТИЛИЗАЦИЯ', page: 'WRITE-OFF' },
  { name: 'ПРОДАЖА', page: 'SALES' },
  { name: 'ПРОИЗВОДСТВО', page: 'PRODUCTION' },
  { name: '1C-ПРОДАЖА', page: '1C-SALES' },
];

const WriteOffTicketTabsPage = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].page);

  const renderContent = () => {
    switch (activeTab) {
      case 'WRITE-OFF':
        return <AdminTicketApprovalPage ticketType="WRITE-OFF" />;
      case 'SALES':
        return <AdminTicketApprovalPage ticketType="SALES" />;
      case 'PRODUCTION':
        return <AdminTicketApprovalPage ticketType="PRODUCTION" />;
      case '1C-SALES':
        return <AdminTicketApprovalPage ticketType="1C-SALES" />;
      default:
        return <div className="h-full text-gray-600 text-sm sm:text-base">Выберите вкладку</div>;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white sm:bg-gray-50">
      {/* Вкладки */}
      <div className="flex-shrink-0 p-2 sm:p-4 border-b bg-white shadow-sm">
        <div className="flex gap-1 sm:gap-2 overflow-x-auto whitespace-nowrap snap-x snap-mandatory">
          {tabs.map((tab) => (
            <button
              key={tab.page}
              onClick={() => setActiveTab(tab.page)}
              className={`px-3 sm:px-4 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm font-medium transition-all min-h-[36px] snap-center ${
                tab.page === activeTab
                  ? 'bg-main-dull-blue text-white shadow-md border-b-2 border-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Контент */}
      <div className="flex-grow p-2 sm:p-4 overflow-auto">{renderContent()}</div>
    </div>
  );
};

export default WriteOffTicketTabsPage;