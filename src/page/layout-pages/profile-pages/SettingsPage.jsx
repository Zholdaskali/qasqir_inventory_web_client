import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import avatar from '../../../assets/placeholders/avatar.png';
import camera from '../../../assets/icons/camera.svg';
import pen from '../../../assets/icons/pen.svg';
import emailVerifyIllustr from '../../../assets/illustrations/email-verify.svg';
import userIcon from '../../../assets/icons/user.svg';
import Cookies from 'js-cookie';
import { Spinner } from 'flowbite-react';
import { API_EMAIL_GENERATE, API_EMAIL_VERIFY } from '../../../api/API';
import axios from 'axios';
import Notification from '../../../components/notification/Notification';
import { toast } from 'react-toastify';
import { setUser } from '../../../store/slices/userSlice';
import { NavLink } from 'react-router-dom';
import ConfirmationWrapper from '../../../components/ui/ConfirmationWrapper';

// Функция для перевода ролей (unchanged)
const translateRole = (role) => {
  const roleTranslations = {
    'employee': 'Сотрудник',
    'admin': 'Администратор',
    'warehouse_manager': 'Менеджер склада',
    'storekeeper': 'Кладовщик'
  };
  return roleTranslations[role] || role;
};

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

    const dispatch = useDispatch();

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
        setLoading(true);
        const code = Object.values(verificationCode).join('');
        try {
            const response = await axios.post(
                API_EMAIL_VERIFY,
                { email: user.email, code },
                { headers: { 'Auth-token': authToken } }
            );
            dispatch(setUser({ ...user, emailVerified: response.data }));
            toast.success(response.data || 'Успешно');
            setEmailVerifyModal(false);
            setVerificationCode({
                firstDigit: '',
                secondDigit: '',
                thirdDigit: '',
                fourthDigit: '',
                fifthDigit: '',
                sixthDigit: '',
            });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка при проверке кода');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e, fieldName, nextInput, prevInput) => {
        const value = e.target.value;
        if (/^[0-9]?$/.test(value)) { // Allow only digits
            setVerificationCode((prevState) => ({ ...prevState, [fieldName]: value }));
            if (value.length === 1 && nextInput) {
                nextInput.focus();
            }
        }
    };

    const handleKeyDown = (e, fieldName, prevInput) => {
        if (e.key === "Backspace" && !verificationCode[fieldName] && prevInput) {
            prevInput.focus();
        }
    };

    // Check if all digits are filled
    const isCodeComplete = Object.values(verificationCode).every((digit) => digit.length === 1);

    // Prevent backdrop click from propagating when clicking inside modal
    const handleModalClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className="bg-white w-full md:w-4/5 max-w-4xl mx-auto h-[90vh] md:h-[70vh] rounded-2xl shadow-lg flex flex-col items-center py-8 px-6 md:px-12 overflow-y-auto">
            <div className="w-full flex items-center gap-x-3 mb-8">
                <img src={userIcon} alt="User Icon" className="w-6 h-6" />
                <h1 className="uppercase text-main-dull-blue text-lg md:text-xl font-semibold tracking-wide">
                    Ваш профиль
                </h1>
            </div>

            <div className="flex flex-col md:flex-row w-full gap-8">
                <div className="flex flex-col items-center gap-y-6 w-full md:w-1/3">
                    <img
                        src={user.imagePath ? user.imagePath : avatar}
                        alt="User Avatar"
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-gray-200 object-cover shadow-sm"
                    />
                    <div className="text-center text-xs text-gray-500">
                        <p className="font-medium">Дата регистрации:</p>
                        <p>{user.registrationDate || "Не указано"}</p>
                    </div>
                </div>

                <div className="flex flex-col w-full md:w-2/3 gap-y-6">
                    <div className="space-y-4 text-sm">
                        <div>
                            <p className="text-gray-600 font-medium">Имя пользователя:</p>
                            <p className="text-gray-800">{user.userName || "Не указано"}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Почта пользователя:</p>
                            <p className="text-gray-800">{user.email || "Не указано"}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Номер пользователя:</p>
                            <p className="text-gray-800">{user.userNumber || "Не указано"}</p>
                        </div>
                        <div>
                            <p className="text-gray-600 font-medium">Роли пользователя:</p>
                            <ul className="flex flex-wrap gap-2 mt-1">
                                {Array.isArray(user.userRoles) ? (
                                    user.userRoles.map((role, index) => (
                                        <li
                                            key={index}
                                            className="bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-700 shadow-sm"
                                        >
                                            {translateRole(role)}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-600">{translateRole(user.userRoles) || "Нет ролей"}</li>
                                )}
                            </ul>
                        </div>
                    </div>

                    <NavLink
                        to="/edit-profile"
                        className="flex items-center justify-center gap-x-2 border-2 border-main-dull-blue text-main-dull-blue px-6 py-2 rounded-lg hover:bg-main-dull-blue hover:text-white transition-all duration-200 shadow-md w-full md:w-auto"
                    >
                        <span>Изменить профиль</span>
                        <img src={pen} alt="Pen Icon" className="w-4 h-4" />
                    </NavLink>

                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <p className="text-gray-600 font-medium w-full md:w-1/3">Статус почты:</p>
                        <div className={`flex items-center justify-center w-full md:w-1/3 px-3 py-1 rounded-full ${user.emailVerified ? "bg-[#E3F3E9]" : "bg-[#FFF2EA]"} shadow-sm`}>
                            <div className={`h-2 w-2 rounded-full ${user.emailVerified ? "bg-[#11B066]" : "bg-[#E84D43]"} mr-2`}></div>
                            <p className={`${user.emailVerified ? "text-[#11B066]" : "text-[#E84D43]"} text-sm`}>
                                {user.emailVerified ? "Подтверждено" : "Не подтверждено"}
                            </p>
                        </div>
                        {!user.emailVerified && (
                            <button
                                className="bg-main-dull-blue text-white px-6 py-2 rounded-lg hover:bg-main-purp-dark transition-all duration-200 shadow-md w-full md:w-auto"
                                onClick={() => emailVerifyGenerate(user.email)}
                                disabled={loading}
                            >
                                Подтвердить
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {emailVerifyModal && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm">
                    <div
                        className={`bg-white rounded-2xl shadow-xl z-50 flex flex-col items-center ${loading ? 'w-32 py-12' : 'w-full max-w-md p-8'}`}
                        onClick={handleModalClick}
                    >
                        {loading ? (
                            <Spinner className="w-12 h-12 fill-main-dull-blue" />
                        ) : (
                            <div className="flex flex-col items-center gap-y-6">
                                <img src={emailVerifyIllustr} alt="Email Verification Illustration" className="w-1/3" />
                                <h1 className="text-xl font-semibold text-gray-800">Подтвердите Email</h1>
                                <p className="text-sm text-gray-600 text-center">
                                    Мы выслали 6-значный код на <span className="font-bold">{user.email}</span>
                                </p>
                                <div className="flex gap-x-3">
                                    {['firstDigit', 'secondDigit', 'thirdDigit', 'fourthDigit', 'fifthDigit', 'sixthDigit'].map((field, index) => (
                                        <input
                                            key={field}
                                            type="text"
                                            maxLength={1}
                                            value={verificationCode[field]}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    e,
                                                    field,
                                                    document.getElementsByName(['firstDigit', 'secondDigit', 'thirdDigit', 'fourthDigit', 'fifthDigit', 'sixthDigit'][index + 1])?.[0],
                                                    document.getElementsByName(['firstDigit', 'secondDigit', 'thirdDigit', 'fourthDigit', 'fifthDigit', 'sixthDigit'][index - 1])?.[0]
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleKeyDown(
                                                    e,
                                                    field,
                                                    document.getElementsByName(['firstDigit', 'secondDigit', 'thirdDigit', 'fourthDigit', 'fifthDigit', 'sixthDigit'][index - 1])?.[0]
                                                )
                                            }
                                            className="w-12 h-12 border border-main-dull-blue rounded-lg text-center text-xl focus:outline-none focus:ring-2 focus:ring-main-dull-blue shadow-sm"
                                            name={field}
                                            aria-label={`Verification code digit ${index + 1}`}
                                            autoFocus={index === 0} // Auto-focus first input
                                        />
                                    ))}
                                </div>
                                <ConfirmationWrapper
                                    title="Подтверждение кода"
                                    message="Вы уверены, что хотите подтвердить этот код?"
                                    onConfirm={emailVerify}
                                >
                                    <button
                                        className="bg-main-dull-blue text-white px-6 py-2 rounded-lg hover:bg-main-purp-dark transition-all duration-200 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={!isCodeComplete || loading}
                                    >
                                        Проверить
                                    </button>
                                </ConfirmationWrapper>
                                <button
                                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md"
                                    onClick={() => setEmailVerifyModal(false)}
                                    aria-label="Close email verification modal"
                                    disabled={loading}
                                >
                                    Закрыть
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <Notification />
        </div>
    );
};

export default SettingsPage;