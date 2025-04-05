/* eslint-disable react/prop-types */

import { useMemo, useState } from "react";
import avatar from "../../../assets/placeholders/avatar.png";
import { IoMdClose } from "react-icons/io";
import axios from "axios";
import { useSelector } from "react-redux";
import { API_SUPER_ADMIN_DELETE_USER } from "../../../api/API";
import RoleSelectionModal from "./RoleSelectionModal";
import userIcon from "../../../assets/icons/user.svg";
import ConfirmationWrapper from "../../ui/ConfirmationWrapper";

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
            const url = API_SUPER_ADMIN_DELETE_USER.replace("{userId}", selectedUser.userId);
            const response = await axios.delete(
                url,
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
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-main-dull-blue/10">
                            <img src={userIcon} alt="User Icon" className="w-6 h-6" />
                        </div>
                        <h1 className="text-xl font-semibold text-main-dull-blue">
                            Настройки пользователя
                        </h1>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <IoMdClose className="text-gray-500" size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Avatar Section */}
                        <div className="flex flex-col items-center md:items-start gap-4">
                            <div className="relative">
                                <img
                                    src={selectedUser.imagePath ? selectedUser.imagePath : avatar}
                                    alt="User Avatar"
                                    className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
                                />
                                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white px-3 py-1 rounded-full shadow-sm text-xs font-medium text-main-dull-blue border border-gray-100">
                                    {userRole}
                                </div>
                            </div>
                            <div className="text-center md:text-left text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
                                <p>Дата регистрации:</p>
                                <p className="font-medium text-gray-700">
                                    {selectedUser.registrationDate || "Не указано"}
                                </p>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Имя пользователя</p>
                                    <p className="text-lg font-medium mt-1">
                                        {selectedUser.userName || "Не указано"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Почта</p>
                                        <p className="font-medium mt-1">
                                            {selectedUser.email || "Не указано"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Номер</p>
                                        <p className="font-medium mt-1">
                                            {selectedUser.userNumber || "Не указано"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-500">Роли</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {Array.isArray(selectedUser.userRoles) ? (
                                            selectedUser.userRoles.map((role, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-main-dull-blue/10 text-main-dull-blue"
                                                >
                                                    {role}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-500">Нет ролей</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap justify-end gap-3 pt-4">
                                {selectedUser.email !== user.email && (
                                    <button
                                        className="px-6 py-2 bg-main-dull-blue text-white rounded-lg hover:bg-main-purp-dark transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-main-dull-blue/50"
                                        onClick={() => setShowRoleModal(true)}
                                    >
                                        Изменить роль
                                    </button>
                                )}

                                {!isSuperAdmin && (
                                    <ConfirmationWrapper
                                        title="Все данные пользователя будут удалены!"
                                        onConfirm={handleDeleteUser}
                                    >
                                        <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50">
                                            Удалить
                                        </button>
                                    </ConfirmationWrapper>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Role Selection Modal */}
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