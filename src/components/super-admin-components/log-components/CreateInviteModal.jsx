import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

import { API_CREATE_INVITE } from "../../../api/API";
import Notification from "../../notification/Notification";
import InviteRoleSelectionModal from "../../modal-components/InviteRoleSelectionModal";

const CreateInviteModal = ({ authToken, setCreateInviteModal }) => {

    const rolesList = [
        { id: 1, name: "Админ" },
        { id: 2, name: "Кладовщик" },
        { id: 3, name: "Продавец" },
        { id: 4, name: "Сотрудник" },
    ];

    const [inviteUserFirstName, setInviteFirstName] = useState("");
    const [inviteUserLastName, setInviteLastName] = useState("");
    const [invitePassword, setInvitePassword] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteUserNumber, setInviteUserNumber] = useState("");
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    const inviteUserName = `${inviteUserFirstName} ${inviteUserLastName}`;

    const createInvite = async (e) => {
        e.preventDefault();

        if (!inviteUserName.trim() || !inviteEmail.trim() || !invitePassword.trim() || selectedRoles.length === 0) {
            toast.error("Заполните все поля и выберите роли");
            return;
        }

        try {
            const response = await axios.post(
                API_CREATE_INVITE,
                {
                    userName: inviteUserName,
                    password: invitePassword,
                    email: inviteEmail,
                    userNumber: inviteUserNumber,
                    userRoles: selectedRoles,
                },
                {
                    headers: { "Auth-token": authToken },
                }
            );
            toast.success(response.data.message || "Успешно");
            setCreateInviteModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка создания приглашения");
        }
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50">
            {/* Фон, который будет под модальным окном */}
            <div
                className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-60 z-10"
                onClick={() => setCreateInviteModal(false)}
            ></div>

            {/* Модальное окно */}
            <div className="bg-white rounded-xl shadow-lg p-8 w-full sm:w-4/5 lg:w-3/5 xl:w-2/5 z-20">
                <form onSubmit={createInvite} className="flex flex-col gap-y-8 text-center">
                    <h1 className="text-2xl font-semibold text-main-dull-gray mb-6">Создать приглашение</h1>
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col items-start gap-y-3">
                            <label htmlFor="firstname" className="ml-3 text-left text-main-dull-blue">Имя</label>
                            <input
                                type="text"
                                id="firstname"
                                className="px-5 py-3 rounded-lg border-b text-main-dull-blue w-full"
                                placeholder="Имя пользователя"
                                required
                                value={inviteUserFirstName}
                                onChange={(e) => setInviteFirstName(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col items-start gap-y-3">
                            <label htmlFor="lastname" className="ml-3 text-left text-main-dull-blue">Фамилия</label>
                            <input
                                type="text"
                                id="lastname"
                                className="px-5 py-3 rounded-lg border-b text-main-dull-blue w-full"
                                placeholder="Фамилия пользователя"
                                required
                                value={inviteUserLastName}
                                onChange={(e) => setInviteLastName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex flex-col items-start gap-y-3">
                            <label htmlFor="userNumber" className="ml-3 text-left text-main-dull-blue">Номер телефона</label>
                            <input
                                type="tel"
                                id="userNumber"
                                className="px-5 py-3 rounded-lg border-b text-main-dull-blue w-full"
                                placeholder="Номер телефона"
                                required
                                value={inviteUserNumber}
                                onChange={(e) => setInviteUserNumber(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col items-start gap-y-3">
                            <label htmlFor="userEmail" className="ml-3 text-left text-main-dull-blue">Почта пользователя</label>
                            <input
                                type="email"
                                id="userEmail"
                                className="px-5 py-3 rounded-lg border-b text-main-dull-blue w-full"
                                placeholder="Почта пользователя"
                                required
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col w-full gap-y-3 items-start">
                        <label htmlFor="password" className="ml-3 text-left text-main-dull-blue">Пароль для пользователя</label>
                        <input
                            id="password"
                            type="password"
                            className="px-5 py-3 rounded-lg border-b text-main-dull-blue w-full"
                            placeholder="Пароль для пользователя"
                            required
                            value={invitePassword}
                            onChange={(e) => setInvitePassword(e.target.value)}
                        />
                    </div>
                    <div className="w-full">
                        <button
                            type="button"
                            className="bg-main-dull-blue hover:bg-main-purp-dark text-white px-6 py-2 rounded-xl w-full sm:w-auto mt-4"
                            onClick={() => setIsRoleModalOpen(true)}
                        >
                            Выбрать роли
                        </button>
                        <p className="mt-2 text-sm text-gray-500">
                            Выбранные роли:{" "}
                            {selectedRoles.length > 0
                                ? selectedRoles
                                    .map((roleId) => rolesList.find((role) => role.id === roleId)?.name)
                                    .join(", ")
                                : "Нет"}
                        </p>
                    </div>
                    <button
                        type="submit"
                        className="bg-main-dull-blue self-end hover:bg-main-dull-gray text-white px-8 py-2 rounded-xl mt-4"
                    >
                        Создать приглашение
                    </button>
                </form>
            </div>

            <Notification />
            {isRoleModalOpen && (
                <InviteRoleSelectionModal
                    onClose={() => setIsRoleModalOpen(false)}
                    setSelectedRoles={setSelectedRoles}
                />
            )}
        </div>
    );
};

export default CreateInviteModal;
