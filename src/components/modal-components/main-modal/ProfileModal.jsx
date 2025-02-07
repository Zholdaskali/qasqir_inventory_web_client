/* eslint-disable react/prop-types */
import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../../../store/slices/userSlice';
import { API_SIGN_OUT } from '../../../api/API';

import { useNavigate } from 'react-router-dom';

import avatar from '../assets/placeholders/avatar.png';
import axios from 'axios';
import { toast } from 'react-toastify';

import { IoSettings } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";

const ProfileModal = ({ setShowProfile }) => {
    const user = useSelector((state) => state.user);
    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userRole = useMemo(() => {
        if (user.userRoles == 'super_admin') {
            return 'Высший Админ';
        } else if (user.userRoles == 'company_admin') {
            return 'Админ';
        } else {
            return 'Работник';
        }
    }, [user.userRoles]);

    const fetchSignOut = async () => {
        try {
            const response = await axios.post(
                API_SIGN_OUT,
                {},
                { headers: { "Auth-token": authToken } }
            );
            toast.success(response.data.message || 'Вы успешно вышли из системы');
            dispatch(clearUser());
            navigate('/sign-in');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка выхода');
        }
    };

    return (
        <div className="bg-white rounded-xl absolute py-5 px-8 shadow-md top-16 z-10 w-96 right-4">
            <div className="flex flex-col items-center gap-y-5">
                <div className="w-full flex justify-between">
                    <IoSettings size={30} className="cursor-pointer" color="#904dc0" />
                    <IoMdClose
                        size={30}
                        onClick={() => setShowProfile(false)}
                        className="cursor-pointer"
                        color="#904dc0"
                    />
                </div>
                <img
                    src={user.imagePath ? user.imagePath : avatar}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover"
                />

                <h1 className="font-bold text-lg">{user.userName}</h1>
                <div className="flex flex-col gap-y-3">
                    <p>Дата регистрации: {new Date(user.registrationDate).toLocaleDateString()}</p>
                    <p>Номер: {user.userNumber}</p>
                    <p>Почта: {user.email}</p>
                    <div className="flex items-center gap-x-2">
                        <p>Подтверждение email: </p>
                        <div
                            className={`${user.emailVerified ? 'bg-main-green' : 'bg-red-500'
                                } w-5 h-5 rounded-full`}
                        ></div>
                    </div>
                    <p>{userRole}</p>
                </div>
                <button
                    className="bg-main-purp py-2 px-5 text-white rounded-xl"
                    onClick={fetchSignOut}
                >
                    Выйти
                </button>
            </div>
        </div>
    );
};

export default ProfileModal;
