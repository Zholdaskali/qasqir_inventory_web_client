import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Icons
import { FaUsers, FaWarehouse, FaBars, FaTimes } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";
import { VscOrganization } from "react-icons/vsc";
import { GrUser } from "react-icons/gr";
import { ImCart, ImBook, ImTab } from "react-icons/im";
import { IoBarChartSharp } from "react-icons/io5";

// Redux actions
import { clearUser } from "../../store/slices/userSlice";
import { clearActionLogs } from "../../store/slices/logSlices/actionLogSlice";
import { clearExceptionLogs } from "../../store/slices/logSlices/exceptionSlice";
import { clearLogInLogs } from "../../store/slices/logSlices/logInSlice";
import { clearUserList } from "../../store/slices/userListSlice";

// API
import { API_SIGN_OUT } from "../../api/API";

// Components
import ConfirmationWrapper from "./ConfirmationWrapper";



const Layout = ({ setIsAuthenticated }) => {
  const user = useSelector((state) => state.user);
  const reduxAuthToken = useSelector((state) => state.token.token);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [auditLogsList, setAuditLogsList] = useState(false);
  const [inventoryLogsList, setInventoryLogsList] = useState(false);
  const [operationLogsList, setOperationLogsList] = useState(false); // добавлено состояние для операций
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      Cookies.remove("authToken");
      await axios.post(API_SIGN_OUT, {}, { headers: { "Auth-token": reduxAuthToken } });

      dispatch(clearUser());
      dispatch(clearActionLogs());
      dispatch(clearExceptionLogs());
      dispatch(clearLogInLogs());
      dispatch(clearUserList());

      setIsAuthenticated(false);
      navigate("/sign-in");
      toast.success("Вы успешно вышли из системы");
    } catch (error) {
      toast.error("Ошибка при выходе");
    }
  };

  const hasRole = (role) => user?.userRoles?.includes(role);

  return (
    <div className="flex h-screen">
      <button
        className="fixed top-4 left-4 z-50 text-3xl text-black md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      <aside
        className={`bg-white w-[250px] h-full p-4 text-black flex flex-col justify-between transition-transform transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:relative fixed top-0 left-0 z-40 shadow-lg`}
      >
        <div className="flex flex-col gap-6">
          <img src="/logo.svg" alt="Logo" className="w-24 h-24" />
          <h1 className="text-main-dull-blue font-medium text-lg">QASQIR INVENTORY</h1>

          <NavLink to="/dashboard" className="flex items-center gap-3">
            <IoBarChartSharp size={30} /> <p>Аналитика</p>
          </NavLink>

          {hasRole("admin") && (
            <>
              <button onClick={() => setAuditLogsList(!auditLogsList)} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <ImBook size={30} /> <p>Аудит</p>
                </div>
                <IoIosArrowForward className={auditLogsList ? "rotate-90" : ""} />
              </button>
              {auditLogsList && (
                <div className="flex flex-col pl-6 gap-1">
                  <NavLink to="logs/action-logs">Действия</NavLink>
                  <NavLink to="logs/exception-logs">Ошибки</NavLink>
                  <NavLink to="logs/login-logs">Входы</NavLink>
                </div>
              )}

              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <FaUsers size={30} /> <p>Сотрудники</p>
                </div>
                <IoIosArrowForward className={userMenuOpen ? "rotate-90" : ""} />
              </button>
              {userMenuOpen && (
                <div className="flex flex-col pl-6 gap-1">
                  <NavLink to="/users-list">Список сотрудников</NavLink>
                  <NavLink to="/invite-list">Приглашения</NavLink>
                </div>
              )}
            </>
          )}

          {hasRole("employee") && (
            <>
              <NavLink to="/warehouse-list" className="flex items-center gap-3">
                <FaWarehouse size={30} /> <p>Склады</p>
              </NavLink>

              <button onClick={() => setInventoryLogsList(!inventoryLogsList)} className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <ImCart size={30} /> <p>Инвентарь</p>
                </div>
                <IoIosArrowForward className={inventoryLogsList ? "rotate-90" : ""} />
              </button>
              {inventoryLogsList && (
                <div className="flex flex-col pl-6 gap-1">
                  <NavLink to="/category-list">Складской каталог</NavLink>
                  <NavLink to="/supplier-list">Поставщики</NavLink>
                  <NavLink to="/customer-list">Заказщики</NavLink>
                </div>
              )}

              {/* Кнопка "Операции" */}
              <button
                onClick={() => setOperationLogsList(!operationLogsList)}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center gap-3">
                  <ImTab size={30} /> <p>Операции</p>
                </div>
                <IoIosArrowForward className={operationLogsList ? "rotate-90" : ""} />
              </button>
              {operationLogsList && (
                <div className="flex flex-col pl-6 gap-1">
                  <NavLink to="/warehouse-tabs">Операции</NavLink>
                  <NavLink to="/transaction-list">Транзакции</NavLink>
                  <NavLink to="/inventory-item-list">Товары</NavLink>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <NavLink to="/" className="flex items-center gap-3">
            <GrUser size={20} /> <p>Профиль</p>
          </NavLink>

          <NavLink to="/organization-profile" className="flex items-center gap-3">
            <VscOrganization size={20} /> <p>Организация</p>
          </NavLink>

          <ConfirmationWrapper title="Вы точно хотите выйти?" onConfirm={handleLogout}>
            <button className="bg-main-dull-blue py-2 rounded-lg text-white flex items-center justify-center gap-2">
              <MdLogout size={20} /> <p>Выйти</p>
            </button>
          </ConfirmationWrapper>
        </div>
      </aside>

      <main className="flex justify-center sm:flex-1 p-5">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
