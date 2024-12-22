/* eslint-disable react/prop-types */

import { useMemo, useState } from "react";
import avatar from "../../assets/placeholders/avatar.png";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_SUPER_ADMIN_DELETE_USER } from "../../api/API";
import RoleSelectionModal from "./RoleSelectionModal";
import userIcon from "../../assets/icons/user.svg";
import ConfirmationWrapper from "../ui/ConfirmationWrapper";

const UserProfileModal = ({ selectedUser, onClose, fetchUserList }) => {
    const userRole = useMemo(() => {
        if (selectedUser.userRoles.includes("super_admin")) {
            return "Высший Админ";
        } else if (selectedUser.userRoles.includes("company_admin")) {
            return "Админ";
        } else {
            return "Работник";
        }
    }, [selectedUser.userRoles]);

    const user = useSelector((state) => state.user);

    const [showRoleModal, setShowRoleModal] = useState(false);

    const isSuperAdmin = useMemo(() => selectedUser.userRoles.includes("admin"), [
        selectedUser.userRoles,
    ]);

    const authToken = useSelector((state) => state.token.token);

    const handleDeleteUser = async () => {
        try {
            const response = await axios.delete(
                `${API_SUPER_ADMIN_DELETE_USER}${selectedUser.userId}`,
                {
                    headers: { "Auth-token": authToken },
                }
            );

            console.log(response.data.message);
            onClose(true);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Ошибка при удалении пользователя";
            console.log(errorMessage);
        }
    };

    return (
        <div className="flex absolute top-0 left-0 z-30 items-center justify-center w-full h-screen">
            <div className="bg-white rounded-xl z-20 py-16 px-12 shadow-md w-2/4">
                <div className="flex w-full justify-between mb-12">
                    <div className="w-full flex items-center gap-x-3">
                        <img src={userIcon} alt="" />
                        <h1 className="uppercase text-main-dull-blue font-medium">
                            Настройки пользователя
                        </h1>
                    </div>
                    <div className="self-end">
                        <IoMdClose onClick={onClose} className="cursor-pointer" color="#4A5C6A" size={40} />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-y-5">
                    <div className="flex flex-row w-full">
                        <div className="flex flex-col items-center gap-y-12 w-2/3">
                            <img
                                src={selectedUser.imagePath ? selectedUser.imagePath : avatar}
                                alt="User Avatar"
                                className="w-1/3"
                            />
                            <div className="flex w-1/2 uppercase text-xs justify-between">
                                <p>Дата регистрации</p>
                                <p>{selectedUser.registrationDate || "Не указано"}</p>
                            </div>
                        </div>
                        <div className="flex flex-col w-3/4 gap-y-5">
                            <div className="flex flex-col gap-y-7 font-medium">
                                <div className="space-y-1">
                                    <p>Имя пользователя:</p>
                                    <p>{selectedUser.userName || "Не указано"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p>Почта пользователя:</p>
                                    <p>{selectedUser.email || "Не указано"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p>Номер пользователя:</p>
                                    <p>{selectedUser.userNumber || "Не указано"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p>Роли пользователя:</p>
                                    <ul className="flex">
                                        {Array.isArray(selectedUser.userRoles)
                                            ? selectedUser.userRoles.map((role, index) => (
                                                <li key={index} className="bg-gray-100 rounded-md px-2 py-1">
                                                    {role}
                                                </li>
                                            ))
                                            : <li>{selectedUser.userRoles || "Нет ролей"}</li>}
                                    </ul>
                                </div>
                            </div>

                            <div className="flex gap-x-3 my-self-end">
                                {selectedUser.email !== user.email && (
                                    <button
                                        className="bg-main-dull-blue text-white px-10 py-3 rounded-xl hover:bg-main-purp-dark"
                                        onClick={() => setShowRoleModal(true)}
                                    >
                                        Изменить роль
                                    </button>
                                )}

                                {/* Используем ConfirmationWrapper для обработки подтверждения */}
                                {!isSuperAdmin && (
                                    <ConfirmationWrapper
                                        title="Все данные пользователя будут удалены !!!"
                                        onConfirm={handleDeleteUser}
                                    >
                                        <button className="bg-main-dull-blue text-white px-10 py-3 rounded-xl hover:bg-red-600">
                                            Удалить
                                        </button>
                                    </ConfirmationWrapper>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full h-screen absolute z-10 backdrop-blur-md" onClick={onClose}></div>
            {showRoleModal && (
                <RoleSelectionModal
                    selectedUser={selectedUser}
                    onClose={() => setShowRoleModal(false)}
                    fetchUserList={fetchUserList}
                />
            )}
        </div>
    );
};

export default UserProfileModal;
