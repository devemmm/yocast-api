FROM node:16.15.1

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5001
CMD [ "npm", "start" ]