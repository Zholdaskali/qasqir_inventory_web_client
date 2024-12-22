import axios from "axios";

import { useDispatch, useSelector } from "react-redux";

import { saveInviteList } from "../../store/slices/inviteListSlice";

import { API_GET_INVITE_LIST } from "../../api/API";
import { toast } from "react-toastify";
import Notification from "../../components/notification/Notification";


const InviteList = () => {

    const authToken = useSelector((state) => state.token.token)
    const disptach = useDispatch()

    const inviteList = useSelector((state) => state.inviteList)

    const fetchInviteList = async () => {
        try {
            const response = await axios.get(API_GET_INVITE_LIST, {
                headers: { "Auth-token": authToken },
            });

            const data = response.data.body;

            if (data) {
                disptach(saveInviteList(data)); // Заменяем список новыми данными
                toast.success(response.data.message || "Успешно");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при загрузке данных");
        }
    };

    return (
        <div className="h-[90vh] flex flex-col w-full justify-center items-center">
            <div className='flex w-full justify-between items-center border-b py-5'>
                <h1 className="text-2xl">Приглашенные Пользователи</h1>
                <button
                    onClick={fetchInviteList}
                    className="bg-main-dull-gray px-8 text-sm py-3.5 text-white rounded-lg shadow-xl hover:bg-main-dull-blue"
                >
                    Вывести
                </button>
            </div>
            <div className="overflow-auto h-[70vh] w-full mt-7 p-5 rounded-xl">
                <table className="table-auto w-full border-separate border-spacing-y-4">
                    <thead className="text-[#A49E9E] bg-[#FFFFFF] bg-opacity-50 h-14 w-full ">
                        <tr className="text-sm">
                            <th className="text-start">ID</th>
                            <th className="text-start">Имя пользователя</th>
                            <th className="text-start">Почта пользователя</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white border-b border-full">
                        {inviteList.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="py-4 px-2">{item.id}</td>
                                <td className="py-4 px-2">{item.userName}</td>
                                <td className="py-4 px-2">{item.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Notification />
        </div>
    );
}

export default InviteList;
