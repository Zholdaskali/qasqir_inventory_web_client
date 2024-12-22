/* eslint-disable react/prop-types */

import { useState } from "react";

const rolesList = [
    { id: 1, name: "Админ" },
    { id: 2, name: "Кладовщик" },
    { id: 3, name: "Продавец" },
    { id: 4, name: "Сотрудник" },
];

const InviteRoleSelectionModal = ({ onClose, setSelectedRoles }) => {
    const [selectedRoles, updateSelectedRoles] = useState([]);

    const toggleRole = (roleId) => {
        if (selectedRoles.includes(roleId)) {
            updateSelectedRoles(selectedRoles.filter((id) => id !== roleId));
        } else {
            updateSelectedRoles([...selectedRoles, roleId]);
        }
    };

    const handleSave = () => {
        setSelectedRoles(selectedRoles);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-1/3 p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-lg font-semibold text-gray-700">Выбор ролей</h1>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                    >
                        ×
                    </button>
                </div>

                <div className="mb-4">
                    {rolesList.map((role) => (
                        <div key={role.id} className="flex items-center gap-x-2 mb-2">
                            <input
                                type="checkbox"
                                id={`role-${role.id}`}
                                checked={selectedRoles.includes(role.id)}
                                onChange={() => toggleRole(role.id)}
                                className="form-checkbox text-blue-600"
                            />
                            <label htmlFor={`role-${role.id}`} className="text-gray-700">
                                {role.name}
                            </label>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-x-4">
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

export default InviteRoleSelectionModal;
