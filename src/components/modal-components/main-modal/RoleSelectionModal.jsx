import { useState } from "react";
import axios from "axios";
import { API_CHANGE_ROLE } from "../../../api/API";
import { useSelector } from "react-redux";

// Синхронизируем rolesList с серверными данными, убираем api_user
const rolesList = [
    { id: 1, name: "Админ" },
    { id: 2, name: "Управляющий складом" }, // Warehouse Manager
    { id: 3, name: "Кладовщик" }, // Storekeeper
    { id: 4, name: "Сотрудник" }, // Employee
];

// Карта для преобразования строковых идентификаторов в числовые
const roleIdMapToNumber = {
    admin: 1,
    warehouse_manager: 2,
    storekeeper: 3,
    employee: 4,
};

// Карта для преобразования числовых идентификаторов в строковые (для отображения)
const roleIdMapToString = {
    1: "admin",
    2: "warehouse_manager",
    3: "storekeeper",
    4: "employee",
};

const RoleSelectionModal = ({ selectedUser, onClose, fetchUserList }) => {
    // Преобразуем начальные роли пользователя в числовые идентификаторы
    const initialRoles = (selectedUser.userRoles || []).map((roleId) =>
        typeof roleId === "string" ? roleIdMapToNumber[roleId] || roleId : roleId
    );

    const [selectedRoles, setSelectedRoles] = useState(initialRoles);
    const [roleDropdown, setRoleDropdown] = useState(
        rolesList.filter((role) => !initialRoles.includes(role.id))
    );

    const authToken = useSelector((state) => state.token.token);

    const handleRoleSelect = (roleId) => {
        let newRoles = [...selectedRoles];
        const employeeRoleId = 4; // Сотрудник
        const storekeeperRoleId = 3; // Кладовщик
        const managerRoleId = 2; // Управляющий складом

        if (!newRoles.includes(roleId)) {
            newRoles.push(roleId);

            // Если выбрана роль "Управляющий складом" (id: 2)
            if (roleId === managerRoleId) {
                if (!newRoles.includes(employeeRoleId)) newRoles.push(employeeRoleId);
                if (!newRoles.includes(storekeeperRoleId)) newRoles.push(storekeeperRoleId);
            }
            // Если выбрана роль "Кладовщик" (id: 3)
            else if (roleId === storekeeperRoleId) {
                if (!newRoles.includes(employeeRoleId)) newRoles.push(employeeRoleId);
            }
        }

        // Отладочный лог для проверки добавленных ролей
        console.log(
            "Добавленные роли:",
            newRoles.map((id) => rolesList.find((r) => r.id === id)?.name || `Неизвестная роль (id: ${id})`)
        );

        setSelectedRoles(newRoles);
        const filteredDropdown = rolesList.filter((role) => !newRoles.includes(role.id));
        setRoleDropdown(filteredDropdown);
    };

    const handleRemoveRole = (roleId) => {
        const newSelectedRoles = selectedRoles.filter((id) => id !== roleId);
        setSelectedRoles(newSelectedRoles);
        const newDropdown = rolesList.filter((r) => !newSelectedRoles.includes(r.id));
        setRoleDropdown(newDropdown);
    };

    const handleSave = async () => {
        try {
            const url = API_CHANGE_ROLE.replace("{userId}", selectedUser.userId);
            // Логируем данные, которые отправляем на сервер
            console.log("Отправляемые роли:", selectedRoles);
            const response = await axios.put(
                url,
                { newRoles: selectedRoles },
                { headers: { "Auth-token": authToken } }
            );

            if (response.status === 200) {
                console.log("Роли обновлены!");
                // Вызываем fetchUserList для обновления списка пользователей
                const updatedUserList = await fetchUserList();
                // Логируем, какие роли вернул сервер после обновления
                const updatedUser = updatedUserList?.find((user) => user.userId === selectedUser.userId);
                console.log(
                    "Роли после fetchUserList (сырые):",
                    updatedUser?.userRoles || "Пользователь не найден"
                );
                // Преобразуем строковые идентификаторы в числовые для дальнейшего использования
                const transformedRoles = (updatedUser?.userRoles || []).map((roleId) =>
                    typeof roleId === "string" ? roleIdMapToNumber[roleId] || roleId : roleId
                );
                console.log("Роли после fetchUserList (преобразованные):", transformedRoles);
            }
            onClose();
        } catch (error) {
            console.error("Ошибка при сохранении данных", error.response?.data || error.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-1/3 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-lg font-semibold text-gray-700">Выбор роли</h1>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <div className="mb-4">
                    <label className="text-gray-600 mb-2 block">Выберите роль:</label>
                    <select
                        className="w-full px-3 py-2 border rounded-lg"
                        onChange={(e) => {
                            const roleId = parseInt(e.target.value, 10);
                            if (!isNaN(roleId)) handleRoleSelect(roleId);
                        }}
                        value=""
                    >
                        <option value="">Выберите роль</option>
                        {roleDropdown.map((role) => (
                            <option key={role.id} value={role.id}>
                                {role.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <h2 className="text-gray-600 mb-2">Выбранные роли:</h2>
                    {selectedRoles.length === 0 && <p>Нет выбранных ролей</p>}
                    <ul className="space-y-2">
                        {selectedRoles.map((roleId) => {
                            const role = rolesList.find((r) => r.id === roleId);
                            return (
                                <li
                                    key={roleId}
                                    className="bg-gray-200 px-3 py-2 rounded-lg flex justify-between items-center"
                                >
                                    {role?.name || `Неизвестная роль (id: ${roleId})`}
                                    <button
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleRemoveRole(roleId)}
                                    >
                                        Удалить
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="flex justify-between mt-4">
                    <button
                        onClick={handleSave}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                    >
                        Сохранить
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg"
                    >
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionModal;