import { useState } from "react";
import { toast } from "react-toastify";

const UploadFileModal = ({ setUploadFileModal, setSelectedFile }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      // Проверка размера файла (не больше 5MB)
      if (selected.size > 5 * 1024 * 1024) {
        toast.error("Файл слишком большой. Максимальный размер: 5MB");
        return;
      }
      // Проверка типа файла (PDF или изображение)
      if (!selected.type.match(/^(application\/pdf|image\/.*)$/)) {
        toast.error("Пожалуйста, выберите PDF или изображение (jpg, png и т.д.)");
        return;
      }
      setFile(selected);
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const base64String = reader.result.split(",")[1]; // Извлекаем base64 без префикса
          if (!base64String) {
            reject(new Error("Не удалось извлечь строку base64"));
          }
          // Проверка на валидность base64
          const base64Regex = /^[A-Za-z0-9+/=]+$/;
          if (!base64Regex.test(base64String)) {
            reject(new Error("Строка base64 содержит недопустимые символы"));
          }
          console.log("Base64 string (UploadFileModal):", base64String.substring(0, 50) + "...");
          resolve({ base64: base64String, fileName: file.name });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Пожалуйста, выберите файл для загрузки");
      return;
    }

    setIsLoading(true);
    try {
      const { base64, fileName } = await fileToBase64(file);
      console.log("Передача в setSelectedFile:", { base64: base64.substring(0, 50) + "...", fileName });
      setSelectedFile({ base64, fileName });
      toast.success("Файл успешно выбран");
      setUploadFileModal(false);
    } catch (error) {
      console.error("Ошибка в handleUpload:", error);
      toast.error("Ошибка при выборе файла: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-main-dull-blue">Загрузка файла</h2>
        {file && (
          <p className="text-sm text-gray-600 mb-4">
            Выбран файл: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={handleFileChange}
            className="w-full py-3 px-6 rounded-full border border-main-dull-gray outline-none focus:ring-2 focus:ring-main-dull-blue"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !file}
            className="bg-main-dull-blue text-white font-bold py-3 rounded-full hover:bg-main-purp-dark transition disabled:opacity-50"
          >
            {isLoading ? "Выбор..." : "Выбрать файл"}
          </button>
        </form>
        <button
          onClick={() => setUploadFileModal(false)}
          className="mt-4 text-sm text-main-dull-gray hover:text-main-dull-blue"
          disabled={isLoading}
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

export default UploadFileModal;