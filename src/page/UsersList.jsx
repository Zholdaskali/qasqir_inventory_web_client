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

    return (
        <div className="w-full h-full px-5 py-5 rounded-xl">
            <div className="flex flex-col gap-y-5 overflow-auto">
                <div className="flex w-full items-center justify-between border-b py-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl w-full">Пользователи</h1>
                        <button
                            onClick={fetchUserList}
                            className="flex items-center justify-center p-2 rounded-full hover:bg-gray-300"
                            title="Обновить"
                        >
                            <HiRefresh className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                    <div className="flex items-center w-2/5 gap-x-5">
                        <input
                            type="search"
                            className="shadow-inner w-full px-6 py-2 rounded-lg border"
                            placeholder="Поиск"
                        />
                        <img
                            src={filterIcon}
                            alt="filter"
                            className="w-10 h-10 rounded-xl p-2 bg-main-dull-blue"
                        />
                        <div className="w-0.5 bg-main-dull-gray h-8 bg-opacity-65"></div>
                        <IoIosNotificationsOutline size={50} />
                    </div>
                </div>
                {/* Table */}
                <table className="table-auto w-full border-separate border-spacing-y-4">
                    <thead className="text-[#A49E9E] bg-[#FFFFFF] bg-opacity-50 h-14 w-full">
                        <tr className="text-sm">
                            <th></th>
                            <th className="text-start">ID пользователя</th>
                            <th className="text-start">Имя пользователя</th>
                            <th className="text-start">Email пользователя</th>
                            <th className="text-start">Номер телефона</th>
                            <th className="text-start">Подтверждения email</th>
                            <th className="text-start">Дата регистрации</th>
                            <th className="text-start">Роль</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((users) => (
                            <tr
                                key={users.userId}
                                className={`${users.email === user.email
                                    ? "bg-[#E3F3E9] hover:bg-[#11b0666e]"
                                    : "bg-white hover:bg-gray-50"
                                    } border-b border-full transition cursor-pointer`}
                                onClick={() => handleUserModal(users)}
                            >
                                <td className="p-5">
                                    <img
                                        className="rounded-full w-10 h-10"
                                        src={users.imagePath || avatar}
                                        alt=""
                                    />
                                </td>
                                <td className="py-4 px-2">{users.userId}</td>
                                <td className="py-4 px-2">{users.userName}</td>
                                <td className="py-4 px-2">{users.email}</td>
                                <td className="py-4 px-2">{users.userNumber}</td>
                                <td className="py-4 px-2">
                                    <div className="flex items-center justify-start text-center text-white">
                                        <div
                                            className={`${users.emailVerified
                                                ? "bg-[#E3F3E9]"
                                                : "bg-[#FFF2EA]"
                                                } text-center flex items-center justify-center px-2 rounded-full`}
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
                                                    } px-2 py-1 rounded`}
                                            >
                                                {`${users.emailVerified ? "Подтверждено" : "Не подтверждено"}`}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-2">{users.registrationDate}</td>
                                <td className="py-4 px-2">{users.userRoles.join(", ")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Button */}
                <button
                    className={`bg-main-dull-blue absolute bottom-12 w-12 h-12 self-end rounded-full shadow-xl font-bold text-white ${isInviteButtonDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                        }`}
                    onClick={handleCreateInviteModal}
                    disabled={isInviteButtonDisabled}
                >
                    +
                </button>
            </div>
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
