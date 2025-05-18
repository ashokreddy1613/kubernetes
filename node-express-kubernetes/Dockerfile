#Use official Node.js base image
FROM node:23-slim

#Create  app directory
WORKDIR /app 
#Copy dependencies to the working directory
COPY package*.json ./

#Install app dependecies
RUN npm install 

#Copy rest of app code into container
COPY . .

#Expose the port on which the application will run
EXPOSE 8080

#Start the app
CMD [ "node", "app.js" ]

