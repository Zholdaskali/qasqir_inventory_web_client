/* eslint-disable react/prop-types */
import { IoMdClose } from "react-icons/io";
import { FaEye, FaEyeSlash } from "react-icons/fa";
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClear = () => {
    dispatch(clearToken());
    dispatch(clearUser());
    dispatch(clearActionLogs());
    dispatch(clearExceptionLogs());
    dispatch(clearLogInLogs());
    dispatch(clearUserList());
  };

  useEffect(() => {
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
      handleClear();
      navigate("/sign-in");
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка при обновлении пароля");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all duration-300 scale-100 hover:scale-105">
        <div className="flex justify-end">
          <button
            onClick={() => setPassResetModal(false)}
            aria-label="Закрыть модальное окно"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <IoMdClose size={24} />
          </button>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Смена пароля</h1>
          <p className="text-sm text-gray-500 mt-2">Введите текущий и новый пароль для обновления.</p>
        </div>
        <form onSubmit={handleNewPassword} className="space-y-6">
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Текущий пароль"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              required
              aria-label="Текущий пароль"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              aria-label={showCurrentPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Новый пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              required
              aria-label="Новый пароль"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              aria-label={showNewPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Подтвердите новый пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              required
              aria-label="Подтверждение нового пароля"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              aria-label={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {newPassword && confirmPassword && !passCheck && (
            <p className="text-red-500 text-sm">Пароли не совпадают</p>
          )}
          <button
            type="submit"
            disabled={!passCheck || !newPassword || !confirmPassword}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
              passCheck && newPassword && confirmPassword
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Обновить пароль
          </button>
        </form>
      </div>
      <Notification />
    </div>
  );
};

export default ChangePasswordModal;