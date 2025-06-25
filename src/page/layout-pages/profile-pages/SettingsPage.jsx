import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import avatar from '../../../assets/placeholders/avatar.png';
import camera from '../../../assets/icons/camera.svg';
import pen from '../../../assets/icons/pen.svg';
import emailVerifyIllustr from '../../../assets/illustrations/email-verify.svg';
import userIcon from '../../../assets/icons/user.svg';
import Cookies from 'js-cookie';
import { Spinner } from 'flowbite-react';
import { API_EMAIL_GENERATE, API_EMAIL_VERIFY } from '../../../api/API';
import axios from 'axios';
import Notification from '../../../components/notification/Notification';
import { toast } from 'react-toastify';
import { setUser } from '../../../store/slices/userSlice';
import { NavLink } from 'react-router-dom';
import ConfirmationWrapper from '../../../components/ui/ConfirmationWrapper';
import UploadPhotoModal from '../../../components/password-components/UploadPhotoModal';

// Функция для перевода ролей
const translateRole = (role) => {
  const roleTranslations = {
    'employee': 'Сотрудник',
    'admin': 'Администратор',
    'warehouse_manager': 'Менеджер склада',
    'storekeeper': 'Кладовщик'
  };
  return roleTranslations[role] || role;
};

const SettingsPage = () => {
  const authToken = Cookies.get('authToken');
  const user = useSelector((state) => state.user);
  const [emailVerifyModal, setEmailVerifyModal] = useState(false);
  const [photoUploadModal, setPhotoUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // Для вкладок
  const [verificationCode, setVerificationCode] = useState({
    firstDigit: '',
    secondDigit: '',
    thirdDigit: '',
    fourthDigit: '',
    fifthDigit: '',
    sixthDigit: '',
  });

  const dispatch = useDispatch();

  const emailVerifyGenerate = async (userEmail) => {
    setEmailVerifyModal(true);
    setLoading(true);
    try {
      const response = await axios.post(
        API_EMAIL_GENERATE,
        { email: userEmail },
        { headers: { 'Auth-token': authToken } }
      );
      toast.success(response.data || 'Успешно');
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || 'Ошибка при отправке запроса на подтверждение'
      );
    } finally {
      setLoading(false);
    }
  };

  const emailVerify = async () => {
    setLoading(true);
    const code = Object.values(verificationCode).join('');
    try {
      const response = await axios.post(
        API_EMAIL_VERIFY,
        { email: user.email, code },
        { headers: { 'Auth-token': authToken } }
      );
      dispatch(setUser({ ...user, emailVerified: response.data }));
      toast.success(response.data || 'Успешно');
      setEmailVerifyModal(false);
      setVerificationCode({
        firstDigit: '',
        secondDigit: '',
        thirdDigit: '',
        fourthDigit: '',
        fifthDigit: '',
        sixthDigit: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка при проверке кода');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, fieldName, nextInput, prevInput) => {
    const value = e.target.value;
    if (/^[0-9]?$/.test(value)) {
      setVerificationCode((prevState) => ({ ...prevState, [fieldName]: value }));
      if (value.length === 1 && nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (e, fieldName, prevInput) => {
    if (e.key === 'Backspace' && !verificationCode[fieldName] && prevInput) {
      prevInput.focus();
    }
  };

  const isCodeComplete = Object.values(verificationCode).every((digit) => digit.length === 1);

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

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
          {/* Аватарка */}
          <div className="relative group">
            <img
              src={user.imagePath ? user.imagePath : avatar}
              alt="User Avatar"
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg transition-transform duration-200 group-hover:scale-105"
            />
            <div
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              onClick={() => setPhotoUploadModal(true)}
            >
              <img src={camera} alt="Camera Icon" className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Информация о пользователе */}
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">{user.userName || 'Не указано'}</h1>
            <p className="text-gray-600">{user.email || 'Не указано'}</p>
            <NavLink
              to="/edit-profile"
              className="mt-4 inline-flex items-center gap-x-2 bg-main-dull-blue text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all duration-200 shadow-md"
            >
              <span>Настроить профиль</span>
              <img src={pen} alt="Pen Icon" className="w-4 h-4" />
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
                activeTab === 'roles'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('roles')}
            >
              Роли
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
                <p className="text-gray-800">{user.userName || 'Не указано'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Почта пользователя:</p>
                <p className="text-gray-800">{user.email || 'Не указано'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Номер пользователя:</p>
                <p className="text-gray-800">{user.userNumber || 'Не указано'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Дата регистрации:</p>
                <p className="text-gray-800">{user.registrationDate || 'Не указано'}</p>
              </div>
            </div>
          )}
          {activeTab === 'roles' && (
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
          )}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <p className="text-gray-600 font-medium w-1/3">Статус почты:</p>
                <div
                  className={`flex items-center px-3 py-1 rounded-full ${
                    user.emailVerified ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${
                      user.emailVerified ? 'bg-green-500' : 'bg-red-500'
                    } mr-2`}
                  ></div>
                  <p className={`${user.emailVerified ? 'text-green-600' : 'text-red-600'} text-sm`}>
                    {user.emailVerified ? 'Подтверждено' : 'Не подтверждено'}
                  </p>
                </div>
                {!user.emailVerified && (
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-all duration-200"
                    onClick={() => emailVerifyGenerate(user.email)}
                    disabled={loading}
                  >
                    Подтвердить
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Модалка для верификации email */}
      {emailVerifyModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black bg-opacity-40 backdrop-blur-sm">
          <div
            className={`bg-white rounded-2xl shadow-xl z-50 flex flex-col items-center ${
              loading ? 'w-32 py-12' : 'w-full max-w-md p-8'
            } transition-all duration-300`}
            onClick={handleModalClick}
          >
            {loading ? (
              <Spinner className="w-12 h-12 fill-blue-600" />
            ) : (
              <div className="flex flex-col items-center gap-y-6">
                <img
                  src={emailVerifyIllustr}
                  alt="Email Verification Illustration"
                  className="w-1/3"
                />
                <h1 className="text-xl font-semibold text-gray-800">Подтвердите Email</h1>
                <p className="text-sm text-gray-600 text-center">
                  Мы выслали 6-значный код на <span className="font-bold">{user.email}</span>
                </p>
                <div className="flex gap-x-3">
                  {['firstDigit', 'secondDigit', 'thirdDigit', 'fourthDigit', 'fifthDigit', 'sixthDigit'].map(
                    (field, index) => (
                      <input
                        key={field}
                        type="text"
                        maxLength={1}
                        value={verificationCode[field]}
                        onChange={(e) =>
                          handleInputChange(
                            e,
                            field,
                            document.getElementsByName([
                              'firstDigit',
                              'secondDigit',
                              'thirdDigit',
                              'fourthDigit',
                              'fifthDigit',
                              'sixthDigit',
                            ][index + 1])?.[0],
                            document.getElementsByName([
                              'firstDigit',
                              'secondDigit',
                              'thirdDigit',
                              'fourthDigit',
                              'fifthDigit',
                              'sixthDigit',
                            ][index - 1])?.[0]
                          )
                        }
                        onKeyDown={(e) =>
                          handleKeyDown(
                            e,
                            field,
                            document.getElementsByName([
                              'firstDigit',
                              'secondDigit',
                              'thirdDigit',
                              'fourthDigit',
                              'fifthDigit',
                              'sixthDigit',
                            ][index - 1])?.[0]
                          )
                        }
                        className="w-12 h-12 border border-blue-600 rounded-lg text-center text-xl focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
                        name={field}
                        aria-label={`Verification code digit ${index + 1}`}
                        autoFocus={index === 0}
                      />
                    )
                  )}
                </div>
                <ConfirmationWrapper
                  title="Подтверждение кода"
                  message="Вы уверены, что хотите подтвердить этот код?"
                  onConfirm={emailVerify}
                >
                  <button
                    className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all duration-200 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={!isCodeComplete || loading}
                  >
                    Проверить
                  </button>
                </ConfirmationWrapper>
                <button
                  className="bg-gray-500 text-white px-6 py-2 rounded-full hover:bg-gray-600 transition-all duration-200 shadow-md"
                  onClick={() => setEmailVerifyModal(false)}
                  aria-label="Close email verification modal"
                  disabled={loading}
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {photoUploadModal && <UploadPhotoModal setPhotoUploadModal={setPhotoUploadModal} />}
      <Notification />
    </div>
  );
};

export default SettingsPage;