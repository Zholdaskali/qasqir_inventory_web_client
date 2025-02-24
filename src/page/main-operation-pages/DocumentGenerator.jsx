import { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

const DocumentGenerator = () => {
    const authToken = useSelector((state) => state.token.token);
    const userId = useSelector((state) => state.user.userId);

    // Состояния для данных документа
    const [documentName, setDocumentName] = useState("");
    const [documentContent, setDocumentContent] = useState("");
    const [file, setFile] = useState(null);

    // Обработка изменения имени документа
    const handleDocumentNameChange = (e) => {
        setDocumentName(e.target.value);
    };

    // Обработка изменения содержимого документа
    const handleDocumentContentChange = (e) => {
        setDocumentContent(e.target.value);
    };

    // Обработка выбора файла
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Генерация документа (например, текстового файла)
    const generateDocument = () => {
        const blob = new Blob([documentContent], { type: "text/plain" });
        return new File([blob], `${documentName}.txt`, { type: "text/plain" });
    };

    // Отправка данных на бэкенд
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!documentName || !documentContent || !file) {
            toast.error("Заполните все поля и выберите файл");
            return;
        }

        try {
            // Шаг 1: Создание записи документа
            const documentPayload = {
                documentName,
                documentContent,
                createdBy: userId,
            };

            const documentResponse = await axios.post(
                "http://localhost:8081/api/v1/storekeeper/document/add",
                documentPayload,
                {
                    headers: { "Auth-token": authToken },
                }
            );

            const documentId = documentResponse.data.body.id; // Предположим, что бэкенд возвращает ID созданного документа

            // Шаг 2: Загрузка файла
            const formData = new FormData();
            formData.append("file", file);
            formData.append("documentId", documentId);

            const fileResponse = await axios.post(
                "http://localhost:8081/api/v1/storekeeper/file/upload",
                formData,
                {
                    headers: {
                        "Auth-token": authToken,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            toast.success("Документ успешно создан и файл загружен");
        } catch (error) {
            toast.error(error.response?.data?.message || "Ошибка при создании документа или загрузке файла");
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto bg-main-light-gray rounded-xl shadow-lg space-y-6">
            <h2 className="text-2xl font-semibold text-main-dull-gray text-center">Генерация документа</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-main-dull-blue">Название документа</label>
                    <input
                        type="text"
                        className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                        value={documentName}
                        onChange={handleDocumentNameChange}
                        required
                    />
                </div>

                <div>
                    <label className="block text-main-dull-blue">Содержимое документа</label>
                    <textarea
                        className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                        value={documentContent}
                        onChange={handleDocumentContentChange}
                        rows={5}
                        required
                    />
                </div>

                <div>
                    <label className="block text-main-dull-blue">Выберите файл для загрузки</label>
                    <input
                        type="file"
                        className="w-full border border-main-dull-blue rounded-lg px-4 py-2"
                        onChange={handleFileChange}
                        required
                    />
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-main-dull-blue text-white rounded-lg hover:bg-main-purp-dark transition"
                    >
                        Создать документ и загрузить файл
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DocumentGenerator;