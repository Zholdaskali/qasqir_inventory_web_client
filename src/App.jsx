import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import './App.css';

// pages
import PassRecover from './page/main-pages/PassRecover';
import SignInPage from './page/main-pages/SignInPage';
import Layout from './components/ui/Layout';
import NotFound from './page/main-pages/NotFound';
import PasswordReset from './page/main-pages/PasswordReset';

// Super admin pages
import CreateAdmin from './page/layout-pages/users/setting-user/CreateAdmin';
import ActionLogs from './page/layout-pages/logs/ActionLogs';
import ExceptionLogs from './page/layout-pages/logs/ExceptionLogs';
import LoginLogs from './page/layout-pages/logs/LoginLogs';
import UsersList from './page/layout-pages/users/UsersList';
import LogTabs from './page/layout-pages/logs/LogTabs';
import UserTabs from './page/layout-pages/users/UserTabs';

// User profile
import SettingsPage from './page/layout-pages/profile-pages/SettingsPage';
import EditProfile from './page/layout-pages/profile-pages/EditProfile';
import CategoryList from './page/layout-pages/inventory-pages/CategoryList';
import NomenclatureList from "./page/layout-pages/inventory-pages/NomenclatureList";
import WarehouseItemsPage from './page/layout-pages/warehouse-pages/warehouse-inventory/WarehouseItemsPage';

// Organization
import OrganizationProfile from './page/layout-pages/organization-pages/OrganizationProfile';

// Warehouse-manager pages
import WarehouseList from './page/layout-pages/warehouse-pages/WarehouseList';
import WarehouseZoneList from './page/layout-pages/warehouse-pages/warehouse-structure/WarehouseZoneList';
import DashboardPage from './page/layout-pages/dashboard/DashboardPage';

// Storekeeper
import SupplierList from './page/layout-pages/inventory-pages/SupplierList';
import CustomerList from './page/layout-pages/inventory-pages/CustomerList';
import { useSelector } from 'react-redux';
import InviteList from './page/layout-pages/users/InviteList';
import EditOrganizationProfile from './page/layout-pages/organization-pages/EditOrganizationProfile';
import WarehouseTabsPage from './page/layout-pages/operation/WarehouseOperationTabsPage';
import InventoryItemsList from './page/layout-pages/operation/InventoryItemsList';
import InventoryResultPage from './page/main-operation-pages/inventory-check/InventoryResultPage';
import TransactionList from './page/layout-pages/operation/TransactionList';
import AdminTicketTabsPage from './page/layout-pages/ticket/AdminTicketTabsPage';
import TransactionHistoryPage from './page/layout-pages/operation/TransactionHistoryPage';
import InventoryReportPage from './page/main-operation-pages/inventory-check/InventoryReportPage';
import SystemInventoryCheckPage from './page/main-operation-pages/inventory-check/SystemInventoryCheckPage'
import OneCSyncNomenclaturePage from './page/layout-pages/operation/OneCIntegration';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const user = useSelector((state) => state.user);

    const hasRole = (role) => user?.userRoles?.includes(role);

    return (
        <>
            <Routes>
                {!isAuthenticated ? (
                    <Route path="*" element={<Navigate to="/sign-in" />} />
                ) : (
                    <>
                        <Route
                            path="/"
                            element={
                                <Layout
                                    setIsAuthenticated={setIsAuthenticated}
                                    isAuthenticated={isAuthenticated}
                                />
                            }
                        >
                            <Route index element={<SettingsPage />} />

                            {/* admin: Управление пользователями и анализ логов */}
                            {hasRole("admin") && (
                                <>
                                    <Route path="logs/action-logs" element={<ActionLogs />} />
                                    <Route path="log-tabs" element={<LogTabs />} />
                                    <Route path="logs/exception-logs" element={<ExceptionLogs />} />
                                    <Route path="logs/login-logs" element={<LoginLogs />} />
                                    <Route path="create-company" element={<CreateAdmin />} />
                                    <Route path="users-list" element={<UsersList />} />
                                    <Route path="invite-list" element={<InviteList />} />
                                    <Route
                                        path="edit-organization-profile"
                                        element={<EditOrganizationProfile />}
                                    />
                                    <Route path="user-tabs" element={<UserTabs />} />
                                    <Route path="dashboard" element={<DashboardPage />} />
                                </>
                            )}

                            {/* employee: Просмотр склада товаров */}
                            {hasRole("employee") && (
                                <>
                                    <Route path="warehouse-list" element={<WarehouseList />} />
                                    <Route path="warehouse-structure" element={<WarehouseZoneList />} />
                                    <Route path="nomenclature/:categoryId" element={<NomenclatureList />} />
                                    <Route path="category-list" element={<CategoryList />} />
                                    <Route path="inventory-item-list" element={<InventoryItemsList />} />
                                    <Route path="inventory-item-list/:code" element={<InventoryItemsList />} />
                                </>
                            )}

                            {/* warehouse_manager: Управление структурой склада, обработка заявок */}
                            {hasRole("warehouse_manager") && (
                                <>
                                    <Route path="dashboard" element={<DashboardPage />} />
                                    <Route path="ticket-tabs" element={<AdminTicketTabsPage />} />
                                    <Route path="warehouse-tabs" element={<WarehouseTabsPage />} />
                                    <Route path="warehouse-structure" element={<WarehouseZoneList />} />
                                    <Route path="supplier-list" element={<SupplierList />} />
                                    <Route path="customer-list" element={<CustomerList />} />
                                    <Route path="transaction-list" element={<TransactionList />} />
                                    <Route path="transaction-history" element={<TransactionHistoryPage />} />
                                    <Route path="/transaction-history/:code" element={<TransactionHistoryPage />} />
                                    <Route
                                        path="/inventory-result/:auditId"
                                        element={<InventoryResultPage />}
                                    />
                                    <Route path="/1c-sync" element={<OneCSyncNomenclaturePage />} />                                    
                            
                                </>
                            )}

                            {/* storekeeper: Приемка товаров */}
                            {hasRole("storekeeper") && (
                                <>
                                    <Route path="warehouse-tabs" element={<WarehouseTabsPage />} />
                                    <Route path="supplier-list" element={<SupplierList />} />
                                    <Route path="customer-list" element={<CustomerList />} />
                                    <Route path="transaction-list" element={<TransactionList />} />
                                    <Route
                                        path="/inventory-result/:auditId"
                                        element={<InventoryResultPage />}
                                    />
                                    <Route path="/inventory-report/:inventoryId" element={<InventoryReportPage />} />
                                </>
                            )}

                            {/* Общие маршруты */}
                            <Route path="edit-profile" element={<EditProfile />} />
                            <Route path="organization-profile" element={<OrganizationProfile />} />
                            <Route
                                path="/warehouse-items/:warehouseId"
                                element={<WarehouseItemsPage />}
                            />
                        </Route>
                    </>
                )}
                <Route path="reset-password" element={<PasswordReset />} />
                <Route path="recover-password" element={<PassRecover />} />
                <Route
                    path="/sign-in"
                    element={
                        <SignInPage
                            setIsAuthenticated={setIsAuthenticated}
                            isAuthenticated={isAuthenticated}
                        />
                    }
                />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
}

export default App;