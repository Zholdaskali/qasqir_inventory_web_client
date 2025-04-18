/* eslint-disable react/prop-types */
import { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../../../store/slices/userSlice';
import { API_SIGN_OUT } from '../../../api/API';
import { useNavigate } from 'react-router-dom';
import avatar from '../assets/placeholders/avatar.png';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IoSettings, IoMdClose } from 'react-icons/io5';
import ConfirmationWrapper from '../../ui/ConfirmationWrapper'; // Added import

const ProfileModal = ({ setShowProfile }) => {
    const user = useSelector((state) => state.user);
    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isSigningOut, setIsSigningOut] = useState(false);

    if (!user || !user.userName) {
        return (
            <div className="bg-white rounded-xl p-5 shadow-md">
                Данные пользователя недоступны
            </div>
        );
    }

    const userRole = useMemo(() => {
        if (user.userRoles === 'super_admin') return 'Высший Админ';
        if (user.userRoles === 'company_admin') return 'Админ';
        return 'Работник';
    }, [user.userRoles]);

    const fetchSignOut = async () => {
        setIsSigningOut(true);
        try {
            const response = await axios.post(
                API_SIGN_OUT,
                {},
                { headers: { 'Auth-token': authToken } }
            );
            toast.success(response.data.message || 'Вы успешно вышли из системы');
            dispatch(clearUser());
            navigate('/sign-in');
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Ошибка выхода');
        } finally {
            setIsSigningOut(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg absolute top-16 right-4 w-96 z-20 p-6 transition-all duration-300 ease-in-out">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <IoSettings
                        size={24}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        color="#904dc0"
                        aria-label="Настройки"
                    />
                    <span className="text-sm font-medium text-gray-600">Настройки</span>
                </div>
                <IoMdClose
                    size={24}
                    onClick={() => setShowProfile(false)}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    color="#904dc0"
                    aria-label="Закрыть профиль"
                />
            </div>

            {/* Avatar and Name */}
            <div className="flex flex-col items-center mb-6">
                <img
                    src={user.imagePath || avatar}
                    alt="Аватар пользователя"
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                />
                <h1 className="mt-3 text-xl font-semibold text-gray-800">{user.userName}</h1>
                <p className="text-sm text-gray-500">{userRole}</p>
            </div>

            {/* User Info */}
            <div className="space-y-3 text-sm text-gray-700">
                <div className="flex justify-between">
                    <span className="font-medium">Дата регистрации:</span>
                    <span>{new Date(user.registrationDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">Номер:</span>
                    <span>{user.userNumber || 'Не указан'}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-medium">Почта:</span>
                    <span className="truncate max-w-[200px]">{user.email}</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="font-medium">Подтверждение email:</span>
                    <div
                        className={`w-4 h-4 rounded-full ${user.emailVerified ? 'bg-main-green' : 'bg-red-500'}`}
                        title={user.emailVerified ? 'Подтверждено' : 'Не подтверждено'}
                    />
                </div>
            </div>

            {/* Sign Out Button with Confirmation */}
            <ConfirmationWrapper
                title="Подтверждение выхода"
                message="Вы уверены, что хотите выйти из системы?"
                onConfirm={fetchSignOut}
            >
                <button
                    className="w-full mt-6 bg-main-purp py-2 px-5 text-white rounded-lg hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSigningOut}
                    aria-label="Выйти из системы"
                >
                    {isSigningOut ? 'Выход...' : 'Выйти'}
                </button>
            </ConfirmationWrapper>
        </div>
    );
};

export default ProfileModal;