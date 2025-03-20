import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import './App.css'

// pages
import PassRecover from './page/main-pages/PassRecover'
import SignInPage from './page/main-pages/SignInPage'
import Layout from './components/ui/Layout'
import NotFound from './page/main-pages/NotFound'

// Super admin pages
import CreateAdmin from './page/layout-pages/users/setting-user/CreateAdmin'
import ActionLogs from './page/layout-pages/logs/ActionLogs'
import ExceptionLogs from './page/layout-pages/logs/ExceptionLogs'
import LoginLogs from './page/layout-pages/logs/LoginLogs'
import UsersList from './page/layout-pages/users/UsersList'
import LogTabs from './page/layout-pages/logs/LogTabs'
import UserTabs from './page/layout-pages/users/UserTabs'

// User profile
import SettingsPage from './page/layout-pages/profile-pages/SettingsPage'
import EditProfile from './page/layout-pages/profile-pages/EditProfile'
import CategoryList from './page/layout-pages/inventory-pages/CategoryList'
import NomenclatureList from "./page/layout-pages/inventory-pages/NomenclatureList"

// Organization 
import OrganizationProfile from './page/layout-pages/organization-pages/OrganizationProfile'

// Warehouse-manager pagex1
import WarehouseList from './page/layout-pages/warehouse-pages/WarehouseList'
import WarehouseZoneList from './page/layout-pages/warehouse-pages/warehouse-structure/WarehouseZoneList'
import DashboardPage from './page/layout-pages/dashboard/DashboardPage'

// Storekeeper
import SupplierList from './page/layout-pages/inventory-pages/SupplierList'
import CustomerList from './page/layout-pages/inventory-pages/CustomerList'
import { useSelector } from 'react-redux'
import InviteList from './page/layout-pages/users/InviteList'
import EditOrganizationProfile from './page/layout-pages/organization-pages/EditOrganizationProfile'
import WarehouseTabsPage from './page/layout-pages/operation/WarehouseOperationTabsPage'
import InventoryItemsList from './page/layout-pages/operation/InventoryItemsList'
import TicketTabsPage from './page/main-operation-pages/write-off/WriteOffTicketTabsPage'
import InventoryResultPage from './page/main-operation-pages/inventory-check/InventoryResultPage'
import TransactionList from './page/layout-pages/operation/TransactionList'


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const user = useSelector((state) => state.user)

  const hasRole = (role) => user?.userRoles?.includes(role)

  return (
    <>
      <Routes>
        {!isAuthenticated ? (
          <Route path="*" element={<Navigate to="/sign-in" />} />
        ) : (
          <>
            <Route path='/' element={<Layout setIsAuthenticated={setIsAuthenticated} isAuthenticated={isAuthenticated} />}>
              <Route index element={<SettingsPage />} />
              {hasRole("admin") && (
                <>
                  <Route path='logs/action-logs' element={<ActionLogs />} />
                  <Route path='log-tabs' element={<LogTabs />} />
                  <Route path='logs/exception-logs' element={<ExceptionLogs />} />
                  <Route path='logs/login-logs' element={<LoginLogs />} />
                  <Route path='create-company' element={<CreateAdmin />} />
                  <Route path='users-list' element={<UsersList />} />
                  <Route path='invite-list' element={<InviteList />} />
                  <Route path='edit-organization-profile' element={<EditOrganizationProfile />} />
                  <Route path='ticket-tabs' element={<TicketTabsPage />} />
                  <Route path='user-tabs' element={<UserTabs />} />
                </>
              )}
              {(hasRole("employee")) && (
                <>
                  <Route path='warehouse-list' element={<WarehouseList />} />
                  <Route path='warehouse-structure' element={<WarehouseZoneList />} />
                  <Route path="nomenclature/:categoryId" element={<NomenclatureList />} />
                  <Route path='category-list' element={<CategoryList />} />
                  <Route path='inventory-item-list' element={<InventoryItemsList />} />
                  
                </>
              )}
              {hasRole("warehouse_manager") && (
                <>
                  <Route path='dashboard' element={<DashboardPage />} />
                </>
              )}
              {hasRole("storekeeper") && (
                <>
                  <Route path='warehouse-tabs' element={<WarehouseTabsPage />} />
                  <Route path='supplier-list' element={<SupplierList />} />
                  <Route path='customer-list' element={<CustomerList />} />
                  <Route path='transaction-list' element={<TransactionList />} />
                  <Route path="/inventory-result/:auditId" element={<InventoryResultPage />} />
                </>
              )}
              <Route path='edit-profile' element={<EditProfile />} />
              <Route path='organization-profile' element={<OrganizationProfile />} />
            </Route>

          </>
        )}

        <Route path='recover-password' element={<PassRecover />} />
        <Route path='/sign-in' element={<SignInPage setIsAuthenticated={setIsAuthenticated} isAuthenticated={isAuthenticated} />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
