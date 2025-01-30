import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

import { API_GET_NOMENCLATURES } from "../../api/API";
import { saveUserList } from "../../store/slices/userListSlice";

import avatar from "../../assets/placeholders/avatar.png";
import filterIcon from "../../assets/icons/filter.svg";
import { IoIosNotificationsOutline } from "react-icons/io";
import { HiRefresh } from "react-icons/hi";
import CreateInviteModal from "../../components/super-admin-components/log-components/CreateInviteModal";
import UserProfileModal from "../../components/modal-components/UserProfileModal";

const NomenclatureList = () => {
    const authToken = useSelector((state) => state.token.token);
    const dispatch = useDispatch();
    const nomenclatures = useSelector((state) => state.nomenclatureList);
    const nomenclature = useSelector((state) => state.nomenclature);

    const [nomenclatureModal, setNomenclatureModal] = useState(false);
    const [selectedUser, setSelectedNomenclature] = useState(null);

    const [createNomenclatureModal, setCreateNomenclatureModal] = useState(false);
    const [isInviteButtonDisabled, setIsCreateNomenclatureButtonDisable] = useState(false);

    const fetchNomenclatureList = async () => {
        try {
            const response = await axios.get(API_GET_NOMENCLATURES, {
                headers: { "Auth-token": authToken },
            });
            dispatch(save(response.data.body));
            toast.success("Успешно");
        } catch (error) {
            toast.error("Ошибка загрузки пользователей");
        }
    };

    useEffect(() => {
        fetchNomenclatureList();
    }, []);

    const handleNomenclatureModal = (nomenclature) => {
        setSelectedNomenclature(nomenclature);
        setNomenclatureModal(true);
    };

    const handleCreateCategoryModal = () => {
        setCreateNomenclatureModal(true);
    };

    const handleModalClose = (isDeleted) => {
        if (isDeleted) fetchNomenclatureList();
        setNomenclatureModal(false);
    };

    return (
        <div className="w-full h-full px-5 py-5 rounded-xl">
            <div className="flex flex-col gap-y-5 overflow-auto">
                <div className="flex w-full items-center justify-between border-b py-10">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl w-full">Номенклатуры</h1>
                        <button
                            onClick={fetchNomenclatureList}
                            className="flex items-center justify-center bg-gray-200 p-2 rounded-full hover:bg-gray-300"
                            title="Обновить"
                        >
                            <HiRefresh className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>
                    <div className="flex items-center w-2/5 gap-x-5">
                        <input
                            type="search"
                            className="shadow-inner w-full px-6 py-2 rounded-lg border"
                            placeholder="Поиск"
                        />
                        <img
                            src={filterIcon}
                            alt="filter"
                            className="w-10 h-10 rounded-xl p-2 bg-main-dull-blue"
                        />
                        <div className="w-0.5 bg-main-dull-gray h-8 bg-opacity-65"></div>
                        <IoIosNotificationsOutline size={50} />
                    </div>
                </div>
                {/* Table */}
                <table className="table-auto w-full border-separate border-spacing-y-4">
                    <thead className="text-[#A49E9E] bg-[#FFFFFF] bg-opacity-50 h-14 w-full">
                        <tr className="text-sm">
                            <th></th>
                            <th className="text-start">ID</th>
                            <th className="text-start">Имя</th>
                            <th className="text-start">Артикль</th>
                            <th className="text-start">Код</th>
                            <th className="text-start">Тип</th>
                            <th className="text-start">Категория</th>
                            <th className="text-start">Единица измерения</th>
                            <th className="text-start">Создатель</th>
                            <th className="text-start">Дата создания</th>
                            <th className="text-start">Последнее изменение</th>
                            <th className="text-start">Дата изменение</th>
                        </tr>
                    </thead>
                    <tbody>
                        {nomenclatures.map((nomenclatures) => (
                            <tr
                                key={nomenclatures.userId}
                                className={`${nomenclatures.email === nomenclature.email
                                    ? "bg-[#E3F3E9] hover:bg-[#11b0666e]"
                                    : "bg-white hover:bg-gray-50"
                                    } border-b border-full transition cursor-pointer`}
                                onClick={() => handleNomenclatureModal(nomenclatures)}
                            >
                                <td className="p-5">
                                    <img
                                        className="rounded-full w-10 h-10"
                                        src={nomenclatures.imagePath || avatar}
                                        alt=""
                                    />
                                </td>
                                <td className="py-4 px-2">{nomenclatures.userId}</td>
                                <td className="py-4 px-2">{nomenclatures.userName}</td>
                                <td className="py-4 px-2">{nomenclatures.email}</td>
                                <td className="py-4 px-2">{nomenclatures.userNumber}</td>
                                <td className="py-4 px-2">
                                    <div className="flex items-center justify-start text-center text-white">
                                        <div
                                            className={`${nomenclatures.emailVerified
                                                ? "bg-[#E3F3E9]"
                                                : "bg-[#FFF2EA]"
                                                } text-center flex items-center justify-center px-2 rounded-full`}
                                        >
                                            <div
                                                className={`${nomenclatures.emailVerified
                                                    ? "bg-[#11B066]"
                                                    : "bg-[#E84D43]"
                                                    } h-3 w-3 rounded-full`}
                                            ></div>
                                            <p
                                                className={`${nomenclatures.emailVerified
                                                    ? "text-[#11B066]"
                                                    : "text-[#E84D43]"
                                                    } px-2 py-1 rounded`}
                                            >
                                                {`${nomenclatures.emailVerified ? "Подтверждено" : "Не подтверждено"}`}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-2">{nomenclatures.registrationDate}</td>
                                <td className="py-4 px-2">{nomenclatures.userRoles.join(", ")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Button */}
                <button
                    className={`bg-main-dull-blue absolute bottom-12 w-12 h-12 self-end rounded-full shadow-xl font-bold text-white ${isInviteButtonDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                        }`}
                    onClick={handleCreateCategoryModal}
                    disabled={isInviteButtonDisabled}
                >
                    +
                </button>
            </div>
            {createNomenclatureModal && (
                <CreateInviteModal
                    authToken={authToken}
                    setCreateInviteModal={setCreateNomenclatureModal}
                    setIsInviteButtonDisabled={setIsCreateNomenclatureButtonDisable}
                />
            )}

            {nomenclatureModal && (
                <UserProfileModal
                    selectedUser={selectedUser}
                    onClose={handleModalClose}
                    fetchUserList={fetchNomenclatureList}
                />
            )}
        </div>
    );
};

export default NomenclatureList;
