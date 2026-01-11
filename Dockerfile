# ================================
# Expo Web Build for Docker
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies for native builds
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set environment variable for API URL (will be overridden at runtime)
ENV EXPO_PUBLIC_API_URL=http://localhost:3000

# Build the web version
RUN npx expo export --platform web

# ================================
# Production - Serve with nginx
# ================================
FROM nginx:alpine AS production

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8081

CMD ["nginx", "-g", "daemon off;"]
