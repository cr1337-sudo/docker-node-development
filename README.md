# Node development with Docker

In this repo I will explain how to develop in Nodejs using Docker. We will build a simple app that is going to gradually grow into a more complex project.

## Installing Nodejs

[Nodejs](https://hub.docker.com/_/node) image is needed to run this server, the first step will be create a simple project, initializing a new npm package:
```
npm init -y 
npm i express
```
Then create a index.js file and put this code in it:
```
const express = require("express");
const app = express();
const port = process.env.port || 3000;

app.get("/", (req,res)=>{
    res.send("Hi")
})


app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
```
#### Dockerfile config

Once the base project is setted, We need to create a [Dockerfile](https://docs.docker.com/engine/reference/builder/) (Capital D) text document in the root directory. This file will contain commands that docker will run in build time and run time.

```
#Dependency
FROM node:19
#Working directory 
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
```
#### .dockerignore config

Just like git, we can have a [.dockerignore](https://docs.docker.com/engine/reference/builder/#dockerignore-file) file. This file will allow us to specify a list of files/folders that docker must ignore during the build process.

```
node_modules
Dockerfile
.dockerignore
.git
.gitignore
```


#### Build image

Having the Dockerfile & .dockerignore prepared, it's time to build our [Docker image](https://docs.docker.com/engine/reference/commandline/image/) an run it in a [Docker container](https://www.docker.com/resources/what-container/):

```
Syntaxis: docker build -t $imageName $workDir

docker build node-app-image .
```

#### Run image 
```
Syntaxis: docker run -p $clientPort:$containerPort -d (detached mode) --name $containerName $imageName

docker run 3000:3000 -d --name node-app node-app-image
```
