# Step 1: Build the Vite application
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Copy application code
COPY . .

# Build standard and minified production environment
RUN npm run build

# Step 2: Serve via Nginx for Cloud Run
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts to Nginx server
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port required by Cloud Run (8080)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
