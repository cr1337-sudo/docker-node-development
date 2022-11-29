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
## .dockerignore config

Just like git, we can have a [.dockerignore](https://docs.docker.com/engine/reference/builder/#dockerignore-file) file. This file will allow us to specify a list of files/folders that docker must ignore during the build process.

```
node_modules
Dockerfile
.dockerignore
.git
.gitignore
```


## Build an image

Having the Dockerfile & .dockerignore prepared, it's time to build our [Docker image](https://docs.docker.com/engine/reference/commandline/image/) an run it in a [Docker container](https://www.docker.com/resources/what-container/):

```
Syntaxis: docker build -t $imageName $workDir

docker build -t node-app-image .
```

### Run image 
```
Syntaxis: docker run -p $clientPort:$containerPort -d (detached mode) --name $containerName $imageName

docker run -p 3000:3000 -d --name node-app node-app-image
```


### Listen to changes

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

#### Restart node server automatically after a change

In order to reflect the changes, we must use [Nodemon](https://www.npmjs.com/package/nodemon) to refresh our server after every single change. We can do this with just a few changes:

##### Dockerfile

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

##### package.json
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

## Docker-compose

Tt's useful for creating reusable containers with a predefined command list

### Initial template

```
version: "3" #Docker compose version
#Containers that we want to create
services:
  #Container name
  node-app:
    # Dockerfile directory
    build: .
    ports: 
      - "3000:3000"
    volumes:
      #Local directory / Inner container directory
      - ./:/app
      - /app/node_modules
    environment:
      - PORT=3000
    # env_file:
      # - ./.env
```

### Run docker-compose

```
docker-compose up  -d 
```

### Delete compose container
```
docker-compose down -v
```

If we make changes in our Dockerfile, we have to rebuild our image. 

```
docker-compose up --build
```

## Development vs Production

We can have a Dockerfile for development and another one for production.
But in this case we will create 3 new files (and you can delete or rename your old docker-compose file):
- docker-compose.yml
- docker-compose.dev.yml
- docker-compose.prod.yml


Our new files will look like this:

### docker-compose
```
#Shared configuration for the other docker-compose files
version: '3'
services:
  node-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
```

### docker-compose.dev
```
version: '3'
services:
  node-app:
    build: 
      context: . #Dockefile directory
      args: 
        NODE_ENV: development
    volumes:
      #Local directory / Inner container directory
      - ./:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev
```

### docker-compose.prod

```
version: '3'
services:
  node-app:
    build: 
      context: . #Dockefile directory
      args: 
        NODE_ENV: production
    environment:
      - NODE_ENV=production
    command: node index
```

After this, we shoul modify our Dockerfile and change it to this:

```
#Project configuration 

FROM node:19
#Working directory of my container
#Every docker comand will run in this directory
WORKDIR /app
#Copy package.json in the docker container
COPY package.json .
#Run npm i to install dependecies
#Parametro leido del docker-compose a la hora de levantar el contenedor
RUN npm install 

ARG NODE_ENV
RUN if [ "$NODE_ENV" = "development" ];\
        then npm install;\
        else npm install --only=production;\
        fi

#Copy every single file into /app (WORKDIR)
COPY . .
#Port exposing
#Default port 
ENV PORT 3000 
EXPOSE $PORT 
#Run app
CMD ["node","index"]

```
### Run docker-compose.dev (Development mode)

```
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```
### Run docker-compose.prod (Production mode)

```
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### docker-compose down

```
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down -d
```

## MongoDB 

Configuration (Add this to the end of your docker-compose)

```
#Remote image
  mongo:
    image: mongo
    environment:
      - MONGO_INITDB_ROOT_USERNAME=cristian
      - MONGO_INITDB_ROOT_PASSWORD=123456
    volumes:
      # named volume config 1/2
      - mongo-db:/data/db
    ports:
      - 2017:27017
volumes:
# mongo named volume config 2/2
  mongo-db:
```

Inspect docker logs

```
docker logs $containerName
```
Docker container info
```
docker inspect $containerName
```

### Connect mongoose to mongo container

```
mongoose.connect("mongodb://$user:$password@$containerName:$port/?authSource=admin")
  .then(() => {
    console.log("Succesfully connected to DB");
  })
  .catch((e) => {
    console.log(e);
  });

```
