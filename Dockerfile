# Этап сборки
FROM node:20 AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все исходные файлы
COPY . .

# Создаем продакшн-сборку
RUN npm run build

# Этап сервера (Nginx)
FROM nginx:alpine

# Копируем собранные файлы из этапа сборки в директорию Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Открываем порт 80 для доступа к фронтенду
EXPOSE 80

# Используем стандартную конфигурацию Nginx
CMD ["nginx", "-g", "daemon off;"]
