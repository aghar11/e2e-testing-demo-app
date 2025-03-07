# Use a Node.js image for building the app
FROM node:18 AS builder

WORKDIR /src

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Use Nginx for serving the built React app
FROM nginx:alpine

COPY --from=builder /src/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
