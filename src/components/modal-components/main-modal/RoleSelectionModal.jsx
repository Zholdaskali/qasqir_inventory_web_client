import { useState } from "react";
import axios from "axios";
import { API_CHANGE_ROLE } from "../../../api/API";
import { useSelector } from "react-redux";

const rolesList = [
    { id: 1, name: "Админ" },
    { id: 2, name: "Кладовщик" },
    { id: 3, name: "Управляющий складом" },
    { id: 4, name: "Сотрудник" },
];

const RoleSelectionModal = ({ selectedUser, onClose, fetchUserList }) => {
    const [selectedRoles, setSelectedRoles] = useState(selectedUser.userRoles || []);
    const [roleDropdown, setRoleDropdown] = useState(rolesList);

    const authToken = useSelector((state) => state.token.token);

    const handleRoleSelect = (roleId) => {
        let newRoles = [...selectedRoles];
        const employeeRoleId = 4; // Сотрудник
        const warehousemanRoleId = 2; // Кладовщик
        const managerRoleId = 3; // Управляющий складом

        if (!newRoles.includes(roleId)) {
            newRoles.push(roleId);

            // Если выбрана роль "Управляющий складом" (id: 3)
            if (roleId === managerRoleId) {
                if (!newRoles.includes(employeeRoleId)) newRoles.push(employeeRoleId);
                if (!newRoles.includes(warehousemanRoleId)) newRoles.push(warehousemanRoleId);
            }
            // Если выбрана роль "Кладовщик" (id: 2)
            else if (roleId === warehousemanRoleId) {
                if (!newRoles.includes(employeeRoleId)) newRoles.push(employeeRoleId);
            }
        }

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
            const response = await axios.put(
                url,
                { newRoles: selectedRoles },
                { headers: { "Auth-token": authToken } }
            );

            if (response.status === 200) {
                console.log("Роли обновлены!");
                fetchUserList();
            }
            onClose();
        } catch (error) {
            console.error("Ошибка при сохранении данных", error);
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
                        onChange={(e) => handleRoleSelect(parseInt(e.target.value, 10))}
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
                                    {role?.name}
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