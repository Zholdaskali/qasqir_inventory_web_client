/* eslint-disable no-unused-vars */
// React
import { useState, useEffect } from "react";

// API
import { API_PUT_ORGANIZATION } from "../../api/API";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";

// notification
import Notification from "../../components/notification/Notification";
import { toast } from "react-toastify";

// route
import { NavLink, useNavigate } from "react-router-dom";

// assets
import { VscOrganization } from "react-icons/vsc";
import camera from '../../assets/icons/camera.svg';
import avatar from "../../assets/placeholders/avatar.png";
import { setOrganization } from "../../store/slices/organizationSlice";
import { IoMdClose } from "react-icons/io";
import ConfirmationWrapper from "../../components/ui/ConfirmationWrapper";

const EditOrganizationProfile = () => {
    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();
    const organization = useSelector((state) => state.organization);
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);

    const [organizationName, setOrganizationName] = useState("");
    const [organizationEmail, setOrganizationEmail] = useState("");
    const [organizationNumber, setOrganizationNumber] = useState("");
    const [organizationAddress, setOrganizationAdress] = useState("");
    const [organizationOwner, setOrganizationOwner] = useState("");
    const [organizationWebLink, setOrganizationWebLink] = useState("");

    const isSaveDisabled = () => {
        return !organizationName && !organizationEmail && !organizationNumber && !organizationOwner && !organizationAddress && !organizationWebLink;
    };

    const updateOrganizationData = async () => {
        const updatedData = {
            bin: organization.bin,
            organizationName: organizationName.trim() || organization.organizationName,
            email: organizationEmail.trim() || organization.email,
            ownerName: organizationOwner.trim() || organization.ownerName,
            phoneNumber: organizationNumber.trim() || organization.phoneNumber,
            websiteLink: organizationWebLink.trim() || organization.websiteLink,
            address: organizationAddress.trim() || organization.address,
        };

        try {
            const response = await axios.put(API_PUT_ORGANIZATION, updatedData, {
                headers: { "Auth-token": authToken },
            });

            // toast.success(response.data.message || "Успешно");
            dispatch(setOrganization({ ...response.data.body }));
            setTimeout(() => navigate('/organization-profile'), 2500);
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при обновлении данных организации");
        }
    };

    return (
        <div className="bg-white w-5/6 h-[70vh] self-center px-4 rounded-xl shadow-sm flex flex-col items-center justify-around gap-y-12">
            <div className='w-full flex items-center justify-between gap-x-3'>
                <div className="w-1/2 flex items-center justify-start">
                    <VscOrganization size={30} />
                    <h1 className='uppercase text-main-dull-blue font-medium'>Обновить Профиль вашей организации</h1>
                </div>
                <NavLink to="/organization-profile">
                    <IoMdClose size={30} className="cursor-pointer" />
                </NavLink>
            </div>
            <div className='flex w-full'>
                <div className="flex flex-col items-center gap-y-12 w-1/3">
                    <img src={organization.imagePath ? organization.imagePath : avatar} alt="User Avatar" className="w-2/3" />
                    <button className="flex items-center border-2 border-main-dull-blue w-1/3 py-2 rounded-xl gap-x-2 justify-center">
                        <p>Загрузить</p>
                        <img src={camera} alt="Camera Icon" />
                    </button>
                    <div className="flex w-1/2 uppercase text-xs justify-between">
                        <p>Дата регистрации</p>
                        <p>{organization.registrationDate}</p>
                    </div>
                </div>
                <div className="flex flex-col justify-between w-2/3 gap-y-12">
                    <div className="flex flex-row w-3/4 justify-between gap-x-12 font-medium">
                        <div className="flex flex-col gap-y-7">
                            <div className="space-y-1">
                                <p>Название Организации:</p>
                                <input
                                    type="text"
                                    placeholder={organization.organizationName}
                                    value={organizationName}
                                    className="px-2 py-1 border rounded-xl"
                                    onChange={(e) => setOrganizationName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <p>Почта Организации:</p>
                                <input
                                    type="text"
                                    placeholder={organization.email}
                                    value={organizationEmail}
                                    className="px-2 py-1 border rounded-xl"
                                    onChange={(e) => setOrganizationEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <p>Номер Организации:</p>
                                <input
                                    type="text"
                                    placeholder={organization.phoneNumber}
                                    value={organizationNumber}
                                    className="px-2 py-1 border rounded-xl"
                                    onChange={(e) => setOrganizationNumber(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-y-7">
                            <div className="space-y-1">
                                <p>Адресс Организации:</p>
                                <input
                                    type="text"
                                    placeholder={organization.address}
                                    value={organizationAddress}
                                    className="px-2 py-1 border rounded-xl"
                                    onChange={(e) => setOrganizationAdress(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <p>Имя Владельца:</p>
                                <input
                                    type="text"
                                    placeholder={organization.ownerName}
                                    value={organizationOwner}
                                    className="px-2 py-1 border rounded-xl"
                                    onChange={(e) => setOrganizationOwner(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <p className="">Веб-сайт Организации</p>
                                <input
                                    type="text"
                                    placeholder={organization.websiteLink}
                                    value={organizationWebLink}
                                    className="px-2 py-1 border rounded-xl"
                                    onChange={(e) => setOrganizationWebLink(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <ConfirmationWrapper
                        title="Данные организации будут изменены!"
                        onConfirm={updateOrganizationData}
                    >
                        <button
                            disabled={isSaveDisabled()}
                            className={`flex items-center border-2 border-main-dull-blue w-3/4 py-2 rounded-xl gap-x-2 justify-center ${isSaveDisabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Сохранить
                        </button>
                    </ConfirmationWrapper>
                </div>
            </div>
            <Notification />
        </div>
    );
};

export default EditOrganizationProfile;
