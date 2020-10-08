import { check } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('create_entity_duration', true);

export function createEntity(body) {
    let payload = body || { id: "urn:ngsi-ld:Entity:01", type: "Entity" };
  
    var httpParams = {
        headers: {
          'Content-Type': 'application/json',
          'Link': '<http://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
        }
    };

    var response = http.post(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/entities`, JSON.stringify(payload), httpParams);
    check(response, {
        'creation of entity is successful': response => response.status === 201
    });
    durationTrend.add(response.timings.duration);
}

export default function() {
    createEntity();
}
