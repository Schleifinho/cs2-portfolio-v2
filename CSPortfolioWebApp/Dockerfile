# ---------------------------
# 1) Build stage
# ---------------------------
FROM node:20-alpine AS build

# Install required tools for some node modules
RUN apk add --no-cache bash python3 make g++

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Build the production-ready static files
RUN npm run build -

# ---------------------------
# 2) Production stage (Nginx)
# ---------------------------
FROM nginx:stable-alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for SPA routing
# Make sure this path is correct relative to Dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
