import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { saveInviteList } from "../../../store/slices/inviteListSlice";
import { API_GET_INVITE_LIST } from "../../../api/API";
import { toast } from "react-toastify";
import Notification from "../../../components/notification/Notification";
import { CiCalendarDate } from "react-icons/ci"; // Иконка для фильтров (если нужно)

const InviteList = () => {
    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();
    const inviteList = useSelector((state) => state.inviteList);

    const fetchInviteList = async () => {
        try {
            const response = await axios.get(API_GET_INVITE_LIST, {
                headers: { "Auth-token": authToken },
            });

            const data = response.data.body;

            if (data) {
                dispatch(saveInviteList(data)); // Заменяем список новыми данными
                toast.success(response.data.message || "Успешно");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при загрузке данных");
        }
    };

    return (
        <div className="h-[90vh] w-full flex flex-col p-4">
            {/* Заголовок и фильтры */}
            <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-3 gap-3">
                <h1 className="text-xl font-semibold">Приглашения</h1>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {/* Кнопка "Вывести" */}
                    <div className="flex gap-2 items-end">
                        <button
                            onClick={fetchInviteList}
                            className="bg-blue-600 px-5 py-2 text-sm text-white rounded-md shadow-md hover:bg-blue-700 transition-all duration-200"
                        >
                            Вывести
                        </button>
                    </div>
                </div>
            </div>

            {/* Таблица */}
            <div className="flex-1 overflow-auto mt-4 rounded-lg scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                <table className="w-full table-auto border-separate border-spacing-y-1">
                    <thead className="bg-gray-100 text-gray-600 sticky top-0 text-sm">
                        <tr>
                            <th className="text-left px-3 py-2">ID</th>
                            <th className="text-left px-3 py-2">Имя пользователя</th>
                            <th className="text-left px-3 py-2">Почта пользователя</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white text-sm">
                        {inviteList.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2">{item.id}</td>
                                <td className="px-3 py-2">{item.userName}</td>
                                <td className="px-3 py-2">{item.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Notification />
        </div>
    );
};

export default InviteList;