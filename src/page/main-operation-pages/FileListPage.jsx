import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FaSpinner, FaDownload, FaEye } from "react-icons/fa";

const FileListPage = () => {
    const authToken = useSelector((state) => state.token.token);
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Загрузка списка файлов
    useEffect(() => {
        const fetchFiles = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get("http://localhost:8081/api/v1/storekeeper/file", {
                    headers: { "Auth-token": authToken },
                });
                setFiles(response.data.body || []);
            } catch (error) {
                toast.error(error.response?.data?.message || "Ошибка при загрузке файлов");
            } finally {
                setIsLoading(false);
            }
        };
        fetchFiles();
    }, [authToken]);

    // Скачивание файла
    const handleDownload = (file) => {
        try {
            const byteCharacters = atob(file.fileData); // Предполагаем, что fileData — это base64
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/octet-stream" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = file.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error("Ошибка при скачивании файла");
        }
    };

    // Просмотр файла (если это текст или изображение)
    const handleView = (file) => {
        try {
            const byteCharacters = atob(file.fileData);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray]);
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error("Ошибка при просмотре файла");
        }
    };

    return (
        <div className="p-4 w-full bg-main-light-gray rounded-lg shadow-md space-y-4">
            {isLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
                        <FaSpinner className="animate-spin text-main-dull-gray" />
                        <span className="text-main-dull-gray">Загрузка...</span>
                    </div>
                </div>
            )}

            <h2 className="text-lg font-semibold text-main-dull-gray text-center">
                Список загруженных файлов
            </h2>

            {files.length === 0 ? (
                <div className="text-center py-4 bg-white rounded-lg shadow-md text-sm text-main-dull-gray">
                    Файлы отсутствуют
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded-lg shadow-md text-sm">
                        <thead className="bg-main-dull-blue text-white">
                            <tr>
                                <th className="px-4 py-2 text-left">ID</th>
                                <th className="px-4 py-2 text-left">ID документа</th>
                                <th className="px-4 py-2 text-left">Имя файла</th>
                                <th className="px-4 py-2 text-left">Дата загрузки</th>
                                <th className="px-4 py-2 text-center">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file) => (
                                <tr key={file.id} className="border-t border-gray-200 hover:bg-gray-100 transition">
                                    <td className="px-4 py-2">{file.id}</td>
                                    <td className="px-4 py-2">{file.documentId}</td>
                                    <td className="px-4 py-2">{file.fileName}</td>
                                    <td className="px-4 py-2">
                                        {new Date(file.uploadedAt).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-2 text-center flex justify-center gap-2">
                                        <button
                                            onClick={() => handleView(file)}
                                            className="text-main-dull-blue hover:text-main-purp-dark transition"
                                            title="Просмотреть"
                                        >
                                            <FaEye />
                                        </button>
                                        <button
                                            onClick={() => handleDownload(file)}
                                            className="text-main-dull-blue hover:text-main-purp-dark transition"
                                            title="Скачать"
                                        >
                                            <FaDownload />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default FileListPage;