FROM node:20-alpine

RUN apk add --no-cache mariadb mariadb-client bash

RUN mkdir -p /run/mysqld /var/lib/mysql && \
    chown -R mysql:mysql /run/mysqld /var/lib/mysql

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

COPY start.sh /start.sh

RUN chmod +x /start.sh

ENV NODE_ENV=production

ENV PORT=3000
ENV HOST=0.0.0.0

ENV DB_HOST=127.0.0.1
ENV DB_PORT=3306

ENV DB_USER=campusquest
ENV DB_PASSWORD=campusquest_password
ENV DB_NAME=campusquest

ENV MYSQL_ROOT_PASSWORD=campusquest_root_password

ENV DB_CONNECT_RETRIES=30
ENV DB_CONNECT_RETRY_DELAY_MS=2000

ENV SESSION_SECRET=campusquest_local_session_secret

EXPOSE 3000

CMD ["/start.sh"]