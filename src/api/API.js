/* eslint-disable no-unused-vars */
const swagger = "http://localhost:8081/swagger-ui/index.html#/"

// --------------------------------------------------------------------- //

// БАЗОВЫЕ API 

// const API_BASE = 'http://192.168.1.5:8081'
// const API_BASE = 'http://localhost:8081'
export const API_BASE = 'https://qasqir-inventory-pchq.onrender.com'

export const API_PATH_ADMIN = "/api/v1/admin/"
export const API_PATH_USER = "/api/v1/user/"
export const API_PATH_EMPLOYEE = "/api/v1/employee/" 
export const API_PATH_WAREHOUSE_MANAGER = "/api/v1/warehouse-manager/"
export const API_PATH_STOREKEEPER = "/api/v1/storekeeper/"


// --------------------------------------------------------------------- --------------------------------------------------------------------- //

// API ДЛЯ СОТРУДНИКОВ (EMPLOYEE)

export const API_GET_CATEGORIES = API_BASE + API_PATH_EMPLOYEE + "categories" // Получить список категорий

// Добавленные API для сотрудников
export const API_GET_NOMENCLATURES_BY_CATEGORY = API_BASE + API_PATH_EMPLOYEE + "categories/{categoryId}/nomenclatures" // Получить номенклатуры по ID категории
export const API_GET_ALL_WAREHOUSES = API_BASE + API_PATH_EMPLOYEE + "warehouses" // Получить все склады (уже есть как API_GET_WAREHOUSE_LIST)
export const API_GET_WAREHOUSE_STRUCTURE_BY_ID = API_BASE + API_PATH_EMPLOYEE + "warehouses/{warehouseId}" // Получить зоны по ID склада
export const API_GET_WAREHOUSE_ZONES_BY_ID = API_BASE + API_PATH_EMPLOYEE + "warehouses/{warehouseId}/zones" // Получить зоны по ID склада
export const API_GET_CONTAINERS_BY_ZONE = API_BASE + API_PATH_EMPLOYEE + "warehouse/container/{zoneId}" // Получить контейнеры по ID зоны
export const API_GET_TICKETS_BY_TYPE = API_BASE + API_PATH_EMPLOYEE + "ticket/{type}" // Получить заявки на списание по типу с диапазоном дат
export const API_GET_ALL_SUPPLIERS = API_BASE + API_PATH_EMPLOYEE + "suppliers" // Получить всех поставщиков
export const API_GET_ALL_NOMENCLATURES = API_BASE + API_PATH_EMPLOYEE + "nomenclatures" // Получить все номенклатуры
export const API_GET_DASHBOARD_STATS = API_BASE + API_PATH_EMPLOYEE + "dashboard/stats" // Получить статистику дашборда с необязательным диапазоном дат
export const API_GET_CURRENT_DASHBOARD = API_BASE + API_PATH_EMPLOYEE + "dashboard/current" // Получить текущую статистику дашборда
export const API_GET_ALL_CUSTOMERS = API_BASE + API_PATH_EMPLOYEE + "customers" // Получить всех клиентов

// --------------------------------------------------------------------- --------------------------------------------------------------------- //

// API ДЛЯ ПОЛЬЗОВАТЕЛЕЙ (USER)
export const API_PASS_RECOVER = API_BASE + API_PATH_USER + "password/reset-invite?Invite-token=" // Сброс пароля для приглашенного пользователя
export const API_UPDATE_USERNAME = API_BASE + API_PATH_USER + "profile/" // Обновление профиля пользователя (PUT)
export const API_NEW_PASSWORD = API_BASE + API_PATH_USER + "password/reset/" // Сброс пароля с токеном
export const API_CREATE_COMPANY_ADMIN = API_BASE + API_PATH_USER + "sign-up" // Примечание: В Swagger нет sign-up, возможно, опечатка или отсутствует эндпоинт
export const API_EMAIL_GENERATE = API_BASE + API_PATH_USER + "email/generate" // Генерация кода подтверждения email
export const API_EMAIL_VERIFY = API_BASE + API_PATH_USER + "email/verify" // Проверка кода подтверждения email
export const API_GET_PROFILE = API_BASE + API_PATH_USER + "profile" // Получить профиль пользователя
export const API_GET_ORGANIZATION = API_BASE + API_PATH_USER + "organization" // Получить данные об организации


// Добавленные API для пользователей
export const API_UPDATE_USEREMAIL = API_BASE + API_PATH_USER + "profile/email/{userId}" // Обновить профиль пользователя по ID
export const API_RECOVER_PASSWORD = API_BASE + API_PATH_USER + "password/recovery" // Инициировать восстановление пароля
export const API_UPDATE_PROFILE = API_BASE + API_PATH_USER + "profile/{userId}" // Обновить профиль пользователя по ID
export const API_UPLOAD_AVATAR = API_BASE + API_PATH_USER + "{userId}/image" // Загрузить аватар пользователя
export const API_DELETE_USER = API_BASE + API_PATH_USER + "{userId}" // Удалить пользователя по ID
export const API_GET_INVENTORY_ITEMS_BY_WAREHOUSE = API_BASE + API_PATH_USER + "warehouse/items/{warehouseId}" // Получить элементы инвентаря по ID склада
export const API_GET_INVENTORY_ITEMS_BY_ZONE = API_BASE + API_PATH_USER + "inventory/items/{warehouseZoneId}" // Получить элементы инвентаря по ID зоны склада

// --------------------------------------------------------------------- --------------------------------------------------------------------- //

// API ДЛЯ УПРАВЛЕНИЯ СКЛАДАМИ (WAREHOUSE-MANAGER)

export const API_GET_WAREHOUSE_LIST = API_BASE + API_PATH_EMPLOYEE + "warehouses" // Получить список всех складов (перенесено из EMPLOYEE для согласованности)
export const API_CREATE_WAREHOUSE = API_BASE + API_PATH_WAREHOUSE_MANAGER + "warehouses" // Создать новый склад
export const API_DELETE_WAREHOUSE = API_BASE + API_PATH_WAREHOUSE_MANAGER + "warehouses/" // Удалить склад по ID
export const API_WAREHOUSE_ZONES = API_BASE + API_PATH_WAREHOUSE_MANAGER + "warehouses" // База для операций с зонами склада
export const API_WAREHOUSE_ZONE_CREATE = API_BASE + API_PATH_WAREHOUSE_MANAGER + "warehouses" // Создать зону склада (не завершено в оригинале)

// Добавленные API для управления складами
export const API_UPDATE_WAREHOUSE = API_BASE + API_PATH_WAREHOUSE_MANAGER + "warehouses/{warehouseId}" // Обновить информацию о складе
export const API_UPDATE_WAREHOUSE_ZONE = API_BASE + API_PATH_WAREHOUSE_MANAGER + "warehouses/{warehouseId}/zones" // Обновить зону склада
export const API_ADD_WAREHOUSE_ZONE = API_BASE + API_PATH_WAREHOUSE_MANAGER + "warehouses/{warehouseId}/zones" // Добавить новую зону склада (POST)
export const API_DELETE_WAREHOUSE_ZONE = API_BASE + API_PATH_WAREHOUSE_MANAGER + "warehouses/{warehouseZoneId}/zones" // Удалить зону склада
export const API_CREATE_NOMENCLATURE = API_BASE + API_PATH_WAREHOUSE_MANAGER + "{categoryId}/nomenclatures" // Создать номенклатуру
export const API_UPDATE_NOMENCLATURE = API_BASE + API_PATH_WAREHOUSE_MANAGER + "{nomenclatureId}/nomenclatures" // Обновить номенклатуру
export const API_DELETE_NOMENCLATURE = API_BASE + API_PATH_WAREHOUSE_MANAGER + "{nomenclatureId}/nomenclatures" // Удалить номенклатуру
export const API_CREATE_CATEGORY = API_BASE + API_PATH_WAREHOUSE_MANAGER + "categories" // Создать новую категорию
export const API_UPDATE_CATEGORY = API_BASE + API_PATH_WAREHOUSE_MANAGER + "categories/{categoryId}" // Обновить категорию
export const API_DELETE_CATEGORY = API_BASE + API_PATH_WAREHOUSE_MANAGER + "categories/{categoryId}" // Удалить категорию
export const API_ADD_SUPPLIER = API_BASE + API_PATH_WAREHOUSE_MANAGER + "suppliers" // Добавить нового поставщика
export const API_UPDATE_SUPPLIER = API_BASE + API_PATH_WAREHOUSE_MANAGER + "suppliers/{supplierId}" // Обновить поставщика
export const API_DELETE_SUPPLIER = API_BASE + API_PATH_WAREHOUSE_MANAGER + "suppliers/{supplierId}" // Удалить поставщика
export const API_ADD_CUSTOMER = API_BASE + API_PATH_WAREHOUSE_MANAGER + "customers" // Добавить нового клиента
export const API_UPDATE_CUSTOMER = API_BASE + API_PATH_WAREHOUSE_MANAGER + "customers/{customerId}" // Обновить клиента
export const API_DELETE_CUSTOMER = API_BASE + API_PATH_WAREHOUSE_MANAGER + "customers/{customerId}" // Удалить клиента
export const API_SAVE_WAREHOUSE_CONTAINER = API_BASE + API_PATH_WAREHOUSE_MANAGER + "warehouse/container" // Сохранить контейнер склада
export const API_DELETE_WAREHOUSE_CONTAINER = API_BASE + API_PATH_WAREHOUSE_MANAGER + "warehouse/container/{warehouseContainerId}" // Удалить контейнер склада
export const API_GET_DOCUMENTS_WITH_TRANSACTIONS = API_BASE + API_PATH_WAREHOUSE_MANAGER + "document/transaction" // Получить документы с транзакциями по диапазону дат
export const API_ALLOW_TICKET = API_BASE + API_PATH_WAREHOUSE_MANAGER + "ticket/allowed" // Разрешить одну заявку
export const API_ALLOW_BATCH_TICKETS = API_BASE + API_PATH_WAREHOUSE_MANAGER + "ticket/write-off/allowed/batch" // Разрешить групповые заявки
export const API_DELETE_TICKET = API_BASE + API_PATH_WAREHOUSE_MANAGER + "ticket/{ticketId}" // Удалить заявку на списание

// --------------------------------------------------------------------- //

// API ДЛЯ АДМИНИСТРАТОРОВ (ADMIN)

export const API_CHANGE_ROLE = API_BASE + API_PATH_ADMIN + "user/{userId}/role" // Изменить роль пользователя (исправлено из оригинала)
export const API_SUPER_ADMIN_DELETE_USER = API_BASE + API_PATH_ADMIN + "user/{userId}" // Удалить пользователя супер-админом (исправлено)
export const API_CREATE_INVITE = API_BASE + API_PATH_ADMIN + "invite" // Создать приглашение пользователя
export const API_GET_INVITE_LIST = API_BASE + API_PATH_ADMIN + "invites" // Получить список приглашений
export const API_GET_USERS = API_BASE + API_PATH_ADMIN + "user" // Получить всех пользователей
export const API_GET_ACTION_LOGS = API_BASE + API_PATH_ADMIN + "log/action-logs" // Получить логи действий
export const API_GET_LOGIN_LOGS = API_BASE + API_PATH_ADMIN + "log/login-logs" // Получить логи входов
export const API_GET_EXCEPTION_LOGS = API_BASE + API_PATH_ADMIN + "log/exception-logs" // Получить логи ошибок
export const API_PUT_ORGANIZATION = API_BASE + API_PATH_ADMIN + "organization" // Обновить организацию

// Добавленные API для администраторов
export const API_DELETE_INVITE = API_BASE + API_PATH_ADMIN + "invites/{inviteId}" // Удалить приглашение по ID

// --------------------------------------------------------------------- //

// API АУТЕНТИФИКАЦИИ (AUTH)

export const API_SIGN_IN = API_BASE + "/api/v1/auth/sign-in" // Вход пользователя
export const API_SIGN_OUT = API_BASE + "/api/v1/auth/sign-out" // Выход пользователя

// --------------------------------------------------------------------- //

// API 1C
export const SYNCED = "/api/v1/1C/nomenclatures/synced"
export const NOT_SYNCED = "/api/v1/1C/nomenclatures/not-synced"

// Добавленные API для кладовщиков
export const API_PROCESS_INCOMING_GOODS = API_BASE + API_PATH_STOREKEEPER + "incoming" // Обработать поступление товаров
export const API_PROCESS_RETURN = API_BASE + API_PATH_STOREKEEPER + "return" // Обработать возврат
export const API_PROCESS_TRANSFER = API_BASE + API_PATH_STOREKEEPER + "transfer" // Обработать перемещение
export const API_ADD_INVENTORY = API_BASE + API_PATH_STOREKEEPER + "inventory" // Добавить инвентарь
export const API_GET_INVENTORY_BY_ID = API_BASE + API_PATH_STOREKEEPER + "inventory/{inventoryId}" // Получить инвентарь по ID
export const API_UPDATE_INVENTORY = API_BASE + API_PATH_STOREKEEPER + "inventory/{inventoryId}" // Обновить инвентарь
export const API_DELETE_INVENTORY = API_BASE + API_PATH_STOREKEEPER + "inventory/{inventoryId}" // Удалить инвентарь
export const API_START_INVENTORY_CHECK = API_BASE + API_PATH_STOREKEEPER + "inventory-check/start" // Начать проверку инвентаризации
export const API_PROCESS_INVENTORY_CHECK = API_BASE + API_PATH_STOREKEEPER + "inventory-check/process/{inventoryId}" // Завершить проверку инвентаризации
export const API_GET_ALL_INVENTORY_CHECKS = API_BASE + API_PATH_STOREKEEPER + "inventory-check" // Получить все проверки инвентаризации
export const API_GET_INVENTORY_CHECK_BY_ID = API_BASE + API_PATH_STOREKEEPER + "inventory-check/{inventoryId}" // Получить проверку инвентаризации по ID
export const API_GET_INVENTORY_CHECK_SYSTEM_BY_ID = API_BASE + API_PATH_STOREKEEPER + "inventory-check-system/{inventoryId}"
export const API_GET_INVENTORY_CHECK_RESULT = API_BASE + API_PATH_STOREKEEPER + "inventory-check/result/{auditId}" // Получить результаты проверки инвентаризации
export const API_GET_INVENTORY_CHECKS_IN_PROGRESS = API_BASE + API_PATH_STOREKEEPER + "inventory-check/in-progress" // Получить текущие проверки инвентаризации
export const API_GET_INVENTORY_CHECKS_COMPLETED = API_BASE + API_PATH_STOREKEEPER + "inventory-check/completed" // Получить завершенные проверки инвентаризации
export const API_UPLOAD_FILE = API_BASE + API_PATH_STOREKEEPER + "file/upload" // Загрузить файл
export const API_DOWNLOAD_FILE = API_BASE + API_PATH_STOREKEEPER + "file/download/{id}" // Скачать файл
export const API_SAVE_DOCUMENT = API_BASE + API_PATH_STOREKEEPER + "document/add" // Сохранить документ
export const API_GET_ALL_DOCUMENTS = API_BASE + API_PATH_STOREKEEPER + "document" // Получить все документы
export const API_COMPLETE_WRITE_OFF_TICKET = API_BASE + API_PATH_STOREKEEPER + "ticket/{ticketId}" // Завершить заявку на списание
export const API_COMPLETE_BATCH_TICKETS = API_BASE + API_PATH_STOREKEEPER + "ticket/completed/batch" // Завершить групповые заявки
export const API_ADD_BATCH_WRITE_OFF_TICKETS = API_BASE + API_PATH_STOREKEEPER + "ticket/batch" // Создать групповую заявку на списание
// --------------------------------------------------------------------- //