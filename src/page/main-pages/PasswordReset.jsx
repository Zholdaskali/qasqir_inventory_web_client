import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom"; // Для извлечения параметров из URL

const ResetPasswordModal = ({ onClose }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams(); // Получаем параметры из URL

  // Извлекаем токен из URL
  const token = searchParams.get("Password-reset-token");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Проверка совпадения паролей
    if (newPassword !== confirmPassword) {
      toast.error("Пароли не совпадают");
      setIsLoading(false);
      return;
    }

    try {
      // Отправляем PUT-запрос на бэкенд с токеном в query-параметре
      const response = await axios.put(
        `http://localhost:8081/api/v1/user/password/reset?Password-reset-token=${token}`,
        { newPassword } // Соответствует структуре PasswordRecoveryRequest
      );
      toast.success(response.data.message || "Пароль успешно изменен");
      onClose(); // Закрываем модалку после успеха
    } catch (err) {
      toast.error(err.response?.data?.message || "Ошибка при сбросе пароля");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-main-dull-blue">Сброс пароля</h2>
        <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="Введите новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full py-3 px-6 rounded-full border border-main-dull-gray outline-none focus:ring-2 focus:ring-main-dull-blue"
          />
          <input
            type="password"
            placeholder="Подтвердите новый пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full py-3 px-6 rounded-full border border-main-dull-gray outline-none focus:ring-2 focus:ring-main-dull-blue"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-main-dull-blue text-white font-bold py-3 rounded-full hover:bg-main-purp-dark transition disabled:opacity-50"
          >
            {isLoading ? "Сохранение..." : "Сохранить новый пароль"}
          </button>
        </form>
        <button
          onClick={onClose}
          className="mt-4 text-sm text-main-dull-gray hover:text-main-dull-blue"
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordModal;