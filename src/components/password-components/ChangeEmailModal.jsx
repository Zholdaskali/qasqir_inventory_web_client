import { IoMdClose } from "react-icons/io";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useState } from "react";
import axios from "axios";
import VerifyEmailModal from "./VerifyEmailModal";
import {
  API_EMAIL_GENERATE,
} from "../../api/API";

const ChangeEmailModal = ({ setEmailChangeModal }) => {
  const user = useSelector((state) => state.user);
  const authToken = useSelector((state) => state.token.token);

  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    console.log('ChangeEmailModal: Sending request', { userId: user.userId, email: newEmail, password });
    try {
      const response = await axios.put(
        API_EMAIL_GENERATE,
        {
          userId: user.userId,
          email: newEmail,
          password: password,
        },
        {
          headers: { "Auth-token": authToken },
        }
      );
      console.log('ChangeEmailModal: Success response', response.data);
      toast.success(response.data.message || "Код для подтверждения отправлен на новый email");
      setShowVerifyModal(true);
    } catch (error) {
      console.error('ChangeEmailModal: Error', error.response?.data);
      toast.error(error.response?.data?.message || "Ошибка при обновлении email");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all duration-300 scale-100 hover:scale-105">
          <div className="flex justify-end">
            <button
              onClick={() => setEmailChangeModal(false)}
              aria-label="Закрыть модальное окно"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <IoMdClose size={24} />
            </button>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">Смена email</h1>
            <p className="text-sm text-gray-500 mt-2">Введите новый email и пароль для обновления.</p>
          </div>
          <form onSubmit={handleChangeEmail} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Новый email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                required
                aria-label="Новый email"
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Текущий пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                required
                aria-label="Текущий пароль"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button
              type="submit"
              disabled={!newEmail || !password}
              className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
                newEmail && password
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Обновить email
            </button>
          </form>
        </div>
      </div>
      {showVerifyModal && (
        <VerifyEmailModal
          setVerifyEmailModal={setShowVerifyModal}
          setEmailChangeModal={setEmailChangeModal}
          newEmail={newEmail}
        />
      )}
    </>
  );
};

export default ChangeEmailModal;