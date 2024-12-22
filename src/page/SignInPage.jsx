/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import axios from "axios";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";
import { setUser } from "../store/slices/userSlice";
import { saveToken } from "../store/slices/tokenSlice";

import Cookies from "js-cookie";
import { API_SIGN_IN, API_GET_PROFILE } from "../api/API";

import signInIcon from "../assets/illustrations/signIn.svg";
import arrowRight from "../assets/icons/arrow-right.svg";

import Notification from "../components/notification/Notification";
import { toast } from "react-toastify";
import ResetPasswordModal from "../components/password-components/ResetPasswordModal";

const SignInPage = ({ setIsAuthenticated }) => {
    const [userEmail, setUserEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [forgotPass, setForgotPass] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleForgotPass = () => {
        setForgotPass((prev) => !prev);
    };

    useEffect(() => {
        const checkAuthToken = async () => {
            const token = Cookies.get("authToken");
            if (token) {
                dispatch(saveToken(token))
                try {
                    const response = await axios.get(API_GET_PROFILE, {
                        headers: {
                            "Auth-token": token,
                        },
                    });

                    dispatch(setUser(response.data.body));
                    setIsAuthenticated(true);
                    navigate('/')
                    toast.success("Успешный вход");
                } catch (error) {
                    toast.error("Ошибка при получении данных пользователя");
                }
            }
        };
        checkAuthToken();
    }, [dispatch, setIsAuthenticated]);

    const handleSignIn = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(API_SIGN_IN, {
                userEmail,
                password,
            });

            const token = response.headers["auth-token"];

            if (token) {
                // Сохранить токен в куки
                Cookies.set("authToken", token, { secure: true, sameSite: "Strict" });
                dispatch(saveToken(token))
                // Устанавливаем состояние
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
        <div className="w-full justify-center flex flex-row items-center h-screen">
            <div className="w-11/12 h-screen bg-[url('/sign-in-page.png')] bg-cover bg-center flex items-center justify-start text-white p-5">
                <div className="mx-20 text-start space-y-5">
                    <h1 className="text-3xl font-medium">QASQIR INVENTORY</h1>
                    <p className="text-xl">Ваш надежный помощник в управлении складом и учетами!</p>
                    <button className="bg-main-dull-blue px-8 py-3 text-xl rounded-full shadow-xl flex items-center gap-x-2">
                        <p>Узнать больше </p>
                        <img src={arrowRight} alt="" className="w-5 h-5 mt-1" />
                    </button>
                </div>
            </div>
            <div className="flex h-full w-1/2 justify-center items-center flex-col">
                <div className="w-2/4 flex flex-col">
                    <img src="/logo.svg" alt="" className="w-24 h-24" />
                    <p className="my-5 text-main-dull-gray text-2xl">
                        <span className="font-bold text-main-dull-blue">Войдите</span> в свою учетную запись
                    </p>
                    <form
                        onSubmit={handleSignIn}
                        autoComplete="on"
                        className="w-3/4 text-start flex flex-col items-center gap-8 text-[#101540]"
                    >
                        <input
                            type="email"
                            name="login"
                            onChange={(e) => setUserEmail(e.target.value)}
                            value={userEmail}
                            placeholder="Введите почту"
                            required
                            className="w-full bg-white py-3 border  border-main-dull-gray px-8 rounded-full"
                        />
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            placeholder="Введите пароль"
                            className="w-full bg-white py-3 border  border-main-dull-gray px-8 rounded-full"
                            required
                        />
                        <label className="flex items-center gap-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                onChange={() => setShowPassword((prev) => !prev)}
                                className="w-4 h-4"
                            />
                            <p className="text-xl">Показать пароль?</p>
                        </label>
                        <button
                            className="bg-main-dull-blue text-xl font-bold w-full self-center text-white py-3 rounded-full"
                            type="submit"
                        >
                            Войти
                        </button>
                    </form>
                    <button className="text-start my-5 mx-3">
                        Не можете вспомнить{" "}
                        <span
                            className="text-main-dull-gray hover:text-main-dull-blue font-bold cursor-pointer"
                            onClick={handleForgotPass}
                        >
                            пароль?
                        </span>
                    </button>
                    <Notification />
                </div>
            </div>
            {forgotPass && <ResetPasswordModal />}
        </div>
    );
};

export default SignInPage;
