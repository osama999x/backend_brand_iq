FROM node:alpine
COPY . /index 
WORKDIR /index
CMD node index.js

