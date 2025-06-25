import React from "react";
import TabsLayout from "../../../components/ui/TabsLayout";
import UsersList from "./UsersList";
import InviteList from "./InviteList";

const tabs = [
  { id: "user-list", name: "Пользователи системы", component: UsersList },
  { id: "invite-list", name: "Приглашения в систему", component: InviteList },
];

const UserTabs = () => {
  return <TabsLayout tabs={tabs} defaultTab="user-list" />;
};

export default UserTabs;