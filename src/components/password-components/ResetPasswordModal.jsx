import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  API_RECOVER_PASSWORD,
} from "../../api/API";

const ResetPasswordModal = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(API_RECOVER_PASSWORD, { email });
      toast.success(response.data.message || "Ссылка для сброса пароля отправлена на ваш email");
      onClose(); // Закрываем модалку после успеха
    } catch (err) {
      toast.error(err.response?.data?.message || "Ошибка при запросе сброса пароля");
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
            type="email"
            placeholder="Введите ваш email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full py-3 px-6 rounded-full border border-main-dull-gray outline-none focus:ring-2 focus:ring-main-dull-blue"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-main-dull-blue text-white font-bold py-3 rounded-full hover:bg-main-purp-dark transition disabled:opacity-50"
          >
            {isLoading ? "Отправка..." : "Отправить ссылку"}
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