ARG VERSION=latest
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY App/dist /usr/share/nginx/html
LABEL version=$VERSION
EXPOSE 80
