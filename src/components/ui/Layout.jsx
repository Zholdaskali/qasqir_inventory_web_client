/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { Outlet, Link, NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Cookies from "js-cookie";

// icons 
import { BsJournalText } from "react-icons/bs";
import { FaUsers } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { IoIosArrowForward } from "react-icons/io";
import { VscOrganization } from "react-icons/vsc";
import { GrUser } from "react-icons/gr";
import { TbMessage2Search } from "react-icons/tb";
import { toast } from "react-toastify";
import { FaWarehouse } from 'react-icons/fa';
// icons 

import { clearUser } from "../../store/slices/userSlice";

// img
import avatar from '../../assets/placeholders/avatar.png'
// img

import { useState } from "react";
import axios from "axios";
import { API_SIGN_OUT } from "../../api/API";
import { clearActionLogs } from "../../store/slices/logSlices/actionLogSlice";
import { clearExceptionLogs } from "../../store/slices/logSlices/exceptionSlice";
import { clearLogInLogs } from "../../store/slices/logSlices/logInSlice";
import { clearUserList } from "../../store/slices/userListSlice";
import Notification from "../notification/Notification";
import ConfirmationWrapper from "./ConfirmationWrapper";

const Layout = ({ setIsAuthenticated }) => {

    const user = useSelector((state) => state.user)
    const authToken = useSelector((state) => state.token.token)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const reduxAuthToken = useSelector((state) => state.token.token)

    const [logsList, setLogsList] = useState(false)

    const handleLogsList = () => {
        setLogsList((prev) => !prev)
    }

    const handleClear = () => {
        dispatch(clearUser());
        dispatch(clearActionLogs());
        dispatch(clearExceptionLogs());
        dispatch(clearLogInLogs());
        dispatch(clearUserList());
    };

    const handleLogout = async () => {
        try {
            // Удаляем токен из cookies
            Cookies.remove("authToken");

            // Удаляем сессии на сервере
            await axios.post(
                API_SIGN_OUT,
                {},
                {
                    headers: { "Auth-token": reduxAuthToken },
                }
            );

            // Очищаем Redux-хранилище
            handleClear();

            // Обновляем состояние аутентификации
            setIsAuthenticated(false);

            // Перенаправляем на страницу входа
            navigate("/sign-in");

            // Сообщение об успешном выходе
            toast.success("Вы успешно вышли из системы");
        } catch (error) {
            console.error("Ошибка при выходе из системы:", error);
            toast.error("Ошибка при выходе");
        }
    };



    const hasRole = (role) => user?.userRoles?.includes(role)

    return (
        <div className="flex flex-col items-center">
            <div className="w-full flex z-10">
                <aside
                    className='bg-white top-0 w-[10%] h-screen py-1 px-1 text-black flex flex-col items-center justify-between z-40'
                >
                    <div
                        className="flex flex-col w-full px-4 gap-y-14 mt-4 text-start"
                    >
                        <div className="flex flex-col gap-y-5">
                            <img src="/logo.svg" alt="" className="w-24 h-24" />
                            <h1 className=" text-main-dull-blue font-medium  text-lg">QASQIR INVENTORY</h1>
                        </div>
                        <div className="flex flex-col w-full items-start gap-y-5 text-sm">
                            {hasRole("admin") && (
                                <div className="flex flex-col w-full items-start gap-y-5 text-sm">
                                    <button onClick={handleLogsList} className="flex justify-between items-center w-full">
                                        <div className="flex items-center gap-x-3 ">
                                            <BsJournalText size={30} />
                                            <p>Аудит</p>
                                        </div>
                                        <IoIosArrowForward size={15} className={`${logsList ? 'rotate-90' : ''}  transition-transform`} />
                                    </button>
                                    {
                                        logsList &&
                                        <div className="flex flex-col gap-y-2 w-3/4 px-2 text-main-dull-gray self-center">
                                            <NavLink to='logs/action-logs'>Действия</NavLink>
                                            <NavLink to='logs/exception-logs'>Ошибки</NavLink>
                                            <NavLink to='logs/login-logs'>Входы</NavLink>
                                        </div>
                                    }
                                    <NavLink to="/users-list" className="flex items-center justify-between gap-x-3 w-full">
                                        <div className="flex items-center  gap-x-3">
                                            <FaUsers size={30} />
                                            <p>Пользователи</p>
                                        </div>
                                        <IoIosArrowForward size={15} />
                                    </NavLink>
                                    <NavLink to="/invite-list" className="flex items-center justify-between gap-x-3 w-full">
                                        <div className="flex items-center  gap-x-3">
                                            <TbMessage2Search size={30} />
                                            <p>Приглашения</p>
                                        </div>
                                        <IoIosArrowForward size={15} />
                                    </NavLink>
                                </div>
                            )}
                            {hasRole("warehouse_manager") && (
                                <>
                                <div className="flex flex-col w-full items-start gap-y-5 text-sm">  
                                    <NavLink to="/warehouse-list" className="flex items-center justify-between gap-x-3 w-full">
                                        <div className="flex items-center  gap-x-3">
                                            <FaWarehouse size={30} />
                                            <p>Склады</p>
                                        </div>
                                        <IoIosArrowForward size={15} />
                                    </NavLink>
                                </div>
                                </>
                            )}
                            {hasRole("employee") || hasRole("storekeeper") && (
                                <>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col w-full gap-y-2 px-4 items-center py-4">
                        {/* <img src={user.imagePath ? user.imagePath : avatar} alt="" className="w-20 h-20 rounded-full" /> */}
                        {/* <p>{user.userName}</p> */}
                        <div className=" flex flex-col gap-y-5 w-full self-start">
                            <NavLink to="/" className="text-start w-full flex items-center justify-between">
                                <div className="flex gap-x-2 items-center">
                                    <GrUser size={20} />
                                    <p className="text-lg">Профиль</p>
                                </div>
                                <IoIosArrowForward />
                            </NavLink>
                            <NavLink to="organization-profile" className="text-start w-full flex items-center justify-between">
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
                                <button
                                    className="bg-main-dull-blue rounded-lg py-3 w-full text-white flex gap-x-2 items-center justify-center "
                                >
                                    <MdLogout size={20} color="white" />
                                    <p className="text-xl">Выйти</p>
                                </button>
                            </ConfirmationWrapper>
                        </div>
                    </div>
                </aside>
                <main className="h-screen w-full right-0 px-5 flex justify-center">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default Layout;
