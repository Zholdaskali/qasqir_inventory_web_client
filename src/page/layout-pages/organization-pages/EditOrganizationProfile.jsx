/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { API_PUT_ORGANIZATION } from "../../../api/API";
import axios from "axios";
import Notification from "../../../components/notification/Notification";
import { toast } from "react-toastify";
import { setOrganization } from "../../../store/slices/organizationSlice";
import { VscOrganization } from "react-icons/vsc";
import { IoMdClose } from "react-icons/io";
import camera from '../../../assets/icons/camera.svg';
import avatar from "../../../assets/placeholders/avatar.png";
import ConfirmationWrapper from "../../../components/ui/ConfirmationWrapper";

const EditOrganizationProfile = () => {
    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();
    const organization = useSelector((state) => state.organization);
    const navigate = useNavigate();

    const [organizationName, setOrganizationName] = useState("");
    const [organizationEmail, setOrganizationEmail] = useState("");
    const [organizationNumber, setOrganizationNumber] = useState("");
    const [organizationAddress, setOrganizationAddress] = useState("");
    const [organizationOwner, setOrganizationOwner] = useState("");
    const [organizationWebLink, setOrganizationWebLink] = useState("");

    const isSaveDisabled = () => !organizationName && !organizationEmail && !organizationNumber && !organizationOwner && !organizationAddress && !organizationWebLink;

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
            dispatch(setOrganization({ ...response.data.body }));
            toast.success(response.data.message || "Успешно");
            setTimeout(() => navigate('/organization-profile'), 2500);
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при обновлении данных организации");
        }
    };

    return (
        <div className="bg-white w-full md:w-5/6 max-w-5xl mx-auto h-[90vh] md:h-[70vh] rounded-2xl shadow-lg flex flex-col items-center py-8 px-6 md:px-12 overflow-y-auto">
            <div className="w-full flex items-center justify-between mb-8">
                <div className="flex items-center gap-x-3">
                    <VscOrganization size={28} className="text-main-dull-blue" />
                    <h1 className="uppercase text-main-dull-blue text-lg md:text-xl font-semibold tracking-wide">
                        Обновить профиль вашей организации
                    </h1>
                </div>
                <NavLink to="/organization-profile">
                    <IoMdClose size={28} className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer" />
                </NavLink>
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
                                <input
                                    type="text"
                                    placeholder={organization.organizationName || "Введите название"}
                                    value={organizationName}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-dull-blue shadow-sm"
                                    onChange={(e) => setOrganizationName(e.target.value)}
                                />
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">Почта Организации:</p>
                                <input
                                    type="text"
                                    placeholder={organization.email || "Введите почту"}
                                    value={organizationEmail}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-dull-blue shadow-sm"
                                    onChange={(e) => setOrganizationEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">Номер Организации:</p>
                                <input
                                    type="text"
                                    placeholder={organization.phoneNumber || "Введите номер"}
                                    value={organizationNumber}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-dull-blue shadow-sm"
                                    onChange={(e) => setOrganizationNumber(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-600 font-medium">Адрес Организации:</p>
                                <input
                                    type="text"
                                    placeholder={organization.address || "Введите адрес"}
                                    value={organizationAddress}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-dull-blue shadow-sm"
                                    onChange={(e) => setOrganizationAddress(e.target.value)}
                                />
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">Имя Владельца:</p>
                                <input
                                    type="text"
                                    placeholder={organization.ownerName || "Введите имя"}
                                    value={organizationOwner}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-dull-blue shadow-sm"
                                    onChange={(e) => setOrganizationOwner(e.target.value)}
                                />
                            </div>
                            <div>
                                <p className="text-gray-600 font-medium">Веб-сайт Организации:</p>
                                <input
                                    type="text"
                                    placeholder={organization.websiteLink || "Введите ссылку"}
                                    value={organizationWebLink}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-dull-blue shadow-sm"
                                    onChange={(e) => setOrganizationWebLink(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <ConfirmationWrapper title="Данные организации будут изменены!" onConfirm={updateOrganizationData}>
                        <button
                            disabled={isSaveDisabled()}
                            className={`w-full bg-main-dull-blue text-white px-6 py-2 rounded-lg hover:bg-main-purp-dark transition-all duration-200 shadow-md ${isSaveDisabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
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