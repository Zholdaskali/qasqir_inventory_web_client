/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { setUser } from "../../store/slices/userSlice";
import { saveToken } from "../../store/slices/tokenSlice";

import Cookies from "js-cookie";
import { API_SIGN_IN, API_GET_PROFILE } from "../../api/API";

import arrowRight from "../../assets/icons/arrow-right.svg";

import Notification from "../../components/notification/Notification";
import { toast } from "react-toastify";
import ResetPasswordModal from "../../components/password-components/ResetPasswordModal";

const WelcomeScreen = ({ onBack }) => {
    return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center py-8 bg-main-light-gray text-main-dull-gray px-4">
            <div className="flex flex-col items-center mb-6 max-w-2xl">
                <img src="/logo.svg" alt="Logo" className="w-20 h-20 mb-3" />
                <h1 className="text-3xl md:text-4xl font-bold text-center">QASQIR INVENTORY</h1>
                <p className="text-lg mt-3 text-center">
                    Система управления складом с <span className="text-main-purp-dark font-medium">БИТРИКС 24 - интеграцией</span> и <span className="text-main-purp-dark font-medium">3D визуализацией</span>
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 w-full max-w-5xl">
                {[
                    {
                        icon: "📊",
                        title: "Аналитика",
                        items: [
                            "Логирование активностей, ошибок и входов",
                            "Масштабируемый и понятный Dashboard",
                            "Генерация отчетов в реальном времени"
                        ]
                    },
                    {
                        icon: "🏗️",
                        title: "Эффективное управление помещением",
                        items: [
                            "3D визулизация зон склада",
                            "Динамическое зонирование и контейнеризация склада ",
                            "Контроль объемов товаров и зон"
                        ]
                    },
                    {
                        icon: "📱",
                        title: "Управление зонами",
                        items: [
                            "Динамическое зонирование",
                            "Контроль объемов",
                            "Рекомендации по размещению"
                        ]
                    },
                    {
                        icon: "⚡",
                        title: "Эффективное управление",
                        items: [
                            "Админ",
                            "Кладовщик",
                            "Менеджер склада",
                            "Сотрудник"
                        ]
                    }
                ].map((feature, index) => (
                    <div 
                        key={index}
                        className="bg-white p-4 rounded-lg shadow-sm border border-main-dull-blue/10 hover:border-main-purp-dark/30 transition-colors"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{feature.icon}</span>
                            <h3 className="text-xl font-semibold text-main-dull-blue">{feature.title}</h3>
                        </div>
                        <ul className="space-y-1.5 text-base">
                            {feature.items.map((item, i) => (
                                <li key={i} className="flex items-start">
                                    <span className="text-main-purp-dark mr-1.5 text-xs mt-1">•</span> 
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-main-dull-blue/10 mb-8 w-full max-w-2xl">
                <h3 className="text-xl font-semibold mb-4 text-center text-main-dull-blue">Детальный контроль структурой склада и размещением товаров</h3>
                <div className="flex flex-wrap justify-center gap-2">
                    {["Секция", "Ряд", "Стеллаж", "Полка", "Ячейка"].map((item, i) => (
                        <div 
                            key={i}
                            className="px-4 py-2 bg-main-light-gray rounded border border-main-dull-blue/10 text-sm"
                        >
                            {item}
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={onBack}
                className="bg-main-dull-blue text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-main-purp-dark transition-colors shadow-sm flex items-center gap-2"
            >
                Приступить к работе
                <img src={arrowRight} alt="" className="w-5 h-5" />
            </button>
        </div>
    );
};

const SignInPage = ({ setIsAuthenticated }) => {
    const [userEmail, setUserEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPass, setForgotPass] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleForgotPass = () => {
        setForgotPass((prev) => !prev);
    };

    const handleLearnMore = () => {
        setShowWelcome(true);
    };

    const handleBackToLogin = () => {
        setShowWelcome(false);
    };

    useEffect(() => {
        const checkAuthToken = async () => {
            const token = Cookies.get("authToken");
            if (token) {
                dispatch(saveToken(token));
                try {
                    const response = await axios.get(API_GET_PROFILE, {
                        headers: {
                            "Auth-token": token,
                        },
                    });

                    dispatch(setUser(response.data.body));
                    setIsAuthenticated(true);
                    navigate("/");
                    toast.success("Успешный вход");
                } catch (error) {
                    toast.error("Ошибка при получении данных пользователя");
                }
            }
        };
        checkAuthToken();
    }, [dispatch, setIsAuthenticated, navigate]);

    const handleSignIn = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(API_SIGN_IN, {
                userEmail,
                password,
            });

            const token = response.headers["auth-token"];

            if (token) {
                Cookies.set("authToken", token, { secure: true, sameSite: "Strict" });
                dispatch(saveToken(token));
                setIsAuthenticated(true);
                navigate("/");

                try {
                    const userData = await axios.get(API_GET_PROFILE, {
                        headers: {
                            "Auth-token": token,
                        },
                    });

                    dispatch(setUser(userData.data.body));
                    toast.success("Успешный вход");
                } catch (error) {
                    toast.error("Ошибка при получении данных пользователя");
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при входе");
        }
    };

    return (
        <div className="w-full h-screen relative overflow-hidden flex flex-row bg-white">
            {/* WelcomeScreen - появляется слева */}
            <div className={`absolute top-0 left-0 w-2/3 h-full bg-gradient-to-b from-main-dull-white to-blue-900 transition-all duration-500 ease-in-out transform ${showWelcome ? "translate-x-0" : "-translate-x-full"}`}>
                <WelcomeScreen onBack={handleBackToLogin} />
            </div>

            {/* Основной контент */}
            <div className={`w-full h-full flex transition-all duration-500 ease-in-out ${showWelcome ? "translate-x-2/3" : "translate-x-0"}`}>
                {/* Левая часть (синяя) */}
                <div className="w-2/3 h-full bg-[url('/sign-in-page.png')] bg-cover bg-center flex items-center justify-start text-white p-5">
                    <div className="mx-20 text-start space-y-5">
                        <h1 className="text-3xl font-medium">QASQIR INVENTORY</h1>
                        <p className="text-xl">Ваш надежный помощник в управлении складом и учетами!</p>
                        <button
                            onClick={showWelcome ? handleBackToLogin : handleLearnMore}
                            className="bg-main-dull-blue px-8 py-3 text-xl rounded-full shadow-xl flex items-center gap-x-2 hover:bg-white-700 transition-colors"
                        >
                            {showWelcome ? (
                                <>
                                    <p>Назад</p>
                                    <img src={arrowRight} alt="" className="w-5 h-5 mt-1" />
                                </>
                            ) : (
                                <>
                                    <p>Узнать больше</p>
                                    <img src={arrowRight} alt="" className="w-5 h-5 mt-1" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Правая часть (форма логина) */}
                <div className="w-1/3 h-full flex justify-center items-center flex-col">
                    <div className="w-2/4 flex flex-col items-center">
                        <img src="/logo.svg" alt="" className="w-24 h-24" />
                        <p className="my-5 text-main-dull-gray text-2xl text-center">
                            <span className="font-bold text-main-dull-white">Войдите</span> в свою учетную запись
                        </p>
                        <form
                            onSubmit={handleSignIn}
                            autoComplete="on"
                            className="w-full text-start flex flex-col items-center gap-8 text-[#101540]"
                        >
                            <input
                                type="email"
                                name="login"
                                onChange={(e) => setUserEmail(e.target.value)}
                                value={userEmail}
                                placeholder="Введите почту"
                                required
                                className="w-full bg-white py-3 border border-main-dull-gray px-8 rounded-full focus:ring-2 focus:ring-main-dull-blue focus:border-main-dull-blue outline-none transition-all"
                            />
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                placeholder="Введите пароль"
                                className="w-full bg-white py-3 border border-main-dull-gray px-8 rounded-full focus:ring-2 focus:ring-main-dull-blue focus:border-main-dull-blue outline-none transition-all"
                                required
                            />
                            <label className="flex items-center gap-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    onChange={() => setShowPassword((prev) => !prev)}
                                    className="w-4 h-4 text-main-dull-blue rounded focus:ring-main-dull-white"
                                />
                                <p className="text-xl">Показать пароль?</p>
                            </label>
                            <button
                                className="bg-main-dull-blue text-xl font-bold w-full self-center text-white py-3 rounded-full hover:bg-white-700 transition-colors"
                                type="submit"
                            >
                                Войти
                            </button>
                        </form>
                        <button className="text-center my-5">
                            Не можете вспомнить{" "}
                            <span
                                className="text-main-dull-gray hover:text-main-dull-white font-bold cursor-pointer transition-colors"
                                onClick={handleForgotPass}
                            >
                                пароль?
                            </span>
                        </button>
                        <Notification />
                    </div>
                </div>
            </div>

            {/* Модальное окно для сброса пароля */}
            {forgotPass && <ResetPasswordModal onClose={() => setForgotPass(false)} />}
        </div>
    );
};

export default SignInPage;