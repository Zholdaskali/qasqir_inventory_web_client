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
        { id: 3, name: "Управляющий складом" },
        { id: 4, name: "Сотрудник" },
    ];

    const [inviteUserFirstName, setInviteFirstName] = useState("");
    const [inviteUserLastName, setInviteLastName] = useState("");
    const [invitePassword, setInvitePassword] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteUserNumber, setInviteUserNumber] = useState("");
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

    const inviteUserName = `${inviteUserFirstName} ${inviteUserLastName}`.trim();

    const generatePassword = () => {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        setInvitePassword(password);
    };

    const validatePhoneNumber = (phoneNumber) => /^\+?[1-9]\d{1,14}$/.test(phoneNumber);
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const updateSelectedRoles = (newRoles) => {
        let updatedRoles = [...newRoles];
        const employeeRoleId = 4;
        const hasManagerOrStorekeeper = updatedRoles.some((roleId) => roleId === 3 || roleId === 2);

        if (hasManagerOrStorekeeper && !updatedRoles.includes(employeeRoleId)) {
            updatedRoles.push(employeeRoleId);
        }

        setSelectedRoles([...new Set(updatedRoles)]);
    };

    const createInvite = async (e) => {
        e.preventDefault();
        if (!inviteUserName || !inviteEmail || !invitePassword || selectedRoles.length === 0) {
            toast.error("Заполните все обязательные поля");
            return;
        }
        if (!validatePhoneNumber(inviteUserNumber)) {
            toast.error("Некорректный номер телефона");
            return;
        }
        if (!validateEmail(inviteEmail)) {
            toast.error("Некорректный email");
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
                { headers: { "Auth-token": authToken } }
            );
            toast.success(response.data.message || "Приглашение успешно создано");
            setCreateInviteModal(false); // Закрываем модалку при успехе
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при создании приглашения");
            // Модалка остаётся открытой для исправления ошибок
        }
    };

    const handleBackdropClick = (e) => {
        // Закрываем модалку только если клик был на фоне
        if (e.target === e.currentTarget) {
            setCreateInviteModal(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
            role="dialog" // Для доступности
            aria-modal="true"
        >
            <div
                className="bg-white rounded-lg p-5 w-full max-w-lg z-50"
                onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике внутри модалки
            >
                <form onSubmit={createInvite} className="space-y-4">
                    <h1 className="text-xl font-semibold text-main-dull-gray text-center">
                        Новое приглашение
                    </h1>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-main-dull-blue mb-1">Имя</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded text-sm"
                                value={inviteUserFirstName}
                                onChange={(e) => setInviteFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-main-dull-blue mb-1">Фамилия</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded text-sm"
                                value={inviteUserLastName}
                                onChange={(e) => setInviteLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-main-dull-blue mb-1">Телефон</label>
                            <input
                                type="tel"
                                className="w-full p-2 border rounded text-sm"
                                value={inviteUserNumber}
                                onChange={(e) => setInviteUserNumber(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-main-dull-blue mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full p-2 border rounded text-sm"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-main-dull-blue mb-1">Пароль</label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                className="w-full p-2 border rounded text-sm"
                                value={invitePassword}
                                onChange={(e) => setInvitePassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="px-3 py-1 bg-main-dull-blue text-white rounded text-sm hover:bg-main-purp-dark"
                                onClick={generatePassword}
                            >
                                Сгенерировать
                            </button>
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            className="w-full px-4 py-1 bg-main-dull-blue text-white rounded text-sm hover:bg-main-purp-dark"
                            onClick={() => setIsRoleModalOpen(true)}
                        >
                            Выбрать роли
                        </button>
                        <p className="mt-1 text-xs text-gray-500">
                            Роли: {selectedRoles.length > 0
                                ? selectedRoles.map((id) => rolesList.find((r) => r.id === id)?.name).join(", ")
                                : "Не выбраны"}
                        </p>
                    </div>
                    <button
                        type="submit"
                        className="w-full px-4 py-1 bg-main-dull-blue text-white rounded text-sm hover:bg-main-purp-dark"
                    >
                        Создать
                    </button>
                </form>
            </div>
            <Notification />
            {isRoleModalOpen && (
                <InviteRoleSelectionModal
                    onClose={() => setIsRoleModalOpen(false)}
                    setSelectedRoles={updateSelectedRoles}
                    selectedRoles={selectedRoles}
                />
            )}
        </div>
    );
};

export default CreateInviteModal;