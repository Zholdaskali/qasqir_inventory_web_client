/* eslint-disable no-unused-vars */
import axios from 'axios';
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import successIcon from '../assets/success.svg';
import { API_PASS_RECOVER } from '../api/API';
import notFound from '../assets/illustrations/not-found.svg';
import resetPassword from '../assets/illustrations/reset-password.svg';

function PassRecover() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('Invite-token');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passCheck, setPassCheck] = useState(true);
    const [passChangeSuccess, setPassChangeSuccess] = useState(false);
    const navigate = useNavigate();

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setPassCheck(false);
            return;
        } else {
            setPassCheck(true);
        }

        try {
            const response = await axios.put(API_PASS_RECOVER + token, { newPassword });
            console.log(response.data);
            setPassChangeSuccess(true);
            setTimeout(() => navigate('/sign-in'), 3000);
        } catch (error) {
            console.log(error.response ? error.response.data : 'Error resetting password');
        }
    };

    return (
        <div className="h-screen flex justify-center items-center bg-[#F8F9FA]">
            {passChangeSuccess ? (
                <div className="absolute h-screen top-1/3 left-0 w-full text-black">
                    <div className="flex justify-center items-center w-full">
                        <div className="bg-white w-2/5 md:w-1/5 px-4 py-8 md:px-2 rounded-xl">
                            <div className="flex flex-col items-center gap-y-8 md:gap-y-16">
                                <img src={successIcon} className="w-1/2 md:w-1/3" alt="Success" />
                                <h2>Пароль Успешно изменён</h2>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
            {!token ? (
                <>
                    <img src={notFound} alt="Not Found" />
                    <h2>Ссылка не действительна</h2>
                </>
            ) : (
                <div className="w-1/3 flex flex-col items-center bg-white py-16 rounded-xl shadow-lg">
                    <img src={resetPassword} alt="Reset Password" className="w-2/3" />
                    <h1 className="text-xl mb-5 text-main-dull-blue font-medium">Создать новый пароль</h1>
                    <form
                        onSubmit={handlePasswordReset}
                        className="w-3/4 text-start flex flex-col items-start gap-8 text-[#101540]"
                        autoComplete="off"
                    >
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Создайте новый пароль"
                            className="w-full bg-[#EDF0F2] py-4 border hover:border-main-dull-blue transition-colors border-main-dull-gray px-3 rounded-lg"
                            required
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Подтвердите новый пароль"
                            className="w-full bg-[#EDF0F2] py-4 border hover:border-main-dull-blue transition-colors border-main-dull-gray px-3 rounded-lg"
                            required
                        />
                        {!passCheck && <p className="text-red-500 text-sm">Пароли не совпадают</p>}
                        <button
                            className="bg-main-dull-blue text-xl font-bold hover:bg-main-dull-gray transition-colors w-full self-center text-white py-4 rounded-xl"
                            type="submit"
                            disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                        >
                            Обновить пароль
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default PassRecover;
