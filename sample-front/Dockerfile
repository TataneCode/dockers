FROM node:22 AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

FROM almalinux:9-minimal AS runtime

RUN microdnf install -y nginx \
    && microdnf clean all

COPY --from=build /app/dist/sample-front/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
