# Stellio load testing

This project aims to provide some load tests for Stellio (or any NGSI-LD API compliant context broker)

## Setup

* Build a k6 binary with some extensions

```sh
xk6 build v0.43.1 --with github.com/szkiba/xk6-dotenv --with github.com/grafana/xk6-output-timescaledb
```

Follow instructions on https://k6.io/docs/extensions/guides/build-a-k6-binary-using-go/ to setup Go and xk6.

* Start docker-compose config with Timescale and Grafana

```sh
docker-compose up -d && docker-compose logs -f --tail=100
```
   
## How to run a load test

For a script to run:

* The env variable `STELLIO_HOSTNAME` needs to be set, configure it in the `.env` file
* The connecton to Timescale has to be passed
* A script typically has default values for the number of VUs, iterations,... but they can be overriden on the CLI (among other ways)

An util script is available to more easily launch a load test script:

```sh
# first parameter is the name of the script to launch
# second parameter is the number of VUs
# third parameters is the number of iterations
./run.sh src/tests/create-entities.js 10 10000
```

If needed to set a specific parameter for a script, it can be passed as an environment variable, e.g.,:

```sh
INITIAL_NUMBER_OF_ENTITIES=5 ./run.sh src/tests/partial-attribute-update-entities.js 10 10000
```

## List of ready to use tests

* Create entities

```sh
./run.sh src/tests/create-entities.js 10 10000
```

* Partial attribute update

```sh
INITIAL_NUMBER_OF_ENTITIES=10 ./run.sh src/tests/partial-attribute-update-entities.js 10 10000
```

## Extensions

Extensions currently used:

* https://github.com/grafana/xk6-output-timescaledb: send k6 metrics to TimescaleDB in a predefined schema and visualize them in Grafana dashboards
* https://github.com/szkiba/xk6-dotenv: load env vars from a `.env` file
