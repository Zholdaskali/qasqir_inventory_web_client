import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";

import avatar from "../../../assets/placeholders/avatar.png";
import camera from "../../../assets/icons/camera.svg";
import userIcon from '../../../assets/icons/user.svg';
import { IoMdClose } from "react-icons/io";

import { API_UPDATE_USERNAME } from "../../../api/API";
import axios from "axios";

import Notification from "../../../components/notification/Notification";
import { toast } from "react-toastify";
import { setUser } from "../../../store/slices/userSlice";
import ChangePasswordModal from "../../../components/password-components/ChangePasswordModal";
import ConfirmationWrapper from "../../../components/ui/ConfirmationWrapper";

// Функция для перевода ролей
const translateRole = (role) => {
  const roleTranslations = {
    'employee': 'Сотрудник',
    'admin': 'Администратор',
    'warehouse_manager': 'Менеджер склада',
    'storekeeper': 'Кладовщик'
  };
  return roleTranslations[role] || role;
};

const EditProfile = () => {
    const authToken = useSelector((state) => state.token.token);
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [newUserName, setNewUserName] = useState("");
    const [newUserNumber, setNewUserNumber] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [passResetModal, setPassResetModal] = useState(false);

    const isSaveDisabled = () => !newUserName && !newUserNumber && !newUserEmail;
    const navigate = useNavigate();

    const updateUserData = async () => {
        try {
            const updatedData = {};
            const hasNameChanged = newUserName.trim() !== "";
            const hasNumberChanged = newUserNumber.trim() !== "";
            const hasEmailChanged = newUserEmail.trim() !== "";

            if (hasNameChanged && hasNumberChanged) {
                updatedData.userName = newUserName;
                updatedData.userNumber = newUserNumber.startsWith("+") ? newUserNumber : `+${newUserNumber}`;
            } else if (hasNameChanged) {
                updatedData.userName = newUserName;
                updatedData.userNumber = user.userNumber;
            } else if (hasNumberChanged) {
                updatedData.userName = user.userName;
                updatedData.userNumber = newUserNumber.startsWith("+") ? newUserNumber : `+${newUserNumber}`;
            }

            const response = await axios.put(
                API_UPDATE_USERNAME + user.userId,
                {
                    userName: updatedData.userName,
                    userEmail: user.email,
                    userNumber: updatedData.userNumber,
                },
                { headers: { "Auth-token": authToken } }
            );

            dispatch(setUser({ ...response.data.body }));
            setTimeout(() => navigate("/"), 2000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при обновлении данных пользователя");
        }
    };

    const handlePassReset = () => setPassResetModal((prev) => !prev);

    return (
        <div className="bg-white w-full md:w-4/5 max-w-4xl mx-auto h-[90vh] md:h-[70vh] rounded-2xl shadow-lg flex flex-col items-center py-8 px-6 md:px-12 overflow-y-auto">
            <div className="w-full flex items-center justify-between mb-8">
                <div className="flex items-center gap-x-3">
                    <img src={userIcon} alt="User Icon" className="w-6 h-6" />
                    <h1 className="uppercase text-main-dull-blue text-lg md:text-xl font-semibold tracking-wide">
                        Ваш профиль
                    </h1>
                </div>
                <NavLink to="/">
                    <IoMdClose size={28} className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer" />
                </NavLink>
            </div>

            <div className="flex flex-col md:flex-row w-full gap-8">
                <div className="flex flex-col items-center gap-y-6 w-full md:w-1/3">
                    <img
                        src={user.imagePath ? user.imagePath : avatar}
                        alt="User Avatar"
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-gray-200 object-cover shadow-sm"
                    />
                    <button className="flex items-center gap-x-2 border-2 border-main-dull-blue text-main-dull-blue px-6 py-2 rounded-lg hover:bg-main-dull-blue hover:text-white transition-all duration-200 shadow-md">
                        <span>Загрузить</span>
                        <img src={camera} alt="Camera Icon" className="w-5 h-5" />
                    </button>
                    <div className="text-center text-xs text-gray-500">
                        <p className="font-medium">Дата регистрации:</p>
                        <p>{user.registrationDate || "Не указано"}</p>
                    </div>
                </div>

                <div className="flex flex-col w-full md:w-2/3 gap-y-6">
                    <div className="space-y-4 text-sm">
                        <div>
                            <p className="text-gray-600 font-medium">Имя пользователя:</p>
                            <input
                                type="text"
                                placeholder={user.userName || "Введите имя"}
                                value={newUserName}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-dull-blue shadow-sm"
                                onChange={(e) => setNewUserName(e.target.value)}
                            />
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Почта пользователя:</p>
                            <input
                                type="text"
                                placeholder={user.email || "Введите почту"}
                                value={newUserEmail}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-dull-blue shadow-sm"
                                onChange={(e) => setNewUserEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Номер пользователя:</p>
                            <input
                                type="text"
                                placeholder={user.userNumber || "Введите номер"}
                                value={newUserNumber}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-dull-blue shadow-sm"
                                onChange={(e) => setNewUserNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Роли пользователя:</p>
                            <ul className="flex flex-wrap gap-2 mt-1">
                                {Array.isArray(user.userRoles) ? (
                                    user.userRoles.map((role, index) => (
                                        <li
                                            key={index}
                                            className="bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-700 shadow-sm"
                                        >
                                            {translateRole(role)}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-600">{translateRole(user.userRoles) || "Нет ролей"}</li>
                                )}
                            </ul>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="text-gray-600 font-medium w-1/3">Статус почты:</p>
                            <div className={`flex items-center justify-center px-3 py-1 rounded-full w-1/2 ${user.emailVerified ? "bg-[#E3F3E9]" : "bg-[#FFF2EA]"} shadow-sm`}>
                                <div className={`h-2 w-2 rounded-full ${user.emailVerified ? "bg-[#11B066]" : "bg-[#E84D43]"} mr-2`}></div>
                                <p className={`${user.emailVerified ? "text-[#11B066]" : "text-[#E84D43]"} text-sm`}>
                                    {user.emailVerified ? "Подтверждено" : "Не подтверждено"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-y-4 mt-6">
                        <ConfirmationWrapper title="Ваши данные будут изменены!" onConfirm={updateUserData}>
                            <button
                                disabled={isSaveDisabled()}
                                className={`w-full bg-main-dull-blue text-white px-6 py-2 rounded-lg hover:bg-main-purp-dark transition-all duration-200 shadow-md ${isSaveDisabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Сохранить
                            </button>
                        </ConfirmationWrapper>
                        <button
                            className="w-full border-2 border-main-dull-blue text-main-dull-blue px-6 py-2 rounded-lg hover:bg-main-dull-blue hover:text-white transition-all duration-200 shadow-md"
                            onClick={handlePassReset}
                        >
                            Сменить пароль
                        </button>
                    </div>
                </div>
            </div>

            {passResetModal && <ChangePasswordModal setPassResetModal={setPassResetModal} />}
            <Notification />
        </div>
    );
};

export default EditProfile;