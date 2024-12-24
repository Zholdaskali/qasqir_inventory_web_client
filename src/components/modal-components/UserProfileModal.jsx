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
            <div className="bg-white rounded-xl z-20 py-16 px-12 shadow-md w-full sm:w-3/4 lg:w-2/4 xl:w-1/3">
                <div className="flex w-full justify-between mb-8">
                    <div className="w-full flex items-center gap-x-3">
                        <img src={userIcon} alt="User Icon" className="w-8 h-8" />
                        <h1 className="uppercase text-main-dull-blue font-medium text-xl">
                            Настройки пользователя
                        </h1>
                    </div>
                    <div className="self-end">
                        <IoMdClose
                            onClick={onClose}
                            className="cursor-pointer text-gray-600"
                            size={30}
                        />
                    </div>
                </div>
                <div className="flex flex-col items-center gap-y-6">
                    <div className="flex flex-col sm:flex-row w-full gap-6 sm:gap-12">
                        <div className="flex flex-col items-center gap-y-4 sm:w-1/3">
                            <img
                                src={selectedUser.imagePath ? selectedUser.imagePath : avatar}
                                alt="User Avatar"
                                className="w-24 h-24 rounded-full border-2 border-gray-300"
                            />
                            <div className="w-full text-center text-xs text-gray-600">
                                <p>Дата регистрации:</p>
                                <p>{selectedUser.registrationDate || "Не указано"}</p>
                            </div>
                        </div>
                        <div className="flex flex-col w-full sm:w-2/3 gap-y-6">
                            <div className="flex flex-col gap-y-4 font-medium">
                                <div className="space-y-1">
                                    <p className="text-gray-600">Имя пользователя:</p>
                                    <p>{selectedUser.userName || "Не указано"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-600">Почта пользователя:</p>
                                    <p>{selectedUser.email || "Не указано"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-600">Номер пользователя:</p>
                                    <p>{selectedUser.userNumber || "Не указано"}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-gray-600">Роли пользователя:</p>
                                    <ul className="flex flex-wrap gap-2">
                                        {Array.isArray(selectedUser.userRoles)
                                            ? selectedUser.userRoles.map((role, index) => (
                                                  <li
                                                      key={index}
                                                      className="bg-gray-100 rounded-md px-3 py-1 text-sm text-gray-700"
                                                  >
                                                      {role}
                                                  </li>
                                              ))
                                            : <li className="text-gray-600">Нет ролей</li>}
                                    </ul>
                                </div>
                            </div>

                            <div className="flex gap-x-4 justify-end mt-8">
                                {selectedUser.email !== user.email && (
                                    <button
                                        className="bg-main-dull-blue text-white px-8 py-3 rounded-lg hover:bg-main-purp-dark transition-all duration-200"
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
                                        <button className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-all duration-200">
                                            Удалить
                                        </button>
                                    </ConfirmationWrapper>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                className="w-full h-screen absolute z-10 bg-black opacity-30 backdrop-blur-md"
                onClick={onClose}
            ></div>
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
