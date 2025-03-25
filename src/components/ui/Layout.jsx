import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// Icons
import { FaUsers, FaWarehouse, FaBars, FaTimes, FaTable } from "react-icons/fa"; // Добавили FaTable
import { MdLogout } from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";
import { VscOrganization } from "react-icons/vsc";
import { GrUser } from "react-icons/gr";
import { ImCart, ImBook, ImTab } from "react-icons/im"; // Убрали ImStatsBars
import { IoSettings, IoBarChartSharp } from "react-icons/io5";
import { HiTicket } from "react-icons/hi2";

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
    const [operationLogsList, setOperationLogsList] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            setSidebarOpen(!mobile);
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
            {/* Кнопка переключения для мобильных */}
            <button
                className="fixed top-2 left-2 z-50 text-2xl text-black md:hidden p-1"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>

            {/* Боковая панель */}
            <aside
                className={`bg-white min-w-[200px] h-full p-3 text-black flex flex-col justify-between transition-transform transform ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } md:translate-x-0 md:relative fixed top-0 left-0 z-40 shadow-lg`}
            >
                <div className="flex flex-col gap-4">
                    <img src="/logo.svg" alt="Logo" className="w-20 h-20" />
                    <h1 className="text-main-dull-blue font-medium text-base">QASQIR INVENTORY</h1>

                    <NavLink to="/dashboard" className="flex items-center gap-2 text-sm">
                        <IoBarChartSharp size={24} /> <p>Аналитика</p>
                    </NavLink>

                    {hasRole("admin") && (
                        <>
                            <NavLink to="/log-tabs" className="flex items-center gap-2 text-sm">
                                <ImBook size={24} /> <p>Аудит</p>
                            </NavLink>
                            <NavLink to="/user-tabs" className="flex items-center gap-2 text-sm">
                                <FaUsers size={24} /> <p>Пользователи</p>
                            </NavLink>
                            <NavLink to="/ticket-tabs" className="flex items-center gap-2 text-sm">
                                <HiTicket size={27} /> <p>Заявки</p>
                            </NavLink>
                        </>
                    )}

                    {hasRole("employee") && (
                        <>
                            <NavLink to="/warehouse-list" className="flex items-center gap-2 text-sm">
                                <FaWarehouse size={24} /> <p>Склады</p>
                            </NavLink>

                            <NavLink to="/warehouse-tabs" className="flex items-center gap-2 text-sm">
                                <ImTab size={24} /> <p>Операции</p>
                            </NavLink>
                            <button
                                onClick={() => setOperationLogsList(!operationLogsList)}
                                className="flex items-center justify-between w-full text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <FaTable size={24} /> <p>Отчетность</p> {/* Заменили на FaTable */}
                                </div>
                                <IoIosArrowForward className={operationLogsList ? "rotate-90" : ""} />
                            </button>
                            {operationLogsList && (
                                <div className="flex flex-col pl-4 gap-1 text-sm">
                                    <NavLink to="/transaction-list">Транзакции</NavLink>
                                    <NavLink to="/inventory-item-list">Товары</NavLink>
                                </div>
                            )}
                            <button
                                onClick={() => setInventoryLogsList(!inventoryLogsList)}
                                className="flex items-center justify-between w-full text-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <IoSettings size={24} /> <p>Настройки</p>
                                </div>
                                <IoIosArrowForward className={inventoryLogsList ? "rotate-90" : ""} />
                            </button>
                            {inventoryLogsList && (
                                <div className="flex flex-col pl-4 gap-1 text-sm">
                                    <NavLink to="/category-list">Складской каталог</NavLink>
                                    <NavLink to="/supplier-list">Поставщики</NavLink>
                                    <NavLink to="/customer-list">Заказчики</NavLink>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <NavLink to="/" className="flex items-center gap-2 text-sm">
                        <GrUser size={16} /> <p>Профиль</p>
                    </NavLink>
                    <NavLink to="/organization-profile" className="flex items-center gap-2 text-sm">
                        <VscOrganization size={16} /> <p>Организация</p>
                    </NavLink>
                    <ConfirmationWrapper title="Вы точно хотите выйти?" onConfirm={handleLogout}>
                        <button className="bg-main-dull-blue py-1 px-3 rounded-lg text-white flex items-center justify-center gap-2 text-sm">
                            <MdLogout size={16} /> <p>Выйти</p>
                        </button>
                    </ConfirmationWrapper>
                </div>
            </aside>

            {/* Основной контент */}
            <main className="flex-1 p-4 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;