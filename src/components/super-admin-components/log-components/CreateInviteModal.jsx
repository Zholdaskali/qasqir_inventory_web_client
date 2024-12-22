/* eslint-disable react/prop-types */
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
        <div className="flex absolute top-0 left-0 z-30 items-center justify-center w-full h-screen">
            <div className="bg-white rounded-xl z-20 py-16 px-12 shadow-md w-1/2">
                <form
                    onSubmit={createInvite}
                    className="flex flex-col items-center gap-y-10 p-5 text-center"
                >
                    <h1 className="text-2xl self-start text-main-dull-gray">
                        Создать приглашение
                    </h1>
                    <div className="w-full flex flex-row gap-x-5">
                        <div className="flex flex-col items-start w-1/2 gap-y-3">
                            <label htmlFor="firstname" className="ml-5">
                                Имя
                            </label>
                            <input
                                type="text"
                                id="firstname"
                                className="px-5 py-3 rounded-xl border-b text-main-dull-blue w-full"
                                placeholder="Имя пользователя"
                                required
                                value={inviteUserFirstName}
                                onChange={(e) => setInviteFirstName(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col items-start w-1/2 gap-y-3">
                            <label htmlFor="lastname" className="ml-5">
                                Фамилия
                            </label>
                            <input
                                type="text"
                                id="lastname"
                                className="px-5 py-3 rounded-xl border-b text-main-dull-blue w-full"
                                placeholder="Фамилия пользователя"
                                required
                                value={inviteUserLastName}
                                onChange={(e) => setInviteLastName(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="w-full flex flex-row gap-x-5">
                        <div className="flex flex-col items-start w-1/2 gap-y-3">
                            <label htmlFor="userNumber" className="ml-5">
                                Номер телефона
                            </label>
                            <input
                                type="tel"
                                id="userNumber"
                                className="px-5 py-3 rounded-xl border-b text-main-dull-blue w-full"
                                placeholder="Номер телефона"
                                required
                                value={inviteUserNumber}
                                onChange={(e) => setInviteUserNumber(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col items-start w-1/2 gap-y-3">
                            <label htmlFor="userEmail" className="ml-5">
                                Почта пользователя
                            </label>
                            <input
                                type="email"
                                id="userEmail"
                                className="px-5 py-3 rounded-xl border-b text-main-dull-blue w-full"
                                placeholder="Почта пользователя"
                                required
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col w-full gap-y-3 items-start">
                        <label htmlFor="password" className="ml-5">
                            Пароль для пользователя
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="px-5 py-3 rounded-xl border-b text-main-dull-blue w-full"
                            placeholder="Пароль для пользователя"
                            required
                            value={invitePassword}
                            onChange={(e) => setInvitePassword(e.target.value)}
                        />
                    </div>
                    <div className="w-full">
                        <button
                            type="button"
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl"
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
                        className="bg-main-dull-blue self-end hover:bg-main-dull-gray transition-colors text-white px-8 py-2 rounded-xl"
                    >
                        Создать приглашение
                    </button>
                </form>
            </div>
            <div
                className="w-full h-screen absolute z-10 backdrop-blur-md"
                onClick={() => setCreateInviteModal(false)}
            ></div>
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
