# Datahub load testing #

This project aims to provide some load tests for Stellio API (or any NGSI-LD API)

### What is this repository for? ###

* This repo hosts k6 scripts for 

### Setup ###
* Install k6 or pull the k6 docker
   [see here](https://k6.io/docs/getting-started/installation)

* If extra JS library is needed, you 'll need to install npm and the following packages first :
```sh
npm install --save-dev webpack webpack-cli k6 babel-loader @babel/core @babel/preset-env core-js
```
Note that adding extra library decreases performance
   
### How to build the test scripts ###

* In case you have extra libraries, you need to bundle the scripts
```sh
npm run bundle
```
For each of the entries declared in the webpack.config.js file, it will generate a bundle as [entry].bundle.js in the dist folder.

* Otherwise, the js script is already interpretable by k6


### How to run a test script ###

To run a script or a bundled script the only difference for the k6 run command is the path of the script provided as argument.
The original scripts are in src/api path. Their names are prefixed by "scenario".
The bundled scripts are generated in the dist folder.


For the scripts to run the env variable STELLIO_HOSTNAME needs to be set (here localhost:8080), and we set the path to the summary export file

```sh
k6 run -e STELLIO_HOSTNAME=localhost:8080 src/api/scenario-batch-create-entities.js --summary-export=dist/export.json
```
Some scripts can be run with vus and iterations arguments, such as scenario-create-entities.js : 

```sh
k6 run -e STELLIO_HOSTNAME=localhost:8080 src/api/scenario-create-entities.js --summary-export=dist/export.json --vus 10 --iterations 100
```


This command run the batchCreateEntities bundled script.

```sh
k6 run -e STELLIO_HOSTNAME=localhost:8080 dist/batchCreateEntities.bundle.js --summary-export=dist/export.json
```

### Warnings ###

The default duration of a test is 10 min, if your test lasts longer you'll need to set the duration options in the script and set the iterations to 1