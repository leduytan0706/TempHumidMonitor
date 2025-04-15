# 1. Dùng Node.js image nhỏ gọn
FROM node:20-alpine AS builder

# 2. Tạo thư mục làm việc
WORKDIR /app

# 3. Copy tất cả file vào container
COPY . .

# 4. Cài dependencies và build Vite app
RUN npm install
RUN npm run build

# -----------------------------------
# 5. Tạo image để chạy static web server
FROM nginx:alpine

# 6. Copy build output sang Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 7. Expose cổng 80
EXPOSE 80

# 8. Mặc định chạy Nginx
CMD ["nginx", "-g", "daemon off;"]
