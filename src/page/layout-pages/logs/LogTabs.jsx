import React from "react";
import TabsLayout from "../../../components/ui/TabsLayout";
import ActionLogs from "./ActionLogs";
import ExceptionLogs from "./ExceptionLogs";
import LoginLogs from "./LoginLogs";

const tabs = [
  { id: "action-log", name: "Активности в системе", component: ActionLogs },
  { id: "exception-log", name: "Ошибки в системе", component: ExceptionLogs },
  { id: "login-log", name: "Входы в систему", component: LoginLogs },
];

const LogTabs = () => {
  return <TabsLayout tabs={tabs} defaultTab="action-log" />;
};

export default LogTabs;