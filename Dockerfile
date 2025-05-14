# 1. Build frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend .
RUN npm run build

# 2. Build backend
FROM node:18 AS backend-builder
WORKDIR /app/backend
# Copy only package files first, then install dependencies
COPY backend/package.json backend/package-lock.json* ./
RUN npm install
# Now copy the rest of the backend source code (excluding node_modules)
COPY backend .
# Copy built frontend into backend's public directory (adjust as needed)
WORKDIR /
COPY --from=frontend-builder /app/frontend/dist ./app/frontend/dist

# 3. Run the app
WORKDIR /app/backend
CMD ["npm", "run", "start"]