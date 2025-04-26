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
                {[{
                    icon: "📊", title: "Аналитика", items: [
                        "Логирование активностей, ошибок и входов",
                        "Масштабируемый и понятный Dashboard",
                        "Генерация отчетов в реальном времени"
                    ]
                }, {
                    icon: "🏗️", title: "Управление помещением", items: [
                        "3D визуализация зон склада",
                        "Контейнеризация и динамика",
                        "Контроль объема товаров"
                    ]
                }, {
                    icon: "📱", title: "Управление зонами", items: [
                        "Динамическое зонирование",
                        "Контроль объемов",
                        "Рекомендации по размещению"
                    ]
                }, {
                    icon: "⚡", title: "Эффективное управление", items: [
                        "Админ", "Кладовщик", "Менеджер", "Сотрудник"
                    ]
                }].map((feature, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-main-dull-blue/10 hover:border-main-purp-dark/30 transition-colors">
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
                <h3 className="text-xl font-semibold mb-4 text-center text-main-dull-blue">Контроль структуры склада</h3>
                <div className="flex flex-wrap justify-center gap-2">
                    {["Секция", "Ряд", "Стеллаж", "Полка", "Ячейка"].map((item, i) => (
                        <div key={i} className="px-4 py-2 bg-main-light-gray rounded border border-main-dull-blue/10 text-sm">
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

    const handleForgotPass = () => setForgotPass(prev => !prev);
    const handleLearnMore = () => setShowWelcome(true);
    const handleBackToLogin = () => setShowWelcome(false);

    useEffect(() => {
        const token = Cookies.get("authToken");
        if (token) {
            dispatch(saveToken(token));
            axios.get(API_GET_PROFILE, {
                headers: { "Auth-token": token }
            }).then((res) => {
                dispatch(setUser(res.data.body));
                setIsAuthenticated(true);
                navigate("/");
                toast.success("Успешный вход");
            }).catch(() => toast.error("Ошибка при получении данных пользователя"));
        }
    }, [dispatch, setIsAuthenticated, navigate]);

    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(API_SIGN_IN, { userEmail, password });
            const token = response.headers["auth-token"];

            if (token) {
                Cookies.set("authToken", token, {
                    secure: window.location.protocol === "https:",
                    sameSite: "Lax"
                });

                dispatch(saveToken(token));
                setIsAuthenticated(true);

                const userData = await axios.get(API_GET_PROFILE, {
                    headers: { "Auth-token": token }
                });

                dispatch(setUser(userData.data.body));
                toast.success("Успешный вход");
                navigate("/");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Ошибка при входе");
        }
    };

    return (
        <div className="w-full h-screen relative overflow-hidden bg-white">
            <div className={`absolute top-0 left-0 w-full md:w-2/3 h-full bg-gradient-to-b from-main-dull-white to-blue-900 transition-all duration-500 ease-in-out transform ${showWelcome ? "translate-x-0" : "-translate-x-full"}`}>
                <WelcomeScreen onBack={handleBackToLogin} />
            </div>

            <div className={`flex flex-col md:flex-row w-full h-full transition-all duration-500 ease-in-out ${showWelcome ? "md:translate-x-2/3" : "translate-x-0"}`}>
                <div className="hidden md:flex w-full md:w-2/3 bg-[url('/sign-in-page.png')] bg-cover bg-center items-center justify-start text-white p-5">
                    <div className="mx-10 text-start space-y-5">
                        <h1 className="text-3xl font-medium">QASQIR INVENTORY</h1>
                        <p className="text-xl">Ваш помощник в управлении складом!</p>
                        <button
                            onClick={showWelcome ? handleBackToLogin : handleLearnMore}
                            className="bg-main-dull-blue px-6 py-2 text-lg rounded-full shadow-xl flex items-center gap-x-2 hover:bg-white-700 transition-colors"
                        >
                            {showWelcome ? "Назад" : "Узнать больше"}
                            <img src={arrowRight} alt="" className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="w-full md:w-1/3 h-full flex justify-center items-center px-4">
                    <div className="w-full max-w-sm flex flex-col items-center">
                        <img src="/logo.svg" alt="logo" className="w-20 h-20" />
                        <p className="my-4 text-main-dull-gray text-xl text-center">
                            <span className="font-bold text-main-dull-white">Войдите</span> в аккаунт
                        </p>

                        <form onSubmit={handleSignIn} className="w-full flex flex-col gap-4">
                            <input
                                type="email"
                                placeholder="Введите почту"
                                value={userEmail}
                                onChange={(e) => setUserEmail(e.target.value)}
                                required
                                className="w-full py-3 px-6 rounded-full border border-main-dull-gray outline-none focus:ring-2 focus:ring-main-dull-blue"
                            />
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Введите пароль"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full py-3 px-6 rounded-full border border-main-dull-gray outline-none focus:ring-2 focus:ring-main-dull-blue"
                            />
                            <label className="flex items-center gap-2">
                                <input type="checkbox" onChange={() => setShowPassword(!showPassword)} />
                                <span>Показать пароль?</span>
                            </label>
                            <button type="submit" className="bg-main-dull-blue text-white font-bold py-3 rounded-full hover:bg-main-purp-dark transition">
                                Войти
                            </button>
                        </form>

                        <button className="mt-4 text-sm" onClick={handleForgotPass}>
                            Не можете вспомнить <span className="font-bold text-main-dull-white">пароль?</span>
                        </button>
                        <Notification />
                    </div>
                </div>
            </div>

            {forgotPass && <ResetPasswordModal onClose={() => setForgotPass(false)} />}
        </div>
    );
};

export default SignInPage;
