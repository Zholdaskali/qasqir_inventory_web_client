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

// Organization 
import OrganizationProfile from './page/organization-pages/OrganizationProfile'

import { useSelector } from 'react-redux'
import InviteList from './page/super-admin-pages/InviteList'
import EditOrganizationProfile from './page/organization-pages/EditOrganizationProfile'


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
            <Route path='/' element={<Layout setIsAuthenticated={setIsAuthenticated} isAuthenticated={isAuthenticated}/>}>
              <Route index element={<SettingsPage />} />
              {hasRole("admin") && (
                <>
                  <Route path='logs/action-logs' element={<ActionLogs />} />
                  <Route path='logs/exception-logs' element={<ExceptionLogs />} />
                  <Route path='logs/login-logs' element={<LoginLogs />} />
                  <Route path='create-company' element={<CreateAdmin />} />
                  <Route path='users-list' element={<UsersList />} />
                  <Route path='invite-list' element={<InviteList />} />
                  <Route path='edit-organization-profile' element={<EditOrganizationProfile/>}/>
                </>
              )}
              {(hasRole("warehouse_manager") || hasRole("employee") || hasRole("storekeeper")) && (
                <Route path='edit-profile' element={<EditProfile />} />
              )}
              <Route path='edit-profile' element={<EditProfile />} />
              <Route path='organization-profile' element={<OrganizationProfile/>}/>
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
