FROM node:18-alpine

WORKDIR /app

# Install docker CLI so we can run docker commands from within the container if needed
# (Though we'll mostly use dockerode via the socket)
RUN apk add --no-cache docker-cli

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
