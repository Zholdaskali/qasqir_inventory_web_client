import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { API_GET_USERS } from "../../../api/API";
import { saveUserList } from "../../../store/slices/userListSlice";
import avatar from "../../../assets/placeholders/avatar.png";
import filterIcon from "../../../assets/icons/filter.svg";
import { IoIosNotificationsOutline } from "react-icons/io";
import CreateInviteModal from "../../../components/super-admin-components/log-components/CreateInviteModal";
import UserProfileModal from "../../../components/modal-components/main-modal/UserProfileModal";

const UsersList = () => {
    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();
    const users = useSelector((state) => state.userList);
    const user = useSelector((state) => state.user);

    const [userModal, setUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [createInviteModal, setCreateInviteModal] = useState(false);
    const [isInviteButtonDisabled, setIsInviteButtonDisabled] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); // Состояние для поискового запроса

    // Функция для загрузки списка пользователей
    const fetchUserList = async () => {
        try {
            const response = await axios.get(API_GET_USERS, { headers: { "Auth-token": authToken } });
            dispatch(saveUserList(response.data.body));
            toast.success("Успешно");
        } catch (error) {
            toast.error("Ошибка загрузки пользователей");
        }
    };

    useEffect(() => {
        fetchUserList();
    }, []);

    // Функция для открытия модального окна с информацией о пользователе
    const handleUserModal = (user) => {
        setSelectedUser(user);
        setUserModal(true);
    };

    // Функция для открытия модального окна создания приглашения
    const handleCreateInviteModal = () => {
        setCreateInviteModal(true);
    };

    // Функция для закрытия модального окна
    const handleModalClose = (isDeleted) => {
        if (isDeleted) fetchUserList();
        setUserModal(false);
    };

    // Функция для закрытия модального окна создания приглашения
    const handleInviteModalClose = () => {
        setCreateInviteModal(false);
        fetchUserList();
    };

    // Фильтрация пользователей по поисковому запросу
    const filteredUsers = users.filter((userItem) =>
        userItem.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userItem.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        userItem.userNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Функция для экспорта пользователей в CSV
    const exportToCSV = () => {
        if (!filteredUsers.length) {
            toast.error("Нет данных для экспорта");
            return;
        }

        const headers = [
            "ID",
            "Имя",
            "Email",
            "Телефон",
            "Email подтвержден",
            "Дата регистрации",
            "Роли",
        ];

        const rows = filteredUsers.map((userItem) => [
            `"${userItem.userId}"`,
            `"${userItem.userName}"`,
            `"${userItem.email}"`,
            `"${userItem.userNumber}"`,
            `"${userItem.emailVerified ? "ПОДТВЕРЖДЕН" : "НЕ ПОДТВЕРЖДЕН"}"`,
            `"${userItem.registrationDate}"`,
            `"${userItem.userRoles.join(", ")}"`,
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(row => row.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "users_list.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Список пользователей экспортирован в CSV");
    };

    return (
        <div className="min-h-screen w-full flex flex-col overflow-y-auto p-3 bg-gray-50">
            {/* Шапка */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b py-3 gap-2">
                <h1 className="text-xl font-semibold">Пользователи</h1>
                <div className="flex items-center gap-2">
                    {/* Поле для поиска */}
                    <input
                        type="text"
                        placeholder="Поиск пользователей..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {/* Кнопка экспорта */}
                    <button
                        onClick={exportToCSV}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                        Экспорт в CSV
                    </button>
                </div>
            </div>

            {/* Таблица */}
            <div className="flex-1 mt-3 overflow-x-auto rounded-xl bg-white shadow-sm">
                <table className="table-auto w-full border-collapse">
                    <thead className="text-gray-500 bg-gray-50 sticky top-0 z-10">
                        <tr className="h-10">
                            <th className="px-2 w-12"></th>
                            <th className="text-start px-2 whitespace-nowrap">ID</th>
                            <th className="text-start px-2 whitespace-nowrap">Имя</th>
                            <th className="text-start px-2 whitespace-nowrap">Email</th>
                            <th className="text-start px-2 whitespace-nowrap">Телефон</th>
                            <th className="text-start px-2 whitespace-nowrap">Email подтвержден</th>
                            <th className="text-start px-2 whitespace-nowrap">Регистрация</th>
                            <th className="text-start px-2 whitespace-nowrap">Роль</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((userItem) => (
                                <tr
                                    key={userItem.userId}
                                    className={`${
                                        userItem.email === user.email
                                            ? "bg-[#E3F3E9] hover:bg-[#11b0666e]"
                                            : "bg-white hover:bg-gray-50"
                                    } border-t transition cursor-pointer`}
                                    onClick={() => handleUserModal(userItem)}
                                >
                                    <td className="p-2">
                                        <img
                                            className="rounded-full w-8 h-8"
                                            src={userItem.imagePath || avatar}
                                            alt=""
                                        />
                                    </td>
                                    <td className="py-2 px-2 text-sm">{userItem.userId}</td>
                                    <td className="py-2 px-2 text-sm">{userItem.userName}</td>
                                    <td className="py-2 px-2 text-sm">{userItem.email}</td>
                                    <td className="py-2 px-2 text-sm">{userItem.userNumber}</td>
                                    <td className="py-2 px-2">
                                        <div
                                            className={`${
                                                userItem.emailVerified ? "bg-[#E3F3E9]" : "bg-[#FFF2EA]"
                                            } inline-flex items-center px-1 rounded-full text-xs`}
                                        >
                                            <div
                                                className={`${
                                                    userItem.emailVerified ? "bg-[#11B066]" : "bg-[#E84D43]"
                                                } h-2 w-2 rounded-full mr-1`}
                                            />
                                            <span
                                                className={`${
                                                    userItem.emailVerified ? "text-[#11B066]" : "text-[#E84D43]"
                                                }`}
                                            >
                                                {userItem.emailVerified ? "ПОДТВЕРЖДЕН" : "НЕ ПОДТВЕРЖДЕН"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-2 px-2 text-sm">{userItem.registrationDate}</td>
                                    <td className="py-2 px-2 text-sm">{userItem.userRoles.join(", ")}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
                                    Пользователи не найдены
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Кнопка добавления */}
            <button
                className={`fixed bottom-6 right-6 w-10 h-10 bg-main-dull-blue rounded-full shadow-lg text-white text-xl flex items-center justify-center ${
                    isInviteButtonDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                }`}
                onClick={handleCreateInviteModal}
                disabled={isInviteButtonDisabled}
            >
                +
            </button>

            {createInviteModal && (
                <CreateInviteModal
                    authToken={authToken}
                    setCreateInviteModal={setCreateInviteModal}
                    setIsInviteButtonDisabled={setIsInviteButtonDisabled}
                    onClose={handleInviteModalClose}
                />
            )}

            {userModal && (
                <UserProfileModal
                    selectedUser={selectedUser}
                    onClose={handleModalClose}
                    fetchUserList={fetchUserList}
                />
            )}
        </div>
    );
};

export default UsersList;