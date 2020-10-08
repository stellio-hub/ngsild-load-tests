# Datahub load testing #

This project aims to provide some load tests for Stellio API (or any NGSI-LD API)

### What is this repository for? ###

* This repo hosts k6 scripts for 

### Setup ###
* Install k6 or pull the k6 docker
   [see here](https://k6.io/docs/getting-started/installation)

* In order to use some basic js functions, install npm and the following packages :
```sh
npm install --save-dev webpack webpack-cli k6 babel-loader @babel/core @babel/preset-env core-js
```
   
### How to build the test scripts ###
```sh
npm run bundle
```

For each of the entries declared in the webpack.config.js file, it will generate a bundle as [entry].bundle.js in the dist folder.

### How to run a test script ###
This command run the batchCreateEntities script.
Here we have to set the env variable STELLIO_HOSTNAME to localhost:8080, and we set the path to the summary export file

```sh
k6 run -e STELLIO_HOSTNAME=localhost:8080 dist/batchCreateEntities.bundle.js --summary-export=dist/export.json
```