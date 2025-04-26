import { useState } from 'react';
import axios from 'axios';
import { API_CHANGE_ROLE } from '../../../api/API';
import { useSelector } from 'react-redux';

const rolesList = [
  { id: 1, name: 'Админ' },
  { id: 2, name: 'Управляющий складом' },
  { id: 3, name: 'Кладовщик' },
  { id: 4, name: 'Сотрудник' },
];

const roleIdMapToNumber = {
  admin: 1,
  warehouse_manager: 2,
  storekeeper: 3,
  employee: 4,
};

const roleIdMapToString = {
  1: 'admin',
  2: 'warehouse_manager',
  3: 'storekeeper',
  4: 'employee',
};

const RoleSelectionModal = ({ selectedUser, onClose, fetchUserList }) => {
  const initialRoles = (selectedUser.userRoles || []).map((roleId) =>
    typeof roleId === 'string' ? roleIdMapToNumber[roleId] || roleId : roleId
  );

  const [selectedRoles, setSelectedRoles] = useState(initialRoles);
  const [roleDropdown, setRoleDropdown] = useState(
    rolesList.filter((role) => !initialRoles.includes(role.id))
  );

  const authToken = useSelector((state) => state.token.token);

  const handleRoleSelect = (roleId) => {
    let newRoles = [...selectedRoles];
    const employeeRoleId = 4;
    const storekeeperRoleId = 3;
    const managerRoleId = 2;

    if (!newRoles.includes(roleId)) {
      newRoles.push(roleId);

      if (roleId === managerRoleId) {
        if (!newRoles.includes(employeeRoleId)) newRoles.push(employeeRoleId);
        if (!newRoles.includes(storekeeperRoleId)) newRoles.push(storekeeperRoleId);
      } else if (roleId === storekeeperRoleId) {
        if (!newRoles.includes(employeeRoleId)) newRoles.push(employeeRoleId);
      }
    }

    console.log(
      'Добавленные роли:',
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
      const url = API_CHANGE_ROLE.replace('{userId}', selectedUser.userId);
      console.log('Отправляемые роли:', selectedRoles);
      const response = await axios.put(
        url,
        { newRoles: selectedRoles },
        { headers: { 'Auth-token': authToken } }
      );

      if (response.status === 200) {
        console.log('Роли обновлены!');
        const updatedUserList = await fetchUserList();
        const updatedUser = updatedUserList?.find((user) => user.userId === selectedUser.userId);
        console.log(
          'Роли после fetchUserList (сырые):',
          updatedUser?.userRoles || 'Пользователь не найден'
        );
        const transformedRoles = (updatedUser?.userRoles || []).map((roleId) =>
          typeof roleId === 'string' ? roleIdMapToNumber[roleId] || roleId : roleId
        );
        console.log('Роли после fetchUserList (преобразованные):', transformedRoles);
      }
      onClose();
    } catch (error) {
      console.error('Ошибка при сохранении данных', error.response?.data || error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 sm:w-1/3 p-4 sm:p-6">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h1 className="text-base sm:text-lg font-semibold text-gray-700">Выбор роли</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg sm:text-xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="mb-3 sm:mb-4">
          <label className="text-gray-600 mb-1 sm:mb-2 block text-xs sm:text-sm">Выберите роль:</label>
          <select
            className="w-full px-2 sm:px-3 py-1 sm:py-2 border rounded-lg text-xs sm:text-sm"
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

        <div className="mb-3 sm:mb-4">
          <h2 className="text-gray-600 mb-1 sm:mb-2 text-xs sm:text-sm">Выбранные роли:</h2>
          {selectedRoles.length === 0 && <p className="text-xs sm:text-sm">Нет выбранных ролей</p>}
          <ul className="space-y-1 sm:space-y-2">
            {selectedRoles.map((roleId) => {
              const role = rolesList.find((r) => r.id === roleId);
              return (
                <li
                  key={roleId}
                  className="bg-gray-200 px-2 sm:px-3 py-1 sm:py-2 rounded-lg flex justify-between items-center text-xs sm:text-sm"
                >
                  {role?.name || `Неизвестная роль (id: ${roleId})`}
                  <button
                    className="text-red-500 hover:text-red-700 text-xs sm:text-sm"
                    onClick={() => handleRemoveRole(roleId)}
                  >
                    Удалить
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex justify-between mt-3 sm:mt-4">
          <button
            onClick={handleSave}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm"
          >
            Сохранить
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionModal;