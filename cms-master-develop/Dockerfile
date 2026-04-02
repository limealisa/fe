FROM node:18
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN chmod +x ./start.sh
CMD ./start.sh
