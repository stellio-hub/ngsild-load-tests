#!/bin/sh

#
# This script simply executes a provided JavaScript test.
#
# Each execution is provided a unique tag to differentiate
# discrete test runs within the Grafana dashboard.
#

set -e

if [ $# -ne 4 ]; then
    echo "Usage: ./run.sh <SCRIPT_NAME> <VUS> <ITERATIONS> <DURATION>"
    exit 1
fi

SCRIPT_NAME=$1
VUS=$2
ITERATIONS=$3
DURATION=$4
TAG_NAME="$(basename -s .js $SCRIPT_NAME)-$VUS-$ITERATIONS-$(date +%F-%H:%M:%S)"

# add -o timescaledb=postgresql://k6:k6@localhost:5433/k6 if you configured TimescaleDB extension
./k6 run \
    --vus $VUS \
    --iterations $ITERATIONS \
    --duration $DURATION \
    --tag testid=$TAG_NAME \
    $SCRIPT_NAME
