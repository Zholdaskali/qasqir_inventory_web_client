import React from "react";
import TabsLayout from "../../../components/ui/TabsLayout";
import TicketExecutionPage from "./TicketExecutionPage";
import BatchProcessPage from "./BatchProcessPage";

const tabs = [
  { id: "ticket-list", name: "СПИСОК ЗАЯВОК", component: () => <TicketExecutionPage ticketType="WRITE-OFF" /> },
  { id: "ticket-batch-add", name: "ПОДАТЬ ГРУППОВУЮ ЗАЯВКУ", component: BatchProcessPage },
];

const WriteOffTabs = () => {
  return <TabsLayout tabs={tabs} defaultTab="ticket-list" />;
};

export default WriteOffTabs;