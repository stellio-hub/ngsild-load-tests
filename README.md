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

For the scripts to run:
* The env variable `STELLIO_HOSTNAME` needs to be set (here `localhost:8080`), configure it in `.env` file
* The connection to Timescale has to be passed

```sh
./run.sh src/api/templated/create-entities.js
```

## Extensions

Current extensions used:
* https://github.com/grafana/xk6-output-timescaledb: send k6 metrics to TimescaleDB in a predefined schema and visualize them in Grafana dashboards
* https://github.com/szkiba/xk6-dotenv: load env vars from a `.env` file
