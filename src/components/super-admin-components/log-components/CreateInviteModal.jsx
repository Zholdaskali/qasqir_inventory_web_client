import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { API_CREATE_INVITE } from "../../../api/API";
import Notification from "../../notification/Notification";
import InviteRoleSelectionModal from "../../modal-components/InviteRoleSelectionModal";

const CreateInviteModal = ({ authToken, onClose }) => {
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
    const [loading, setLoading] = useState(false);

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

        setLoading(true);
        try {
            const response = await axios.post(
                API_CREATE_INVITE,
                {
                    userName: inviteUserName,
                    password: invitePassword,
                    email: inviteEmail,
                    userNumber: inviteUserNumber, // Исправлено
                    userRoles: selectedRoles,
                },
                { headers: { "Auth-token": authToken } }
            );
            toast.success(response.data.message || "Приглашение успешно создано");
            onClose(true); // Уведомляем о успешном создании
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при создании приглашения");
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose(false); // Закрытие без обновления
        }
    };

    const handleCancel = () => {
        onClose(false); // Закрытие без обновления
    };

    return (
        <div
            className="fixed inset-0 bg-gray-800 bg-opacity-60 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white rounded-lg p-6 w-full max-w-lg z-50"
                onClick={(e) => e.stopPropagation()}
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
                                className="w-full p-2 border rounded text-sm disabled:opacity-50"
                                value={inviteUserFirstName}
                                onChange={(e) => setInviteFirstName(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-main-dull-blue mb-1">Фамилия</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded text-sm disabled:opacity-50"
                                value={inviteUserLastName}
                                onChange={(e) => setInviteLastName(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm text-main-dull-blue mb-1">Телефон</label>
                            <input
                                type="tel"
                                className="w-full p-2 border rounded text-sm disabled:opacity-50"
                                value={inviteUserNumber}
                                onChange={(e) => setInviteUserNumber(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-main-dull-blue mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full p-2 border rounded text-sm disabled:opacity-50"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm text-main-dull-blue mb-1">Пароль</label>
                        <div className="flex gap-2">
                            <input
                                type="password"
                                className="w-full p-2 border rounded text-sm disabled:opacity-50"
                                value={invitePassword}
                                onChange={(e) => setInvitePassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="px-3 py-1 bg-main-dull-blue text-white rounded text-sm hover:bg-main-purp-dark disabled:opacity-50"
                                onClick={generatePassword}
                                disabled={loading}
                            >
                                Сгенерировать
                            </button>
                        </div>
                    </div>
                    <div>
                        <button
                            type="button"
                            className="w-full px-4 py-1 bg-main-dull-blue text-white rounded text-sm hover:bg-main-purp-dark disabled:opacity-50"
                            onClick={() => setIsRoleModalOpen(true)}
                            disabled={loading}
                        >
                            Выбрать роли
                        </button>
                        <p className="mt-1 text-xs text-gray-500">
                            Роли: {selectedRoles.length > 0
                                ? selectedRoles.map((id) => rolesList.find((r) => r.id === id)?.name).join(", ")
                                : "Не выбраны"}
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            className="px-4 py-1 bg-gray-300 text-gray-800 rounded text-sm hover:bg-gray-400 disabled:opacity-50"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-1 bg-main-dull-blue text-white rounded text-sm hover:bg-main-purp-dark disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Создание..." : "Создать"}
                        </button>
                    </div>
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