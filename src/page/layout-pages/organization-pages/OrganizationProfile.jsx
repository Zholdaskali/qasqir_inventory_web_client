import { NavLink } from "react-router-dom";
import Notification from "../../../components/notification/Notification";
import { VscOrganization } from "react-icons/vsc";
import camera from '../../../assets/icons/camera.svg';
import avatar from "../../../assets/placeholders/avatar.png";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { setOrganization } from "../../../store/slices/organizationSlice";
import { useEffect } from "react";
import { API_GET_ORGANIZATION } from "../../../api/API";

const OrganizationProfile = () => {
    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();
    const organization = useSelector((state) => state.organization);
    const user = useSelector((state) => state.user);
    const hasRole = (role) => user?.userRoles?.includes(role);

    const getOrganizationDetails = async () => {
        try {
            const response = await axios.get(
                API_GET_ORGANIZATION,
                { headers: { "Auth-token": authToken } }
            );
            dispatch(setOrganization(response.data.body));
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при загрузке данных организации");
        }
    };

    useEffect(() => {
        getOrganizationDetails();
    }, []);

    return (
        <div className="bg-white w-full md:w-5/6 max-w-5xl mx-auto h-[90vh] md:h-[70vh] rounded-2xl shadow-lg flex flex-col items-center py-8 px-6 md:px-12 overflow-y-auto">
            <div className="w-full flex items-center gap-x-3 mb-8">
                <VscOrganization size={28} className="text-main-dull-blue" />
                <h1
                    onClick={() => getOrganizationDetails()}
                    className="uppercase text-main-dull-blue text-lg md:text-xl font-semibold tracking-wide cursor-pointer hover:text-main-purp-dark transition-colors"
                >
                    Профиль вашей организации
                </h1>
            </div>

            <div className="flex flex-col md:flex-row w-full gap-8">
                <div className="flex flex-col items-center gap-y-6 w-full md:w-1/3">
                    <img
                        src={organization.imagePath ? organization.imagePath : avatar}
                        alt="Organization Avatar"
                        className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-gray-200 object-cover shadow-sm"
                    />
                    <button className="flex items-center gap-x-2 border-2 border-main-dull-blue text-main-dull-blue px-6 py-2 rounded-lg hover:bg-main-dull-blue hover:text-white transition-all duration-200 shadow-md">
                        <span>Загрузить</span>
                        <img src={camera} alt="Camera Icon" className="w-5 h-5" />
                    </button>
                    <div className="text-center text-xs text-gray-500">
                        <p className="font-medium">Дата регистрации:</p>
                        <p>{organization.registrationDate || "Не указано"}</p>
                    </div>
                </div>

                <div className="flex flex-col w-full md:w-2/3 gap-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-600 font-medium">Название Организации:</p>
                                <p className="text-gray-800">{organization.organizationName || "Не указано"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">Почта Организации:</p>
                                <p className="text-gray-800">{organization.email || "Не указано"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">Номер Организации:</p>
                                <p className="text-gray-800">{organization.phoneNumber || "Не указано"}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-600 font-medium">Адрес Организации:</p>
                                <p className="text-gray-800">{organization.address || "Не указано"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">Имя Владельца:</p>
                                <p className="text-gray-800">{organization.ownerName || "Не указано"}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">Веб-сайт Организации:</p>
                                <a
                                    href={organization.websiteLink}
                                    className="text-main-dull-blue underline hover:text-main-purp-dark transition-colors"
                                >
                                    {organization.websiteLink || "Не указано"}
                                </a>
                            </div>
                        </div>
                    </div>

                    {hasRole('admin') && (
                        <NavLink
                            to="/edit-organization-profile"
                            className="flex items-center justify-center border-2 border-main-dull-blue text-main-dull-blue px-6 py-2 rounded-lg hover:bg-main-dull-blue hover:text-white transition-all duration-200 shadow-md w-full md:w-auto self-end"
                        >
                            <span>Изменить профиль организации</span>
                        </NavLink>
                    )}
                </div>
            </div>

            <Notification />
        </div>
    );
};

export default OrganizationProfile;