import React, { useEffect, useState } from "react";
import { IoIosNotificationsOutline } from "react-icons/io";

const WarehouseItemsList = ({ warehouse, isOpen, onClose }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            // Имитация загрузки данных пользователей
            fetchUsers();
        }
    }, [isOpen]);

    const fetchUsers = async () => {
        try {
            // Замените на реальный API-запрос
            const response = await fetch("/api/users");
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Ошибка загрузки пользователей:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserModal = (user) => {
        console.log("Пользователь выбран:", user); // Реализуйте модальное окно
    };

    const handleCreateInviteModal = () => {
        console.log("Открытие модального окна для приглашения"); // Реализуйте модальное окно
    };

    if (!isOpen) return null; // Компонент отображается только при isOpen === true

    return (
        <div className="w-full h-full px-5 py-5 rounded-xl">
            <div className="flex flex-col gap-y-5 overflow-auto">
                <div className="flex w-full items-center justify-between border-b py-10">
                    <h1 className="text-2xl w-full">Пользователи</h1>
                    <div className="flex items-center w-2/5 gap-x-5">
                        <input
                            type="search"
                            className="shadow-inner w-full px-6 py-2 rounded-lg border"
                            placeholder="Поиск"
                        />
                        <img
                            src="path/to/filter-icon.svg"
                            alt="filter"
                            className="w-10 h-10 rounded-xl p-2 bg-main-dull-blue"
                        />
                        <div className="w-0.5 bg-main-dull-gray h-8 bg-opacity-65"></div>
                        <IoIosNotificationsOutline size={50} />
                    </div>
                </div>
                {/* Таблица пользователей */}
                <table className="table-auto w-full border-separate border-spacing-y-4">
                    <thead className="text-[#A49E9E] bg-[#FFFFFF] bg-opacity-50 h-14 w-full">
                        <tr className="text-sm">
                            <th></th>
                            <th className="text-start">ID пользователя</th>
                            <th className="text-start">Имя пользователя</th>
                            <th className="text-start">Email пользователя</th>
                            <th className="text-start">Номер телефона</th>
                            <th className="text-start">Подтверждение email</th>
                            <th className="text-start">Дата регистрации</th>
                            <th className="text-start">Роль</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
                                    Загрузка пользователей...
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((user) => (
                                <tr
                                    key={user.userId}
                                    className={`${user.email === warehouse?.userEmail
                                        ? "bg-[#E3F3E9] hover:bg-[#11b0666e]"
                                        : "bg-white hover:bg-gray-50"
                                        } border-b transition cursor-pointer`}
                                    onClick={() => handleUserModal(user)}
                                >
                                    <td className="p-5">
                                        <img
                                            className="rounded-full w-10 h-10"
                                            src={user.imagePath || "/default-avatar.png"}
                                            alt={user.userName}
                                        />
                                    </td>
                                    <td className="py-4 px-2">{user.userId}</td>
                                    <td className="py-4 px-2">{user.userName}</td>
                                    <td className="py-4 px-2">{user.email}</td>
                                    <td className="py-4 px-2">{user.userNumber}</td>
                                    <td className="py-4 px-2">
                                        <div className="flex items-center justify-start text-center">
                                            <div
                                                className={`flex items-center px-2 rounded-full ${user.emailVerified
                                                    ? "bg-[#E3F3E9] text-[#11B066]"
                                                    : "bg-[#FFF2EA] text-[#E84D43]"
                                                    }`}
                                            >
                                                <div
                                                    className={`h-3 w-3 rounded-full mr-2 ${user.emailVerified
                                                        ? "bg-[#11B066]"
                                                        : "bg-[#E84D43]"
                                                        }`}
                                                ></div>
                                                {user.emailVerified ? "Подтверждено" : "Не подтверждено"}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-2">
                                        {new Date(user.registrationDate).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-2">
                                        {user.userRoles?.join(", ") || "Нет ролей"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
                                    Нет пользователей
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {/* Кнопка приглашения */}
                <button
                    className={`bg-main-dull-blue absolute bottom-12 w-12 h-12 self-end rounded-full shadow-xl font-bold text-white ${users.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    onClick={handleCreateInviteModal(warehouse)}
                    disabled={users.length === 0}
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default WarehouseItemsList;
