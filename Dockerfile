FROM node as vite-app
ARG SERVER_URL

WORKDIR /app/
COPY ./ .

RUN ["npm", "i"]

ENV VITE_SERVER_URL=$SERVER_URL
RUN ["npm", "run", "build"]

FROM nginx:alpine

WORKDIR /usr/share/nginx/

RUN rm -rf html
RUN mkdir html

WORKDIR /

COPY ./nginx/nginx.conf /etc/nginx
COPY --from=vite-app ./app/dist /usr/share/nginx/html

EXPOSE 8080

ENTRYPOINT ["nginx", "-g", "daemon off;"]