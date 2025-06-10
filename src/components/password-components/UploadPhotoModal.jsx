import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { setUser } from "../../store/slices/userSlice";
import {
  API_BASE,
  API_PATH_USER,
} from "../../api/API";

const UploadPhotoModal = ({ setPhotoUploadModal }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const authToken = useSelector((state) => state.token.token);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка размера файла (не больше 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Файл слишком большой. Максимальный размер: 5MB");
        return;
      }
      // Проверка типа файла (только изображения)
      if (!file.type.startsWith("image/")) {
        toast.error("Пожалуйста, выберите изображение (jpg, png и т.д.)");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Пожалуйста, выберите файл для загрузки");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile); // Имя параметра соответствует @RequestParam("file")

    try {
      const response = await axios.post(
        API_BASE+API_PATH_USER+`${user.userId}/image`,
        formData,
        {
          headers: {
            "Auth-token": authToken,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Предполагаем, что бэкенд возвращает MessageResponse<String>, например, { message: "Изображение успешно загружено" }
      // Обновляем imagePath в Redux, используя локальный URL.createObjectURL
      dispatch(setUser({ ...user, imagePath: URL.createObjectURL(selectedFile) }));
      toast.success(response.data.message || "Фотография успешно загружена");
      setPhotoUploadModal(false); // Закрываем модалку
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка при загрузке фотографии");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-main-dull-blue">Загрузка фотографии</h2>
        {selectedFile && (
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Preview"
            className="w-32 h-32 rounded-full object-cover mb-4 mx-auto"
          />
        )}
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full py-3 px-6 rounded-full border border-main-dull-gray outline-none focus:ring-2 focus:ring-main-dull-blue"
          />
          <button
            type="submit"
            disabled={isLoading || !selectedFile}
            className="bg-main-dull-blue text-white font-bold py-3 rounded-full hover:bg-main-purp-dark transition disabled:opacity-50"
          >
            {isLoading ? "Загрузка..." : "Загрузить"}
          </button>
        </form>
        <button
          onClick={() => setPhotoUploadModal(false)}
          className="mt-4 text-sm text-main-dull-gray hover:text-main-dull-blue"
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

export default UploadPhotoModal;