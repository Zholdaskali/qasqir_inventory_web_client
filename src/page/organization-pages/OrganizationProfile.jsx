import { NavLink } from "react-router-dom";
import Notification from "../../components/notification/Notification";
import { VscOrganization } from "react-icons/vsc";
import camera from '../../assets/icons/camera.svg';
import avatar from "../../assets/placeholders/avatar.png";
import axios from "axios";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { setOrganization } from "../../store/slices/organizationSlice";
import { useEffect } from "react";
import { API_GET_ORGANIZATION } from "../../api/API";

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
            toast.error(error);
        }
    };

    useEffect(() => {
        getOrganizationDetails();
    }, []);

    return (
        <div className="bg-white w-full md:w-5/6 h-[100vh] md:h-[70vh] self-center px-4 rounded-xl shadow-sm flex flex-col items-center justify-around gap-y-12 py-5 overflow-y-scroll">
            <div className='w-full flex items-center gap-x-3'>
                <VscOrganization size={30} />
                <h1 onClick={() => getOrganizationDetails()} className='uppercase text-main-dull-blue font-medium'>Профиль вашей организации</h1>
            </div>
            <div className='flex flex-col md:flex-row w-full'>
                <div className="flex flex-col items-center gap-y-12 w-full md:w-1/3">
                    <img src={organization.imagePath ? organization.imagePath : avatar} alt="User Avatar" className="w-2/3" />
                    <button className="flex items-center border-2 border-main-dull-blue w-full md:w-1/3 py-2 rounded-xl gap-x-2 justify-center">
                        <p>Загрузить</p>
                        <img src={camera} alt="Camera Icon" />
                    </button>
                    <div className="flex w-full md:w-1/2 uppercase text-xs justify-between">
                        <p>Дата регистрации</p>
                        <p>{organization.registrationDate}</p>
                    </div>
                </div>
                <div className="flex flex-col justify-between w-full md:w-2/3 gap-y-12 mt-5 md:mt-0">
                    <div className="flex flex-col md:flex-row w-full justify-between gap-x-12 font-medium">
                        <div className="flex flex-col gap-y-7 w-full md:w-1/2">
                            <div className="space-y-1">
                                <p>Название Организации:</p>
                                <p>{organization.organizationName}</p>
                            </div>
                            <div className="space-y-1">
                                <p>Почта Организации:</p>
                                <p>{organization.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p>Номер Организации:</p>
                                <p>{organization.phoneNumber}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-y-7 w-full md:w-1/2 mt-5 md:mt-0">
                            <div className="space-y-1">
                                <p>Адресс Организации:</p>
                                <p>{organization.address}</p>
                            </div>
                            <div className="space-y-1">
                                <p>Имя Владельца:</p>
                                <p>{organization.ownerName}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="">Веб-сайт Организации</p>
                                <a className="underline" href={organization.websiteLink}>{organization.websiteLink}</a>
                            </div>
                        </div>
                    </div>
                    {
                        hasRole('admin') && (
                            <NavLink to="/edit-organization-profile" className="flex items-center border-2 border-main-dull-blue w-full md:w-3/4 py-2 rounded-xl gap-x-2 justify-center">
                                <p>Изменить профиль организации</p>
                            </NavLink>
                        )
                    }
                </div>
            </div>
            <Notification />
        </div>
    );
};

export default OrganizationProfile;