ARG NGINX_VERSION=alpine
FROM nginx:${NGINX_VERSION}
COPY /App/dist /usr/share/nginx/html
LABEL version=$NGINX_VERSION
EXPOSE 80
