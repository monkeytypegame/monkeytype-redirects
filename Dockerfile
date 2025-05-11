# 1. Build frontend
FROM node:18 AS frontend-builder
WORKDIR /app
COPY frontend /app/frontend
RUN npm install --prefix frontend && npm run build --prefix frontend

# 2. Setup backend
FROM node:18
WORKDIR /app
COPY backend /app/backend
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
WORKDIR /app/backend
RUN npm install

# 3. Run the app
CMD ["npm", "run", "start"]