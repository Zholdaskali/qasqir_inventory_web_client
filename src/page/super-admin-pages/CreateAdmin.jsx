import { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_CREATE_COMPANY_ADMIN } from "../../api/API";
import Notification from "../../components/notification/Notification";
import { toast } from "react-toastify";

const CreateAdmin = () => {
    const [userName, setUserName] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [userNumber, setUserNumber] = useState('')

    const token = useSelector((state) => state.token.token);

    const handleCreateCompany = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                API_CREATE_COMPANY_ADMIN, 
                {
                    userName: userName,
                    password: password,
                    email: email,
                    userNumber: userNumber
                },
                {
                    headers: {
                        'Auth-token': token
                    }
                }
            );
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Произошла ошибка");
        }
    };

    return (
        <div className="w-full">
                <div className='h-screen flex justify-center items-center'>
                    <div className='w-1/3'>
                        <h1 className='text-xl mb-5'>Добавить админа организации</h1>
                        <form 
                            className="w-3/4 text-start flex flex-col items-start gap-8 text-[#101540]" 
                            autoComplete="off"
                            onSubmit={handleCreateCompany}
                        >
                            <input
                                type="text"
                                placeholder="Логин для админа"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full bg-[#EDF0F2] py-4 border hover:border-main-green transition-colors border-main-purp px-3 rounded-lg"
                                required
                            />
                            <input
                                type="text"
                                placeholder="Пароль для админа"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#EDF0F2] py-4 border hover:border-main-green transition-colors border-main-purp px-3 rounded-lg"
                                required
                            />
                            <input
                                type="email"
                                placeholder="Почта админа"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#EDF0F2] py-4 border hover:border-main-green transition-colors border-main-purp px-3 rounded-lg"
                                required
                            />
                            <input
                                type="phone"
                                placeholder="Номер телефона админа"
                                value={userNumber}
                                onChange={(e) => setUserNumber(e.target.value)}
                                className="w-full bg-[#EDF0F2] py-4 border hover:border-main-green transition-colors border-main-purp px-3 rounded-lg"
                                required
                            />
                            <button 
                                className="bg-main-purp text-xl font-bold hover:bg-main-green transition-colors w-full self-center text-white py-4 rounded-xl" 
                                type="submit"
                            >
                                Создать админа организации
                            </button>
                        </form>
                    </div>
                    <Notification />
                </div>
        </div>
    );
};

export default CreateAdmin;
