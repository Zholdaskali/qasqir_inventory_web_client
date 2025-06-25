import { useEffect, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { API_GET_USERS } from "../../../api/API";
import { saveUserList } from "../../../store/slices/userListSlice";
import avatar from "../../../assets/placeholders/avatar.png";
import CreateInviteModal from "../../../components/super-admin-components/log-components/CreateInviteModal";
import UserProfileModal from "../../../components/modal-components/main-modal/UserProfileModal";
import AddButton from "../../../components/ui/AddButton";
import BaseTable from "../../../components/ui/BaseTable";
import TableHeader from "../../../components/ui/Header";

const UsersList = () => {
  const authToken = useSelector((state) => state.token.token);
  const dispatch = useDispatch();
  const users = useSelector((state) => state.userList || []);
  const currentUser = useSelector((state) => state.user);

  const [userModal, setUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [createInviteModal, setCreateInviteModal] = useState(false);
  const [isInviteButtonDisabled, setIsInviteButtonDisabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserList = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(API_GET_USERS, {
        headers: { "Auth-token": authToken },
      });
      dispatch(saveUserList(response.data.body));
    } catch (error) {
      toast.error("Ошибка загрузки пользователей");
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [authToken, dispatch]);

  useEffect(() => {
    if (authToken && (!users || users.length === 0)) {
      fetchUserList();
    }
  }, [authToken, users, fetchUserList]);

  const handleUserModal = (user) => {
    setSelectedUser(user);
    setUserModal(true);
  };

  const handleCreateInviteModal = () => {
    setCreateInviteModal(true);
  };

  const handleModalClose = (isDeleted) => {
    if (isDeleted) fetchUserList();
    setUserModal(false);
  };

  const handleInviteModalClose = () => {
    setCreateInviteModal(false);
    fetchUserList();
  };

  const filteredUsers = useMemo(() => {
    return users.filter((userItem) => {
      const query = searchQuery.toLowerCase();
      return (
        userItem.userName.toLowerCase().includes(query) ||
        userItem.email.toLowerCase().includes(query) ||
        (userItem.userNumber && userItem.userNumber.toLowerCase().includes(query))
      );
    });
  }, [users, searchQuery]);

  const exportToExcel = () => {
    if (!filteredUsers.length) {
      toast.error("Нет данных для экспорта");
      return;
    }

    const headers = [
      "ID",
      "Имя",
      "Email",
      "Телефон",
      "Email подтвержден",
      "Дата регистрации",
      "Роли",
    ];

    const rows = filteredUsers.map((userItem) => ({
      ID: userItem.userId,
      Имя: userItem.userName,
      Email: userItem.email,
      Телефон: userItem.userNumber || "",
      "Email подтвержден": userItem.emailVerified ? "ПОДТВЕРЖДЕН" : "НЕ ПОДТВЕРЖДЕН",
      "Дата регистрации": userItem.registrationDate,
      Роли: userItem.userRoles.join(", "),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Пользователи");
    XLSX.writeFile(workbook, `users_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Список пользователей экспортирован в Excel");
  };

  const columns = [
    {
      title: "",
      field: "avatar",
      className: "w-12 px-2",
      render: (userItem) => (
        <img
          className="rounded-full w-8 h-8 object-cover"
          src={userItem.imagePath || avatar}
          alt={userItem.userName}
          onError={(e) => {
            e.target.src = avatar;
          }}
        />
      ),
    },
    { title: "ID", field: "userId", className: "px-2" },
    { title: "Имя", field: "userName", className: "px-2" },
    { title: "Email", field: "email", className: "px-2" },
    { title: "Телефон", field: "userNumber", className: "px-2" },
    {
      title: "Статус Email",
      field: "emailVerified",
      className: "px-2",
      isStatus: true,
    },
    { title: "Регистрация", field: "registrationDate", className: "px-2" },
    {
      title: "Роли",
      field: "userRoles",
      className: "px-2",
      render: (userItem) => userItem.userRoles?.join(", ") || "-",
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col overflow-y-auto p-3 bg-gray-50">
      <TableHeader
        title="Пользователи"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onExport={exportToExcel}
        exportDisabled={!filteredUsers.length}
        searchPlaceholder="Поиск по имени, email или телефону..."
      />

      <div className="flex-1 mt-3">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <BaseTable
            columns={columns}
            data={filteredUsers.map((userItem) => ({
              ...userItem,
              className: userItem.email === currentUser.email
                ? "bg-[#E3F3E9] hover:bg-[#11b0666e]"
                : "bg-white hover:bg-gray-50",
            }))}
            onRowClick={handleUserModal}
            maxHeight="500px"
          />
        )}
      </div>

      <AddButton
        onClick={handleCreateInviteModal}
        disabled={isInviteButtonDisabled}
        title="Добавить пользователя"
      />

      {createInviteModal && (
        <CreateInviteModal
          authToken={authToken}
          onClose={handleInviteModalClose}
          setIsInviteButtonDisabled={setIsInviteButtonDisabled}
        />
      )}

      {userModal && selectedUser && (
        <UserProfileModal
          selectedUser={selectedUser}
          onClose={handleModalClose}
          fetchUserList={fetchUserList}
        />
      )}
    </div>
  );
};

export default UsersList;