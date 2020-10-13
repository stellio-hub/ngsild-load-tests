import { check } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('batch_create_duration', true);

export function batchCreateEntities(body) {
    let payload = body || [{ id: "urn:ngsi-ld:Entity:01", type: "Entity", '@context': ["http://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld"]}];
  
    var httpParams = {
        timeout: 18000000, //5min
        headers: {
          'Content-Type': 'application/json'
        }
    };

    var response = http.post(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/entityOperations/create`, JSON.stringify(payload), httpParams);
    check(response, {
        'batch create is successful': response => response.status === 200
    });
    if(response.status !== 200){
        console.log('ERROR : ' + response.body);
    }
    durationTrend.add(response.timings.duration);
}

export default function() {
    batchCreateEntities();
}
