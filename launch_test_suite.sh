#!/bin/bash

summaries_dir='./summaries'
if [ ! -d "${summaries_dir}" ]; then
    mkdir ${summaries_dir}
fi

#targetHost="StellioLoad:8080"
targetHost="localhost:8080"

declare -a env_params
env_params[0]='1;1;1;1;1'
#env_params[1]='10;10;10;10;10'
#env_params[2]='100;100;100;100;100'
#env_params[3]='1000;1000;1000;1000;1000'
#env_params[4]='10000;10000;10000;10000;10000'

for env_param in "${env_params[@]}"
do
    IFS=";" read -r -a arr <<< "${env_param}"

    #k6 run -e STELLIO_HOSTNAME=${targetHost} -e A=${arr[0]} src/api/templated/create-entities.js --summary-export=${summaries_dir}/create-${arr[0]}-entities-with-${arr[1]}-temporal-props.js
    #k6 run -e STELLIO_HOSTNAME=${targetHost} -e A=${arr[0]} src/api/templated/batch-create-entities.js --summary-export=${summaries_dir}/batch-create-${arr[0]}-entities-with-${arr[1]}-temporal-props.js
    k6 run -e STELLIO_HOSTNAME=${targetHost} -e A=${arr[0]} src/api/templated/create-subscriptions.js --summary-export=${summaries_dir}/create-${arr[0]}-subscriptions-with-${arr[1]}-entities-${arr[2]}-temporal-props-${arr[3]}-values-and-get-last-${arr[4]}.js
done

