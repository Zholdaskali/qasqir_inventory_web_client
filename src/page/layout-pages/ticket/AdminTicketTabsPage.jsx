import React from "react";
import TabsLayout from "../../../components/ui/TabsLayout";
import AdminTicketApprovalPage from "./AdminTicketApprovalPage";

const tabs = [
  { id: "WRITE-OFF", name: "УТИЛИЗАЦИЯ", component: () => <AdminTicketApprovalPage ticketType="WRITE-OFF" /> },
  { id: "SALES", name: "ПРОДАЖА", component: () => <AdminTicketApprovalPage ticketType="SALES" /> },
  { id: "PRODUCTION", name: "ПРОИЗВОДСТВО", component: () => <AdminTicketApprovalPage ticketType="PRODUCTION" /> },
  { id: "1C-SALES", name: "1C-ПРОДАЖА", component: () => <AdminTicketApprovalPage ticketType="1C-SALES" /> },
  { id: "1C-WRITE-OFF", name: "1C-УТИЛИЗАЦИЯ", component: () => <AdminTicketApprovalPage ticketType="1C-WRITE-OFF" /> },
  { id: "1C-PRODUCTION", name: "1C-ПРОИЗВОДСТВО", component: () => <AdminTicketApprovalPage ticketType="1C-PRODUCTION" /> },
];

const WriteOffTicketTabsPage = () => {
  return <TabsLayout tabs={tabs} defaultTab="WRITE-OFF" />;
};

export default WriteOffTicketTabsPage;