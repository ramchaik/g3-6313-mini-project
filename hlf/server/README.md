# HTTP Server to communicate with Hyperledger fabric

Provides CRUD APIS for Hyperledger fabric deployed on local using Microfab.  
I'm running a Node.js application with fastify to serve these requests.

## Setup
> NOTE: Please configure your node version to v12 before running the command

Please run the below command to install all the required dependencies for the project.
```bash
npm i
```
## Running the server
Please run the below command to start the server.
```bash
npm start
```

## APIs
List of CRUD APIs.

| Name | API
-|-
CREATE| curl --request POST \ --url http://localhost:8000/project \ --header 'Content-Type: application/json' \ --data '{ "id": "3", "value": { "name": "vaibhav contract", "proposer": 12123, "artist": 234324, "isCompleted": false, "ipfsHash": "asfSDVSV123" } }' 
READ | curl --request GET \ --url http://localhost:8000/project/1 \ --header 'Content-Type: application/json' 
READ ALL  | curl --request GET \ --url http://localhost:8000/project \ --header 'Content-Type: application/json'