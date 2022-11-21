#Project configuration 

FROM node:19
#Working directory of my container
#Every docker comand will run in this directory
WORKDIR /app
#Copy package.json in the docker container
COPY package.json .
#Run npm i to install dependecies
RUN npm install
#Copy every single file into /app (WORKDIR)
COPY . .
#Port exposing
EXPOSE 3000
#Run app
CMD ["node","index.js"]

#In console: docker build -t $imageName $Dockerfile Dir (.)
#Run container: docker run -p 3000:3000 $imageName