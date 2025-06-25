import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Notification from '../../../components/notification/Notification';
import { VscOrganization } from 'react-icons/vsc';
import camera from '../../../assets/icons/camera.svg';
import avatar from '../../../assets/placeholders/avatar.png';
import axios from 'axios';
import { toast } from 'react-toastify';
import { setOrganization } from '../../../store/slices/organizationSlice';
import { API_GET_ORGANIZATION } from '../../../api/API';
import UploadPhotoModal from '../../../components/password-components/UploadPhotoModal'; // Assuming this exists

const OrganizationProfile = () => {
  const authToken = useSelector((state) => state.token.token);
  const dispatch = useDispatch();
  const organization = useSelector((state) => state.organization);
  const user = useSelector((state) => state.user);
  const hasRole = (role) => user?.userRoles?.includes(role);
  const [photoUploadModal, setPhotoUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const getOrganizationDetails = async () => {
    try {
      const response = await axios.get(API_GET_ORGANIZATION, {
        headers: { 'Auth-token': authToken },
      });
      dispatch(setOrganization(response.data.body));
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка при загрузке данных организации');
    }
  };

  useEffect(() => {
    getOrganizationDetails();
  }, []);

  return (
    <div className="bg-gray-100 w-full min-h-screen flex flex-col items-center font-roboto">
      {/* Banner */}
      <div className="w-full h-40 bg-gray-300 relative">
        {hasRole('admin') && (
          <button
            className="absolute top-4 right-4 bg-white text-gray-700 px-4 py-2 rounded-full shadow-md hover:bg-gray-100 transition-all duration-200"
            onClick={() => toast.info('Функция загрузки баннера пока недоступна')}
          >
            Изменить баннер
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="w-full max-w-5xl mx-auto -mt-16 px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Avatar */}
          <div className="relative group">
            <img
              src={organization.imagePath ? organization.imagePath : avatar}
              alt="Organization Avatar"
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg transition-transform duration-200 group-hover:scale-105"
            />
            {hasRole('admin') && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                onClick={() => setPhotoUploadModal(true)}
              >
                <img src={camera} alt="Camera Icon" className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          {/* Organization Info */}
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">
              {organization.organizationName || 'Не указано'}
            </h1>
            <p className="text-gray-600">{organization.email || 'Не указано'}</p>
            {hasRole('admin') && (
              <NavLink
                to="/edit-organization-profile"
                className="mt-4 inline-flex items-center gap-x-2 bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-all duration-200 shadow-md"
              >
                Настроить профиль
              </NavLink>
            )}
          </div>
        </div>

        {/* Tabs */}
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
                activeTab === 'contact'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('contact')}
            >
              Контактная информация
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <p className="text-gray-600 font-medium">Название организации:</p>
                <p className="text-gray-800">{organization.organizationName || 'Не указано'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Имя владельца:</p>
                <p className="text-gray-800">{organization.ownerName || 'Не указано'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Дата регистрации:</p>
                <p className="text-gray-800">{organization.registrationDate || 'Не указано'}</p>
              </div>
            </div>
          )}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <p className="text-gray-600 font-medium">Почта организации:</p>
                <p className="text-gray-800">{organization.email || 'Не указано'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Номер организации:</p>
                <p className="text-gray-800">{organization.phoneNumber || 'Не указано'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Адрес организации:</p>
                <p className="text-gray-800">{organization.address || 'Не указано'}</p>
              </div>
              <div>
                <p className="text-gray-600 font-medium">Веб-сайт организации:</p>
                <a
                  href={organization.websiteLink}
                  className="text-blue-600 underline hover:text-blue-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {organization.websiteLink || 'Не указано'}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {photoUploadModal && <UploadPhotoModal setPhotoUploadModal={setPhotoUploadModal} />}
      <Notification />
    </div>
  );
};

export default OrganizationProfile;