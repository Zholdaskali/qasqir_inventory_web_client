import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import avatar from '../../assets/placeholders/avatar.png';
import camera from '../../assets/icons/camera.svg';
import pen from '../../assets/icons/pen.svg'
import emailVerifyIllustr from '../../assets/illustrations/email-verify.svg';
import userIcon from '../../assets/icons/user.svg'


import Cookies from 'js-cookie'; // Подключение js-cookie

import { Spinner } from 'flowbite-react';


import { API_EMAIL_GENERATE, API_EMAIL_VERIFY } from '../../api/API';
import axios from 'axios';

import Notification from '../../components/notification/Notification';
import { toast } from 'react-toastify';
import { setUser } from '../../store/slices/userSlice';
import { NavLink } from 'react-router-dom';

const SettingsPage = () => {
    const authToken = Cookies.get('authToken');
    const user = useSelector((state) => state.user);

    const [emailVerifyModal, setEmailVerifyModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verificationCode, setVerificationCode] = useState({
        firstDigit: '',
        secondDigit: '',
        thirdDigit: '',
        fourthDigit: '',
        fifthDigit: '',
        sixthDigit: '',
    });

    const dispatch = useDispatch()

    const emailVerifyGenerate = async (userEmail) => {
        setEmailVerifyModal(true);
        setLoading(true);

        try {
            const response = await axios.post(
                API_EMAIL_GENERATE,
                { email: userEmail },
                { headers: { 'Auth-token': authToken } }
            );
            toast.success(response.data || 'Успешно');
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message || 'Ошибка при отправке запроса на подтверждение'
            );
        } finally {
            setLoading(false);
        }
    };

    const emailVerify = async () => {
        const code = Object.values(verificationCode).join('');
        try {
            const response = await axios.post(
                API_EMAIL_VERIFY,
                {
                    email: user.email,
                    code,
                },
                { headers: { 'Auth-token': authToken } }
            );
            dispatch(
                setUser({
                    ...user, // Сохраняем все текущие свойства пользователя
                    emailVerified: response.data, // Обновляем поле emailVerified
                })
            );
            toast.success(response.data || 'Успешно');
            setEmailVerifyModal(false);
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Ошибка при проверке кода'
            );
        }
    };
    const handleInputChange = (e, fieldName, nextInput, prevInput) => {
        const value = e.target.value;
        if (value.length === 1) {
            setVerificationCode((prevState) => ({
                ...prevState,
                [fieldName]: value,
            }));
            if (nextInput) {
                nextInput.focus();
            }
        } else if (value.length === 0 && e.key === "Backspace" && prevInput) {
            prevInput.focus();
        }
    };

    return (
        <div className="bg-white w-4/5 h-[70vh] self-center px-10 rounded-xl shadow-sm flex flex-col items-center justify-between py-5">
            <div className='w-full flex items-center gap-x-3'>
                <img src={userIcon} alt="" />
                <h1 className='uppercase text-main-dull-blue font-medium'>Ваш профиль</h1>
            </div>
            <div className='flex'>
                <div className="flex flex-col items-center gap-y-12 w-1/3">
                    <img src={user.imagePath ? user.imagePath : avatar} alt="User Avatar" className="w-3/4" />
                    <button className="flex items-center border-2 border-main-dull-blue w-1/3 py-2 rounded-xl gap-x-2 justify-center">
                        <p>Загрузить</p>
                        <img src={camera} alt="Camera Icon" />
                    </button>
                    <div className="flex w-1/2 uppercase text-xs justify-between">
                        <p>Дата регистрации</p>
                        <p>{user.registrationDate || "Не указано"}</p>
                    </div>
                </div>
                <div className="flex flex-col w-1/2 gap-y-5">
                    <div className="flex flex-col gap-y-7 font-medium">
                        <div className="space-y-1">
                            <p>Имя пользователя:</p>
                            <p>{user.userName || "Не указано"}</p>
                        </div>
                        <div className="space-y-1">
                            <p>Почта пользователя:</p>
                            <p>{user.email || "Не указано"}</p>
                        </div>
                        <div className="space-y-1">
                            <p>Номер пользователя:</p>
                            <p>{user.userNumber || "Не указано"}</p>
                        </div>
                        <div className="space-y-1">
                            <p>Роли пользователя:</p>
                            <ul className="flex">
                                {Array.isArray(user.userRoles)
                                    ? user.userRoles.map((role, index) => (
                                        <li key={index} className="bg-gray-100 rounded-md px-2 py-1">
                                            {role}
                                        </li>
                                    ))
                                    : <li>{user.userRoles || "Нет ролей"}</li>
                                }
                            </ul>
                        </div>
                        <NavLink to="/edit-profile" className="flex items-center border-2 border-main-dull-blue w-1/2 py-2 rounded-xl gap-x-2 justify-center">
                            <p>Изменить профиль</p>
                            <img src={pen} alt="Pen Icon" className="w-4 h-4" />
                        </NavLink>
                        {/* Статус почты */}
                        <div className="flex w-4/5 gap-x-4 items-center justify-between">
                            <p className="w-1/3">Статус почты : </p>
                            <div className="w-1/2">
                                <div
                                    className={`${user.emailVerified ? "bg-[#E3F3E9]" : "bg-[#FFF2EA]"
                                        } text-center flex items-center justify-center px-2 rounded-full`}
                                >
                                    <div
                                        className={`${user.emailVerified ? "bg-[#11B066]" : "bg-[#E84D43]"
                                            } h-3 w-3 rounded-full`}
                                    ></div>
                                    <p
                                        className={`${user.emailVerified ? "text-[#11B066]" : "text-[#E84D43]"
                                            } px-2 py-1 rounded`}
                                    >
                                        {`${user.emailVerified ? "Подтверждено" : "Не подтверждено"}`}
                                    </p>
                                </div>
                            </div>
                            {!user.emailVerified ? (
                                <button
                                    className="bg-main-dull-blue w-1/3 text-white px-4 rounded-xl py-1"
                                    onClick={() => emailVerifyGenerate(user.email)}
                                    disabled={loading}
                                >
                                    Подтвердить
                                </button>
                            ) : (
                                <div className="w-1/3"></div>
                            )}
                        </div>
                    </div>
                </div>
                {emailVerifyModal && (
                    <div className='w-full absolute top-0 left-0 h-screen flex justify-center items-center'>
                        <div className={`z-20 bg-white ${loading ? 'w-1/6 px-1 py-12' : 'w-1/3 p-4'}  flex flex-col items-center shadow-lg rounded-lg text-center`}>
                            {loading ? (
                                <Spinner className='w-1/2 h-1/6 fill-main-dull-blue' />
                            ) : (
                                <div className='flex flex-col justify-center items-center gap-y-5 py-12'>
                                    <img src={emailVerifyIllustr} alt="" className='w-1/2' />
                                    <h1 className='text-2xl font-bold'>Подтвердите Email</h1>
                                    <p className='w-1/2 text-lg'>Мы выслали вам 6-ти значный код на <span className='font-bold'>{user.email}</span></p>
                                    <div className='w-3/4 flex flex-row items-center justify-center gap-x-5'>
                                        {['firstDigit', 'secondDigit', 'thirdDigit', 'fourthDigit', 'fifthDigit', 'sixthDigit'].map((field, index) => (
                                            <input
                                                key={field}
                                                type="text"
                                                maxLength={1}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        e,
                                                        field,
                                                        document.getElementsByName(['firstDigit', 'secondDigit', 'thirdDigit', 'fourthDigit', 'fifthDigit', 'sixthDigit'][index + 1])?.[0],
                                                        document.getElementsByName(['firstDigit', 'secondDigit', 'thirdDigit', 'fourthDigit', 'fifthDigit', 'sixthDigit'][index - 1])?.[0]
                                                    )
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === "Backspace" && e.target.value === "") {
                                                        // Move focus to previous input if Backspace is pressed and current input is empty
                                                        const prevInput = document.getElementsByName(['firstDigit', 'secondDigit', 'thirdDigit', 'fourthDigit', 'fifthDigit', 'sixthDigit'][index - 1])?.[0];
                                                        if (prevInput) prevInput.focus();
                                                    }
                                                }}
                                                className='w-1/6 border py-5 text-center text-2xl rounded-xl border-main-dull-blue'
                                                name={field}
                                            />
                                        ))}
                                    </div>
                                    <button className="mt-4 bg-main-dull-blue text-white px-4 py-2 rounded" onClick={emailVerify}>
                                        Проверить
                                    </button>
                                    <button
                                        className="mt-4 bg-gray-500 text-white w-1/2 px-4 py-2 rounded"
                                        onClick={() => setEmailVerifyModal(false)}
                                    >
                                        Закрыть
                                    </button>
                                </div>

                            )}

                        </div>
                        <div className='absolute top-0 backdrop-blur-md w-full h-screen z-10'></div>
                    </div>
                )}
            </div>
            <Notification />
        </div>
    );
};

export default SettingsPage;
