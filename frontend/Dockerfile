# Build React app
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Build assets
COPY public ./public
COPY src ./src
ARG REACT_APP_API_URL=http://localhost:5000
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
RUN npm run build

# Serve with Nginx
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
