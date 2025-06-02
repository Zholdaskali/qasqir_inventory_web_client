import { IoMdClose } from "react-icons/io";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useState } from "react";
import axios from "axios";
import { setUser } from "../../store/slices/userSlice";

const VerifyEmailModal = ({ setVerifyEmailModal, setEmailChangeModal, newEmail }) => {
  const user = useSelector((state) => state.user);
  const authToken = useSelector((state) => state.token.token);
  const dispatch = useDispatch();

  const [code, setCode] = useState("");

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    console.log('VerifyEmailModal: Sending request', { userId: user.userId, email: newEmail, code });
    try {
      const response = await axios.put(
        `http://localhost:8081/api/v1/user/profile/email/verify/${user.userId}`,
        {
          email: newEmail,
          code: code,
        },
        {
          headers: { "Auth-token": authToken },
        }
      );
      console.log('VerifyEmailModal: Success response', response.data);
      toast.success(response.data.message || "Email успешно подтвержден");
      dispatch(setUser({ ...user, email: newEmail, emailVerified: true }));
      setVerifyEmailModal(false);
      setEmailChangeModal(false);
    } catch (error) {
      console.error('VerifyEmailModal: Error', error.response?.data);
      toast.error(error.response?.data?.message || "Ошибка при подтверждении email");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all duration-300 scale-100 hover:scale-105">
        <div className="flex justify-end">
          <button
            onClick={() => setVerifyEmailModal(false)}
            aria-label="Закрыть модальное окно"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <IoMdClose size={24} />
          </button>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Подтверждение email</h1>
          <p className="text-sm text-gray-500 mt-2">Введите код, отправленный на {newEmail}.</p>
        </div>
        <form onSubmit={handleVerifyEmail} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Код подтверждения"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              required
              aria-label="Код подтверждения"
            />
          </div>
          <button
            type="submit"
            disabled={!code}
            className={`w-full py-3 rounded-lg text-white font-semibold transition-all duration-300 ${
              code ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Подтвердить email
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmailModal;