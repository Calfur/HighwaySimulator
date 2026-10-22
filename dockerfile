ARG NGINX_VERSION=1.30.6-alpine
FROM nginx:${NGINX_VERSION}
COPY /App/dist /usr/share/nginx/html
LABEL version=$NGINX_VERSION
EXPOSE 80
