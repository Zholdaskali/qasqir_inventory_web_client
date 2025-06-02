import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Notification from "../../components/notification/Notification";
import arrowRight from "../../assets/icons/arrow-right.svg";

// Предполагается, что API_FORGOT_PASSWORD — это ваш endpoint для запроса восстановления пароля
import { API_FORGOT_PASSWORD, API_EMAIL_GENERATE, API_EMAIL_VERIFY, API_UPDATE_USEREMAIL } from "../../api/API";

const ForgotPasswordPage = () => {
    const [userEmail, setUserEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Запрос на сервер для отправки кода восстановления
            const response = await axios.post(API_FORGOT_PASSWORD, { userEmail });
            const code = response.data.code; // Предполагается, что сервер возвращает код

            // Отправка email с кодом
            await mailService.send(
                userEmail,
                "Восстановление пароля",
                `Ваш код для восстановления пароля: ${code}\n\n` +
                `Пожалуйста, введите этот код в форме восстановления пароля на сайте, чтобы сбросить пароль. ` +
                `Если вы не запрашивали восстановление пароля, проигнорируйте это письмо или обратитесь в службу поддержки.`
            );

            toast.success("Код для восстановления пароля отправлен на ваш email");
            // Перенаправление на страницу ввода кода (предполагается, что у вас есть такая страница)
            navigate("/reset-password", { state: { email: userEmail } });
        } catch (err) {
            toast.error(err.response?.data?.message || "Ошибка при отправке кода");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate("/sign-in");
    };

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-main-light-gray text-main-dull-gray px-4">
            <div className="w-full max-w-sm flex flex-col items-center">
                <img src="/logo.svg" alt="logo" className="w-20 h-20 mb-4" />
                <h2 className="text-2xl font-bold text-main-dull-blue mb-4">Восстановление пароля</h2>
                <p className="text-center mb-6">
                    Введите ваш email, чтобы получить код для сброса пароля
                </p>

                <form onSubmit={handleForgotPassword} className="w-full flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Введите почту"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        required
                        className="w-full py-3 px-6 rounded-full border border-main-dull-gray outline-none focus:ring-2 focus:ring-main-dull-blue"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-3 rounded-full font-bold text-white transition ${
                            isLoading ? "bg-main-dull-blue/50 cursor-not-allowed" : "bg-main-dull-blue hover:bg-main-purp-dark"
                        }`}
                    >
                        {isLoading ? "Отправка..." : "Отправить код"}
                    </button>
                </form>

                <button
                    onClick={handleBackToLogin}
                    className="mt-4 text-sm text-main-dull-gray hover:text-main-purp-dark flex items-center gap-2"
                >
                    Вернуться к входу
                    <img src={arrowRight} alt="arrow" className="w-4 h-4" />
                </button>

                <Notification />
            </div>
        </div>
    );
};

export default ForgotPasswordPage;