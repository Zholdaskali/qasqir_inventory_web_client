import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { API_GET_USERS } from "../../../api/API";
import { saveUserList } from "../../../store/slices/userListSlice";
import avatar from "../../../assets/placeholders/avatar.png";
import CreateInviteModal from "../../../components/super-admin-components/log-components/CreateInviteModal";
import UserProfileModal from "../../../components/modal-components/main-modal/UserProfileModal";

const UsersList = () => {
    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();
    const users = useSelector((state) => state.userList || []); // Добавляем значение по умолчанию
    const currentUser = useSelector((state) => state.user);

    const [userModal, setUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [createInviteModal, setCreateInviteModal] = useState(false);
    const [isInviteButtonDisabled, setIsInviteButtonDisabled] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchUserList = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(API_GET_USERS, { 
                headers: { "Auth-token": authToken } 
            });
            dispatch(saveUserList(response.data.body));
        } catch (error) {
            toast.error("Ошибка загрузки пользователей");
            console.error("Error fetching users:", error);
        } finally {
            setIsLoading(false);
        }
    }, [authToken, dispatch]);

    useEffect(() => {
        if (authToken && (!users || users.length === 0)) {
            fetchUserList(); // Запрос только если данных нет
        }
    }, [authToken, users, fetchUserList]);

    const handleUserModal = (user) => {
        setSelectedUser(user);
        setUserModal(true);
    };

    const handleCreateInviteModal = () => {
        setCreateInviteModal(true);
    };

    const handleModalClose = (isDeleted) => {
        if (isDeleted) fetchUserList();
        setUserModal(false);
    };

    const handleInviteModalClose = () => {
        setCreateInviteModal(false);
        fetchUserList();
    };

    const filteredUsers = useMemo(() => {
        return users.filter((userItem) => {
            const query = searchQuery.toLowerCase();
            return (
                userItem.userName.toLowerCase().includes(query) ||
                userItem.email.toLowerCase().includes(query) ||
                (userItem.userNumber && userItem.userNumber.toLowerCase().includes(query))
            );
        });
    }, [users, searchQuery]);

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
            userItem.userId,
            userItem.userName,
            userItem.email,
            userItem.userNumber || "",
            userItem.emailVerified ? "ПОДТВЕРЖДЕН" : "НЕ ПОДТВЕРЖДЕН",
            userItem.registrationDate,
            userItem.userRoles.join(", "),
        ]);

        let csvContent = headers.join(",") + "\n";
        rows.forEach(row => {
            csvContent += row.map(item => `"${item}"`).join(",") + "\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `users_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("Список пользователей экспортирован в CSV");
    };

    return (
        <div className="min-h-screen w-full flex flex-col overflow-y-auto p-3 bg-gray-50">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b py-3 gap-2">
                <h1 className="text-xl font-semibold">Пользователи</h1>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Поиск по имени, email или телефону..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                    />
                    <button
                        onClick={exportToCSV}
                        disabled={!filteredUsers.length}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        Экспорт в CSV
                    </button>
                </div>
            </div>

            <div className="flex-1 mt-3 overflow-x-auto rounded-xl bg-white shadow-sm">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <table className="table-auto w-full border-collapse">
                        <thead className="text-gray-500 bg-gray-50 sticky top-0 z-10">
                            <tr className="h-10">
                                <th className="px-2 w-12"></th>
                                <th className="text-start px-2 whitespace-nowrap">ID</th>
                                <th className="text-start px-2 whitespace-nowrap">Имя</th>
                                <th className="text-start px-2 whitespace-nowrap">Email</th>
                                <th className="text-start px-2 whitespace-nowrap">Телефон</th>
                                <th className="text-start px-2 whitespace-nowrap">Статус Email</th>
                                <th className="text-start px-2 whitespace-nowrap">Регистрация</th>
                                <th className="text-start px-2 whitespace-nowrap">Роли</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((userItem) => (
                                    <tr
                                        key={userItem.userId}
                                        className={`${
                                            userItem.email === currentUser.email
                                                ? "bg-[#E3F3E9] hover:bg-[#11b0666e]"
                                                : "bg-white hover:bg-gray-50"
                                        } border-t transition cursor-pointer`}
                                        onClick={() => handleUserModal(userItem)}
                                    >
                                        <td className="p-2">
                                            <img
                                                className="rounded-full w-8 h-8 object-cover"
                                                src={userItem.imagePath || avatar}
                                                alt={userItem.userName}
                                                onError={(e) => {
                                                    e.target.src = avatar;
                                                }}
                                            />
                                        </td>
                                        <td className="py-2 px-2 text-sm">{userItem.userId}</td>
                                        <td className="py-2 px-2 text-sm">{userItem.userName}</td>
                                        <td className="py-2 px-2 text-sm">{userItem.email}</td>
                                        <td className="py-2 px-2 text-sm">{userItem.userNumber || "-"}</td>
                                        <td className="py-2 px-2">
                                            <div
                                                className={`${
                                                    userItem.emailVerified ? "bg-[#E3F3E9]" : "bg-[#FFF2EA]"
                                                } inline-flex items-center px-2 py-1 rounded-full text-xs`}
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
                                        <td className="py-2 px-2 text-sm">
                                            {userItem.userRoles?.join(", ") || "-"}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="text-center py-4">
                                        {searchQuery ? "Пользователи не найдены" : "Нет доступных пользователей"}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <button
                className={`fixed bottom-6 right-6 w-12 h-12 bg-main-dull-blue rounded-full shadow-lg text-white text-xl flex items-center justify-center ${
                    isInviteButtonDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                } transition-all`}
                onClick={handleCreateInviteModal}
                disabled={isInviteButtonDisabled}
                aria-label="Добавить пользователя"
            >
                +
            </button>

            {createInviteModal && (
                <CreateInviteModal
                    authToken={authToken}
                    onClose={handleInviteModalClose}
                    setIsInviteButtonDisabled={setIsInviteButtonDisabled}
                />
            )}

            {userModal && selectedUser && (
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