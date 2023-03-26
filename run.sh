#!/bin/sh

#
# This script simply executes a provided JavaScript test.
#
# Each execution is provided a unique tag to differentiate
# discrete test runs within the Grafana dashboard.
#

set -e

if [ $# -ne 1 ]; then
    echo "Usage: ./run.sh <SCRIPT_NAME>"
    exit 1
fi

SCRIPT_NAME=$1
TAG_NAME="$(basename -s .js $SCRIPT_NAME)-$(date -Iminutes)"

./k6 run -o timescaledb=postgresql://k6:k6@localhost:5433/k6 --vus 100 $SCRIPT_NAME --tag testid=$TAG_NAME
