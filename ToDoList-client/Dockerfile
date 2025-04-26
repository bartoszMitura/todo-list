# Build stage
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built Angular app to nginx (uses the browser subdirectory)
COPY --from=build /app/dist/to-do-list-client/browser/ /usr/share/nginx/html/
# Verify the copied files
RUN echo "Files in /usr/share/nginx/html:" && ls -la /usr/share/nginx/html
# Verify the nginx configuration
RUN echo "Nginx configuration:" && cat /etc/nginx/conf.d/default.conf
# Expose port 80
EXPOSE 80
# Start nginx
CMD ["nginx", "-g", "daemon off;"]
