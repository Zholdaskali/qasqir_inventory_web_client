import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";

import avatar from "../../assets/placeholders/avatar.png";
import camera from "../../assets/icons/camera.svg";
import userIcon from '../../assets/icons/user.svg';
import { IoMdClose } from "react-icons/io";

import { API_UPDATE_USERNAME } from "../../api/API";
import axios from "axios";

import Notification from "../../components/notification/Notification";
import { toast } from "react-toastify";
import { setUser } from "../../store/slices/userSlice";
import ChangePasswordModal from "../../components/password-components/ChangePasswordModal";
import ConfirmationWrapper from "../../components/ui/ConfirmationWrapper";

const EditProfile = () => {
    const authToken = useSelector((state) => state.token.token);
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();

    const [newUserName, setNewUserName] = useState("");
    const [newUserNumber, setNewUserNumber] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");

    const [passResetModal, setPassResetModal] = useState(false);

    const isSaveDisabled = () => {
        return !newUserName && !newUserNumber && !newUserEmail;
    };

    const navigate = useNavigate();

    const updateUserData = async () => {
        try {
            const updatedData = {};
            const hasNameChanged = newUserName.trim() !== "";
            const hasNumberChanged = newUserNumber.trim() !== "";
            const hasEmailChanged = newUserEmail.trim() !== ""

            // Handle conditional data logic
            if (hasNameChanged && hasNumberChanged) {
                updatedData.userName = newUserName;
                updatedData.userNumber = newUserNumber.startsWith("+")
                    ? newUserNumber
                    : `+${newUserNumber}`;
            } else if (hasNameChanged) {
                updatedData.userName = newUserName;
                updatedData.userNumber = user.userNumber;
            } else if (hasNumberChanged) {
                updatedData.userName = user.userName;
                updatedData.userNumber = newUserNumber.startsWith("+")
                    ? newUserNumber
                    : `+${newUserNumber}`;
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

            // toast.success(response.data.message || "Успешно");
            dispatch(setUser({ ...response.data.body }));
            setTimeout(() => navigate("/"), 2000)
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Ошибка при обновлении данных пользователя"
            );
        }
    };

    const handlePassReset = () => {
        setPassResetModal((prev) => !prev);
    };

    return (
        <div className="bg-white w-full md:w-4/5 h-[100vh] md:h-[70vh] self-center px-5 md:px-10 rounded-xl shadow-sm flex flex-col items-center justify-between py-5 overflow-y-scroll">
            <div className='w-full flex items-center justify-between gap-x-3'>
                <div className="flex items-center gap-x-3">
                    <img src={userIcon} alt="" />
                    <h1 className='uppercase text-main-dull-blue font-medium'>Ваш профиль</h1>
                </div>
                <NavLink to="/">
                    <IoMdClose size={30} className="cursor-pointer" />
                </NavLink>
            </div>
            <div className='flex flex-col md:flex-row w-full'>
                <div className="flex flex-col items-center gap-y-12 w-full md:w-1/3">
                    <img src={user.imagePath ? user.imagePath : avatar} alt="User Avatar" className="w-3/4" />
                    <button className="flex items-center border-2 border-main-dull-blue w-full md:w-1/3 py-2 rounded-xl gap-x-2 justify-center">
                        <p>Загрузить</p>
                        <img src={camera} alt="Camera Icon" />
                    </button>
                    <div className="flex w-full md:w-1/2 uppercase text-xs justify-between">
                        <p>Дата регистрации</p>
                        <p>{user.registrationDate || "Не указано"}</p>
                    </div>
                </div>
                <div className="flex flex-col w-full md:w-1/2 gap-y-5 mt-5 md:mt-0">
                    <div className="flex flex-col gap-y-7 font-medium">
                        <div className="space-y-1">
                            <p>Имя пользователя:</p>
                            <input
                                type="text"
                                placeholder={user.userName}
                                value={newUserName}
                                className="w-full px-2 py-1 border rounded-xl"
                                onChange={(e) => setNewUserName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <p>Почта пользователя:</p>
                            <input
                                type="text"
                                placeholder={user.email}
                                value={newUserEmail}
                                className="w-full px-2 py-1 border rounded-xl"
                                onChange={(e) => setNewUserEmail(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <p>Номер пользователя:</p>
                            <input
                                type="text"
                                placeholder={user.userNumber}
                                value={newUserNumber}
                                className="w-full px-2 py-1 border rounded-xl"
                                onChange={(e) => setNewUserNumber(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <p>Роли пользователя:</p>
                            <ul className="flex flex-wrap">
                                {Array.isArray(user.userRoles)
                                    ? user.userRoles.map((role, index) => (
                                        <li key={index} className="bg-gray-100 rounded-md mr-2.5 px-2 py-1 mb-2">
                                            {role}
                                        </li>
                                    ))
                                    : <li>{user.userRoles || "Нет ролей"}</li>
                                }
                            </ul>
                        </div>
                        <div className="flex flex-col md:flex-row w-full gap-x-4 items-center justify-between">
                            <p className="w-full md:w-1/3 mb-2.5">Статус почты : </p>
                            <div className="w-full md:w-1/2">
                                <div
                                    className={`${user.emailVerified ? "bg-[#E3F3E9]" : "bg-[#FFF2EA]"
                                        } text-center flex items-center justify-center px-2 rounded-full`}
                                >
                                    <div
                                        className={`${user.emailVerified ? "bg-[#11B066]" : "bg-[#E84D43]"
                                            } h-3 w-3 rounded-full`}
                                    ></div>
                                    <p
                                        className={`${user.emailVerified ? "text-[#11B066]" : "text-[#E84D43]"
                                            } px-2 py-1 rounded`}
                                    >
                                        {`${user.emailVerified ? "Подтверждено" : "Не подтверждено"}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ConfirmationWrapper
                        title="Ваши данные будут изменены!"
                        onConfirm={updateUserData}
                    >
                        <button
                            disabled={isSaveDisabled()}
                            className={`flex items-center border-2 border-main-dull-blue w-full md:w-3/4 py-2 rounded-xl gap-x-2 justify-center ${isSaveDisabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Сохранить
                        </button>
                    </ConfirmationWrapper>
                    <button
                        className="flex items-center border-2 border-main-dull-blue w-full md:w-3/4 py-2 rounded-xl gap-x-2 justify-center mb-2.5"
                        onClick={handlePassReset}
                    >
                        <p>Сменить пароль</p>
                    </button>

                    {passResetModal && <ChangePasswordModal setPassResetModal={setPassResetModal} />}
                </div>
            </div>
            <Notification />
        </div>
    );
};

export default EditProfile;