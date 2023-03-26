import { check } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('create_entity_duration', true);

export function createEntity(body) {
    let payload = body || { id: "urn:ngsi-ld:Entity:01", type: "Entity" };
  
    const headers = {
        'Content-Type': 'application/json',
        'Link': '<https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.3.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
    }

    const response = http.post(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/entities`, JSON.stringify(payload), { headers });
    durationTrend.add(response.timings.duration);

    check(response, { 
        'entity create is successful': (r) => r.status === 201
    });
}

export default function() {
    createEntity();
}
