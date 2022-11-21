# Node development with Docker

In this repo I will explain how to develop in Nodejs using Docker. We will build a simple app that is going to gradually grow into a more complex project.

## Installing Nodejs

[Nodejs](https://hub.docker.com/_/node) image is needed to run this server, the first step will be to create a simple project, initializing a new npm package:
```
npm init -y 
npm i express
```
Then, we'll create a index.js file and put this code in it:
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

Once the base project is set, We need to create a [Dockerfile](https://docs.docker.com/engine/reference/builder/) (Capital D) text document in the root directory. This file will contain commands that docker will run in build time and run time.

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

Having the Dockerfile & .dockerignore prepared, it's time to build our [Docker image](https://docs.docker.com/engine/reference/commandline/image/) and run it in a [Docker container](https://www.docker.com/resources/what-container/):

```
Syntaxis: docker build -t $imageName $workDir

docker build -t node-app-image .
```

#### Run image 
```
Syntaxis: docker run -p $clientPort:$containerPort -d (detached mode) --name $containerName $imageName

docker run -p 3000:3000 -d --name node-app node-app-image
```


#### Listen to changes

After each change we should rebuild the image, we can prevent this using [Volumes](https://docs.docker.com/storage/volumes/). This allow us to have data persistance and syncronization between our container and project folder.

```

Syntaxis: docker run -p 3000:3000 -v $pathToClientFolder:$pathToContainerFolder -d --name node-app node-app-image
```

Here yo CANT use a dot to reference the current directory (**$pathToClientFolder**), alternativelly we can use:
- Windows CLI: %cd%
- Windows Powershell: ${pwd}
- Linux & Max: $(pwd)

```

Syntaxis: docker run -p 3000:3000 -v %cd% OR ${pwd} OR $(pwd):$pathToFolderContainer -d --name node-app node-app-image
```

**$pathToContainerFolder** will reference our container's working directory, in this case it will be  _/app_

Example:

```
docker run -p 3000:3000 -v %cd%:/app -d --name node-app node-app-image
```

##### Restart node server automatically after a change

In order to reflect the changes, we must use [Nodemon](https://www.npmjs.com/package/nodemon) to refresh our server after every single change. We can do this with just a few changes:

###### Dockerfile

```
FROM node:19
#Working directory of my container
#Every docker comand will run in this directory
WORKDIR /app
#Copy package.json in the docker container
COPY package.json .
#Run npm i to install dependecies
RUN npm install
RUN npm install -D
#Copy every single file into /app (WORKDIR)
COPY . .
#Port exposing
ENV PORT 3000
EXPOSE $PORT 
#Run app
CMD ["npm","run","dev"]
```

###### package.json
```
{
  "name": "devops",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    // Use -L flag if your are using Windows or 
    // if server is not restarting
    "dev": "nodemon -L index.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}

```
**More info about the [-L Flag](https://github.com/remy/nodemon#application-isnt-restarting)**


Once we changed this, it's time to:

1- Delete the container

```
docker rm node-app-cont -f
```

2- Delete the old image
```
docker image rm node-app -f
```
3- Rebuild the new image
```
docker build -t node-app-image .
```
4- Run a new container
```
docker run  -e PORT=3000 -p 3000:3000 -v %cd%:/app:ro -v /app/node_modules -d --name node-app node-app-image
```

**_%cd%:/app:ro_** will restrict access to our container to read-only. This will prevent manual writes from the container.

**_--env PORT=3000_** will override the exposed client port, just in case you could't expose the default port. Besides, this env variable is goint to be set in the entire app as a process.env variable.

We can use a .env file and pass it as parameter:

```
docker run  -e PORT=3000 -p 3000:3000 -v %cd%:/app:ro -v /app/node_modules -d --name node-app node-app-image
```

**-v _/app/node_modules_** will prevent the node_modules folder to be deleted in our container if we remove it in the client side.

