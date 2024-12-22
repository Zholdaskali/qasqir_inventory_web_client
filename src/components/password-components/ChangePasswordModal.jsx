/* eslint-disable react/prop-types */
import { IoMdClose } from "react-icons/io";
import { API_NEW_PASSWORD } from "../../api/API";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Notification from "../notification/Notification";
import { useState, useEffect } from "react";
import { clearUser } from "../../store/slices/userSlice";
import { clearToken } from "../../store/slices/tokenSlice";
import { clearActionLogs } from "../../store/slices/logSlices/actionLogSlice";
import { clearExceptionLogs } from "../../store/slices/logSlices/exceptionSlice";
import { clearLogInLogs } from "../../store/slices/logSlices/logInSlice";
import { clearUserList } from "../../store/slices/userListSlice";
import { useNavigate } from "react-router-dom";


const ChangePasswordModal = ({ setPassResetModal }) => {
    const user = useSelector((state) => state.user);
    const authToken = useSelector((state) => state.token.token);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passCheck, setPassCheck] = useState(true);
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleClear = () => {
        dispatch(clearToken())
        dispatch(clearUser());
        dispatch(clearActionLogs());
        dispatch(clearExceptionLogs());
        dispatch(clearLogInLogs());
        dispatch(clearUserList());
    }

    useEffect(() => {
        // Сравниваем только если оба поля для паролей заполнены
        if (newPassword && confirmPassword) {
            setPassCheck(newPassword === confirmPassword);
        }
    }, [newPassword, confirmPassword]);

    const handleNewPassword = async (e) => {
        e.preventDefault();

        if (!passCheck) return;

        try {
            const response = await axios.put(
                API_NEW_PASSWORD + user.userId,
                {
                    userId: user.userId,
                    oldPassword: currentPassword,
                    newPassword: newPassword,
                },
                {
                    headers: { "Auth-token": authToken },
                }
            );
            toast.success(response.data.message);
            setPassResetModal(false);
            handleClear()
            navigate('/sign-in')
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при обновлении пароля");
        }
    };

    return (
        <div className="flex absolute top-0 left-0 z-30 items-center justify-center w-full h-screen">
            <div className="bg-white flex flex-col rounded-xl z-20 py-16 px-12 shadow-md w-2/4">
                <div className="self-end">
                    <IoMdClose
                        onClick={() => setPassResetModal(false)}
                        className="cursor-pointer"
                        color="#4A5C6A"
                        size={40}
                    />
                </div>
                <div className="w-full flex flex-col items-center py-16 rounded-xl">
                    <h1 className="text-xl mb-5 text-main-dull-blue font-medium">Создать новый пароль</h1>
                    <form
                        className="w-3/4 text-start flex flex-col items-start gap-8 text-[#101540]"
                        autoComplete="off"
                        onSubmit={handleNewPassword}
                    >
                        <input
                            type="text"
                            placeholder="Текущий пароль"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full bg-[#EDF0F2] py-4 border hover:border-main-dull-blue transition-colors border-main-dull-gray px-3 rounded-lg"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Создайте новый пароль"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-[#EDF0F2] py-4 border hover:border-main-dull-blue transition-colors border-main-dull-gray px-3 rounded-lg"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Подтвердите новый пароль"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-[#EDF0F2] py-4 border hover:border-main-dull-blue transition-colors border-main-dull-gray px-3 rounded-lg"
                            required
                        />
                        {/* Ошибка будет отображаться только если оба поля пароля не совпадают */}
                        {newPassword && confirmPassword && !passCheck && (
                            <p className="text-red-500 text-sm">Пароли не совпадают</p>
                        )}
                        <button
                            className={`${passCheck && newPassword && confirmPassword
                                ? "bg-main-dull-blue hover:bg-main-dull-gray"
                                : "bg-gray-400 cursor-not-allowed"
                                } text-xl font-bold transition-colors w-full self-center text-white py-4 rounded-xl`}
                            type="submit"
                            disabled={!passCheck || !newPassword || !confirmPassword}
                        >
                            Обновить пароль
                        </button>
                    </form>
                </div>
            </div>
            <div className="w-full h-screen absolute z-10 backdrop-blur-md"></div>
            <Notification />
        </div>
    );
};

export default ChangePasswordModal;
