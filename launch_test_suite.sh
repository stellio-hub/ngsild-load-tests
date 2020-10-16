#!/bin/bash

function pause(){
   read -p "$*"
}

summaries_dir='./summaries'
if [ ! -d "${summaries_dir}" ]; then
    mkdir ${summaries_dir}
fi

metrics_dir='./metrics'
if [ ! -d "${metrics_dir}" ]; then
    mkdir ${metrics_dir}
fi

targetHost="StellioLoad:8080"
#targetHost="localhost:8080"

declare -a env_params
#env_params[0]='1;1;1;1;1'
#env_params[1]='10;10;10;10;10'
#env_params[2]='100;100;100;100;100'
env_params[3]='1000;1000;1000;1000;1000'
#env_params[4]='10000;10000;10000;10000;10000'

#demo of ramping up
#k6 run -e STELLIO_HOSTNAME=${targetHost} src/api/scenario-create-entities.js --out json=${metrics_dir}/scenario-create-entities.json --summary-export=${summaries_dir}/scenario-create-entities.json

for env_param in "${env_params[@]}"
do
    IFS=";" read -r -a arr <<< "${env_param}"

    #createEntitiesFileName=create-${arr[0]}-entities-with-${arr[1]}-temporal-props.json
    #k6 run -e STELLIO_HOSTNAME=${targetHost} -e A=${arr[0]} -e B=${arr[1]} src/api/templated/create-entities.js --out json=${metrics_dir}/${createEntitiesFileName} --summary-export=${summaries_dir}/${createEntitiesFileName}
    
    #batchCreateEntitiesFileName=batch-create-${arr[0]}-entities-with-${arr[1]}-temporal-props.json
    #k6 run -e STELLIO_HOSTNAME=${targetHost} -e A=${arr[0]} -e B=${arr[1]} src/api/templated/batch-create-entities.js --out json=${metrics_dir}/${batchCreateEntitiesFileName} --summary-export=${summaries_dir}/${batchCreateEntitiesFileName}
    
    createSubscriptionsFileName=create-${arr[0]}-subscriptions-with-${arr[1]}-entities-${arr[2]}-temporal-props-${arr[3]}-values-and-get-last-${arr[4]}-values.json
    k6 run -e STELLIO_HOSTNAME=${targetHost} -e A=${arr[0]} -e B=${arr[1]} -e C=${arr[2]} -e D=${arr[3]} -e E=${arr[4]} src/api/templated/create-subscriptions.js --out json=${metrics_dir}/${createSubscriptionsFileName} --summary-export=${summaries_dir}/${createSubscriptionsFileName}

    pause 'restart stellio before new iteration'
done

