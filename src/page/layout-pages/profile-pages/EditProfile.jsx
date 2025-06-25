import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import avatar from '../../../assets/placeholders/avatar.png';
import camera from '../../../assets/icons/camera.svg';
import userIcon from '../../../assets/icons/user.svg';
import { IoMdClose } from 'react-icons/io';
import { API_UPDATE_USERNAME } from '../../../api/API';
import axios from 'axios';
import Notification from '../../../components/notification/Notification';
import { toast } from 'react-toastify';
import { setUser } from '../../../store/slices/userSlice';
import ChangePasswordModal from '../../../components/password-components/ChangePasswordModal';
import ChangeEmailModal from '../../../components/password-components/ChangeEmailModal';
import ConfirmationWrapper from '../../../components/ui/ConfirmationWrapper';
import UploadPhotoModal from '../../../components/password-components/UploadPhotoModal';

const translateRole = (role) => {
  const roleTranslations = {
    employee: 'Сотрудник',
    admin: 'Администратор',
    warehouse_manager: 'Менеджер склада',
    storekeeper: 'Кладовщик',
  };
  return roleTranslations[role] || role;
};

const EditProfile = () => {
  const authToken = useSelector((state) => state.token.token);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [newUserName, setNewUserName] = useState('');
  const [newUserNumber, setNewUserNumber] = useState('');
  const [passResetModal, setPassResetModal] = useState(false);
  const [emailChangeModal, setEmailChangeModal] = useState(false);
  const [photoUploadModal, setPhotoUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const navigate = useNavigate();

  const isSaveDisabled = () => !newUserName && !newUserNumber;

  const updateUserData = async () => {
    try {
      const updatedData = {};
      const hasNameChanged = newUserName.trim() !== '';
      const hasNumberChanged = newUserNumber.trim() !== '';

      if (hasNameChanged && hasNumberChanged) {
        updatedData.userName = newUserName;
        updatedData.userNumber = newUserNumber.startsWith('+') ? newUserNumber : `+${newUserNumber}`;
      } else if (hasNameChanged) {
        updatedData.userName = newUserName;
        updatedData.userNumber = user.userNumber;
      } else if (hasNumberChanged) {
        updatedData.userName = user.userName;
        updatedData.userNumber = newUserNumber.startsWith('+') ? newUserNumber : `+${newUserNumber}`;
      }

      const response = await axios.put(
        API_UPDATE_USERNAME + user.userId,
        {
          userName: updatedData.userName,
          userEmail: user.email,
          userNumber: updatedData.userNumber,
        },
        { headers: { 'Auth-token': authToken } }
      );

      dispatch(setUser({ ...response.data.body }));
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка при обновлении данных пользователя');
    }
  };

  const handlePassReset = () => setPassResetModal((prev) => !prev);
  const handleEmailChange = () => setEmailChangeModal((prev) => !prev);
  const handlePhotoUpload = () => setPhotoUploadModal((prev) => !prev);

  return (
    <div className="bg-gray-100 w-full min-h-screen flex flex-col items-center">
      {/* Баннер профиля */}
      <div className="w-full h-40 bg-gray-300 relative">
        <button
          className="absolute top-4 right-4 bg-white text-gray-700 px-4 py-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-200"
          onClick={() => toast.info('Функция загрузки баннера пока недоступна')}
        >
          Изменить баннер
        </button>
      </div>

      {/* Контейнер профиля */}
      <div className="w-full max-w-5xl mx-auto -mt-16 px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          <div className="relative group">
            <img
              src={user.imagePath ? user.imagePath : avatar}
              alt="User Avatar"
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg transition-transform duration-200 group-hover:scale-105"
            />
            <div
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              onClick={handlePhotoUpload}
            >
              <img src={camera} alt="Camera Icon" className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">{user.userName || 'Не указано'}</h1>
            <p className="text-gray-600">{user.email || 'Не указано'}</p>
            <NavLink
              to="/"
              className="mt-4 inline-flex items-center gap-x-2 bg-gray-600 text-white px-6 py-2 rounded-full hover:bg-gray-700 transition-all duration-200 shadow-md"
            >
              Назад к профилю
            </NavLink>
          </div>
        </div>

        {/* Вкладки */}
        <div className="mt-8 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'general'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('general')}
            >
              Общие
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('security')}
            >
              Безопасность
            </button>
          </nav>
        </div>

        {/* Контент вкладок */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <p className="text-gray-600 font-medium">Имя пользователя:</p>
                <input
                  type="text"
                  placeholder={user.userName || 'Введите имя'}
                  value={newUserName}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
                  onChange={(e) => setNewUserName(e.target.value)}
                />
              </div>
              <div>
                <p className="text-gray-600 font-medium">Почта пользователя:</p>
                <input
                  type="text"
                  placeholder={user.email || 'Введите почту'}
                  value={user.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <p className="text-gray-600 font-medium">Номер пользователя:</p>
                <input
                  type="text"
                  placeholder={user.userNumber || 'Введите номер'}
                  value={newUserNumber}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
                  onChange={(e) => setNewUserNumber(e.target.value)}
                />
              </div>
              <div>
                <p className="text-gray-600 font-medium">Роли пользователя:</p>
                <ul className="flex flex-wrap gap-2 mt-2">
                  {Array.isArray(user.userRoles) ? (
                    user.userRoles.map((role, index) => (
                      <li
                        key={index}
                        className="bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-700 shadow-sm"
                      >
                        {translateRole(role)}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-600">{translateRole(user.userRoles) || 'Нет ролей'}</li>
                  )}
                </ul>
              </div>
              <ConfirmationWrapper title="Ваши данные будут изменены!" onConfirm={updateUserData}>
                <button
                  disabled={isSaveDisabled()}
                  className={`w-full bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all duration-200 shadow-md ${
                    isSaveDisabled() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Сохранить
                </button>
              </ConfirmationWrapper>
            </div>
          )}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <button
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all duration-200 shadow-md"
                onClick={handlePassReset}
              >
                Сменить пароль
              </button>
              <button
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all duration-200 shadow-md"
                onClick={handleEmailChange}
              >
                Сменить email
              </button>
            </div>
          )}
        </div>
      </div>

      {passResetModal && <ChangePasswordModal setPassResetModal={setPassResetModal} />}
      {emailChangeModal && <ChangeEmailModal setEmailChangeModal={setEmailChangeModal} />}
      {photoUploadModal && <UploadPhotoModal setPhotoUploadModal={setPhotoUploadModal} />}
      <Notification />
    </div>
  );
};

export default EditProfile;