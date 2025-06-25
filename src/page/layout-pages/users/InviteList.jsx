import { useState, useCallback, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { API_GET_INVITE_LIST } from "../../../api/API";
import { saveInviteList } from "../../../store/slices/inviteListSlice";
import Notification from "../../../components/notification/Notification";
import BaseTable from "../../../components/ui/BaseTable";
import AddButton from "../../../components/ui/AddButton";
import CreateInviteModal from "../../../components/super-admin-components/log-components/CreateInviteModal";
import TableHeader from "../../../components/ui/Header";

const InviteList = () => {
  const authToken = useSelector((state) => state.token.token);
  const dispatch = useDispatch();
  const inviteList = useSelector((state) => state.inviteList || []);
  const [createInviteModal, setCreateInviteModal] = useState(false);
  const [isInviteButtonDisabled, setIsInviteButtonDisabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchInviteList = useCallback(async () => {
    if (!authToken) return;
    setIsLoading(true);
    try {
      const response = await axios.get(API_GET_INVITE_LIST, {
        headers: { "Auth-token": authToken },
      });
      const data = response.data.body;

      if (data) {
        dispatch(saveInviteList(data));
        toast.success(response.data.message || "Успешно");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка загрузки данных");
      console.error("Error fetching invite list:", error);
    } finally {
      setIsLoading(false);
    }
  }, [authToken, dispatch]);

  useEffect(() => {
    if (authToken && inviteList.length === 0) {
      fetchInviteList();
    }
  }, [authToken, inviteList.length, fetchInviteList]);

  const handleCreateInviteModal = () => {
    setCreateInviteModal(true);
  };

  const handleInviteModalClose = () => {
    setCreateInviteModal(false);
    fetchInviteList();
  };

  const filteredInvites = useMemo(() => {
    return inviteList.filter((inviteItem) => {
      const query = searchQuery.toLowerCase();
      return (
        (inviteItem.userName && inviteItem.userName.toLowerCase().includes(query)) ||
        (inviteItem.email && inviteItem.email.toLowerCase().includes(query))
      );
    });
  }, [inviteList, searchQuery]);

  const exportToExcel = () => {
    if (!filteredInvites.length) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const headers = ["ID", "Имя пользователя", "Email"];
    const rows = filteredInvites.map((item) => ({
      ID: item.id,
      "Имя пользователя": item.userName || "-",
      Email: item.email || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Приглашения");
    XLSX.writeFile(workbook, `invites_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Список приглашений экспортирован в Excel");
  };

  const columns = [
    { title: "ID", field: "id", className: "px-2 text-sm" },
    { title: "Имя пользователя", field: "userName", className: "px-2 text-sm" },
    { title: "Email", field: "email", className: "px-2 text-sm" },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col overflow-y-auto p-3 bg-gray-50">
      <TableHeader
        title="Приглашения"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onExport={exportToExcel}
        exportDisabled={!filteredInvites.length || isLoading}
        searchPlaceholder="Поиск по имени или email..."
      />

      <div className="flex-1 mt-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <BaseTable
            columns={columns}
            data={filteredInvites.map((inviteItem) => ({
              ...inviteItem,
              className: "bg-white hover:bg-gray-50",
            }))}
            maxHeight="500px"
          />
        )}
      </div>

      <AddButton
        onClick={handleCreateInviteModal}
        disabled={isInviteButtonDisabled}
        title="Создать приглашение"
      />

      {createInviteModal && (
        <CreateInviteModal
          authToken={authToken}
          onClose={handleInviteModalClose}
          setIsInviteButtonDisabled={setIsInviteButtonDisabled}
        />
      )}

      <Notification />
    </div>
  );
};

export default InviteList;