import { check, fail } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('create_entity_duration', true);

export function createEntity(body) {
    let payload = body || { id: "urn:ngsi-ld:Entity:01", type: "Entity" };
  
    var httpParams = {
        timeout: 18000000, //5min
        headers: {
          'Content-Type': 'application/json',
          'Link': '<http://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
        }
    };

    var response = http.post(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/entities`, JSON.stringify(payload), httpParams);
    durationTrend.add(response.timings.duration);

    if (!check(response, {'creation of entity is successful': response => response.status === 201})) {
        fail('creation of entity failed : ' + response.body);
    }
}

export default function() {
    createEntity();
}
