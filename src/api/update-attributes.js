import { check, fail } from 'k6';
import http from 'k6/http';
import { Trend } from 'k6/metrics';

let durationTrend = new Trend('update_attributes_duration', true);

export function updateAttributes(entityId, body) {
   
    const headers = {
        'Content-Type': 'application/json',
        'Link': '<https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.7.jsonld>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"'
    };
    var response = http.patch(`http://${__ENV.STELLIO_HOSTNAME}/ngsi-ld/v1/entities/${entityId}/attrs`, JSON.stringify(body), { headers });
    durationTrend.add(response.timings.duration);

    check(response, {
        'update attributes is successful': response => response.status === 204
    });
}