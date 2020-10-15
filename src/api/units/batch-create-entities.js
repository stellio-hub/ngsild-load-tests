import { check, fail } from 'k6';
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
    durationTrend.add(response.timings.duration);

    if (!check(response, {'batch create is successful': response => response.status === 200 })) {
       fail('batch create failed : ' +  response.body);
    }
}

export default function() {
    batchCreateEntities();
}
