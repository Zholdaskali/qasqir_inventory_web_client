import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

import { API_GET_USERS } from "../api/API";
import { saveUserList } from "../store/slices/userListSlice";

import avatar from "../assets/placeholders/avatar.png";
import filterIcon from "../assets/icons/filter.svg";
import { IoIosNotificationsOutline } from "react-icons/io";
import { HiRefresh } from "react-icons/hi"; // Импорт иконки обновления
import CreateInviteModal from "../components/super-admin-components/log-components/CreateInviteModal";
import UserProfileModal from "../components/modal-components/main-modal/UserProfileModal";

const UsersList = () => {
    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();
    const users = useSelector((state) => state.userList);
    const user = useSelector((state) => state.user);

    const [userModal, setUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [createInviteModal, setCreateInviteModal] = useState(false);
    const [isInviteButtonDisabled, setIsInviteButtonDisabled] = useState(false);

    const fetchUserList = async () => {
        try {
            const response = await axios.get(API_GET_USERS, {
                headers: { "Auth-token": authToken },
            });
            console.log(response)
            dispatch(saveUserList(response.data.body));
            toast.success("Успешно");
        } catch (error) {
            toast.error("Ошибка загрузки пользователей");
        }
    };

    useEffect(() => {
        fetchUserList();
    }, []);

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

// ... existing code ...
    return (
        <div className="h-screen w-full flex flex-col overflow-y-auto p-4">
            <div className="flex flex-col md:flex-row w-full items-start md:items-center justify-between border-b py-5 gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl">Пользователи</h1>
                    <button
                        onClick={fetchUserList}
                        className="flex items-center justify-center p-2 rounded-full hover:bg-gray-300"
                        title="Обновить"
                    >
                        <HiRefresh className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
                <div className="flex flex-col md:flex-row items-center w-full md:w-2/5 gap-4">
                    <input
                        type="search"
                        className="shadow-inner w-full px-6 py-2 rounded-lg border"
                        placeholder="Поиск"
                    />
                    <div className="flex items-center gap-4">
                        <img
                            src={filterIcon}
                            alt="filter"
                            className="w-10 h-10 rounded-xl p-2 bg-main-dull-blue"
                        />
                        <div className="w-0.5 bg-main-dull-gray h-8 bg-opacity-65"></div>
                        <IoIosNotificationsOutline size={50} />
                    </div>
                </div>
            </div>
    
            {/* Таблица */}
            <div className="flex-1 overflow-hidden mt-4">
                <div className="h-full overflow-auto rounded-xl">
                    <table className="table-auto w-full border-separate border-spacing-y-4">
                        <thead className="text-[#A49E9E] bg-[#FFFFFF] bg-opacity-50 sticky top-0 z-10">
                            <tr className="h-14">
                                <th></th>
                                <th className="text-start whitespace-nowrap px-4">ID пользователя</th>
                                <th className="text-start whitespace-nowrap px-4">Имя пользователя</th>
                                <th className="text-start whitespace-nowrap px-4">Email пользователя</th>
                                <th className="text-start whitespace-nowrap px-4">Номер телефона</th>
                                <th className="text-start whitespace-nowrap px-4">Подтверждения email</th>
                                <th className="text-start whitespace-nowrap px-4">Дата регистрации</th>
                                <th className="text-start whitespace-nowrap px-4">Роль</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {users.map((users) => (
                                <tr
                                    key={users.userId}
                                    className={`${users.email === user.email
                                        ? "bg-[#E3F3E9] hover:bg-[#11b0666e]"
                                        : "bg-white hover:bg-gray-50"
                                        } border-b transition cursor-pointer`}
                                    onClick={() => handleUserModal(users)}
                                >
                                    <td className="p-5">
                                        <img
                                            className="rounded-full w-10 h-10"
                                            src={users.imagePath || avatar}
                                            alt=""
                                        />
                                    </td>
                                    <td className="py-4 px-4">{users.userId}</td>
                                    <td className="py-4 px-4">{users.userName}</td>
                                    <td className="py-4 px-4">{users.email}</td>
                                    <td className="py-4 px-4">{users.userNumber}</td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center justify-start">
                                            <div
                                                className={`${users.emailVerified
                                                    ? "bg-[#E3F3E9]"
                                                    : "bg-[#FFF2EA]"
                                                    } flex items-center px-2 rounded-full`}
                                            >
                                                <div
                                                    className={`${users.emailVerified
                                                        ? "bg-[#11B066]"
                                                        : "bg-[#E84D43]"
                                                        } h-3 w-3 rounded-full`}
                                                ></div>
                                                <p
                                                    className={`${users.emailVerified
                                                        ? "text-[#11B066]"
                                                        : "text-[#E84D43]"
                                                        } px-2 py-1`}
                                                >
                                                    {users.emailVerified ? "Подтверждено" : "Не подтверждено"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">{users.registrationDate}</td>
                                    <td className="py-4 px-4">{users.userRoles.join(", ")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
                        
            {/* Кнопка добавления */}
            <button
                className={`bg-main-dull-blue fixed bottom-12 right-12 w-12 h-12 rounded-full shadow-xl font-bold text-white ${
                    isInviteButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
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
