/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Icons
import { FaUsers, FaWarehouse } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";
import { VscOrganization } from "react-icons/vsc";
import { GrUser } from "react-icons/gr";
import { ImCart } from "react-icons/im";
import { ImBook } from "react-icons/im";
import { ImTab } from "react-icons/im";
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

// Assets
import avatar from "../../assets/placeholders/avatar.png";

const Layout = ({ setIsAuthenticated }) => {
  const user = useSelector((state) => state.user);
  const reduxAuthToken = useSelector((state) => state.token.token);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [auditLogsList, setAuditLogsList] = useState(false);
  const [inventoryLogsList, setInventoryLogsList] = useState(false);
  const [operationLogsList, setOperationLogsList] = useState(false);  // Новое состояние для операций
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleAuditLogsList = () => setAuditLogsList((prev) => !prev);
  const handleInventoryList = () => setInventoryLogsList((prev) => !prev);
  const handleOperationList = () => setOperationLogsList((prev) => !prev);  // Функция для переключения состояния операций
  const toggleUserMenu = () => setUserMenuOpen((prev) => !prev);

  const handleClear = () => {
    dispatch(clearUser());
    dispatch(clearActionLogs());
    dispatch(clearExceptionLogs());
    dispatch(clearLogInLogs());
    dispatch(clearUserList());
  };

  const handleLogout = async () => {
    try {
      console.log("Logout token:", reduxAuthToken);

      // Удаление токена из cookies
      Cookies.remove("authToken");

      // Удаление сессии на сервере
      await axios.post(
        API_SIGN_OUT,
        {},
        {
          headers: { "Auth-token": reduxAuthToken },
        }
      );

      // Очищаем Redux и обновляем состояние
      handleClear();
      setIsAuthenticated(false);
      navigate("/sign-in");
      toast.success("Вы успешно вышли из системы");
    } catch (error) {
      console.error("Ошибка при выходе:", error.response || error);
      toast.error("Ошибка при выходе");
    }
  };

  const hasRole = (role) => user?.userRoles?.includes(role);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex z-10">
        <aside className="bg-white top-0 w-[10%] h-screen py-1 px-1 text-black flex flex-col items-center justify-between z-40">
          <div className="flex flex-col w-full px-4 gap-y-14 mt-4 text-start">
            <div className="flex flex-col gap-y-5">
              <img src="/logo.svg" alt="Logo" className="w-24 h-24" />
              <h1 className="text-main-dull-blue font-medium text-lg">
                QASQIR INVENTORY
              </h1>
            </div>
            <div className="flex flex-col w-full items-start gap-y-5 text-sm">
                  <NavLink
                    to="/dashboard"
                    className="flex items-center justify-between gap-x-3 w-full"
                  >
                    <div className="flex items-center gap-x-3">
                      <IoBarChartSharp size={30} />
                      <p>Аналитика</p>
                    </div>
                    <IoIosArrowForward size={15} />
                  </NavLink>
              {hasRole("admin") && (
                <div className="flex flex-col w-full items-start gap-y-5 text-sm">
                  {/* Логи аудита */}
                  <button
                    onClick={handleAuditLogsList}
                    className="flex justify-between items-center w-full"
                  >
                    <div className="flex items-center gap-x-3">
                      <ImBook size={30} />
                      <p>Аудит</p>
                    </div>
                    <IoIosArrowForward
                      size={15}
                      className={`${
                        auditLogsList ? "rotate-90" : ""
                      } transition-transform`}
                    />
                  </button>
                  {auditLogsList && (
                    <div className="flex flex-col gap-y-2 w-3/4 px-2 text-main-dull-gray self-center">
                      <NavLink to="logs/action-logs">Действия</NavLink>
                      <NavLink to="logs/exception-logs">Ошибки</NavLink>
                      <NavLink to="logs/login-logs">Входы</NavLink>
                    </div>
                  )}
                  {/* Список пользователей и приглашений */}
                  <button
                    onClick={toggleUserMenu}
                    className="flex justify-between items-center w-full"
                  >
                    <div className="flex items-center gap-x-3">
                      <FaUsers size={30} />
                      <p>Сотрудники</p>
                    </div>
                    <IoIosArrowForward
                      size={15}
                      className={`${
                        userMenuOpen ? "rotate-90" : ""
                      } transition-transform`}
                    />
                  </button>
                  {userMenuOpen && (
                    <div className="flex flex-col gap-y-2 w-3/4 px-2 text-main-dull-gray self-center">
                      <NavLink to="/users-list">Список сотрудников</NavLink>
                      <NavLink to="/invite-list">Приглашения</NavLink>
                    </div>
                  )}
                </div>
              )}

              {hasRole("employee") && (
                <div className="flex flex-col w-full items-start gap-y-5 text-sm">
                  <NavLink
                    to="/warehouse-list"
                    className="flex items-center justify-between gap-x-3 w-full"
                  >
                    <div className="flex items-center gap-x-3">
                      <FaWarehouse size={30} />
                      <p>Склады</p>
                    </div>
                    <IoIosArrowForward size={15} />
                  </NavLink>
                  <button
                    onClick={handleInventoryList}
                    className="flex justify-between items-center w-full"
                  >
                    <div className="flex items-center gap-x-3">
                      <ImCart size={30} />
                      <p>Инвентарь</p>
                    </div>
                    <IoIosArrowForward
                      size={15}
                      className={`${
                        inventoryLogsList ? "rotate-90" : ""
                      } transition-transform`}
                    />
                  </button>
                  {inventoryLogsList && (
                    <div className="flex flex-col gap-y-2 w-3/4 px-2 text-main-dull-gray self-center">
                      <NavLink to="/category-list">Категории</NavLink>
                      <NavLink to="/nomenclature-list">Номенклатуры</NavLink>
                    </div>
                  )}

                  {/* Кнопка для "Операций" */}
                  <button
                    onClick={handleOperationList}
                    className="flex justify-between items-center w-full"
                  >
                    <div className="flex items-center gap-x-3">
                      <ImTab size={30} />
                      <p>Операции</p>
                    </div>
                    <IoIosArrowForward
                      size={15}
                      className={`${
                        operationLogsList ? "rotate-90" : ""
                      } transition-transform`}
                    />
                  </button>
                  {operationLogsList && (
                    <div className="flex flex-col gap-y-2 w-3/4 px-2 text-main-dull-gray self-center">
                      <NavLink to="/#">Оприходования</NavLink>
                      <NavLink to="/#">Возврат</NavLink>
                      <NavLink to="/#">Перемещение</NavLink>
                      <NavLink to="/#">Производство</NavLink>
                      <NavLink to="/#">Продажа</NavLink>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col w-full gap-y-2 px-4 items-center py-4">
            <NavLink
              to="/"
              className="text-start w-full flex items-center justify-between"
            >
              <div className="flex gap-x-2 items-center">
                <GrUser size={20} />
                <p className="text-lg">Профиль</p>
              </div>
              <IoIosArrowForward />
            </NavLink>
            <NavLink
              to="/organization-profile"
              className="text-start w-full flex items-center justify-between"
            >
              <div className="flex gap-x-2 items-center">
                <VscOrganization size={20} />
                <p className="text-lg">Организация</p>
              </div>
              <IoIosArrowForward />
            </NavLink>
            <ConfirmationWrapper
              title="Вы точно хотите выйти?"
              onConfirm={handleLogout}
            >
              <button className="bg-main-dull-blue rounded-lg py-3 w-full text-white flex gap-x-2 items-center justify-center">
                <MdLogout size={20} color="white" />
                <p className="text-xl">Выйти</p>
              </button>
            </ConfirmationWrapper>
          </div>
        </aside>

        <main className="h-screen w-full right-0 px-5 flex justify-center">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
