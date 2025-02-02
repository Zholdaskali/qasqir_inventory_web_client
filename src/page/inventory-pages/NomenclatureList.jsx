import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";

import { API_GET_NOMENCLATURES } from "../../api/API";

import avatar from "../../assets/placeholders/avatar.png";
import filterIcon from "../../assets/icons/filter.svg";
import { IoIosNotificationsOutline } from "react-icons/io";
import { HiRefresh } from "react-icons/hi";
import CreateInviteModal from "../../components/super-admin-components/log-components/CreateInviteModal";
import UserProfileModal from "../../components/modal-components/UserProfileModal";
import { saveNomenclatureList } from "../../store/slices/inventorySlice/nomenclatureListSlice";

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
            const response = await axios.get(`/api/v1/warehouse-manager/1/nomenclatures`, {
                headers: { "Auth-token": authToken },
            });
            console.log(response.data.body)
            console.log("успешно")
            dispatch(saveNomenclatureList(response.data.body));
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
                        {Array.isArray(nomenclatures) ? (
                            nomenclatures.map((nomenclature) => (
                                <tr key={nomenclature.id}>
                                    <td className="py-4 px-2">{nomenclature.id}</td>
                                    <td className="py-4 px-2">{nomenclature.name}</td>
                                    <td className="py-4 px-2">{nomenclature.article}</td>
                                    <td className="py-4 px-2">{nomenclature.code}</td>
                                    <td className="py-4 px-2">{nomenclature.type}</td>
                                    <td className="py-4 px-2">{nomenclature.measurement}</td>
                                    <td className="py-4 px-2">{nomenclature.tnved}</td>
                                    <td className="py-4 px-2">{nomenclature.createdBy}</td>
                                    <td className="py-4 px-2">{nomenclature.updatedBy}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9">Данные загружаются...</td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {/* Button */}
                <button
                    className={`bg-main-dull-blue absolute bottom-12 w-12 h-12 self-end rounded-full shadow-xl font-bold text-white ${isInviteButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
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