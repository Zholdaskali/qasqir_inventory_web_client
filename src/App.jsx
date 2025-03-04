import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import './App.css'

// pages
import PassRecover from './page/PassRecover'
import SignInPage from './page/SignInPage'
import Layout from './components/ui/Layout'
import NotFound from './page/NotFound'

// Super admin pages
import CreateAdmin from './page/super-admin-pages/CreateAdmin'
import UsersList from './page/UsersList'
import ActionLogs from './page/super-admin-pages/logs/ActionLogs'
import ExceptionLogs from './page/super-admin-pages/logs/ExceptionLogs'
import LoginLogs from './page/super-admin-pages/logs/LoginLogs'

// User profile
import SettingsPage from './page/profile-pages/SettingsPage'
import EditProfile from './page/profile-pages/EditProfile'
import NomenclatureList from './page/inventory-pages/NomenclatureList'
import CategoryList from './page/inventory-pages/CategoryList'

// Organization 
import OrganizationProfile from './page/organization-pages/OrganizationProfile'

// Warehouse-manager pagex1
import WarehouseList from './page/warehouse-pages/WarehouseList'
import WarehouseZoneList from './page/warehouse-pages/WarehouseZoneList'
import DashboardPage from './page/DashboardPage'

// Storekeeper
import SupplierList from './page/inventory-pages/SupplierList'
import CustomerList from './page/inventory-pages/CustomerList'
import { useSelector } from 'react-redux'
import InviteList from './page/super-admin-pages/InviteList'
import EditOrganizationProfile from './page/organization-pages/EditOrganizationProfile'
import WarehouseTabsPage from './page/main-operation-pages/WarehouseTabsPage'
import TransactionList from './page/inventory-pages/TransactionList'
import InventoryItemsList from './page/inventory-pages/InventoryItemsList'

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
                  <Route path='logs/exception-logs' element={<ExceptionLogs />} />
                  <Route path='logs/login-logs' element={<LoginLogs />} />
                  <Route path='create-company' element={<CreateAdmin />} />
                  <Route path='users-list' element={<UsersList />} />
                  <Route path='invite-list' element={<InviteList />} />
                  <Route path='edit-organization-profile' element={<EditOrganizationProfile />} />
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
